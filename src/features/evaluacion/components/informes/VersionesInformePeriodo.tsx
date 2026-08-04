import {
  CalendarDays,
  Clock3,
  Database,
  Eye,
  History,
} from "lucide-react";

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
  TODOS: "Todos los estándares",
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

export default function VersionesInformePeriodo({
  versiones,
  cargandoDetalle,
  selectedId,
  onOpen,
}: Props) {
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
      {versiones.map((version) => {
        const categorias = version.categoriasGestion.length
          ? version.categoriasGestion
              .map((codigo) => etiquetasCategoria[codigo])
              .join(" · ")
          : "Todas las categorías";

        return (
          <article
            key={version.id}
            className="rounded-2xl border border-neutral-800 bg-[#090a0b] p-4"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-cyan-300">
                    Versión {version.numeroVersion}
                  </span>
                  <span className="text-[11px] text-neutral-600">
                    {etiquetasGrupo[version.grupo]} · {categorias}
                  </span>
                </div>

                <h3 className="mt-2 text-sm font-semibold text-white">
                  {version.titulo}
                </h3>

                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {new Date(version.fechaCorte).toLocaleString("es-CO")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Database size={13} />
                    {version.totalGestionesFuente} gestiones · {version.totalEvaluacionesFuente} aspectos evaluados
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={13} />
                    {version.generadoPor.nombre}
                  </span>
                </div>

                {version.motivoVersion && (
                  <p className="mt-3 max-w-4xl text-xs leading-5 text-neutral-400">
                    {version.motivoVersion}
                  </p>
                )}

                {version.registrosHistoricosPosteriores > 0 && (
                  <p className="mt-2 text-[11px] font-medium text-amber-300">
                    Incluye {version.registrosHistoricosPosteriores} gestión(es) del periodo registradas después de finalizar el año.
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="grid grid-cols-3 gap-2 text-center">
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
                  Ver versión
                </AppButton>
              </div>
            </div>
          </article>
        );
      })}
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
    <div className="min-w-[90px] rounded-xl border border-neutral-800 bg-neutral-900 px-2.5 py-2">
      <p className="text-[8px] uppercase tracking-wider text-neutral-600">
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold text-white">{value}</p>
    </div>
  );
}
