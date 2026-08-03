import {
  ChevronDown,
  ChevronUp,
  History,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

import { useHistorialGestiones } from "../../hooks/useHistorialGestiones";
import type { GestionHistorialEvaluacion } from "../../types/gestion-historial.types";
import AppAlert from "../feedback/AppAlert";
import AppSpinner from "../feedback/AppSpinner";
import AppToast from "../feedback/AppToast";
import GestionHistorialCard from "./GestionHistorialCard";
import InvalidarGestionModal from "./InvalidarGestionModal";

export default function HistorialGestionesEmpresa({
  periodoId,
  onGestionInvalidada,
}: {
  periodoId: string;
  onGestionInvalidada: () => Promise<void> | void;
}) {
  const [abierto, setAbierto] = useState(true);
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

  const handleInvalidar = async (motivo: string) => {
    if (!gestionSeleccionada) return;

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
      // El hook conserva el mensaje para mostrarlo en el modal.
    }
  };

  return (
    <>
      <section className="overflow-hidden rounded-2xl border border-neutral-800 bg-[#101112] shadow-xl">
        <div className="flex flex-col gap-3 border-b border-neutral-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setAbierto((value) => !value)}
            className="flex min-w-0 items-start gap-3 text-left"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-[#08090a] text-cyan-300">
              <History size={18} />
            </div>

            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-white sm:text-base">
                Historial de gestiones del periodo
              </h2>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                Conserva visitas, asesorías y jornadas finalizadas. La
                evaluación válida más reciente de cada aspecto es la que
                queda aplicada.
              </p>
            </div>
          </button>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => void recargar()}
              disabled={cargando}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-[#08090a] text-neutral-400 transition hover:border-neutral-700 hover:text-white disabled:opacity-40"
              title="Actualizar historial"
              aria-label="Actualizar historial"
            >
              {cargando ? (
                <AppSpinner size="sm" />
              ) : (
                <RefreshCw size={15} />
              )}
            </button>

            <button
              type="button"
              onClick={() => setAbierto((value) => !value)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-800 bg-[#08090a] text-neutral-400 transition hover:border-neutral-700 hover:text-white"
              aria-label={abierto ? "Contraer historial" : "Abrir historial"}
            >
              {abierto ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>
          </div>
        </div>

        {abierto && (
          <div className="space-y-3 p-3 sm:p-4">
            {error && (
              <AppAlert
                tone="error"
                title="No fue posible cargar las gestiones"
                description={error}
              />
            )}

            {cargando && !data ? (
              <div className="flex min-h-32 items-center justify-center rounded-2xl border border-neutral-800 bg-[#090a0b]">
                <AppSpinner />
              </div>
            ) : data?.gestiones.length ? (
              data.gestiones.map((gestion) => (
                <GestionHistorialCard
                  key={gestion.id}
                  gestion={gestion}
                  onInvalidar={setGestionSeleccionada}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#090a0b] px-4 py-8 text-center">
                <p className="text-sm font-medium text-neutral-300">
                  Todavía no hay gestiones finalizadas
                </p>
                <p className="mt-1 text-xs leading-5 text-neutral-600">
                  Cuando finalices una gestión aparecerá aquí sin
                  reemplazar las anteriores.
                </p>
              </div>
            )}
          </div>
        )}
      </section>

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
