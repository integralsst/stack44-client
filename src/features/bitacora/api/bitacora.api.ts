import { apiRequest } from "../../../lib/api";
import type {
  AnalizarBitacoraShadowInput,
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
