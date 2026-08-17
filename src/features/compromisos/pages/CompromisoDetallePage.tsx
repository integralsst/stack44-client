import {
  useCallback,
} from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import CompromisoDetalleResumen from "../components/detalle/CompromisoDetalleResumen";
import AdministracionCompromisoPanel from "../components/detalle/AdministracionCompromisoPanel";
import AsignacionCompromisoPanel from "../components/detalle/AsignacionCompromisoPanel";
import CierreCompromisoPanel from "../components/detalle/CierreCompromisoPanel";
import CompromisoProgreso from "../components/detalle/CompromisoProgreso";
import CompromisoResponsables from "../components/detalle/CompromisoResponsables";
import CompromisoRutaTrabajo from "../components/detalle/CompromisoRutaTrabajo";
import CompromisoTrazabilidad from "../components/detalle/CompromisoTrazabilidad";
import RegistroAvanceCompromiso from "../components/detalle/RegistroAvanceCompromiso";
import AppToast from "../../evaluacion/components/feedback/AppToast";
import { useAdministracionCompromiso } from "../hooks/useAdministracionCompromiso";
import { useCompromisoDetalle } from "../hooks/useCompromisoDetalle";
import { useOperacionesCompromiso } from "../hooks/useOperacionesCompromiso";

export default function CompromisoDetallePage() {
  const { compromisoId = "" } =
    useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const detalle =
    useCompromisoDetalle(compromisoId);
  const administracion =
    useAdministracionCompromiso(compromisoId);
  const recargarTodo = useCallback(async () => {
    await Promise.all([
      detalle.recargar(),
      administracion.recargar(),
    ]);
  }, [administracion.recargar, detalle.recargar]);
  const operaciones = useOperacionesCompromiso(
    compromisoId,
    recargarTodo
  );
  const actualizando =
    detalle.cargando || administracion.cargando;

  const volverA =
    location.pathname.startsWith(
      "/dashboard/mis-compromisos"
    )
      ? "/dashboard/mis-compromisos"
      : "/dashboard/compromisos";

  if (detalle.cargando && !detalle.data) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
      </div>
    );
  }

  if (!detalle.data) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-red-50 p-5 text-red-800">
        <h1 className="font-bold">
          No fue posible abrir el compromiso
        </h1>
        <p className="mt-2 text-sm">
          {detalle.error ??
            "El registro no existe o no está dentro de tu alcance."}
        </p>
        <button
          type="button"
          onClick={() => navigate(volverA)}
          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-800"
        >
          Volver
        </button>
      </div>
    );
  }

  const abrirAspectoEnMatriz = () => {
    const parametros = new URLSearchParams();
    const anioOrigen = Number(
      detalle.data.gestionOrigen.fechaGestion.slice(0, 4)
    );

    if (Number.isInteger(anioOrigen)) {
      parametros.set("anio", String(anioOrigen));
    }

    parametros.set("aspecto", detalle.data.aspecto.nombre);

    navigate(
      `/dashboard/empresas/${detalle.data.empresa.id}/evaluacion?${parametros.toString()}`
    );
  };

  return (
    <div className="flex w-full flex-col gap-5 pb-8">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <button
            type="button"
            onClick={() => navigate(volverA)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
            aria-label="Volver a compromisos"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
              Detalle y auditoría
            </p>
            <h1 className="mt-1 text-2xl font-bold text-slate-950">
              Compromiso
            </h1>
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={abrirAspectoEnMatriz}
            title={`Ver en la matriz: ${detalle.data.aspecto.nombre}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 text-sm font-semibold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-100"
          >
            <ArrowUpRight size={16} />
            Ver aspecto en matriz
          </button>
          <button
            type="button"
            onClick={() =>
              void recargarTodo()
            }
            disabled={actualizando}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={
                actualizando
                  ? "animate-spin"
                  : ""
              }
            />
            Actualizar
          </button>
        </div>
      </header>

      {detalle.error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {detalle.error}
        </div>
      )}

      {administracion.error && (
        <div
          role="alert"
          className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
        >
          El compromiso se cargó, pero no fue posible consultar su administración: {administracion.error}
        </div>
      )}

      <CompromisoDetalleResumen
        compromiso={detalle.data}
      />
      <CompromisoRutaTrabajo
        compromiso={detalle.data}
      />
      <CompromisoProgreso
        progreso={detalle.data.progreso}
      />
      <RegistroAvanceCompromiso
        compromiso={detalle.data}
        procesando={operaciones.procesando}
        onCreateFollowUp={
          operaciones.crearSeguimiento
        }
        onCreateEvidence={
          operaciones.crearEvidencia
        }
      />
      <CompromisoResponsables
        responsables={
          detalle.data.responsables
        }
        operacion={detalle.data.operacion}
        procesando={operaciones.procesando}
        onToggleActividad={
          operaciones.cambiarActividad
        }
      />
      <AsignacionCompromisoPanel
        compromiso={detalle.data}
        procesando={operaciones.procesando}
        onReject={async (motivo) => {
          const guardado =
            await operaciones.rechazarAsignacion(
              motivo
            );

          if (
            guardado &&
            !detalle.data?.operacion.esSupervisor
          ) {
            navigate(volverA);
          }

          return guardado;
        }}
        onReassign={operaciones.reasignar}
      />
      <CierreCompromisoPanel
        compromiso={detalle.data}
        procesando={operaciones.procesando}
        onRequestClose={
          operaciones.solicitarCierre
        }
        onDecide={operaciones.decidirCierre}
      />
      {administracion.data && (
        <AdministracionCompromisoPanel
          administracion={administracion.data}
          esSupervisor={
            detalle.data.operacion.esSupervisor
          }
          procesando={operaciones.procesando}
          onRequestExtension={
            operaciones.solicitarAmpliacion
          }
          onDecideExtension={
            operaciones.decidirAmpliacion
          }
          onCancel={operaciones.cancelar}
        />
      )}
      <CompromisoTrazabilidad
        compromiso={detalle.data}
      />

      <AppToast
        open={Boolean(operaciones.feedback)}
        tone={
          operaciones.feedback?.tone ?? "success"
        }
        title={
          operaciones.feedback?.title ?? ""
        }
        description={
          operaciones.feedback?.description
        }
        onClose={operaciones.cerrarFeedback}
      />
    </div>
  );
}