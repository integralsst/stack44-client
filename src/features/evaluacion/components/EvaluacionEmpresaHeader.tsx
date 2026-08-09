import {
  ArrowLeft,
  Building2,
  CalendarDays,
  ClipboardCheck,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";

import AppIconButton from "../../../components/ui/AppIconButton";
import AppSelect from "../../../components/ui/AppSelect";
import type {
  EmpresaEvaluacion,
  PeriodoEvaluacion,
} from "../../../types/evaluacion.types";

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
    { length: 8 },
    (_, index) => currentYear - 4 + index
  );

  const periodoAbierto = periodo?.estado === "ABIERTO";

  return (
    <header className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
          <AppIconButton
            icon={<ArrowLeft size={17} />}
            label="Volver a empresas"
            onClick={onVolver}
          />

          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700 sm:flex">
            <Building2 size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-700">
              Evaluación SG-SST
            </p>

            <h1
              className="mt-1 truncate text-lg font-bold text-slate-900 sm:text-xl lg:text-2xl"
              title={empresa.nombre}
            >
              {empresa.nombre}
            </h1>

            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 sm:text-xs">
              <span className="font-mono">NIT {empresa.nit}</span>

              <span className="flex items-center gap-1.5">
                <MapPin size={12} />
                {empresa.ciudadPrincipal ?? "Sin ciudad"}
              </span>

              <span className="flex items-center gap-1.5">
                <ShieldCheck size={12} />
                Riesgo {empresa.claseRiesgoPrincipal ?? "sin definir"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 xl:w-auto xl:min-w-[430px]">
          <label className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <CalendarDays size={12} />
              Periodo
            </span>

            <AppSelect
              value={anio}
              onChange={(event) =>
                onAnioChange(Number(event.target.value))
              }
              selectSize="sm"
              containerClassName="mt-1"
              className="border-transparent bg-white px-2 pr-8 font-semibold text-slate-900 hover:border-slate-300 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
              aria-label="Seleccionar periodo"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </AppSelect>
          </label>

          <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Estado del periodo
            </p>

            <div className="mt-1 flex min-w-0 items-center gap-2">
              <span
                className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-bold ${
                  periodoAbierto
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : periodo
                      ? "border-slate-200 bg-white text-slate-700"
                      : "border-amber-200 bg-amber-50 text-amber-800"
                }`}
              >
                {periodo?.estado ?? "SIN ABRIR"}
              </span>

              <span
                className="min-w-0 truncate text-[11px] text-slate-600"
                title={
                  periodo?.versionSupermatriz.nombre ??
                  "Sin versión asignada"
                }
              >
                {periodo?.versionSupermatriz.nombre ??
                  "Sin versión asignada"}
              </span>
            </div>
          </div>

          {periodo && (
            <Link
              to={`/dashboard/empresas/${empresa.id}/evaluacion/controles?anio=${anio}`}
              className="flex items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2.5 text-sm font-bold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-100 sm:col-span-2"
            >
              <ClipboardCheck size={16} />
              No aplica y aprobaciones de gestión
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
