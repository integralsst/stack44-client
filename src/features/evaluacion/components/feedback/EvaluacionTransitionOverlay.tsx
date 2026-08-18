import { LoaderCircle } from "lucide-react";

interface Props {
  open: boolean;
  title: string;
  description: string;
}

export default function EvaluacionTransitionOverlay({
  open,
  title,
  description,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/20 px-4 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-center shadow-2xl shadow-slate-950/15">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-100 bg-cyan-50 text-cyan-700 shadow-sm">
          <LoaderCircle
            size={27}
            className="animate-spin"
            aria-hidden="true"
          />
        </div>

        <h3 className="mt-4 text-base font-extrabold text-slate-950">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>

        <div
          className="mt-5 flex items-center justify-center gap-1.5"
          aria-hidden="true"
        >
          {[0, 1, 2].map((index) => (
            <span
              key={index}
              className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-500"
              style={{ animationDelay: `${index * 180}ms` }}
            />
          ))}
        </div>
        <p className="mt-2 text-[11px] font-medium text-slate-400">
          La pantalla se actualizará automáticamente al terminar.
        </p>
      </div>
    </div>
  );
}
