"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 px-4 py-16 text-center">
      <h1 className="text-2xl font-bold text-zinc-900">Qualcosa è andato storto</h1>
      <p className="text-zinc-600">
        Si è verificato un errore imprevisto. Riprova più tardi.
      </p>
      <button
        onClick={reset}
        className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
      >
        Riprova
      </button>
    </div>
  );
}
