import {
  FilePlus2,
  Link2,
} from "lucide-react";
import {
  useState,
  type FormEvent,
} from "react";

import AppButton from "../../../../components/ui/AppButton";
import type { CrearEvidenciaCompromisoInput } from "../../types/operacion-compromisos.types";

interface Props {
  busy: boolean;
  onSubmit: (
    input: CrearEvidenciaCompromisoInput
  ) => Promise<boolean>;
}

export default function EvidenciaCompromisoForm({
  busy,
  onSubmit,
}: Props) {
  const [nombre, setNombre] = useState("");
  const [url, setUrl] = useState("");
  const [descripcion, setDescripcion] =
    useState("");
  const [fechaDocumento, setFechaDocumento] =
    useState("");
  const [visibleCliente, setVisibleCliente] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!nombre.trim() || !url.trim()) {
      setError(
        "Escribe el nombre y el enlace de la evidencia."
      );
      return;
    }

    setError(null);
    const guardado = await onSubmit({
      nombre: nombre.trim(),
      url: url.trim(),
      descripcion: descripcion.trim() || null,
      fechaDocumento: fechaDocumento || null,
      visibleCliente,
      seguimientoId: null,
    });

    if (guardado) {
      setNombre("");
      setUrl("");
      setDescripcion("");
      setFechaDocumento("");
      setVisibleCliente(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <FilePlus2
          size={18}
          className="text-cyan-700"
        />
        <h2 className="text-base font-bold text-slate-950">
          Agregar evidencia
        </h2>
      </div>
      <p className="mt-1 text-xs leading-5 text-slate-500">
        Registra un enlace de Google Drive o una URL externa. La carga directa de archivos se incorporará en una fase posterior.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Nombre
          </span>
          <input
            value={nombre}
            onChange={(event) =>
              setNombre(event.target.value)
            }
            disabled={busy}
            maxLength={191}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            placeholder="Ej. Acta de capacitación"
          />
        </label>
        <label>
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Fecha del documento
          </span>
          <input
            type="date"
            value={fechaDocumento}
            onChange={(event) =>
              setFechaDocumento(event.target.value)
            }
            disabled={busy}
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Enlace
          </span>
          <div className="relative">
            <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="url"
              value={url}
              onChange={(event) =>
                setUrl(event.target.value)
              }
              disabled={busy}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
              placeholder="https://drive.google.com/..."
            />
          </div>
        </label>
        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-semibold text-slate-600">
            Descripción (opcional)
          </span>
          <textarea
            value={descripcion}
            onChange={(event) =>
              setDescripcion(event.target.value)
            }
            disabled={busy}
            rows={3}
            className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          />
        </label>
      </div>

      <label className="mt-3 flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <input
          type="checkbox"
          checked={visibleCliente}
          onChange={(event) =>
            setVisibleCliente(event.target.checked)
          }
          disabled={busy}
          className="mt-0.5 h-4 w-4 rounded border-slate-300 text-cyan-600"
        />
        <span className="text-sm text-slate-700">
          Permitir que el cliente consulte este enlace.
        </span>
      </label>

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
          {error}
        </p>
      )}

      <div className="mt-4 flex justify-end">
        <AppButton
          type="submit"
          variant="primary"
          loading={busy}
          loadingLabel="Guardando"
          leadingIcon={<FilePlus2 size={16} />}
        >
          Agregar evidencia
        </AppButton>
      </div>
    </form>
  );
}
