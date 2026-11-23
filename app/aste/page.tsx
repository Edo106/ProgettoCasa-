import Link from "next/link";
import { AuctionCard } from "@/components/auction-card";
import { AuctionFiltersForm } from "@/components/auction-filters-form";
import { getAuctionResults, parseAuctionFilters } from "@/lib/auction-queries";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

const dateFormatter = new Intl.DateTimeFormat("it-IT", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Europe/Rome",
});

function paginationUrl(params: SearchParams, snapshotId: string, page: number) {
  const query = new URLSearchParams();
  for (const key of ["city", "minPrice", "maxPrice", "fromDate", "toDate"]) {
    const value = params[key];
    if (typeof value === "string" && value) query.set(key, value);
  }
  query.set("snapshot", snapshotId);
  query.set("page", String(page));
  return `/aste?${query.toString()}`;
}

export default async function AuctionsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const parsed = parseAuctionFilters(params);
  const rawPage = typeof params.page === "string" ? params.page : "";
  const page = /^[1-9]\d*$/.test(rawPage) && Number.isSafeInteger(Number(rawPage))
    ? Number(rawPage)
    : 1;
  const pageError = params.page && (!rawPage || page === 1 && rawPage !== "1")
    ? "La pagina richiesta non è valida."
    : null;
  const values = Object.fromEntries(
    ["city", "minPrice", "maxPrice", "fromDate", "toDate"].map((key) => [
      key,
      typeof params[key] === "string" ? params[key] : "",
    ]),
  );
  const snapshot = typeof params.snapshot === "string" ? params.snapshot : undefined;
  let result: Awaited<ReturnType<typeof getAuctionResults>> | null = null;
  try {
    result = await getAuctionResults(prisma, "pvp", parsed.filters, page, snapshot);
  } catch (error) {
    console.error("Errore nel caricamento delle aste:", error);
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
        <h1 className="mb-2 text-2xl font-bold text-zinc-900">Aste immobiliari</h1>
        <p className="mb-4 text-sm text-zinc-600">
          Le informazioni sono indicative: il Portale delle Vendite Pubbliche è la fonte ufficiale per dettagli e partecipazione.
        </p>
        <AuctionFiltersForm values={values} />
        {(parsed.error || pageError) && (
          <p role="alert" className="mt-3 text-sm text-red-700">{parsed.error || pageError}</p>
        )}
      </section>

      {result?.lastSuccessfulAt && (
        <p className="mb-3 text-sm text-zinc-600">
          Ultimo aggiornamento completo: {dateFormatter.format(result.lastSuccessfulAt)}
        </p>
      )}
      {(result?.stale || result?.updateFailed) && (
        <p role="status" className="mb-4 rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          {result.updateFailed ? "L&apos;ultimo aggiornamento non è riuscito. " : ""}
          {result.stale ? "I dati potrebbero non essere aggiornati." : "Sono mostrati i dati dell'ultimo aggiornamento completo."}
        </p>
      )}
      {!result || result.kind === "unavailable" ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-700">
          Gli annunci delle aste non sono al momento disponibili. Riprova più tardi.
        </p>
      ) : result.kind === "expired" ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-700">
          Questa versione dei risultati è scaduta. <Link className="text-blue-700 underline" href="/aste">Carica i risultati aggiornati</Link>.
        </p>
      ) : result.kind === "empty" ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-700">Non sono disponibili annunci di aste immobiliari.</p>
      ) : result.kind === "no-matches" ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-700">
          Nessun annuncio corrisponde ai filtri. <Link className="text-blue-700 underline" href="/aste">Cancella i filtri</Link>.
        </p>
      ) : (
        <>
          <section aria-label="Annunci di aste immobiliari" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {result.items.map((auction) => <AuctionCard key={auction.id} auction={auction} />)}
          </section>
          {result.totalPages > 1 && result.snapshotId && (
            <nav aria-label="Pagine degli annunci" className="mt-6 flex items-center justify-between gap-3 text-sm">
              {result.page > 1
                ? <Link className="rounded-md border border-zinc-300 px-3 py-2" href={paginationUrl(params, result.snapshotId, result.page - 1)}>Precedente</Link>
                : <span />}
              <span>Pagina {result.page} di {result.totalPages}</span>
              {result.page < result.totalPages
                ? <Link className="rounded-md border border-zinc-300 px-3 py-2" href={paginationUrl(params, result.snapshotId, result.page + 1)}>Successiva</Link>
                : <span />}
            </nav>
          )}
        </>
      )}
    </div>
  );
}
