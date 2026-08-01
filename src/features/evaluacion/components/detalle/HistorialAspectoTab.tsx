import type { DetalleAspectoResponse } from "../../types/detalle-aspecto.types";
import { EmptyState } from "./DetalleAspectoUi";
import HistorialEvaluacionCard from "./HistorialEvaluacionCard";

export default function HistorialAspectoTab({
  data,
}: {
  data: DetalleAspectoResponse;
}) {
  if (data.historial.length === 0) {
    return (
      <EmptyState
        title="El aspecto todavía no tiene historial"
        description="Cuando una gestión sea finalizada, su evaluación aparecerá aquí sin reemplazar las evaluaciones anteriores."
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-neutral-800 bg-[#090a0b] px-4 py-3 text-xs leading-5 text-neutral-500">
        Se muestran hasta 100 evaluaciones finalizadas de esta empresa, incluyendo versiones anteriores del mismo código de aspecto.
      </div>
      {data.historial.map((item) => (
        <HistorialEvaluacionCard key={item.id} item={item} />
      ))}
    </div>
  );
}
