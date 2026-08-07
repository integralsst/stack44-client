import { LoaderCircle } from "lucide-react";

import type {
  DetalleAspectoResponse,
  HistorialPaginacion,
} from "../../types/detalle-aspecto.types";
import AppAlert from "../feedback/AppAlert";
import CompromisoAspectoCard from "./CompromisoAspectoCard";
import HistorialEvaluacionCard from "./HistorialEvaluacionCard";

export default function HistorialAspectoTab({
  data,
  paginacion,
  loadingMore,
  onLoadMore,
}: {
  data: DetalleAspectoResponse;
  paginacion: HistorialPaginacion;
  loadingMore: boolean;
  onLoadMore: () => void;
}) {
  if (
    data.historial.length === 0 &&
    data.compromisos.length === 0
  ) {
    return (
      <AppAlert
        tone="info"
        title="El aspecto todavía no tiene historial"
        description="Cuando se finalice una evaluación o se gestione un compromiso, el recorrido aparecerá aquí sin reemplazar la información anterior."
      />
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="mb-3 rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
          <h3 className="text-sm font-bold text-cyan-950">
            Compromisos y cierre
          </h3>
          <p className="mt-1 text-xs leading-5 text-cyan-800">
            Aquí puedes comprobar qué originó el compromiso, quién completó las actividades, cuándo se recalificó y quién aprobó el cierre.
          </p>
        </div>

        {data.compromisos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
            <p className="text-sm font-semibold text-slate-700">
              Este aspecto no tiene compromisos asociados.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {data.compromisos.map((compromiso) => (
              <CompromisoAspectoCard
                key={compromiso.id}
                compromiso={compromiso}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-950">
              Evaluaciones registradas
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Las gestiones invalidadas permanecen visibles para auditoría, pero no participan en el estado vigente.
            </p>
          </div>
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
            {data.historial.length} cargada(s)
          </span>
        </div>

        {data.historial.length === 0 ? (
          <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            No hay evaluaciones registradas.
          </p>
        ) : (
          <div className="space-y-3">
            {data.historial.map((item) => (
              <HistorialEvaluacionCard
                key={item.id}
                item={item}
              />
            ))}
          </div>
        )}

        {paginacion.hayMas && (
          <div className="flex justify-center pt-4">
            <button
              type="button"
              disabled={loadingMore}
              onClick={onLoadMore}
              className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-cyan-300 hover:bg-cyan-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loadingMore && (
                <LoaderCircle
                  size={15}
                  className="animate-spin"
                />
              )}
              {loadingMore ? "Cargando…" : "Cargar más"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
