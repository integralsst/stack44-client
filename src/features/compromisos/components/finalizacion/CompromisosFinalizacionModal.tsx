import {
  useState,
  type FormEvent,
} from "react";
import { AlertTriangle } from "lucide-react";

import AppButton from "../../../../components/ui/AppButton";
import AppModal from "../../../../components/ui/AppModal";
import AppAlert from "../../../evaluacion/components/feedback/AppAlert";
import { construirCompromisosFinalizacion } from "../../forms/compromisos-finalizacion.form";
import { useCompromisosFinalizacionForm } from "../../hooks/useCompromisosFinalizacionForm";
import type {
  CompromisoFinalizacionInput,
  PreparacionFinalizacionResponse,
} from "../../types/compromiso.types";
import CompromisoFinalizacionCard from "./CompromisoFinalizacionCard";

interface Props {
  preparacion: PreparacionFinalizacionResponse;
  busy: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (
    compromisos: CompromisoFinalizacionInput[]
  ) => Promise<void>;
}

export default function CompromisosFinalizacionModal({
  preparacion,
  busy,
  error,
  onClose,
  onSubmit,
}: Props) {
  const evaluacionesNuevas =
    preparacion.evaluaciones.filter(
      (evaluacion) => evaluacion.accion === "CREAR"
    );
  const evaluacionesVinculadas =
    preparacion.evaluaciones.filter(
      (evaluacion) =>
        evaluacion.accion === "VINCULAR_EXISTENTE"
    );
  const formulario =
    useCompromisosFinalizacionForm(preparacion);
  const [errorLocal, setErrorLocal] =
    useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setErrorLocal(null);

    try {
      const compromisos =
        construirCompromisosFinalizacion(
          evaluacionesNuevas,
          formulario.borradores
        );

      await onSubmit(compromisos);
    } catch (currentError) {
      setErrorLocal(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible finalizar la gestión."
      );
    }
  };

  return (
    <AppModal
      open
      title="Compromisos obligatorios"
      description={`Completa ${evaluacionesNuevas.length} compromiso(s) para finalizar la gestión. Cada aspecto incumplido o parcial conserva su propio responsable, actividad y fecha límite.`}
      onClose={onClose}
      busy={busy}
      size="2xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Todos los campos marcados con * son obligatorios.
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <AppButton
              variant="secondary"
              size="lg"
              onClick={onClose}
              disabled={busy}
            >
              Volver a la gestión
            </AppButton>

            <AppButton
              type="submit"
              form="compromisos-finalizacion-form"
              variant="primary"
              size="lg"
              loading={busy}
              loadingLabel="Finalizando"
            >
              Guardar compromisos y finalizar
            </AppButton>
          </div>
        </div>
      }
    >
      <form
        id="compromisos-finalizacion-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {(errorLocal || error) && (
          <AppAlert
            tone="error"
            title="Revisa la información de los compromisos"
            description={errorLocal ?? error ?? undefined}
          />
        )}

        {preparacion.responsablesDisponibles.length ===
          0 && (
          <AppAlert
            tone="warning"
            title="No hay responsables disponibles"
            description="Debes activar o relacionar al menos un usuario con esta empresa antes de registrar los compromisos."
          />
        )}

        {evaluacionesVinculadas.length > 0 && (
          <AppAlert
            tone="info"
            title={`${evaluacionesVinculadas.length} compromiso(s) existente(s) serán vinculados`}
            description="Estos aspectos ya tienen un compromiso abierto y no requieren volver a diligenciarlo."
          >
            <ul className="space-y-1 text-xs text-slate-600">
              {evaluacionesVinculadas.map(
                (evaluacion) => (
                  <li key={evaluacion.evaluacionId}>
                    {evaluacion.aspectoCodigo
                      ? `${evaluacion.aspectoCodigo} · `
                      : ""}
                    {evaluacion.aspectoNombre}
                  </li>
                )
              )}
            </ul>
          </AppAlert>
        )}

        {evaluacionesNuevas.map(
          (evaluacion, index) => {
            const draft =
              formulario.borradores[
                evaluacion.evaluacionId
              ];

            if (!draft) {
              return null;
            }

            return (
              <CompromisoFinalizacionCard
                key={evaluacion.evaluacionId}
                evaluacion={evaluacion}
                index={index}
                total={evaluacionesNuevas.length}
                draft={draft}
                responsables={
                  preparacion.responsablesDisponibles
                }
                busy={busy}
                onUpdateDraft={
                  formulario.actualizarBorrador
                }
                onAddSupport={formulario.agregarApoyo}
                onUpdateSupport={
                  formulario.actualizarApoyo
                }
                onRemoveSupport={
                  formulario.eliminarApoyo
                }
              />
            );
          }
        )}

        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0"
          />
          <p>
            La gestión solo se finalizará cuando todos los
            compromisos sean válidos. Si ocurre un error, no
            se creará ningún compromiso parcial.
          </p>
        </div>
      </form>
    </AppModal>
  );
}
