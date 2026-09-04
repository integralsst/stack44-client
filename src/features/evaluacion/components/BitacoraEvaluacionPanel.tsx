import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  History,
  Loader2,
  Save,
  Sparkles,
  TriangleAlert,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { useAuth } from "../../auth/context/AuthContext";
import {
  aplicarBitacoraCompleta,
  guardarYAnalizarBitacora,
  listarHistorialBitacoraUnificado,
} from "../../bitacora/api/bitacora.api";
import ConfirmacionEvidenciasUrlModal from "../../bitacora/components/ConfirmacionEvidenciasUrlModal";
import type {
  DecisionEvidenciaBitacoraInput,
  ModalidadBitacora,
  PropuestaAspectoBitacora,
  RegistroHistorialBitacoraUnificado,
  ResultadoAplicarBitacora,
  ResultadoBitacoraAsistida,
} from "../../bitacora/types/bitacora.types";

interface BitacoraEvaluacionPanelProps {
  empresaId: string;
  empresaNombre: string;
  onClose: () => void;
  onEvaluacionesAplicadas?: () => void | Promise<void>;
}

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50 disabled:text-slate-500";

const MODALIDADES: Array<{
  value: ModalidadBitacora;
  label: string;
}> = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "REMOTA", label: "Remota" },
  { value: "OFICINA", label: "Oficina" },
  { value: "SEGUIMIENTO_PUNTUAL", label: "Seguimiento puntual" },
];

function fechaHoyBogota(): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const mapa = new Map(
    partes
      .filter((parte) => parte.type !== "literal")
      .map((parte) => [parte.type, parte.value])
  );

  return `${mapa.get("year")}-${mapa.get("month")}-${mapa.get("day")}`;
}

function fechaLegible(fecha: string): string {
  const [year, month, day] = fecha.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : fecha;
}

function recortar(texto: string, limite = 160): string {
  const limpio = texto.trim().replace(/\s+/g, " ");
  return limpio.length <= limite ? limpio : `${limpio.slice(0, limite)}…`;
}

function estadoLegible(valor: string | null): string {
  if (!valor) return "Sin evaluación previa";
  const labels: Record<string, string> = {
    CUMPLIDO: "Cumplido",
    PARCIAL: "Parcial",
    NO_CUMPLIDO: "No cumplido",
    NO_APLICA: "No aplica",
  };
  return labels[valor] ?? valor.replaceAll("_", " ");
}

function notaEstado(valor: string | null): string {
  if (valor === "CUMPLIDO" || valor === "NO_APLICA") return "5";
  if (valor === "PARCIAL") return "3";
  if (valor === "NO_CUMPLIDO") return "0";
  return "—";
}

function aspectoDe(
  propuesta: PropuestaAspectoBitacora,
  resultado: ResultadoBitacoraAsistida
) {
  const candidato = resultado.recuperacion.aspectosCandidatos.find(
    (item) => item.aspectoId === propuesta.aspectoId
  );

  return {
    codigo: candidato?.codigo ?? String(propuesta.aspectoId),
    nombre: candidato?.nombre ?? `Aspecto ${propuesta.aspectoId}`,
  };
}

function brechasParaCinco(propuesta: PropuestaAspectoBitacora): string[] {
  const calificacion = propuesta.calificacionAdministrativaPropuesta;
  if (
    calificacion === 5 ||
    propuesta.estadoActual === "CUMPLIDO" ||
    propuesta.estadoActual === "NO_APLICA" ||
    propuesta.relacionSemantica === "CONTEXTUAL"
  ) {
    return [];
  }

  const fuente =
    propuesta.elementosNoEvaluados?.length
      ? propuesta.elementosNoEvaluados
      : propuesta.informacionFaltante;

  return [...new Set((fuente ?? []).map((item) => item.trim()).filter(Boolean))];
}

