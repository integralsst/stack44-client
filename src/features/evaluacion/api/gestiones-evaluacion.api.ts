import { apiRequest } from "../../../lib/api";
import type {
  HistorialGestionesResponse,
  InvalidarGestionInput,
  InvalidarGestionResponse,
} from "../types/gestion-historial.types";

export function obtenerHistorialGestiones(
  periodoId: string,
  token: string
) {
  return apiRequest<HistorialGestionesResponse>(
    `/api/evaluacion/periodos/${periodoId}/gestiones`,
    {},
    token
  );
}

export function invalidarGestionEvaluacion(
  gestionId: string,
  data: InvalidarGestionInput,
  token: string
) {
  return apiRequest<InvalidarGestionResponse>(
    `/api/evaluacion/gestiones/${gestionId}/invalidar`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}
