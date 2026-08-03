import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import {
  invalidarGestionEvaluacion,
  obtenerHistorialGestiones,
} from "../api/gestiones-evaluacion.api";
import type {
  HistorialGestionesResponse,
  InvalidarGestionResponse,
} from "../types/gestion-historial.types";

export function useHistorialGestiones(
  periodoId: string | null | undefined
) {
  const { token } = useAuth();
  const [data, setData] =
    useState<HistorialGestionesResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!periodoId || !token) {
      setData(null);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const resultado = await obtenerHistorialGestiones(
        periodoId,
        token
      );
      setData(resultado);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar el historial de gestiones."
      );
    } finally {
      setCargando(false);
    }
  }, [periodoId, token]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const invalidar = useCallback(
    async (
      gestionId: string,
      motivo: string
    ): Promise<InvalidarGestionResponse> => {
      if (!token) {
        throw new Error("La sesión no está disponible.");
      }

      setProcesando(true);
      setError(null);

      try {
        const resultado = await invalidarGestionEvaluacion(
          gestionId,
          { motivo },
          token
        );
        await recargar();
        return resultado;
      } catch (currentError) {
        const mensaje =
          currentError instanceof Error
            ? currentError.message
            : "No fue posible invalidar la gestión.";
        setError(mensaje);
        throw currentError;
      } finally {
        setProcesando(false);
      }
    },
    [recargar, token]
  );

  return {
    data,
    cargando,
    procesando,
    error,
    recargar,
    invalidar,
  };
}
