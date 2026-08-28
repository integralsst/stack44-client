import {
  CheckCircle2,
  ChevronDown,
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
  "w-full rounded-lg border border-neutral-700 bg-[#090a0b] px-2.5 py-2 text-xs text-white outline-none transition placeholder:text-neutral-600 hover:border-neutral-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-45";

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
      return "border-emerald-500/30 bg-emerald-500/10 text-emerald-200";
    case "PARCIAL":
      return "border-amber-500/30 bg-amber-500/10 text-amber-200";
    case "NO_CUMPLIDO":
      return "border-red-500/30 bg-red-500/10 text-red-200";
    case "NO_APLICA":
      return "border-cyan-500/30 bg-cyan-500/10 text-cyan-200";
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
  const puedeProponerNoAplica = hasRole("PROFESSIONAL");
  const [busqueda, setBusqueda] = useState("");
  const [procesoId, setProcesoId] = useState("");
  const [estandarId, setEstandarId] = useState("");
  const [vigencia, setVigencia] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [visibles, setVisibles] = useState(100);
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
    setVisibles(100);
  }, [busqueda, estandarId, procesoId, vigencia]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || visibles >= filasFiltradas.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibles((actual) =>
            Math.min(actual + 100, filasFiltradas.length)
          );
        }
      },
      { rootMargin: "400px" }
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

  const rows = filasFiltradas.slice(0, visibles);
  const filtrosActivos = [procesoId, estandarId, vigencia].filter(Boolean).length;

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-neutral-800 bg-[#101112] shadow-2xl">
      <div className="border-b border-neutral-800 bg-[#0c0d0e] p-3 sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ShieldCheck size={17} className="text-cyan-300" />
              <h2 className="text-sm font-bold text-white">
                Evaluación directa de la Supermatriz
              </h2>
            </div>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              Registra únicamente lo que revisaste hoy. Cada guardado crea una nueva evaluación y conserva las anteriores en el historial.
            </p>
          </div>

          {editable && (
            <button
              type="button"
              onClick={() => void guardar()}
              disabled={procesando || modificados.size === 0}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-45"
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

        <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-center">
          <label className="relative min-w-0 flex-1">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
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
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-[#090a0b] px-3 py-2 text-xs font-semibold text-neutral-300 transition hover:border-neutral-600"
          >
            <Filter size={14} />
            Filtros
            {filtrosActivos > 0 && (
              <span className="rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[10px] text-cyan-200">
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

      <div className="max-h-[72vh] min-h-[420px] overflow-auto overscroll-contain [scrollbar-gutter:stable]">
        <table className="min-w-[1960px] border-separate border-spacing-0 text-left text-[11px]">
          <thead className="sticky top-0 z-40 bg-[#08090a] text-[9px] uppercase tracking-wider text-neutral-400">
            <tr>
              <Header sticky className="left-0 w-[54px] min-w-[54px] text-center">
                Orden
              </Header>
              <Header sticky className="left-[54px] w-[330px] min-w-[330px] border-r border-neutral-700">
                Aspecto
              </Header>
              <Header className="w-[180px] min-w-[180px]">Proceso</Header>
              <Header className="w-[210px] min-w-[210px]">Último estado</Header>
              <Header className="w-[170px] min-w-[170px]">Nueva evaluación</Header>
              <Header className="w-[72px] min-w-[72px] text-center">Nota</Header>
              <Header className="w-[260px] min-w-[260px]">Observación nueva</Header>
              <Header className="w-[150px] min-w-[150px]">Fecha soporte</Header>
              <Header className="w-[175px] min-w-[175px]">Vigencia</Header>
              <Header className="w-[220px] min-w-[220px]">No aplica / revisión</Header>
              <Header className="w-[100px] min-w-[100px] text-center">Detalle</Header>
            </tr>
          </thead>

          <tbody>
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
              const stickyBg = cambio ? "bg-[#102126]" : "bg-[#101112]";

              return (
                <tr
                  key={fila.tareaId}
                  className={cambio ? "bg-cyan-500/[0.035]" : "hover:bg-neutral-800/20"}
                >
                  <Cell sticky className={`left-0 text-center font-mono text-neutral-500 ${stickyBg}`}>
                    {fila.orden}
                  </Cell>
                  <Cell sticky className={`left-[54px] border-r border-neutral-700 ${stickyBg}`}>
                    <p className="font-semibold leading-5 text-neutral-100">
                      {fila.aspecto.codigo ? `${fila.aspecto.codigo} · ` : ""}
                      {fila.aspecto.nombre}
                    </p>
                    <p className="mt-1 line-clamp-2 text-[10px] leading-4 text-neutral-500">
                      {fila.estandar.nombre}
                    </p>
                  </Cell>
                  <Cell>
                    <p className="leading-5 text-neutral-300">{fila.proceso.nombre}</p>
                  </Cell>
                  <Cell>
                    {ultima ? (
                      <div className="space-y-1.5">
                        <span className={`inline-flex rounded-full border px-2 py-1 text-[9px] font-bold uppercase ${estadoClass(ultima.estadoCumplimiento)}`}>
                          {ESTADO_LABEL[ultima.estadoCumplimiento]} · {ultima.calificacionEfectiva}
                        </span>
                        <p className="text-[10px] text-neutral-500">
                          {fechaCorta(ultima.gestion.fechaGestion)}
                          {ultima.resultadoProvisional ? " · provisional" : ""}
                        </p>
                        {fila.evidenciaPendiente && (
                          <span className="inline-flex rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[9px] font-bold text-amber-200">
                            Evidencia pendiente
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-neutral-600">Sin revisión</span>
                    )}
                  </Cell>
                  <Cell>
                    <select
                      value={registro.estadoCumplimiento}
                      disabled={!editable || procesando}
                      onChange={(event) =>
                        actualizar(fila, {
                          estadoCumplimiento:
                            event.target.value as EstadoCumplimientoAspecto | "",
                        })
                      }
                      className={controlClass}
                    >
                      <option value="">Sin nueva evaluación</option>
                      <option value="CUMPLIDO">Cumplido</option>
                      <option value="PARCIAL">Parcial</option>
                      <option value="NO_CUMPLIDO">No cumplido</option>
                      {permiteNoAplica && (
                        <option value="NO_APLICA">No aplica</option>
                      )}
                    </select>
                  </Cell>
                  <Cell className="text-center">
                    <span className="text-base font-bold text-white">
                      {registro.calificacionAdministrativa ?? "—"}
                    </span>
                  </Cell>
                  <Cell>
                    <textarea
                      rows={3}
                      value={registro.observacion}
                      disabled={!editable || procesando}
                      onChange={(event) =>
                        actualizar(fila, { observacion: event.target.value })
                      }
                      placeholder="Qué se verificó o qué cambió..."
                      className={`${controlClass} resize-y`}
                    />
                  </Cell>
                  <Cell>
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
                  </Cell>
                  <Cell>
                    <VigenciaBadge
                      estado={fila.estadoVigenciaOficial}
                      detalle={fila.detalleVigencia}
                    />
                  </Cell>
                  <Cell>
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
                        className={`${controlClass} resize-y`}
                      />
                    ) : (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-[10px] text-neutral-300">
                          <input
                            type="checkbox"
                            checked={registro.marcadaRevisionTecnica}
                            disabled={!editable || procesando || revisionObligatoria}
                            onChange={(event) =>
                              actualizar(fila, {
                                marcadaRevisionTecnica: event.target.checked,
                              })
                            }
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
                            className={`${controlClass} resize-y`}
                          />
                        )}
                      </div>
                    )}
                  </Cell>
                  <Cell className="text-center">
                    <button
                      type="button"
                      onClick={() => onAbrirDetalle(fila)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-700 px-2.5 py-2 text-[10px] font-semibold text-neutral-300 transition hover:border-cyan-500/40 hover:text-cyan-200"
                      title={`Abrir detalle de ${fila.aspecto.nombre}`}
                    >
                      <History size={13} />
                      Historial
                    </button>
                  </Cell>
                </tr>
              );
            })}

            {rows.length === 0 && (
              <tr>
                <td colSpan={11} className="px-6 py-16 text-center text-sm text-neutral-500">
                  No hay aspectos que coincidan con los filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {visibles < filasFiltradas.length && (
          <div ref={sentinelRef} className="flex items-center justify-center py-5 text-xs text-neutral-500">
            Cargando más aspectos...
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-neutral-800 bg-[#0c0d0e] px-4 py-3 text-[10px] text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
        <span>
          {Math.min(visibles, filasFiltradas.length)} de {filasFiltradas.length} filas visibles
        </span>
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 size={12} />
          Guardar registra oficialmente; no existe un paso adicional de finalización.
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

function Header({
  children,
  sticky = false,
  className = "",
}: {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <th
      className={`border-b border-neutral-700 bg-[#08090a] px-3 py-3 align-middle ${
        sticky ? "sticky z-50" : ""
      } ${className}`}
    >
      {children}
    </th>
  );
}

function Cell({
  children,
  sticky = false,
  className = "",
}: {
  children: React.ReactNode;
  sticky?: boolean;
  className?: string;
}) {
  return (
    <td
      className={`border-b border-neutral-800 px-3 py-3 align-top ${
        sticky ? "sticky z-20" : ""
      } ${className}`}
    >
      {children}
    </td>
  );
}
