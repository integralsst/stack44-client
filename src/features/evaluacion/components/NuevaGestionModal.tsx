import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import { Loader2 } from "lucide-react";

import AppModal from "../../../components/ui/AppModal";
import AppSelect from "../../../components/ui/AppSelect";
import type {
  CategoriaGestionEvaluacion,
  CrearGestionInput,
  ModalidadGestion,
} from "../types/evaluacion.types";

interface Props {
  open: boolean;
  busy: boolean;
  categorias: CategoriaGestionEvaluacion[];
  onClose: () => void;
  onSubmit: (data: CrearGestionInput) => Promise<void>;
}

const inputClass =
  "w-full rounded-xl border border-neutral-800 bg-[#090909] px-3 py-2.5 text-sm text-white outline-none transition [color-scheme:dark] placeholder:text-neutral-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10";

function todayInput(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 10);
}

export default function NuevaGestionModal({
  open,
  busy,
  categorias,
  onClose,
  onSubmit,
}: Props) {
  const [fechaGestion, setFechaGestion] = useState(todayInput());
  const [modalidad, setModalidad] =
    useState<ModalidadGestion>("PRESENCIAL");
  const [tipoActividad, setTipoActividad] = useState("");
  const [categoriaGestionId, setCategoriaGestionId] =
    useState("");
  const [observacionGeneral, setObservacionGeneral] =
    useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    setFechaGestion(todayInput());
    setModalidad("PRESENCIAL");
    setTipoActividad("");
    setCategoriaGestionId("");
    setObservacionGeneral("");
    setError(null);
  }, [open]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError(null);

    if (!tipoActividad.trim()) {
      setError("Indica qué actividad o gestión se va a realizar.");
      return;
    }

    try {
      await onSubmit({
        fechaGestion,
        modalidad,
        tipoActividad: tipoActividad.trim(),
        categoriaGestionId: categoriaGestionId
          ? Number(categoriaGestionId)
          : null,
        observacionGeneral:
          observacionGeneral.trim() || null,
      });
      onClose();
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible crear la gestión."
      );
    }
  };

  return (
    <AppModal
      open={open}
      title="Nueva gestión SG-SST"
      description="Crea la jornada, visita o asesoría dentro de la cual registrarás las evaluaciones."
      onClose={onClose}
      busy={busy}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-300 transition hover:bg-neutral-700 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            form="nueva-gestion-form"
            disabled={busy}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black transition hover:bg-neutral-200 disabled:opacity-50"
          >
            {busy && <Loader2 size={16} className="animate-spin" />}
            Crear y comenzar
          </button>
        </div>
      }
    >
      <form
        id="nueva-gestion-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {error && (
          <div className="sm:col-span-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <label>
          <span className="mb-1.5 block text-xs font-medium text-neutral-400">
            Fecha de la gestión *
          </span>
          <input
            type="date"
            required
            value={fechaGestion}
            onChange={(event) =>
              setFechaGestion(event.target.value)
            }
            className={inputClass}
          />
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-medium text-neutral-400">
            Modalidad *
          </span>
          <AppSelect
            value={modalidad}
            onChange={(event) =>
              setModalidad(
                event.target.value as ModalidadGestion
              )
            }
          >
            <option value="PRESENCIAL">Presencial</option>
            <option value="REMOTA">Remota</option>
            <option value="OFICINA">Trabajo de oficina</option>
            <option value="SEGUIMIENTO_PUNTUAL">
              Seguimiento puntual
            </option>
          </AppSelect>
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-neutral-400">
            Actividad realizada *
          </span>
          <input
            type="text"
            value={tipoActividad}
            onChange={(event) =>
              setTipoActividad(event.target.value)
            }
            placeholder="Ej. Revisión documental del estándar 2.5"
            className={inputClass}
          />
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-neutral-400">
            Categoría principal de gestión
          </span>
          <AppSelect
            value={categoriaGestionId}
            onChange={(event) =>
              setCategoriaGestionId(event.target.value)
            }
          >
            <option value="">Sin categoría principal</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </AppSelect>
        </label>

        <label className="sm:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-neutral-400">
            Observación general
          </span>
          <textarea
            rows={4}
            value={observacionGeneral}
            onChange={(event) =>
              setObservacionGeneral(event.target.value)
            }
            placeholder="Contexto general de la visita o asesoría..."
            className={`${inputClass} resize-y`}
          />
        </label>
      </form>
    </AppModal>
  );
}
