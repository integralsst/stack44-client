import {
  CalendarDays,
  ExternalLink,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
} from "lucide-react";

import type { EvidenciaEvaluacion } from "../../types/evidencia-evaluacion.types";
import { formatDate } from "../detalle/DetalleAspectoUi";

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
  return (
    <article className="rounded-2xl border border-neutral-800 bg-[#101112] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="break-words text-sm font-semibold text-white">
              {evidence.nombre}
            </h4>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[8px] font-bold uppercase tracking-wider ${
                evidence.visibleCliente
                  ? "bg-emerald-500/10 text-emerald-300"
                  : "bg-neutral-800 text-neutral-500"
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
            <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-neutral-500">
              {evidence.descripcion}
            </p>
          )}
        </div>

        {editable && (
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-400 transition hover:text-white"
              aria-label="Editar evidencia"
              title="Editar"
            >
              <Pencil size={15} />
            </button>
            <button
              type="button"
              onClick={onRemove}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10 text-red-300 transition hover:bg-red-500/20"
              aria-label="Retirar evidencia"
              title="Retirar"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-3 border-t border-neutral-800 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] text-neutral-600">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={12} />
            Documento: {formatDate(evidence.fechaDocumento)}
          </span>
          <span>Agregada: {formatDate(evidence.createdAt, true)}</span>
          <span>Por: {evidence.creadoPor.nombre}</span>
        </div>

        <a
          href={evidence.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
        >
          Abrir enlace
          <ExternalLink size={13} />
        </a>
      </div>
    </article>
  );
}
