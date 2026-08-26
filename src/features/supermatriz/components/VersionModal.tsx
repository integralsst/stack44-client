import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Loader2,
} from "lucide-react";

import AppModal from "../../../components/ui/AppModal";
import type {
  MatrixVersion,
  MatrixVersionPayload,
} from "../types/supermatriz.types";

export type VersionModalMode =
  | "crear"
  | "editar"
  | "clonar";

interface Props {
  open: boolean;
  mode: VersionModalMode;
  current: MatrixVersion | null;
  onClose: () => void;
  onSave: (
    payload: MatrixVersionPayload
  ) => Promise<unknown>;
}

const inputClass =
  "w-full rounded-xl border border-neutral-800 bg-[#090909] px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark] placeholder:text-neutral-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10";

function dateValue(
  value: string | null | undefined
): string {
  return value
    ? value.slice(0, 10)
    : "";
}

export default function VersionModal({
  open,
  mode,
  current,
  onClose,
  onSave,
}: Props) {
  const [name, setName] =
    useState("");
  const [
    description,
    setDescription,
  ] = useState("");
  const [
    validFrom,
    setValidFrom,
  ] = useState("");
  const [saving, setSaving] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const requiresStartDate =
    mode === "clonar" ||
    (mode === "editar" &&
      Boolean(current?.clonadaDeId));

  useEffect(() => {
    if (!open) return;

    if (
      mode === "editar" &&
      current
    ) {
      setName(current.nombre);
      setDescription(
        current.descripcion ?? ""
      );
      setValidFrom(
        dateValue(
          current.vigenteDesde
        )
      );
    } else if (
      mode === "clonar" &&
      current
    ) {
      setName(
        `${current.nombre} - actualización`
      );
      setDescription(
        `Nueva versión basada en ${current.nombre}.`
      );
      setValidFrom("");
    } else {
      setName("");
      setDescription("");
      setValidFrom("");
    }

    setError(null);
  }, [open, mode, current]);

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError(null);

    if (
      requiresStartDate &&
      !validFrom
    ) {
      setError(
        "Indica la fecha desde la cual empezará a aplicar esta versión."
      );
      return;
    }

    setSaving(true);

    try {
      await onSave({
        nombre: name.trim(),
        descripcion:
          description.trim() ||
          null,
        vigenteDesde:
          validFrom || null,
        vigenteHasta: null,
      });

      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible guardar la versión."
      );
    } finally {
      setSaving(false);
    }
  };

  const title =
    mode === "crear"
      ? "Nueva versión inicial"
      : mode === "editar"
        ? "Editar versión"
        : "Crear versión sucesora";

  const descriptionText =
    mode === "clonar"
      ? "Se copiará la estructura vigente para aplicar cambios desde una fecha específica. La versión anterior se conservará como histórica al publicar la sucesora."
      : mode === "crear"
        ? "Usa esta opción únicamente para crear la primera Supermatriz. Las versiones posteriores se crean clonando la vigente."
        : "Puedes ajustar los datos del borrador antes de publicarlo.";

  return (
    <AppModal
      open={open}
      title={title}
      description={
        descriptionText
      }
      onClose={onClose}
      busy={saving}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-300"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="matrix-version-form"
            disabled={saving}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"
          >
            {saving && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            {mode ===
            "clonar"
              ? "Crear sucesora"
              : "Guardar"}
          </button>
        </div>
      }
    >
      <form
        id="matrix-version-form"
        onSubmit={submit}
        className="space-y-4"
      >
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-neutral-400">
            Nombre *
          </span>
          <input
            required
            value={name}
            onChange={(event) =>
              setName(
                event.target.value
              )
            }
            placeholder="Ej. Actualización Resolución 1843"
            className={
              inputClass
            }
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-neutral-400">
            Descripción
          </span>
          <textarea
            rows={4}
            value={description}
            onChange={(event) =>
              setDescription(
                event.target.value
              )
            }
            className={`${inputClass} resize-y`}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-neutral-400">
            Vigente desde{requiresStartDate ? " *" : ""}
          </span>
          <input
            type="date"
            required={requiresStartDate}
            value={validFrom}
            onChange={(event) =>
              setValidFrom(
                event.target.value
              )
            }
            className={
              inputClass
            }
          />
          <span className="mt-1.5 block text-xs text-neutral-600">
            {requiresStartDate
              ? "La sucesora empezará a aplicar desde esta fecha. La vigencia final de la versión anterior se calculará automáticamente."
              : "La primera versión puede quedar sin fecha inicial para representar el origen histórico de la Supermatriz."}
          </span>
        </label>
      </form>
    </AppModal>
  );
}
