import {
  useCallback,
  useEffect,
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

  const cargar = useCallback(async () => {
    if (!token) {
      return;
    }

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
          token
        );

      setData(resultado);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible consultar los compromisos."
      );
    } finally {
      setCargando(false);
    }
  }, [
    alcance,
    filtros,
    pagina,
    token,
  ]);

  useEffect(() => {
    void cargar();
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
