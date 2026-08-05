import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Layers3,
  RefreshCw,
} from "lucide-react";
import {
  useState,
  type ReactNode,
} from "react";

import AppButton from "../../../../components/ui/AppButton";
import AppAlert from "../feedback/AppAlert";
import AppSpinner from "../feedback/AppSpinner";
import type {
  GrupoResultadosEvaluacion,
  ResultadosEvaluacionResponse,
} from "../../types/resultados-evaluacion.types";
import ResumenResultadosEmpresa from "./ResumenResultadosEmpresa";
import ResultadosEstandares from "./ResultadosEstandares";
import ResultadosProcesos from "./ResultadosProcesos";

interface Props {
  data: ResultadosEvaluacionResponse | null;
  grupo: GrupoResultadosEvaluacion;
  cargando: boolean;
  error: string | null;
  onGrupoChange: (grupo: GrupoResultadosEvaluacion) => void;
  onReload: () => Promise<void> | void;
}

type Vista = "EMPRESA" | "PROCESOS" | "ESTANDARES";

const grupos: Array<{
  value: GrupoResultadosEvaluacion;
  label: string;
}> = [
  { value: "TODOS", label: "Todos" },
  { value: "ESTANDARES_7", label: "7 estándares" },
  { value: "ESTANDARES_21", label: "21 estándares" },
  { value: "ESTANDARES_60", label: "60 estándares" },
];

export default function ResultadosEvaluacionPanel({
  data,
  grupo,
  cargando,
  error,
  onGrupoChange,
  onReload,
}: Props) {
  const [vista, setVista] = useState<Vista>("EMPRESA");

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {grupos.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onGrupoChange(item.value)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                grupo === item.value
                  ? "border-cyan-300 bg-cyan-50 text-cyan-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <AppButton
          size="sm"
          variant="secondary"
          loading={cargando && data !== null}
          loadingLabel="Actualizando"
          leadingIcon={<RefreshCw size={14} />}
          onClick={() => void onReload()}
        >
          Actualizar
        </AppButton>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-slate-200">
        <TabButton
          active={vista === "EMPRESA"}
          icon={<Building2 size={15} />}
          label="Empresa"
          onClick={() => setVista("EMPRESA")}
        />
        <TabButton
          active={vista === "PROCESOS"}
          icon={<Layers3 size={15} />}
          label="Procesos"
          onClick={() => setVista("PROCESOS")}
        />
        <TabButton
          active={vista === "ESTANDARES"}
          icon={<ClipboardCheck size={15} />}
          label="Estándares"
          onClick={() => setVista("ESTANDARES")}
        />
      </div>

      {error && (
        <AppAlert
          tone="error"
          title="No fue posible cargar los resultados"
          description={error}
        />
      )}

      {cargando && !data ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col items-center gap-3 text-slate-600">
            <AppSpinner />
            <p className="text-xs">Calculando resultados oficiales...</p>
          </div>
        </div>
      ) : !data?.periodo || !data.resumenEmpresa ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
          <ClipboardCheck className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 text-sm font-medium text-slate-800">
            El periodo todavía no tiene resultados
          </p>
          <p className="mt-1 text-xs text-slate-600">
            Abre el periodo y finaliza evaluaciones para generar el consolidado.
          </p>
        </div>
      ) : (
        <>
          {data.validacionGrupo && (
            <div
              className={`flex flex-col gap-2 rounded-xl border px-3 py-2.5 text-xs sm:flex-row sm:items-center sm:justify-between ${
                data.validacionGrupo.coincide
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-amber-200 bg-amber-50 text-amber-800"
              }`}
            >
              <div className="flex items-center gap-2">
                {data.validacionGrupo.coincide ? (
                  <CheckCircle2 size={15} className="shrink-0" />
                ) : (
                  <AlertTriangle size={15} className="shrink-0" />
                )}
                <span className="font-semibold">
                  Máximo ministerial del grupo
                </span>
              </div>
              <span>
                {data.validacionGrupo.maximoCalculado.toFixed(2)} calculado ·{" "}
                {data.validacionGrupo.maximoConfigurado.toFixed(2)} configurado
                {data.validacionGrupo.coincide
                  ? " · Validado"
                  : " · Revisar Supermatriz"}
              </span>
            </div>
          )}

          {vista === "EMPRESA" && (
            <ResumenResultadosEmpresa
              resumen={data.resumenEmpresa}
            />
          )}
          {vista === "PROCESOS" && (
            <ResultadosProcesos procesos={data.procesos} />
          )}
          {vista === "ESTANDARES" && (
            <ResultadosEstandares estandares={data.estandares} />
          )}

          <p className="text-center text-[10px] leading-4 text-slate-600">
            Administrativo: promedio de aspectos evaluados. Los procesos no reciben calificación ministerial. El puntaje ministerial se calcula por estándar y se consolida para la empresa.
          </p>
        </>
      )}
    </div>
  );
}

function TabButton({
  active,
  icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition ${
        active
          ? "border-cyan-500 text-cyan-800"
          : "border-transparent text-slate-500 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
