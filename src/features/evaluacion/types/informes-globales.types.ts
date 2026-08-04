import type {
  CategoriaGestionInforme,
  CodigoCategoriaGestionInforme,
  InformePeriodoVersionResumen,
} from "./informe-periodo.types";
import type { GrupoResultadosEvaluacion } from "./resultados-evaluacion.types";

export type FiltroCategoriaInformeGlobal =
  | ""
  | "TODAS"
  | CodigoCategoriaGestionInforme;

export interface EmpresaDisponibleInforme {
  id: string;
  nit: string;
  nombre: string;
  ciudadPrincipal: string | null;
  periodos: Array<{
    id: string;
    anio: number;
  }>;
}

export interface InformeGlobalVersion
  extends InformePeriodoVersionResumen {
  periodo: {
    id: string;
    anio: number;
  };
  empresa: {
    id: string;
    nit: string;
    nombre: string;
    ciudadPrincipal: string | null;
  };
}

export interface FiltrosInformesGlobales {
  buscar: string;
  empresaId: string;
  anio: string;
  fechaDesde: string;
  fechaHasta: string;
  grupo: "" | GrupoResultadosEvaluacion;
  categoria: FiltroCategoriaInformeGlobal;
  pagina: number;
  limite: number;
}

export interface InformesGlobalesResponse {
  resumen: {
    totalVersiones: number;
    empresasConInformes: number;
    ultimaGeneracion: string | null;
  };
  empresas: EmpresaDisponibleInforme[];
  categorias: CategoriaGestionInforme[];
  aniosDisponibles: number[];
  versiones: InformeGlobalVersion[];
  paginacion: {
    pagina: number;
    limite: number;
    total: number;
    totalPaginas: number;
  };
  filtrosAplicados: {
    buscar: string;
    empresaId: string | null;
    anio: number | null;
    fechaDesde: string | null;
    fechaHasta: string | null;
    grupo: GrupoResultadosEvaluacion | null;
    categoria: Exclude<FiltroCategoriaInformeGlobal, ""> | null;
  };
}