import type {
  EstadoCompromiso,
  SemaforoCompromiso,
} from "../types/consulta-compromisos.types";

export const ETIQUETA_ESTADO_COMPROMISO: Record<
  EstadoCompromiso,
  string
> = {
  EN_EJECUCION: "En ejecución",
  PENDIENTE_DE_REASIGNACION:
    "Pendiente de reasignación",
  SOLICITUD_DE_CIERRE:
    "Solicitud de cierre",
  CUMPLIDO: "Cumplido",
  CANCELADO: "Cancelado",
};

export const CLASE_ESTADO_COMPROMISO: Record<
  EstadoCompromiso,
  string
> = {
  EN_EJECUCION:
    "border-cyan-200 bg-cyan-50 text-cyan-800",
  PENDIENTE_DE_REASIGNACION:
    "border-violet-200 bg-violet-50 text-violet-800",
  SOLICITUD_DE_CIERRE:
    "border-amber-200 bg-amber-50 text-amber-900",
  CUMPLIDO:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  CANCELADO:
    "border-slate-200 bg-slate-100 text-slate-700",
};

export const ETIQUETA_SEMAFORO_COMPROMISO: Record<
  SemaforoCompromiso,
  string
> = {
  VENCIDO: "Vencido",
  PROXIMO_A_VENCER:
    "Próximo a vencer",
  VIGENTE: "Vigente",
  CERRADO: "Cerrado",
};

export const CLASE_SEMAFORO_COMPROMISO: Record<
  SemaforoCompromiso,
  string
> = {
  VENCIDO:
    "border-red-200 bg-red-50 text-red-800",
  PROXIMO_A_VENCER:
    "border-amber-200 bg-amber-50 text-amber-900",
  VIGENTE:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  CERRADO:
    "border-slate-200 bg-slate-100 text-slate-700",
};
