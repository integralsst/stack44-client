import {
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  AlertTriangle,
  Plus,
  Trash2,
  Users,
} from "lucide-react";

import AppButton from "../../../../components/ui/AppButton";
import AppModal from "../../../../components/ui/AppModal";
import AppSelect from "../../../../components/ui/AppSelect";
import AppAlert from "../../../evaluacion/components/feedback/AppAlert";
import type {
  CompromisoFinalizacionInput,
  PreparacionFinalizacionResponse,
  ResponsableDisponibleCompromiso,
} from "../../types/compromiso.types";

interface Props {
  preparacion: PreparacionFinalizacionResponse;
  busy: boolean;
  error?: string | null;
  onClose: () => void;
  onSubmit: (
    compromisos: CompromisoFinalizacionInput[]
  ) => Promise<void>;
}

interface ApoyoDraft {
  key: string;
  usuarioResponsableId: string;
  actividad: string;
}

interface CompromisoDraft {
  descripcion: string;
  recursos: string;
  fechaLimite: string;
  responsablePrincipalId: string;
  actividadPrincipal: string;
  apoyos: ApoyoDraft[];
}

type CompromisosDraft = Record<string, CompromisoDraft>;

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition [color-scheme:light] placeholder:text-slate-400 hover:border-slate-400 focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:bg-slate-100";

function todayInput(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(now.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 10);
}

function crearBorradores(
  preparacion: PreparacionFinalizacionResponse
): CompromisosDraft {
  return Object.fromEntries(
    preparacion.evaluaciones
      .filter((evaluacion) => evaluacion.accion === "CREAR")
      .map((evaluacion) => [
        evaluacion.evaluacionId,
        {
          descripcion: "",
          recursos: "",
          fechaLimite: "",
          responsablePrincipalId: "",
          actividadPrincipal: "",
          apoyos: [],
        },
      ])
  );
}

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}

function ResponsableOptions({
  responsables,
}: {
  responsables: ResponsableDisponibleCompromiso[];
}) {
  const internos = responsables.filter(
    (responsable) => responsable.tipoActor === "INTERNO"
  );
  const clientes = responsables.filter(
    (responsable) => responsable.tipoActor === "CLIENTE"
  );

  return (
    <>
      {internos.length > 0 && (
        <optgroup label="Equipo interno">
          {internos.map((responsable) => (
            <option
              key={responsable.id}
              value={responsable.id}
            >
              {responsable.nombre} ·{" "}
              {responsable.rol.replaceAll("_", " ")}
            </option>
          ))}
        </optgroup>
      )}

      {clientes.length > 0 && (
        <optgroup label="Equipo de la empresa">
          {clientes.map((responsable) => (
            <option
              key={responsable.id}
              value={responsable.id}
            >
              {responsable.nombre} ·{" "}
              {responsable.rol.replaceAll("_", " ")}
            </option>
          ))}
        </optgroup>
      )}
    </>
  );
}

