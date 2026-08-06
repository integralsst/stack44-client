import {
  AlertTriangle,
  BarChart3,
  ClipboardCheck,
  FileClock,
  History,
  Plus,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";

import AppModal from "../../../components/ui/AppModal";
import { useAuth } from "../../auth/context/AuthContext";
import CompromisosFinalizacionModal from "../../compromisos/components/finalizacion/CompromisosFinalizacionModal";
import { usePreparacionFinalizacion } from "../../compromisos/hooks/usePreparacionFinalizacion";
import type { CompromisoFinalizacionInput } from "../../compromisos/types/compromiso.types";
import DetalleAspectoDrawer from "../components/detalle/DetalleAspectoDrawer";
import EvaluacionEmpresaHeader from "../components/EvaluacionEmpresaHeader";
import AppAlert from "../components/feedback/AppAlert";
import EvaluacionPageSkeleton from "../components/feedback/EvaluacionPageSkeleton";
import AppSpinner from "../components/feedback/AppSpinner";
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

export default function EvaluacionEmpresaPage() {
  const { empresaId } = useParams<{ empresaId: string }>();
  const navigate = useNavigate();
  const { hasRole } = useAuth();

  const [anio, setAnio] = useState(
    new Date().getFullYear()
  );
  const [gestionModalOpen, setGestionModalOpen] =
    useState(false);
  const [historialModalOpen, setHistorialModalOpen] =
    useState(false);
  const [revisionesModalOpen, setRevisionesModalOpen] =
    useState(false);
  const [resultadosModalOpen, setResultadosModalOpen] =
    useState(false);
  const [informesModalOpen, setInformesModalOpen] =
    useState(false);
  const [tareaDetalleId, setTareaDetalleId] =
    useState<number | null>(null);
  const [revisionCorreccion, setRevisionCorreccion] =
    useState<RevisionTecnicaEvaluacionItem | null>(null);

  const {
    contexto,
    cargando,
    procesando,
    error,
    recargar,
    abrirPeriodo,
    crearGestion,
    guardar,
  } = useEvaluacionEmpresa(empresaId, anio);

  const finalizacionCompromisos =
    usePreparacionFinalizacion();

  const puedeEvaluar = hasRole(
    "PROFESSIONAL",
    "COORDINATOR",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
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
      recargar(),
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

    await finalizacionCompromisos.finalizar(
      gestionId,
      {
        compromisos,
      }
    );
    await recargarDespuesDeFinalizar();
  };

  const prepararFinalizacion = async () => {
    const gestionId = contexto?.gestionActiva?.id;

    if (!gestionId) {
      throw new Error(
        "No hay una gestión en borrador para finalizar."
      );
    }

    const preparacion =
      await finalizacionCompromisos.cargar(gestionId);

    if (!preparacion) {
      throw new Error(
        "No fue posible preparar la finalización."
      );
    }

    if (preparacion.totalNuevos === 0) {
      await completarFinalizacion([]);
    }
  };

  const recargarDespuesDeInvalidar = async () => {
    await Promise.all([
      recargar(),
      revisiones.recargar(),
      resultados.recargar(),
    ]);
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
    if (!contexto?.gestionActiva || !revisionCorreccion) {
      return;
    }

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
          description={
            error ?? "La empresa no está disponible."
          }
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

  const botonRevisionClass = ajustesActivos > 0
    ? "border-red-500/40 bg-red-500/15 text-red-100 ring-2 ring-red-500/15 hover:bg-red-500/20"
    : pendientesRevision > 0
      ? "border-amber-500/25 bg-amber-500/10 text-amber-200 hover:bg-amber-500/15"
      : "border-neutral-700 bg-[#08090a] text-neutral-300 hover:border-cyan-500/40 hover:text-cyan-200";

  return (
    <div className="flex min-h-full w-full min-w-0 max-w-none flex-col gap-3 pb-6">
      <EvaluacionEmpresaHeader
        empresa={contexto.empresa}
        periodo={contexto.periodo}
        anio={anio}
        onAnioChange={setAnio}
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
                    <AppSpinner
                      size="sm"
                      className="text-black"
                    />
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
          <section className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-[#101112] p-3 shadow-xl sm:p-4 lg:flex-row lg:items-center lg:justify-between">
            {contexto.gestionActiva ? (
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-cyan-300 sm:text-[10px]">
                    Gestión en borrador
                  </span>

                  <span className="text-[11px] text-neutral-500 sm:text-xs">
                    {new Date(
                      contexto.gestionActiva.fechaGestion
                    ).toLocaleDateString("es-CO")}
                  </span>
                </div>

                <h2
                  className="mt-1.5 truncate text-sm font-semibold text-white sm:text-base"
                  title={contexto.gestionActiva.tipoActividad}
                >
                  {contexto.gestionActiva.tipoActividad}
                </h2>

                <p className="mt-1 text-[11px] text-neutral-500 sm:text-xs">
                  {contexto.gestionActiva.modalidad.replaceAll(
                    "_",
                    " "
                  )}
                  {contexto.gestionActiva.categoriaGestion
                    ? ` · ${contexto.gestionActiva.categoriaGestion.nombre}`
                    : ""}
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-sm font-semibold text-white sm:text-base">
                  No tienes una gestión en borrador
                </h2>
                <p className="mt-1 text-xs text-neutral-500 sm:text-sm">
                  Crea una visita, asesoría o jornada para registrar nuevas calificaciones.
                </p>
              </div>
            )}

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
              <button
                type="button"
                onClick={() => setResultadosModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-[#08090a] px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-cyan-200 sm:w-auto"
              >
                <BarChart3 size={17} />
                Resultados
              </button>

              <button
                type="button"
                onClick={() => setInformesModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-[#08090a] px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-cyan-200 sm:w-auto"
              >
                <FileClock size={17} />
                Informes
              </button>

              {puedeVerRevisiones && (
                <button
                  type="button"
                  onClick={() => setRevisionesModalOpen(true)}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition sm:w-auto ${botonRevisionClass}`}
                >
                  {ajustesActivos > 0 ? (
                    <AlertTriangle
                      size={17}
                      className="animate-pulse"
                    />
                  ) : (
                    <ShieldCheck size={17} />
                  )}
                  Revisiones técnicas
                  {ajustesActivos > 0 ? (
                    <span className="rounded-full bg-red-300 px-2 py-0.5 text-[10px] font-bold text-red-950">
                      {ajustesActivos} por corregir
                    </span>
                  ) : pendientesRevision > 0 ? (
                    <span className="rounded-full bg-amber-300 px-2 py-0.5 text-[10px] font-bold text-black">
                      {pendientesRevision}
                    </span>
                  ) : null}
                </button>
              )}

              <button
                type="button"
                onClick={() => setHistorialModalOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-[#08090a] px-4 py-2.5 text-sm font-semibold text-neutral-200 transition hover:border-cyan-500/40 hover:bg-cyan-500/5 hover:text-cyan-200 sm:w-auto"
              >
                <History size={17} />
                Historial de gestiones
              </button>

              {!contexto.gestionActiva && puedeEvaluar && (
                <button
                  type="button"
                  onClick={() => {
                    setRevisionCorreccion(null);
                    setGestionModalOpen(true);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-neutral-200 sm:w-auto"
                >
                  <Plus size={17} />
                  Nueva gestión
                </button>
              )}
            </div>
          </section>

          {ajustesActivos > 0 && (
            <div className="flex flex-col gap-3 rounded-2xl border border-red-500/40 bg-red-500/10 p-4 ring-1 ring-red-500/20 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 animate-pulse text-red-300" />
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
                className="flex shrink-0 items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-400"
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

          <MatrizEvaluacion
            filas={contexto.filas}
            gestionActiva={Boolean(contexto.gestionActiva)}
            procesando={
              procesando ||
              finalizacionCompromisos.cargando ||
              finalizacionCompromisos.finalizando
            }
            onGuardar={guardar}
            onFinalizar={prepararFinalizacion}
            onAbrirDetalle={(fila) =>
              setTareaDetalleId(fila.tareaId)
            }
          />
        </>
      )}

      {finalizacionCompromisos.preparacion &&
        finalizacionCompromisos.preparacion.totalNuevos > 0 && (
          <CompromisosFinalizacionModal
            preparacion={
              finalizacionCompromisos.preparacion
            }
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
        onSubmit={crearGestion}
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
        open={tareaDetalleId !== null}
        empresaId={empresaId}
        tareaId={tareaDetalleId}
        anio={anio}
        onClose={() => setTareaDetalleId(null)}
      />
    </div>
  );
}
