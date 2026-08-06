import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import { listarCompromisos } from "../api/consulta-compromisos.api";
import type {
  AlcanceCompromisos,
  ConsultaCompromisosResponse,
  FiltrosCompromisos,
} from "../types/consulta-compromisos.types";

export function useCompromisos(
  alcance: AlcanceCompromisos,
  filtros: FiltrosCompromisos
) {
  const { token } = useAuth();
  const [pagina, setPagina] = useState(1);
  const [data, setData] =
    useState<ConsultaCompromisosResponse | null>(
      null
    );
  const [cargando, setCargando] =
    useState(true);
  const [error, setError] =
    useState<string | null>(null);
  const solicitudActual = useRef(0);

  const cargar = useCallback(async (
    signal?: AbortSignal
  ) => {
    if (!token) {
      return;
    }

    const solicitudId =
      ++solicitudActual.current;

    setCargando(true);
    setError(null);

    try {
      const resultado =
        await listarCompromisos(
          {
            alcance,
            pagina,
            filtros,
          },
          token,
          signal
        );

      if (
        !signal?.aborted &&
        solicitudId === solicitudActual.current
      ) {
        setData(resultado);
      }
    } catch (currentError) {
      if (
        !signal?.aborted &&
        solicitudId === solicitudActual.current
      ) {
        setError(
          currentError instanceof Error
            ? currentError.message
            : "No fue posible consultar los compromisos."
        );
      }
    } finally {
      if (
        !signal?.aborted &&
        solicitudId === solicitudActual.current
      ) {
        setCargando(false);
      }
    }
  }, [
    alcance,
    filtros,
    pagina,
    token,
  ]);

  useEffect(() => {
    const controller = new AbortController();
    void cargar(controller.signal);

    return () => {
      controller.abort();
    };
  }, [cargar]);

  const cambiarPagina = useCallback(
    (siguientePagina: number) => {
      setPagina(
        Math.max(1, siguientePagina)
      );
    },
    []
  );

  const reiniciarPagina = useCallback(() => {
    setPagina(1);
  }, []);

  return {
    data,
    pagina,
    cargando,
    error,
    cambiarPagina,
    reiniciarPagina,
    recargar: cargar,
  };
}
