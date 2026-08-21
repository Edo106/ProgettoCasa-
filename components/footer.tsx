export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white">
      <div className="mx-auto w-full max-w-6xl px-4 py-4 text-center text-sm text-zinc-500 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} ProgettoCasa · Aggregatore annunci immobiliari
      </div>
    </footer>
  );
}
