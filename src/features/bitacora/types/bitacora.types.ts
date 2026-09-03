export type ModalidadBitacora =
  | "PRESENCIAL"
  | "REMOTA"
  | "OFICINA"
  | "SEGUIMIENTO_PUNTUAL";

export type EstadoCumplimientoBitacora =
  | "CUMPLIDO"
  | "PARCIAL"
  | "NO_CUMPLIDO"
  | "NO_APLICA";

export type AccionAnalisisBitacora =
  | "SIN_CAMBIO"
  | "PROPONER_EVALUACION"
  | "INFORMACION_INSUFICIENTE"
  | "REQUIERE_REVISION_HUMANA";

export type EstadoProcesamientoBitacora =
  | "PENDIENTE"
  | "ANALIZANDO"
  | "ANALIZADA"
  | "REQUIERE_REVISION"
  | "APLICADA"
  | "ERROR";

export interface AnalizarBitacoraShadowInput {
  fechaEfectiva: string;
  contenido: string;
  modalidad?: ModalidadBitacora | null;
  tipoActividad?: string | null;
}

export type CrearRegistroBitacoraInput = AnalizarBitacoraShadowInput;

export interface AplicarRegistroBitacoraInput {
  excluirAspectoIds?: number[];
}

export interface AspectoCandidatoBitacora {
  aspectoId: number;
  identidadHistorica: string;
  codigo: string | null;
  nombre: string;
  puntajeRecuperacion: number;
}

export interface PropuestaAspectoBitacora {
  aspectoId: number;
  identidadHistorica: string;
  accion: AccionAnalisisBitacora;
  estadoActual: EstadoCumplimientoBitacora | null;
  estadoPropuesto: EstadoCumplimientoBitacora | null;
  calificacionAdministrativaPropuesta: 0 | 3 | 5 | null;
  evidenciaBitacora: string | null;
  evidenciasUrls: string[];
  fechaEfectiva: string;
  fechaDocumento: string | null;
  justificacionTecnica: string;
  reglaAplicada: string | null;
  confianza: number;
  informacionFaltante: string[];
  requiereEvidenciaDocumental: boolean;
  requiereRevisionTecnica: boolean;
}

export interface ResumenBitacora {
  totalAspectosAnalizados: number;
  totalEvaluacionesPropuestas: number;
  totalRequierenRevision: number;
  totalSinCambio: number;
  totalEvidenciasDetectadas: number;
  evaluaciones: PropuestaAspectoBitacora[];
  requierenRevision: PropuestaAspectoBitacora[];
  evidenciasUrls: string[];
}

export interface ResultadoBitacoraShadow {
  modo: "SHADOW";
  empresa: {
    id: string;
    nombre: string;
  };
  versionSupermatriz: {
    id: number;
    nombre: string;
  };
  registro: {
    idTemporal: string;
    fechaEfectiva: string;
    contenidoOriginal: string;
  };
  recuperacion: {
    totalCandidatos: number;
    aspectosCandidatos: AspectoCandidatoBitacora[];
  };
  analisis: {
    registroBitacoraId: string;
    modelo: string;
    versionPrompt: string;
    propuestas: PropuestaAspectoBitacora[];
  };
  escrituraRealizada: false;
}

export interface ResultadoBitacoraAsistida {
  modo: "ASISTIDA";
  empresa: {
    id: string;
    nombre: string;
  };
  registro: {
    id: string;
    fechaEfectiva: string;
    contenidoOriginal: string;
    modalidad: ModalidadBitacora | null;
    tipoActividad: string | null;
    creadoEn: string;
  };
  versionSupermatriz: {
    id: number;
    nombre: string;
  };
  recuperacion: {
    totalCandidatos: number;
    aspectosCandidatos: AspectoCandidatoBitacora[];
  };
  analisis: {
    modelo: string;
    versionPrompt: string;
    propuestas: PropuestaAspectoBitacora[];
  };
  resumen: ResumenBitacora;
  estadoProcesamiento: EstadoProcesamientoBitacora;
  escrituraEvaluacionRealizada: false;
}

export interface AplicacionBitacora {
  aplicadaEn: string;
  aplicadaPorUsuarioId: string;
  aspectoIdsExcluidos: number[];
  evaluaciones: Array<{
    id: string;
    aspectoId: number;
    gestionId: string;
  }>;
  totalEvidenciasVinculadas: number;
}

export interface ResultadoAplicarBitacora extends AplicacionBitacora {
  registroId: string;
  estado: "APLICADA";
  idempotente: boolean;
}

export interface RegistroBitacoraListado {
  id: string;
  fechaEfectiva: string;
  contenidoOriginal: string;
  modalidad: ModalidadBitacora | null;
  tipoActividad: string | null;
  autor: {
    id: string;
    nombre: string;
    rol: string;
  } | null;
  creadoEn: string;
  estadoProcesamiento: EstadoProcesamientoBitacora;
  resumen: ResumenBitacora | null;
  aplicada: boolean;
  aplicacion: AplicacionBitacora | null;
}
