export default function EvaluacionPageSkeleton() {
  return (
    <div className="flex min-h-full w-full animate-pulse flex-col gap-3">
      <div className="h-28 rounded-2xl border border-slate-200 bg-white shadow-sm" />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-xl border border-slate-200 bg-white shadow-sm"
          />
        ))}
      </div>

      <div className="h-24 rounded-2xl border border-slate-200 bg-white shadow-sm" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="space-y-3 border-b border-slate-200 bg-slate-50 p-4">
          <div className="h-5 w-40 rounded-full bg-slate-200" />
          <div className="h-10 rounded-xl bg-white ring-1 ring-slate-200" />
          <div className="h-3 w-56 rounded-full bg-slate-200" />
        </div>

        <div className="divide-y divide-slate-200 bg-white">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="grid h-16 grid-cols-[52px_2fr_1fr_1fr] items-center gap-4 px-4"
            >
              <div className="h-3 rounded-full bg-slate-100" />
              <div className="h-3 rounded-full bg-slate-200" />
              <div className="h-3 rounded-full bg-slate-100" />
              <div className="h-3 rounded-full bg-slate-100" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
