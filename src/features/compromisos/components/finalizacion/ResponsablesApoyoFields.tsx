import {
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import AppButton from "../../../../components/ui/AppButton";
import AppSelect from "../../../../components/ui/AppSelect";
import type {
  ApoyoCompromisoDraft,
} from "../../types/compromiso-formulario.types";
import type {
  ResponsableDisponibleCompromiso,
} from "../../types/compromiso.types";
import CampoCompromiso from "./CampoCompromiso";
import { COMPROMISO_INPUT_CLASS } from "./compromiso-finalizacion.styles";
import ResponsableOptions from "./ResponsableOptions";

interface Props {
  evaluacionId: string;
  apoyos: ApoyoCompromisoDraft[];
  responsables: ResponsableDisponibleCompromiso[];
  busy: boolean;
  onAdd: (evaluacionId: string) => void;
  onUpdate: (
    evaluacionId: string,
    key: string,
    patch: Partial<ApoyoCompromisoDraft>
  ) => void;
  onRemove: (
    evaluacionId: string,
    key: string
  ) => void;
}

export default function ResponsablesApoyoFields({
  evaluacionId,
  apoyos,
  responsables,
  busy,
  onAdd,
  onUpdate,
  onRemove,
}: Props) {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users
            size={16}
            className="text-slate-500"
          />
          <p className="text-xs font-semibold text-slate-700">
            Responsables de apoyo
            <span className="ml-1 font-normal text-slate-500">
              (opcional)
            </span>
          </p>
        </div>

        <AppButton
          variant="ghost"
          size="sm"
          leadingIcon={<Plus size={14} />}
          onClick={() => onAdd(evaluacionId)}
          disabled={busy}
        >
          Agregar apoyo
        </AppButton>
      </div>

      {apoyos.length > 0 && (
        <div className="mt-3 space-y-3">
          {apoyos.map((apoyo, apoyoIndex) => (
            <div
              key={apoyo.key}
              className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto]"
            >
              <CampoCompromiso
                label={`Persona de apoyo ${apoyoIndex + 1}`}
                required
              >
                <AppSelect
                  required
                  value={apoyo.usuarioResponsableId}
                  onChange={(event) =>
                    onUpdate(
                      evaluacionId,
                      apoyo.key,
                      {
                        usuarioResponsableId:
                          event.target.value,
                      }
                    )
                  }
                >
                  <option value="">
                    Seleccionar persona
                  </option>
                  <ResponsableOptions
                    responsables={responsables}
                  />
                </AppSelect>
              </CampoCompromiso>

              <CampoCompromiso
                label="Actividad de apoyo"
                required
              >
                <input
                  type="text"
                  minLength={5}
                  maxLength={2000}
                  required
                  value={apoyo.actividad}
                  onChange={(event) =>
                    onUpdate(
                      evaluacionId,
                      apoyo.key,
                      {
                        actividad: event.target.value,
                      }
                    )
                  }
                  placeholder="Actividad específica..."
                  className={COMPROMISO_INPUT_CLASS}
                />
              </CampoCompromiso>

              <AppButton
                variant="ghost"
                size="sm"
                aria-label={`Quitar apoyo ${apoyoIndex + 1}`}
                leadingIcon={<Trash2 size={14} />}
                className="self-end text-red-700 hover:bg-red-50 hover:text-red-800 sm:px-3"
                onClick={() =>
                  onRemove(evaluacionId, apoyo.key)
                }
                disabled={busy}
              >
                <span className="sm:hidden">
                  Quitar apoyo
                </span>
              </AppButton>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
