export interface CrearSeguimientoCompromisoInput {
  descripcion: string;
  actividadId: string | null;
  visibleCliente: boolean;
}

export interface CrearEvidenciaCompromisoInput {
  nombre: string;
  url: string;
  descripcion: string | null;
  fechaDocumento: string | null;
  visibleCliente: boolean;
  seguimientoId: string | null;
}

export interface ReasignarCompromisoInput {
  asignacionRechazadaId: string;
  nuevoUsuarioResponsableId: string;
}

export interface SolicitarAmpliacionCompromisoInput {
  fechaLimiteSolicitada: string;
  justificacion: string;
}

export interface DecidirAmpliacionCompromisoInput {
  solicitudId: string;
  decision: "APROBAR" | "RECHAZAR";
  observacion: string | null;
}

export interface FeedbackOperacionCompromiso {
  tone: "success" | "error";
  title: string;
  description: string;
}
