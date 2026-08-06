export interface ApoyoCompromisoDraft {
  key: string;
  usuarioResponsableId: string;
  actividad: string;
}

export interface CompromisoFinalizacionDraft {
  descripcion: string;
  recursos: string;
  fechaLimite: string;
  responsablePrincipalId: string;
  actividadPrincipal: string;
  apoyos: ApoyoCompromisoDraft[];
}

export type CompromisosFinalizacionDraft = Record<
  string,
  CompromisoFinalizacionDraft
>;
