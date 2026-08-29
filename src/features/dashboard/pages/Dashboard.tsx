import {
  AlertTriangle,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  FileSearch,
  FileText,
  ListChecks,
  MapPin,
  Settings2,
  ShieldCheck,
  Sparkles,
  Table2,
  Users,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  useEffect,
  useMemo,
  useState,
  type ComponentType,
} from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../../../lib/api";
import type {
  Company,
  ManagedUser,
  Professional,
} from "../../../types/domain";
import {
  useAuth,
  type UserRole,
} from "../../auth/context/AuthContext";
import { obtenerResumenCentroAcciones } from "../../acciones/api/centro-acciones.api";
import type { ResumenCentroAcciones } from "../../acciones/types/centro-acciones.types";

type Tone = "cyan" | "emerald" | "amber" | "red" | "violet";

type DashboardStats = {
  companies: Company[];
  users: ManagedUser[];
  professionals: Professional[];
  actions: ResumenCentroAcciones | null;
};

type QuickAction = {
  label: string;
  description: string;
  to: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  tone: Tone;
};

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

const TONES: Record<
  Tone,
  {
    icon: string;
    surface: string;
    border: string;
    text: string;
    soft: string;
  }
> = {
  cyan: {
    icon: "bg-cyan-100 text-cyan-700",
    surface: "bg-cyan-50/70",
    border: "border-cyan-200",
    text: "text-cyan-800",
    soft: "bg-cyan-100 text-cyan-800",
  },
  emerald: {
    icon: "bg-emerald-100 text-emerald-700",
    surface: "bg-emerald-50/70",
    border: "border-emerald-200",
    text: "text-emerald-800",
    soft: "bg-emerald-100 text-emerald-800",
  },
  amber: {
    icon: "bg-amber-100 text-amber-700",
    surface: "bg-amber-50/70",
    border: "border-amber-200",
    text: "text-amber-800",
    soft: "bg-amber-100 text-amber-800",
  },
  red: {
    icon: "bg-red-100 text-red-700",
    surface: "bg-red-50/70",
    border: "border-red-200",
    text: "text-red-800",
    soft: "bg-red-100 text-red-800",
  },
  violet: {
    icon: "bg-violet-100 text-violet-700",
    surface: "bg-violet-50/70",
    border: "border-violet-200",
    text: "text-violet-800",
    soft: "bg-violet-100 text-violet-800",
  },
};

function quickActionsForRole(
  role: UserRole,
  companyId: string | null,
  year: number
): QuickAction[] {
  if (INTERNAL_ROLES.has(role)) {
    return [
      {
        label: "Administración",
        description: "Empresas, accesos y profesionales.",
        to: "/dashboard/administracion",
        icon: Settings2,
        tone: "violet",
      },
      {
        label: "Centro de acciones",
        description: "Prioriza pendientes y alertas.",
        to: "/dashboard/acciones",
        icon: ListChecks,
        tone: "amber",
      },
      {
        label: "Informes",
        description: "Consulta cortes y snapshots.",
        to: "/dashboard/informes",
        icon: FileText,
        tone: "cyan",
      },
      {
        label: "Supermatriz",
        description: "Administra la configuración maestra.",
        to: "/dashboard/supermatriz",
        icon: Table2,
        tone: "emerald",
      },
    ];
  }

  if (role === "PROFESSIONAL" || role === "COORDINATOR") {
    return [
      {
        label: "Empresas",
        description: "Continúa el trabajo SG-SST asignado.",
        to: "/dashboard/empresas",
        icon: Building2,
        tone: "cyan",
      },
      {
        label: "Centro de acciones",
        description: "Atiende lo que requiere intervención.",
        to: "/dashboard/acciones",
        icon: ListChecks,
        tone: "amber",
      },
      {
        label: "Informes",
        description: "Revisa el estado consolidado.",
        to: "/dashboard/informes",
        icon: FileText,
        tone: "violet",
      },
      {
        label: "Supermatriz",
        description: "Consulta criterios y configuración.",
        to: "/dashboard/supermatriz",
        icon: Table2,
        tone: "emerald",
      },
    ];
  }

  if (role === "CLIENT_ADMIN") {
    return [
      ...(companyId
        ? [
            {
              label: "Evaluación SG-SST",
              description: "Consulta el estado actual de tu empresa.",
              to: `/dashboard/empresas/${companyId}/evaluacion?anio=${year}`,
              icon: ShieldCheck,
              tone: "cyan" as Tone,
            },
          ]
        : []),
      {
        label: "Centro de acciones",
        description: "Revisa pendientes de tu organización.",
        to: "/dashboard/acciones",
        icon: ListChecks,
        tone: "amber",
      },
      {
        label: "Informes",
        description: "Consulta resultados e históricos.",
        to: "/dashboard/informes",
        icon: FileText,
        tone: "violet",
      },
      {
        label: "Usuarios",
        description: "Administra los accesos de tu empresa.",
        to: "/dashboard/usuarios",
        icon: Users,
        tone: "emerald",
      },
    ];
  }

  if (role === "CLIENT_USER") {
    return [
      {
        label: "Centro de acciones",
        description: "Consulta los pendientes visibles para tu rol.",
        to: "/dashboard/acciones",
        icon: ListChecks,
        tone: "amber",
      },
      {
        label: "Informes",
        description: "Consulta la información consolidada disponible.",
        to: "/dashboard/informes",
        icon: FileText,
        tone: "cyan",
      },
      {
        label: "Auditorías",
        description: "Revisa los registros de auditoría disponibles.",
        to: "/dashboard/auditorias",
        icon: FileSearch,
        tone: "violet",
      },
    ];
  }

  return [];
}

