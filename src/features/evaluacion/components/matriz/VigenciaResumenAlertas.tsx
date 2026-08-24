import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  FileCheck2,
  FolderOpen,
  ListChecks,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import type {
  EstadoEvidenciaAspecto,
  FilaEvaluacion,
} from "../../../../types/evaluacion.types";
import AppAlert from "../feedback/AppAlert";

function tieneEvidenciaPendienteGestionActiva(
  fila: FilaEvaluacion
): boolean {
  const evaluacionActiva = fila.evaluacionGestionActiva;

  return Boolean(
    evaluacionActiva &&
      evaluacionActiva.gestion.estado === "BORRADOR" &&
      evaluacionActiva.estadoCumplimiento === "CUMPLIDO" &&
      fila.aspecto.configuracionEvidencia
        ?.requiereEvidencia === true &&
      !fila.detalleEvidencia.tieneEvidenciaEvaluacion
  );
}

function requiereAccionEvidencia(
  fila: FilaEvaluacion
): boolean {
  return (
    fila.evidenciaPendiente ||
    tieneEvidenciaPendienteGestionActiva(fila)
  );
}

function tieneCompromisoPendiente(
  fila: FilaEvaluacion
): boolean {
  const calificacion =
    fila.ultimaEvaluacion?.calificacionAdministrativa;

  return calificacion === 0 || calificacion === 3;
}

function estadoDocumentalLabel(
  estado: EstadoEvidenciaAspecto,
  pendienteGestionActiva: boolean
): string {
  if (pendienteGestionActiva) {
    return "Evidencia pendiente en borrador";
  }

  if (estado === "PENDIENTE") {
    return "Evidencia pendiente";
  }

  if (estado === "COMPLETA") {
    return "Evidencia completa";
  }

  return "Requiere evidencia";
}

function estadoDocumentalClass(
  estado: EstadoEvidenciaAspecto,
  pendienteGestionActiva: boolean
): string {
  if (pendienteGestionActiva || estado === "PENDIENTE") {
    return "border-amber-300 bg-amber-100 text-amber-950";
  }

  if (estado === "COMPLETA") {
    return "border-emerald-200 bg-emerald-100 text-emerald-800";
  }

  return "border-cyan-200 bg-cyan-50 text-cyan-800";
}

function filaDocumentalClass(
  fila: FilaEvaluacion
): string {
  if (requiereAccionEvidencia(fila)) {
    return "bg-amber-50/70";
  }

  if (fila.estadoEvidencia === "COMPLETA") {
    return "bg-emerald-50/30";
  }

  return "bg-white";
}

