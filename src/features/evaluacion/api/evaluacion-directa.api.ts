import { apiRequest } from "../../../lib/api";
import type {
  ContextoEvaluacionResponse,
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

export function obtenerContextoEvaluacionDirecta(
  empresaId: string,
  anio: number,
  token: string
) {
  const params = new URLSearchParams({
    anio: String(anio),
  });

  return apiRequest<ContextoEvaluacionResponse>(
    `/api/evaluacion/empresas/${empresaId}/contexto-directo?${params.toString()}`,
    {},
    token
  );
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