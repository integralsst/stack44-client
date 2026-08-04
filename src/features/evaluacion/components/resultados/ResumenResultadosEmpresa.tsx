import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Scale,
} from "lucide-react";

import type { ResumenEmpresaResultado } from "../../types/resultados-evaluacion.types";

interface Props {
  resumen: ResumenEmpresaResultado;
}

export default function ResumenResultadosEmpresa({
  resumen,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={BarChart3}
          label="Administrativo"
          value={resumen.cumplimientoAdministrativo.toFixed(2)}
          suffix="/ 5"
          detail={`${resumen.evaluados} aspectos evaluados`}
        />
        <MetricCard
          icon={Scale}
          label="Ministerial"
          value={resumen.calificacionMinisterial.toFixed(2)}
          suffix={`/ ${resumen.calificacionMinisterialMaxima.toFixed(2)}`}
          detail={`${resumen.porcentajeMinisterial.toFixed(1)}% obtenido`}
        />
        <MetricCard
          icon={ClipboardList}
          label="Cobertura"
          value={`${resumen.coberturaPorcentaje.toFixed(1)}%`}
          detail={`${resumen.evaluados} de ${resumen.totalAspectos} aspectos`}
        />
        <MetricCard
          icon={CheckCircle2}
          label="Estándares cumplidos"
          value={`${resumen.estandaresCumplidos}`}
          suffix={`/ ${resumen.totalEstandares}`}
          detail={`${resumen.estandaresNoCumplidos} no cumplen · ${resumen.estandaresSinEvaluar} sin evaluar`}
        />
      </div>

      <section className="rounded-2xl border border-neutral-800 bg-[#0a0b0c] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-white">
              Estado de los aspectos
            </h3>
            <p className="mt-1 text-xs text-neutral-500">
              Última evaluación finalizada y válida de cada aspecto.
            </p>
          </div>
          <span className="text-xs text-neutral-500">
            {resumen.totalAspectos} aspectos
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <StatePill
            label="Cumplidos"
            value={resumen.estados.cumplidos}
            className="border-emerald-500/25 bg-emerald-500/10 text-emerald-300"
          />
          <StatePill
            label="Parciales"
            value={resumen.estados.parciales}
            className="border-amber-500/25 bg-amber-500/10 text-amber-300"
          />
          <StatePill
            label="No cumplen"
            value={resumen.estados.noCumplidos}
            className="border-red-500/25 bg-red-500/10 text-red-300"
          />
          <StatePill
            label="No aplica"
            value={resumen.estados.noAplica}
            className="border-cyan-500/25 bg-cyan-500/10 text-cyan-300"
          />
          <StatePill
            label="Sin evaluar"
            value={resumen.estados.sinEvaluar}
            className="border-neutral-700 bg-neutral-900 text-neutral-400"
          />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  suffix,
  detail,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  suffix?: string;
  detail: string;
}) {
  return (
    <article className="rounded-2xl border border-neutral-800 bg-[#0a0b0c] p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-neutral-500">
          {label}
        </span>
        <Icon size={16} className="text-cyan-400" />
      </div>
      <p className="mt-3 text-2xl font-bold text-white">
        {value}{" "}
        {suffix && (
          <span className="text-sm font-medium text-neutral-500">
            {suffix}
          </span>
        )}
      </p>
      <p className="mt-1 text-xs text-neutral-500">{detail}</p>
    </article>
  );
}

function StatePill({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${className}`}
    >
      <span className="text-xs font-medium">{label}</span>
      <strong className="text-sm">{value}</strong>
    </div>
  );
}
