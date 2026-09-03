import {
  ArrowRight,
  BrainCircuit,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
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
import type {
  ModalidadBitacora,
  PropuestaAspectoBitacora,
  RegistroHistorialBitacoraUnificado,
  ResultadoAplicarBitacora,
  ResultadoBitacoraAsistida,
} from "../types/bitacora.types";

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50 disabled:text-slate-500";

const MODALIDADES: Array<{ value: ModalidadBitacora; label: string }> = [
  { value: "PRESENCIAL", label: "Presencial" },
  { value: "REMOTA", label: "Remota" },
  { value: "OFICINA", label: "Oficina" },
  { value: "SEGUIMIENTO_PUNTUAL", label: "Seguimiento puntual" },
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
  const [modalidad, setModalidad] = useState<ModalidadBitacora>("PRESENCIAL");
  const [tipoActividad, setTipoActividad] = useState("Visita de seguimiento SG-SST");
  const [contenido, setContenido] = useState("");
  const [resultado, setResultado] = useState<ResultadoBitacoraAsistida | null>(null);
  const [aplicacion, setAplicacion] = useState<ResultadoAplicarBitacora | null>(null);
  const [historial, setHistorial] = useState<RegistroHistorialBitacoraUnificado[]>([]);
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
        setError(loadError instanceof Error ? loadError.message : "No fue posible cargar las empresas.");
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
    return [...new Map(base.map((item) => [item.aspectoId, item])).values()];
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
    <div className="mx-auto w-full max-w-[1240px] space-y-5 pb-8">
      <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-violet-50 p-5 sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-700">
                <BrainCircuit size={16} /> Bitácora SG-SST · IA
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Registro técnico asistido</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Stack44 reconoce los aspectos relacionados, conserva el histórico y solo propone cambios cuando existe soporte suficiente.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate(rutaEvaluacion(empresaId))}
                disabled={!empresaId}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
              >
                <Building2 size={16} /> Ver evaluación
              </button>
              <button
                type="button"
                onClick={exportarPdf}
                disabled={!empresaId || descargando}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-cyan-200 bg-cyan-50 px-4 text-sm font-bold text-cyan-800 hover:bg-cyan-100 disabled:opacity-50"
              >
                {descargando ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                Exportar histórico PDF
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={guardar} className="grid gap-5 p-5 sm:p-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.6fr)]">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <Building2 size={15} /> Empresa
              </span>
              <select
                className={INPUT_CLASS}
                value={empresaId}
                onChange={(event) => setEmpresaId(event.target.value)}
                disabled={loadingCompanies || guardando || aplicando}
                required
              >
                {loadingCompanies && <option value="">Cargando...</option>}
                {companies.map((company) => (
                  <option key={company.id} value={company.id}>{company.name}</option>
                ))}
              </select>
              {empresa && (
                <p className="mt-1.5 text-xs text-slate-500">
                  NIT {empresa.taxId}{empresa.mainCity ? ` · ${empresa.mainCity}` : ""}
                </p>
              )}
            </label>

            <label className="block">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <CalendarDays size={15} /> Fecha efectiva
              </span>
              <input
                type="date"
                className={INPUT_CLASS}
                value={fechaEfectiva}
                max={fechaHoyBogota()}
                onChange={(event) => setFechaEfectiva(event.target.value)}
                disabled={guardando || aplicando}
                required
              />
              <p className="mt-1.5 text-xs leading-5 text-slate-500">Fecha real de la visita o revisión; no sustituye la fecha propia del documento.</p>
            </label>

            <label className="block">
              <span className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Modalidad</span>
              <select
                className={INPUT_CLASS}
                value={modalidad}
                onChange={(event) => setModalidad(event.target.value as ModalidadBitacora)}
                disabled={guardando || aplicando}
              >
                {MODALIDADES.map((item) => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">Tipo de actividad</span>
              <input
                className={INPUT_CLASS}
                value={tipoActividad}
                onChange={(event) => setTipoActividad(event.target.value)}
                disabled={guardando || aplicando}
                maxLength={150}
              />
            </label>
          </div>

          <div className="flex min-h-[360px] flex-col">
            <label className="flex flex-1 flex-col">
              <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                <ClipboardList size={15} /> Registro de Bitácora
              </span>
              <textarea
                className={`${INPUT_CLASS} min-h-[300px] flex-1 resize-y leading-6`}
                value={contenido}
                onChange={(event) => setContenido(event.target.value)}
                disabled={guardando || aplicando || Boolean(aplicacion)}
                minLength={10}
                maxLength={20000}
                placeholder="Describe lo revisado, fecha exacta del documento cuando la conozcas y pega aquí los enlaces de evidencia."
                required
              />
            </label>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">{contenido.length.toLocaleString("es-CO")} / 20.000 caracteres</p>
              <button
                type="submit"
                disabled={guardando || aplicando || Boolean(aplicacion) || !empresaId || contenido.trim().length < 10}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 text-sm font-black text-white shadow-sm hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {guardando ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                {guardando ? "Guardando y analizando..." : "Guardar y analizar"}
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
              <p className="font-bold">No fue posible completar la operación</p>
              <p className="mt-1 leading-6">{error}</p>
            </div>
          </div>
        </section>
      )}

      {resultado && (
        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><FileCheck2 size={20} /></div>
                <div>
                  <h2 className="text-lg font-black text-slate-950">Bitácora guardada y analizada</h2>
                  <p className="mt-1 text-sm text-slate-600">Los aspectos reconocidos permanecen visibles aunque su calificación no cambie.</p>
                </div>
              </div>
              <span className="text-xs text-slate-500">Registro {resultado.registro.id.slice(0, 8)} · {fechaLegible(resultado.registro.fechaEfectiva)}</span>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric label="Aspectos reconocidos" value={resultado.resumen.totalAspectosReconocidos ?? reconocidos.length} caption="Relacionados directamente" />
              <Metric label="Cambios / soporte" value={resultado.resumen.totalEvaluacionesPropuestas} caption="Listos para aplicar" />
              <Metric label="Evidencias detectadas" value={resultado.resumen.totalEvidenciasDetectadas} caption="URLs asociadas" />
              <Metric label="Requieren revisión" value={resultado.resumen.totalRequierenRevision} caption="No se aplican solos" />
            </div>

            {reconocidos.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                La IA no encontró un aspecto con soporte directo suficiente en este registro.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                {reconocidos.map((propuesta, index) => {
                  const aspecto = aspectoDe(propuesta, resultado);
                  const soporteNuevo = esSoporteNuevo(propuesta);
                  const cambia = propuesta.accion === "PROPONER_EVALUACION" && propuesta.estadoActual !== propuesta.estadoPropuesto;
                  const etiqueta = cambia ? "Cambio propuesto" : soporteNuevo ? "Soporte nuevo" : propuesta.accion === "SIN_CAMBIO" ? "Sin cambio" : "Reconocido";

                  return (
                    <article key={propuesta.aspectoId} className={`p-4 ${index > 0 ? "border-t border-slate-200" : ""}`}>
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-black text-cyan-700">{aspecto.codigo}</span>
                            <span className="text-xs text-slate-300">·</span>
                            <span className="text-xs font-bold text-slate-500">Confianza {Math.round(propuesta.confianza * 100)}%</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${
                              cambia ? "bg-emerald-50 text-emerald-700" : soporteNuevo ? "bg-violet-50 text-violet-700" : "bg-slate-100 text-slate-600"
                            }`}>{etiqueta}</span>
                          </div>
                          <p className="mt-1 text-sm font-bold text-slate-950">{aspecto.nombre}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{propuesta.justificacionTecnica}</p>
                          <div className="mt-3 flex flex-wrap gap-2 text-xs">
                            {propuesta.fechaDocumento && (
                              <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 font-semibold text-slate-600 ring-1 ring-slate-200">Fecha documental: {fechaLegible(propuesta.fechaDocumento)}</span>
                            )}
                            {propuesta.evidenciasUrls.map((url) => (
                              <a key={url} href={url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-50 px-2.5 py-1.5 font-bold text-cyan-700 ring-1 ring-cyan-200 hover:bg-cyan-100">
                                <Link2 size={13} /> Evidencia detectada <ExternalLink size={12} />
                              </a>
                            ))}
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center gap-2 text-sm">
                          <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-semibold text-slate-600">{estadoLegible(propuesta.estadoActual)} · {notaEstado(propuesta.estadoActual)}</span>
                          {propuesta.accion === "PROPONER_EVALUACION" && (
                            <>
                              <ArrowRight size={14} className="text-slate-400" />
                              <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-black text-emerald-700">{estadoLegible(propuesta.estadoPropuesto)} · {propuesta.calificacionAdministrativaPropuesta ?? "—"}</span>
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
                <div className="flex gap-2"><TriangleAlert className="mt-0.5 shrink-0" size={18} /><span>{resultado.resumen.totalRequierenRevision} aspecto(s) necesitan información adicional o revisión humana.</span></div>
              </div>
            )}

            {aplicables.length > 0 && !aplicacion && (
              <div>
                <button type="button" onClick={() => setDetalleAbierto((actual) => !actual)} className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:text-cyan-800">
                  {detalleAbierto ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                  {detalleAbierto ? "Ocultar selección" : "Ver detalle y excluir algo"}
                </button>
                {detalleAbierto && (
                  <div className="mt-3 space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    {aplicables.map((propuesta) => {
                      const aspecto = aspectoDe(propuesta, resultado);
                      return (
                        <label key={propuesta.aspectoId} className="flex cursor-pointer items-start gap-3 rounded-xl bg-white p-3 ring-1 ring-slate-200">
                          <input type="checkbox" checked={!excluidos.has(propuesta.aspectoId)} onChange={() => alternar(propuesta.aspectoId)} className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{aspecto.codigo} · {aspecto.nombre}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{propuesta.justificacionTecnica}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {!aplicacion ? (
              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-500">Si solo hubo reconocimiento sin cambio ni soporte nuevo, el registro queda guardado y no requiere aplicación.</p>
                <button type="button" onClick={aplicar} disabled={aplicando || seleccionadas.length === 0} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-black text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">
                  {aplicando ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                  {aplicando ? "Aplicando..." : excluidos.size > 0 ? "Aprobar y aplicar selección" : "Aprobar y aplicar todo"}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={22} />
                    <div>
                      <p className="font-black text-emerald-950">Bitácora aplicada correctamente</p>
                      <p className="mt-1 text-sm text-emerald-800">{aplicacion.evaluaciones.length} evaluación(es) registradas · {aplicacion.totalEvidenciasVinculadas} evidencia(s) vinculadas.</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => navigate(rutaEvaluacion(empresaId))} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-black text-white hover:bg-emerald-800">Ver cambios en evaluación <ArrowRight size={15} /></button>
                    <button type="button" onClick={nuevaBitacora} className="inline-flex min-h-10 items-center rounded-xl border border-emerald-300 bg-white px-4 text-sm font-bold text-emerald-800 hover:bg-emerald-100">Nueva Bitácora</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><History size={19} /></div>
            <div>
              <h2 className="text-lg font-black text-slate-950">Histórico de actividades, revisiones y hallazgos</h2>
              <p className="text-xs text-slate-500">Incluye Bitácora asistida y evaluaciones manuales de la empresa.</p>
            </div>
          </div>
          {loadingHistorial && <Loader2 className="animate-spin text-slate-400" size={18} />}
        </div>

        <div className="mt-5">
          {!loadingHistorial && historial.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">Aún no hay registros para esta empresa.</div>
          )}
          {historial.slice(0, 8).map((registro, index) => (
            <article key={registro.id} className={`py-4 ${index > 0 ? "border-t border-slate-200" : ""}`}>
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-slate-950">{fechaLegible(registro.fechaEfectiva)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${registro.fuente === "BITACORA_IA" ? "bg-cyan-50 text-cyan-700" : "bg-violet-50 text-violet-700"}`}>
                      {registro.fuente === "BITACORA_IA" ? "Bitácora" : "Evaluación manual"}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{recortar(registro.contenidoOriginal)}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>{registro.autor?.nombre ?? "Usuario"}</span>
                    {registro.resultado && <span className="font-bold text-slate-700">Resultado: {estadoLegible(registro.resultado.estadoCumplimiento)} · {registro.resultado.calificacionAdministrativa}</span>}
                    {registro.evidenciasUrls.length > 0 && <span className="font-bold text-cyan-700">{registro.evidenciasUrls.length} evidencia(s)</span>}
                  </div>
                </div>
                {registro.aspectos[0] && (
                  <button type="button" onClick={() => navigate(rutaEvaluacion(empresaId, registro.aspectos[0].nombre))} className="inline-flex min-h-9 shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">
                    <SearchCheck size={14} /> Ver en evaluación
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>

        {historial.length > 8 && (
          <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
            <span>Se muestran los 8 registros más recientes de {historial.length} cargados.</span>
            <button type="button" onClick={exportarPdf} className="inline-flex items-center gap-1.5 font-bold text-cyan-700 hover:text-cyan-800"><FileText size={14} /> Exportar histórico completo</button>
          </div>
        )}
      </section>
    </div>
  );
}

function Metric({
  label,
  value,
  caption,
}: {
  label: string;
  value: number;
  caption: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{caption}</p>
    </div>
  );
}
