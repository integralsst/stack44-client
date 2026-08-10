import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
} from "lucide-react";

import type { EmpresaCentroAcciones } from "../types/centro-acciones.types";

const ESTADOS = {
  URGENTE: {
    icon: AlertTriangle,
    label: "Urgente",
    wrapper: "border-red-200 bg-red-50/60",
    iconBox: "bg-red-100 text-red-700",
    badge: "bg-red-100 text-red-800",
  },
  PENDIENTE: {
    icon: Clock3,
    label: "Pendiente",
    wrapper: "border-amber-200 bg-amber-50/50",
    iconBox: "bg-amber-100 text-amber-700",
    badge: "bg-amber-100 text-amber-800",
  },
  AL_DIA: {
    icon: CheckCircle2,
    label: "Al día",
    wrapper: "border-emerald-200 bg-emerald-50/50",
    iconBox: "bg-emerald-100 text-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
  },
} as const;

export default function EmpresaAccionesItem({
  empresa,
  onOpen,
}: {
  empresa: EmpresaCentroAcciones;
  onOpen: () => void;
}) {
  const estado = ESTADOS[empresa.estado];
  const Icon = estado.icon;

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${estado.wrapper}`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${estado.iconBox}`}
      >
        <Icon size={18} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-extrabold text-slate-950">
            {empresa.nombre}
          </p>
          <span
            className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${estado.badge}`}
          >
            {estado.label}
          </span>
        </div>
        <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
          <span>NIT {empresa.nit}</span>
          {empresa.ciudadPrincipal && <span>{empresa.ciudadPrincipal}</span>}
          {empresa.total > 0 ? (
            <span>
              {empresa.urgentes > 0
                ? `${empresa.urgentes} urgente(s) · `
                : ""}
              {empresa.total} acción(es)
            </span>
          ) : (
            <span>Sin acciones pendientes</span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {empresa.total > 0 && (
          <span className="min-w-7 rounded-full bg-white px-2 py-1 text-center text-xs font-black text-slate-900 shadow-sm">
            {empresa.total}
          </span>
        )}
        <ChevronRight size={17} className="text-slate-500" />
      </div>
    </button>
  );
}
