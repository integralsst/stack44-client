import {
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  FolderOpen,
} from "lucide-react";
import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import type {
  EstadoEvidenciaAspecto,
  FilaEvaluacion,
} from "../../../../types/evaluacion.types";
import AppAlert from "../feedback/AppAlert";

function estadoDocumentalLabel(
  estado: EstadoEvidenciaAspecto
): string {
  if (estado === "PENDIENTE") {
    return "Evidencia pendiente";
  }

  if (estado === "COMPLETA") {
    return "Evidencia completa";
  }

  return "Requiere evidencia";
}

function estadoDocumentalClass(
  estado: EstadoEvidenciaAspecto
): string {
  if (estado === "PENDIENTE") {
    return "border-amber-300 bg-amber-100 text-amber-950";
  }

  if (estado === "COMPLETA") {
    return "border-emerald-200 bg-emerald-100 text-emerald-800";
  }

  return "border-cyan-200 bg-cyan-50 text-cyan-800";
}

export default function VigenciaResumenAlertas({
  filas,
}: {
  filas: FilaEvaluacion[];
}) {
  const [searchParams, setSearchParams] =
    useSearchParams();

  const resumen = useMemo(() => {
    const aspectos = new Map(
      filas.map((fila) => [
        fila.aspecto.id,
        fila,
      ])
    );

    const unicas = [...aspectos.values()];
    const requierenEvidencia = unicas
      .filter(
        (fila) =>
          fila.aspecto.configuracionEvidencia
            ?.requiereEvidencia === true
      )
      .sort((a, b) => {
        if (
          a.evidenciaPendiente !==
          b.evidenciaPendiente
        ) {
          return a.evidenciaPendiente ? -1 : 1;
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
      requierenEvidencia,
      evidenciasPendientes: requierenEvidencia.filter(
        (fila) => fila.evidenciaPendiente
      ).length,
      evidenciasCompletas: requierenEvidencia.filter(
        (fila) => fila.estadoEvidencia === "COMPLETA"
      ).length,
    };
  }, [filas]);

  const totalVigencia =
    resumen.faltaFecha + resumen.periodicidad;
  const totalRequierenEvidencia =
    resumen.requierenEvidencia.length;

  if (
    totalVigencia === 0 &&
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

  const abrirEvidencias = (fila: FilaEvaluacion) => {
    const siguientesParametros =
      new URLSearchParams(searchParams);

    siguientesParametros.set(
      "tareaId",
      String(fila.tareaId)
    );
    siguientesParametros.set("detalle", "EVIDENCIAS");

    setSearchParams(siguientesParametros);
  };

  return (
    <div className="space-y-2 px-3 pt-3 sm:px-4">
      {totalRequierenEvidencia > 0 && (
        <section className="overflow-hidden rounded-2xl border border-amber-300 bg-amber-50 text-amber-950 shadow-sm">
          <div className="border-b border-amber-200 px-4 py-4 sm:px-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 gap-3">
                <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                  <FileCheck2 size={18} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-bold sm:text-base">
                    Estado documental de evidencias
                  </h3>
                  <p className="mt-1 max-w-3xl text-xs leading-5 text-amber-900/80">
                    Aquí aparecen todos los aspectos configurados con evidencia obligatoria. “Evidencia pendiente” significa que la evaluación oficial conserva nota 5, pero todavía no tiene un soporte válido relacionado.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-[10px] font-bold sm:text-xs">
                <span className="rounded-full border border-cyan-200 bg-white px-2.5 py-1 text-cyan-800">
                  Requieren evidencia: {totalRequierenEvidencia}
                </span>
                <span className="rounded-full border border-amber-300 bg-amber-100 px-2.5 py-1 text-amber-950">
                  Pendientes: {resumen.evidenciasPendientes}
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-100 px-2.5 py-1 text-emerald-800">
                  Completas: {resumen.evidenciasCompletas}
                </span>
              </div>
            </div>
          </div>

          <div className="max-h-80 divide-y divide-amber-200 overflow-y-auto bg-white/55">
            {resumen.requierenEvidencia.map((fila) => {
              const descripcion =
                fila.aspecto.configuracionEvidencia
                  ?.descripcionEvidencia?.trim() ||
                "El aspecto exige un soporte documental válido.";

              return (
                <article
                  key={fila.aspecto.id}
                  className="flex flex-col gap-3 px-4 py-3.5 sm:px-5 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${estadoDocumentalClass(
                          fila.estadoEvidencia
                        )}`}
                      >
                        {estadoDocumentalLabel(
                          fila.estadoEvidencia
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
                  </div>

                  <button
                    type="button"
                    onClick={() => abrirEvidencias(fila)}
                    className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-bold transition ${
                      fila.evidenciaPendiente
                        ? "border-amber-400 bg-amber-100 text-amber-950 hover:bg-amber-200"
                        : "border-slate-300 bg-white text-slate-800 hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
                    }`}
                  >
                    {fila.evidenciaPendiente ? (
                      <AlertTriangle size={14} />
                    ) : fila.estadoEvidencia === "COMPLETA" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <FolderOpen size={14} />
                    )}
                    Abrir evidencias
                  </button>
                </article>
              );
            })}
          </div>
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
