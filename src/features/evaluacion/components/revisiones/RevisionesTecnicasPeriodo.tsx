import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  EstadoRevisionTecnica,
  ResolverRevisionTecnicaInput,
  RevisionTecnicaEvaluacionItem,
  RevisionesTecnicasPeriodoResponse,
} from "../../types/revision-tecnica.types";
import AppAlert from "../feedback/AppAlert";
import AppSpinner from "../feedback/AppSpinner";
import AppToast from "../feedback/AppToast";
import ResolverRevisionTecnicaModal from "./ResolverRevisionTecnicaModal";
import RevisionTecnicaCard from "./RevisionTecnicaCard";

interface Props {
  data: RevisionesTecnicasPeriodoResponse | null;
  cargando: boolean;
  procesando: boolean;
  error: string | null;
  onReload: () => Promise<void> | void;
  onResolve: (
    revisionId: string,
    input: ResolverRevisionTecnicaInput
  ) => Promise<{ mensaje: string }>;
  onResolved?: () => Promise<void> | void;
}

type Filtro = "TODAS" | EstadoRevisionTecnica;

export default function RevisionesTecnicasPeriodo({
  data,
  cargando,
  procesando,
  error,
  onReload,
  onResolve,
  onResolved,
}: Props) {
  const [filtro, setFiltro] = useState<Filtro>("PENDIENTE");
  const [seleccionada, setSeleccionada] =
    useState<RevisionTecnicaEvaluacionItem | null>(null);
  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const revisiones = useMemo(() => {
    const items = data?.revisiones ?? [];
    return filtro === "TODAS"
      ? items
      : items.filter((item) => item.estado === filtro);
  }, [data?.revisiones, filtro]);

  const resolver = async (
    input: ResolverRevisionTecnicaInput
  ) => {
    if (!seleccionada) return;

    const response = await onResolve(
      seleccionada.id,
      input
    );
    setSeleccionada(null);
    await onResolved?.();
    setToast({
      title:
        input.estado === "APROBADA"
          ? "Revisión aprobada"
          : "Ajustes requeridos",
      description: response.mensaje,
    });
  };

  return (
    <>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Clock3}
            label="Pendientes"
            value={data?.resumen.pendientes ?? 0}
            active={filtro === "PENDIENTE"}
            onClick={() => setFiltro("PENDIENTE")}
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Aprobadas"
            value={data?.resumen.aprobadas ?? 0}
            active={filtro === "APROBADA"}
            onClick={() => setFiltro("APROBADA")}
          />
          <SummaryCard
            icon={Wrench}
            label="Requieren ajustes"
            value={data?.resumen.requierenAjustes ?? 0}
            active={filtro === "REQUIERE_AJUSTES"}
            onClick={() => setFiltro("REQUIERE_AJUSTES")}
          />
          <SummaryCard
            icon={ShieldCheck}
            label="Todas"
            value={data?.resumen.total ?? 0}
            active={filtro === "TODAS"}
            onClick={() => setFiltro("TODAS")}
          />
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-[#090a0b] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-white">
              {revisiones.length} revisión(es) en esta vista
            </p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Una revisión pendiente no bloquea la vigencia. Cuando requiere ajustes, la corrección se registra mediante una nueva gestión.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void onReload()}
            disabled={cargando}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-[#111213] px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-cyan-500/40 hover:text-cyan-200 disabled:opacity-40 sm:w-auto"
          >
            {cargando ? <AppSpinner size="sm" /> : <RefreshCw size={15} />}
            Actualizar
          </button>
        </div>

        {error && !seleccionada && (
          <AppAlert
            tone="error"
            title="No fue posible cargar las revisiones"
            description={error}
          />
        )}

        {cargando && !data ? (
          <div className="flex min-h-56 items-center justify-center rounded-2xl border border-neutral-800 bg-[#090a0b]">
            <div className="flex flex-col items-center gap-3 text-neutral-500">
              <AppSpinner />
              <p className="text-xs">Consultando revisiones técnicas...</p>
            </div>
          </div>
        ) : revisiones.length > 0 ? (
          <div className="space-y-3">
            {revisiones.map((revision) => (
              <RevisionTecnicaCard
                key={revision.id}
                revision={revision}
                onResolver={setSeleccionada}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#090a0b] px-5 py-14 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-neutral-700" />
            <p className="mt-3 text-sm font-medium text-neutral-300">
              No hay revisiones en este estado
            </p>
            <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-neutral-600">
              Las solicitudes se crean al finalizar una gestión que tenga evaluaciones marcadas para revisión técnica.
            </p>
          </div>
        )}
      </div>

      <ResolverRevisionTecnicaModal
        open={seleccionada !== null}
        revision={seleccionada}
        busy={procesando}
        error={error}
        onClose={() => {
          if (!procesando) setSeleccionada(null);
        }}
        onSubmit={resolver}
      />

      <AppToast
        open={toast !== null}
        tone="success"
        title={toast?.title ?? ""}
        description={toast?.description}
        duration={6000}
        onClose={() => setToast(null)}
      />
    </>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: typeof Clock3;
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? "border-cyan-500/35 bg-cyan-500/10"
          : "border-neutral-800 bg-[#090a0b] hover:border-neutral-700"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <Icon className="h-5 w-5 text-cyan-400" />
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="mt-3 text-xs font-medium text-neutral-400">{label}</p>
    </button>
  );
}