export default function Dashboard() {
  const { user, token } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    companies: [],
    users: [],
    professionals: [],
    actions: null,
  });
  const [loading, setLoading] = useState(true);
  const [partialWarning, setPartialWarning] = useState(false);

  const year = new Date().getFullYear();
  const isInternal = Boolean(user && INTERNAL_ROLES.has(user.role));
  const canManageUsers = Boolean(
    user && (isInternal || user.role === "CLIENT_ADMIN")
  );
  const canViewActions = Boolean(user && ACTION_ROLES.has(user.role));

  useEffect(() => {
    if (!user || !token) {
      setLoading(false);
      return;
    }

    let active = true;

    const load = async () => {
      setLoading(true);
      setPartialWarning(false);

      const companyRequest = apiRequest<Company[]>("/api/companies", {}, token);
      const userRequest = canManageUsers
        ? apiRequest<ManagedUser[]>("/api/users", {}, token)
        : Promise.resolve([] as ManagedUser[]);
      const professionalRequest = isInternal
        ? apiRequest<Professional[]>("/api/professionals", {}, token)
        : Promise.resolve([] as Professional[]);
      const actionsRequest = canViewActions
        ? obtenerResumenCentroAcciones(token)
        : Promise.resolve(null);

      const [companies, users, professionals, actions] =
        await Promise.allSettled([
          companyRequest,
          userRequest,
          professionalRequest,
          actionsRequest,
        ]);

      if (!active) return;

      setStats({
        companies:
          companies.status === "fulfilled" ? companies.value : [],
        users: users.status === "fulfilled" ? users.value : [],
        professionals:
          professionals.status === "fulfilled" ? professionals.value : [],
        actions: actions.status === "fulfilled" ? actions.value : null,
      });

      setPartialWarning(
        [companies, users, professionals, actions].some(
          (result) => result.status === "rejected"
        )
      );
      setLoading(false);
    };

    void load();

    return () => {
      active = false;
    };
  }, [canManageUsers, canViewActions, isInternal, token, user]);

  const activeCompanies = useMemo(
    () => stats.companies.filter((company) => company.isActive),
    [stats.companies]
  );
  const activeUsers = useMemo(
    () => stats.users.filter((item) => item.isActive),
    [stats.users]
  );
  const activeProfessionals = useMemo(
    () => stats.professionals.filter((item) => item.isActive),
    [stats.professionals]
  );

  if (!user) return null;

  const roleLabel = ROLE_LABELS[user.role];
  const firstName = user.name.trim().split(/\s+/)[0] || "Usuario";
  const actions = stats.actions;
  const urgentCount = actions?.urgentes ?? 0;
  const pendingCount = actions?.total ?? 0;
  const operationTone: Tone =
    urgentCount > 0 ? "red" : pendingCount > 0 ? "amber" : "emerald";
  const operationTitle =
    urgentCount > 0
      ? `${urgentCount} ${urgentCount === 1 ? "acción urgente" : "acciones urgentes"}`
      : pendingCount > 0
        ? `${pendingCount} ${pendingCount === 1 ? "acción pendiente" : "acciones pendientes"}`
        : "Operación al día";
  const operationDescription =
    urgentCount > 0
      ? "Hay asuntos que conviene revisar primero desde el Centro de acciones."
      : pendingCount > 0
        ? "Tienes trabajo identificado y priorizado para continuar."
        : "No hay acciones operativas pendientes visibles para tu perfil.";

  const primaryAction = INTERNAL_ROLES.has(user.role)
    ? { label: "Abrir administración", to: "/dashboard/administracion" }
    : user.role === "PROFESSIONAL" || user.role === "COORDINATOR"
      ? { label: "Abrir empresas", to: "/dashboard/empresas" }
      : user.role === "CLIENT_ADMIN" && user.companyId
        ? {
            label: "Abrir evaluación",
            to: `/dashboard/empresas/${user.companyId}/evaluacion?anio=${year}`,
          }
        : { label: "Abrir informes", to: "/dashboard/informes" };

  const quickActions = quickActionsForRole(user.role, user.companyId, year);
  const canEvaluate = EVALUATION_ROLES.has(user.role);
  const visibleCompanies = activeCompanies.slice(0, 4);

  const metrics = [
    {
      label: isInternal ? "Empresas activas" : "Empresas en alcance",
      value: loading ? "—" : String(activeCompanies.length),
      caption:
        activeCompanies.length === 1
          ? "Organización disponible"
          : "Organizaciones disponibles",
      icon: Building2,
      tone: "cyan" as Tone,
    },
    {
      label: "Acciones pendientes",
      value: loading || !canViewActions ? "—" : String(pendingCount),
      caption: canViewActions ? "Trabajo identificado" : "No aplica a tu rol",
      icon: ListChecks,
      tone: pendingCount > 0 ? ("amber" as Tone) : ("emerald" as Tone),
    },
    {
      label: "Urgentes",
      value: loading || !canViewActions ? "—" : String(urgentCount),
      caption: urgentCount > 0 ? "Requieren atención" : "Sin urgencias visibles",
      icon: AlertTriangle,
      tone: urgentCount > 0 ? ("red" as Tone) : ("emerald" as Tone),
    },
    isInternal
      ? {
          label: "Profesionales activos",
          value: loading ? "—" : String(activeProfessionals.length),
          caption: "Prestadores habilitados",
          icon: BriefcaseBusiness,
          tone: "violet" as Tone,
        }
      : canManageUsers
        ? {
            label: "Usuarios activos",
            value: loading ? "—" : String(activeUsers.length),
            caption: "Accesos habilitados",
            icon: Users,
            tone: "violet" as Tone,
          }
        : {
            label: "Periodo de trabajo",
            value: String(year),
            caption: "Contexto operativo actual",
            icon: ShieldCheck,
            tone: "violet" as Tone,
          },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 pb-8 sm:space-y-6">
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white shadow-sm"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,182,212,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(139,92,246,0.08),transparent_28%)]" />
        <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[1.45fr_0.75fr] lg:items-center lg:p-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.16em] text-cyan-800">
                <Sparkles size={13} />
                Inicio operativo
              </span>
              <span className="rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">
                {roleLabel}
              </span>
            </div>

            <h1 className="mt-4 max-w-3xl text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-[2.15rem] lg:leading-tight">
              Hola, {firstName}. Tu operación SG-SST empieza aquí.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-[15px]">
              Revisa lo prioritario, entra al trabajo de cada empresa y consulta los resultados sin recorrer módulos innecesarios.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
              <Link
                to={primaryAction.to}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2"
              >
                {primaryAction.label}
                <ArrowRight size={16} />
              </Link>
              {canViewActions && (
                <Link
                  to="/dashboard/acciones"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-800"
                >
                  Ver Centro de acciones
                </Link>
              )}
            </div>
          </div>

          <div
            className={`rounded-2xl border p-4 sm:p-5 ${TONES[operationTone].surface} ${TONES[operationTone].border}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${TONES[operationTone].icon}`}
              >
                {urgentCount > 0 ? (
                  <AlertTriangle size={20} />
                ) : (
                  <CheckCircle2 size={20} />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">
                  Estado operativo
                </p>
                <p className="mt-1 text-lg font-black text-slate-950">
                  {loading ? "Actualizando…" : operationTitle}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-600">
                  {operationDescription}
                </p>
              </div>
            </div>
            {actions && (
              <div className="mt-4 grid grid-cols-2 gap-2">
                <MiniFact label="Empresas al día" value={String(actions.empresasAlDia)} />
                <MiniFact
                  label="Con acciones"
                  value={String(actions.empresasConAcciones)}
                />
              </div>
            )}
          </div>
        </div>
      </motion.section>

      {partialWarning && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900">
          Parte del resumen no pudo actualizarse. Los accesos siguen disponibles y los datos se volverán a consultar al recargar la página.
        </div>
      )}

      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          const tone = TONES[metric.tone];

          return (
            <motion.article
              key={metric.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone.icon}`}>
                  <Icon size={18} />
                </div>
                <span className={`rounded-full px-2 py-1 text-[9px] font-extrabold uppercase tracking-wide ${tone.soft}`}>
                  {metric.tone === "red" ? "Atención" : "Actual"}
                </span>
              </div>
              <p className="mt-4 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">
                {metric.value}
              </p>
              <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500 sm:text-[11px]">
                {metric.label}
              </p>
              <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                {metric.caption}
              </p>
            </motion.article>
          );
        })}
      </section>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-cyan-700">
                Continuar trabajo
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                Accesos rápidos para tu perfil
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Solo mostramos rutas que tienen sentido para tu rol actual.
              </p>
            </div>
          </div>

          {quickActions.length > 0 ? (
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const tone = TONES[action.tone];

                return (
                  <Link
                    key={`${action.to}:${action.label}`}
                    to={action.to}
                    className="group flex min-h-[112px] items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:-translate-y-0.5 hover:border-cyan-300 hover:bg-white hover:shadow-md"
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-extrabold text-slate-950">
                          {action.label}
                        </p>
                        <ArrowRight
                          size={15}
                          className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-cyan-700"
                        />
                      </div>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {action.description}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
              Tu perfil no tiene accesos operativos adicionales configurados.
            </div>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-violet-700">
                Contexto
              </p>
              <h2 className="mt-1 text-xl font-black text-slate-950">
                Empresas en alcance
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Punto de entrada directo al trabajo disponible.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-extrabold text-slate-600">
              {loading ? "…" : activeCompanies.length}
            </span>
          </div>

          <div className="mt-5 space-y-2.5">
            {!loading && visibleCompanies.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-sm text-slate-500">
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
                  className="group flex items-center gap-3 rounded-2xl border border-slate-200 px-3.5 py-3 transition hover:border-cyan-300 hover:bg-cyan-50/50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Building2 size={17} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-slate-950">
                      {company.name}
                    </p>
                    <div className="mt-1 flex min-w-0 items-center gap-1.5 text-[11px] text-slate-500">
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
                    className="shrink-0 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-cyan-700"
                  />
                </Link>
              );
            })}
          </div>

          {activeCompanies.length > visibleCompanies.length && (
            <Link
              to={isInternal ? "/dashboard/administracion" : "/dashboard/empresas"}
              className="mt-3 inline-flex items-center gap-2 text-xs font-extrabold text-cyan-700 hover:text-cyan-900"
            >
              Ver todas las empresas
              <ArrowRight size={14} />
            </Link>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-cyan-700 shadow-sm ring-1 ring-slate-200">
            <ShieldCheck size={17} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-extrabold text-slate-800">
              {user.company?.name ??
                (user.professional
                  ? `${user.professional.firstNames} ${user.professional.lastNames}`
                  : "Administración global")}
            </p>
            <p className="truncate text-[11px] text-slate-500">
              {roleLabel} · Periodo {year} · {user.email}
            </p>
          </div>
        </div>
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
          Stack44 · SG-SST
        </span>
      </section>
    </div>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/70 bg-white/70 px-3 py-2.5">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}
