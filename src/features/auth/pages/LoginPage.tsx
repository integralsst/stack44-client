import {
  useState,
  type FormEvent,
} from "react";

import {
  ArrowLeft,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  AnimatePresence,
  motion,
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

  if (contentType?.includes("application/json")) {
    return (await response.json()) as T;
  }

  const text = await response.text();

  throw new Error(
    text ||
      "El servidor respondió en un formato inesperado."
  );
}

function AmbientArtwork() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_18%,rgba(34,211,238,0.10),transparent_30%),radial-gradient(circle_at_78%_72%,rgba(59,130,246,0.08),transparent_34%)]" />

      <motion.div
        animate={{
          x: [0, 18, 0],
          y: [0, -12, 0],
          scale: [1, 1.06, 1],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -left-24 top-[14%] h-72 w-72 rounded-full border border-cyan-200/60"
      />

      <motion.div
        animate={{
          x: [0, -16, 0],
          y: [0, 14, 0],
          rotate: [0, 8, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -right-24 bottom-[12%] h-80 w-80 rounded-[38%] border border-blue-200/50"
      />

      <svg
        viewBox="0 0 1200 800"
        className="absolute inset-0 h-full w-full opacity-60"
        fill="none"
      >
        <motion.path
          d="M70 560 C 230 430, 360 640, 530 510 S 840 350, 1130 470"
          stroke="url(#login-line)"
          strokeWidth="1.2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            duration: 2.2,
            ease: [0.16, 1, 0.3, 1],
          }}
        />
        <defs>
          <linearGradient
            id="login-line"
            x1="70"
            y1="560"
            x2="1130"
            y2="470"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#67e8f9" stopOpacity="0" />
            <stop offset="0.45" stopColor="#22d3ee" stopOpacity="0.42" />
            <stop offset="0.72" stopColor="#60a5fa" stopOpacity="0.28" />
            <stop offset="1" stopColor="#93c5fd" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <motion.div
        animate={{
          x: [0, 110, 0],
          opacity: [0.15, 0.45, 0.15],
        }}
        transition={{
          duration: 11,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-[22%] top-[68%] h-1.5 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_18px_rgba(6,182,212,0.65)]"
      />
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8fafc] px-4 py-8 text-slate-950 sm:px-6">
      <AmbientArtwork />

      <motion.main
        initial={{
          opacity: 0,
          y: 16,
          scale: 0.985,
        }}
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="relative z-10 w-full max-w-[430px]"
      >
        <div className="rounded-[2rem] border border-white/90 bg-white/82 p-5 shadow-[0_28px_90px_rgba(15,23,42,0.10)] backdrop-blur-xl sm:p-7">
          <div className="mb-7 flex items-center justify-between">
            <Link
              to="/"
              aria-label="Volver al inicio de Stack44"
              className="group inline-flex items-center gap-3"
            >
              <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-transform duration-300 group-hover:-translate-y-0.5">
                <img
                  src={Logo}
                  alt="Stack44"
                  className="h-8 w-auto object-contain"
                />
              </span>
              <span className="text-[12px] font-bold tracking-[0.18em] text-slate-900">
                STACK4FOUR
              </span>
            </Link>

            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_5px_rgba(52,211,153,0.10)]" />
          </div>

          <div className="mb-7">
            <h1 className="text-[2rem] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[2.2rem]">
              Bienvenido.
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Ingresa para continuar.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                key={error}
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                role="alert"
                className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form
            className="space-y-4"
            onSubmit={handleSubmit}
          >
            <div className="group relative">
              <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-600" />
              <input
                id="login-email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (error) setError(null);
                }}
                placeholder="Correo electrónico"
                autoComplete="email"
                autoCapitalize="none"
                spellCheck={false}
                disabled={isLoading}
                required
                aria-label="Correo electrónico"
                className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm text-slate-950 outline-none transition-all placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>

            <div>
              <div className="group relative">
                <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-slate-400 transition-colors group-focus-within:text-cyan-600" />
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                  aria-label="Contraseña"
                  className="h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/70 pl-11 pr-4 text-sm tracking-[0.08em] text-slate-950 outline-none transition-all placeholder:tracking-normal placeholder:text-slate-400 hover:border-slate-300 hover:bg-white focus:border-cyan-500 focus:bg-white focus:ring-4 focus:ring-cyan-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div className="mt-2.5 flex justify-end">
                <button
                  type="button"
                  className="text-[11px] font-semibold text-slate-400 transition-colors hover:text-cyan-700"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={isLoading ? undefined : { y: -1 }}
              whileTap={isLoading ? undefined : { scale: 0.99 }}
              className="relative mt-1 flex h-14 w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-[0_12px_30px_rgba(15,23,42,0.18)] transition-colors hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-65"
            >
              <span className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Conectando...
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </motion.button>
          </form>

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-slate-700"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Inicio
            </Link>

            <Link
              to="/register"
              className="text-xs font-semibold text-cyan-700 transition-colors hover:text-cyan-900"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
