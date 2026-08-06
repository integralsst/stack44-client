import {
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import CompromisoDetalleResumen from "../components/detalle/CompromisoDetalleResumen";
import AsignacionCompromisoPanel from "../components/detalle/AsignacionCompromisoPanel";
import CierreCompromisoPanel from "../components/detalle/CierreCompromisoPanel";
import CompromisoProgreso from "../components/detalle/CompromisoProgreso";
import CompromisoResponsables from "../components/detalle/CompromisoResponsables";
import CompromisoTrazabilidad from "../components/detalle/CompromisoTrazabilidad";
import EvidenciaCompromisoForm from "../components/detalle/EvidenciaCompromisoForm";
import SeguimientoCompromisoForm from "../components/detalle/SeguimientoCompromisoForm";
import AppToast from "../../evaluacion/components/feedback/AppToast";
import { useCompromisoDetalle } from "../hooks/useCompromisoDetalle";
import { useOperacionesCompromiso } from "../hooks/useOperacionesCompromiso";

export default function CompromisoDetallePage() {
  const { compromisoId = "" } =
    useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const detalle =
    useCompromisoDetalle(compromisoId);
  const operaciones = useOperacionesCompromiso(
    compromisoId,
    detalle.recargar
  );

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
        <button
          type="button"
          onClick={() =>
            void detalle.recargar()
          }
          disabled={detalle.cargando}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              detalle.cargando
                ? "animate-spin"
                : ""
            }
          />
          Actualizar
        </button>
      </header>

      {detalle.error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {detalle.error}
        </div>
      )}

      <CompromisoDetalleResumen
        compromiso={detalle.data}
      />
      <CompromisoProgreso
        progreso={detalle.data.progreso}
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
      {(detalle.data.operacion
        .puedeRegistrarSeguimiento ||
        detalle.data.operacion
          .puedeCargarEvidencia) && (
        <div className="grid gap-4 xl:grid-cols-2">
          {detalle.data.operacion
            .puedeRegistrarSeguimiento && (
            <SeguimientoCompromisoForm
              compromiso={detalle.data}
              busy={
                operaciones.procesando ===
                "seguimiento"
              }
              onSubmit={
                operaciones.crearSeguimiento
              }
            />
          )}
          {detalle.data.operacion
            .puedeCargarEvidencia && (
            <EvidenciaCompromisoForm
              busy={
                operaciones.procesando ===
                "evidencia"
              }
              onSubmit={
                operaciones.crearEvidencia
              }
            />
          )}
        </div>
      )}
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
