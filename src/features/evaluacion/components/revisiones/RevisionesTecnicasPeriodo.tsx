import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

import AppButton from "../../../../components/ui/AppButton";
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
type FilterTone =
  | "danger"
  | "warning"
  | "info"
  | "success"
  | "neutral";

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

  const accionesPendientes =
    data?.resumen.accionesPendientes ?? 0;

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-[#090a0b] p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-white">
                {revisiones.length} revisión
                {revisiones.length === 1 ? "" : "es"}
              </p>

              {accionesPendientes > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/25 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold text-red-300">
                  <AlertTriangle size={12} />
                  {accionesPendientes} por atender
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              Selecciona un estado para filtrar.
            </p>
          </div>

          <AppButton
            size="sm"
            variant="secondary"
            loading={cargando}
            loadingLabel="Actualizando"
            leadingIcon={<RefreshCw size={14} />}
            onClick={() => void onReload()}
          >
            Actualizar
          </AppButton>
        </div>

        <div className="overflow-x-auto pb-1">
          <div className="flex min-w-max gap-2">
            <FilterChip
              icon={AlertTriangle}
              label="Corrección"
              value={data?.resumen.requierenAjustesActivos ?? 0}
              tone="danger"
              active={filtro === "REQUIERE_AJUSTES"}
              onClick={() => setFiltro("REQUIERE_AJUSTES")}
            />
            <FilterChip
              icon={Clock3}
              label="Pendientes"
              value={data?.resumen.pendientes ?? 0}
              tone="warning"
              active={filtro === "PENDIENTE"}
              onClick={() => setFiltro("PENDIENTE")}
            />
            <FilterChip
              icon={Wrench}
              label="En corrección"
              value={data?.resumen.enCorreccion ?? 0}
              tone="info"
              active={filtro === "EN_CORRECCION"}
              onClick={() => setFiltro("EN_CORRECCION")}
            />
            <FilterChip
              icon={CheckCircle2}
              label="Aprobadas"
              value={data?.resumen.aprobadas ?? 0}
              tone="success"
              active={filtro === "APROBADA"}
              onClick={() => setFiltro("APROBADA")}
            />
            <FilterChip
              icon={ShieldCheck}
              label="Subsanadas"
              value={data?.resumen.subsanadas ?? 0}
              tone="success"
              active={filtro === "SUBSANADA"}
              onClick={() => setFiltro("SUBSANADA")}
            />
            <FilterChip
              icon={Ban}
              label="Anuladas"
              value={data?.resumen.anuladas ?? 0}
              tone="neutral"
              active={filtro === "ANULADA"}
              onClick={() => setFiltro("ANULADA")}
            />
            <FilterChip
              icon={ShieldCheck}
              label="Todas"
              value={data?.resumen.total ?? 0}
              tone="neutral"
              active={filtro === "TODAS"}
              onClick={() => setFiltro("TODAS")}
            />
          </div>
        </div>

        {error && !seleccionada && (
          <AppAlert
            tone="error"
            title="No fue posible cargar las revisiones"
            description={error}
          />
        )}

        {cargando && !data ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-neutral-800 bg-[#090a0b]">
            <div className="flex items-center gap-3 text-neutral-500">
              <AppSpinner />
              <p className="text-xs">Cargando revisiones</p>
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
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#090a0b] px-5 py-12 text-center">
            <ShieldCheck className="mx-auto h-7 w-7 text-neutral-700" />
            <p className="mt-3 text-sm font-medium text-neutral-300">
              Sin revisiones en este estado
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

function FilterChip({
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
  tone: FilterTone;
  onClick: () => void;
}) {
  const activeClass: Record<FilterTone, string> = {
    danger: "border-red-500/35 bg-red-500/10 text-red-200",
    warning: "border-amber-500/30 bg-amber-500/10 text-amber-200",
    info: "border-cyan-500/30 bg-cyan-500/10 text-cyan-200",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-200",
    neutral: "border-neutral-600 bg-neutral-800 text-neutral-200",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition ${
        active
          ? activeClass[tone]
          : "border-neutral-800 bg-[#0b0c0d] text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
      }`}
    >
      <Icon size={13} />
      {label}
      <span className="rounded-full bg-black/20 px-1.5 py-0.5 text-[10px]">
        {value}
      </span>
    </button>
  );
}
