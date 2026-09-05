import {
  ArrowRight,
  Building2,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../../../lib/api";
import type { Company } from "../../../types/domain";
import {
  useAuth,
  type UserRole,
} from "../../auth/context/AuthContext";
import { obtenerResultadosEvaluacion } from "../../evaluacion/api/resultados-evaluacion.api";
import type { ResultadosEvaluacionResponse } from "../../evaluacion/types/resultados-evaluacion.types";

const MAX_COMPANIES = 6;

const RESULT_ROLES = new Set<UserRole>([
  "CLIENT_USER",
  "CLIENT_ADMIN",
  "PROFESSIONAL",
  "COORDINATOR",
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

const DONUT_COLORS = {
  cumplidos: "#10b981",
  porCumplir: "#f59e0b",
  noAplica: "#06b6d4",
  sinEvaluar: "#cbd5e1",
} as const;

function clampPercentage(value: number): number {
  return Math.max(0, Math.min(value, 100));
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [resultsByCompany, setResultsByCompany] = useState<
    Record<string, ResultadosEvaluacionResponse | null>
  >({});
  const [failedCompanyIds, setFailedCompanyIds] = useState<Set<string>>(
    new Set()
  );
  const [companiesLoading, setCompaniesLoading] = useState(true);
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState(false);

  const year = new Date().getFullYear();
  const canViewResults = Boolean(user && RESULT_ROLES.has(user.role));
  const canEvaluate = Boolean(user && EVALUATION_ROLES.has(user.role));

  useEffect(() => {
    if (!user || !token) {
      setCompaniesLoading(false);
      setSummariesLoading(false);
      return;
    }

    let active = true;

    const load = async () => {
      setCompaniesLoading(true);
      setCompaniesError(false);
      setFailedCompanyIds(new Set());
      setResultsByCompany({});

      try {
        const allCompanies = await apiRequest<Company[]>(
          "/api/companies",
          {},
          token
        );

        if (!active) return;

        const activeCompanies = allCompanies
          .filter((company) => company.isActive)
          .sort((a, b) => a.name.localeCompare(b.name, "es"));

        setCompanies(activeCompanies);
        setCompaniesLoading(false);

        if (!canViewResults || activeCompanies.length === 0) {
          setSummariesLoading(false);
          return;
        }

        const visibleCompanies = activeCompanies.slice(0, MAX_COMPANIES);
        setSummariesLoading(true);

        const settled = await Promise.allSettled(
          visibleCompanies.map((company) =>
            obtenerResultadosEvaluacion(company.id, year, "TODOS", token)
          )
        );

        if (!active) return;

        const nextResults: Record<
          string,
          ResultadosEvaluacionResponse | null
        > = {};
        const nextFailed = new Set<string>();

        settled.forEach((item, index) => {
          const company = visibleCompanies[index];
          if (!company) return;

          if (item.status === "fulfilled") {
            nextResults[company.id] = item.value;
          } else {
            nextResults[company.id] = null;
            nextFailed.add(company.id);
          }
        });

        setResultsByCompany(nextResults);
        setFailedCompanyIds(nextFailed);
        setSummariesLoading(false);
      } catch {
        if (!active) return;
        setCompanies([]);
        setCompaniesError(true);
        setCompaniesLoading(false);
        setSummariesLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [canViewResults, token, user, year]);

  const visibleCompanies = useMemo(
    () => companies.slice(0, MAX_COMPANIES),
    [companies]
  );
  const hiddenCompanies = Math.max(
    companies.length - visibleCompanies.length,
    0
  );

  if (!user) return null;

  return (
    <div className="mx-auto w-full max-w-[1180px] space-y-5 pb-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-[1.8rem]">
            Resumen por empresa
          </h1>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            Estado SG-SST de las empresas visibles para tu perfil.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck size={15} className="text-cyan-700" />
          <span>{ROLE_LABELS[user.role]}</span>
          <span className="text-slate-300">·</span>
          <span>{year}</span>
        </div>
      </header>

      {companiesError ? (
        <section className="rounded-[1.4rem] border border-amber-200 bg-amber-50 p-6 text-sm text-amber-900">
          No fue posible cargar las empresas en este momento. Intenta actualizar la página.
        </section>
      ) : companiesLoading ? (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <CompanySummarySkeleton key={index} />
          ))}
        </section>
      ) : visibleCompanies.length === 0 ? (
        <section className="rounded-[1.4rem] border border-dashed border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
            <Building2 size={20} />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-950">
            Sin empresas visibles
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            No hay empresas activas dentro del alcance de este perfil.
          </p>
        </section>
      ) : (
        <>
          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleCompanies.map((company) => (
              <CompanySummaryCard
                key={company.id}
                company={company}
                result={resultsByCompany[company.id] ?? null}
                loading={summariesLoading}
                failed={failedCompanyIds.has(company.id)}
                year={year}
                canEvaluate={canEvaluate}
                canViewResults={canViewResults}
              />
            ))}
          </section>

          {hiddenCompanies > 0 && (
            <p className="text-center text-xs text-slate-400">
              Mostrando {MAX_COMPANIES} de {companies.length} empresas para mantener el resumen compacto.
            </p>
          )}
        </>
      )}
    </div>
  );
}

function CompanySummaryCard({
  company,
  result,
  loading,
  failed,
  year,
  canEvaluate,
  canViewResults,
}: {
  company: Company;
  result: ResultadosEvaluacionResponse | null;
  loading: boolean;
  failed: boolean;
  year: number;
  canEvaluate: boolean;
  canViewResults: boolean;
}) {
  if (loading) {
    return <CompanySummarySkeleton />;
  }

  const destination = canEvaluate
    ? `/dashboard/empresas/${company.id}/evaluacion?anio=${year}`
    : "/dashboard/informes";

  const summary = result?.resumenEmpresa ?? null;

  return (
    <article className="group rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-slate-950">
            {company.name}
          </h2>
          <div className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">
              {company.mainCity || "Ciudad no registrada"}
            </span>
            {company.mainRiskClass && (
              <span className="shrink-0">· Riesgo {company.mainRiskClass}</span>
            )}
          </div>
        </div>

        <Link
          to={destination}
          aria-label={`Abrir ${company.name}`}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700"
        >
          <ArrowRight size={15} />
        </Link>
      </div>

      {!canViewResults ? (
        <EmptyCardMessage text="Tu perfil no tiene acceso al resumen de evaluación." />
      ) : failed ? (
        <EmptyCardMessage text="No fue posible cargar el resumen de esta empresa." />
      ) : !result?.periodo || !summary ? (
        <EmptyCardMessage text={`Aún no hay un periodo de evaluación disponible para ${year}.`} />
      ) : (
        <CompanyDonutSummary result={result} />
      )}
    </article>
  );
}

function CompanyDonutSummary({
  result,
}: {
  result: ResultadosEvaluacionResponse;
}) {
  const summary = result.resumenEmpresa;
  if (!summary) return null;

  const cumplidos = summary.estados.cumplidos;
  const porCumplir =
    summary.estados.parciales + summary.estados.noCumplidos;
  const noAplica = summary.estados.noAplica;
  const sinEvaluar = summary.estados.sinEvaluar;
  const pendientes = summary.provisionales?.total ?? 0;
  const total = cumplidos + porCumplir + noAplica + sinEvaluar;

  const segments = [
    { value: cumplidos, color: DONUT_COLORS.cumplidos },
    { value: porCumplir, color: DONUT_COLORS.porCumplir },
    { value: noAplica, color: DONUT_COLORS.noAplica },
    { value: sinEvaluar, color: DONUT_COLORS.sinEvaluar },
  ];

  let cursor = 0;
  const gradient = segments
    .map((segment) => {
      const start = cursor;
      const portion = total > 0 ? (segment.value / total) * 100 : 0;
      cursor += portion;
      return `${segment.color} ${start}% ${cursor}%`;
    })
    .join(", ");

  const donutBackground = total > 0
    ? `conic-gradient(${gradient})`
    : DONUT_COLORS.sinEvaluar;

  const coverage = Math.round(
    clampPercentage(summary.coberturaPorcentaje)
  );

  return (
    <div className="mt-5">
      <div className="grid items-center gap-5 sm:grid-cols-[132px_1fr] md:grid-cols-1 lg:grid-cols-[132px_1fr]">
        <div className="mx-auto">
          <div
            role="img"
            aria-label={`Cobertura ${coverage}%. ${cumplidos} cumplidos, ${porCumplir} por cumplir, ${noAplica} no aplica y ${sinEvaluar} sin evaluar.`}
            className="relative h-[132px] w-[132px] rounded-full"
            style={{ background: donutBackground }}
          >
            <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
              <strong className="text-2xl font-semibold tracking-tight text-slate-950">
                {coverage}%
              </strong>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                evaluado
              </span>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-3 text-[10px] text-slate-500">
            <LegendDot color={DONUT_COLORS.cumplidos} label="Cumple" />
            <LegendDot color={DONUT_COLORS.porCumplir} label="Por cumplir" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SummaryMetric
            label="Cumplidos"
            value={cumplidos}
            tone="text-emerald-700"
          />
          <SummaryMetric
            label="Por cumplir"
            value={porCumplir}
            tone="text-amber-700"
          />
          <SummaryMetric
            label="Sin evaluar"
            value={sinEvaluar}
            tone="text-slate-700"
          />
          <SummaryMetric
            label="Pendientes"
            value={pendientes}
            tone={pendientes > 0 ? "text-cyan-700" : "text-slate-700"}
            hint="validación"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-[11px] text-slate-500">
        <span>
          No aplica <strong className="font-semibold text-slate-700">{noAplica}</strong>
        </span>
        <span>
          Administrativo{" "}
          <strong className="font-semibold text-slate-700">
            {summary.cumplimientoAdministrativo.toFixed(1)} / 5
          </strong>
        </span>
        <span>
          Ministerial{" "}
          <strong className="font-semibold text-slate-700">
            {Math.round(clampPercentage(summary.porcentajeMinisterial))}%
          </strong>
        </span>
      </div>
    </div>
  );
}

function SummaryMetric({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number;
  tone: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-[11px] leading-4 text-slate-500">{label}</span>
        <strong className={`text-lg font-semibold tracking-tight ${tone}`}>
          {value}
        </strong>
      </div>
      {hint && (
        <p className="mt-0.5 text-[9px] uppercase tracking-[0.1em] text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
}

function LegendDot({
  color,
  label,
}: {
  color: string;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function EmptyCardMessage({ text }: { text: string }) {
  return (
    <div className="mt-5 flex min-h-[190px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-5 text-center text-sm leading-6 text-slate-500">
      {text}
    </div>
  );
}

function CompanySummarySkeleton() {
  return (
    <article className="rounded-[1.4rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="animate-pulse">
        <div className="h-5 w-2/3 rounded bg-slate-100" />
        <div className="mt-2 h-3 w-1/2 rounded bg-slate-100" />
        <div className="mt-6 grid items-center gap-5 lg:grid-cols-[132px_1fr]">
          <div className="mx-auto h-[132px] w-[132px] rounded-full bg-slate-100" />
          <div className="grid grid-cols-2 gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-[58px] rounded-xl bg-slate-100" />
            ))}
          </div>
        </div>
        <div className="mt-5 h-4 w-4/5 rounded bg-slate-100" />
      </div>
    </article>
  );
}
