import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import {
  obtenerEvidenciasAspecto,
  obtenerHistorialAspecto,
  obtenerResumenAspecto,
  obtenerRevisionTecnicaAspecto,
} from "../api/detalle-aspecto.api";
import {
  actualizarEvidenciaEvaluacion,
  crearEvidenciaEvaluacion,
  desactivarEvidenciaEvaluacion,
} from "../api/evidencias-evaluacion.api";
import type {
  DetalleAspectoResponse,
  SeccionDetalleAspecto,
} from "../types/detalle-aspecto.types";
import type {
  EvidenciaEvaluacion,
  EvidenciaEvaluacionFormInput,
} from "../types/evidencia-evaluacion.types";

const estadoSeccionesInicial = {
  HISTORIAL: false,
  EVIDENCIAS: false,
  REVISION_TECNICA: false,
};

const erroresSeccionesInicial = {
  HISTORIAL: null,
  EVIDENCIAS: null,
  REVISION_TECNICA: null,
};

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
  const [loadingSections, setLoadingSections] =
    useState<Record<SeccionDetalleAspecto, boolean>>(
      estadoSeccionesInicial
    );
  const [loadedSections, setLoadedSections] =
    useState<Record<SeccionDetalleAspecto, boolean>>(
      estadoSeccionesInicial
    );
  const [sectionErrors, setSectionErrors] =
    useState<Record<
      SeccionDetalleAspecto,
      string | null
    >>(erroresSeccionesInicial);

  const reload = useCallback(async () => {
    if (!open || !empresaId || !tareaId || !token) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await obtenerResumenAspecto(
        empresaId,
        tareaId,
        anio,
        token
      );

      setData((current) => ({
        ...response,
        historial: current?.historial ?? [],
        evidencias: current?.evidencias ?? [],
        revisionesTecnicas:
          current?.revisionesTecnicas ?? [],
      }));
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

  const loadSection = useCallback(
    async (
      section: SeccionDetalleAspecto,
      force = false
    ) => {
      if (
        !open ||
        !empresaId ||
        !tareaId ||
        !token ||
        (!force && loadedSections[section]) ||
        loadingSections[section]
      ) {
        return;
      }

      setLoadingSections((current) => ({
        ...current,
        [section]: true,
      }));
      setSectionErrors((current) => ({
        ...current,
        [section]: null,
      }));

      try {
        if (section === "HISTORIAL") {
          const response = await obtenerHistorialAspecto(
            empresaId,
            tareaId,
            anio,
            token
          );
          setData((current) =>
            current
              ? {
                  ...current,
                  historial: response.historial,
                }
              : current
          );
        }

        if (section === "EVIDENCIAS") {
          const response = await obtenerEvidenciasAspecto(
            empresaId,
            tareaId,
            anio,
            token
          );
          setData((current) =>
            current
              ? {
                  ...current,
                  evidencias: response.evidencias,
                  evidenciaObjetivo:
                    response.evidenciaObjetivo,
                  permisos: response.permisos,
                }
              : current
          );
        }

        if (section === "REVISION_TECNICA") {
          const response =
            await obtenerRevisionTecnicaAspecto(
              empresaId,
              tareaId,
              anio,
              token
            );
          setData((current) =>
            current
              ? {
                  ...current,
                  revisionesTecnicas:
                    response.evaluaciones,
                }
              : current
          );
        }

        setLoadedSections((current) => ({
          ...current,
          [section]: true,
        }));
      } catch (currentError) {
        setSectionErrors((current) => ({
          ...current,
          [section]:
            currentError instanceof Error
              ? currentError.message
              : "No fue posible cargar esta sección.",
        }));
      } finally {
        setLoadingSections((current) => ({
          ...current,
          [section]: false,
        }));
      }
    },
    [
      anio,
      empresaId,
      loadedSections,
      loadingSections,
      open,
      tareaId,
      token,
    ]
  );

  useEffect(() => {
    setData(null);
    setError(null);
    setLoadedSections(estadoSeccionesInicial);
    setLoadingSections(estadoSeccionesInicial);
    setSectionErrors(erroresSeccionesInicial);

    if (open) {
      void reload();
    }
  }, [open, reload, tareaId]);

  const runEvidenceAction = useCallback(
    async (action: () => Promise<unknown>) => {
      setBusy(true);
      setError(null);

      try {
        await action();
        await loadSection("EVIDENCIAS", true);
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
    [loadSection]
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
    loadSection,
    loadingSections,
    loadedSections,
    sectionErrors,
    createEvidence,
    updateEvidence,
    removeEvidence,
  };
}
