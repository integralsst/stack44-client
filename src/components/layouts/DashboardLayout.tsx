import {
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  ChevronRight,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
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
  useEffect,
  useState,
} from "react";

import { useAuth } from "../../features/auth/context/AuthContext";
import { ADMIN_LIGHT_SCOPE_CLASSES } from "../ui/adminLightTheme";

const internalRoles = new Set([
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
]);

const SIDEBAR_STORAGE_KEY =
  "stack44_dashboard_sidebar_collapsed";

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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
    user.role === "PROFESSIONAL";

  const canViewInformes = user.role !== "USER";

  const items = [
    {
      to: "/dashboard",
      label: "Inicio",
      icon: LayoutDashboard,
      visible: true,
      exact: true,
    },
    {
      to: "/dashboard/empresas",
      label: "Empresas",
      icon: Building2,
      visible: true,
      exact: false,
    },
    {
      to: "/dashboard/informes",
      label: "Informes",
      icon: FileText,
      visible: canViewInformes,
      exact: false,
    },
    {
      to: "/dashboard/usuarios",
      label: "Usuarios",
      icon: Users,
      visible: canManageUsers,
      exact: false,
    },
    {
      to: "/dashboard/profesionales",
      label: "Profesionales",
      icon: BriefcaseBusiness,
      visible: isInternal,
      exact: false,
    },
    {
      to: "/dashboard/supermatriz",
      label: "Supermatriz",
      icon: Table2,
      visible: canViewSupermatriz,
      exact: false,
    },
  ];

  const visibleItems = items.filter(
    (item) => item.visible
  );

  const isActive = (
    path: string,
    exact = false
  ): boolean => {
    if (exact) {
      return (
        location.pathname === path
      );
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(
        `${path}/`
      )
    );
  };

  const currentPage =
    [...visibleItems]
      .sort(
        (first, second) =>
          second.to.length -
          first.to.length
      )
      .find((item) =>
        isActive(
          item.to,
          item.exact
        )
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
              setCollapsed(
                (current) =>
                  !current
              )
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
              <ChevronRight
                size={18}
              />
            ) : (
              <ChevronLeft
                size={18}
              />
            )}
          </button>
        )}

        {mobile && (
          <button
            type="button"
            onClick={() =>
              setMobileOpen(false)
            }
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:text-slate-900"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav
        className={`flex-1 space-y-2 overflow-y-auto py-5 ${
          compact
            ? "px-2"
            : "px-4"
        }`}
      >
        {visibleItems.map(
          (item) => {
            const Icon =
              item.icon;

            const active =
              isActive(
                item.to,
                item.exact
              );

            return (
              <Link
                key={item.to}
                to={item.to}
                title={
                  compact
                    ? item.label
                    : undefined
                }
                className={`group flex items-center rounded-xl py-3 transition-all ${
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
                  <span className="truncate text-sm font-medium">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          }
        )}
      </nav>

      <div
        className={`shrink-0 border-t border-slate-200 ${
          compact
            ? "p-2"
            : "p-4"
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
            {user.name
              .charAt(0)
              .toUpperCase()}
          </div>
        )}

        <button
          type="button"
          onClick={handleLogout}
          title={
            compact
              ? "Cerrar sesión"
              : undefined
          }
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
        {renderSidebar(
          collapsed
        )}
      </aside>

      {mobileOpen && (
        <>
          <button
            type="button"
            aria-label="Cerrar menú"
            onClick={() =>
              setMobileOpen(false)
            }
            className="fixed inset-0 z-40 bg-slate-950/35 backdrop-blur-sm lg:hidden"
          />

          <aside className="fixed inset-y-0 left-0 z-50 w-[min(86vw,18rem)] border-r border-slate-200 bg-white shadow-2xl lg:hidden">
            {renderSidebar(
              false,
              true
            )}
          </aside>
        </>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white/90 px-4 shadow-sm backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() =>
                setMobileOpen(true)
              }
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 lg:hidden"
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>

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

          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 text-xs font-bold text-cyan-700 sm:h-10 sm:w-10">
            {user.name
              .charAt(0)
              .toUpperCase()}
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
