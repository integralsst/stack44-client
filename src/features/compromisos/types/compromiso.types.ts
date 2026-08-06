import type {
  EstadoCumplimientoAspecto,
} from "../../../types/evaluacion.types";

export type TipoResponsableCompromiso =
  | "PRINCIPAL"
  | "APOYO";

export type AccionPreparacionCompromiso =
  | "CREAR"
  | "VINCULAR_EXISTENTE";

export interface ResponsableCompromisoFinalizacionInput {
  usuarioResponsableId: string;
  tipo: TipoResponsableCompromiso;
  actividad: string;
}

export interface CompromisoFinalizacionInput {
  evaluacionId: string;
  descripcion: string;
  recursos?: string | null;
  fechaLimite: string;
  responsables: ResponsableCompromisoFinalizacionInput[];
}

export interface FinalizarGestionInput {
  compromisos: CompromisoFinalizacionInput[];
}

export interface EvaluacionPreparacionCompromiso {
  evaluacionId: string;
  aspectoId: number;
  aspectoCodigo: string | null;
  aspectoNombre: string;
  estadoCumplimiento: EstadoCumplimientoAspecto;
  calificacionAdministrativa: 0 | 3;
  accion: AccionPreparacionCompromiso;
  compromisoAbierto: {
    id: string;
    descripcion: string;
    fechaLimite: string;
    estado: string;
  } | null;
}

export interface ResponsableDisponibleCompromiso {
  id: string;
  nombre: string;
  rol: string;
  tipoActor: "INTERNO" | "CLIENTE";
}

export interface PreparacionFinalizacionResponse {
  gestionId: string;
  totalEvaluaciones: number;
  requiereCompromisos: boolean;
  totalRequierenCompromiso: number;
  totalNuevos: number;
  totalVinculados: number;
  evaluaciones: EvaluacionPreparacionCompromiso[];
  recalificacionesCumplidas: Array<{
    evaluacionId: string;
    aspectoId: number;
    aspectoCodigo: string | null;
    aspectoNombre: string;
    compromisoId: string;
  }>;
  responsablesDisponibles:
    ResponsableDisponibleCompromiso[];
}

export interface FinalizacionGestionResponse {
  id: string;
  estado: "FINALIZADA";
  finalizadaEn: string;
  compromisosCreados: number;
  evaluacionesVinculadas: number;
  revisionesTecnicasCreadas: number;
}
