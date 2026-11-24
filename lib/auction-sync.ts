import { AuctionSnapshotStore } from "./auction-snapshot-store";
import { fetchAuctionPage, type AuctionSourcePage } from "./pvp-auction-client";

export async function synchronizeAuctions(
  store: AuctionSnapshotStore,
  getPage: (page: number) => Promise<AuctionSourcePage> = fetchAuctionPage,
) {
  const run = await store.start();
  let published = false;
  try {
    const seen = new Set<string>();
    let totalPages: number | undefined;
    let totalElements: number | undefined;
    let propertyCount = 0;
    let pageNumber = 0;

    do {
      const page = await getPage(pageNumber);
      if (page.number !== pageNumber) throw new Error("Unexpected auction source page");
      if (totalPages === undefined) {
        totalPages = page.totalPages;
        totalElements = page.totalElements;
      } else if (page.totalPages !== totalPages || page.totalElements !== totalElements) {
        throw new Error("Auction source totals changed during synchronization");
      }
      for (const id of page.sourceIds) {
        if (seen.has(id)) throw new Error("Duplicate auction source identifier");
        seen.add(id);
      }
      propertyCount += page.records.length;
      await store.addPage(run, page.records, page.sourceIds.length);
      pageNumber++;
    } while (pageNumber < (totalPages ?? 0));

    if (seen.size !== totalElements) throw new Error("Auction source traversal is incomplete");
    await store.publish(run, seen.size, propertyCount);
    published = true;
    await store.cleanup();
  } catch (error) {
    if (!published) {
      try {
        await store.fail(run, "Auction synchronization failed; see server logs");
      } catch (failureError) {
        throw new AggregateError([error, failureError], "Auction synchronization and failure recording failed");
      }
    }
    throw error;
  }
}
