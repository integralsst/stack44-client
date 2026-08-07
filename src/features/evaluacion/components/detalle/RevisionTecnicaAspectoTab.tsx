import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";

import type {
  DetalleAspectoResponse,
  EvaluacionDetalleAspecto,
} from "../../types/detalle-aspecto.types";
import RevisionTecnicaEstadoBadge from "../revisiones/RevisionTecnicaEstadoBadge";

export default function RevisionTecnicaAspectoTab({
  data,
}: {
  data: DetalleAspectoResponse;
}) {
  const evaluaciones = data.revisionesTecnicas;

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
        <p className="text-sm font-semibold text-cyan-200">
          Revisión técnica del aspecto
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Cada revisión corresponde a una evaluación concreta. Si se requieren ajustes, la evaluación finalizada no se modifica: se registra una nueva gestión.
        </p>
      </div>

      {evaluaciones.map((evaluacion) => (
        <RevisionItem
          key={evaluacion.id}
          evaluacion={evaluacion}
          esBorrador={
            evaluacion.gestion.estado === "BORRADOR"
          }
        />
      ))}
    </div>
  );
}

function RevisionItem({
  evaluacion,
  esBorrador,
}: {
  evaluacion: EvaluacionDetalleAspecto;
  esBorrador: boolean;
}) {
  const revision = evaluacion.revisionTecnica;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          {revision ? (
            <RevisionTecnicaEstadoBadge estado={revision.estado} />
          ) : (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-800">
              <Clock3 size={12} />
              Se creará al finalizar
            </span>
          )}
          <p className="mt-3 text-sm font-semibold text-slate-950">
            {evaluacion.gestion.tipoActividad}
          </p>
          <p className="mt-1 text-xs text-slate-600">
            {formatDate(evaluacion.gestion.fechaGestion)} · {evaluacion.gestion.profesional}
          </p>
        </div>

        {esBorrador && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-800">
            Borrador
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
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

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Motivo de la revisión
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {revision?.motivoSolicitud ||
            evaluacion.motivoRevisionTecnica ||
            "Revisión técnica solicitada."}
        </p>
      </div>

      {revision?.conceptoTecnico && (
        <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-700">
              Concepto técnico
            </p>
            <span className="flex items-center gap-1.5 text-[10px] text-slate-600">
              <UserRound size={12} />
              {revision.revisadaPor?.nombre ?? "Revisor"}
            </span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">
            {revision.conceptoTecnico}
          </p>
        </div>
      )}

      {revision?.estado === "REQUIERE_AJUSTES" && (
        <div className="mt-4 flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-4">
          <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" />
          <p className="text-xs leading-5 text-orange-800">
            Los ajustes deben registrarse en una nueva gestión. Esta evaluación permanece intacta en el historial.
          </p>
        </div>
      )}

      {revision?.motivoAnulacion && (
        <div className="mt-4 flex gap-3 rounded-xl border border-slate-300 bg-slate-50 p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
          <p className="text-xs leading-5 text-slate-600">
            {revision.motivoAnulacion}
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
  icon: typeof ShieldCheck;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
        <Icon size={13} />
        {label}
      </p>
      <p className="mt-2 text-xs text-slate-700">{value}</p>
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
