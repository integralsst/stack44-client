export type CategoriaAccionCentro =
  | "COMPROMISOS"
  | "REVISION_TECNICA"
  | "NO_APLICA"
  | "APROBACIONES"
  | "OTROS";

export type FiltroCategoriaAcciones = CategoriaAccionCentro | "TODAS";
export type FiltroPrioridadAcciones = "TODAS" | "URGENTE" | "PENDIENTE";
export type NivelAccionCentro = "ALTA" | "MEDIA" | "BAJA";

export interface ConteoCategoriasAcciones {
  COMPROMISOS: number;
  REVISION_TECNICA: number;
  NO_APLICA: number;
  APROBACIONES: number;
  OTROS: number;
}

export interface ResumenCentroAcciones {
  total: number;
  urgentes: number;
  pendientes: number;
  empresasAccesibles: number;
  empresasConAcciones: number;
  empresasAlDia: number;
  categorias: ConteoCategoriasAcciones;
  generadasEn: string;
}

export interface EmpresaCentroAcciones {
  id: string;
  nombre: string;
  nit: string;
  ciudadPrincipal: string | null;
  total: number;
  urgentes: number;
  pendientes: number;
  estado: "URGENTE" | "PENDIENTE" | "AL_DIA";
  porCategoria: ConteoCategoriasAcciones;
}

export interface AccionCentro {
  id: string;
  categoria: CategoriaAccionCentro;
  tipo: string;
  nivel: NivelAccionCentro;
  titulo: string;
  descripcion: string;
  empresa: {
    id: string;
    nombre: string;
  };
  aspecto: {
    id: number;
    nombre: string;
  };
  referencia: {
    tipo: CategoriaAccionCentro;
    id: string;
  };
  fechaReferencia: string;
  accion: {
    etiqueta: string;
    ruta: string;
  };
}

export interface PaginacionAcciones {
  pagina: number;
  limite: number;
  total: number;
  paginas: number;
}

export interface EmpresasCentroAccionesResponse {
  empresas: EmpresaCentroAcciones[];
  paginacion: PaginacionAcciones;
  generadasEn: string;
}

export interface AccionesEmpresaResponse {
  resumen: {
    total: number;
    urgentes: number;
    pendientes: number;
    categorias: ConteoCategoriasAcciones;
  };
  acciones: AccionCentro[];
  paginacion: PaginacionAcciones;
  generadasEn: string;
}

export interface ConsultaCentroAcciones {
  busqueda?: string;
  categoria?: FiltroCategoriaAcciones;
  prioridad?: FiltroPrioridadAcciones;
  pagina?: number;
  limite?: number;
}
