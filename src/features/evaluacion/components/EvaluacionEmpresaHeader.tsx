import {
  ArrowLeft,
  Building2,
  CalendarDays,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import AppDropdownSelect from "../../../components/ui/AppDropdownSelect";
import AppIconButton from "../../../components/ui/AppIconButton";
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
  const opcionesPeriodo = years.map((year) => ({
    value: String(year),
    label: String(year),
    description:
      year === currentYear ? "Periodo actual" : "Periodo de gestión",
  }));

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

        <div className="w-full rounded-2xl border border-slate-200 bg-slate-50/80 p-3 xl:w-[360px]">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600">
              <CalendarDays size={12} />
              Periodo de gestión
            </span>

            <span
              className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide ${
                periodoAbierto
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : periodo
                    ? "border-slate-200 bg-white text-slate-600"
                    : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
              title="Estado del periodo"
            >
              {periodo?.estado ?? "Sin abrir"}
            </span>
          </div>

          <AppDropdownSelect
            value={String(anio)}
            options={opcionesPeriodo}
            onChange={(value) => onAnioChange(Number(value))}
            ariaLabel="Seleccionar periodo de gestión"
            size="sm"
            theme="light"
            className="mt-2"
          />

          <p className="mt-2 text-[10px] font-medium text-slate-500">
            El periodo organiza las gestiones e informes del año.
          </p>
        </div>
      </div>
    </header>
  );
}
