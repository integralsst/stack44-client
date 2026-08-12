import {
  CalendarDays,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  Plus,
  Search,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";

import AppModal from "../../../components/ui/AppModal";
import { useAuth } from "../../auth/context/AuthContext";
import { apiRequest } from "../../../lib/api";
import type { Company } from "../../../types/domain";
import {
  crearAuditoria,
  listarAuditorias,
  obtenerContextoAuditoriaEmpresa,
} from "../api/auditorias.api";
import type {
  AuditoriaResumen,
  ContextoAuditoriaEmpresa,
  EstadoAuditoria,
  ListaAuditoriasResponse,
} from "../types/auditorias.types";

const ESTADOS: Array<{ value: EstadoAuditoria | "TODAS"; label: string }> = [
  { value: "TODAS", label: "Todas" },
  { value: "BORRADOR", label: "Borrador" },
  { value: "EN_EJECUCION", label: "En ejecución" },
  { value: "FINALIZADA", label: "Finalizadas" },
  { value: "CANCELADA", label: "Canceladas" },
];

const ESTADO_UI: Record<EstadoAuditoria, string> = {
  BORRADOR: "border-slate-200 bg-slate-100 text-slate-700",
  EN_EJECUCION: "border-cyan-200 bg-cyan-50 text-cyan-800",
  FINALIZADA: "border-emerald-200 bg-emerald-50 text-emerald-800",
  CANCELADA: "border-red-200 bg-red-50 text-red-800",
};

function fechaCorta(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(date);
}

export default function AuditoriasPage() {
  const navigate = useNavigate();
  const { token, user, hasRole } = useAuth();
  const puedeCrear = hasRole(
    "PROFESSIONAL",
    "COORDINATOR",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );

  const [data, setData] = useState<ListaAuditoriasResponse | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [busquedaAplicada, setBusquedaAplicada] = useState("");
  const [estado, setEstado] = useState<EstadoAuditoria | "TODAS">("TODAS");
  const [pagina, setPagina] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [contexto, setContexto] = useState<ContextoAuditoriaEmpresa | null>(null);
  const [cargandoContexto, setCargandoContexto] = useState(false);
  const [form, setForm] = useState({
    empresaId: user?.companyId ?? "",
    anio: String(new Date().getFullYear()),
    titulo: "",
    objetivo: "",
    alcance: "",
    fechaAuditoria: new Date().toISOString().slice(0, 10),
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setBusquedaAplicada(busqueda.trim());
      setPagina(1);
    }, 300);
    return () => window.clearTimeout(timeout);
  }, [busqueda]);

  const cargar = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      setData(
        await listarAuditorias(token, {
          busqueda: busquedaAplicada,
          estado,
          pagina,
          limite: 25,
        })
      );
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar las auditorías."
      );
    } finally {
      setLoading(false);
    }
  }, [token, busquedaAplicada, estado, pagina]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  useEffect(() => {
    if (!token || !puedeCrear) return;
    void apiRequest<Company[]>("/api/companies", {}, token)
      .then(setCompanies)
      .catch(() => setCompanies([]));
  }, [token, puedeCrear]);

  useEffect(() => {
    if (!token || !modalOpen || !form.empresaId) {
      setContexto(null);
      return;
    }
    setCargandoContexto(true);
    void obtenerContextoAuditoriaEmpresa(token, form.empresaId)
      .then((resultado) => {
        setContexto(resultado);
        setForm((current) => {
          const existeAnio = resultado.periodos.some(
            (item) => String(item.anio) === current.anio
          );

          if (existeAnio || !resultado.periodos[0]) {
            return current;
          }

          return {
            ...current,
            anio: String(resultado.periodos[0].anio),
          };
        });
      })
      .catch((currentError) => {
        setContexto(null);
        setError(
          currentError instanceof Error
            ? currentError.message
            : "No fue posible cargar los periodos de la empresa."
        );
      })
      .finally(() => setCargandoContexto(false));
  }, [token, modalOpen, form.empresaId]);

  const totalAbiertos = useMemo(
    () =>
      data?.auditorias.reduce(
        (total, auditoria) => total + auditoria.resumen.hallazgosAbiertos,
        0
      ) ?? 0,
    [data]
  );

  const abrirCrear = () => {
    const empresaInicial = user?.companyId ?? companies[0]?.id ?? "";
    setForm({
      empresaId: empresaInicial,
      anio: String(new Date().getFullYear()),
      titulo: "",
      objetivo: "",
      alcance: "",
      fechaAuditoria: new Date().toISOString().slice(0, 10),
    });
    setModalOpen(true);
  };

  const guardar = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const creada = await crearAuditoria(token, {
        empresaId: form.empresaId,
        anio: Number(form.anio),
        titulo: form.titulo,
        objetivo: form.objetivo || null,
        alcance: form.alcance || null,
        fechaAuditoria: form.fechaAuditoria,
      });
      setModalOpen(false);
      navigate(`/dashboard/auditorias/${creada.id}`);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible crear la auditoría."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-7xl space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
            Auditorías
          </h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
            Registra hallazgos, recomendaciones y seguimientos sin alterar la historia de las evaluaciones.
          </p>
        </div>
        {puedeCrear && (
          <button
            type="button"
            onClick={abrirCrear}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-cyan-700 bg-cyan-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-cyan-700"
          >
            <Plus size={16} />
            Nueva auditoría
          </button>
        )}
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Resumen label="Auditorías visibles" value={data?.paginacion.total ?? 0} />
        <Resumen label="Hallazgos abiertos en página" value={totalAbiertos} />
        <Resumen
          label="En ejecución en página"
          value={data?.auditorias.filter((item) => item.estado === "EN_EJECUCION").length ?? 0}
        />
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative block min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar por empresa, NIT, título, objetivo o alcance..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
            {ESTADOS.map((item) => {
              const activo = item.value === estado;
              return (
                <button
                  key={item.value}
                  type="button"
                  aria-pressed={activo}
                  onClick={() => {
                    setEstado(item.value);
                    setPagina(1);
                  }}
                  className={`shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition ${
                    activo
                      ? "border-cyan-300 bg-cyan-100 text-cyan-950"
                      : "border-slate-200 bg-white text-slate-600 hover:border-cyan-300 hover:text-cyan-700"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading && !data ? (
        <div className="flex min-h-40 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <Loader2 className="h-6 w-6 animate-spin text-cyan-700" />
        </div>
      ) : (data?.auditorias.length ?? 0) === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
          <ClipboardCheck className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm font-black text-slate-950">
            No hay auditorías para este filtro
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {data?.auditorias.map((auditoria) => (
            <AuditoriaItem
              key={auditoria.id}
              auditoria={auditoria}
              onOpen={() => navigate(`/dashboard/auditorias/${auditoria.id}`)}
            />
          ))}
        </div>
      )}

      {data && data.paginacion.paginas > 1 && (
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm">
          <button
            type="button"
            disabled={pagina <= 1}
            onClick={() => setPagina((current) => current - 1)}
            className="rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 disabled:opacity-40"
          >
            Anterior
          </button>
          <span className="font-semibold text-slate-500">
            Página {pagina} de {data.paginacion.paginas}
          </span>
          <button
            type="button"
            disabled={pagina >= data.paginacion.paginas}
            onClick={() => setPagina((current) => current + 1)}
            className="rounded-lg border border-slate-200 px-3 py-2 font-bold text-slate-700 disabled:opacity-40"
          >
            Siguiente
          </button>
        </div>
      )}

      <AppModal
        open={modalOpen}
        title="Nueva auditoría"
        description="La auditoría se vinculará al periodo anual ya abierto de la empresa."
        onClose={() => setModalOpen(false)}
        busy={submitting}
      >
        <form className="space-y-4" onSubmit={guardar}>
          <Campo label="Empresa">
            <select
              required
              value={form.empresaId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  empresaId: event.target.value,
                }))
              }
              className={inputClass}
            >
              <option value="">Selecciona una empresa</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} · {company.taxId}
                </option>
              ))}
            </select>
          </Campo>

          <Campo label="Periodo">
            <select
              required
              value={form.anio}
              disabled={cargandoContexto}
              onChange={(event) =>
                setForm((current) => ({ ...current, anio: event.target.value }))
              }
              className={inputClass}
            >
              {contexto?.periodos.map((periodo) => (
                <option key={periodo.id} value={periodo.anio}>
                  {periodo.anio} · {periodo.estado}
                </option>
              ))}
            </select>
            {!cargandoContexto && form.empresaId && contexto?.periodos.length === 0 && (
              <p className="mt-1 text-xs text-amber-700">
                Esta empresa aún no tiene un periodo SG-SST abierto/registrado.
              </p>
            )}
          </Campo>

          <Campo label="Título">
            <input
              required
              value={form.titulo}
              onChange={(event) =>
                setForm((current) => ({ ...current, titulo: event.target.value }))
              }
              className={inputClass}
              placeholder="Ej. Auditoría interna SG-SST"
            />
          </Campo>

          <div className="max-w-xs">
            <Campo label="Fecha de auditoría">
              <input
                required
                type="date"
                value={form.fechaAuditoria}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    fechaAuditoria: event.target.value,
                  }))
                }
                className={inputClass}
              />
            </Campo>
          </div>

          <Campo label="Objetivo">
            <textarea
              value={form.objetivo}
              onChange={(event) =>
                setForm((current) => ({ ...current, objetivo: event.target.value }))
              }
              className={`${inputClass} min-h-20 resize-y`}
              placeholder="Describe el propósito principal de la auditoría"
            />
          </Campo>

          <Campo label="Alcance">
            <textarea
              value={form.alcance}
              onChange={(event) =>
                setForm((current) => ({ ...current, alcance: event.target.value }))
              }
              className={`${inputClass} min-h-24 resize-y`}
              placeholder="Áreas, procesos o temas incluidos en la auditoría"
            />
          </Campo>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
              className="min-h-11 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                submitting ||
                !form.empresaId ||
                !form.anio ||
                !form.titulo.trim() ||
                !contexto?.periodos.length
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-cyan-700 bg-cyan-600 px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50"
            >
              {submitting && <Loader2 size={14} className="animate-spin" />}
              Crear auditoría
            </button>
          </div>
        </form>
      </AppModal>
    </section>
  );
}

function AuditoriaItem({
  auditoria,
  onOpen,
}: {
  auditoria: AuditoriaResumen;
  onOpen: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-cyan-300 hover:shadow-md"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
        <ClipboardCheck size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide ${ESTADO_UI[auditoria.estado]}`}>
            {auditoria.estado.replaceAll("_", " ")}
          </span>
          <span className="text-[10px] font-bold text-slate-500">
            {auditoria.empresaPeriodo.anio}
          </span>
        </div>
        <p className="mt-1 truncate text-sm font-black text-slate-950">
          {auditoria.titulo}
        </p>
        <p className="mt-1 truncate text-xs text-slate-600">
          {auditoria.empresaPeriodo.empresa.nombre} · NIT {auditoria.empresaPeriodo.empresa.nit}
        </p>
      </div>
      <div className="hidden shrink-0 text-right sm:block">
        <p className="flex items-center justify-end gap-1 text-xs font-bold text-slate-700">
          <CalendarDays size={13} /> {fechaCorta(auditoria.fechaAuditoria)}
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          {auditoria.resumen.totalHallazgos} hallazgo(s) · {auditoria.resumen.hallazgosAbiertos} abierto(s)
        </p>
      </div>
      <ChevronRight size={17} className="shrink-0 text-cyan-700" />
    </button>
  );
}

function Resumen({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-black text-slate-950">{value}</p>
    </div>
  );
}

const inputClass =
  "min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500";

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
