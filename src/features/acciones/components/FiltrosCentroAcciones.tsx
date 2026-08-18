import { Search } from "lucide-react";

import type {
  FiltroCategoriaAcciones,
  FiltroPrioridadAcciones,
  ResumenCentroAcciones,
} from "../types/centro-acciones.types";

interface Props {
  busqueda: string;
  categoria: FiltroCategoriaAcciones;
  prioridad: FiltroPrioridadAcciones;
  resumen: ResumenCentroAcciones | null;
  onBusqueda: (value: string) => void;
  onFiltro: (
    categoria: FiltroCategoriaAcciones,
    prioridad: FiltroPrioridadAcciones
  ) => void;
}

export default function FiltrosCentroAcciones({
  busqueda,
  categoria,
  prioridad,
  resumen,
  onBusqueda,
  onFiltro,
}: Props) {
  const filtros = [
    {
      label: "Todas",
      categoria: "TODAS" as const,
      prioridad: "TODAS" as const,
      conteo: resumen?.total,
    },
    {
      label: "Urgentes",
      categoria: "TODAS" as const,
      prioridad: "URGENTE" as const,
      conteo: resumen?.urgentes,
    },
    {
      label: "Compromisos",
      categoria: "COMPROMISOS" as const,
      prioridad: "TODAS" as const,
      conteo: resumen?.categorias.COMPROMISOS,
    },
    {
      label: "Gestiones",
      categoria: "GESTIONES" as const,
      prioridad: "TODAS" as const,
      conteo: resumen?.categorias.GESTIONES,
    },
    {
      label: "Evidencias",
      categoria: "EVIDENCIAS" as const,
      prioridad: "TODAS" as const,
      conteo: resumen?.categorias.EVIDENCIAS,
    },
    {
      label: "Revisiones técnicas",
      categoria: "REVISION_TECNICA" as const,
      prioridad: "TODAS" as const,
      conteo: resumen?.categorias.REVISION_TECNICA,
    },
    {
      label: "No aplica",
      categoria: "NO_APLICA" as const,
      prioridad: "TODAS" as const,
      conteo: resumen?.categorias.NO_APLICA,
    },
    {
      label: "Aprobaciones",
      categoria: "APROBACIONES" as const,
      prioridad: "TODAS" as const,
      conteo: resumen?.categorias.APROBACIONES,
    },
    {
      label: "Auditorías",
      categoria: "AUDITORIAS" as const,
      prioridad: "TODAS" as const,
      conteo: resumen?.categorias.AUDITORIAS,
    },
    ...(resumen?.categorias.OTROS
      ? [
          {
            label: "Otros",
            categoria: "OTROS" as const,
            prioridad: "TODAS" as const,
            conteo: resumen.categorias.OTROS,
          },
        ]
      : []),
  ];

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <label className="relative block">
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={busqueda}
          onChange={(event) => onBusqueda(event.target.value)}
          placeholder="Buscar empresa por nombre, NIT o ciudad..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
        />
      </label>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {filtros.map((filtro) => {
          const activo =
            categoria === filtro.categoria &&
            prioridad === filtro.prioridad;

          return (
            <button
              key={filtro.label}
              type="button"
              aria-pressed={activo}
              onClick={() =>
                onFiltro(filtro.categoria, filtro.prioridad)
              }
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition ${
                activo
                  ? "border-cyan-400 bg-cyan-50 text-cyan-900 shadow-sm ring-1 ring-cyan-100"
                  : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:bg-cyan-50/60 hover:text-cyan-800"
              }`}
            >
              {filtro.label}
              {typeof filtro.conteo === "number" && (
                <span
                  className={`ml-2 rounded-full px-1.5 py-0.5 text-[9px] font-extrabold ${
                    activo
                      ? "bg-cyan-100 text-cyan-950"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {filtro.conteo}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
