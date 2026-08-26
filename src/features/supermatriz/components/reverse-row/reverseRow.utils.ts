import type {
  MatrixCatalogs,
  MatrixTask,
} from "../../types/supermatriz.types";
import type {
  BuilderAspectDraft,
  BuilderCategoryDraft,
  BuilderCycleDraft,
  BuilderProcessDraft,
  BuilderStandardDraft,
  BuilderTaskDraft,
} from "../../types/supermatriz.types";
import type {
  ReverseRowState,
} from "./reverseRow.types";

export function nextOrder(
  values: Array<{ orden: number }>
): number {
  return (
    Math.max(
      0,
      ...values.map((item) => item.orden)
    ) + 1
  );
}

export function emptyAspectDraft(
  catalogs: MatrixCatalogs
): BuilderAspectDraft {
  return {
    codigo: null,
    nombre: "",
    descripcion: null,
    orden: nextOrder(catalogs.aspectos),
    estado: "ACTIVO",
    planAccionEspecifico: "",
    configuracion: {
      esEvergreen: false,
      bloqueEvergreen: null,
      documentoActualizacionPeriodica: false,
      tareaEjecucionCotidiana: false,
      incluirInformeEstadoTareas: false,
      permiteNoAplica: true,
    },
    configuracionVigencia: {
      tipoFechaBase: "FECHA_ULTIMA_REVISION",
      fuentePeriodicidad: "CONFIGURACION_TECNICA",
      cantidad: 1,
      unidad: "ANIO",
      diasAlertaPrevia: 30,
      permiteFechaManual: true,
      mesFechaFija: null,
      diaFechaFija: null,
      descripcionRegla:
        "Revisión anual por defecto para aspectos nuevos sin periodicidad documental explícita.",
    },
    configuracionEvidencia: {
      requiereEvidencia: false,
      descripcionEvidencia: null,
      visibleClienteDefault: false,
    },
    configuracionRevision: {
      requiereRevisionTecnica: false,
      observaciones: null,
    },
    configuracionTareaCotidiana: null,
    palabrasClave: [],
    requisitosNormativos: [],
    reglasAprobacion: [],
  };
}

export function emptyStandardDraft(
  catalogs: MatrixCatalogs
): BuilderStandardDraft {
  return {
    codigo: null,
    nombre: "",
    descripcion: null,
    orden: nextOrder(catalogs.estandares),
    calificacionMinisterialEsperada: 0.5,
    estado: "ACTIVO",
    grupoMinisterialIds: [],
  };
}

export function emptyCategoryDraft(
  catalogs: MatrixCatalogs
): BuilderCategoryDraft {
  return {
    codigo: null,
    nombre: "",
    descripcion: null,
    orden: nextOrder(
      catalogs.categoriasEstandar
    ),
    porcentajeEsperado: null,
    estado: "ACTIVO",
  };
}

export function emptyCycleDraft(
  catalogs: MatrixCatalogs
): BuilderCycleDraft {
  return {
    codigo: "",
    nombre: "",
    orden: nextOrder(catalogs.ciclosPhva),
    porcentajeEsperado: null,
    estado: "ACTIVO",
  };
}

export function emptyProcessDraft(): BuilderProcessDraft {
  return {
    codigo: null,
    nombre: "",
    descripcion: null,
    estado: "ACTIVO",
  };
}

export function emptyTaskDraft(
  catalogs: MatrixCatalogs
): BuilderTaskDraft {
  return {
    codigo: null,
    orden: nextOrder([]),
    ejecucion: null,
    fundamentosSoportes: null,
    responsableActividad: null,
    metasEstandar: null,
    recursosAdministrativos: null,
    estado: "ACTIVO",
    categoriaGestionIds:
      catalogs.categoriasGestion.length === 1
        ? [catalogs.categoriasGestion[0].id]
        : [],
  };
}

export function initialReverseRowState(
  catalogs: MatrixCatalogs,
  task: MatrixTask | null,
  initialProcessId: number | null
): ReverseRowState {
  if (!task) {
    return {
      aspectMode: "NUEVO",
      aspectId: "",
      aspectDraft: emptyAspectDraft(catalogs),
      standardMode: "EXISTENTE",
      standardId: "",
      standardDraft: emptyStandardDraft(catalogs),
      categoryMode: "EXISTENTE",
      categoryId: "",
      categoryDraft: emptyCategoryDraft(catalogs),
      cycleMode: "EXISTENTE",
      cycleId: "",
      cycleDraft: emptyCycleDraft(catalogs),
      processMode: "EXISTENTE",
      processId: initialProcessId
        ? String(initialProcessId)
        : "",
      processDraft: emptyProcessDraft(),
      taskDraft: emptyTaskDraft(catalogs),
    };
  }

  const standard = task.aspecto.estandar;
  const category = standard.categoriaEstandar;
  const cycle = category.cicloPhva;

  return {
    aspectMode: "EXISTENTE",
    aspectId: String(task.aspectoId),
    aspectDraft: emptyAspectDraft(catalogs),
    standardMode: "EXISTENTE",
    standardId: String(standard.id),
    standardDraft: emptyStandardDraft(catalogs),
    categoryMode: "EXISTENTE",
    categoryId: String(category.id),
    categoryDraft: emptyCategoryDraft(catalogs),
    cycleMode: "EXISTENTE",
    cycleId: String(cycle.id),
    cycleDraft: emptyCycleDraft(catalogs),
    processMode: "EXISTENTE",
    processId: String(task.procesoId),
    processDraft: emptyProcessDraft(),
    taskDraft: {
      codigo: task.codigo,
      orden: task.orden,
      ejecucion: task.ejecucion,
      fundamentosSoportes:
        task.fundamentosSoportes,
      responsableActividad:
        task.responsableActividad,
      metasEstandar: task.metasEstandar,
      recursosAdministrativos:
        task.recursosAdministrativos,
      estado: task.estado,
      categoriaGestionIds:
        task.categoriasGestion.map(
          (item) =>
            item.categoriaGestionId
        ),
    },
  };
}
