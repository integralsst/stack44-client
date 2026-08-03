import {
  Ban,
  CheckCircle2,
  Clock3,
  Wrench,
} from "lucide-react";

import type { EstadoRevisionTecnica } from "../../types/revision-tecnica.types";

const CONFIG: Record<
  EstadoRevisionTecnica,
  {
    label: string;
    className: string;
    icon: typeof Clock3;
  }
> = {
  PENDIENTE: {
    label: "Pendiente",
    className:
      "border-amber-500/25 bg-amber-500/10 text-amber-300",
    icon: Clock3,
  },
  APROBADA: {
    label: "Aprobada",
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    icon: CheckCircle2,
  },
  REQUIERE_AJUSTES: {
    label: "Requiere ajustes",
    className:
      "border-orange-500/25 bg-orange-500/10 text-orange-300",
    icon: Wrench,
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
  estado: EstadoRevisionTecnica;
}) {
  const config = CONFIG[estado];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}
