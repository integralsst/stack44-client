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
    wrapper:
      "border-cyan-400/15 bg-cyan-400/[0.07]",
    iconBox:
      "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
    title: "text-cyan-100",
  },
  success: {
    icon: CheckCircle2,
    wrapper:
      "border-emerald-400/15 bg-emerald-400/[0.07]",
    iconBox:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
    title: "text-emerald-100",
  },
  warning: {
    icon: AlertTriangle,
    wrapper:
      "border-amber-400/15 bg-amber-400/[0.07]",
    iconBox:
      "border-amber-400/20 bg-amber-400/10 text-amber-300",
    title: "text-amber-100",
  },
  error: {
    icon: AlertCircle,
    wrapper:
      "border-red-400/15 bg-red-400/[0.07]",
    iconBox:
      "border-red-400/20 bg-red-400/10 text-red-300",
    title: "text-red-100",
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
      className={`rounded-2xl border p-3 shadow-[0_18px_50px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-4 ${current.wrapper} ${className}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${current.iconBox}`}
        >
          <Icon size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`text-sm font-semibold ${current.title}`}
          >
            {title}
          </p>

          {description && (
            <p className="mt-1 text-xs leading-5 text-neutral-400">
              {description}
            </p>
          )}

          {children && (
            <div className="mt-2">{children}</div>
          )}
        </div>
      </div>
    </div>
  );
}
