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
import { obtenerResultadosEvaluacion } from "../../evaluacion/api/resultados-evaluacion.api";
import type { ResultadosEvaluacionResponse } from "../../evaluacion/types/resultados-evaluacion.types";

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

const STATUS_COLORS = {
  cumplidos: "#10b981",
  parciales: "#f59e0b",
  noCumplidos: "#ef4444",
  noAplica: "#06b6d4",
  sinEvaluar: "#cbd5e1",
} as const;

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

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(value, 100));
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [actions, setActions] = useState<ResumenCentroAcciones | null>(null);
  const [loading, setLoading] = useState(true);
  const [partialWarning, setPartialWarning] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState("");
  const [progressResults, setProgressResults] =
    useState<ResultadosEvaluacionResponse | null>(null);
  const [progressLoading, setProgressLoading] = useState(false);
  const [progressError, setProgressError] = useState(false);

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

  useEffect(() => {
    if (activeCompanies.length === 0) {
      setSelectedCompanyId("");
      return;
    }

    const selectionStillVisible = activeCompanies.some(
      (company) => company.id === selectedCompanyId
    );

    if (!selectionStillVisible) {
      setSelectedCompanyId(activeCompanies[0]?.id ?? "");
    }
  }, [activeCompanies, selectedCompanyId]);

  useEffect(() => {
    if (!token || !selectedCompanyId || !canViewActions) {
      setProgressResults(null);
      setProgressLoading(false);
      setProgressError(false);
      return;
    }

    let active = true;

    const loadProgress = async () => {
      setProgressLoading(true);
      setProgressError(false);

      try {
        const result = await obtenerResultadosEvaluacion(
          selectedCompanyId,
          year,
          "TODOS",
          token
        );

        if (!active) return;
        setProgressResults(result);
      } catch {
        if (!active) return;
        setProgressResults(null);
        setProgressError(true);
      } finally {
        if (active) {
          setProgressLoading(false);
        }
      }
    };

    void loadProgress();

    return () => {
      active = false;
    };
  }, [canViewActions, selectedCompanyId, token, year]);

  const phvaProgress = useMemo(() => {
    const grouped = new Map<
      string,
      {
        codigo: string;
        nombre: string;
        orden: number;
        total: number;
        evaluados: number;
      }
    >();

    for (const standard of progressResults?.estandares ?? []) {
      const key = standard.cicloPhva.codigo;
      const current = grouped.get(key) ?? {
        codigo: standard.cicloPhva.codigo,
        nombre: standard.cicloPhva.nombre,
        orden: standard.cicloPhva.orden,
        total: 0,
        evaluados: 0,
      };

      current.total += standard.totalAspectos;
      current.evaluados += standard.evaluados;
      grouped.set(key, current);
    }

    return [...grouped.values()]
      .sort((a, b) => a.orden - b.orden)
      .map((item) => ({
        ...item,
        porcentaje:
          item.total > 0
            ? Math.round((item.evaluados / item.total) * 100)
            : 0,
      }));
  }, [progressResults]);

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
  const summary = progressResults?.resumenEmpresa;

  const operationTitle =
    urgentCount > 0
      ? `${urgentCount} ${urgentCount === 1 ? "urgente" : "urgentes"}`
      : pendingCount > 0
        ? `${pendingCount} ${pendingCount === 1 ? "pendiente" : "pendientes"}`
        : "Operación al día";

  const secondaryLoading = loading || !canViewActions;

  const statusItems = summary
    ? [
        {
          label: "Cumple",
          value: summary.estados.cumplidos,
          color: STATUS_COLORS.cumplidos,
        },
        {
          label: "Parcial",
          value: summary.estados.parciales,
          color: STATUS_COLORS.parciales,
        },
        {
          label: "No cumple",
          value: summary.estados.noCumplidos,
          color: STATUS_COLORS.noCumplidos,
        },
        {
          label: "No aplica",
          value: summary.estados.noAplica,
          color: STATUS_COLORS.noAplica,
        },
        {
          label: "Sin evaluar",
          value: summary.estados.sinEvaluar,
          color: STATUS_COLORS.sinEvaluar,
        },
      ]
    : [];

  const statusTotal = statusItems.reduce((total, item) => total + item.value, 0);
  let runningPercentage = 0;
  const donutSegments = statusItems.map((item) => {
    const start = runningPercentage;
    const portion = statusTotal > 0 ? (item.value / statusTotal) * 100 : 0;
    runningPercentage += portion;
    return `${item.color} ${start}% ${runningPercentage}%`;
  });
  const donutBackground =
    statusTotal > 0
      ? `conic-gradient(${donutSegments.join(", ")})`
      : "#f1f5f9";

  const generalIndicators = summary
    ? [
        {
          label: "Cobertura",
          display: `${Math.round(summary.coberturaPorcentaje)}%`,
          percentage: summary.coberturaPorcentaje,
          tone: "bg-cyan-500",
        },
        {
          label: "Administrativo",
          display: `${summary.cumplimientoAdministrativo.toFixed(1)} / 5`,
          percentage: (summary.cumplimientoAdministrativo / 5) * 100,
          tone: "bg-indigo-500",
        },
        {
          label: "Ministerial",
          display: `${Math.round(summary.porcentajeMinisterial)}%`,
          percentage: summary.porcentajeMinisterial,
          tone: "bg-emerald-500",
        },
      ]
    : [];

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
                  style={{ width: `${clampPercentage(progress)}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
                <span>
                  <strong className="font-medium text-slate-800">
                    {companiesUpToDate}
                  </strong>{" "}
                  al día
                </span>
                <span>
                  <strong className="font-medium text-slate-800">
                    {companiesWithActions}
                  </strong>{" "}
                  con acciones
                </span>
              </div>
            </div>

            <div className="mt-5 grid gap-2 sm:grid-cols-3">
              <CompactMetric
                label="Gestiones"
                value={
                  secondaryLoading
                    ? "—"
                    : String(categoryCounts?.GESTIONES ?? 0)
                }
                icon={<ClipboardList size={14} />}
              />
              <CompactMetric
                label="Evidencias"
                value={
                  secondaryLoading
                    ? "—"
                    : String(categoryCounts?.EVIDENCIAS ?? 0)
                }
                icon={<FileText size={14} />}
              />
              <CompactMetric
                label="Revisión"
                value={
                  secondaryLoading
                    ? "—"
                    : String(categoryCounts?.REVISION_TECNICA ?? 0)
                }
                icon={<Search size={14} />}
              />
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

      {canViewActions && activeCompanies.length > 0 && (
        <section className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
                Progreso SG-SST
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-950">
                Contexto de avance
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Cobertura, estado de aspectos y avance por ciclo PHVA.
              </p>
            </div>

            {activeCompanies.length > 1 && (
              <label className="min-w-0 sm:w-[310px]">
                <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">
                  Empresa
                </span>
                <select
                  value={selectedCompanyId}
                  onChange={(event) => setSelectedCompanyId(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10"
                >
                  {activeCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          {progressLoading ? (
            <div className="mt-6 grid gap-3 lg:grid-cols-2">
              <ChartSkeleton />
              <ChartSkeleton />
              <div className="lg:col-span-2">
                <ChartSkeleton compact />
              </div>
            </div>
          ) : progressError ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No fue posible cargar el progreso de esta empresa en este momento.
            </div>
          ) : !summary ? (
            <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              Aún no hay un periodo de evaluación disponible para {year}.
            </div>
          ) : (
            <div className="mt-6 grid gap-3 lg:grid-cols-[1.15fr_0.85fr]">
              <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                <div className="flex items-baseline justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Avance por ciclo PHVA
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Aspectos evaluados sobre el total de cada ciclo.
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-400">
                    {year}
                  </span>
                </div>

                <div className="mt-5 space-y-4">
                  {phvaProgress.map((item) => (
                    <div key={item.codigo}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                        <span className="truncate font-medium text-slate-700">
                          {item.nombre}
                        </span>
                        <span className="shrink-0 font-semibold text-slate-900">
                          {item.porcentaje}%
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-inset ring-slate-200">
                        <div
                          className="h-full rounded-full bg-cyan-500 transition-all duration-700"
                          style={{
                            width: `${clampPercentage(item.porcentaje)}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {item.evaluados} de {item.total} aspectos
                      </p>
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-slate-900">
                  Estado de los aspectos
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Distribución del estado efectivo al corte anual.
                </p>

                <div className="mt-5 flex flex-col items-center gap-5 sm:flex-row sm:items-center lg:flex-col xl:flex-row">
                  <div
                    className="relative h-36 w-36 shrink-0 rounded-full"
                    style={{ background: donutBackground }}
                    aria-label={`Cobertura ${Math.round(summary.coberturaPorcentaje)}%`}
                  >
                    <div className="absolute inset-[18px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
                      <span className="text-2xl font-semibold tracking-tight text-slate-950">
                        {Math.round(summary.coberturaPorcentaje)}%
                      </span>
                      <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.1em] text-slate-400">
                        cobertura
                      </span>
                    </div>
                  </div>

                  <div className="grid w-full min-w-0 grid-cols-2 gap-x-4 gap-y-2.5">
                    {statusItems.map((item) => (
                      <div key={item.label} className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <div className="min-w-0">
                          <p className="truncate text-[11px] text-slate-500">
                            {item.label}
                          </p>
                          <p className="text-sm font-semibold text-slate-900">
                            {item.value}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 sm:p-5 lg:col-span-2">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      Indicadores generales
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Lectura rápida de cobertura, administrativo y ministerial.
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Administrativo conserva escala 0–5
                  </span>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  {generalIndicators.map((indicator) => (
                    <div key={indicator.label}>
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <span className="text-xs font-medium text-slate-600">
                          {indicator.label}
                        </span>
                        <span className="text-sm font-semibold text-slate-950">
                          {indicator.display}
                        </span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-inset ring-slate-200">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${indicator.tone}`}
                          style={{
                            width: `${clampPercentage(indicator.percentage)}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </article>
            </div>
          )}
        </section>
      )}

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
                      <span className="shrink-0">
                        · Riesgo {company.mainRiskClass}
                      </span>
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
  attention = false,
  danger = false,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  attention?: boolean;
  danger?: boolean;
}) {
  return (
    <article className="h-full rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition-shadow duration-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <span className="block text-sm leading-5 text-slate-500">{label}</span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
            danger
              ? "bg-red-50 text-red-700"
              : attention
                ? "bg-amber-50 text-amber-700"
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

function CompactMetric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2 text-slate-500">
        <span className="text-cyan-700">{icon}</span>
        <span className="truncate text-xs font-medium">{label}</span>
      </div>
      <span className="shrink-0 text-sm font-semibold text-slate-900">
        {value}
      </span>
    </div>
  );
}

function ChartSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div
      className={`animate-pulse rounded-2xl border border-slate-200 bg-slate-50 ${
        compact ? "h-32" : "h-64"
      }`}
    >
      <div className="p-5">
        <div className="h-4 w-36 rounded bg-slate-200" />
        <div className="mt-3 h-3 w-56 max-w-full rounded bg-slate-100" />
      </div>
    </div>
  );
}
