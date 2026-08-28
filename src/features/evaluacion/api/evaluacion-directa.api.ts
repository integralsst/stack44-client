import { apiRequest } from "../../../lib/api";
import type {
  GuardarEvaluacionInput,
} from "../../../types/evaluacion.types";

export interface GuardarEvaluacionesDirectasResponse {
  total: number;
  fechaEvaluacion: string;
  versionSupermatriz: {
    id: number;
    nombre: string;
  };
  evaluaciones: Array<{
    id: string;
    gestionId: string;
    aspectoId: number;
  }>;
}

export function guardarEvaluacionesDirectas(
  empresaId: string,
  anio: number,
  evaluaciones: GuardarEvaluacionInput[],
  token: string
) {
  return apiRequest<GuardarEvaluacionesDirectasResponse>(
    `/api/evaluacion/empresas/${empresaId}/evaluaciones-directas`,
    {
      method: "POST",
      body: JSON.stringify({
        anio,
        evaluaciones,
      }),
    },
    token
  );
}
