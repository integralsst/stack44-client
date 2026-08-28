import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  FileWarning,
  Filter,
  History,
  Save,
  Search,
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useSearchParams } from "react-router-dom";

import type {
  BorradorEvaluacionAspecto,
  EstadoCumplimientoAspecto,
  FilaEvaluacion,
  GuardarEvaluacionInput,
} from "../../../types/evaluacion.types";
import { useAuth } from "../../auth/context/AuthContext";
import AppDateField from "./form/AppDateField";
import AppToast, {
  type ToastTone,
} from "./feedback/AppToast";
import VigenciaBadge from "./matriz/VigenciaBadge";

interface Props {
  filas: FilaEvaluacion[];
  editable: boolean;
  procesando: boolean;
  onGuardar: (
    evaluaciones: GuardarEvaluacionInput[]
  ) => Promise<unknown>;
  onAbrirDetalle: (fila: FilaEvaluacion) => void;
}

const CALIFICACION_POR_ESTADO: Record<
  EstadoCumplimientoAspecto,
  0 | 3 | 5
> = {
  NO_CUMPLIDO: 0,
  PARCIAL: 3,
  CUMPLIDO: 5,
  NO_APLICA: 5,
};

const ESTADO_LABEL: Record<EstadoCumplimientoAspecto, string> = {
  CUMPLIDO: "Cumplido",
  PARCIAL: "Parcial",
  NO_CUMPLIDO: "No cumplido",
  NO_APLICA: "No aplica",
};

const controlClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-xs text-slate-800 shadow-sm outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 disabled:opacity-70";

function nuevoRegistro(
  fila: FilaEvaluacion
): BorradorEvaluacionAspecto {
  const revisionObligatoria =
    fila.aspecto.configuracionRevision?.requiereRevisionTecnica ?? false;
  const motivoConfigurado =
    fila.aspecto.configuracionRevision?.observaciones?.trim() ||
    "Revisión técnica obligatoria configurada en la Supermatriz.";

  return {
    aspectoId: fila.aspecto.id,
    supermatrizTareaId: fila.tareaId,
    estadoCumplimiento: "",
    calificacionAdministrativa: null,
    observacion: "",
    fechaDocumento: "",
    justificacionNoAplica: "",
    marcadaRevisionTecnica: revisionObligatoria,
    motivoRevisionTecnica:
      revisionObligatoria ? motivoConfigurado : "",
  };
}

function estadoClass(estado: EstadoCumplimientoAspecto): string {
  switch (estado) {
    case "CUMPLIDO":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "PARCIAL":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "NO_CUMPLIDO":
      return "border-red-200 bg-red-50 text-red-700";
    case "NO_APLICA":
      return "border-sky-200 bg-sky-50 text-sky-700";
  }
}

