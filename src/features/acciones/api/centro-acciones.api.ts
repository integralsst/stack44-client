import { apiRequest } from "../../../lib/api";
import type {
  AccionCentro,
  AccionDestacada,
  AccionesDestacadasResponse,
  AccionesEmpresaResponse,
  ConsultaCentroAcciones,
  EmpresasCentroAccionesResponse,
  ResumenCentroAcciones,
} from "../types/centro-acciones.types";

function construirQuery(consulta: ConsultaCentroAcciones = {}): string {
  const query = new URLSearchParams();

  if (consulta.busqueda) query.set("busqueda", consulta.busqueda);
  if (consulta.categoria) query.set("categoria", consulta.categoria);
  if (consulta.prioridad) query.set("prioridad", consulta.prioridad);
  if (consulta.pagina) query.set("pagina", String(consulta.pagina));
  if (consulta.limite) query.set("limite", String(consulta.limite));

  const texto = query.toString();
  return texto ? `?${texto}` : "";
}

function normalizarRutaControl<T extends AccionCentro | AccionDestacada>(
  accion: T
): T {
  const tab =
    accion.tipo === "REVISION_NO_APLICA" ||
    accion.tipo === "NO_APLICA_RECHAZADO"
      ? "no-aplica"
      : accion.tipo.startsWith("APROBACION_GESTION")
        ? "aprobaciones"
        : null;

  if (!tab) return accion;

  const rutaAnterior = new URL(
    accion.accion.ruta,
    "https://stack44.local"
  );
  const anio =
    rutaAnterior.searchParams.get("anio") ??
    String(new Date().getFullYear());
  const query = new URLSearchParams({ anio, tab });
  const descripcion = accion.descripcion
    .replace("registra una nueva gestión para corregir", "registra una nueva evaluación para corregir")
    .replace("mediante una nueva gestión", "mediante una nueva evaluación");

  return {
    ...accion,
    descripcion,
    accion: {
      ...accion.accion,
      ruta: `/dashboard/empresas/${encodeURIComponent(
        accion.empresa.id
      )}/evaluacion/controles?${query.toString()}`,
    },
  };
}

export async function obtenerAccionesDestacadas(token: string) {
  const data = await apiRequest<AccionesDestacadasResponse>(
    "/api/acciones/destacadas",
    {},
    token
  );

  return {
    ...data,
    alertas: data.alertas.map(normalizarRutaControl),
  };
}

export function obtenerResumenCentroAcciones(token: string) {
  return apiRequest<ResumenCentroAcciones>(
    "/api/acciones/resumen",
    {},
    token
  );
}

export function obtenerEmpresasCentroAcciones(
  token: string,
  consulta: ConsultaCentroAcciones
) {
  return apiRequest<EmpresasCentroAccionesResponse>(
    `/api/acciones/empresas${construirQuery(consulta)}`,
    {},
    token
  );
}

export async function obtenerAccionesEmpresa(
  token: string,
  empresaId: string,
  consulta: ConsultaCentroAcciones
) {
  const data = await apiRequest<AccionesEmpresaResponse>(
    `/api/acciones/empresas/${encodeURIComponent(empresaId)}${construirQuery(consulta)}`,
    {},
    token
  );

  return {
    ...data,
    acciones: data.acciones.map(normalizarRutaControl),
  };
}
