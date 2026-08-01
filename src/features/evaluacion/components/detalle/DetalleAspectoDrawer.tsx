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
  X,
} from "lucide-react";

import { useDetalleAspecto } from "../../hooks/useDetalleAspecto";
import AppAlert from "../feedback/AppAlert";
import DetalleAspectoSkeleton from "./DetalleAspectoSkeleton";
import EvidenciasAspectoTab from "./EvidenciasAspectoTab";
import HistorialAspectoTab from "./HistorialAspectoTab";
import ResumenAspectoTab from "./ResumenAspectoTab";

type DetailTab = "RESUMEN" | "HISTORIAL" | "EVIDENCIAS";

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

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex justify-end bg-black/70 backdrop-blur-sm"
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

      <section className="relative z-10 flex h-[100dvh] w-full max-w-[900px] flex-col overflow-hidden border-l border-neutral-800 bg-[#0c0d0e] shadow-[-35px_0_100px_rgba(0,0,0,0.65)]">
        <header className="shrink-0 border-b border-neutral-800 bg-[#0c0d0e]/95 px-4 pb-0 pt-4 backdrop-blur-xl sm:px-6 sm:pt-5">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-cyan-300">
                  Evaluación SG-SST
                </span>
                {data && (
                  <span className="text-[10px] text-neutral-600">
                    Orden {data.tarea.orden} · Periodo {data.periodo.anio}
                  </span>
                )}
              </div>
              <h2
                id="detalle-aspecto-title"
                className="mt-2 line-clamp-2 text-lg font-bold leading-7 text-white sm:text-xl"
                title={title}
              >
                {title}
              </h2>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Consulta la configuración maestra, el historial de la empresa y los soportes asociados.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-[#151617] text-neutral-400 transition hover:border-neutral-700 hover:text-white disabled:opacity-40"
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
              onClick={() => setTab("RESUMEN")}
            />
            <TabButton
              active={tab === "HISTORIAL"}
              icon={History}
              label={`Historial${data ? ` (${data.historial.length})` : ""}`}
              onClick={() => setTab("HISTORIAL")}
            />
            <TabButton
              active={tab === "EVIDENCIAS"}
              icon={FileCheck2}
              label={`Evidencias${data ? ` (${data.evidencias.length})` : ""}`}
              onClick={() => setTab("EVIDENCIAS")}
            />
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

              {tab === "RESUMEN" && (
                <ResumenAspectoTab data={data} />
              )}
              {tab === "HISTORIAL" && (
                <HistorialAspectoTab data={data} />
              )}
              {tab === "EVIDENCIAS" && (
                <EvidenciasAspectoTab
                  data={data}
                  busy={busy}
                  onCreate={createEvidence}
                  onUpdate={updateEvidence}
                  onRemove={removeEvidence}
                />
              )}
            </>
          ) : (
            <div className="flex min-h-[40vh] items-center justify-center text-center">
              <div>
                <Info className="mx-auto h-8 w-8 text-neutral-700" />
                <p className="mt-3 text-sm text-neutral-500">
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

function TabButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof LayoutPanelTop;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold transition ${
        active
          ? "border-cyan-400 text-cyan-300"
          : "border-transparent text-neutral-500 hover:text-neutral-300"
      }`}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}
