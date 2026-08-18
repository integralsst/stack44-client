import type { Dispatch, SetStateAction } from "react";
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Save,
  Search,
  Send,
  SlidersHorizontal,
} from "lucide-react";

import AppButton from "../../../components/ui/AppButton";
import AppDropdownSelect from "../../../components/ui/AppDropdownSelect";

type OptionItem = [number, string];

interface Props {
  busqueda: string;
  setBusqueda: Dispatch<SetStateAction<string>>;
  procesos: OptionItem[];
  procesoId: string;
  setProcesoId: Dispatch<SetStateAction<string>>;
  estandares: OptionItem[];
  estandarId: string;
  setEstandarId: Dispatch<SetStateAction<string>>;
  categoriaGestion: string;
  setCategoriaGestion: Dispatch<SetStateAction<string>>;
  grupoMinisterial: string;
  setGrupoMinisterial: Dispatch<SetStateAction<string>>;
  vigencia: string;
  setVigencia: Dispatch<SetStateAction<string>>;
  mostrarFiltros: boolean;
  setMostrarFiltros: Dispatch<SetStateAction<boolean>>;
  filtrosActivos: number;
  gestionActiva: boolean;
  procesando: boolean;
  cambiosPendientes: number;
  visibles: number;
  totalFiltradas: number;
  onLimpiar: () => void;
  onGuardar: () => void;
  onFinalizar: () => void;
}

export default function MatrizEvaluacionToolbar({
  busqueda,
  setBusqueda,
  procesos,
  procesoId,
  setProcesoId,
  estandares,
  estandarId,
  setEstandarId,
  categoriaGestion,
  setCategoriaGestion,
  grupoMinisterial,
  setGrupoMinisterial,
  vigencia,
  setVigencia,
  mostrarFiltros,
  setMostrarFiltros,
  filtrosActivos,
  gestionActiva,
  procesando,
  cambiosPendientes,
  visibles,
  totalFiltradas,
  onLimpiar,
  onGuardar,
  onFinalizar,
}: Props) {
  const hayBusquedaOFiltros = Boolean(busqueda.trim()) || filtrosActivos > 0;

  return (
    <div className="border-b border-slate-200 bg-white p-3 sm:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-slate-900 sm:text-base">
              Matriz de evaluación
            </h2>
            <p className="mt-0.5 text-[11px] text-slate-500">
              Registra el estado, la nota y los soportes de cada aspecto.
            </p>
          </div>

          {gestionActiva && (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <AppButton
                size="sm"
                variant="success"
                loading={procesando}
                loadingLabel="Procesando"
                disabled={cambiosPendientes === 0}
                leadingIcon={<Save size={14} />}
                onClick={onGuardar}
                fullWidth
                className="sm:w-auto"
              >
                Guardar{cambiosPendientes > 0 ? ` (${cambiosPendientes})` : ""}
              </AppButton>

              <AppButton
                data-action="finalizar"
                size="sm"
                variant="primary"
                disabled={procesando}
                leadingIcon={<Send size={14} />}
                onClick={onFinalizar}
                fullWidth
                className="sm:w-auto"
              >
                Finalizar
              </AppButton>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={15}
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar aspecto, estándar o proceso"
              className="min-h-10 w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/10"
            />
          </div>

          <div className="flex gap-2">
            <AppButton
              size="sm"
              variant={mostrarFiltros || filtrosActivos > 0 ? "success" : "secondary"}
              leadingIcon={<SlidersHorizontal size={14} />}
              trailingIcon={
                mostrarFiltros ? (
                  <ChevronUp size={14} />
                ) : (
                  <ChevronDown size={14} />
                )
              }
              onClick={() => setMostrarFiltros((current) => !current)}
              className="flex-1 sm:flex-none"
            >
              Filtros{filtrosActivos > 0 ? ` (${filtrosActivos})` : ""}
            </AppButton>

            {hayBusquedaOFiltros && (
              <AppButton
                size="sm"
                variant="ghost"
                leadingIcon={<RotateCcw size={14} />}
                onClick={onLimpiar}
              >
                Limpiar
              </AppButton>
            )}
          </div>
        </div>

        {mostrarFiltros && (
          <div className="grid gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2.5 sm:grid-cols-2 xl:grid-cols-5">
            <AppDropdownSelect
              value={procesoId}
              onChange={setProcesoId}
              ariaLabel="Filtrar por proceso"
              size="sm"
              options={[
                { value: "", label: "Todos los procesos" },
                ...procesos.map(([id, nombre]) => ({
                  value: String(id),
                  label: nombre,
                })),
              ]}
            />

            <AppDropdownSelect
              value={estandarId}
              onChange={setEstandarId}
              ariaLabel="Filtrar por estándar"
              size="sm"
              options={[
                { value: "", label: "Todos los estándares" },
                ...estandares.map(([id, nombre]) => ({
                  value: String(id),
                  label: nombre,
                })),
              ]}
            />

            <AppDropdownSelect
              value={categoriaGestion}
              onChange={setCategoriaGestion}
              ariaLabel="Filtrar por categoría de gestión"
              size="sm"
              options={[
                { value: "", label: "Toda la gestión" },
                { value: "DOCUMENTAL", label: "Documental" },
                { value: "INTERVENCION", label: "Intervención" },
                { value: "EMERGENCIAS", label: "Emergencias" },
              ]}
            />

            <AppDropdownSelect
              value={grupoMinisterial}
              onChange={setGrupoMinisterial}
              ariaLabel="Filtrar por grupo ministerial"
              size="sm"
              options={[
                { value: "", label: "Grupos 7 / 21 / 60" },
                { value: "ESTANDARES_7", label: "7 estándares" },
                { value: "ESTANDARES_21", label: "21 estándares" },
                { value: "ESTANDARES_60", label: "60 estándares" },
              ]}
            />

            <AppDropdownSelect
              value={vigencia}
              onChange={setVigencia}
              ariaLabel="Filtrar por vigencia"
              size="sm"
              options={[
                { value: "", label: "Toda vigencia" },
                { value: "SIN_REVISION", label: "Sin revisión" },
                { value: "VIGENTE", label: "Vigente" },
                { value: "POR_VENCER", label: "Por vencer" },
                { value: "VENCIDO", label: "Vencido" },
                { value: "VIGENTE_PERMANENTE", label: "Vigente permanente" },
                { value: "FALTA_FECHA_DOCUMENTO", label: "Falta fecha" },
                { value: "PERIODICIDAD_NO_CONFIGURADA", label: "Periodicidad pendiente" },
                { value: "NO_APLICA", label: "No aplica" },
              ]}
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-2 text-[10px] text-slate-500">
          <span>
            {Math.min(visibles, totalFiltradas)} de {totalFiltradas} aspectos
          </span>
          <span
            className={
              cambiosPendientes > 0
                ? "font-semibold text-cyan-700"
                : "text-slate-500"
            }
          >
            {cambiosPendientes > 0
              ? `${cambiosPendientes} cambio${cambiosPendientes === 1 ? "" : "s"} pendiente${cambiosPendientes === 1 ? "" : "s"}`
              : "Sin cambios pendientes"}
          </span>
        </div>
      </div>
    </div>
  );
}
