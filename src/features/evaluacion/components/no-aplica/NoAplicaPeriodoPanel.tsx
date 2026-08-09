import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  XCircle,
} from "lucide-react";
import { useState } from "react";

import AppButton from "../../../../components/ui/AppButton";
import type {
  DecisionNoAplicaItem,
  NoAplicaPeriodoResponse,
} from "../../types/controles-evaluacion.types";

interface Props {
  data: NoAplicaPeriodoResponse | null;
  cargando: boolean;
  procesando: string | null;
  onDecide: (
    decisionId: string,
    decision: "APROBAR" | "RECHAZAR",
    observacion: string | null
  ) => Promise<boolean>;
}

function fecha(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function Estado({ item }: { item: DecisionNoAplicaItem }) {
  const classes = {
    PENDIENTE: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    APROBADO: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    RECHAZADO: "border-red-400/30 bg-red-500/10 text-red-200",
  }[item.estado];

  return (
    <span className={`rounded-full border px-2 py-1 text-[10px] font-bold ${classes}`}>
      {item.estado} · efectivo {item.resultadoEfectivo}
    </span>
  );
}

export default function NoAplicaPeriodoPanel({
  data,
  cargando,
  procesando,
  onDecide,
}: Props) {
  const [observaciones, setObservaciones] = useState<
    Record<string, string>
  >({});

  if (cargando && !data) {
    return <p className="py-10 text-center text-sm text-neutral-400">Cargando solicitudes de No aplica...</p>;
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-700 bg-[#0b0c0d] p-6 text-center">
        <CheckCircle2 className="mx-auto text-emerald-400" />
        <p className="mt-2 text-sm font-bold text-white">Sin solicitudes de No aplica</p>
        <p className="mt-1 text-xs text-neutral-500">Las solicitudes aparecerán cuando un profesional finalice una gestión proponiendo No aplica.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-4">
        {[
          ["Total", data.resumen.total],
          ["Pendientes", data.resumen.pendientes],
          ["Aprobados", data.resumen.aprobados],
          ["Rechazados", data.resumen.rechazados],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-neutral-800 bg-[#0b0c0d] p-3">
            <p className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {data.items.map((item) => {
        const busy = procesando === `no-aplica:${item.id}`;
        const observacion = observaciones[item.id] ?? "";

        return (
          <article key={item.id} className="rounded-2xl border border-neutral-800 bg-[#101112] p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-cyan-300">{item.evaluacion.aspecto.codigo ?? "Sin código"}</p>
                <h3 className="mt-1 text-sm font-bold text-white">{item.evaluacion.aspecto.nombre}</h3>
                <p className="mt-1 text-xs text-neutral-500">
                  {item.solicitadaPor.nombre} · {item.evaluacion.gestion.tipoActividad} · {fecha(item.solicitadaEn)}
                </p>
              </div>
              <Estado item={item} />
            </div>

            <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
              <p className="text-[10px] font-bold uppercase tracking-wide text-cyan-300">Justificación</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-neutral-200">
                {item.evaluacion.justificacionNoAplica || "Sin justificación registrada."}
              </p>
            </div>

            {item.evaluacion.evidencias.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.evaluacion.evidencias.map((evidencia) => (
                  <a
                    key={evidencia.id}
                    href={evidencia.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 bg-[#08090a] px-3 py-2 text-xs font-semibold text-neutral-300 hover:border-cyan-500/40 hover:text-cyan-200"
                  >
                    <ExternalLink size={13} />
                    {evidencia.nombre}
                  </a>
                ))}
              </div>
            )}

            {item.observacionDecision && (
              <p className="mt-3 rounded-xl border border-neutral-700 bg-[#090a0b] p-3 text-xs leading-5 text-neutral-300">
                Decisión: {item.observacionDecision}
              </p>
            )}

            {item.puedeDecidir && (
              <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                <div className="flex items-center gap-2 text-amber-200">
                  <Clock3 size={15} />
                  <p className="text-xs font-bold">Decisión de coordinación</p>
                </div>
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
                    Rechazar
                  </AppButton>
                  <AppButton
                    variant="success"
                    leadingIcon={<CheckCircle2 size={15} />}
                    loading={busy}
                    disabled={Boolean(procesando)}
                    onClick={() => void onDecide(item.id, "APROBAR", observacion.trim() || null)}
                  >
                    Aprobar No aplica
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
