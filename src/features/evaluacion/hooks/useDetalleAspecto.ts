import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import { obtenerDetalleAspecto } from "../api/detalle-aspecto.api";
import {
  actualizarEvidenciaEvaluacion,
  crearEvidenciaEvaluacion,
  desactivarEvidenciaEvaluacion,
} from "../api/evidencias-evaluacion.api";
import type { DetalleAspectoResponse } from "../types/detalle-aspecto.types";
import type {
  EvidenciaEvaluacion,
  EvidenciaEvaluacionFormInput,
} from "../types/evidencia-evaluacion.types";

export function useDetalleAspecto({
  open,
  empresaId,
  tareaId,
  anio,
}: {
  open: boolean;
  empresaId: string | undefined;
  tareaId: number | null;
  anio: number;
}) {
  const { token } = useAuth();
  const [data, setData] =
    useState<DetalleAspectoResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(
    null
  );

  const reload = useCallback(async () => {
    if (!open || !empresaId || !tareaId || !token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await obtenerDetalleAspecto(
        empresaId,
        tareaId,
        anio,
        token
      );
      setData(response);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar el detalle del aspecto."
      );
    } finally {
      setLoading(false);
    }
  }, [anio, empresaId, open, tareaId, token]);

  useEffect(() => {
    if (!open) {
      setData(null);
      setError(null);
      return;
    }

    void reload();
  }, [open, reload]);

  const runEvidenceAction = useCallback(
    async (action: () => Promise<unknown>) => {
      setBusy(true);
      setError(null);

      try {
        await action();
        await reload();
      } catch (currentError) {
        const message =
          currentError instanceof Error
            ? currentError.message
            : "No fue posible completar la operación.";
        setError(message);
        throw currentError;
      } finally {
        setBusy(false);
      }
    },
    [reload]
  );

  const createEvidence = useCallback(
    async (input: EvidenciaEvaluacionFormInput) => {
      if (
        !token ||
        !data?.evidenciaObjetivo?.evaluacionId
      ) {
        throw new Error(
          "Primero guarda la evaluación del aspecto."
        );
      }

      await runEvidenceAction(() =>
        crearEvidenciaEvaluacion(
          data.evidenciaObjetivo!.evaluacionId,
          input,
          token
        )
      );
    },
    [data?.evidenciaObjetivo, runEvidenceAction, token]
  );

  const updateEvidence = useCallback(
    async (
      evidence: EvidenciaEvaluacion,
      input: EvidenciaEvaluacionFormInput
    ) => {
      if (!token) return;

      await runEvidenceAction(() =>
        actualizarEvidenciaEvaluacion(
          evidence.id,
          input,
          token
        )
      );
    },
    [runEvidenceAction, token]
  );

  const removeEvidence = useCallback(
    async (evidence: EvidenciaEvaluacion) => {
      if (!token) return;

      await runEvidenceAction(() =>
        desactivarEvidenciaEvaluacion(
          evidence.id,
          token
        )
      );
    },
    [runEvidenceAction, token]
  );

  return {
    data,
    loading,
    busy,
    error,
    reload,
    createEvidence,
    updateEvidence,
    removeEvidence,
  };
}
