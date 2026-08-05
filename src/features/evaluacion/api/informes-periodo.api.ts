import {
  apiDownloadFile,
  apiRequest,
} from "../../../lib/api";
import type {
  GenerarInformePeriodoInput,
  InformePeriodoDetalle,
  InformePeriodoVersionResumen,
  InformesPeriodoResponse,
} from "../types/informe-periodo.types";

export function listarInformesPeriodo(
  empresaId: string,
  anio: number,
  token: string
) {
  const params = new URLSearchParams({
    anio: String(anio),
  });

  return apiRequest<InformesPeriodoResponse>(
    `/api/evaluacion/empresas/${empresaId}/informes?${params.toString()}`,
    {},
    token
  );
}

export function generarInformePeriodo(
  empresaId: string,
  anio: number,
  input: GenerarInformePeriodoInput,
  token: string
) {
  const params = new URLSearchParams({
    anio: String(anio),
  });

  return apiRequest<InformePeriodoVersionResumen>(
    `/api/evaluacion/empresas/${empresaId}/informes?${params.toString()}`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    token
  );
}

export function obtenerDetalleInformePeriodo(
  informeId: string,
  token: string
) {
  return apiRequest<InformePeriodoDetalle>(
    `/api/evaluacion/informes/${informeId}`,
    {},
    token
  );
}

export function descargarPdfInformePeriodo(
  informeId: string,
  token: string
) {
  return apiDownloadFile(
    `/api/evaluacion/informes/${informeId}/pdf`,
    token
  );
}
