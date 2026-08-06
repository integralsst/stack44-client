import { createPortal } from "react-dom";
import { AlertTriangle, X } from "lucide-react";

import AppButton from "../../../../components/ui/AppButton";
import AppIconButton from "../../../../components/ui/AppIconButton";

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
  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[11000] flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      <button
        type="button"
        aria-label="Cerrar confirmación"
        className="absolute inset-0 cursor-default"
        onClick={() => {
          if (!busy) onCancel();
        }}
      />

      <section className="relative z-10 flex max-h-[calc(100dvh-1.5rem)] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_35px_100px_rgba(15,23,42,0.3)]">
        <div className="min-h-0 overflow-y-auto">
          <div className="flex items-start gap-3 border-b border-slate-200 p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-amber-200 bg-amber-50 text-amber-700">
              <AlertTriangle size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <h2
                id="confirm-dialog-title"
                className="break-words text-base font-semibold text-slate-900"
              >
                {title}
              </h2>
              <p
                id="confirm-dialog-description"
                className="mt-1.5 whitespace-pre-wrap break-words text-sm leading-6 text-slate-600"
              >
                {description}
              </p>
            </div>

            <AppIconButton
              icon={<X size={17} />}
              label="Cerrar"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={busy}
            />
          </div>
        </div>

        <div className="grid shrink-0 grid-cols-1 gap-2 border-t border-slate-100 p-4 sm:grid-cols-2">
          <AppButton
            variant="secondary"
            size="lg"
            fullWidth
            onClick={onCancel}
            disabled={busy}
          >
            {cancelLabel}
          </AppButton>

          <AppButton
            variant="primary"
            size="lg"
            fullWidth
            onClick={onConfirm}
            loading={busy}
            loadingLabel="Procesando"
          >
            {confirmLabel}
          </AppButton>
        </div>
      </section>
    </div>,
    document.body
  );
}
