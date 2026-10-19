-- CreateTable
CREATE TABLE "Auction" (
    "id" SERIAL NOT NULL,
    "externalId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "city" TEXT,
    "province" TEXT,
    "propertyType" TEXT,
    "basePrice" INTEGER,
    "minOffer" INTEGER,
    "auctionDate" TIMESTAMP(3),
    "discoveredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Auction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SearchFilter" (
    "id" SERIAL NOT NULL,
    "city" TEXT,
    "province" TEXT,
    "propertyType" TEXT,
    "maxPrice" INTEGER,
    "channel" TEXT NOT NULL DEFAULT 'telegram',
    "chatId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SearchFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotifiedAuction" (
    "id" SERIAL NOT NULL,
    "auctionId" INTEGER NOT NULL,
    "filterId" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NotifiedAuction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Auction_source_externalId_key" ON "Auction"("source", "externalId");

-- CreateIndex
CREATE UNIQUE INDEX "NotifiedAuction_auctionId_filterId_key" ON "NotifiedAuction"("auctionId", "filterId");

-- AddForeignKey
ALTER TABLE "NotifiedAuction" ADD CONSTRAINT "NotifiedAuction_auctionId_fkey" FOREIGN KEY ("auctionId") REFERENCES "Auction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotifiedAuction" ADD CONSTRAINT "NotifiedAuction_filterId_fkey" FOREIGN KEY ("filterId") REFERENCES "SearchFilter"("id") ON DELETE CASCADE ON UPDATE CASCADE;
