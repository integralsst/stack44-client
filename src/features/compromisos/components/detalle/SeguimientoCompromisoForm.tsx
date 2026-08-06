import {
  MessageSquarePlus,
} from "lucide-react";
import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import AppButton from "../../../../components/ui/AppButton";
import type { CompromisoDetalle } from "../../types/consulta-compromisos.types";
import type { CrearSeguimientoCompromisoInput } from "../../types/operacion-compromisos.types";

interface Props {
  compromiso: CompromisoDetalle;
  busy: boolean;
  onSubmit: (
    input: CrearSeguimientoCompromisoInput
  ) => Promise<boolean>;
}

export default function SeguimientoCompromisoForm({
  compromiso,
  busy,
  onSubmit,
}: Props) {
  const [descripcion, setDescripcion] =
    useState("");
  const [actividadId, setActividadId] =
    useState("");
  const [visibleCliente, setVisibleCliente] =
    useState(false);
  const [error, setError] =
    useState<string | null>(null);

  const actividades = useMemo(
    () =>
      compromiso.responsables.filter(
        (responsable) =>
          responsable.estado === "ASIGNADA" &&
          responsable.actividad
      ),
    [compromiso.responsables]
  );

  const submit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!descripcion.trim()) {
      setError("Describe el avance realizado.");
      return;
    }

    setError(null);
    const guardado = await onSubmit({
      descripcion: descripcion.trim(),
      actividadId: actividadId || null,
      visibleCliente,
    });

    if (guardado) {
      setDescripcion("");
      setActividadId("");
      setVisibleCliente(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void submit(event)}
      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <MessageSquarePlus
          size={18}
          className="text-cyan-700"
        />
        <h2 className="text-base font-bold text-slate-950">
          Registrar seguimiento
        </h2>
      </div>

      <label className="mt-4 block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">
          Actividad relacionada (opcional)
        </span>
        <select
          value={actividadId}
          onChange={(event) =>
            setActividadId(event.target.value)
          }
          disabled={busy}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="">
            Seguimiento general del compromiso
          </option>
          {actividades.map((responsable) => (
            <option
              key={responsable.actividad!.id}
              value={responsable.actividad!.id}
            >
              {responsable.usuarioResponsable.nombre} ·{" "}
              {responsable.actividad!.descripcion}
            </option>
          ))}
        </select>
      </label>

      <label className="mt-3 block">
        <span className="mb-1.5 block text-xs font-semibold text-slate-600">
          Descripción del avance
        </span>
        <textarea
          value={descripcion}
          onChange={(event) =>
            setDescripcion(event.target.value)
          }
          disabled={busy}
          rows={4}
          className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          placeholder="Indica qué se realizó, qué resultado se obtuvo y qué queda pendiente."
        />
      </label>

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
          Marcar este seguimiento como visible para el cliente.
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
          leadingIcon={<MessageSquarePlus size={16} />}
        >
          Guardar seguimiento
        </AppButton>
      </div>
    </form>
  );
}
