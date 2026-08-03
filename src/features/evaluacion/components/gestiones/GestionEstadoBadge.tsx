import {
  CheckCircle2,
  XCircle,
} from "lucide-react";

import type { EstadoGestionSgsst } from "../../types/evaluacion.types";

export default function GestionEstadoBadge({
  estado,
}: {
  estado: EstadoGestionSgsst;
}) {
  if (estado === "INVALIDADA") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-red-200">
        <XCircle size={12} />
        Invalidada
      </span>
    );
  }

  if (estado === "FINALIZADA") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-200">
        <CheckCircle2 size={12} />
        Finalizada
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-cyan-200">
      Borrador
    </span>
  );
}
