import React from "react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 px-6 py-14">
      <div className="mx-auto max-w-6xl animate-pulse space-y-12">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="h-9 w-48 rounded-lg bg-slate-900" />
          <div className="h-10 w-40 rounded-lg bg-slate-900" />
        </div>
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-8">
            <div className="h-6 w-40 rounded-full bg-slate-900" />
            <div className="h-12 w-3/4 rounded-lg bg-slate-900" />
            <div className="h-6 w-1/2 rounded-lg bg-slate-900" />
            <div className="h-24 w-full rounded-lg bg-slate-900" />
          </div>
          <div className="h-56 rounded-2xl bg-slate-900 lg:col-span-4" />
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-48 rounded-xl bg-slate-900" />
          <div className="h-48 rounded-xl bg-slate-900" />
          <div className="h-48 rounded-xl bg-slate-900" />
        </div>
      </div>
    </div>
  );
}