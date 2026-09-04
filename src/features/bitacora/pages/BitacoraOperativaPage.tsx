import {
  ArrowRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  History,
  Link2,
  Loader2,
  Save,
  SearchCheck,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import { apiRequest } from "../../../lib/api";
import type { Company } from "../../../types/domain";
import { useAuth } from "../../auth/context/AuthContext";
import {
  aplicarBitacoraCompleta,
  descargarHistorialBitacoraPdf,
  guardarYAnalizarBitacora,
  listarHistorialBitacoraUnificado,
} from "../api/bitacora.api";
import BitacoraDropdown from "../components/BitacoraDropdown";
import type {
  ModalidadBitacora,
  PropuestaAspectoBitacora,
  RegistroHistorialBitacoraUnificado,
  ResultadoAplicarBitacora,
  ResultadoBitacoraAsistida,
} from "../types/bitacora.types";

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50 disabled:text-slate-500";

const MODALIDADES: Array<{
  value: ModalidadBitacora;
  label: string;
  description: string;
}> = [
  {
    value: "PRESENCIAL",
    label: "Presencial",
    description: "Visita o actividad realizada en sitio.",
  },
  {
    value: "REMOTA",
    label: "Remota",
    description: "Seguimiento realizado de forma virtual.",
  },
  {
    value: "OFICINA",
    label: "Oficina",
    description: "Trabajo técnico realizado desde oficina.",
  },
  {
    value: "SEGUIMIENTO_PUNTUAL",
    label: "Seguimiento puntual",
    description: "Revisión específica sobre un asunto concreto.",
  },
];

function fechaHoyBogota(): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const mapa = new Map(
    partes
      .filter((parte) => parte.type !== "literal")
      .map((parte) => [parte.type, parte.value])
  );
  return `${mapa.get("year")}-${mapa.get("month")}-${mapa.get("day")}`;
}

function fechaLegible(fecha: string): string {
  const [year, month, day] = fecha.slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : fecha;
}

function estadoLegible(valor: string | null): string {
  if (!valor) return "Sin evaluación previa";
  const labels: Record<string, string> = {
    CUMPLIDO: "Cumplido",
    PARCIAL: "Parcial",
    NO_CUMPLIDO: "No cumplido",
    NO_APLICA: "No aplica",
  };
  return labels[valor] ?? valor.replaceAll("_", " ");
}

function notaEstado(valor: string | null): string {
  if (valor === "CUMPLIDO" || valor === "NO_APLICA") return "5";
  if (valor === "PARCIAL") return "3";
  if (valor === "NO_CUMPLIDO") return "0";
  return "—";
}

function recortar(texto: string, limite = 220): string {
  const limpio = texto.trim().replace(/\s+/g, " ");
  return limpio.length <= limite ? limpio : `${limpio.slice(0, limite)}…`;
}

function rutaEvaluacion(empresaId: string, aspecto?: string): string {
  if (!aspecto) return `/dashboard/empresas/${empresaId}/evaluacion`;
  return `/dashboard/empresas/${empresaId}/evaluacion?${new URLSearchParams({ aspecto }).toString()}`;
}

function aspectoDe(
  propuesta: PropuestaAspectoBitacora,
  resultado: ResultadoBitacoraAsistida
) {
  const candidato = resultado.recuperacion.aspectosCandidatos.find(
    (item) => item.aspectoId === propuesta.aspectoId
  );
  return {
    codigo: candidato?.codigo ?? String(propuesta.aspectoId),
    nombre: candidato?.nombre ?? `Aspecto ${propuesta.aspectoId}`,
  };
}

function esSoporteNuevo(propuesta: PropuestaAspectoBitacora): boolean {
  return (
    propuesta.accion === "PROPONER_EVALUACION" &&
    propuesta.estadoActual !== null &&
    propuesta.estadoActual === propuesta.estadoPropuesto
  );
}

