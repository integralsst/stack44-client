import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { useHistorialGestiones } from "../../hooks/useHistorialGestiones";
import type { GestionHistorialEvaluacion } from "../../types/gestion-historial.types";
import AppAlert from "../feedback/AppAlert";
import AppSpinner from "../feedback/AppSpinner";
import AppToast from "../feedback/AppToast";
import GestionHistorialCard from "./GestionHistorialCard";
import InvalidarGestionModal from "./InvalidarGestionModal";

interface Props {
  periodoId: string;
  onGestionInvalidada: () => Promise<void> | void;
}

export default function HistorialGestionesEmpresa({
  periodoId,
  onGestionInvalidada,
}: Props) {
  const [gestionSeleccionada, setGestionSeleccionada] =
    useState<GestionHistorialEvaluacion | null>(null);

  const [toast, setToast] = useState<{
    title: string;
    description: string;
  } | null>(null);

  const {
    data,
    cargando,
    procesando,
    error,
    recargar,
    invalidar,
  } = useHistorialGestiones(periodoId);

  const handleInvalidar = async (
    motivo: string
  ): Promise<void> => {
    if (!gestionSeleccionada) {
      return;
    }

    try {
      const resultado = await invalidar(
        gestionSeleccionada.id,
        motivo
      );

      setGestionSeleccionada(null);

      await onGestionInvalidada();

      setToast({
        title: "Gestión invalidada",
        description: resultado.mensaje,
      });
    } catch {
      /*
       * El hook conserva el error y el modal lo muestra.
       * No cerramos el formulario para que el usuario
       * pueda revisar el mensaje.
       */
    }
  };

  const cantidadGestiones =
    data?.gestiones.length ?? 0;

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-neutral-800 bg-[#090a0b] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white">
              {cargando && !data
                ? "Cargando gestiones..."
                : `${cantidadGestiones} gestión(es) registrada(s)`}
            </p>

            <p className="mt-1 text-xs leading-5 text-neutral-500">
              La evaluación válida más reciente de cada
              aspecto es la que queda aplicada. Las
              anteriores permanecen disponibles para
              trazabilidad.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void recargar()}
            disabled={cargando}
            className="flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-[#111213] px-4 py-2.5 text-sm font-medium text-neutral-300 transition hover:border-cyan-500/40 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {cargando ? (
              <AppSpinner size="sm" />
            ) : (
              <RefreshCw size={15} />
            )}

            Actualizar
          </button>
        </div>

        {error && !gestionSeleccionada && (
          <AppAlert
            tone="error"
            title="No fue posible cargar las gestiones"
            description={error}
          />
        )}

        {cargando && !data ? (
          <div className="flex min-h-48 items-center justify-center rounded-2xl border border-neutral-800 bg-[#090a0b]">
            <div className="flex flex-col items-center gap-3 text-neutral-500">
              <AppSpinner />

              <p className="text-xs">
                Consultando historial del periodo...
              </p>
            </div>
          </div>
        ) : data?.gestiones.length ? (
          <div className="space-y-3">
            {data.gestiones.map((gestion) => (
              <GestionHistorialCard
                key={gestion.id}
                gestion={gestion}
                onInvalidar={setGestionSeleccionada}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#090a0b] px-5 py-12 text-center">
            <p className="text-sm font-medium text-neutral-300">
              Todavía no hay gestiones finalizadas
            </p>

            <p className="mx-auto mt-2 max-w-xl text-xs leading-5 text-neutral-600">
              Cuando finalices una visita, asesoría o
              jornada aparecerá aquí sin reemplazar las
              gestiones anteriores.
            </p>
          </div>
        )}
      </div>

      <InvalidarGestionModal
        open={gestionSeleccionada !== null}
        gestion={gestionSeleccionada}
        busy={procesando}
        error={error}
        onClose={() => {
          if (!procesando) {
            setGestionSeleccionada(null);
          }
        }}
        onSubmit={handleInvalidar}
      />

      <AppToast
        open={toast !== null}
        tone="success"
        title={toast?.title ?? ""}
        description={toast?.description}
        duration={6000}
        onClose={() => setToast(null)}
      />
    </>
  );
}