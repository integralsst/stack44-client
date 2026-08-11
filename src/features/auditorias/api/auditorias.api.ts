import { apiRequest } from "../../../lib/api";
import type {
  AuditoriaDetalle,
  AuditoriaResumen,
  ConsultaAuditorias,
  ContextoAuditoriaEmpresa,
  EstadoAuditoria,
  EstadoHallazgo,
  EstadoRecomendacion,
  HallazgoAuditoria,
  ListaAuditoriasResponse,
  RecomendacionAuditoria,
  SeguimientoAuditoria,
  TipoHallazgo,
} from "../types/auditorias.types";

function queryAuditorias(consulta: ConsultaAuditorias = {}): string {
  const query = new URLSearchParams();
  if (consulta.busqueda) query.set("busqueda", consulta.busqueda);
  if (consulta.empresaId) query.set("empresaId", consulta.empresaId);
  if (consulta.anio) query.set("anio", String(consulta.anio));
  if (consulta.estado && consulta.estado !== "TODAS") {
    query.set("estado", consulta.estado);
  }
  if (consulta.pagina) query.set("pagina", String(consulta.pagina));
  if (consulta.limite) query.set("limite", String(consulta.limite));
  const texto = query.toString();
  return texto ? `?${texto}` : "";
}

export function listarAuditorias(
  token: string,
  consulta: ConsultaAuditorias = {}
) {
  return apiRequest<ListaAuditoriasResponse>(
    `/api/auditorias${queryAuditorias(consulta)}`,
    {},
    token
  );
}

export function obtenerAuditoria(token: string, auditoriaId: string) {
  return apiRequest<AuditoriaDetalle>(
    `/api/auditorias/${encodeURIComponent(auditoriaId)}`,
    {},
    token
  );
}

export function obtenerContextoAuditoriaEmpresa(
  token: string,
  empresaId: string,
  anio?: number
) {
  const query = anio ? `?anio=${encodeURIComponent(String(anio))}` : "";
  return apiRequest<ContextoAuditoriaEmpresa>(
    `/api/auditorias/empresas/${encodeURIComponent(empresaId)}/contexto${query}`,
    {},
    token
  );
}

export function crearAuditoria(
  token: string,
  data: {
    empresaId: string;
    anio: number;
    titulo: string;
    objetivo?: string | null;
    alcance?: string | null;
    fechaAuditoria: string;
  }
) {
  return apiRequest<AuditoriaResumen>(
    "/api/auditorias",
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

export function cambiarEstadoAuditoria(
  token: string,
  auditoriaId: string,
  estado: EstadoAuditoria,
  motivo?: string | null
) {
  return apiRequest<AuditoriaDetalle>(
    `/api/auditorias/${encodeURIComponent(auditoriaId)}/estado`,
    {
      method: "PATCH",
      body: JSON.stringify({ estado, motivo: motivo ?? null }),
    },
    token
  );
}

export function crearHallazgoAuditoria(
  token: string,
  auditoriaId: string,
  data: {
    aspectoId?: number | null;
    tipo: TipoHallazgo;
    titulo: string;
    descripcion: string;
    evidencia?: string | null;
    responsableUsuarioId?: string | null;
    fechaObjetivo?: string | null;
  }
) {
  return apiRequest<HallazgoAuditoria>(
    `/api/auditorias/${encodeURIComponent(auditoriaId)}/hallazgos`,
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

export function actualizarHallazgoAuditoria(
  token: string,
  hallazgoId: string,
  data: {
    responsableUsuarioId?: string | null;
    fechaObjetivo?: string | null;
  }
) {
  return apiRequest<HallazgoAuditoria>(
    `/api/auditorias/hallazgos/${encodeURIComponent(hallazgoId)}`,
    { method: "PATCH", body: JSON.stringify(data) },
    token
  );
}

export function crearRecomendacionAuditoria(
  token: string,
  hallazgoId: string,
  data: {
    descripcion: string;
    responsableUsuarioId?: string | null;
    fechaObjetivo?: string | null;
  }
) {
  return apiRequest<RecomendacionAuditoria>(
    `/api/auditorias/hallazgos/${encodeURIComponent(hallazgoId)}/recomendaciones`,
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}

export function registrarSeguimientoAuditoria(
  token: string,
  hallazgoId: string,
  data: {
    descripcion: string;
    recomendacionId?: string | null;
    estadoHallazgo?: EstadoHallazgo | null;
    estadoRecomendacion?: EstadoRecomendacion | null;
  }
) {
  return apiRequest<SeguimientoAuditoria>(
    `/api/auditorias/hallazgos/${encodeURIComponent(hallazgoId)}/seguimientos`,
    { method: "POST", body: JSON.stringify(data) },
    token
  );
}
