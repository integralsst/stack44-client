import {
  Layers3,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import AppDropdownSelect from "../../../../components/ui/AppDropdownSelect";
import type { GestionActivaEvaluacion } from "../../../../types/evaluacion.types";

interface Props {
  gestiones: GestionActivaEvaluacion[];
  gestionActivaId: string | null;
  disabled?: boolean;
  loading?: boolean;
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
  loading = false,
  onChange,
}: Props) {
  if (gestiones.length <= 1) {
    return null;
  }

  const options = gestiones.map((gestion) => ({
    value: gestion.id,
    label: gestion.tipoActividad,
    description: `Líder: ${nombrePersona(gestion.lider)}${
      gestion.categoriaGestion
        ? ` · ${gestion.categoriaGestion.nombre}`
        : ""
    }`,
    leadingIcon: gestion.participacionActual?.esLider ? (
      <ShieldCheck size={15} className="text-emerald-400" />
    ) : (
      <UserRound size={15} className="text-cyan-400" />
    ),
  }));

  return (
    <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/[0.08] via-[#101112] to-[#101112] p-3 shadow-lg shadow-black/10 sm:p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-500/20 bg-[#08090a] text-cyan-300 shadow-inner">
            <Layers3 size={18} />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-cyan-300">
              Borrador de trabajo
            </p>
            <p className="mt-1 text-[11px] leading-5 text-neutral-400">
              {gestiones.length} gestiones disponibles. Cada borrador conserva sus evaluaciones y equipo de forma independiente.
            </p>
          </div>
        </div>

        <AppDropdownSelect
          value={gestionActivaId ?? ""}
          options={options}
          onChange={onChange}
          ariaLabel="Seleccionar borrador de trabajo"
          disabled={disabled}
          loading={loading}
          loadingLabel="Cambiando de borrador…"
          theme="dark"
          className="w-full lg:w-[420px]"
        />
      </div>
    </div>
  );
}
