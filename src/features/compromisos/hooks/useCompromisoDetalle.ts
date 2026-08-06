import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import { obtenerCompromisoDetalle } from "../api/consulta-compromisos.api";
import type {
  CompromisoDetalle,
} from "../types/consulta-compromisos.types";

export function useCompromisoDetalle(
  compromisoId: string
) {
  const { token } = useAuth();
  const [data, setData] =
    useState<CompromisoDetalle | null>(
      null
    );
  const [cargando, setCargando] =
    useState(true);
  const [error, setError] =
    useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!token || !compromisoId) {
      return;
    }

    setCargando(true);
    setError(null);

    try {
      setData(
        await obtenerCompromisoDetalle(
          compromisoId,
          token
        )
      );
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible consultar el compromiso."
      );
    } finally {
      setCargando(false);
    }
  }, [compromisoId, token]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  return {
    data,
    cargando,
    error,
    recargar: cargar,
  };
}
