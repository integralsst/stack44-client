import {
  ArrowLeft,
  Building2,
  CalendarClock,
  ClipboardCheck,
  Database,
  Layers3,
  UserRound,
} from "lucide-react";
import {
  useState,
  type ReactNode,
} from "react";

import AppButton from "../../../../components/ui/AppButton";
import type { InformePeriodoDetalle } from "../../types/informe-periodo.types";
import ResumenResultadosEmpresa from "../resultados/ResumenResultadosEmpresa";
import ResultadosEstandares from "../resultados/ResultadosEstandares";
import ResultadosProcesos from "../resultados/ResultadosProcesos";

interface Props {
  detalle: InformePeriodoDetalle;
  onBack: () => void;
}

type Vista = "EMPRESA" | "PROCESOS" | "ESTANDARES";

export default function DetalleInformeVersion({
  detalle,
  onBack,
}: Props) {
  const [vista, setVista] = useState<Vista>("EMPRESA");
  const resultado = detalle.snapshot.resultado;
  const resumen = resultado.resumenEmpresa;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-[#090a0b] p-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
              Versión {detalle.numeroVersion}
            </span>
            <span className="text-[11px] text-neutral-600">
              Fotografía inmutable
            </span>
          </div>
          <h3 className="mt-2 text-base font-semibold text-white">
            {detalle.titulo}
          </h3>
          {detalle.motivoVersion && (
            <p className="mt-2 max-w-4xl text-xs leading-5 text-neutral-400">
              {detalle.motivoVersion}
            </p>
          )}
        </div>

        <AppButton
          size="sm"
          variant="secondary"
          leadingIcon={<ArrowLeft size={14} />}
          onClick={onBack}
        >
          Volver a versiones
        </AppButton>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <InfoItem
          icon={<CalendarClock size={15} />}
          label="Fecha de corte"
          value={new Date(detalle.fechaCorte).toLocaleString("es-CO")}
        />
        <InfoItem
          icon={<UserRound size={15} />}
          label="Generado por"
          value={detalle.generadoPor.nombre}
        />
        <InfoItem
          icon={<Database size={15} />}
          label="Fuente"
          value={`${detalle.totalGestionesFuente} gestiones · ${detalle.totalEvaluacionesFuente} aspectos`}
        />
        <InfoItem
          icon={<Layers3 size={15} />}
          label="Registros históricos"
          value={`${detalle.registrosHistoricosPosteriores} posteriores al año`}
        />
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

      {!resumen ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#090a0b] px-5 py-14 text-center text-sm text-neutral-500">
          Esta versión no contiene resultados evaluables.
        </div>
      ) : (
        <>
          {vista === "EMPRESA" && (
            <ResumenResultadosEmpresa resumen={resumen} />
          )}
          {vista === "PROCESOS" && (
            <ResultadosProcesos procesos={resultado.procesos} />
          )}
          {vista === "ESTANDARES" && (
            <ResultadosEstandares estandares={resultado.estandares} />
          )}
        </>
      )}

      <p className="text-center text-[10px] leading-4 text-neutral-600">
        Esta fotografía no cambia cuando se incorporan nuevas tareas. Para reflejar actualizaciones del periodo se genera una versión posterior.
      </p>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#090a0b] p-3">
      <div className="flex items-center gap-2 text-neutral-500">
        {icon}
        <span className="text-[9px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 text-xs font-medium text-neutral-200">
        {value}
      </p>
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
