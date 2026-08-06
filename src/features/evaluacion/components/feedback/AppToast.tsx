import { useEffect } from "react";
import { createPortal } from "react-dom";
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
    wrapperClass: string;
    iconBoxClass: string;
    accentClass: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    wrapperClass: "border-emerald-200 bg-white",
    iconBoxClass:
      "border-emerald-200 bg-emerald-50 text-emerald-700",
    accentClass: "bg-emerald-500",
  },
  error: {
    icon: AlertCircle,
    wrapperClass: "border-red-200 bg-white",
    iconBoxClass:
      "border-red-200 bg-red-50 text-red-700",
    accentClass: "bg-red-500",
  },
  warning: {
    icon: AlertTriangle,
    wrapperClass: "border-amber-200 bg-white",
    iconBoxClass:
      "border-amber-200 bg-amber-50 text-amber-700",
    accentClass: "bg-amber-500",
  },
  info: {
    icon: Info,
    wrapperClass: "border-cyan-200 bg-white",
    iconBoxClass:
      "border-cyan-200 bg-cyan-50 text-cyan-700",
    accentClass: "bg-cyan-500",
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
  const autoCloseDuration =
    tone === "error" ? 0 : duration;

  useEffect(() => {
    if (!open || autoCloseDuration <= 0) {
      return;
    }

    const timeout = window.setTimeout(
      onClose,
      autoCloseDuration
    );

    return () =>
      window.clearTimeout(timeout);
  }, [autoCloseDuration, onClose, open]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  const current = config[tone];
  const Icon = current.icon;

  return createPortal(
    <div className="pointer-events-none fixed left-3 right-3 top-3 z-[12000] flex justify-center sm:left-auto sm:right-5 sm:top-5 sm:w-[32rem] sm:max-w-[calc(100vw-2.5rem)] sm:block">
      <div
        role={tone === "error" ? "alert" : "status"}
        aria-live={tone === "error" ? "assertive" : "polite"}
        className={`pointer-events-auto relative max-h-[calc(100dvh-1.5rem)] w-full max-w-[32rem] overflow-y-auto rounded-2xl border shadow-[0_24px_70px_rgba(15,23,42,0.2)] ${current.wrapperClass}`}
      >
        <div
          aria-hidden="true"
          className={`absolute inset-y-0 left-0 w-1 ${current.accentClass}`}
        />

        <div className="flex items-start gap-3 py-4 pl-5 pr-4">
          <div
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${current.iconBoxClass}`}
          >
            <Icon size={18} aria-hidden="true" />
          </div>

          <div className="min-w-0 flex-1">
            <p className="break-words text-sm font-semibold text-slate-900">
              {title}
            </p>
            {description && (
              <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
                {description}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/30"
            aria-label="Cerrar notificación"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
