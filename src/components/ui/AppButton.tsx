import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "ghost";

type ButtonSize = "sm" | "md" | "lg";

interface AppButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  loadingLabel?: string;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-cyan-600 bg-cyan-600 text-white hover:border-cyan-700 hover:bg-cyan-700",
  secondary:
    "border-slate-300 bg-white text-slate-700 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900",
  success:
    "border-emerald-300 bg-emerald-50 text-emerald-800 hover:border-emerald-400 hover:bg-emerald-100",
  warning:
    "border-amber-300 bg-amber-50 text-amber-900 hover:border-amber-400 hover:bg-amber-100",
  danger:
    "border-red-300 bg-red-50 text-red-800 hover:border-red-400 hover:bg-red-100",
  ghost:
    "border-transparent bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "min-h-9 rounded-lg px-3 text-xs",
  md: "min-h-10 rounded-xl px-4 text-sm",
  lg: "min-h-11 rounded-xl px-5 text-sm",
};

export default function AppButton({
  variant = "secondary",
  size = "md",
  loading = false,
  loadingLabel = "Procesando",
  leadingIcon,
  trailingIcon,
  fullWidth = false,
  disabled,
  className = "",
  children,
  type = "button",
  ...props
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden border font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-55 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      <span
        className={`inline-flex items-center justify-center gap-2 ${
          loading ? "invisible" : ""
        }`}
      >
        {leadingIcon && (
          <span className="flex shrink-0 items-center justify-center">
            {leadingIcon}
          </span>
        )}
        <span className="whitespace-nowrap">{children}</span>
        {trailingIcon && (
          <span className="flex shrink-0 items-center justify-center">
            {trailingIcon}
          </span>
        )}
      </span>

      {loading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 px-3">
          <LoaderCircle
            size={16}
            className="shrink-0 animate-spin"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap">{loadingLabel}</span>
        </span>
      )}
    </button>
  );
}