export default function VigenciaResumenAlertas({
  filas,
}: {
  filas: FilaEvaluacion[];
}) {
  const [searchParams, setSearchParams] =
    useSearchParams();
  const [panelCompromisosAbierto, setPanelCompromisosAbierto] =
    useState(true);
  const [panelEvidenciasAbierto, setPanelEvidenciasAbierto] =
    useState(false);

  const resumen = useMemo(() => {
    const aspectos = new Map(
      filas.map((fila) => [
        fila.aspecto.id,
        fila,
      ])
    );

    const unicas = [...aspectos.values()];
    const compromisosPendientes = unicas
      .filter(tieneCompromisoPendiente)
      .sort((a, b) => {
        const notaA =
          a.ultimaEvaluacion?.calificacionAdministrativa ?? 5;
        const notaB =
          b.ultimaEvaluacion?.calificacionAdministrativa ?? 5;

        if (notaA !== notaB) return notaA - notaB;
        return a.orden - b.orden;
      });
    const requierenEvidencia = unicas
      .filter(
        (fila) =>
          fila.aspecto.configuracionEvidencia
            ?.requiereEvidencia === true
      )
      .sort((a, b) => {
        const aRequiereAccion = requiereAccionEvidencia(a);
        const bRequiereAccion = requiereAccionEvidencia(b);

        if (aRequiereAccion !== bRequiereAccion) {
          return aRequiereAccion ? -1 : 1;
        }

        return a.orden - b.orden;
      });

    return {
      faltaFecha: unicas.filter(
        (fila) =>
          fila.estadoVigencia ===
          "FALTA_FECHA_DOCUMENTO"
      ).length,
      periodicidad: unicas.filter(
        (fila) =>
          fila.estadoVigencia ===
          "PERIODICIDAD_NO_CONFIGURADA"
      ).length,
      compromisosPendientes,
      requierenEvidencia,
      evidenciasPendientes: requierenEvidencia.filter(
        requiereAccionEvidencia
      ).length,
      evidenciasCompletas: requierenEvidencia.filter(
        (fila) =>
          !tieneEvidenciaPendienteGestionActiva(fila) &&
          fila.estadoEvidencia === "COMPLETA"
      ).length,
    };
  }, [filas]);

  const totalVigencia =
    resumen.faltaFecha + resumen.periodicidad;
  const totalCompromisosPendientes =
    resumen.compromisosPendientes.length;
  const totalRequierenEvidencia =
    resumen.requierenEvidencia.length;

  if (
    totalVigencia === 0 &&
    totalCompromisosPendientes === 0 &&
    totalRequierenEvidencia === 0
  ) {
    return null;
  }

  const partesVigencia: string[] = [];

  if (resumen.faltaFecha > 0) {
    partesVigencia.push(
      `${resumen.faltaFecha} sin fecha del documento`
    );
  }

  if (resumen.periodicidad > 0) {
    partesVigencia.push(
      `${resumen.periodicidad} sin periodicidad completa`
    );
  }

  const abrirDetalle = (
    fila: FilaEvaluacion,
    detalle: "RESUMEN" | "EVIDENCIAS"
  ) => {
    const siguientesParametros =
      new URLSearchParams(searchParams);

    siguientesParametros.set(
      "tareaId",
      String(fila.tareaId)
    );
    siguientesParametros.set("detalle", detalle);

    setSearchParams(siguientesParametros);
  };

  return (
    <div className="space-y-3 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
      {totalCompromisosPendientes > 0 && (
        <section className="overflow-hidden rounded-2xl border border-amber-200 bg-white text-slate-950 shadow-sm">
          <button
            type="button"
            onClick={() =>
              setPanelCompromisosAbierto((actual) => !actual)
            }
            aria-expanded={panelCompromisosAbierto}
            className="flex w-full flex-col gap-4 px-5 py-4 text-left transition hover:bg-amber-50/40 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex min-w-0 gap-3.5">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                <ListChecks size={18} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-950 sm:text-base">
                    Compromisos pendientes
                  </h3>
                  <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-[10px] font-extrabold text-amber-950 sm:text-xs">
                    {totalCompromisosPendientes}
                  </span>
                  <span className="text-[10px] font-semibold text-amber-700 sm:text-xs">
                    {panelCompromisosAbierto
                      ? "Ocultar aspectos"
                      : "Ver aspectos"}
                  </span>
                </div>
                <p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate-600">
                  Se calculan automáticamente desde la última evaluación válida: una nota 0 o 3 mantiene el aspecto pendiente; al llegar a 5 el pendiente desaparece sin cierre adicional.
                </p>
              </div>
            </div>

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-amber-200 bg-white text-amber-800 shadow-sm">
              {panelCompromisosAbierto ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </span>
          </button>

          {panelCompromisosAbierto && (
            <div className="max-h-72 divide-y divide-amber-100 overflow-y-auto border-t border-amber-200 bg-amber-50/30 p-2 sm:p-3">
              {resumen.compromisosPendientes.map((fila) => {
                const calificacion =
                  fila.ultimaEvaluacion?.calificacionAdministrativa ?? 0;
                const incumplimientoTotal = calificacion === 0;

                return (
                  <article
                    key={fila.aspecto.id}
                    className="flex flex-col gap-3 bg-white px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-amber-950">
                          Compromiso pendiente
                        </span>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9px] font-bold ${
                            incumplimientoTotal
                              ? "border-red-200 bg-red-50 text-red-800"
                              : "border-orange-200 bg-orange-50 text-orange-800"
                          }`}
                        >
                          {incumplimientoTotal
                            ? "No cumple · 0"
                            : "Parcial · 3"}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          Orden {fila.orden}
                          {fila.codigo
                            ? ` · ${fila.codigo}`
                            : ""}
                        </span>
                      </div>

                      <p className="mt-2 whitespace-normal text-sm font-bold leading-5 text-slate-950">
                        {fila.aspecto.nombre}
                      </p>
                      {fila.aspecto.planAccionEspecifico && (
                        <p className="mt-1 line-clamp-2 whitespace-normal text-xs leading-5 text-slate-600">
                          {fila.aspecto.planAccionEspecifico}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirDetalle(fila, "RESUMEN")}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-amber-300 bg-amber-100 px-3.5 py-2.5 text-xs font-bold text-amber-950 transition hover:bg-amber-200"
                    >
                      <Eye size={14} />
                      Ver aspecto
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {totalRequierenEvidencia > 0 && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-sm">
          <button
            type="button"
            onClick={() =>
              setPanelEvidenciasAbierto((actual) => !actual)
            }
            aria-expanded={panelEvidenciasAbierto}
            className="flex w-full flex-col gap-4 px-5 py-4 text-left transition hover:bg-slate-50 sm:px-6 lg:flex-row lg:items-center lg:justify-between"
          >
            <div className="flex min-w-0 gap-3.5">
              <span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 ring-1 ring-cyan-100">
                <FileCheck2 size={18} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-950 sm:text-base">
                    Estado documental de evidencias
                  </h3>
                  <span className="text-[10px] font-semibold text-cyan-700 sm:text-xs">
                    {panelEvidenciasAbierto
                      ? "Ocultar aspectos"
                      : "Ver aspectos"}
                  </span>
                </div>
                <p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate-600">
                  Consulta los aspectos con evidencia obligatoria y su estado documental sin ocupar espacio en la matriz.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex flex-wrap gap-2 text-[10px] font-bold sm:text-xs">
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-cyan-800">
                  Requieren: {totalRequierenEvidencia}
                </span>
                <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-1 text-amber-900">
                  Pendientes: {resumen.evidenciasPendientes}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-800">
                  Completas: {resumen.evidenciasCompletas}
                </span>
              </div>

              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm">
                {panelEvidenciasAbierto ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </span>
            </div>
          </button>

          {panelEvidenciasAbierto && (
            <div className="max-h-80 divide-y divide-slate-200 overflow-y-auto border-t border-slate-200 bg-slate-50/60 p-2 sm:p-3">
              {resumen.requierenEvidencia.map((fila) => {
                const descripcion =
                  fila.aspecto.configuracionEvidencia
                    ?.descripcionEvidencia?.trim() ||
                  "El aspecto exige un soporte documental válido.";
                const pendienteGestionActiva =
                  tieneEvidenciaPendienteGestionActiva(fila);
                const requiereAccion =
                  requiereAccionEvidencia(fila);

                return (
                  <article
                    key={fila.aspecto.id}
                    className={`flex flex-col gap-3 px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between ${filaDocumentalClass(
                      fila
                    )}`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${estadoDocumentalClass(
                            fila.estadoEvidencia,
                            pendienteGestionActiva
                          )}`}
                        >
                          {estadoDocumentalLabel(
                            fila.estadoEvidencia,
                            pendienteGestionActiva
                          )}
                        </span>
                        <span className="text-[10px] font-semibold text-slate-500">
                          Orden {fila.orden}
                          {fila.codigo
                            ? ` · ${fila.codigo}`
                            : ""}
                        </span>
                      </div>

                      <p className="mt-2 whitespace-normal text-sm font-bold leading-5 text-slate-950">
                        {fila.aspecto.nombre}
                      </p>
                      <p className="mt-1 whitespace-normal text-xs leading-5 text-slate-600">
                        {descripcion}
                      </p>
                      {pendienteGestionActiva && (
                        <p className="mt-2 text-xs font-semibold leading-5 text-amber-900">
                          La evaluación Cumplido / 5 ya está guardada en la gestión actual. Agrega la evidencia antes de finalizar.
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirDetalle(fila, "EVIDENCIAS")}
                      className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition ${
                        requiereAccion
                          ? "border-amber-300 bg-amber-100 text-amber-950 hover:bg-amber-200"
                          : "border-slate-300 bg-white text-slate-800 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
                      }`}
                    >
                      {requiereAccion ? (
                        <AlertTriangle size={14} />
                      ) : fila.estadoEvidencia === "COMPLETA" ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <FolderOpen size={14} />
                      )}
                      {pendienteGestionActiva
                        ? "Agregar evidencia"
                        : fila.evidenciaPendiente
                          ? "Completar evidencia"
                          : fila.estadoEvidencia === "COMPLETA"
                            ? "Ver evidencia"
                            : "Abrir evidencias"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {totalVigencia > 0 && (
        <AppAlert
          tone="warning"
          title={`${totalVigencia} aspecto(s) requieren completar la vigencia`}
          description={`${partesVigencia.join(
            " · "
          )}. Abre o edita la evaluación correspondiente para completar la información.`}
        />
      )}
    </div>
  );
}
