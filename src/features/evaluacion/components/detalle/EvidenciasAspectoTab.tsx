import { useState } from "react";
import {
  FilePlus2,
  Info,
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
    input: EvidenciaEvaluacionFormInput
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

  const canEdit =
    data.permisos.puedeGestionarEvidencias;
  const defaultVisible = Boolean(
    data.tarea.aspecto.configuracionEvidencia
      ?.visibleClienteDefault
  );

  const closeForm = () => {
    if (busy) return;
    setFormOpen(false);
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">
              Evidencias del estado mostrado
            </h3>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {data.evidenciaObjetivo?.esBorrador
                ? "Se muestran los soportes de la evaluación en borrador de la gestión actual."
                : data.evidenciaObjetivo
                  ? "Se muestran los soportes de la última evaluación finalizada."
                  : "Este aspecto todavía no tiene una evaluación a la cual asociar soportes."}
            </p>
          </div>

          {canEdit && !formOpen && (
            <button
              type="button"
              onClick={() => setFormOpen(true)}
              className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700"
            >
              <FilePlus2 size={16} />
              Agregar evidencia
            </button>
          )}
        </div>

        {!canEdit && data.permisos.motivoEvidencias && (
          <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-900">
            <Info size={15} className="mt-0.5 shrink-0" />
            <span>{data.permisos.motivoEvidencias}</span>
          </div>
        )}
      </div>

      {formOpen && canEdit && (
        <EvidenciaEvaluacionForm
          evidence={editing}
          busy={busy}
          defaultVisibleClient={defaultVisible}
          onCancel={closeForm}
          onSubmit={async (input) => {
            if (editing) {
              await onUpdate(editing, input);
            } else {
              await onCreate(input);
            }
            closeForm();
          }}
        />
      )}

      {data.evidencias.length === 0 ? (
        <EmptyState
          title="No hay evidencias registradas"
          description={
            canEdit
              ? "Agrega un enlace de Google Drive o una URL externa como soporte de esta evaluación."
              : "La evaluación consultada no tiene soportes visibles para tu usuario."
          }
        />
      ) : (
        <div className="space-y-3">
          {data.evidencias.map((evidence) => (
            <EvidenciaEvaluacionCard
              key={evidence.id}
              evidence={evidence}
              editable={canEdit}
              onEdit={() => {
                setEditing(evidence);
                setFormOpen(true);
              }}
              onRemove={() => setRemoving(evidence)}
            />
          ))}
        </div>
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
