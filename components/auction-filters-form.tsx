import Link from "next/link";

type Props = {
  values: Record<string, string>;
};

const fields = [
  { name: "city", label: "Città", type: "text" },
  { name: "minPrice", label: "Prezzo minimo (€)", type: "number" },
  { name: "maxPrice", label: "Prezzo massimo (€)", type: "number" },
  { name: "fromDate", label: "Data asta da", type: "date" },
  { name: "toDate", label: "Data asta a", type: "date" },
];

export function AuctionFiltersForm({ values }: Props) {
  return (
    <form action="/aste" method="get">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {fields.map((field) => (
          <label key={field.name} className="flex min-w-0 flex-col gap-1 text-sm font-medium text-zinc-700">
            {field.label}
            <input
              type={field.type}
              name={field.name}
              defaultValue={values[field.name] ?? ""}
              min={field.type === "number" ? "0" : undefined}
              step={field.type === "number" ? "0.01" : undefined}
              className="min-w-0 rounded-md border border-zinc-300 px-3 py-2 font-normal"
            />
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
          Applica filtri
        </button>
        <Link href="/aste" className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100">
          Cancella filtri
        </Link>
      </div>
    </form>
  );
}
