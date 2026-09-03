import {
  Loader2,
  Plus,
  Rows3,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  confirmAction,
  errorMessage,
  showErrorAlert,
  showSuccessToast,
} from "../../../lib/stack44-alerts";
import type {
  AspectCatalog,
  AspectPayload,
  BuildMatrixRowPayload,
  CyclePayload,
  MatrixCatalogs,
  MatrixFilters,
  MatrixTask,
  MatrixTaskListResponse,
  MatrixTaskPayload,
  PhvaCycle,
  ProcessCatalog,
  ProcessPayload,
  Standard,
  StandardCategory,
  StandardCategoryPayload,
  StandardPayload,
} from "../types/supermatriz.types";
import AspectEditorModal from "./AspectEditorModal";
import CatalogEditorModal, {
  type CatalogEditorKind,
  type CatalogEditorRecord,
} from "./CatalogEditorModal";
import MatrixTaskDetailModal from "./MatrixTaskDetailModal";
import SupermatrizFilters from "./SupermatrizFilters";
import SupermatrizTable from "./SupermatrizTable";
import SupermatrizTaskModal from "./SupermatrizTaskModal";

interface Props {
  versionSupermatrizId: number;
  catalogs: MatrixCatalogs;
  filters: MatrixFilters;
  result: MatrixTaskListResponse;
  loading: boolean;
  loadingMore: boolean;
  canEdit: boolean;
  initialProcessId?: number | null;
  onInitialProcessConsumed?: () => void;
  onFiltersChange: (patch: Partial<MatrixFilters>) => void;
  onLoadMore: () => Promise<void>;
  onBuildRow: (payload: BuildMatrixRowPayload) => Promise<unknown>;
  onSaveTask: (
    current: MatrixTask | null,
    payload: MatrixTaskPayload
  ) => Promise<unknown>;
  onDeactivateTask: (id: number) => Promise<unknown>;
  onSaveCycle: (current: PhvaCycle | null, payload: CyclePayload) => Promise<unknown>;
  onSaveCategory: (current: StandardCategory | null, payload: StandardCategoryPayload) => Promise<unknown>;
  onSaveStandard: (current: Standard | null, payload: StandardPayload) => Promise<unknown>;
  onSaveAspect: (
    current: AspectCatalog | null,
    payload: AspectPayload,
    logicaEvaluacion: string | null
  ) => Promise<unknown>;
  onSaveProcess: (current: ProcessCatalog | null, payload: ProcessPayload) => Promise<unknown>;
  onDeactivateCycle: (id: number) => Promise<unknown>;
  onDeactivateCategory: (id: number) => Promise<unknown>;
  onDeactivateStandard: (id: number) => Promise<unknown>;
  onDeactivateAspect: (id: number) => Promise<unknown>;
  onDeactivateProcess: (id: number) => Promise<unknown>;
}

interface CatalogEditorState {
  open: boolean;
  kind: CatalogEditorKind;
  current: CatalogEditorRecord | null;
  initialParentId: number | null;
}

const CLOSED_CATALOG_EDITOR: CatalogEditorState = {
  open: false,
  kind: "ciclo",
  current: null,
  initialParentId: null,
};

