import {
  useCallback,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import { finalizarGestionConCompromisos } from "../api/compromisos.api";
import type {
  FinalizacionGestionResponse,
  FinalizarGestionInput,
  PreparacionFinalizacionResponse,
} from "../types/compromiso.types";

/**
 * Puente temporal de compatibilidad con la pantalla de evaluación.
 *
 * El flujo vigente ya no prepara compromisos operativos: una evaluación
 * finalizada en 0/3 se representa como "Compromiso pendiente" derivado de
 * la última evaluación válida. Conservamos esta interfaz para no reescribir
 * innecesariamente la pantalla crítica de evaluación durante la transición.
 */
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
        throw new Error(
          "No hay una sesión activa para preparar la finalización."
        );
      }

      setCargando(true);
      setError(null);

      try {
        const resultado: PreparacionFinalizacionResponse = {
          gestionId,
          totalEvaluaciones: 0,
          requiereCompromisos: false,
          totalRequierenCompromiso: 0,
          totalNuevos: 0,
          totalVinculados: 0,
          evaluaciones: [],
          recalificacionesCumplidas: [],
          responsablesDisponibles: [],
        };

        setPreparacion(resultado);
        return resultado;
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
