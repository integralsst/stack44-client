import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Filter,
  RotateCcw,
  XCircle,
} from "lucide-react";
import {
  useMemo,
  useState,
} from "react";

import AppButton from "../../../../components/ui/AppButton";
import AppDropdownSelect from "../../../../components/ui/AppDropdownSelect";
import type {
  DecisionNoAplicaItem,
  EstadoDecisionNoAplica,
  NoAplicaPeriodoResponse,
} from "../../types/controles-evaluacion.types";

interface Props {
  data: NoAplicaPeriodoResponse | null;
  cargando: boolean;
  procesando: string | null;
  onDecide: (
    decisionId: string,
    decision: "APROBAR" | "RECHAZAR",
    observacion: string | null
  ) => Promise<boolean>;
  onReevaluate?: (item: DecisionNoAplicaItem) => void;
}

type EstadoFiltro = "TODOS" | EstadoDecisionNoAplica;

function fecha(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("es-CO", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function fechaEnRango(
  value: string,
  desde: string,
  hasta: string
) {
  const timestamp = new Date(value).getTime();

  if (desde) {
    const inicio = new Date(`${desde}T00:00:00`).getTime();
    if (timestamp < inicio) return false;
  }

  if (hasta) {
    const fin = new Date(`${hasta}T23:59:59.999`).getTime();
    if (timestamp > fin) return false;
  }

  return true;
}

function Estado({ item }: { item: DecisionNoAplicaItem }) {
  const classes = {
    PENDIENTE: "border-amber-400/30 bg-amber-500/10 text-amber-200",
    APROBADO: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
    RECHAZADO: "border-red-400/30 bg-red-500/10 text-red-200",
  }[item.estado];

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-bold leading-none ${classes}`}
    >
      {item.estado} · efectivo {item.resultadoEfectivo}
    </span>
  );
}

export default function NoAplicaPeriodoPanel({
  data,
  cargando,
  procesando,
  onDecide,
  onReevaluate,
}: Props) {
  const [observaciones, setObservaciones] = useState<
    Record<string, string>
  >({});
  const [estadoFiltro, setEstadoFiltro] =
    useState<EstadoFiltro>("TODOS");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const itemsFiltrados = useMemo(() => {
    if (!data) return [];

    return data.items.filter((item) => {
      if (
        estadoFiltro !== "TODOS" &&
        item.estado !== estadoFiltro
      ) {
        return false;
      }

      return fechaEnRango(
        item.solicitadaEn,
        fechaDesde,
        fechaHasta
      );
    });
  }, [data, estadoFiltro, fechaDesde, fechaHasta]);

  const filtrosActivos =
    estadoFiltro !== "TODOS" ||
    Boolean(fechaDesde) ||
    Boolean(fechaHasta);

  const limpiarFiltros = () => {
    setEstadoFiltro("TODOS");
    setFechaDesde("");
    setFechaHasta("");
  };

  if (cargando && !data) {
    return <p className="py-10 text-center text-sm text-neutral-400">Cargando solicitudes de No aplica...</p>;
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-neutral-700 bg-[#0b0c0d] p-6 text-center">
        <CheckCircle2 className="mx-auto text-emerald-400" />
        <p className="mt-2 text-sm font-bold text-white">Sin solicitudes de No aplica</p>
        <p className="mt-1 text-xs text-neutral-500">Las solicitudes aparecerán cuando un profesional finalice una gestión proponiendo No aplica.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-4">
        {[
          ["Total", data.resumen.total],
          ["Pendientes", data.resumen.pendientes],
          ["Aprobados", data.resumen.aprobados],
          ["Rechazados", data.resumen.rechazados],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-xl border border-neutral-800 bg-[#0b0c0d] p-3">
            <p className="text-[10px] uppercase tracking-wide text-neutral-500">{label}</p>
            <p className="mt-1 text-xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <section className="rounded-2xl border border-neutral-800 bg-[#101112] p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                <Filter size={12} />
                Estado
              </span>
              <AppDropdownSelect
                value={estadoFiltro}
                onChange={(value) =>
                  setEstadoFiltro(value as EstadoFiltro)
                }
                ariaLabel="Filtrar solicitudes de No aplica por estado"
                size="sm"
                theme="light"
                options={[
                  {
                    value: "TODOS",
                    label: "Todos",
                    description: "Mostrar todas las solicitudes",
                    leadingIcon: <Filter size={15} className="text-cyan-500" />,
                  },
                  {
                    value: "PENDIENTE",
                    label: "Pendientes",
                    description: "Solicitudes por decidir",
                    leadingIcon: <Clock3 size={15} className="text-amber-500" />,
                  },
                  {
                    value: "APROBADO",
                    label: "Aprobados",
                    description: "No aplica ya validados",
                    leadingIcon: <CheckCircle2 size={15} className="text-emerald-500" />,
                  },
                  {
                    value: "RECHAZADO",
                    label: "Rechazados",
                    description: "Solicitudes no aprobadas",
                    leadingIcon: <XCircle size={15} className="text-red-500" />,
                  },
                ]}
              />
            </div>

            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                Fecha desde
              </span>
              <input
                type="date"
                value={fechaDesde}
                max={fechaHasta || undefined}
                onChange={(event) =>
                  setFechaDesde(event.target.value)
                }
                className="w-full rounded-xl border border-neutral-700 bg-[#08090a] px-3 py-2.5 text-sm text-neutral-200 outline-none focus:border-cyan-500/50"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-500">
                Fecha hasta
              </span>
              <input
                type="date"
                value={fechaHasta}
                min={fechaDesde || undefined}
                onChange={(event) =>
                  setFechaHasta(event.target.value)
                }
                className="w-full rounded-xl border border-neutral-700 bg-[#08090a] px-3 py-2.5 text-sm text-neutral-200 outline-none focus:border-cyan-500/50"
              />
            </label>
          </div>

          <button
            type="button"
            disabled={!filtrosActivos}
            onClick={limpiarFiltros}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-[#08090a] px-4 py-2.5 text-sm font-semibold text-neutral-300 hover:border-cyan-500/40 hover:text-cyan-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <RotateCcw size={14} />
            Limpiar filtros
          </button>
        </div>

        <p className="mt-3 text-xs text-neutral-500">
          {filtrosActivos
            ? `${itemsFiltrados.length} de ${data.items.length} solicitudes mostradas.`
            : `${data.items.length} solicitudes del periodo.`}
        </p>
      </section>

      {itemsFiltrados.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-700 bg-[#0b0c0d] p-6 text-center">
          <Filter className="mx-auto text-neutral-500" />
          <p className="mt-2 text-sm font-bold text-white">
            No hay solicitudes con estos filtros
          </p>
          <p className="mt-1 text-xs text-neutral-500">
            Ajusta el estado o el rango de fechas para ampliar la consulta.
          </p>
        </div>
      ) : (
        itemsFiltrados.map((item) => {
          const busy = procesando === `no-aplica:${item.id}`;
          const observacion = observaciones[item.id] ?? "";

          return (
            <article key={item.id} className="rounded-2xl border border-neutral-800 bg-[#101112] p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-cyan-300">{item.evaluacion.aspecto.codigo ?? "Sin código"}</p>
                  <h3 className="mt-1 text-sm font-bold text-white">{item.evaluacion.aspecto.nombre}</h3>
                  <p className="mt-1 text-xs text-neutral-500">
                    {item.solicitadaPor.nombre} · {item.evaluacion.gestion.tipoActividad} · {fecha(item.solicitadaEn)}
                  </p>
                  {item.decididaPor && item.decididaEn && (
                    <p className="mt-1 text-xs text-neutral-500">
                      Decidido por {item.decididaPor.nombre} · {fecha(item.decididaEn)}
                    </p>
                  )}
                </div>
                <Estado item={item} />
              </div>

              <div className="mt-3 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-cyan-300">Justificación</p>
                <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-neutral-200">
                  {item.evaluacion.justificacionNoAplica || "Sin justificación registrada."}
                </p>
              </div>

              {item.evaluacion.evidencias.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.evaluacion.evidencias.map((evidencia) => (
                    <a
                      key={evidencia.id}
                      href={evidencia.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 rounded-lg border border-neutral-700 bg-[#08090a] px-3 py-2 text-xs font-semibold text-neutral-300 hover:border-cyan-500/40 hover:text-cyan-200"
                    >
                      <ExternalLink size={13} />
                      {evidencia.nombre}
                    </a>
                  ))}
                </div>
              )}

              {item.observacionDecision && (
                <p className="mt-3 rounded-xl border border-neutral-700 bg-[#090a0b] p-3 text-xs leading-5 text-neutral-300">
                  Decisión: {item.observacionDecision}
                </p>
              )}

              {item.estado === "RECHAZADO" && onReevaluate && (
                <div className="mt-3 flex justify-end">
                  <AppButton
                    variant="primary"
                    size="sm"
                    trailingIcon={<ArrowRight size={14} />}
                    onClick={() => onReevaluate(item)}
                  >
                    Reevaluar aspecto
                  </AppButton>
                </div>
              )}

              {item.puedeDecidir && (
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
                  <div className="flex items-center gap-2 text-amber-200">
                    <Clock3 size={15} />
                    <p className="text-xs font-bold">Decisión de coordinación</p>
                  </div>
                  <textarea
                    rows={2}
                    value={observacion}
                    disabled={busy}
                    onChange={(event) =>
                      setObservaciones((prev) => ({
                        ...prev,
                        [item.id]: event.target.value,
                      }))
                    }
                    placeholder="Observación opcional al aprobar; obligatoria al rechazar."
                    className="mt-3 w-full rounded-xl border border-neutral-700 bg-[#08090a] px-3 py-2 text-sm text-white outline-none focus:border-cyan-500/50"
                  />
                  <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <AppButton
                      variant="danger"
                      leadingIcon={<XCircle size={15} />}
                      loading={busy}
                      disabled={Boolean(procesando)}
                      onClick={() => void onDecide(item.id, "RECHAZAR", observacion.trim() || null)}
                    >
                      Rechazar
                    </AppButton>
                    <AppButton
                      variant="success"
                      leadingIcon={<CheckCircle2 size={15} />}
                      loading={busy}
                      disabled={Boolean(procesando)}
                      onClick={() => void onDecide(item.id, "APROBAR", observacion.trim() || null)}
                    >
                      Aprobar No aplica
                    </AppButton>
                  </div>
                </div>
              )}
            </article>
          );
        })
      )}
    </div>
  );
}
