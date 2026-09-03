import {
  Layers3,
  Plus,
  Search,
} from "lucide-react";
import {
  useState,
} from "react";
import {
  confirmAction,
  errorMessage,
  showErrorAlert,
  showSuccessToast,
} from "../../../../lib/stack44-alerts";
import type {
  AspectCatalog,
  AspectPayload,
  CyclePayload,
  MatrixCatalogs,
  PhvaCycle,
  ProcessCatalog,
  ProcessPayload,
  Standard,
  StandardCategory,
  StandardCategoryPayload,
  StandardPayload,
} from "../../types/supermatriz.types";
import AspectEditorModal from "../AspectEditorModal";
import CatalogEditorModal, {
  type CatalogEditorKind,
  type CatalogEditorRecord,
} from "../CatalogEditorModal";
import ProcessesWorkspace from "./ProcessesWorkspace";
import StructureTree from "./StructureTree";

interface Props {
  versionSupermatrizId: number;
  catalogs: MatrixCatalogs;
  canEdit: boolean;
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
  onCreateRowForProcess: (process: ProcessCatalog) => void;
  onShowRowsForProcess: (process: ProcessCatalog) => void;
}

interface CatalogEditorState {
  open: boolean;
  kind: CatalogEditorKind;
  current: CatalogEditorRecord | null;
  initialParentId: number | null;
}

const CLOSED_EDITOR: CatalogEditorState = {
  open: false,
  kind: "ciclo",
  current: null,
  initialParentId: null,
};

