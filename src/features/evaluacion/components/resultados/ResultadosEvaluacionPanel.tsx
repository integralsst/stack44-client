import {
  Building2,
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
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-[#090a0b] p-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2">
          {grupos.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => onGrupoChange(item.value)}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                grupo === item.value
                  ? "border-cyan-500/35 bg-cyan-500/10 text-cyan-200"
                  : "border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
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

      <div className="flex gap-1 overflow-x-auto border-b border-neutral-800">
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
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-neutral-800 bg-[#090a0b]">
          <div className="flex flex-col items-center gap-3 text-neutral-500">
            <AppSpinner />
            <p className="text-xs">Calculando resultados oficiales...</p>
          </div>
        </div>
      ) : !data?.periodo || !data.resumenEmpresa ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#090a0b] px-5 py-14 text-center">
          <ClipboardCheck className="mx-auto h-8 w-8 text-neutral-700" />
          <p className="mt-3 text-sm font-medium text-neutral-300">
            El periodo todavía no tiene resultados
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Abre el periodo y finaliza evaluaciones para generar el consolidado.
          </p>
        </div>
      ) : (
        <>
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

          <p className="text-center text-[10px] leading-4 text-neutral-600">
            Administrativo: promedio de aspectos evaluados. Ministerial: el estándar obtiene su puntaje únicamente cuando todos sus aspectos cumplen o no aplican.
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
          ? "border-cyan-400 text-cyan-300"
          : "border-transparent text-neutral-500 hover:text-neutral-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
