import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
} from "react";

type InputSize = "sm" | "md";

interface AppInputProps
  extends InputHTMLAttributes<HTMLInputElement> {
  leadingIcon?: ReactNode;
  trailingContent?: ReactNode;
  containerClassName?: string;
  inputSize?: InputSize;
}

const sizeClasses: Record<InputSize, string> = {
  sm: "min-h-9 rounded-lg px-3 text-xs",
  md: "min-h-10 rounded-xl px-3 text-sm",
};

const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  function AppInput(
    {
      leadingIcon,
      trailingContent,
      containerClassName = "",
      className = "",
      inputSize = "md",
      ...props
    },
    ref
  ) {
    return (
      <div className={`relative min-w-0 ${containerClassName}`}>
        {leadingIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-neutral-500">
            {leadingIcon}
          </span>
        )}

        <input
          {...props}
          ref={ref}
          className={`w-full border border-neutral-700 bg-[#090a0b] text-white outline-none transition-colors [color-scheme:dark] placeholder:text-neutral-600 hover:border-neutral-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-45 ${sizeClasses[inputSize]} ${leadingIcon ? "pl-9" : ""} ${trailingContent ? "pr-10" : ""} ${className}`}
        />

        {trailingContent && (
          <span className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center justify-center text-neutral-500">
            {trailingContent}
          </span>
        )}
      </div>
    );
  }
);

export default AppInput;
