import type { ReactNode } from "react";
import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  FileClock,
  History,
  Plus,
  ShieldCheck,
  Users,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

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
  icon: ReactNode;
  label: string;
  onClick: () => void;
  emphasis?: "neutral" | "cyan" | "danger" | "primary";
  badge?: string | null;
  disabled?: boolean;
}) {
  const emphasisClass =
    emphasis === "primary"
      ? "border-cyan-600 bg-cyan-600 text-white shadow-sm shadow-cyan-900/10 hover:bg-cyan-700"
      : emphasis === "cyan"
        ? "border-cyan-200 bg-cyan-50 text-cyan-800 hover:border-cyan-300 hover:bg-cyan-100"
        : emphasis === "danger"
          ? "border-red-200 bg-red-50 text-red-800 hover:border-red-300 hover:bg-red-100"
          : "border-slate-200 bg-slate-50/80 text-slate-700 hover:border-slate-300 hover:bg-white hover:text-slate-950";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-full border px-3.5 py-2 text-[11px] font-bold transition duration-200 disabled:cursor-not-allowed disabled:opacity-45 ${emphasisClass}`}
    >
      {icon}
      <span className="whitespace-nowrap">{label}</span>
      {badge && (
        <span className="rounded-full bg-white px-1.5 py-0.5 text-[9px] font-black text-slate-900 shadow-sm">
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
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const anio = searchParams.get("anio") ?? String(new Date().getFullYear());
  const rutaControles = `${location.pathname}/controles?anio=${encodeURIComponent(anio)}`;

  return (
    <section className="overflow-visible rounded-[28px] border border-slate-200/90 bg-white shadow-[0_12px_35px_rgba(15,23,42,0.05)]">
      {gestiones.length > 1 && (
        <div className="px-4 pt-4 sm:px-5 sm:pt-5">
          <SelectorGestionesBorrador
            gestiones={gestiones}
            gestionActivaId={gestionActiva?.id ?? null}
            disabled={bloqueado}
            loading={cambiandoBorrador}
            onChange={onSeleccionarGestion}
          />
        </div>
      )}

      <div className="px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            {gestionActiva ? (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-cyan-800">
                    Gestión en borrador
                  </span>
                  {gestionActiva.participacionActual?.esLider && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.14em] text-emerald-700">
                      Líder
                    </span>
                  )}
                  <span className="text-[11px] font-semibold text-slate-400">
                    {new Date(gestionActiva.fechaGestion).toLocaleDateString(
                      "es-CO"
                    )}
                  </span>
                </div>

                <h2
                  className="mt-2.5 truncate text-lg font-extrabold tracking-tight text-slate-950 sm:text-xl"
                  title={gestionActiva.tipoActividad}
                >
                  {gestionActiva.tipoActividad}
                </h2>

                <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] font-medium text-slate-500">
                  <span>{gestionActiva.modalidad.replaceAll("_", " ")}</span>
                  {gestionActiva.categoriaGestion && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>{gestionActiva.categoriaGestion.nombre}</span>
                    </>
                  )}
                  {gestionActiva.lider && (
                    <>
                      <span className="h-1 w-1 rounded-full bg-slate-300" />
                      <span>
                        Líder: {gestionActiva.lider.nombres}{" "}
                        {gestionActiva.lider.apellidos}
                      </span>
                    </>
                  )}
                </div>
              </>
            ) : puedeEvaluar ? (
              <>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                  Espacio de trabajo
                </p>
                <h2 className="mt-2 text-lg font-extrabold tracking-tight text-slate-950">
                  No tienes una gestión en borrador
                </h2>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Crea una visita, asesoría o jornada para registrar nuevas calificaciones.
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                  Consulta SG-SST
                </p>
                <h2 className="mt-2 text-lg font-extrabold tracking-tight text-slate-950">
                  Evaluación en modo consulta
                </h2>
                <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                  Puedes consultar resultados, informes, historial y el estado de los aspectos. Las calificaciones y gestiones permanecen reservadas al equipo autorizado.
                </p>
              </>
            )}
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2 lg:max-w-[420px] lg:justify-end">
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
                  gestionActiva ? "Nueva gestión" : "Crear gestión"
                }
                onClick={onNuevaGestion}
                emphasis="primary"
                disabled={bloqueado}
              />
            )}
          </div>
        </div>

        <div className="my-4 h-px bg-slate-100" />

        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
              {puedeEvaluar
                ? "Acciones de la gestión"
                : "Consulta y seguimiento"}
            </span>
            {gestionActiva && (
              <span className="hidden text-[10px] text-slate-400 sm:inline">
                · herramientas y seguimiento
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <ActionButton
              icon={<BarChart3 size={14} />}
              label="Resultados"
              onClick={onResultados}
              disabled={bloqueado}
            />
            <ActionButton
              icon={<FileClock size={14} />}
              label="Informes"
              onClick={onInformes}
              disabled={bloqueado}
            />
            {puedeVerRevisiones && (
              <ActionButton
                icon={
                  ajustesActivos > 0 ? (
                    <AlertTriangle size={14} />
                  ) : (
                    <ShieldCheck size={14} />
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
              icon={<History size={14} />}
              label="Historial"
              onClick={onHistorial}
              disabled={bloqueado}
            />
            {puedeEvaluar && (
              <ActionButton
                icon={<ClipboardCheck size={14} />}
                label="No aplica / aprobaciones"
                onClick={() => navigate(rutaControles)}
                disabled={bloqueado}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
