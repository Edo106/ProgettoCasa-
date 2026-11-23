-- AlterTable
ALTER TABLE "public"."AuctionSnapshot" ADD COLUMN     "collectionId" TEXT NOT NULL DEFAULT 'pvp';

-- CreateIndex
CREATE INDEX "AuctionSnapshot_collectionId_state_retiredAt_idx" ON "public"."AuctionSnapshot"("collectionId", "state", "retiredAt");
