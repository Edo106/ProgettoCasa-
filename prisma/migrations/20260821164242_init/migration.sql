-- CreateTable
CREATE TABLE "Listing" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT,
    "squareMeters" INTEGER NOT NULL,
    "rooms" INTEGER NOT NULL,
    "bathrooms" INTEGER,
    "propertyType" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);
