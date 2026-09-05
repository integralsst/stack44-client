import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  ClipboardList,
  FileText,
  ListChecks,
  MapPin,
  Search,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../../../lib/api";
import type { Company } from "../../../types/domain";
import { obtenerResumenCentroAcciones } from "../../acciones/api/centro-acciones.api";
import type { ResumenCentroAcciones } from "../../acciones/types/centro-acciones.types";
import {
  useAuth,
  type UserRole,
} from "../../auth/context/AuthContext";

const INTERNAL_ROLES = new Set<UserRole>([
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
]);

const EVALUATION_ROLES = new Set<UserRole>([
  "PROFESSIONAL",
  "COORDINATOR",
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
  "CLIENT_ADMIN",
]);

const ACTION_ROLES = new Set<UserRole>([
  "CLIENT_USER",
  "CLIENT_ADMIN",
  "PROFESSIONAL",
  "COORDINATOR",
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
]);

const ROLE_LABELS: Record<UserRole, string> = {
  USER: "Usuario",
  CLIENT_USER: "Consulta cliente",
  CLIENT_ADMIN: "Administración cliente",
  PROFESSIONAL: "Profesional SST",
  COORDINATOR: "Coordinación SST",
  ADMIN: "Administración",
  OWNER: "Propietario",
  SUPERADMIN: "Superadministración",
};

function fechaActualBogota(): string {
  return new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());
}

