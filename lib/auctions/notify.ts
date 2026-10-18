import type { Auction, SearchFilter } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function contains(haystack: string | null | undefined, needle: string | null) {
  return !needle || (haystack ?? "").toLowerCase().includes(needle.toLowerCase());
}

function matches(a: Auction, f: SearchFilter) {
  return (
    contains(`${a.title} ${a.city ?? ""}`, f.city) &&
    contains(a.province, f.province) &&
    contains(`${a.propertyType ?? ""} ${a.title}`, f.propertyType) &&
    (f.maxPrice == null || a.basePrice == null || a.basePrice <= f.maxPrice)
  );
}

async function sendTelegram(chatId: string, text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN non configurato");
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) throw new Error(`Telegram HTTP ${res.status}`);
}

export async function notifyMatches() {
  const filters = await prisma.searchFilter.findMany({ where: { active: true } });
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000);
  const auctions = await prisma.auction.findMany({ where: { discoveredAt: { gte: since } } });
  let sent = 0;
  const errors: string[] = [];

  for (const f of filters) {
    const chatId = f.chatId ?? process.env.TELEGRAM_CHAT_ID;
    if (f.channel !== "telegram" || !chatId) continue;
    for (const a of auctions) {
      if (!matches(a, f)) continue;
      const already = await prisma.notifiedAuction.findUnique({
        where: { auctionId_filterId: { auctionId: a.id, filterId: f.id } },
      });
      if (already) continue;
      try {
        const price =
          a.basePrice != null ? `\nPrezzo base: € ${a.basePrice.toLocaleString("it-IT")}` : "";
        await sendTelegram(chatId, `Nuova asta: ${a.title}${price}\n${a.url}`);
        await prisma.notifiedAuction.create({ data: { auctionId: a.id, filterId: f.id } });
        sent++;
      } catch (e) {
        console.error("[aste] errore notifica", e);
        errors.push(`filtro ${f.id}, asta ${a.id}: ${(e as Error).message}`);
      }
    }
  }
  return { sent, errors };
}
