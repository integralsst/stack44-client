import { apiRequest } from "../../../lib/api";

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