export default function BitacoraEvaluacionPanel({
  empresaId,
  empresaNombre,
  onClose,
  onEvaluacionesAplicadas,
}: BitacoraEvaluacionPanelProps) {
  const { token } = useAuth();
  const [fechaEfectiva, setFechaEfectiva] = useState(fechaHoyBogota);
  const [modalidad, setModalidad] =
    useState<ModalidadBitacora>("PRESENCIAL");
  const [tipoActividad, setTipoActividad] = useState(
    "Visita de seguimiento SG-SST"
  );
  const [contenido, setContenido] = useState("");
  const [resultado, setResultado] =
    useState<ResultadoBitacoraAsistida | null>(null);
  const [aplicacion, setAplicacion] =
    useState<ResultadoAplicarBitacora | null>(null);
  const [historial, setHistorial] = useState<
    RegistroHistorialBitacoraUnificado[]
  >([]);
  const [excluidos, setExcluidos] = useState<Set<number>>(new Set());
  const [decisionesEvidencia, setDecisionesEvidencia] = useState<
    DecisionEvidenciaBitacoraInput[]
  >([]);
  const [detalleSeleccion, setDetalleSeleccion] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargarHistorial = useCallback(async () => {
    if (!token || !empresaId) return;
    setLoadingHistorial(true);
    try {
      const data = await listarHistorialBitacoraUnificado(empresaId, token);
      setHistorial(data.registros);
    } catch (loadError) {
      console.error("[BITACORA-EVALUACION] historial-error", loadError);
    } finally {
      setLoadingHistorial(false);
    }
  }, [empresaId, token]);

  useEffect(() => {
    setResultado(null);
    setAplicacion(null);
    setExcluidos(new Set());
    setDecisionesEvidencia([]);
    setDetalleSeleccion(false);
    setError(null);
    void cargarHistorial();
  }, [cargarHistorial]);

  const aplicables = resultado?.resumen.evaluaciones ?? [];
  const seleccionadas = aplicables.filter(
    (propuesta) => !excluidos.has(propuesta.aspectoId)
  );
  const pendientesEvidencia =
    resultado?.analisis.evidenciasPendientesConfirmacion ?? [];
  const aspectosDisponiblesEvidencia = resultado
    ? seleccionadas.map((propuesta) => ({
        aspectoId: propuesta.aspectoId,
        ...aspectoDe(propuesta, resultado),
      }))
    : [];
  const idsDisponiblesEvidencia = new Set(
    aspectosDisponiblesEvidencia.map((item) => item.aspectoId)
  );
  const decisionesCompletas = pendientesEvidencia.every((pendiente) => {
    const decision = decisionesEvidencia.find(
      (item) => item.url === pendiente.url
    );
    if (!decision) return false;
    if (decision.decision === "DESCARTAR") return true;
    const ids = decision.aspectoIds ?? [];
    return ids.length > 0 && ids.every((id) => idsDisponiblesEvidencia.has(id));
  });

  const reconocidos = useMemo(() => {
    if (!resultado) return [];
    const base =
      resultado.resumen.aspectosReconocidos ??
      resultado.analisis.propuestas.filter(
        (propuesta) =>
          propuesta.accion === "PROPONER_EVALUACION" ||
          Boolean(propuesta.evidenciaBitacora)
      );

    return [
      ...new Map(base.map((item) => [item.aspectoId, item])).values(),
    ];
  }, [resultado]);

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !empresaId || guardando) return;

    setGuardando(true);
    setError(null);
    setResultado(null);
    setAplicacion(null);
    setExcluidos(new Set());
    setDecisionesEvidencia([]);
    setDetalleSeleccion(false);

    try {
      const data = await guardarYAnalizarBitacora(
        empresaId,
        {
          fechaEfectiva,
          contenido,
          modalidad,
          tipoActividad,
        },
        token
      );
      setResultado(data);
      await cargarHistorial();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible guardar y analizar la Bitácora."
      );
    } finally {
      setGuardando(false);
    }
  };

  const aplicar = async () => {
    if (
      !token ||
      !resultado ||
      aplicando ||
      seleccionadas.length === 0 ||
      !decisionesCompletas
    )
      return;

    setAplicando(true);
    setError(null);

    try {
      const data = await aplicarBitacoraCompleta(
        empresaId,
        resultado.registro.id,
        {
          excluirAspectoIds: [...excluidos],
          decisionesEvidencia,
        },
        token
      );
      setAplicacion(data);
      await Promise.all([
        cargarHistorial(),
        Promise.resolve(onEvaluacionesAplicadas?.()),
      ]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible aplicar las evaluaciones propuestas."
      );
    } finally {
      setAplicando(false);
    }
  };

  const alternar = (aspectoId: number) => {
    setExcluidos((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(aspectoId)) siguiente.delete(aspectoId);
      else siguiente.add(aspectoId);
      return siguiente;
    });
  };

  const nuevaBitacora = () => {
    setContenido("");
    setResultado(null);
    setAplicacion(null);
    setExcluidos(new Set());
    setDecisionesEvidencia([]);
    setDetalleSeleccion(false);
    setError(null);
  };

  return (
    <>
      <aside className="flex h-full min-h-[680px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-700">
              Bitácora SG-SST · IA
            </p>
            <h2 className="mt-0.5 truncate text-base font-semibold text-slate-950">
              {empresaNombre}
            </h2>
            <p className="mt-0.5 text-xs leading-5 text-slate-500">
              Empresa fijada desde Evaluar. El borrador se conserva al colapsar el panel.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Colapsar Bitácora"
            title="Colapsar Bitácora"
          >
            <X size={17} />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-3">
          <form
            onSubmit={guardar}
            className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3.5"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block min-w-0">
                <FieldLabel icon={<CalendarDays size={13} />}>
                  Fecha efectiva
                </FieldLabel>
                <input
                  type="date"
                  value={fechaEfectiva}
                  max={fechaHoyBogota()}
                  onChange={(event) => setFechaEfectiva(event.target.value)}
                  disabled={guardando || aplicando}
                  className={INPUT_CLASS}
                  required
                />
              </label>

              <label className="block min-w-0">
                <FieldLabel>Modalidad</FieldLabel>
                <select
                  value={modalidad}
                  onChange={(event) =>
                    setModalidad(event.target.value as ModalidadBitacora)
                  }
                  disabled={guardando || aplicando}
                  className={INPUT_CLASS}
                >
                  {MODALIDADES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="block">
              <FieldLabel>Tipo de actividad</FieldLabel>
              <input
                value={tipoActividad}
                onChange={(event) => setTipoActividad(event.target.value)}
                disabled={guardando || aplicando}
                maxLength={150}
                className={INPUT_CLASS}
              />
            </label>

            <label className="block">
              <FieldLabel icon={<ClipboardList size={13} />}>
                Registro de Bitácora
              </FieldLabel>
              <textarea
                value={contenido}
                onChange={(event) => setContenido(event.target.value)}
                disabled={guardando || aplicando || Boolean(aplicacion)}
                minLength={10}
                maxLength={20000}
                className={`${INPUT_CLASS} min-h-[180px] resize-y leading-6`}
                placeholder="Describe lo revisado mientras contrastas los aspectos de la matriz."
                required
              />
            </label>

            <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
              <span className="text-[11px] text-slate-400">
                {contenido.length.toLocaleString("es-CO")} / 20.000
              </span>
              <button
                type="submit"
                disabled={
                  guardando ||
                  aplicando ||
                  Boolean(aplicacion) ||
                  contenido.trim().length < 10
                }
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-cyan-700 px-4 text-xs font-semibold text-white transition hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {guardando ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Save size={15} />
                )}
                {guardando ? "Analizando…" : "Guardar y analizar"}
              </button>
            </div>
          </form>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">
              <div className="flex gap-2">
                <TriangleAlert size={15} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {resultado && (
            <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3.5">
              <div className="grid grid-cols-2 gap-2">
                <Metric
                  label="Reconocidos"
                  value={
                    resultado.resumen.totalAspectosReconocidos ??
                    reconocidos.length
                  }
                />
                <Metric
                  label="Cambios / soporte"
                  value={resultado.resumen.totalEvaluacionesPropuestas}
                />
                <Metric
                  label="Enlaces revisados"
                  value={decisionesEvidencia.length}
                />
                <Metric
                  label="Revisión"
                  value={resultado.resumen.totalRequierenRevision}
                />
              </div>

              {pendientesEvidencia.length > 0 && (
                <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-xs leading-5 text-cyan-900">
                  Se detectaron {pendientesEvidencia.length} enlace(s). Stack44 no los
                  guardará como evidencia automáticamente: cada uno requiere tu
                  confirmación.
                </div>
              )}

              <div className="space-y-2">
                {reconocidos.length === 0 ? (
                  <div className="rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                    No se encontró soporte directo suficiente para un aspecto.
                  </div>
                ) : (
                  reconocidos.map((propuesta) => {
                    const aspecto = aspectoDe(propuesta, resultado);
                    const brechas = brechasParaCinco(propuesta);
                    const cambio = propuesta.accion === "PROPONER_EVALUACION";

                    return (
                      <article
                        key={propuesta.aspectoId}
                        className="rounded-xl border border-slate-200 p-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                              <span className="font-semibold text-cyan-700">
                                {aspecto.codigo}
                              </span>
                              <span className="text-slate-300">·</span>
                              <span className="text-slate-500">
                                {Math.round(propuesta.confianza * 100)}%
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-semibold leading-5 text-slate-950">
                              {aspecto.nombre}
                            </p>
                          </div>
                          {cambio && (
                            <span className="shrink-0 rounded-lg bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                              {estadoLegible(propuesta.estadoPropuesto)} ·{" "}
                              {propuesta.calificacionAdministrativaPropuesta ?? "—"}
                            </span>
                          )}
                        </div>

                        <p className="mt-2 text-xs leading-5 text-slate-600">
                          {recortar(
                            propuesta.evidenciaBitacora ||
                              propuesta.justificacionTecnica,
                            180
                          )}
                        </p>

                        <details className="group mt-2">
                          <summary className="inline-flex cursor-pointer list-none items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800">
                            Ver detalle técnico
                            <ChevronDown
                              size={13}
                              className="transition group-open:rotate-180"
                            />
                          </summary>
                          <div className="mt-2 rounded-lg bg-slate-50 p-2.5 text-[11px] leading-5 text-slate-600">
                            <p>{propuesta.justificacionTecnica}</p>
                            {propuesta.reglaAplicada && (
                              <p className="mt-1.5 text-slate-500">
                                Regla: {propuesta.reglaAplicada}
                              </p>
                            )}
                            {brechas.length > 0 && (
                              <div className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-amber-950">
                                <p className="font-semibold">
                                  Para llegar a 5 en cumplimiento SG-SST
                                </p>
                                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-amber-900">
                                  {brechas.map((brecha) => (
                                    <li key={brecha}>{brecha}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </details>

                        {!cambio && propuesta.estadoActual && (
                          <p className="mt-2 text-[11px] text-slate-500">
                            Estado vigente: {estadoLegible(propuesta.estadoActual)} ·{" "}
                            {notaEstado(propuesta.estadoActual)}
                          </p>
                        )}
                      </article>
                    );
                  })
                )}
              </div>

              {aplicables.length > 0 && !aplicacion && (
                <div className="border-t border-slate-100 pt-3">
                  <button
                    type="button"
                    onClick={() => setDetalleSeleccion((actual) => !actual)}
                    className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-cyan-700 hover:text-cyan-900"
                  >
                    <ChevronDown
                      size={14}
                      className={`transition ${
                        detalleSeleccion ? "rotate-180" : ""
                      }`}
                    />
                    {detalleSeleccion
                      ? "Ocultar selección"
                      : "Revisar selección antes de aplicar"}
                  </button>

                  {detalleSeleccion && (
                    <div className="mt-2 space-y-1.5">
                      {aplicables.map((propuesta) => {
                        const aspecto = aspectoDe(propuesta, resultado);
                        return (
                          <label
                            key={propuesta.aspectoId}
                            className="flex cursor-pointer items-start gap-2 rounded-lg bg-slate-50 p-2.5"
                          >
                            <input
                              type="checkbox"
                              checked={!excluidos.has(propuesta.aspectoId)}
                              onChange={() => alternar(propuesta.aspectoId)}
                              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                            />
                            <span className="text-[11px] leading-5 text-slate-700">
                              <strong>{aspecto.codigo}</strong> · {aspecto.nombre}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {!aplicacion ? (
                <button
                  type="button"
                  onClick={aplicar}
                  disabled={
                    aplicando ||
                    seleccionadas.length === 0 ||
                    !decisionesCompletas
                  }
                  className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-xs font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {aplicando ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Sparkles size={15} />
                  )}
                  {aplicando
                    ? "Aplicando…"
                    : !decisionesCompletas
                      ? "Revisa los enlaces antes de aplicar"
                      : excluidos.size > 0
                        ? "Aprobar y aplicar selección"
                        : "Aprobar y aplicar todo"}
                </button>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
                  <div className="flex gap-2 text-xs text-emerald-900">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                    <div>
                      <p className="font-semibold">Bitácora aplicada</p>
                      <p className="mt-0.5 leading-5 text-emerald-800">
                        La matriz de la izquierda se actualizó con las evaluaciones aprobadas.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={nuevaBitacora}
                    className="mt-2 text-[11px] font-semibold text-emerald-800 hover:text-emerald-950"
                  >
                    Crear nueva Bitácora
                  </button>
                </div>
              )}
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-3.5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <History size={15} className="text-slate-500" />
                <div>
                  <p className="text-xs font-semibold text-slate-900">Histórico reciente</p>
                  <p className="text-[11px] text-slate-500">
                    Bitácoras y evaluaciones manuales de esta empresa.
                  </p>
                </div>
              </div>
              {loadingHistorial && (
                <Loader2 size={14} className="animate-spin text-slate-400" />
              )}
            </div>

            <div className="mt-3 divide-y divide-slate-100">
              {!loadingHistorial && historial.length === 0 && (
                <p className="rounded-lg bg-slate-50 p-3 text-center text-[11px] text-slate-500">
                  Aún no hay registros.
                </p>
              )}
              {historial.slice(0, 5).map((registro) => (
                <div key={registro.id} className="py-2.5 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-semibold text-slate-800">
                      {fechaLegible(registro.fechaEfectiva)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-slate-500">
                      {registro.fuente === "BITACORA_IA"
                        ? "Bitácora"
                        : "Manual"}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    {recortar(registro.contenidoOriginal, 120)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>

      {resultado && !aplicacion && pendientesEvidencia.length > 0 && (
        <ConfirmacionEvidenciasUrlModal
          pendientes={pendientesEvidencia}
          aspectosDisponibles={aspectosDisponiblesEvidencia}
          decisiones={decisionesEvidencia}
          onChange={setDecisionesEvidencia}
        />
      )}
    </>
  );
}

function FieldLabel({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
      {icon}
      {children}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] text-slate-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-slate-950">{value}</p>
    </div>
  );
}
