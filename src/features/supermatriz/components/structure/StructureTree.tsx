import {
  ChevronDown,
  ChevronRight,
  Edit2,
  Plus,
  Trash2,
} from "lucide-react";
import {
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type {
  AspectCatalog,
  MatrixCatalogs,
  PhvaCycle,
  Standard,
  StandardCategory,
} from "../../types/supermatriz.types";

interface Props {
  catalogs: MatrixCatalogs;
  canEdit: boolean;
  search: string;
  onCreateCategory: (cycleId: number) => void;
  onCreateStandard: (categoryId: number) => void;
  onCreateAspect: (standardId: number) => void;
  onEditCycle: (cycle: PhvaCycle) => void;
  onEditCategory: (category: StandardCategory) => void;
  onEditStandard: (standard: Standard) => void;
  onEditAspect: (aspect: AspectCatalog) => void;
  onDeactivateCycle: (cycle: PhvaCycle) => void;
  onDeactivateCategory: (category: StandardCategory) => void;
  onDeactivateStandard: (standard: Standard) => void;
  onDeactivateAspect: (aspect: AspectCatalog) => void;
}

interface VisibleStandard {
  standard: Standard;
  aspects: AspectCatalog[];
}

interface VisibleCategory {
  category: StandardCategory;
  standards: VisibleStandard[];
}

interface VisibleCycle {
  cycle: PhvaCycle;
  categories: VisibleCategory[];
}

function matchesSearch(
  search: string,
  ...values: Array<string | null | undefined>
): boolean {
  return values.some((value) =>
    (value ?? "").toLowerCase().includes(search)
  );
}

export default function StructureTree({
  catalogs,
  canEdit,
  search,
  onCreateCategory,
  onCreateStandard,
  onCreateAspect,
  onEditCycle,
  onEditCategory,
  onEditStandard,
  onEditAspect,
  onDeactivateCycle,
  onDeactivateCategory,
  onDeactivateStandard,
  onDeactivateAspect,
}: Props) {
  const [closedCycles, setClosedCycles] = useState<number[]>([]);
  const [closedCategories, setClosedCategories] = useState<number[]>([]);
  const [closedStandards, setClosedStandards] = useState<number[]>([]);

  const normalizedSearch = search.trim().toLowerCase();

  const structure = useMemo<VisibleCycle[]>(() => {
    const showAll = !normalizedSearch;

    return catalogs.ciclosPhva.flatMap((cycle) => {
      const cycleMatches =
        showAll ||
        matchesSearch(
          normalizedSearch,
          cycle.codigo,
          cycle.nombre
        );

      const categories = catalogs.categoriasEstandar
        .filter((category) => category.cicloPhvaId === cycle.id)
        .flatMap<VisibleCategory>((category) => {
          const categoryMatches =
            cycleMatches ||
            matchesSearch(
              normalizedSearch,
              category.codigo,
              category.nombre
            );

          const standards = catalogs.estandares
            .filter(
              (standard) =>
                standard.categoriaEstandarId === category.id
            )
            .flatMap<VisibleStandard>((standard) => {
              const standardMatches =
                categoryMatches ||
                matchesSearch(
                  normalizedSearch,
                  standard.codigo,
                  standard.nombre
                );

              const aspects = catalogs.aspectos.filter(
                (aspect) =>
                  aspect.estandarId === standard.id &&
                  (standardMatches ||
                    matchesSearch(
                      normalizedSearch,
                      aspect.codigo,
                      aspect.nombre,
                      aspect.planAccionEspecifico?.descripcion
                    ))
              );

              if (!standardMatches && aspects.length === 0) {
                return [];
              }

              return [
                {
                  standard,
                  aspects,
                },
              ];
            });

          if (!categoryMatches && standards.length === 0) {
            return [];
          }

          return [
            {
              category,
              standards,
            },
          ];
        });

      if (!cycleMatches && categories.length === 0) {
        return [];
      }

      return [
        {
          cycle,
          categories,
        },
      ];
    });
  }, [
    catalogs.aspectos,
    catalogs.categoriasEstandar,
    catalogs.ciclosPhva,
    catalogs.estandares,
    normalizedSearch,
  ]);

  function toggle(list: number[], id: number, setter: (value: number[]) => void) {
    setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  }

  if (structure.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-neutral-800 px-5 py-16 text-center text-sm text-neutral-500">
        No se encontraron elementos en la estructura.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {structure.map(({ cycle, categories }) => {
        const cycleClosed = closedCycles.includes(cycle.id) && !normalizedSearch;

        return (
          <section
            key={cycle.id}
            className="overflow-hidden rounded-2xl border border-neutral-800/80 bg-[#111111]"
          >
            <NodeRow
              level={0}
              open={!cycleClosed}
              title={cycle.codigo ? `${cycle.codigo} · ${cycle.nombre}` : cycle.nombre}
              meta={`${categories.length} categoría${categories.length === 1 ? "" : "s"}`}
              onToggle={() => toggle(closedCycles, cycle.id, setClosedCycles)}
              actions={
                canEdit ? (
                  <NodeActions
                    onAdd={() => onCreateCategory(cycle.id)}
                    addLabel="Nueva categoría"
                    onEdit={() => onEditCycle(cycle)}
                    onDelete={() => onDeactivateCycle(cycle)}
                  />
                ) : null
              }
            />

            {!cycleClosed && (
              <div className="border-t border-neutral-800/70">
                {categories.length === 0 ? (
                  <EmptyChild text="Este ciclo todavía no tiene categorías." />
                ) : (
                  categories.map(({ category, standards }) => {
                    const categoryClosed = closedCategories.includes(category.id) && !normalizedSearch;

                    return (
                      <div key={category.id} className="border-b border-neutral-800/60 last:border-b-0">
                        <NodeRow
                          level={1}
                          open={!categoryClosed}
                          title={category.codigo ? `${category.codigo} · ${category.nombre}` : category.nombre}
                          meta={`${standards.length} estándar${standards.length === 1 ? "" : "es"}`}
                          onToggle={() => toggle(closedCategories, category.id, setClosedCategories)}
                          actions={
                            canEdit ? (
                              <NodeActions
                                onAdd={() => onCreateStandard(category.id)}
                                addLabel="Nuevo estándar"
                                onEdit={() => onEditCategory(category)}
                                onDelete={() => onDeactivateCategory(category)}
                              />
                            ) : null
                          }
                        />

                        {!categoryClosed && (
                          <div>
                            {standards.length === 0 ? (
                              <EmptyChild text="Esta categoría todavía no tiene estándares." level={2} />
                            ) : (
                              standards.map(({ standard, aspects }) => {
                                const standardClosed = closedStandards.includes(standard.id) && !normalizedSearch;

                                return (
                                  <div key={standard.id} className="border-t border-neutral-800/60">
                                    <NodeRow
                                      level={2}
                                      open={!standardClosed}
                                      title={standard.codigo ? `${standard.codigo} · ${standard.nombre}` : standard.nombre}
                                      meta={`${aspects.length} aspecto${aspects.length === 1 ? "" : "s"}`}
                                      onToggle={() => toggle(closedStandards, standard.id, setClosedStandards)}
                                      actions={
                                        canEdit ? (
                                          <NodeActions
                                            onAdd={() => onCreateAspect(standard.id)}
                                            addLabel="Nuevo aspecto"
                                            onEdit={() => onEditStandard(standard)}
                                            onDelete={() => onDeactivateStandard(standard)}
                                          />
                                        ) : null
                                      }
                                    />

                                    {!standardClosed && (
                                      <div>
                                        {aspects.length === 0 ? (
                                          <EmptyChild text="Este estándar todavía no tiene aspectos." level={3} />
                                        ) : (
                                          aspects.map((aspect) => (
                                            <div
                                              key={aspect.id}
                                              className="flex items-start justify-between gap-3 border-t border-neutral-800/50 py-3 pl-12 pr-3 sm:pl-20"
                                            >
                                              <div className="min-w-0">
                                                <p className="text-sm leading-5 text-neutral-200">
                                                  {aspect.codigo ? `${aspect.codigo} · ` : ""}{aspect.nombre}
                                                </p>
                                                <p className="mt-1 text-xs leading-5 text-neutral-600">
                                                  {aspect.planAccionEspecifico?.descripcion ?? "Sin plan de acción"}
                                                </p>
                                              </div>
                                              {canEdit && (
                                                <div className="flex shrink-0 gap-1">
                                                  <IconButton label="Editar aspecto" onClick={() => onEditAspect(aspect)}>
                                                    <Edit2 size={14} />
                                                  </IconButton>
                                                  <IconButton label="Desactivar aspecto" onClick={() => onDeactivateAspect(aspect)} danger>
                                                    <Trash2 size={14} />
                                                  </IconButton>
                                                </div>
                                              )}
                                            </div>
                                          ))
                                        )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

function NodeRow({
  level,
  open,
  title,
  meta,
  onToggle,
  actions,
}: {
  level: number;
  open: boolean;
  title: string;
  meta: string;
  onToggle: () => void;
  actions: ReactNode;
}) {
  const padding = level === 0 ? "pl-4" : level === 1 ? "pl-8 sm:pl-10" : "pl-12 sm:pl-16";

  return (
    <div className={`flex items-center justify-between gap-3 py-3 pr-3 ${padding}`}>
      <button
        type="button"
        onClick={onToggle}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        {open ? <ChevronDown size={16} className="shrink-0 text-neutral-500" /> : <ChevronRight size={16} className="shrink-0 text-neutral-500" />}
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-white">{title}</span>
          <span className="mt-0.5 block text-[10px] uppercase tracking-wider text-neutral-600">{meta}</span>
        </span>
      </button>
      {actions}
    </div>
  );
}

function NodeActions({
  onAdd,
  addLabel,
  onEdit,
  onDelete,
}: {
  onAdd: () => void;
  addLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 items-center gap-1">
      <IconButton label={addLabel} onClick={onAdd}><Plus size={14} /></IconButton>
      <IconButton label="Editar" onClick={onEdit}><Edit2 size={14} /></IconButton>
      <IconButton label="Desactivar" onClick={onDelete} danger><Trash2 size={14} /></IconButton>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition ${
        danger
          ? "border-red-500/15 bg-red-500/5 text-red-400 hover:bg-red-500/15"
          : "border-neutral-800 bg-[#090909] text-neutral-500 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function EmptyChild({ text, level = 1 }: { text: string; level?: number }) {
  const padding = level === 1 ? "pl-10" : level === 2 ? "pl-16" : "pl-20";
  return <div className={`border-t border-neutral-800/50 py-4 pr-4 text-xs text-neutral-600 ${padding}`}>{text}</div>;
}
