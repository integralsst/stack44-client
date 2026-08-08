import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import { obtenerAdministracionCompromiso } from "../api/consulta-compromisos.api";
import type { AdministracionCompromiso } from "../types/administracion-compromiso.types";

export function useAdministracionCompromiso(
  compromisoId: string
) {
  const { token } = useAuth();
  const [data, setData] =
    useState<AdministracionCompromiso | null>(null);
  const [cargando, setCargando] = useState(true);
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
        await obtenerAdministracionCompromiso(
          compromisoId,
          token
        )
      );
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible consultar la administración del compromiso."
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
