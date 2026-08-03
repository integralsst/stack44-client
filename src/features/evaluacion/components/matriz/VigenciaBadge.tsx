import {
  AlertTriangle,
  Ban,
  CalendarCheck2,
  CalendarClock,
  CalendarX2,
  CheckCircle2,
  Clock3,
  Infinity as InfinityIcon,
  Settings2,
} from "lucide-react";

import type {
  DetalleVigenciaEvaluacion,
  EstadoVigenciaEvaluacion,
} from "../../../../types/evaluacion.types";

interface Props {
  detalle: DetalleVigenciaEvaluacion;
  compact?: boolean;
  fechaDocumentoPendiente?: boolean;
  fechaDocumentoLocal?: string;
}

const config: Record<
  EstadoVigenciaEvaluacion,
  {
    icon: typeof Clock3;
    className: string;
  }
> = {
  SIN_REVISION: {
    icon: Clock3,
    className:
      "border-neutral-700 bg-neutral-800/70 text-neutral-300",
  },
  NO_APLICA: {
    icon: Ban,
    className:
      "border-sky-400/20 bg-sky-400/10 text-sky-200",
  },
  VIGENTE_PERMANENTE: {
    icon: InfinityIcon,
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  },
  FALTA_FECHA_DOCUMENTO: {
    icon: CalendarX2,
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-200",
  },
  PERIODICIDAD_NO_CONFIGURADA: {
    icon: Settings2,
    className:
      "border-violet-400/20 bg-violet-400/10 text-violet-200",
  },
  VIGENTE: {
    icon: CheckCircle2,
    className:
      "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
  },
  POR_VENCER: {
    icon: CalendarClock,
    className:
      "border-amber-400/20 bg-amber-400/10 text-amber-200",
  },
  VENCIDO: {
    icon: AlertTriangle,
    className:
      "border-red-400/20 bg-red-400/10 text-red-200",
  },
};

function formatDate(
  value: string
): string {
  return new Date(value).toLocaleDateString(
    "es-CO"
  );
}

export default function VigenciaBadge({
  detalle,
  compact = false,
  fechaDocumentoPendiente = false,
  fechaDocumentoLocal = "",
}: Props) {
  if (fechaDocumentoPendiente) {
    const tieneFecha = Boolean(
      fechaDocumentoLocal
    );

    return (
      <div
        className="min-w-0"
        title={
          tieneFecha
            ? "La fecha todavía no se ha guardado. El backend calculará la vigencia al guardar."
            : "Se quitó la fecha del documento. El cambio todavía no se ha guardado."
        }
      >
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-2 py-1 text-[9px] font-bold text-cyan-200">
          <CalendarCheck2
            size={11}
            className="shrink-0"
          />
          <span className="truncate">
            {tieneFecha
              ? "Fecha por guardar"
              : "Fecha eliminada"}
          </span>
        </span>

        {!compact && (
          <p className="mt-1.5 text-[8px] font-semibold uppercase tracking-wider text-cyan-400">
            Vigencia pendiente de recalcular
          </p>
        )}
      </div>
    );
  }

  const current = config[detalle.estado];
  const Icon = current.icon;

  return (
    <div
      className="min-w-0"
      title={detalle.descripcion}
    >
      <span
        className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-1 text-[9px] font-bold ${current.className}`}
      >
        <Icon
          size={11}
          className="shrink-0"
        />
        <span className="truncate">
          {detalle.titulo}
        </span>
      </span>

      {!compact && (
        <div className="mt-1.5 space-y-0.5">
          {detalle.fechaVencimiento && (
            <p className="text-[9px] leading-4 text-neutral-500">
              Vence{" "}
              {formatDate(
                detalle.fechaVencimiento
              )}
            </p>
          )}

          {detalle.provisional && (
            <p className="text-[8px] font-semibold uppercase tracking-wider text-cyan-400">
              Borrador
            </p>
          )}
        </div>
      )}
    </div>
  );
}
