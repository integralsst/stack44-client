import {
  ChevronDown,
  ClipboardList,
  FileClock,
  LoaderCircle,
} from "lucide-react";

import type {
  HistorialPaginacion,
} from "../../types/detalle-aspecto.types";
import type { DetalleAspectoConTrazabilidad } from "../../types/trazabilidad-aspecto.types";
import AppAlert from "../feedback/AppAlert";
import CompromisoAspectoCard from "./CompromisoAspectoCard";
import HistorialEvaluacionCard from "./HistorialEvaluacionCard";
import TrazabilidadAspectoTimeline from "./TrazabilidadAspectoTimeline";

export default function HistorialAspectoTab({
  data,
  paginacion,
  loadingMore,
  onLoadMore,
  onOpenRevisionTecnica,
}: {
  data: DetalleAspectoConTrazabilidad;
  paginacion: HistorialPaginacion;
  loadingMore: boolean;
  onLoadMore: () => void;
  onOpenRevisionTecnica: () => void;
}) {
  if (
    data.trazabilidad.length === 0 &&
    data.historial.length === 0 &&
    data.compromisos.length === 0
  ) {
    return (
      <AppAlert
        tone="info"
        title="El aspecto todavía no tiene trazabilidad"
        description="Cuando se finalice una evaluación, se emita una decisión, se solicite una revisión técnica o se gestione un compromiso, el recorrido aparecerá aquí."
      />
    );
  }

  return (
    <div className="space-y-5">
      <TrazabilidadAspectoTimeline
        eventos={data.trazabilidad}
        puedeVerRevisionTecnica={
          data.permisos.puedeVerRevisionTecnica
        }
        onOpenRevisionTecnica={onOpenRevisionTecnica}
      />

      {paginacion.hayMas && (
        <div className="flex justify-center">
          <button
            type="button"
            disabled={loadingMore}
            onClick={onLoadMore}
            className="inline-flex min-w-44 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore && (
              <LoaderCircle
                size={15}
                className="animate-spin"
              />
            )}
            {loadingMore
              ? "Cargando…"
              : "Cargar recorrido anterior"}
          </button>
        </div>
      )}

      <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
              <FileClock size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-950">
                Registros de evaluación
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {data.historial.length} evaluación(es) cargada(s) · detalle de auditoría
              </p>
            </div>
          </div>
          <ChevronDown
            size={16}
            className="shrink-0 text-slate-500 transition group-open:rotate-180"
          />
        </summary>

        <div className="space-y-3 border-t border-slate-200 bg-slate-50/50 p-3 sm:p-4">
          {data.historial.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-sm text-slate-600">
              No hay evaluaciones registradas.
            </p>
          ) : (
            data.historial.map((item) => (
              <HistorialEvaluacionCard
                key={item.id}
                item={item}
              />
            ))
          )}
        </div>
      </details>

      <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700">
              <ClipboardList size={16} />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-950">
                Compromisos asociados
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {data.compromisos.length} compromiso(s) · actividades, recalificación y cierre
              </p>
            </div>
          </div>
          <ChevronDown
            size={16}
            className="shrink-0 text-slate-500 transition group-open:rotate-180"
          />
        </summary>

        <div className="space-y-3 border-t border-slate-200 bg-slate-50/50 p-3 sm:p-4">
          {data.compromisos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-7 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Este aspecto no tiene compromisos asociados.
              </p>
            </div>
          ) : (
            data.compromisos.map((compromiso) => (
              <CompromisoAspectoCard
                key={compromiso.id}
                compromiso={compromiso}
              />
            ))
          )}
        </div>
      </details>
    </div>
  );
}
