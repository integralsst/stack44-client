export type AlcanceCompromisos =
  | "SUPERVISION"
  | "MIS_COMPROMISOS";

export type EstadoCompromiso =
  | "EN_EJECUCION"
  | "PENDIENTE_DE_REASIGNACION"
  | "SOLICITUD_DE_CIERRE"
  | "CUMPLIDO"
  | "CANCELADO";

export type SemaforoCompromiso =
  | "VENCIDO"
  | "PROXIMO_A_VENCER"
  | "VIGENTE"
  | "CERRADO";

export type FiltroVencimientoCompromiso =
  | "TODOS"
  | "VENCIDOS"
  | "PROXIMOS_30_DIAS"
  | "VIGENTES"
  | "CERRADOS";

export interface FiltrosCompromisos {
  busqueda: string;
  empresa: string;
  responsable: string;
  proceso: string;
  aspecto: string;
  estado: "" | "ABIERTOS" | EstadoCompromiso;
  vencimiento: FiltroVencimientoCompromiso;
}

export const FILTROS_COMPROMISOS_INICIALES: FiltrosCompromisos = {
  busqueda: "",
  empresa: "",
  responsable: "",
  proceso: "",
  aspecto: "",
  estado: "",
  vencimiento: "TODOS",
};

export interface UsuarioResponsableCompromiso {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
}

export interface ResponsableCompromisoListado {
  id: string;
  tipo: "PRINCIPAL" | "APOYO";
  estado: "ASIGNADA" | "RECHAZADA" | "REEMPLAZADA";
  asignadoEn: string;
  rechazadoEn: string | null;
  motivoRechazo: string | null;
  reemplazaAId: string | null;
  usuarioResponsable:
    UsuarioResponsableCompromiso;
  actividad: {
    id: string;
    descripcion: string;
    estado: string;
    atendidaEn: string | null;
  } | null;
}

export interface CompromisoListado {
  id: string;
  descripcion: string;
  recursos: string | null;
  fechaLimite: string;
  estado: EstadoCompromiso;
  semaforo: SemaforoCompromiso;
  createdAt: string;
  updatedAt: string;
  empresa: {
    id: string;
    nombre: string;
    nit: string;
  };
  aspecto: {
    id: number;
    codigo: string | null;
    nombre: string;
  };
  proceso: {
    id: number;
    codigo: string | null;
    nombre: string;
  } | null;
  gestionOrigen: {
    id: string;
    fechaGestion: string;
    tipoActividad: string;
  };
  responsables:
    ResponsableCompromisoListado[];
}

export interface ResumenCompromisos {
  total: number;
  abiertos: number;
  vencidos: number;
  proximosAVencer: number;
  cumplidos: number;
}

export interface PaginacionCompromisos {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
}

export interface ConsultaCompromisosResponse {
  alcance: AlcanceCompromisos;
  resumen: ResumenCompromisos;
  paginacion: PaginacionCompromisos;
  compromisos: CompromisoListado[];
}

export interface CompromisoDetalle
  extends CompromisoListado {
  evaluacionOrigen: {
    id: string;
    estadoCumplimiento: string;
    calificacionAdministrativa: number;
    observacion: string | null;
    createdAt: string;
  };
  evaluacionesSeguimiento: Array<{
    createdAt: string;
    evaluacion: {
      id: string;
      estadoCumplimiento: string;
      calificacionAdministrativa: number;
      observacion: string | null;
      createdAt: string;
    };
  }>;
  seguimientos: Array<{
    id: string;
    fechaSeguimiento: string;
    descripcion: string;
    origen: "INTERNO" | "CLIENTE";
    visibleCliente: boolean;
    actividadId: string | null;
    usuario: {
      id: string;
      nombre: string;
      rol: string;
    };
  }>;
  evidencias: Array<{
    id: string;
    nombre: string;
    url: string;
    descripcion: string | null;
    fechaDocumento: string | null;
    visibleCliente: boolean;
    createdAt: string;
    creadoPor: {
      id: string;
      nombre: string;
    };
  }>;
  historial: Array<{
    id: string;
    entidadTipo: string;
    entidadId: string | null;
    accion: string;
    descripcion: string | null;
    createdAt: string;
    usuario: {
      id: string;
      nombre: string;
      rol: string;
    };
  }>;
  solicitudesCierre: Array<{
    id: string;
    numeroIntento: number;
    estado: "PENDIENTE" | "APROBADA" | "DEVUELTA";
    solicitadaEn: string;
    decididaEn: string | null;
    mensajeCierre: string | null;
    observacionesDevolucion: string | null;
    solicitadaPor: {
      id: string;
      nombre: string;
    };
    decididaPor: {
      id: string;
      nombre: string;
    } | null;
    evaluacionRecalificacion: {
      id: string;
      calificacionAdministrativa: number;
      estadoCumplimiento: string;
      createdAt: string;
    };
  }>;
  progreso: {
    actividadesTotal: number;
    actividadesAtendidas: number;
    actividadesPendientes: number;
    evidencias: number;
    aspectoRecalificadoEnCinco: boolean;
    evaluacionRecalificacionId: string | null;
    listoParaSolicitarCierre: boolean;
  };
  operacion: {
    puedeRegistrarSeguimiento: boolean;
    puedeCargarEvidencia: boolean;
    puedeGestionarActividades: boolean;
    puedeRechazarAsignacion: boolean;
    puedeReasignar: boolean;
    puedeSolicitarCierre: boolean;
    puedeDecidirCierre: boolean;
    esSupervisor: boolean;
    usuarioId: string;
    motivoBloqueoCierre: string | null;
  };
  responsablesDisponibles: Array<{
    id: string;
    nombre: string;
    rol: string;
    tipoActor: "INTERNO" | "CLIENTE";
  }>;
}
