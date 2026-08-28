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
      featured: false,
    },
    {
      label: "Sin revisión",
      value: resumen.sinRevision,
      detail: "Pendientes por evaluar",
      icon: Clock3,
      attention: false,
      featured: false,
    },
    {
      label: "Administrativo",
      value: resumen.cumplimientoAdministrativo.toFixed(2),
      detail: "Promedio sobre 5",
      icon: Gauge,
      attention: false,
      featured: true,
    },
    {
      label: "Ministerial",
      value: resumen.calificacionMinisterial.toFixed(2),
      detail: `Calificación obtenida de ${resumen.calificacionMinisterialMaxima.toFixed(2)}`,
      icon: Scale,
      attention: false,
      featured: true,
    },
    {
      label: "Vigentes",
      value: resumen.vigentes,
      detail: `${resumen.porVencer} por vencer · ${
        resumen.pendientesVigencia ?? 0
      } por completar`,
      icon: CheckCircle2,
      attention: false,
      featured: false,
    },
    {
      label: "Vencidos",
      value: resumen.vencidos,
      detail: "Requieren atención",
      icon: AlertTriangle,
      attention: resumen.vencidos > 0,
      featured: false,
    },
    {
      label: "Evidencias pendientes",
      value: resumen.evidenciasPendientes ?? 0,
      detail: "Aspectos con nota 5 que todavía requieren soporte documental",
      icon: FileWarning,
      attention: (resumen.evidenciasPendientes ?? 0) > 0,
      featured: false,
    },
  ];

  return (
    <section className="grid grid-cols-2 gap-2.5 md:grid-cols-4 xl:gap-3">
      {cards.map(
        ({ label, value, detail, icon: Icon, attention, featured }) => (
          <article
            key={label}
            className={`min-w-0 rounded-2xl border p-3.5 shadow-sm transition sm:p-4 ${
              attention
                ? "border-amber-300 bg-gradient-to-br from-amber-50 to-white"
                : featured
                  ? "border-cyan-200 bg-gradient-to-br from-cyan-50/70 to-white"
                  : "border-slate-200 bg-white"
            } ${label === "Evidencias pendientes" ? "md:col-span-2 xl:col-span-2" : ""}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p
                  className={`text-[9px] font-bold uppercase leading-4 tracking-[0.12em] sm:text-[10px] ${
                    attention
                      ? "text-amber-900"
                      : featured
                        ? "text-cyan-800"
                        : "text-slate-600"
                  }`}
                >
                  {label}
                </p>
                <p
                  className={`mt-2 text-xl font-bold leading-none sm:text-2xl ${
                    attention
                      ? "text-amber-950"
                      : "text-slate-900"
                  }`}
                >
                  {value}
                </p>
              </div>

              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  attention
                    ? "bg-amber-100 text-amber-700"
                    : featured
                      ? "bg-cyan-100 text-cyan-700"
                      : "bg-slate-50 text-slate-500"
                }`}
              >
                <Icon size={16} />
              </span>
            </div>

            <p
              className={`mt-2.5 text-[10px] leading-4 sm:text-[11px] ${
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
