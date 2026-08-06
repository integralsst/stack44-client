import {
  RefreshCw,
  UserRoundX,
} from "lucide-react";
import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import AppButton from "../../../../components/ui/AppButton";
import type { CompromisoDetalle } from "../../types/consulta-compromisos.types";
import type { ReasignarCompromisoInput } from "../../types/operacion-compromisos.types";

interface Props {
  compromiso: CompromisoDetalle;
  procesando: string | null;
  onReject: (motivo: string) => Promise<boolean>;
  onReassign: (
    data: ReasignarCompromisoInput
  ) => Promise<boolean>;
}

export default function AsignacionCompromisoPanel({
  compromiso,
  procesando,
  onReject,
  onReassign,
}: Props) {
  const [mostrarRechazo, setMostrarRechazo] =
    useState(false);
  const [motivo, setMotivo] = useState("");
  const [destinos, setDestinos] = useState<
    Record<string, string>
  >({});
  const [error, setError] =
    useState<string | null>(null);

  const rechazadas = useMemo(
    () =>
      compromiso.responsables.filter(
        (responsable) =>
          responsable.estado === "RECHAZADA"
      ),
    [compromiso.responsables]
  );

  if (
    !compromiso.operacion
      .puedeRechazarAsignacion &&
    !compromiso.operacion.puedeReasignar
  ) {
    return null;
  }

  const rechazar = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!motivo.trim()) {
      setError(
        "Explica por qué no puedes asumir la asignación."
      );
      return;
    }

    setError(null);
    const guardado = await onReject(motivo.trim());

    if (guardado) {
      setMotivo("");
      setMostrarRechazo(false);
    }
  };

  const reasignar = async (
    asignacionRechazadaId: string
  ) => {
    const nuevoUsuarioResponsableId =
      destinos[asignacionRechazadaId] ?? "";

    if (!nuevoUsuarioResponsableId) {
      setError(
        "Selecciona la persona que recibirá la asignación."
      );
      return;
    }

    setError(null);
    await onReassign({
      asignacionRechazadaId,
      nuevoUsuarioResponsableId,
    });
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
            Asignación
          </p>
          <h2 className="mt-1 text-base font-bold text-slate-950">
            Rechazo y reasignación
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            La fecha límite continúa corriendo y cada cambio conserva su trazabilidad.
          </p>
        </div>
        {compromiso.operacion
          .puedeRechazarAsignacion && (
          <AppButton
            variant="danger"
            leadingIcon={<UserRoundX size={16} />}
            onClick={() =>
              setMostrarRechazo((current) => !current)
            }
            disabled={Boolean(procesando)}
          >
            Rechazar asignación
          </AppButton>
        )}
      </div>

      {mostrarRechazo && (
        <form
          onSubmit={(event) => void rechazar(event)}
          className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4"
        >
          <label>
            <span className="mb-1.5 block text-xs font-semibold text-red-900">
              Motivo obligatorio
            </span>
            <textarea
              value={motivo}
              onChange={(event) =>
                setMotivo(event.target.value)
              }
              rows={3}
              disabled={Boolean(procesando)}
              className="w-full resize-y rounded-xl border border-red-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
              placeholder="Describe la razón del rechazo."
            />
          </label>
          <div className="mt-3 flex justify-end">
            <AppButton
              type="submit"
              variant="danger"
              loading={procesando === "rechazo"}
              loadingLabel="Rechazando"
            >
              Confirmar rechazo
            </AppButton>
          </div>
        </form>
      )}

      {compromiso.operacion.puedeReasignar && (
        <div className="mt-4 space-y-3">
          {rechazadas.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
              No hay asignaciones rechazadas pendientes.
            </p>
          ) : (
            rechazadas.map((responsable) => (
              <article
                key={responsable.id}
                className="rounded-xl border border-amber-200 bg-amber-50 p-4"
              >
                <p className="font-semibold text-slate-900">
                  {responsable.usuarioResponsable.nombre}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {responsable.motivoRechazo}
                </p>
                <div className="mt-3 flex flex-col gap-2 md:flex-row">
                  <select
                    value={destinos[responsable.id] ?? ""}
                    onChange={(event) =>
                      setDestinos((current) => ({
                        ...current,
                        [responsable.id]: event.target.value,
                      }))
                    }
                    disabled={Boolean(procesando)}
                    className="h-10 min-w-0 flex-1 rounded-xl border border-amber-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
                  >
                    <option value="">
                      Seleccionar nuevo responsable
                    </option>
                    {compromiso.responsablesDisponibles
                      .filter(
                        (opcion) =>
                          opcion.id !==
                          responsable.usuarioResponsable.id
                      )
                      .map((opcion) => (
                        <option
                          key={opcion.id}
                          value={opcion.id}
                        >
                          {opcion.nombre} ·{" "}
                          {opcion.rol.replaceAll("_", " ")}
                        </option>
                      ))}
                  </select>
                  <AppButton
                    variant="warning"
                    leadingIcon={<RefreshCw size={16} />}
                    loading={procesando === "reasignacion"}
                    loadingLabel="Reasignando"
                    onClick={() =>
                      void reasignar(responsable.id)
                    }
                  >
                    Reasignar
                  </AppButton>
                </div>
              </article>
            ))
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
