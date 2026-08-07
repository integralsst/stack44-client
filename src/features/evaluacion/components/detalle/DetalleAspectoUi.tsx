import type {
  LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";

export function DetailSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-start gap-3 border-b border-slate-200 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-cyan-700">
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold text-slate-950">{title}</h3>
          {description && (
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {description}
            </p>
          )}
        </div>
      </div>
      {children}
    </section>
  );
}

export function InfoCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3.5 ${
        accent
          ? "border-cyan-200 bg-cyan-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <div className="mt-2 text-sm leading-6 text-slate-800">
        {value}
      </div>
    </div>
  );
}

export function BooleanCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: boolean;
  detail?: string | null;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${
            value ? "bg-emerald-400" : "bg-neutral-700"
          }`}
        />
        <div>
          <p className="text-xs font-medium leading-5 text-slate-700">
            {label}
          </p>
          <p
            className={`mt-1 text-xs ${
              value ? "text-emerald-700" : "text-slate-500"
            }`}
          >
            {value ? "Sí" : "No"}
            {detail ? ` · ${detail}` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
      <p className="font-semibold text-slate-700">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
        {description}
      </p>
    </div>
  );
}

export function formatDate(
  value: string | null | undefined,
  includeTime = false
): string {
  if (!value) return "No registrada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    ...(includeTime
      ? {
          timeStyle: "short",
        }
      : {}),
  }).format(date);
}
