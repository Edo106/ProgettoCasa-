import type { AuctionAnnouncement } from "@prisma/client";

const currency = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
});
const auctionDate = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Rome",
});

export function AuctionCard({ auction }: { auction: AuctionAnnouncement }) {
  const location = [auction.city, auction.province].filter(Boolean).join(", ");
  return (
    <article className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-zinc-900">
        {auction.description || "Descrizione non disponibile"}
      </h2>
      <p className="text-sm text-zinc-600">
        Località: {location || "Non disponibile"}
      </p>
      <p className="text-lg font-bold text-blue-700">
        {auction.startingPrice === null
          ? "Prezzo non disponibile"
          : currency.format(auction.startingPrice.toNumber())}
      </p>
      <p className="text-sm text-zinc-700">
        Data asta: {auction.auctionAt ? auctionDate.format(auction.auctionAt) : "Non disponibile"}
      </p>
      <p className="text-sm text-zinc-700">Esito: {auction.status || "Non disponibile"}</p>
      <a
        href={auction.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto inline-flex w-fit rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Vedi annuncio originale
      </a>
    </article>
  );
}
