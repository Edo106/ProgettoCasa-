import type { AuctionRecord } from "./auction-snapshot-store";
import { romeDateTime } from "./auction-dates";

const ENDPOINT = "https://pvp.giustizia.it/ric-496b258c-986a1b71/ric-ms/ricerca/vendite";
const PAGE_SIZE = 1000;
const OTHER_LOTS = new Set(["MOBILI", "VALORI/CREDITI", "AZIENDE", "ALTRO"]);

type JsonObject = Record<string, unknown>;

export type AuctionSourcePage = {
  records: AuctionRecord[];
  sourceIds: string[];
  number: number;
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
};

function object(value: unknown, label: string): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Invalid source ${label}`);
  }
  return value as JsonObject;
}

function integer(value: unknown, label: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0) {
    throw new Error(`Invalid source ${label}`);
  }
  return value;
}

function text(value: unknown, label: string): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string") throw new Error(`Invalid source ${label}`);
  return value.trim() || null;
}

function sourceId(value: unknown): string {
  if (typeof value === "number" && Number.isSafeInteger(value) && value > 0) {
    return String(value);
  }
  if (typeof value === "string" && /^[1-9]\d*$/.test(value)) return value;
  throw new Error("Invalid source announcement identifier");
}

function romeDate(value: unknown): Date | null {
  const raw = text(value, "auction date");
  if (!raw) return null;
  if (/[zZ]$|[+-]\d\d:\d\d$/.test(raw)) {
    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) throw new Error("Invalid source auction date");
    return date;
  }
  return romeDateTime(raw);
}

function normalize(value: unknown): { id: string; record: AuctionRecord | null } {
  const item = object(value, "announcement");
  const id = sourceId(item.id);
  const lot = text(item.tipoLotto, "classification");
  if (lot !== "IMMOBILI") {
    if (lot && OTHER_LOTS.has(lot)) return { id, record: null };
    throw new Error("Unknown source classification");
  }
  const category = text(item.categoriaLotto, "property category");
  if (!category) throw new Error("Missing source property category");
  const address = item.indirizzo == null ? {} : object(item.indirizzo, "address");
  const street = text(address.via, "street");
  const number = text(address.numeroCivico, "street number");
  const price = item.prezzoBaseAsta;
  let startingPrice: string | null = null;
  if (price !== null && price !== undefined && price !== "") {
    const raw = String(price);
    if ((typeof price !== "number" && typeof price !== "string") ||
        !/^\d{1,12}(?:\.\d{1,2})?$/.test(raw)) {
      throw new Error("Invalid source auction price");
    }
    startingPrice = raw;
  }

  return {
    id,
    record: {
      sourceId: id,
      sourceUrl: `https://pvp.giustizia.it/pvp/it/detail_annuncio.page?idAnnuncio=${id}`,
      description: text(item.descLotto, "description"),
      city: text(address.descComune, "city") ?? text(address.citta, "city"),
      province: text(address.descProvincia, "province") ?? text(address.provincia, "province"),
      address: [street, number].filter(Boolean).join(" ") || null,
      startingPrice,
      auctionAt: romeDate(item.dataOraVendita),
      status: text(item.esito, "status"),
      propertyCategory: category,
    },
  };
}

export async function fetchAuctionPage(
  page: number,
  fetcher: typeof fetch = fetch,
): Promise<AuctionSourcePage> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("language", "it");
  url.searchParams.set("page", String(page));
  url.searchParams.set("size", String(PAGE_SIZE));
  url.searchParams.append("sort", "dataOraVendita,asc");
  url.searchParams.append("sort", "citta,asc");

  let response: Response | undefined;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      response = await fetcher(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      if (!(error instanceof TypeError || error instanceof DOMException)) throw error;
      if (attempt === 2) throw new Error("Auction source connection failed", { cause: error });
      await new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt));
      continue;
    }
    if (response.status === 429) throw new Error("Auction source rate limit reached");
    if (response.status === 401 || response.status === 403) {
      throw new Error("Auction source access denied");
    }
    if (response.status >= 500 && attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt));
      continue;
    }
    break;
  }
  if (!response?.ok) throw new Error(`Auction source returned HTTP ${response?.status ?? "unknown"}`);

  const envelope = object(await response.json(), "response");
  if (envelope.error) throw new Error("Auction source reported an error");
  const body = object(envelope.body, "page");
  const number = integer(body.number, "page number");
  const totalPages = integer(body.totalPages, "page count");
  const totalElements = integer(body.totalElements, "result count");
  const count = integer(body.numberOfElements, "page size");
  if (integer(body.size, "requested page size") !== PAGE_SIZE ||
      number !== page || !Array.isArray(body.content) || body.content.length !== count ||
      typeof body.first !== "boolean" || typeof body.last !== "boolean" ||
      body.first !== (page === 0) || body.last !== (totalPages === 0 || page === totalPages - 1) ||
      (totalPages === 0 && (page !== 0 || totalElements !== 0 || count !== 0)) ||
      (totalPages > 0 && page >= totalPages)) {
    throw new Error("Inconsistent source page metadata");
  }
  const normalized = body.content.map(normalize);
  return {
    records: normalized.flatMap((item) => item.record ? [item.record] : []),
    sourceIds: normalized.map((item) => item.id),
    number,
    totalPages,
    totalElements,
    first: body.first,
    last: body.last,
  };
}
