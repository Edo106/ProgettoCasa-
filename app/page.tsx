import { Prisma } from "@prisma/client";
import { FiltersForm } from "@/components/filters-form";
import { ListingCard } from "@/components/listing-card";
import { prisma } from "@/lib/prisma";

function parsePositiveInt(value: string | undefined) {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;

  const filters = {
    city: typeof params.city === "string" ? params.city : undefined,
    minPrice: typeof params.minPrice === "string" ? params.minPrice : undefined,
    maxPrice: typeof params.maxPrice === "string" ? params.maxPrice : undefined,
    minSquareMeters:
      typeof params.minSquareMeters === "string" ? params.minSquareMeters : undefined,
    minRooms: typeof params.minRooms === "string" ? params.minRooms : undefined,
  };

  const minPrice = parsePositiveInt(filters.minPrice);
  const maxPrice = parsePositiveInt(filters.maxPrice);
  const minSquareMeters = parsePositiveInt(filters.minSquareMeters);
  const minRooms = parsePositiveInt(filters.minRooms);

  const where: Prisma.ListingWhereInput = {
    ...(filters.city?.trim()
      ? {
          city: {
            contains: filters.city.trim(),
          },
        }
      : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          price: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(minSquareMeters !== undefined ? { squareMeters: { gte: minSquareMeters } } : {}),
    ...(minRooms !== undefined ? { rooms: { gte: minRooms } } : {}),
  };

  let listings: Awaited<ReturnType<typeof prisma.listing.findMany>> = [];
  let loadError = false;

  try {
    listings = await prisma.listing.findMany({
      where,
      orderBy: {
        createdAt: "desc",
      },
    });
  } catch (error) {
    console.error("Errore nel caricamento degli annunci:", error);
    loadError = true;
  }

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <section className="mb-6 rounded-xl border border-zinc-200 bg-white p-4">
        <h1 className="mb-3 text-2xl font-bold text-zinc-900">Case in vendita</h1>

        <div className="md:hidden">
          <details>
            <summary className="cursor-pointer rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700">
              Apri filtri
            </summary>
            <div className="mt-3">
              <FiltersForm filters={filters} />
            </div>
          </details>
        </div>

        <div className="hidden md:block">
          <FiltersForm filters={filters} />
        </div>
      </section>

      {loadError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          Impossibile caricare gli annunci al momento. Riprova più tardi.
        </p>
      ) : listings.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white p-6 text-zinc-600">
          Nessun annuncio trovato con i filtri selezionati.
        </p>
      ) : (
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} {...listing} />
          ))}
        </section>
      )}
    </div>
  );
}
