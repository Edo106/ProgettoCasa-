-- CreateEnum
CREATE TYPE "public"."AuctionSnapshotState" AS ENUM ('collecting', 'complete', 'failed');

-- CreateEnum
CREATE TYPE "public"."AuctionSyncRunState" AS ENUM ('running', 'succeeded', 'failed');

-- CreateTable
CREATE TABLE "public"."AuctionSnapshot" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "sourceRecordCount" INTEGER NOT NULL DEFAULT 0,
    "propertyRecordCount" INTEGER NOT NULL DEFAULT 0,
    "state" "public"."AuctionSnapshotState" NOT NULL DEFAULT 'collecting',

    CONSTRAINT "AuctionSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuctionAnnouncement" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "description" TEXT,
    "city" TEXT,
    "province" TEXT,
    "address" TEXT,
    "startingPrice" DECIMAL(14,2),
    "auctionAt" TIMESTAMP(3),
    "status" TEXT,
    "propertyCategory" TEXT NOT NULL,

    CONSTRAINT "AuctionAnnouncement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuctionSyncRun" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "state" "public"."AuctionSyncRunState" NOT NULL DEFAULT 'running',
    "errorSummary" TEXT,
    "leaseOwner" TEXT NOT NULL,
    "leaseExpiresAt" TIMESTAMP(3) NOT NULL,
    "fencingToken" BIGINT NOT NULL,
    "pagesProcessed" INTEGER NOT NULL DEFAULT 0,
    "recordsProcessed" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "AuctionSyncRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AuctionCollectionState" (
    "id" TEXT NOT NULL DEFAULT 'pvp',
    "activeSnapshotId" TEXT,
    "lastSuccessfulAt" TIMESTAMP(3),
    "latestRunId" TEXT,
    "latestRunState" "public"."AuctionSyncRunState",
    "leaseOwner" TEXT,
    "leaseExpiresAt" TIMESTAMP(3),
    "fencingToken" BIGINT NOT NULL DEFAULT 0,

    CONSTRAINT "AuctionCollectionState_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuctionAnnouncement_snapshotId_city_idx" ON "public"."AuctionAnnouncement"("snapshotId", "city");

-- CreateIndex
CREATE INDEX "AuctionAnnouncement_snapshotId_startingPrice_idx" ON "public"."AuctionAnnouncement"("snapshotId", "startingPrice");

-- CreateIndex
CREATE INDEX "AuctionAnnouncement_snapshotId_auctionAt_sourceId_idx" ON "public"."AuctionAnnouncement"("snapshotId", "auctionAt", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionAnnouncement_snapshotId_sourceId_key" ON "public"."AuctionAnnouncement"("snapshotId", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionSyncRun_snapshotId_key" ON "public"."AuctionSyncRun"("snapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionCollectionState_activeSnapshotId_key" ON "public"."AuctionCollectionState"("activeSnapshotId");

-- CreateIndex
CREATE UNIQUE INDEX "AuctionCollectionState_latestRunId_key" ON "public"."AuctionCollectionState"("latestRunId");

-- AddForeignKey
ALTER TABLE "public"."AuctionAnnouncement" ADD CONSTRAINT "AuctionAnnouncement_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "public"."AuctionSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuctionSyncRun" ADD CONSTRAINT "AuctionSyncRun_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "public"."AuctionSnapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuctionCollectionState" ADD CONSTRAINT "AuctionCollectionState_activeSnapshotId_fkey" FOREIGN KEY ("activeSnapshotId") REFERENCES "public"."AuctionSnapshot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AuctionCollectionState" ADD CONSTRAINT "AuctionCollectionState_latestRunId_fkey" FOREIGN KEY ("latestRunId") REFERENCES "public"."AuctionSyncRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;
