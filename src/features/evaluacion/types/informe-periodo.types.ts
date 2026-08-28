import type {
  GrupoResultadosEvaluacion,
  ResultadosEvaluacionResponse,
} from "./resultados-evaluacion.types";

export type CodigoCategoriaGestionInforme =
  | "DOCUMENTAL"
  | "INTERVENCION"
  | "EMERGENCIAS";

export interface CategoriaGestionInforme {
  id: number;
  codigo: CodigoCategoriaGestionInforme;
  nombre: string;
}

export interface UsuarioGeneradorInforme {
  id: string;
  nombre: string;
  correo: string;
}

export interface InformePeriodoVersionResumen {
  id: string;
  numeroVersion: number;
  titulo: string;
  grupo: GrupoResultadosEvaluacion;
  categoriasGestion: CodigoCategoriaGestionInforme[];
  motivoVersion: string | null;
  fechaCorte: string;
  ultimaActualizacionFuente: string | null;
  totalGestionesFuente: number;
  totalEvaluacionesFuente: number;
  registrosHistoricosPosteriores: number;
  cumplimientoAdministrativo: number | null;
  calificacionMinisterial: number | null;
  calificacionMinisterialMaxima: number | null;
  coberturaPorcentaje: number | null;
  generadoPor: UsuarioGeneradorInforme;
  createdAt: string;
}

export interface InformesPeriodoResponse {
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
    versionSupermatriz: {
      id: number;
      nombre: string;
    };
  } | null;
  categorias: CategoriaGestionInforme[];
  versiones: InformePeriodoVersionResumen[];
}

export interface FuenteSnapshotInforme {
  totalGestionesFuente: number;
  totalEvaluacionesRegistradas: number;
  totalEvaluacionesDirectas?: number;
  usaEvaluacionDirecta?: boolean;
  modelo?: "EVALUACIONES_POR_ASPECTO" | "GESTIONES_LEGADAS";
  totalRegistrosEvaluacion?: number;
  registrosHistoricosPosteriores: number;
  ultimaActualizacionFuente: string | null;
}

export interface AspectoEvidenciaPendienteInforme {
  evaluacionId: string;
  aspectoId: number;
  aspectoCodigo: string | null;
  aspectoNombre: string;
  estandar: {
    id: number;
    codigo: string | null;
    nombre: string;
  };
}

export interface EstadoDocumentalSnapshotInforme {
  evidenciasPendientes: number;
  aspectosPendientes: AspectoEvidenciaPendienteInforme[];
}

export interface SnapshotInformePeriodo {
  schemaVersion: number;
  tipo: "INFORME_PERIODO_SGSST";
  fechaCorte: string;
  filtros: {
    grupo: GrupoResultadosEvaluacion;
    categoriasGestion: CodigoCategoriaGestionInforme[];
  };
  fuente: FuenteSnapshotInforme;
  resultado: ResultadosEvaluacionResponse;
  estadoDocumental?: EstadoDocumentalSnapshotInforme;
}

export interface InformePeriodoDetalle
  extends InformePeriodoVersionResumen {
  anio: number;
  snapshot: SnapshotInformePeriodo;
}

export interface GenerarInformePeriodoInput {
  titulo?: string;
  grupo: GrupoResultadosEvaluacion;
  categoriasGestion: CodigoCategoriaGestionInforme[];
  motivoVersion?: string;
}