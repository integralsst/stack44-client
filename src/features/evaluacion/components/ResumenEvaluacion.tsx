import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gauge,
  ListChecks,
  Scale,
} from "lucide-react";

import type { ResumenEvaluacion as Resumen } from "../../../types/evaluacion.types";

export default function ResumenEvaluacion({
  resumen,
}: {
  resumen: Resumen;
}) {
  const cards = [
    {
      label: "Aspectos",
      value: resumen.totalAspectos,
      detail: `${resumen.evaluados} evaluados`,
      icon: ListChecks,
    },
    {
      label: "Sin revisión",
      value: resumen.sinRevision,
      detail: "Pendientes por evaluar",
      icon: Clock3,
    },
    {
      label: "Vigentes",
      value: resumen.vigentes,
      detail: `${resumen.porVencer} por vencer · ${
        resumen.pendientesVigencia ?? 0
      } por completar`,
      icon: CheckCircle2,
    },
    {
      label: "Vencidos",
      value: resumen.vencidos,
      detail: "Requieren atención",
      icon: AlertTriangle,
    },
    {
      label: "Administrativo",
      value: resumen.cumplimientoAdministrativo.toFixed(2),
      detail: "Promedio sobre 5",
      icon: Gauge,
    },
    {
      label: "Ministerial",
      value: resumen.calificacionMinisterial.toFixed(2),
      detail: `de ${resumen.calificacionMinisterialMaxima.toFixed(2)}`,
      icon: Scale,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
      {cards.map(({ label, value, detail, icon: Icon }) => (
        <article
          key={label}
          className="min-w-0 rounded-xl border border-neutral-800 bg-[#101112] p-3 shadow-lg"
        >
          <div className="flex items-center justify-between gap-2">
            <p className="truncate text-[9px] font-bold uppercase tracking-wider text-neutral-500 sm:text-[10px]">
              {label}
            </p>
            <Icon size={14} className="shrink-0 text-neutral-500" />
          </div>

          <p className="mt-1.5 text-lg font-bold leading-none text-white sm:text-xl">
            {value}
          </p>

          <p className="mt-1 truncate text-[10px] text-neutral-500 sm:text-[11px]">
            {detail}
          </p>
        </article>
      ))}
    </section>
  );
}
