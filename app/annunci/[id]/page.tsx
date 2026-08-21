import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export default async function ListingDetailPage({ params }: PageProps<"/annunci/[id]">) {
  const { id } = await params;
  const numericId = Number.parseInt(id, 10);

  if (!Number.isFinite(numericId)) {
    notFound();
  }

  const listing = await prisma.listing.findUnique({
    where: { id: numericId },
  });

  if (!listing) {
    notFound();
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <Link href="/" className="mb-4 inline-flex text-sm font-medium text-blue-700 hover:underline">
        ← Torna agli annunci
      </Link>

      <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <div className="relative h-64 w-full bg-zinc-100 sm:h-80 md:h-96">
          <Image
            src={listing.imageUrl ?? "/placeholder-house.png"}
            alt={listing.title}
            fill
            className="object-cover"
            sizes="100vw"
            priority
          />
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 sm:text-3xl">{listing.title}</h1>
            <p className="mt-1 text-sm text-zinc-600">
              {listing.city}
              {listing.address ? ` · ${listing.address}` : ""}
            </p>
          </div>

          <p className="text-3xl font-bold text-blue-700">{euroFormatter.format(listing.price)}</p>

          <div className="grid grid-cols-2 gap-3 text-sm text-zinc-700 sm:grid-cols-4">
            <div className="rounded-lg bg-zinc-100 p-3">
              <p className="text-xs uppercase text-zinc-500">Mq</p>
              <p className="font-semibold">{listing.squareMeters} m²</p>
            </div>
            <div className="rounded-lg bg-zinc-100 p-3">
              <p className="text-xs uppercase text-zinc-500">Stanze</p>
              <p className="font-semibold">{listing.rooms}</p>
            </div>
            <div className="rounded-lg bg-zinc-100 p-3">
              <p className="text-xs uppercase text-zinc-500">Bagni</p>
              <p className="font-semibold">{listing.bathrooms ?? "N/D"}</p>
            </div>
            <div className="rounded-lg bg-zinc-100 p-3">
              <p className="text-xs uppercase text-zinc-500">Tipologia</p>
              <p className="font-semibold">{listing.propertyType}</p>
            </div>
          </div>

          <section>
            <h2 className="mb-2 text-lg font-semibold text-zinc-900">Descrizione</h2>
            <p className="whitespace-pre-line text-zinc-700">{listing.description}</p>
          </section>

          <section className="space-y-2 rounded-lg border border-zinc-200 bg-zinc-50 p-4 text-sm text-zinc-700">
            <p>
              <span className="font-semibold">Fonte:</span> {listing.sourceName}
            </p>
            <a
              href={listing.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex font-medium text-blue-700 hover:underline"
            >
              Vai all&apos;annuncio originale
            </a>
          </section>
        </div>
      </article>
    </div>
  );
}
