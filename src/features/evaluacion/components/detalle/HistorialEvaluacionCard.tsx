import {
  Ban,
  CalendarDays,
  FileCheck2,
  UserRound,
} from "lucide-react";

import type { HistorialAspectoItem } from "../../types/detalle-aspecto.types";
import { formatDate } from "./DetalleAspectoUi";

const stateClass: Record<string, string> = {
  CUMPLIDO:
    "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  PARCIAL:
    "border-amber-400/20 bg-amber-400/10 text-amber-200",
  NO_CUMPLIDO:
    "border-red-400/20 bg-red-400/10 text-red-200",
  NO_APLICA:
    "border-sky-400/20 bg-sky-400/10 text-sky-200",
};

const stateLabel: Record<string, string> = {
  CUMPLIDO: "Cumplido",
  PARCIAL: "Parcial",
  NO_CUMPLIDO: "No cumplido",
  NO_APLICA: "No aplica",
};

export default function HistorialEvaluacionCard({
  item,
}: {
  item: HistorialAspectoItem;
}) {
  const invalidada = item.gestion.estado === "INVALIDADA";

  return (
    <article
      className={`rounded-2xl border p-4 sm:p-5 ${
        invalidada
          ? "border-red-500/20 bg-red-500/[0.035]"
          : "border-neutral-800 bg-[#101112]"
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
                stateClass[item.estadoCumplimiento] ??
                "border-neutral-700 bg-neutral-800 text-neutral-300"
              } ${invalidada ? "opacity-60" : ""}`}
            >
              {stateLabel[item.estadoCumplimiento] ??
                item.estadoCumplimiento}
            </span>
            <span className="rounded-full bg-neutral-800 px-2.5 py-1 text-[9px] font-semibold text-neutral-300">
              Nota {item.calificacionAdministrativa}
            </span>
            <span className="text-[10px] text-neutral-600">
              Periodo {item.anio}
            </span>

            {invalidada && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-red-200">
                <Ban size={11} />
                Gestión invalidada
              </span>
            )}
          </div>

          <h4 className="mt-3 text-sm font-semibold text-white">
            {item.gestion.tipoActividad}
          </h4>
          <p className="mt-1 text-xs text-neutral-500">
            {item.gestion.categoriaGestion ?? "Gestión general"}
            {` · ${item.gestion.modalidad.replaceAll("_", " ")}`}
          </p>
        </div>

        <div className="shrink-0 text-left sm:text-right">
          <p className="text-xs font-medium text-neutral-300">
            {formatDate(item.gestion.fechaGestion)}
          </p>
          <p className="mt-1 text-[10px] text-neutral-600">
            Registrada {formatDate(item.creadaEn, true)}
          </p>
        </div>
      </div>

      {invalidada && (
        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-red-300/80">
            No participa en el estado vigente ni en los cálculos
          </p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-red-100">
            {item.gestion.motivoInvalidacion ??
              "No se registró un motivo de invalidación."}
          </p>
          <p className="mt-2 text-[10px] leading-5 text-neutral-500">
            {item.gestion.invalidadaPor
              ? `Invalidada por ${item.gestion.invalidadaPor.nombre} el ${formatDate(
                  item.gestion.invalidadaEn,
                  true
                )}.`
              : `Invalidada el ${formatDate(
                  item.gestion.invalidadaEn,
                  true
                )}.`}
          </p>
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-neutral-800 bg-[#090a0b] p-3">
          <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-neutral-600">
            <UserRound size={13} /> Profesional
          </p>
          <p className="mt-2 text-xs leading-5 text-neutral-300">
            {item.gestion.profesional}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-[#090a0b] p-3">
          <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-neutral-600">
            <CalendarDays size={13} /> Fecha del soporte
          </p>
          <p className="mt-2 text-xs leading-5 text-neutral-300">
            {formatDate(item.fechaDocumento)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-[#090a0b] p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-600">
            Vencimiento
          </p>
          <p className="mt-2 text-xs leading-5 text-neutral-300">
            {formatDate(item.fechaVencimientoCalculada)}
          </p>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-[#090a0b] p-3">
          <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-neutral-600">
            <FileCheck2 size={13} /> Evidencias
          </p>
          <p className="mt-2 text-xs leading-5 text-neutral-300">
            {item.totalEvidencias} soporte(s)
          </p>
        </div>
      </div>

      {(item.observacion || item.justificacionNoAplica) && (
        <div className="mt-3 rounded-xl border border-neutral-800 bg-[#090a0b] p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-600">
            Observación
          </p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-neutral-300">
            {item.observacion ?? item.justificacionNoAplica}
          </p>
        </div>
      )}
    </article>
  );
}
