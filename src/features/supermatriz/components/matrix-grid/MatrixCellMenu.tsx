import {
  ChevronDown,
  X,
} from "lucide-react";
import {
  createPortal,
} from "react-dom";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ADMIN_LIGHT_SCOPE_CLASSES } from "../../../../components/ui/adminLightTheme";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  label: ReactNode;
  title?: string;
  children: ReactNode;
  disabled?: boolean;
  minWidth?: number;
  triggerClassName?: string;
}

export default function MatrixCellMenu({
  open,
  onOpenChange,
  label,
  title,
  children,
  disabled = false,
  minWidth = 340,
  triggerClassName = "",
}: Props) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: minWidth,
  });

  const place = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const viewportPadding = 10;
    const width = Math.min(
      Math.max(minWidth, rect.width),
      window.innerWidth - viewportPadding * 2
    );

    let left = Math.max(viewportPadding, rect.left);
    if (left + width > window.innerWidth - viewportPadding) {
      left = window.innerWidth - width - viewportPadding;
    }

    const estimatedHeight = Math.min(430, window.innerHeight - 24);
    let top = rect.bottom + 6;

    if (top + estimatedHeight > window.innerHeight - viewportPadding) {
      top = Math.max(viewportPadding, rect.top - estimatedHeight - 6);
    }

    setPosition({ top, left, width });
  }, [minWidth]);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !triggerRef.current?.contains(target) &&
        !panelRef.current?.contains(target)
      ) {
        onOpenChange(false);
      }
    };

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onOpenChange(false);
    };

    const reposition = () => place();

    document.addEventListener("mousedown", closeOnOutside);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);

    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [open, onOpenChange, place]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => onOpenChange(!open)}
        className={`group flex w-full items-start justify-between gap-2 rounded-lg px-2 py-1.5 text-left transition hover:bg-slate-100 disabled:cursor-default ${triggerClassName}`}
      >
        <span className="min-w-0 flex-1 whitespace-pre-wrap break-words">
          {label}
        </span>
        {!disabled && (
          <ChevronDown className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-500 transition group-hover:text-slate-700" />
        )}
      </button>

      {open && typeof document !== "undefined" &&
        createPortal(
          <div className={`${ADMIN_LIGHT_SCOPE_CLASSES} pointer-events-none fixed inset-0 z-[10050]`}>
            <div
              ref={panelRef}
              style={position}
              className="pointer-events-auto fixed max-h-[min(430px,calc(100dvh-24px))] overflow-hidden rounded-2xl border border-slate-300 bg-white shadow-[0_24px_80px_rgba(15,23,42,.18)]"
            >
              {title && (
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold text-slate-900">{title}</p>
                  <button
                    type="button"
                    onClick={() => onOpenChange(false)}
                    className="rounded-lg p-1 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                    aria-label="Cerrar"
                  >
                    <X size={15} />
                  </button>
                </div>
              )}
              <div className="max-h-[370px] overflow-y-auto p-3">
                {children}
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
