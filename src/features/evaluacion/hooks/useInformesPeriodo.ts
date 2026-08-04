import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import {
  generarInformePeriodo,
  listarInformesPeriodo,
  obtenerDetalleInformePeriodo,
} from "../api/informes-periodo.api";
import type {
  GenerarInformePeriodoInput,
  InformePeriodoDetalle,
  InformesPeriodoResponse,
} from "../types/informe-periodo.types";

export function useInformesPeriodo(
  empresaId: string | undefined,
  anio: number,
  enabled: boolean
) {
  const { token } = useAuth();
  const [data, setData] =
    useState<InformesPeriodoResponse | null>(null);
  const [detalle, setDetalle] =
    useState<InformePeriodoDetalle | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] =
    useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!enabled || !empresaId || !token) {
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const resultado = await listarInformesPeriodo(
        empresaId,
        anio,
        token
      );
      setData(resultado);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar las versiones de informe."
      );
    } finally {
      setCargando(false);
    }
  }, [anio, enabled, empresaId, token]);

  const abrirDetalle = useCallback(
    async (informeId: string) => {
      if (!token) return;

      setCargandoDetalle(true);
      setError(null);

      try {
        const resultado = await obtenerDetalleInformePeriodo(
          informeId,
          token
        );
        setDetalle(resultado);
      } catch (currentError) {
        setError(
          currentError instanceof Error
            ? currentError.message
            : "No fue posible abrir la versión del informe."
        );
      } finally {
        setCargandoDetalle(false);
      }
    },
    [token]
  );

  const generar = useCallback(
    async (input: GenerarInformePeriodoInput) => {
      if (!empresaId || !token) {
        return null;
      }

      setProcesando(true);
      setError(null);

      try {
        const creada = await generarInformePeriodo(
          empresaId,
          anio,
          input,
          token
        );
        await recargar();
        await abrirDetalle(creada.id);
        return creada;
      } catch (currentError) {
        setError(
          currentError instanceof Error
            ? currentError.message
            : "No fue posible generar la versión del informe."
        );
        return null;
      } finally {
        setProcesando(false);
      }
    },
    [anio, abrirDetalle, empresaId, recargar, token]
  );

  useEffect(() => {
    void recargar();
  }, [recargar]);

  useEffect(() => {
    setData(null);
    setDetalle(null);
    setError(null);
  }, [anio, empresaId]);

  return {
    data,
    detalle,
    cargando,
    cargandoDetalle,
    procesando,
    error,
    recargar,
    generar,
    abrirDetalle,
    cerrarDetalle: () => setDetalle(null),
  };
}
