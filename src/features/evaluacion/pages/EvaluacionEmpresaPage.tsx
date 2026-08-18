import {
  ClipboardCheck,
  Plus,
  Wrench,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import AppModal from "../../../components/ui/AppModal";
import type { CrearGestionInput } from "../../../types/evaluacion.types";
import { useAuth } from "../../auth/context/AuthContext";
import CompromisosFinalizacionModal from "../../compromisos/components/finalizacion/CompromisosFinalizacionModal";
import { usePreparacionFinalizacion } from "../../compromisos/hooks/usePreparacionFinalizacion";
import { notificarCambioCompromisos } from "../../compromisos/lib/alertas-compromisos.events";
import type { CompromisoFinalizacionInput } from "../../compromisos/types/compromiso.types";
import DetalleAspectoDrawer from "../components/detalle/DetalleAspectoDrawer";
import EvaluacionEmpresaHeader from "../components/EvaluacionEmpresaHeader";
import AppAlert from "../components/feedback/AppAlert";
import AppSpinner from "../components/feedback/AppSpinner";
import EvaluacionPageSkeleton from "../components/feedback/EvaluacionPageSkeleton";
import EvaluacionTransitionOverlay from "../components/feedback/EvaluacionTransitionOverlay";
import EquipoGestionModal from "../components/gestiones/EquipoGestionModal";
import GestionWorkspacePanel from "../components/gestiones/GestionWorkspacePanel";
import HistorialGestionesEmpresa from "../components/gestiones/HistorialGestionesEmpresa";
import InformesPeriodoPanel from "../components/informes/InformesPeriodoPanel";
import MatrizEvaluacion from "../components/MatrizEvaluacion";
import NuevaGestionModal from "../components/NuevaGestionModal";
import ResumenEvaluacion from "../components/ResumenEvaluacion";
import ResultadosEvaluacionPanel from "../components/resultados/ResultadosEvaluacionPanel";
import RevisionesTecnicasPeriodo from "../components/revisiones/RevisionesTecnicasPeriodo";
import { useEvaluacionEmpresa } from "../hooks/useEvaluacionEmpresa";
import { useInformesPeriodo } from "../hooks/useInformesPeriodo";
import { useResultadosEvaluacion } from "../hooks/useResultadosEvaluacion";
import { useRevisionesTecnicas } from "../hooks/useRevisionesTecnicas";
import type { RevisionTecnicaEvaluacionItem } from "../types/revision-tecnica.types";

type EtapaFinalizacion =
  | "PREPARANDO"
  | "FINALIZANDO"
  | "ACTUALIZANDO"
  | null;

function enfocarAspectoEnMatriz(aspectoNombre: string) {
  const title = `Abrir detalle de ${aspectoNombre}`;
  const button = Array.from(
    document.querySelectorAll<HTMLButtonElement>("button[title]")
  ).find((item) => item.title === title);
  const row = button?.closest("tr");

  if (!row) return;

  row.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });
  row.classList.add(
    "outline",
    "outline-2",
    "outline-red-400",
    "outline-offset-[-2px]",
    "bg-red-500/10"
  );

  window.setTimeout(() => {
    row.classList.remove(
      "outline",
      "outline-2",
      "outline-red-400",
      "outline-offset-[-2px]",
      "bg-red-500/10"
    );
  }, 6000);
}

async function esperarPintadoInterfaz(): Promise<void> {
  if (typeof window === "undefined") return;

  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => resolve());
    });
  });
}

