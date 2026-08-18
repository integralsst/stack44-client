import {
  Check,
  ChevronDown,
  LoaderCircle,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface AppDropdownOption {
  value: string;
  label: string;
  description?: string;
  leadingIcon?: ReactNode;
  disabled?: boolean;
}

interface Props {
  value: string;
  options: AppDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  ariaLabel: string;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
  theme?: "light" | "dark";
  size?: "sm" | "md";
  className?: string;
}

export default function AppDropdownSelect({
  value,
  options,
  onChange,
  placeholder = "Seleccionar",
  ariaLabel,
  disabled = false,
  loading = false,
  loadingLabel = "Cargando…",
  theme = "light",
  size = "md",
  className = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (disabled || loading) {
      setOpen(false);
    }
  }, [disabled, loading]);

  const dark = theme === "dark";
  const heightClass = size === "sm" ? "min-h-9" : "min-h-11";
  const buttonClass = dark
    ? "border-neutral-700 bg-[#08090a] text-white hover:border-cyan-500/50 focus:border-cyan-400 focus:ring-cyan-500/15"
    : "border-slate-300 bg-white text-slate-900 hover:border-cyan-400 focus:border-cyan-500 focus:ring-cyan-100";
  const menuClass = dark
    ? "border-neutral-700 bg-[#0c0d0f] shadow-black/40"
    : "border-slate-200 bg-white shadow-slate-900/15";
  const optionHover = dark
    ? "hover:bg-cyan-500/10"
    : "hover:bg-cyan-50";
  const secondaryText = dark ? "text-neutral-500" : "text-slate-500";

  return (
    <div ref={wrapperRef} className={`relative min-w-0 ${className}`}>
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled || loading}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center gap-3 rounded-xl border px-3 text-left outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${heightClass} ${buttonClass}`}
      >
        {loading ? (
          <LoaderCircle
            size={16}
            className="shrink-0 animate-spin text-cyan-500"
          />
        ) : selected?.leadingIcon ? (
          <span className="shrink-0">{selected.leadingIcon}</span>
        ) : null}

        <span className="min-w-0 flex-1">
          <span className="block truncate text-xs font-bold sm:text-sm">
            {loading
              ? loadingLabel
              : selected?.label ?? placeholder}
          </span>
          {!loading && selected?.description && (
            <span
              className={`mt-0.5 block truncate text-[10px] font-medium ${secondaryText}`}
            >
              {selected.description}
            </span>
          )}
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform ${open ? "rotate-180" : ""} ${secondaryText}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute left-0 right-0 z-[80] mt-2 max-h-72 overflow-y-auto rounded-2xl border p-1.5 shadow-2xl ${menuClass}`}
        >
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={active}
                disabled={option.disabled}
                onClick={() => {
                  if (option.disabled) return;
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition disabled:cursor-not-allowed disabled:opacity-40 ${optionHover} ${
                  active
                    ? dark
                      ? "bg-cyan-500/10 text-cyan-100"
                      : "bg-cyan-50 text-cyan-950"
                    : dark
                      ? "text-neutral-200"
                      : "text-slate-800"
                }`}
              >
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                  {active ? (
                    <Check size={15} className="text-cyan-500" />
                  ) : option.leadingIcon ? (
                    option.leadingIcon
                  ) : null}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs font-bold sm:text-sm">
                    {option.label}
                  </span>
                  {option.description && (
                    <span
                      className={`mt-0.5 block text-[10px] leading-4 ${secondaryText}`}
                    >
                      {option.description}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
