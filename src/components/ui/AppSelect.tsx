import {
  Children,
  forwardRef,
  isValidElement,
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
  helperText?: ReactNode;
}

const sizeClasses: Record<SelectSize, string> = {
  sm: "min-h-10 rounded-lg px-3 py-1.5 text-base sm:text-xs",
  md: "min-h-11 rounded-xl px-3 py-2.5 text-base sm:text-sm",
};

function getEmptyStateCopy(placeholder: string): {
  label: string;
  hint: string;
} {
  const normalized = placeholder.toLowerCase();

  if (normalized.includes("profesional")) {
    return {
      label: "No hay profesionales disponibles",
      hint: "No hay profesionales disponibles para seleccionar en este momento.",
    };
  }

  if (normalized.includes("empresa")) {
    return {
      label: "No hay empresas disponibles",
      hint: "No hay empresas disponibles para seleccionar en este momento.",
    };
  }

  if (normalized.includes("usuario")) {
    return {
      label: "No hay usuarios disponibles",
      hint: "No hay usuarios disponibles para seleccionar en este momento.",
    };
  }

  return {
    label: "No hay opciones disponibles",
    hint: "No hay registros disponibles para seleccionar en este momento.",
  };
}

const AppSelect = forwardRef<HTMLSelectElement, AppSelectProps>(
  function AppSelect(
    {
      className = "",
      containerClassName = "",
      children,
      leadingIcon,
      selectSize = "md",
      helperText,
      disabled,
      ...props
    },
    ref
  ) {
    const childArray = Children.toArray(children);
    const onlyChild = childArray[0];

    let hasOnlyEmptyPlaceholder = false;
    let placeholder = "";

    if (
      childArray.length === 1 &&
      isValidElement(onlyChild) &&
      onlyChild.type === "option"
    ) {
      const optionProps = onlyChild.props as {
        value?: string;
        children?: ReactNode;
      };

      hasOnlyEmptyPlaceholder =
        (optionProps.value ?? "") === "";
      placeholder = Children.toArray(optionProps.children)
        .join(" ")
        .trim();
    }

    const emptyState = hasOnlyEmptyPlaceholder
      ? getEmptyStateCopy(placeholder)
      : null;
    const effectiveDisabled =
      Boolean(disabled) || hasOnlyEmptyPlaceholder;

    return (
      <div className={`min-w-0 ${containerClassName}`}>
        <div className="relative min-w-0">
          {leadingIcon && (
            <span className="pointer-events-none absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center text-slate-500">
              {leadingIcon}
            </span>
          )}

          <select
            ref={ref}
            {...props}
            disabled={effectiveDisabled}
            className={`block w-full max-w-full appearance-none truncate border border-slate-300 bg-white pr-10 font-medium text-slate-900 shadow-sm outline-none transition-[border-color,box-shadow,background-color] [color-scheme:light] hover:border-slate-400 focus:border-cyan-500/80 focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none disabled:hover:border-slate-200 ${sizeClasses[selectSize]} ${leadingIcon ? "pl-9" : ""} ${className}`}
          >
            {emptyState ? (
              <option value="">{emptyState.label}</option>
            ) : (
              children
            )}
          </select>

          <ChevronDown
            size={16}
            aria-hidden="true"
            className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 transition-colors ${
              effectiveDisabled
                ? "text-slate-300"
                : "text-slate-500"
            }`}
          />
        </div>

        {(helperText || emptyState) && (
          <div className="mt-2 text-xs leading-5 text-slate-500">
            {helperText ?? emptyState?.hint}
          </div>
        )}
      </div>
    );
  }
);

export default AppSelect;
