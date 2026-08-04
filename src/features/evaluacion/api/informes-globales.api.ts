import { apiRequest } from "../../../lib/api";
import type {
  FiltrosInformesGlobales,
  InformesGlobalesResponse,
} from "../types/informes-globales.types";

export function listarInformesGlobales(
  filtros: FiltrosInformesGlobales,
  token: string
) {
  const params = new URLSearchParams();

  if (filtros.buscar.trim()) {
    params.set("buscar", filtros.buscar.trim());
  }
  if (filtros.empresaId) {
    params.set("empresaId", filtros.empresaId);
  }
  if (filtros.anio) {
    params.set("anio", filtros.anio);
  }
  if (filtros.fechaDesde) {
    params.set("fechaDesde", filtros.fechaDesde);
  }
  if (filtros.fechaHasta) {
    params.set("fechaHasta", filtros.fechaHasta);
  }
  if (filtros.grupo) {
    params.set("grupo", filtros.grupo);
  }
  if (filtros.categoria) {
    params.set("categoria", filtros.categoria);
  }

  params.set("pagina", String(filtros.pagina));
  params.set("limite", String(filtros.limite));

  return apiRequest<InformesGlobalesResponse>(
    `/api/evaluacion/informes-globales?${params.toString()}`,
    {},
    token
  );
}