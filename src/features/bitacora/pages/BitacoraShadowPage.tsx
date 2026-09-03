import {
  BrainCircuit,
  Building2,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Loader2,
  SearchCheck,
  ShieldAlert,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { ApiError, apiRequest } from "../../../lib/api";
import type { Company } from "../../../types/domain";
import { useAuth } from "../../auth/context/AuthContext";
import { analizarBitacoraShadow } from "../api/bitacora.api";
import type {
  AccionAnalisisBitacora,
  ModalidadBitacora,
  ResultadoBitacoraShadow,
} from "../types/bitacora.types";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100";

const MODALIDADES: Array<{
  value: ModalidadBitacora;
  label: string;
}> = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "REMOTA", label: "Remota" },
  { value: "OFICINA", label: "Oficina" },
  {
    value: "SEGUIMIENTO_PUNTUAL",
    label: "Seguimiento puntual",
  },
];

const ACCION_LABEL: Record<AccionAnalisisBitacora, string> = {
  SIN_CAMBIO: "Sin cambio",
  PROPONER_EVALUACION: "Propone evaluación",
  INFORMACION_INSUFICIENTE: "Información insuficiente",
  REQUIERE_REVISION_HUMANA: "Revisión humana",
};

const ACCION_STYLE: Record<AccionAnalisisBitacora, string> = {
  SIN_CAMBIO:
    "border-slate-200 bg-slate-50 text-slate-700",
  PROPONER_EVALUACION:
    "border-emerald-200 bg-emerald-50 text-emerald-700",
  INFORMACION_INSUFICIENTE:
    "border-amber-200 bg-amber-50 text-amber-700",
  REQUIERE_REVISION_HUMANA:
    "border-violet-200 bg-violet-50 text-violet-700",
};

function fechaHoyBogota(): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const valores = new Map(
    partes
      .filter((parte) => parte.type !== "literal")
      .map((parte) => [parte.type, parte.value])
  );

  return `${valores.get("year")}-${valores.get("month")}-${valores.get("day")}`;
}

function porcentajeConfianza(valor: number): string {
  return `${Math.round(valor * 100)}%`;
}

function estadoLegible(valor: string | null): string {
  if (!valor) return "Sin evaluación previa";

  const labels: Record<string, string> = {
    CUMPLIDO: "Cumplido",
    PARCIAL: "Parcial",
    NO_CUMPLIDO: "No cumplido",
    NO_APLICA: "No aplica",
  };

  return labels[valor] ?? valor;
}

