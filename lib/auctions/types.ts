export type ParsedAuction = {
  externalId: string;
  source: string;
  url: string;
  title: string;
  city?: string | null;
  province?: string | null;
  propertyType?: string | null;
  basePrice?: number | null;
  minOffer?: number | null;
  auctionDate?: Date | null;
};

export type AuctionSource = {
  name: string;
  fetch: () => Promise<ParsedAuction[]>;
};
