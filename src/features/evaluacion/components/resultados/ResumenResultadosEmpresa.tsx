import {
  BarChart3,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Scale,
} from "lucide-react";

import type {
  ConteoProvisionalesResultado,
  ResumenEmpresaResultado,
} from "../../types/resultados-evaluacion.types";

interface Props {
  resumen: ResumenEmpresaResultado;
}

export default function ResumenResultadosEmpresa({
  resumen,
}: Props) {
  const provisionales = resumen.provisionales;

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

      {provisionales && provisionales.total > 0 && (
        <ProvisionalSummary provisionales={provisionales} />
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Estado de los aspectos
            </h3>
            <p className="mt-1 text-xs text-slate-600">
              Última evaluación finalizada y válida de cada aspecto.
            </p>
          </div>
          <span className="text-xs font-medium text-slate-600">
            {resumen.totalAspectos} aspectos
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
          <StatePill
            label="Cumplidos"
            value={resumen.estados.cumplidos}
            className="border-emerald-200 bg-emerald-50 text-emerald-800"
          />
          <StatePill
            label="Parciales"
            value={resumen.estados.parciales}
            className="border-amber-200 bg-amber-50 text-amber-800"
          />
          <StatePill
            label="No cumplen"
            value={resumen.estados.noCumplidos}
            className="border-red-200 bg-red-50 text-red-800"
          />
          <StatePill
            label="No aplica"
            value={resumen.estados.noAplica}
            className="border-cyan-200 bg-cyan-50 text-cyan-800"
          />
          <StatePill
            label="Sin evaluar"
            value={resumen.estados.sinEvaluar}
            className="border-slate-200 bg-slate-50 text-slate-700"
          />
        </div>
      </section>
    </div>
  );
}

function ProvisionalSummary({
  provisionales,
}: {
  provisionales: ConteoProvisionalesResultado;
}) {
  return (
    <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-700">
          <Clock3 size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-amber-950">
              Resultado provisional
            </h3>
            <span className="rounded-full border border-amber-300 bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-800">
              {provisionales.total}{" "}
              {provisionales.total === 1
                ? "evaluación pendiente"
                : "evaluaciones pendientes"}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-amber-900">
            La nota administrativa conserva su valor efectivo mientras los
            controles siguen pendientes. El cumplimiento ministerial solo se
            consolida cuando estas evaluaciones dejan de ser provisionales.
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-[10px] font-semibold">
            {provisionales.aprobacionGestion > 0 && (
              <ProvisionalCause
                value={provisionales.aprobacionGestion}
                label="aprobación administrativa"
              />
            )}
            {provisionales.noAplica > 0 && (
              <ProvisionalCause
                value={provisionales.noAplica}
                label="decisión No aplica"
              />
            )}
            {provisionales.revisionTecnica > 0 && (
              <ProvisionalCause
                value={provisionales.revisionTecnica}
                label="revisión técnica"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ProvisionalCause({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <span className="rounded-lg border border-amber-200 bg-white px-2.5 py-1.5 text-amber-900">
      {value} {label}
    </span>
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
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-600">
          {label}
        </span>
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
          <Icon size={16} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value}{" "}
        {suffix && (
          <span className="text-sm font-medium text-slate-500">
            {suffix}
          </span>
        )}
      </p>
      <p className="mt-1 text-xs text-slate-600">{detail}</p>
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
