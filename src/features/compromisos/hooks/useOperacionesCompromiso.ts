import {
  useCallback,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import {
  cambiarActividadCompromiso,
  cancelarCompromiso,
  crearEvidenciaCompromiso,
  crearSeguimientoCompromiso,
  decidirAmpliacionCompromiso,
  decidirCierreCompromiso,
  reasignarCompromiso,
  rechazarAsignacionCompromiso,
  solicitarAmpliacionCompromiso,
  solicitarCierreCompromiso,
} from "../api/operacion-compromisos.api";
import type {
  CrearEvidenciaCompromisoInput,
  CrearSeguimientoCompromisoInput,
  DecidirAmpliacionCompromisoInput,
  FeedbackOperacionCompromiso,
  ReasignarCompromisoInput,
  SolicitarAmpliacionCompromisoInput,
} from "../types/operacion-compromisos.types";
import { notificarCambioCompromisos } from "../lib/alertas-compromisos.events";

export function useOperacionesCompromiso(
  compromisoId: string,
  recargar: () => Promise<void>
) {
  const { token } = useAuth();
  const [procesando, setProcesando] =
    useState<string | null>(null);
  const [feedback, setFeedback] =
    useState<FeedbackOperacionCompromiso | null>(
      null
    );

  const ejecutar = useCallback(async (
    clave: string,
    mensajeExito: string,
    accion: (currentToken: string) => Promise<unknown>
  ): Promise<boolean> => {
    if (!token) {
      return false;
    }

    setProcesando(clave);
    setFeedback(null);

    try {
      await accion(token);
      await recargar();
      notificarCambioCompromisos();
      setFeedback({
        tone: "success",
        title: "Cambio guardado",
        description: mensajeExito,
      });
      return true;
    } catch (error) {
      setFeedback({
        tone: "error",
        title: "No fue posible completar la acción",
        description:
          error instanceof Error
            ? error.message
            : "Intenta nuevamente.",
      });
      return false;
    } finally {
      setProcesando(null);
    }
  }, [recargar, token]);

  return {
    procesando,
    feedback,
    cerrarFeedback: () => setFeedback(null),
    crearSeguimiento: (
      data: CrearSeguimientoCompromisoInput
    ) =>
      ejecutar(
        "seguimiento",
        "El seguimiento quedó registrado en la trazabilidad.",
        (currentToken) =>
          crearSeguimientoCompromiso(
            compromisoId,
            data,
            currentToken
          )
      ),
    cambiarActividad: (
      actividadId: string,
      atendida: boolean
    ) =>
      ejecutar(
        "actividad:" + actividadId,
        atendida
          ? "La actividad quedó marcada como atendida."
          : "La actividad volvió al estado pendiente.",
        (currentToken) =>
          cambiarActividadCompromiso(
            compromisoId,
            actividadId,
            atendida,
            currentToken
          )
      ),
    crearEvidencia: (
      data: CrearEvidenciaCompromisoInput
    ) =>
      ejecutar(
        "evidencia",
        "La evidencia quedó vinculada al compromiso.",
        (currentToken) =>
          crearEvidenciaCompromiso(
            compromisoId,
            data,
            currentToken
          )
      ),
    rechazarAsignacion: (motivo: string) =>
      ejecutar(
        "rechazo",
        "La asignación fue rechazada y quedó pendiente de reasignación.",
        (currentToken) =>
          rechazarAsignacionCompromiso(
            compromisoId,
            motivo,
            currentToken
          )
      ),
    reasignar: (data: ReasignarCompromisoInput) =>
      ejecutar(
        "reasignacion",
        "La responsabilidad fue reasignada y la cadena quedó registrada.",
        (currentToken) =>
          reasignarCompromiso(
            compromisoId,
            data,
            currentToken
          )
      ),
    solicitarCierre: () =>
      ejecutar(
        "solicitud-cierre",
        "La solicitud quedó disponible para revisión.",
        (currentToken) =>
          solicitarCierreCompromiso(
            compromisoId,
            currentToken
          )
      ),
    decidirCierre: (
      solicitudId: string,
      decision: "APROBAR" | "DEVOLVER",
      mensaje: string
    ) =>
      ejecutar(
        "decision-cierre",
        decision === "APROBAR"
          ? "El compromiso quedó cerrado formalmente."
          : "La solicitud fue devuelta con observaciones.",
        (currentToken) =>
          decidirCierreCompromiso(
            compromisoId,
            solicitudId,
            decision,
            mensaje,
            currentToken
          )
      ),
    solicitarAmpliacion: (
      data: SolicitarAmpliacionCompromisoInput
    ) =>
      ejecutar(
        "solicitud-ampliacion",
        "La solicitud de ampliación quedó pendiente de coordinación y administración.",
        (currentToken) =>
          solicitarAmpliacionCompromiso(
            compromisoId,
            data,
            currentToken
          )
      ),
    decidirAmpliacion: (
      data: DecidirAmpliacionCompromisoInput
    ) =>
      ejecutar(
        "decision-ampliacion",
        data.decision === "APROBAR"
          ? "Tu decisión quedó registrada. La fecha solo cambia cuando coordinación y administración hayan aprobado."
          : "La solicitud de ampliación quedó rechazada.",
        (currentToken) =>
          decidirAmpliacionCompromiso(
            compromisoId,
            data,
            currentToken
          )
      ),
    cancelar: (motivo: string) =>
      ejecutar(
        "cancelacion",
        "El compromiso quedó cancelado y la trazabilidad fue conservada.",
        (currentToken) =>
          cancelarCompromiso(
            compromisoId,
            motivo,
            currentToken
          )
      ),
  };
}
