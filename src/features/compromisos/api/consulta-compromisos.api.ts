import { apiRequest } from "../../../lib/api";
import type {
  AlcanceCompromisos,
  CompromisoDetalle,
  ConsultaCompromisosResponse,
  FiltrosCompromisos,
} from "../types/consulta-compromisos.types";

interface ListarCompromisosParams {
  alcance: AlcanceCompromisos;
  pagina: number;
  limite?: number;
  filtros: FiltrosCompromisos;
}

export function listarCompromisos(
  params: ListarCompromisosParams,
  token: string,
  signal?: AbortSignal
) {
  const query = new URLSearchParams({
    alcance: params.alcance,
    pagina: String(params.pagina),
    limite: String(params.limite ?? 20),
  });

  const filtros = params.filtros;

  if (filtros.busqueda.trim()) {
    query.set(
      "busqueda",
      filtros.busqueda.trim()
    );
  }

  if (filtros.empresa.trim()) {
    query.set(
      "empresa",
      filtros.empresa.trim()
    );
  }

  if (filtros.responsable.trim()) {
    query.set(
      "responsable",
      filtros.responsable.trim()
    );
  }

  if (filtros.proceso.trim()) {
    query.set(
      "proceso",
      filtros.proceso.trim()
    );
  }

  if (filtros.aspecto.trim()) {
    query.set(
      "aspecto",
      filtros.aspecto.trim()
    );
  }

  if (filtros.estado) {
    query.set("estado", filtros.estado);
  }

  if (filtros.vencimiento !== "TODOS") {
    query.set(
      "vencimiento",
      filtros.vencimiento
    );
  }

  return apiRequest<ConsultaCompromisosResponse>(
    "/api/compromisos?" +
      query.toString(),
    {
      signal,
    },
    token
  );
}

export function obtenerCompromisoDetalle(
  compromisoId: string,
  token: string
) {
  return apiRequest<CompromisoDetalle>(
    "/api/compromisos/" +
      encodeURIComponent(compromisoId),
    {},
    token
  );
}
