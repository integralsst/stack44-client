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

          <AppIconButton
            icon={<X size={17} />}
            label="Cerrar"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={busy}
          />
        </div>

        <div className="grid grid-cols-2 gap-2 p-4">
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
      </div>
    </div>
  );
}
