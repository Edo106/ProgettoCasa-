import Image from "next/image";
import Link from "next/link";

type ListingCardProps = {
  id: number;
  title: string;
  city: string;
  price: number;
  squareMeters: number;
  rooms: number;
  imageUrl: string | null;
};

const euroFormatter = new Intl.NumberFormat("it-IT", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

export function ListingCard({
  id,
  title,
  city,
  price,
  squareMeters,
  rooms,
  imageUrl,
}: ListingCardProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="relative h-44 w-full bg-zinc-100">
        <Image
          src={imageUrl ?? "/placeholder-house.png"}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <div className="space-y-2 p-4">
        <h2 className="line-clamp-2 text-base font-semibold text-zinc-900">{title}</h2>
        <p className="text-xl font-bold text-blue-700">{euroFormatter.format(price)}</p>
        <p className="text-sm text-zinc-600">{city}</p>
        <p className="text-sm text-zinc-600">
          {squareMeters} m² · {rooms} stanze
        </p>
        <Link
          href={`/annunci/${id}`}
          className="inline-flex rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Vedi dettaglio
        </Link>
      </div>
    </article>
  );
}
