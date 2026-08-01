import { AlertTriangle, X } from "lucide-react";

import AppSpinner from "./AppSpinner";

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function AppConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  busy = false,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[10050] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-white/10 bg-[#151617] shadow-[0_35px_120px_rgba(0,0,0,0.75)]">
        <div className="flex items-start gap-3 border-b border-white/8 p-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10 text-amber-300">
            <AlertTriangle size={19} />
          </div>

          <div className="min-w-0 flex-1">
            <h2
              id="confirm-dialog-title"
              className="text-base font-semibold text-white"
            >
              {title}
            </h2>
            <p className="mt-1.5 text-sm leading-6 text-neutral-400">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="rounded-xl p-2 text-neutral-500 transition hover:bg-white/5 hover:text-white disabled:opacity-40"
            aria-label="Cerrar"
          >
            <X size={17} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 p-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="min-h-11 rounded-xl border border-neutral-700 bg-neutral-900 px-4 text-sm font-semibold text-neutral-300 transition hover:border-neutral-600 hover:text-white disabled:opacity-40"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-black transition hover:bg-neutral-200 disabled:opacity-50"
          >
            {busy && (
              <AppSpinner
                size="sm"
                className="text-black"
              />
            )}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
