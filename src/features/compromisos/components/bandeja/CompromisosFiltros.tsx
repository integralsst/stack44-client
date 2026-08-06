import {
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import type {
  FiltrosCompromisos,
} from "../../types/consulta-compromisos.types";

interface Props {
  value: FiltrosCompromisos;
  onApply: (
    filtros: FiltrosCompromisos
  ) => void;
  onClear: () => void;
  busy?: boolean;
}

export default function CompromisosFiltros({
  value,
  onApply,
  onClear,
  busy = false,
}: Props) {
  const [draft, setDraft] =
    useState<FiltrosCompromisos>(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  const update = (
    field: keyof FiltrosCompromisos,
    currentValue: string
  ) => {
    setDraft((current) => ({
      ...current,
      [field]: currentValue,
    }));
  };

  const submit = (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    onApply(draft);
  };

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
    >
      <div className="mb-4 flex items-center gap-2">
        <SlidersHorizontal
          size={18}
          className="text-cyan-700"
        />
        <h2 className="text-sm font-semibold text-slate-900">
          Filtros de auditoría
        </h2>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="xl:col-span-2">
          <span className="mb-1.5 block text-xs font-medium text-slate-600">
            Búsqueda general
          </span>
          <div className="relative">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={draft.busqueda}
              onChange={(event) =>
                update(
                  "busqueda",
                  event.target.value
                )
              }
              placeholder="Descripción, código, empresa o proceso"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
            />
          </div>
        </label>

        <FilterInput
          label="Empresa"
          value={draft.empresa}
          placeholder="Nombre o NIT"
          onChange={(currentValue) =>
            update("empresa", currentValue)
          }
        />

        <FilterInput
          label="Responsable"
          value={draft.responsable}
          placeholder="Nombre o correo"
          onChange={(currentValue) =>
            update(
              "responsable",
              currentValue
            )
          }
        />

        <FilterInput
          label="Proceso"
          value={draft.proceso}
          placeholder="Nombre del proceso"
          onChange={(currentValue) =>
            update("proceso", currentValue)
          }
        />

        <FilterInput
          label="Aspecto"
          value={draft.aspecto}
          placeholder="Código o nombre"
          onChange={(currentValue) =>
            update("aspecto", currentValue)
          }
        />

        <label>
          <span className="mb-1.5 block text-xs font-medium text-slate-600">
            Estado
          </span>
          <select
            value={draft.estado}
            onChange={(event) =>
              update(
                "estado",
                event.target.value
              )
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="">
              Todos los estados
            </option>
            <option value="ABIERTOS">
              Todos los abiertos
            </option>
            <option value="EN_EJECUCION">
              En ejecución
            </option>
            <option value="PENDIENTE_DE_REASIGNACION">
              Pendiente de reasignación
            </option>
            <option value="SOLICITUD_DE_CIERRE">
              Solicitud de cierre
            </option>
            <option value="CUMPLIDO">
              Cumplido
            </option>
            <option value="CANCELADO">
              Cancelado
            </option>
          </select>
        </label>

        <label>
          <span className="mb-1.5 block text-xs font-medium text-slate-600">
            Vencimiento
          </span>
          <select
            value={draft.vencimiento}
            onChange={(event) =>
              update(
                "vencimiento",
                event.target.value
              )
            }
            className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="TODOS">
              Todos
            </option>
            <option value="VENCIDOS">
              Vencidos
            </option>
            <option value="PROXIMOS_30_DIAS">
              Próximos 30 días
            </option>
            <option value="VIGENTES">
              Vigentes a más de 30 días
            </option>
            <option value="CERRADOS">
              Cerrados
            </option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => {
            onClear();
          }}
          disabled={busy}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <X size={16} />
          Limpiar
        </button>
        <button
          type="submit"
          disabled={busy}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          <Search size={16} />
          Aplicar filtros
        </button>
      </div>
    </form>
  );
}

interface FilterInputProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

function FilterInput({
  label,
  value,
  placeholder,
  onChange,
}: FilterInputProps) {
  return (
    <label>
      <span className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </span>
      <input
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100"
      />
    </label>
  );
}
