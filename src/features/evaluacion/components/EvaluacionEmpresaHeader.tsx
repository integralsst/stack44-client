import {
  ArrowLeft,
  Building2,
  CalendarDays,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import type {
  EmpresaEvaluacion,
  PeriodoEvaluacion,
} from "../types/evaluacion.types";

interface Props {
  empresa: EmpresaEvaluacion;
  periodo: PeriodoEvaluacion | null;
  anio: number;
  onAnioChange: (anio: number) => void;
  onVolver: () => void;
}

export default function EvaluacionEmpresaHeader({
  empresa,
  periodo,
  anio,
  onAnioChange,
  onVolver,
}: Props) {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 6 },
    (_, index) => currentYear - 3 + index
  );

  return (
    <header className="rounded-2xl border border-neutral-800 bg-[#101112] p-4 shadow-xl sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <button
            type="button"
            onClick={onVolver}
            className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-[#08090a] text-neutral-400 transition hover:border-neutral-700 hover:text-white"
            title="Volver a empresas"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex min-w-0 items-start gap-3">
            <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300 sm:flex">
              <Building2 size={20} />
            </div>

            <div className="min-w-0">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-400">
                Evaluación SG-SST
              </p>
              <h1 className="mt-1 truncate text-xl font-bold text-white sm:text-2xl">
                {empresa.nombre}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-neutral-400">
                <span className="font-mono">NIT {empresa.nit}</span>
                <span className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  {empresa.ciudadPrincipal ?? "Sin ciudad"}
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck size={13} />
                  Riesgo {empresa.claseRiesgoPrincipal ?? "sin definir"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:min-w-[440px]">
          <label className="rounded-xl border border-neutral-800 bg-[#08090a] px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              <CalendarDays size={13} />
              Periodo
            </span>
            <select
              value={anio}
              onChange={(event) =>
                onAnioChange(Number(event.target.value))
              }
              className="mt-1 w-full bg-transparent text-sm font-semibold text-white outline-none [color-scheme:dark]"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-xl border border-neutral-800 bg-[#08090a] px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
              Estado del periodo
            </p>
            <div className="mt-1 flex items-center justify-between gap-2">
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-bold ${
                  periodo?.estado === "ABIERTO"
                    ? "bg-emerald-500/10 text-emerald-300"
                    : periodo
                      ? "bg-neutral-700 text-neutral-300"
                      : "bg-amber-500/10 text-amber-300"
                }`}
              >
                {periodo?.estado ?? "SIN ABRIR"}
              </span>
              <span className="truncate text-xs text-neutral-500">
                {periodo?.versionSupermatriz.nombre ??
                  "Sin versión asignada"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
