import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileWarning,
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
      attention: false,
    },
    {
      label: "Sin revisión",
      value: resumen.sinRevision,
      detail: "Pendientes por evaluar",
      icon: Clock3,
      attention: false,
    },
    {
      label: "Vigentes",
      value: resumen.vigentes,
      detail: `${resumen.porVencer} por vencer · ${
        resumen.pendientesVigencia ?? 0
      } por completar`,
      icon: CheckCircle2,
      attention: false,
    },
    {
      label: "Vencidos",
      value: resumen.vencidos,
      detail: "Requieren atención",
      icon: AlertTriangle,
      attention: resumen.vencidos > 0,
    },
    {
      label: "Evidencias pendientes",
      value: resumen.evidenciasPendientes ?? 0,
      detail: "Cumplen en 5 · falta soporte",
      icon: FileWarning,
      attention: (resumen.evidenciasPendientes ?? 0) > 0,
    },
    {
      label: "Administrativo",
      value: resumen.cumplimientoAdministrativo.toFixed(2),
      detail: "Promedio sobre 5",
      icon: Gauge,
      attention: false,
    },
    {
      label: "Ministerial",
      value: resumen.calificacionMinisterial.toFixed(2),
      detail: `de ${resumen.calificacionMinisterialMaxima.toFixed(2)}`,
      icon: Scale,
      attention: false,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-7">
      {cards.map(
        ({ label, value, detail, icon: Icon, attention }) => (
          <article
            key={label}
            className={`min-w-0 rounded-xl border p-3 shadow-sm ${
              attention
                ? "border-amber-300 bg-amber-50"
                : "border-slate-200 bg-white"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p
                className={`truncate text-[9px] font-bold uppercase tracking-wider sm:text-[10px] ${
                  attention
                    ? "text-amber-900"
                    : "text-slate-600"
                }`}
              >
                {label}
              </p>
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                  attention
                    ? "bg-amber-100 text-amber-700"
                    : "bg-slate-50 text-slate-500"
                }`}
              >
                <Icon size={14} />
              </span>
            </div>

            <p
              className={`mt-1.5 text-lg font-bold leading-none sm:text-xl ${
                attention
                  ? "text-amber-950"
                  : "text-slate-900"
              }`}
            >
              {value}
            </p>

            <p
              className={`mt-1 truncate text-[10px] sm:text-[11px] ${
                attention
                  ? "text-amber-800"
                  : "text-slate-600"
              }`}
            >
              {detail}
            </p>
          </article>
        )
      )}
    </section>
  );
}
