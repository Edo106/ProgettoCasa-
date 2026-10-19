import type { AuctionSource, ParsedAuction } from "./types";

function tag(block: string, name: string) {
  const m = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, "i"));
  if (!m) return undefined;
  return m[1]
    .replace(/^<!\[CDATA\[|\]\]>$/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .trim();
}

function parsePrice(text: string) {
  const m = text.match(/€\s*([\d.]+(?:,\d+)?)/) ?? text.match(/([\d.]+(?:,\d+)?)\s*€/);
  if (!m) return null;
  const n = Number.parseInt(m[1].replace(/\./g, "").replace(/,\d+$/, ""), 10);
  return Number.isFinite(n) ? n : null;
}

export function parseRss(xml: string, source: string): ParsedAuction[] {
  const items = xml.match(/<item[\s>][\s\S]*?<\/item>/gi) ?? [];
  const result: ParsedAuction[] = [];
  for (const item of items) {
    const title = tag(item, "title");
    const url = tag(item, "link");
    if (!title || !url) continue;
    const description = tag(item, "description") ?? "";
    const pub = tag(item, "pubDate");
    const date = pub ? new Date(pub) : null;
    result.push({
      externalId: tag(item, "guid") ?? url,
      source,
      url,
      title,
      basePrice: parsePrice(`${title} ${description}`),
      auctionDate: date && !Number.isNaN(date.getTime()) ? date : null,
    });
  }
  return result;
}

/** Sorgenti RSS configurate tramite AUCTION_RSS_URLS (URL separati da virgola). */
export function getRssSources(): AuctionSource[] {
  const urls = (process.env.AUCTION_RSS_URLS ?? "")
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);
  return urls.map((url) => {
    const name = `rss:${new URL(url).hostname}`;
    return {
      name,
      fetch: async () => {
        const res = await fetch(url, {
          headers: { "User-Agent": "ProgettoCasaBot/1.0" },
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status} per ${url}`);
        return parseRss(await res.text(), name);
      },
    };
  });
}
