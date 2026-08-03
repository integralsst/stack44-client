import { LoaderCircle } from "lucide-react";

import type {
  DetalleAspectoResponse,
  HistorialPaginacion,
} from "../../types/detalle-aspecto.types";
import AppAlert from "../feedback/AppAlert";
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
  if (data.historial.length === 0) {
    return (
      <AppAlert
        tone="info"
        title="El aspecto todavía no tiene historial"
        description="Cuando una gestión sea finalizada, su evaluación aparecerá aquí sin reemplazar las evaluaciones anteriores."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 text-neutral-500">
          Se muestran las evaluaciones más recientes en bloques de {paginacion.limite}. Las gestiones invalidadas permanecen visibles para auditoría, pero no participan en el estado vigente.
        </p>
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-neutral-600">
          {data.historial.length} cargada(s)
        </span>
      </div>

      {data.historial.map((item) => (
        <HistorialEvaluacionCard key={item.id} item={item} />
      ))}

      {paginacion.hayMas && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={loadingMore}
            onClick={onLoadMore}
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-[#111213] px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-neutral-600 hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingMore && (
              <LoaderCircle size={15} className="animate-spin" />
            )}
            {loadingMore ? "Cargando…" : "Cargar más"}
          </button>
        </div>
      )}
    </div>
  );
}