export default function BitacoraShadowPage() {
  const { token } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [empresaId, setEmpresaId] = useState("");
  const [fechaEfectiva, setFechaEfectiva] = useState(
    () => fechaHoyBogota()
  );
  const [modalidad, setModalidad] =
    useState<ModalidadBitacora>("PRESENCIAL");
  const [tipoActividad, setTipoActividad] = useState(
    "Visita de seguimiento SG-SST"
  );
  const [contenido, setContenido] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] =
    useState<ResultadoBitacoraShadow | null>(null);

  useEffect(() => {
    if (!token) return;

    let active = true;

    const cargarEmpresas = async () => {
      setLoadingCompanies(true);

      try {
        const data = await apiRequest<Company[]>(
          "/api/companies",
          {},
          token
        );

        if (!active) return;

        const activas = data.filter((company) => company.isActive);
        setCompanies(activas);
        setEmpresaId((actual) => actual || activas[0]?.id || "");

        console.info("[BITACORA-SHADOW-UI] empresas-cargadas", {
          total: activas.length,
        });
      } catch (loadError) {
        if (!active) return;

        console.error(
          "[BITACORA-SHADOW-UI] error-cargando-empresas",
          loadError
        );
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No fue posible cargar las empresas."
        );
      } finally {
        if (active) setLoadingCompanies(false);
      }
    };

    void cargarEmpresas();

    return () => {
      active = false;
    };
  }, [token]);

  const empresaSeleccionada = useMemo(
    () => companies.find((company) => company.id === empresaId) ?? null,
    [companies, empresaId]
  );

  const candidatosPorId = useMemo(() => {
    return new Map(
      resultado?.recuperacion.aspectosCandidatos.map((aspecto) => [
        aspecto.aspectoId,
        aspecto,
      ]) ?? []
    );
  }, [resultado]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!token || !empresaId || submitting) return;

    setSubmitting(true);
    setError(null);
    setResultado(null);

    console.info("[BITACORA-SHADOW-UI] analisis-iniciado", {
      empresaId,
      fechaEfectiva,
      modalidad,
      tipoActividad,
      longitudContenido: contenido.trim().length,
    });

    try {
      const data = await analizarBitacoraShadow(
        empresaId,
        {
          fechaEfectiva,
          contenido,
          modalidad,
          tipoActividad,
        },
        token
      );

      setResultado(data);

      console.info("[BITACORA-SHADOW-UI] analisis-completado", {
        empresaId,
        versionSupermatrizId: data.versionSupermatriz.id,
        modelo: data.analisis.modelo,
        candidatos: data.recuperacion.totalCandidatos,
        propuestas: data.analisis.propuestas.length,
        escrituraRealizada: data.escrituraRealizada,
      });
    } catch (requestError) {
      console.error("[BITACORA-SHADOW-UI] analisis-error", {
        empresaId,
        error: requestError,
        status:
          requestError instanceof ApiError
            ? requestError.status
            : null,
        code:
          requestError instanceof ApiError
            ? requestError.code
            : null,
      });

      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible ejecutar el análisis de la bitácora."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1220px] space-y-5 pb-8">
      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-violet-50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-700">
                <BrainCircuit size={16} />
                Bitácora SG-SST · IA
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                Prueba controlada de interpretación
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Registra una nota técnica y revisa qué aspectos detecta la IA,
                qué propone y con qué nivel de confianza.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 lg:max-w-sm">
              <div className="flex gap-2">
                <ShieldAlert className="mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="font-bold">Modo SHADOW activo</p>
                  <p className="mt-1 text-xs leading-5 text-amber-800">
                    Esta pantalla no crea evaluaciones, no modifica la matriz y
                    no altera el historial.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]"
        >
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Building2 size={15} /> Empresa
              </span>
              <select
                className={inputClass}
                value={empresaId}
                onChange={(event) => setEmpresaId(event.target.value)}
                disabled={loadingCompanies || submitting}
                required
              >
                {loadingCompanies && <option value="">Cargando...</option>}
                {!loadingCompanies && companies.length === 0 && (
                  <option value="">Sin empresas disponibles</option>
                )}
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>
                    {company.name}
                  </option>
                ))}
              </select>
              {empresaSeleccionada && (
                <p className="mt-1.5 text-xs text-slate-500">
                  NIT {empresaSeleccionada.taxId}
                  {empresaSeleccionada.mainCity
                    ? ` · ${empresaSeleccionada.mainCity}`
                    : ""}
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <CalendarDays size={15} /> Fecha efectiva
              </span>
              <input
                type="date"
                className={inputClass}
                value={fechaEfectiva}
                max={fechaHoyBogota()}
                onChange={(event) => setFechaEfectiva(event.target.value)}
                disabled={submitting}
                required
              />
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Debe ser la fecha real de la visita o revisión, no la fecha en
                que digitaste la nota.
              </p>
            </label>

            <label className="block">
              <span className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                Modalidad
              </span>
              <select
                className={inputClass}
                value={modalidad}
                onChange={(event) =>
                  setModalidad(event.target.value as ModalidadBitacora)
                }
                disabled={submitting}
              >
                {MODALIDADES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                Tipo de actividad
              </span>
              <input
                className={inputClass}
                value={tipoActividad}
                onChange={(event) => setTipoActividad(event.target.value)}
                disabled={submitting}
                maxLength={150}
              />
            </label>
          </div>

          <div className="flex min-h-[360px] flex-col">
            <label className="flex flex-1 flex-col">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <ClipboardList size={15} /> Registro de bitácora
              </span>
              <textarea
                className={`${inputClass} min-h-[300px] flex-1 resize-y leading-6`}
                value={contenido}
                onChange={(event) => setContenido(event.target.value)}
                disabled={submitting}
                minLength={10}
                maxLength={20000}
                placeholder="Ejemplo: Durante la visita se revisaron las actas del COPASST. Se evidenciaron las actas correspondientes a enero, febrero y marzo de 2026..."
                required
              />
            </label>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                {contenido.length.toLocaleString("es-CO")} / 20.000 caracteres
              </p>

              <button
                type="submit"
                disabled={
                  submitting ||
                  !empresaId ||
                  contenido.trim().length < 10
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Analizando...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Analizar con IA
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </section>

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
          <div className="flex gap-2">
            <TriangleAlert className="mt-0.5 shrink-0" size={18} />
            <div>
              <p className="font-bold">No fue posible completar el análisis</p>
              <p className="mt-1 leading-6">{error}</p>
              <p className="mt-2 text-xs text-red-700">
                Revisa también la consola del navegador y los logs de Render;
                ambos usan el prefijo BITACORA-SHADOW / OPENROUTER-BITACORA.
              </p>
            </div>
          </div>
        </section>
      )}

      {resultado && (
        <div className="space-y-5">
          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Empresa"
              value={resultado.empresa.nombre}
              caption={`Fecha: ${resultado.registro.fechaEfectiva}`}
            />
            <SummaryCard
              label="Supermatriz"
              value={resultado.versionSupermatriz.nombre}
              caption={`Versión #${resultado.versionSupermatriz.id}`}
            />
            <SummaryCard
              label="Aspectos candidatos"
              value={String(resultado.recuperacion.totalCandidatos)}
              caption="Recuperación previa a la IA"
            />
            <SummaryCard
              label="Modelo"
              value={resultado.analisis.modelo}
              caption={resultado.analisis.versionPrompt}
            />
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-4 flex items-start gap-3">
              <div className="rounded-xl bg-cyan-50 p-2.5 text-cyan-700">
                <SearchCheck size={20} />
              </div>
              <div>
                <h2 className="font-black text-slate-950">
                  Aspectos recuperados
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Estos fueron los candidatos que Stack44 permitió enviar al
                  modelo. La IA no puede proponer IDs fuera de este conjunto.
                </p>
              </div>
            </div>

            {resultado.recuperacion.aspectosCandidatos.length === 0 ? (
              <EmptyState text="La recuperación no encontró aspectos relacionados con la nota." />
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {resultado.recuperacion.aspectosCandidatos.map((aspecto) => (
                  <div
                    key={aspecto.aspectoId}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                          {aspecto.codigo ?? `Aspecto #${aspecto.aspectoId}`}
                        </p>
                        <p className="mt-1 text-sm font-bold leading-5 text-slate-900">
                          {aspecto.nombre}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-bold text-cyan-700">
                        {aspecto.puntajeRecuperacion} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-700">
                  <BrainCircuit size={20} />
                </div>
                <div>
                  <h2 className="font-black text-slate-950">
                    Propuestas de la IA
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Revisa la interpretación antes de permitir cualquier
                    automatización futura.
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                <CheckCircle2 size={14} />
                Escritura realizada: NO
              </div>
            </div>

            {resultado.analisis.propuestas.length === 0 ? (
              <EmptyState text="La IA no propuso cambios para esta nota." />
            ) : (
              <div className="space-y-4">
                {resultado.analisis.propuestas.map((propuesta) => {
                  const candidato = candidatosPorId.get(propuesta.aspectoId);

                  return (
                    <article
                      key={propuesta.aspectoId}
                      className="rounded-2xl border border-slate-200 p-4 sm:p-5"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                            {candidato?.codigo ?? `Aspecto #${propuesta.aspectoId}`}
                          </p>
                          <h3 className="mt-1 text-base font-black leading-6 text-slate-950">
                            {candidato?.nombre ??
                              `Aspecto ${propuesta.aspectoId}`}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-xs font-bold ${ACCION_STYLE[propuesta.accion]}`}
                          >
                            {ACCION_LABEL[propuesta.accion]}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700">
                            Confianza {porcentajeConfianza(propuesta.confianza)}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <DataPoint
                          label="Estado actual"
                          value={estadoLegible(propuesta.estadoActual)}
                        />
                        <DataPoint
                          label="Estado propuesto"
                          value={estadoLegible(propuesta.estadoPropuesto)}
                        />
                        <DataPoint
                          label="Calificación propuesta"
                          value={
                            propuesta.calificacionAdministrativaPropuesta === null
                              ? "—"
                              : String(
                                  propuesta.calificacionAdministrativaPropuesta
                                )
                          }
                        />
                      </div>

                      <div className="mt-4 grid gap-4 lg:grid-cols-2">
                        <TextBlock
                          label="Evidencia interpretada"
                          value={
                            propuesta.evidenciaBitacora ??
                            "Sin evidencia textual específica."
                          }
                        />
                        <TextBlock
                          label="Justificación técnica"
                          value={propuesta.justificacionTecnica}
                        />
                      </div>

                      {(propuesta.informacionFaltante.length > 0 ||
                        propuesta.requiereEvidenciaDocumental ||
                        propuesta.requiereRevisionTecnica) && (
                        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">
                          {propuesta.informacionFaltante.length > 0 && (
                            <p>
                              <strong>Información faltante:</strong>{" "}
                              {propuesta.informacionFaltante.join(" · ")}
                            </p>
                          )}
                          {propuesta.requiereEvidenciaDocumental && (
                            <p>Requiere evidencia documental.</p>
                          )}
                          {propuesta.requiereRevisionTecnica && (
                            <p>Requiere revisión técnica.</p>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  caption,
}: {
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 truncate text-sm font-black text-slate-950" title={value}>
        {value}
      </p>
      <p className="mt-1 truncate text-xs text-slate-500" title={caption}>
        {caption}
      </p>
    </div>
  );
}

function DataPoint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap text-sm leading-6 text-slate-700">
        {value}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
