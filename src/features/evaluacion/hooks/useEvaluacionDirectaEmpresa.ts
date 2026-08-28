import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  ContextoEvaluacionResponse,
  GuardarEvaluacionInput,
} from "../../../types/evaluacion.types";
import { useAuth } from "../../auth/context/AuthContext";
import {
  abrirPeriodoEvaluacion,
  obtenerContextoEvaluacion,
} from "../api/evaluacion.api";
import { guardarEvaluacionesDirectas } from "../api/evaluacion-directa.api";
import { escucharCambiosEvidenciaEvaluacion } from "../lib/evidencia-evaluacion.events";

export function useEvaluacionDirectaEmpresa(
  empresaId: string | undefined,
  anio: number
) {
  const { token } = useAuth();
  const [contexto, setContexto] =
    useState<ContextoEvaluacionResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(
    async (mostrarCarga = true) => {
      if (!empresaId || !token) return;

      if (mostrarCarga) {
        setCargando(true);
      }
      setError(null);

      try {
        const data = await obtenerContextoEvaluacion(
          empresaId,
          anio,
          token,
          null
        );

        // La interfaz directa nunca consume evaluaciones provisionales de
        // una gestión legada. El estado visible es siempre el oficial.
        setContexto({
          ...data,
          gestionActiva: null,
          gestionesActivas: [],
          filas: data.filas.map((fila) => ({
            ...fila,
            evaluacionGestionActiva: null,
            estadoVigencia: fila.estadoVigenciaOficial,
            detalleVigencia: {
              ...fila.detalleVigencia,
              provisional: false,
            },
          })),
        });
      } catch (currentError) {
        setError(
          currentError instanceof Error
            ? currentError.message
            : "No fue posible cargar la evaluación."
        );
      } finally {
        if (mostrarCarga) {
          setCargando(false);
        }
      }
    },
    [anio, empresaId, token]
  );

  useEffect(() => {
    void recargar(true);
  }, [recargar]);

  useEffect(
    () =>
      escucharCambiosEvidenciaEvaluacion(() => {
        void recargar(false);
      }),
    [recargar]
  );

  const abrirPeriodo = useCallback(async () => {
    if (!empresaId || !token) return;

    setProcesando(true);
    setError(null);

    try {
      await abrirPeriodoEvaluacion(empresaId, anio, token);
      await recargar(false);
    } catch (currentError) {
      const message =
        currentError instanceof Error
          ? currentError.message
          : "No fue posible abrir el periodo.";
      setError(message);
      throw currentError;
    } finally {
      setProcesando(false);
    }
  }, [anio, empresaId, recargar, token]);

  const guardar = useCallback(
    async (evaluaciones: GuardarEvaluacionInput[]) => {
      if (!empresaId || !token || evaluaciones.length === 0) {
        return;
      }

      setProcesando(true);
      setError(null);

      try {
        const resultado = await guardarEvaluacionesDirectas(
          empresaId,
          anio,
          evaluaciones,
          token
        );
        await recargar(false);
        return resultado;
      } catch (currentError) {
        const message =
          currentError instanceof Error
            ? currentError.message
            : "No fue posible guardar las evaluaciones.";
        setError(message);
        throw currentError;
      } finally {
        setProcesando(false);
      }
    },
    [anio, empresaId, recargar, token]
  );

  return {
    contexto,
    cargando,
    procesando,
    error,
    recargar,
    abrirPeriodo,
    guardar,
  };
}
