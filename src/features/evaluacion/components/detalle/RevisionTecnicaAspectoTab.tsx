import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserRound,
  Wrench,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../../auth/context/AuthContext";
import { obtenerRevisionesTecnicasPeriodo } from "../../api/revisiones-tecnicas.api";
import type {
  DetalleAspectoResponse,
  EvaluacionDetalleAspecto,
} from "../../types/detalle-aspecto.types";
import type { RevisionTecnicaEvaluacionItem } from "../../types/revision-tecnica.types";
import RevisionTecnicaEstadoBadge from "../revisiones/RevisionTecnicaEstadoBadge";
import DetalleColapsableCard from "./DetalleColapsableCard";

export default function RevisionTecnicaAspectoTab({
  data,
}: {
  data: DetalleAspectoResponse;
}) {
  const { token } = useAuth();
  const evaluaciones = data.revisionesTecnicas;
  const [abiertaId, setAbiertaId] = useState<string | null>(null);
  const [flujoPorRevision, setFlujoPorRevision] = useState<
    Record<string, RevisionTecnicaEvaluacionItem>
  >({});

  useEffect(() => {
    const revisionesQueNecesitanFlujo = evaluaciones
      .map((evaluacion) => evaluacion.revisionTecnica)
      .filter(
        (revision): revision is NonNullable<typeof revision> =>
          revision !== null && revision.estado === "REQUIERE_AJUSTES"
      );

    if (!token || revisionesQueNecesitanFlujo.length === 0) {
      setFlujoPorRevision({});
      return;
    }

    const ids = new Set(
      revisionesQueNecesitanFlujo.map((revision) => revision.id)
    );
    let active = true;

    void obtenerRevisionesTecnicasPeriodo(data.periodo.id, token)
      .then((response) => {
        if (!active) return;

        const next = Object.fromEntries(
          response.revisiones
            .filter((revision) => ids.has(revision.id))
            .map((revision) => [revision.id, revision])
        );

        setFlujoPorRevision(next);
      })
      .catch(() => {
        // El detalle conserva el estado persistido como fallback si no es
        // posible enriquecerlo con el estado de flujo calculado del periodo.
      });

    return () => {
      active = false;
    };
  }, [data.periodo.id, evaluaciones, token]);

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
          const flujo = revision
            ? flujoPorRevision[revision.id]
            : undefined;
          const estadoVisual = flujo?.estadoFlujo ?? revision?.estado;

          const summary = (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                {estadoVisual ? (
                  <RevisionTecnicaEstadoBadge estado={estadoVisual} />
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
                    flujo={flujo}
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
  flujo,
}: {
  evaluacion: EvaluacionDetalleAspecto;
  esBorrador: boolean;
  flujo?: RevisionTecnicaEvaluacionItem;
}) {
  const revision = evaluacion.revisionTecnica;
  const estadoFlujo = flujo?.estadoFlujo ?? revision?.estado;

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

      {estadoFlujo === "REQUIERE_AJUSTES" && (
        <div className="mt-3 flex gap-3 rounded-xl border border-orange-200 bg-orange-50 p-3.5">
          <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-orange-700" />
          <p className="text-xs leading-5 text-orange-800">
            Los ajustes deben registrarse en una nueva gestión. Esta evaluación permanece intacta en el historial.
          </p>
        </div>
      )}

      {estadoFlujo === "EN_CORRECCION" && (
        <div className="mt-3 flex gap-3 rounded-xl border border-cyan-200 bg-cyan-50 p-3.5">
          <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-cyan-700" />
          <div>
            <p className="text-xs font-semibold text-cyan-900">
              Corrección en curso
            </p>
            <p className="mt-1 text-xs leading-5 text-cyan-800">
              {flujo?.gestionCorreccion
                ? `${flujo.gestionCorreccion.tipoActividad} · ${flujo.gestionCorreccion.profesional}`
                : "La corrección ya está siendo atendida en una gestión vinculada."}
            </p>
          </div>
        </div>
      )}

      {estadoFlujo === "SUBSANADA" && (
        <div className="mt-3 rounded-xl border border-teal-200 bg-teal-50 p-3.5">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-teal-700" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-teal-900">
                Corrección completada
              </p>
              <p className="mt-1 text-xs leading-5 text-teal-800">
                La revisión quedó subsanada. El concepto técnico original y la evaluación de origen permanecen intactos en la trazabilidad.
              </p>
            </div>
          </div>

          {flujo?.gestionCorreccion && (
            <div className="mt-3 rounded-lg border border-teal-200 bg-white/70 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
                Corrección registrada
              </p>
              <p className="mt-1.5 text-xs font-semibold text-slate-800">
                {flujo.gestionCorreccion.tipoActividad}
              </p>
              <p className="mt-1 text-[11px] text-slate-600">
                {formatDate(flujo.gestionCorreccion.fechaGestion)} · {flujo.gestionCorreccion.profesional}
              </p>
            </div>
          )}
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
