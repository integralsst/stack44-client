import {
  CheckCircle2,
  Circle,
  RotateCcw,
  UserRound,
} from "lucide-react";

import AppButton from "../../../../components/ui/AppButton";
import type {
  CompromisoDetalle,
  ResponsableCompromisoListado,
} from "../../types/consulta-compromisos.types";

interface Props {
  responsables:
    ResponsableCompromisoListado[];
  operacion: CompromisoDetalle["operacion"];
  procesando: string | null;
  onToggleActividad: (
    actividadId: string,
    atendida: boolean
  ) => Promise<boolean>;
}

export default function CompromisoResponsables({
  responsables,
  operacion,
  procesando,
  onToggleActividad,
}: Props) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-slate-950">
        Responsables y actividades
      </h2>
      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {responsables.map(
          (responsable) => {
            const atendida =
              responsable.actividad?.estado ===
              "ATENDIDA";
            const activa =
              responsable.estado === "ASIGNADA";
            const puedeGestionar = Boolean(
              activa &&
                responsable.actividad &&
                operacion.puedeGestionarActividades &&
                (operacion.esSupervisor ||
                  responsable.usuarioResponsable.id ===
                    operacion.usuarioId)
            );

            return (
              <article
                key={responsable.id}
                className={`rounded-xl border p-4 ${
                  activa
                    ? "border-slate-200 bg-slate-50"
                    : "border-slate-200 bg-slate-100/70 opacity-80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm">
                    <UserRound size={17} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">
                        {
                          responsable
                            .usuarioResponsable
                            .nombre
                        }
                      </p>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {responsable.tipo ===
                        "PRINCIPAL"
                          ? "Principal"
                          : "Apoyo"}
                      </span>
                      {!activa && (
                        <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                          {responsable.estado ===
                          "RECHAZADA"
                            ? "Rechazada"
                            : "Reemplazada"}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      {
                        responsable
                          .usuarioResponsable
                          .correo
                      }
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-start gap-2 rounded-lg border border-slate-200 bg-white p-3">
                  {atendida ? (
                    <CheckCircle2
                      size={17}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                  ) : (
                    <Circle
                      size={17}
                      className="mt-0.5 shrink-0 text-amber-600"
                    />
                  )}
                  <p className="text-sm leading-6 text-slate-700">
                    {responsable.actividad
                      ?.descripcion ??
                      "Sin actividad registrada"}
                  </p>
                </div>
                {responsable.motivoRechazo && (
                  <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                    Motivo del rechazo: {responsable.motivoRechazo}
                  </p>
                )}
                {puedeGestionar &&
                  responsable.actividad && (
                  <div className="mt-3 flex justify-end">
                    <AppButton
                      variant={
                        atendida
                          ? "secondary"
                          : "success"
                      }
                      size="sm"
                      leadingIcon={
                        atendida ? (
                          <RotateCcw size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )
                      }
                      loading={
                        procesando ===
                        "actividad:" +
                          responsable.actividad.id
                      }
                      loadingLabel="Guardando"
                      onClick={() =>
                        void onToggleActividad(
                          responsable.actividad!.id,
                          !atendida
                        )
                      }
                    >
                      {atendida
                        ? "Volver a pendiente"
                        : "Marcar atendida"}
                    </AppButton>
                  </div>
                )}
              </article>
            );
          }
        )}
      </div>
    </section>
  );
}
