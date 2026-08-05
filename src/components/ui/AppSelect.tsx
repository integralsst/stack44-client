import {
  forwardRef,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

type SelectSize = "sm" | "md";

interface AppSelectProps
  extends SelectHTMLAttributes<HTMLSelectElement> {
  containerClassName?: string;
  leadingIcon?: ReactNode;
  selectSize?: SelectSize;
}

const sizeClasses: Record<SelectSize, string> = {
  sm: "min-h-9 rounded-lg px-3 py-1.5 text-xs",
  md: "min-h-10 rounded-xl px-3 py-2.5 text-sm",
};

const AppSelect = forwardRef<HTMLSelectElement, AppSelectProps>(
  function AppSelect(
    {
      className = "",
      containerClassName = "",
      children,
      leadingIcon,
      selectSize = "md",
      ...props
    },
    ref
  ) {
    return (
      <div className={`relative min-w-0 ${containerClassName}`}>
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-slate-500">
            {leadingIcon}
          </span>
        )}

        <select
          ref={ref}
          {...props}
          className={`w-full appearance-none border border-slate-300 bg-white pr-9 text-slate-900 outline-none transition-colors [color-scheme:light] hover:border-slate-400 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-600 disabled:opacity-100 ${sizeClasses[selectSize]} ${leadingIcon ? "pl-9" : ""} ${className}`}
        >
          {children}
        </select>

        <ChevronDown
          size={15}
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
      </div>
    );
  }
);

export default AppSelect;