export default function StructureWorkspace({
  versionSupermatrizId,
  catalogs,
  canEdit,
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
  onCreateRowForProcess,
  onShowRowsForProcess,
}: Props) {
  const [search, setSearch] = useState("");
  const [catalogEditor, setCatalogEditor] = useState<CatalogEditorState>(CLOSED_EDITOR);
  const [aspectEditor, setAspectEditor] = useState<{
    open: boolean;
    current: AspectCatalog | null;
    initialStandardId: number | null;
  }>({ open: false, current: null, initialStandardId: null });

  function openCatalog(
    kind: CatalogEditorKind,
    current: CatalogEditorRecord | null = null,
    initialParentId: number | null = null
  ) {
    setCatalogEditor({ open: true, kind, current, initialParentId });
  }

  function openAspect(current: AspectCatalog | null = null, standardId: number | null = null) {
    setAspectEditor({
      open: true,
      current,
      initialStandardId: current?.estandarId ?? standardId,
    });
  }

  async function saveWithToast<T>(
    label: string,
    action: () => Promise<T>
  ): Promise<T> {
    const result = await action();
    void showSuccessToast(label, "La estructura se actualizó correctamente.");
    return result;
  }

  async function confirmDeactivate(
    label: string,
    action: () => Promise<unknown>
  ) {
    const confirmation = await confirmAction({
      icon: "warning",
      title: `¿Desactivar ${label}?`,
      text: "El registro permanecerá en el historial. La operación se bloqueará si tiene relaciones activas.",
      confirmText: "Sí, desactivar",
      cancelText: "Cancelar",
      danger: true,
    });

    if (!confirmation.isConfirmed) return;

    try {
      await action();
      void showSuccessToast("Registro desactivado", "La estructura ya está actualizada.");
    } catch (requestError) {
      await showErrorAlert("No se pudo desactivar", errorMessage(requestError));
    }
  }

  return (
    <div className="space-y-4">
      <header className="rounded-2xl border border-neutral-800/80 bg-[#111111] p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-300">
              <Layers3 size={18} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-white">Estructura</h2>
              <p className="mt-0.5 text-xs text-neutral-600">Ciclos, categorías, estándares, aspectos y procesos.</p>
            </div>
          </div>

          {canEdit && (
            <div className="flex flex-wrap gap-2">
              <QuickButton label="Ciclo" onClick={() => openCatalog("ciclo")} />
              <QuickButton label="Categoría" onClick={() => openCatalog("categoria")} />
              <QuickButton label="Estándar" onClick={() => openCatalog("estandar")} />
              <QuickButton label="Aspecto" onClick={() => openAspect()} />
              <QuickButton label="Proceso" onClick={() => openCatalog("proceso")} />
            </div>
          )}
        </div>

        <div className="relative mt-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-600" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar en la estructura…"
            className="w-full rounded-xl border border-neutral-800 bg-[#090909] py-3 pl-10 pr-3 text-sm text-white outline-none placeholder:text-neutral-600 focus:border-cyan-500/50"
          />
        </div>
      </header>

      {!canEdit && (
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Esta versión es de solo lectura.
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <StructureTree
          catalogs={catalogs}
          canEdit={canEdit}
          search={search}
          onCreateCategory={(cycleId) => openCatalog("categoria", null, cycleId)}
          onCreateStandard={(categoryId) => openCatalog("estandar", null, categoryId)}
          onCreateAspect={(standardId) => openAspect(null, standardId)}
          onEditCycle={(cycle) => openCatalog("ciclo", cycle)}
          onEditCategory={(category) => openCatalog("categoria", category, category.cicloPhvaId)}
          onEditStandard={(standard) => openCatalog("estandar", standard, standard.categoriaEstandarId)}
          onEditAspect={(aspect) => openAspect(aspect)}
          onDeactivateCycle={(cycle) => void confirmDeactivate(cycle.nombre, () => onDeactivateCycle(cycle.id))}
          onDeactivateCategory={(category) => void confirmDeactivate(category.nombre, () => onDeactivateCategory(category.id))}
          onDeactivateStandard={(standard) => void confirmDeactivate(standard.nombre, () => onDeactivateStandard(standard.id))}
          onDeactivateAspect={(aspect) => void confirmDeactivate(aspect.nombre, () => onDeactivateAspect(aspect.id))}
        />

        <ProcessesWorkspace
          processes={catalogs.procesos}
          canEdit={canEdit}
          search={search}
          onCreate={() => openCatalog("proceso")}
          onEdit={(process) => openCatalog("proceso", process)}
          onDeactivate={(process) => void confirmDeactivate(process.nombre, () => onDeactivateProcess(process.id))}
          onCreateRow={onCreateRowForProcess}
          onShowRows={onShowRowsForProcess}
        />
      </div>

      <CatalogEditorModal
        open={catalogEditor.open}
        kind={catalogEditor.kind}
        current={catalogEditor.current}
        versionSupermatrizId={versionSupermatrizId}
        catalogs={catalogs}
        initialParentId={catalogEditor.initialParentId}
        onClose={() => setCatalogEditor(CLOSED_EDITOR)}
        onSaveCycle={(current, payload) => saveWithToast(current ? "Ciclo actualizado" : "Ciclo creado", () => onSaveCycle(current, payload))}
        onSaveCategory={(current, payload) => saveWithToast(current ? "Categoría actualizada" : "Categoría creada", () => onSaveCategory(current, payload))}
        onSaveStandard={(current, payload) => saveWithToast(current ? "Estándar actualizado" : "Estándar creado", () => onSaveStandard(current, payload))}
        onSaveProcess={(current, payload) => saveWithToast(current ? "Proceso actualizado" : "Proceso creado", () => onSaveProcess(current, payload))}
      />

      <AspectEditorModal
        open={aspectEditor.open}
        current={aspectEditor.current}
        versionSupermatrizId={versionSupermatrizId}
        catalogs={catalogs}
        initialStandardId={aspectEditor.initialStandardId}
        onClose={() => setAspectEditor({ open: false, current: null, initialStandardId: null })}
        onSave={(current, payload, logicaEvaluacion) =>
          saveWithToast(
            current ? "Aspecto actualizado" : "Aspecto creado",
            () => onSaveAspect(current, payload, logicaEvaluacion)
          )
        }
      />
    </div>
  );
}

function QuickButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-xl border border-neutral-800 bg-[#090909] px-3 py-2 text-xs font-medium text-neutral-300 hover:border-neutral-700 hover:text-white"
    >
      <Plus size={13} />
      {label}
    </button>
  );
}
