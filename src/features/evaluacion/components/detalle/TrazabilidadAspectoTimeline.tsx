import {
  CheckCircle2,
  ClipboardCheck,
  FileClock,
  FileSearch,
  GitPullRequestArrow,
  History,
  Paperclip,
  ShieldCheck,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  DetalleAspectoConTrazabilidad,
  EventoTrazabilidadAspecto,
  TipoEventoTrazabilidadAspecto,
} from "../../types/trazabilidad-aspecto.types";
import DetalleColapsableCard from "./DetalleColapsableCard";
import DetalleEventoTrazabilidad from "./DetalleEventoTrazabilidad";
import { formatDate } from "./DetalleAspectoUi";

type FiltroTrazabilidad =
  | "TODOS"
  | "EVALUACION"
  | "EVIDENCIA"
  | "DECISIONES"
  | "REVISION_TECNICA"
  | "COMPROMISO"
  | "AUDITORIA";

interface Props {
  data: DetalleAspectoConTrazabilidad;
  onOpenRevisionTecnica: () => void;
}

const filtros: Array<{
  id: FiltroTrazabilidad;
  label: string;
}> = [
  { id: "TODOS", label: "Todo" },
  { id: "EVALUACION", label: "Evaluaciones" },
  { id: "EVIDENCIA", label: "Evidencias" },
  { id: "DECISIONES", label: "Decisiones" },
  { id: "REVISION_TECNICA", label: "Revisión técnica" },
  { id: "COMPROMISO", label: "Compromisos" },
  { id: "AUDITORIA", label: "Auditorías" },
];

function coincideFiltro(
  evento: EventoTrazabilidadAspecto,
  filtro: FiltroTrazabilidad
) {
  if (filtro === "TODOS") return true;
  if (filtro === "DECISIONES") {
    return (
      evento.tipo === "NO_APLICA" ||
      evento.tipo === "APROBACION_GESTION"
    );
  }
  return evento.tipo === filtro;
}

