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
import AppSelect from "../../../components/ui/AppSelect";

interface OptionItem {
  id: number;
  nombre: string;
}

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
    <div className="border-b border-neutral-800 bg-[#0b0c0d] p-3 sm:p-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-white sm:text-base">
              Matriz de evaluación
            </h2>
            <p className="mt-0.5 text-[11px] text-neutral-500">
              Registra el estado, la nota y los soportes de cada aspecto.
            </p>
          </div>

          {gestionActiva && (
            <div className="grid grid-cols-2 gap-2 sm:flex sm:justify-end">
              <AppButton
                size="sm"
                variant="success"
                loading={procesando}
                loadingLabel="Guardando"
                disabled={cambiosPendientes === 0}
                leadingIcon={<Save size={14} />}
                onClick={onGuardar}
                fullWidth
                className="sm:w-auto"
              >
                Guardar{cambiosPendientes > 0 ? ` (${cambiosPendientes})` : ""}
              </AppButton>

              <AppButton
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
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500"
            />
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar aspecto, estándar o proceso"
              className="min-h-10 w-full rounded-xl border border-neutral-700 bg-[#090a0b] py-2 pl-9 pr-3 text-sm text-white outline-none transition-colors [color-scheme:dark] placeholder:text-neutral-600 hover:border-neutral-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10"
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
          <div className="grid gap-2 rounded-xl border border-neutral-800 bg-[#090a0b] p-2.5 sm:grid-cols-2 xl:grid-cols-5">
            <AppSelect
              selectSize="sm"
              value={procesoId}
              onChange={(event) => setProcesoId(event.target.value)}
              aria-label="Filtrar por proceso"
            >
              <option value="">Todos los procesos</option>
              {procesos.map((proceso) => (
                <option key={proceso.id} value={proceso.id}>
                  {proceso.nombre}
                </option>
              ))}
            </AppSelect>

            <AppSelect
              selectSize="sm"
              value={estandarId}
              onChange={(event) => setEstandarId(event.target.value)}
              aria-label="Filtrar por estándar"
            >
              <option value="">Todos los estándares</option>
              {estandares.map((estandar) => (
                <option key={estandar.id} value={estandar.id}>
                  {estandar.nombre}
                </option>
              ))}
            </AppSelect>

            <AppSelect
              selectSize="sm"
              value={categoriaGestion}
              onChange={(event) => setCategoriaGestion(event.target.value)}
              aria-label="Filtrar por categoría de gestión"
            >
              <option value="">Toda la gestión</option>
              <option value="DOCUMENTAL">Documental</option>
              <option value="INTERVENCION">Intervención</option>
              <option value="EMERGENCIAS">Emergencias</option>
            </AppSelect>

            <AppSelect
              selectSize="sm"
              value={grupoMinisterial}
              onChange={(event) => setGrupoMinisterial(event.target.value)}
              aria-label="Filtrar por grupo ministerial"
            >
              <option value="">Grupos 7 / 21 / 60</option>
              <option value="ESTANDARES_7">7 estándares</option>
              <option value="ESTANDARES_21">21 estándares</option>
              <option value="ESTANDARES_60">60 estándares</option>
            </AppSelect>

            <AppSelect
              selectSize="sm"
              value={vigencia}
              onChange={(event) => setVigencia(event.target.value)}
              aria-label="Filtrar por vigencia"
            >
              <option value="">Toda vigencia</option>
              <option value="SIN_REVISION">Sin revisión</option>
              <option value="VIGENTE">Vigente</option>
              <option value="POR_VENCER">Por vencer</option>
              <option value="VENCIDO">Vencido</option>
              <option value="VIGENTE_PERMANENTE">Vigente permanente</option>
              <option value="FALTA_FECHA_DOCUMENTO">Falta fecha</option>
              <option value="PERIODICIDAD_NO_CONFIGURADA">
                Periodicidad pendiente
              </option>
              <option value="NO_APLICA">No aplica</option>
            </AppSelect>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-800/80 pt-2 text-[10px] text-neutral-500">
          <span>
            {Math.min(visibles, totalFiltradas)} de {totalFiltradas} aspectos
          </span>
          <span
            className={
              cambiosPendientes > 0
                ? "font-semibold text-cyan-300"
                : "text-neutral-600"
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
