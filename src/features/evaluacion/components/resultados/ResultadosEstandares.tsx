import { Clock3, Search } from "lucide-react";
import { useMemo, useState } from "react";

import type {
  ConteoProvisionalesResultado,
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
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
        />
        <input
          value={busqueda}
          onChange={(event) => setBusqueda(event.target.value)}
          placeholder="Buscar estándar, proceso o categoría..."
          className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
        />
      </label>

      {filtrados.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-12 text-center text-sm text-slate-600">
          No hay estándares que coincidan con la búsqueda.
        </div>
      ) : (
        <div className="space-y-2">
          {filtrados.map((estandar) => {
            const provisionales = estandar.provisionales;
            const tieneProvisionales =
              (provisionales?.total ?? 0) > 0;

            return (
              <article
                key={estandar.id}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <EstadoBadge estado={estandar.estadoMinisterial} />
                      {tieneProvisionales && <ProvisionalBadge />}
                      <span className="text-[10px] font-medium text-slate-500">
                        {estandar.cicloPhva.codigo} · {estandar.categoria.nombre}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold leading-5 text-slate-900">
                      {estandar.codigo ? `${estandar.codigo} · ` : ""}
                      {estandar.nombre}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      {estandar.procesos.map((proceso) => proceso.nombre).join(" · ")}
                    </p>

                    {tieneProvisionales && provisionales && (
                      <ProvisionalNotice provisionales={provisionales} />
                    )}
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
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-slate-700">
                    {estandar.evaluados}/{estandar.totalAspectos} evaluados
                  </span>
                  <span className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-800">
                    {estandar.estados.cumplidos} cumplidos
                  </span>
                  <span className="rounded-lg border border-amber-200 bg-amber-50 px-2 py-1 text-amber-800">
                    {estandar.estados.parciales} parciales
                  </span>
                  <span className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-red-800">
                    {estandar.estados.noCumplidos} no cumplen
                  </span>
                  <span className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-slate-600">
                    {estandar.estados.sinEvaluar} sin evaluar
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ProvisionalBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-amber-800">
      <Clock3 size={11} />
      Provisional
    </span>
  );
}

function ProvisionalNotice({
  provisionales,
}: {
  provisionales: ConteoProvisionalesResultado;
}) {
  const causas: string[] = [];

  if (provisionales.aprobacionGestion > 0) {
    causas.push(
      `${provisionales.aprobacionGestion} pendiente${
        provisionales.aprobacionGestion === 1 ? "" : "s"
      } de aprobación administrativa`
    );
  }

  if (provisionales.noAplica > 0) {
    causas.push(
      `${provisionales.noAplica} pendiente${
        provisionales.noAplica === 1 ? "" : "s"
      } de decisión No aplica`
    );
  }

  if (provisionales.revisionTecnica > 0) {
    causas.push(
      `${provisionales.revisionTecnica} pendiente${
        provisionales.revisionTecnica === 1 ? "" : "s"
      } de revisión técnica`
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-[11px] leading-5 text-amber-900">
      <span className="font-semibold">
        {provisionales.total}{" "}
        {provisionales.total === 1
          ? "evaluación provisional"
          : "evaluaciones provisionales"}
      </span>
      {causas.length > 0 ? ` · ${causas.join(" · ")}` : ""}. El resultado
      ministerial no se considera firme mientras el control permanezca
      pendiente.
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
        "border-emerald-200 bg-emerald-50 text-emerald-800",
    },
    NO_CUMPLE: {
      label: "No cumple",
      className: "border-red-200 bg-red-50 text-red-800",
    },
    SIN_EVALUAR: {
      label: "Sin evaluar",
      className:
        "border-slate-200 bg-slate-50 text-slate-700",
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
    <div className="min-w-[82px] rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-2">
      <p className="text-[9px] uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold text-slate-900">{value}</p>
    </div>
  );
}
