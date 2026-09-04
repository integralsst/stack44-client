import { Check, ChevronDown, Loader2, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export interface BitacoraDropdownOption {
  value: string;
  label: string;
  description?: string;
  icon?: ReactNode;
}

interface Props {
  value: string;
  options: BitacoraDropdownOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  loadingLabel?: string;
}

type Position = {
  left: number;
  top: number;
  width: number;
};

export default function BitacoraDropdown({
  value,
  options,
  onChange,
  ariaLabel,
  placeholder = "Seleccionar",
  disabled = false,
  loading = false,
  loadingLabel = "Cargando…",
}: Props) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [position, setPosition] = useState<Position>({
    left: 12,
    top: 80,
    width: 280,
  });

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  );

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (disabled || loading) setOpen(false);
  }, [disabled, loading]);

  useEffect(() => {
    if (!open || mobile) return;

    const updatePosition = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const rect = trigger.getBoundingClientRect();
      const maxWidth = Math.min(Math.max(rect.width, 260), 420);
      const left = Math.min(
        Math.max(12, rect.left),
        Math.max(12, window.innerWidth - maxWidth - 12)
      );
      const availableBelow = window.innerHeight - rect.bottom;
      const top =
        availableBelow >= 220
          ? rect.bottom + 8
          : Math.max(12, rect.top - Math.min(320, rect.top - 20));

      setPosition({ left, top, width: maxWidth });
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [mobile, open]);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const choose = (nextValue: string) => {
    onChange(nextValue);
    setOpen(false);
  };

  const panel = open
    ? createPortal(
        mobile ? (
          <div className="fixed inset-0 z-[120] flex items-end sm:hidden">
            <button
              type="button"
              aria-label="Cerrar opciones"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
            />
            <div
              ref={panelRef}
              role="listbox"
              aria-label={ariaLabel}
              className="relative z-10 max-h-[72dvh] w-full overflow-hidden rounded-t-[1.5rem] border border-slate-200 bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                <p className="text-sm font-semibold text-slate-900">{ariaLabel}</p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600"
                  aria-label="Cerrar"
                >
                  <X size={17} />
                </button>
              </div>
              <div className="max-h-[calc(72dvh-64px)] overflow-y-auto p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
                {options.map((option) => (
                  <OptionRow
                    key={option.value}
                    option={option}
                    active={option.value === value}
                    onClick={() => choose(option.value)}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={panelRef}
            role="listbox"
            aria-label={ariaLabel}
            className="fixed z-[120] hidden max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/15 sm:block"
            style={{
              left: position.left,
              top: position.top,
              width: position.width,
            }}
          >
            {options.map((option) => (
              <OptionRow
                key={option.value}
                option={option}
                active={option.value === value}
                onClick={() => choose(option.value)}
              />
            ))}
          </div>
        ),
        document.body
      )
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled || loading}
        onClick={() => setOpen((current) => !current)}
        className="flex min-h-11 w-full min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 text-left text-slate-900 outline-none transition hover:border-slate-300 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-70"
      >
        {loading ? (
          <Loader2 size={16} className="shrink-0 animate-spin text-cyan-600" />
        ) : selected?.icon ? (
          <span className="shrink-0 text-slate-500">{selected.icon}</span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">
            {loading ? loadingLabel : selected?.label ?? placeholder}
          </span>
          {!loading && selected?.description && (
            <span className="mt-0.5 block truncate text-xs text-slate-500">
              {selected.description}
            </span>
          )}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {panel}
    </>
  );
}

function OptionRow({
  option,
  active,
  onClick,
}: {
  option: BitacoraDropdownOption;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      onClick={onClick}
      className={`flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left transition ${
        active
          ? "bg-cyan-50 text-cyan-950"
          : "text-slate-800 hover:bg-slate-50"
      }`}
    >
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center text-cyan-600">
        {active ? <Check size={15} /> : option.icon ?? null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{option.label}</span>
        {option.description && (
          <span className="mt-0.5 block text-xs leading-5 text-slate-500">
            {option.description}
          </span>
        )}
      </span>
    </button>
  );
}