export default function BitacoraOperativaPage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [empresaId, setEmpresaId] = useState("");
  const [fechaEfectiva, setFechaEfectiva] = useState(fechaHoyBogota);
  const [modalidad, setModalidad] =
    useState<ModalidadBitacora>("PRESENCIAL");
  const [tipoActividad, setTipoActividad] = useState(
    "Visita de seguimiento SG-SST"
  );
  const [contenido, setContenido] = useState("");
  const [resultado, setResultado] =
    useState<ResultadoBitacoraAsistida | null>(null);
  const [aplicacion, setAplicacion] =
    useState<ResultadoAplicarBitacora | null>(null);
  const [historial, setHistorial] = useState<
    RegistroHistorialBitacoraUnificado[]
  >([]);
  const [excluidos, setExcluidos] = useState<Set<number>>(new Set());
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [loadingHistorial, setLoadingHistorial] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let activo = true;

    const cargar = async () => {
      setLoadingCompanies(true);
      try {
        const data = await apiRequest<Company[]>("/api/companies", {}, token);
        if (!activo) return;
        const disponibles = data.filter((company) => company.isActive);
        setCompanies(disponibles);
        setEmpresaId((actual) => actual || disponibles[0]?.id || "");
      } catch (loadError) {
        if (!activo) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "No fue posible cargar las empresas."
        );
      } finally {
        if (activo) setLoadingCompanies(false);
      }
    };

    void cargar();
    return () => {
      activo = false;
    };
  }, [token]);

  const cargarHistorial = useCallback(async () => {
    if (!token || !empresaId) return;
    setLoadingHistorial(true);
    try {
      const data = await listarHistorialBitacoraUnificado(empresaId, token);
      setHistorial(data.registros);
    } catch (loadError) {
      console.error("[BITACORA-UI] historial-error", loadError);
    } finally {
      setLoadingHistorial(false);
    }
  }, [empresaId, token]);

  useEffect(() => {
    setResultado(null);
    setAplicacion(null);
    setExcluidos(new Set());
    setDetalleAbierto(false);
    void cargarHistorial();
  }, [cargarHistorial]);

  const empresa = useMemo(
    () => companies.find((company) => company.id === empresaId) ?? null,
    [companies, empresaId]
  );

  const companyOptions = useMemo(
    () =>
      companies.map((company) => ({
        value: company.id,
        label: company.name,
        description: [
          company.taxId ? `NIT ${company.taxId}` : null,
          company.mainCity,
        ]
          .filter(Boolean)
          .join(" · "),
        icon: <Building2 size={15} />,
      })),
    [companies]
  );

  const modalidadOptions = useMemo(
    () =>
      MODALIDADES.map((item) => ({
        value: item.value,
        label: item.label,
        description: item.description,
      })),
    []
  );

  const aplicables = resultado?.resumen.evaluaciones ?? [];
  const seleccionadas = aplicables.filter(
    (propuesta) => !excluidos.has(propuesta.aspectoId)
  );
  const reconocidos = useMemo(() => {
    if (!resultado) return [];
    const base =
      resultado.resumen.aspectosReconocidos ??
      resultado.analisis.propuestas.filter(
        (propuesta) =>
          propuesta.accion === "PROPONER_EVALUACION" ||
          Boolean(propuesta.evidenciaBitacora)
      );
    return [
      ...new Map(base.map((item) => [item.aspectoId, item])).values(),
    ];
  }, [resultado]);

  const guardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !empresaId || guardando) return;
    setGuardando(true);
    setError(null);
    setResultado(null);
    setAplicacion(null);
    setExcluidos(new Set());
    setDetalleAbierto(false);

    try {
      const data = await guardarYAnalizarBitacora(
        empresaId,
        { fechaEfectiva, contenido, modalidad, tipoActividad },
        token
      );
      setResultado(data);
      await cargarHistorial();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible guardar y analizar la Bitácora."
      );
    } finally {
      setGuardando(false);
    }
  };

  const aplicar = async () => {
    if (!token || !resultado || aplicando || seleccionadas.length === 0) return;
    setAplicando(true);
    setError(null);
    try {
      const data = await aplicarBitacoraCompleta(
        empresaId,
        resultado.registro.id,
        { excluirAspectoIds: [...excluidos] },
        token
      );
      setAplicacion(data);
      await cargarHistorial();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible aplicar las evaluaciones propuestas."
      );
    } finally {
      setAplicando(false);
    }
  };

  const exportarPdf = async () => {
    if (!token || !empresaId || descargando) return;
    setDescargando(true);
    setError(null);
    try {
      const archivo = await descargarHistorialBitacoraPdf(empresaId, token);
      const url = URL.createObjectURL(archivo.blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = archivo.filename ?? "BITACORA_SGSST.pdf";
      document.body.appendChild(enlace);
      enlace.click();
      enlace.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "No fue posible exportar el histórico."
      );
    } finally {
      setDescargando(false);
    }
  };

  const alternar = (aspectoId: number) => {
    setExcluidos((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(aspectoId)) siguiente.delete(aspectoId);
      else siguiente.add(aspectoId);
      return siguiente;
    });
  };

  const nuevaBitacora = () => {
    setContenido("");
    setResultado(null);
    setAplicacion(null);
    setExcluidos(new Set());
    setDetalleAbierto(false);
    setError(null);
  };

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-5 pb-8">
      <section className="rounded-[1.4rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-cyan-700">
              Bitácora SG-SST · IA
            </p>
            <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950 sm:text-2xl">
              Registro técnico asistido
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              Registra la actividad. Stack44 identifica los aspectos relacionados y conserva el histórico.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            <button
              type="button"
              onClick={() => navigate(rutaEvaluacion(empresaId))}
              disabled={!empresaId}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50 sm:px-4"
            >
              <Building2 size={15} />
              <span>Ver evaluación</span>
            </button>
            <button
              type="button"
              onClick={exportarPdf}
              disabled={!empresaId || descargando}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 sm:px-4"
            >
              {descargando ? (
                <Loader2 className="animate-spin" size={15} />
              ) : (
                <Download size={15} />
              )}
              <span className="truncate">Exportar PDF</span>
            </button>
          </div>
        </div>

        <form onSubmit={guardar} className="space-y-5 p-4 sm:p-5">
          <div>
            <FieldLabel icon={<Building2 size={14} />}>Empresa</FieldLabel>
            <BitacoraDropdown
              value={empresaId}
              options={companyOptions}
              onChange={setEmpresaId}
              ariaLabel="Seleccionar empresa"
              placeholder="Selecciona una empresa"
              loading={loadingCompanies}
              disabled={guardando || aplicando}
            />
            {empresa && (
              <p className="mt-1.5 text-xs text-slate-500">
                {[empresa.taxId ? `NIT ${empresa.taxId}` : null, empresa.mainCity]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block min-w-0">
              <FieldLabel icon={<CalendarDays size={14} />}>
                Fecha efectiva
              </FieldLabel>
              <input
                type="date"
                className={INPUT_CLASS}
                value={fechaEfectiva}
                max={fechaHoyBogota()}
                onChange={(event) => setFechaEfectiva(event.target.value)}
                disabled={guardando || aplicando}
                required
              />
            </label>

            <div className="min-w-0">
              <FieldLabel>Modalidad</FieldLabel>
              <BitacoraDropdown
                value={modalidad}
                options={modalidadOptions}
                onChange={(value) => setModalidad(value as ModalidadBitacora)}
                ariaLabel="Seleccionar modalidad"
                disabled={guardando || aplicando}
              />
            </div>

            <label className="block min-w-0 sm:col-span-2 lg:col-span-1">
              <FieldLabel>Tipo de actividad</FieldLabel>
              <input
                className={INPUT_CLASS}
                value={tipoActividad}
                onChange={(event) => setTipoActividad(event.target.value)}
                disabled={guardando || aplicando}
                maxLength={150}
              />
            </label>
          </div>

          <label className="block">
            <FieldLabel icon={<ClipboardList size={14} />}>
              Registro de Bitácora
            </FieldLabel>
            <textarea
              className={`${INPUT_CLASS} min-h-[220px] resize-y leading-6 sm:min-h-[260px]`}
              value={contenido}
              onChange={(event) => setContenido(event.target.value)}
              disabled={guardando || aplicando || Boolean(aplicacion)}
              minLength={10}
              maxLength={20000}
              placeholder="Describe lo revisado, incluye la fecha exacta del documento cuando la conozcas y pega aquí los enlaces de evidencia."
              required
            />
          </label>

          <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs leading-5 text-slate-500">
              <p>{contenido.length.toLocaleString("es-CO")} / 20.000 caracteres</p>
              <p className="hidden sm:block">
                La fecha efectiva corresponde a la visita o revisión, no a la fecha documental.
              </p>
            </div>
            <button
              type="submit"
              aria-busy={guardando}
              disabled={
                guardando ||
                aplicando ||
                Boolean(aplicacion) ||
                !empresaId ||
                contenido.trim().length < 10
              }
              className={`inline-flex min-h-11 w-full items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-xl bg-cyan-700 px-5 text-sm font-medium text-white transition-colors hover:bg-cyan-800 sm:w-[190px] ${
                guardando
                  ? "cursor-wait opacity-100"
                  : "disabled:cursor-not-allowed disabled:opacity-50"
              }`}
            >
              {guardando ? (
                <Loader2 className="animate-spin" size={17} />
              ) : (
                <Save size={17} />
              )}
              {guardando ? "Analizando…" : "Guardar y analizar"}
            </button>
          </div>
        </form>
      </section>

      {error && (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <div className="flex gap-2">
            <TriangleAlert className="mt-0.5 shrink-0" size={17} />
            <div>
              <p className="font-medium">No fue posible completar la operación</p>
              <p className="mt-1 leading-6">{error}</p>
            </div>
          </div>
        </section>
      )}

      {resultado && (
        <section className="rounded-[1.4rem] border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                <FileCheck2 size={18} />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-950">
                  Bitácora guardada y analizada
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Revisa únicamente lo que Stack44 relacionó directamente.
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-400">
              {resultado.registro.id.slice(0, 8)} · {fechaLegible(resultado.registro.fechaEfectiva)}
            </span>
          </div>

          <div className="space-y-5 p-4 sm:p-5">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              <Metric
                label="Reconocidos"
                value={resultado.resumen.totalAspectosReconocidos ?? reconocidos.length}
              />
              <Metric
                label="Cambios / soporte"
                value={resultado.resumen.totalEvaluacionesPropuestas}
              />
              <Metric
                label="Evidencias"
                value={resultado.resumen.totalEvidenciasDetectadas}
              />
              <Metric
                label="Revisión"
                value={resultado.resumen.totalRequierenRevision}
              />
            </div>

            {reconocidos.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                La IA no encontró un aspecto con soporte directo suficiente en este registro.
              </div>
            ) : (
              <div className="space-y-3">
                {reconocidos.map((propuesta) => {
                  const aspecto = aspectoDe(propuesta, resultado);
                  const soporteNuevo = esSoporteNuevo(propuesta);
                  const cambia =
                    propuesta.accion === "PROPONER_EVALUACION" &&
                    propuesta.estadoActual !== propuesta.estadoPropuesto;
                  const etiqueta = cambia
                    ? "Cambio propuesto"
                    : soporteNuevo
                      ? "Soporte nuevo"
                      : propuesta.accion === "SIN_CAMBIO"
                        ? "Sin cambio"
                        : "Reconocido";

                  return (
                    <article
                      key={propuesta.aspectoId}
                      className="rounded-2xl border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span className="font-semibold text-cyan-700">{aspecto.codigo}</span>
                            <span className="text-slate-300">·</span>
                            <span className="text-slate-500">
                              {Math.round(propuesta.confianza * 100)}% confianza
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                                cambia
                                  ? "bg-emerald-50 text-emerald-700"
                                  : soporteNuevo
                                    ? "bg-violet-50 text-violet-700"
                                    : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {etiqueta}
                            </span>
                          </div>
                          <h3 className="mt-1 text-sm font-semibold leading-5 text-slate-950">
                            {aspecto.nombre}
                          </h3>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {recortar(
                              propuesta.evidenciaBitacora || propuesta.justificacionTecnica,
                              180
                            )}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {propuesta.fechaDocumento && (
                              <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-slate-600 ring-1 ring-slate-200">
                                Fecha documental: {fechaLegible(propuesta.fechaDocumento)}
                              </span>
                            )}
                            {propuesta.evidenciasUrls.map((url) => (
                              <a
                                key={url}
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-2.5 py-1.5 font-medium text-cyan-700 ring-1 ring-cyan-200 hover:bg-cyan-100"
                              >
                                <Link2 size={13} /> Evidencia <ExternalLink size={12} />
                              </a>
                            ))}
                          </div>

                          <details className="group mt-3">
                            <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800">
                              Ver detalle técnico
                              <ChevronDown
                                size={14}
                                className="transition group-open:rotate-180"
                              />
                            </summary>
                            <div className="mt-2 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-600">
                              <p>{propuesta.justificacionTecnica}</p>
                              {propuesta.reglaAplicada && (
                                <p className="mt-2 text-slate-500">
                                  Regla: {propuesta.reglaAplicada}
                                </p>
                              )}
                            </div>
                          </details>
                        </div>

                        <div className="flex shrink-0 flex-wrap items-center gap-2 text-xs lg:justify-end">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-slate-600">
                            {estadoLegible(propuesta.estadoActual)} · {notaEstado(propuesta.estadoActual)}
                          </span>
                          {propuesta.accion === "PROPONER_EVALUACION" && (
                            <>
                              <ArrowRight size={13} className="text-slate-400" />
                              <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-medium text-emerald-700">
                                {estadoLegible(propuesta.estadoPropuesto)} · {propuesta.calificacionAdministrativaPropuesta ?? "—"}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {resultado.resumen.totalRequierenRevision > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="flex gap-2">
                  <TriangleAlert className="mt-0.5 shrink-0" size={17} />
                  <span>
                    {resultado.resumen.totalRequierenRevision} aspecto(s) necesitan información adicional o revisión humana.
                  </span>
                </div>
              </div>
            )}

            {aplicables.length > 0 && !aplicacion && (
              <div>
                <button
                  type="button"
                  onClick={() => setDetalleAbierto((actual) => !actual)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-900"
                >
                  <ChevronDown
                    size={16}
                    className={`transition ${detalleAbierto ? "rotate-180" : ""}`}
                  />
                  {detalleAbierto ? "Ocultar selección" : "Ver detalle y excluir algo"}
                </button>

                {detalleAbierto && (
                  <div className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    {aplicables.map((propuesta) => {
                      const aspecto = aspectoDe(propuesta, resultado);
                      return (
                        <label
                          key={propuesta.aspectoId}
                          className="flex cursor-pointer items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200"
                        >
                          <input
                            type="checkbox"
                            checked={!excluidos.has(propuesta.aspectoId)}
                            onChange={() => alternar(propuesta.aspectoId)}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-900">
                              {aspecto.codigo} · {aspecto.nombre}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                              {recortar(propuesta.justificacionTecnica, 180)}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!aplicacion ? (
              <div className="flex flex-col gap-3 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-500">
                  Si solo hubo reconocimiento sin cambio ni soporte nuevo, el registro queda guardado y no requiere aplicación.
                </p>
                <button
                  type="button"
                  onClick={aplicar}
                  aria-busy={aplicando}
                  disabled={aplicando || seleccionadas.length === 0}
                  className={`inline-flex min-h-11 w-full shrink-0 items-center justify-center overflow-hidden whitespace-nowrap rounded-xl bg-emerald-700 px-5 text-sm font-medium text-white transition-colors hover:bg-emerald-800 sm:w-[240px] ${
                    aplicando
                      ? "cursor-wait opacity-100"
                      : "disabled:cursor-not-allowed disabled:opacity-50"
                  }`}
                >
                  <span className="inline-flex min-w-0 items-center justify-center gap-2">
                    {aplicando ? (
                      <Loader2 className="shrink-0 animate-spin" size={17} />
                    ) : (
                      <Sparkles className="shrink-0" size={17} />
                    )}
                    <span>
                      {aplicando
                        ? "Aplicando…"
                        : excluidos.size > 0
                          ? "Aprobar y aplicar selección"
                          : "Aprobar y aplicar todo"}
                    </span>
                  </span>
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex gap-3">
                    <CheckCircle2
                      className="mt-0.5 shrink-0 text-emerald-700"
                      size={20}
                    />
                    <div>
                      <p className="font-semibold text-emerald-950">
                        Bitácora aplicada correctamente
                      </p>
                      <p className="mt-1 text-sm text-emerald-800">
                        {aplicacion.evaluaciones.length} evaluación(es) registradas · {aplicacion.totalEvidenciasVinculadas} evidencia(s) vinculadas.
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={() => navigate(rutaEvaluacion(empresaId))}
                      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-medium text-white hover:bg-emerald-800"
                    >
                      Ver cambios <ArrowRight size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={nuevaBitacora}
                      className="inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 text-sm font-medium text-emerald-800 hover:bg-emerald-100"
                    >
                      Nueva Bitácora
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="rounded-[1.4rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <History size={17} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Histórico
              </h2>
              <p className="mt-0.5 text-sm text-slate-500">
                Bitácora asistida y evaluaciones manuales de la empresa.
              </p>
            </div>
          </div>
          {loadingHistorial && (
            <Loader2 className="animate-spin text-slate-400" size={17} />
          )}
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {!loadingHistorial && historial.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
              Aún no hay registros para esta empresa.
            </div>
          )}

          {historial.slice(0, 8).map((registro) => (
            <article
              key={registro.id}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-slate-900">
                    {fechaLegible(registro.fechaEfectiva)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                      registro.fuente === "BITACORA_IA"
                        ? "bg-cyan-50 text-cyan-700"
                        : "bg-violet-50 text-violet-700"
                    }`}
                  >
                    {registro.fuente === "BITACORA_IA"
                      ? "Bitácora"
                      : "Evaluación manual"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {recortar(registro.contenidoOriginal)}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{registro.autor?.nombre ?? "Usuario"}</span>
                  {registro.resultado && (
                    <span className="font-medium text-slate-700">
                      Resultado: {estadoLegible(registro.resultado.estadoCumplimiento)} · {registro.resultado.calificacionAdministrativa}
                    </span>
                  )}
                  {registro.evidenciasUrls.length > 0 && (
                    <span className="font-medium text-cyan-700">
                      {registro.evidenciasUrls.length} evidencia(s)
                    </span>
                  )}
                </div>
              </div>

              {registro.aspectos[0] && (
                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      rutaEvaluacion(empresaId, registro.aspectos[0].nombre)
                    )
                  }
                  className="inline-flex min-h-9 w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50 sm:w-auto"
                >
                  <SearchCheck size={14} /> Ver en evaluación
                </button>
              )}
            </article>
          ))}
        </div>

        {historial.length > 8 && (
          <div className="mt-4 flex flex-col gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>
              Se muestran los 8 registros más recientes de {historial.length} cargados.
            </span>
            <button
              type="button"
              onClick={exportarPdf}
              className="inline-flex items-center gap-1.5 font-medium text-cyan-700 hover:text-cyan-900"
            >
              <FileText size={14} /> Exportar histórico completo
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

function FieldLabel({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <span className="mb-1.5 flex items-center gap-2 text-xs font-medium text-slate-500">
      {icon}
      {children}
    </span>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </div>
  );
}
