import Link from "next/link";

type Filters = {
  city?: string;
  minPrice?: string;
  maxPrice?: string;
  minSquareMeters?: string;
  minRooms?: string;
};

type FiltersFormProps = {
  filters: Filters;
  className?: string;
};

export function FiltersForm({ filters, className }: FiltersFormProps) {
  return (
    <form action="/" method="get" className={className}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <input
          type="text"
          name="city"
          defaultValue={filters.city ?? ""}
          placeholder="Città"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min="0"
          step="1000"
          name="minPrice"
          defaultValue={filters.minPrice ?? ""}
          placeholder="Prezzo min"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min="0"
          step="1000"
          name="maxPrice"
          defaultValue={filters.maxPrice ?? ""}
          placeholder="Prezzo max"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min="0"
          name="minSquareMeters"
          defaultValue={filters.minSquareMeters ?? ""}
          placeholder="Mq min"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
        <input
          type="number"
          min="0"
          name="minRooms"
          defaultValue={filters.minRooms ?? ""}
          placeholder="Stanze min"
          className="rounded-md border border-zinc-300 px-3 py-2 text-sm"
        />
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Applica filtri
        </button>
        <Link
          href="/"
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          Reset
        </Link>
      </div>
    </form>
  );
}
