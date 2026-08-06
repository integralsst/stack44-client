import { apiRequest } from "../../../lib/api";
import type { AlertasCompromisosResponse } from "../types/alertas-compromisos.types";

export function obtenerAlertasCompromisos(
  token: string
) {
  return apiRequest<AlertasCompromisosResponse>(
    "/api/compromisos/alertas",
    {},
    token
  );
}
