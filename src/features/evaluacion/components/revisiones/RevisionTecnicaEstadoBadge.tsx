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
      "border-amber-500/30 bg-amber-500/10 text-amber-300",
    icon: Clock3,
  },
  APROBADA: {
    label: "Aprobada",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    icon: CheckCircle2,
  },
  REQUIERE_AJUSTES: {
    label: "Requiere corrección",
    className:
      "border-red-500/35 bg-red-500/10 text-red-300",
    icon: Wrench,
  },
  EN_CORRECCION: {
    label: "En corrección",
    className:
      "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    icon: LoaderCircle,
  },
  SUBSANADA: {
    label: "Subsanada",
    className:
      "border-teal-500/30 bg-teal-500/10 text-teal-300",
    icon: ShieldCheck,
  },
  ANULADA: {
    label: "Anulada",
    className:
      "border-neutral-700 bg-neutral-800/70 text-neutral-400",
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
