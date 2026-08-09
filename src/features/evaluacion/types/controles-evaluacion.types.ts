export type EstadoDecisionNoAplica =
  | "PENDIENTE"
  | "APROBADO"
  | "RECHAZADO";

export type EstadoAprobacionGestion =
  | "PENDIENTE"
  | "APROBADA"
  | "RECHAZADA";

export interface UsuarioControlEvaluacion {
  id: string;
  nombre: string;
  correo: string;
}

export interface AspectoControlEvaluacion {
  id: number;
  codigo: string | null;
  nombre: string;
  estandar?: {
    id: number;
    codigo: string | null;
    nombre: string;
  };
}

export interface DecisionNoAplicaItem {
  id: string;
  estado: EstadoDecisionNoAplica;
  resultadoEfectivo: number;
  observacionDecision: string | null;
  solicitadaEn: string;
  decididaEn: string | null;
  solicitadaPor: UsuarioControlEvaluacion;
  decididaPor: UsuarioControlEvaluacion | null;
  puedeDecidir: boolean;
  evaluacion: {
    id: string;
    justificacionNoAplica: string | null;
    observacion: string | null;
    creadaEn: string;
    aspecto: AspectoControlEvaluacion;
    gestion: {
      id: string;
      fechaGestion: string;
      modalidad: string;
      tipoActividad: string;
      profesional: string | null;
    };
    evidencias: Array<{
      id: string;
      nombre: string;
      url: string;
      descripcion: string | null;
      fechaDocumento: string | null;
      visibleCliente: boolean;
    }>;
  };
}

export interface NoAplicaPeriodoResponse {
  periodo: {
    id: string;
    anio: number;
    empresa: {
      id: string;
      nombre: string;
      activo: boolean;
    };
  };
  resumen: {
    total: number;
    pendientes: number;
    aprobados: number;
    rechazados: number;
  };
  items: DecisionNoAplicaItem[];
}

export interface AprobacionGestionItem {
  id: string;
  estado: EstadoAprobacionGestion;
  reglasAplicadas: unknown;
  observacionDecision: string | null;
  generadaEn: string;
  decididaEn: string | null;
  decididaPor: UsuarioControlEvaluacion | null;
  puedeDecidir: boolean;
  gestion: {
    id: string;
    fechaGestion: string;
    modalidad: string;
    tipoActividad: string;
    observacionGeneral: string | null;
    usuarioCreador: UsuarioControlEvaluacion;
    profesional: {
      id: string;
      nombre: string;
    } | null;
    categoriaGestion: {
      id: number;
      codigo: string;
      nombre: string;
    } | null;
    empresa: {
      id: string;
      nit: string;
      nombre: string;
      activo: boolean;
    };
    anio: number;
  };
  evaluaciones: Array<{
    id: string;
    estadoCumplimiento: string;
    calificacionRegistrada: number;
    observacion: string | null;
    aspecto: AspectoControlEvaluacion;
  }>;
}

export interface AprobacionesGestionPeriodoResponse {
  periodo: {
    id: string;
    anio: number;
    empresa: {
      id: string;
      nombre: string;
      activo: boolean;
    };
  };
  resumen: {
    total: number;
    pendientes: number;
    aprobadas: number;
    rechazadas: number;
  };
  items: AprobacionGestionItem[];
}
