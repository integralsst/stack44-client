import { apiRequest } from "../../../lib/api";
import type {
  FinalizacionGestionResponse,
  FinalizarGestionInput,
  PreparacionFinalizacionResponse,
} from "../types/compromiso.types";

export function obtenerPreparacionFinalizacion(
  gestionId: string,
  token: string
) {
  return apiRequest<PreparacionFinalizacionResponse>(
    `/api/evaluacion/gestiones/${gestionId}/preparacion-finalizacion`,
    {},
    token
  );
}

export function finalizarGestionConCompromisos(
  gestionId: string,
  data: FinalizarGestionInput,
  token: string
) {
  return apiRequest<FinalizacionGestionResponse>(
    `/api/evaluacion/gestiones/${gestionId}/finalizar`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}
