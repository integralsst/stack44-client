import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  AlertTriangle,
  Ban,
} from "lucide-react";

import AppModal from "../../../../components/ui/AppModal";
import type { GestionHistorialEvaluacion } from "../../types/gestion-historial.types";
import AppSpinner from "../feedback/AppSpinner";

export default function InvalidarGestionModal({
  open,
  gestion,
  busy,
  error,
  onClose,
  onSubmit,
}: {
  open: boolean;
  gestion: GestionHistorialEvaluacion | null;
  busy: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (motivo: string) => Promise<void>;
}) {
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    if (open) {
      setMotivo("");
    }
  }, [open, gestion?.id]);

  if (!gestion) return null;

  const motivoLimpio = motivo.trim();
  const puedeEnviar = motivoLimpio.length >= 10 && !busy;

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!puedeEnviar) return;

    await onSubmit(motivoLimpio);
  };

  return (
    <AppModal
      open={open}
      title="Invalidar gestión finalizada"
      description="Esta acción se reserva para registros que nunca debieron considerarse válidos. No se utiliza para actualizar el cumplimiento normal de un aspecto."
      onClose={onClose}
      busy={busy}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
              <Ban size={18} />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                {gestion.tipoActividad}
              </p>
              <p className="mt-1 text-xs leading-5 text-neutral-400">
                {gestion.totalEvaluaciones} evaluación(es) dejarán de
                participar en el estado vigente y en los cálculos. Los
                registros y evidencias permanecerán disponibles para
                auditoría.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold text-amber-200">
            <AlertTriangle size={15} />
            La evaluación válida anterior volverá a quedar aplicada
          </p>
          <p className="mt-2 text-xs leading-5 text-neutral-400">
            Para una corrección ordinaria no invalidez la gestión: crea
            una nueva gestión y registra la calificación correcta. La
            evaluación válida más reciente será la vigente.
          </p>
        </section>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-xs leading-5 text-red-200">
            {error}
          </div>
        )}

        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
            Motivo obligatorio
          </span>
          <textarea
            value={motivo}
            onChange={(event) => setMotivo(event.target.value)}
            disabled={busy}
            maxLength={2000}
            rows={6}
            placeholder="Ejemplo: La gestión se registró en la empresa equivocada y no corresponde a una actividad real de este periodo."
            className="mt-2 w-full resize-y rounded-2xl border border-neutral-700 bg-[#090a0b] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-neutral-600 focus:border-red-400/50 focus:ring-2 focus:ring-red-500/10 disabled:opacity-50"
          />
          <div className="mt-1.5 flex items-center justify-between text-[10px] text-neutral-600">
            <span>Mínimo 10 caracteres.</span>
            <span>{motivo.length}/2000</span>
          </div>
        </label>

        <div className="flex flex-col-reverse gap-2 border-t border-neutral-800 pt-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-neutral-300 transition hover:border-neutral-600 hover:text-white disabled:opacity-40"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={!puedeEnviar}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {busy ? (
              <AppSpinner size="sm" className="text-white" />
            ) : (
              <Ban size={16} />
            )}
            Invalidar definitivamente
          </button>
        </div>
      </form>
    </AppModal>
  );
}
