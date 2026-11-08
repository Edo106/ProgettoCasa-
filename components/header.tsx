import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-zinc-900">
          ProgettoCasa
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-zinc-700 md:flex">
          <Link href="/" className="hover:text-zinc-900">
            Annunci
          </Link>
        </nav>

        <details className="relative md:hidden">
          <summary className="cursor-pointer rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700">
            Menu
          </summary>
          <div className="absolute right-0 z-20 mt-2 min-w-36 rounded-lg border border-zinc-200 bg-white p-2 shadow-lg">
            <Link
              href="/"
              className="block rounded-md px-2 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100"
            >
              Annunci
            </Link>
          </div>
        </details>
      </div>
    </header>
  );
}
