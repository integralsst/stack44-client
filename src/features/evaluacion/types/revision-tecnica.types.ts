import type {
  EstadoCumplimientoAspecto,
  EstadoGestionSgsst,
  ModalidadGestion,
} from "../../../types/evaluacion.types";

export type EstadoRevisionTecnica =
  | "PENDIENTE"
  | "APROBADA"
  | "REQUIERE_AJUSTES"
  | "ANULADA";

export type EstadoFlujoRevisionTecnica =
  | EstadoRevisionTecnica
  | "EN_CORRECCION"
  | "SUBSANADA";

export interface RevisionTecnicaResumen {
  total: number;
  pendientes: number;
  aprobadas: number;
  requierenAjustes: number;
  anuladas: number;
  requierenAjustesActivos: number;
  enCorreccion: number;
  subsanadas: number;
  accionesPendientes: number;
}

export interface RevisionTecnicaPersona {
  id: string;
  nombre: string;
}

export interface RevisionTecnicaEvidencia {
  id: string;
  nombre: string;
  url: string;
  descripcion: string | null;
  fechaDocumento: string | null;
  visibleCliente: boolean;
  createdAt: string;
}

export interface RevisionTecnicaGestionCorreccion {
  id: string;
  estado: EstadoGestionSgsst;
  fechaGestion: string;
  tipoActividad: string;
  profesional: string;
}

export interface RevisionTecnicaEvaluacionCorrectiva {
  id: string;
  estadoCumplimiento: EstadoCumplimientoAspecto;
  calificacionAdministrativa: number;
  observacion: string | null;
  fechaDocumento: string | null;
  creadaEn: string;
}

export interface RevisionTecnicaEvaluacionItem {
  id: string;
  estado: EstadoRevisionTecnica;
  estadoFlujo: EstadoFlujoRevisionTecnica;
  motivoSolicitud: string;
  conceptoTecnico: string | null;
  motivoAnulacion: string | null;
  solicitadaEn: string;
  revisadaEn: string | null;
  anuladaEn: string | null;
  createdAt: string;
  updatedAt: string;
  solicitadaPor: RevisionTecnicaPersona;
  revisadaPor: RevisionTecnicaPersona | null;
  puedeResolver: boolean;
  puedeCorregir: boolean;
  requiereAccion: boolean;
  gestionCorreccion: RevisionTecnicaGestionCorreccion | null;
  evaluacionCorrectiva: RevisionTecnicaEvaluacionCorrectiva | null;
  evaluacion: {
    id: string;
    creadaEn?: string | null;
    estadoCumplimiento: EstadoCumplimientoAspecto;
    calificacionAdministrativa: number;
    observacion: string | null;
    fechaDocumento: string | null;
    fechaVencimientoCalculada: string | null;
    aspecto: {
      id: number;
      codigo: string | null;
      nombre: string;
      estandar: {
        id: number;
        codigo: string | null;
        nombre: string;
      };
    };
    gestion: {
      id: string;
      fechaGestion: string;
      modalidad: ModalidadGestion;
      tipoActividad: string;
      estado: EstadoGestionSgsst;
      valida: boolean;
      categoriaGestion: {
        id: number;
        codigo: string;
        nombre: string;
      } | null;
      profesional: string;
    };
    evidencias: RevisionTecnicaEvidencia[];
  };
}

export interface RevisionesTecnicasPeriodoResponse {
  periodo: {
    id: string;
    anio: number;
    estado: string;
    empresa: {
      id: string;
      nombre: string;
      activo: boolean;
    };
  };
  resumen: RevisionTecnicaResumen;
  revisiones: RevisionTecnicaEvaluacionItem[];
}

export interface ResolverRevisionTecnicaInput {
  estado: "APROBADA" | "REQUIERE_AJUSTES";
  conceptoTecnico: string;
}

export interface ResolverRevisionTecnicaResponse {
  id: string;
  estado: "APROBADA" | "REQUIERE_AJUSTES";
  conceptoTecnico: string;
  revisadaEn: string;
  mensaje: string;
}

export interface RevisionTecnicaDetalle {
  id: string;
  estado: EstadoRevisionTecnica;
  motivoSolicitud: string;
  conceptoTecnico: string | null;
  motivoAnulacion: string | null;
  solicitadaEn: string;
  revisadaEn: string | null;
  anuladaEn: string | null;
  solicitadaPor: RevisionTecnicaPersona;
  revisadaPor: RevisionTecnicaPersona | null;
}
