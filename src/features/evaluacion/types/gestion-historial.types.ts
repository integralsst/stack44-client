import type {
  EstadoGestionSgsst,
  ModalidadGestion,
} from "./evaluacion.types";

export interface GestionHistorialEvaluacion {
  id: string;
  fechaGestion: string;
  modalidad: ModalidadGestion;
  tipoActividad: string;
  observacionGeneral: string | null;
  estado: EstadoGestionSgsst;
  valida: boolean;
  finalizadaEn: string | null;
  invalidadaEn: string | null;
  motivoInvalidacion: string | null;
  responsable: string;
  categoriaGestion: {
    id: number;
    codigo: string;
    nombre: string;
  } | null;
  totalEvaluaciones: number;
  creadaEn: string;
  invalidacion: {
    usuario: {
      id: string;
      nombre: string;
    };
    fecha: string;
    descripcion: string | null;
  } | null;
  puedeInvalidar: boolean;
}

export interface HistorialGestionesResponse {
  periodo: {
    id: string;
    anio: number;
    estado: "ABIERTO" | "CERRADO";
  };
  gestiones: GestionHistorialEvaluacion[];
}

export interface InvalidarGestionInput {
  motivo: string;
}

export interface InvalidarGestionResponse {
  id: string;
  estado: "INVALIDADA";
  valida: false;
  invalidadaEn: string;
  motivoInvalidacion: string;
  mensaje: string;
}
