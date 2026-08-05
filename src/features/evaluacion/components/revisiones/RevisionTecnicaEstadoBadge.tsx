import {
  Ban,
  CheckCircle2,
  Clock3,
  LoaderCircle,
  ShieldCheck,
  Wrench,
} from "lucide-react";

import type { EstadoFlujoRevisionTecnica } from "../../types/revision-tecnica.types";

const CONFIG: Record<
  EstadoFlujoRevisionTecnica,
  {
    label: string;
    className: string;
    icon: typeof Clock3;
  }
> = {
  PENDIENTE: {
    label: "Pendiente",
    className:
      "border-amber-300 bg-amber-50 text-amber-800",
    icon: Clock3,
  },
  APROBADA: {
    label: "Aprobada",
    className:
      "border-emerald-300 bg-emerald-50 text-emerald-800",
    icon: CheckCircle2,
  },
  REQUIERE_AJUSTES: {
    label: "Requiere corrección",
    className:
      "border-red-300 bg-red-50 text-red-800",
    icon: Wrench,
  },
  EN_CORRECCION: {
    label: "En corrección",
    className:
      "border-cyan-300 bg-cyan-50 text-cyan-800",
    icon: LoaderCircle,
  },
  SUBSANADA: {
    label: "Subsanada",
    className:
      "border-teal-300 bg-teal-50 text-teal-800",
    icon: ShieldCheck,
  },
  ANULADA: {
    label: "Anulada",
    className:
      "border-slate-300 bg-slate-100 text-slate-700",
    icon: Ban,
  },
};

export default function RevisionTecnicaEstadoBadge({
  estado,
}: {
  estado: EstadoFlujoRevisionTecnica;
}) {
  const config = CONFIG[estado];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${config.className}`}
    >
      <Icon
        size={12}
        className={estado === "EN_CORRECCION" ? "animate-spin" : ""}
      />
      {config.label}
    </span>
  );
}
