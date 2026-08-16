import type {
  DetalleEstadoEvidenciaAspecto,
  DetalleVigenciaEvaluacion,
  EstadoCumplimientoAspecto,
  EstadoEvidenciaAspecto,
  EstadoGestionSgsst,
  ModalidadGestion,
} from "../../../types/evaluacion.types";
import type { EvidenciaEvaluacion } from "./evidencia-evaluacion.types";
import type { RevisionTecnicaDetalle } from "./revision-tecnica.types";

export type SeccionDetalleAspecto =
  | "HISTORIAL"
  | "EVIDENCIAS"
  | "REVISION_TECNICA";

export interface EvaluacionDetalleAspecto {
  id: string;
  estadoCumplimiento: EstadoCumplimientoAspecto;
  calificacionAdministrativa: number;
  observacion: string | null;
  fechaDocumento: string | null;
  fechaVencimientoCalculada: string | null;
  justificacionNoAplica: string | null;
  marcadaRevisionTecnica: boolean;
  motivoRevisionTecnica: string | null;
  revisionTecnica: RevisionTecnicaDetalle | null;
  creadaEn: string;
  actualizadaEn: string;
  anio: number;
  gestion: {
    id: string;
    fechaGestion: string;
    tipoActividad: string;
    modalidad: ModalidadGestion;
    categoriaGestion: string | null;
    profesional: string;
    estado: EstadoGestionSgsst;
    valida: boolean;
    finalizadaEn: string | null;
    invalidadaEn: string | null;
    motivoInvalidacion: string | null;
    invalidadaPor: {
      id: string;
      nombre: string;
    } | null;
  };
  usuarioRegistrador: string;
}

export interface HistorialAspectoItem
  extends EvaluacionDetalleAspecto {
  aspectoVersion: {
    id: number;
    codigo: string | null;
    nombre: string;
  };
  totalEvidencias: number;
}

export interface CompromisoHistorialAspecto {
  id: string;
  descripcion: string;
  estado: string;
  fechaLimite: string;
  creadoEn: string;
  cerradoEn: string | null;
  creadoPor: {
    id: string;
    nombre: string;
  };
  gestionOrigen: {
    fechaGestion: string;
    anio: number;
  };
  evaluacionOrigen: {
    estadoCumplimiento: string;
    calificacionAdministrativa: number;
  };
  actividades: Array<{
    id: string;
    descripcion: string;
    estado: string;
    atendidaEn: string | null;
    tipoResponsable: string;
    responsable: {
      id: string;
      nombre: string;
    };
  }>;
  progreso: {
    total: number;
    atendidas: number;
  };
  recalificaciones: Array<{
    id: string;
    estadoCumplimiento: string;
    calificacionAdministrativa: number;
    observacion: string | null;
    createdAt: string;
    usuario: {
      id: string;
      nombre: string;
    };
  }>;
  solicitudesCierre: Array<{
    id: string;
    numeroIntento: number;
    estado: string;
    solicitadaEn: string;
    decididaEn: string | null;
    mensajeCierre: string | null;
    observacionesDevolucion: string | null;
    solicitadaPor: {
      id: string;
      nombre: string;
    };
    decididaPor: {
      id: string;
      nombre: string;
    } | null;
  }>;
  eventos: Array<{
    id: string;
    tipo: "HISTORIAL" | "RECALIFICACION";
    accion: string;
    descripcion: string;
    createdAt: string;
    usuario: {
      id: string;
      nombre: string;
    };
    calificacion: number | null;
  }>;
}

export interface EvidenciaCompromisoAspecto {
  id: string;
  nombre: string;
  url: string;
  descripcion: string | null;
  fechaDocumento: string | null;
  visibleCliente: boolean;
  createdAt: string;
  creadoPor: {
    id: string;
    nombre: string;
  };
  compromiso: {
    id: string;
    descripcion: string;
    estado: string;
  };
  soporteValidoParaEvaluacionObjetivo: boolean;
}

export interface DetalleEvidenciaAspecto
  extends DetalleEstadoEvidenciaAspecto {
  evaluacionId: string;
  puedeCompletarPosteriormente: boolean;
}

