import type {
  DetalleAspectoHistorialResponse,
  DetalleAspectoResponse,
} from "./detalle-aspecto.types";

export type TipoEventoTrazabilidadAspecto =
  | "EVALUACION"
  | "NO_APLICA"
  | "APROBACION_GESTION"
  | "REVISION_TECNICA"
  | "COMPROMISO"
  | "AUDITORIA";

export interface EventoTrazabilidadAspecto {
  id: string;
  tipo: TipoEventoTrazabilidadAspecto;
  titulo: string;
  descripcion: string;
  estado: string | null;
  createdAt: string;
  usuario: {
    id: string;
    nombre: string;
  } | null;
  referencia: {
    evaluacionId: string | null;
    revisionTecnicaId: string | null;
    compromisoId: string | null;
    auditoriaId?: string | null;
    hallazgoId?: string | null;
  };
}

export type DetalleAspectoConTrazabilidad =
  DetalleAspectoResponse & {
    trazabilidad: EventoTrazabilidadAspecto[];
  };

export type DetalleAspectoHistorialConTrazabilidad =
  DetalleAspectoHistorialResponse & {
    trazabilidad: EventoTrazabilidadAspecto[];
  };
