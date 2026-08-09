import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import { notificarCambioCompromisos } from "../../compromisos/lib/alertas-compromisos.events";
import {
  obtenerRevisionesTecnicasPeriodo,
  resolverRevisionTecnica,
} from "../api/revisiones-tecnicas.api";
import type {
  ResolverRevisionTecnicaInput,
  RevisionesTecnicasPeriodoResponse,
} from "../types/revision-tecnica.types";

export function useRevisionesTecnicas(
  periodoId: string | null | undefined
) {
  const { token } = useAuth();
  const [data, setData] =
    useState<RevisionesTecnicasPeriodoResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recargar = useCallback(async () => {
    if (!periodoId || !token) {
      setData(null);
      return;
    }

    setCargando(true);
    setError(null);

    try {
      const response =
        await obtenerRevisionesTecnicasPeriodo(
          periodoId,
          token
        );
      setData(response);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar las revisiones técnicas."
      );
    } finally {
      setCargando(false);
    }
  }, [periodoId, token]);

  useEffect(() => {
    void recargar();
  }, [recargar]);

  const resolver = useCallback(
    async (
      revisionId: string,
      input: ResolverRevisionTecnicaInput
    ) => {
      if (!token) {
        throw new Error("La sesión no está disponible.");
      }

      setProcesando(true);
      setError(null);

      try {
        const response = await resolverRevisionTecnica(
          revisionId,
          input,
          token
        );
        await recargar();
        notificarCambioCompromisos();
        return response;
      } catch (currentError) {
        const message =
          currentError instanceof Error
            ? currentError.message
            : "No fue posible resolver la revisión técnica.";
        setError(message);
        throw currentError;
      } finally {
        setProcesando(false);
      }
    },
    [recargar, token]
  );

  return {
    data,
    cargando,
    procesando,
    error,
    recargar,
    resolver,
  };
}
