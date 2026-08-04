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
    "border-white bg-white text-black hover:border-neutral-200 hover:bg-neutral-200",
  secondary:
    "border-neutral-700 bg-neutral-900 text-neutral-200 hover:border-neutral-600 hover:bg-neutral-800 hover:text-white",
  success:
    "border-cyan-500/25 bg-cyan-500/10 text-cyan-200 hover:border-cyan-500/40 hover:bg-cyan-500/15",
  warning:
    "border-amber-500/30 bg-amber-500/10 text-amber-200 hover:border-amber-500/45 hover:bg-amber-500/15",
  danger:
    "border-red-500/30 bg-red-500/10 text-red-200 hover:border-red-500/45 hover:bg-red-500/15",
  ghost:
    "border-transparent bg-transparent text-neutral-400 hover:bg-white/5 hover:text-white",
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
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden border font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-45 ${variantClasses[variant]} ${sizeClasses[size]} ${fullWidth ? "w-full" : ""} ${className}`}
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
