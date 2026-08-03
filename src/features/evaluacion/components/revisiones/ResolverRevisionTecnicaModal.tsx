import {
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

import AppModal from "../../../../components/ui/AppModal";
import type {
  ResolverRevisionTecnicaInput,
  RevisionTecnicaEvaluacionItem,
} from "../../types/revision-tecnica.types";
import AppAlert from "../feedback/AppAlert";
import AppSpinner from "../feedback/AppSpinner";

interface Props {
  open: boolean;
  revision: RevisionTecnicaEvaluacionItem | null;
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (
    input: ResolverRevisionTecnicaInput
  ) => Promise<void>;
}

export default function ResolverRevisionTecnicaModal({
  open,
  revision,
  busy,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [estado, setEstado] = useState<
    ResolverRevisionTecnicaInput["estado"]
  >("APROBADA");
  const [concepto, setConcepto] = useState("");
  const [errorLocal, setErrorLocal] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setEstado("APROBADA");
      setConcepto("");
      setErrorLocal(null);
    }
  }, [open, revision?.id]);

  if (!revision) {
    return null;
  }

  const guardar = async () => {
    const limpio = concepto.trim();

    if (limpio.length < 10) {
      setErrorLocal(
        "El concepto técnico debe tener al menos 10 caracteres."
      );
      return;
    }

    if (limpio.length > 5000) {
      setErrorLocal(
        "El concepto técnico no puede superar los 5000 caracteres."
      );
      return;
    }

    await onSubmit({
      estado,
      conceptoTecnico: limpio,
    });
  };

  return (
    <AppModal
      open={open}
      title="Emitir concepto técnico"
      description={revision.evaluacion.aspecto.nombre}
      onClose={onClose}
      busy={busy}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-2.5 text-sm font-medium text-neutral-300 disabled:opacity-40"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void guardar()}
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"
          >
            {busy && <AppSpinner size="sm" className="text-black" />}
            Guardar concepto
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {error && (
          <AppAlert
            tone="error"
            title="No fue posible resolver la revisión"
            description={error}
          />
        )}

        <div className="rounded-2xl border border-neutral-800 bg-[#090a0b] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Motivo de la solicitud
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-200">
            {revision.motivoSolicitud}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-neutral-300">
            Resultado de la revisión
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setEstado("APROBADA")}
              className={`rounded-2xl border p-4 text-left transition ${
                estado === "APROBADA"
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-neutral-800 bg-[#090a0b] hover:border-neutral-700"
              }`}
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              <p className="mt-3 text-sm font-semibold text-white">
                Aprobar
              </p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                El criterio y los soportes revisados son técnicamente aceptables.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setEstado("REQUIERE_AJUSTES")}
              className={`rounded-2xl border p-4 text-left transition ${
                estado === "REQUIERE_AJUSTES"
                  ? "border-orange-500/40 bg-orange-500/10"
                  : "border-neutral-800 bg-[#090a0b] hover:border-neutral-700"
              }`}
            >
              <Wrench className="h-5 w-5 text-orange-400" />
              <p className="mt-3 text-sm font-semibold text-white">
                Requiere ajustes
              </p>
              <p className="mt-1 text-xs leading-5 text-neutral-500">
                La evaluación no se edita; el profesional corrige mediante una nueva gestión.
              </p>
            </button>
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-neutral-300">
            Concepto técnico
          </span>
          <textarea
            rows={8}
            value={concepto}
            onChange={(event) => {
              setConcepto(event.target.value);
              setErrorLocal(null);
            }}
            placeholder="Explica el análisis realizado, el resultado y las recomendaciones aplicables."
            className="mt-2 w-full resize-y rounded-2xl border border-neutral-700 bg-[#090a0b] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-red-300">{errorLocal}</p>
            <span className="text-[10px] text-neutral-600">
              {concepto.length}/5000
            </span>
          </div>
        </label>
      </div>
    </AppModal>
  );
}
