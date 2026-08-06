import {
  useCallback,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import {
  finalizarGestionConCompromisos,
  obtenerPreparacionFinalizacion,
} from "../api/compromisos.api";
import type {
  FinalizacionGestionResponse,
  FinalizarGestionInput,
  PreparacionFinalizacionResponse,
} from "../types/compromiso.types";

export function usePreparacionFinalizacion() {
  const { token } = useAuth();
  const [preparacion, setPreparacion] =
    useState<PreparacionFinalizacionResponse | null>(
      null
    );
  const [cargando, setCargando] = useState(false);
  const [finalizando, setFinalizando] =
    useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  const limpiar = useCallback(() => {
    setPreparacion(null);
    setError(null);
  }, []);

  const cargar = useCallback(
    async (gestionId: string) => {
      if (!token) {
        return null;
      }

      setCargando(true);
      setError(null);

      try {
        const resultado =
          await obtenerPreparacionFinalizacion(
            gestionId,
            token
          );

        setPreparacion(resultado);
        return resultado;
      } catch (currentError) {
        const message =
          currentError instanceof Error
            ? currentError.message
            : "No fue posible preparar la finalización.";

        setError(message);
        throw currentError;
      } finally {
        setCargando(false);
      }
    },
    [token]
  );

  const finalizar = useCallback(
    async (
      gestionId: string,
      data: FinalizarGestionInput
    ): Promise<FinalizacionGestionResponse> => {
      if (!token) {
        throw new Error(
          "No hay una sesión activa para finalizar la gestión."
        );
      }

      setFinalizando(true);
      setError(null);

      try {
        const resultado =
          await finalizarGestionConCompromisos(
            gestionId,
            data,
            token
          );

        setPreparacion(null);
        return resultado;
      } catch (currentError) {
        const message =
          currentError instanceof Error
            ? currentError.message
            : "No fue posible finalizar la gestión.";

        setError(message);
        throw currentError;
      } finally {
        setFinalizando(false);
      }
    },
    [token]
  );

  return {
    preparacion,
    cargando,
    finalizando,
    error,
    cargar,
    finalizar,
    limpiar,
  };
}
