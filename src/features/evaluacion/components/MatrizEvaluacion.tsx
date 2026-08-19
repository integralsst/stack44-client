import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  CheckCircle2,
  Eye,
  LockKeyhole,
  Trash2,
} from "lucide-react";

import type {
  BorradorEvaluacionAspecto,
  EstadoCumplimientoAspecto,
  FilaEvaluacion,
  GuardarEvaluacionInput,
} from "../../../types/evaluacion.types";

import { useEliminarEvaluacionBorrador } from "../hooks/useEliminarEvaluacionBorrador";
import {
  existeCambioFechaDocumento,
  normalizarFechaInput,
} from "../utils/fecha-documento.utils";
import MatrizEvaluacionToolbar from "./MatrizEvaluacionToolbar";
import AppConfirmDialog from "./feedback/AppConfirmDialog";
import AppToast, {
  type ToastTone,
} from "./feedback/AppToast";
import AppDateField from "./form/AppDateField";
import VigenciaBadge from "./matriz/VigenciaBadge";
import VigenciaResumenAlertas from "./matriz/VigenciaResumenAlertas";
import RevisionTecnicaEstadoBadge from "./revisiones/RevisionTecnicaEstadoBadge";
import SolicitarRevisionTecnicaModal from "./revisiones/SolicitarRevisionTecnicaModal";

interface Props {
  filas: FilaEvaluacion[];
  gestionActiva: boolean;
  procesando: boolean;
  onGuardar: (
    evaluaciones: GuardarEvaluacionInput[]
  ) => Promise<void>;
  onFinalizar: () => Promise<void>;
  onAbrirDetalle: (fila: FilaEvaluacion) => void;
}

const controlBaseClass =
  "w-full rounded-lg border border-neutral-700 bg-[#090a0b] text-xs text-white outline-none transition [color-scheme:dark] placeholder:text-neutral-600 hover:border-neutral-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-45";

const selectClass = `${controlBaseClass} min-h-9 px-2 py-1.5`;
const inputClass = `${controlBaseClass} min-h-9 px-2 py-1.5`;

const CALIFICACION_POR_ESTADO: Record<
  EstadoCumplimientoAspecto,
  0 | 3 | 5
> = {
  NO_CUMPLIDO: 0,
  PARCIAL: 3,
  CUMPLIDO: 5,
  NO_APLICA: 5,
};

function calificacionPorEstado(
  estado: EstadoCumplimientoAspecto | ""
): 0 | 3 | 5 | null {
  return estado
    ? CALIFICACION_POR_ESTADO[estado]
    : null;
}

function estadoPorCalificacion(
  calificacion: number | null
): EstadoCumplimientoAspecto | "" {
  if (calificacion === 0) {
    return "NO_CUMPLIDO";
  }

  if (calificacion === 3) {
    return "PARCIAL";
  }

  if (calificacion === 5) {
    return "CUMPLIDO";
  }

  return "";
}

function crearBorrador(
  fila: FilaEvaluacion
): BorradorEvaluacionAspecto {
  const evaluacion = fila.evaluacionGestionActiva;
  const revisionObligatoria =
    fila.aspecto.configuracionRevision
      ?.requiereRevisionTecnica ?? false;
  const motivoConfigurado =
    fila.aspecto.configuracionRevision
      ?.observaciones?.trim() ||
    "Revisión técnica obligatoria configurada en la Supermatriz.";

  return {
    aspectoId: fila.aspecto.id,
    supermatrizTareaId: fila.tareaId,
    estadoCumplimiento:
      evaluacion?.estadoCumplimiento ?? "",
    calificacionAdministrativa: evaluacion
      ? calificacionPorEstado(
          evaluacion.estadoCumplimiento
        )
      : null,
    observacion: evaluacion?.observacion ?? "",
    fechaDocumento: normalizarFechaInput(
      evaluacion?.fechaDocumento
    ),
    justificacionNoAplica:
      evaluacion?.justificacionNoAplica ?? "",
    marcadaRevisionTecnica:
      revisionObligatoria ||
      Boolean(evaluacion?.marcadaRevisionTecnica),
    motivoRevisionTecnica:
      evaluacion?.motivoRevisionTecnica ??
      (revisionObligatoria ? motivoConfigurado : ""),
  };
}

