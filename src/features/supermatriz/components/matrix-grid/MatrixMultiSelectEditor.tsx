import {
  Loader2,
  Save,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import type {
  ManagementCategory,
} from "../../types/supermatriz.types";
import MatrixCellMenu from "./MatrixCellMenu";

interface Props {
  selectedIds: number[];
  categories: ManagementCategory[];
  canEdit: boolean;
  onSave: (ids: number[]) => Promise<unknown>;
}

export default function MatrixMultiSelectEditor({
  selectedIds,
  categories,
  canEdit,
  onSave,
}: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<number[]>(selectedIds);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setDraft(selectedIds);
      setError(null);
    }
  }, [open, selectedIds]);

  function toggle(id: number) {
    setDraft((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  async function save() {
    if (draft.length === 0) {
      setError("Selecciona al menos una categoría de gestión.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await onSave(draft);
      setOpen(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible guardar el cambio."
      );
    } finally {
      setSaving(false);
    }
  }

  const selectedCategories = categories.filter((item) =>
    selectedIds.includes(item.id)
  );

  return (
    <MatrixCellMenu
      open={open}
      onOpenChange={setOpen}
      disabled={!canEdit}
      title="Categorías de gestión"
      label={
        selectedCategories.length > 0 ? (
          <span className="flex flex-wrap gap-1.5">
            {selectedCategories.map((category) => (
              <span
                key={category.id}
                className="inline-flex rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-bold leading-4 text-violet-800"
              >
                {category.nombre}
              </span>
            ))}
          </span>
        ) : (
          <span className="inline-flex rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
            Sin categoría
          </span>
        )
      }
      minWidth={360}
    >
      <div className="space-y-3">
        <div className="space-y-2">
          {categories.map((category) => {
            const checked = draft.includes(category.id);
            return (
              <label
                key={category.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 text-sm transition ${
                  checked
                    ? "border-violet-300 bg-violet-50 text-violet-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(category.id)}
                  className="mt-0.5"
                />
                <span className="font-medium">{category.nombre}</span>
              </label>
            );
          })}
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-medium text-red-800">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={() => setOpen(false)}
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void save()}
            className="flex items-center gap-2 rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-cyan-700 disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            Guardar
          </button>
        </div>
      </div>
    </MatrixCellMenu>
  );
}
