import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileCheck2,
  MessageSquareText,
  Paperclip,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState } from "react";

import AppButton from "../../../../components/ui/AppButton";
import type { RevisionTecnicaEvaluacionItem } from "../../types/revision-tecnica.types";
import RevisionTecnicaEstadoBadge from "./RevisionTecnicaEstadoBadge";

interface Props {
  revision: RevisionTecnicaEvaluacionItem;
  highlighted?: boolean;
  onResolver: (revision: RevisionTecnicaEvaluacionItem) => void;
  onCorregir: (revision: RevisionTecnicaEvaluacionItem) => void;
}

export default function RevisionTecnicaCard({
  revision,
  highlighted = false,
  onResolver,
  onCorregir,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const evaluacion = revision.evaluacion;
  const urgente = revision.estadoFlujo === "REQUIERE_AJUSTES";
  const enCorreccion = revision.estadoFlujo === "EN_CORRECCION";
  const subsanada = revision.estadoFlujo === "SUBSANADA";
  const puedeCorregir =
    revision.puedeCorregir && (urgente || enCorreccion);

  return (
    <article
      id={`revision-tecnica-${revision.id}`}
      className={`scroll-mt-6 rounded-2xl border p-4 shadow-sm transition sm:p-5 ${
        urgente
          ? "border-red-200 bg-red-50/70 ring-1 ring-red-100"
          : enCorreccion
            ? "border-cyan-200 bg-cyan-50/70"
            : subsanada
              ? "border-emerald-200 bg-emerald-50/40"
              : "border-slate-200 bg-white"
      } ${
        highlighted
          ? "ring-2 ring-cyan-500 ring-offset-2 ring-offset-white"
          : ""
      }`}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <RevisionTecnicaEstadoBadge estado={revision.estadoFlujo} />
            <span className="text-[10px] text-slate-500">
              {formatDateTime(revision.solicitadaEn)}
            </span>
          </div>

          <h3 className="mt-3 text-base font-bold leading-6 text-slate-900">
            {evaluacion.aspecto.nombre}
          </h3>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {evaluacion.aspecto.estandar.codigo
              ? `${evaluacion.aspecto.estandar.codigo} · `
              : ""}
            {evaluacion.aspecto.estandar.nombre}
          </p>

          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-600">
            <Meta icon={UserRound} text={evaluacion.gestion.profesional} />
            <Meta
              icon={FileCheck2}
              text={`${subsanada ? "Evaluación revisada: " : ""}${estadoLabel(evaluacion.estadoCumplimiento)} · Nota ${evaluacion.calificacionAdministrativa.toFixed(2)}`}
            />
            <Meta
              icon={Paperclip}
              text={`${evaluacion.evidencias.length} evidencia${evaluacion.evidencias.length === 1 ? "" : "s"}`}
            />
          </div>
        </div>

        <div className="flex w-full flex-wrap gap-2 xl:w-auto xl:justify-end">
          {puedeCorregir && (
            <AppButton
              size="sm"
              variant="danger"
              leadingIcon={<AlertTriangle size={15} />}
              trailingIcon={<ArrowRight size={14} />}
              onClick={() => onCorregir(revision)}
              className="flex-1 sm:flex-none"
            >
              {enCorreccion ? "Continuar" : "Corregir"}
            </AppButton>
          )}

          {revision.puedeResolver && (
            <AppButton
              size="sm"
              variant="primary"
              leadingIcon={<ShieldCheck size={15} />}
              onClick={() => onResolver(revision)}
              className="flex-1 sm:flex-none"
            >
              Emitir concepto
            </AppButton>
          )}

          <AppButton
            size="sm"
            variant="ghost"
            trailingIcon={
              expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />
            }
            onClick={() => setExpanded((current) => !current)}
            className="flex-1 sm:flex-none"
          >
            {expanded ? "Ocultar" : "Ver detalles"}
          </AppButton>
        </div>
      </div>

      {subsanada && revision.evaluacionCorrectiva && (
        <div className="mt-4 grid gap-2 rounded-xl border border-emerald-200 bg-white p-3 sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-3">
          <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Evaluación revisada
            </p>
            <p className="mt-1 text-xs font-semibold text-slate-800">
              {estadoLabel(evaluacion.estadoCumplimiento)} · Nota {evaluacion.calificacionAdministrativa.toFixed(2)}
            </p>
            <p className="mt-1 text-[10px] text-slate-500">
              {evaluacion.gestion.profesional} · {formatDateTime(evaluacion.creadaEn ?? revision.solicitadaEn)}
            </p>
          </div>

          <div className="flex justify-center text-emerald-600">
            <ArrowRight size={18} className="rotate-90 sm:rotate-0" />
          </div>

          <div className="min-w-0 rounded-lg bg-emerald-50 px-3 py-2.5">
            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-700">
              Corrección registrada
            </p>
            <p className="mt-1 text-xs font-semibold text-emerald-900">
              {estadoLabel(revision.evaluacionCorrectiva.estadoCumplimiento)} · Nota {revision.evaluacionCorrectiva.calificacionAdministrativa.toFixed(2)}
            </p>
            <p className="mt-1 text-[10px] text-emerald-700/80">
              {revision.gestionCorreccion?.profesional ?? "Profesional"} · {formatDateTime(revision.evaluacionCorrectiva.creadaEn)}
            </p>
          </div>
        </div>
      )}

      {revision.conceptoTecnico && (
        <div
          className={`mt-4 rounded-xl border p-3.5 ${
            urgente
              ? "border-red-200 bg-red-50"
              : subsanada
                ? "border-emerald-200 bg-emerald-50"
                : "border-cyan-200 bg-cyan-50"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p
              className={`text-[10px] font-bold uppercase tracking-wider ${
                urgente
                  ? "text-red-700"
                  : subsanada
                    ? "text-emerald-700"
                    : "text-cyan-700"
              }`}
            >
              {urgente ? "Qué debe corregirse" : "Concepto técnico"}
            </p>
            <span className="text-[10px] text-slate-500">
              {revision.revisadaPor?.nombre ?? "Revisor"}
            </span>
          </div>
          <p
            className={`mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 ${
              expanded ? "" : "line-clamp-3"
            }`}
          >
            {revision.conceptoTecnico}
          </p>
        </div>
      )}

      {expanded && (
        <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Fact
              icon={CalendarDays}
              label="Evaluación revisada"
              value={formatDateTime(
                evaluacion.creadaEn ?? revision.solicitadaEn
              )}
            />
            <Fact
              icon={UserRound}
              label="Profesional"
              value={evaluacion.gestion.profesional}
            />
            <Fact
              icon={MessageSquareText}
              label="Solicitó"
              value={revision.solicitadaPor.nombre}
            />
            <Fact
              icon={ShieldCheck}
              label="Revisó"
              value={revision.revisadaPor?.nombre ?? "Pendiente"}
            />
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
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

          {revision.gestionCorreccion && (
            <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
                Corrección registrada
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {revision.gestionCorreccion.tipoActividad}
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-600">
                {formatDateTime(
                  revision.evaluacionCorrectiva?.creadaEn ??
                    revision.gestionCorreccion.fechaGestion
                )} · {revision.gestionCorreccion.profesional}
              </p>
              {revision.evaluacionCorrectiva && (
                <p className="mt-2 text-xs text-slate-700">
                  {estadoLabel(
                    revision.evaluacionCorrectiva.estadoCumplimiento
                  )} · Nota {revision.evaluacionCorrectiva.calificacionAdministrativa.toFixed(2)}
                </p>
              )}
            </div>
          )}

          {revision.motivoAnulacion && (
            <TextBlock
              title="Motivo de anulación"
              text={revision.motivoAnulacion}
            />
          )}

          <div>
            <p className="text-xs font-semibold text-slate-700">
              Evidencias ({evaluacion.evidencias.length})
            </p>

            {evaluacion.evidencias.length > 0 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {evaluacion.evidencias.map((evidencia) => (
                  <a
                    key={evidencia.id}
                    href={evidencia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
                  >
                    <span className="min-w-0 truncate">
                      {evidencia.nombre}
                    </span>
                    <ExternalLink size={14} className="shrink-0" />
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                Sin evidencias asociadas.
              </p>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function Meta({
  icon: Icon,
  text,
}: {
  icon: typeof UserRound;
  text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon size={13} className="text-slate-400" />
      {text}
    </span>
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <Icon size={13} />
        {label}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-700">{value}</p>
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
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
        {title}
      </p>
      <p
        className={`mt-2 whitespace-pre-wrap text-sm leading-6 ${
          muted ? "text-slate-500" : "text-slate-700"
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
