"use client";

import React from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-6 text-center text-slate-100">
      <h2 className="text-2xl font-bold text-white">
        Terjadi Kesalahan Memuat Halaman
      </h2>
      <p className="mt-2 max-w-md text-sm text-slate-400">{error.message}</p>
      <button
        onClick={() => reset()}
        className="mt-6 rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
      >
        Muat Ulang
      </button>
    </div>
  );
}