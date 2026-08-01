import {
  CalendarDays,
  LockKeyhole,
  X,
} from "lucide-react";

import {
  formatearFechaInput,
  normalizarFechaInput,
} from "../../utils/fecha-documento.utils";

interface AppDateFieldProps {
  value: string;
  disabled?: boolean;
  permiteFechaManual?: boolean;
  pending?: boolean;
  onChange: (value: string) => void;
}

export default function AppDateField({
  value,
  disabled = false,
  permiteFechaManual = true,
  pending = false,
  onChange,
}: AppDateFieldProps) {
  const normalizedValue =
    normalizarFechaInput(value);

  const bloqueado =
    disabled || !permiteFechaManual;

  const label = !permiteFechaManual
    ? "Fecha automática"
    : normalizedValue
      ? formatearFechaInput(normalizedValue)
      : "Seleccionar fecha";

  return (
    <div className="min-w-0">
      <div
        className={[
          "relative flex min-h-9 w-full items-center gap-2 overflow-hidden rounded-lg border bg-[#090a0b] px-2.5 text-xs transition",
          bloqueado
            ? "cursor-not-allowed border-neutral-800 text-neutral-600 opacity-65"
            : "border-neutral-700 text-neutral-200 hover:border-neutral-600 focus-within:border-cyan-500/60 focus-within:ring-2 focus-within:ring-cyan-500/10",
          pending
            ? "border-cyan-500/40 bg-cyan-500/[0.045]"
            : "",
        ].join(" ")}
        title={
          permiteFechaManual
            ? "Fecha real de elaboración del documento o soporte revisado."
            : "La fecha se obtiene automáticamente según la configuración de la Supermatriz."
        }
      >
        {permiteFechaManual ? (
          <CalendarDays
            size={14}
            className={
              pending
                ? "shrink-0 text-cyan-300"
                : "shrink-0 text-neutral-500"
            }
          />
        ) : (
          <LockKeyhole
            size={14}
            className="shrink-0 text-neutral-600"
          />
        )}

        <span
          className={[
            "min-w-0 flex-1 truncate text-left",
            normalizedValue
              ? "text-neutral-200"
              : "text-neutral-600",
          ].join(" ")}
        >
          {label}
        </span>

        {pending && (
          <span className="shrink-0 rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-cyan-300">
            Pendiente
          </span>
        )}

        {!bloqueado && normalizedValue && (
          <button
            type="button"
            className="relative z-20 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-neutral-500 transition hover:bg-neutral-800 hover:text-white"
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              onChange("");
            }}
            aria-label="Quitar fecha del documento"
            title="Quitar fecha"
          >
            <X size={13} />
          </button>
        )}

        {!bloqueado && (
          <input
            type="date"
            value={normalizedValue}
            onChange={(event) =>
              onChange(event.target.value)
            }
            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
            aria-label="Fecha de elaboración del documento"
          />
        )}
      </div>

      {!permiteFechaManual && (
        <p className="mt-1 text-[8px] leading-3 text-neutral-600">
          Se calcula con la regla maestra.
        </p>
      )}
    </div>
  );
}