function fechaCorta(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export default function MatrizEvaluacionDirecta({
  filas,
  editable,
  procesando,
  onGuardar,
  onAbrirDetalle,
}: Props) {
  const { hasRole } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const puedeProponerNoAplica = hasRole("PROFESSIONAL");
  const [busqueda, setBusqueda] = useState("");
  const [procesoId, setProcesoId] = useState("");
  const [estandarId, setEstandarId] = useState("");
  const [vigencia, setVigencia] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [visibles, setVisibles] = useState(40);
  const [evidenciasAbiertas, setEvidenciasAbiertas] = useState(false);
  const [registros, setRegistros] = useState<
    Record<number, BorradorEvaluacionAspecto>
  >({});
  const [modificados, setModificados] = useState<Set<number>>(
    new Set()
  );
  const [toast, setToast] = useState<{
    tone: ToastTone;
    title: string;
    description?: string;
  } | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const siguientes: Record<number, BorradorEvaluacionAspecto> = {};
    for (const fila of filas) {
      if (!siguientes[fila.aspecto.id]) {
        siguientes[fila.aspecto.id] = nuevoRegistro(fila);
      }
    }
    setRegistros(siguientes);
    setModificados(new Set());
  }, [filas]);

  const procesos = useMemo(() => {
    const map = new Map<number, string>();
    filas.forEach((fila) => map.set(fila.proceso.id, fila.proceso.nombre));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "es"));
  }, [filas]);

  const estandares = useMemo(() => {
    const map = new Map<number, string>();
    filas.forEach((fila) => map.set(fila.estandar.id, fila.estandar.nombre));
    return [...map.entries()].sort((a, b) => a[1].localeCompare(b[1], "es"));
  }, [filas]);

  const evidenciasPendientes = useMemo(
    () => filas.filter((fila) => fila.evidenciaPendiente),
    [filas]
  );

  useEffect(() => {
    setEvidenciasAbiertas(evidenciasPendientes.length > 0 && evidenciasPendientes.length <= 3);
  }, [evidenciasPendientes.length]);

  const filasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLocaleLowerCase("es");

    return filas.filter((fila) => {
      const coincideBusqueda =
        !term ||
        [
          fila.codigo ?? "",
          fila.aspecto.codigo ?? "",
          fila.aspecto.nombre,
          fila.proceso.nombre,
          fila.estandar.nombre,
          fila.aspecto.planAccionEspecifico ?? "",
        ].some((value) =>
          value.toLocaleLowerCase("es").includes(term)
        );
      const coincideProceso =
        !procesoId || fila.proceso.id === Number(procesoId);
      const coincideEstandar =
        !estandarId || fila.estandar.id === Number(estandarId);
      const coincideVigencia =
        !vigencia || fila.estadoVigenciaOficial === vigencia;

      return (
        coincideBusqueda &&
        coincideProceso &&
        coincideEstandar &&
        coincideVigencia
      );
    });
  }, [busqueda, estandarId, filas, procesoId, vigencia]);

  useEffect(() => {
    setVisibles(40);
  }, [busqueda, estandarId, procesoId, vigencia]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibles >= filasFiltradas.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibles((actual) =>
            Math.min(actual + 40, filasFiltradas.length)
          );
        }
      },
      { rootMargin: "500px" }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filasFiltradas.length, visibles]);

  const actualizar = (
    fila: FilaEvaluacion,
    patch: Partial<BorradorEvaluacionAspecto>
  ) => {
    if (!editable || procesando) return;

    setRegistros((actuales) => {
      const base = actuales[fila.aspecto.id] ?? nuevoRegistro(fila);
      const siguiente = {
        ...base,
        ...patch,
      };

      if ("estadoCumplimiento" in patch) {
        siguiente.calificacionAdministrativa = patch.estadoCumplimiento
          ? CALIFICACION_POR_ESTADO[patch.estadoCumplimiento]
          : null;

        if (patch.estadoCumplimiento !== "NO_APLICA") {
          siguiente.justificacionNoAplica = "";
        }
      }

      return {
        ...actuales,
        [fila.aspecto.id]: siguiente,
      };
    });

    setModificados((actuales) => {
      const siguiente = new Set(actuales);
      siguiente.add(fila.aspecto.id);
      return siguiente;
    });
  };

  const construirPayload = (): GuardarEvaluacionInput[] => {
    const payload: GuardarEvaluacionInput[] = [];

    for (const aspectoId of modificados) {
      const fila = filas.find((item) => item.aspecto.id === aspectoId);
      const registro = registros[aspectoId];

      if (!fila || !registro) continue;

      if (!registro.estadoCumplimiento) {
        throw new Error(
          `Selecciona una nueva evaluación para “${fila.aspecto.nombre}”.`
        );
      }

      if (registro.calificacionAdministrativa == null) {
        throw new Error(
          `La evaluación de “${fila.aspecto.nombre}” no tiene nota válida.`
        );
      }

      if (
        registro.estadoCumplimiento === "NO_APLICA" &&
        !registro.justificacionNoAplica.trim()
      ) {
        throw new Error(
          `Justifica por qué “${fila.aspecto.nombre}” no aplica.`
        );
      }

      if (
        registro.marcadaRevisionTecnica &&
        registro.motivoRevisionTecnica.trim().length < 10
      ) {
        throw new Error(
          `La revisión técnica de “${fila.aspecto.nombre}” requiere un motivo de al menos 10 caracteres.`
        );
      }

      payload.push({
        aspectoId: registro.aspectoId,
        supermatrizTareaId: registro.supermatrizTareaId,
        estadoCumplimiento: registro.estadoCumplimiento,
        calificacionAdministrativa:
          registro.calificacionAdministrativa,
        observacion: registro.observacion.trim() || null,
        fechaDocumento:
          registro.estadoCumplimiento === "NO_APLICA"
            ? null
            : registro.fechaDocumento || null,
        justificacionNoAplica:
          registro.estadoCumplimiento === "NO_APLICA"
            ? registro.justificacionNoAplica.trim()
            : null,
        marcadaRevisionTecnica:
          registro.marcadaRevisionTecnica,
        motivoRevisionTecnica:
          registro.marcadaRevisionTecnica
            ? registro.motivoRevisionTecnica.trim()
            : null,
      });
    }

    return payload;
  };

  const guardar = async () => {
    try {
      const payload = construirPayload();
      if (payload.length === 0) {
        setToast({
          tone: "info",
          title: "No hay evaluaciones nuevas",
          description:
            "Selecciona una nueva evaluación en al menos un aspecto antes de guardar.",
        });
        return;
      }

      await onGuardar(payload);
      setToast({
        tone: "success",
        title: "Evaluaciones registradas",
        description: `${payload.length} evaluación(es) quedaron oficiales y su historial fue conservado.`,
      });
    } catch (error) {
      setToast({
        tone: "error",
        title: "No fue posible guardar",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado.",
      });
    }
  };

  const abrirDetalle = (
    fila: FilaEvaluacion,
    detalle: "HISTORIAL" | "EVIDENCIAS"
  ) => {
    const siguientes = new URLSearchParams(searchParams);
    siguientes.set("tareaId", String(fila.tareaId));
    siguientes.set("detalle", detalle);
    setSearchParams(siguientes, { replace: true });
    onAbrirDetalle(fila);
  };

  const rows = filasFiltradas.slice(0, visibles);
  const filtrosActivos = [procesoId, estandarId, vigencia].filter(Boolean).length;

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 border-t-2 border-t-cyan-500 bg-white shadow-sm">
      {evidenciasPendientes.length > 0 && (
        <div className="border-b border-amber-200 bg-gradient-to-r from-amber-50 via-white to-amber-50/40">
          <button
            type="button"
            onClick={() => setEvidenciasAbiertas((actual) => !actual)}
            className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-amber-50/70 sm:px-5"
            aria-expanded={evidenciasAbiertas}
          >
            <div className="flex min-w-0 items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-600 shadow-sm">
                <FileWarning size={19} />
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-bold text-slate-900">
                    Evidencias pendientes
                  </h2>
                  <span className="rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                    {evidenciasPendientes.length} pendiente{evidenciasPendientes.length === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  Aspectos con calificación 5 que todavía requieren un soporte documental válido.
                </p>
              </div>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-amber-200 bg-white text-amber-700 shadow-sm">
              <ChevronDown
                size={17}
                className={`transition-transform ${evidenciasAbiertas ? "rotate-180" : ""}`}
              />
            </span>
          </button>

          {evidenciasAbiertas && (
            <div className="border-t border-amber-100 px-4 pb-4 pt-3 sm:px-5">
              <div className="max-h-72 overflow-y-auto pr-1 [scrollbar-gutter:stable]">
                <div className="grid gap-2 xl:grid-cols-2">
                  {evidenciasPendientes.map((fila) => (
                    <button
                      key={`evidencia-${fila.tareaId}`}
                      type="button"
                      onClick={() => abrirDetalle(fila, "EVIDENCIAS")}
                      className="group flex min-w-0 items-center justify-between gap-3 rounded-xl border border-amber-200 bg-white px-3.5 py-3 text-left shadow-sm transition hover:border-amber-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-100"
                    >
                      <div className="min-w-0">
                        <p className="line-clamp-2 text-xs font-bold leading-5 text-slate-800">
                          {fila.aspecto.codigo ? `${fila.aspecto.codigo} · ` : ""}
                          {fila.aspecto.nombre}
                        </p>
                        <p className="mt-1 truncate text-[10px] text-slate-500">
                          {fila.estandar.nombre}
                        </p>
                      </div>
                      <span className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[10px] font-bold text-amber-700 transition group-hover:bg-amber-100">
                        Completar soporte
                        <ArrowUpRight size={12} />
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="border-b border-slate-200 bg-gradient-to-r from-white via-cyan-50/30 to-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
                <ShieldCheck size={17} />
              </span>
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Evaluación directa de la Supermatriz
                </h2>
                <p className="mt-0.5 text-xs leading-5 text-slate-500">
                  Registra únicamente lo revisado. Cada guardado crea una nueva evaluación y conserva íntegramente el historial anterior.
                </p>
              </div>
            </div>
          </div>

          {editable && (
            <button
              type="button"
              onClick={() => void guardar()}
              disabled={procesando || modificados.size === 0}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-cyan-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 disabled:shadow-none"
            >
              <Save size={16} />
              {procesando
                ? "Guardando..."
                : modificados.size > 0
                  ? `Guardar evaluaciones (${modificados.size})`
                  : "Guardar evaluaciones"}
            </button>
          )}
        </div>

        <div className="mt-4 flex flex-col gap-2 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar aspecto, código, proceso o estándar"
              className={`${controlClass} pl-9`}
            />
          </label>

          <button
            type="button"
            onClick={() => setMostrarFiltros((actual) => !actual)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
          >
            <Filter size={14} />
            Filtros
            {filtrosActivos > 0 && (
              <span className="rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-bold text-cyan-800">
                {filtrosActivos}
              </span>
            )}
            <ChevronDown
              size={13}
              className={mostrarFiltros ? "rotate-180" : ""}
            />
          </button>
        </div>

        {mostrarFiltros && (
          <div className="mt-2 grid gap-2 md:grid-cols-3">
            <select
              value={procesoId}
              onChange={(event) => setProcesoId(event.target.value)}
              className={controlClass}
            >
              <option value="">Todos los procesos</option>
              {procesos.map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>

            <select
              value={estandarId}
              onChange={(event) => setEstandarId(event.target.value)}
              className={controlClass}
            >
              <option value="">Todos los estándares</option>
              {estandares.map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </select>

            <select
              value={vigencia}
              onChange={(event) => setVigencia(event.target.value)}
              className={controlClass}
            >
              <option value="">Todas las vigencias</option>
              <option value="SIN_REVISION">Sin revisión</option>
              <option value="VIGENTE">Vigente</option>
              <option value="VIGENTE_PERMANENTE">Vigente permanente</option>
              <option value="POR_VENCER">Por vencer</option>
              <option value="VENCIDO">Vencido</option>
              <option value="FALTA_FECHA_DOCUMENTO">Falta fecha</option>
              <option value="PERIODICIDAD_NO_CONFIGURADA">
                Periodicidad pendiente
              </option>
            </select>
          </div>
        )}
      </div>

      <div className="bg-slate-50/60 p-3 sm:p-4">
        <div className="space-y-3">
          {rows.map((fila) => {
            const registro =
              registros[fila.aspecto.id] ?? nuevoRegistro(fila);
            const cambio = modificados.has(fila.aspecto.id);
            const ultima = fila.ultimaEvaluacion;
            const revisionObligatoria =
              fila.aspecto.configuracionRevision?.requiereRevisionTecnica === true;
            const permiteNoAplica =
              puedeProponerNoAplica &&
              fila.aspecto.configuracion?.permiteNoAplica !== false;

            return (
              <article
                key={fila.tareaId}
                className={`overflow-hidden rounded-2xl border bg-white shadow-sm transition ${
                  cambio
                    ? "border-cyan-300 ring-2 ring-cyan-100"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-md"
                }`}
              >
                <div className={`border-b px-4 py-3.5 sm:px-5 ${cambio ? "border-cyan-200 bg-cyan-50/70" : "border-slate-200 bg-white"}`}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[10px] font-bold text-slate-500">
                          #{fila.orden}
                        </span>
                        {fila.aspecto.codigo && (
                          <span className="rounded-lg bg-cyan-50 px-2 py-1 text-[10px] font-bold text-cyan-800">
                            {fila.aspecto.codigo}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-2 text-sm font-bold leading-6 text-slate-900 sm:text-[15px]">
                        {fila.aspecto.nombre}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-[10px] leading-4 text-slate-500 sm:text-[11px]">
                        <span>{fila.proceso.nombre}</span>
                        <span className="hidden text-slate-300 sm:inline">•</span>
                        <span>{fila.estandar.nombre}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirDetalle(fila, "HISTORIAL")}
                      className="inline-flex shrink-0 items-center justify-center gap-1.5 self-start rounded-xl border border-slate-300 bg-white px-3 py-2 text-[11px] font-semibold text-slate-600 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
                      title={`Abrir detalle de ${fila.aspecto.nombre}`}
                    >
                      <History size={14} />
                      Historial
                    </button>
                  </div>
                </div>

                <div className="grid gap-0 lg:grid-cols-12">
                  <section className="border-b border-slate-200 p-4 lg:col-span-3 lg:border-b-0 lg:border-r sm:p-5">
                    <FieldLabel>Estado actual</FieldLabel>
                    {ultima ? (
                      <div className="mt-2 space-y-2">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${estadoClass(ultima.estadoCumplimiento)}`}>
                          {ESTADO_LABEL[ultima.estadoCumplimiento]} · {ultima.calificacionEfectiva}
                        </span>
                        <p className="text-[11px] text-slate-500">
                          {fechaCorta(ultima.gestion.fechaGestion)}
                          {ultima.resultadoProvisional ? " · provisional" : ""}
                        </p>
                        {fila.evidenciaPendiente && (
                          <button
                            type="button"
                            onClick={() => abrirDetalle(fila, "EVIDENCIAS")}
                            className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700 transition hover:bg-amber-100"
                          >
                            Evidencia pendiente
                          </button>
                        )}
                      </div>
                    ) : (
                      <p className="mt-2 text-sm font-medium text-slate-400">
                        Sin revisión
                      </p>
                    )}
                  </section>

                  <section className="border-b border-slate-200 p-4 lg:col-span-3 lg:border-b-0 lg:border-r sm:p-5">
                    <FieldLabel>Nueva evaluación</FieldLabel>
                    <select
                      value={registro.estadoCumplimiento}
                      disabled={!editable || procesando}
                      onChange={(event) =>
                        actualizar(fila, {
                          estadoCumplimiento:
                            event.target.value as EstadoCumplimientoAspecto | "",
                        })
                      }
                      className={`${controlClass} mt-2`}
                    >
                      <option value="">Sin nueva evaluación</option>
                      <option value="CUMPLIDO">Cumplido</option>
                      <option value="PARCIAL">Parcial</option>
                      <option value="NO_CUMPLIDO">No cumplido</option>
                      {permiteNoAplica && (
                        <option value="NO_APLICA">No aplica</option>
                      )}
                    </select>
                    <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Nota
                      </span>
                      <span className="text-lg font-bold text-slate-900">
                        {registro.calificacionAdministrativa ?? "—"}
                      </span>
                    </div>
                  </section>

                  <section className="border-b border-slate-200 p-4 lg:col-span-6 lg:border-b-0 sm:p-5">
                    <FieldLabel>Observación nueva</FieldLabel>
                    <textarea
                      rows={4}
                      value={registro.observacion}
                      disabled={!editable || procesando}
                      onChange={(event) =>
                        actualizar(fila, { observacion: event.target.value })
                      }
                      placeholder="Describe qué se verificó o qué cambió..."
                      className={`${controlClass} mt-2 min-h-24 resize-y`}
                    />
                  </section>
                </div>

                <div className="grid border-t border-slate-200 bg-slate-50/50 lg:grid-cols-12">
                  <section className="p-4 lg:col-span-6 lg:border-r lg:border-slate-200 sm:p-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel>Fecha soporte</FieldLabel>
                        <div className="mt-2">
                          <AppDateField
                            value={registro.fechaDocumento}
                            onChange={(value) =>
                              actualizar(fila, { fechaDocumento: value })
                            }
                            disabled={
                              !editable ||
                              procesando ||
                              registro.estadoCumplimiento === "NO_APLICA" ||
                              fila.aspecto.configuracionVigencia?.permiteFechaManual === false
                            }
                            inputClassName={controlClass}
                          />
                        </div>
                      </div>
                      <div>
                        <FieldLabel>Vigencia</FieldLabel>
                        <div className="mt-2">
                          <VigenciaBadge
                            estado={fila.estadoVigenciaOficial}
                            detalle={fila.detalleVigencia}
                          />
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="border-t border-slate-200 p-4 lg:col-span-6 lg:border-t-0 sm:p-5">
                    <FieldLabel>
                      {registro.estadoCumplimiento === "NO_APLICA"
                        ? "Justificación de No aplica"
                        : "Revisión técnica"}
                    </FieldLabel>
                    {registro.estadoCumplimiento === "NO_APLICA" ? (
                      <textarea
                        rows={3}
                        value={registro.justificacionNoAplica}
                        disabled={!editable || procesando}
                        onChange={(event) =>
                          actualizar(fila, {
                            justificacionNoAplica: event.target.value,
                          })
                        }
                        placeholder="Justificación obligatoria"
                        className={`${controlClass} mt-2 min-h-20 resize-y`}
                      />
                    ) : (
                      <div className="mt-2 space-y-2">
                        <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-600">
                          <input
                            type="checkbox"
                            checked={registro.marcadaRevisionTecnica}
                            disabled={!editable || procesando || revisionObligatoria}
                            onChange={(event) =>
                              actualizar(fila, {
                                marcadaRevisionTecnica: event.target.checked,
                              })
                            }
                            className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          {revisionObligatoria
                            ? "Revisión técnica obligatoria"
                            : "Solicitar revisión técnica"}
                        </label>
                        {registro.marcadaRevisionTecnica && (
                          <textarea
                            rows={2}
                            value={registro.motivoRevisionTecnica}
                            disabled={!editable || procesando}
                            onChange={(event) =>
                              actualizar(fila, {
                                motivoRevisionTecnica: event.target.value,
                              })
                            }
                            placeholder="Motivo de la revisión"
                            className={`${controlClass} min-h-20 resize-y`}
                          />
                        )}
                      </div>
                    )}
                  </section>
                </div>
              </article>
            );
          })}

          {rows.length === 0 && (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">
              No hay aspectos que coincidan con los filtros.
            </div>
          )}
        </div>

        {visibles < filasFiltradas.length && (
          <div
            ref={sentinelRef}
            className="flex items-center justify-center py-6 text-xs text-slate-500"
          >
            Cargando más aspectos...
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-3 text-[10px] text-slate-500 sm:px-5">
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 size={12} className="text-emerald-600" />
          {Math.min(visibles, filasFiltradas.length)} de {filasFiltradas.length} aspectos visibles
        </span>
      </div>

      <AppToast
        open={toast !== null}
        tone={toast?.tone ?? "info"}
        title={toast?.title ?? ""}
        description={toast?.description}
        duration={6000}
        onClose={() => setToast(null)}
      />
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
      {children}
    </p>
  );
}
