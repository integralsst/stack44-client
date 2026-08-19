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
  useParams,
  useSearchParams,
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

const CentroAccionesPage = lazy(
  () =>
    import(
      "../features/acciones/pages/CentroAccionesPage"
    )
);

const AuditoriasPage = lazy(
  () =>
    import(
      "../features/auditorias/pages/AuditoriasPage"
    )
);

const AuditoriaDetalleGovernancePage = lazy(
  () =>
    import(
      "../features/auditorias/pages/AuditoriaDetalleGovernancePage"
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

const ControlesEvaluacionPage = lazy(
  () =>
    import(
      "../features/evaluacion/pages/ControlesEvaluacionPage"
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

const EVALUACION_LECTURA_ROLES: UserRole[] = [
  "CLIENT_ADMIN",
  ...EVALUACION_ROLES,
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
  "CLIENT_USER",
  "CLIENT_ADMIN",
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

function RoleGuard({ allowedRoles, children }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function EvaluacionRoute() {
  const { empresaId } = useParams<{ empresaId: string }>();
  const [searchParams] = useSearchParams();
  const anio = searchParams.get("anio") ?? String(new Date().getFullYear());

  if (empresaId && searchParams.get("noAplica") === "1") {
    return (
      <Navigate
        to={`/dashboard/empresas/${empresaId}/evaluacion/controles?anio=${encodeURIComponent(anio)}&tab=no-aplica`}
        replace
      />
    );
  }

  if (empresaId && searchParams.get("aprobaciones") === "1") {
    return (
      <Navigate
        to={`/dashboard/empresas/${empresaId}/evaluacion/controles?anio=${encodeURIComponent(anio)}&tab=aprobaciones`}
        replace
      />
    );
  }

  return <EvaluacionEmpresaPage />;
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
          <Route path="/login" element={<LoginRoute />} />
          <Route path="/diagnostico" element={<DiagnosticoPage />} />

          <Route path="/dashboard" element={<ProtectedDashboardLayout />}>
            <Route index element={<Dashboard />} />

            <Route
              path="acciones"
              element={
                <RoleGuard allowedRoles={MIS_COMPROMISOS_ROLES}>
                  <CentroAccionesPage />
                </RoleGuard>
              }
            />

            <Route
              path="auditorias"
              element={
                <RoleGuard allowedRoles={INFORMES_ROLES}>
                  <AuditoriasPage />
                </RoleGuard>
              }
            />

            <Route
              path="auditorias/:auditoriaId"
              element={
                <RoleGuard allowedRoles={INFORMES_ROLES}>
                  <AuditoriaDetalleGovernancePage />
                </RoleGuard>
              }
            />

            <Route path="empresas" element={<Companies />} />

            <Route
              path="empresas/:empresaId/evaluacion"
              element={
                <RoleGuard allowedRoles={EVALUACION_LECTURA_ROLES}>
                  <EvaluacionRoute />
                </RoleGuard>
              }
            />

            <Route
              path="empresas/:empresaId/evaluacion/controles"
              element={
                <RoleGuard allowedRoles={EVALUACION_ROLES}>
                  <ControlesEvaluacionPage />
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
                <RoleGuard allowedRoles={COMPROMISOS_SUPERVISION_ROLES}>
                  <CompromisosPage />
                </RoleGuard>
              }
            />

            <Route
              path="compromisos/:compromisoId"
              element={
                <RoleGuard allowedRoles={MIS_COMPROMISOS_ROLES}>
                  <CompromisoDetallePage />
                </RoleGuard>
              }
            />

            <Route
              path="mis-compromisos"
              element={
                <RoleGuard allowedRoles={MIS_COMPROMISOS_ROLES}>
                  <MisCompromisosPage />
                </RoleGuard>
              }
            />

            <Route
              path="mis-compromisos/:compromisoId"
              element={
                <RoleGuard allowedRoles={MIS_COMPROMISOS_ROLES}>
                  <CompromisoDetallePage />
                </RoleGuard>
              }
            />

            <Route
              path="usuarios"
              element={
                <RoleGuard allowedRoles={USER_MANAGEMENT_ROLES}>
                  <Users />
                </RoleGuard>
              }
            />

            <Route
              path="profesionales"
              element={
                <RoleGuard allowedRoles={INTERNAL_ROLES}>
                  <Professionals />
                </RoleGuard>
              }
            />

            <Route
              path="supermatriz"
              element={
                <RoleGuard allowedRoles={SUPERMATRIZ_ROLES}>
                  <Supermatriz />
                </RoleGuard>
              }
            />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
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
