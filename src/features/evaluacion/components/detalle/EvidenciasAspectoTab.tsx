import { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  FilePlus2,
  Info,
  Paperclip,
} from "lucide-react";

import type { DetalleAspectoResponse } from "../../types/detalle-aspecto.types";
import type {
  EvidenciaEvaluacion,
  EvidenciaEvaluacionFormInput,
} from "../../types/evidencia-evaluacion.types";
import AppConfirmDialog from "../feedback/AppConfirmDialog";
import EvidenciaEvaluacionCard from "../evidencias/EvidenciaEvaluacionCard";
import EvidenciaEvaluacionForm from "../evidencias/EvidenciaEvaluacionForm";
import { EmptyState } from "./DetalleAspectoUi";

const FORMATO_FECHA = new Intl.DateTimeFormat("es-CO", {
  dateStyle: "medium",
});

function formatearFecha(fecha: string): string {
  return FORMATO_FECHA.format(new Date(fecha));
}

function descripcionFuente(
  fuente: DetalleAspectoResponse["detalleEvidencia"] extends infer T
    ? T extends { fuenteSoporte: infer F }
      ? F
      : never
    : never
): string {
  if (fuente === "EVALUACION") {
    return "Soporte directo de la evaluación";
  }

  if (fuente === "COMPROMISO") {
    return "Soporte válido de un compromiso relacionado";
  }

  if (fuente === "MIXTA") {
    return "Soporte directo y de compromiso relacionado";
  }

  return "Sin soporte válido asociado";
}

