import { Prisma, PrismaClient } from "@prisma/client";
import { romeDayBounds } from "./auction-dates";

type SearchParams = Record<string, string | string[] | undefined>;

export type AuctionFilters = {
  city?: string;
  minPrice?: Prisma.Decimal;
  maxPrice?: Prisma.Decimal;
  fromDate?: Date;
  toDateExclusive?: Date;
};

const PAGE_SIZE = 24;
const RETENTION_MS = 24 * 60 * 60 * 1000;

export function parseAuctionFilters(params: SearchParams): {
  filters: AuctionFilters;
  error: string | null;
} {
  const keys = ["city", "minPrice", "maxPrice", "fromDate", "toDate"] as const;
  if (keys.some((key) => Array.isArray(params[key]))) {
    return { filters: {}, error: "I filtri devono avere un solo valore." };
  }
  const city = typeof params.city === "string" ? params.city.trim() : "";
  const min = typeof params.minPrice === "string" ? params.minPrice.trim() : "";
  const max = typeof params.maxPrice === "string" ? params.maxPrice.trim() : "";
  const from = typeof params.fromDate === "string" ? params.fromDate.trim() : "";
  const to = typeof params.toDate === "string" ? params.toDate.trim() : "";
  if ((min && !/^\d{1,12}(?:\.\d{1,2})?$/.test(min)) ||
      (max && !/^\d{1,12}(?:\.\d{1,2})?$/.test(max))) {
    return { filters: {}, error: "Inserisci prezzi non negativi validi." };
  }
  const minPrice = min ? new Prisma.Decimal(min) : undefined;
  const maxPrice = max ? new Prisma.Decimal(max) : undefined;
  if (minPrice && maxPrice && minPrice.gt(maxPrice)) {
    return { filters: {}, error: "Il prezzo minimo non può superare il massimo." };
  }
  let fromDate: Date | undefined;
  let toDateExclusive: Date | undefined;
  try {
    fromDate = from ? romeDayBounds(from).start : undefined;
    toDateExclusive = to ? romeDayBounds(to).end : undefined;
  } catch (error) {
    if (!(error instanceof Error)) throw error;
    return { filters: {}, error: "Inserisci date valide." };
  }
  if (from && to && from > to) {
    return { filters: {}, error: "La data iniziale non può superare quella finale." };
  }
  return {
    filters: {
      ...(city ? { city } : {}),
      ...(minPrice ? { minPrice } : {}),
      ...(maxPrice ? { maxPrice } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDateExclusive ? { toDateExclusive } : {}),
    },
    error: null,
  };
}

export async function getAuctionResults(
  db: PrismaClient,
  collectionId: string,
  filters: AuctionFilters,
  requestedPage: number,
  requestedSnapshot?: string,
) {
  const collection = await db.auctionCollectionState.findUnique({
    where: { id: collectionId },
  });
  const snapshotId = requestedSnapshot || collection?.activeSnapshotId;
  const unavailable = {
    items: [],
    page: 1,
    totalPages: 0,
    snapshotId: null,
    lastSuccessfulAt: null,
    stale: false,
    updateFailed: collection?.latestRunState === "failed",
  };
  if (!snapshotId) return { ...unavailable, kind: "unavailable" as const };

  const snapshot = await db.auctionSnapshot.findFirst({
    where: { id: snapshotId, collectionId, state: "complete" },
  });
  if (!snapshot || (snapshot.retiredAt && Date.now() - snapshot.retiredAt.getTime() >= RETENTION_MS)) {
    return { ...unavailable, kind: "expired" as const };
  }

  const where: Prisma.AuctionAnnouncementWhereInput = {
    snapshotId,
    ...(filters.city ? { city: { contains: filters.city, mode: "insensitive" } } : {}),
    ...(filters.minPrice || filters.maxPrice ? {
      startingPrice: {
        ...(filters.minPrice ? { gte: filters.minPrice } : {}),
        ...(filters.maxPrice ? { lte: filters.maxPrice } : {}),
      },
    } : {}),
    ...(filters.fromDate || filters.toDateExclusive ? {
      auctionAt: {
        ...(filters.fromDate ? { gte: filters.fromDate } : {}),
        ...(filters.toDateExclusive ? { lt: filters.toDateExclusive } : {}),
      },
    } : {}),
  };
  const count = await db.auctionAnnouncement.count({ where });
  const totalPages = Math.ceil(count / PAGE_SIZE);
  const page = Math.max(1, Math.min(requestedPage, totalPages || 1));
  const items = await db.auctionAnnouncement.findMany({
    where,
    orderBy: [{ auctionAt: { sort: "asc", nulls: "last" } }, { sourceId: "asc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });
  const expiredRun = collection?.latestRunState === "running" &&
    !!collection.leaseExpiresAt && collection.leaseExpiresAt.getTime() <= Date.now();
  return {
    kind: count ? "results" as const : snapshot.propertyRecordCount ? "no-matches" as const : "empty" as const,
    items,
    page,
    totalPages,
    snapshotId,
    lastSuccessfulAt: snapshot.completedAt,
    stale: !snapshot.completedAt || Date.now() - snapshot.completedAt.getTime() > RETENTION_MS,
    updateFailed: collection?.latestRunState === "failed" || expiredRun,
  };
}
