import { apiRequest } from "../../../lib/api";
import type {
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

export function obtenerAccionesDestacadas(token: string) {
  return apiRequest<AccionesDestacadasResponse>(
    "/api/acciones/destacadas",
    {},
    token
  );
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

export function obtenerAccionesEmpresa(
  token: string,
  empresaId: string,
  consulta: ConsultaCentroAcciones
) {
  return apiRequest<AccionesEmpresaResponse>(
    `/api/acciones/empresas/${encodeURIComponent(empresaId)}${construirQuery(consulta)}`,
    {},
    token
  );
}
