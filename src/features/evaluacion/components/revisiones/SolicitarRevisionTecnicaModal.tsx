import { ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";

import AppModal from "../../../../components/ui/AppModal";

interface Props {
  open: boolean;
  aspectoNombre: string;
  observacionConfiguracion: string | null;
  motivoInicial: string;
  onClose: () => void;
  onSave: (motivo: string) => void;
  onRemove: () => void;
}

export default function SolicitarRevisionTecnicaModal({
  open,
  aspectoNombre,
  observacionConfiguracion,
  motivoInicial,
  onClose,
  onSave,
  onRemove,
}: Props) {
  const [motivo, setMotivo] = useState(motivoInicial);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setMotivo(motivoInicial);
      setError(null);
    }
  }, [motivoInicial, open]);

  const guardar = () => {
    const limpio = motivo.trim();

    if (limpio.length < 10) {
      setError(
        "Explica el motivo de la revisión con al menos 10 caracteres."
      );
      return;
    }

    if (limpio.length > 2000) {
      setError(
        "El motivo no puede superar los 2000 caracteres."
      );
      return;
    }

    onSave(limpio);
  };

  return (
    <AppModal
      open={open}
      title="Solicitar revisión técnica"
      description={aspectoNombre}
      onClose={onClose}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <div>
            {motivoInicial.trim() && (
              <button
                type="button"
                onClick={onRemove}
                className="w-full rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300 transition hover:bg-red-500/15 sm:w-auto"
              >
                Retirar solicitud
              </button>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-300"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={guardar}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black"
            >
              <ShieldCheck size={16} />
              Guardar solicitud
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4">
        {observacionConfiguracion && (
          <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Orientación de la Supermatriz
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-300">
              {observacionConfiguracion}
            </p>
          </div>
        )}

        <label className="block">
          <span className="text-xs font-semibold text-neutral-300">
            Motivo de la revisión técnica
          </span>
          <textarea
            rows={6}
            value={motivo}
            onChange={(event) => {
              setMotivo(event.target.value);
              setError(null);
            }}
            placeholder="Ejemplo: Se requiere validar técnicamente la suficiencia del soporte y el criterio aplicado."
            className="mt-2 w-full resize-y rounded-2xl border border-neutral-700 bg-[#090a0b] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-red-300">{error}</p>
            <span className="text-[10px] text-neutral-600">
              {motivo.length}/2000
            </span>
          </div>
        </label>
      </div>
    </AppModal>
  );
}
