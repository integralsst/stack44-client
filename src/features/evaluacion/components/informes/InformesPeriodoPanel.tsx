import {
  FilePlus2,
  History,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

import AppButton from "../../../../components/ui/AppButton";
import type {
  GenerarInformePeriodoInput,
  InformePeriodoDetalle,
  InformesPeriodoResponse,
} from "../../types/informe-periodo.types";
import AppAlert from "../feedback/AppAlert";
import AppSpinner from "../feedback/AppSpinner";
import DetalleInformeVersion from "./DetalleInformeVersion";
import GenerarInformeVersionForm from "./GenerarInformeVersionForm";
import VersionesInformePeriodo from "./VersionesInformePeriodo";

interface Props {
  anio: number;
  data: InformesPeriodoResponse | null;
  detalle: InformePeriodoDetalle | null;
  cargando: boolean;
  cargandoDetalle: boolean;
  procesando: boolean;
  error: string | null;
  puedeGenerar: boolean;
  onReload: () => Promise<void> | void;
  onGenerate: (
    input: GenerarInformePeriodoInput
  ) => Promise<boolean>;
  onOpen: (id: string) => Promise<void> | void;
  onCloseDetail: () => void;
}

type Vista = "GENERAR" | "VERSIONES";

export default function InformesPeriodoPanel({
  anio,
  data,
  detalle,
  cargando,
  cargandoDetalle,
  procesando,
  error,
  puedeGenerar,
  onReload,
  onGenerate,
  onOpen,
  onCloseDetail,
}: Props) {
  const [vista, setVista] = useState<Vista>("GENERAR");
  const [openingId, setOpeningId] = useState<string | null>(null);

  const abrir = async (id: string) => {
    setOpeningId(id);
    await onOpen(id);
    setOpeningId(null);
  };

  if (detalle) {
    return (
      <DetalleInformeVersion
        detalle={detalle}
        onBack={onCloseDetail}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-[#090a0b] p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 overflow-x-auto">
          {puedeGenerar && (
            <TabButton
              active={vista === "GENERAR"}
              icon={<FilePlus2 size={15} />}
              label="Nueva versión"
              onClick={() => setVista("GENERAR")}
            />
          )}
          <TabButton
            active={vista === "VERSIONES" || !puedeGenerar}
            icon={<History size={15} />}
            label={`Versiones${data?.versiones.length ? ` (${data.versiones.length})` : ""}`}
            onClick={() => setVista("VERSIONES")}
          />
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

      {error && (
        <AppAlert
          tone="error"
          title="No fue posible completar la operación"
          description={error}
        />
      )}

      {cargando && !data ? (
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-neutral-800 bg-[#090a0b]">
          <div className="flex flex-col items-center gap-3 text-neutral-500">
            <AppSpinner />
            <p className="text-xs">Cargando informes del periodo...</p>
          </div>
        </div>
      ) : !data?.periodo ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#090a0b] px-5 py-14 text-center">
          <History className="mx-auto h-8 w-8 text-neutral-700" />
          <p className="mt-3 text-sm font-medium text-neutral-300">
            El periodo {anio} todavía no existe
          </p>
          <p className="mt-1 text-xs text-neutral-600">
            Primero abre el periodo para poder generar fotografías de sus resultados.
          </p>
        </div>
      ) : puedeGenerar && vista === "GENERAR" ? (
        <GenerarInformeVersionForm
          anio={anio}
          categorias={data.categorias}
          procesando={procesando}
          onSubmit={onGenerate}
        />
      ) : (
        <VersionesInformePeriodo
          versiones={data.versiones}
          cargandoDetalle={cargandoDetalle}
          selectedId={openingId}
          onOpen={abrir}
        />
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
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
        active
          ? "border-cyan-500/35 bg-cyan-500/10 text-cyan-200"
          : "border-transparent text-neutral-500 hover:bg-white/5 hover:text-neutral-300"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
