import {
  ArrowLeft,
  CalendarClock,
  ChevronDown,
  ClipboardCheck,
  FileSearch,
  Loader2,
  MessageSquarePlus,
  Plus,
  Target,
  UserRound,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import AppModal from "../../../components/ui/AppModal";
import { useAuth } from "../../auth/context/AuthContext";
import {
  actualizarHallazgoAuditoria,
  cambiarEstadoAuditoria,
  crearHallazgoAuditoria,
  crearRecomendacionAuditoria,
  obtenerAuditoria,
  obtenerContextoAuditoriaEmpresa,
  registrarSeguimientoAuditoria,
} from "../api/auditorias.api";
import type {
  AuditoriaDetalle,
  ContextoAuditoriaEmpresa,
  EstadoHallazgo,
  EstadoRecomendacion,
  HallazgoAuditoria,
  TipoHallazgo,
} from "../types/auditorias.types";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-cyan-400 focus:bg-white focus:ring-2 focus:ring-cyan-100";

const TIPO_LABEL: Record<TipoHallazgo, string> = {
  NO_CONFORMIDAD: "No conformidad",
  OBSERVACION: "Observación",
  OPORTUNIDAD_MEJORA: "Oportunidad de mejora",
};

const HALLAZGO_UI: Record<EstadoHallazgo, string> = {
  ABIERTO: "border-red-200 bg-red-50 text-red-800",
  EN_GESTION: "border-amber-200 bg-amber-50 text-amber-800",
  RESUELTO: "border-cyan-200 bg-cyan-50 text-cyan-800",
  CERRADO: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

function fecha(value: string | null): string {
  if (!value) return "Sin fecha";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(date);
}

export default function AuditoriaDetallePage() {
  const { auditoriaId = "" } = useParams<{ auditoriaId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, hasRole } = useAuth();
  const puedeEditar = hasRole(
    "PROFESSIONAL",
    "COORDINATOR",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );

  const [auditoria, setAuditoria] = useState<AuditoriaDetalle | null>(null);
  const [contexto, setContexto] = useState<ContextoAuditoriaEmpresa | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hallazgoAbierto, setHallazgoAbierto] = useState<string | null>(
    searchParams.get("hallazgoId")
  );
  const [modalHallazgo, setModalHallazgo] = useState(false);
  const [hallazgoRecomendacion, setHallazgoRecomendacion] =
    useState<HallazgoAuditoria | null>(null);
  const [hallazgoSeguimiento, setHallazgoSeguimiento] =
    useState<HallazgoAuditoria | null>(null);

  const cargar = useCallback(async () => {
    if (!token || !auditoriaId) return;
    setLoading(true);
    setError(null);
    try {
      const detalle = await obtenerAuditoria(token, auditoriaId);
      setAuditoria(detalle);
      const ctx = await obtenerContextoAuditoriaEmpresa(
        token,
        detalle.empresaPeriodo.empresa.id,
        detalle.empresaPeriodo.anio
      );
      setContexto(ctx);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible cargar la auditoría."
      );
    } finally {
      setLoading(false);
    }
  }, [token, auditoriaId]);

  useEffect(() => {
    void cargar();
  }, [cargar]);

  const pendientes = useMemo(
    () =>
      auditoria?.hallazgos.filter(
        (item) => item.estado === "ABIERTO" || item.estado === "EN_GESTION"
      ).length ?? 0,
    [auditoria]
  );

  const cambiarEstado = async (estado: "EN_EJECUCION" | "FINALIZADA" | "CANCELADA") => {
    if (!token || !auditoria) return;
    let motivo: string | null = null;
    if (estado === "CANCELADA") {
      motivo = window.prompt("Indica el motivo de cancelación:")?.trim() || null;
      if (!motivo) return;
    } else if (
      !window.confirm(
        estado === "FINALIZADA"
          ? "¿Finalizar la auditoría? Los hallazgos y recomendaciones quedarán como registro histórico."
          : "¿Iniciar la ejecución de esta auditoría?"
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      await cambiarEstadoAuditoria(token, auditoria.id, estado, motivo);
      await cargar();
    } catch (currentError) {
      setError(currentError instanceof Error ? currentError.message : "No fue posible cambiar el estado.");
    } finally {
      setBusy(false);
    }
  };

  if (loading && !auditoria) {
    return (
      <div className="flex min-h-60 items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-cyan-700" />
      </div>
    );
  }

  if (!auditoria) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
        {error ?? "La auditoría no está disponible."}
      </div>
    );
  }

  const editableContenido =
    puedeEditar &&
    auditoria.estado !== "FINALIZADA" &&
    auditoria.estado !== "CANCELADA";

  return (
    <section className="mx-auto w-full max-w-6xl space-y-4">
      <button
        type="button"
        onClick={() => navigate("/dashboard/auditorias")}
        className="inline-flex items-center gap-2 text-xs font-bold text-cyan-700 hover:text-cyan-900"
      >
        <ArrowLeft size={15} />
        Volver a auditorías
      </button>

      <header className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-200 bg-cyan-50 px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide text-cyan-800">
                {auditoria.estado.replaceAll("_", " ")}
              </span>
              <span className="text-xs font-bold text-slate-500">
                {auditoria.empresaPeriodo.anio}
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950">
              {auditoria.titulo}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {auditoria.empresaPeriodo.empresa.nombre} · NIT {auditoria.empresaPeriodo.empresa.nit}
            </p>
          </div>

          {puedeEditar && (
            <div className="flex flex-wrap gap-2">
              {auditoria.estado === "BORRADOR" && (
                <AccionHeader disabled={busy} onClick={() => void cambiarEstado("EN_EJECUCION")}>
                  Iniciar auditoría
                </AccionHeader>
              )}
              {auditoria.estado === "EN_EJECUCION" && (
                <AccionHeader disabled={busy} onClick={() => void cambiarEstado("FINALIZADA")}>
                  Finalizar auditoría
                </AccionHeader>
              )}
              {(auditoria.estado === "BORRADOR" || auditoria.estado === "EN_EJECUCION") && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void cambiarEstado("CANCELADA")}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-700 disabled:opacity-50"
                >
                  Cancelar
                </button>
              )}
            </div>
          )}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Dato icon={<CalendarClock size={15} />} label="Fecha" value={fecha(auditoria.fechaAuditoria)} />
          <Dato icon={<ClipboardCheck size={15} />} label="Hallazgos" value={String(auditoria.hallazgos.length)} />
          <Dato icon={<Target size={15} />} label="Pendientes" value={String(pendientes)} />
          <Dato icon={<UserRound size={15} />} label="Registrada por" value={auditoria.creadoPor.nombre} />
        </div>

        {(auditoria.objetivo || auditoria.alcance) && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {auditoria.objetivo && <TextoContexto label="Objetivo" value={auditoria.objetivo} />}
            {auditoria.alcance && <TextoContexto label="Alcance" value={auditoria.alcance} />}
          </div>
        )}
      </header>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950">Hallazgos</h2>
          <p className="text-xs text-slate-500">
            Los hallazgos vinculados a un aspecto aparecerán también en su trazabilidad.
          </p>
        </div>
        {editableContenido && (
          <button
            type="button"
            onClick={() => setModalHallazgo(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-700 bg-cyan-600 px-3 py-2.5 text-xs font-extrabold text-white"
          >
            <Plus size={15} />
            Nuevo hallazgo
          </button>
        )}
      </div>

      {auditoria.hallazgos.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-12 text-center shadow-sm">
          <FileSearch className="mx-auto h-10 w-10 text-slate-400" />
          <p className="mt-3 text-sm font-black text-slate-950">Sin hallazgos registrados</p>
          <p className="mt-1 text-xs text-slate-500">
            Puedes finalizar una auditoría sin hallazgos o registrar los encontrados durante la revisión.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {auditoria.hallazgos.map((hallazgo) => (
            <HallazgoCard
              key={hallazgo.id}
              hallazgo={hallazgo}
              empresaId={auditoria.empresaPeriodo.empresa.id}
              anio={auditoria.empresaPeriodo.anio}
              abierta={hallazgoAbierto === hallazgo.id}
              onToggle={() =>
                setHallazgoAbierto((current) => (current === hallazgo.id ? null : hallazgo.id))
              }
              contexto={contexto}
              puedeEditar={puedeEditar && auditoria.estado !== "CANCELADA"}
              puedeCrearContenido={editableContenido}
              onReload={() => void cargar()}
              onError={setError}
              onRecommendation={() => setHallazgoRecomendacion(hallazgo)}
              onFollowUp={() => setHallazgoSeguimiento(hallazgo)}
            />
          ))}
        </div>
      )}

      <NuevoHallazgoModal
        open={modalHallazgo}
        onClose={() => setModalHallazgo(false)}
        auditoria={auditoria}
        contexto={contexto}
        token={token}
        onSaved={async (id) => {
          setModalHallazgo(false);
          setHallazgoAbierto(id);
          await cargar();
        }}
        onError={setError}
      />

      <RecomendacionModal
        hallazgo={hallazgoRecomendacion}
        contexto={contexto}
        token={token}
        onClose={() => setHallazgoRecomendacion(null)}
        onSaved={async () => {
          setHallazgoRecomendacion(null);
          await cargar();
        }}
        onError={setError}
      />

      <SeguimientoModal
        hallazgo={hallazgoSeguimiento}
        token={token}
        onClose={() => setHallazgoSeguimiento(null)}
        onSaved={async () => {
          setHallazgoSeguimiento(null);
          await cargar();
        }}
        onError={setError}
      />
    </section>
  );
}

