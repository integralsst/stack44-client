import {
  CalendarDays,
  ClipboardList,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from "lucide-react";

import type { EvidenciaEvaluacion } from "../../types/evidencia-evaluacion.types";
import { formatDate } from "../detalle/DetalleAspectoUi";

function esEvidenciaDesdeBitacora(evidence: EvidenciaEvaluacion): boolean {
  return (
    evidence.nombre === "Evidencia vinculada desde Bitácora" ||
    evidence.nombre.startsWith("Evidencia ·")
  );
}

export default function EvidenciaEvaluacionCard({
  evidence,
  editable,
  onEdit,
  onRemove,
}: {
  evidence: EvidenciaEvaluacion;
  editable: boolean;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const evidenciaDesdeBitacora = esEvidenciaDesdeBitacora(evidence);

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="break-words text-sm font-semibold text-slate-950">
              {evidence.nombre}
            </h4>
            {evidenciaDesdeBitacora && (
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2 py-1 text-[8px] font-bold uppercase tracking-wider text-cyan-800">
                <ClipboardList size={10} />
                Origen: Bitácora
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-wider ${
                evidence.visibleCliente
                  ? "bg-emerald-500/10 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {evidence.visibleCliente ? (
                <Eye size={10} />
              ) : (
                <EyeOff size={10} />
              )}
              {evidence.visibleCliente
                ? "Visible al cliente"
                : "Uso interno"}
            </span>
          </div>
          {evidence.descripcion && (
            <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">
              {evidence.descripcion}
            </p>
          )}
        </div>

        {editable && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-slate-600 transition hover:text-slate-950"
              aria-label="Editar evidencia"
              title="Editar"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-800 transition hover:bg-red-500/20"
              aria-label="Retirar evidencia"
              title="Retirar"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-slate-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={12} />
            Fecha del documento: {evidence.fechaDocumento
              ? formatDate(evidence.fechaDocumento)
              : "No informada"}
          </span>
          <span>Agregada: {formatDate(evidence.createdAt, true)}</span>
          <span>Por: {evidence.creadoPor.nombre}</span>
        </div>

        <a
          href={evidence.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-500/20"
        >
          Abrir enlace
          <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );
}
