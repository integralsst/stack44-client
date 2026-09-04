import {
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  FileText,
  Plus,
  Settings2,
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
import type { GuardarEvaluacionInput } from "../../../types/evaluacion.types";
import { useAuth } from "../../auth/context/AuthContext";
import BitacoraEvaluacionPanel from "../components/BitacoraEvaluacionPanel";
import DetalleAspectoDrawer from "../components/detalle/DetalleAspectoDrawer";
import EvaluacionEmpresaHeader from "../components/EvaluacionEmpresaHeader";
import AppAlert from "../components/feedback/AppAlert";
import AppSpinner from "../components/feedback/AppSpinner";
import EvaluacionPageSkeleton from "../components/feedback/EvaluacionPageSkeleton";
import InformesPeriodoPanel from "../components/informes/InformesPeriodoPanel";
import MatrizEvaluacionDirecta from "../components/MatrizEvaluacionDirecta";
import ResumenEvaluacion from "../components/ResumenEvaluacion";
import ResultadosEvaluacionPanel from "../components/resultados/ResultadosEvaluacionPanel";
import RevisionesTecnicasPeriodo from "../components/revisiones/RevisionesTecnicasPeriodo";
import { useEvaluacionDirectaEmpresa } from "../hooks/useEvaluacionDirectaEmpresa";
import { useInformesPeriodo } from "../hooks/useInformesPeriodo";
import { useResultadosEvaluacion } from "../hooks/useResultadosEvaluacion";
import { useRevisionesTecnicas } from "../hooks/useRevisionesTecnicas";
import type {
  EstadoFlujoRevisionTecnica,
  RevisionTecnicaEvaluacionItem,
} from "../types/revision-tecnica.types";

const ESTADOS_FLUJO_REVISION = new Set<EstadoFlujoRevisionTecnica>([
  "PENDIENTE",
  "APROBADA",
  "REQUIERE_AJUSTES",
  "ANULADA",
  "EN_CORRECCION",
  "SUBSANADA",
]);

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
    "outline-cyan-400",
    "outline-offset-[-2px]",
    "bg-cyan-500/10"
  );

  window.setTimeout(() => {
    row.classList.remove(
      "outline",
      "outline-2",
      "outline-cyan-400",
      "outline-offset-[-2px]",
      "bg-cyan-500/10"
    );
  }, 5000);
}

