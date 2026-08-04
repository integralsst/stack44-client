export type GrupoResultadosEvaluacion =
  | "TODOS"
  | "ESTANDARES_7"
  | "ESTANDARES_21"
  | "ESTANDARES_60";

export type EstadoMinisterialResultado =
  | "CUMPLE"
  | "NO_CUMPLE"
  | "SIN_EVALUAR";

export interface ConteoEstadosResultado {
  cumplidos: number;
  parciales: number;
  noCumplidos: number;
  noAplica: number;
  sinEvaluar: number;
}

export interface GrupoMinisterialResultado {
  id: number;
  codigo: Exclude<GrupoResultadosEvaluacion, "TODOS">;
  nombre: string;
  porcentajeEvaluable: number;
}

export interface ValidacionGrupoResultado {
  codigo: Exclude<GrupoResultadosEvaluacion, "TODOS">;
  nombre: string;
  maximoConfigurado: number;
  maximoCalculado: number;
  coincide: boolean;
}

export interface ResumenEmpresaResultado {
  totalAspectos: number;
  evaluados: number;
  coberturaPorcentaje: number;
  cumplimientoAdministrativo: number;
  estados: ConteoEstadosResultado;
  totalEstandares: number;
  estandaresCumplidos: number;
  estandaresNoCumplidos: number;
  estandaresSinEvaluar: number;
  calificacionMinisterial: number;
  calificacionMinisterialMaxima: number;
  porcentajeMinisterial: number;
}

export interface ResultadoProceso {
  id: number;
  codigo: string | null;
  nombre: string;
  totalAspectos: number;
  evaluados: number;
  coberturaPorcentaje: number;
  cumplimientoAdministrativo: number;
  estados: ConteoEstadosResultado;
  estandaresRelacionados: number;
}

export interface ResultadoEstandar {
  id: number;
  codigo: string | null;
  nombre: string;
  orden: number;
  categoria: {
    id: number;
    codigo: string | null;
    nombre: string;
    orden: number;
  };
  cicloPhva: {
    id: number;
    codigo: string;
    nombre: string;
    orden: number;
  };
  gruposMinisteriales: GrupoMinisterialResultado[];
  procesos: Array<{
    id: number;
    codigo: string | null;
    nombre: string;
  }>;
  totalAspectos: number;
  evaluados: number;
  coberturaPorcentaje: number;
  cumplimientoAdministrativo: number;
  estados: ConteoEstadosResultado;
  estadoMinisterial: EstadoMinisterialResultado;
  calificacionMinisterialEsperada: number;
  calificacionMinisterialObtenida: number;
}

export interface ResultadosEvaluacionResponse {
  empresa: {
    id: string;
    nit: string;
    nombre: string;
    ciudadPrincipal: string | null;
    claseRiesgoPrincipal: string | null;
    activo: boolean;
  };
  periodo: {
    id: string;
    anio: number;
    estado: "ABIERTO" | "CERRADO";
    fechaApertura: string;
    fechaCierre: string | null;
    versionSupermatriz: {
      id: number;
      nombre: string;
    };
  } | null;
  grupo: GrupoResultadosEvaluacion;
  gruposDisponibles: GrupoMinisterialResultado[];
  validacionGrupo: ValidacionGrupoResultado | null;
  resumenEmpresa: ResumenEmpresaResultado | null;
  procesos: ResultadoProceso[];
  estandares: ResultadoEstandar[];
  calculadoEn: string;
}