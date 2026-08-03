import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import {
  abrirPeriodoEvaluacion,
  crearGestionEvaluacion,
  finalizarGestionEvaluacion,
  guardarEvaluaciones,
  obtenerContextoEvaluacion,
} from "../api/evaluacion.api";
import type {
  ContextoEvaluacionResponse,
  CrearGestionInput,
  GuardarEvaluacionInput,
} from "../../../types/evaluacion.types";

interface RecargarEvaluacionOptions {
  mostrarCarga?: boolean;
}

export function useEvaluacionEmpresa(
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
    async (
      options: RecargarEvaluacionOptions = {}
    ) => {
      if (!empresaId || !token) {
        return;
      }

      const mostrarCarga = options.mostrarCarga ?? true;

      if (mostrarCarga) {
        setCargando(true);
      }
      setError(null);

      try {
        const data = await obtenerContextoEvaluacion(
          empresaId,
          anio,
          token
        );
        setContexto(data);
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
    void recargar({ mostrarCarga: true });
  }, [recargar]);

  const ejecutar = useCallback(
    async (action: () => Promise<unknown>) => {
      setProcesando(true);
      setError(null);

      try {
        await action();
        await recargar({ mostrarCarga: false });
      } catch (currentError) {
        const message =
          currentError instanceof Error
            ? currentError.message
            : "No fue posible completar la operación.";
        setError(message);
        throw currentError;
      } finally {
        setProcesando(false);
      }
    },
    [recargar]
  );

  const abrirPeriodo = useCallback(async () => {
    if (!empresaId || !token) return;

    await ejecutar(() =>
      abrirPeriodoEvaluacion(empresaId, anio, token)
    );
  }, [anio, empresaId, ejecutar, token]);

  const crearGestion = useCallback(
    async (data: CrearGestionInput) => {
      if (!contexto?.periodo || !token) return;

      await ejecutar(() =>
        crearGestionEvaluacion(
          contexto.periodo!.id,
          data,
          token
        )
      );
    },
    [contexto?.periodo, ejecutar, token]
  );

  const guardar = useCallback(
    async (evaluaciones: GuardarEvaluacionInput[]) => {
      if (!contexto?.gestionActiva || !token) return;

      await ejecutar(() =>
        guardarEvaluaciones(
          contexto.gestionActiva!.id,
          evaluaciones,
          token
        )
      );
    },
    [contexto?.gestionActiva, ejecutar, token]
  );

  const finalizar = useCallback(async () => {
    if (!contexto?.gestionActiva || !token) return;

    await ejecutar(() =>
      finalizarGestionEvaluacion(
        contexto.gestionActiva!.id,
        token
      )
    );
  }, [contexto?.gestionActiva, ejecutar, token]);

  return {
    contexto,
    cargando,
    procesando,
    error,
    recargar,
    abrirPeriodo,
    crearGestion,
    guardar,
    finalizar,
  };
}
