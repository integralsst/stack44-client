import {
  BrainCircuit,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  ExternalLink,
  FileCheck2,
  History,
  Link2,
  Loader2,
  Save,
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

import { ApiError, apiRequest } from "../../../lib/api";
import type { Company } from "../../../types/domain";
import { useAuth } from "../../auth/context/AuthContext";
import {
  aplicarBitacoraCompleta,
  guardarYAnalizarBitacora,
  listarBitacorasEmpresa,
} from "../api/bitacora.api";
import type {
  ModalidadBitacora,
  PropuestaAspectoBitacora,
  RegistroBitacoraListado,
  ResultadoAplicarBitacora,
  ResultadoBitacoraAsistida,
} from "../types/bitacora.types";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-50 disabled:text-slate-500";

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

function estadoRegistroLegible(valor: string): string {
  const labels: Record<string, string> = {
    PENDIENTE: "Pendiente",
    ANALIZANDO: "Analizando",
    ANALIZADA: "Analizada",
    REQUIERE_REVISION: "Requiere revisión",
    APLICADA: "Aplicada",
    ERROR: "Error",
  };

  return labels[valor] ?? valor;
}

function formatearFecha(fecha: string): string {
  const [year, month, day] = fecha.slice(0, 10).split("-");
  if (!year || !month || !day) return fecha;
  return `${day}/${month}/${year}`;
}

function recortar(texto: string, limite = 170): string {
  const limpio = texto.trim().replace(/\s+/g, " ");
  return limpio.length <= limite ? limpio : `${limpio.slice(0, limite)}…`;
}

function nombreAspecto(
  propuesta: PropuestaAspectoBitacora,
  resultado: ResultadoBitacoraAsistida
): { codigo: string; nombre: string } {
  const candidato = resultado.recuperacion.aspectosCandidatos.find(
    (item) => item.aspectoId === propuesta.aspectoId
  );

  return {
    codigo: candidato?.codigo ?? String(propuesta.aspectoId),
    nombre: candidato?.nombre ?? `Aspecto ${propuesta.aspectoId}`,
  };
}

export default function BitacoraPage() {
  const { token } = useAuth();

  const [companies, setCompanies] = useState<Company[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [empresaId, setEmpresaId] = useState("");
  const [fechaEfectiva, setFechaEfectiva] = useState(() => fechaHoyBogota());
  const [modalidad, setModalidad] = useState<ModalidadBitacora>("PRESENCIAL");
  const [tipoActividad, setTipoActividad] = useState("Visita de seguimiento SG-SST");
  const [contenido, setContenido] = useState("");

  const [guardando, setGuardando] = useState(false);
  const [aplicando, setAplicando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultado, setResultado] = useState<ResultadoBitacoraAsistida | null>(null);
  const [aplicacion, setAplicacion] = useState<ResultadoAplicarBitacora | null>(null);
  const [detalleAbierto, setDetalleAbierto] = useState(false);
  const [excluidos, setExcluidos] = useState<Set<number>>(() => new Set());

  const [historial, setHistorial] = useState<RegistroBitacoraListado[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(false);

  useEffect(() => {
    if (!token) return;

    let active = true;

    const cargarEmpresas = async () => {
      setLoadingCompanies(true);
      try {
        const data = await apiRequest<Company[]>("/api/companies", {}, token);
        if (!active) return;

        const activas = data.filter((company) => company.isActive);
        setCompanies(activas);
        setEmpresaId((actual) => actual || activas[0]?.id || "");

        console.info("[BITACORA-ASISTIDA-UI] empresas-cargadas", {
          total: activas.length,
        });
      } catch (loadError) {
        if (!active) return;
        console.error("[BITACORA-ASISTIDA-UI] empresas-error", loadError);
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

  const cargarHistorial = useCallback(async () => {
    if (!token || !empresaId) return;

    setLoadingHistorial(true);
    try {
      const data = await listarBitacorasEmpresa(empresaId, token);
      setHistorial(data);
      console.info("[BITACORA-ASISTIDA-UI] historial-cargado", {
        empresaId,
        total: data.length,
      });
    } catch (loadError) {
      console.error("[BITACORA-ASISTIDA-UI] historial-error", loadError);
    } finally {
      setLoadingHistorial(false);
    }
  }, [empresaId, token]);

  useEffect(() => {
    setResultado(null);
    setAplicacion(null);
    setDetalleAbierto(false);
    setExcluidos(new Set());
    void cargarHistorial();
  }, [cargarHistorial]);

  const empresaSeleccionada = useMemo(
    () => companies.find((company) => company.id === empresaId) ?? null,
    [companies, empresaId]
  );

  const propuestasAplicables = resultado?.resumen.evaluaciones ?? [];
  const propuestasSeleccionadas = propuestasAplicables.filter(
    (propuesta) => !excluidos.has(propuesta.aspectoId)
  );

  const alternarAspecto = (aspectoId: number) => {
    setExcluidos((actual) => {
      const siguiente = new Set(actual);
      if (siguiente.has(aspectoId)) {
        siguiente.delete(aspectoId);
      } else {
        siguiente.add(aspectoId);
      }
      return siguiente;
    });
  };

  const handleGuardar = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token || !empresaId || guardando) return;

    setGuardando(true);
    setError(null);
    setResultado(null);
    setAplicacion(null);
    setDetalleAbierto(false);
    setExcluidos(new Set());

    console.info("[BITACORA-ASISTIDA-UI] guardar-inicio", {
      empresaId,
      fechaEfectiva,
      modalidad,
      tipoActividad,
      longitudContenido: contenido.trim().length,
    });

    try {
      const data = await guardarYAnalizarBitacora(
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
      await cargarHistorial();

      console.info("[BITACORA-ASISTIDA-UI] guardar-completado", {
        registroId: data.registro.id,
        evaluacionesPropuestas: data.resumen.totalEvaluacionesPropuestas,
        requierenRevision: data.resumen.totalRequierenRevision,
        evidencias: data.resumen.totalEvidenciasDetectadas,
      });
    } catch (requestError) {
      console.error("[BITACORA-ASISTIDA-UI] guardar-error", {
        empresaId,
        error: requestError,
        status: requestError instanceof ApiError ? requestError.status : null,
        code: requestError instanceof ApiError ? requestError.code : null,
      });
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible guardar y analizar la Bitácora."
      );
    } finally {
      setGuardando(false);
    }
  };

  const handleAplicar = async () => {
    if (!token || !resultado || aplicando || propuestasSeleccionadas.length === 0) {
      return;
    }

    setAplicando(true);
    setError(null);

    console.info("[BITACORA-ASISTIDA-UI] aplicar-inicio", {
      empresaId,
      registroId: resultado.registro.id,
      totalAplicar: propuestasSeleccionadas.length,
      excluidos: [...excluidos],
    });

    try {
      const data = await aplicarBitacoraCompleta(
        empresaId,
        resultado.registro.id,
        { excluirAspectoIds: [...excluidos] },
        token
      );

      setAplicacion(data);
      await cargarHistorial();

      console.info("[BITACORA-ASISTIDA-UI] aplicar-completado", {
        registroId: data.registroId,
        totalEvaluaciones: data.evaluaciones.length,
        evidencias: data.totalEvidenciasVinculadas,
        idempotente: data.idempotente,
      });
    } catch (requestError) {
      console.error("[BITACORA-ASISTIDA-UI] aplicar-error", {
        empresaId,
        registroId: resultado.registro.id,
        error: requestError,
        status: requestError instanceof ApiError ? requestError.status : null,
        code: requestError instanceof ApiError ? requestError.code : null,
      });
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible aplicar las evaluaciones propuestas."
      );
    } finally {
      setAplicando(false);
    }
  };

  const nuevaBitacora = () => {
    setContenido("");
    setResultado(null);
    setAplicacion(null);
    setDetalleAbierto(false);
    setExcluidos(new Set());
    setError(null);
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
                Registro técnico asistido
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Registra la visita una sola vez. Stack44 guarda el historial, analiza los aspectos afectados y prepara un resumen para aplicar todo en un clic.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 lg:max-w-sm">
              <div className="flex gap-2">
                <CheckCircle2 className="mt-0.5 shrink-0" size={18} />
                <div>
                  <p className="font-bold">Modo asistido</p>
                  <p className="mt-1 text-xs leading-5 text-emerald-800">
                    Guardar crea el historial. La matriz solo se actualiza cuando apruebas el resumen.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <form
          onSubmit={handleGuardar}
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
                disabled={loadingCompanies || guardando || aplicando}
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
                  {empresaSeleccionada.mainCity ? ` · ${empresaSeleccionada.mainCity}` : ""}
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
                disabled={guardando || aplicando}
                required
              />
              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Fecha real de la visita o revisión. El historial conserva por separado cuándo digitaste la nota.
              </p>
            </label>

            <label className="block">
              <span className="mb-1.5 text-xs font-bold uppercase tracking-wide text-slate-500">
                Modalidad
              </span>
              <select
                className={inputClass}
                value={modalidad}
                onChange={(event) => setModalidad(event.target.value as ModalidadBitacora)}
                disabled={guardando || aplicando}
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
                disabled={guardando || aplicando}
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
                disabled={guardando || aplicando || Boolean(aplicacion)}
                minLength={10}
                maxLength={20000}
                placeholder="Describe lo revisado, evidenciado, faltante y los enlaces de soporte cuando existan."
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
                  guardando ||
                  aplicando ||
                  Boolean(aplicacion) ||
                  !empresaId ||
                  contenido.trim().length < 10
                }
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {guardando ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Guardando y analizando...
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    Guardar y analizar
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
              <p className="font-bold">No fue posible completar la operación</p>
              <p className="mt-1 leading-6">{error}</p>
              <p className="mt-2 text-xs text-red-700">
                Para diagnóstico revisa la consola del navegador y los logs de Render con el prefijo BITACORA-ASISTIDA.
              </p>
            </div>
          </div>
        </section>
      )}

      {resultado && (
        <section className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <FileCheck2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-950">
                    Bitácora guardada y analizada
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    Revisa el resumen. Los aspectos sin cambio se omiten para agilizar la gestión.
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-500">
                Registro {resultado.registro.id.slice(0, 8)} · {formatearFecha(resultado.registro.fechaEfectiva)}
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div className="grid gap-3 sm:grid-cols-3">
              <MetricCard
                label="Aspectos que cambiarán"
                value={resultado.resumen.totalEvaluacionesPropuestas}
                caption="Listos para aplicar"
              />
              <MetricCard
                label="Evidencias detectadas"
                value={resultado.resumen.totalEvidenciasDetectadas}
                caption="Enlaces asociados por la IA"
              />
              <MetricCard
                label="Requieren revisión"
                value={resultado.resumen.totalRequierenRevision}
                caption="No se aplican automáticamente"
              />
            </div>

            {propuestasAplicables.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                {propuestasAplicables.map((propuesta, index) => {
                  const aspecto = nombreAspecto(propuesta, resultado);
                  const excluido = excluidos.has(propuesta.aspectoId);

                  return (
                    <div
                      key={propuesta.aspectoId}
                      className={`flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${
                        index > 0 ? "border-t border-slate-200" : ""
                      } ${excluido ? "bg-slate-50 opacity-60" : "bg-white"}`}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs font-black text-cyan-700">{aspecto.codigo}</span>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs font-bold text-slate-500">
                            Confianza {porcentajeConfianza(propuesta.confianza)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm font-bold text-slate-900">{aspecto.nombre}</p>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 text-sm">
                        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 font-medium text-slate-600">
                          {estadoLegible(propuesta.estadoActual)}
                        </span>
                        <span className="text-slate-400">→</span>
                        <span className="rounded-lg bg-emerald-50 px-2.5 py-1.5 font-bold text-emerald-700">
                          {estadoLegible(propuesta.estadoPropuesto)} · {propuesta.calificacionAdministrativaPropuesta ?? "—"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                La IA no encontró cambios suficientemente sustentados para aplicar a la matriz.
              </div>
            )}

            {resultado.resumen.totalRequierenRevision > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                <div className="flex gap-2">
                  <TriangleAlert className="mt-0.5 shrink-0" size={18} />
                  <p>
                    Hay {resultado.resumen.totalRequierenRevision} aspecto(s) con información insuficiente o revisión humana. Se conservan en el historial, pero no se aplican con el botón general.
                  </p>
                </div>
              </div>
            )}

            <div>
              <button
                type="button"
                onClick={() => setDetalleAbierto((actual) => !actual)}
                className="inline-flex items-center gap-2 text-sm font-bold text-cyan-700 hover:text-cyan-800"
              >
                {detalleAbierto ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                {detalleAbierto ? "Ocultar detalle" : "Ver detalle y excluir algo"}
              </button>

              {detalleAbierto && (
                <div className="mt-4 space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  {propuestasAplicables.map((propuesta) => {
                    const aspecto = nombreAspecto(propuesta, resultado);
                    const aplicar = !excluidos.has(propuesta.aspectoId);

                    return (
                      <div key={propuesta.aspectoId} className="rounded-xl border border-slate-200 bg-white p-4">
                        <label className="flex cursor-pointer items-start gap-3">
                          <input
                            type="checkbox"
                            checked={aplicar}
                            onChange={() => alternarAspecto(propuesta.aspectoId)}
                            disabled={Boolean(aplicacion) || aplicando}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-slate-900">
                              {aspecto.codigo} · {aspecto.nombre}
                            </p>
                            <p className="mt-2 text-sm leading-6 text-slate-600">
                              {propuesta.justificacionTecnica}
                            </p>
                            {propuesta.evidenciaBitacora && (
                              <p className="mt-2 text-xs leading-5 text-slate-500">
                                <span className="font-bold">Evidencia interpretada:</span> {propuesta.evidenciaBitacora}
                              </p>
                            )}
                            {propuesta.evidenciasUrls.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {propuesta.evidenciasUrls.map((url) => (
                                  <a
                                    key={url}
                                    href={url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-100"
                                  >
                                    <Link2 size={13} /> Evidencia <ExternalLink size={12} />
                                  </a>
                                ))}
                              </div>
                            )}
                          </div>
                        </label>
                      </div>
                    );
                  })}

                  {resultado.resumen.requierenRevision.map((propuesta) => {
                    const aspecto = nombreAspecto(propuesta, resultado);
                    return (
                      <div key={`revision-${propuesta.aspectoId}`} className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                        <p className="text-sm font-bold text-amber-950">
                          {aspecto.codigo} · {aspecto.nombre}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-amber-900">
                          {propuesta.justificacionTecnica}
                        </p>
                        {propuesta.informacionFaltante.length > 0 && (
                          <p className="mt-2 text-xs leading-5 text-amber-800">
                            <span className="font-bold">Falta:</span> {propuesta.informacionFaltante.join(" · ")}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {!aplicacion ? (
              <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs leading-5 text-slate-500">
                  Al aprobar, Stack44 crea las evaluaciones mediante el motor oficial y conserva el origen en la Bitácora.
                </p>
                <button
                  type="button"
                  onClick={handleAplicar}
                  disabled={aplicando || propuestasSeleccionadas.length === 0}
                  className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-black text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {aplicando ? (
                    <>
                      <Loader2 className="animate-spin" size={18} /> Aplicando...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      {excluidos.size > 0 ? "Aprobar y aplicar selección" : "Aprobar y aplicar todo"}
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-700" size={22} />
                    <div>
                      <p className="font-black text-emerald-950">Bitácora aplicada correctamente</p>
                      <p className="mt-1 text-sm text-emerald-800">
                        {aplicacion.evaluaciones.length} evaluación(es) creadas · {aplicacion.totalEvidenciasVinculadas} evidencia(s) vinculadas.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={nuevaBitacora}
                    className="inline-flex min-h-10 items-center justify-center rounded-xl border border-emerald-300 bg-white px-4 text-sm font-bold text-emerald-800 hover:bg-emerald-100"
                  >
                    Nueva bitácora
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      <section className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <History size={19} />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-950">Historial reciente</h2>
              <p className="text-xs text-slate-500">Registros guardados para la empresa seleccionada.</p>
            </div>
          </div>
          {loadingHistorial && <Loader2 className="animate-spin text-slate-400" size={18} />}
        </div>

        <div className="mt-4 space-y-2">
          {!loadingHistorial && historial.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-500">
              Aún no hay registros de Bitácora para esta empresa.
            </div>
          )}

          {historial.slice(0, 8).map((registro) => (
            <div key={registro.id} className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-black text-slate-700">{formatearFecha(registro.fechaEfectiva)}</span>
                    <span className="text-slate-300">·</span>
                    <span className="font-bold text-slate-500">{registro.autor?.nombre ?? "Usuario"}</span>
                    <span className="text-slate-300">·</span>
                    <span className={registro.aplicada ? "font-bold text-emerald-700" : "font-bold text-cyan-700"}>
                      {estadoRegistroLegible(registro.estadoProcesamiento)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-700">{recortar(registro.contenidoOriginal)}</p>
                </div>

                {registro.resumen && (
                  <div className="flex shrink-0 gap-2 text-[11px] font-bold text-slate-500">
                    <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200">
                      {registro.resumen.totalEvaluacionesPropuestas} cambios
                    </span>
                    <span className="rounded-lg bg-white px-2 py-1 ring-1 ring-slate-200">
                      {registro.resumen.totalEvidenciasDetectadas} evidencias
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetricCard({
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
