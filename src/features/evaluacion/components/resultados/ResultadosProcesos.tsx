import type { ResultadoProceso } from "../../types/resultados-evaluacion.types";

interface Props {
  procesos: ResultadoProceso[];
}

export default function ResultadosProcesos({ procesos }: Props) {
  if (procesos.length === 0) {
    return (
      <EmptyState text="No hay procesos asociados al grupo seleccionado." />
    );
  }

  return (
    <div className="grid gap-3 xl:grid-cols-2">
      {procesos.map((proceso) => (
        <article
          key={proceso.id}
          className="rounded-2xl border border-neutral-800 bg-[#0a0b0c] p-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                {proceso.codigo ?? "Proceso"}
              </p>
              <h3 className="mt-1 text-sm font-semibold leading-5 text-white">
                {proceso.nombre}
              </h3>
            </div>
            <span className="shrink-0 rounded-full border border-neutral-700 bg-neutral-900 px-2.5 py-1 text-[10px] font-semibold text-neutral-300">
              {proceso.evaluados}/{proceso.totalAspectos} evaluados
            </span>
          </div>

          <div className="mt-4">
            <ScoreBlock
              label="Resultado administrativo"
              value={`${proceso.cumplimientoAdministrativo.toFixed(2)} / 5`}
              percentage={
                (proceso.cumplimientoAdministrativo / 5) * 100
              }
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px]">
            <span className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-neutral-400">
              Cobertura {proceso.coberturaPorcentaje.toFixed(1)}%
            </span>
            <span className="rounded-lg border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1.5 text-cyan-300">
              {proceso.estandaresRelacionados} estándares relacionados
            </span>
            <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-emerald-300">
              {proceso.estados.cumplidos} cumplidos
            </span>
            <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2.5 py-1.5 text-amber-300">
              {proceso.estados.parciales} parciales
            </span>
            <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-red-300">
              {proceso.estados.noCumplidos} no cumplen
            </span>
            <span className="rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1.5 text-blue-300">
              {proceso.estados.noAplica} no aplica
            </span>
            <span className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-1.5 text-neutral-500">
              {proceso.estados.sinEvaluar} sin evaluar
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

function ScoreBlock({
  label,
  value,
  percentage,
}: {
  label: string;
  value: string;
  percentage: number;
}) {
  const safePercentage = Math.min(
    100,
    Math.max(0, percentage)
  );

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-neutral-500">{label}</span>
        <strong className="text-xs text-neutral-200">{value}</strong>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-cyan-400 transition-[width]"
          style={{ width: `${safePercentage}%` }}
        />
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#0a0b0c] px-5 py-12 text-center text-sm text-neutral-500">
      {text}
    </div>
  );
}