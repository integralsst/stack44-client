import {
  RefreshCw,
} from "lucide-react";
import {
  useState,
} from "react";

import { useCompromisos } from "../../hooks/useCompromisos";
import type {
  AlcanceCompromisos,
  FiltrosCompromisos,
} from "../../types/consulta-compromisos.types";
import {
  FILTROS_COMPROMISOS_INICIALES,
} from "../../types/consulta-compromisos.types";
import CompromisosFiltros from "./CompromisosFiltros";
import CompromisosResumen from "./CompromisosResumen";
import CompromisosTable from "./CompromisosTable";

interface Props {
  alcance: AlcanceCompromisos;
  title: string;
  description: string;
  detalleBasePath: string;
}

export default function BandejaCompromisos({
  alcance,
  title,
  description,
  detalleBasePath,
}: Props) {
  const [
    filtrosAplicados,
    setFiltrosAplicados,
  ] = useState<FiltrosCompromisos>(
    FILTROS_COMPROMISOS_INICIALES
  );

  const compromisos = useCompromisos(
    alcance,
    filtrosAplicados
  );

  const aplicarFiltros = (
    filtros: FiltrosCompromisos
  ) => {
    compromisos.reiniciarPagina();
    setFiltrosAplicados({
      ...filtros,
    });
  };

  const limpiarFiltros = () => {
    compromisos.reiniciarPagina();
    setFiltrosAplicados({
      ...FILTROS_COMPROMISOS_INICIALES,
    });
  };

  return (
    <div className="flex w-full flex-col gap-5 pb-8">
      <header className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
            Gestión y trazabilidad
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
            {title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            {description}
          </p>
        </div>
        <button
          type="button"
          onClick={() =>
            void compromisos.recargar()
          }
          disabled={compromisos.cargando}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={
              compromisos.cargando
                ? "animate-spin"
                : ""
            }
          />
          Actualizar
        </button>
      </header>

      {compromisos.error && (
        <div
          role="alert"
          className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          {compromisos.error}
        </div>
      )}

      <CompromisosResumen
        resumen={
          compromisos.data?.resumen ?? null
        }
        cargando={compromisos.cargando}
      />

      <CompromisosFiltros
        value={filtrosAplicados}
        onApply={aplicarFiltros}
        onClear={limpiarFiltros}
        busy={compromisos.cargando}
      />

      <CompromisosTable
        compromisos={
          compromisos.data?.compromisos ??
          []
        }
        paginacion={
          compromisos.data?.paginacion ??
          null
        }
        cargando={compromisos.cargando}
        detalleBasePath={detalleBasePath}
        onPageChange={
          compromisos.cambiarPagina
        }
      />
    </div>
  );
}
