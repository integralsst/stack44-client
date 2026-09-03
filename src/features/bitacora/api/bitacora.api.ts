import {
  apiDownloadFile,
  apiRequest,
  type ApiDownloadResult,
} from "../../../lib/api";
import type {
  AnalizarBitacoraShadowInput,
  AplicarRegistroBitacoraInput,
  CrearRegistroBitacoraInput,
  HistorialBitacoraUnificado,
  RegistroBitacoraListado,
  ResultadoAplicarBitacora,
  ResultadoBitacoraAsistida,
  ResultadoBitacoraShadow,
} from "../types/bitacora.types";

export async function analizarBitacoraShadow(
  empresaId: string,
  input: AnalizarBitacoraShadowInput,
  token: string
): Promise<ResultadoBitacoraShadow> {
  return apiRequest<ResultadoBitacoraShadow>(
    `/api/bitacora/empresas/${encodeURIComponent(empresaId)}/analisis-shadow`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    token
  );
}

export async function guardarYAnalizarBitacora(
  empresaId: string,
  input: CrearRegistroBitacoraInput,
  token: string
): Promise<ResultadoBitacoraAsistida> {
  return apiRequest<ResultadoBitacoraAsistida>(
    `/api/bitacora/empresas/${encodeURIComponent(empresaId)}/registros`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    token
  );
}

export async function listarBitacorasEmpresa(
  empresaId: string,
  token: string
): Promise<RegistroBitacoraListado[]> {
  return apiRequest<RegistroBitacoraListado[]>(
    `/api/bitacora/empresas/${encodeURIComponent(empresaId)}/registros`,
    {},
    token
  );
}

export async function listarHistorialBitacoraUnificado(
  empresaId: string,
  token: string
): Promise<HistorialBitacoraUnificado> {
  return apiRequest<HistorialBitacoraUnificado>(
    `/api/bitacora/empresas/${encodeURIComponent(empresaId)}/historial`,
    {},
    token
  );
}

export async function descargarHistorialBitacoraPdf(
  empresaId: string,
  token: string
): Promise<ApiDownloadResult> {
  return apiDownloadFile(
    `/api/bitacora/empresas/${encodeURIComponent(empresaId)}/historial.pdf`,
    token
  );
}

export async function aplicarBitacoraCompleta(
  empresaId: string,
  registroId: string,
  input: AplicarRegistroBitacoraInput,
  token: string
): Promise<ResultadoAplicarBitacora> {
  return apiRequest<ResultadoAplicarBitacora>(
    `/api/bitacora/empresas/${encodeURIComponent(empresaId)}/registros/${encodeURIComponent(registroId)}/aplicar`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
    token
  );
}
