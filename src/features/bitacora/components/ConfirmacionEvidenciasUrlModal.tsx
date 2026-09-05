import {
  CheckCircle2,
  ExternalLink,
  Link2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

import type {
  DecisionEvidenciaBitacoraInput,
  EvidenciaPendienteConfirmacionBitacora,
  TipoUrlBitacora,
} from "../types/bitacora.types";

export interface AspectoDisponibleEvidencia {
  aspectoId: number;
  codigo: string;
  nombre: string;
}

interface ConfirmacionEvidenciasUrlModalProps {
  pendientes: EvidenciaPendienteConfirmacionBitacora[];
  aspectosDisponibles: AspectoDisponibleEvidencia[];
  decisiones: DecisionEvidenciaBitacoraInput[];
  onChange: (decisiones: DecisionEvidenciaBitacoraInput[]) => void;
}

const TIPO_LABEL: Record<TipoUrlBitacora, string> = {
  EVIDENCIA_DIRECTA: "Posible evidencia directa",
  RECURSO_ACCION: "Recurso para una acción",
  REFERENCIA: "Referencia / consulta",
  CONTACTO: "Contacto / proveedor",
};

function decisionValida(
  pendiente: EvidenciaPendienteConfirmacionBitacora,
  decisiones: DecisionEvidenciaBitacoraInput[],
  aspectoIdsDisponibles: Set<number>
): boolean {
  const decision = decisiones.find((item) => item.url === pendiente.url);
  if (!decision) return false;
  if (decision.decision === "DESCARTAR") return true;
  const ids = decision.aspectoIds ?? [];
  return ids.length > 0 && ids.every((id) => aspectoIdsDisponibles.has(id));
}

function reemplazarDecision(
  decisiones: DecisionEvidenciaBitacoraInput[],
  nueva: DecisionEvidenciaBitacoraInput
) {
  return [...decisiones.filter((item) => item.url !== nueva.url), nueva];
}

export default function ConfirmacionEvidenciasUrlModal({
  pendientes,
  aspectosDisponibles,
  decisiones,
  onChange,
}: ConfirmacionEvidenciasUrlModalProps) {
  const aspectoIdsDisponibles = useMemo(
    () => new Set(aspectosDisponibles.map((item) => item.aspectoId)),
    [aspectosDisponibles]
  );

  const pendienteActual = useMemo(
    () =>
      pendientes.find(
        (item) => !decisionValida(item, decisiones, aspectoIdsDisponibles)
      ) ?? null,
    [pendientes, decisiones, aspectoIdsDisponibles]
  );
  const modalAbierto = Boolean(pendienteActual);

  const [aspectoIdSeleccionado, setAspectoIdSeleccionado] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (!pendienteActual) {
      setAspectoIdSeleccionado(null);
      return;
    }

    const existente = decisiones.find(
      (item) => item.url === pendienteActual.url && item.decision === "CONFIRMAR"
    );
    const existenteId = existente?.aspectoIds?.find((id) =>
      aspectoIdsDisponibles.has(id)
    );
    const sugerido = pendienteActual.aspectoIdsSugeridos.find((id) =>
      aspectoIdsDisponibles.has(id)
    );
    const primero = aspectosDisponibles[0]?.aspectoId;
    setAspectoIdSeleccionado(existenteId ?? sugerido ?? primero ?? null);
  }, [
    pendienteActual,
    decisiones,
    aspectosDisponibles,
    aspectoIdsDisponibles,
  ]);

  useEffect(() => {
    if (!modalAbierto || typeof document === "undefined") return;

    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = overflowAnterior;
    };
  }, [modalAbierto]);

  if (!pendienteActual || typeof document === "undefined") return null;

  const resueltas = pendientes.filter((item) =>
    decisionValida(item, decisiones, aspectoIdsDisponibles)
  ).length;
  const aspectoSugerido = aspectosDisponibles.find((item) =>
    pendienteActual.aspectoIdsSugeridos.includes(item.aspectoId)
  );

  const descartar = () => {
    onChange(
      reemplazarDecision(decisiones, {
        url: pendienteActual.url,
        decision: "DESCARTAR",
        aspectoIds: [],
      })
    );
  };

  const confirmar = () => {
    if (!aspectoIdSeleccionado) return;
    onChange(
      reemplazarDecision(decisiones, {
        url: pendienteActual.url,
        decision: "CONFIRMAR",
        aspectoIds: [aspectoIdSeleccionado],
      })
    );
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-md">
      <div
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmacion-evidencia-titulo"
      >
        <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-cyan-700">
                <ShieldCheck size={18} />
                <span className="text-xs font-semibold uppercase tracking-[0.1em]">
                  Confirmación humana de evidencia
                </span>
              </div>
              <h3
                id="confirmacion-evidencia-titulo"
                className="mt-1 text-lg font-semibold text-slate-950"
              >
                ¿Este enlace debe guardarse como evidencia?
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Revisa el enlace antes de decidir. La IA solo sugiere su función a
                partir del texto de la Bitácora; no abrió ni leyó el contenido remoto.
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
              {resueltas + 1} de {pendientes.length}
            </span>
          </div>
        </div>

        <div className="space-y-4 p-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                <Link2 size={17} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                    {TIPO_LABEL[pendienteActual.tipoSugerido]}
                  </span>
                  {aspectoSugerido && (
                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
                      IA sugiere {aspectoSugerido.codigo}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {pendienteActual.descripcionSugerida}
                </p>
                <a
                  href={pendienteActual.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex max-w-full items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-100"
                >
                  <ExternalLink size={15} className="shrink-0" />
                  <span className="truncate">Abrir enlace para revisarlo</span>
                </a>
                <p className="mt-2 break-all text-[11px] leading-4 text-slate-400">
                  {pendienteActual.url}
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              Aspecto al que se vincularía si confirmas
            </label>
            <select
              value={aspectoIdSeleccionado ?? ""}
              onChange={(event) =>
                setAspectoIdSeleccionado(
                  event.target.value ? Number(event.target.value) : null
                )
              }
              className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              disabled={aspectosDisponibles.length === 0}
            >
              {aspectosDisponibles.length === 0 ? (
                <option value="">No hay aspectos aplicables disponibles</option>
              ) : (
                aspectosDisponibles.map((aspecto) => (
                  <option key={aspecto.aspectoId} value={aspecto.aspectoId}>
                    {aspecto.codigo} · {aspecto.nombre}
                  </option>
                ))
              )}
            </select>
            <p className="mt-2 text-xs leading-5 text-slate-500">
              Puedes corregir la sugerencia de la IA. Solo se muestran aspectos que
              esta Bitácora propone evaluar y que siguen seleccionados para aplicar.
            </p>
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={descartar}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            <XCircle size={17} />
            No, no usar como evidencia
          </button>
          <button
            type="button"
            onClick={confirmar}
            disabled={!aspectoIdSeleccionado}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 size={17} />
            Sí, vincular como evidencia
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