export interface DetalleAspectoBaseResponse {
  empresa: {
    id: string;
    nit: string;
    nombre: string;
    ciudadPrincipal: string | null;
    claseRiesgoPrincipal: string | null;
    activo: boolean;
  };
  periodo: {
    id: string;
    anio: number;
    estado: string;
    versionSupermatriz: {
      id: number;
      nombre: string;
      estado: string;
    };
  };
  tarea: {
    id: number;
    codigo: string | null;
    orden: number;
    ejecucion: string | null;
    fundamentosSoportes: string | null;
    responsableActividad: string | null;
    metasEstandar: string | null;
    recursosAdministrativos: string | null;
    createdAt: string;
    updatedAt: string;
    versionSupermatriz: {
      id: number;
      nombre: string;
      estado: string;
    };
    proceso: {
      id: number;
      codigo: string | null;
      nombre: string;
      descripcion: string | null;
    };
    categoriasGestion: Array<{
      id: number;
      codigo: string;
      nombre: string;
      descripcion: string | null;
    }>;
    aspecto: {
      id: number;
      codigo: string | null;
      nombre: string;
      descripcion: string | null;
      planAccionEspecifico: {
        id: number;
        descripcion: string;
        estado: string;
        createdAt: string;
        updatedAt: string;
      } | null;
      configuracion: {
        esEvergreen: boolean;
        bloqueEvergreen: string | null;
        documentoActualizacionPeriodica: boolean;
        tareaEjecucionCotidiana: boolean;
        incluirInformeEstadoTareas: boolean;
        permiteNoAplica: boolean;
      } | null;
      configuracionVigencia: {
        tipoFechaBase: string;
        fuentePeriodicidad: string;
        cantidad: number | null;
        unidad: string | null;
        diasAlertaPrevia: number;
        permiteFechaManual: boolean;
        mesFechaFija: number | null;
        diaFechaFija: number | null;
        descripcionRegla: string | null;
      } | null;
      configuracionTareaCotidiana: {
        cantidadObjetivo: number;
        unidad: string;
        descripcion: string | null;
      } | null;
      configuracionEvidencia: {
        requiereEvidencia: boolean;
        descripcionEvidencia: string | null;
        visibleClienteDefault: boolean;
      } | null;
      configuracionRevision: {
        requiereRevisionTecnica: boolean;
        observaciones: string | null;
      } | null;
      reglasAprobacion: Array<{
        id: number;
        modalidad: string | null;
        tipoActividad: string | null;
        criterio: string;
        requiereAprobacion: boolean;
        vigenteDesde: string | null;
        vigenteHasta: string | null;
        estado: string;
      }>;
      palabrasClave: Array<{
        id: number;
        nombre: string;
      }>;
      requisitosNormativos: Array<{
        id: number;
        clave: string;
        norma: string;
        articulo: string | null;
        descripcion: string | null;
      }>;
      estandar: {
        id: number;
        codigo: string | null;
        nombre: string;
        descripcion: string | null;
        gruposMinisteriales: Array<{
          id: number;
          codigo: string;
          nombre: string;
        }>;
        categoriaEstandar: {
          id: number;
          codigo: string | null;
          nombre: string;
          cicloPhva: {
            id: number;
            codigo: string;
            nombre: string;
          };
        };
      };
    };
  };
  evaluacionBorrador: EvaluacionDetalleAspecto | null;
  ultimaEvaluacion: EvaluacionDetalleAspecto | null;
  detalleVigencia: DetalleVigenciaEvaluacion;
  evidenciaObjetivo: {
    evaluacionId: string;
    esBorrador: boolean;
  } | null;
  estadoEvidencia: EstadoEvidenciaAspecto;
  evidenciaPendiente: boolean;
  detalleEvidencia: DetalleEvidenciaAspecto | null;
  evidenciaPendienteObjetivo: {
    evaluacionId: string;
    esBorrador: false;
  } | null;
  permisos: {
    puedeGestionarEvidencias: boolean;
    puedeCompletarEvidenciaPendiente: boolean;
    puedeVerRevisionTecnica: boolean;
    motivoEvidencias: string | null;
  };
}

export interface DetalleAspectoResumenRapidoResponse {
  empresa: DetalleAspectoBaseResponse["empresa"];
  periodo: DetalleAspectoBaseResponse["periodo"];
  tarea: {
    id: number;
    codigo: string | null;
    orden: number;
    versionSupermatriz:
      DetalleAspectoBaseResponse["tarea"]["versionSupermatriz"];
    proceso: DetalleAspectoBaseResponse["tarea"]["proceso"];
    categoriasGestion:
      DetalleAspectoBaseResponse["tarea"]["categoriasGestion"];
    aspecto: {
      id: number;
      codigo: string | null;
      nombre: string;
    };
  };
  detalleVigencia: DetalleVigenciaEvaluacion;
  permisos: {
    puedeVerRevisionTecnica: boolean;
  };
}

export interface DetalleAspectoConfiguracionResponse {
  tarea: DetalleAspectoBaseResponse["tarea"];
  cache: {
    ttlMs: number;
  };
}

export interface HistorialPaginacion {
  pagina: number;
  limite: number;
  hayMas: boolean;
  paginaSiguiente: number | null;
}

export interface DetalleAspectoResponse
  extends DetalleAspectoBaseResponse {
  historial: HistorialAspectoItem[];
  compromisos: CompromisoHistorialAspecto[];
  evidencias: EvidenciaEvaluacion[];
  evidenciasCompromiso: EvidenciaCompromisoAspecto[];
  revisionesTecnicas: EvaluacionDetalleAspecto[];
}

export interface DetalleAspectoHistorialResponse {
  historial: HistorialAspectoItem[];
  compromisos: CompromisoHistorialAspecto[];
  paginacion: HistorialPaginacion;
}

export interface DetalleAspectoEvidenciasResponse {
  evidencias: EvidenciaEvaluacion[];
  evidenciasCompromiso: EvidenciaCompromisoAspecto[];
  evidenciaObjetivo: {
    evaluacionId: string;
    esBorrador: boolean;
  } | null;
  estadoEvidencia: EstadoEvidenciaAspecto;
  evidenciaPendiente: boolean;
  detalleEvidencia: DetalleEvidenciaAspecto | null;
  evidenciaPendienteObjetivo: {
    evaluacionId: string;
    esBorrador: false;
  } | null;
  permisos: DetalleAspectoBaseResponse["permisos"];
}

export interface DetalleAspectoRevisionResponse {
  evaluaciones: EvaluacionDetalleAspecto[];
}
