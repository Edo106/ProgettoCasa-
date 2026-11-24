import { randomUUID } from "node:crypto";
import { Prisma, PrismaClient } from "@prisma/client";

const LEASE_MS = 5 * 60 * 1000;
const RETENTION_MS = 24 * 60 * 60 * 1000;

export type AuctionRun = {
  runId: string;
  snapshotId: string;
  owner: string;
  token: bigint;
};

export type AuctionRecord = Omit<
  Prisma.AuctionAnnouncementCreateManyInput,
  "id" | "snapshotId"
>;

export class AuctionSnapshotStore {
  constructor(
    private readonly db: PrismaClient,
    readonly collectionId = "pvp",
  ) {}

  async start(): Promise<AuctionRun> {
    const now = new Date();
    const owner = randomUUID();
    const expiresAt = new Date(now.getTime() + LEASE_MS);

    return this.db.$transaction(async (tx) => {
      await tx.auctionCollectionState.upsert({
        where: { id: this.collectionId },
        create: { id: this.collectionId },
        update: {},
      });
      const acquired = await tx.auctionCollectionState.updateMany({
        where: {
          id: this.collectionId,
          OR: [{ leaseExpiresAt: null }, { leaseExpiresAt: { lte: now } }],
        },
        data: {
          leaseOwner: owner,
          leaseExpiresAt: expiresAt,
          fencingToken: { increment: 1 },
        },
      });
      if (acquired.count !== 1) {
        throw new Error("An auction synchronization is already running");
      }

      const collection = await tx.auctionCollectionState.findUniqueOrThrow({
        where: { id: this.collectionId },
      });
      if (collection.latestRunId && collection.latestRunState === "running") {
        const abandoned = await tx.auctionSyncRun.findUnique({
          where: { id: collection.latestRunId },
        });
        if (abandoned) {
          await tx.auctionSyncRun.updateMany({
            where: { id: abandoned.id, state: "running" },
            data: {
              state: "failed",
              finishedAt: now,
              errorSummary: "Synchronization lease expired",
            },
          });
          await tx.auctionSnapshot.updateMany({
            where: { id: abandoned.snapshotId, state: "collecting" },
            data: { state: "failed" },
          });
        }
      }

      const snapshot = await tx.auctionSnapshot.create({
        data: { collectionId: this.collectionId },
      });
      const run = await tx.auctionSyncRun.create({
        data: {
          snapshotId: snapshot.id,
          leaseOwner: owner,
          leaseExpiresAt: expiresAt,
          fencingToken: collection.fencingToken,
        },
      });
      await tx.auctionCollectionState.update({
        where: { id: this.collectionId },
        data: { latestRunId: run.id, latestRunState: "running" },
      });
      return {
        runId: run.id,
        snapshotId: snapshot.id,
        owner,
        token: collection.fencingToken,
      };
    });
  }

  private async renew(tx: Prisma.TransactionClient, run: AuctionRun) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + LEASE_MS);
    const result = await tx.auctionCollectionState.updateMany({
      where: {
        id: this.collectionId,
        leaseOwner: run.owner,
        fencingToken: run.token,
        leaseExpiresAt: { gt: now },
      },
      data: { leaseExpiresAt: expiresAt },
    });
    if (result.count !== 1) {
      throw new Error("Auction synchronization lease expired or was superseded");
    }
    await tx.auctionSyncRun.update({
      where: { id: run.runId },
      data: { leaseExpiresAt: expiresAt },
    });
  }

  async addPage(run: AuctionRun, records: AuctionRecord[], sourceCount: number) {
    await this.db.$transaction(async (tx) => {
      await this.renew(tx, run);
      if (records.length) {
        await tx.auctionAnnouncement.createMany({
          data: records.map((record) => ({ ...record, snapshotId: run.snapshotId })),
        });
      }
      await tx.auctionSyncRun.update({
        where: { id: run.runId },
        data: {
          pagesProcessed: { increment: 1 },
          recordsProcessed: { increment: sourceCount },
        },
      });
      await tx.auctionSnapshot.update({
        where: { id: run.snapshotId },
        data: {
          sourceRecordCount: { increment: sourceCount },
          propertyRecordCount: { increment: records.length },
        },
      });
    }, { timeout: 60_000 });
  }

  async publish(run: AuctionRun, sourceCount: number, propertyCount: number) {
    await this.db.$transaction(async (tx) => {
      await this.renew(tx, run);
      const snapshot = await tx.auctionSnapshot.findUniqueOrThrow({
        where: { id: run.snapshotId },
      });
      const count = await tx.auctionAnnouncement.count({
        where: { snapshotId: run.snapshotId },
      });
      if (
        snapshot.state !== "collecting" ||
        snapshot.sourceRecordCount !== sourceCount ||
        snapshot.propertyRecordCount !== propertyCount ||
        count !== propertyCount
      ) {
        throw new Error("Auction snapshot is incomplete");
      }

      const now = new Date();
      const collection = await tx.auctionCollectionState.findUniqueOrThrow({
        where: { id: this.collectionId },
      });
      if (collection.activeSnapshotId) {
        await tx.auctionSnapshot.update({
          where: { id: collection.activeSnapshotId },
          data: { retiredAt: now },
        });
      }
      await tx.auctionSnapshot.update({
        where: { id: run.snapshotId },
        data: { state: "complete", completedAt: now },
      });
      await tx.auctionSyncRun.update({
        where: { id: run.runId },
        data: { state: "succeeded", finishedAt: now },
      });
      await tx.auctionCollectionState.update({
        where: { id: this.collectionId },
        data: {
          activeSnapshotId: run.snapshotId,
          lastSuccessfulAt: now,
          latestRunId: run.runId,
          latestRunState: "succeeded",
          leaseOwner: null,
          leaseExpiresAt: null,
        },
      });
    }, { timeout: 60_000 });
  }

  async fail(run: AuctionRun, reason: string) {
    await this.db.$transaction(async (tx) => {
      const updated = await tx.auctionSyncRun.updateMany({
        where: { id: run.runId, state: "running", fencingToken: run.token },
        data: {
          state: "failed",
          finishedAt: new Date(),
          errorSummary: reason.slice(0, 300),
        },
      });
      if (updated.count) {
        await tx.auctionSnapshot.updateMany({
          where: { id: run.snapshotId, state: "collecting" },
          data: { state: "failed" },
        });
      }
      await tx.auctionCollectionState.updateMany({
        where: {
          id: this.collectionId,
          leaseOwner: run.owner,
          fencingToken: run.token,
          latestRunId: run.runId,
        },
        data: { latestRunState: "failed", leaseOwner: null, leaseExpiresAt: null },
      });
    });
  }

  async cleanup() {
    const cutoff = new Date(Date.now() - RETENTION_MS);
    await this.db.auctionSnapshot.deleteMany({
      where: {
        collectionId: this.collectionId,
        activeCollection: { is: null },
        run: { is: { latestCollection: { is: null } } },
        OR: [
          { state: "complete", retiredAt: { lte: cutoff } },
          { state: "failed", createdAt: { lte: cutoff } },
        ],
      },
    });
  }
}
