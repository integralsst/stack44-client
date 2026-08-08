import type { EstadoCompromiso } from "./consulta-compromisos.types";

export type EstadoSolicitudAmpliacion =
  | "PENDIENTE"
  | "APROBADA"
  | "RECHAZADA";

export type TipoAprobadorAmpliacion =
  | "COORDINADOR"
  | "ADMINISTRADOR";

export type DecisionAmpliacion =
  | "APROBADA"
  | "RECHAZADA";

export interface DecisionAmpliacionCompromiso {
  id: string;
  tipoAprobador: TipoAprobadorAmpliacion;
  decision: DecisionAmpliacion;
  observacion: string | null;
  decididaEn: string;
  decididaPor: {
    id: string;
    nombre: string;
    rol: string;
  };
}

export interface SolicitudAmpliacionCompromiso {
  id: string;
  numeroSolicitud: number;
  fechaLimiteAnterior: string;
  fechaLimiteSolicitada: string;
  justificacion: string;
  estado: EstadoSolicitudAmpliacion;
  solicitadaEn: string;
  resueltaEn: string | null;
  solicitadaPor: {
    id: string;
    nombre: string;
    rol: string;
  };
  decisiones: DecisionAmpliacionCompromiso[];
}

export interface CompromisoRelacionado {
  id: string;
  descripcion: string;
  estado: EstadoCompromiso;
  fechaLimite: string;
  createdAt: string;
  cerradoEn: string | null;
  canceladoEn: string | null;
  anio: number;
}

export interface AdministracionCompromiso {
  compromisoId: string;
  fechaLimite: string;
  estado: EstadoCompromiso;
  cancelacion: {
    canceladoEn: string | null;
    motivo: string | null;
    canceladoPor: {
      id: string;
      nombre: string;
    } | null;
  };
  solicitudesAmpliacion: SolicitudAmpliacionCompromiso[];
  relacion: {
    anterior: CompromisoRelacionado | null;
    posteriores: CompromisoRelacionado[];
  };
  operacion: {
    puedeSolicitarAmpliacion: boolean;
    tipoAprobadorAmpliacionPendiente:
      | TipoAprobadorAmpliacion
      | null;
    puedeCancelar: boolean;
  };
}
