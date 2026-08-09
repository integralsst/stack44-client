import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import {
  decidirAprobacionGestion,
  decidirNoAplica,
  obtenerAprobacionesGestionPeriodo,
  obtenerNoAplicaPeriodo,
} from "../api/controles-evaluacion.api";
import type {
  AprobacionesGestionPeriodoResponse,
  NoAplicaPeriodoResponse,
} from "../types/controles-evaluacion.types";
import { notificarCambioCompromisos } from "../../compromisos/lib/alertas-compromisos.events";

export function useControlesEvaluacion(
  periodoId: string | null,
  enabled: boolean
) {
  const { token } = useAuth();
  const [noAplica, setNoAplica] =
    useState<NoAplicaPeriodoResponse | null>(null);
  const [aprobaciones, setAprobaciones] =
    useState<AprobacionesGestionPeriodoResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] =
    useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!enabled || !periodoId || !token) return;

    setCargando(true);
    setError(null);

    try {
      const [noAplicaData, aprobacionesData] =
        await Promise.all([
          obtenerNoAplicaPeriodo(periodoId, token),
          obtenerAprobacionesGestionPeriodo(
            periodoId,
            token
          ),
        ]);

      setNoAplica(noAplicaData);
      setAprobaciones(aprobacionesData);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible consultar los controles de evaluación."
      );
    } finally {
      setCargando(false);
    }
  }, [enabled, periodoId, token]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const decidirSolicitudNoAplica = useCallback(
    async (
      decisionId: string,
      decision: "APROBAR" | "RECHAZAR",
      observacion: string | null
    ) => {
      if (!token) return false;

      setProcesando(`no-aplica:${decisionId}`);
      setError(null);

      try {
        await decidirNoAplica(
          decisionId,
          decision,
          observacion,
          token
        );
        await recargar();
        notificarCambioCompromisos();
        return true;
      } catch (currentError) {
        setError(
          currentError instanceof Error
            ? currentError.message
            : "No fue posible registrar la decisión de No aplica."
        );
        return false;
      } finally {
        setProcesando(null);
      }
    },
    [recargar, token]
  );

  const decidirGestion = useCallback(
    async (
      aprobacionId: string,
      decision: "APROBAR" | "RECHAZAR",
      observacion: string | null
    ) => {
      if (!token) return false;

      setProcesando(`gestion:${aprobacionId}`);
      setError(null);

      try {
        await decidirAprobacionGestion(
          aprobacionId,
          decision,
          observacion,
          token
        );
        await recargar();
        notificarCambioCompromisos();
        return true;
      } catch (currentError) {
        setError(
          currentError instanceof Error
            ? currentError.message
            : "No fue posible registrar la decisión de aprobación."
        );
        return false;
      } finally {
        setProcesando(null);
      }
    },
    [recargar, token]
  );

  return {
    noAplica,
    aprobaciones,
    cargando,
    procesando,
    error,
    recargar,
    decidirSolicitudNoAplica,
    decidirGestion,
  };
}
