import { Check, ChevronDown, X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";

type SelectOptionSnapshot = {
  value: string;
  label: string;
  disabled: boolean;
};

type FloatingPosition = {
  left: number;
  top: number;
  width: number;
};

const MOBILE_QUERY = "(max-width: 639px)";
const SELECTOR = "select:not([multiple])";

function isEligibleSelect(value: Element | null): value is HTMLSelectElement {
  return (
    value instanceof HTMLSelectElement &&
    !value.multiple &&
    value.size <= 1 &&
    !value.disabled &&
    value.dataset.nativeSelect !== "true"
  );
}

function snapshotOptions(select: HTMLSelectElement): SelectOptionSnapshot[] {
  return Array.from(select.options)
    .filter((option) => !option.hidden)
    .map((option) => ({
      value: option.value,
      label: option.label || option.textContent || option.value,
      disabled: option.disabled,
    }));
}

function rgbLuminance(value: string): number | null {
  const match = value.match(/rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/i);
  if (!match) return null;
  const [, red, green, blue] = match.map(Number);
  return red * 0.299 + green * 0.587 + blue * 0.114;
}

function isDarkSelect(select: HTMLSelectElement): boolean {
  const styles = window.getComputedStyle(select);
  const explicitScheme = styles.colorScheme.toLowerCase();
  if (explicitScheme.includes("dark") && !explicitScheme.includes("light")) {
    return true;
  }

  const background = rgbLuminance(styles.backgroundColor);
  if (background !== null) return background < 135;

  const foreground = rgbLuminance(styles.color);
  return foreground !== null && foreground > 170;
}

function selectLabel(select: HTMLSelectElement): string {
  const aria = select.getAttribute("aria-label")?.trim();
  if (aria) return aria;

  const labelled = select.labels?.[0]?.textContent?.trim();
  if (labelled) return labelled.replace(/\s+/g, " ").slice(0, 80);

  return "Seleccionar opción";
}

function setNativeSelectValue(select: HTMLSelectElement, nextValue: string) {
  const previousValue = select.value;
  if (previousValue === nextValue) return;

  const descriptor = Object.getOwnPropertyDescriptor(
    HTMLSelectElement.prototype,
    "value"
  );

  if (descriptor?.set) descriptor.set.call(select, nextValue);
  else select.value = nextValue;

  select.dispatchEvent(new Event("input", { bubbles: true }));
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

export default function GlobalSelectDropdown() {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const activeSelectRef = useRef<HTMLSelectElement | null>(null);
  const [activeSelect, setActiveSelect] = useState<HTMLSelectElement | null>(null);
  const [options, setOptions] = useState<SelectOptionSnapshot[]>([]);
  const [selectedValue, setSelectedValue] = useState("");
  const [mobile, setMobile] = useState(false);
  const [dark, setDark] = useState(false);
  const [label, setLabel] = useState("Seleccionar opción");
  const [position, setPosition] = useState<FloatingPosition>({
    left: 12,
    top: 72,
    width: 280,
  });

  const open = Boolean(activeSelect);

  const close = useCallback((restoreFocus = false) => {
    const current = activeSelectRef.current;
    activeSelectRef.current = null;
    setActiveSelect(null);
    setOptions([]);
    if (restoreFocus && current?.isConnected) {
      window.requestAnimationFrame(() => current.focus({ preventScroll: true }));
    }
  }, []);

  const refreshPosition = useCallback((select: HTMLSelectElement) => {
    const rect = select.getBoundingClientRect();
    const width = Math.min(Math.max(rect.width, 240), 420);
    const left = Math.min(
      Math.max(12, rect.left),
      Math.max(12, window.innerWidth - width - 12)
    );
    const estimatedHeight = 320;
    const below = window.innerHeight - rect.bottom;
    const shouldOpenUp = below < 220 && rect.top > below;
    const top = shouldOpenUp
      ? Math.max(12, rect.top - estimatedHeight - 8)
      : Math.min(window.innerHeight - 72, rect.bottom + 8);

    setPosition({ left, top, width });
  }, []);

  const openSelect = useCallback(
    (select: HTMLSelectElement) => {
      activeSelectRef.current = select;
      setActiveSelect(select);
      setOptions(snapshotOptions(select));
      setSelectedValue(select.value);
      setDark(isDarkSelect(select));
      setLabel(selectLabel(select));
      refreshPosition(select);
    },
    [refreshPosition]
  );

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = () => setMobile(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Element | null;
      const select = target?.closest?.(SELECTOR) ?? null;

      if (isEligibleSelect(select)) {
        event.preventDefault();
        select.focus({ preventScroll: true });

        if (activeSelectRef.current === select) {
          close(true);
          return;
        }

        openSelect(select);
        return;
      }

      if (
        activeSelectRef.current &&
        panelRef.current &&
        event.target instanceof Node &&
        !panelRef.current.contains(event.target)
      ) {
        close(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (target instanceof HTMLSelectElement && isEligibleSelect(target)) {
        if (
          event.key === "Enter" ||
          event.key === " " ||
          event.key === "ArrowDown" ||
          event.key === "ArrowUp"
        ) {
          event.preventDefault();
          openSelect(target);
        }
      }

      if (event.key === "Escape" && activeSelectRef.current) {
        event.preventDefault();
        close(true);
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKeyDown, true);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [close, openSelect]);

  useEffect(() => {
    if (!open || mobile || !activeSelect) return;

    const update = () => {
      if (!activeSelect.isConnected || activeSelect.disabled) {
        close(false);
        return;
      }
      refreshPosition(activeSelect);
    };

    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [activeSelect, close, mobile, open, refreshPosition]);

  useEffect(() => {
    if (!open || !panelRef.current) return;
    const selected = panelRef.current.querySelector<HTMLButtonElement>(
      '[data-stack44-select-option="selected"]'
    );
    const fallback = panelRef.current.querySelector<HTMLButtonElement>(
      '[data-stack44-select-option="true"]:not(:disabled)'
    );
    window.requestAnimationFrame(() => (selected ?? fallback)?.focus());
  }, [open, options, mobile]);

  const choose = (value: string) => {
    const select = activeSelectRef.current;
    if (!select) return;
    setNativeSelectValue(select, value);
    setSelectedValue(value);
    close(true);
  };

  const optionButtons = useMemo(
    () =>
      options.map((option) => {
        const active = option.value === selectedValue;
        return (
          <button
            key={`${option.value}-${option.label}`}
            type="button"
            role="option"
            aria-selected={active}
            disabled={option.disabled}
            data-stack44-select-option={active ? "selected" : "true"}
            onClick={() => choose(option.value)}
            className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-40 ${
              active
                ? dark
                  ? "bg-cyan-500/15 text-cyan-100"
                  : "bg-cyan-50 text-cyan-950"
                : dark
                  ? "text-neutral-200 hover:bg-white/5"
                  : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center">
              {active ? <Check size={15} className="text-cyan-500" /> : null}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">
              {option.label}
            </span>
          </button>
        );
      }),
    [dark, options, selectedValue]
  );

  const handleMenuKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const buttons = Array.from(
      panelRef.current?.querySelectorAll<HTMLButtonElement>(
        '[data-stack44-select-option]:not(:disabled)'
      ) ?? []
    );
    if (buttons.length === 0) return;

    const currentIndex = buttons.indexOf(document.activeElement as HTMLButtonElement);

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const nextIndex =
        currentIndex < 0
          ? 0
          : (currentIndex + delta + buttons.length) % buttons.length;
      buttons[nextIndex]?.focus();
      return;
    }

    if (event.key === "Home") {
      event.preventDefault();
      buttons[0]?.focus();
      return;
    }

    if (event.key === "End") {
      event.preventDefault();
      buttons.at(-1)?.focus();
    }
  };

  if (!open || !activeSelect) return null;

  return createPortal(
    mobile ? (
      <div className="fixed inset-0 z-[220] flex items-end sm:hidden">
        <button
          type="button"
          aria-label="Cerrar opciones"
          onClick={() => close(true)}
          className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
        />
        <div
          ref={panelRef}
          role="listbox"
          aria-label={label}
          onKeyDown={handleMenuKeyDown}
          className={`relative z-10 max-h-[72dvh] w-full overflow-hidden rounded-t-[1.6rem] border shadow-2xl ${
            dark
              ? "border-neutral-700 bg-[#0b0c0e] shadow-black/40"
              : "border-slate-200 bg-white shadow-slate-900/20"
          }`}
        >
          <div
            className={`flex items-center justify-between gap-3 border-b px-4 py-3.5 ${
              dark ? "border-neutral-800" : "border-slate-100"
            }`}
          >
            <div className="min-w-0">
              <p
                className={`truncate text-sm font-semibold ${
                  dark ? "text-white" : "text-slate-900"
                }`}
              >
                {label}
              </p>
              <p
                className={`mt-0.5 text-xs ${
                  dark ? "text-neutral-500" : "text-slate-500"
                }`}
              >
                {options.length} opción{options.length === 1 ? "" : "es"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => close(true)}
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                dark
                  ? "bg-white/5 text-neutral-300 hover:bg-white/10"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              aria-label="Cerrar"
            >
              <X size={17} />
            </button>
          </div>
          <div className="max-h-[calc(72dvh-68px)] overflow-y-auto p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {optionButtons}
          </div>
        </div>
      </div>
    ) : (
      <div
        ref={panelRef}
        role="listbox"
        aria-label={label}
        onKeyDown={handleMenuKeyDown}
        className={`fixed z-[220] max-h-80 overflow-y-auto rounded-2xl border p-1.5 shadow-2xl ${
          dark
            ? "border-neutral-700 bg-[#0b0c0e] shadow-black/40"
            : "border-slate-200 bg-white shadow-slate-900/20"
        }`}
        style={{
          left: position.left,
          top: position.top,
          width: position.width,
        }}
      >
        {optionButtons}
        <div
          className={`pointer-events-none sticky bottom-0 mt-1 flex justify-end border-t px-2 pt-1.5 text-[10px] ${
            dark
              ? "border-neutral-800 bg-[#0b0c0e] text-neutral-600"
              : "border-slate-100 bg-white text-slate-400"
          }`}
        >
          <span className="inline-flex items-center gap-1">
            <ChevronDown size={11} />
            ↑ ↓ para navegar · Enter para elegir
          </span>
        </div>
      </div>
    ),
    document.body
  );
}
