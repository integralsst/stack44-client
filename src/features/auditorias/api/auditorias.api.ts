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

const AUDITORIA_UPDATED_EVENT = "stack44:auditoria-updated";

function notificarCambioAuditoria(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUDITORIA_UPDATED_EVENT));
}

function conNotificacion<T>(promise: Promise<T>): Promise<T> {
  return promise.then((data) => {
    notificarCambioAuditoria();
    return data;
  });
}

function normalizarFechaCalendario(value: string | null): string | null {
  if (!value) return value;

  const fecha = value.match(/^(\d{4}-\d{2}-\d{2})/)?.[1];
  if (!fecha) return value;

  // Las fechas objetivo/auditoría son fechas de calendario, no instantes.
  // Usar mediodía UTC evita que UTC-5 las muestre como el día anterior.
  return `${fecha}T12:00:00.000Z`;
}

function normalizarRecomendacion(
  recomendacion: RecomendacionAuditoria
): RecomendacionAuditoria {
  return {
    ...recomendacion,
    fechaObjetivo: normalizarFechaCalendario(recomendacion.fechaObjetivo),
  };
}

function normalizarHallazgo(hallazgo: HallazgoAuditoria): HallazgoAuditoria {
  return {
    ...hallazgo,
    fechaObjetivo: normalizarFechaCalendario(hallazgo.fechaObjetivo),
    recomendaciones: hallazgo.recomendaciones.map(normalizarRecomendacion),
  };
}

function normalizarResumen(auditoria: AuditoriaResumen): AuditoriaResumen {
  return {
    ...auditoria,
    fechaAuditoria:
      normalizarFechaCalendario(auditoria.fechaAuditoria) ??
      auditoria.fechaAuditoria,
  };
}

function normalizarDetalle(auditoria: AuditoriaDetalle): AuditoriaDetalle {
  return {
    ...auditoria,
    fechaAuditoria:
      normalizarFechaCalendario(auditoria.fechaAuditoria) ??
      auditoria.fechaAuditoria,
    hallazgos: auditoria.hallazgos.map(normalizarHallazgo),
  };
}

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
  ).then((data) => ({
    ...data,
    auditorias: data.auditorias.map(normalizarResumen),
  }));
}

export function obtenerAuditoria(token: string, auditoriaId: string) {
  return apiRequest<AuditoriaDetalle>(
    `/api/auditorias/${encodeURIComponent(auditoriaId)}`,
    {},
    token
  ).then(normalizarDetalle);
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
  return conNotificacion(
    apiRequest<AuditoriaResumen>(
      "/api/auditorias",
      { method: "POST", body: JSON.stringify(data) },
      token
    ).then(normalizarResumen)
  );
}

export function cambiarEstadoAuditoria(
  token: string,
  auditoriaId: string,
  estado: EstadoAuditoria,
  motivo?: string | null
) {
  return conNotificacion(
    apiRequest<AuditoriaDetalle>(
      `/api/auditorias/${encodeURIComponent(auditoriaId)}/estado`,
      {
        method: "PATCH",
        body: JSON.stringify({ estado, motivo: motivo ?? null }),
      },
      token
    ).then(normalizarDetalle)
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
  return conNotificacion(
    apiRequest<HallazgoAuditoria>(
      `/api/auditorias/${encodeURIComponent(auditoriaId)}/hallazgos`,
      { method: "POST", body: JSON.stringify(data) },
      token
    ).then(normalizarHallazgo)
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
  return conNotificacion(
    apiRequest<HallazgoAuditoria>(
      `/api/auditorias/hallazgos/${encodeURIComponent(hallazgoId)}`,
      { method: "PATCH", body: JSON.stringify(data) },
      token
    ).then(normalizarHallazgo)
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
  return conNotificacion(
    apiRequest<RecomendacionAuditoria>(
      `/api/auditorias/hallazgos/${encodeURIComponent(hallazgoId)}/recomendaciones`,
      { method: "POST", body: JSON.stringify(data) },
      token
    ).then(normalizarRecomendacion)
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
  return conNotificacion(
    apiRequest<SeguimientoAuditoria>(
      `/api/auditorias/hallazgos/${encodeURIComponent(hallazgoId)}/seguimientos`,
      { method: "POST", body: JSON.stringify(data) },
      token
    )
  );
}
