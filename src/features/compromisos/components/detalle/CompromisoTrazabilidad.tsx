import {
  Clock3,
  FileCheck2,
  History,
} from "lucide-react";

import { formatearFechaHoraCompromiso } from "../../presentacion/fecha-compromiso";
import type {
  CompromisoDetalle,
} from "../../types/consulta-compromisos.types";

interface Props {
  compromiso: CompromisoDetalle;
}

export default function CompromisoTrazabilidad({
  compromiso,
}: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <TraceSection
        icon={Clock3}
        title="Seguimientos"
        empty="Todavía no hay seguimientos."
      >
        {compromiso.seguimientos.map(
          (seguimiento) => (
            <TraceItem
              key={seguimiento.id}
              title={
                seguimiento.usuario.nombre
              }
              date={formatearFechaHoraCompromiso(
                seguimiento.fechaSeguimiento
              )}
              description={
                seguimiento.descripcion
              }
            />
          )
        )}
      </TraceSection>

      <TraceSection
        icon={FileCheck2}
        title="Evidencias"
        empty="Todavía no hay evidencias."
      >
        {compromiso.evidencias.map(
          (evidencia) => (
            <a
              key={evidencia.id}
              href={evidencia.url}
              target="_blank"
              rel="noreferrer"
              className="block rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-cyan-300 hover:bg-cyan-50"
            >
              <p className="text-sm font-semibold text-slate-900">
                {evidencia.nombre}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {evidencia.creadoPor.nombre}
              </p>
            </a>
          )
        )}
      </TraceSection>

      <TraceSection
        icon={History}
        title="Historial"
        empty="Todavía no hay historial."
      >
        {compromiso.historial.map(
          (registro) => (
            <TraceItem
              key={registro.id}
              title={registro.accion.replaceAll(
                "_",
                " "
              )}
              date={formatearFechaHoraCompromiso(
                registro.createdAt
              )}
              description={
                registro.descripcion ??
                registro.usuario.nombre
              }
            />
          )
        )}
      </TraceSection>
    </div>
  );
}

interface SectionProps {
  icon: typeof Clock3;
  title: string;
  empty: string;
  children: React.ReactNode;
}

function TraceSection({
  icon: Icon,
  title,
  empty,
  children,
}: SectionProps) {
  const items =
    Array.isArray(children)
      ? children
      : [children];
  const hasItems = items.some(Boolean);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Icon
          size={18}
          className="text-cyan-700"
        />
        <h2 className="text-base font-bold text-slate-950">
          {title}
        </h2>
      </div>
      <div className="mt-4 space-y-3">
        {hasItems ? (
          children
        ) : (
          <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">
            {empty}
          </p>
        )}
      </div>
    </section>
  );
}

interface TraceItemProps {
  title: string;
  date: string;
  description: string;
}

function TraceItem({
  title,
  date,
  description,
}: TraceItemProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-sm font-semibold text-slate-900">
        {title}
      </p>
      <p className="mt-1 text-[11px] text-slate-500">
        {date}
      </p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-5 text-slate-700">
        {description}
      </p>
    </article>
  );
}