function HallazgoCard({
  hallazgo,
  empresaId,
  anio,
  abierta,
  onToggle,
  contexto,
  puedeEditar,
  puedeCrearContenido,
  onReload,
  onError,
  onRecommendation,
  onFollowUp,
}: {
  hallazgo: HallazgoAuditoria;
  empresaId: string;
  anio: number;
  abierta: boolean;
  onToggle: () => void;
  contexto: ContextoAuditoriaEmpresa | null;
  puedeEditar: boolean;
  puedeCrearContenido: boolean;
  onReload: () => void;
  onError: (value: string | null) => void;
  onRecommendation: () => void;
  onFollowUp: () => void;
}) {
  const { token } = useAuth();
  const [responsable, setResponsable] = useState(hallazgo.responsableUsuarioId ?? "");
  const [fechaObjetivo, setFechaObjetivo] = useState(hallazgo.fechaObjetivo?.slice(0, 10) ?? "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setResponsable(hallazgo.responsableUsuarioId ?? "");
    setFechaObjetivo(hallazgo.fechaObjetivo?.slice(0, 10) ?? "");
  }, [hallazgo.responsableUsuarioId, hallazgo.fechaObjetivo]);

  const guardarAsignacion = async () => {
    if (!token) return;
    setSaving(true);
    onError(null);
    try {
      await actualizarHallazgoAuditoria(token, hallazgo.id, {
        responsableUsuarioId: responsable || null,
        fechaObjetivo: fechaObjetivo || null,
      });
      onReload();
    } catch (currentError) {
      onError(currentError instanceof Error ? currentError.message : "No fue posible actualizar el hallazgo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={abierta}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-50"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
          <FileSearch size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-500">
              {TIPO_LABEL[hallazgo.tipo]}
            </span>
            <span className={`rounded-full border px-2 py-0.5 text-[9px] font-extrabold uppercase ${HALLAZGO_UI[hallazgo.estado]}`}>
              {hallazgo.estado.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-1 text-sm font-black text-slate-950">{hallazgo.titulo}</p>
          <p className="mt-1 line-clamp-1 text-xs text-slate-600">
            {hallazgo.aspecto?.nombre ?? "Hallazgo general de auditoría"}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1 text-[11px] font-bold text-cyan-700">
          {abierta ? "Cerrar" : "Ver detalle"}
          <ChevronDown size={15} className={abierta ? "rotate-180" : ""} />
        </span>
      </button>

      {abierta && (
        <div className="space-y-3 border-t border-slate-200 bg-slate-50/70 p-4">
          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-sm leading-6 text-slate-700">{hallazgo.descripcion}</p>
            {hallazgo.evidencia && (
              <p className="mt-2 text-xs text-slate-600">
                <strong className="text-slate-900">Evidencia:</strong> {hallazgo.evidencia}
              </p>
            )}
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            <MiniDato label="Responsable" value={hallazgo.responsable?.nombre ?? "Sin asignar"} />
            <MiniDato label="Fecha objetivo" value={fecha(hallazgo.fechaObjetivo)} />
            <MiniDato label="Registrado por" value={hallazgo.creadoPor.nombre} />
          </div>

          {hallazgo.aspecto && (
            <Link
              to={`/dashboard/empresas/${empresaId}/evaluacion?anio=${encodeURIComponent(String(anio))}&aspecto=${encodeURIComponent(hallazgo.aspecto.nombre)}`}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-cyan-700 hover:text-cyan-900"
            >
              <Target size={14} />
              Abrir aspecto en la evaluación
            </Link>
          )}

          {puedeEditar && (
            <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[1fr_180px_auto] sm:items-end">
              <Campo label="Responsable">
                <select value={responsable} onChange={(event) => setResponsable(event.target.value)} className={inputClass}>
                  <option value="">Sin asignar</option>
                  {contexto?.responsables.map((item) => (
                    <option key={item.id} value={item.id}>{item.nombre} · {item.rol}</option>
                  ))}
                </select>
              </Campo>
              <Campo label="Fecha objetivo">
                <input type="date" value={fechaObjetivo} onChange={(event) => setFechaObjetivo(event.target.value)} className={inputClass} />
              </Campo>
              <button
                type="button"
                onClick={() => void guardarAsignacion()}
                disabled={saving}
                className="min-h-10 rounded-xl border border-slate-200 bg-slate-900 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                {saving ? "Guardando…" : "Guardar"}
              </button>
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-950">Recomendaciones</p>
              {puedeCrearContenido && (
                <button type="button" onClick={onRecommendation} className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700">
                  <Plus size={13} /> Añadir
                </button>
              )}
            </div>
            {hallazgo.recomendaciones.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3 text-xs text-slate-500">
                Sin recomendaciones registradas.
              </p>
            ) : (
              hallazgo.recomendaciones.map((recomendacion) => (
                <div key={recomendacion.id} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="min-w-0 flex-1 text-xs leading-5 text-slate-700">{recomendacion.descripcion}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-[9px] font-bold text-slate-700">
                      {recomendacion.estado.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {recomendacion.responsable?.nombre ?? "Sin responsable"} · {fecha(recomendacion.fechaObjetivo)}
                  </p>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-black text-slate-950">Seguimiento</p>
              {puedeEditar && (
                <button type="button" onClick={onFollowUp} className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-700">
                  <MessageSquarePlus size={13} /> Registrar seguimiento
                </button>
              )}
            </div>
            {hallazgo.seguimientos.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-white px-3 py-3 text-xs text-slate-500">
                Todavía no hay seguimientos.
              </p>
            ) : (
              hallazgo.seguimientos.map((seguimiento) => (
                <div key={seguimiento.id} className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                  <p className="text-xs leading-5 text-slate-700">{seguimiento.descripcion}</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {seguimiento.usuario.nombre} · {fecha(seguimiento.createdAt)}
                    {seguimiento.estadoHallazgo ? ` · Hallazgo: ${seguimiento.estadoHallazgo.replaceAll("_", " ")}` : ""}
                    {seguimiento.estadoRecomendacion ? ` · Recomendación: ${seguimiento.estadoRecomendacion.replaceAll("_", " ")}` : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </article>
  );
}

function NuevoHallazgoModal({
  open,
  onClose,
  auditoria,
  contexto,
  token,
  onSaved,
  onError,
}: {
  open: boolean;
  onClose: () => void;
  auditoria: AuditoriaDetalle;
  contexto: ContextoAuditoriaEmpresa | null;
  token: string | null;
  onSaved: (id: string) => Promise<void>;
  onError: (value: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    aspectoId: "",
    tipo: "OBSERVACION" as TipoHallazgo,
    titulo: "",
    descripcion: "",
    evidencia: "",
    responsableUsuarioId: "",
    fechaObjetivo: "",
  });

  useEffect(() => {
    if (!open) return;
    setForm({
      aspectoId: "",
      tipo: "OBSERVACION",
      titulo: "",
      descripcion: "",
      evidencia: "",
      responsableUsuarioId: "",
      fechaObjetivo: "",
    });
  }, [open]);

  const guardar = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) return;
    setBusy(true);
    onError(null);
    try {
      const creado = await crearHallazgoAuditoria(token, auditoria.id, {
        aspectoId: form.aspectoId ? Number(form.aspectoId) : null,
        tipo: form.tipo,
        titulo: form.titulo,
        descripcion: form.descripcion,
        evidencia: form.evidencia || null,
        responsableUsuarioId: form.responsableUsuarioId || null,
        fechaObjetivo: form.fechaObjetivo || null,
      });
      await onSaved(creado.id);
    } catch (currentError) {
      onError(currentError instanceof Error ? currentError.message : "No fue posible guardar el hallazgo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppModal open={open} title="Nuevo hallazgo" description="Puedes asociarlo a un aspecto de la Supermatriz o dejarlo como hallazgo general." onClose={onClose} busy={busy} size="xl">
      <form className="space-y-4" onSubmit={guardar}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Tipo">
            <select value={form.tipo} onChange={(event) => setForm((current) => ({ ...current, tipo: event.target.value as TipoHallazgo }))} className={inputClass}>
              {Object.entries(TIPO_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </Campo>
          <Campo label="Aspecto relacionado">
            <select value={form.aspectoId} onChange={(event) => setForm((current) => ({ ...current, aspectoId: event.target.value }))} className={inputClass}>
              <option value="">Hallazgo general</option>
              {contexto?.aspectos.map((aspecto) => (
                <option key={aspecto.id} value={aspecto.id}>{aspecto.codigo ? `${aspecto.codigo} · ` : ""}{aspecto.nombre}</option>
              ))}
            </select>
          </Campo>
        </div>
        <Campo label="Título">
          <input required value={form.titulo} onChange={(event) => setForm((current) => ({ ...current, titulo: event.target.value }))} className={inputClass} />
        </Campo>
        <Campo label="Descripción">
          <textarea required value={form.descripcion} onChange={(event) => setForm((current) => ({ ...current, descripcion: event.target.value }))} className={`${inputClass} min-h-28 resize-y`} />
        </Campo>
        <Campo label="Evidencia / referencia">
          <textarea value={form.evidencia} onChange={(event) => setForm((current) => ({ ...current, evidencia: event.target.value }))} className={`${inputClass} min-h-20 resize-y`} placeholder="Describe la evidencia observada o la referencia que sustenta el hallazgo." />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Responsable">
            <select value={form.responsableUsuarioId} onChange={(event) => setForm((current) => ({ ...current, responsableUsuarioId: event.target.value }))} className={inputClass}>
              <option value="">Sin asignar</option>
              {contexto?.responsables.map((item) => <option key={item.id} value={item.id}>{item.nombre} · {item.rol}</option>)}
            </select>
          </Campo>
          <Campo label="Fecha objetivo">
            <input type="date" value={form.fechaObjetivo} onChange={(event) => setForm((current) => ({ ...current, fechaObjetivo: event.target.value }))} className={inputClass} />
          </Campo>
        </div>
        <ModalActions busy={busy} onClose={onClose} label="Guardar hallazgo" />
      </form>
    </AppModal>
  );
}

function RecomendacionModal({
  hallazgo,
  contexto,
  token,
  onClose,
  onSaved,
  onError,
}: {
  hallazgo: HallazgoAuditoria | null;
  contexto: ContextoAuditoriaEmpresa | null;
  token: string | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (value: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [responsable, setResponsable] = useState("");
  const [fechaObjetivo, setFechaObjetivo] = useState("");

  useEffect(() => {
    if (!hallazgo) return;
    setDescripcion("");
    setResponsable(hallazgo.responsableUsuarioId ?? "");
    setFechaObjetivo(hallazgo.fechaObjetivo?.slice(0, 10) ?? "");
  }, [hallazgo]);

  const guardar = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !hallazgo) return;
    setBusy(true);
    onError(null);
    try {
      await crearRecomendacionAuditoria(token, hallazgo.id, {
        descripcion,
        responsableUsuarioId: responsable || null,
        fechaObjetivo: fechaObjetivo || null,
      });
      await onSaved();
    } catch (currentError) {
      onError(currentError instanceof Error ? currentError.message : "No fue posible guardar la recomendación.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppModal open={Boolean(hallazgo)} title="Nueva recomendación" description={hallazgo?.titulo} onClose={onClose} busy={busy}>
      <form className="space-y-4" onSubmit={guardar}>
        <Campo label="Recomendación">
          <textarea required value={descripcion} onChange={(event) => setDescripcion(event.target.value)} className={`${inputClass} min-h-28 resize-y`} />
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Responsable">
            <select value={responsable} onChange={(event) => setResponsable(event.target.value)} className={inputClass}>
              <option value="">Sin asignar</option>
              {contexto?.responsables.map((item) => <option key={item.id} value={item.id}>{item.nombre} · {item.rol}</option>)}
            </select>
          </Campo>
          <Campo label="Fecha objetivo">
            <input type="date" value={fechaObjetivo} onChange={(event) => setFechaObjetivo(event.target.value)} className={inputClass} />
          </Campo>
        </div>
        <ModalActions busy={busy} onClose={onClose} label="Guardar recomendación" />
      </form>
    </AppModal>
  );
}

function SeguimientoModal({
  hallazgo,
  token,
  onClose,
  onSaved,
  onError,
}: {
  hallazgo: HallazgoAuditoria | null;
  token: string | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
  onError: (value: string | null) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [recomendacionId, setRecomendacionId] = useState("");
  const [estadoHallazgo, setEstadoHallazgo] = useState<EstadoHallazgo | "">("");
  const [estadoRecomendacion, setEstadoRecomendacion] = useState<EstadoRecomendacion | "">("");

  useEffect(() => {
    if (!hallazgo) return;
    setDescripcion("");
    setRecomendacionId("");
    setEstadoHallazgo("");
    setEstadoRecomendacion("");
  }, [hallazgo]);

  const guardar = async (event: FormEvent) => {
    event.preventDefault();
    if (!token || !hallazgo) return;
    setBusy(true);
    onError(null);
    try {
      await registrarSeguimientoAuditoria(token, hallazgo.id, {
        descripcion,
        recomendacionId: recomendacionId || null,
        estadoHallazgo: estadoHallazgo || null,
        estadoRecomendacion: recomendacionId ? estadoRecomendacion || null : null,
      });
      await onSaved();
    } catch (currentError) {
      onError(currentError instanceof Error ? currentError.message : "No fue posible registrar el seguimiento.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppModal open={Boolean(hallazgo)} title="Registrar seguimiento" description={hallazgo?.titulo} onClose={onClose} busy={busy}>
      <form className="space-y-4" onSubmit={guardar}>
        <Campo label="Seguimiento">
          <textarea required value={descripcion} onChange={(event) => setDescripcion(event.target.value)} className={`${inputClass} min-h-28 resize-y`} />
        </Campo>
        <Campo label="Recomendación relacionada (opcional)">
          <select value={recomendacionId} onChange={(event) => setRecomendacionId(event.target.value)} className={inputClass}>
            <option value="">Seguimiento general del hallazgo</option>
            {hallazgo?.recomendaciones.map((item) => <option key={item.id} value={item.id}>{item.descripcion.slice(0, 90)}</option>)}
          </select>
        </Campo>
        <div className="grid gap-4 sm:grid-cols-2">
          <Campo label="Nuevo estado del hallazgo">
            <select value={estadoHallazgo} onChange={(event) => setEstadoHallazgo(event.target.value as EstadoHallazgo | "")} className={inputClass}>
              <option value="">Conservar estado</option>
              <option value="ABIERTO">Abierto</option>
              <option value="EN_GESTION">En gestión</option>
              <option value="RESUELTO">Resuelto</option>
              <option value="CERRADO">Cerrado</option>
            </select>
          </Campo>
          <Campo label="Nuevo estado de la recomendación">
            <select disabled={!recomendacionId} value={estadoRecomendacion} onChange={(event) => setEstadoRecomendacion(event.target.value as EstadoRecomendacion | "")} className={inputClass}>
              <option value="">Conservar estado</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="EN_PROGRESO">En progreso</option>
              <option value="ATENDIDA">Atendida</option>
              <option value="DESCARTADA">Descartada</option>
            </select>
          </Campo>
        </div>
        <ModalActions busy={busy} onClose={onClose} label="Registrar seguimiento" />
      </form>
    </AppModal>
  );
}

function ModalActions({ busy, onClose, label }: { busy: boolean; onClose: () => void; label: string }) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button type="button" onClick={onClose} disabled={busy} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700">
        Cancelar
      </button>
      <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-xl border border-cyan-700 bg-cyan-600 px-4 py-2.5 text-xs font-extrabold text-white disabled:opacity-50">
        {busy && <Loader2 size={14} className="animate-spin" />}
        {label}
      </button>
    </div>
  );
}

function AccionHeader({ children, disabled, onClick }: { children: ReactNode; disabled: boolean; onClick: () => void }) {
  return (
    <button type="button" disabled={disabled} onClick={onClick} className="rounded-xl border border-cyan-700 bg-cyan-600 px-3 py-2 text-xs font-extrabold text-white disabled:opacity-50">
      {children}
    </button>
  );
}

function Dato({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <div className="flex items-center gap-2 text-slate-500">{icon}<span className="text-[10px] font-bold uppercase tracking-wide">{label}</span></div>
      <p className="mt-1 text-xs font-extrabold text-slate-950">{value}</p>
    </div>
  );
}

function TextoContexto({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-xs leading-5 text-slate-700">{value}</p>
    </div>
  );
}

function MiniDato({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
      <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 truncate text-xs font-extrabold text-slate-950">{value}</p>
    </div>
  );
}

function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-700">{label}</span>
      {children}
    </label>
  );
}
