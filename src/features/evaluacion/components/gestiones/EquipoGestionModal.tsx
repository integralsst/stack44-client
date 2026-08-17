import {
  Crown,
  FileCheck2,
  RefreshCw,
  ShieldCheck,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import AppButton from "../../../../components/ui/AppButton";
import AppModal from "../../../../components/ui/AppModal";
import { useAuth } from "../../../auth/context/AuthContext";
import {
  actualizarParticipanteGestion,
  agregarParticipanteGestion,
  obtenerEquipoGestion,
  obtenerProfesionalesDisponiblesGestion,
  retirarParticipanteGestion,
} from "../../api/participantes-gestion.api";
import type {
  EquipoGestionResponse,
  ParticipanteGestion,
  ProfesionalDisponibleGestion,
} from "../../types/participantes-gestion.types";

interface Props {
  open: boolean;
  gestionId: string | null;
  gestionNombre: string;
  onClose: () => void;
  onChanged?: () => void | Promise<void>;
}

function mensajeError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "No fue posible completar la operación.";
}

function nombreCompleto(participante: ParticipanteGestion): string {
  return `${participante.profesional.nombres} ${participante.profesional.apellidos}`.trim();
}

export default function EquipoGestionModal({
  open,
  gestionId,
  gestionNombre,
  onClose,
  onChanged,
}: Props) {
  const { token } = useAuth();
  const [equipo, setEquipo] =
    useState<EquipoGestionResponse | null>(null);
  const [disponibles, setDisponibles] = useState<
    ProfesionalDisponibleGestion[]
  >([]);
  const [cargando, setCargando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profesionalSeleccionado, setProfesionalSeleccionado] =
    useState("");
  const [nuevoPuedeEvaluar, setNuevoPuedeEvaluar] =
    useState(true);
  const [nuevoPuedeEvidencias, setNuevoPuedeEvidencias] =
    useState(true);
  const [nuevaResponsabilidad, setNuevaResponsabilidad] =
    useState("");
  const [responsabilidades, setResponsabilidades] = useState<
    Record<string, string>
  >({});

  const cargar = useCallback(async () => {
    if (!open || !gestionId || !token) return;

    setCargando(true);
    setError(null);

    try {
      const equipoActual = await obtenerEquipoGestion(
        gestionId,
        token
      );
      setEquipo(equipoActual);
      setResponsabilidades(
        Object.fromEntries(
          equipoActual.participantes.map((participante) => [
            participante.id,
            participante.responsabilidad ?? "",
          ])
        )
      );

      if (equipoActual.puedeAdministrarEquipo) {
        setDisponibles(
          await obtenerProfesionalesDisponiblesGestion(
            gestionId,
            token
          )
        );
      } else {
        setDisponibles([]);
      }
    } catch (nextError) {
      setError(mensajeError(nextError));
    } finally {
      setCargando(false);
    }
  }, [gestionId, open, token]);

  useEffect(() => {
    if (open) {
      void cargar();
    } else {
      setEquipo(null);
      setDisponibles([]);
      setError(null);
      setProfesionalSeleccionado("");
      setNuevaResponsabilidad("");
      setNuevoPuedeEvaluar(true);
      setNuevoPuedeEvidencias(true);
    }
  }, [open, cargar]);

  const activos = useMemo(
    () => equipo?.participantes.filter((item) => item.activo) ?? [],
    [equipo]
  );
  const historicos = useMemo(
    () => equipo?.participantes.filter((item) => !item.activo) ?? [],
    [equipo]
  );

  const seleccionado = disponibles.find(
    (item) => item.profesional.id === profesionalSeleccionado
  );

  const ejecutar = async (
    operacion: () => Promise<unknown>
  ) => {
    if (!gestionId || !token) return;

    setProcesando(true);
    setError(null);

    try {
      await operacion();
      await cargar();
      await onChanged?.();
    } catch (nextError) {
      setError(mensajeError(nextError));
    } finally {
      setProcesando(false);
    }
  };

  const agregar = async () => {
    if (!profesionalSeleccionado || !gestionId || !token) {
      setError("Selecciona un profesional para agregar al equipo.");
      return;
    }

    await ejecutar(async () => {
      await agregarParticipanteGestion(
        gestionId,
        {
          profesionalId: profesionalSeleccionado,
          puedeEvaluar: nuevoPuedeEvaluar,
          puedeGestionarEvidencias: nuevoPuedeEvidencias,
          responsabilidad: nuevaResponsabilidad.trim() || null,
        },
        token
      );
      setProfesionalSeleccionado("");
      setNuevaResponsabilidad("");
      setNuevoPuedeEvaluar(true);
      setNuevoPuedeEvidencias(true);
    });
  };

  const actualizar = async (
    participante: ParticipanteGestion,
    cambios: {
      esLider?: boolean;
      puedeEvaluar?: boolean;
      puedeGestionarEvidencias?: boolean;
      responsabilidad?: string | null;
    }
  ) => {
    if (!gestionId || !token) return;

    await ejecutar(() =>
      actualizarParticipanteGestion(
        gestionId,
        participante.id,
        cambios,
        token
      )
    );
  };

  const retirar = async (participante: ParticipanteGestion) => {
    if (!gestionId || !token) return;

    const confirmar = window.confirm(
      `¿Retirar a ${nombreCompleto(participante)} de esta gestión? El registro histórico se conservará.`
    );

    if (!confirmar) return;

    await ejecutar(() =>
      retirarParticipanteGestion(
        gestionId,
        participante.id,
        token
      )
    );
  };

  return (
    <AppModal
      open={open}
      title="Equipo de la gestión"
      description={`Participantes, responsabilidades y permisos operativos de “${gestionNombre}”.`}
      onClose={onClose}
      busy={procesando}
      size="2xl"
    >
      <div className="space-y-5">
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700">
              <Users size={19} />
            </div>
            <div>
              <p className="font-bold text-slate-900">
                {activos.length} participante(s) activo(s)
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Un solo líder coordina el cierre. Los permisos de evaluación y evidencias se administran por persona.
              </p>
            </div>
          </div>

          <AppButton
            size="sm"
            variant="secondary"
            leadingIcon={<RefreshCw size={15} />}
            onClick={() => void cargar()}
            loading={cargando}
          >
            Actualizar
          </AppButton>
        </div>

        {cargando && !equipo ? (
          <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-12 text-center text-sm text-slate-500">
            Cargando equipo de la gestión...
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Participantes activos
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Todos trabajan sobre el mismo borrador; cada cambio conserva la autoría de quien lo registra.
                </p>
              </div>

              {activos.map((participante) => (
                <article
                  key={participante.id}
                  className={`rounded-2xl border p-4 ${
                    participante.esLider
                      ? "border-cyan-300 bg-cyan-50/60"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-900">
                          {nombreCompleto(participante)}
                        </p>
                        {participante.esLider && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-cyan-800">
                            <Crown size={12} />
                            Líder
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-slate-500">
                        {participante.profesional.correo}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {participante.profesional.cargo ??
                          participante.profesional.rolProfesional ??
                          participante.profesional.profesion ??
                          "Profesional SST"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          participante.puedeEvaluar
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <ShieldCheck size={13} />
                        {participante.puedeEvaluar
                          ? "Puede evaluar"
                          : "Solo lectura"}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          participante.puedeGestionarEvidencias
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        <FileCheck2 size={13} />
                        {participante.puedeGestionarEvidencias
                          ? "Gestiona evidencias"
                          : "Sin evidencias"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="text-xs font-semibold text-slate-600">
                      Responsabilidad en esta gestión
                    </label>
                    <textarea
                      value={responsabilidades[participante.id] ?? ""}
                      onChange={(event) =>
                        setResponsabilidades((actual) => ({
                          ...actual,
                          [participante.id]: event.target.value,
                        }))
                      }
                      disabled={!equipo?.puedeAdministrarEquipo || procesando}
                      placeholder="Ej. Validar gestión documental y registrar soportes."
                      className="mt-1.5 min-h-20 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 disabled:bg-slate-100"
                    />
                  </div>

                  {equipo?.puedeAdministrarEquipo && (
                    <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-200 pt-4">
                      <AppButton
                        size="sm"
                        variant={
                          participante.puedeEvaluar
                            ? "secondary"
                            : "success"
                        }
                        disabled={procesando}
                        onClick={() =>
                          void actualizar(participante, {
                            puedeEvaluar: !participante.puedeEvaluar,
                          })
                        }
                      >
                        {participante.puedeEvaluar
                          ? "Quitar permiso de evaluar"
                          : "Permitir evaluar"}
                      </AppButton>

                      <AppButton
                        size="sm"
                        variant={
                          participante.puedeGestionarEvidencias
                            ? "secondary"
                            : "success"
                        }
                        disabled={procesando}
                        onClick={() =>
                          void actualizar(participante, {
                            puedeGestionarEvidencias:
                              !participante.puedeGestionarEvidencias,
                          })
                        }
                      >
                        {participante.puedeGestionarEvidencias
                          ? "Quitar permiso de evidencias"
                          : "Permitir evidencias"}
                      </AppButton>

                      <AppButton
                        size="sm"
                        variant="secondary"
                        disabled={procesando}
                        onClick={() =>
                          void actualizar(participante, {
                            responsabilidad:
                              responsabilidades[participante.id]?.trim() ||
                              null,
                          })
                        }
                      >
                        Guardar responsabilidad
                      </AppButton>

                      {!participante.esLider && (
                        <>
                          <AppButton
                            size="sm"
                            variant="warning"
                            leadingIcon={<Crown size={14} />}
                            disabled={procesando}
                            onClick={() =>
                              void actualizar(participante, {
                                esLider: true,
                              })
                            }
                          >
                            Hacer líder
                          </AppButton>
                          <AppButton
                            size="sm"
                            variant="danger"
                            leadingIcon={<UserMinus size={14} />}
                            disabled={procesando}
                            onClick={() => void retirar(participante)}
                          >
                            Retirar
                          </AppButton>
                        </>
                      )}
                    </div>
                  )}
                </article>
              ))}
            </section>

            {equipo?.puedeAdministrarEquipo && (
              <section className="rounded-2xl border border-cyan-200 bg-cyan-50/50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm">
                    <UserPlus size={17} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Agregar participante
                    </h3>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Solo aparecen profesionales vinculados a la empresa. Si tienen categorías configuradas, deben ser compatibles con la categoría de esta gestión.
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <div className="lg:col-span-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Profesional
                    </label>
                    <select
                      value={profesionalSeleccionado}
                      onChange={(event) =>
                        setProfesionalSeleccionado(event.target.value)
                      }
                      disabled={procesando}
                      className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
                    >
                      <option value="">Seleccionar profesional</option>
                      {disponibles.map((item) => (
                        <option
                          key={item.profesional.id}
                          value={item.profesional.id}
                          disabled={!item.disponibleParaAgregar}
                        >
                          {item.profesional.nombres} {item.profesional.apellidos}
                          {item.yaParticipa
                            ? " · ya participa"
                            : item.conflictoBorrador
                              ? " · tiene otro borrador"
                              : !item.categoriaCompatible
                                ? " · categoría no habilitada"
                                : ""}
                        </option>
                      ))}
                    </select>
                    {seleccionado && (
                      <p className="mt-2 text-xs text-slate-500">
                        {seleccionado.categoriasConfiguradas
                          ? `Categorías: ${seleccionado.categorias.map((categoria) => categoria.nombre).join(", ") || "ninguna"}.`
                          : "Esta asignación todavía no tiene categorías específicas configuradas; se mantiene compatibilidad con el esquema histórico."}
                      </p>
                    )}
                  </div>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={nuevoPuedeEvaluar}
                      onChange={(event) =>
                        setNuevoPuedeEvaluar(event.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Puede registrar y modificar evaluaciones
                  </label>

                  <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={nuevoPuedeEvidencias}
                      onChange={(event) =>
                        setNuevoPuedeEvidencias(event.target.checked)
                      }
                      className="h-4 w-4 rounded border-slate-300"
                    />
                    Puede gestionar evidencias de evaluación
                  </label>

                  <div className="lg:col-span-2">
                    <label className="text-xs font-semibold text-slate-600">
                      Responsabilidad
                    </label>
                    <textarea
                      value={nuevaResponsabilidad}
                      onChange={(event) =>
                        setNuevaResponsabilidad(event.target.value)
                      }
                      placeholder="Describe qué hará este profesional dentro de la gestión."
                      className="mt-1.5 min-h-20 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10"
                    />
                  </div>
                </div>

                <div className="mt-4 flex justify-end">
                  <AppButton
                    variant="primary"
                    leadingIcon={<UserPlus size={15} />}
                    disabled={
                      procesando ||
                      !profesionalSeleccionado ||
                      !seleccionado?.disponibleParaAgregar
                    }
                    loading={procesando}
                    onClick={() => void agregar()}
                  >
                    Agregar al equipo
                  </AppButton>
                </div>
              </section>
            )}

            {historicos.length > 0 && (
              <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-bold text-slate-900">
                  Historial del equipo
                </h3>
                <div className="mt-3 space-y-2">
                  {historicos.map((participante) => (
                    <div
                      key={participante.id}
                      className="flex flex-col gap-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {nombreCompleto(participante)}
                        </p>
                        <p className="text-xs text-slate-500">
                          Participó desde {new Date(participante.fechaInicio).toLocaleDateString("es-CO")}
                          {participante.fechaFin
                            ? ` hasta ${new Date(participante.fechaFin).toLocaleDateString("es-CO")}`
                            : ""}
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-slate-500">
                        Retirado
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </AppModal>
  );
}
