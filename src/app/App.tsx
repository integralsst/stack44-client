import {
  Suspense,
  lazy,
  type ReactNode,
} from "react";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  useAuth,
  type UserRole,
} from "../features/auth/context/AuthContext";

import Navbar from "../components/layouts/Navbar";
import Footer from "../components/layouts/Footer";
import LandingPage from "../features/landing/pages/Home";

/* ======================================================
   CARGA DIFERIDA
====================================================== */

const LoginPage = lazy(
  () => import("../features/auth/pages/LoginPage")
);

const DiagnosticoPage = lazy(
  () =>
    import(
      "../features/landing/pages/DiagnosticoPage"
    )
);

const DashboardLayout = lazy(
  () =>
    import(
      "../components/layouts/DashboardLayout"
    )
);

const Dashboard = lazy(
  () =>
    import(
      "../features/dashboard/pages/Dashboard"
    )
);

const Companies = lazy(
  () =>
    import(
      "../features/companies/pages/Companies"
    )
);

const Users = lazy(
  () => import("../features/users/pages/Users")
);

const Professionals = lazy(
  () =>
    import(
      "../features/profesionals/pages/Professionals"
    )
);

const Supermatriz = lazy(
  () =>
    import(
      "../features/supermatriz/pages/Supermatriz"
    )
);

const EvaluacionEmpresaPage = lazy(
  () =>
    import(
      "../features/evaluacion/pages/EvaluacionEmpresaPage"
    )
);

const InformesGlobalesPage = lazy(
  () =>
    import(
      "../features/evaluacion/pages/InformesGlobalesPage"
    )
);

const CompromisosPage = lazy(
  () =>
    import(
      "../features/compromisos/pages/CompromisosPage"
    )
);

const MisCompromisosPage = lazy(
  () =>
    import(
      "../features/compromisos/pages/MisCompromisosPage"
    )
);

const CompromisoDetallePage = lazy(
  () =>
    import(
      "../features/compromisos/pages/CompromisoDetallePage"
    )
);

/* ======================================================
   PERMISOS
====================================================== */

const INTERNAL_ROLES: UserRole[] = [
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
];

const USER_MANAGEMENT_ROLES: UserRole[] = [
  "CLIENT_ADMIN",
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
];

const SUPERMATRIZ_ROLES: UserRole[] = [
  "PROFESSIONAL",
  "COORDINATOR",
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
];

const EVALUACION_ROLES: UserRole[] = [
  "PROFESSIONAL",
  "COORDINATOR",
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
];

const INFORMES_ROLES: UserRole[] = [
  "CLIENT_USER",
  "CLIENT_ADMIN",
  "PROFESSIONAL",
  "COORDINATOR",
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
];

const COMPROMISOS_SUPERVISION_ROLES: UserRole[] = [
  "COORDINATOR",
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
];

const MIS_COMPROMISOS_ROLES: UserRole[] = [
  "PROFESSIONAL",
  "COORDINATOR",
  "ADMIN",
  "OWNER",
  "SUPERADMIN",
];

/* ======================================================
   ELEMENTOS AUXILIARES
====================================================== */

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#05080a]">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
    </div>
  );
}

function ProtectedDashboardLayout() {
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteLoader />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout />;
}

function LoginRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return <RouteLoader />;
  }

  return user ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <LoginPage />
  );
}

type RoleGuardProps = {
  allowedRoles: UserRole[];
  children: ReactNode;
};

function RoleGuard({
  allowedRoles,
  children,
}: RoleGuardProps) {
  const { user } = useAuth();

  if (
    !user ||
    !allowedRoles.includes(user.role)
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function PublicLanding() {
  return (
    <>
      <Navbar />

      <main className="flex-grow">
        <LandingPage />
      </main>

      <Footer />
    </>
  );
}

/* ======================================================
   APLICACIÓN
====================================================== */

function AppRoutes() {
  return (
    <div className="flex min-h-screen flex-col bg-[#05080a] font-sans text-slate-200 selection:bg-cyan-500/30">
      <Suspense fallback={<RouteLoader />}>
        <Routes>
          <Route path="/" element={<PublicLanding />} />

          <Route
            path="/login"
            element={<LoginRoute />}
          />

          <Route
            path="/diagnostico"
            element={<DiagnosticoPage />}
          />

          <Route
            path="/dashboard"
            element={<ProtectedDashboardLayout />}
          >
            <Route index element={<Dashboard />} />

            <Route
              path="empresas"
              element={<Companies />}
            />

            <Route
              path="empresas/:empresaId/evaluacion"
              element={
                <RoleGuard
                  allowedRoles={EVALUACION_ROLES}
                >
                  <EvaluacionEmpresaPage />
                </RoleGuard>
              }
            />

            <Route
              path="informes"
              element={
                <RoleGuard allowedRoles={INFORMES_ROLES}>
                  <InformesGlobalesPage />
                </RoleGuard>
              }
            />

            <Route
              path="compromisos"
              element={
                <RoleGuard
                  allowedRoles={
                    COMPROMISOS_SUPERVISION_ROLES
                  }
                >
                  <CompromisosPage />
                </RoleGuard>
              }
            />

            <Route
              path="compromisos/:compromisoId"
              element={
                <RoleGuard
                  allowedRoles={
                    MIS_COMPROMISOS_ROLES
                  }
                >
                  <CompromisoDetallePage />
                </RoleGuard>
              }
            />

            <Route
              path="mis-compromisos"
              element={
                <RoleGuard
                  allowedRoles={
                    MIS_COMPROMISOS_ROLES
                  }
                >
                  <MisCompromisosPage />
                </RoleGuard>
              }
            />

            <Route
              path="mis-compromisos/:compromisoId"
              element={
                <RoleGuard
                  allowedRoles={
                    MIS_COMPROMISOS_ROLES
                  }
                >
                  <CompromisoDetallePage />
                </RoleGuard>
              }
            />

            <Route
              path="usuarios"
              element={
                <RoleGuard
                  allowedRoles={
                    USER_MANAGEMENT_ROLES
                  }
                >
                  <Users />
                </RoleGuard>
              }
            />

            <Route
              path="profesionales"
              element={
                <RoleGuard
                  allowedRoles={INTERNAL_ROLES}
                >
                  <Professionals />
                </RoleGuard>
              }
            />

            <Route
              path="supermatriz"
              element={
                <RoleGuard
                  allowedRoles={SUPERMATRIZ_ROLES}
                >
                  <Supermatriz />
                </RoleGuard>
              }
            />
          </Route>

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />
        </Routes>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}