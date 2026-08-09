import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

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
  initialFilter?: EstadoFlujoRevisionTecnica;
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
  initialFilter,
  onReload,
  onResolve,
  onCorregir,
  onResolved,
}: Props) {
  const [filtro, setFiltro] = useState<Filtro>(
    initialFilter ?? "REQUIERE_AJUSTES"
  );
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
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">
                {revisiones.length} revisión
                {revisiones.length === 1 ? "" : "es"}
              </p>

              {accionesPendientes > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-bold text-red-700">
                  <AlertTriangle size={12} />
                  {accionesPendientes} por atender
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">
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
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 text-slate-500">
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
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-12 text-center">
            <ShieldCheck className="mx-auto h-7 w-7 text-slate-400" />
            <p className="mt-3 text-sm font-medium text-slate-700">
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
    danger: "border-red-300 bg-red-50 text-red-800",
    warning: "border-amber-300 bg-amber-50 text-amber-900",
    info: "border-cyan-300 bg-cyan-50 text-cyan-800",
    success: "border-emerald-300 bg-emerald-50 text-emerald-800",
    neutral: "border-slate-300 bg-slate-100 text-slate-700",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`inline-flex min-h-9 items-center gap-2 rounded-full border px-3 text-xs font-semibold transition ${
        active
          ? activeClass[tone]
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <Icon size={13} />
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
          active ? "bg-white/70" : "bg-slate-100"
        }`}
      >
        {value}
      </span>
    </button>
  );
}
