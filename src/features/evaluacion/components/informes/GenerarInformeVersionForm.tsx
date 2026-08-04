import {
  FilePlus2,
  Layers3,
} from "lucide-react";
import { useState } from "react";

import AppButton from "../../../../components/ui/AppButton";
import type {
  CategoriaGestionInforme,
  CodigoCategoriaGestionInforme,
  GenerarInformePeriodoInput,
} from "../../types/informe-periodo.types";
import type { GrupoResultadosEvaluacion } from "../../types/resultados-evaluacion.types";

interface Props {
  anio: number;
  categorias: CategoriaGestionInforme[];
  procesando: boolean;
  onSubmit: (
    input: GenerarInformePeriodoInput
  ) => Promise<boolean>;
}

const grupos: Array<{
  value: GrupoResultadosEvaluacion;
  label: string;
}> = [
  { value: "TODOS", label: "Todos" },
  { value: "ESTANDARES_7", label: "7 estándares" },
  { value: "ESTANDARES_21", label: "21 estándares" },
  { value: "ESTANDARES_60", label: "60 estándares" },
];

export default function GenerarInformeVersionForm({
  anio,
  categorias,
  procesando,
  onSubmit,
}: Props) {
  const [grupo, setGrupo] =
    useState<GrupoResultadosEvaluacion>("TODOS");
  const [categoriasSeleccionadas, setCategoriasSeleccionadas] =
    useState<CodigoCategoriaGestionInforme[]>([]);
  const [titulo, setTitulo] = useState("");
  const [motivoVersion, setMotivoVersion] = useState("");

  const toggleCategoria = (
    codigo: CodigoCategoriaGestionInforme
  ) => {
    setCategoriasSeleccionadas((current) =>
      current.includes(codigo)
        ? current.filter((item) => item !== codigo)
        : [...current, codigo]
    );
  };

  const submit = async () => {
    const generado = await onSubmit({
      titulo: titulo.trim() || undefined,
      grupo,
      categoriasGestion: categoriasSeleccionadas,
      motivoVersion: motivoVersion.trim() || undefined,
    });

    if (generado) {
      setMotivoVersion("");
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <div className="flex gap-3">
          <FilePlus2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
          <div>
            <h3 className="text-sm font-semibold text-white">
              Fotografía enero a diciembre de {anio}
            </h3>
            <p className="mt-1 text-xs leading-5 text-neutral-400">
              La versión conserva los resultados disponibles hoy. El periodo seguirá abierto para incorporar información histórica y generar versiones posteriores.
            </p>
          </div>
        </div>
      </div>

      <Field label="Grupo de estándares">
        <div className="flex flex-wrap gap-2">
          {grupos.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setGrupo(item.value)}
              aria-pressed={grupo === item.value}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                grupo === item.value
                  ? "border-cyan-500/35 bg-cyan-500/10 text-cyan-200"
                  : "border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Categorías de gestión">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCategoriasSeleccionadas([])}
            aria-pressed={categoriasSeleccionadas.length === 0}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
              categoriasSeleccionadas.length === 0
                ? "border-cyan-500/35 bg-cyan-500/10 text-cyan-200"
                : "border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
            }`}
          >
            Todas
          </button>

          {categorias.map((categoria) => {
            const active = categoriasSeleccionadas.includes(
              categoria.codigo
            );

            return (
              <button
                key={categoria.id}
                type="button"
                onClick={() => toggleCategoria(categoria.codigo)}
                aria-pressed={active}
                className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? "border-cyan-500/35 bg-cyan-500/10 text-cyan-200"
                    : "border-neutral-800 bg-neutral-900 text-neutral-500 hover:border-neutral-700 hover:text-neutral-300"
                }`}
              >
                {categoria.nombre}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-[11px] text-neutral-600">
          Sin selección específica se incluyen todas las categorías.
        </p>
      </Field>

      <div className="grid gap-4 lg:grid-cols-2">
        <Field label="Título opcional">
          <input
            value={titulo}
            onChange={(event) => setTitulo(event.target.value)}
            maxLength={191}
            placeholder={`Informe SG-SST enero a diciembre ${anio}`}
            className="h-11 w-full rounded-xl border border-neutral-800 bg-[#090a0b] px-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-500/40"
          />
        </Field>

        <Field label="Motivo de esta versión">
          <input
            value={motivoVersion}
            onChange={(event) =>
              setMotivoVersion(event.target.value)
            }
            maxLength={3000}
            placeholder="Ej. Se incorporó información histórica encontrada en julio de 2026"
            className="h-11 w-full rounded-xl border border-neutral-800 bg-[#090a0b] px-3 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-cyan-500/40"
          />
        </Field>
      </div>

      <div className="flex justify-end">
        <AppButton
          variant="primary"
          loading={procesando}
          loadingLabel="Generando versión"
          leadingIcon={<Layers3 size={16} />}
          onClick={() => void submit()}
        >
          Generar nueva versión
        </AppButton>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-neutral-300">
        {label}
      </p>
      {children}
    </div>
  );
}
