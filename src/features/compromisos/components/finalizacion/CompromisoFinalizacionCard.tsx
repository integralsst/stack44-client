import AppSelect from "../../../../components/ui/AppSelect";
import { fechaMinimaCompromiso } from "../../forms/compromisos-finalizacion.form";
import type {
  ApoyoCompromisoDraft,
  CompromisoFinalizacionDraft,
} from "../../types/compromiso-formulario.types";
import type {
  EvaluacionPreparacionCompromiso,
  ResponsableDisponibleCompromiso,
} from "../../types/compromiso.types";
import CampoCompromiso from "./CampoCompromiso";
import { COMPROMISO_INPUT_CLASS } from "./compromiso-finalizacion.styles";
import ResponsableOptions from "./ResponsableOptions";
import ResponsablesApoyoFields from "./ResponsablesApoyoFields";

interface Props {
  evaluacion: EvaluacionPreparacionCompromiso;
  index: number;
  total: number;
  draft: CompromisoFinalizacionDraft;
  responsables: ResponsableDisponibleCompromiso[];
  busy: boolean;
  onUpdateDraft: (
    evaluacionId: string,
    patch: Partial<CompromisoFinalizacionDraft>
  ) => void;
  onAddSupport: (evaluacionId: string) => void;
  onUpdateSupport: (
    evaluacionId: string,
    key: string,
    patch: Partial<ApoyoCompromisoDraft>
  ) => void;
  onRemoveSupport: (
    evaluacionId: string,
    key: string
  ) => void;
}

export default function CompromisoFinalizacionCard({
  evaluacion,
  index,
  total,
  draft,
  responsables,
  busy,
  onUpdateDraft,
  onAddSupport,
  onUpdateSupport,
  onRemoveSupport,
}: Props) {
  const isNoCumplido =
    evaluacion.calificacionAdministrativa === 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
            Compromiso {index + 1} de {total}
          </p>
          <h3 className="mt-1 break-words text-sm font-semibold leading-6 text-slate-900">
            {evaluacion.aspectoCodigo
              ? `${evaluacion.aspectoCodigo} · `
              : ""}
            {evaluacion.aspectoNombre}
          </h3>
        </div>

        <span
          className={`inline-flex shrink-0 self-start rounded-full border px-3 py-1 text-xs font-bold ${
            isNoCumplido
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          Nota {evaluacion.calificacionAdministrativa} ·{" "}
          {isNoCumplido ? "No cumplido" : "Parcial"}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
        <CampoCompromiso
          label="Descripción del compromiso"
          required
        >
          <textarea
            rows={3}
            minLength={10}
            maxLength={4000}
            required
            value={draft.descripcion}
            onChange={(event) =>
              onUpdateDraft(evaluacion.evaluacionId, {
                descripcion: event.target.value,
              })
            }
            placeholder="Describe el resultado o acción que debe cumplirse..."
            className={`${COMPROMISO_INPUT_CLASS} min-h-24 resize-y`}
          />
        </CampoCompromiso>

        <CampoCompromiso label="Recursos necesarios">
          <textarea
            rows={3}
            maxLength={2000}
            value={draft.recursos}
            onChange={(event) =>
              onUpdateDraft(evaluacion.evaluacionId, {
                recursos: event.target.value,
              })
            }
            placeholder="Presupuesto, equipos, documentos o apoyo requerido..."
            className={`${COMPROMISO_INPUT_CLASS} min-h-24 resize-y`}
          />
        </CampoCompromiso>

        <CampoCompromiso
          label="Fecha límite"
          required
        >
          <input
            type="date"
            min={fechaMinimaCompromiso()}
            required
            value={draft.fechaLimite}
            onChange={(event) =>
              onUpdateDraft(evaluacion.evaluacionId, {
                fechaLimite: event.target.value,
              })
            }
            className={COMPROMISO_INPUT_CLASS}
          />
        </CampoCompromiso>

        <CampoCompromiso
          label="Responsable principal"
          required
        >
          <AppSelect
            required
            value={draft.responsablePrincipalId}
            onChange={(event) =>
              onUpdateDraft(evaluacion.evaluacionId, {
                responsablePrincipalId:
                  event.target.value,
              })
            }
          >
            <option value="">
              Seleccionar responsable
            </option>
            <ResponsableOptions
              responsables={responsables}
            />
          </AppSelect>
        </CampoCompromiso>

        <div className="sm:col-span-2">
          <CampoCompromiso
            label="Actividad del responsable principal"
            required
          >
            <textarea
              rows={2}
              minLength={5}
              maxLength={2000}
              required
              value={draft.actividadPrincipal}
              onChange={(event) =>
                onUpdateDraft(evaluacion.evaluacionId, {
                  actividadPrincipal:
                    event.target.value,
                })
              }
              placeholder="Indica qué debe realizar el responsable principal..."
              className={`${COMPROMISO_INPUT_CLASS} resize-y`}
            />
          </CampoCompromiso>
        </div>

        <div className="sm:col-span-2">
          <ResponsablesApoyoFields
            evaluacionId={evaluacion.evaluacionId}
            apoyos={draft.apoyos}
            responsables={responsables}
            busy={busy}
            onAdd={onAddSupport}
            onUpdate={onUpdateSupport}
            onRemove={onRemoveSupport}
          />
        </div>
      </div>
    </section>
  );
}
