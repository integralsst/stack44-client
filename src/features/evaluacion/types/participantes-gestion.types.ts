export interface ProfesionalParticipanteGestion {
  id: string;
  nombres: string;
  apellidos: string;
  correo: string;
  cargo: string | null;
  profesion: string | null;
  rolProfesional: string | null;
  usuario: {
    id: string;
    nombre: string;
    correo: string;
    rol: string;
    activo: boolean;
  } | null;
}

export interface ParticipanteGestion {
  id: string;
  gestionId: string;
  profesionalId: string;
  esLider: boolean;
  puedeEvaluar: boolean;
  puedeGestionarEvidencias: boolean;
  responsabilidad: string | null;
  activo: boolean;
  fechaInicio: string;
  fechaFin: string | null;
  createdAt: string;
  updatedAt: string;
  profesional: ProfesionalParticipanteGestion;
  asignadoPor: {
    id: string;
    nombre: string;
  };
  retiradoPor: {
    id: string;
    nombre: string;
  } | null;
}

export interface EquipoGestionResponse {
  gestion: {
    id: string;
    estado: string;
    categoriaGestionId: number | null;
  };
  puedeAdministrarEquipo: boolean;
  participantes: ParticipanteGestion[];
}

export interface CategoriaProfesionalGestion {
  id: number;
  codigo: string;
  nombre: string;
}

export interface ProfesionalDisponibleGestion {
  profesional: ProfesionalParticipanteGestion;
  rolAsignacion: string | null;
  esProfesionalAsignado: boolean;
  categorias: CategoriaProfesionalGestion[];
  categoriasConfiguradas: boolean;
  categoriaCompatible: boolean;
  yaParticipa: boolean;
  conflictoBorrador: {
    gestionId: string;
    tipoActividad: string;
    fechaGestion: string;
  } | null;
  disponibleParaAgregar: boolean;
}

export interface CrearParticipanteGestionInput {
  profesionalId: string;
  esLider?: boolean;
  puedeEvaluar?: boolean;
  puedeGestionarEvidencias?: boolean;
  responsabilidad?: string | null;
}

export interface ActualizarParticipanteGestionInput {
  esLider?: boolean;
  puedeEvaluar?: boolean;
  puedeGestionarEvidencias?: boolean;
  responsabilidad?: string | null;
}
