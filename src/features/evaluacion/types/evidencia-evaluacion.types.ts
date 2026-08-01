export interface EvidenciaEvaluacion {
  id: string;
  evaluacionId: string;
  nombre: string;
  url: string;
  descripcion: string | null;
  fechaDocumento: string | null;
  visibleCliente: boolean;
  activo: boolean;
  creadoPor: {
    id: string;
    nombre: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface EvidenciaEvaluacionFormInput {
  nombre: string;
  url: string;
  descripcion: string | null;
  fechaDocumento: string | null;
  visibleCliente: boolean;
}