export default function EvidenciasAspectoTab({
  data,
  busy,
  onCreate,
  onUpdate,
  onRemove,
}: {
  data: DetalleAspectoResponse;
  busy: boolean;
  onCreate: (
    input: EvidenciaEvaluacionFormInput,
    evaluacionIdObjetivo?: string
  ) => Promise<void>;
  onUpdate: (
    evidence: EvidenciaEvaluacion,
    input: EvidenciaEvaluacionFormInput
  ) => Promise<void>;
  onRemove: (
    evidence: EvidenciaEvaluacion
  ) => Promise<void>;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] =
    useState<EvidenciaEvaluacion | null>(null);
  const [removing, setRemoving] =
    useState<EvidenciaEvaluacion | null>(null);
  const [createTarget, setCreateTarget] =
    useState<string | null>(null);

  const canEdit =
    data.permisos.puedeGestionarEvidencias;
  const puedeCompletarPosteriormente = Boolean(
    data.permisos.puedeCompletarEvidenciaPendiente &&
      data.evidenciaPendienteObjetivo
  );
  const totalEvidencias =
    data.evidencias.length +
    data.evidenciasCompromiso.length;
  const canCreate = canEdit || puedeCompletarPosteriormente;
  const defaultVisible = Boolean(
    data.tarea.aspecto.configuracionEvidencia
      ?.visibleClienteDefault
  );

  const closeForm = () => {
    if (busy) return;
    setFormOpen(false);
    setEditing(null);
    setCreateTarget(null);
  };

  const abrirCreacionActual = () => {
    setEditing(null);
    setCreateTarget(
      data.evidenciaObjetivo?.evaluacionId ?? null
    );
    setFormOpen(true);
  };

  const abrirCompletadoPendiente = () => {
    setEditing(null);
    setCreateTarget(
      data.evidenciaPendienteObjetivo?.evaluacionId ?? null
    );
    setFormOpen(true);
  };

  const detalle = data.detalleEvidencia;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Evidencias del aspecto
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              Aquí se muestran los soportes de la evaluación y las evidencias
              anexadas durante la ejecución de sus compromisos.
            </p>
          </div>

          {!formOpen && canCreate && (
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              {canEdit && (
                <button
                  type="button"
                  onClick={abrirCreacionActual}
                  className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700"
                >
                  <FilePlus2 size={16} />
                  {data.evidenciaObjetivo?.esBorrador
                    ? "Agregar a gestión actual"
                    : "Agregar evidencia"}
                </button>
              )}

              {puedeCompletarPosteriormente && (
                <button
                  type="button"
                  onClick={abrirCompletadoPendiente}
                  className="flex items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-100 px-4 py-2.5 text-sm font-bold text-amber-950 transition hover:bg-amber-200"
                >
                  <AlertTriangle size={16} />
                  Completar pendiente
                </button>
              )}
            </div>
          )}
        </div>

        {detalle && data.estadoEvidencia === "PENDIENTE" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-950">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Evidencia pendiente</p>
              <p className="mt-0.5">
                La evaluación oficial conserva su calificación 5, pero este aspecto exige soporte documental y todavía no tiene uno válido asociado.
              </p>
            </div>
          </div>
        )}

        {detalle && data.estadoEvidencia === "COMPLETA" && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-xs leading-5 text-emerald-950">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-bold">Evidencia completa</p>
              <p className="mt-0.5">
                {descripcionFuente(detalle.fuenteSoporte)}. El soporte documental no modifica la calificación de la evaluación.
              </p>
            </div>
          </div>
        )}

        {data.estadoEvidencia === "NO_REQUERIDA" && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-700">
            <Info size={15} className="mt-0.5 shrink-0" />
            <span>
              Este aspecto no tiene evidencia obligatoria configurada. Los soportes pueden registrarse de forma informativa cuando el flujo lo permita.
            </span>
          </div>
        )}

        {data.estadoEvidencia === "NO_APLICA" &&
          data.tarea.aspecto.configuracionEvidencia
            ?.requiereEvidencia && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs leading-5 text-slate-700">
              <Info size={15} className="mt-0.5 shrink-0" />
              <span>
                El aspecto exige evidencia, pero el estado actual no corresponde a una evaluación finalizada en 5; por eso no se genera una pendiente documental independiente.
              </span>
            </div>
          )}

        {!canCreate && data.permisos.motivoEvidencias && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">
            <Info size={15} className="mt-0.5 shrink-0" />
            <span>{data.permisos.motivoEvidencias}</span>
          </div>
        )}
      </div>

      {formOpen && canCreate && (
        <EvidenciaEvaluacionForm
          evidence={editing}
          busy={busy}
          defaultVisibleClient={defaultVisible}
          onCancel={closeForm}
          onSubmit={async (input) => {
            if (editing) {
              await onUpdate(editing, input);
            } else {
              await onCreate(
                input,
                createTarget ?? undefined
              );
            }
            closeForm();
          }}
        />
      )}

      {totalEvidencias === 0 && (
        <EmptyState
          title="No hay evidencias registradas"
          description={
            canCreate
              ? "Agrega un enlace de Google Drive o una URL externa como soporte de esta evaluación."
              : "La evaluación y sus compromisos no tienen soportes visibles para tu usuario."
          }
        />
      )}

      {data.evidencias.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-slate-950">
              Evidencias de la evaluación
            </h4>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
              {data.evidencias.length}
            </span>
          </div>

          {data.evidencias.map((evidence) => (
            <EvidenciaEvaluacionCard
              key={evidence.id}
              evidence={evidence}
              editable={canEdit}
              onEdit={() => {
                setEditing(evidence);
                setCreateTarget(null);
                setFormOpen(true);
              }}
              onRemove={() => setRemoving(evidence)}
            />
          ))}
        </section>
      )}

      {data.evidenciasCompromiso.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h4 className="text-sm font-bold text-slate-950">
                Evidencias de compromisos
              </h4>
              <p className="mt-0.5 text-xs text-slate-600">
                Soportes cargados durante el seguimiento y cierre. Solo los relacionados explícitamente con la evaluación oficial satisfacen el requisito documental.
              </p>
            </div>
            <span className="rounded-full bg-cyan-100 px-2.5 py-1 text-xs font-bold text-cyan-800">
              {data.evidenciasCompromiso.length}
            </span>
          </div>

          {data.evidenciasCompromiso.map((evidence) => (
            <article
              key={evidence.id}
              className={`rounded-2xl border p-4 shadow-sm ${
                evidence.soporteValidoParaEvaluacionObjetivo
                  ? "border-emerald-200 bg-emerald-50/70"
                  : "border-cyan-200 bg-cyan-50/60"
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 ring-1 ring-cyan-200">
                  <Paperclip size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h5 className="break-words text-sm font-bold text-slate-950">
                      {evidence.nombre}
                    </h5>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-800 ring-1 ring-cyan-200">
                      Compromiso
                    </span>
                    {evidence.soporteValidoParaEvaluacionObjetivo && (
                      <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Soporte válido
                      </span>
                    )}
                  </div>

                  {evidence.descripcion && (
                    <p className="mt-2 text-xs leading-5 text-slate-700">
                      {evidence.descripcion}
                    </p>
                  )}

                  <div className="mt-3 rounded-xl border border-cyan-100 bg-white/80 px-3 py-2">
                    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      Compromiso relacionado
                    </p>
                    <p className="mt-1 text-xs font-semibold leading-5 text-slate-800">
                      {evidence.compromiso.descripcion}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Estado:{" "}
                      {evidence.compromiso.estado.replaceAll(
                        "_",
                        " "
                      )}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-col gap-2 text-[11px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                    <span>
                      Adjuntada por {evidence.creadoPor.nombre} ·{" "}
                      {formatearFecha(evidence.createdAt)}
                    </span>
                    <a
                      href={evidence.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-cyan-700 bg-white px-3 py-2 text-xs font-bold text-cyan-800 transition hover:bg-cyan-100"
                    >
                      Abrir evidencia
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <AppConfirmDialog
        open={Boolean(removing)}
        title="Retirar evidencia"
        description={`La evidencia ${
          removing?.nombre ?? "seleccionada"
        } dejará de mostrarse, pero el movimiento quedará registrado en el historial.`}
        confirmLabel="Retirar evidencia"
        busy={busy}
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          if (!removing) return;

          void onRemove(removing)
            .then(() => {
              setRemoving(null);
            })
            .catch(() => undefined);
        }}
      />
    </div>
  );
}
