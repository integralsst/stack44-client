import {
  CalendarDays,
  ExternalLink,
  FileCheck2,
  MessageSquareText,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type { RevisionTecnicaEvaluacionItem } from "../../types/revision-tecnica.types";
import RevisionTecnicaEstadoBadge from "./RevisionTecnicaEstadoBadge";

interface Props {
  revision: RevisionTecnicaEvaluacionItem;
  onResolver: (revision: RevisionTecnicaEvaluacionItem) => void;
}

export default function RevisionTecnicaCard({
  revision,
  onResolver,
}: Props) {
  const evaluacion = revision.evaluacion;

  return (
    <article className="rounded-2xl border border-neutral-800 bg-[#0b0c0d] p-4 shadow-lg sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <RevisionTecnicaEstadoBadge estado={revision.estado} />
            <span className="text-[10px] text-neutral-600">
              Solicitada {formatDateTime(revision.solicitadaEn)}
            </span>
          </div>

          <h3 className="mt-3 text-base font-bold leading-6 text-white">
            {evaluacion.aspecto.nombre}
          </h3>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            {evaluacion.aspecto.estandar.codigo
              ? `${evaluacion.aspecto.estandar.codigo} · `
              : ""}
            {evaluacion.aspecto.estandar.nombre}
          </p>
        </div>

        {revision.puedeResolver && (
          <button
            type="button"
            onClick={() => onResolver(revision)}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-neutral-200 lg:w-auto"
          >
            <ShieldCheck size={16} />
            Emitir concepto
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Fact
          icon={CalendarDays}
          label="Gestión"
          value={`${formatDate(evaluacion.gestion.fechaGestion)} · ${evaluacion.gestion.tipoActividad}`}
        />
        <Fact
          icon={UserRound}
          label="Profesional"
          value={evaluacion.gestion.profesional}
        />
        <Fact
          icon={FileCheck2}
          label="Evaluación"
          value={`${estadoLabel(evaluacion.estadoCumplimiento)} · Nota ${evaluacion.calificacionAdministrativa.toFixed(2)}`}
        />
        <Fact
          icon={MessageSquareText}
          label="Solicitó"
          value={revision.solicitadaPor.nombre}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TextBlock
          title="Motivo de la solicitud"
          text={revision.motivoSolicitud}
        />
        <TextBlock
          title="Observación de la evaluación"
          text={
            evaluacion.observacion ||
            "La evaluación no tiene observación adicional."
          }
          muted={!evaluacion.observacion}
        />
      </div>

      {revision.conceptoTecnico && (
        <div className="mt-4 rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Concepto técnico
            </p>
            <span className="text-[10px] text-neutral-500">
              {revision.revisadaPor?.nombre ?? "Revisor"}
              {revision.revisadaEn
                ? ` · ${formatDateTime(revision.revisadaEn)}`
                : ""}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-200">
            {revision.conceptoTecnico}
          </p>
        </div>
      )}

      {revision.motivoAnulacion && (
        <div className="mt-4 rounded-2xl border border-neutral-700 bg-neutral-900/70 p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Motivo de anulación
          </p>
          <p className="mt-2 text-sm leading-6 text-neutral-300">
            {revision.motivoAnulacion}
          </p>
        </div>
      )}

      <div className="mt-4 border-t border-neutral-800 pt-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold text-neutral-300">
            Evidencias revisables ({evaluacion.evidencias.length})
          </p>
          <span className="text-[10px] text-neutral-600">
            Los enlaces se abren en una pestaña nueva
          </span>
        </div>

        {evaluacion.evidencias.length > 0 ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {evaluacion.evidencias.map((evidencia) => (
              <a
                key={evidencia.id}
                href={evidencia.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded-xl border border-neutral-800 bg-[#090a0b] px-3 py-3 text-sm text-neutral-300 transition hover:border-cyan-500/30 hover:text-cyan-200"
              >
                <span className="min-w-0 truncate">
                  {evidencia.nombre}
                </span>
                <ExternalLink size={14} className="shrink-0" />
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-neutral-600">
            Esta evaluación no tiene evidencias activas asociadas.
          </p>
        )}
      </div>
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
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-neutral-600">
        <Icon size={13} />
        {label}
      </p>
      <p className="mt-2 text-xs leading-5 text-neutral-300">
        {value}
      </p>
    </div>
  );
}

function TextBlock({
  title,
  text,
  muted = false,
}: {
  title: string;
  text: string;
  muted?: boolean;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#090a0b] p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
        {title}
      </p>
      <p
        className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${
          muted ? "text-neutral-600" : "text-neutral-300"
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function estadoLabel(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}

function formatDate(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
      }).format(date);
}

function formatDateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Fecha no disponible"
    : new Intl.DateTimeFormat("es-CO", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(date);
}
