import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  Clock3,
  ListChecks,
} from "lucide-react";

import type {
  ResumenCompromisos,
} from "../../types/consulta-compromisos.types";

interface Props {
  resumen: ResumenCompromisos | null;
  cargando: boolean;
}

const cards = [
  {
    key: "total",
    label: "Total",
    icon: ListChecks,
    className:
      "border-slate-200 bg-white text-slate-900",
  },
  {
    key: "abiertos",
    label: "Abiertos",
    icon: CircleDot,
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-900",
  },
  {
    key: "vencidos",
    label: "Vencidos",
    icon: AlertTriangle,
    className:
      "border-red-200 bg-red-50 text-red-900",
  },
  {
    key: "proximosAVencer",
    label: "Próximos 30 días",
    icon: Clock3,
    className:
      "border-amber-200 bg-amber-50 text-amber-950",
  },
  {
    key: "cumplidos",
    label: "Cumplidos",
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-900",
  },
] as const;

export default function CompromisosResumen({
  resumen,
  cargando,
}: Props) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        const value =
          resumen?.[card.key] ?? 0;

        return (
          <article
            key={card.key}
            className={
              "rounded-2xl border p-4 shadow-sm " +
              card.className
            }
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide opacity-70">
                {card.label}
              </p>
              <Icon
                size={18}
                aria-hidden="true"
              />
            </div>
            <p className="mt-3 text-2xl font-bold">
              {cargando && !resumen
                ? "—"
                : value}
            </p>
          </article>
        );
      })}
    </section>
  );
}
