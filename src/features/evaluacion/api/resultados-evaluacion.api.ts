import { apiRequest } from "../../../lib/api";
import type {
  GrupoResultadosEvaluacion,
  ResultadosEvaluacionResponse,
} from "../types/resultados-evaluacion.types";

export function obtenerResultadosEvaluacion(
  empresaId: string,
  anio: number,
  grupo: GrupoResultadosEvaluacion,
  token: string
) {
  const params = new URLSearchParams({
    anio: String(anio),
    grupo,
  });

  return apiRequest<ResultadosEvaluacionResponse>(
    `/api/evaluacion/empresas/${empresaId}/resultados?${params.toString()}`,
    {},
    token
  );
}
