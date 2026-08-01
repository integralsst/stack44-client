export default function EvaluacionPageSkeleton() {
  return (
    <div className="flex min-h-full w-full animate-pulse flex-col gap-3">
      <div className="h-28 rounded-2xl border border-neutral-800 bg-[#101112]" />

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-24 rounded-xl border border-neutral-800 bg-[#101112]"
          />
        ))}
      </div>

      <div className="h-24 rounded-2xl border border-neutral-800 bg-[#101112]" />

      <div className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#101112]">
        <div className="h-28 border-b border-neutral-800 bg-[#0b0c0d]" />
        <div className="space-y-px">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="h-16 bg-neutral-900/60"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
