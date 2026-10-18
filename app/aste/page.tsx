import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function str(v: FormDataEntryValue | null) {
  const s = typeof v === "string" ? v.trim() : "";
  return s || null;
}

async function addFilter(formData: FormData) {
  "use server";
  const max = Number.parseInt(String(formData.get("maxPrice") ?? ""), 10);
  await prisma.searchFilter.create({
    data: {
      city: str(formData.get("city")),
      province: str(formData.get("province")),
      propertyType: str(formData.get("propertyType")),
      maxPrice: Number.isFinite(max) && max >= 0 ? max : null,
      chatId: str(formData.get("chatId")),
    },
  });
  revalidatePath("/aste");
}

async function removeFilter(formData: FormData) {
  "use server";
  const id = Number.parseInt(String(formData.get("id")), 10);
  if (Number.isFinite(id)) await prisma.searchFilter.deleteMany({ where: { id } });
  revalidatePath("/aste");
}

export default async function AstePage() {
  const [filters, auctions] = await Promise.all([
    prisma.searchFilter.findMany({ orderBy: { id: "desc" } }),
    prisma.auction.findMany({ orderBy: { discoveredAt: "desc" }, take: 50 }),
  ]);
  const input = "rounded border border-zinc-300 px-2 py-1 text-sm";

  return (
    <main className="mx-auto max-w-4xl space-y-8 p-6">
      <h1 className="text-2xl font-semibold">Aste immobiliari</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">Avvisi</h2>
        <form action={addFilter} className="flex flex-wrap gap-2">
          <input name="city" placeholder="Comune" className={input} />
          <input name="province" placeholder="Provincia" className={input} />
          <input name="propertyType" placeholder="Tipologia" className={input} />
          <input name="maxPrice" type="number" min={0} placeholder="Prezzo max" className={input} />
          <input name="chatId" placeholder="Telegram chat ID" className={input} />
          <button className="rounded bg-zinc-900 px-3 py-1 text-sm text-white">Aggiungi</button>
        </form>
        <ul className="space-y-1 text-sm">
          {filters.map((f) => (
            <li key={f.id} className="flex items-center gap-3">
              <span>
                {[f.city, f.province, f.propertyType, f.maxPrice != null ? `≤ € ${f.maxPrice}` : null]
                  .filter(Boolean)
                  .join(" · ") || "Tutte le aste"}
              </span>
              <form action={removeFilter}>
                <input type="hidden" name="id" value={f.id} />
                <button className="text-red-600 underline">Elimina</button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-medium">Ultime aste trovate</h2>
        {auctions.length === 0 && (
          <p className="text-sm text-zinc-500">Nessuna asta ancora raccolta.</p>
        )}
        <ul className="space-y-2">
          {auctions.map((a) => (
            <li key={a.id} className="rounded border border-zinc-200 p-3 text-sm">
              <a href={a.url} target="_blank" rel="noopener noreferrer" className="font-medium underline">
                {a.title}
              </a>
              <div className="text-zinc-500">
                {a.source}
                {a.basePrice != null ? ` · € ${a.basePrice.toLocaleString("it-IT")}` : ""}
                {a.auctionDate ? ` · ${a.auctionDate.toLocaleDateString("it-IT")}` : ""}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
