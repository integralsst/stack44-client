import { apiRequest } from "../../../lib/api";
import type { DetalleAspectoResponse } from "../types/detalle-aspecto.types";

export function obtenerDetalleAspecto(
  empresaId: string,
  tareaId: number,
  anio: number,
  token: string
) {
  return apiRequest<DetalleAspectoResponse>(
    `/api/evaluacion/empresas/${empresaId}/tareas/${tareaId}/detalle?anio=${anio}`,
    {},
    token
  );
}
