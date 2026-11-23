import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import { PrismaClient } from "@prisma/client";
import { AuctionSnapshotStore } from "../lib/auction-snapshot-store";
import { getAuctionResults, parseAuctionFilters } from "../lib/auction-queries";

const prisma = new PrismaClient();
const collectionIds = new Set<string>();

after(async () => {
  await prisma.auctionCollectionState.deleteMany({ where: { id: { in: [...collectionIds] } } });
  await prisma.auctionSnapshot.deleteMany({ where: { collectionId: { in: [...collectionIds] } } });
  await prisma.$disconnect();
});

test("validates inclusive price and real calendar date ranges", () => {
  assert.ok(parseAuctionFilters({ minPrice: "20", maxPrice: "10" }).error);
  assert.ok(parseAuctionFilters({ fromDate: "2026-02-31" }).error);
  assert.ok(parseAuctionFilters({ minPrice: "-1" }).error);
  assert.equal(parseAuctionFilters({ fromDate: "2026-03-29", toDate: "2026-03-29" }).error, null);
});

test("combines filters, excludes missing fields, and retains snapshot pagination", async () => {
  const collectionId = `test-${randomUUID()}`;
  collectionIds.add(collectionId);
  const store = new AuctionSnapshotStore(prisma, collectionId);
  const run = await store.start();
  await store.addPage(run, [
    { sourceId: "1", sourceUrl: "https://example.test/1", city: "Roma", startingPrice: "100", auctionAt: new Date("2026-03-29T21:59:00Z"), propertyCategory: "IMMOBILE_RESIDENZIALE" },
    { sourceId: "2", sourceUrl: "https://example.test/2", city: "Milano", startingPrice: "100", auctionAt: new Date("2026-03-29T22:00:00Z"), propertyCategory: "IMMOBILE_RESIDENZIALE" },
    { sourceId: "3", sourceUrl: "https://example.test/3", city: "Roma", startingPrice: null, auctionAt: null, propertyCategory: "IMMOBILE_RESIDENZIALE" },
  ], 3);
  await store.publish(run, 3, 3);

  const parsed = parseAuctionFilters({ city: "rom", minPrice: "100", maxPrice: "100", fromDate: "2026-03-29", toDate: "2026-03-29" });
  assert.equal(parsed.error, null);
  const result = await getAuctionResults(prisma, collectionId, parsed.filters, 1, run.snapshotId);
  assert.equal(result.kind, "results");
  assert.deepEqual(result.items.map((item) => item.sourceId), ["1"]);

  const unfiltered = await getAuctionResults(prisma, collectionId, {}, 1, run.snapshotId);
  assert.equal(unfiltered.items.length, 3);
  const noMatches = await getAuctionResults(prisma, collectionId, { city: "Napoli" }, 1);
  assert.equal(noMatches.kind, "no-matches");
});

test("keeps pagination pinned to its snapshot after publication of a new one", async () => {
  const collectionId = `test-${randomUUID()}`;
  collectionIds.add(collectionId);
  const store = new AuctionSnapshotStore(prisma, collectionId);
  const first = await store.start();
  const records = Array.from({ length: 25 }, (_, index) => ({
    sourceId: String(index + 1).padStart(2, "0"),
    sourceUrl: `https://example.test/${index + 1}`,
    propertyCategory: "IMMOBILE_RESIDENZIALE",
  }));
  await store.addPage(first, records, records.length);
  await store.publish(first, records.length, records.length);
  const second = await store.start();
  await store.publish(second, 0, 0);

  const result = await getAuctionResults(prisma, collectionId, {}, 2, first.snapshotId);
  assert.equal(result.kind, "results");
  assert.equal(result.snapshotId, first.snapshotId);
  assert.deepEqual(result.items.map((item) => item.sourceId), ["25"]);
  const current = await getAuctionResults(prisma, collectionId, {}, 1);
  assert.equal(current.kind, "empty");
});

test("reports unavailable, failed, stale and expired collection states", async () => {
  const collectionId = `test-${randomUUID()}`;
  collectionIds.add(collectionId);
  const store = new AuctionSnapshotStore(prisma, collectionId);
  assert.equal((await getAuctionResults(prisma, collectionId, {}, 1)).kind, "unavailable");

  const first = await store.start();
  await store.publish(first, 0, 0);
  await prisma.auctionSnapshot.update({
    where: { id: first.snapshotId },
    data: { completedAt: new Date(Date.now() - 25 * 60 * 60 * 1000) },
  });
  const failed = await store.start();
  await store.fail(failed, "Source unavailable");
  const result = await getAuctionResults(prisma, collectionId, {}, 1);
  assert.equal(result.kind, "empty");
  assert.equal(result.stale, true);
  assert.equal(result.updateFailed, true);

  await prisma.auctionSnapshot.update({
    where: { id: first.snapshotId },
    data: { retiredAt: new Date(Date.now() - 25 * 60 * 60 * 1000) },
  });
  assert.equal((await getAuctionResults(prisma, collectionId, {}, 1, first.snapshotId)).kind, "expired");
});
