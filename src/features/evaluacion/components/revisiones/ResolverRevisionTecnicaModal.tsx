import {
  CheckCircle2,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";

import AppButton from "../../../../components/ui/AppButton";
import AppModal from "../../../../components/ui/AppModal";
import type {
  ResolverRevisionTecnicaInput,
  RevisionTecnicaEvaluacionItem,
} from "../../types/revision-tecnica.types";
import AppAlert from "../feedback/AppAlert";

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
        "El concepto debe tener al menos 10 caracteres."
      );
      return;
    }

    if (limpio.length > 5000) {
      setErrorLocal(
        "El concepto no puede superar los 5000 caracteres."
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
      title="Resolver revisión"
      description={revision.evaluacion.aspecto.nombre}
      onClose={onClose}
      busy={busy}
      size="md"
      footer={
        <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
          <AppButton
            variant="secondary"
            onClick={onClose}
            disabled={busy}
            fullWidth
            className="sm:w-auto"
          >
            Cancelar
          </AppButton>
          <AppButton
            variant="primary"
            onClick={() => void guardar()}
            loading={busy}
            loadingLabel="Guardando"
            fullWidth
            className="sm:w-auto"
          >
            Guardar concepto
          </AppButton>
        </div>
      }
    >
      <div className="space-y-4">
        {error && (
          <AppAlert
            tone="error"
            title="No fue posible resolver la revisión"
            description={error}
          />
        )}

        <div className="rounded-xl border border-neutral-800 bg-[#090a0b] p-3.5">
          <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Motivo
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-200">
            {revision.motivoSolicitud}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-neutral-300">
            Resultado
          </p>
          <div className="grid grid-cols-2 gap-2">
            <DecisionButton
              active={estado === "APROBADA"}
              icon={CheckCircle2}
              label="Aprobar"
              description="La evaluación es aceptable."
              tone="success"
              onClick={() => setEstado("APROBADA")}
            />
            <DecisionButton
              active={estado === "REQUIERE_AJUSTES"}
              icon={Wrench}
              label="Corregir"
              description="Requiere una nueva evaluación."
              tone="warning"
              onClick={() => setEstado("REQUIERE_AJUSTES")}
            />
          </div>
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-neutral-300">
            Concepto técnico
          </span>
          <textarea
            rows={6}
            value={concepto}
            onChange={(event) => {
              setConcepto(event.target.value);
              setErrorLocal(null);
            }}
            placeholder={
              estado === "APROBADA"
                ? "Resume la validación realizada."
                : "Indica claramente qué debe corregirse."
            }
            className="mt-2 w-full resize-y rounded-xl border border-neutral-700 bg-[#090a0b] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10"
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

function DecisionButton({
  active,
  icon: Icon,
  label,
  description,
  tone,
  onClick,
}: {
  active: boolean;
  icon: typeof CheckCircle2;
  label: string;
  description: string;
  tone: "success" | "warning";
  onClick: () => void;
}) {
  const activeClass =
    tone === "success"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : "border-amber-500/40 bg-amber-500/10 text-amber-300";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-xl border p-3 text-left transition ${
        active
          ? activeClass
          : "border-neutral-800 bg-[#090a0b] text-neutral-500 hover:border-neutral-700"
      }`}
    >
      <div className="flex items-center gap-2">
        <Icon size={16} />
        <p className="text-sm font-semibold text-white">{label}</p>
      </div>
      <p className="mt-1.5 text-[11px] leading-4 text-neutral-500">
        {description}
      </p>
    </button>
  );
}
