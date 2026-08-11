export type EstadoAuditoria =
  | "BORRADOR"
  | "EN_EJECUCION"
  | "FINALIZADA"
  | "CANCELADA";

export type TipoHallazgo =
  | "NO_CONFORMIDAD"
  | "OBSERVACION"
  | "OPORTUNIDAD_MEJORA";

export type EstadoHallazgo =
  | "ABIERTO"
  | "EN_GESTION"
  | "RESUELTO"
  | "CERRADO";

export type EstadoRecomendacion =
  | "PENDIENTE"
  | "EN_PROGRESO"
  | "ATENDIDA"
  | "DESCARTADA";

export interface UsuarioAuditoria {
  id: string;
  nombre: string;
  correo?: string;
  rol?: string;
}

export interface EmpresaAuditoria {
  id: string;
  nombre: string;
  nit: string;
  ciudadPrincipal?: string | null;
}

export interface AspectoAuditoria {
  id: number;
  codigo: string | null;
  nombre: string;
  estandar: {
    id: number;
    nombre: string;
  };
  tareas: Array<{
    id: number;
    proceso: {
      id: number;
      nombre: string;
    };
  }>;
}

export interface AuditoriaResumen {
  id: string;
  titulo: string;
  objetivo: string | null;
  alcance: string | null;
  fechaAuditoria: string;
  estado: EstadoAuditoria;
  createdAt: string;
  empresaPeriodo: {
    id: string;
    anio: number;
    empresa: EmpresaAuditoria;
  };
  creadoPor: {
    id: string;
    nombre: string;
  };
  resumen: {
    totalHallazgos: number;
    hallazgosAbiertos: number;
  };
}

export interface RecomendacionAuditoria {
  id: string;
  descripcion: string;
  estado: EstadoRecomendacion;
  responsableUsuarioId: string | null;
  responsable: UsuarioAuditoria | null;
  fechaObjetivo: string | null;
  atendidaEn: string | null;
  createdAt: string;
  creadoPor: {
    id: string;
    nombre: string;
  };
}

export interface SeguimientoAuditoria {
  id: string;
  descripcion: string;
  estadoHallazgo: EstadoHallazgo | null;
  estadoRecomendacion: EstadoRecomendacion | null;
  createdAt: string;
  usuario: {
    id: string;
    nombre: string;
  };
  recomendacion: {
    id: string;
    descripcion: string;
  } | null;
}

export interface HallazgoAuditoria {
  id: string;
  tipo: TipoHallazgo;
  titulo: string;
  descripcion: string;
  evidencia: string | null;
  estado: EstadoHallazgo;
  aspectoId: number | null;
  aspecto: AspectoAuditoria | null;
  responsableUsuarioId: string | null;
  responsable: UsuarioAuditoria | null;
  fechaObjetivo: string | null;
  resueltoEn: string | null;
  cerradoEn: string | null;
  createdAt: string;
  creadoPor: {
    id: string;
    nombre: string;
  };
  recomendaciones: RecomendacionAuditoria[];
  seguimientos: SeguimientoAuditoria[];
}

export interface AuditoriaDetalle extends Omit<AuditoriaResumen, "resumen"> {
  iniciadaEn: string | null;
  finalizadaEn: string | null;
  canceladaEn: string | null;
  motivoCancelacion: string | null;
  empresaPeriodo: AuditoriaResumen["empresaPeriodo"] & {
    versionSupermatriz: {
      id: number;
      nombre: string;
    };
  };
  creadoPor: UsuarioAuditoria;
  hallazgos: HallazgoAuditoria[];
}

export interface ListaAuditoriasResponse {
  auditorias: AuditoriaResumen[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    paginas: number;
  };
}

export interface ContextoAuditoriaEmpresa {
  empresa: EmpresaAuditoria;
  periodos: Array<{
    id: string;
    anio: number;
    estado: string;
    versionSupermatrizId: number;
    versionSupermatriz: {
      id: number;
      nombre: string;
      estado: string;
    };
  }>;
  periodoSeleccionado: {
    id: string;
    anio: number;
    estado: string;
    versionSupermatrizId: number;
  } | null;
  responsables: UsuarioAuditoria[];
  aspectos: AspectoAuditoria[];
  permisos: {
    puedeEditar: boolean;
  };
}

export interface ConsultaAuditorias {
  busqueda?: string;
  empresaId?: string;
  anio?: number;
  estado?: EstadoAuditoria | "TODAS";
  pagina?: number;
  limite?: number;
}
