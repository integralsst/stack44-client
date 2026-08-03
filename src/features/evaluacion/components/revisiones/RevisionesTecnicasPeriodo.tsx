import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  EstadoFlujoRevisionTecnica,
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
  onCorregir: (revision: RevisionTecnicaEvaluacionItem) => void;
  onResolved?: () => Promise<void> | void;
}

type Filtro = "TODAS" | EstadoFlujoRevisionTecnica;

export default function RevisionesTecnicasPeriodo({
  data,
  cargando,
  procesando,
  error,
  onReload,
  onResolve,
  onCorregir,
  onResolved,
}: Props) {
  const [filtro, setFiltro] = useState<Filtro>("REQUIERE_AJUSTES");
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
      : items.filter((item) => item.estadoFlujo === filtro);
  }, [data?.revisiones, filtro]);

  const resolver = async (
    input: ResolverRevisionTecnicaInput
  ) => {
    if (!seleccionada) return;

    const response = await onResolve(seleccionada.id, input);
    setSeleccionada(null);
    await onResolved?.();
    setToast({
      title:
        input.estado === "APROBADA"
          ? "Revisión aprobada"
          : "Corrección requerida",
      description: response.mensaje,
    });
  };

  return (
    <>
      <div className="space-y-4">
        {(data?.resumen.requierenAjustesActivos ?? 0) > 0 && (
          <div className="revision-alert-pulse flex flex-col gap-3 rounded-2xl border border-red-500/35 bg-red-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
              <div>
                <p className="text-sm font-bold text-red-100">
                  Hay {data?.resumen.requierenAjustesActivos} evaluación(es) que requieren corrección
                </p>
                <p className="mt-1 text-xs leading-5 text-red-200/75">
                  Abre el concepto técnico y registra una nueva evaluación desde el botón Corregir evaluación.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <SummaryCard
            icon={AlertTriangle}
            label="Requieren corrección"
            value={data?.resumen.requierenAjustesActivos ?? 0}
            tone="danger"
            active={filtro === "REQUIERE_AJUSTES"}
            onClick={() => setFiltro("REQUIERE_AJUSTES")}
          />
          <SummaryCard
            icon={Clock3}
            label="Pendientes"
            value={data?.resumen.pendientes ?? 0}
            tone="warning"
            active={filtro === "PENDIENTE"}
            onClick={() => setFiltro("PENDIENTE")}
          />
          <SummaryCard
            icon={Wrench}
            label="En corrección"
            value={data?.resumen.enCorreccion ?? 0}
            tone="info"
            active={filtro === "EN_CORRECCION"}
            onClick={() => setFiltro("EN_CORRECCION")}
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Subsanadas"
            value={data?.resumen.subsanadas ?? 0}
            tone="success"
            active={filtro === "SUBSANADA"}
            onClick={() => setFiltro("SUBSANADA")}
          />
          <SummaryCard
            icon={ShieldCheck}
            label="Todas"
            value={data?.resumen.total ?? 0}
            tone="neutral"
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
              La evaluación original no se modifica. La corrección se registra en una nueva gestión y deja de ser alerta activa cuando existe una evaluación posterior finalizada y válida.
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
                onCorregir={onCorregir}
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
              Las revisiones subsanadas permanecen en la trazabilidad, pero ya no aparecen como acciones pendientes.
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
  tone,
  onClick,
}: {
  icon: typeof Clock3;
  label: string;
  value: number;
  active: boolean;
  tone: "danger" | "warning" | "info" | "success" | "neutral";
  onClick: () => void;
}) {
  const toneClass = {
    danger: "border-red-500/35 bg-red-500/10 text-red-300",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    success: "border-teal-500/30 bg-teal-500/10 text-teal-300",
    neutral: "border-neutral-700 bg-neutral-800/50 text-neutral-300",
  }[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition ${
        active
          ? toneClass
          : "border-neutral-800 bg-[#090a0b] text-neutral-500 hover:border-neutral-700"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <Icon className="h-5 w-5 text-current" />
        <span className="text-2xl font-bold text-white">{value}</span>
      </div>
      <p className="mt-3 text-xs font-medium">{label}</p>
    </button>
  );
}