function configTipo(tipo: TipoEventoTrazabilidadAspecto) {
  if (tipo === "REVISION_TECNICA") {
    return {
      icon: ShieldCheck,
      label: "Revisión técnica",
      circle: "border-violet-200 bg-violet-50 text-violet-700",
      badge: "border-violet-200 bg-violet-50 text-violet-700",
    };
  }

  if (tipo === "EVIDENCIA") {
    return {
      icon: Paperclip,
      label: "Evidencia",
      circle: "border-emerald-200 bg-emerald-50 text-emerald-700",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  if (tipo === "COMPROMISO") {
    return {
      icon: GitPullRequestArrow,
      label: "Compromiso",
      circle: "border-cyan-200 bg-cyan-50 text-cyan-700",
      badge: "border-cyan-200 bg-cyan-50 text-cyan-700",
    };
  }

  if (tipo === "AUDITORIA") {
    return {
      icon: FileSearch,
      label: "Auditoría",
      circle: "border-orange-200 bg-orange-50 text-orange-700",
      badge: "border-orange-200 bg-orange-50 text-orange-700",
    };
  }

  if (tipo === "NO_APLICA") {
    return {
      icon: ClipboardCheck,
      label: "No aplica",
      circle: "border-amber-200 bg-amber-50 text-amber-700",
      badge: "border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  if (tipo === "APROBACION_GESTION") {
    return {
      icon: CheckCircle2,
      label: "Aprobación",
      circle: "border-emerald-200 bg-emerald-50 text-emerald-700",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    };
  }

  return {
    icon: FileClock,
    label: "Evaluación",
    circle: "border-slate-200 bg-slate-50 text-slate-700",
    badge: "border-slate-200 bg-slate-50 text-slate-700",
  };
}

export default function TrazabilidadAspectoTimeline({
  data,
  onOpenRevisionTecnica,
}: Props) {
  const eventos = data.trazabilidad;
  const [filtro, setFiltro] =
    useState<FiltroTrazabilidad>("TODOS");
  const [eventoAbiertoId, setEventoAbiertoId] =
    useState<string | null>(null);

  const visibles = useMemo(
    () => eventos.filter((evento) => coincideFiltro(evento, filtro)),
    [eventos, filtro]
  );

  const conteos = useMemo(() => {
    return {
      evaluaciones: eventos.filter((item) => item.tipo === "EVALUACION").length,
      evidencias: eventos.filter((item) => item.tipo === "EVIDENCIA").length,
      decisiones: eventos.filter(
        (item) =>
          item.tipo === "NO_APLICA" ||
          item.tipo === "APROBACION_GESTION"
      ).length,
      revisiones: eventos.filter(
        (item) => item.tipo === "REVISION_TECNICA"
      ).length,
      compromisos: eventos.filter((item) => item.tipo === "COMPROMISO").length,
      auditorias: eventos.filter((item) => item.tipo === "AUDITORIA").length,
    };
  }, [eventos]);

  const cambiarFiltro = (next: FiltroTrazabilidad) => {
    setFiltro(next);
    setEventoAbiertoId(null);
  };

  return (
    <section>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-950">
              <History size={17} className="text-cyan-700" />
              <h3 className="text-sm font-bold">Trazabilidad del aspecto</h3>
            </div>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-600">
              Recorre la historia de arriba hacia abajo. Todo inicia colapsado: abre únicamente el evento que necesitas para consultar su detalle sin perder el contexto.
            </p>
          </div>

          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
            {eventos.length} evento(s)
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
          <ResumenMini label="Evaluaciones" value={conteos.evaluaciones} />
          <ResumenMini label="Evidencias" value={conteos.evidencias} />
          <ResumenMini label="Decisiones" value={conteos.decisiones} />
          <ResumenMini label="Revisiones" value={conteos.revisiones} />
          <ResumenMini label="Compromisos" value={conteos.compromisos} />
          <ResumenMini label="Auditorías" value={conteos.auditorias} />
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {filtros.map((item) => {
            const active = filtro === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => cambiarFiltro(item.id)}
                className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                  active
                    ? "border-cyan-300 bg-cyan-50 text-cyan-800"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {visibles.length === 0 ? (
        <div className="mt-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
          <p className="text-sm font-semibold text-slate-700">
            No hay eventos para este filtro.
          </p>
        </div>
      ) : (
        <div className="relative mt-4 space-y-1">
          <div className="absolute bottom-4 left-[17px] top-4 w-px bg-slate-200" />

          {visibles.map((evento) => {
            const config = configTipo(evento.tipo);
            const Icon = config.icon;
            const abierto = eventoAbiertoId === evento.id;

            const summary = (
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${config.badge}`}
                    >
                      {config.label}
                    </span>
                    {evento.estado && (
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {evento.estado.replaceAll("_", " ")}
                      </span>
                    )}
                  </div>

                  <h4 className="mt-2 text-sm font-bold text-slate-950">
                    {evento.titulo}
                  </h4>
                  <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                    {evento.descripcion}
                  </p>
                </div>

                <div className="shrink-0 text-left sm:text-right">
                  <p className="text-[10px] font-semibold text-slate-500">
                    {formatDate(evento.createdAt, true)}
                  </p>
                  {evento.usuario && (
                    <p className="mt-1 text-[10px] text-slate-500">
                      {evento.usuario.nombre}
                    </p>
                  )}
                </div>
              </div>
            );

            return (
              <div
                key={evento.id}
                className="relative flex gap-3 rounded-2xl px-1 py-2.5 sm:gap-4 sm:px-2"
              >
                <div
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white ${config.circle}`}
                >
                  <Icon size={15} />
                </div>

                <div className="min-w-0 flex-1">
                  <DetalleColapsableCard
                    summary={summary}
                    open={abierto}
                    onOpenChange={(next) =>
                      setEventoAbiertoId(next ? evento.id : null)
                    }
                    contentClassName="bg-slate-50/60 p-3.5 sm:p-4"
                  >
                    <DetalleEventoTrazabilidad
                      evento={evento}
                      data={data}
                      onOpenRevisionTecnica={onOpenRevisionTecnica}
                    />
                  </DetalleColapsableCard>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ResumenMini({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-base font-bold text-slate-950">{value}</p>
    </div>
  );
}
