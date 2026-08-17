import {
  useEffect,
  useState,
  type FormEvent,
} from "react";
import AppButton from "../../../components/ui/AppButton";
import AppModal from "../../../components/ui/AppModal";
import AppSelect from "../../../components/ui/AppSelect";
import AppAlert from "./feedback/AppAlert";
import type {
  CategoriaGestionEvaluacion,
  CrearGestionInput,
  ModalidadGestion,
} from "../../../types/evaluacion.types";

interface Props {
  open: boolean;
  busy: boolean;
  categorias: CategoriaGestionEvaluacion[];
  initialValues?: Partial<CrearGestionInput> | null;
  correctionContext?: {
    aspectoNombre: string;
    conceptoTecnico: string | null;
  } | null;
  onClose: () => void;
  onSubmit: (data: CrearGestionInput) => Promise<void>;
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition [color-scheme:light] placeholder:text-slate-400 hover:border-slate-400 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:bg-slate-100";

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
  initialValues = null,
  correctionContext = null,
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

  const initialFechaGestion = initialValues?.fechaGestion;
  const initialModalidad = initialValues?.modalidad;
  const initialTipoActividad = initialValues?.tipoActividad;
  const initialCategoriaGestionId = initialValues?.categoriaGestionId;
  const initialObservacionGeneral = initialValues?.observacionGeneral;

  useEffect(() => {
    if (!open) return;

    setFechaGestion(initialFechaGestion ?? todayInput());
    setModalidad(initialModalidad ?? "PRESENCIAL");
    setTipoActividad(initialTipoActividad ?? "");
    setCategoriaGestionId(
      initialCategoriaGestionId
        ? String(initialCategoriaGestionId)
        : ""
    );
    setObservacionGeneral(initialObservacionGeneral ?? "");
    setError(null);
  }, [
    initialCategoriaGestionId,
    initialFechaGestion,
    initialModalidad,
    initialObservacionGeneral,
    initialTipoActividad,
    open,
  ]);

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
      title={
        correctionContext
          ? "Nueva gestión correctiva"
          : "Nueva gestión SG-SST"
      }
      description={
        correctionContext
          ? `Registrarás una nueva evaluación para corregir: ${correctionContext.aspectoNombre}`
          : "Crea la jornada, visita o asesoría dentro de la cual registrarás las evaluaciones."
      }
      onClose={onClose}
      busy={busy}
      size="lg"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <AppButton
            variant="secondary"
            size="lg"
            onClick={onClose}
            disabled={busy}
          >
            Cancelar
          </AppButton>

          <AppButton
            type="submit"
            form="nueva-gestion-form"
            variant="primary"
            size="lg"
            loading={busy}
            loadingLabel="Creando"
          >
            {correctionContext
              ? "Crear y corregir"
              : "Crear y comenzar"}
          </AppButton>
        </div>
      }
    >
      <form
        id="nueva-gestion-form"
        onSubmit={handleSubmit}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        {error && (
          <AppAlert
            tone="error"
            title="No fue posible crear la gestión"
            description={error}
            className="sm:col-span-2"
          />
        )}

        {correctionContext && (
          <div className="sm:col-span-2 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-red-800">
              Concepto técnico que debes corregir
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-700">
              {correctionContext.conceptoTecnico ||
                "El revisor solicitó una nueva evaluación del aspecto."}
            </p>
          </div>
        )}

        <label>
          <span className="mb-1.5 block text-xs font-medium text-slate-600">
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
          <span className="mb-1.5 block text-xs font-medium text-slate-600">
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
          <span className="mb-1.5 block text-xs font-medium text-slate-600">
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
          <span className="mb-1.5 block text-xs font-medium text-slate-600">
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
          <span className="mb-1.5 block text-xs font-medium text-slate-600">
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
