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
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-slate-950/35 px-4 backdrop-blur-[2px]">
      <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-white p-5 text-center shadow-2xl shadow-slate-950/25">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
          <LoaderCircle size={23} className="animate-spin" />
        </div>
        <h3 className="mt-4 text-base font-extrabold text-slate-950">
          {title}
        </h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {description}
        </p>
        <div className="mx-auto mt-4 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-cyan-500" />
        </div>
      </div>
    </div>
  );
}
