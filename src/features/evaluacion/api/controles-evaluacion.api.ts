import { apiRequest } from "../../../lib/api";
import type {
  AprobacionGestionItem,
  AprobacionesGestionPeriodoResponse,
  DecisionNoAplicaItem,
  NoAplicaPeriodoResponse,
} from "../types/controles-evaluacion.types";

export function obtenerNoAplicaPeriodo(
  periodoId: string,
  token: string
) {
  return apiRequest<NoAplicaPeriodoResponse>(
    `/api/evaluacion/periodos/${periodoId}/no-aplica`,
    {},
    token
  );
}

export function decidirNoAplica(
  decisionId: string,
  decision: "APROBAR" | "RECHAZAR",
  observacion: string | null,
  token: string
) {
  return apiRequest<DecisionNoAplicaItem>(
    `/api/evaluacion/no-aplica/${decisionId}/decision`,
    {
      method: "POST",
      body: JSON.stringify({ decision, observacion }),
    },
    token
  );
}

export function obtenerAprobacionesGestionPeriodo(
  periodoId: string,
  token: string
) {
  return apiRequest<AprobacionesGestionPeriodoResponse>(
    `/api/evaluacion/periodos/${periodoId}/aprobaciones-gestion`,
    {},
    token
  );
}

export function decidirAprobacionGestion(
  aprobacionId: string,
  decision: "APROBAR" | "RECHAZAR",
  observacion: string | null,
  token: string
) {
  return apiRequest<AprobacionGestionItem>(
    `/api/evaluacion/aprobaciones-gestion/${aprobacionId}/decision`,
    {
      method: "POST",
      body: JSON.stringify({ decision, observacion }),
    },
    token
  );
}
