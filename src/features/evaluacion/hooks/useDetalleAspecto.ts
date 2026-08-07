import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import {
  obtenerConfiguracionResumenAspecto,
  obtenerEvidenciasAspecto,
  obtenerHistorialAspecto,
  obtenerResumenRapidoAspecto,
  obtenerRevisionTecnicaAspecto,
} from "../api/detalle-aspecto.api";
import {
  actualizarEvidenciaEvaluacion,
  crearEvidenciaEvaluacion,
  desactivarEvidenciaEvaluacion,
} from "../api/evidencias-evaluacion.api";
import type {
  DetalleAspectoResponse,
  DetalleAspectoResumenRapidoResponse,
  HistorialPaginacion,
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

const paginacionHistorialInicial: HistorialPaginacion = {
  pagina: 0,
  limite: 20,
  hayMas: false,
  paginaSiguiente: null,
};

function construirDetalleParcial(
  response: DetalleAspectoResumenRapidoResponse
): DetalleAspectoResponse {
  return {
    empresa: response.empresa,
    periodo: response.periodo,
    tarea: {
      ...response.tarea,
      ejecucion: null,
      fundamentosSoportes: null,
      responsableActividad: null,
      metasEstandar: null,
      recursosAdministrativos: null,
      createdAt: "",
      updatedAt: "",
      aspecto: {
        ...response.tarea.aspecto,
        descripcion: null,
        planAccionEspecifico: null,
        configuracion: null,
        configuracionVigencia: null,
        configuracionTareaCotidiana: null,
        configuracionEvidencia: null,
        configuracionRevision: null,
        reglasAprobacion: [],
        palabrasClave: [],
        requisitosNormativos: [],
        estandar: {
          id: 0,
          codigo: null,
          nombre: "Cargando configuración…",
          descripcion: null,
          gruposMinisteriales: [],
          categoriaEstandar: {
            id: 0,
            codigo: null,
            nombre: "Cargando configuración…",
            cicloPhva: {
              id: 0,
              codigo: "",
              nombre: "Cargando configuración…",
            },
          },
        },
      },
    },
    evaluacionBorrador: null,
    ultimaEvaluacion: null,
    detalleVigencia: response.detalleVigencia,
    historial: [],
    compromisos: [],
    evidencias: [],
    revisionesTecnicas: [],
    evidenciaObjetivo: null,
    permisos: {
      puedeGestionarEvidencias: false,
      puedeVerRevisionTecnica:
        response.permisos.puedeVerRevisionTecnica,
      motivoEvidencias: null,
    },
  };
}

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
  const [loadingConfiguration, setLoadingConfiguration] =
    useState(false);
  const [configurationLoaded, setConfigurationLoaded] =
    useState(false);
  const [configurationError, setConfigurationError] =
    useState<string | null>(null);
  const [historyPagination, setHistoryPagination] =
    useState<HistorialPaginacion>(
      paginacionHistorialInicial
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

  const loadConfiguration = useCallback(async () => {
    if (!open || !empresaId || !tareaId || !token) {
      return;
    }

    setLoadingConfiguration(true);
    setConfigurationError(null);

    try {
      const response =
        await obtenerConfiguracionResumenAspecto(
          empresaId,
          tareaId,
          anio,
          token
        );

      setData((current) =>
        current
          ? {
              ...current,
              tarea: response.tarea,
            }
          : current
      );
      setConfigurationLoaded(true);
    } catch (currentError) {
      setConfigurationError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar la configuración ampliada."
      );
    } finally {
      setLoadingConfiguration(false);
    }
  }, [anio, empresaId, open, tareaId, token]);

  const reload = useCallback(async () => {
    if (!open || !empresaId || !tareaId || !token) {
      return;
    }

    setLoading(true);
    setError(null);
    setConfigurationLoaded(false);
    setConfigurationError(null);

    try {
      const response = await obtenerResumenRapidoAspecto(
        empresaId,
        tareaId,
        anio,
        token
      );

      setData(construirDetalleParcial(response));
      void loadConfiguration();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar el detalle del aspecto."
      );
    } finally {
      setLoading(false);
    }
  }, [
    anio,
    empresaId,
    loadConfiguration,
    open,
    tareaId,
    token,
  ]);

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
            1,
            token
          );
          setData((current) =>
            current
              ? {
                  ...current,
                  historial: response.historial,
                  compromisos: response.compromisos,
                }
              : current
          );
          setHistoryPagination(response.paginacion);
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

  const loadMoreHistory = useCallback(async () => {
    const pagina = historyPagination.paginaSiguiente;

    if (
      !pagina ||
      !open ||
      !empresaId ||
      !tareaId ||
      !token ||
      loadingSections.HISTORIAL
    ) {
      return;
    }

    setLoadingSections((current) => ({
      ...current,
      HISTORIAL: true,
    }));
    setSectionErrors((current) => ({
      ...current,
      HISTORIAL: null,
    }));

    try {
      const response = await obtenerHistorialAspecto(
        empresaId,
        tareaId,
        anio,
        pagina,
        token
      );

      setData((current) => {
        if (!current) return current;

        const existentes = new Set(
          current.historial.map((item) => item.id)
        );
        const nuevos = response.historial.filter(
          (item) => !existentes.has(item.id)
        );

        return {
          ...current,
          historial: [
            ...current.historial,
            ...nuevos,
          ],
        };
      });
      setHistoryPagination(response.paginacion);
    } catch (currentError) {
      setSectionErrors((current) => ({
        ...current,
        HISTORIAL:
          currentError instanceof Error
            ? currentError.message
            : "No fue posible cargar más historial.",
      }));
    } finally {
      setLoadingSections((current) => ({
        ...current,
        HISTORIAL: false,
      }));
    }
  }, [
    anio,
    empresaId,
    historyPagination.paginaSiguiente,
    loadingSections.HISTORIAL,
    open,
    tareaId,
    token,
  ]);

  useEffect(() => {
    setData(null);
    setError(null);
    setConfigurationLoaded(false);
    setLoadingConfiguration(false);
    setConfigurationError(null);
    setHistoryPagination(paginacionHistorialInicial);
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
    loadConfiguration,
    loadingConfiguration,
    configurationLoaded,
    configurationError,
    loadSection,
    loadMoreHistory,
    historyPagination,
    loadingSections,
    loadedSections,
    sectionErrors,
    createEvidence,
    updateEvidence,
    removeEvidence,
  };
}
