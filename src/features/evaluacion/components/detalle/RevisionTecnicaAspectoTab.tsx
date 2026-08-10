import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import { useState } from "react";

import type {
  DetalleAspectoResponse,
  EvaluacionDetalleAspecto,
} from "../../types/detalle-aspecto.types";
import RevisionTecnicaEstadoBadge from "../revisiones/RevisionTecnicaEstadoBadge";
import DetalleColapsableCard from "./DetalleColapsableCard";

export default function RevisionTecnicaAspectoTab({
  data,
}: {
  data: DetalleAspectoResponse;
}) {
  const evaluaciones = data.revisionesTecnicas;
  const [abiertaId, setAbiertaId] = useState<string | null>(null);

  if (evaluaciones.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-14 text-center">
        <ShieldCheck className="mx-auto h-9 w-9 text-slate-400" />
        <p className="mt-3 text-sm font-semibold text-slate-700">
          Este aspecto no tiene revisiones técnicas
        </p>
        <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-slate-500">
          La solicitud se crea al finalizar una gestión cuya evaluación esté marcada para revisión técnica.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-bold text-cyan-900">
              Revisión técnica del aspecto
            </p>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
              Línea de tiempo técnica. Todas las revisiones empiezan cerradas para que puedas ubicar rápidamente la que necesitas y desplegar solo su detalle.
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-cyan-800">
            {evaluaciones.length} revisión(es)
          </span>
        </div>
      </div>

      <div className="relative space-y-1">
        <div className="absolute bottom-4 left-[17px] top-4 w-px bg-slate-200" />

        {evaluaciones.map((evaluacion) => {
          const revision = evaluacion.revisionTecnica;
          const id = revision?.id ?? evaluacion.id;
          const abierta = abiertaId === id;

          const summary = (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                {revision ? (
                  <RevisionTecnicaEstadoBadge estado={revision.estado} />
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-800">
                    <Clock3 size={12} />
                    Se creará al finalizar
                  </span>
                )}

                <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-950">
                  {evaluacion.gestion.tipoActividad}
                </p>
                <p className="mt-1 text-xs text-slate-600">
                  {formatDate(evaluacion.gestion.fechaGestion)} · {evaluacion.gestion.profesional}
                </p>
              </div>

              <div className="shrink-0 text-left sm:text-right">
                <p className="text-[10px] font-semibold text-slate-500">
                  Nota {evaluacion.calificacionAdministrativa.toFixed(2)}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  {humanize(evaluacion.estadoCumplimiento)}
                </p>
              </div>
            </div>
          );

          return (
            <div
              key={id}
              className="relative flex gap-3 rounded-2xl px-1 py-2.5 sm:gap-4 sm:px-2"
            >
              <div className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-violet-200 bg-white text-violet-700">
                <ShieldCheck size={15} />
              </div>

              <div className="min-w-0 flex-1">
                <DetalleColapsableCard
                  summary={summary}
                  open={abierta}
                  onOpenChange={(next) =>
                    setAbiertaId(next ? id : null)
                  }
                  contentClassName="bg-slate-50/60 p-4"
                >
                  <RevisionDetalleContenido
                    evaluacion={evaluacion}
                    esBorrador={
                      evaluacion.gestion.estado === "BORRADOR"
                    }
                  />
                </DetalleColapsableCard>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RevisionDetalleContenido({
  evaluacion,
  esBorrador,
}: {
  evaluacion: EvaluacionDetalleAspecto;
  esBorrador: boolean;
}) {
  const revision = evaluacion.revisionTecnica;

  return (
    <div>
      {esBorrador && (
        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
          Borrador
        </span>
      )}

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <Fact
          icon={CheckCircle2}
          label="Estado"
          value={humanize(evaluacion.estadoCumplimiento)}
        />
        <Fact
          icon={ShieldCheck}
          label="Nota"
          value={evaluacion.calificacionAdministrativa.toFixed(2)}
        />
        <Fact
          icon={CalendarDays}
          label="Evaluada"
          value={formatDate(evaluacion.creadaEn)}
        />
      </div>

      <div className="mt-3 rounded-xl border border-violet-200 bg-violet-50 p-3.5">
        <p className="text-[10px] font-bold uppercase tracking-wider text-violet-700">
          Motivo de la revisión
        </p>
        <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-violet-950/80">
          {revision?.motivoSolicitud ||
            evaluacion.motivoRevisionTecnica ||
            "Revisión técnica solicitada."}
        </p>
      </div>

      {revision?.conceptoTecnico && (
        <div className="mt-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
              Concepto técnico
            </p>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <UserRound size={12} />
              {revision.revisadaPor?.nombre ?? "Revisor"}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-800">
            {revision.conceptoTecnico}
          </p>
        </div>
      )}

      {revision?.estado === "REQUIERE_AJUSTES" && (
        <div className="mt-3 flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3.5">
          <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" />
          <p className="text-xs leading-5 text-orange-800">
            Los ajustes deben registrarse en una nueva gestión. Esta evaluación permanece intacta en el historial.
          </p>
        </div>
      )}

      {revision?.motivoAnulacion && (
        <div className="mt-3 flex gap-3 rounded-xl border border-slate-300 bg-slate-50 p-3.5">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
          <p className="text-xs leading-5 text-slate-600">
            {revision.motivoAnulacion}
          </p>
        </div>
      )}
    </div>
  );
}

function Fact({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <Icon size={13} />
        {label}
      </p>
      <p className="mt-1.5 text-xs text-slate-700">{value}</p>
    </div>
  );
}

function humanize(value: string): string {
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
