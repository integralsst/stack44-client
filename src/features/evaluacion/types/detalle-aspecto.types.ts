import type {
  DetalleVigenciaEvaluacion,
  EstadoCumplimientoAspecto,
  EstadoGestionSgsst,
  ModalidadGestion,
} from "../../../types/evaluacion.types";
import type { EvidenciaEvaluacion } from "./evidencia-evaluacion.types";

export interface EvaluacionDetalleAspecto {
  id: string;
  estadoCumplimiento: EstadoCumplimientoAspecto;
  calificacionAdministrativa: number;
  observacion: string | null;
  fechaDocumento: string | null;
  fechaVencimientoCalculada: string | null;
  justificacionNoAplica: string | null;
  marcadaRevisionTecnica: boolean;
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

export interface DetalleAspectoResponse {
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
  historial: HistorialAspectoItem[];
  evidencias: EvidenciaEvaluacion[];
  evidenciaObjetivo: {
    evaluacionId: string;
    esBorrador: boolean;
  } | null;
  permisos: {
    puedeGestionarEvidencias: boolean;
    motivoEvidencias: string | null;
  };
}
