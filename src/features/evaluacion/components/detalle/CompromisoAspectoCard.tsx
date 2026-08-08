import {
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  Circle,
  History,
  RotateCcw,
  UserRound,
} from "lucide-react";
import { Link } from "react-router-dom";

import { useAuth } from "../../../auth/context/AuthContext";
import type { CompromisoHistorialAspecto } from "../../types/detalle-aspecto.types";
import { formatDate } from "./DetalleAspectoUi";

const ESTADOS: Record<
  string,
  {
    label: string;
    className: string;
  }
> = {
  EN_EJECUCION: {
    label: "En ejecución",
    className:
      "border-cyan-200 bg-cyan-50 text-cyan-800",
  },
  PENDIENTE_DE_REASIGNACION: {
    label: "Pendiente de reasignación",
    className:
      "border-amber-200 bg-amber-50 text-amber-800",
  },
  SOLICITUD_DE_CIERRE: {
    label: "Cierre por revisar",
    className:
      "border-violet-200 bg-violet-50 text-violet-800",
  },
  CUMPLIDO: {
    label: "Aprobado y cerrado",
    className:
      "border-emerald-200 bg-emerald-50 text-emerald-800",
  },
  CANCELADO: {
    label: "Cancelado",
    className:
      "border-slate-300 bg-slate-100 text-slate-700",
  },
};

export default function CompromisoAspectoCard({
  compromiso,
}: {
  compromiso: CompromisoHistorialAspecto;
}) {
  const { hasRole } = useAuth();
  const supervisor = hasRole(
    "COORDINATOR",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );
  const ruta = supervisor
    ? `/dashboard/compromisos/${compromiso.id}`
    : `/dashboard/mis-compromisos/${compromiso.id}`;
  const estado =
    ESTADOS[compromiso.estado] ?? {
      label: compromiso.estado.replaceAll("_", " "),
      className:
        "border-slate-300 bg-slate-100 text-slate-700",
    };
  const ultimaRecalificacion =
    compromiso.recalificaciones.at(-1) ?? null;
  const ultimaSolicitud =
    compromiso.solicitudesCierre.at(-1) ?? null;

  return (
    <details className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <summary className="cursor-pointer list-none p-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider ${estado.className}`}
              >
                {estado.label}
              </span>
              <span className="text-[10px] text-slate-500">
                Creado {formatDate(compromiso.creadoEn, true)}
              </span>
            </div>
            <h4 className="mt-2 line-clamp-2 text-sm font-bold leading-5 text-slate-950">
              {compromiso.descripcion}
            </h4>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
              <span className="inline-flex items-center gap-1.5">
                <CalendarClock size={13} />
                Límite {formatDate(compromiso.fechaLimite)}
              </span>
              <span>
                {compromiso.progreso.atendidas} de {compromiso.progreso.total} actividades completas
              </span>
            </div>
          </div>

          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-bold text-cyan-700">
            <span className="group-open:hidden">Ver detalle</span>
            <span className="hidden group-open:inline">Ocultar detalle</span>
            <ChevronDown
              size={15}
              className="transition-transform group-open:rotate-180"
            />
          </span>
        </div>
      </summary>

      <div className="border-t border-slate-200 p-4 sm:p-5">
        <div className="flex justify-end">
          <Link
            to={ruta}
            className="inline-flex items-center justify-center rounded-xl bg-slate-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-cyan-700"
          >
            Abrir compromiso
          </Link>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Paso
            numero={1}
            titulo="Calificación de origen"
            valor={`Nota ${compromiso.evaluacionOrigen.calificacionAdministrativa} · ${humanizar(
              compromiso.evaluacionOrigen.estadoCumplimiento
            )}`}
            listo
          />
          <Paso
            numero={2}
            titulo="Actividades"
            valor={`${compromiso.progreso.atendidas} de ${compromiso.progreso.total} completadas`}
            listo={
              compromiso.progreso.total > 0 &&
              compromiso.progreso.atendidas ===
                compromiso.progreso.total
            }
          />
          <Paso
            numero={3}
            titulo="Recalificación"
            valor={
              ultimaRecalificacion
                ? `Nota ${ultimaRecalificacion.calificacionAdministrativa} · ${humanizar(
                    ultimaRecalificacion.estadoCumplimiento
                  )}`
                : "Pendiente"
            }
            listo={Boolean(ultimaRecalificacion)}
          />
          <Paso
            numero={4}
            titulo="Cierre"
            valor={
              compromiso.estado === "CUMPLIDO"
                ? `Aprobado${compromiso.cerradoEn
                    ? ` · ${formatDate(
                        compromiso.cerradoEn,
                        true
                      )}`
                    : ""}`
                : ultimaSolicitud
                  ? humanizar(ultimaSolicitud.estado)
                  : "Sin solicitud"
            }
            listo={compromiso.estado === "CUMPLIDO"}
          />
        </div>

        {ultimaSolicitud?.estado === "APROBADA" && (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-emerald-800">
              <BadgeCheck size={15} />
              Cierre aprobado
            </p>
            <p className="mt-2 text-sm leading-6 text-emerald-950">
              {ultimaSolicitud.mensajeCierre ||
                "El compromiso fue revisado y aprobado."}
            </p>
            <p className="mt-1 text-xs text-emerald-800">
              Por {ultimaSolicitud.decididaPor?.nombre ?? "Supervisor"} · {formatDate(
                ultimaSolicitud.decididaEn,
                true
              )}
            </p>
          </div>
        )}

        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50">
          <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-bold text-slate-900">
            <History size={16} className="text-cyan-700" />
            Ver recorrido completo ({compromiso.eventos.length} eventos)
          </summary>
          <div className="border-t border-slate-200 px-4 py-3">
            {compromiso.eventos.length === 0 ? (
              <p className="text-xs text-slate-600">
                El compromiso no tiene movimientos adicionales registrados.
              </p>
            ) : (
              <ol className="space-y-3">
                {compromiso.eventos.map((evento) => (
                  <li
                    key={evento.id}
                    className="flex gap-3"
                  >
                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-cyan-200 bg-white text-cyan-700">
                      {evento.tipo === "RECALIFICACION" ? (
                        <RotateCcw size={13} />
                      ) : (
                        <UserRound size={13} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs leading-5 text-slate-800">
                        {evento.descripcion}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-500">
                        {evento.usuario.nombre} · {formatDate(
                          evento.createdAt,
                          true
                        )}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </details>
      </div>
    </details>
  );
}

function Paso({
  numero,
  titulo,
  valor,
  listo,
}: {
  numero: number;
  titulo: string;
  valor: string;
  listo: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        listo
          ? "border-emerald-200 bg-emerald-50"
          : "border-amber-200 bg-amber-50"
      }`}
    >
      <p className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-wider text-slate-600">
        {listo ? (
          <CheckCircle2
            size={13}
            className="text-emerald-700"
          />
        ) : (
          <Circle
            size={13}
            className="text-amber-700"
          />
        )}
        Paso {numero} · {titulo}
      </p>
      <p className="mt-2 text-xs font-semibold leading-5 text-slate-900">
        {valor}
      </p>
    </div>
  );
}

function humanizar(value: string): string {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^./, (letra) => letra.toUpperCase());
}
