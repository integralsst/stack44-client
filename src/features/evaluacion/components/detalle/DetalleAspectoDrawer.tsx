import {
  useEffect,
  useState,
} from "react";
import { createPortal } from "react-dom";
import {
  FileCheck2,
  History,
  Info,
  LayoutPanelTop,
  RefreshCw,
  ShieldCheck,
  X,
} from "lucide-react";

import { useDetalleAspecto } from "../../hooks/useDetalleAspecto";
import type {
  DetalleAspectoResponse,
  SeccionDetalleAspecto,
} from "../../types/detalle-aspecto.types";
import AppAlert from "../feedback/AppAlert";
import VigenciaBadge from "../matriz/VigenciaBadge";
import DetalleAspectoSkeleton from "./DetalleAspectoSkeleton";
import EvidenciasAspectoTab from "./EvidenciasAspectoTab";
import HistorialAspectoTab from "./HistorialAspectoTab";
import ResumenAspectoTab from "./ResumenAspectoTab";
import RevisionTecnicaAspectoTab from "./RevisionTecnicaAspectoTab";

type DetailTab =
  | "RESUMEN"
  | SeccionDetalleAspecto;

export default function DetalleAspectoDrawer({
  open,
  empresaId,
  tareaId,
  anio,
  onClose,
}: {
  open: boolean;
  empresaId: string | undefined;
  tareaId: number | null;
  anio: number;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<DetailTab>("RESUMEN");
  const {
    data,
    loading,
    busy,
    error,
    loadConfiguration,
    loadingConfiguration,
    configurationLoaded,
    configurationError,
    loadSection,
    loadMoreHistory,
    historyPagination,
    loadingSections,
    loadedSections,
    sectionErrors,
    createEvidence,
    updateEvidence,
    removeEvidence,
  } = useDetalleAspecto({
    open,
    empresaId,
    tareaId,
    anio,
  });

  useEffect(() => {
    if (open) {
      setTab("RESUMEN");
    }
  }, [open, tareaId]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [busy, onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const title =
    data?.tarea.aspecto.nombre ?? "Detalle del aspecto";
  const deferredTab = tab === "RESUMEN" ? null : tab;
  const sectionLoading = deferredTab
    ? loadingSections[deferredTab]
    : false;
  const sectionLoaded = deferredTab
    ? loadedSections[deferredTab]
    : true;
  const sectionError = deferredTab
    ? sectionErrors[deferredTab]
    : null;

  const activateTab = (nextTab: DetailTab) => {
    setTab(nextTab);

    if (nextTab !== "RESUMEN") {
      void loadSection(nextTab);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-slate-950/35 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="detalle-aspecto-title"
    >
      <button
        type="button"
        aria-label="Cerrar detalle"
        onClick={() => {
          if (!busy) onClose();
        }}
        className="absolute inset-0 cursor-default"
      />

      <section className="relative z-10 flex h-[100dvh] w-full max-w-[900px] flex-col overflow-hidden border-l border-slate-200 bg-white shadow-[-24px_0_70px_rgba(15,23,42,0.18)]">
        <header className="shrink-0 border-b border-slate-200 bg-white/95 px-4 pb-0 pt-4 backdrop-blur-xl sm:px-6 sm:pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-cyan-800">
                  Evaluación SG-SST
                </span>
                {data && (
                  <span className="text-[10px] text-slate-500">
                    Orden {data.tarea.orden} · Periodo {data.periodo.anio}
                  </span>
                )}
              </div>
              <h2
                id="detalle-aspecto-title"
                className="mt-2 line-clamp-2 text-lg font-bold leading-7 text-slate-950 sm:text-xl"
                title={title}
              >
                {title}
              </h2>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                Consulta la configuración maestra, el historial de la empresa y los soportes asociados.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600 transition hover:border-slate-300 hover:text-slate-950 disabled:opacity-40"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          <nav className="mt-4 flex gap-1 overflow-x-auto" aria-label="Secciones del detalle">
            <TabButton
              active={tab === "RESUMEN"}
              icon={LayoutPanelTop}
              label="Resumen"
              loading={loadingConfiguration}
              onClick={() => activateTab("RESUMEN")}
            />
            <TabButton
              active={tab === "HISTORIAL"}
              icon={History}
              label={`Historial${
                loadedSections.HISTORIAL
                  ? ` (${
                      (data?.historial.length ?? 0) +
                      (data?.compromisos.length ?? 0)
                    })`
                  : ""
              }`}
              loading={loadingSections.HISTORIAL}
              onClick={() => activateTab("HISTORIAL")}
            />
            <TabButton
              active={tab === "EVIDENCIAS"}
              icon={FileCheck2}
              label={`Evidencias${
                loadedSections.EVIDENCIAS
                  ? ` (${(data?.evidencias.length ?? 0) + (data?.evidenciasCompromiso.length ?? 0)})`
                  : ""
              }`}
              loading={loadingSections.EVIDENCIAS}
              onClick={() => activateTab("EVIDENCIAS")}
            />
            {data?.permisos.puedeVerRevisionTecnica && (
              <TabButton
                active={tab === "REVISION_TECNICA"}
                icon={ShieldCheck}
                label={`Revisión técnica${
                  loadedSections.REVISION_TECNICA
                    ? ` (${data.revisionesTecnicas.length})`
                    : ""
                }`}
                loading={loadingSections.REVISION_TECNICA}
                onClick={() =>
                  activateTab("REVISION_TECNICA")
                }
              />
            )}
          </nav>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
          {loading && !data ? (
            <DetalleAspectoSkeleton />
          ) : error && !data ? (
            <AppAlert
              tone="error"
              title="No fue posible cargar el detalle"
              description={error}
            />
          ) : data ? (
            <>
              {error && (
                <div className="mb-4">
                  <AppAlert
                    tone="error"
                    title="No fue posible completar la operación"
                    description={error}
                  />
                </div>
              )}

              {tab === "RESUMEN" &&
                (configurationLoaded ? (
                  <ResumenAspectoTab data={data} />
                ) : (
                  <ResumenRapido
                    data={data}
                    loading={loadingConfiguration}
                    error={configurationError}
                    onRetry={() =>
                      void loadConfiguration()
                    }
                  />
                ))}

              {deferredTab &&
                sectionLoading &&
                !sectionLoaded && (
                  <SectionSkeleton />
                )}

              {deferredTab &&
                sectionError &&
                !sectionLoading &&
                !sectionLoaded && (
                  <AppAlert
                    tone="error"
                    title="No fue posible cargar esta sección"
                    description={sectionError}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        void loadSection(
                          deferredTab,
                          true
                        )
                      }
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
                    >
                      <RefreshCw size={15} />
                      Reintentar
                    </button>
                  </AppAlert>
                )}

              {deferredTab &&
                sectionError &&
                sectionLoaded && (
                  <div className="mb-4">
                    <AppAlert
                      tone="error"
                      title="No fue posible completar la carga"
                      description={sectionError}
                    />
                  </div>
                )}

              {tab === "HISTORIAL" &&
                sectionLoaded && (
                  <HistorialAspectoTab
                    data={data}
                    paginacion={historyPagination}
                    loadingMore={loadingSections.HISTORIAL}
                    onLoadMore={() =>
                      void loadMoreHistory()
                    }
                  />
                )}
              {tab === "EVIDENCIAS" &&
                sectionLoaded &&
                !sectionError &&
                (configurationLoaded ? (
                  <EvidenciasAspectoTab
                    data={data}
                    busy={busy}
                    onCreate={createEvidence}
                    onUpdate={updateEvidence}
                    onRemove={removeEvidence}
                  />
                ) : (
                  <SectionSkeleton />
                ))}
              {tab === "REVISION_TECNICA" &&
                sectionLoaded &&
                !sectionError &&
                data.permisos.puedeVerRevisionTecnica && (
                  <RevisionTecnicaAspectoTab data={data} />
                )}
            </>
          ) : (
            <div className="flex min-h-[40vh] items-center justify-center text-center">
              <div>
                <Info className="mx-auto h-8 w-8 text-slate-400" />
                <p className="mt-3 text-sm text-slate-600">
                  No hay información para mostrar.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>,
    document.body
  );
}

function ResumenRapido({
  data,
  loading,
  error,
  onRetry,
}: {
  data: DetalleAspectoResponse;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}) {
  const gestiones =
    data.tarea.categoriasGestion
      .map((item) => item.nombre)
      .join(", ") || "Sin categoría";

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-700">
          Estado actual del aspecto
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-7 text-slate-950">
              {data.tarea.aspecto.nombre}
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Proceso: <strong className="text-slate-800">{data.tarea.proceso.nombre}</strong>
            </p>
          </div>
          <div className="shrink-0">
            <VigenciaBadge detalle={data.detalleVigencia} />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickFact label="Orden" value={String(data.tarea.orden)} />
          <QuickFact
            label="Código"
            value={
              data.tarea.codigo ??
              data.tarea.aspecto.codigo ??
              `#${data.tarea.id}`
            }
          />
          <QuickFact
            label="Versión"
            value={data.tarea.versionSupermatriz.nombre}
          />
          <QuickFact label="Gestiones" value={gestiones} />
        </div>
      </section>

      {error ? (
        <AppAlert
          tone="error"
          title="No fue posible cargar la configuración ampliada"
          description={error}
        >
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-700"
          >
            <RefreshCw size={15} />
            Reintentar
          </button>
        </AppAlert>
      ) : (
        <div className="space-y-3" aria-busy={loading}>
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <RefreshCw
              size={14}
              className={loading ? "animate-spin" : undefined}
            />
            Cargando configuración de la Supermatriz…
          </div>
          <SectionSkeleton />
        </div>
      )}
    </div>
  );
}

function QuickFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function SectionSkeleton() {
  return (
    <div
      className="space-y-3"
      aria-label="Cargando sección"
      aria-busy="true"
    >
      <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
      <div className="h-32 animate-pulse rounded-2xl bg-slate-100" />
    </div>
  );
}

function TabButton({
  active,
  icon: Icon,
  label,
  loading = false,
  onClick,
}: {
  active: boolean;
  icon: typeof LayoutPanelTop;
  label: string;
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition ${
        active
          ? "border-cyan-400 text-cyan-800"
          : "border-transparent text-slate-500 hover:text-slate-900"
      }`}
    >
      <Icon
        size={14}
        className={loading ? "animate-pulse" : undefined}
      />
      {label}
    </button>
  );
}