export default function EvaluacionEmpresaPage() {
  const { empresaId } = useParams<{ empresaId: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { hasRole } = useAuth();

  const anioSolicitado = Number(searchParams.get("anio"));
  const anio =
    Number.isInteger(anioSolicitado) &&
    anioSolicitado >= 2000 &&
    anioSolicitado <= 2100
      ? anioSolicitado
      : new Date().getFullYear();

  const aspectoSolicitado =
    searchParams.get("aspecto")?.trim() || null;
  const compromisoParaRecalificar =
    searchParams.get("compromiso")?.trim() || null;
  const revisionesSolicitadas =
    searchParams.get("revisiones") === "1";
  const revisionIdSolicitada =
    searchParams.get("revisionId")?.trim() || null;
  const revisionEstadoCrudo =
    searchParams.get("revisionEstado")?.trim() || null;
  const revisionEstadoSolicitado =
    revisionEstadoCrudo &&
    ESTADOS_FLUJO_REVISION.has(
      revisionEstadoCrudo as EstadoFlujoRevisionTecnica
    )
      ? (revisionEstadoCrudo as EstadoFlujoRevisionTecnica)
      : undefined;
  const tareaDetalleSolicitada = Number(
    searchParams.get("tareaId")
  );
  const detalleInicial =
    searchParams.get("detalle")?.toUpperCase() === "EVIDENCIAS"
      ? ("EVIDENCIAS" as const)
      : searchParams.get("detalle")?.toUpperCase() === "HISTORIAL"
        ? ("HISTORIAL" as const)
        : ("RESUMEN" as const);

  const [resultadosModalOpen, setResultadosModalOpen] = useState(false);
  const [informesModalOpen, setInformesModalOpen] = useState(false);
  const [revisionesModalOpen, setRevisionesModalOpen] = useState(false);
  const [bitacoraAbierta, setBitacoraAbierta] = useState(false);
  const [tareaDetalleId, setTareaDetalleId] = useState<number | null>(
    () =>
      Number.isInteger(tareaDetalleSolicitada) &&
      tareaDetalleSolicitada > 0
        ? tareaDetalleSolicitada
        : null
  );

  const {
    contexto,
    cargando,
    procesando,
    error,
    recargar,
    abrirPeriodo,
    guardar,
  } = useEvaluacionDirectaEmpresa(empresaId, anio);

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

  const cambiarAnio = (siguienteAnio: number) => {
    const siguientes = new URLSearchParams(searchParams);
    siguientes.set("anio", String(siguienteAnio));
    siguientes.delete("gestionId");
    siguientes.delete("tareaId");
    siguientes.delete("detalle");
    setSearchParams(siguientes);
  };

  const cerrarRevisiones = useCallback(() => {
    setRevisionesModalOpen(false);

    if (
      !searchParams.has("revisiones") &&
      !searchParams.has("revisionEstado") &&
      !searchParams.has("revisionId")
    ) {
      return;
    }

    const siguientes = new URLSearchParams(searchParams);
    siguientes.delete("revisiones");
    siguientes.delete("revisionEstado");
    siguientes.delete("revisionId");
    setSearchParams(siguientes, { replace: true });
  }, [searchParams, setSearchParams]);

  const enfocarRevision = useCallback(
    (revision: RevisionTecnicaEvaluacionItem) => {
      setRevisionesModalOpen(false);
      const siguientes = new URLSearchParams(searchParams);
      siguientes.delete("revisiones");
      siguientes.delete("revisionEstado");
      siguientes.delete("revisionId");
      siguientes.delete("gestionId");
      siguientes.set(
        "aspecto",
        revision.evaluacion.aspecto.nombre
      );
      setSearchParams(siguientes, { replace: true });

      window.setTimeout(() => {
        enfocarAspectoEnMatriz(
          revision.evaluacion.aspecto.nombre
        );
      }, 350);
    },
    [searchParams, setSearchParams]
  );

  const guardarYActualizar = async (
    evaluaciones: GuardarEvaluacionInput[]
  ) => {
    const resultado = await guardar(evaluaciones);
    await Promise.all([
      revisiones.recargar(),
      resultados.recargar(),
    ]);
    return resultado;
  };

  useEffect(() => {
    if (
      contexto?.periodo &&
      puedeVerRevisiones &&
      revisionesSolicitadas
    ) {
      setRevisionesModalOpen(true);
    }
  }, [
    contexto?.periodo,
    puedeVerRevisiones,
    revisionesSolicitadas,
  ]);

  useEffect(() => {
    if (!contexto?.periodo || !aspectoSolicitado) return;

    const timer = window.setTimeout(() => {
      enfocarAspectoEnMatriz(aspectoSolicitado);
    }, 450);

    return () => window.clearTimeout(timer);
  }, [aspectoSolicitado, contexto?.periodo?.id]);

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

      {contexto.periodo && (
        <section className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-[#101112] p-3 shadow-xl lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-bold text-white">
              Operación directa
            </p>
            <p className="mt-1 text-xs leading-5 text-neutral-500">
              No necesitas crear gestiones ni equipos. Califica lo revisado y guarda; cada registro queda inmediatamente en el historial del aspecto.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <ActionButton
              icon={<BarChart3 size={15} />}
              label="Resultados"
              onClick={() => setResultadosModalOpen(true)}
            />
            <ActionButton
              icon={<FileText size={15} />}
              label="Informes"
              onClick={() => setInformesModalOpen(true)}
            />
            {puedeVerRevisiones && (
              <ActionButton
                icon={<Wrench size={15} />}
                label={
                  ajustesActivos + pendientesRevision > 0
                    ? `Revisiones (${ajustesActivos + pendientesRevision})`
                    : "Revisiones"
                }
                onClick={() => setRevisionesModalOpen(true)}
              />
            )}
            {puedeEvaluar && (
              <>
                <ActionButton
                  icon={<ClipboardList size={15} />}
                  label={bitacoraAbierta ? "Colapsar Bitácora" : "Abrir Bitácora"}
                  active={bitacoraAbierta}
                  onClick={() => setBitacoraAbierta((actual) => !actual)}
                />
                <ActionButton
                  icon={<Settings2 size={15} />}
                  label="Controles"
                  onClick={() =>
                    navigate(
                      `/dashboard/empresas/${contexto.empresa.id}/evaluacion/controles?anio=${anio}`
                    )
                  }
                />
              </>
            )}
          </div>
        </section>
      )}

      <div
        className={
          contexto.periodo && puedeEvaluar
            ? `grid min-w-0 gap-3 ${
                bitacoraAbierta
                  ? "xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.85fr)]"
                  : "grid-cols-1"
              }`
            : "min-w-0"
        }
      >
        <main className="min-w-0 space-y-3">
          {aspectoSolicitado && compromisoParaRecalificar && puedeEvaluar && (
            <AppAlert
              tone="warning"
              title={`Recalificación pendiente: ${aspectoSolicitado}`}
              description="Ubica el aspecto resaltado, registra la nueva calificación y guarda. No necesitas crear ni finalizar una gestión."
            />
          )}

          {(contexto.resumen.pendientesVigencia ?? 0) > 0 && (
            <AppAlert
              tone="warning"
              title="Hay información pendiente para calcular vigencias"
              description={`${contexto.resumen.pendientesVigencia} aspecto(s) requieren fecha del documento o completar su periodicidad en la Supermatriz.`}
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
                Al abrir el periodo podrás registrar evaluaciones. La versión de la Supermatriz se resolverá según la fecha efectiva de cada evaluación.
              </p>

              {contexto.versionDisponible ? (
                <div className="mt-5">
                  <p className="mb-3 text-xs text-neutral-500">
                    Versión disponible hoy:{" "}
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
                  No existe una versión vigente de la Supermatriz aplicable. Publícala primero desde Supermatriz.
                </div>
              )}
            </section>
          ) : (
            <>
              {ajustesActivos > 0 && (
                <AppAlert
                  tone="warning"
                  title={`${ajustesActivos} evaluación(es) requieren corrección técnica`}
                  description="Abre Revisiones, consulta el concepto y registra directamente una nueva evaluación del aspecto. La evaluación anterior permanecerá intacta."
                >
                  <button
                    type="button"
                    onClick={() => setRevisionesModalOpen(true)}
                    className="rounded-xl bg-amber-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-amber-800"
                  >
                    Ver revisiones
                  </button>
                </AppAlert>
              )}

              <MatrizEvaluacionDirecta
                filas={contexto.filas}
                editable={puedeEvaluar && contexto.periodo.estado === "ABIERTO"}
                procesando={procesando}
                onGuardar={guardarYActualizar}
                onAbrirDetalle={(fila) =>
                  setTareaDetalleId(fila.tareaId)
                }
              />
            </>
          )}
        </main>

        {contexto.periodo && puedeEvaluar && (
          <div
            className={`${bitacoraAbierta ? "block" : "hidden"} min-w-0 xl:sticky xl:top-3 xl:self-start`}
          >
            <BitacoraEvaluacionPanel
              empresaId={contexto.empresa.id}
              empresaNombre={contexto.empresa.nombre}
              onClose={() => setBitacoraAbierta(false)}
              onEvaluacionesAplicadas={async () => {
                await recargar(false);
              }}
            />
          </div>
        )}
      </div>

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

      {contexto.periodo && puedeVerRevisiones && (
        <AppModal
          open={revisionesModalOpen}
          title={`Revisiones técnicas · ${anio}`}
          description={`Consulta y resuelve las evaluaciones de ${contexto.empresa.nombre} que requieren validación técnica.`}
          onClose={() => {
            if (!revisiones.procesando) {
              cerrarRevisiones();
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
            initialFilter={revisionEstadoSolicitado}
            initialRevisionId={revisionIdSolicitada}
            onReload={revisiones.recargar}
            onResolve={revisiones.resolver}
            onCorregir={enfocarRevision}
            onResolved={async () => {
              await recargar(false);
            }}
          />
        </AppModal>
      )}

      <DetalleAspectoDrawer
        key={`${tareaDetalleId ?? "closed"}:${detalleInicial}`}
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
            const siguientes = new URLSearchParams(searchParams);
            siguientes.delete("tareaId");
            siguientes.delete("detalle");
            setSearchParams(siguientes, { replace: true });
          }
        }}
      />
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active || undefined}
      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2.5 text-xs font-semibold transition ${
        active
          ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-200"
          : "border-neutral-700 bg-[#0a0b0c] text-neutral-200 hover:border-cyan-500/40 hover:text-cyan-200"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}