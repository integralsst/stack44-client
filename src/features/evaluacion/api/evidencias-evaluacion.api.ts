import { apiRequest } from "../../../lib/api";
import type {
  EvidenciaEvaluacion,
  EvidenciaEvaluacionFormInput,
} from "../types/evidencia-evaluacion.types";

export function crearEvidenciaEvaluacion(
  evaluacionId: string,
  data: EvidenciaEvaluacionFormInput,
  token: string
) {
  return apiRequest<EvidenciaEvaluacion>(
    `/api/evaluacion/evaluaciones/${evaluacionId}/evidencias`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export function actualizarEvidenciaEvaluacion(
  evidenciaId: string,
  data: EvidenciaEvaluacionFormInput,
  token: string
) {
  return apiRequest<EvidenciaEvaluacion>(
    `/api/evaluacion/evidencias/${evidenciaId}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
    },
    token
  );
}

export function desactivarEvidenciaEvaluacion(
  evidenciaId: string,
  token: string
) {
  return apiRequest<{
    id: string;
    activo: boolean;
  }>(
    `/api/evaluacion/evidencias/${evidenciaId}`,
    {
      method: "DELETE",
    },
    token
  );
}
