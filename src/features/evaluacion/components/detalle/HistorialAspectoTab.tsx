import type { DetalleAspectoResponse } from "../../types/detalle-aspecto.types";
import AppAlert from "../feedback/AppAlert";
import HistorialEvaluacionCard from "./HistorialEvaluacionCard";

export default function HistorialAspectoTab({
  data,
}: {
  data: DetalleAspectoResponse;
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
      <p className="text-xs leading-5 text-neutral-500">
        Se muestran hasta 100 evaluaciones de este aspecto para la
        empresa, incluyendo versiones anteriores con el mismo código.
        Las gestiones invalidadas permanecen visibles para auditoría,
        pero no participan en el estado vigente ni en los cálculos.
      </p>

      {data.historial.map((item) => (
        <HistorialEvaluacionCard key={item.id} item={item} />
      ))}
    </div>
  );
}
