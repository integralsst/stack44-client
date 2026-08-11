import {
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  CalendarClock,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";

import type { AccionCentro } from "../types/centro-acciones.types";

const NIVELES = {
  ALTA: {
    icon: AlertTriangle,
    label: "Urgente",
    wrapper: "border-red-200",
    iconBox: "bg-red-100 text-red-700",
    badge: "bg-red-100 text-red-800",
    callout: "border-red-200 bg-red-50 text-red-950",
  },
  MEDIA: {
    icon: Clock3,
    label: "Pendiente",
    wrapper: "border-amber-200",
    iconBox: "bg-amber-100 text-amber-700",
    badge: "bg-amber-100 text-amber-800",
    callout: "border-amber-200 bg-amber-50 text-amber-950",
  },
  BAJA: {
    icon: Bell,
    label: "Próximo",
    wrapper: "border-cyan-200",
    iconBox: "bg-cyan-100 text-cyan-700",
    badge: "bg-cyan-100 text-cyan-800",
    callout: "border-cyan-200 bg-cyan-50 text-cyan-950",
  },
} as const;

const CATEGORIAS = {
  COMPROMISOS: "Compromiso",
  EVIDENCIAS: "Evidencia",
  REVISION_TECNICA: "Revisión técnica",
  NO_APLICA: "No aplica",
  APROBACIONES: "Aprobación",
  AUDITORIAS: "Auditoría",
  OTROS: "Otra acción",
} as const;

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AccionCompactaCard({
  accion,
  abierta,
  onToggle,
}: {
  accion: AccionCentro;
  abierta: boolean;
  onToggle: () => void;
}) {
  const nivel = NIVELES[accion.nivel];
  const Icon = nivel.icon;

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow ${nivel.wrapper} ${
        abierta ? "shadow-md" : ""
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50/70"
        aria-expanded={abierta}
      >
        <div
          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${nivel.iconBox}`}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
              {CATEGORIAS[accion.categoria]}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${nivel.badge}`}
            >
              {nivel.label}
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm font-extrabold leading-5 text-slate-950">
            {accion.titulo}
          </p>
          <p className="mt-1 truncate text-xs text-slate-600">
            {accion.aspecto.nombre}
          </p>
        </div>

        <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-cyan-700">
          {abierta ? "Cerrar" : "Ver detalle"}
          <ChevronDown
            size={15}
            className={`transition-transform ${abierta ? "rotate-180" : ""}`}
          />
        </span>
      </button>

      {abierta && (
        <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-4">
          <div className={`rounded-2xl border p-4 ${nivel.callout}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/80">
                <ClipboardCheck size={17} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] opacity-70">
                  Acción requerida
                </p>
                <p className="mt-1 text-sm font-extrabold leading-5">
                  {accion.titulo}
                </p>
                <p className="mt-2 text-sm leading-6 opacity-90">
                  {accion.descripcion}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 grid gap-2 text-xs text-slate-700 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Building2 size={14} />
                <span className="font-bold">Empresa</span>
              </div>
              <p className="mt-1 line-clamp-2 font-extrabold text-slate-950">
                {accion.empresa.nombre}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Target size={14} />
                <span className="font-bold">Aspecto</span>
              </div>
              <p className="mt-1 line-clamp-2 font-extrabold text-slate-950">
                {accion.aspecto.nombre}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
              <div className="flex items-center gap-2 text-slate-500">
                <CalendarClock size={14} />
                <span className="font-bold">Referencia</span>
              </div>
              <p className="mt-1 font-extrabold text-slate-950">
                {formatDate(accion.fechaReferencia)}
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-cyan-200 bg-white p-3">
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-slate-950">
                Resolver esta acción
              </p>
              <p className="mt-1 text-[11px] leading-5 text-slate-500">
                Te llevaremos directamente a la pantalla de {accion.empresa.nombre} donde corresponde gestionar este pendiente.
              </p>
            </div>

            <Link
              to={accion.accion.ruta}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-cyan-700 bg-cyan-600 px-4 py-2.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
            >
              {accion.accion.etiqueta}
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}
