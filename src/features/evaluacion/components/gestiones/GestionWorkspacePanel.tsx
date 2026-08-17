import {
  AlertTriangle,
  BarChart3,
  FileClock,
  History,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";

import type { GestionActivaEvaluacion } from "../../../../types/evaluacion.types";
import SelectorGestionesBorrador from "./SelectorGestionesBorrador";

interface Props {
  gestiones: GestionActivaEvaluacion[];
  gestionActiva: GestionActivaEvaluacion | null;
  bloqueado: boolean;
  cambiandoBorrador: boolean;
  puedeEvaluar: boolean;
  puedeVerRevisiones: boolean;
  puedeCrearGestionPropia: boolean;
  ajustesActivos: number;
  pendientesRevision: number;
  onSeleccionarGestion: (gestionId: string) => void;
  onResultados: () => void;
  onInformes: () => void;
  onEquipo: () => void;
  onRevisiones: () => void;
  onHistorial: () => void;
  onNuevaGestion: () => void;
}

function ActionButton({
  icon,
  label,
  onClick,
  emphasis = "neutral",
  badge,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  emphasis?: "neutral" | "cyan" | "danger" | "primary";
  badge?: string | null;
  disabled?: boolean;
}) {
  const className =
    emphasis === "primary"
      ? "border-white bg-white text-slate-950 hover:bg-slate-100"
      : emphasis === "cyan"
        ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-100 hover:border-cyan-400/50 hover:bg-cyan-500/15"
        : emphasis === "danger"
          ? "border-red-500/35 bg-red-500/10 text-red-100 hover:bg-red-500/15"
          : "border-neutral-700 bg-[#08090a] text-neutral-200 hover:border-cyan-500/35 hover:bg-cyan-500/[0.06] hover:text-cyan-100";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex min-h-10 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-45 ${className}`}
    >
      {icon}
      <span>{label}</span>
      {badge && (
        <span className="rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-black text-slate-900">
          {badge}
        </span>
      )}
    </button>
  );
}

export default function GestionWorkspacePanel({
  gestiones,
  gestionActiva,
  bloqueado,
  cambiandoBorrador,
  puedeEvaluar,
  puedeVerRevisiones,
  puedeCrearGestionPropia,
  ajustesActivos,
  pendientesRevision,
  onSeleccionarGestion,
  onResultados,
  onInformes,
  onEquipo,
  onRevisiones,
  onHistorial,
  onNuevaGestion,
}: Props) {
  return (
    <section className="overflow-visible rounded-3xl border border-neutral-800 bg-[#101112] shadow-xl">
      {gestiones.length > 1 && (
        <div className="border-b border-neutral-800 p-3 sm:p-4">
          <SelectorGestionesBorrador
            gestiones={gestiones}
            gestionActivaId={gestionActiva?.id ?? null}
            disabled={bloqueado}
            loading={cambiandoBorrador}
            onChange={onSeleccionarGestion}
          />
        </div>
      )}

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(360px,520px)] lg:items-start">
        <div className="min-w-0 rounded-2xl border border-neutral-800 bg-gradient-to-br from-[#151719] to-[#0b0c0d] p-4">
          {gestionActiva ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-cyan-300">
                  Gestión en borrador
                </span>
                {gestionActiva.participacionActual?.esLider && (
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-emerald-300">
                    Líder
                  </span>
                )}
                <span className="text-[11px] font-semibold text-neutral-500">
                  {new Date(gestionActiva.fechaGestion).toLocaleDateString(
                    "es-CO"
                  )}
                </span>
              </div>

              <h2
                className="mt-3 truncate text-base font-extrabold text-white sm:text-lg"
                title={gestionActiva.tipoActividad}
              >
                {gestionActiva.tipoActividad}
              </h2>

              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-medium text-neutral-400">
                <span>{gestionActiva.modalidad.replaceAll("_", " ")}</span>
                {gestionActiva.categoriaGestion && (
                  <span>{gestionActiva.categoriaGestion.nombre}</span>
                )}
                {gestionActiva.lider && (
                  <span>
                    Líder: {gestionActiva.lider.nombres}{" "}
                    {gestionActiva.lider.apellidos}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-neutral-500">
                Espacio de trabajo
              </p>
              <h2 className="mt-2 text-base font-extrabold text-white">
                No tienes una gestión en borrador
              </h2>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Crea una visita, asesoría o jornada para registrar nuevas calificaciones.
              </p>
            </>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <div className="rounded-2xl border border-neutral-800 bg-[#0b0c0d] p-3">
            <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">
              Gestión
            </p>
            <div className="grid gap-2">
              {gestionActiva && puedeEvaluar && (
                <ActionButton
                  icon={<Users size={15} />}
                  label="Equipo de gestión"
                  onClick={onEquipo}
                  emphasis="cyan"
                  disabled={bloqueado}
                />
              )}

              {puedeCrearGestionPropia && (
                <ActionButton
                  icon={<Plus size={15} />}
                  label={
                    gestionActiva
                      ? "Nueva gestión propia"
                      : "Nueva gestión"
                  }
                  onClick={onNuevaGestion}
                  emphasis="primary"
                  disabled={bloqueado}
                />
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-[#0b0c0d] p-3">
            <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.16em] text-neutral-500">
              Consulta y control
            </p>
            <div className="grid grid-cols-2 gap-2">
              <ActionButton
                icon={<BarChart3 size={15} />}
                label="Resultados"
                onClick={onResultados}
                disabled={bloqueado}
              />
              <ActionButton
                icon={<FileClock size={15} />}
                label="Informes"
                onClick={onInformes}
                disabled={bloqueado}
              />
              {puedeVerRevisiones && (
                <ActionButton
                  icon={
                    ajustesActivos > 0 ? (
                      <AlertTriangle size={15} />
                    ) : (
                      <ShieldCheck size={15} />
                    )
                  }
                  label="Revisiones"
                  badge={
                    ajustesActivos > 0
                      ? `${ajustesActivos}`
                      : pendientesRevision > 0
                        ? `${pendientesRevision}`
                        : null
                  }
                  onClick={onRevisiones}
                  emphasis={ajustesActivos > 0 ? "danger" : "neutral"}
                  disabled={bloqueado}
                />
              )}
              <ActionButton
                icon={<History size={15} />}
                label="Historial"
                onClick={onHistorial}
                disabled={bloqueado}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
