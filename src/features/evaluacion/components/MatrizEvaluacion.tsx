import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  Check,
  CheckCircle2,
  Filter,
  Loader2,
  Save,
  Search,
  Send,
} from "lucide-react";

import type {
  BorradorEvaluacionAspecto,
  EstadoCumplimientoAspecto,
  EstadoVigenciaEvaluacion,
  FilaEvaluacion,
  GuardarEvaluacionInput,
} from "../types/evaluacion.types";

interface Props {
  filas: FilaEvaluacion[];
  gestionActiva: boolean;
  procesando: boolean;
  onGuardar: (
    evaluaciones: GuardarEvaluacionInput[]
  ) => Promise<void>;
  onFinalizar: () => Promise<void>;
}

const selectClass =
  "w-full min-w-[130px] rounded-lg border border-neutral-700 bg-[#090a0b] px-2 py-2 text-xs text-white outline-none [color-scheme:dark] focus:border-cyan-500/60 disabled:cursor-not-allowed disabled:opacity-50";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-[#090a0b] px-2 py-2 text-xs text-white outline-none [color-scheme:dark] placeholder:text-neutral-600 focus:border-cyan-500/60 disabled:cursor-not-allowed disabled:opacity-50";

function toInputDate(value: string | null): string {
  return value ? value.slice(0, 10) : "";
}

function crearBorrador(
  fila: FilaEvaluacion
): BorradorEvaluacionAspecto {
  const evaluacion = fila.evaluacionGestionActiva;

  return {
    aspectoId: fila.aspecto.id,
    supermatrizTareaId: fila.tareaId,
    estadoCumplimiento:
      evaluacion?.estadoCumplimiento ?? "",
    calificacionAdministrativa:
      evaluacion?.calificacionAdministrativa ?? null,
    observacion: evaluacion?.observacion ?? "",
    fechaDocumento: toInputDate(
      evaluacion?.fechaDocumento ?? null
    ),
    justificacionNoAplica:
      evaluacion?.justificacionNoAplica ?? "",
    marcadaRevisionTecnica:
      evaluacion?.marcadaRevisionTecnica ?? false,
  };
}

function estadoCumplimientoLabel(
  estado: EstadoCumplimientoAspecto
): string {
  const labels: Record<EstadoCumplimientoAspecto, string> = {
    CUMPLIDO: "Cumplido",
    PARCIAL: "Parcial",
    NO_CUMPLIDO: "No cumplido",
    NO_APLICA: "No aplica",
  };

  return labels[estado];
}

function VigenciaBadge({
  estado,
}: {
  estado: EstadoVigenciaEvaluacion;
}) {
  const styles: Record<
    EstadoVigenciaEvaluacion,
    { label: string; className: string }
  > = {
    SIN_REVISION: {
      label: "Sin revisión",
      className: "bg-neutral-700/60 text-neutral-300",
    },
    VIGENTE: {
      label: "Vigente",
      className: "bg-emerald-500/10 text-emerald-300",
    },
    POR_VENCER: {
      label: "Por vencer",
      className: "bg-amber-500/10 text-amber-300",
    },
    VENCIDO: {
      label: "Vencido",
      className: "bg-red-500/10 text-red-300",
    },
    SIN_VENCIMIENTO: {
      label: "Sin vencimiento",
      className: "bg-cyan-500/10 text-cyan-300",
    },
  };

  const current = styles[estado];

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-bold ${current.className}`}
    >
      {current.label}
    </span>
  );
}

export default function MatrizEvaluacion({
  filas,
  gestionActiva,
  procesando,
  onGuardar,
  onFinalizar,
}: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [procesoId, setProcesoId] = useState("");
  const [estandarId, setEstandarId] = useState("");
  const [categoriaGestion, setCategoriaGestion] =
    useState("");
  const [grupoMinisterial, setGrupoMinisterial] =
    useState("");
  const [vigencia, setVigencia] = useState("");
  const [visibles, setVisibles] = useState(100);
  const [borradores, setBorradores] = useState<
    Record<number, BorradorEvaluacionAspecto>
  >({});
  const [modificados, setModificados] = useState<Set<number>>(
    new Set()
  );
  const [mensaje, setMensaje] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const next: Record<number, BorradorEvaluacionAspecto> = {};

    for (const fila of filas) {
      if (!next[fila.aspecto.id]) {
        next[fila.aspecto.id] = crearBorrador(fila);
      }
    }

    setBorradores(next);
    setModificados(new Set());
  }, [filas]);

  const procesos = useMemo(() => {
    const map = new Map<number, string>();
    filas.forEach((fila) =>
      map.set(fila.proceso.id, fila.proceso.nombre)
    );
    return [...map.entries()].sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [filas]);

  const estandares = useMemo(() => {
    const map = new Map<number, string>();
    filas.forEach((fila) =>
      map.set(fila.estandar.id, fila.estandar.nombre)
    );
    return [...map.entries()].sort((a, b) =>
      a[1].localeCompare(b[1])
    );
  }, [filas]);

  const filasFiltradas = useMemo(() => {
    const term = busqueda.trim().toLowerCase();

    return filas.filter((fila) => {
      const matchesSearch =
        !term ||
        [
          fila.codigo ?? "",
          fila.proceso.nombre,
          fila.estandar.nombre,
          fila.aspecto.nombre,
          fila.aspecto.planAccionEspecifico ?? "",
        ].some((value) => value.toLowerCase().includes(term));

      const matchesProcess =
        !procesoId || fila.proceso.id === Number(procesoId);
      const matchesStandard =
        !estandarId || fila.estandar.id === Number(estandarId);
      const matchesCategory =
        !categoriaGestion ||
        fila.categoriasGestion.some(
          (categoria) =>
            categoria.codigo === categoriaGestion
        );
      const matchesGroup =
        !grupoMinisterial ||
        fila.estandar.gruposMinisteriales.some(
          (grupo) => grupo.codigo === grupoMinisterial
        );
      const matchesValidity =
        !vigencia || fila.estadoVigencia === vigencia;

      return (
        matchesSearch &&
        matchesProcess &&
        matchesStandard &&
        matchesCategory &&
        matchesGroup &&
        matchesValidity
      );
    });
  }, [
    busqueda,
    categoriaGestion,
    estandarId,
    filas,
    grupoMinisterial,
    procesoId,
    vigencia,
  ]);

  useEffect(() => {
    setVisibles(100);
  }, [
    busqueda,
    categoriaGestion,
    estandarId,
    grupoMinisterial,
    procesoId,
    vigencia,
  ]);

  useEffect(() => {
    const sentinel = sentinelRef.current;

    if (!sentinel || visibles >= filasFiltradas.length) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibles((current) =>
            Math.min(current + 100, filasFiltradas.length)
          );
        }
      },
      {
        rootMargin: "400px",
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filasFiltradas.length, visibles]);

  const updateDraft = (
    fila: FilaEvaluacion,
    patch: Partial<BorradorEvaluacionAspecto>
  ) => {
    setBorradores((current) => {
      const base = current[fila.aspecto.id] ?? crearBorrador(fila);
      const next = {
        ...base,
        ...patch,
      };

      if (patch.estadoCumplimiento === "NO_APLICA") {
        next.calificacionAdministrativa = 5;
      }

      return {
        ...current,
        [fila.aspecto.id]: next,
      };
    });

    setModificados((current) => {
      const next = new Set(current);
      next.add(fila.aspecto.id);
      return next;
    });

    setMensaje(null);
  };

  const construirPayload = (): GuardarEvaluacionInput[] => {
    const payload: GuardarEvaluacionInput[] = [];

    for (const aspectoId of modificados) {
      const draft = borradores[aspectoId];

      if (!draft?.estadoCumplimiento) {
        throw new Error(
          "Todas las filas modificadas deben tener un estado de cumplimiento."
        );
      }

      if (draft.calificacionAdministrativa == null) {
        throw new Error(
          "Todas las filas modificadas deben tener una calificación administrativa."
        );
      }

      if (
        draft.estadoCumplimiento === "NO_APLICA" &&
        !draft.justificacionNoAplica.trim()
      ) {
        throw new Error(
          "Las filas marcadas como No aplica requieren una justificación."
        );
      }

      payload.push({
        aspectoId: draft.aspectoId,
        supermatrizTareaId: draft.supermatrizTareaId,
        estadoCumplimiento: draft.estadoCumplimiento,
        calificacionAdministrativa:
          draft.calificacionAdministrativa,
        observacion: draft.observacion.trim() || null,
        fechaDocumento: draft.fechaDocumento || null,
        justificacionNoAplica:
          draft.estadoCumplimiento === "NO_APLICA"
            ? draft.justificacionNoAplica.trim()
            : null,
        marcadaRevisionTecnica:
          draft.marcadaRevisionTecnica,
      });
    }

    return payload;
  };

  const guardarCambios = async () => {
    setMensaje(null);

    try {
      const payload = construirPayload();

      if (payload.length === 0) {
        setMensaje("No hay cambios pendientes por guardar.");
        return;
      }

      await onGuardar(payload);
      setModificados(new Set());
      setMensaje(
        `${payload.length} evaluación(es) guardada(s) correctamente.`
      );
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No fue posible guardar los cambios."
      );
    }
  };

  const finalizarGestion = async () => {
    const confirmed = window.confirm(
      "¿Finalizar esta gestión? Después de finalizarla sus evaluaciones pasarán al estado vigente de la empresa y ya no podrán editarse desde este borrador."
    );

    if (!confirmed) return;

    setMensaje(null);

    try {
      const payload = construirPayload();

      if (payload.length > 0) {
        await onGuardar(payload);
      }

      await onFinalizar();
      setModificados(new Set());
    } catch (error) {
      setMensaje(
        error instanceof Error
          ? error.message
          : "No fue posible finalizar la gestión."
      );
    }
  };

  const rows = filasFiltradas.slice(0, visibles);

  return (
    <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#101112] shadow-2xl">
      <div className="border-b border-neutral-800 bg-[#0b0c0d] p-3 sm:p-4">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="grid min-w-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6">
            <div className="relative sm:col-span-2 xl:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="search"
                value={busqueda}
                onChange={(event) =>
                  setBusqueda(event.target.value)
                }
                placeholder="Buscar aspecto, estándar, proceso..."
                className={`${inputClass} py-2.5 pl-9`}
              />
            </div>

            <FilterSelect
              value={procesoId}
              onChange={setProcesoId}
              ariaLabel="Filtrar por proceso"
            >
              <option value="">Todos los procesos</option>
              {procesos.map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              value={estandarId}
              onChange={setEstandarId}
              ariaLabel="Filtrar por estándar"
            >
              <option value="">Todos los estándares</option>
              {estandares.map(([id, nombre]) => (
                <option key={id} value={id}>
                  {nombre}
                </option>
              ))}
            </FilterSelect>

            <FilterSelect
              value={categoriaGestion}
              onChange={setCategoriaGestion}
              ariaLabel="Filtrar por categoría de gestión"
            >
              <option value="">Toda la gestión</option>
              <option value="DOCUMENTAL">Documental</option>
              <option value="INTERVENCION">Intervención</option>
              <option value="EMERGENCIAS">Emergencias</option>
            </FilterSelect>

            <FilterSelect
              value={grupoMinisterial}
              onChange={setGrupoMinisterial}
              ariaLabel="Filtrar por grupo ministerial"
            >
              <option value="">Grupos 7 / 21 / 60</option>
              <option value="ESTANDARES_7">7 estándares</option>
              <option value="ESTANDARES_21">21 estándares</option>
              <option value="ESTANDARES_60">60 estándares</option>
            </FilterSelect>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Filter
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
              />
              <select
                value={vigencia}
                onChange={(event) =>
                  setVigencia(event.target.value)
                }
                className={`${selectClass} min-w-[150px] pl-8`}
              >
                <option value="">Toda vigencia</option>
                <option value="SIN_REVISION">Sin revisión</option>
                <option value="VIGENTE">Vigente</option>
                <option value="POR_VENCER">Por vencer</option>
                <option value="VENCIDO">Vencido</option>
                <option value="SIN_VENCIMIENTO">
                  Sin vencimiento
                </option>
              </select>
            </div>

            {gestionActiva && (
              <>
                <button
                  type="button"
                  onClick={() => void guardarCambios()}
                  disabled={procesando}
                  className="flex items-center gap-2 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2.5 text-xs font-bold text-cyan-300 transition hover:bg-cyan-500/20 disabled:opacity-50"
                >
                  {procesando ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  Guardar ({modificados.size})
                </button>

                <button
                  type="button"
                  onClick={() => void finalizarGestion()}
                  disabled={procesando}
                  className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-black transition hover:bg-neutral-200 disabled:opacity-50"
                >
                  <Send size={15} />
                  Finalizar gestión
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500">
          <span>
            Mostrando {Math.min(visibles, filasFiltradas.length)} de{" "}
            {filasFiltradas.length} filas filtradas
          </span>
          {mensaje && (
            <span className="flex items-center gap-1.5 text-neutral-300">
              <Check size={14} className="text-cyan-400" />
              {mensaje}
            </span>
          )}
        </div>
      </div>

      <div className="max-h-[68vh] overflow-auto">
        <table className="min-w-[2450px] border-separate border-spacing-0 text-left text-xs">
          <thead className="sticky top-0 z-40 bg-[#08090a] text-[10px] uppercase tracking-wider text-neutral-400">
            <tr>
              <StickyHeader className="left-0 w-16 min-w-16 text-center">
                Orden
              </StickyHeader>
              <StickyHeader className="left-16 w-48 min-w-48">
                Proceso
              </StickyHeader>
              <StickyHeader className="left-64 w-60 min-w-60">
                Estándar
              </StickyHeader>
              <StickyHeader className="left-[496px] w-80 min-w-80 border-r border-neutral-700">
                Aspecto
              </StickyHeader>
              <HeaderCell className="w-80 min-w-80">
                Plan de acción
              </HeaderCell>
              <HeaderCell className="w-44 min-w-44">
                Último estado
              </HeaderCell>
              <HeaderCell className="w-48 min-w-48">
                Estado actual
              </HeaderCell>
              <HeaderCell className="w-36 min-w-36">
                Calificación
              </HeaderCell>
              <HeaderCell className="w-72 min-w-72">
                Observación
              </HeaderCell>
              <HeaderCell className="w-44 min-w-44">
                Fecha documento
              </HeaderCell>
              <HeaderCell className="w-44 min-w-44">
                Vigencia
              </HeaderCell>
              <HeaderCell className="w-72 min-w-72">
                Justificación No aplica
              </HeaderCell>
              <HeaderCell className="w-36 min-w-36 text-center">
                Revisión técnica
              </HeaderCell>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={13}
                  className="px-6 py-16 text-center text-sm text-neutral-500"
                >
                  No hay filas que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              rows.map((fila) => {
                const draft =
                  borradores[fila.aspecto.id] ??
                  crearBorrador(fila);
                const isChanged = modificados.has(
                  fila.aspecto.id
                );

                return (
                  <tr
                    key={fila.tareaId}
                    className={`group ${
                      isChanged ? "bg-cyan-500/[0.035]" : ""
                    }`}
                  >
                    <StickyCell className="left-0 w-16 min-w-16 text-center font-mono text-neutral-500">
                      {fila.orden}
                    </StickyCell>
                    <StickyCell className="left-16 w-48 min-w-48 font-medium text-neutral-300">
                      <p className="line-clamp-3">
                        {fila.proceso.nombre}
                      </p>
                    </StickyCell>
                    <StickyCell className="left-64 w-60 min-w-60">
                      <p className="line-clamp-3 font-medium text-neutral-300">
                        {fila.estandar.nombre}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {fila.estandar.gruposMinisteriales.map(
                          (grupo) => (
                            <span
                              key={grupo.id}
                              className="rounded bg-neutral-800 px-1.5 py-0.5 text-[9px] text-neutral-500"
                            >
                              {grupo.codigo.replace("ESTANDARES_", "")}
                            </span>
                          )
                        )}
                      </div>
                    </StickyCell>
                    <StickyCell className="left-[496px] w-80 min-w-80 border-r border-neutral-700">
                      <p className="whitespace-normal font-semibold leading-5 text-white">
                        {fila.aspecto.nombre}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {fila.categoriasGestion.map((categoria) => (
                          <span
                            key={categoria.id}
                            className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[9px] text-cyan-300"
                          >
                            {categoria.nombre}
                          </span>
                        ))}
                      </div>
                    </StickyCell>

                    <BodyCell className="w-80 min-w-80 whitespace-normal leading-5 text-neutral-400">
                      {fila.aspecto.planAccionEspecifico ??
                        "Sin plan de acción"}
                    </BodyCell>

                    <BodyCell className="w-44 min-w-44">
                      {fila.ultimaEvaluacion ? (
                        <div className="space-y-1.5">
                          <span className="inline-flex rounded-full bg-neutral-800 px-2 py-1 text-[10px] font-bold text-neutral-300">
                            {estadoCumplimientoLabel(
                              fila.ultimaEvaluacion
                                .estadoCumplimiento
                            )}
                          </span>
                          <p className="text-[11px] text-neutral-500">
                            Nota{" "}
                            <strong className="text-neutral-300">
                              {
                                fila.ultimaEvaluacion
                                  .calificacionAdministrativa
                              }
                            </strong>
                          </p>
                        </div>
                      ) : (
                        <span className="text-neutral-600">
                          Sin evaluación
                        </span>
                      )}
                    </BodyCell>

                    <BodyCell className="w-48 min-w-48">
                      <select
                        value={draft.estadoCumplimiento}
                        disabled={!gestionActiva || procesando}
                        onChange={(event) =>
                          updateDraft(fila, {
                            estadoCumplimiento:
                              event.target.value as
                                | EstadoCumplimientoAspecto
                                | "",
                          })
                        }
                        className={selectClass}
                      >
                        <option value="">Seleccionar</option>
                        <option value="CUMPLIDO">Cumplido</option>
                        <option value="PARCIAL">Parcial</option>
                        <option value="NO_CUMPLIDO">
                          No cumplido
                        </option>
                        {fila.aspecto.configuracion
                          ?.permiteNoAplica !== false && (
                          <option value="NO_APLICA">
                            No aplica
                          </option>
                        )}
                      </select>
                    </BodyCell>

                    <BodyCell className="w-36 min-w-36">
                      <select
                        value={
                          draft.calificacionAdministrativa ?? ""
                        }
                        disabled={
                          !gestionActiva ||
                          procesando ||
                          draft.estadoCumplimiento === "NO_APLICA"
                        }
                        onChange={(event) =>
                          updateDraft(fila, {
                            calificacionAdministrativa:
                              event.target.value === ""
                                ? null
                                : Number(event.target.value),
                          })
                        }
                        className={selectClass}
                      >
                        <option value="">Nota</option>
                        {[0, 1, 2, 3, 4, 5].map((score) => (
                          <option key={score} value={score}>
                            {score}
                          </option>
                        ))}
                      </select>
                    </BodyCell>

                    <BodyCell className="w-72 min-w-72">
                      <textarea
                        rows={3}
                        value={draft.observacion}
                        disabled={!gestionActiva || procesando}
                        onChange={(event) =>
                          updateDraft(fila, {
                            observacion: event.target.value,
                          })
                        }
                        placeholder="Describe lo encontrado y la orientación dada..."
                        className={`${inputClass} resize-y`}
                      />
                    </BodyCell>

                    <BodyCell className="w-44 min-w-44">
                      <input
                        type="date"
                        value={draft.fechaDocumento}
                        disabled={!gestionActiva || procesando}
                        onChange={(event) =>
                          updateDraft(fila, {
                            fechaDocumento: event.target.value,
                          })
                        }
                        className={inputClass}
                      />
                    </BodyCell>

                    <BodyCell className="w-44 min-w-44">
                      <div className="space-y-2">
                        <VigenciaBadge
                          estado={fila.estadoVigencia}
                        />
                        {fila.ultimaEvaluacion
                          ?.fechaVencimientoCalculada && (
                          <p className="text-[10px] text-neutral-500">
                            Vence{" "}
                            {new Date(
                              fila.ultimaEvaluacion
                                .fechaVencimientoCalculada
                            ).toLocaleDateString("es-CO")}
                          </p>
                        )}
                      </div>
                    </BodyCell>

                    <BodyCell className="w-72 min-w-72">
                      <textarea
                        rows={3}
                        value={draft.justificacionNoAplica}
                        disabled={
                          !gestionActiva ||
                          procesando ||
                          draft.estadoCumplimiento !== "NO_APLICA"
                        }
                        onChange={(event) =>
                          updateDraft(fila, {
                            justificacionNoAplica:
                              event.target.value,
                          })
                        }
                        placeholder={
                          draft.estadoCumplimiento === "NO_APLICA"
                            ? "Justificación obligatoria..."
                            : "Se habilita al seleccionar No aplica"
                        }
                        className={`${inputClass} resize-y`}
                      />
                    </BodyCell>

                    <BodyCell className="w-36 min-w-36 text-center">
                      <label className="inline-flex cursor-pointer flex-col items-center gap-2 text-[10px] text-neutral-500">
                        <input
                          type="checkbox"
                          checked={draft.marcadaRevisionTecnica}
                          disabled={!gestionActiva || procesando}
                          onChange={(event) =>
                            updateDraft(fila, {
                              marcadaRevisionTecnica:
                                event.target.checked,
                            })
                          }
                          className="h-4 w-4 rounded border-neutral-700 bg-[#090a0b] accent-cyan-500"
                        />
                        {draft.marcadaRevisionTecnica ? (
                          <span className="flex items-center gap-1 text-cyan-300">
                            <CheckCircle2 size={12} />
                            Marcada
                          </span>
                        ) : (
                          "No"
                        )}
                      </label>
                    </BodyCell>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div ref={sentinelRef} className="h-1" />
    </section>
  );
}

function FilterSelect({
  value,
  onChange,
  ariaLabel,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <select
      value={value}
      aria-label={ariaLabel}
      onChange={(event) => onChange(event.target.value)}
      className={selectClass}
    >
      {children}
    </select>
  );
}

function HeaderCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`border-b border-r border-neutral-800 px-3 py-3 font-bold ${className}`}
    >
      {children}
    </th>
  );
}

function StickyHeader({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`sticky z-50 border-b border-r border-neutral-800 bg-[#08090a] px-3 py-3 font-bold ${className}`}
    >
      {children}
    </th>
  );
}

function BodyCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`border-b border-r border-neutral-800/80 px-3 py-3 align-top ${className}`}
    >
      {children}
    </td>
  );
}

function StickyCell({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <td
      className={`sticky z-20 border-b border-r border-neutral-800 bg-[#101112] px-3 py-3 align-top group-hover:bg-[#141516] ${className}`}
    >
      {children}
    </td>
  );
}
