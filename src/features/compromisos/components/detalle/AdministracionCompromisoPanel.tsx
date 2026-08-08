import {
  Ban,
  CalendarClock,
  CheckCircle2,
  Clock3,
  History,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

import AppButton from "../../../../components/ui/AppButton";
import type {
  AdministracionCompromiso,
  DecisionAmpliacionCompromiso,
} from "../../types/administracion-compromiso.types";
import type {
  DecidirAmpliacionCompromisoInput,
  SolicitarAmpliacionCompromisoInput,
} from "../../types/operacion-compromisos.types";

interface Props {
  administracion: AdministracionCompromiso;
  esSupervisor: boolean;
  procesando: string | null;
  onRequestExtension: (
    data: SolicitarAmpliacionCompromisoInput
  ) => Promise<boolean>;
  onDecideExtension: (
    data: DecidirAmpliacionCompromisoInput
  ) => Promise<boolean>;
  onCancel: (motivo: string) => Promise<boolean>;
}

function fecha(value: string | null): string {
  if (!value) return "—";

  return new Date(value).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function DecisionBadge({
  decision,
}: {
  decision: DecisionAmpliacionCompromiso;
}) {
  const aprobada = decision.decision === "APROBADA";

  return (
    <div
      className={
        "rounded-xl border p-3 " +
        (aprobada
          ? "border-emerald-200 bg-emerald-50"
          : "border-red-200 bg-red-50")
      }
    >
      <div className="flex items-center gap-2">
        {aprobada ? (
          <CheckCircle2
            size={16}
            className="text-emerald-700"
          />
        ) : (
          <XCircle
            size={16}
            className="text-red-700"
          />
        )}
        <p className="text-xs font-bold text-slate-900">
          {decision.tipoAprobador === "COORDINADOR"
            ? "Coordinación"
            : "Administración"}
          {" · "}
          {aprobada ? "Aprobada" : "Rechazada"}
        </p>
      </div>
      <p className="mt-1 text-xs text-slate-600">
        {decision.decididaPor.nombre} · {fecha(decision.decididaEn)}
      </p>
      {decision.observacion && (
        <p className="mt-2 text-xs leading-5 text-slate-700">
          {decision.observacion}
        </p>
      )}
    </div>
  );
}

export default function AdministracionCompromisoPanel({
  administracion,
  esSupervisor,
  procesando,
  onRequestExtension,
  onDecideExtension,
  onCancel,
}: Props) {
  const [fechaSolicitada, setFechaSolicitada] =
    useState("");
  const [justificacion, setJustificacion] =
    useState("");
  const [observacion, setObservacion] =
    useState("");
  const [motivoCancelacion, setMotivoCancelacion] =
    useState("");
  const [error, setError] =
    useState<string | null>(null);

  const pendiente =
    administracion.solicitudesAmpliacion.find(
      (solicitud) => solicitud.estado === "PENDIENTE"
    ) ?? null;
  const tipoPendiente =
    administracion.operacion
      .tipoAprobadorAmpliacionPendiente;

  const solicitarAmpliacion = async () => {
    if (!fechaSolicitada || !justificacion.trim()) {
      setError(
        "Selecciona la nueva fecha límite y explica por qué se requiere la ampliación."
      );
      return;
    }

    setError(null);
    const guardado = await onRequestExtension({
      fechaLimiteSolicitada: fechaSolicitada,
      justificacion: justificacion.trim(),
    });

    if (guardado) {
      setFechaSolicitada("");
      setJustificacion("");
    }
  };

  const decidir = async (
    decision: "APROBAR" | "RECHAZAR"
  ) => {
    if (!pendiente) return;

    if (decision === "RECHAZAR" && !observacion.trim()) {
      setError(
        "Escribe el motivo del rechazo antes de continuar."
      );
      return;
    }

    setError(null);
    const guardado = await onDecideExtension({
      solicitudId: pendiente.id,
      decision,
      observacion: observacion.trim() || null,
    });

    if (guardado) {
      setObservacion("");
    }
  };

  const cancelar = async () => {
    if (!motivoCancelacion.trim()) {
      setError(
        "La cancelación administrativa requiere una justificación."
      );
      return;
    }

    setError(null);
    const guardado = await onCancel(
      motivoCancelacion.trim()
    );

    if (guardado) {
      setMotivoCancelacion("");
    }
  };

  const rutaRelacion = (id: string) =>
    esSupervisor
      ? `/dashboard/compromisos/${id}`
      : `/dashboard/mis-compromisos/${id}`;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
          <CalendarClock size={19} />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
            Vigencia y administración
          </p>
          <h2 className="mt-1 text-base font-bold text-slate-950">
            Plazo, cancelación y continuidad histórica
          </h2>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            El vencimiento no cierra el compromiso. Si se necesita más tiempo, el responsable solicita una nueva fecha y esta solo entra en vigencia cuando coordinación y administración la aprueban.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Fecha límite vigente
          </p>
          <p className="mt-1 text-lg font-bold text-slate-950">
            {fecha(administracion.fechaLimite)}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Estado
          </p>
          <p className="mt-1 text-sm font-bold text-slate-950">
            {administracion.estado.replaceAll("_", " ")}
          </p>
        </div>
      </div>

      {administracion.cancelacion.canceladoEn && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-950">
          <div className="flex items-center gap-2 font-bold">
            <Ban size={17} />
            Compromiso cancelado
          </div>
          <p className="mt-2 text-sm leading-6">
            {administracion.cancelacion.motivo}
          </p>
          <p className="mt-2 text-xs text-red-800">
            {administracion.cancelacion.canceladoPor?.nombre ??
              "Usuario autorizado"}{" "}
            · {fecha(administracion.cancelacion.canceladoEn)}
          </p>
        </div>
      )}

      {administracion.operacion.puedeSolicitarAmpliacion && (
        <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50/60 p-4">
          <p className="text-sm font-bold text-slate-950">
            Solicitar ampliación de plazo
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            La fecha actual seguirá vigente hasta que se registren las dos aprobaciones requeridas.
          </p>
          <div className="mt-3 grid gap-3 lg:grid-cols-[220px_1fr]">
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Nueva fecha límite
              </span>
              <input
                type="date"
                value={fechaSolicitada}
                min={administracion.fechaLimite.slice(0, 10)}
                onChange={(event) =>
                  setFechaSolicitada(event.target.value)
                }
                disabled={Boolean(procesando)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </label>
            <label>
              <span className="mb-1.5 block text-xs font-semibold text-slate-700">
                Justificación
              </span>
              <textarea
                value={justificacion}
                onChange={(event) =>
                  setJustificacion(event.target.value)
                }
                rows={2}
                disabled={Boolean(procesando)}
                placeholder="Explica por qué se requiere ampliar el plazo."
                className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              />
            </label>
          </div>
          <div className="mt-3 flex justify-end">
            <AppButton
              variant="primary"
              leadingIcon={<Clock3 size={16} />}
              loading={
                procesando === "solicitud-ampliacion"
              }
              loadingLabel="Solicitando"
              disabled={Boolean(procesando)}
              onClick={() => void solicitarAmpliacion()}
            >
              Solicitar nueva fecha
            </AppButton>
          </div>
        </div>
      )}

      {pendiente && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-950">
            <Clock3 size={17} />
            <p className="text-sm font-bold">
              Solicitud de ampliación #{pendiente.numeroSolicitud} pendiente
            </p>
          </div>
          <p className="mt-2 text-sm leading-6 text-amber-950">
            {pendiente.solicitadaPor.nombre} solicita ampliar la fecha de {fecha(pendiente.fechaLimiteAnterior)} a {fecha(pendiente.fechaLimiteSolicitada)}.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-700">
            {pendiente.justificacion}
          </p>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {pendiente.decisiones.map((decision) => (
              <DecisionBadge
                key={decision.id}
                decision={decision}
              />
            ))}
            {!pendiente.decisiones.some(
              (decision) =>
                decision.tipoAprobador === "COORDINADOR"
            ) && (
              <div className="rounded-xl border border-dashed border-amber-300 bg-white/70 p-3 text-xs text-amber-900">
                Pendiente decisión de coordinación.
              </div>
            )}
            {!pendiente.decisiones.some(
              (decision) =>
                decision.tipoAprobador === "ADMINISTRADOR"
            ) && (
              <div className="rounded-xl border border-dashed border-amber-300 bg-white/70 p-3 text-xs text-amber-900">
                Pendiente decisión de administración.
              </div>
            )}
          </div>

          {tipoPendiente && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-white p-4">
              <div className="flex items-center gap-2 text-slate-950">
                <ShieldCheck size={17} />
                <p className="text-sm font-bold">
                  Tu decisión: {tipoPendiente === "COORDINADOR"
                    ? "Coordinación"
                    : "Administración"}
                </p>
              </div>
              <textarea
                value={observacion}
                onChange={(event) =>
                  setObservacion(event.target.value)
                }
                rows={2}
                disabled={Boolean(procesando)}
                placeholder="Observación opcional al aprobar; obligatoria si rechazas."
                className="mt-3 w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100"
              />
              <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <AppButton
                  variant="danger"
                  leadingIcon={<XCircle size={16} />}
                  loading={
                    procesando === "decision-ampliacion"
                  }
                  loadingLabel="Procesando"
                  disabled={Boolean(procesando)}
                  onClick={() => void decidir("RECHAZAR")}
                >
                  Rechazar ampliación
                </AppButton>
                <AppButton
                  variant="success"
                  leadingIcon={
                    <CheckCircle2 size={16} />
                  }
                  loading={
                    procesando === "decision-ampliacion"
                  }
                  loadingLabel="Procesando"
                  disabled={Boolean(procesando)}
                  onClick={() => void decidir("APROBAR")}
                >
                  Aprobar ampliación
                </AppButton>
              </div>
            </div>
          )}
        </div>
      )}

      {administracion.solicitudesAmpliacion.length > 0 && !pendiente && (
        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <summary className="cursor-pointer text-sm font-bold text-slate-900">
            Historial de ampliaciones ({administracion.solicitudesAmpliacion.length})
          </summary>
          <div className="mt-3 space-y-3">
            {administracion.solicitudesAmpliacion.map(
              (solicitud) => (
                <div
                  key={solicitud.id}
                  className="rounded-xl border border-slate-200 bg-white p-3"
                >
                  <p className="text-xs font-bold text-slate-900">
                    Solicitud #{solicitud.numeroSolicitud} · {solicitud.estado}
                  </p>
                  <p className="mt-1 text-xs text-slate-600">
                    {fecha(solicitud.fechaLimiteAnterior)} → {fecha(solicitud.fechaLimiteSolicitada)}
                  </p>
                  <p className="mt-2 text-xs leading-5 text-slate-700">
                    {solicitud.justificacion}
                  </p>
                </div>
              )
            )}
          </div>
        </details>
      )}

      {(administracion.relacion.anterior ||
        administracion.relacion.posteriores.length > 0) && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-2 text-slate-950">
            <History size={17} />
            <p className="text-sm font-bold">
              Continuidad del mismo aspecto
            </p>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Un compromiso cerrado no se reabre. Los nuevos compromisos del mismo aspecto permanecen relacionados para conservar la trazabilidad entre periodos.
          </p>
          <div className="mt-3 space-y-2">
            {administracion.relacion.anterior && (
              <Link
                to={rutaRelacion(
                  administracion.relacion.anterior.id
                )}
                className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-cyan-300 hover:bg-cyan-50"
              >
                <p className="text-xs font-bold text-slate-900">
                  Compromiso anterior · {administracion.relacion.anterior.anio}
                </p>
                <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                  {administracion.relacion.anterior.descripcion}
                </p>
              </Link>
            )}
            {administracion.relacion.posteriores.map(
              (relacionado) => (
                <Link
                  key={relacionado.id}
                  to={rutaRelacion(relacionado.id)}
                  className="block rounded-xl border border-slate-200 bg-white p-3 transition hover:border-cyan-300 hover:bg-cyan-50"
                >
                  <p className="text-xs font-bold text-slate-900">
                    Compromiso posterior · {relacionado.anio}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-600">
                    {relacionado.descripcion}
                  </p>
                </Link>
              )
            )}
          </div>
        </div>
      )}

      {administracion.operacion.puedeCancelar && (
        <details className="mt-4 rounded-xl border border-red-200 bg-red-50/60 p-4">
          <summary className="cursor-pointer text-sm font-bold text-red-900">
            Cancelación administrativa
          </summary>
          <p className="mt-2 text-xs leading-5 text-red-800">
            Esta acción no modifica la calificación del aspecto. Cierra el compromiso como CANCELADO y conserva todo su historial.
          </p>
          <textarea
            value={motivoCancelacion}
            onChange={(event) =>
              setMotivoCancelacion(event.target.value)
            }
            rows={2}
            disabled={Boolean(procesando)}
            placeholder="Motivo obligatorio de la cancelación."
            className="mt-3 w-full resize-y rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
          />
          <div className="mt-3 flex justify-end">
            <AppButton
              variant="danger"
              leadingIcon={<Ban size={16} />}
              loading={procesando === "cancelacion"}
              loadingLabel="Cancelando"
              disabled={Boolean(procesando)}
              onClick={() => void cancelar()}
            >
              Cancelar compromiso
            </AppButton>
          </div>
        </details>
      )}

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </p>
      )}
    </section>
  );
}