export default function CompromisosFinalizacionModal({
  preparacion,
  busy,
  error,
  onClose,
  onSubmit,
}: Props) {
  const evaluacionesNuevas =
    preparacion.evaluaciones.filter(
      (evaluacion) => evaluacion.accion === "CREAR"
    );
  const evaluacionesVinculadas =
    preparacion.evaluaciones.filter(
      (evaluacion) =>
        evaluacion.accion === "VINCULAR_EXISTENTE"
    );
  const [borradores, setBorradores] =
    useState<CompromisosDraft>(() =>
      crearBorradores(preparacion)
    );
  const [errorLocal, setErrorLocal] =
    useState<string | null>(null);

  const actualizarBorrador = (
    evaluacionId: string,
    patch: Partial<CompromisoDraft>
  ) => {
    setBorradores((current) => {
      const draft = current[evaluacionId];

      if (!draft) {
        return current;
      }

      return {
        ...current,
        [evaluacionId]: {
          ...draft,
          ...patch,
        },
      };
    });
  };

  const agregarApoyo = (evaluacionId: string) => {
    setBorradores((current) => {
      const draft = current[evaluacionId];

      if (!draft) {
        return current;
      }

      return {
        ...current,
        [evaluacionId]: {
          ...draft,
          apoyos: [
            ...draft.apoyos,
            {
              key: `${evaluacionId}-${draft.apoyos.length}-${Date.now()}`,
              usuarioResponsableId: "",
              actividad: "",
            },
          ],
        },
      };
    });
  };

  const actualizarApoyo = (
    evaluacionId: string,
    key: string,
    patch: Partial<ApoyoDraft>
  ) => {
    setBorradores((current) => {
      const draft = current[evaluacionId];

      if (!draft) {
        return current;
      }

      return {
        ...current,
        [evaluacionId]: {
          ...draft,
          apoyos: draft.apoyos.map((apoyo) =>
            apoyo.key === key
              ? {
                  ...apoyo,
                  ...patch,
                }
              : apoyo
          ),
        },
      };
    });
  };

  const eliminarApoyo = (
    evaluacionId: string,
    key: string
  ) => {
    setBorradores((current) => {
      const draft = current[evaluacionId];

      if (!draft) {
        return current;
      }

      return {
        ...current,
        [evaluacionId]: {
          ...draft,
          apoyos: draft.apoyos.filter(
            (apoyo) => apoyo.key !== key
          ),
        },
      };
    });
  };

  const construirCompromisos =
    (): CompromisoFinalizacionInput[] =>
      evaluacionesNuevas.map((evaluacion, index) => {
        const draft =
          borradores[evaluacion.evaluacionId];
        const etiqueta = `Compromiso ${index + 1}`;

        if (!draft) {
          throw new Error(
            `${etiqueta}: no fue posible preparar el formulario.`
          );
        }

        const descripcion = draft.descripcion.trim();
        const actividadPrincipal =
          draft.actividadPrincipal.trim();

        if (descripcion.length < 10) {
          throw new Error(
            `${etiqueta}: la descripción debe tener al menos 10 caracteres.`
          );
        }

        if (!draft.fechaLimite) {
          throw new Error(
            `${etiqueta}: selecciona una fecha límite.`
          );
        }

        if (!draft.responsablePrincipalId) {
          throw new Error(
            `${etiqueta}: selecciona el responsable principal.`
          );
        }

        if (actividadPrincipal.length < 5) {
          throw new Error(
            `${etiqueta}: la actividad del responsable principal debe tener al menos 5 caracteres.`
          );
        }

        const apoyos = draft.apoyos.map(
          (apoyo, apoyoIndex) => {
            const actividad = apoyo.actividad.trim();

            if (!apoyo.usuarioResponsableId) {
              throw new Error(
                `${etiqueta}: selecciona la persona del apoyo ${apoyoIndex + 1}.`
              );
            }

            if (actividad.length < 5) {
              throw new Error(
                `${etiqueta}: la actividad del apoyo ${apoyoIndex + 1} debe tener al menos 5 caracteres.`
              );
            }

            return {
              usuarioResponsableId:
                apoyo.usuarioResponsableId,
              tipo: "APOYO" as const,
              actividad,
            };
          }
        );

        const idsResponsables = [
          draft.responsablePrincipalId,
          ...apoyos.map(
            (apoyo) => apoyo.usuarioResponsableId
          ),
        ];

        if (
          new Set(idsResponsables).size !==
          idsResponsables.length
        ) {
          throw new Error(
            `${etiqueta}: una persona no puede repetirse como responsable principal y apoyo.`
          );
        }

        return {
          evaluacionId: evaluacion.evaluacionId,
          descripcion,
          recursos: draft.recursos.trim() || null,
          fechaLimite: draft.fechaLimite,
          responsables: [
            {
              usuarioResponsableId:
                draft.responsablePrincipalId,
              tipo: "PRINCIPAL",
              actividad: actividadPrincipal,
            },
            ...apoyos,
          ],
        };
      });

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setErrorLocal(null);

    try {
      await onSubmit(construirCompromisos());
    } catch (currentError) {
      setErrorLocal(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible finalizar la gestión."
      );
    }
  };

  return (
    <AppModal
      open
      title="Compromisos obligatorios"
      description={`Completa ${evaluacionesNuevas.length} compromiso(s) para finalizar la gestión. Cada aspecto incumplido o parcial conserva su propio responsable, actividad y fecha límite.`}
      onClose={onClose}
      busy={busy}
      size="2xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Todos los campos marcados con * son obligatorios.
          </p>

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <AppButton
              variant="secondary"
              size="lg"
              onClick={onClose}
              disabled={busy}
            >
              Volver a la gestión
            </AppButton>

            <AppButton
              type="submit"
              form="compromisos-finalizacion-form"
              variant="primary"
              size="lg"
              loading={busy}
              loadingLabel="Finalizando"
            >
              Guardar compromisos y finalizar
            </AppButton>
          </div>
        </div>
      }
    >
      <form
        id="compromisos-finalizacion-form"
        onSubmit={handleSubmit}
        className="space-y-5"
      >
        {(errorLocal || error) && (
          <AppAlert
            tone="error"
            title="Revisa la información de los compromisos"
            description={errorLocal ?? error ?? undefined}
          />
        )}

        {preparacion.responsablesDisponibles.length ===
          0 && (
          <AppAlert
            tone="warning"
            title="No hay responsables disponibles"
            description="Debes activar o relacionar al menos un usuario con esta empresa antes de registrar los compromisos."
          />
        )}

        {evaluacionesVinculadas.length > 0 && (
          <AppAlert
            tone="info"
            title={`${evaluacionesVinculadas.length} compromiso(s) existente(s) serán vinculados`}
            description="Estos aspectos ya tienen un compromiso abierto y no requieren volver a diligenciarlo."
          >
            <ul className="space-y-1 text-xs text-slate-600">
              {evaluacionesVinculadas.map(
                (evaluacion) => (
                  <li key={evaluacion.evaluacionId}>
                    {evaluacion.aspectoCodigo
                      ? `${evaluacion.aspectoCodigo} · `
                      : ""}
                    {evaluacion.aspectoNombre}
                  </li>
                )
              )}
            </ul>
          </AppAlert>
        )}

        {evaluacionesNuevas.map(
          (evaluacion, index) => {
            const draft =
              borradores[evaluacion.evaluacionId];

            if (!draft) {
              return null;
            }

            const isNoCumplido =
              evaluacion.calificacionAdministrativa === 0;

            return (
              <section
                key={evaluacion.evaluacionId}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <header className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-cyan-700">
                      Compromiso {index + 1} de{" "}
                      {evaluacionesNuevas.length}
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
                    Nota{" "}
                    {
                      evaluacion.calificacionAdministrativa
                    }{" "}
                    ·{" "}
                    {isNoCumplido
                      ? "No cumplido"
                      : "Parcial"}
                  </span>
                </header>

                <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
                  <Field
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
                        actualizarBorrador(
                          evaluacion.evaluacionId,
                          {
                            descripcion:
                              event.target.value,
                          }
                        )
                      }
                      placeholder="Describe el resultado o acción que debe cumplirse..."
                      className={`${inputClass} min-h-24 resize-y`}
                    />
                  </Field>

                  <Field label="Recursos necesarios">
                    <textarea
                      rows={3}
                      maxLength={2000}
                      value={draft.recursos}
                      onChange={(event) =>
                        actualizarBorrador(
                          evaluacion.evaluacionId,
                          {
                            recursos: event.target.value,
                          }
                        )
                      }
                      placeholder="Presupuesto, equipos, documentos o apoyo requerido..."
                      className={`${inputClass} min-h-24 resize-y`}
                    />
                  </Field>

                  <Field label="Fecha límite" required>
                    <input
                      type="date"
                      min={todayInput()}
                      required
                      value={draft.fechaLimite}
                      onChange={(event) =>
                        actualizarBorrador(
                          evaluacion.evaluacionId,
                          {
                            fechaLimite:
                              event.target.value,
                          }
                        )
                      }
                      className={inputClass}
                    />
                  </Field>

                  <Field
                    label="Responsable principal"
                    required
                  >
                    <AppSelect
                      required
                      value={
                        draft.responsablePrincipalId
                      }
                      onChange={(event) =>
                        actualizarBorrador(
                          evaluacion.evaluacionId,
                          {
                            responsablePrincipalId:
                              event.target.value,
                          }
                        )
                      }
                    >
                      <option value="">
                        Seleccionar responsable
                      </option>
                      <ResponsableOptions
                        responsables={
                          preparacion.responsablesDisponibles
                        }
                      />
                    </AppSelect>
                  </Field>

                  <div className="sm:col-span-2">
                    <Field
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
                          actualizarBorrador(
                            evaluacion.evaluacionId,
                            {
                              actividadPrincipal:
                                event.target.value,
                            }
                          )
                        }
                        placeholder="Indica qué debe realizar el responsable principal..."
                        className={`${inputClass} resize-y`}
                      />
                    </Field>
                  </div>

                  <div className="sm:col-span-2">
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
                        onClick={() =>
                          agregarApoyo(
                            evaluacion.evaluacionId
                          )
                        }
                        disabled={busy}
                      >
                        Agregar apoyo
                      </AppButton>
                    </div>

                    {draft.apoyos.length > 0 && (
                      <div className="mt-3 space-y-3">
                        {draft.apoyos.map(
                          (apoyo, apoyoIndex) => (
                            <div
                              key={apoyo.key}
                              className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_auto]"
                            >
                              <Field
                                label={`Persona de apoyo ${apoyoIndex + 1}`}
                                required
                              >
                                <AppSelect
                                  required
                                  value={
                                    apoyo.usuarioResponsableId
                                  }
                                  onChange={(event) =>
                                    actualizarApoyo(
                                      evaluacion.evaluacionId,
                                      apoyo.key,
                                      {
                                        usuarioResponsableId:
                                          event.target
                                            .value,
                                      }
                                    )
                                  }
                                >
                                  <option value="">
                                    Seleccionar persona
                                  </option>
                                  <ResponsableOptions
                                    responsables={
                                      preparacion.responsablesDisponibles
                                    }
                                  />
                                </AppSelect>
                              </Field>

                              <Field
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
                                    actualizarApoyo(
                                      evaluacion.evaluacionId,
                                      apoyo.key,
                                      {
                                        actividad:
                                          event.target.value,
                                      }
                                    )
                                  }
                                  placeholder="Actividad específica..."
                                  className={inputClass}
                                />
                              </Field>

                              <AppButton
                                variant="ghost"
                                size="sm"
                                aria-label={`Quitar apoyo ${apoyoIndex + 1}`}
                                leadingIcon={
                                  <Trash2 size={14} />
                                }
                                className="self-end text-red-700 hover:bg-red-50 hover:text-red-800 sm:px-3"
                                onClick={() =>
                                  eliminarApoyo(
                                    evaluacion.evaluacionId,
                                    apoyo.key
                                  )
                                }
                                disabled={busy}
                              >
                                <span className="sm:hidden">
                                  Quitar apoyo
                                </span>
                              </AppButton>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </section>
            );
          }
        )}

        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          <AlertTriangle
            size={16}
            className="mt-0.5 shrink-0"
          />
          <p>
            La gestión solo se finalizará cuando todos los
            compromisos sean válidos. Si ocurre un error, no
            se creará ningún compromiso parcial.
          </p>
        </div>
      </form>
    </AppModal>
  );
}
