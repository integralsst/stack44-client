import {
  AlertTriangle,
  Bell,
  ChevronDown,
  Clock3,
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
  },
  MEDIA: {
    icon: Clock3,
    label: "Pendiente",
    wrapper: "border-amber-200",
    iconBox: "bg-amber-100 text-amber-700",
    badge: "bg-amber-100 text-amber-800",
  },
  BAJA: {
    icon: Bell,
    label: "Próximo",
    wrapper: "border-cyan-200",
    iconBox: "bg-cyan-100 text-cyan-700",
    badge: "bg-cyan-100 text-cyan-800",
  },
} as const;

const CATEGORIAS = {
  COMPROMISOS: "Compromiso",
  REVISION_TECNICA: "Revisión técnica",
  NO_APLICA: "No aplica",
  APROBACIONES: "Aprobación",
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
      className={`overflow-hidden rounded-2xl border bg-white shadow-sm ${nivel.wrapper}`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
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
          <p className="text-sm leading-6 text-slate-700">
            {accion.descripcion}
          </p>

          <div className="mt-3 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
            <div className="rounded-xl bg-white px-3 py-2">
              <span className="font-bold text-slate-900">Aspecto:</span>{" "}
              {accion.aspecto.nombre}
            </div>
            <div className="rounded-xl bg-white px-3 py-2">
              <span className="font-bold text-slate-900">Referencia:</span>{" "}
              {formatDate(accion.fechaReferencia)}
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Link
              to={accion.accion.ruta}
              className="inline-flex min-h-10 items-center justify-center rounded-xl bg-slate-950 px-4 py-2 text-xs font-extrabold text-white transition hover:bg-cyan-700"
            >
              {accion.accion.etiqueta}
            </Link>
          </div>
        </div>
      )}
    </article>
  );
}
