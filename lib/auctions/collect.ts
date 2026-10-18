import { prisma } from "@/lib/prisma";
import { getRssSources } from "./rss";
import type { AuctionSource, ParsedAuction } from "./types";

export function getSources(): AuctionSource[] {
  return [...getRssSources()];
}

export async function upsertAuctions(items: ParsedAuction[]) {
  let created = 0;
  for (const item of items) {
    const where = { source_externalId: { source: item.source, externalId: item.externalId } };
    const existing = await prisma.auction.findUnique({ where, select: { id: true } });
    await prisma.auction.upsert({ where, create: item, update: item });
    if (!existing) created++;
  }
  return created;
}

export async function collectAll() {
  const report: { source: string; found: number; created: number; error?: string }[] = [];
  for (const s of getSources()) {
    try {
      const items = await s.fetch();
      report.push({ source: s.name, found: items.length, created: await upsertAuctions(items) });
    } catch (e) {
      console.error(`[aste] errore sorgente ${s.name}`, e);
      report.push({ source: s.name, found: 0, created: 0, error: (e as Error).message });
    }
  }
  return report;
}
