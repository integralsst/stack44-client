import {
  CalendarRange,
  Eraser,
  FilePlus2,
  Search,
} from "lucide-react";
import type { ReactNode } from "react";

import AppButton from "../../../../components/ui/AppButton";
import AppSelect from "../../../../components/ui/AppSelect";
import type {
  FiltrosInformesGlobales,
  InformesGlobalesResponse,
} from "../../types/informes-globales.types";

interface Props {
  data: InformesGlobalesResponse | null;
  filtros: FiltrosInformesGlobales;
  puedeGenerar: boolean;
  onChange: <K extends keyof FiltrosInformesGlobales>(
    campo: K,
    valor: FiltrosInformesGlobales[K]
  ) => void;
  onEmpresaChange: (empresaId: string) => void;
  onClear: () => void;
  onGenerate: () => void;
}

const inputClass =
  "min-h-10 w-full rounded-xl border border-neutral-800 bg-[#090a0b] px-3 text-sm text-white outline-none transition placeholder:text-neutral-600 hover:border-neutral-700 focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 [color-scheme:dark]";

export default function FiltrosInformesGlobales({
  data,
  filtros,
  puedeGenerar,
  onChange,
  onEmpresaChange,
  onClear,
  onGenerate,
}: Props) {
  const empresaSeleccionada = data?.empresas.find(
    (empresa) => empresa.id === filtros.empresaId
  );
  const anios = empresaSeleccionada
    ? empresaSeleccionada.periodos.map((periodo) => periodo.anio)
    : (data?.aniosDisponibles ?? []);
  const listoParaGenerar =
    Boolean(filtros.empresaId && filtros.anio) && puedeGenerar;

  return (
    <section className="rounded-2xl border border-neutral-800 bg-[#101112] p-4 shadow-xl">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <label className="xl:col-span-2">
          <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
            Buscar
          </span>
          <div className="relative">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
            />
            <input
              value={filtros.buscar}
              onChange={(event) =>
                onChange("buscar", event.target.value)
              }
              placeholder="Empresa, NIT, título o responsable"
              className={`${inputClass} pl-9`}
            />
          </div>
        </label>

        <FilterField label="Empresa">
          <AppSelect
            value={filtros.empresaId}
            onChange={(event) => onEmpresaChange(event.target.value)}
          >
            <option value="">Todas las empresas</option>
            {(data?.empresas ?? []).map((empresa) => (
              <option key={empresa.id} value={empresa.id}>
                {empresa.nombre} · {empresa.nit}
              </option>
            ))}
          </AppSelect>
        </FilterField>

        <FilterField label="Periodo">
          <AppSelect
            value={filtros.anio}
            onChange={(event) => onChange("anio", event.target.value)}
          >
            <option value="">Todos los años</option>
            {anios.map((anio) => (
              <option key={anio} value={anio}>
                {anio}
              </option>
            ))}
          </AppSelect>
        </FilterField>

        <FilterField label="Grupo">
          <AppSelect
            value={filtros.grupo}
            onChange={(event) =>
              onChange(
                "grupo",
                event.target.value as FiltrosInformesGlobales["grupo"]
              )
            }
          >
            <option value="">Todos los grupos</option>
            <option value="TODOS">Informe completo</option>
            <option value="ESTANDARES_7">7 estándares</option>
            <option value="ESTANDARES_21">21 estándares</option>
            <option value="ESTANDARES_60">60 estándares</option>
          </AppSelect>
        </FilterField>

        <FilterField label="Categoría">
          <AppSelect
            value={filtros.categoria}
            onChange={(event) =>
              onChange(
                "categoria",
                event.target.value as FiltrosInformesGlobales["categoria"]
              )
            }
          >
            <option value="">Todas las versiones</option>
            <option value="TODAS">Incluyen todas las categorías</option>
            {(data?.categorias ?? []).map((categoria) => (
              <option key={categoria.id} value={categoria.codigo}>
                {categoria.nombre}
              </option>
            ))}
          </AppSelect>
        </FilterField>

        <FilterField label="Desde">
          <div className="relative">
            <CalendarRange
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
            />
            <input
              type="date"
              value={filtros.fechaDesde}
              onChange={(event) =>
                onChange("fechaDesde", event.target.value)
              }
              className={`${inputClass} pl-9`}
            />
          </div>
        </FilterField>

        <FilterField label="Hasta">
          <div className="relative">
            <CalendarRange
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
            />
            <input
              type="date"
              value={filtros.fechaHasta}
              onChange={(event) =>
                onChange("fechaHasta", event.target.value)
              }
              className={`${inputClass} pl-9`}
            />
          </div>
        </FilterField>
      </div>

      <div className="mt-4 flex flex-col gap-2 border-t border-neutral-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-neutral-500">
          {data?.paginacion.total ?? 0} versión(es) encontradas
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <AppButton
            size="sm"
            variant="secondary"
            leadingIcon={<Eraser size={14} />}
            onClick={onClear}
          >
            Limpiar filtros
          </AppButton>

          {puedeGenerar && (
            <AppButton
              size="sm"
              variant="primary"
              disabled={!listoParaGenerar}
              leadingIcon={<FilePlus2 size={14} />}
              onClick={onGenerate}
            >
              Nueva versión
            </AppButton>
          )}
        </div>
      </div>

      {puedeGenerar && !listoParaGenerar && (
        <p className="mt-2 text-right text-[10px] text-neutral-600">
          Selecciona una empresa y un periodo para generar un informe.
        </p>
      )}
    </section>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label>
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-500">
        {label}
      </span>
      {children}
    </label>
  );
}