export default function TasksPanel({
  versionSupermatrizId,
  catalogs,
  filters,
  result,
  loading,
  loadingMore,
  canEdit,
  initialProcessId = null,
  onInitialProcessConsumed,
  onFiltersChange,
  onLoadMore,
  onBuildRow,
  onSaveTask,
  onDeactivateTask,
  onSaveCycle,
  onSaveCategory,
  onSaveStandard,
  onSaveAspect,
  onSaveProcess,
  onDeactivateCycle,
  onDeactivateCategory,
  onDeactivateStandard,
  onDeactivateAspect,
  onDeactivateProcess,
}: Props) {
  const [editingTask, setEditingTask] = useState<MatrixTask | null>(null);
  const [viewingTask, setViewingTask] = useState<MatrixTask | null>(null);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [processPresetId, setProcessPresetId] = useState<number | null>(null);
  const [deactivatingTaskId, setDeactivatingTaskId] = useState<number | null>(null);
  const [catalogEditor, setCatalogEditor] = useState<CatalogEditorState>(CLOSED_CATALOG_EDITOR);
  const [aspectEditor, setAspectEditor] = useState<{
    open: boolean;
    current: AspectCatalog | null;
    initialStandardId: number | null;
  }>({ open: false, current: null, initialStandardId: null });

  useEffect(() => {
    if (!initialProcessId || !canEdit) return;
    openNewTask(initialProcessId);
    onInitialProcessConsumed?.();
  }, [initialProcessId, canEdit, onInitialProcessConsumed]);

  function openNewTask(processId: number | null = null) {
    setEditingTask(null);
    setProcessPresetId(processId);
    setWizardOpen(true);
  }

  function openEditTask(task: MatrixTask) {
    setViewingTask(null);
    setEditingTask(task);
    setProcessPresetId(null);
    setWizardOpen(true);
  }

  function openCatalogEditor(
    kind: CatalogEditorKind,
    current: CatalogEditorRecord,
    initialParentId: number | null = null
  ) {
    setCatalogEditor({ open: true, kind, current, initialParentId });
  }

  function openAspectEditor(current: AspectCatalog) {
    setAspectEditor({
      open: true,
      current,
      initialStandardId: current.estandarId,
    });
  }

  async function buildRow(payload: BuildMatrixRowPayload) {
    const response = await onBuildRow(payload);
    void showSuccessToast(
      editingTask ? "Fila actualizada" : "Fila completa creada",
      "La matriz se actualizó correctamente."
    );
    return response;
  }

  async function saveTask(current: MatrixTask, payload: MatrixTaskPayload) {
    const response = await onSaveTask(current, payload);
    void showSuccessToast("Cambio guardado", "La fila ya muestra la información actualizada.");
    return response;
  }

  async function deactivateTask(task: MatrixTask) {
    const confirmation = await confirmAction({
      icon: "warning",
      title: "¿Desactivar esta fila?",
      text: `La fila “${task.codigo ?? `#${task.id}`}” dejará de utilizarse, pero permanecerá en el historial.`,
      confirmText: "Sí, desactivar",
      cancelText: "Cancelar",
      danger: true,
    });

    if (!confirmation.isConfirmed) return;

    setDeactivatingTaskId(task.id);
    try {
      await onDeactivateTask(task.id);
      setViewingTask(null);
      void showSuccessToast("Fila desactivada", "La matriz se actualizó automáticamente.");
    } catch (requestError) {
      await showErrorAlert("No se pudo desactivar la fila", errorMessage(requestError));
    } finally {
      setDeactivatingTaskId(null);
    }
  }

  async function deactivateCatalogCurrent() {
    const record = catalogEditor.current;
    if (!record) return;

    const confirmation = await confirmAction({
      icon: "warning",
      title: `¿Desactivar ${record.nombre}?`,
      text: "La operación se bloqueará si todavía existen relaciones activas.",
      confirmText: "Sí, desactivar",
      cancelText: "Cancelar",
      danger: true,
    });

    if (!confirmation.isConfirmed) return false;

    switch (catalogEditor.kind) {
      case "ciclo":
        await onDeactivateCycle(record.id);
        break;
      case "categoria":
        await onDeactivateCategory(record.id);
        break;
      case "estandar":
        await onDeactivateStandard(record.id);
        break;
      case "proceso":
        await onDeactivateProcess(record.id);
        break;
    }

    void showSuccessToast("Registro desactivado", "La matriz se actualizó automáticamente.");
    return true;
  }

  async function deactivateAspectCurrent() {
    const aspect = aspectEditor.current;
    if (!aspect) return;

    const confirmation = await confirmAction({
      icon: "warning",
      title: `¿Desactivar ${aspect.nombre}?`,
      text: "La operación se bloqueará si el aspecto está siendo utilizado por filas activas.",
      confirmText: "Sí, desactivar",
      cancelText: "Cancelar",
      danger: true,
    });

    if (!confirmation.isConfirmed) return false;
    await onDeactivateAspect(aspect.id);
    void showSuccessToast("Aspecto desactivado", "La matriz se actualizó automáticamente.");
    return true;
  }

  return (
    <div className="space-y-4">
      <header className="flex flex-col gap-4 rounded-2xl border border-neutral-800/80 bg-[#111111] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
            <Rows3 size={18} />
          </span>
          <div>
            <h2 className="text-lg font-bold text-white">Filas de la Supermatriz</h2>
            <p className="mt-0.5 text-xs text-neutral-600">{result.paginacion.total} fila{result.paginacion.total === 1 ? "" : "s"}</p>
          </div>
        </div>

        {canEdit && (
          <button
            type="button"
            onClick={() => openNewTask()}
            className="flex min-h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-black hover:bg-neutral-200"
          >
            <Plus size={16} />
            Nueva fila
          </button>
        )}
      </header>

      {!canEdit && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          La versión seleccionada es de solo lectura.
        </div>
      )}

      <SupermatrizFilters catalogs={catalogs} filters={filters} onChange={onFiltersChange} />

      <SupermatrizTable
        tasks={result.items}
        catalogs={catalogs}
        loading={loading}
        canEdit={canEdit}
        deactivatingTaskId={deactivatingTaskId}
        onView={setViewingTask}
        onEdit={openEditTask}
        onDeactivate={(task) => void deactivateTask(task)}
        onEditCycle={(cycle) => openCatalogEditor("ciclo", cycle)}
        onEditCategory={(category) => openCatalogEditor("categoria", category, category.cicloPhvaId)}
        onEditStandard={(standard) => openCatalogEditor("estandar", standard, standard.categoriaEstandarId)}
        onEditAspect={openAspectEditor}
        onEditProcess={(process) => openCatalogEditor("proceso", process)}
        onSaveTask={saveTask}
      />

      <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-neutral-800/70 bg-[#111111] px-4 py-3 text-xs text-neutral-500 sm:flex-row">
        <span>
          Mostrando {result.items.length} de {result.paginacion.total}
        </span>

        {result.items.length < result.paginacion.total ? (
          <button
            type="button"
            disabled={loading || loadingMore}
            onClick={() => {
              void onLoadMore();
            }}
            className="flex min-h-9 items-center justify-center gap-2 rounded-lg border border-neutral-800 bg-[#090909] px-4 font-semibold text-neutral-300 transition hover:border-neutral-700 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loadingMore ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando filas…
              </>
            ) : (
              <>
                Cargar 50 filas más
              </>
            )}
          </button>
        ) : (
          <span className="rounded-lg border border-emerald-500/15 bg-emerald-500/5 px-3 py-2 font-semibold text-emerald-400/80">
            Todas las filas están cargadas
          </span>
        )}
      </div>

      <SupermatrizTaskModal
        open={wizardOpen}
        task={editingTask}
        catalogs={catalogs}
        versionSupermatrizId={versionSupermatrizId}
        initialProcessId={processPresetId}
        onClose={() => {
          setWizardOpen(false);
          setEditingTask(null);
          setProcessPresetId(null);
        }}
        onBuildRow={buildRow}
      />

      <MatrixTaskDetailModal
        open={Boolean(viewingTask)}
        task={viewingTask}
        canEdit={canEdit}
        onClose={() => setViewingTask(null)}
        onEdit={openEditTask}
      />

      <CatalogEditorModal
        open={catalogEditor.open}
        kind={catalogEditor.kind}
        current={catalogEditor.current}
        versionSupermatrizId={versionSupermatrizId}
        catalogs={catalogs}
        initialParentId={catalogEditor.initialParentId}
        onClose={() => setCatalogEditor(CLOSED_CATALOG_EDITOR)}
        onDeactivate={catalogEditor.current ? deactivateCatalogCurrent : undefined}
        onSaveCycle={onSaveCycle}
        onSaveCategory={onSaveCategory}
        onSaveStandard={onSaveStandard}
        onSaveProcess={onSaveProcess}
      />

      <AspectEditorModal
        open={aspectEditor.open}
        current={aspectEditor.current}
        versionSupermatrizId={versionSupermatrizId}
        catalogs={catalogs}
        initialStandardId={aspectEditor.initialStandardId}
        onClose={() => setAspectEditor({ open: false, current: null, initialStandardId: null })}
        onDeactivate={aspectEditor.current ? deactivateAspectCurrent : undefined}
        onSave={onSaveAspect}
      />
    </div>
  );
}
