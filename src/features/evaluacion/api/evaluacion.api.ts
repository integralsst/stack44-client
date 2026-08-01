import { apiRequest } from "../../../lib/api";
import type {
  ContextoEvaluacionResponse,
  CrearGestionInput,
  GuardarEvaluacionInput,
} from "../types/evaluacion.types";

export function obtenerContextoEvaluacion(
  empresaId: string,
  anio: number,
  token: string
) {
  return apiRequest<ContextoEvaluacionResponse>(
    `/api/evaluacion/empresas/${empresaId}/contexto?anio=${anio}`,
    {},
    token
  );
}

export function abrirPeriodoEvaluacion(
  empresaId: string,
  anio: number,
  token: string
) {
  return apiRequest(
    `/api/evaluacion/empresas/${empresaId}/periodos`,
    {
      method: "POST",
      body: JSON.stringify({ anio }),
    },
    token
  );
}

export function crearGestionEvaluacion(
  periodoId: string,
  data: CrearGestionInput,
  token: string
) {
  return apiRequest(
    `/api/evaluacion/periodos/${periodoId}/gestiones`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export function guardarEvaluaciones(
  gestionId: string,
  evaluaciones: GuardarEvaluacionInput[],
  token: string
) {
  return apiRequest(
    `/api/evaluacion/gestiones/${gestionId}/evaluaciones`,
    {
      method: "PUT",
      body: JSON.stringify({ evaluaciones }),
    },
    token
  );
}

export function finalizarGestionEvaluacion(
  gestionId: string,
  token: string
) {
  return apiRequest(
    `/api/evaluacion/gestiones/${gestionId}/finalizar`,
    {
      method: "POST",
    },
    token
  );
}
