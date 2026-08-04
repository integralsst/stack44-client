import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import type {
  EstadoMinisterialResultado,
  ResultadoEstandar,
} from "../../types/resultados-evaluacion.types";

interface Props {
  estandares: ResultadoEstandar[];
}

export default function ResultadosEstandares({
  estandares,
}: Props) {
  const [busqueda, setBusqueda] = useState("");

  const filtrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    if (!termino) {
      return estandares;
    }

    return estandares.filter((estandar) =>
      [
        estandar.codigo,
        estandar.nombre,
        estandar.categoria.nombre,
        estandar.cicloPhva.nombre,
        ...estandar.procesos.map((proceso) => proceso.nombre),
      ]
        .filter(Boolean)
        .some((valor) =>
          String(valor).toLowerCase().includes(termino)
        )
    );
  }, [busqueda, estandares]);

  return (
    <div className="space-y-3">
      <label className="relative block">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
        />
        <input
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar estándar, proceso o categoría..."
          className="h-10 w-full rounded-xl border border-neutral-800 bg-[#0a0b0c] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-500/40"
        />
      </label>

      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#0a0b0c] px-5 py-12 text-center text-sm text-neutral-500">
          No hay estándares que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((estandar) => (
            <article
              key={estandar.id}
              className="rounded-2xl border border-neutral-800 bg-[#0a0b0c] p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <EstadoBadge estado={estandar.estadoMinisterial} />
                    <span className="text-[10px] text-neutral-600">
                      {estandar.cicloPhva.codigo} · {estandar.categoria.nombre}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-semibold leading-5 text-white">
                    {estandar.codigo ? `${estandar.codigo} · ` : ""}
                    {estandar.nombre}
                  </h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    {estandar.procesos.map((proceso) => proceso.nombre).join(" · ")}
                  </p>
                </div>

                <div className="grid shrink-0 grid-cols-3 gap-2 text-center">
                  <MiniMetric
                    label="Cobertura"
                    value={`${estandar.coberturaPorcentaje.toFixed(0)}%`}
                  />
                  <MiniMetric
                    label="Administrativo"
                    value={estandar.cumplimientoAdministrativo.toFixed(2)}
                  />
                  <MiniMetric
                    label="Ministerial"
                    value={`${estandar.calificacionMinisterialObtenida.toFixed(2)}/${estandar.calificacionMinisterialEsperada.toFixed(2)}`}
                  />
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                <span className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-neutral-400">
                  {estandar.evaluados}/{estandar.totalAspectos} evaluados
                </span>
                <span className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-emerald-300">
                  {estandar.estados.cumplidos} cumplidos
                </span>
                <span className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-1 text-amber-300">
                  {estandar.estados.parciales} parciales
                </span>
                <span className="rounded-lg border border-red-500/20 bg-red-500/10 px-2 py-1 text-red-300">
                  {estandar.estados.noCumplidos} no cumplen
                </span>
                <span className="rounded-lg border border-neutral-800 bg-neutral-900 px-2 py-1 text-neutral-500">
                  {estandar.estados.sinEvaluar} sin evaluar
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function EstadoBadge({
  estado,
}: {
  estado: EstadoMinisterialResultado;
}) {
  const config = {
    CUMPLE: {
      label: "Cumple",
      className:
        "border-emerald-500/25 bg-emerald-500/10 text-emerald-300",
    },
    NO_CUMPLE: {
      label: "No cumple",
      className: "border-red-500/25 bg-red-500/10 text-red-300",
    },
    SIN_EVALUAR: {
      label: "Sin evaluar",
      className:
        "border-neutral-700 bg-neutral-900 text-neutral-400",
    },
  }[estado];

  return (
    <span
      className={`rounded-full border px-2 py-1 text-[9px] font-bold uppercase tracking-wider ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[82px] rounded-xl border border-neutral-800 bg-neutral-900 px-2.5 py-2">
      <p className="text-[9px] uppercase tracking-wider text-neutral-600">
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold text-white">{value}</p>
    </div>
  );
}
