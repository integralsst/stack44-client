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
  estado?: EstadoVigenciaEvaluacion;
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
      "border-slate-300 bg-slate-100 text-slate-700",
  },
  NO_APLICA: {
    icon: Ban,
    className:
      "border-sky-200 bg-sky-50 text-sky-800",
  },
  VIGENTE_PERMANENTE: {
    icon: InfinityIcon,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  FALTA_FECHA_DOCUMENTO: {
    icon: CalendarX2,
    className:
      "border-amber-200 bg-amber-50 text-amber-800",
  },
  PERIODICIDAD_NO_CONFIGURADA: {
    icon: Settings2,
    className:
      "border-violet-200 bg-violet-50 text-violet-800",
  },
  VIGENTE: {
    icon: CheckCircle2,
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  POR_VENCER: {
    icon: CalendarClock,
    className:
      "border-amber-200 bg-amber-50 text-amber-800",
  },
  VENCIDO: {
    icon: AlertTriangle,
    className:
      "border-red-200 bg-red-50 text-red-800",
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
  estado,
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
        <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-[9px] font-bold text-cyan-800">
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
          <p className="mt-1.5 text-[8px] font-semibold uppercase tracking-wider text-cyan-700">
            Vigencia pendiente de recalcular
          </p>
        )}
      </div>
    );
  }

  const current = config[estado ?? detalle.estado];
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
            <p className="text-[9px] leading-4 text-slate-600">
              Vence{" "}
              {formatDate(
                detalle.fechaVencimiento
              )}
            </p>
          )}

          {detalle.provisional && (
            <p className="text-[8px] font-semibold uppercase tracking-wider text-cyan-700">
              Borrador
            </p>
          )}
        </div>
      )}
    </div>
  );
}