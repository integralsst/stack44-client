import { apiRequest } from "../../../lib/api";
import type {
  ContextoEvaluacionResponse,
  CrearGestionInput,
  GuardarEvaluacionInput,
} from "../../../types/evaluacion.types";

function aplicarResultadoEfectivoEnVista(
  contexto: ContextoEvaluacionResponse
): ContextoEvaluacionResponse {
  return {
    ...contexto,
    filas: contexto.filas.map((fila) => ({
      ...fila,
      // La matriz es una vista operativa: para la última evaluación
      // finalizada debe mostrar el resultado efectivo ya resuelto por
      // backend (No aplica 3/5/0, aprobación de gestión, etc.), no la
      // nota base registrada que se conserva únicamente para auditoría.
      ultimaEvaluacion: fila.ultimaEvaluacion
        ? {
            ...fila.ultimaEvaluacion,
            calificacionAdministrativa:
              fila.ultimaEvaluacion.calificacionEfectiva ??
              fila.ultimaEvaluacion.calificacionAdministrativa,
          }
        : null,
    })),
  };
}

export async function obtenerContextoEvaluacion(
  empresaId: string,
  anio: number,
  token: string,
  gestionId?: string | null
) {
  const params = new URLSearchParams({
    anio: String(anio),
  });

  if (gestionId) {
    params.set("gestionId", gestionId);
  }

  const contexto = await apiRequest<ContextoEvaluacionResponse>(
    `/api/evaluacion/empresas/${empresaId}/contexto?${params.toString()}`,
    {},
    token
  );

  return aplicarResultadoEfectivoEnVista(contexto);
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
  return apiRequest<{ id: string }>(
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
