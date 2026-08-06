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

export interface FeedbackOperacionCompromiso {
  tone: "success" | "error";
  title: string;
  description: string;
}
