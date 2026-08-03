import { apiRequest } from "../../../lib/api";
import type {
  DetalleAspectoBaseResponse,
  DetalleAspectoEvidenciasResponse,
  DetalleAspectoHistorialResponse,
  DetalleAspectoRevisionResponse,
} from "../types/detalle-aspecto.types";

function detallePath(
  empresaId: string,
  tareaId: number,
  seccion: string,
  anio: number
) {
  return `/api/evaluacion/empresas/${empresaId}/tareas/${tareaId}/detalle/${seccion}?anio=${anio}`;
}

export function obtenerResumenAspecto(
  empresaId: string,
  tareaId: number,
  anio: number,
  token: string
) {
  return apiRequest<DetalleAspectoBaseResponse>(
    detallePath(
      empresaId,
      tareaId,
      "resumen",
      anio
    ),
    {},
    token
  );
}

export function obtenerHistorialAspecto(
  empresaId: string,
  tareaId: number,
  anio: number,
  token: string
) {
  return apiRequest<DetalleAspectoHistorialResponse>(
    detallePath(
      empresaId,
      tareaId,
      "historial",
      anio
    ),
    {},
    token
  );
}

export function obtenerEvidenciasAspecto(
  empresaId: string,
  tareaId: number,
  anio: number,
  token: string
) {
  return apiRequest<DetalleAspectoEvidenciasResponse>(
    detallePath(
      empresaId,
      tareaId,
      "evidencias",
      anio
    ),
    {},
    token
  );
}

export function obtenerRevisionTecnicaAspecto(
  empresaId: string,
  tareaId: number,
  anio: number,
  token: string
) {
  return apiRequest<DetalleAspectoRevisionResponse>(
    detallePath(
      empresaId,
      tareaId,
      "revision-tecnica",
      anio
    ),
    {},
    token
  );
}
