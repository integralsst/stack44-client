import type { ReactNode } from "react";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";

type Tone =
  | "info"
  | "success"
  | "warning"
  | "error";

interface Props {
  tone?: Tone;
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
}

const styles: Record<
  Tone,
  {
    icon: typeof Info;
    wrapper: string;
    iconBox: string;
    title: string;
  }
> = {
  info: {
    icon: Info,
    wrapper: "border-cyan-200 bg-cyan-50",
    iconBox: "border-cyan-200 bg-white text-cyan-700",
    title: "text-cyan-900",
  },
  success: {
    icon: CheckCircle2,
    wrapper: "border-emerald-200 bg-emerald-50",
    iconBox: "border-emerald-200 bg-white text-emerald-700",
    title: "text-emerald-900",
  },
  warning: {
    icon: AlertTriangle,
    wrapper: "border-amber-200 bg-amber-50",
    iconBox: "border-amber-200 bg-white text-amber-700",
    title: "text-amber-950",
  },
  error: {
    icon: AlertCircle,
    wrapper: "border-red-200 bg-red-50",
    iconBox: "border-red-200 bg-white text-red-700",
    title: "text-red-900",
  },
};

export default function AppAlert({
  tone = "info",
  title,
  description,
  children,
  className = "",
}: Props) {
  const current = styles[tone];
  const Icon = current.icon;

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`rounded-2xl border p-3 shadow-[0_12px_32px_rgba(15,23,42,0.08)] sm:p-4 ${current.wrapper} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${current.iconBox}`}
        >
          <Icon size={16} aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`break-words text-sm font-semibold ${current.title}`}
          >
            {title}
          </p>

          {description && (
            <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-slate-600">
              {description}
            </p>
          )}

          {children && (
            <div className="mt-3">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