function estadoCumplimientoLabel(
  estado: EstadoCumplimientoAspecto
): string {
  const labels: Record<
    EstadoCumplimientoAspecto,
    string
  > = {
    CUMPLIDO: "Cumplido",
    PARCIAL: "Parcial",
    NO_CUMPLIDO: "No cumplido",
    NO_APLICA: "No aplica",
  };

  return labels[estado];
}

function estadoSelectClass(
  estado: EstadoCumplimientoAspecto | ""
): string {
  if (estado === "CUMPLIDO") {
    return "border-emerald-500/40 text-emerald-200";
  }

  if (estado === "PARCIAL") {
    return "border-amber-500/40 text-amber-200";
  }

  if (estado === "NO_CUMPLIDO") {
    return "border-red-500/40 text-red-200";
  }

  if (estado === "NO_APLICA") {
    return "border-cyan-500/40 text-cyan-200";
  }

  return "";
}

export default function MatrizEvaluacion({
  filas,
  gestionActiva,
  procesando,
  onGuardar,
  onFinalizar,
  onAbrirDetalle,
}: Props) {
  const [busqueda, setBusqueda] = useState("");
  const [procesoId, setProcesoId] = useState("");
  const [estandarId, setEstandarId] = useState("");
  const [categoriaGestion, setCategoriaGestion] =
    useState("");
  const [grupoMinisterial, setGrupoMinisterial] =
    useState("");
  const [vigencia, setVigencia] = useState("");
  const [mostrarFiltros, setMostrarFiltros] =
    useState(false);
  const [visibles, setVisibles] = useState(100);
  const [borradores, setBorradores] = useState<
    Record<number, BorradorEvaluacionAspecto>
  >({});
  const [modificados, setModificados] = useState<
    Set<number>
  >(new Set());
  const [toast, setToast] = useState<{
    tone: ToastTone;
    title: string;
    description?: string;
  } | null>(null);
  const [confirmFinalizarOpen, setConfirmFinalizarOpen] =
    useState(false);
  const [
    filaRevisionSeleccionada,
    setFilaRevisionSeleccionada,
  ] = useState<FilaEvaluacion | null>(null);
  const [
    filaEliminarSeleccionada,
    setFilaEliminarSeleccionada,
  ] = useState<FilaEvaluacion | null>(null);
  const { eliminar, eliminandoAspectoId } =
    useEliminarEvaluacionBorrador();
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const next: Record<
      number,
      BorradorEvaluacionAspecto
    > = {};

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

  const filtrosActivos = [
    procesoId,
    estandarId,
    categoriaGestion,
    grupoMinisterial,
    vigencia,
  ].filter(Boolean).length;

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
        ].some((value) =>
          value.toLowerCase().includes(term)
        );

      const matchesProcess =
        !procesoId ||
        fila.proceso.id === Number(procesoId);
      const matchesStandard =
        !estandarId ||
        fila.estandar.id === Number(estandarId);
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
            Math.min(
              current + 100,
              filasFiltradas.length
            )
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

  const limpiarFiltros = () => {
    setBusqueda("");
    setProcesoId("");
    setEstandarId("");
    setCategoriaGestion("");
    setGrupoMinisterial("");
    setVigencia("");
  };

  const updateDraft = (
    fila: FilaEvaluacion,
    patch: Partial<BorradorEvaluacionAspecto>
  ) => {
    setBorradores((current) => {
      const base =
        current[fila.aspecto.id] ?? crearBorrador(fila);

      const next = {
        ...base,
        ...patch,
      };

      if ("estadoCumplimiento" in patch) {
        next.calificacionAdministrativa =
          calificacionPorEstado(
            patch.estadoCumplimiento ?? ""
          );
      }

      if (
        patch.estadoCumplimiento &&
        patch.estadoCumplimiento !== "NO_APLICA"
      ) {
        next.justificacionNoAplica = "";
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
  };

  const construirPayload =
    (): GuardarEvaluacionInput[] => {
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
          draft.calificacionAdministrativa !==
          calificacionPorEstado(
            draft.estadoCumplimiento
          )
        ) {
          throw new Error(
            "La nota debe corresponder al estado: 0 no cumplido, 3 parcial y 5 cumplido."
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

        if (
          draft.marcadaRevisionTecnica &&
          draft.motivoRevisionTecnica.trim().length < 10
        ) {
          throw new Error(
            "Las evaluaciones marcadas para revisión técnica requieren un motivo de al menos 10 caracteres."
          );
        }

        payload.push({
          aspectoId: draft.aspectoId,
          supermatrizTareaId: draft.supermatrizTareaId,
          estadoCumplimiento: draft.estadoCumplimiento,
          calificacionAdministrativa:
            draft.calificacionAdministrativa,
          observacion: draft.observacion.trim() || null,
          fechaDocumento:
            draft.estadoCumplimiento === "NO_APLICA"
              ? null
              : draft.fechaDocumento || null,
          justificacionNoAplica:
            draft.estadoCumplimiento === "NO_APLICA"
              ? draft.justificacionNoAplica.trim()
              : null,
          marcadaRevisionTecnica:
            draft.marcadaRevisionTecnica,
          motivoRevisionTecnica:
            draft.marcadaRevisionTecnica
              ? draft.motivoRevisionTecnica.trim()
              : null,
        });
      }

      return payload;
    };

  const guardarCambios = async () => {
    try {
      const payload = construirPayload();

      if (payload.length === 0) {
        setToast({
          tone: "info",
          title: "No hay cambios pendientes",
          description:
            "Modifica al menos una fila antes de guardar.",
        });
        return;
      }

      await onGuardar(payload);
      setModificados(new Set());
      setToast({
        tone: "success",
        title: "Evaluaciones guardadas",
        description: `${payload.length} evaluación(es) se guardaron correctamente.`,
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

  const confirmarFinalizacion = async () => {
    try {
      const payload = construirPayload();

      if (payload.length > 0) {
        await onGuardar(payload);
      }

      await onFinalizar();
      setModificados(new Set());
      setConfirmFinalizarOpen(false);
    } catch (error) {
      setConfirmFinalizarOpen(false);
      setToast({
        tone: "error",
        title: "No fue posible finalizar",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado.",
      });
    }
  };

  const confirmarEliminarEvaluacion = async () => {
    const fila = filaEliminarSeleccionada;
    const evaluacion = fila?.evaluacionGestionActiva;

    if (!fila || !evaluacion) {
      setFilaEliminarSeleccionada(null);
      return;
    }

    try {
      await eliminar(
        evaluacion.gestion.id,
        fila.aspecto.id
      );
      setFilaEliminarSeleccionada(null);
      setToast({
        tone: "success",
        title: "Evaluación retirada",
        description:
          "La evaluación se quitó de la gestión en borrador. El historial de la acción quedó registrado.",
      });
    } catch (error) {
      setToast({
        tone: "error",
        title: "No fue posible quitar la evaluación",
        description:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado.",
      });
    }
  };

  const rows = filasFiltradas.slice(0, visibles);

  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-neutral-800 bg-[#101112] shadow-2xl">
      <MatrizEvaluacionToolbar
        busqueda={busqueda}
        setBusqueda={setBusqueda}
        procesos={procesos}
        procesoId={procesoId}
        setProcesoId={setProcesoId}
        estandares={estandares}
        estandarId={estandarId}
        setEstandarId={setEstandarId}
        categoriaGestion={categoriaGestion}
        setCategoriaGestion={setCategoriaGestion}
        grupoMinisterial={grupoMinisterial}
        setGrupoMinisterial={setGrupoMinisterial}
        vigencia={vigencia}
        setVigencia={setVigencia}
        mostrarFiltros={mostrarFiltros}
        setMostrarFiltros={setMostrarFiltros}
        filtrosActivos={filtrosActivos}
        gestionActiva={gestionActiva}
        procesando={procesando || eliminandoAspectoId !== null}
        cambiosPendientes={modificados.size}
        visibles={visibles}
        totalFiltradas={filasFiltradas.length}
        onLimpiar={limpiarFiltros}
        onGuardar={() => void guardarCambios()}
        onFinalizar={() => setConfirmFinalizarOpen(true)}
      />

      <VigenciaResumenAlertas filas={filasFiltradas} />

      <div className="max-h-[72vh] min-h-[420px] overflow-auto overscroll-contain [scrollbar-gutter:stable]">
        <table className="min-w-[2050px] border-separate border-spacing-0 text-left text-[11px]">
          <thead className="sticky top-0 z-40 bg-[#08090a] text-[9px] uppercase tracking-wider text-neutral-400">
            <tr>
              <StickyHeader className="left-0 w-[52px] min-w-[52px] text-center">
                Orden
              </StickyHeader>
              <StickyHeader className="left-[52px] w-[280px] min-w-[280px] border-r border-neutral-700">
                Aspecto
              </StickyHeader>
              <HeaderCell className="w-[140px] min-w-[140px]">
                Proceso
              </HeaderCell>
              <HeaderCell className="w-[190px] min-w-[190px]">
                Estándar
              </HeaderCell>
              <HeaderCell className="w-[240px] min-w-[240px]">
                Plan de acción
              </HeaderCell>
              <HeaderCell className="w-[120px] min-w-[120px]">
                Último estado
              </HeaderCell>
              <HeaderCell className="w-[150px] min-w-[150px]">
                Estado actual
              </HeaderCell>
              <HeaderCell className="w-[92px] min-w-[92px]">
                Nota
              </HeaderCell>
              <HeaderCell className="w-[230px] min-w-[230px]">
                Observación
              </HeaderCell>
              <HeaderCell className="w-[144px] min-w-[144px]">
                Fecha del soporte
              </HeaderCell>
              <HeaderCell className="w-[150px] min-w-[150px]">
                Vigencia calculada
              </HeaderCell>
              <HeaderCell className="w-[220px] min-w-[220px]">
                Justificación No aplica
              </HeaderCell>
              <HeaderCell className="w-[132px] min-w-[132px] text-center">
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

                const fechaGuardada =
                  fila.evaluacionGestionActiva
                    ?.fechaDocumento ?? null;

                const fechaPendiente =
                  isChanged &&
                  existeCambioFechaDocumento(
                    draft.fechaDocumento,
                    fechaGuardada
                  );

                const permiteFechaManual =
                  fila.aspecto.configuracionVigencia
                    ?.permiteFechaManual ?? true;

                const revisionObligatoria =
                  fila.aspecto.configuracionRevision
                    ?.requiereRevisionTecnica === true;

                const stickyBackground = isChanged
                  ? "bg-[#102126]"
                  : "bg-[#101112]";

                return (
                  <tr
                    key={fila.tareaId}
                    className={`group transition-colors hover:bg-neutral-800/20 ${
                      isChanged
                        ? "bg-cyan-500/[0.035]"
                        : ""
                    }`}
                  >
                    <StickyCell
                      className={`left-0 w-[52px] min-w-[52px] text-center font-mono text-neutral-500 ${stickyBackground}`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span>{fila.orden}</span>
                        {isChanged && (
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-cyan-400"
                            title="Cambios pendientes"
                          />
                        )}
                      </div>
                    </StickyCell>

                    <StickyCell
                      className={`left-[52px] w-[280px] min-w-[280px] border-r border-neutral-700 ${stickyBackground}`}
                    >
                      <button
                        type="button"
                        onClick={() => onAbrirDetalle(fila)}
                        className="group/detail w-full text-left"
                        title={`Abrir detalle de ${fila.aspecto.nombre}`}
                      >
                        <span className="line-clamp-3 whitespace-normal font-semibold leading-4 text-white transition group-hover/detail:text-cyan-200">
                          {fila.aspecto.nombre}
                        </span>
                        <span className="mt-1 inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-wider text-neutral-600 transition group-hover/detail:text-cyan-400">
                          <Eye size={10} />
                          Ver detalle
                        </span>
                      </button>

                      <div className="mt-1.5 flex flex-wrap items-center gap-1">
                        {fila.codigo && (
                          <span className="rounded bg-neutral-800 px-1.5 py-0.5 font-mono text-[8px] text-neutral-500">
                            {fila.codigo}
                          </span>
                        )}

                        {fila.categoriasGestion.map(
                          (categoria) => (
                            <span
                              key={categoria.id}
                              className="rounded bg-cyan-500/10 px-1.5 py-0.5 text-[8px] text-cyan-300"
                            >
                              {categoria.nombre}
                            </span>
                          )
                        )}
                      </div>

                      {gestionActiva &&
                        fila.evaluacionGestionActiva && (
                          <button
                            type="button"
                            onClick={() =>
                              setFilaEliminarSeleccionada(fila)
                            }
                            disabled={
                              procesando ||
                              eliminandoAspectoId !== null
                            }
                            className="mt-2 inline-flex items-center gap-1 rounded-lg border border-red-300 bg-red-50 px-2 py-1 text-[9px] font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                            title="Quitar esta evaluación de la gestión en borrador"
                          >
                            <Trash2 size={11} />
                            Quitar evaluación
                          </button>
                        )}
                    </StickyCell>

                    <BodyCell className="w-[140px] min-w-[140px]">
                      <p
                        className="line-clamp-3 font-medium leading-4 text-neutral-300"
                        title={fila.proceso.nombre}
                      >
                        {fila.proceso.nombre}
                      </p>
                    </BodyCell>

                    <BodyCell className="w-[190px] min-w-[190px]">
                      <p
                        className="line-clamp-3 font-medium leading-4 text-neutral-300"
                        title={fila.estandar.nombre}
                      >
                        {fila.estandar.nombre}
                      </p>

                      <div className="mt-1 flex flex-wrap gap-1">
                        {fila.estandar.gruposMinisteriales.map(
                          (grupo) => (
                            <span
                              key={grupo.id}
                              className="rounded bg-neutral-800 px-1.5 py-0.5 text-[8px] text-neutral-500"
                            >
                              {grupo.codigo.replace(
                                "ESTANDARES_",
                                ""
                              )}
                            </span>
                          )
                        )}
                      </div>
                    </BodyCell>

                    <BodyCell className="w-[240px] min-w-[240px] whitespace-normal text-neutral-400">
                      <p
                        className="line-clamp-4 leading-4"
                        title={
                          fila.aspecto
                            .planAccionEspecifico ??
                          "Sin plan de acción"
                        }
                      >
                        {fila.aspecto
                          .planAccionEspecifico ??
                          "Sin plan de acción"}
                      </p>
                    </BodyCell>

                    <BodyCell className="w-[120px] min-w-[120px]">
                      {fila.ultimaEvaluacion ? (
                        <div className="space-y-1">
                          <span className="inline-flex rounded-full bg-neutral-800 px-2 py-1 text-[9px] font-bold text-neutral-300">
                            {estadoCumplimientoLabel(
                              fila.ultimaEvaluacion
                                .estadoCumplimiento
                            )}
                          </span>

                          <p className="text-[10px] text-neutral-500">
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

                    <BodyCell className="w-[150px] min-w-[150px]">
                      <select
                        value={draft.estadoCumplimiento}
                        disabled={
                          !gestionActiva || procesando
                        }
                        onChange={(event) =>
                          updateDraft(fila, {
                            estadoCumplimiento:
                              event.target.value as
                                | EstadoCumplimientoAspecto
                                | "",
                          })
                        }
                        className={`${selectClass} ${estadoSelectClass(
                          draft.estadoCumplimiento
                        )}`}
                      >
                        <option value="">Seleccionar</option>
                        <option value="CUMPLIDO">
                          Cumplido
                        </option>
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

                    <BodyCell className="w-[92px] min-w-[92px]">
                      <select
                        value={
                          draft.calificacionAdministrativa ?? ""
                        }
                        disabled={
                          !gestionActiva ||
                          procesando ||
                          draft.estadoCumplimiento ===
                            "NO_APLICA"
                        }
                        onChange={(event) => {
                          const calificacion =
                            event.target.value === ""
                              ? null
                              : Number(
                                  event.target.value
                                );

                          updateDraft(fila, {
                            calificacionAdministrativa:
                              calificacion,
                            estadoCumplimiento:
                              estadoPorCalificacion(
                                calificacion
                              ),
                          });
                        }}
                        className={selectClass}
                      >
                        <option value="">Nota</option>
                        {[0, 3, 5].map(
                          (score) => (
                            <option
                              key={score}
                              value={score}
                            >
                              {score}
                            </option>
                          )
                        )}
                      </select>
                    </BodyCell>

                    <BodyCell className="w-[230px] min-w-[230px]">
                      <textarea
                        rows={2}
                        value={draft.observacion}
                        disabled={
                          !gestionActiva || procesando
                        }
                        onChange={(event) =>
                          updateDraft(fila, {
                            observacion: event.target.value,
                          })
                        }
                        placeholder="Hallazgo y orientación..."
                        className={`${inputClass} min-h-[56px] max-h-32 resize-y leading-4`}
                      />
                    </BodyCell>

                    <BodyCell className="w-[144px] min-w-[144px]">
                      <AppDateField
                        value={draft.fechaDocumento}
                        disabled={
                          !gestionActiva ||
                          procesando ||
                          draft.estadoCumplimiento ===
                            "NO_APLICA"
                        }
                        permiteFechaManual={permiteFechaManual}
                        pending={fechaPendiente}
                        onChange={(value) =>
                          updateDraft(fila, {
                            fechaDocumento: value,
                          })
                        }
                      />
                    </BodyCell>

                    <BodyCell className="w-[150px] min-w-[150px]">
                      <VigenciaBadge
                        detalle={fila.detalleVigencia}
                        fechaDocumentoPendiente={fechaPendiente}
                        fechaDocumentoLocal={
                          draft.fechaDocumento
                        }
                      />
                    </BodyCell>

                    <BodyCell className="w-[220px] min-w-[220px]">
                      <textarea
                        rows={2}
                        value={draft.justificacionNoAplica}
                        disabled={
                          !gestionActiva ||
                          procesando ||
                          draft.estadoCumplimiento !==
                            "NO_APLICA"
                        }
                        onChange={(event) =>
                          updateDraft(fila, {
                            justificacionNoAplica:
                              event.target.value,
                          })
                        }
                        placeholder={
                          draft.estadoCumplimiento ===
                          "NO_APLICA"
                            ? "Justificación obligatoria..."
                            : "Se habilita al marcar No aplica"
                        }
                        className={`${inputClass} min-h-[56px] max-h-32 resize-y leading-4`}
                      />
                    </BodyCell>

                    <BodyCell className="w-[132px] min-w-[132px] text-center">
                      {gestionActiva ? (
                        <button
                          type="button"
                          disabled={
                            procesando || revisionObligatoria
                          }
                          aria-disabled={
                            procesando || revisionObligatoria
                          }
                          aria-pressed={
                            draft.marcadaRevisionTecnica
                          }
                          onClick={() => {
                            if (!revisionObligatoria) {
                              setFilaRevisionSeleccionada(fila);
                            }
                          }}
                          title={
                            revisionObligatoria
                              ? "Revisión obligatoria según la Supermatriz"
                              : draft.marcadaRevisionTecnica
                                ? draft.motivoRevisionTecnica
                                : "Solicitar revisión técnica"
                          }
                          className={`mx-auto flex min-h-9 w-full items-center justify-center gap-1.5 rounded-lg border px-2 text-[9px] font-semibold transition disabled:cursor-not-allowed ${
                            revisionObligatoria
                              ? "border-amber-500/40 bg-amber-500/15 text-amber-200 disabled:opacity-100"
                              : draft.marcadaRevisionTecnica
                                ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 disabled:opacity-45"
                                : "border-neutral-700 bg-[#090a0b] text-neutral-500 hover:text-neutral-300 disabled:opacity-45"
                          }`}
                        >
                          {revisionObligatoria ? (
                            <LockKeyhole size={13} />
                          ) : (
                            <CheckCircle2 size={13} />
                          )}
                          {revisionObligatoria
                            ? "Obligatoria"
                            : draft.marcadaRevisionTecnica
                              ? "Solicitada"
                              : "Solicitar"}
                        </button>
                      ) : fila.ultimaEvaluacion
                          ?.revisionTecnica ? (
                        <RevisionTecnicaEstadoBadge
                          estado={
                            fila.ultimaEvaluacion
                              .revisionTecnica.estado
                          }
                        />
                      ) : fila.ultimaEvaluacion
                          ?.marcadaRevisionTecnica ? (
                        <span className="inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-300">
                          Pendiente
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-600">
                          Sin solicitud
                        </span>
                      )}
                    </BodyCell>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div ref={sentinelRef} className="h-1" />
      </div>

      <div className="border-t border-neutral-800 bg-[#0b0c0d] px-3 py-2 text-[10px] text-neutral-500">
        Desliza horizontalmente para ver más columnas.
      </div>

      <SolicitarRevisionTecnicaModal
        open={filaRevisionSeleccionada !== null}
        aspectoNombre={
          filaRevisionSeleccionada?.aspecto.nombre ?? ""
        }
        observacionConfiguracion={
          filaRevisionSeleccionada?.aspecto
            .configuracionRevision?.observaciones ?? null
        }
        motivoInicial={
          filaRevisionSeleccionada
            ? borradores[
                filaRevisionSeleccionada.aspecto.id
              ]?.motivoRevisionTecnica ?? ""
            : ""
        }
        onClose={() => setFilaRevisionSeleccionada(null)}
        onSave={(motivo) => {
          if (!filaRevisionSeleccionada) return;

          updateDraft(filaRevisionSeleccionada, {
            marcadaRevisionTecnica: true,
            motivoRevisionTecnica: motivo,
          });
          setFilaRevisionSeleccionada(null);
        }}
        onRemove={() => {
          if (!filaRevisionSeleccionada) return;

          updateDraft(filaRevisionSeleccionada, {
            marcadaRevisionTecnica: false,
            motivoRevisionTecnica: "",
          });
          setFilaRevisionSeleccionada(null);
        }}
      />

      <AppToast
        open={Boolean(toast)}
        tone={toast?.tone}
        title={toast?.title ?? ""}
        description={toast?.description}
        onClose={() => setToast(null)}
      />

      <AppConfirmDialog
        open={confirmFinalizarOpen}
        title="Finalizar gestión"
        description={`Se consolidarán las evaluaciones de esta jornada. ${
          modificados.size > 0
            ? `También se guardarán ${modificados.size} cambio(s) pendiente(s). `
            : ""
        }Después de finalizar, la gestión ya no podrá editarse directamente.`}
        confirmLabel="Finalizar gestión"
        busy={procesando}
        onCancel={() => setConfirmFinalizarOpen(false)}
        onConfirm={() => void confirmarFinalizacion()}
      />

      <AppConfirmDialog
        open={filaEliminarSeleccionada !== null}
        title="Quitar evaluación del borrador"
        description={`Se retirará la evaluación guardada de “${
          filaEliminarSeleccionada?.aspecto.nombre ?? "este aspecto"
        }”. La acción quedará auditada y no afecta evaluaciones históricas finalizadas.${
          modificados.size > 0
            ? " Al actualizar la matriz se descartarán también los cambios locales que aún no hayas guardado."
            : ""
        }`}
        confirmLabel="Quitar evaluación"
        busy={eliminandoAspectoId !== null}
        onCancel={() => {
          if (eliminandoAspectoId === null) {
            setFilaEliminarSeleccionada(null);
          }
        }}
        onConfirm={() => void confirmarEliminarEvaluacion()}
      />
    </section>
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
      className={`border-b border-r border-neutral-800 bg-[#08090a] px-2 py-2.5 font-bold ${className}`}
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
      className={`sticky z-50 border-b border-r border-neutral-800 bg-[#08090a] px-2 py-2.5 font-bold ${className}`}
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
      className={`border-b border-r border-neutral-800/80 px-2 py-2 align-top ${className}`}
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
      className={`sticky z-20 border-b border-r border-neutral-800 px-2 py-2 align-top group-hover:bg-[#141516] ${className}`}
    >
      {children}
    </td>
  );
}
