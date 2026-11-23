ALTER TABLE "public"."AuctionAnnouncement"
ADD CONSTRAINT "AuctionAnnouncement_startingPrice_nonnegative"
CHECK ("startingPrice" IS NULL OR "startingPrice" >= 0);
