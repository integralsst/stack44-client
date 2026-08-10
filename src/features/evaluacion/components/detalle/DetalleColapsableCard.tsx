import { ChevronDown } from "lucide-react";
import {
  useState,
  type ReactNode,
} from "react";

interface Props {
  summary: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  contentClassName?: string;
  actionLabel?: {
    closed: string;
    open: string;
  };
}

export default function DetalleColapsableCard({
  summary,
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  className = "",
  contentClassName = "",
  actionLabel = {
    closed: "Ver detalle",
    open: "Ocultar detalle",
  },
}: Props) {
  const [internalOpen, setInternalOpen] =
    useState(defaultOpen);
  const isControlled = open !== undefined;
  const isOpen = isControlled ? open : internalOpen;

  const toggle = () => {
    const next = !isOpen;

    if (!isControlled) {
      setInternalOpen(next);
    }

    onOpenChange?.(next);
  };

  return (
    <article
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${className}`}
    >
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={toggle}
        className="flex w-full items-start justify-between gap-3 p-4 text-left transition hover:bg-slate-50/70 sm:px-5"
      >
        <div className="min-w-0 flex-1">{summary}</div>

        <span className="inline-flex shrink-0 items-center gap-1.5 pt-0.5 text-xs font-bold text-cyan-700">
          {isOpen ? actionLabel.open : actionLabel.closed}
          <ChevronDown
            size={15}
            className={`transition-transform ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </span>
      </button>

      {isOpen && (
        <div
          className={`border-t border-slate-200 ${contentClassName}`}
        >
          {children}
        </div>
      )}
    </article>
  );
}
