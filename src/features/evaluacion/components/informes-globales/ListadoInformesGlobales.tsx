import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  UserRound,
} from "lucide-react";

import AppButton from "../../../../components/ui/AppButton";
import type {
  CodigoCategoriaGestionInforme,
} from "../../types/informe-periodo.types";
import type {
  InformeGlobalVersion,
  InformesGlobalesResponse,
} from "../../types/informes-globales.types";
import type { GrupoResultadosEvaluacion } from "../../types/resultados-evaluacion.types";

interface Props {
  versiones: InformeGlobalVersion[];
  paginacion: InformesGlobalesResponse["paginacion"] | null;
  cargandoDetalle: boolean;
  selectedId: string | null;
  onOpen: (id: string) => Promise<void> | void;
  onPageChange: (pagina: number) => void;
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

export default function ListadoInformesGlobales({
  versiones,
  paginacion,
  cargandoDetalle,
  selectedId,
  onOpen,
  onPageChange,
}: Props) {
  if (versiones.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-800 bg-[#101112] px-6 py-16 text-center">
        <FileText className="mx-auto h-9 w-9 text-neutral-700" />
        <p className="mt-3 text-sm font-medium text-neutral-300">
          No hay versiones con estos filtros
        </p>
        <p className="mt-1 text-xs text-neutral-600">
          Ajusta la búsqueda o selecciona una empresa y un periodo para generar la primera versión.
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
            className="rounded-2xl border border-neutral-800 bg-[#101112] p-4 transition hover:border-neutral-700"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-[10px]">
                  <span className="rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2.5 py-1 font-bold uppercase tracking-wider text-cyan-300">
                    Versión {version.numeroVersion}
                  </span>
                  <span className="rounded-full border border-neutral-800 px-2.5 py-1 text-neutral-500">
                    {version.periodo.anio}
                  </span>
                  <span className="text-neutral-600">
                    {etiquetasGrupo[version.grupo]} · {categorias}
                  </span>
                </div>

                <div className="mt-3 flex min-w-0 items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-[#090a0b] text-neutral-500">
                    <Building2 size={17} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-white">
                      {version.empresa.nombre}
                    </h3>
                    <p className="mt-0.5 text-[11px] text-neutral-500">
                      NIT {version.empresa.nit}
                      {version.empresa.ciudadPrincipal
                        ? ` · ${version.empresa.ciudadPrincipal}`
                        : ""}
                    </p>
                    <p className="mt-1 truncate text-xs text-neutral-400">
                      {version.titulo}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-500">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {new Date(version.fechaCorte).toLocaleString("es-CO")}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound size={13} />
                    {version.generadoPor.nombre}
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex flex-wrap gap-3 text-xs">
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
      })}

      {paginacion && paginacion.totalPaginas > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-neutral-800 bg-[#101112] px-4 py-3">
          <p className="text-xs text-neutral-500">
            Página {paginacion.pagina} de {paginacion.totalPaginas}
          </p>
          <div className="flex gap-2">
            <AppButton
              size="sm"
              variant="secondary"
              disabled={paginacion.pagina <= 1}
              leadingIcon={<ChevronLeft size={14} />}
              onClick={() => onPageChange(paginacion.pagina - 1)}
            >
              Anterior
            </AppButton>
            <AppButton
              size="sm"
              variant="secondary"
              disabled={paginacion.pagina >= paginacion.totalPaginas}
              leadingIcon={<ChevronRight size={14} />}
              onClick={() => onPageChange(paginacion.pagina + 1)}
            >
              Siguiente
            </AppButton>
          </div>
        </div>
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
    <div className="min-w-[86px]">
      <p className="text-[9px] uppercase tracking-wider text-neutral-600">
        {label}
      </p>
      <p className="mt-1 font-semibold text-white">{value}</p>
    </div>
  );
}