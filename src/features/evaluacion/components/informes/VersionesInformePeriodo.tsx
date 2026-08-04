import {
  CalendarDays,
  CalendarRange,
  Clock3,
  Database,
  Eye,
  History,
  Search,
  X,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import AppButton from "../../../../components/ui/AppButton";
import type {
  CodigoCategoriaGestionInforme,
  InformePeriodoVersionResumen,
} from "../../types/informe-periodo.types";
import type { GrupoResultadosEvaluacion } from "../../types/resultados-evaluacion.types";

interface Props {
  versiones: InformePeriodoVersionResumen[];
  cargandoDetalle: boolean;
  selectedId: string | null;
  onOpen: (id: string) => Promise<void> | void;
}

const etiquetasGrupo: Record<GrupoResultadosEvaluacion, string> = {
  TODOS: "Completo",
  ESTANDARES_7: "7 estándares",
  ESTANDARES_21: "21 estándares",
  ESTANDARES_60: "60 estándares",
};

const etiquetasCategoria: Record<
  CodigoCategoriaGestionInforme,
  string
> = {
  DOCUMENTAL: "Documental",
  INTERVENCION: "Intervención",
  EMERGENCIAS: "Emergencias",
};

const inputClass =
  "min-h-9 w-full rounded-lg border border-neutral-800 bg-[#090a0b] px-3 text-xs text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-500/40 [color-scheme:dark]";

export default function VersionesInformePeriodo({
  versiones,
  cargandoDetalle,
  selectedId,
  onOpen,
}: Props) {
  const [buscar, setBuscar] = useState("");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const filtradas = useMemo(() => {
    const texto = buscar.trim().toLowerCase();

    return versiones.filter((version) => {
      const fecha = version.fechaCorte.slice(0, 10);
      const coincideDesde = !fechaDesde || fecha >= fechaDesde;
      const coincideHasta = !fechaHasta || fecha <= fechaHasta;
      const categorias = version.categoriasGestion.length
        ? version.categoriasGestion
            .map((codigo) => etiquetasCategoria[codigo])
            .join(" ")
        : "todas las categorias";
      const coincideTexto =
        !texto ||
        [
          version.titulo,
          version.motivoVersion ?? "",
          version.generadoPor.nombre,
          etiquetasGrupo[version.grupo],
          categorias,
          `version ${version.numeroVersion}`,
        ].some((value) => value.toLowerCase().includes(texto));

      return coincideDesde && coincideHasta && coincideTexto;
    });
  }, [buscar, fechaDesde, fechaHasta, versiones]);

  const limpiar = () => {
    setBuscar("");
    setFechaDesde("");
    setFechaHasta("");
  };

  if (versiones.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#090a0b] px-5 py-14 text-center">
        <History className="mx-auto h-8 w-8 text-neutral-700" />
        <p className="mt-3 text-sm font-medium text-neutral-300">
          Todavía no hay versiones guardadas
        </p>
        <p className="mt-1 text-xs text-neutral-600">
          La primera versión conservará la fotografía actual del periodo.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-neutral-800 bg-[#090a0b] p-3">
        <div className="grid gap-2 md:grid-cols-[minmax(0,1fr)_170px_170px_auto]">
          <div className="relative">
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
            />
            <input
              value={buscar}
              onChange={(event) => setBuscar(event.target.value)}
              placeholder="Buscar versión, motivo o responsable"
              className={`${inputClass} pl-9`}
            />
          </div>

          <div className="relative">
            <CalendarRange
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
            />
            <input
              type="date"
              value={fechaDesde}
              onChange={(event) => setFechaDesde(event.target.value)}
              aria-label="Fecha inicial"
              className={`${inputClass} pl-9`}
            />
          </div>

          <div className="relative">
            <CalendarRange
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-600"
            />
            <input
              type="date"
              value={fechaHasta}
              onChange={(event) => setFechaHasta(event.target.value)}
              aria-label="Fecha final"
              className={`${inputClass} pl-9`}
            />
          </div>

          <button
            type="button"
            onClick={limpiar}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-lg border border-neutral-800 px-3 text-xs font-medium text-neutral-500 transition hover:border-neutral-700 hover:text-neutral-300"
          >
            <X size={13} />
            Limpiar
          </button>
        </div>
        <p className="mt-2 text-[10px] text-neutral-600">
          {filtradas.length} de {versiones.length} versión(es)
        </p>
      </div>

      {filtradas.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#090a0b] px-5 py-12 text-center">
          <Search className="mx-auto h-7 w-7 text-neutral-700" />
          <p className="mt-3 text-sm text-neutral-400">
            No hay versiones en este rango.
          </p>
        </div>
      ) : (
        filtradas.map((version) => {
          const categorias = version.categoriasGestion.length
            ? version.categoriasGestion
                .map((codigo) => etiquetasCategoria[codigo])
                .join(" · ")
            : "Todas las categorías";

          return (
            <article
              key={version.id}
              className="rounded-2xl border border-neutral-800 bg-[#090a0b] p-4 transition hover:border-neutral-700"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                      Versión {version.numeroVersion}
                    </span>
                    <span className="text-[11px] text-neutral-600">
                      {etiquetasGrupo[version.grupo]} · {categorias}
                    </span>
                  </div>

                  <h3 className="mt-2 truncate text-sm font-semibold text-white">
                    {version.titulo}
                  </h3>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={13} />
                      {new Date(version.fechaCorte).toLocaleString("es-CO")}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={13} />
                      {version.generadoPor.nombre}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Database size={13} />
                      {version.totalGestionesFuente} gestiones · {version.totalEvaluacionesFuente} aspectos
                    </span>
                  </div>

                  {version.motivoVersion && (
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-400">
                      {version.motivoVersion}
                    </p>
                  )}
                </div>

                <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <Metric
                      label="Administrativo"
                      value={
                        version.cumplimientoAdministrativo === null
                          ? "—"
                          : version.cumplimientoAdministrativo.toFixed(2)
                      }
                    />
                    <Metric
                      label="Ministerial"
                      value={
                        version.calificacionMinisterial === null
                          ? "—"
                          : `${version.calificacionMinisterial.toFixed(2)}/${(version.calificacionMinisterialMaxima ?? 0).toFixed(2)}`
                      }
                    />
                    <Metric
                      label="Cobertura"
                      value={
                        version.coberturaPorcentaje === null
                          ? "—"
                          : `${version.coberturaPorcentaje.toFixed(0)}%`
                      }
                    />
                  </div>

                  <AppButton
                    size="sm"
                    variant="secondary"
                    loading={
                      cargandoDetalle && selectedId === version.id
                    }
                    loadingLabel="Abriendo"
                    leadingIcon={<Eye size={14} />}
                    onClick={() => void onOpen(version.id)}
                  >
                    Ver
                  </AppButton>
                </div>
              </div>
            </article>
          );
        })
      )}
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-[84px]">
      <p className="text-[9px] uppercase tracking-wider text-neutral-600">
        {label}
      </p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}