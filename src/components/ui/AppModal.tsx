import {
  useEffect,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

import AppIconButton from "./AppIconButton";

type ModalSize = "md" | "lg" | "xl" | "2xl";

interface AppModalProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  busy?: boolean;
  size?: ModalSize;
}

const sizeClasses: Record<ModalSize, string> = {
  md: "sm:max-w-xl",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  "2xl": "sm:max-w-6xl",
};

export default function AppModal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  busy = false,
  size = "lg",
}: AppModalProps) {
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, busy, onClose]);

  if (!open || typeof document === "undefined") {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/75 p-0 backdrop-blur-md sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-modal-title"
    >
      <button
        type="button"
        aria-label="Cerrar modal"
        onClick={() => {
          if (!busy) onClose();
        }}
        className="absolute inset-0 cursor-default"
      />

      <section
        className={`relative z-10 flex h-[100dvh] w-full flex-col overflow-hidden border-neutral-800 bg-[#101010] shadow-2xl sm:h-auto sm:max-h-[calc(100dvh-2rem)] sm:rounded-3xl sm:border ${sizeClasses[size]}`}
      >
        <header className="flex shrink-0 items-start justify-between gap-4 border-b border-neutral-800 bg-[#101010]/95 px-4 py-4 backdrop-blur-xl sm:px-6 sm:py-5">
          <div className="min-w-0">
            <h2
              id="app-modal-title"
              className="truncate text-lg font-bold text-white sm:text-xl"
            >
              {title}
            </h2>

            {description && (
              <p className="mt-1 max-w-3xl text-xs leading-5 text-neutral-500 sm:text-sm">
                {description}
              </p>
            )}
          </div>

          <AppIconButton
            icon={<X size={19} />}
            label="Cerrar"
            onClick={onClose}
            disabled={busy}
          />
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6">
          {children}
        </div>

        {footer && (
          <footer className="shrink-0 border-t border-neutral-800 bg-[#101010]/95 px-4 py-4 backdrop-blur-xl sm:px-6">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body
  );
}
