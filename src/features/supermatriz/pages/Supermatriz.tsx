import {
  FileClock,
  GitBranch,
  Layers3,
  Loader2,
  RefreshCw,
  Rows3,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";
import AppSelect from "../../../components/ui/AppSelect";
import {
  errorMessage,
  showErrorAlert,
  showSuccessToast,
} from "../../../lib/stack44-alerts";
import { useAuth } from "../../auth/context/AuthContext";
import HistoryPanel from "../components/HistoryPanel";
import StatusBadge from "../components/StatusBadge";
import TasksPanel from "../components/TasksPanel";
import VersionsManager from "../components/VersionsManager";
import StructureWorkspace from "../components/structure/StructureWorkspace";
import { useSupermatrizAdmin } from "../hooks/useSupermatrizAdmin";
import type {
  MatrixVersionStatus,
  ProcessCatalog,
} from "../types/supermatriz.types";

type Tab = "matriz" | "estructura" | "versiones" | "historial";

const ADMIN_ROLES = new Set(["ADMIN", "OWNER", "SUPERADMIN"]);

const tabs: Array<{
  id: Tab;
  label: string;
  icon: typeof Rows3;
}> = [
  { id: "matriz", label: "Matriz", icon: Rows3 },
  { id: "estructura", label: "Estructura", icon: GitBranch },
  { id: "versiones", label: "Versiones", icon: Layers3 },
  { id: "historial", label: "Historial", icon: FileClock },
];

function versionStatusLabel(
  status: MatrixVersionStatus
): string {
  return status === "CERRADA"
    ? "HISTÓRICA"
    : status;
}

export default function Supermatriz() {
  const { user, token } = useAuth();
  const matrix = useSupermatrizAdmin(token);
  const [activeTab, setActiveTab] = useState<Tab>("matriz");
  const [pendingProcessId, setPendingProcessId] = useState<number | null>(null);

  const canAdminister = Boolean(user && ADMIN_ROLES.has(user.role));
  const canEdit = canAdminister && matrix.canEditSelectedVersion;
  const selectedVersion = matrix.selectedVersion;

  const metrics = useMemo(
    () => [
      ["Ciclos", matrix.catalogs.ciclosPhva.length],
      ["Estándares", matrix.catalogs.estandares.length],
      ["Aspectos", matrix.catalogs.aspectos.length],
      ["Procesos", matrix.catalogs.procesos.length],
      ["Filas", matrix.tasks.paginacion.total],
    ],
    [
      matrix.catalogs.aspectos.length,
      matrix.catalogs.ciclosPhva.length,
      matrix.catalogs.estandares.length,
      matrix.catalogs.procesos.length,
      matrix.tasks.paginacion.total,
    ]
  );

  function createRowForProcess(process: ProcessCatalog) {
    setPendingProcessId(process.id);
    setActiveTab("matriz");
  }

  function showRowsForProcess(process: ProcessCatalog) {
    matrix.updateFilters({
      procesoId: String(process.id),
      pagina: 1,
    });
    setActiveTab("matriz");
  }

  if (matrix.loadingVersions && matrix.versions.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-[1880px] space-y-4">
      {(matrix.refreshing || matrix.mutating) && (
        <div className="sticky top-0 z-[80] flex items-center justify-center gap-2 rounded-xl border border-cyan-500/20 bg-[#071013]/95 px-4 py-2 text-xs font-semibold text-cyan-300 shadow-xl backdrop-blur">
          <Loader2 className="h-4 w-4 animate-spin" />
          {matrix.refreshing ? "Actualizando…" : "Guardando…"}
        </div>
      )}

      <header className="rounded-2xl border border-neutral-800/80 bg-[#111111] p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Supermatriz</h1>
            <p className="mt-1 text-sm text-neutral-600">
              {canAdminister
                ? "Administración global"
                : "Consulta técnica de solo lectura"}
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row xl:w-auto">
            <div className="min-w-0 sm:min-w-[330px]">
              <label className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                Versión
              </label>
              <AppSelect
                value={matrix.selectedVersionId ?? ""}
                onChange={(event) => matrix.setSelectedVersionId(Number(event.target.value))}
              >
                {matrix.versions.map((version) => (
                  <option key={version.id} value={version.id}>
                    {version.nombre} · {versionStatusLabel(version.estado)}
                  </option>
                ))}
              </AppSelect>
            </div>

            <button
              type="button"
              disabled={matrix.refreshing || matrix.mutating}
              onClick={async () => {
                try {
                  await matrix.refreshAll();
                  void showSuccessToast("Supermatriz actualizada", "Los datos visibles están al día.");
                } catch (requestError) {
                  await showErrorAlert("No se pudo actualizar", errorMessage(requestError));
                }
              }}
              className="mt-auto flex min-h-10 items-center justify-center gap-2 rounded-xl border border-neutral-800 bg-[#090909] px-4 text-sm text-neutral-400 hover:text-white disabled:opacity-50"
            >
              <RefreshCw size={15} />
              Actualizar
            </button>
          </div>
        </div>

        {selectedVersion && (
          <div className="mt-4 flex flex-col gap-3 border-t border-neutral-800/70 pt-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <StatusBadge status={selectedVersion.estado} />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-neutral-200">{selectedVersion.nombre}</p>
                {selectedVersion.descripcion && (
                  <p className="mt-0.5 truncate text-xs text-neutral-600">{selectedVersion.descripcion}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {metrics.map(([label, value]) => (
                <div key={label} className="rounded-xl border border-neutral-800 bg-[#090909] px-3 py-2 text-left">
                  <span className="text-sm font-bold text-white">{value}</span>
                  <span className="ml-2 text-[9px] uppercase tracking-wider text-neutral-600">{label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {matrix.error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {matrix.error}
        </div>
      )}

      <nav className="grid gap-2 rounded-2xl border border-neutral-800/80 bg-[#111111] p-2 sm:grid-cols-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? "bg-cyan-500/10 text-cyan-200"
                  : "text-neutral-500 hover:bg-neutral-800/50 hover:text-white"
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </nav>

      {activeTab === "versiones" ? (
        <VersionsManager
          versions={matrix.versions}
          selectedVersionId={selectedVersion?.id ?? 0}
          canAdminister={canAdminister}
          onSelect={matrix.setSelectedVersionId}
          onCreate={matrix.createVersion}
          onUpdate={matrix.updateVersion}
          onClone={matrix.cloneVersion}
          onPublish={matrix.publishVersion}
        />
      ) : !selectedVersion ? (
        <div className="rounded-2xl border border-dashed border-neutral-800 px-6 py-20 text-center text-sm text-neutral-500">
          No existe una versión seleccionada.
        </div>
      ) : activeTab === "historial" ? (
        <HistoryPanel
          history={matrix.history}
          loading={matrix.loadingHistory}
          onPageChange={matrix.loadHistory}
        />
      ) : activeTab === "estructura" ? (
        <StructureWorkspace
          versionSupermatrizId={selectedVersion.id}
          catalogs={matrix.catalogs}
          canEdit={canEdit}
          onSaveCycle={matrix.saveCycle}
          onSaveCategory={matrix.saveCategory}
          onSaveStandard={matrix.saveStandard}
          onSaveAspect={matrix.saveAspect}
          onSaveProcess={matrix.saveProcess}
          onDeactivateCycle={matrix.deactivateCycle}
          onDeactivateCategory={matrix.deactivateCategory}
          onDeactivateStandard={matrix.deactivateStandard}
          onDeactivateAspect={matrix.deactivateAspect}
          onDeactivateProcess={matrix.deactivateProcess}
          onCreateRowForProcess={createRowForProcess}
          onShowRowsForProcess={showRowsForProcess}
        />
      ) : (
        <TasksPanel
          versionSupermatrizId={selectedVersion.id}
          catalogs={matrix.catalogs}
          filters={matrix.filters}
          result={matrix.tasks}
          loading={matrix.loadingTasks || matrix.loadingCatalogs}
          loadingMore={matrix.loadingMoreTasks}
          canEdit={canEdit}
          initialProcessId={pendingProcessId}
          onInitialProcessConsumed={() => setPendingProcessId(null)}
          onFiltersChange={matrix.updateFilters}
          onLoadMore={matrix.loadMoreTasks}
          onBuildRow={matrix.buildRow}
          onSaveTask={matrix.saveTask}
          onDeactivateTask={matrix.deactivateTask}
          onSaveCycle={matrix.saveCycle}
          onSaveCategory={matrix.saveCategory}
          onSaveStandard={matrix.saveStandard}
          onSaveAspect={matrix.saveAspect}
          onSaveProcess={matrix.saveProcess}
          onDeactivateCycle={matrix.deactivateCycle}
          onDeactivateCategory={matrix.deactivateCategory}
          onDeactivateStandard={matrix.deactivateStandard}
          onDeactivateAspect={matrix.deactivateAspect}
          onDeactivateProcess={matrix.deactivateProcess}
        />
      )}
    </div>
  );
}
