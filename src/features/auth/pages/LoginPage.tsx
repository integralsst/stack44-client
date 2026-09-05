import {
  useState,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  Building2,
  ClipboardCheck,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  useAuth,
  type LoginResponse,
} from "../context/AuthContext";

import Logo from "../../../assets/logostack44.png";

interface ApiErrorResponse {
  error?: string;
  message?: string;
}

const API_URL = (
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000"
).replace(/\/$/, "");

async function parseResponse<T>(
  response: Response
): Promise<T> {
  const contentType =
    response.headers.get("content-type");

  if (
    contentType?.includes("application/json")
  ) {
    return (await response.json()) as T;
  }

  const text = await response.text();

  throw new Error(
    text ||
      "El servidor respondió en un formato inesperado."
  );
}

const benefits = [
  {
    icon: Building2,
    title: "Operación multiempresa",
    description: "Tu alcance, empresas y estado operativo en un solo lugar.",
  },
  {
    icon: ClipboardCheck,
    title: "Evaluación conectada",
    description: "Matriz, evidencias, bitácora y seguimiento sin duplicar trabajo.",
  },
  {
    icon: ShieldCheck,
    title: "Acceso por perfil",
    description: "Cada usuario ve únicamente la información que le corresponde.",
  },
] as const;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] =
    useState("");

  const [error, setError] = useState<
    string | null
  >(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();

    if (isLoading) {
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const normalizedEmail = email
        .trim()
        .toLowerCase();

      if (!normalizedEmail || !password) {
        throw new Error(
          "Ingresa tu correo y contraseña."
        );
      }

      const response = await fetch(
        `${API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            email: normalizedEmail,
            password,
          }),
        }
      );

      if (!response.ok) {
        const errorData =
          await parseResponse<ApiErrorResponse>(
            response
          );

        throw new Error(
          errorData.error ||
            errorData.message ||
            "No fue posible iniciar sesión."
        );
      }

      const data =
        await parseResponse<LoginResponse>(
          response
        );

      if (!data.token || !data.user) {
        throw new Error(
          "La respuesta del servidor no contiene una sesión válida."
        );
      }

      login(data.user, data.token);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (caughtError: unknown) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Ocurrió un error al iniciar sesión.";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-slate-50 px-4 py-6 text-slate-950 sm:px-6 sm:py-10 lg:flex lg:items-center lg:justify-center lg:px-8">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(6,182,212,0.12),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.09),_transparent_32%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.08)_1px,transparent_1px)] [background-size:32px_32px]" />

      <motion.div
        initial={{
          opacity: 0,
          y: 18,
          scale: 0.985,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.55,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative mx-auto grid w-full max-w-[1040px] overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.12)] lg:grid-cols-[1.05fr_0.95fr]"
      >
        <section className="relative hidden min-h-[650px] overflow-hidden border-r border-slate-200/80 bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-10 lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-cyan-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -right-20 h-80 w-80 rounded-full bg-blue-200/25 blur-3xl" />

          <div className="relative">
            <Link
              to="/"
              className="inline-flex items-center gap-3"
              aria-label="Volver al inicio de Stack44"
            >
              <span className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-white bg-white shadow-sm">
                <img
                  src={Logo}
                  alt="Stack44"
                  className="h-9 w-auto object-contain"
                />
              </span>
              <span>
                <span className="block text-sm font-bold tracking-[0.16em] text-slate-950">
                  STACK4FOUR
                </span>
                <span className="mt-0.5 block text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
                  Gestión SG-SST
                </span>
              </span>
            </Link>

            <div className="mt-14 max-w-md">
              <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-white/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-800 shadow-sm">
                <ShieldCheck size={14} />
                Entorno de trabajo seguro
              </span>
              <h2 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-slate-950 xl:text-[2.7rem]">
                Todo tu SG-SST,
                <span className="block text-cyan-700">conectado desde el acceso.</span>
              </h2>
              <p className="mt-5 max-w-[430px] text-sm leading-7 text-slate-600">
                Entra a Stack44 y continúa exactamente donde tu operación necesita atención, sin perder contexto entre empresas, evaluaciones y seguimiento.
              </p>
            </div>
          </div>

          <div className="relative space-y-3">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/70 p-3.5 shadow-sm backdrop-blur"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <Icon size={17} />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{title}</p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="flex min-h-[620px] items-center px-5 py-8 sm:px-8 sm:py-10 lg:min-h-[650px] lg:px-10 xl:px-12">
          <div className="mx-auto w-full max-w-[420px]">
            <div className="mb-8 flex items-center justify-between lg:hidden">
              <Link
                to="/"
                className="flex items-center gap-2.5"
                aria-label="Volver al inicio de Stack44"
              >
                <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <img
                    src={Logo}
                    alt="Stack44"
                    className="h-7 w-auto object-contain"
                  />
                </span>
                <span className="text-sm font-bold tracking-[0.13em] text-slate-950">
                  STACK4FOUR
                </span>
              </Link>
              <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan-800">
                SG-SST
              </span>
            </div>

            <div className="mb-8">
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-cyan-700">
                <ShieldCheck size={15} />
                Acceso seguro
              </span>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2.15rem]">
                Bienvenido de nuevo
              </h1>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Ingresa tus credenciales para continuar con tu operación.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  key={error}
                  initial={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    y: -8,
                  }}
                  role="alert"
                  className="mb-5 overflow-hidden rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form
              className="space-y-5"
              onSubmit={handleSubmit}
            >
              <div className="space-y-2">
                <label
                  htmlFor="login-email"
                  className="ml-0.5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
                >
                  Correo electrónico
                </label>

                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Mail className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-cyan-600" />
                  </div>

                  <input
                    id="login-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);

                      if (error) {
                        setError(null);
                      }
                    }}
                    placeholder="ejemplo@empresa.com"
                    autoComplete="email"
                    autoCapitalize="none"
                    spellCheck={false}
                    disabled={isLoading}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-950 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="ml-0.5 flex items-center justify-between gap-3">
                  <label
                    htmlFor="login-password"
                    className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500"
                  >
                    Contraseña
                  </label>

                  <button
                    type="button"
                    className="text-[11px] font-semibold text-cyan-700 transition-colors hover:text-cyan-900"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <Lock className="h-5 w-5 text-slate-400 transition-colors group-focus-within:text-cyan-600" />
                  </div>

                  <input
                    id="login-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);

                      if (error) {
                        setError(null);
                      }
                    }}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    disabled={isLoading}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm tracking-widest text-slate-950 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-1 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 py-4 text-sm font-bold text-white shadow-[0_12px_30px_rgba(8,145,178,0.22)] transition-[transform,box-shadow,filter] hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(8,145,178,0.26)] hover:brightness-105 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-65 disabled:hover:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </button>
            </form>

            <div className="mt-7 border-t border-slate-100 pt-6 text-center">
              <p className="text-sm text-slate-500">
                ¿Aún no tienes cuenta?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-cyan-700 transition-colors hover:text-cyan-900"
                >
                  Regístrate gratis
                </Link>
              </p>

              <Link
                to="/"
                className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-slate-400 transition-colors hover:text-slate-700"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Volver al inicio
              </Link>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  );
}
