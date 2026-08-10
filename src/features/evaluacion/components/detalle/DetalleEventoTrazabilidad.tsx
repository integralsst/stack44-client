import {
  CalendarClock,
  FileCheck2,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../auth/context/AuthContext";
import type { HistorialAspectoItem } from "../../types/detalle-aspecto.types";
import type {
  DetalleAspectoConTrazabilidad,
  EventoTrazabilidadAspecto,
} from "../../types/trazabilidad-aspecto.types";
import {
  decisionNoAplicaLabel,
  type HistorialConResultadoEfectivo,
} from "./HistorialEvaluacionCard";
import { formatDate } from "./DetalleAspectoUi";

interface Props {
  evento: EventoTrazabilidadAspecto;
  data: DetalleAspectoConTrazabilidad;
  onOpenRevisionTecnica: () => void;
}

export default function DetalleEventoTrazabilidad({
  evento,
  data,
  onOpenRevisionTecnica,
}: Props) {
  const evaluacion = evento.referencia.evaluacionId
    ? data.historial.find(
        (item) => item.id === evento.referencia.evaluacionId
      ) ?? null
    : null;
  const compromiso = evento.referencia.compromisoId
    ? data.compromisos.find(
        (item) => item.id === evento.referencia.compromisoId
      ) ?? null
    : null;
  const revisionEvaluacion = evento.referencia.revisionTecnicaId
    ? data.revisionesTecnicas.find(
        (item) =>
          item.revisionTecnica?.id ===
          evento.referencia.revisionTecnicaId
      ) ?? null
    : null;

  if (evento.tipo === "COMPROMISO" && compromiso) {
    return <DetalleCompromiso compromiso={compromiso} />;
  }

  if (evento.tipo === "REVISION_TECNICA") {
    return (
      <DetalleRevision
        evaluacion={revisionEvaluacion ?? evaluacion}
        onOpenRevisionTecnica={onOpenRevisionTecnica}
      />
    );
  }

  if (evaluacion) {
    return (
      <DetalleEvaluacion
        evaluacion={evaluacion}
        tipo={evento.tipo}
      />
    );
  }

  return (
    <p className="text-xs leading-5 text-slate-600">
      El evento conserva su trazabilidad. Abre el módulo especializado si necesitas consultar información adicional.
    </p>
  );
}

function DetalleEvaluacion({
  evaluacion,
  tipo,
}: {
  evaluacion: HistorialAspectoItem;
  tipo: EventoTrazabilidadAspecto["tipo"];
}) {
  const item = evaluacion as HistorialConResultadoEfectivo;
  const registrada =
    item.calificacionRegistrada ??
    evaluacion.calificacionAdministrativa;
  const efectiva =
    item.calificacionEfectiva ??
    evaluacion.calificacionAdministrativa;
  const decisionNoAplica = item.decisionNoAplica ?? null;
  const aprobacion = item.aprobacionGestion ?? null;

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <MiniDato
          label="Gestión"
          value={evaluacion.gestion.tipoActividad}
        />
        <MiniDato
          label="Profesional"
          value={evaluacion.gestion.profesional}
          icon={<UserRound size={12} />}
        />
        <MiniDato
          label="Nota efectiva"
          value={String(efectiva)}
        />
        <MiniDato
          label="Nota registrada"
          value={String(registrada)}
        />
      </div>

      {tipo === "NO_APLICA" && decisionNoAplica && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-amber-800">
            Decisión de No aplica
          </p>
          <p className="mt-1 text-xs font-semibold text-amber-950">
            {decisionNoAplicaLabel(decisionNoAplica.estado)} · efectivo {decisionNoAplica.resultadoEfectivo}
          </p>
          {evaluacion.justificacionNoAplica && (
            <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-amber-950/80">
              Justificación: {evaluacion.justificacionNoAplica}
            </p>
          )}
          {decisionNoAplica.observacionDecision && (
            <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-amber-950/80">
              Decisión: {decisionNoAplica.observacionDecision}
            </p>
          )}
        </div>
      )}

      {tipo === "APROBACION_GESTION" && aprobacion && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-800">
            Aprobación de gestión
          </p>
          <p className="mt-1 text-xs font-semibold text-emerald-950">
            Estado: {humanizar(aprobacion.estado)}
          </p>
          {aprobacion.observacionDecision && (
            <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-emerald-950/80">
              {aprobacion.observacionDecision}
            </p>
          )}
        </div>
      )}

      {(evaluacion.observacion || evaluacion.justificacionNoAplica) &&
        tipo === "EVALUACION" && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
              Observación
            </p>
            <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-700">
              {evaluacion.observacion ??
                evaluacion.justificacionNoAplica}
            </p>
          </div>
        )}

      <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-500">
        <span className="inline-flex items-center gap-1.5">
          <CalendarClock size={12} />
          Gestión {formatDate(evaluacion.gestion.fechaGestion)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <FileCheck2 size={12} />
          {evaluacion.totalEvidencias} evidencia(s)
        </span>
      </div>
    </div>
  );
}

