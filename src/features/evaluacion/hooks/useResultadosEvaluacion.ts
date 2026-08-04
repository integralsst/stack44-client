import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import { obtenerResultadosEvaluacion } from "../api/resultados-evaluacion.api";
import type {
  GrupoResultadosEvaluacion,
  ResultadosEvaluacionResponse,
} from "../types/resultados-evaluacion.types";

export function useResultadosEvaluacion(
  empresaId: string | undefined,
  anio: number,
  enabled: boolean
) {
  const { token } = useAuth();
  const [grupo, setGrupo] =
    useState<GrupoResultadosEvaluacion>("TODOS");
  const [data, setData] =
    useState<ResultadosEvaluacionResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!enabled || !empresaId || !token) {
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const resultado = await obtenerResultadosEvaluacion(
        empresaId,
        anio,
        grupo,
        token
      );
      setData(resultado);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar los resultados."
      );
    } finally {
      setCargando(false);
    }
  }, [anio, enabled, empresaId, grupo, token]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  useEffect(() => {
    setGrupo("TODOS");
    setData(null);
    setError(null);
  }, [anio, empresaId]);

  return {
    grupo,
    setGrupo,
    data,
    cargando,
    error,
    recargar,
  };
}
