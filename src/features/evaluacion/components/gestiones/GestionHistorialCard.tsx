import {
  Ban,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Crown,
  Layers3,
  UserRound,
} from "lucide-react";

import type { GestionHistorialEvaluacion } from "../../types/gestion-historial.types";
import GestionEstadoBadge from "./GestionEstadoBadge";

function formatDate(
  value: string | null,
  includeTime = false
): string {
  if (!value) return "No disponible";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
  }

  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    ...(includeTime
      ? {
          timeStyle: "short",
        }
      : {}),
  }).format(date);
}

export default function GestionHistorialCard({
  gestion,
  onInvalidar,
}: {
  gestion: GestionHistorialEvaluacion;
  onInvalidar: (gestion: GestionHistorialEvaluacion) => void;
}) {
  const invalidada = gestion.estado === "INVALIDADA";

  return (
    <article
      className={`rounded-2xl border p-4 sm:p-5 ${
        invalidada
          ? "border-red-500/20 bg-red-500/[0.035]"
          : "border-neutral-800 bg-[#101112]"
      }`}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <GestionEstadoBadge estado={gestion.estado} />

            {invalidada && (
              <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                No participa en resultados
              </span>
            )}
          </div>

          <h3 className="mt-3 text-sm font-semibold text-white sm:text-base">
            {gestion.tipoActividad}
          </h3>

          <p className="mt-1 text-xs leading-5 text-neutral-500">
            {gestion.categoriaGestion?.nombre ?? "Gestión general"}
            {` · ${gestion.modalidad.replaceAll("_", " ")}`}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
          <p className="text-xs font-medium text-neutral-300">
            {formatDate(gestion.fechaGestion)}
          </p>

          {gestion.puedeInvalidar && (
            <button
              type="button"
              onClick={() => onInvalidar(gestion)}
              className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-200 transition hover:border-red-400/40 hover:bg-red-500/15"
            >
              <Ban size={14} />
              Invalidar gestión
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <Fact
          icon={UserRound}
          label="Creada por"
          value={gestion.creadaPor.nombre}
        />
        <Fact
          icon={Crown}
          label="Líder al cierre"
          value={gestion.liderAlCierre.nombre}
        />
        <Fact
          icon={CheckCircle2}
          label="Finalizada por"
          value={gestion.finalizadaPor?.nombre ?? "No disponible"}
        />
        <Fact
          icon={CalendarDays}
          label="Finalizada"
          value={formatDate(gestion.finalizadaEn, true)}
        />
        <Fact
          icon={ClipboardCheck}
          label="Evaluaciones"
          value={`${gestion.totalEvaluaciones} aspecto(s)`}
        />
        <Fact
          icon={Layers3}
          label="Modalidad"
          value={gestion.modalidad.replaceAll("_", " ")}
        />
      </div>

      {gestion.observacionGeneral && (
        <div className="mt-3 rounded-xl border border-neutral-800 bg-[#090a0b] p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-600">
            Observación general
          </p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-neutral-300">
            {gestion.observacionGeneral}
          </p>
        </div>
      )}

      {invalidada && (
        <div className="mt-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-red-300/80">
            Motivo de invalidación
          </p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-red-100">
            {gestion.motivoInvalidacion ??
              "No se registró un motivo de invalidación."}
          </p>

          <p className="mt-2 text-[10px] leading-5 text-neutral-500">
            {gestion.invalidacion
              ? `Invalidada por ${gestion.invalidacion.usuario.nombre} el ${formatDate(
                  gestion.invalidacion.fecha,
                  true
                )}.`
              : `Invalidada el ${formatDate(
                  gestion.invalidadaEn,
                  true
                )}.`}
          </p>
        </div>
      )}
    </article>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#090a0b] p-3">
      <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-neutral-600">
        <Icon size={13} />
        {label}
      </p>
      <p className="mt-2 text-xs leading-5 text-neutral-300">
        {value}
      </p>
    </div>
  );
}
