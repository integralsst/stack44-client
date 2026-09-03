import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileSearch,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Settings2,
  Table2,
  Users,
  X,
} from "lucide-react";

import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useCallback,
  useEffect,
  useState,
  type ComponentType,
} from "react";

import { useAuth } from "../../features/auth/context/AuthContext";
import CentroAlertasAcciones from "../../features/acciones/components/CentroAlertasAcciones";
import { ADMIN_LIGHT_SCOPE_CLASSES } from "../ui/adminLightTheme";

const internalRoles = new Set([
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
]);

const SIDEBAR_STORAGE_KEY =
  "stack44_dashboard_sidebar_collapsed";

const ADMIN_SUBMODULE_PATHS = new Set([
  "/dashboard/empresas",
  "/dashboard/profesionales",
  "/dashboard/usuarios",
]);

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  visible: boolean;
  exact: boolean;
};

type NavSection = {
  label: string | null;
  items: NavItem[];
};

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [collapsed, setCollapsed] =
    useState(() => {
      return (
        localStorage.getItem(
          SIDEBAR_STORAGE_KEY
        ) === "true"
      );
    });

  const [accionesPendientesTotal, setAccionesPendientesTotal] =
    useState(0);

  const actualizarTotalAcciones = useCallback(
    (total: number) => {
      setAccionesPendientesTotal(total);
    },
    []
  );

  useEffect(() => {
    localStorage.setItem(
      SIDEBAR_STORAGE_KEY,
      String(collapsed)
    );
  }, [collapsed]);

  if (!user) {
    return null;
  }

  const isInternal =
    internalRoles.has(user.role);

  const canManageUsers =
    isInternal ||
    user.role === "CLIENT_ADMIN";

  const canViewSupermatriz =
    isInternal ||
    user.role === "PROFESSIONAL" ||
    user.role === "COORDINATOR";

  const canViewBitacora =
    isInternal ||
    user.role === "PROFESSIONAL" ||
    user.role === "COORDINATOR";

  const canViewInformes = user.role !== "USER";

  const canViewCentroAcciones =
    isInternal ||
    user.role === "COORDINATOR" ||
    user.role === "PROFESSIONAL" ||
    user.role === "CLIENT_ADMIN" ||
    user.role === "CLIENT_USER";

  const showAdminBack =
    isInternal &&
    ADMIN_SUBMODULE_PATHS.has(location.pathname);

  const sections: NavSection[] = [
    {
      label: null,
      items: [
        {
          to: "/dashboard",
          label: "Inicio",
          icon: LayoutDashboard,
          visible: true,
          exact: true,
        },
        {
          to: "/dashboard/acciones",
          label: "Centro de acciones",
          icon: ListChecks,
          visible: canViewCentroAcciones,
          exact: false,
        },
      ],
    },
    {
      label: isInternal ? "Administración" : "Trabajo",
      items: [
        {
          to: "/dashboard/administracion",
          label: "Administración",
          icon: Settings2,
          visible: isInternal,
          exact: true,
        },
        {
          to: "/dashboard/empresas",
          label: "Empresas",
          icon: Building2,
          visible: !isInternal,
          exact: false,
        },
        {
          to: "/dashboard/profesionales",
          label: "Profesionales",
          icon: BriefcaseBusiness,
          visible: false,
          exact: false,
        },
        {
          to: "/dashboard/usuarios",
          label: "Usuarios",
          icon: Users,
          visible: !isInternal && canManageUsers,
          exact: false,
        },
      ],
    },
    {
      label: "Operación",
      items: [
        {
          to: "/dashboard/bitacora",
          label: "Bitácora",
          icon: ClipboardList,
          visible: canViewBitacora,
          exact: false,
        },
        {
          to: "/dashboard/auditorias",
          label: "Auditorías",
          icon: FileSearch,
          visible: canViewInformes,
          exact: false,
        },
        {
          to: "/dashboard/informes",
          label: "Informes",
          icon: FileText,
          visible: canViewInformes,
          exact: false,
        },
      ],
    },
    {
      label: "Configuración",
      items: [
        {
          to: "/dashboard/supermatriz",
          label: "Supermatriz",
          icon: Table2,
          visible: canViewSupermatriz,
          exact: false,
        },
      ],
    },
  ];

  const allItems = sections.flatMap(
    (section) => section.items
  );

  const visibleSections = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => item.visible),
    }))
    .filter((section) => section.items.length > 0);

  const isActive = (
    path: string,
    exact = false
  ): boolean => {
    if (exact) {
      return location.pathname === path;
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  const currentPage =
    [...allItems]
      .sort(
        (first, second) =>
          second.to.length - first.to.length
      )
      .find((item) =>
        isActive(item.to, item.exact)
      )?.label ?? "Panel de control";

  const handleLogout = (): void => {
    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );
  };

  const renderSidebar = (
    compact: boolean,
    mobile = false
  ) => (
    <div className="flex h-full w-full flex-col">
      <div
        className={`flex h-20 shrink-0 items-center border-b border-slate-200 ${
          compact
            ? "justify-center px-3"
            : "justify-between px-5"
        }`}
      >
        {!compact && (
          <div className="min-w-0">
            <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">
              Panel de control
            </h2>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Administración Stack44
            </p>
          </div>
        )}

        {!mobile && (
          <button
            type="button"
            onClick={() =>
              setCollapsed((current) => !current)
            }
            className="hidden h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 lg:flex"
            title={
              compact
                ? "Expandir menú"
                : "Ocultar menú"
            }
            aria-label={
              compact
                ? "Expandir menú"
                : "Ocultar menú"
            }
          >
            {compact ? (
              <ChevronRight size={18} />
            ) : (
              <ChevronLeft size={18} />
            )}
          </button>
        )}

        {mobile && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:text-slate-900"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav
        className={`flex-1 overflow-y-auto py-5 ${
          compact ? "px-2" : "px-4"
        }`}
      >
        <div className="space-y-5">
          {visibleSections.map((section, sectionIndex) => (
            <section
              key={section.label ?? "principal"}
              className={
                compact && sectionIndex > 0
                  ? "border-t border-slate-200 pt-3"
                  : ""
              }
            >
              {!compact && section.label && (
                <p className="mb-2 px-3 text-[10px] font-black uppercase tracking-[0.16em] text-slate-400">
                  {section.label}
                </p>
              )}

              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.to, item.exact);
                  const mostrarContador =
                    item.to === "/dashboard/acciones" &&
                    accionesPendientesTotal > 0;

                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => {
                        if (mobile) setMobileOpen(false);
                      }}
                      title={compact ? item.label : undefined}
                      className={`group relative flex items-center rounded-xl py-3 transition-all ${
                        compact
                          ? "justify-center px-3"
                          : "gap-3 px-4"
                      } ${
                        active
                          ? "border border-cyan-200 bg-cyan-50 text-cyan-700"
                          : "border border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      <Icon
                        size={20}
                        className="shrink-0"
                      />

                      {!compact && (
                        <>
                          <span className="min-w-0 flex-1 truncate text-sm font-medium">
                            {item.label}
                          </span>
                          {mostrarContador && (
                            <span className="flex min-h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-cyan-600 px-1.5 text-[10px] font-bold text-white">
                              {accionesPendientesTotal > 99
                                ? "99+"
                                : accionesPendientesTotal}
                            </span>
                          )}
                        </>
                      )}

                      {compact && mostrarContador && (
                        <span className="absolute right-1 top-1 flex min-h-4 min-w-4 items-center justify-center rounded-full bg-cyan-600 px-1 text-[9px] font-bold text-white ring-2 ring-white">
                          {accionesPendientesTotal > 9
                            ? "9+"
                            : accionesPendientesTotal}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </nav>

      <div
        className={`shrink-0 border-t border-slate-200 ${
          compact ? "p-2" : "p-4"
        }`}
      >
        {!compact ? (
          <div className="mb-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="truncate text-sm font-medium text-slate-900">
              {user.name}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-500">
              {user.email}
            </p>

            <p className="mt-2 text-[10px] font-bold tracking-wider text-cyan-600">
              {user.role}
            </p>
          </div>
        ) : (
          <div
            className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-sm font-bold text-cyan-700"
            title={`${user.name} · ${user.role}`}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          title={compact ? "Cerrar sesión" : undefined}
          className={`flex w-full items-center rounded-xl py-3 text-red-600 transition-colors hover:bg-red-50 ${
            compact
              ? "justify-center px-3"
              : "gap-3 px-4"
          }`}
        >
          <LogOut
            size={20}
            className="shrink-0"
          />

          {!compact && (
            <span className="text-sm font-medium">
              Cerrar sesión
            </span>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <div
      className={`${ADMIN_LIGHT_SCOPE_CLASSES} flex h-[100dvh] min-w-0 overflow-hidden bg-[#f4f7fb] text-slate-900`}
    >
      <aside
        className={`relative z-40 hidden shrink-0 border-r border-slate-200 bg-white shadow-sm transition-[width] duration-300 lg:flex ${
          collapsed
            ? "w-[76px]"
            : "w-64"
        }`}
      >
        {renderSidebar(collapsed)}
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-[min(86vw,18rem)] border-r border-slate-200 bg-white shadow-2xl lg:hidden">
            {renderSidebar(false, true)}
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>

            {showAdminBack && (
              <Link
                to="/dashboard/administracion"
                className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 shadow-sm transition-colors hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
                title="Volver a Administración"
                aria-label="Volver a Administración"
              >
                <ArrowLeft size={16} />
                <span className="hidden sm:inline">
                  Administración
                </span>
              </Link>
            )}

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 sm:text-base">
                {currentPage}
              </p>

              <p className="hidden truncate text-xs text-slate-500 sm:block">
                {user.company?.name ??
                  (user.professional
                    ? "Panel profesional"
                    : "Administración global")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canViewCentroAcciones && (
              <CentroAlertasAcciones
                onTotalChange={actualizarTotalAcciones}
              />
            )}
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-xs font-bold text-cyan-700 sm:h-10 sm:w-10"
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="relative min-h-0 min-w-0 flex-1 overflow-y-auto bg-[#f4f7fb]">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #0f172a 1px, transparent 1px), linear-gradient(to bottom, #0f172a 1px, transparent 1px)",
              backgroundSize:
                "40px 40px",
            }}
          />

          <div className="relative z-10 min-h-full min-w-0 p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
