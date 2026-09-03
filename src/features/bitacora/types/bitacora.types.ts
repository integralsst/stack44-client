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

export interface AnalizarBitacoraShadowInput {
  fechaEfectiva: string;
  contenido: string;
  modalidad?: ModalidadBitacora | null;
  tipoActividad?: string | null;
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
  fechaEfectiva: string;
  fechaDocumento: string | null;
  justificacionTecnica: string;
  reglaAplicada: string | null;
  confianza: number;
  informacionFaltante: string[];
  requiereEvidenciaDocumental: boolean;
  requiereRevisionTecnica: boolean;
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
