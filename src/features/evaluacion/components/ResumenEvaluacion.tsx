import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Gauge,
  ListChecks,
  Scale,
} from "lucide-react";

import type { ResumenEvaluacion as Resumen } from "../types/evaluacion.types";

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
      detail: `${resumen.porVencer} por vencer`,
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
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">
      {cards.map(({ label, value, detail, icon: Icon }) => (
        <article
          key={label}
          className="rounded-2xl border border-neutral-800 bg-[#101112] p-3.5 shadow-lg"
        >
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              {label}
            </p>
            <Icon size={15} className="text-neutral-500" />
          </div>
          <p className="mt-2 text-xl font-bold text-white">
            {value}
          </p>
          <p className="mt-0.5 truncate text-[11px] text-neutral-500">
            {detail}
          </p>
        </article>
      ))}
    </section>
  );
}
