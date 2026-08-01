export type EstadoPeriodoSgsst = "ABIERTO" | "CERRADO";

export type EstadoGestionSgsst =
  | "BORRADOR"
  | "FINALIZADA"
  | "INVALIDADA";

export type EstadoCumplimientoAspecto =
  | "CUMPLIDO"
  | "PARCIAL"
  | "NO_CUMPLIDO"
  | "NO_APLICA";

export type ModalidadGestion =
  | "PRESENCIAL"
  | "REMOTA"
  | "OFICINA"
  | "SEGUIMIENTO_PUNTUAL";

export type EstadoVigenciaEvaluacion =
  | "SIN_REVISION"
  | "NO_APLICA"
  | "VIGENTE_PERMANENTE"
  | "FALTA_FECHA_DOCUMENTO"
  | "PERIODICIDAD_NO_CONFIGURADA"
  | "VIGENTE"
  | "POR_VENCER"
  | "VENCIDO";

export interface DetalleVigenciaEvaluacion {
  estado: EstadoVigenciaEvaluacion;
  titulo: string;
  descripcion: string;
  fechaVencimiento: string | null;
  diasRestantes: number | null;
  requiereAccion: boolean;
  provisional: boolean;
}

export interface EmpresaEvaluacion {
  id: string;
  nit: string;
  nombre: string;
  ciudadPrincipal: string | null;
  claseRiesgoPrincipal: string | null;
  activo: boolean;
}

export interface VersionEvaluacion {
  id: number;
  nombre: string;
  estado: string;
  vigenteDesde?: string | null;
  vigenteHasta?: string | null;
}

export interface PeriodoEvaluacion {
  id: string;
  anio: number;
  estado: EstadoPeriodoSgsst;
  fechaApertura: string;
  fechaCierre: string | null;
  versionSupermatriz: VersionEvaluacion;
}

export interface CategoriaGestionEvaluacion {
  id: number;
  codigo:
    | "DOCUMENTAL"
    | "INTERVENCION"
    | "EMERGENCIAS";
  nombre: string;
}

export interface GestionActivaEvaluacion {
  id: string;
  fechaGestion: string;
  modalidad: ModalidadGestion;
  tipoActividad: string;
  observacionGeneral: string | null;
  estado: EstadoGestionSgsst;
  categoriaGestion:
    | CategoriaGestionEvaluacion
    | null;
  profesional: {
    id: string;
    nombres: string;
    apellidos: string;
  } | null;
}

export interface EvaluacionRegistrada {
  id: string;
  estadoCumplimiento:
    EstadoCumplimientoAspecto;
  calificacionAdministrativa: number;
  observacion: string | null;
  fechaDocumento: string | null;
  fechaVencimientoCalculada:
    | string
    | null;
  justificacionNoAplica:
    | string
    | null;
  marcadaRevisionTecnica: boolean;
  creadaEn: string;
  actualizadaEn: string;
  gestion: {
    id: string;
    fechaGestion: string;
    tipoActividad: string;
    estado: EstadoGestionSgsst;
  };
}

export interface FilaEvaluacion {
  tareaId: number;
  orden: number;
  codigo: string | null;
  ejecucion: string | null;
  proceso: {
    id: number;
    codigo: string | null;
    nombre: string;
  };
  categoriasGestion:
    CategoriaGestionEvaluacion[];
  cicloPhva: {
    id: number;
    codigo: string;
    nombre: string;
    orden: number;
  };
  categoriaEstandar: {
    id: number;
    codigo: string | null;
    nombre: string;
  };
  estandar: {
    id: number;
    codigo: string | null;
    nombre: string;
    calificacionMinisterialEsperada: number;
    gruposMinisteriales: Array<{
      id: number;
      codigo:
        | "ESTANDARES_7"
        | "ESTANDARES_21"
        | "ESTANDARES_60";
      nombre: string;
    }>;
  };
  aspecto: {
    id: number;
    codigo: string | null;
    nombre: string;
    planAccionEspecifico:
      | string
      | null;
    configuracion: {
      esEvergreen: boolean;
      documentoActualizacionPeriodica: boolean;
      incluirInformeEstadoTareas: boolean;
      permiteNoAplica: boolean;
    } | null;
    configuracionVigencia: {
      tipoFechaBase: string;
      cantidad: number | null;
      unidad: string | null;
      diasAlertaPrevia: number;
      permiteFechaManual: boolean;
      descripcionRegla: string | null;
    } | null;
    configuracionEvidencia: {
      requiereEvidencia: boolean;
      descripcionEvidencia:
        | string
        | null;
    } | null;
    configuracionRevision: {
      requiereRevisionTecnica: boolean;
      observaciones: string | null;
    } | null;
  };
  ultimaEvaluacion:
    | EvaluacionRegistrada
    | null;
  evaluacionGestionActiva:
    | EvaluacionRegistrada
    | null;
  estadoVigencia:
    EstadoVigenciaEvaluacion;
  detalleVigencia:
    DetalleVigenciaEvaluacion;
  estadoVigenciaOficial:
    EstadoVigenciaEvaluacion;
}

export interface ResumenEvaluacion {
  totalAspectos: number;
  evaluados: number;
  sinRevision: number;
  vigentes: number;
  porVencer: number;
  vencidos: number;
  pendientesVigencia: number;
  cumplimientoAdministrativo: number;
  calificacionMinisterial: number;
  calificacionMinisterialMaxima: number;
}

export interface ContextoEvaluacionResponse {
  empresa: EmpresaEvaluacion;
  anio: number;
  periodo:
    | PeriodoEvaluacion
    | null;
  versionDisponible:
    | VersionEvaluacion
    | null;
  gestionActiva:
    | GestionActivaEvaluacion
    | null;
  categoriasGestion:
    CategoriaGestionEvaluacion[];
  filas: FilaEvaluacion[];
  resumen: ResumenEvaluacion;
}

export interface CrearGestionInput {
  fechaGestion: string;
  modalidad: ModalidadGestion;
  tipoActividad: string;
  observacionGeneral?:
    | string
    | null;
  categoriaGestionId?:
    | number
    | null;
}

export interface BorradorEvaluacionAspecto {
  aspectoId: number;
  supermatrizTareaId: number;
  estadoCumplimiento:
    | EstadoCumplimientoAspecto
    | "";
  calificacionAdministrativa:
    | number
    | null;
  observacion: string;
  fechaDocumento: string;
  justificacionNoAplica: string;
  marcadaRevisionTecnica: boolean;
}

export interface GuardarEvaluacionInput {
  aspectoId: number;
  supermatrizTareaId: number;
  estadoCumplimiento:
    EstadoCumplimientoAspecto;
  calificacionAdministrativa: number;
  observacion: string | null;
  fechaDocumento: string | null;
  justificacionNoAplica:
    | string
    | null;
  marcadaRevisionTecnica: boolean;
}
