import {
  Building2,
  CalendarClock,
  ClipboardCheck,
  Workflow,
} from "lucide-react";

import { formatearFechaCompromiso } from "../../presentacion/fecha-compromiso";
import type {
  CompromisoDetalle,
} from "../../types/consulta-compromisos.types";
import {
  EstadoCompromisoBadge,
  SemaforoCompromisoBadge,
} from "../bandeja/CompromisoBadges";

interface Props {
  compromiso: CompromisoDetalle;
}

export default function CompromisoDetalleResumen({
  compromiso,
}: Props) {
  return (
    <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <EstadoCompromisoBadge
            estado={compromiso.estado}
          />
          <SemaforoCompromisoBadge
            semaforo={compromiso.semaforo}
          />
        </div>
        <p className="mt-4 text-xs font-semibold text-cyan-700">
          {compromiso.aspecto.codigo ??
            "Sin código"}
        </p>
        <h2 className="mt-1 text-xl font-bold text-slate-950">
          {compromiso.aspecto.nombre}
        </h2>
        <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
          {compromiso.descripcion}
        </p>
        {compromiso.recursos && (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Recursos
            </p>
            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {compromiso.recursos}
            </p>
          </div>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
        <InfoCard
          icon={Building2}
          label="Empresa"
          value={compromiso.empresa.nombre}
          detail={"NIT " + compromiso.empresa.nit}
        />
        <InfoCard
          icon={Workflow}
          label="Proceso"
          value={
            compromiso.proceso?.nombre ??
            "Sin proceso asociado"
          }
        />
        <InfoCard
          icon={CalendarClock}
          label="Fecha límite"
          value={formatearFechaCompromiso(
            compromiso.fechaLimite
          )}
        />
        <InfoCard
          icon={ClipboardCheck}
          label="Gestión origen"
          value={
            compromiso.gestionOrigen
              .tipoActividad
          }
          detail={formatearFechaCompromiso(
            compromiso.gestionOrigen
              .fechaGestion
          )}
        />
      </section>
    </div>
  );
}

interface InfoCardProps {
  icon: typeof Building2;
  label: string;
  value: string;
  detail?: string;
}

function InfoCard({
  icon: Icon,
  label,
  value,
  detail,
}: InfoCardProps) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-cyan-700">
          <Icon size={17} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {value}
          </p>
          {detail && (
            <p className="mt-1 text-xs text-slate-500">
              {detail}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
