import { apiRequest } from "../../../lib/api";
import type {
  DetalleAspectoConfiguracionResponse,
  DetalleAspectoEvidenciasResponse,
  DetalleAspectoHistorialResponse,
  DetalleAspectoResumenRapidoResponse,
  DetalleAspectoRevisionResponse,
} from "../types/detalle-aspecto.types";

const GESTION_ID_MODO_EVALUACION_DIRECTA =
  "__EVALUACION_DIRECTA_SIN_BORRADOR__";

function detallePath(
  empresaId: string,
  tareaId: number,
  seccion: string,
  anio: number,
  extras = ""
) {
  const params = new URLSearchParams({
    anio: String(anio),
  });
  const gestionId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get(
          "gestionId"
        )
      : null;

  if (gestionId) {
    params.set("gestionId", gestionId);
  } else {
    // La pantalla nueva consulta siempre el estado oficial. Este marcador
    // impide que un borrador legado todavía existente sea auto-seleccionado.
    params.set(
      "gestionId",
      GESTION_ID_MODO_EVALUACION_DIRECTA
    );
  }

  return `/api/evaluacion/empresas/${empresaId}/tareas/${tareaId}/detalle/${seccion}?${params.toString()}${extras}`;
}

export function obtenerResumenRapidoAspecto(
  empresaId: string,
  tareaId: number,
  anio: number,
  token: string
) {
  return apiRequest<DetalleAspectoResumenRapidoResponse>(
    detallePath(
      empresaId,
      tareaId,
      "resumen-rapido",
      anio
    ),
    {},
    token
  );
}

export function obtenerConfiguracionResumenAspecto(
  empresaId: string,
  tareaId: number,
  anio: number,
  token: string
) {
  return apiRequest<DetalleAspectoConfiguracionResponse>(
    detallePath(
      empresaId,
      tareaId,
      "resumen-configuracion",
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
  pagina: number,
  token: string
) {
  return apiRequest<DetalleAspectoHistorialResponse>(
    detallePath(
      empresaId,
      tareaId,
      "historial-paginado",
      anio,
      `&pagina=${pagina}`
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