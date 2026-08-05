import type {
  ButtonHTMLAttributes,
  ReactNode,
} from "react";
import { LoaderCircle } from "lucide-react";

type IconButtonVariant =
  | "secondary"
  | "ghost"
  | "danger";

type IconButtonSize = "sm" | "md" | "lg";

interface AppIconButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  label: string;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
}

const variantClasses: Record<IconButtonVariant, string> = {
  secondary:
    "border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-900",
  ghost:
    "border-transparent bg-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-900",
  danger:
    "border-red-300 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100",
};

const sizeClasses: Record<IconButtonSize, string> = {
  sm: "h-9 w-9 rounded-lg",
  md: "h-10 w-10 rounded-xl",
  lg: "h-11 w-11 rounded-xl",
};

export default function AppIconButton({
  icon,
  label,
  variant = "secondary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  type = "button",
  ...props
}: AppIconButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || loading}
      aria-label={label}
      title={props.title ?? label}
      aria-busy={loading || undefined}
      className={`inline-flex shrink-0 items-center justify-center border outline-none transition-colors focus-visible:ring-2 focus-visible:ring-cyan-500/30 disabled:cursor-not-allowed disabled:opacity-55 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {loading ? (
        <LoaderCircle
          size={17}
          className="animate-spin"
          aria-hidden="true"
        />
      ) : (
        icon
      )}
    </button>
  );
}
