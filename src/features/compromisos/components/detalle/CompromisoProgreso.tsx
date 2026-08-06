import {
  CheckCircle2,
  FileCheck2,
  RefreshCcw,
} from "lucide-react";

import type { CompromisoDetalle } from "../../types/consulta-compromisos.types";

interface Props {
  progreso: CompromisoDetalle["progreso"];
}

export default function CompromisoProgreso({
  progreso,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
          Avance verificable
        </p>
        <h2 className="mt-1 text-base font-bold text-slate-950">
          Estado real del compromiso
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          El cierre exige completar todas las actividades y contar con una recalificación posterior en 5. Las evidencias respaldan la gestión, pero no son un requisito automático de cierre.
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <ProgressCard
          icon={CheckCircle2}
          label="Actividades atendidas"
          value={`${progreso.actividadesAtendidas} de ${progreso.actividadesTotal}`}
          ready={
            progreso.actividadesTotal > 0 &&
            progreso.actividadesPendientes === 0
          }
        />
        <ProgressCard
          icon={FileCheck2}
          label="Evidencia de soporte"
          value={
            progreso.evidencias > 0
              ? String(progreso.evidencias)
              : "Opcional"
          }
          ready={progreso.evidencias > 0}
          optional
        />
        <ProgressCard
          icon={RefreshCcw}
          label="Recalificación posterior"
          value={
            progreso.aspectoRecalificadoEnCinco
              ? "Calificada en 5"
              : "Pendiente"
          }
          ready={
            progreso.aspectoRecalificadoEnCinco
          }
        />
      </div>
    </section>
  );
}

interface ProgressCardProps {
  icon: typeof CheckCircle2;
  label: string;
  value: string;
  ready: boolean;
  optional?: boolean;
}

function ProgressCard({
  icon: Icon,
  label,
  value,
  ready,
  optional = false,
}: ProgressCardProps) {
  return (
    <article
      className={`rounded-xl border p-4 ${
        ready
          ? "border-emerald-200 bg-emerald-50"
          : optional
            ? "border-slate-200 bg-slate-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon
          size={17}
          className={
            ready
              ? "text-emerald-700"
              : optional
                ? "text-slate-500"
              : "text-amber-700"
          }
        />
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          {label}
        </p>
      </div>
      <p className="mt-3 text-lg font-bold text-slate-950">
        {value}
      </p>
    </article>
  );
}
