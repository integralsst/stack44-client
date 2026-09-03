import {
  ChevronDown,
  ChevronUp,
  ClipboardList,
  FileClock,
  FileText,
  LoaderCircle,
  Paperclip,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import type {
  HistorialAspectoItem,
  HistorialPaginacion,
} from "../../types/detalle-aspecto.types";
import type { DetalleAspectoConTrazabilidad } from "../../types/trazabilidad-aspecto.types";
import AppAlert from "../feedback/AppAlert";
import CompromisoAspectoCard from "./CompromisoAspectoCard";
import DetalleColapsableCard from "./DetalleColapsableCard";
import HistorialEvaluacionCard from "./HistorialEvaluacionCard";

const MESES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

function fechaLarga(valor: string | null | undefined): string | null {
  if (!valor) return null;
  const [anio, mes, dia] = valor.slice(0, 10).split("-").map(Number);
  if (!anio || !mes || !dia || !MESES[mes - 1]) return null;
  return `${dia} de ${MESES[mes - 1]} de ${anio}`;
}

function estadoLegible(valor: string): string {
  const labels: Record<string, string> = {
    CUMPLIDO: "Cumplido",
    PARCIAL: "Parcial",
    NO_CUMPLIDO: "No cumplido",
    NO_APLICA: "No aplica",
  };
  return labels[valor] ?? valor.replaceAll("_", " ");
}

function descripcionPrincipal(item: HistorialAspectoItem): string {
  const observacion = item.observacion?.trim();
  if (observacion) {
    const [principal] = observacion.split(/\n\s*\n/);
    if (principal?.trim()) return principal.trim();
  }

  return `Se registró la evaluación del aspecto como ${estadoLegible(
    item.estadoCumplimiento
  ).toLowerCase()}.`;
}

export default function HistorialAspectoTab({
  data,
  paginacion,
  loadingMore,
  onLoadMore,
  onOpenRevisionTecnica: _onOpenRevisionTecnica,
}: {
  data: DetalleAspectoConTrazabilidad;
  paginacion: HistorialPaginacion;
  loadingMore: boolean;
  onLoadMore: () => void;
  onOpenRevisionTecnica: () => void;
}) {
  const location = useLocation();
  const [mostrarTodo, setMostrarTodo] = useState(false);

  const historialOrdenado = useMemo(
    () =>
      [...data.historial].sort((a, b) => {
        const porFecha = b.gestion.fechaGestion.localeCompare(
          a.gestion.fechaGestion
        );
        return porFecha !== 0
          ? porFecha
          : b.creadaEn.localeCompare(a.creadaEn);
      }),
    [data.historial]
  );

  if (
    data.trazabilidad.length === 0 &&
    data.historial.length === 0 &&
    data.compromisos.length === 0
  ) {
    return (
      <AppAlert
        tone="info"
        title="El aspecto todavía no tiene trazabilidad"
        description="Cuando se finalice una evaluación, se emita una decisión, se solicite una revisión técnica o se gestione un compromiso, el recorrido aparecerá aquí."
      />
    );
  }

  const visibles = mostrarTodo
    ? historialOrdenado
    : historialOrdenado.slice(0, 5);
  const hayOcultos = historialOrdenado.length > 5;

  const evaluacionesSummary = (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-600">
        <FileClock size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-950">
          Auditoría completa de evaluaciones
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {data.historial.length} registro(s) con todos sus datos técnicos
        </p>
      </div>
    </div>
  );

  const compromisosSummary = (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700">
        <ClipboardList size={16} />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold text-slate-950">
          Compromisos asociados
        </p>
        <p className="mt-0.5 text-xs text-slate-500">
          {data.compromisos.length} compromiso(s) · actividades, recalificación y cierre
        </p>
      </div>
    </div>
  );

  return (
    <div className="space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        <header className="border-b border-slate-200 px-4 py-4 sm:px-5">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
              <FileText size={17} />
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-950">
                Histórico de actividades, revisiones y hallazgos
              </h3>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Lectura cronológica por fecha efectiva. El detalle técnico permanece disponible cuando lo necesites.
              </p>
            </div>
          </div>
        </header>

        {visibles.length === 0 ? (
          <p className="p-5 text-sm text-slate-500">
            No hay evaluaciones registradas todavía.
          </p>
        ) : (
          <div className="divide-y divide-slate-200">
            {visibles.map((item) => {
              const fechaGestion =
                fechaLarga(item.gestion.fechaGestion) ??
                item.gestion.fechaGestion;
              const fechaDocumento = fechaLarga(item.fechaDocumento);
              const fechaVencimiento = fechaLarga(
                item.fechaVencimientoCalculada
              );

              const params = new URLSearchParams(location.search);
              params.set("tareaId", String(data.tarea.id));
              params.set("detalle", "EVIDENCIAS");

              return (
                <article key={item.id} className="px-4 py-4 sm:px-5">
                  <p className="text-sm leading-6 text-slate-700">
                    <strong className="font-black text-slate-950">
                      {fechaGestion}:
                    </strong>{" "}
                    {descripcionPrincipal(item)}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
                    <span className="font-bold text-slate-700">
                      Resultado: {estadoLegible(item.estadoCumplimiento)} · {item.calificacionAdministrativa}
                    </span>
                    {fechaDocumento && (
                      <span className="text-slate-500">
                        Fecha documental: {fechaDocumento}
                      </span>
                    )}
                    {fechaVencimiento && (
                      <span className="text-emerald-700">
                        Vigencia hasta: {fechaVencimiento}
                      </span>
                    )}
                  </div>

                  {item.totalEvidencias > 0 && (
                    <div className="mt-3">
                      <Link
                        to={`${location.pathname}?${params.toString()}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-bold text-cyan-800 transition hover:bg-cyan-100"
                      >
                        <Paperclip size={13} />
                        Ver evidencia{item.totalEvidencias > 1 ? ` (${item.totalEvidencias})` : ""}
                      </Link>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        {(hayOcultos || paginacion.hayMas) && (
          <div className="border-t border-slate-200 bg-slate-50/70 px-4 py-3 sm:px-5">
            {hayOcultos && (
              <button
                type="button"
                onClick={() => setMostrarTodo((actual) => !actual)}
                className="inline-flex items-center gap-2 text-xs font-bold text-cyan-800 hover:text-cyan-950"
              >
                {mostrarTodo ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                {mostrarTodo
                  ? "Mostrar solo los 5 más recientes"
                  : `Ver historial completo · ${historialOrdenado.length} registros`}
              </button>
            )}

            {mostrarTodo && paginacion.hayMas && (
              <button
                type="button"
                disabled={loadingMore}
                onClick={onLoadMore}
                className="ml-0 mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50 sm:ml-4 sm:mt-0"
              >
                {loadingMore && (
                  <LoaderCircle size={14} className="animate-spin" />
                )}
                {loadingMore ? "Cargando…" : "Cargar registros anteriores"}
              </button>
            )}
          </div>
        )}
      </section>

      <div className="space-y-3">
        <p className="px-1 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500">
          Detalle técnico · cerrado por defecto
        </p>

        <DetalleColapsableCard
          summary={evaluacionesSummary}
          actionLabel={{
            closed: "Abrir auditoría",
            open: "Cerrar auditoría",
          }}
          contentClassName="space-y-3 bg-slate-50/50 p-3 sm:p-4"
        >
          {data.historial.length === 0 ? (
            <p className="rounded-xl bg-white p-4 text-sm text-slate-600">
              No hay evaluaciones registradas.
            </p>
          ) : (
            data.historial.map((item) => (
              <HistorialEvaluacionCard key={item.id} item={item} />
            ))
          )}
        </DetalleColapsableCard>

        <DetalleColapsableCard
          summary={compromisosSummary}
          actionLabel={{
            closed: "Abrir compromisos",
            open: "Cerrar compromisos",
          }}
          contentClassName="space-y-3 bg-slate-50/50 p-3 sm:p-4"
        >
          {data.compromisos.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-7 text-center">
              <p className="text-sm font-semibold text-slate-700">
                Este aspecto no tiene compromisos asociados.
              </p>
            </div>
          ) : (
            data.compromisos.map((compromiso) => (
              <CompromisoAspectoCard
                key={compromiso.id}
                compromiso={compromiso}
              />
            ))
          )}
        </DetalleColapsableCard>
      </div>
    </div>
  );
}
