import { apiRequest } from "../../../lib/api";
import type {
  CrearEvidenciaCompromisoInput,
  CrearSeguimientoCompromisoInput,
  DecidirAmpliacionCompromisoInput,
  ReasignarCompromisoInput,
  SolicitarAmpliacionCompromisoInput,
} from "../types/operacion-compromisos.types";

function ruta(compromisoId: string, sufijo: string) {
  return (
    "/api/compromisos/" +
    encodeURIComponent(compromisoId) +
    sufijo
  );
}

export function crearSeguimientoCompromiso(
  compromisoId: string,
  data: CrearSeguimientoCompromisoInput,
  token: string
) {
  return apiRequest(
    ruta(compromisoId, "/seguimientos"),
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export function cambiarActividadCompromiso(
  compromisoId: string,
  actividadId: string,
  atendida: boolean,
  token: string
) {
  return apiRequest(
    ruta(
      compromisoId,
      "/actividades/" +
        encodeURIComponent(actividadId)
    ),
    {
      method: "PATCH",
      body: JSON.stringify({ atendida }),
    },
    token
  );
}

export function crearEvidenciaCompromiso(
  compromisoId: string,
  data: CrearEvidenciaCompromisoInput,
  token: string
) {
  return apiRequest(
    ruta(compromisoId, "/evidencias"),
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export function rechazarAsignacionCompromiso(
  compromisoId: string,
  motivo: string,
  token: string
) {
  return apiRequest(
    ruta(
      compromisoId,
      "/rechazar-asignacion"
    ),
    {
      method: "POST",
      body: JSON.stringify({ motivo }),
    },
    token
  );
}

export function reasignarCompromiso(
  compromisoId: string,
  data: ReasignarCompromisoInput,
  token: string
) {
  return apiRequest(
    ruta(compromisoId, "/reasignaciones"),
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export function solicitarCierreCompromiso(
  compromisoId: string,
  token: string
) {
  return apiRequest(
    ruta(compromisoId, "/solicitudes-cierre"),
    {
      method: "POST",
    },
    token
  );
}

export function decidirCierreCompromiso(
  compromisoId: string,
  solicitudId: string,
  decision: "APROBAR" | "DEVOLVER",
  mensaje: string,
  token: string
) {
  return apiRequest(
    ruta(
      compromisoId,
      "/solicitudes-cierre/" +
        encodeURIComponent(solicitudId) +
        "/decision"
    ),
    {
      method: "POST",
      body: JSON.stringify({
        decision,
        mensaje,
      }),
    },
    token
  );
}

export function solicitarAmpliacionCompromiso(
  compromisoId: string,
  data: SolicitarAmpliacionCompromisoInput,
  token: string
) {
  return apiRequest(
    ruta(compromisoId, "/solicitudes-ampliacion"),
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export function decidirAmpliacionCompromiso(
  compromisoId: string,
  data: DecidirAmpliacionCompromisoInput,
  token: string
) {
  return apiRequest(
    ruta(
      compromisoId,
      "/solicitudes-ampliacion/" +
        encodeURIComponent(data.solicitudId) +
        "/decision"
    ),
    {
      method: "POST",
      body: JSON.stringify({
        decision: data.decision,
        observacion: data.observacion,
      }),
    },
    token
  );
}

export function cancelarCompromiso(
  compromisoId: string,
  motivo: string,
  token: string
) {
  return apiRequest(
    ruta(compromisoId, "/cancelacion"),
    {
      method: "POST",
      body: JSON.stringify({ motivo }),
    },
    token
  );
}
