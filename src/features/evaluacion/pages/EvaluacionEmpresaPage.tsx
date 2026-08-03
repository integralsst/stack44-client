import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ClipboardCheck,
  History,
  Plus,
} from "lucide-react";

import { useAuth } from "../../auth/context/AuthContext";
import AppModal from "../../../components/ui/AppModal";
import EvaluacionEmpresaHeader from "../components/EvaluacionEmpresaHeader";
import MatrizEvaluacion from "../components/MatrizEvaluacion";
import NuevaGestionModal from "../components/NuevaGestionModal";
import ResumenEvaluacion from "../components/ResumenEvaluacion";
import DetalleAspectoDrawer from "../components/detalle/DetalleAspectoDrawer";
import AppAlert from "../components/feedback/AppAlert";
import AppSpinner from "../components/feedback/AppSpinner";
import HistorialGestionesEmpresa from "../components/gestiones/HistorialGestionesEmpresa";
import EvaluacionPageSkeleton from "../components/feedback/EvaluacionPageSkeleton";
import { useEvaluacionEmpresa } from "../hooks/useEvaluacionEmpresa";

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
  const [tareaDetalleId, setTareaDetalleId] =
    useState<number | null>(null);

  const {
    contexto,
    cargando,
    procesando,
    error,
    recargar,
    abrirPeriodo,
    crearGestion,
    guardar,
    finalizar,
  } = useEvaluacionEmpresa(empresaId, anio);

  const puedeEvaluar = hasRole(
    "PROFESSIONAL",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );

  if (cargando && !contexto) {
    return (
      <EvaluacionPageSkeleton />
    );
  }

  if (!contexto) {
    return (
      <div className="mx-auto w-full max-w-3xl">
        <AppAlert
          tone="error"
          title="No fue posible abrir la evaluación"
          description={
            error ??
            "La empresa no está disponible."
          }
        >
          <button
            type="button"
            onClick={() =>
              navigate("/dashboard/empresas")
            }
            className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:bg-neutral-200"
          >
            Volver a empresas
          </button>
        </AppAlert>
      </div>
    );
  }

  return (
    <div className="flex min-h-full w-full min-w-0 max-w-none flex-col gap-3 pb-6">
      <EvaluacionEmpresaHeader
        empresa={contexto.empresa}
        periodo={contexto.periodo}
        anio={anio}
        onAnioChange={setAnio}
        onVolver={() =>
          navigate("/dashboard/empresas")
        }
      />

      {error && (
        <AppAlert
          tone="error"
          title="No fue posible completar la operación"
          description={error}
        />
      )}

      <ResumenEvaluacion resumen={contexto.resumen} />

      {(contexto.resumen.pendientesVigencia ?? 0) >
        0 && (
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
            Al abrirlo se fijará la versión de la Supermatriz
            que se utilizará para todas las evaluaciones
            históricas de este año.
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
              No existe una versión vigente de la Supermatriz
              aplicable a este año. Publícala primero desde el
              módulo Supermatriz.
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
                  Crea una visita, asesoría o jornada para
                  registrar nuevas calificaciones.
                </p>
              </div>
            )}

            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
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
      onClick={() => setGestionModalOpen(true)}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black transition hover:bg-neutral-200 sm:w-auto"
    >
      <Plus size={17} />
      Nueva gestión
    </button>
  )}
</div>
          </section>

          <MatrizEvaluacion
            filas={contexto.filas}
            gestionActiva={Boolean(
              contexto.gestionActiva
            )}
            procesando={procesando}
            onGuardar={guardar}
            onFinalizar={finalizar}
            onAbrirDetalle={(fila) =>
              setTareaDetalleId(fila.tareaId)
            }
          />

        </>
      )}

      <NuevaGestionModal
        open={gestionModalOpen}
        busy={procesando}
        categorias={contexto.categoriasGestion}
        onClose={() => setGestionModalOpen(false)}
        onSubmit={crearGestion}
      />

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
      onGestionInvalidada={recargar}
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
