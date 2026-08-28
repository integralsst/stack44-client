import {
  Ban,
  CalendarDays,
  FileCheck2,
  GitCompareArrows,
  UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

import type { HistorialAspectoItem } from "../../types/detalle-aspecto.types";
import DetalleColapsableCard from "./DetalleColapsableCard";
import { formatDate } from "./DetalleAspectoUi";
import {
  decisionNoAplicaClass,
  decisionNoAplicaLabel,
} from "./historial-evaluacion-presentacion";

const stateClass: Record<string, string> = {
  CUMPLIDO:
    "border-emerald-200 bg-emerald-50 text-emerald-800",
  PARCIAL:
    "border-amber-200 bg-amber-50 text-amber-800",
  NO_CUMPLIDO:
    "border-red-200 bg-red-50 text-red-800",
  NO_APLICA:
    "border-sky-200 bg-sky-50 text-sky-800",
};

const stateLabel: Record<string, string> = {
  CUMPLIDO: "Cumplido",
  PARCIAL: "Parcial",
  NO_CUMPLIDO: "No cumplido",
  NO_APLICA: "No aplica",
};

export type HistorialConResultadoEfectivo =
  HistorialAspectoItem & {
    calificacionRegistrada?: number;
    calificacionEfectiva?: number;
    resultadoProvisional?: boolean;
    causaResultadoEfectivo?: string;
    registradoPor?: {
      id: string;
      nombre: string;
      rol: string;
    } | null;
    evaluacionAnterior?: {
      estadoCumplimiento: string | null;
      calificacionAdministrativa: number | null;
      observacion: string | null;
      registradaPor: {
        id: string;
        nombre: string;
        rol: string | null;
      } | null;
    } | null;
    decisionNoAplica?: {
      estado: string;
      resultadoEfectivo: number;
      observacionDecision: string | null;
    } | null;
    aprobacionGestion?: {
      estado: string;
      observacionDecision: string | null;
    } | null;
  };

function rolLabel(rol: string | null | undefined): string {
  const labels: Record<string, string> = {
    PROFESIONAL: "Profesional",
    PROFESSIONAL: "Profesional",
    COORDINADOR: "Coordinador",
    COORDINATOR: "Coordinador",
    ADMIN: "Administrador",
    OWNER: "Propietario",
    PROPIETARIO: "Propietario",
    SUPERADMIN: "Superadmin",
  };

  return rol ? labels[rol] ?? rol.replaceAll("_", " ") : "";
}

export default function HistorialEvaluacionCard({
  item,
}: {
  item: HistorialAspectoItem;
}) {
  const itemEfectivo = item as HistorialConResultadoEfectivo;
  const invalidada = item.gestion.estado === "INVALIDADA";
  const evaluacionDirecta =
    item.gestion.tipoActividad === "Evaluación directa";
  const registrada =
    itemEfectivo.calificacionRegistrada ??
    item.calificacionAdministrativa;
  const efectiva =
    itemEfectivo.calificacionEfectiva ??
    item.calificacionAdministrativa;
  const decisionNoAplica = itemEfectivo.decisionNoAplica ?? null;
  const registradoPor = itemEfectivo.registradoPor ?? null;
  const anterior = itemEfectivo.evaluacionAnterior ?? null;
  const cambioResultado = registrada !== efectiva;
  const autor = registradoPor?.nombre ?? item.usuarioRegistrador ?? item.gestion.profesional;
  const autorRol = rolLabel(registradoPor?.rol);

  const summary = (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${
              stateClass[item.estadoCumplimiento] ??
              "border-slate-300 bg-slate-100 text-slate-700"
            } ${invalidada ? "opacity-60" : ""}`}
          >
            {stateLabel[item.estadoCumplimiento] ??
              item.estadoCumplimiento}
          </span>

          {decisionNoAplica && (
            <span
              className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${decisionNoAplicaClass(
                decisionNoAplica.estado
              )}`}
            >
              {decisionNoAplicaLabel(decisionNoAplica.estado)} · efectivo{" "}
              {decisionNoAplica.resultadoEfectivo}
            </span>
          )}

          <span
            className={`rounded-full px-2.5 py-1 text-[9px] font-semibold ${
              cambioResultado
                ? "bg-cyan-50 text-cyan-800 ring-1 ring-cyan-200"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {cambioResultado ? "Efectiva" : "Nota"} {efectiva}
          </span>

          {cambioResultado && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[9px] font-semibold text-slate-500">
              Registrada {registrada}
            </span>
          )}

          <span className="text-[10px] text-slate-500">
            Periodo {item.anio}
          </span>
          {invalidada && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-red-800">
              <Ban size={11} />
              Evaluación invalidada
            </span>
          )}
        </div>

        <h4 className="mt-2 truncate text-sm font-semibold text-slate-950">
          {evaluacionDirecta ? "Evaluación registrada" : item.gestion.tipoActividad}
        </h4>
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600">
          <span>{formatDate(item.creadaEn, true)}</span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1 font-medium">
            <UserRound size={12} />
            {autor}
            {autorRol ? ` · ${autorRol}` : ""}
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <DetalleColapsableCard
      summary={summary}
      className={
        invalidada
          ? "border-red-200 bg-red-50"
          : "border-slate-200 bg-white"
      }
      contentClassName="p-4 sm:p-5"
    >
      {evaluacionDirecta ? (
        <p className="text-xs text-slate-600">
          Registro individual · Fecha evaluada {formatDate(item.gestion.fechaGestion)} · Autoría conservada
        </p>
      ) : (
        <p className="text-xs text-slate-600">
          {item.gestion.categoriaGestion ?? "Gestión general"}
          {` · ${item.gestion.modalidad.replaceAll("_", " ")}`}
          {` · Registrada ${formatDate(item.creadaEn, true)}`}
        </p>
      )}

      {anterior && (
        <div className="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-3">
          <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-cyan-800">
            <GitCompareArrows size={13} />
            Cambio frente al estado anterior
          </p>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                Antes
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800">
                {anterior.estadoCumplimiento
                  ? stateLabel[anterior.estadoCumplimiento] ?? anterior.estadoCumplimiento
                  : "Sin evaluación"}
                {anterior.calificacionAdministrativa != null
                  ? ` · ${anterior.calificacionAdministrativa}`
                  : ""}
              </p>
              {anterior.registradaPor && (
                <p className="mt-1 text-[10px] text-slate-500">
                  Por {anterior.registradaPor.nombre}
                  {anterior.registradaPor.rol
                    ? ` · ${rolLabel(anterior.registradaPor.rol)}`
                    : ""}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-cyan-200 bg-white p-3">
              <p className="text-[9px] font-bold uppercase tracking-wider text-cyan-700">
                Nuevo registro
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {stateLabel[item.estadoCumplimiento] ?? item.estadoCumplimiento} · {registrada}
              </p>
              <p className="mt-1 text-[10px] text-slate-500">
                Por {autor}{autorRol ? ` · ${autorRol}` : ""}
              </p>
            </div>
          </div>
        </div>
      )}

      {invalidada && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-red-800">
            No participa en el estado vigente ni en los cálculos
          </p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-red-900">
            {item.gestion.motivoInvalidacion ??
              "No se registró un motivo de invalidación."}
          </p>
          <p className="mt-2 text-[10px] leading-5 text-slate-600">
            {item.gestion.invalidadaPor
              ? `Invalidada por ${item.gestion.invalidadaPor.nombre} el ${formatDate(
                  item.gestion.invalidadaEn,
                  true
                )}.`
              : `Invalidada el ${formatDate(
                  item.gestion.invalidadaEn,
                  true
                )}.`}
          </p>
        </div>
      )}

      {decisionNoAplica && (
        <div
          className={`mt-4 rounded-xl border p-3 ${decisionNoAplicaClass(
            decisionNoAplica.estado
          )}`}
        >
          <p className="text-[9px] font-bold uppercase tracking-wider">
            Decisión sobre No aplica
          </p>
          <p className="mt-2 text-xs font-semibold">
            {decisionNoAplicaLabel(decisionNoAplica.estado)} · resultado efectivo{" "}
            {decisionNoAplica.resultadoEfectivo}
          </p>
          {decisionNoAplica.observacionDecision && (
            <p className="mt-2 whitespace-pre-wrap text-xs leading-5">
              {decisionNoAplica.observacionDecision}
            </p>
          )}
          {cambioResultado && (
            <p className="mt-2 text-[10px] leading-5 opacity-80">
              La nota registrada {registrada} se conserva para auditoría; el valor que participa en el estado vigente y los cálculos es {efectiva}.
            </p>
          )}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <DetalleDato
          icon={<UserRound size={13} />}
          label="Registrado por"
          value={autorRol ? `${autor} · ${autorRol}` : autor}
        />
        <DetalleDato
          icon={<CalendarDays size={13} />}
          label="Fecha del soporte"
          value={formatDate(item.fechaDocumento)}
        />
        <DetalleDato
          label="Vencimiento"
          value={formatDate(
            item.fechaVencimientoCalculada
          )}
        />
        <DetalleDato
          icon={<FileCheck2 size={13} />}
          label="Evidencias"
          value={`${item.totalEvidencias} soporte(s)`}
        />
      </div>

      {(item.observacion || item.justificacionNoAplica) && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
            Observación
          </p>
          <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-700">
            {item.observacion ?? item.justificacionNoAplica}
          </p>
        </div>
      )}
    </DetalleColapsableCard>
  );
}

function DetalleDato({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-xs leading-5 text-slate-700">
        {value}
      </p>
    </div>
  );
}
