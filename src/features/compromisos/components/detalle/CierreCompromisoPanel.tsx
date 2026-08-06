import {
  CheckCheck,
  CheckCircle2,
  Circle,
  CornerDownLeft,
  Send,
} from "lucide-react";
import {
  useState,
} from "react";

import AppButton from "../../../../components/ui/AppButton";
import type { CompromisoDetalle } from "../../types/consulta-compromisos.types";

interface Props {
  compromiso: CompromisoDetalle;
  procesando: string | null;
  onRequestClose: () => Promise<boolean>;
  onDecide: (
    solicitudId: string,
    decision: "APROBAR" | "DEVOLVER",
    mensaje: string
  ) => Promise<boolean>;
}

export default function CierreCompromisoPanel({
  compromiso,
  procesando,
  onRequestClose,
  onDecide,
}: Props) {
  const [mensaje, setMensaje] = useState("");
  const [error, setError] =
    useState<string | null>(null);
  const pendiente = compromiso.solicitudesCierre.find(
    (solicitud) => solicitud.estado === "PENDIENTE"
  );
  const puedeVerSolicitud =
    compromiso.estado === "EN_EJECUCION" &&
    (compromiso.operacion.esSupervisor ||
      compromiso.operacion
        .puedeRegistrarSeguimiento);

  const decidir = async (
    decision: "APROBAR" | "DEVOLVER"
  ) => {
    if (!pendiente || !mensaje.trim()) {
      setError(
        "Escribe el concepto de aprobación o las correcciones solicitadas."
      );
      return;
    }

    setError(null);
    const guardado = await onDecide(
      pendiente.id,
      decision,
      mensaje.trim()
    );

    if (guardado) {
      setMensaje("");
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
            Paso 4 · Cierre formal
          </p>
          <h2 className="mt-1 text-base font-bold text-slate-950">
            Solicitud y decisión de cierre
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Una recalificación en 5 no cierra automáticamente el compromiso. Primero deben completarse las actividades y luego un supervisor diferente debe revisar la solicitud.
          </p>
        </div>
        {puedeVerSolicitud && (
          <AppButton
            variant="success"
            leadingIcon={<Send size={16} />}
            loading={
              procesando === "solicitud-cierre"
            }
            loadingLabel="Solicitando"
            onClick={() => void onRequestClose()}
            disabled={
              Boolean(procesando) ||
              !compromiso.operacion
                .puedeSolicitarCierre
            }
          >
            {compromiso.operacion.esUsuarioCliente
              ? "Solicitar revisión de cierre"
              : "Solicitar cierre"}
          </AppButton>
        )}
      </div>

      {!pendiente &&
        compromiso.estado === "EN_EJECUCION" && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-slate-900">
              Requisitos para habilitar la solicitud
            </p>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              <Requisito
                listo={
                  compromiso.progreso
                    .actividadesTotal > 0 &&
                  compromiso.progreso
                    .actividadesPendientes === 0
                }
                texto={
                  compromiso.progreso
                    .actividadesPendientes === 0
                    ? "Todas las actividades están completas."
                    : "Faltan " +
                      compromiso.progreso
                        .actividadesPendientes +
                      " actividad(es) por completar."
                }
              />
              <Requisito
                listo={
                  compromiso.progreso
                    .aspectoRecalificadoEnCinco
                }
                texto={
                  compromiso.progreso
                    .aspectoRecalificadoEnCinco
                    ? "El aspecto ya fue recalificado en 5."
                    : "Falta una evaluación posterior del aspecto en 5."
                }
              />
            </div>
            {!compromiso.operacion
              .puedeSolicitarCierre && (
              <p className="mt-3 text-xs leading-5 text-slate-600">
                El botón permanecerá deshabilitado hasta cumplir ambos requisitos. Las evidencias son soporte recomendado, no un requisito automático.
              </p>
            )}
          </div>
        )}

      {pendiente && (
        <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4">
          <p className="text-sm font-semibold text-cyan-950">
            Solicitud #{pendiente.numeroIntento} pendiente
          </p>
          <p className="mt-1 text-xs text-cyan-800">
            Presentada por {pendiente.solicitadaPor.nombre} con recalificación administrativa {pendiente.evaluacionRecalificacion.calificacionAdministrativa}.
          </p>

          {compromiso.operacion
            .puedeDecidirCierre ? (
            <div className="mt-4">
              <label>
                <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Concepto de revisión
                </span>
                <textarea
                  value={mensaje}
                  onChange={(event) =>
                    setMensaje(event.target.value)
                  }
                  rows={3}
                  disabled={Boolean(procesando)}
                  className="w-full resize-y rounded-xl border border-cyan-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  placeholder="Deja el concepto de cierre o las correcciones requeridas."
                />
              </label>
              <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <AppButton
                  variant="warning"
                  leadingIcon={
                    <CornerDownLeft size={16} />
                  }
                  loading={
                    procesando === "decision-cierre"
                  }
                  loadingLabel="Procesando"
                  onClick={() =>
                    void decidir("DEVOLVER")
                  }
                >
                  Devolver con correcciones
                </AppButton>
                <AppButton
                  variant="success"
                  leadingIcon={<CheckCheck size={16} />}
                  loading={
                    procesando === "decision-cierre"
                  }
                  loadingLabel="Cerrando"
                  onClick={() =>
                    void decidir("APROBAR")
                  }
                >
                  Aprobar y cerrar
                </AppButton>
              </div>
            </div>
          ) : (
            <p className="mt-3 rounded-lg border border-cyan-200 bg-white/80 p-3 text-sm text-cyan-900">
              La solicitud debe ser revisada por un coordinador o administrador diferente de quien la presentó y de quien registró la recalificación.
            </p>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </p>
      )}
    </section>
  );
}

function Requisito({
  listo,
  texto,
}: {
  listo: boolean;
  texto: string;
}) {
  return (
    <div
      className={
        "flex items-start gap-2 rounded-lg border p-3 text-sm " +
        (listo
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-amber-200 bg-amber-50 text-amber-900")
      }
    >
      {listo ? (
        <CheckCircle2
          size={17}
          className="mt-0.5 shrink-0"
        />
      ) : (
        <Circle
          size={17}
          className="mt-0.5 shrink-0"
        />
      )}
      <span>{texto}</span>
    </div>
  );
}