function capitalizar(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [actions, setActions] = useState<ResumenCentroAcciones | null>(null);
  const [loading, setLoading] = useState(true);
  const [partialWarning, setPartialWarning] = useState(false);

  const canViewActions = Boolean(user && ACTION_ROLES.has(user.role));
  const canEvaluate = Boolean(user && EVALUATION_ROLES.has(user.role));
  const year = new Date().getFullYear();

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      setPartialWarning(false);

      const [companiesResult, actionsResult] = await Promise.allSettled([
        apiRequest<Company[]>("/api/companies", {}, token),
        canViewActions
          ? obtenerResumenCentroAcciones(token)
          : Promise.resolve(null),
      ]);

      if (!active) return;

      setCompanies(
        companiesResult.status === "fulfilled" ? companiesResult.value : []
      );
      setActions(
        actionsResult.status === "fulfilled" ? actionsResult.value : null
      );
      setPartialWarning(
        companiesResult.status === "rejected" ||
          actionsResult.status === "rejected"
      );
      setLoading(false);
    };

    void load();
    return () => {
      active = false;
    };
  }, [canViewActions, token, user]);

  const activeCompanies = useMemo(
    () => companies.filter((company) => company.isActive),
    [companies]
  );

  if (!user) return null;

  const displayName =
    user.professional?.firstNames?.trim() || user.name.trim();
  const firstName = displayName.split(/\s+/)[0] || "Usuario";
  const pendingCount = actions?.total ?? 0;
  const urgentCount = actions?.urgentes ?? 0;
  const accessibleCompanies =
    actions?.empresasAccesibles ?? activeCompanies.length;
  const companiesUpToDate =
    actions?.empresasAlDia ?? activeCompanies.length;
  const companiesWithActions = actions?.empresasConAcciones ?? 0;
  const progress =
    accessibleCompanies > 0
      ? Math.round((companiesUpToDate / accessibleCompanies) * 100)
      : 100;
  const visibleCompanies = activeCompanies.slice(0, 5);
  const isInternal = INTERNAL_ROLES.has(user.role);
  const categoryCounts = actions?.categorias;

  const operationTitle =
    urgentCount > 0
      ? `${urgentCount} ${urgentCount === 1 ? "urgente" : "urgentes"}`
      : pendingCount > 0
        ? `${pendingCount} ${pendingCount === 1 ? "pendiente" : "pendientes"}`
        : "Operación al día";

  const secondaryLoading = loading || !canViewActions;

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-5 pb-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {capitalizar(fechaActualBogota())}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[1.8rem]">
            Hola, {firstName}.
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Resumen de la operación SG-SST visible para tu perfil.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={15} className="text-cyan-700" />
          <span>{ROLE_LABELS[user.role]}</span>
          <span className="text-slate-300">·</span>
          <span>{year}</span>
        </div>
      </header>

      {partialWarning && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Parte del resumen no pudo actualizarse. Puedes continuar usando el sistema con normalidad.
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-3">
        <Kpi
          label={isInternal ? "Empresas activas" : "Empresas en alcance"}
          value={loading ? "—" : String(activeCompanies.length)}
          icon={<Building2 size={17} />}
        />
        <Kpi
          label="Pendientes"
          value={loading || !canViewActions ? "—" : String(pendingCount)}
          icon={<ListChecks size={17} />}
          attention={pendingCount > 0}
        />
        <Kpi
          label="Urgentes"
          value={loading || !canViewActions ? "—" : String(urgentCount)}
          icon={<AlertTriangle size={17} />}
          attention={urgentCount > 0}
          danger={urgentCount > 0}
        />
      </section>

      <section
        aria-label="Carga operativa por tipo"
        className="grid gap-3 sm:grid-cols-3"
      >
        <Kpi
          label="Gestiones por atender"
          value={secondaryLoading ? "—" : String(categoryCounts?.GESTIONES ?? 0)}
          hint="Seguimientos operativos"
          icon={<ClipboardList size={17} />}
          accent
        />
        <Kpi
          label="Evidencias por revisar"
          value={secondaryLoading ? "—" : String(categoryCounts?.EVIDENCIAS ?? 0)}
          hint="Soportes pendientes"
          icon={<FileText size={17} />}
          accent
        />
        <Kpi
          label="Revisión técnica"
          value={secondaryLoading ? "—" : String(categoryCounts?.REVISION_TECNICA ?? 0)}
          hint="Validaciones pendientes"
          icon={<Search size={17} />}
          accent
        />
      </section>

      <section className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  urgentCount > 0
                    ? "bg-red-50 text-red-700"
                    : pendingCount > 0
                      ? "bg-amber-50 text-amber-700"
                      : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {urgentCount > 0 ? (
                  <AlertTriangle size={19} />
                ) : (
                  <CheckCircle2 size={19} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                  Estado operativo
                </p>
                <h2 className="mt-0.5 text-lg font-semibold text-slate-950">
                  {loading ? "Actualizando…" : operationTitle}
                </h2>
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>Empresas al día</span>
                <span className="font-medium text-slate-700">{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    urgentCount > 0
                      ? "bg-red-500"
                      : pendingCount > 0
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.max(0, Math.min(progress, 100))}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                <span><strong className="font-medium text-slate-800">{companiesUpToDate}</strong> al día</span>
                <span><strong className="font-medium text-slate-800">{companiesWithActions}</strong> con acciones</span>
              </div>
            </div>
          </div>

          {canViewActions && pendingCount > 0 && (
            <Link
              to="/dashboard/acciones"
              className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Revisar pendientes <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </section>

      <section className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-950">
              Empresas
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Continúa directamente en la evaluación de una organización.
            </p>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            {loading ? "…" : activeCompanies.length}
          </span>
        </div>

        <div className="mt-4 divide-y divide-slate-100">
          {!loading && visibleCompanies.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 p-5 text-sm text-slate-500">
              No hay empresas activas visibles para este perfil.
            </div>
          )}

          {visibleCompanies.map((company) => {
            const destination = canEvaluate
              ? `/dashboard/empresas/${company.id}/evaluacion?anio=${year}`
              : "/dashboard/informes";

            return (
              <Link
                key={company.id}
                to={destination}
                className="group flex items-center gap-3 py-3.5 first:pt-0 last:pb-0"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition group-hover:bg-cyan-50 group-hover:text-cyan-700">
                  <Building2 size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {company.name}
                  </p>
                  <div className="mt-0.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
                    <MapPin size={12} className="shrink-0" />
                    <span className="truncate">
                      {company.mainCity || "Ciudad no registrada"}
                    </span>
                    {company.mainRiskClass && (
                      <span className="shrink-0">· Riesgo {company.mainRiskClass}</span>
                    )}
                  </div>
                </div>
                <ArrowRight
                  size={15}
                  className="shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-cyan-700"
                />
              </Link>
            );
          })}
        </div>

        {activeCompanies.length > visibleCompanies.length && (
          <Link
            to={isInternal ? "/dashboard/administracion" : "/dashboard/empresas"}
            className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-cyan-700 hover:text-cyan-900"
          >
            Ver todas las empresas <ArrowRight size={14} />
          </Link>
        )}
      </section>
    </div>
  );
}

function Kpi({
  label,
  value,
  icon,
  hint,
  attention = false,
  danger = false,
  accent = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  hint?: string;
  attention?: boolean;
  danger?: boolean;
  accent?: boolean;
}) {
  return (
    <article className="h-full rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-sm leading-5 text-slate-500">{label}</span>
          {hint && (
            <span className="mt-0.5 block text-[11px] leading-4 text-slate-400">
              {hint}
            </span>
          )}
        </div>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            danger
              ? "bg-red-50 text-red-700"
              : attention
                ? "bg-amber-50 text-amber-700"
                : accent
                  ? "bg-cyan-50 text-cyan-700"
                  : "bg-slate-100 text-slate-600"
          }`}
        >
          {icon}
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
        {value}
      </p>
    </article>
  );
}