function DetalleRevision({
  evaluacion,
  onOpenRevisionTecnica,
}: {
  evaluacion: HistorialAspectoItem | DetalleAspectoConTrazabilidad["revisionesTecnicas"][number] | null;
  onOpenRevisionTecnica: () => void;
}) {
  const revision = evaluacion?.revisionTecnica ?? null;

  return (
    <div className="space-y-3">
      {evaluacion && (
        <div className="grid gap-2 sm:grid-cols-3">
          <MiniDato
            label="Estado evaluado"
            value={humanizar(evaluacion.estadoCumplimiento)}
          />
          <MiniDato
            label="Nota"
            value={evaluacion.calificacionAdministrativa.toFixed(2)}
          />
          <MiniDato
            label="Gestión"
            value={evaluacion.gestion.tipoActividad}
          />
        </div>
      )}

      <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
        <p className="text-[9px] font-bold uppercase tracking-wider text-violet-700">
          Motivo de la revisión
        </p>
        <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-violet-950/80">
          {revision?.motivoSolicitud ||
            evaluacion?.motivoRevisionTecnica ||
            "Revisión técnica solicitada."}
        </p>
      </div>

      {revision?.conceptoTecnico && (
        <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-700">
            Concepto técnico
          </p>
          <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-800">
            {revision.conceptoTecnico}
          </p>
          {revision.revisadaPor && (
            <p className="mt-2 text-[10px] text-slate-500">
              {revision.revisadaPor.nombre} · {formatDate(
                revision.revisadaEn,
                true
              )}
            </p>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onOpenRevisionTecnica}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-violet-700 transition hover:text-violet-900"
      >
        <ShieldCheck size={13} />
        Abrir revisión técnica
      </button>
    </div>
  );
}

function DetalleCompromiso({
  compromiso,
}: {
  compromiso: DetalleAspectoConTrazabilidad["compromisos"][number];
}) {
  const { hasRole } = useAuth();
  const supervisor = hasRole(
    "COORDINATOR",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );
  const ruta = supervisor
    ? `/dashboard/compromisos/${compromiso.id}`
    : `/dashboard/mis-compromisos/${compromiso.id}`;
  const movimientos = compromiso.eventos.slice(-8).reverse();

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-3">
        <MiniDato
          label="Estado actual"
          value={humanizar(compromiso.estado)}
        />
        <MiniDato
          label="Fecha límite"
          value={formatDate(compromiso.fechaLimite)}
        />
        <MiniDato
          label="Actividades"
          value={`${compromiso.progreso.atendidas} de ${compromiso.progreso.total} completas`}
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
          Compromiso
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-800">
          {compromiso.descripcion}
        </p>
      </div>

      {movimientos.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Movimientos recientes
          </p>
          <ol className="mt-2 space-y-2">
            {movimientos.map((movimiento) => (
              <li
                key={movimiento.id}
                className="flex gap-2 text-xs leading-5 text-slate-700"
              >
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-500" />
                <span>
                  {movimiento.descripcion}
                  <span className="ml-1 text-[10px] text-slate-500">
                    · {formatDate(movimiento.createdAt, true)}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <Link
        to={ruta}
        className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-cyan-700"
      >
        Abrir compromiso completo
      </Link>
    </div>
  );
}

function MiniDato({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold leading-5 text-slate-800">
        {value}
      </p>
    </div>
  );
}

function humanizar(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letter) => letter.toUpperCase());
}
