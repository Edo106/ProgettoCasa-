import { prisma } from "../lib/prisma";
import { AuctionSnapshotStore } from "../lib/auction-snapshot-store";
import { synchronizeAuctions } from "../lib/auction-sync";

async function main() {
  try {
    await synchronizeAuctions(new AuctionSnapshotStore(prisma));
    console.log("Auction synchronization completed.");
  } catch (error) {
    console.error("Auction synchronization failed:", error);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

void main();
