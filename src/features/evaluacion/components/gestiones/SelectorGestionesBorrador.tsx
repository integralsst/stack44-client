import { Layers3 } from "lucide-react";

import type { GestionActivaEvaluacion } from "../../../../types/evaluacion.types";

interface Props {
  gestiones: GestionActivaEvaluacion[];
  gestionActivaId: string | null;
  disabled?: boolean;
  onChange: (gestionId: string) => void;
}

function nombrePersona(
  persona: { nombres: string; apellidos: string } | null
): string {
  if (!persona) return "Sin líder";
  return `${persona.nombres} ${persona.apellidos}`.trim();
}

export default function SelectorGestionesBorrador({
  gestiones,
  gestionActivaId,
  disabled = false,
  onChange,
}: Props) {
  if (gestiones.length <= 1) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-3">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-[#08090a] text-cyan-300">
          <Layers3 size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <label
            htmlFor="gestion-borrador-activa"
            className="text-xs font-bold uppercase tracking-wide text-cyan-200"
          >
            Borrador de trabajo
          </label>
          <p className="mt-1 text-[11px] leading-5 text-neutral-500">
            Tienes acceso a {gestiones.length} gestiones en borrador. Cambiar de opción no mezcla sus evaluaciones.
          </p>
          <select
            id="gestion-borrador-activa"
            value={gestionActivaId ?? ""}
            disabled={disabled}
            onChange={(event) => onChange(event.target.value)}
            className="mt-2 w-full rounded-xl border border-neutral-700 bg-[#08090a] px-3 py-2.5 text-sm font-semibold text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {gestiones.map((gestion) => (
              <option key={gestion.id} value={gestion.id}>
                {gestion.tipoActividad} · Líder: {nombrePersona(gestion.lider)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
