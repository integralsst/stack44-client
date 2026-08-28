import { useEffect, useState } from "react";
import {
  Check,
  Loader2,
  Settings2,
} from "lucide-react";

import AppModal from "../../../components/ui/AppModal";
import { apiRequest } from "../../../lib/api";
import type { ProfessionalAssignment } from "../../../types/domain";
import { useAuth } from "../../auth/context/AuthContext";

type CodigoCategoriaGestion =
  | "DOCUMENTAL"
  | "INTERVENCION"
  | "EMERGENCIAS";

type ModoAccesoCategorias =
  | "GENERAL_COMPATIBILIDAD"
  | "RESTRINGIDO_POR_CATEGORIAS";

interface RespuestaCategoriasAsignacion {
  asignacionId: string;
  profesionalId: string;
  empresaId: string;
  codigosCategoriasGestion: CodigoCategoriaGestion[];
  modoAcceso: ModoAccesoCategorias;
}

interface AssignmentCategoriesButtonProps {
  professionalId: string;
  professionalName: string;
  assignment: ProfessionalAssignment;
}

const OPCIONES: Array<{
  codigo: CodigoCategoriaGestion;
  titulo: string;
  descripcion: string;
}> = [
  {
    codigo: "DOCUMENTAL",
    titulo: "Gestión documental",
    descripcion:
      "Permite evaluar los aspectos asociados a gestión documental.",
  },
  {
    codigo: "INTERVENCION",
    titulo: "Gestión a la intervención",
    descripcion:
      "Permite evaluar los aspectos asociados a intervención del SG-SST.",
  },
  {
    codigo: "EMERGENCIAS",
    titulo: "Gestión de emergencias",
    descripcion:
      "Permite evaluar los aspectos asociados a gestión de emergencias.",
  },
];

export default function AssignmentCategoriesButton({
  professionalId,
  professionalName,
  assignment,
}: AssignmentCategoriesButtonProps) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<
    CodigoCategoriaGestion[]
  >([]);
  const [modoAcceso, setModoAcceso] =
    useState<ModoAccesoCategorias | null>(null);

  useEffect(() => {
    if (!open || !token) return;

    let active = true;

    const loadCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const response =
          await apiRequest<RespuestaCategoriasAsignacion>(
            `/api/professionals/${professionalId}/empresas/${assignment.companyId}/categorias`,
            {},
            token
          );

        if (!active) return;

        setSelected(response.codigosCategoriasGestion);
        setModoAcceso(response.modoAcceso);
      } catch (requestError) {
        if (!active) return;

        setError(
          requestError instanceof Error
            ? requestError.message
            : "No fue posible consultar las categorías de la asignación."
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadCategories();

    return () => {
      active = false;
    };
  }, [
    open,
    token,
    professionalId,
    assignment.companyId,
  ]);

  const toggleCategory = (
    codigo: CodigoCategoriaGestion
  ) => {
    setSelected((current) =>
      current.includes(codigo)
        ? current.filter((item) => item !== codigo)
        : [...current, codigo]
    );
    setError(null);
  };

  const handleSave = async () => {
    if (!token) return;

    setSaving(true);
    setError(null);

    try {
      const response =
        await apiRequest<RespuestaCategoriasAsignacion>(
          `/api/professionals/${professionalId}/empresas/${assignment.companyId}/categorias`,
          {
            method: "PUT",
            body: JSON.stringify({
              categoriasGestion: selected,
            }),
          },
          token
        );

      setSelected(response.codigosCategoriasGestion);
      setModoAcceso(response.modoAcceso);
      setOpen(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible actualizar las categorías de la asignación."
      );
    } finally {
      setSaving(false);
    }
  };

  const close = () => {
    if (saving) return;
    setOpen(false);
    setError(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-cyan-300 transition-colors hover:bg-cyan-500/10 hover:text-cyan-200"
        title={`Configurar categorías de ${assignment.company.name}`}
      >
        <Settings2 size={11} />
        Categorías
      </button>

      <AppModal
        open={open}
        title="Categorías de gestión"
        description={`${professionalName} · ${assignment.company.name}`}
        onClose={close}
        busy={loading || saving}
        size="md"
        footer={
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={close}
              disabled={saving}
              className="w-full rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-3 text-sm font-medium text-neutral-300 transition-colors hover:bg-neutral-700 disabled:opacity-50 sm:w-auto sm:py-2.5"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={loading || saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-black transition-colors hover:bg-neutral-200 disabled:opacity-50 sm:w-auto sm:py-2.5"
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Guardar categorías
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-10 text-sm text-neutral-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Consultando categorías...
            </div>
          ) : (
            <>
              <div
                className={`rounded-xl border px-4 py-3 text-sm ${
                  selected.length === 0
                    ? "border-amber-500/20 bg-amber-500/10 text-amber-200"
                    : "border-cyan-500/20 bg-cyan-500/10 text-cyan-200"
                }`}
              >
                <p className="font-semibold">
                  {selected.length === 0
                    ? "Acceso general por compatibilidad"
                    : "Acceso restringido por categorías"}
                </p>
                <p className="mt-1 text-xs leading-5 opacity-80">
                  {selected.length === 0
                    ? "Sin categorías seleccionadas, esta asignación conserva el acceso general histórico."
                    : "El profesional solo podrá evaluar aspectos asociados a por lo menos una de las categorías seleccionadas."}
                </p>
              </div>

              <div className="space-y-2">
                {OPCIONES.map((option) => {
                  const checked = selected.includes(option.codigo);

                  return (
                    <button
                      key={option.codigo}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => toggleCategory(option.codigo)}
                      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                        checked
                          ? "border-cyan-500/40 bg-cyan-500/10"
                          : "border-neutral-800 bg-[#090909] hover:border-neutral-700"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                          checked
                            ? "border-cyan-400 bg-cyan-400 text-black"
                            : "border-neutral-600 bg-neutral-900 text-transparent"
                        }`}
                      >
                        <Check size={13} strokeWidth={3} />
                      </span>

                      <span className="min-w-0">
                        <span className="block text-sm font-semibold text-white">
                          {option.titulo}
                        </span>
                        <span className="mt-1 block text-xs leading-5 text-neutral-500">
                          {option.descripcion}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {modoAcceso && (
                <p className="text-xs text-neutral-600">
                  Configuración actual: {modoAcceso ===
                  "GENERAL_COMPATIBILIDAD"
                    ? "acceso general"
                    : "restricción por categorías"}.
                </p>
              )}
            </>
          )}
        </div>
      </AppModal>
    </>
  );
}
