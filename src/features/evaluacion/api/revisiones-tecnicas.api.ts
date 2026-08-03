import { apiRequest } from "../../../lib/api";
import type {
  ResolverRevisionTecnicaInput,
  ResolverRevisionTecnicaResponse,
  RevisionesTecnicasPeriodoResponse,
} from "../types/revision-tecnica.types";

export function obtenerRevisionesTecnicasPeriodo(
  periodoId: string,
  token: string
) {
  return apiRequest<RevisionesTecnicasPeriodoResponse>(
    `/api/evaluacion/periodos/${periodoId}/revisiones-tecnicas`,
    {},
    token
  );
}

export function resolverRevisionTecnica(
  revisionId: string,
  data: ResolverRevisionTecnicaInput,
  token: string
) {
  return apiRequest<ResolverRevisionTecnicaResponse>(
    `/api/evaluacion/revisiones-tecnicas/${revisionId}/resolver`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}
