function Block({ className }: { className: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl border border-slate-200 bg-slate-100 ${className}`}
    />
  );
}

export default function DetalleAspectoSkeleton() {
  return (
    <div className="space-y-4 bg-white p-4 sm:p-6">
      <Block className="h-28 w-full" />
      <div className="grid gap-3 sm:grid-cols-2">
        <Block className="h-24" />
        <Block className="h-24" />
      </div>
      <Block className="h-56 w-full" />
      <Block className="h-44 w-full" />
    </div>
  );
}
