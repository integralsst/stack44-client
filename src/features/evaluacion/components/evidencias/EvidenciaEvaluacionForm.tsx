import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import {
  Link2,
  Save,
  X,
} from "lucide-react";

import type {
  EvidenciaEvaluacion,
  EvidenciaEvaluacionFormInput,
} from "../../types/evidencia-evaluacion.types";
import AppSpinner from "../feedback/AppSpinner";

const controlClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-950 outline-none transition [color-scheme:light] placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:opacity-50";

function dateInput(value: string | null | undefined) {
  return value?.slice(0, 10) ?? "";
}

export default function EvidenciaEvaluacionForm({
  evidence,
  busy,
  defaultVisibleClient,
  onCancel,
  onSubmit,
}: {
  evidence: EvidenciaEvaluacion | null;
  busy: boolean;
  defaultVisibleClient: boolean;
  onCancel: () => void;
  onSubmit: (
    input: EvidenciaEvaluacionFormInput
  ) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [documentDate, setDocumentDate] = useState("");
  const [visibleClient, setVisibleClient] = useState(
    defaultVisibleClient
  );
  const [localError, setLocalError] = useState<string | null>(
    null
  );

  useEffect(() => {
    setName(evidence?.nombre ?? "");
    setUrl(evidence?.url ?? "");
    setDescription(evidence?.descripcion ?? "");
    setDocumentDate(dateInput(evidence?.fechaDocumento));
    setVisibleClient(
      evidence?.visibleCliente ?? defaultVisibleClient
    );
    setLocalError(null);
  }, [defaultVisibleClient, evidence]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);

    if (!name.trim()) {
      setLocalError("Escribe el nombre de la evidencia.");
      return;
    }

    if (!url.trim()) {
      setLocalError("Agrega el enlace de la evidencia.");
      return;
    }

    try {
      await onSubmit({
        nombre: name.trim(),
        url: url.trim(),
        descripcion: description.trim() || null,
        fechaDocumento: documentDate || null,
        visibleCliente: visibleClient,
      });
    } catch {
      // El hook mantiene el mensaje principal del módulo.
    }
  };

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="rounded-2xl border border-cyan-200 bg-cyan-50 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-950">
            {evidence ? "Editar evidencia" : "Nueva evidencia"}
          </p>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            Registra un enlace de Google Drive o una URL externa. La carga directa de archivos se agregará en una fase posterior.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-300 bg-slate-50 text-slate-600 transition hover:text-slate-950 disabled:opacity-50"
          aria-label="Cerrar formulario"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Nombre del documento
          </span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={busy}
            className={controlClass}
            placeholder="Ej. Certificado curso de 50 horas"
            maxLength={191}
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Enlace
          </span>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
            <input
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              disabled={busy}
              className={`${controlClass} pl-9`}
              placeholder="https://drive.google.com/..."
            />
          </div>
        </label>

        <label>
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Fecha del documento
          </span>
          <input
            type="date"
            value={documentDate}
            onChange={(event) =>
              setDocumentDate(event.target.value)
            }
            disabled={busy}
            className={controlClass}
          />
        </label>

        <label className="flex min-h-[68px] items-center gap-3 rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5">
          <input
            type="checkbox"
            checked={visibleClient}
            onChange={(event) =>
              setVisibleClient(event.target.checked)
            }
            disabled={busy}
            className="h-4 w-4 rounded border-slate-400 bg-slate-50 text-cyan-500"
          />
          <span>
            <span className="block text-xs font-medium text-slate-700">
              Visible para el cliente
            </span>
            <span className="mt-1 block text-[10px] leading-4 text-slate-500">
              Los usuarios cliente podrán consultar este enlace.
            </span>
          </span>
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-600">
            Descripción
          </span>
          <textarea
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            disabled={busy}
            rows={3}
            className={`${controlClass} resize-y`}
            placeholder="Describe brevemente qué demuestra este soporte."
          />
        </label>
      </div>

      {localError && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {localError}
        </p>
      )}

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:text-slate-950 disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={busy}
          className="flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-cyan-700 disabled:opacity-50"
        >
          {busy ? (
            <AppSpinner size="sm" className="text-white" />
          ) : (
            <Save size={16} />
          )}
          {evidence ? "Guardar cambios" : "Agregar evidencia"}
        </button>
      </div>
    </form>
  );
}
