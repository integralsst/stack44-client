import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import { listarInformesGlobales } from "../api/informes-globales.api";
import type {
  FiltrosInformesGlobales,
  InformesGlobalesResponse,
} from "../types/informes-globales.types";

const filtrosIniciales: FiltrosInformesGlobales = {
  buscar: "",
  empresaId: "",
  anio: "",
  fechaDesde: "",
  fechaHasta: "",
  grupo: "",
  categoria: "",
  pagina: 1,
  limite: 12,
};

export function useInformesGlobales() {
  const { token } = useAuth();
  const [filtros, setFiltros] =
    useState<FiltrosInformesGlobales>(filtrosIniciales);
  const [data, setData] =
    useState<InformesGlobalesResponse | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtrosConsulta = useMemo(
    () => ({ ...filtros }),
    [filtros]
  );

  const cargar = useCallback(async () => {
    if (!token) {
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const resultado = await listarInformesGlobales(
        filtrosConsulta,
        token
      );
      setData(resultado);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar los informes."
      );
    } finally {
      setCargando(false);
    }
  }, [filtrosConsulta, token]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void cargar();
    }, filtros.buscar ? 300 : 0);

    return () => window.clearTimeout(timer);
  }, [cargar, filtros.buscar]);

  const actualizarFiltro = useCallback(
    <K extends keyof FiltrosInformesGlobales>(
      campo: K,
      valor: FiltrosInformesGlobales[K]
    ) => {
      setFiltros((actuales) => ({
        ...actuales,
        [campo]: valor,
        ...(campo === "pagina" ? {} : { pagina: 1 }),
      }));
    },
    []
  );

  const limpiarFiltros = useCallback(() => {
    setFiltros(filtrosIniciales);
  }, []);

  return {
    data,
    filtros,
    cargando,
    error,
    actualizarFiltro,
    setFiltros,
    limpiarFiltros,
    recargar: cargar,
  };
}