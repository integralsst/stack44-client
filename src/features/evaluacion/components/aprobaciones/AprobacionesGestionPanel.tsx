import {
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import AppButton from "../../../../components/ui/AppButton";
import type {
  AprobacionGestionItem,
  AprobacionesGestionPeriodoResponse,
} from "../../types/controles-evaluacion.types";

type EvaluacionAprobacionItem =
  AprobacionGestionItem["evaluaciones"][number];

interface Props {
  data: AprobacionesGestionPeriodoResponse | null;
  cargando: boolean;
  procesando: string | null;
  usuarioActualId: string | null;
  onDecide: (
    aprobacionId: string,
    decision: "APROBAR" | "RECHAZAR",
    observacion: string | null
  ) => Promise<boolean>;
  onCorrectAspecto?: (
    item: AprobacionGestionItem,
    evaluacion: EvaluacionAprobacionItem
  ) => void;
}

function fechaHora(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function fechaCalendario(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function Estado({ item }: { item: AprobacionGestionItem }) {
  const classes = {
    PENDIENTE: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    APROBADA: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    RECHAZADA: "border-red-400/30 bg-red-500/10 text-red-200",
  }[item.estado];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-bold leading-none ${classes}`}
    >
      {item.estado}
    </span>
  );
}

export default function AprobacionesGestionPanel({
  data,
  cargando,
  procesando,
  usuarioActualId,
  onDecide,
  onCorrectAspecto,
}: Props) {
  const [observaciones, setObservaciones] = useState<
    Record<string, string>
  >({});

  if (cargando && !data) {
    return <p className="py-10 text-center text-sm text-neutral-400">Cargando aprobaciones de gestión...</p>;
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-700 bg-[#0b0c0d] p-6 text-center">
        <ShieldCheck className="mx-auto text-emerald-400" />
        <p className="mt-2 text-sm font-bold text-white">Sin gestiones sujetas a aprobación</p>
        <p className="mt-1 text-xs text-neutral-500">Solo aparecerán gestiones que coincidan con una Regla de aprobación activa de la Supermatriz.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-4">
        {[
          ["Total", data.resumen.total],
          ["Pendientes", data.resumen.pendientes],
          ["Aprobadas", data.resumen.aprobadas],
          ["Rechazadas", data.resumen.rechazadas],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-neutral-800 bg-[#0b0c0d] p-3">
            <p className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {data.items.map((item) => {
        const busy = procesando === `gestion:${item.id}`;
        const observacion = observaciones[item.id] ?? "";
        const puedeCorregir = Boolean(
          item.estado === "RECHAZADA" &&
            onCorrectAspecto &&
            usuarioActualId &&
            item.gestion.usuarioCreador.id === usuarioActualId
        );

        return (
          <article key={item.id} className="rounded-2xl border border-neutral-800 bg-[#101112] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold text-cyan-300">{item.gestion.tipoActividad}</p>
                <h3 className="mt-1 text-sm font-bold text-white">
                  {item.gestion.usuarioCreador.nombre} · {item.gestion.modalidad.replaceAll("_", " ")}
                </h3>
                <p className="mt-1 text-xs text-neutral-500">
                  Gestión del {fechaCalendario(item.gestion.fechaGestion)} · control generado {fechaHora(item.generadaEn)}
                </p>
              </div>
              <Estado item={item} />
            </div>

            {item.gestion.observacionGeneral && (
              <p className="mt-3 rounded-xl border border-neutral-800 bg-[#0b0c0d] p-3 text-xs leading-5 text-neutral-300">
                {item.gestion.observacionGeneral}
              </p>
            )}

            <div className="mt-3 rounded-xl border border-neutral-800 bg-[#090a0b] p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                Evaluaciones sujetas a esta aprobación ({item.evaluaciones.length})
              </p>
              <div className="mt-2 space-y-2">
                {item.evaluaciones.map((evaluacion) => (
                  <div
                    key={evaluacion.id}
                    className="rounded-lg border border-neutral-800 bg-[#101112] p-2.5"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white">
                          {evaluacion.aspecto.codigo ? `${evaluacion.aspecto.codigo} · ` : ""}{evaluacion.aspecto.nombre}
                        </p>
                        <p className="mt-1 text-[11px] text-neutral-500">
                          Registrada: {evaluacion.calificacionRegistrada} · {evaluacion.estadoCumplimiento.replaceAll("_", " ")}
                        </p>
                      </div>

                      {puedeCorregir && onCorrectAspecto && (
                        <AppButton
                          variant="primary"
                          size="sm"
                          trailingIcon={<ArrowRight size={14} />}
                          onClick={() =>
                            onCorrectAspecto(item, evaluacion)
                          }
                        >
                          Corregir aspecto
                        </AppButton>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {item.observacionDecision && (
              <p className="mt-3 rounded-xl border border-neutral-700 bg-[#090a0b] p-3 text-xs leading-5 text-neutral-300">
                Decisión: {item.observacionDecision}
              </p>
            )}

            {item.puedeDecidir && (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <p className="text-xs font-bold text-amber-200">Decisión administrativa</p>
                <p className="mt-1 text-[11px] leading-5 text-neutral-400">
                  Si se rechaza, las evaluaciones afectadas toman resultado efectivo 3 sin modificar los registros originales.
                </p>
                <textarea
                  rows={2}
                  value={observacion}
                  disabled={busy}
                  onChange={(event) =>
                    setObservaciones((prev) => ({
                      ...prev,
                      [item.id]: event.target.value,
                    }))
                  }
                  placeholder="Observación opcional al aprobar; obligatoria al rechazar."
                  className="mt-3 w-full rounded-xl border border-neutral-700 bg-[#08090a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                />
                <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <AppButton
                    variant="danger"
                    leadingIcon={<XCircle size={15} />}
                    loading={busy}
                    disabled={Boolean(procesando)}
                    onClick={() => void onDecide(item.id, "RECHAZAR", observacion.trim() || null)}
                  >
                    Rechazar gestión
                  </AppButton>
                  <AppButton
                    variant="success"
                    leadingIcon={<CheckCircle2 size={15} />}
                    loading={busy}
                    disabled={Boolean(procesando)}
                    onClick={() => void onDecide(item.id, "APROBAR", observacion.trim() || null)}
                  >
                    Aprobar gestión
                  </AppButton>
                </div>
              </div>
            )}
          </article>
        );
      })}
    </div>
  );
}