export default function EvaluacionEmpresaPage() {
  const { empresaId } = useParams<{ empresaId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasRole, user } = useAuth();
  const anioSolicitado = Number(searchParams.get("anio"));
  const gestionIdSolicitada =
    searchParams.get("gestionId")?.trim() || null;
  const aspectoSolicitado =
    searchParams.get("aspecto")?.trim() || null;
  const compromisoParaRecalificar =
    searchParams.get("compromiso")?.trim() || null;
  const aspectoParaRecalificar =
    compromisoParaRecalificar ? aspectoSolicitado : null;
  const tareaDetalleSolicitada = Number(
    searchParams.get("tareaId")
  );
  const detalleInicial =
    searchParams.get("detalle")?.toUpperCase() === "EVIDENCIAS"
      ? ("EVIDENCIAS" as const)
      : ("RESUMEN" as const);
  const anio =
    Number.isInteger(anioSolicitado) &&
    anioSolicitado >= 2000 &&
    anioSolicitado <= 2100
      ? anioSolicitado
      : new Date().getFullYear();

  const cambiarAnio = (siguienteAnio: number) => {
    const siguientesParametros = new URLSearchParams(searchParams);
    siguientesParametros.set("anio", String(siguienteAnio));
    siguientesParametros.delete("gestionId");
    setSearchParams(siguientesParametros);
  };

  const seleccionarGestion = (gestionId: string) => {
    if (!gestionId) return;

    const siguientesParametros = new URLSearchParams(searchParams);
    siguientesParametros.set("gestionId", gestionId);
    siguientesParametros.delete("aspecto");
    siguientesParametros.delete("compromiso");
    siguientesParametros.delete("tareaId");
    siguientesParametros.delete("detalle");
    setSearchParams(siguientesParametros);
  };

  const [gestionModalOpen, setGestionModalOpen] = useState(false);
  const [equipoModalOpen, setEquipoModalOpen] = useState(false);
  const [historialModalOpen, setHistorialModalOpen] = useState(false);
  const [revisionesModalOpen, setRevisionesModalOpen] = useState(false);
  const [resultadosModalOpen, setResultadosModalOpen] = useState(false);
  const [informesModalOpen, setInformesModalOpen] = useState(false);
  const [tareaDetalleId, setTareaDetalleId] = useState<number | null>(
    () =>
      Number.isInteger(tareaDetalleSolicitada) &&
      tareaDetalleSolicitada > 0
        ? tareaDetalleSolicitada
        : null
  );
  const [revisionCorreccion, setRevisionCorreccion] =
    useState<RevisionTecnicaEvaluacionItem | null>(null);
  const [etapaFinalizacion, setEtapaFinalizacion] =
    useState<EtapaFinalizacion>(null);

  const {
    contexto,
    cargando,
    procesando,
    error,
    recargar,
    abrirPeriodo,
    crearGestion,
    guardar,
  } = useEvaluacionEmpresa(
    empresaId,
    anio,
    gestionIdSolicitada
  );

  const finalizacionCompromisos = usePreparacionFinalizacion();

  const cambiandoBorrador = Boolean(
    contexto &&
      cargando &&
      gestionIdSolicitada &&
      gestionIdSolicitada !== contexto.gestionActiva?.id
  );
  const transicionFinalizacion = etapaFinalizacion !== null;
  const interfazBloqueada =
    procesando || cambiandoBorrador || transicionFinalizacion;

  const puedeEvaluar = hasRole(
    "PROFESSIONAL",
    "COORDINATOR",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );
  const esAdministradorEvaluacion = hasRole(
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );

  const tieneBorradorPropio = Boolean(
    user &&
      contexto?.gestionesActivas.some(
        (gestion) => gestion.usuarioCreador.id === user.id
      )
  );
  const puedeCrearGestionPropia =
    puedeEvaluar && !tieneBorradorPropio;

  const puedeEditarGestionActiva = Boolean(
    contexto?.gestionActiva &&
      (esAdministradorEvaluacion ||
        contexto.gestionActiva.participacionActual?.puedeEvaluar)
  );
  const puedeFinalizarGestionActiva = Boolean(
    contexto?.gestionActiva &&
      (esAdministradorEvaluacion ||
        contexto.gestionActiva.participacionActual?.esLider)
  );

  const puedeVerRevisiones = hasRole(
    "PROFESSIONAL",
    "COORDINATOR",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );

  const revisiones = useRevisionesTecnicas(
    puedeVerRevisiones ? contexto?.periodo?.id : null
  );
  const resultados = useResultadosEvaluacion(
    empresaId,
    anio,
    resultadosModalOpen && Boolean(contexto?.periodo)
  );
  const informes = useInformesPeriodo(
    empresaId,
    anio,
    informesModalOpen && Boolean(contexto?.periodo)
  );

  const recargarDespuesDeFinalizar = async () => {
    await Promise.all([
      recargar({
        gestionId: null,
        mostrarCarga: false,
      }),
      revisiones.recargar(),
      resultados.recargar(),
    ]);
  };

  const completarFinalizacion = async (
    compromisos: CompromisoFinalizacionInput[]
  ) => {
    const gestionId = contexto?.gestionActiva?.id;

    if (!gestionId) {
      throw new Error(
        "No hay una gestión en borrador para finalizar."
      );
    }

    setEtapaFinalizacion("FINALIZANDO");

    try {
      await finalizacionCompromisos.finalizar(
        gestionId,
        { compromisos }
      );

      setEtapaFinalizacion("ACTUALIZANDO");
      await recargarDespuesDeFinalizar();

      const siguientesParametros =
        new URLSearchParams(searchParams);
      siguientesParametros.delete("gestionId");
      siguientesParametros.delete("compromiso");
      siguientesParametros.delete("aspecto");
      siguientesParametros.delete("tareaId");
      siguientesParametros.delete("detalle");
      setSearchParams(siguientesParametros, {
        replace: true,
      });

      notificarCambioCompromisos();
      await esperarPintadoInterfaz();
    } finally {
      setEtapaFinalizacion(null);
    }
  };

  const prepararFinalizacion = async () => {
    const gestionId = contexto?.gestionActiva?.id;

    if (!gestionId) {
      throw new Error(
        "No hay una gestión en borrador para finalizar."
      );
    }

    if (!puedeFinalizarGestionActiva) {
      throw new Error(
        "Solo el líder de la gestión puede preparar y ejecutar la finalización."
      );
    }

    setEtapaFinalizacion("PREPARANDO");

    try {
      const preparacion =
        await finalizacionCompromisos.cargar(gestionId);

      if (!preparacion) {
        throw new Error(
          "No fue posible preparar la finalización."
        );
      }

      if (preparacion.totalNuevos === 0) {
        await completarFinalizacion([]);
        return;
      }

      setEtapaFinalizacion(null);
    } catch (currentError) {
      setEtapaFinalizacion(null);
      throw currentError;
    }
  };

  const recargarDespuesDeInvalidar = async () => {
    const siguientesParametros = new URLSearchParams(searchParams);
    siguientesParametros.delete("gestionId");
    setSearchParams(siguientesParametros, {
      replace: true,
    });

    await Promise.all([
      recargar({ gestionId: null }),
      revisiones.recargar(),
      resultados.recargar(),
    ]);
    notificarCambioCompromisos();
  };

  const crearGestionYSeleccionar = async (
    data: CrearGestionInput
  ): Promise<void> => {
    const creada = await crearGestion(data);
    if (!creada?.id) return;

    const siguientesParametros = new URLSearchParams(searchParams);
    siguientesParametros.set("gestionId", creada.id);
    siguientesParametros.delete("aspecto");
    siguientesParametros.delete("compromiso");
    siguientesParametros.delete("tareaId");
    siguientesParametros.delete("detalle");
    setSearchParams(siguientesParametros, {
      replace: true,
    });
  };

  const enfocarRevision = useCallback(
    (revision: RevisionTecnicaEvaluacionItem) => {
      setRevisionCorreccion(revision);
      setRevisionesModalOpen(false);

      if (!contexto?.gestionActiva) {
        setGestionModalOpen(true);
        return;
      }

      window.setTimeout(() => {
        enfocarAspectoEnMatriz(
          revision.evaluacion.aspecto.nombre
        );
      }, 200);
    },
    [contexto?.gestionActiva]
  );

  useEffect(() => {
    if (!contexto?.gestionActiva || gestionIdSolicitada) {
      return;
    }

    const siguientesParametros = new URLSearchParams(searchParams);
    siguientesParametros.set(
      "gestionId",
      contexto.gestionActiva.id
    );
    setSearchParams(siguientesParametros, {
      replace: true,
    });
  }, [
    contexto?.gestionActiva,
    gestionIdSolicitada,
    searchParams,
    setSearchParams,
  ]);

  useEffect(() => {
    if (!contexto?.periodo || !aspectoSolicitado) return;

    const timer = window.setTimeout(() => {
      enfocarAspectoEnMatriz(aspectoSolicitado);
    }, 500);

    return () => window.clearTimeout(timer);
  }, [
    aspectoSolicitado,
    contexto?.periodo?.id,
    contexto?.gestionActiva?.id,
  ]);

  useEffect(() => {
    if (!contexto?.gestionActiva || !revisionCorreccion) return;

    const timer = window.setTimeout(() => {
      enfocarAspectoEnMatriz(
        revisionCorreccion.evaluacion.aspecto.nombre
      );
    }, 450);

    return () => window.clearTimeout(timer);
  }, [contexto?.gestionActiva, revisionCorreccion]);

  if (cargando && !contexto) {
    return <EvaluacionPageSkeleton />;
  }

  if (!contexto) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <AppAlert
          tone="error"
          title="No fue posible abrir la evaluación"
          description={error ?? "La empresa no está disponible."}
        >
          <button
            type="button"
            onClick={() => navigate("/dashboard/empresas")}
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-neutral-200"
          >
            Volver a empresas
          </button>
        </AppAlert>
      </div>
    );
  }

  const ajustesActivos =
    revisiones.data?.resumen.requierenAjustesActivos ?? 0;
  const pendientesRevision =
    revisiones.data?.resumen.pendientes ?? 0;
  const enCorreccion =
    revisiones.data?.resumen.enCorreccion ?? 0;

  const tituloTransicion =
    etapaFinalizacion === "FINALIZANDO"
      ? "Finalizando gestión"
      : etapaFinalizacion === "ACTUALIZANDO"
        ? "Actualizando evaluación"
        : "Preparando finalización";
  const descripcionTransicion =
    etapaFinalizacion === "FINALIZANDO"
      ? "Estamos consolidando evaluaciones, compromisos y trazabilidad. No cierres esta ventana hasta terminar."
      : etapaFinalizacion === "ACTUALIZANDO"
        ? "El cierre ya fue registrado. Estamos actualizando el borrador activo, resultados y acciones para mostrarte el estado final correcto."
        : "Estamos verificando si esta gestión requiere compromisos antes de completar el cierre.";

  return (
    <div className="flex min-h-full w-full min-w-0 max-w-none flex-col gap-3 pb-6">
      <EvaluacionEmpresaHeader
        empresa={contexto.empresa}
        periodo={contexto.periodo}
        anio={anio}
        onAnioChange={cambiarAnio}
        onVolver={() => navigate("/dashboard/empresas")}
      />

      {error && (
        <AppAlert
          tone="error"
          title="No fue posible completar la operación"
          description={error}
        />
      )}

      <ResumenEvaluacion resumen={contexto.resumen} />

      {aspectoParaRecalificar && puedeEvaluar && (
        <AppAlert
          tone="warning"
          title={`Recalificación pendiente: ${aspectoParaRecalificar}`}
          description={
            contexto.gestionActiva
              ? "Ya tienes una gestión en borrador. Ve directamente al aspecto, registra la nueva calificación en 5 y finaliza la gestión."
              : "Crea una nueva gestión de seguimiento; después la aplicación resaltará el aspecto exacto que debes recalificar en 5."
          }
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={() => {
                if (contexto.gestionActiva) {
                  enfocarAspectoEnMatriz(
                    aspectoParaRecalificar
                  );
                } else {
                  setGestionModalOpen(true);
                }
              }}
              className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-800"
            >
              {contexto.gestionActiva
                ? "Ir al aspecto"
                : "Crear gestión para recalificar"}
            </button>
            {compromisoParaRecalificar && (
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/dashboard/compromisos/${compromisoParaRecalificar}`
                  )
                }
                className="rounded-xl border border-amber-300 bg-white px-4 py-2 text-sm font-bold text-amber-900 transition hover:bg-amber-50"
              >
                Ver compromiso
              </button>
            )}
          </div>
        </AppAlert>
      )}

      {(contexto.resumen.pendientesVigencia ?? 0) > 0 && (
        <AppAlert
          tone="warning"
          title="Hay información pendiente para calcular vigencias"
          description={`${contexto.resumen.pendientesVigencia} aspecto(s) finalizado(s) requieren fecha del documento o completar su periodicidad en la Supermatriz.`}
        />
      )}

      {!contexto.periodo ? (
        <section className="rounded-2xl border border-neutral-800 bg-[#101112] p-5 text-center shadow-xl sm:p-6">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">
            <ClipboardCheck size={21} />
          </div>
          <h2 className="mt-4 text-lg font-bold text-white">
            El periodo {anio} todavía no está abierto
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-neutral-400">
            Al abrirlo se fijará la versión de la Supermatriz que se utilizará para todas las evaluaciones históricas de este año.
          </p>

          {contexto.versionDisponible ? (
            <div className="mt-5">
              <p className="mb-3 text-xs text-neutral-500">
                Versión disponible:{" "}
                <strong className="text-neutral-300">
                  {contexto.versionDisponible.nombre}
                </strong>
              </p>
              {puedeEvaluar && (
                <button
                  type="button"
                  onClick={() => void abrirPeriodo()}
                  disabled={procesando}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition hover:bg-neutral-200 disabled:opacity-50"
                >
                  {procesando ? (
                    <AppSpinner size="sm" className="text-black" />
                  ) : (
                    <Plus size={17} />
                  )}
                  Abrir periodo {anio}
                </button>
              )}
            </div>
          ) : (
            <div className="mx-auto mt-5 max-w-xl rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              No existe una versión vigente de la Supermatriz aplicable a este año. Publícala primero desde el módulo Supermatriz.
            </div>
          )}
        </section>
      ) : (
        <>
          <GestionWorkspacePanel
            gestiones={contexto.gestionesActivas}
            gestionActiva={contexto.gestionActiva}
            bloqueado={interfazBloqueada}
            cambiandoBorrador={cambiandoBorrador}
            puedeEvaluar={puedeEvaluar}
            puedeVerRevisiones={puedeVerRevisiones}
            puedeCrearGestionPropia={puedeCrearGestionPropia}
            ajustesActivos={ajustesActivos}
            pendientesRevision={pendientesRevision}
            onSeleccionarGestion={seleccionarGestion}
            onResultados={() => setResultadosModalOpen(true)}
            onInformes={() => setInformesModalOpen(true)}
            onEquipo={() => setEquipoModalOpen(true)}
            onRevisiones={() => setRevisionesModalOpen(true)}
            onHistorial={() => setHistorialModalOpen(true)}
            onNuevaGestion={() => {
              setRevisionCorreccion(null);
              setGestionModalOpen(true);
            }}
          />

          {contexto.gestionActiva &&
            puedeEvaluar &&
            !puedeEditarGestionActiva && (
              <AppAlert
                tone="info"
                title="Participación en modo consulta"
                description="Formas parte de esta gestión, pero tu participación actual no permite registrar evaluaciones. El líder puede habilitar ese permiso desde Equipo de gestión."
              />
            )}

          {contexto.gestionActiva &&
            puedeEditarGestionActiva &&
            !puedeFinalizarGestionActiva && (
              <AppAlert
                tone="info"
                title="Puedes evaluar, pero no cerrar la gestión"
                description="Los participantes pueden trabajar sobre el mismo borrador. La preparación y finalización permanecen reservadas al líder de la gestión."
              />
            )}

          {ajustesActivos > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 ring-1 ring-red-500/20 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <div className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-red-300/20" />
                <div>
                  <p className="text-sm font-bold text-red-100">
                    Hay {ajustesActivos} evaluación(es) que requieren corrección
                  </p>
                  <p className="mt-1 text-xs leading-5 text-red-200/75">
                    Revisa el concepto técnico y registra una nueva evaluación. La gestión original permanecerá intacta.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRevisionesModalOpen(true)}
                disabled={interfazBloqueada}
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Wrench size={16} />
                Ver y corregir
              </button>
            </div>
          )}

          {enCorreccion > 0 && ajustesActivos === 0 && (
            <AppAlert
              tone="info"
              title={`${enCorreccion} revisión(es) están en corrección`}
              description="Finaliza la nueva evaluación para que dejen de aparecer como una acción activa y queden registradas como subsanadas."
            />
          )}

          <div
            className={
              puedeFinalizarGestionActiva
                ? undefined
                : "matriz-sin-finalizacion"
            }
          >
            <MatrizEvaluacion
              filas={contexto.filas}
              gestionActiva={puedeEditarGestionActiva}
              procesando={interfazBloqueada}
              onGuardar={guardar}
              onFinalizar={prepararFinalizacion}
              onAbrirDetalle={(fila) =>
                setTareaDetalleId(fila.tareaId)
              }
            />
          </div>
          <style>{`.matriz-sin-finalizacion [data-action="finalizar"] { display: none !important; }`}</style>
        </>
      )}

      {finalizacionCompromisos.preparacion &&
        finalizacionCompromisos.preparacion.totalNuevos > 0 && (
          <CompromisosFinalizacionModal
            preparacion={finalizacionCompromisos.preparacion}
            busy={finalizacionCompromisos.finalizando}
            error={finalizacionCompromisos.error}
            onClose={finalizacionCompromisos.limpiar}
            onSubmit={completarFinalizacion}
          />
        )}

      <NuevaGestionModal
        open={gestionModalOpen}
        busy={procesando}
        categorias={contexto.categoriasGestion}
        initialValues={
          revisionCorreccion
            ? {
                modalidad: "SEGUIMIENTO_PUNTUAL",
                tipoActividad: `Corrección técnica · ${revisionCorreccion.evaluacion.aspecto.nombre}`,
                categoriaGestionId:
                  revisionCorreccion.evaluacion.gestion
                    .categoriaGestion?.id ?? null,
                observacionGeneral: `Corrección solicitada mediante revisión técnica.\n\nConcepto: ${revisionCorreccion.conceptoTecnico ?? "Pendiente de corrección."}`,
              }
            : aspectoParaRecalificar
              ? {
                  modalidad: "SEGUIMIENTO_PUNTUAL",
                  tipoActividad: `Recalificación de compromiso · ${aspectoParaRecalificar}`,
                  categoriaGestionId: null,
                  observacionGeneral:
                    "Seguimiento para verificar el cumplimiento del compromiso y registrar la calificación posterior.",
                }
              : null
        }
        correctionContext={
          revisionCorreccion
            ? {
                aspectoNombre:
                  revisionCorreccion.evaluacion.aspecto.nombre,
                conceptoTecnico:
                  revisionCorreccion.conceptoTecnico,
              }
            : null
        }
        onClose={() => setGestionModalOpen(false)}
        onSubmit={crearGestionYSeleccionar}
      />

      <EquipoGestionModal
        open={equipoModalOpen}
        gestionId={contexto.gestionActiva?.id ?? null}
        gestionNombre={
          contexto.gestionActiva?.tipoActividad ?? "Gestión SG-SST"
        }
        onClose={() => setEquipoModalOpen(false)}
        onChanged={recargar}
      />

      {contexto.periodo && (
        <AppModal
          open={resultadosModalOpen}
          title={`Resultados de evaluación · ${anio}`}
          description={`Consolidado oficial de ${contexto.empresa.nombre} por empresa, proceso y estándar.`}
          onClose={() => setResultadosModalOpen(false)}
          size="2xl"
        >
          <ResultadosEvaluacionPanel
            data={resultados.data}
            grupo={resultados.grupo}
            cargando={resultados.cargando}
            error={resultados.error}
            onGrupoChange={resultados.setGrupo}
            onReload={resultados.recargar}
          />
        </AppModal>
      )}

      {contexto.periodo && (
        <AppModal
          open={informesModalOpen}
          title={`Informes enero a diciembre · ${anio}`}
          description={`Crea y consulta fotografías históricas de ${contexto.empresa.nombre} sin cerrar ni bloquear el periodo.`}
          onClose={() => {
            if (!informes.procesando) {
              informes.cerrarDetalle();
              setInformesModalOpen(false);
            }
          }}
          busy={informes.procesando}
          size="2xl"
        >
          <InformesPeriodoPanel
            anio={anio}
            data={informes.data}
            detalle={informes.detalle}
            cargando={informes.cargando}
            cargandoDetalle={informes.cargandoDetalle}
            procesando={informes.procesando}
            error={informes.error}
            puedeGenerar={puedeEvaluar}
            onReload={informes.recargar}
            onGenerate={async (input) =>
              Boolean(await informes.generar(input))
            }
            onOpen={informes.abrirDetalle}
            onCloseDetail={informes.cerrarDetalle}
          />
        </AppModal>
      )}

      {contexto.periodo && (
        <AppModal
          open={historialModalOpen}
          title={`Historial de gestiones · ${anio}`}
          description={`Consulta las visitas, asesorías y jornadas realizadas para ${contexto.empresa.nombre}. Desde aquí también puedes invalidar una gestión completamente equivocada.`}
          onClose={() => setHistorialModalOpen(false)}
          size="2xl"
        >
          <HistorialGestionesEmpresa
            periodoId={contexto.periodo.id}
            onGestionInvalidada={recargarDespuesDeInvalidar}
          />
        </AppModal>
      )}

      {contexto.periodo && puedeVerRevisiones && (
        <AppModal
          open={revisionesModalOpen}
          title={`Revisiones técnicas · ${anio}`}
          description={`Consulta, resuelve y corrige las evaluaciones de ${contexto.empresa.nombre} que requieren validación técnica.`}
          onClose={() => {
            if (!revisiones.procesando) {
              setRevisionesModalOpen(false);
            }
          }}
          busy={revisiones.procesando}
          size="2xl"
        >
          <RevisionesTecnicasPeriodo
            data={revisiones.data}
            cargando={revisiones.cargando}
            procesando={revisiones.procesando}
            error={revisiones.error}
            onReload={revisiones.recargar}
            onResolve={revisiones.resolver}
            onCorregir={enfocarRevision}
            onResolved={recargar}
          />
        </AppModal>
      )}

      <DetalleAspectoDrawer
        key={`${contexto.gestionActiva?.id ?? "sin-gestion"}:${tareaDetalleId ?? "closed"}:${detalleInicial}`}
        open={tareaDetalleId !== null}
        empresaId={empresaId}
        tareaId={tareaDetalleId}
        anio={anio}
        initialTab={detalleInicial}
        onClose={() => {
          setTareaDetalleId(null);

          if (
            searchParams.has("tareaId") ||
            searchParams.has("detalle")
          ) {
            const siguientesParametros =
              new URLSearchParams(searchParams);
            siguientesParametros.delete("tareaId");
            siguientesParametros.delete("detalle");
            setSearchParams(siguientesParametros, {
              replace: true,
            });
          }
        }}
      />

      <EvaluacionTransitionOverlay
        open={cambiandoBorrador}
        title="Cambiando de borrador"
        description="Estamos cargando la gestión seleccionada y sus evaluaciones. Tus borradores permanecen separados."
      />

      <EvaluacionTransitionOverlay
        open={!cambiandoBorrador && transicionFinalizacion}
        title={tituloTransicion}
        description={descripcionTransicion}
      />
    </div>
  );
}
