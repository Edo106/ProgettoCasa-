import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { AuctionSnapshotStore } from "../lib/auction-snapshot-store";
import { synchronizeAuctions } from "../lib/auction-sync";

const prisma = new PrismaClient();
const collectionIds = new Set<string>();

function createStore() {
  const collectionId = `test-${randomUUID()}`;
  collectionIds.add(collectionId);
  return new AuctionSnapshotStore(prisma, collectionId);
}

after(async () => {
  await prisma.auctionCollectionState.deleteMany({
    where: { id: { in: [...collectionIds] } },
  });
  await prisma.auctionSnapshot.deleteMany({
    where: { collectionId: { in: [...collectionIds] } },
  });
  await prisma.$disconnect();
});

test("publishes a complete snapshot and retains it after a failed run", async () => {
  const store = createStore();
  const first = await store.start();
  await store.publish(first, 0, 0);

  const second = await store.start();
  await store.fail(second, "Source unavailable");

  const state = await prisma.auctionCollectionState.findUniqueOrThrow({
    where: { id: store.collectionId },
    include: { activeSnapshot: true, latestRun: true },
  });
  assert.equal(state.activeSnapshotId, first.snapshotId);
  assert.equal(state.activeSnapshot?.state, "complete");
  assert.equal(state.latestRun?.state, "failed");
  assert.ok(state.lastSuccessfulAt);
});

test("rejects competing runs and prevents an expired worker from publishing", async () => {
  const store = createStore();
  const first = await store.start();
  await assert.rejects(store.start(), /already running/i);

  await prisma.auctionCollectionState.update({
    where: { id: store.collectionId },
    data: { leaseExpiresAt: new Date(0) },
  });
  const second = await store.start();
  await assert.rejects(store.publish(first, 0, 0), /lease/i);
  await store.publish(second, 0, 0);

  const state = await prisma.auctionCollectionState.findUniqueOrThrow({
    where: { id: store.collectionId },
    include: { latestRun: true },
  });
  assert.equal(state.activeSnapshotId, second.snapshotId);
  assert.equal(state.latestRun?.state, "succeeded");
});

test("does not publish an incomplete snapshot", async () => {
  const store = createStore();
  const run = await store.start();
  await store.fail(run, "Incomplete response");

  const state = await prisma.auctionCollectionState.findUniqueOrThrow({
    where: { id: store.collectionId },
  });
  assert.equal(state.activeSnapshotId, null);
  assert.equal(state.latestRunState, "failed");
});

test("rejects negative auction prices in persisted snapshots", async () => {
  const store = createStore();
  const run = await store.start();
  await assert.rejects(store.addPage(run, [{
    sourceId: "1",
    sourceUrl: "https://example.test/1",
    startingPrice: "-1",
    propertyCategory: "IMMOBILE_RESIDENZIALE",
  }], 1));
  await store.fail(run, "Invalid price");
});

test("keeps a replaced snapshot for 24 hours before cleanup", async () => {
  const store = createStore();
  const first = await store.start();
  await store.publish(first, 0, 0);
  const second = await store.start();
  await store.publish(second, 0, 0);

  await store.cleanup();
  assert.ok(await prisma.auctionSnapshot.findUnique({ where: { id: first.snapshotId } }));
  await prisma.auctionSnapshot.update({
    where: { id: first.snapshotId },
    data: { retiredAt: new Date(Date.now() - 25 * 60 * 60 * 1000) },
  });
  await store.cleanup();
  assert.equal(await prisma.auctionSnapshot.findUnique({ where: { id: first.snapshotId } }), null);
  assert.ok(await prisma.auctionSnapshot.findUnique({ where: { id: second.snapshotId } }));
});

test("retains the last snapshot when source page totals change", async () => {
  const store = createStore();
  const first = await store.start();
  await store.publish(first, 0, 0);

  await assert.rejects(
    synchronizeAuctions(store, async (number) => ({
      number,
      sourceIds: [String(number + 1)],
      records: [],
      totalPages: 2,
      totalElements: number === 0 ? 2 : 3,
      first: number === 0,
      last: number === 1,
    })),
    /totals changed/i,
  );
  const state = await prisma.auctionCollectionState.findUniqueOrThrow({
    where: { id: store.collectionId },
    include: { latestRun: true },
  });
  assert.equal(state.activeSnapshotId, first.snapshotId);
  assert.equal(state.latestRunState, "failed");
});

test("publishes source additions, changes, and removals in a new snapshot", async () => {
  const store = createStore();
  const page = (ids: string[], price: string) => async () => ({
    number: 0,
    sourceIds: ids,
    records: ids.map((sourceId) => ({
      sourceId,
      sourceUrl: `https://example.test/${sourceId}`,
      startingPrice: price,
      propertyCategory: "IMMOBILE_RESIDENZIALE",
    })),
    totalPages: 1,
    totalElements: ids.length,
    first: true,
    last: true,
  });
  await synchronizeAuctions(store, page(["1", "2"], "100"));
  await synchronizeAuctions(store, page(["2", "3"], "200"));
  const state = await prisma.auctionCollectionState.findUniqueOrThrow({
    where: { id: store.collectionId },
  });
  assert.ok(state.activeSnapshotId);
  const records = await prisma.auctionAnnouncement.findMany({
    where: { snapshotId: state.activeSnapshotId },
    orderBy: { sourceId: "asc" },
  });
  assert.deepEqual(records.map((record) => record.sourceId), ["2", "3"]);
  assert.equal(records[0].startingPrice?.toString(), "200");
});
