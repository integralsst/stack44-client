import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Link } from "react-router-dom";
import {
  ChevronRight,
  Loader2,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import { useAuth } from "../../features/auth/context/AuthContext";
import Logo from "../../assets/logostack44.png";

const navLinks = [
  { name: "Comparativa", href: "#comparativa" },
  { name: "Simulador", href: "#dashboard" },
  { name: "Módulos", href: "#modulos" },
  { name: "FAQ", href: "#faq" },
];

const SPLASH_LIMIT = 50;
const SCROLLED_LIMIT = 20;
const DIRECTION_THRESHOLD = 4;

const Navbar = () => {
  const { user, logout, loading } = useAuth();

  const [isScrolled, setIsScrolled] =
    useState(false);
  const [isVisible, setIsVisible] =
    useState(false);
  const [isInSplash, setIsInSplash] =
    useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  /**
   * Las variables que cambian en cada scroll viven en refs.
   * Así el listener no se elimina y se registra nuevamente
   * durante cada desplazamiento.
   */
  const lastScrollYRef = useRef(0);
  const tickingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(
    null
  );
  const mobileMenuOpenRef = useRef(false);

  useEffect(() => {
    mobileMenuOpenRef.current = isMobileMenuOpen;
  }, [isMobileMenuOpen]);

  /* ======================================================
     BLOQUEO DEL MENÚ MÓVIL
  ====================================================== */

  useEffect(() => {
    const body = document.body;

    if (isMobileMenuOpen) {
      body.style.overflow = "hidden";
      body.style.touchAction = "none";
    } else {
      body.style.overflow = "";
      body.style.touchAction = "";
    }

    return () => {
      body.style.overflow = "";
      body.style.touchAction = "";
    };
  }, [isMobileMenuOpen]);

  /* ======================================================
     SCROLL OPTIMIZADO
  ====================================================== */

  useEffect(() => {
    const applyScrollState = () => {
      animationFrameRef.current = null;
      tickingRef.current = false;

      const currentScrollY = window.scrollY;
      const previousScrollY =
        lastScrollYRef.current;

      const nextIsScrolled =
        currentScrollY > SCROLLED_LIMIT;
      const nextIsInSplash =
        currentScrollY < SPLASH_LIMIT;

      setIsScrolled((current) =>
        current === nextIsScrolled
          ? current
          : nextIsScrolled
      );

      setIsInSplash((current) =>
        current === nextIsInSplash
          ? current
          : nextIsInSplash
      );

      if (nextIsInSplash) {
        setIsVisible(false);
      } else {
        const scrollDifference =
          currentScrollY - previousScrollY;

        if (
          Math.abs(scrollDifference) >=
          DIRECTION_THRESHOLD
        ) {
          const nextIsVisible =
            scrollDifference < 0;

          setIsVisible((current) =>
            current === nextIsVisible
              ? current
              : nextIsVisible
          );
        }
      }

      lastScrollYRef.current = currentScrollY;
    };

    const handleScroll = () => {
      if (
        mobileMenuOpenRef.current ||
        tickingRef.current
      ) {
        return;
      }

      tickingRef.current = true;
      animationFrameRef.current =
        window.requestAnimationFrame(
          applyScrollState
        );
    };

    const initialScrollY = window.scrollY;

    lastScrollYRef.current = initialScrollY;
    setIsScrolled(
      initialScrollY > SCROLLED_LIMIT
    );
    setIsInSplash(
      initialScrollY < SPLASH_LIMIT
    );

    /**
     * Si el navegador restauró una posición anterior,
     * mostramos el Navbar sin esperar un nuevo scroll.
     */
    setIsVisible(initialScrollY >= SPLASH_LIMIT);

    window.addEventListener(
      "scroll",
      handleScroll,
      { passive: true }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(
          animationFrameRef.current
        );
      }
    };
  }, []);

  const shouldShowNavbar =
    isMobileMenuOpen ||
    (!isInSplash && isVisible);

  const userInitial =
    user?.name?.trim().charAt(0).toUpperCase() ||
    "U";

  return (
    <>
      <header
        className={`fixed left-0 top-0 z-50 w-full transform-gpu transition-transform duration-300 ease-out ${
          shouldShowNavbar
            ? "translate-y-0"
            : "-translate-y-full"
        }`}
        style={{
          willChange: "transform",
          contain: "layout paint",
        }}
      >
        <div
          className={`pointer-events-none absolute inset-0 bg-[#05080a]/95 transition-opacity duration-200 ${
            isScrolled ? "opacity-100" : "opacity-0"
          }`}
        />

        <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link
            to="/"
            className="group flex items-center"
            aria-label="Ir al inicio"
          >
            <img
              src={Logo}
              alt="Stack44"
              width={180}
              height={40}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              className="h-9 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-[13px] font-semibold tracking-wide text-slate-400 transition-colors hover:text-white"
              >
                {link.name}
              </a>
            ))}
          </nav>

          <div className="hidden min-w-[140px] items-center justify-end gap-4 md:flex">
            {loading ? (
              <div
                className="relative flex h-10 w-32 items-center justify-center gap-2 overflow-hidden rounded-full border border-cyan-400/15 bg-white/[0.04] px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-300 shadow-[0_10px_30px_rgba(6,182,212,0.08)]"
                role="status"
                aria-live="polite"
                aria-label="Comprobando sesión"
              >
                <span className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-cyan-400/[0.06] to-transparent" />
                <Loader2
                  size={15}
                  className="relative shrink-0 animate-spin text-cyan-400"
                />
                <span className="relative">Conectando</span>
              </div>
            ) : user ? (
              <div className="flex items-center gap-4 rounded-full border border-white/5 bg-white/[0.02] py-1.5 pl-5 pr-1.5 transition-colors hover:border-white/10">
                <Link
                  to="/dashboard"
                  className="text-xs font-bold text-slate-300 transition-colors hover:text-cyan-400"
                >
                  Dashboard
                </Link>

                <div className="h-4 w-px bg-white/10" />

                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-cyan-500/10 text-xs font-bold uppercase text-cyan-400">
                  {userInitial}
                </div>

                <button
                  type="button"
                  onClick={logout}
                  className="group rounded-full p-1.5 text-slate-500 transition-colors hover:bg-red-500/10 hover:text-red-400"
                  title="Cerrar sesión"
                  aria-label="Cerrar sesión"
                >
                  <LogOut
                    size={16}
                    className="transition-transform group-hover:-translate-x-0.5"
                  />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition-[background-color,transform] duration-200 hover:scale-[1.02] hover:bg-cyan-300 active:scale-[0.98]"
              >
                Iniciar sesión
              </Link>
            )}
          </div>

          <div className="relative z-50 md:hidden">
            <button
              type="button"
              onClick={() =>
                setIsMobileMenuOpen(true)
              }
              className="-mr-2 p-2 text-slate-300 transition-colors hover:text-white"
              aria-label="Abrir menú"
            >
              <Menu
                size={24}
                strokeWidth={1.5}
              />
            </button>
          </div>
        </div>
      </header>

      {/* MENÚ MÓVIL */}
      <div
        className={`fixed inset-0 z-[9999] flex transform-gpu flex-col bg-[#05080a] transition-[opacity,transform] duration-300 ease-out md:hidden ${
          isMobileMenuOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-4 opacity-0"
        }`}
        style={{ willChange: "opacity, transform" }}
        aria-hidden={!isMobileMenuOpen}
      >
        <div className="flex items-center justify-between px-6 py-8">
          <img
            src={Logo}
            alt="Stack44"
            width={160}
            height={36}
            decoding="async"
            className="h-8 w-auto object-contain opacity-80"
          />

          <button
            type="button"
            onClick={() =>
              setIsMobileMenuOpen(false)
            }
            className="rounded-full bg-white/10 p-2.5 text-white transition-[background-color,transform] hover:bg-white/20 active:scale-95"
            aria-label="Cerrar menú"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-6 px-8 py-4">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() =>
                setIsMobileMenuOpen(false)
              }
              className="group flex items-center justify-between text-4xl font-semibold tracking-tighter text-slate-300 transition-colors hover:text-white"
            >
              {link.name}

              <ChevronRight
                className="h-6 w-6 text-cyan-400 opacity-0 transition-opacity group-hover:opacity-100"
                strokeWidth={2}
              />
            </a>
          ))}
        </div>

        <div className="flex-grow" />

        <div className="mb-4 p-6">
          <div className="rounded-[32px] border border-white/10 bg-white/5 p-6">
            {loading ? (
              <div
                className="flex items-center gap-4 rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] px-4 py-4"
                role="status"
                aria-live="polite"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cyan-400/15 bg-cyan-400/[0.06] text-cyan-400">
                  <Loader2 size={20} className="animate-spin" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">
                    Conectando con Stack44
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-400">
                    Estamos validando tu sesión de forma segura.
                  </p>
                </div>
              </div>
            ) : user ? (
              <div className="flex flex-col gap-5">
                <div className="mb-2 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan-500/20 bg-cyan-500/20 text-lg font-bold text-cyan-400">
                    {userInitial}
                  </div>

                  <div className="flex min-w-0 flex-col">
                    <span className="max-w-[200px] truncate text-xl font-semibold tracking-tight text-white">
                      {user.name}
                    </span>
                    <span className="text-xs font-medium uppercase tracking-wider text-cyan-400">
                      Sesión activa
                    </span>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() =>
                    setIsMobileMenuOpen(false)
                  }
                  className="w-full rounded-2xl bg-cyan-400 py-4 text-center text-lg font-semibold text-slate-950 transition-transform active:scale-95"
                >
                  Ir al Dashboard
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 py-4 font-medium text-slate-300 transition-colors hover:bg-red-500/10 hover:text-red-400"
                >
                  <LogOut size={18} />
                  Cerrar sesión
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <p className="mb-1 text-center text-sm text-slate-400">
                  Accede a tu plataforma de gestión SG-SST
                </p>

                <Link
                  to="/login"
                  onClick={() =>
                    setIsMobileMenuOpen(false)
                  }
                  className="w-full rounded-2xl bg-cyan-400 py-4 text-center text-lg font-semibold text-slate-950 transition-transform active:scale-95"
                >
                  Iniciar sesión
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
