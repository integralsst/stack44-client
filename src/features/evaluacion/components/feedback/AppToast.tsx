import { useEffect } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
} from "lucide-react";

export type ToastTone =
  | "success"
  | "error"
  | "warning"
  | "info";

interface Props {
  open: boolean;
  tone?: ToastTone;
  title: string;
  description?: string;
  duration?: number;
  onClose: () => void;
}

const config: Record<
  ToastTone,
  {
    icon: typeof Info;
    iconClass: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    iconClass: "text-emerald-300",
  },
  error: {
    icon: AlertCircle,
    iconClass: "text-red-300",
  },
  warning: {
    icon: AlertTriangle,
    iconClass: "text-amber-300",
  },
  info: {
    icon: Info,
    iconClass: "text-cyan-300",
  },
};

export default function AppToast({
  open,
  tone = "info",
  title,
  description,
  duration = 4200,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open || duration <= 0) {
      return;
    }

    const timeout = window.setTimeout(
      onClose,
      duration
    );

    return () =>
      window.clearTimeout(timeout);
  }, [duration, onClose, open]);

  if (!open) {
    return null;
  }

  const current = config[tone];
  const Icon = current.icon;

  return (
    <div className="fixed inset-x-3 top-3 z-[120] sm:inset-x-auto sm:right-5 sm:top-5 sm:w-[390px]">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#151617]/95 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        <div className="flex items-start gap-3 p-4">
          <Icon
            size={19}
            className={`mt-0.5 shrink-0 ${current.iconClass}`}
          />

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-white">
              {title}
            </p>
            {description && (
              <p className="mt-1 text-xs leading-5 text-neutral-400">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-neutral-500 transition hover:bg-white/5 hover:text-white"
            aria-label="Cerrar notificación"
          >
            <X size={16} />
          </button>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
      </div>
    </div>
  );
}
