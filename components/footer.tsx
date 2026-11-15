import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 text-center text-sm text-zinc-500 sm:px-6 lg:px-8">
        <nav aria-label="Informazioni sul sito" className="mb-2">
          <Link
            href="/contatti"
            className="rounded-sm underline-offset-4 hover:text-zinc-900 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700"
          >
            Contatti
          </Link>
        </nav>
        <p>© {new Date().getFullYear()} ProgettoCasa · Aggregatore annunci immobiliari</p>
      </div>
    </footer>
  );
}
