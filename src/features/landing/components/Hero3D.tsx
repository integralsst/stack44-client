// src/features/landing/components/Hero3D.tsx

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type Transition,
} from "framer-motion";

import { ShieldCheck } from "lucide-react";
import logoStack44 from "../../../assets/logostack44.png";

/* =========================================================
   CONFIGURACIÓN & UTILIDADES
========================================================= */

const STORAGE_KEY = "stack44:hero3d-state";
const LEGACY_STORAGE_KEY = "stack44:hero3d-progress";

const TEXT_START_SECONDS = 6;
const VIDEO_END_PADDING = 0.08;
const SEEK_THRESHOLD = 1 / 24;
const SEEK_WHILE_BUSY_THRESHOLD = 0.18;
const RECOVERY_TIMEOUT = 320;

type StoredHeroState = {
  progress: number;
  currentTime: number;
};

type VideoWithFrameCallback = HTMLVideoElement & {
  requestVideoFrameCallback?: (
    callback: (now: number, metadata: VideoFrameMetadata) => void
  ) => number;
  cancelVideoFrameCallback?: (callbackId: number) => void;
};

interface VideoFrameMetadata {
  presentationTime: DOMHighResTimeStamp;
  expectedDisplayTime: DOMHighResTimeStamp;
  width: number;
  height: number;
  mediaTime: number;
  presentedFrames: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const getTargetTime = (progress: number, duration: number) => {
  const maximumTime = Math.max(duration - VIDEO_END_PADDING, 0);
  return clamp(progress * duration, 0, maximumTime);
};

/* =========================================================
   SUB-COMPONENTE: LOADER
========================================================= */

const PremiumLoader = () => {
  return (
    <motion.div
      key="minimal-loader"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
      }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05080a]"
    >
      <div className="flex flex-col items-center gap-5">
        <motion.div
          animate={{ opacity: [0.35, 1, 0.35] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="ml-2 text-[10px] font-medium uppercase tracking-[0.5em] text-slate-300"
        >
          Stack4Four
        </motion.div>

        <div className="relative h-px w-24 overflow-hidden bg-white/5">
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-0 top-0 h-full w-1/2 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent"
          />
        </div>
      </div>
    </motion.div>
  );
};

/* =========================================================
   COMPONENTE PRINCIPAL: HERO3D
========================================================= */

export const Hero3D = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const animationFrameRef = useRef<number | null>(null);
  const recoveryFrameRef = useRef<number | null>(null);
  const recoveryTimerRef = useRef<number | null>(null);
  const videoFrameCallbackRef = useRef<number | null>(null);

  const latestProgressRef = useRef(0);
  const restoredProgressRef = useRef<number | null>(null);
  const restoredTimeRef = useRef<number | null>(null);
  const forceSeekRef = useRef(false);
  const wasHiddenRef = useRef(false);

  const interfaceStateRef = useRef({
    hasScrolled: false,
    showText: false,
    videoReady: false,
    recovering: false,
  });

  const [hasScrolled, setHasScrolled] = useState(false);
  const [showText, setShowText] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [recovering, setRecovering] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  /* =======================================================
     SESSION STORAGE
  ======================================================= */

  const readStoredState = useCallback((): StoredHeroState | null => {
    try {
      const storedState = window.sessionStorage.getItem(STORAGE_KEY);

      if (storedState) {
        const parsedState = JSON.parse(storedState) as Partial<StoredHeroState>;
        const progress = Number(parsedState.progress);
        const currentTime = Number(parsedState.currentTime);

        if (Number.isFinite(progress)) {
          return {
            progress: clamp(progress, 0, 1),
            currentTime: Number.isFinite(currentTime)
              ? Math.max(currentTime, 0)
              : 0,
          };
        }
      }

      const legacyValue = window.sessionStorage.getItem(LEGACY_STORAGE_KEY);
      if (!legacyValue) return null;

      const legacyProgress = Number(legacyValue);
      if (!Number.isFinite(legacyProgress)) return null;

      return {
        progress: clamp(legacyProgress, 0, 1),
        currentTime: 0,
      };
    } catch {
      return null;
    }
  }, []);

  const saveCurrentState = useCallback(() => {
    try {
      const video = videoRef.current;
      const currentTime =
        video && Number.isFinite(video.currentTime)
          ? Math.max(video.currentTime, 0)
          : 0;

      const state: StoredHeroState = {
        progress: clamp(latestProgressRef.current, 0, 1),
        currentTime,
      };

      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // sessionStorage puede estar bloqueado.
    }
  }, []);

  /* =======================================================
     ESTADO DE INTERFAZ
  ======================================================= */

  const setReadyState = useCallback((nextValue: boolean) => {
    if (interfaceStateRef.current.videoReady === nextValue) return;
    interfaceStateRef.current.videoReady = nextValue;
    setVideoReady(nextValue);
  }, []);

  const setRecoveringState = useCallback((nextValue: boolean) => {
    if (interfaceStateRef.current.recovering === nextValue) return;
    interfaceStateRef.current.recovering = nextValue;
    setRecovering(nextValue);
  }, []);

  const updateInterfaceState = useCallback(
    (progress: number, duration?: number) => {
      const nextHasScrolled = progress > 0.01;

      if (interfaceStateRef.current.hasScrolled !== nextHasScrolled) {
        interfaceStateRef.current.hasScrolled = nextHasScrolled;
        setHasScrolled(nextHasScrolled);
      }

      if (
        typeof duration !== "number" ||
        !Number.isFinite(duration) ||
        duration <= 0
      ) {
        return;
      }

      const nextShowText = progress * duration >= TEXT_START_SECONDS;

      if (interfaceStateRef.current.showText !== nextShowText) {
        interfaceStateRef.current.showText = nextShowText;
        setShowText(nextShowText);
      }
    },
    []
  );

  /* =======================================================
     PROGRESO REAL DEL HERO
  ======================================================= */

  const getRealScrollProgress = useCallback(() => {
    const container = containerRef.current;
    if (!container) return clamp(scrollYProgress.get(), 0, 1);

    const rect = container.getBoundingClientRect();
    const totalScrollable = container.offsetHeight - window.innerHeight;

    if (totalScrollable <= 0) return 0;
    return clamp(-rect.top / totalScrollable, 0, 1);
  }, [scrollYProgress]);

  const getPreferredProgress = useCallback(() => {
    const realProgress = getRealScrollProgress();

    if (realProgress > 0.005) {
      restoredProgressRef.current = null;
      restoredTimeRef.current = null;
      return realProgress;
    }

    if (restoredProgressRef.current !== null) {
      return restoredProgressRef.current;
    }

    return latestProgressRef.current;
  }, [getRealScrollProgress]);

  /* =======================================================
     CONTROL DEL FRAME PINTADO
  ======================================================= */

  const clearRecoveryTimer = useCallback(() => {
    if (recoveryTimerRef.current !== null) {
      window.clearTimeout(recoveryTimerRef.current);
      recoveryTimerRef.current = null;
    }
  }, []);

  const finishRecovery = useCallback(() => {
    clearRecoveryTimer();
    setReadyState(true);
    setRecoveringState(false);
  }, [clearRecoveryTimer, setReadyState, setRecoveringState]);

  const waitForPaintedVideoFrame = useCallback(() => {
    const video = videoRef.current as VideoWithFrameCallback | null;
    if (!video) return;

    if (
      videoFrameCallbackRef.current !== null &&
      video.cancelVideoFrameCallback
    ) {
      video.cancelVideoFrameCallback(videoFrameCallbackRef.current);
      videoFrameCallbackRef.current = null;
    }

    if (video.requestVideoFrameCallback) {
      videoFrameCallbackRef.current = video.requestVideoFrameCallback(() => {
        videoFrameCallbackRef.current = null;
        finishRecovery();
      });
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => finishRecovery());
    });
  }, [finishRecovery]);

  /* =======================================================
     SINCRONIZACIÓN DEL VIDEO

     Evitamos encadenar micro-seeks mientras el navegador ya
     está resolviendo uno. Esto reduce saltos en Safari/macOS y
     carga del decoder en Chrome/Windows sin sacrificar respuesta.
  ======================================================= */

  const applyScheduledVideoProgress = useCallback(() => {
    animationFrameRef.current = null;

    const progress = clamp(latestProgressRef.current, 0, 1);
    updateInterfaceState(progress);

    const video = videoRef.current;
    if (!video || video.readyState < HTMLMediaElement.HAVE_METADATA) return;

    const duration = video.duration;
    if (!Number.isFinite(duration) || duration <= 0) return;

    updateInterfaceState(progress, duration);

    let targetTime = getTargetTime(progress, duration);

    if (
      forceSeekRef.current &&
      restoredTimeRef.current !== null &&
      getRealScrollProgress() <= 0.005
    ) {
      targetTime = clamp(
        restoredTimeRef.current,
        0,
        Math.max(duration - VIDEO_END_PADDING, 0)
      );
    }

    const difference = Math.abs(video.currentTime - targetTime);
    const mustForceSeek = forceSeekRef.current;
    forceSeekRef.current = false;

    if (!mustForceSeek && difference < SEEK_THRESHOLD) return;

    if (
      !mustForceSeek &&
      video.seeking &&
      difference < SEEK_WHILE_BUSY_THRESHOLD
    ) {
      return;
    }

    try {
      video.currentTime = targetTime;
    } catch {
      // Evita romper la página durante un seek puntual.
    }
  }, [getRealScrollProgress, updateInterfaceState]);

  const scheduleVideoSync = useCallback(
    (progress: number, forceSeek = false) => {
      latestProgressRef.current = clamp(progress, 0, 1);

      if (forceSeek) {
        forceSeekRef.current = true;
      }

      if (animationFrameRef.current !== null) return;

      animationFrameRef.current = window.requestAnimationFrame(
        applyScheduledVideoProgress
      );
    },
    [applyScheduledVideoProgress]
  );

  /* =======================================================
     RECUPERACIÓN AL REGRESAR A LA PESTAÑA
  ======================================================= */

  const repaintCurrentVideoFrame = useCallback(
    (progress: number) => {
      const video = videoRef.current;

      if (
        !video ||
        video.readyState < HTMLMediaElement.HAVE_METADATA ||
        !Number.isFinite(video.duration) ||
        video.duration <= 0
      ) {
        scheduleVideoSync(progress, true);
        return;
      }

      const maximumTime = Math.max(video.duration - VIDEO_END_PADDING, 0);
      const targetTime = getTargetTime(progress, video.duration);
      const nudgeTime =
        targetTime + 0.05 <= maximumTime
          ? targetTime + 0.05
          : Math.max(targetTime - 0.05, 0);

      const wakeUpDecoder = async () => {
        try {
          video.muted = true;
          await video.play();
          video.pause();
        } catch {
          // Algunos navegadores bloquean play() incluso silenciado.
        } finally {
          video.currentTime = nudgeTime;

          if (recoveryFrameRef.current !== null) {
            window.cancelAnimationFrame(recoveryFrameRef.current);
          }

          recoveryFrameRef.current = window.requestAnimationFrame(() => {
            recoveryFrameRef.current = null;
            const currentVideo = videoRef.current;

            if (!currentVideo) {
              finishRecovery();
              return;
            }

            try {
              currentVideo.currentTime = targetTime;
            } catch {
              // La recuperación tiene fallback por timeout.
            }

            waitForPaintedVideoFrame();
          });
        }
      };

      void wakeUpDecoder();
    },
    [finishRecovery, scheduleVideoSync, waitForPaintedVideoFrame]
  );

  const recoverVideoFrame = useCallback(() => {
    if (document.visibilityState !== "visible") return;

    const progress = getRealScrollProgress();
    latestProgressRef.current = progress;
    setRecoveringState(true);
    updateInterfaceState(progress);
    repaintCurrentVideoFrame(progress);
    clearRecoveryTimer();

    recoveryTimerRef.current = window.setTimeout(
      finishRecovery,
      RECOVERY_TIMEOUT
    );
  }, [
    clearRecoveryTimer,
    finishRecovery,
    getRealScrollProgress,
    repaintCurrentVideoFrame,
    setRecoveringState,
    updateInterfaceState,
  ]);

  /* =======================================================
     EVENTO DE SCROLL
  ======================================================= */

  useMotionValueEvent(scrollYProgress, "change", (latestProgress) => {
    if (restoredProgressRef.current !== null && latestProgress < 0.001) {
      return;
    }

    if (latestProgress > 0.001) {
      restoredProgressRef.current = null;
      restoredTimeRef.current = null;
    }

    scheduleVideoSync(latestProgress);
  });

  /* =======================================================
     RESTAURACIÓN INICIAL
  ======================================================= */

  useEffect(() => {
    const storedState = readStoredState();
    if (!storedState) return;

    restoredProgressRef.current = storedState.progress;
    restoredTimeRef.current = storedState.currentTime;
    latestProgressRef.current = storedState.progress;
    updateInterfaceState(storedState.progress);
  }, [readStoredState, updateInterfaceState]);

  /* =======================================================
     VISIBILIDAD Y NAVEGACIÓN
  ======================================================= */

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        wasHiddenRef.current = true;
        saveCurrentState();
        videoRef.current?.pause();
        return;
      }

      if (document.visibilityState === "visible" && wasHiddenRef.current) {
        wasHiddenRef.current = false;
        recoverVideoFrame();
      }
    };

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) recoverVideoFrame();
    };

    const handlePageHide = () => {
      saveCurrentState();
      videoRef.current?.pause();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [recoverVideoFrame, saveCurrentState]);

  /* =======================================================
     LIMPIEZA
  ======================================================= */

  useEffect(() => {
    return () => {
      saveCurrentState();

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      if (recoveryFrameRef.current !== null) {
        window.cancelAnimationFrame(recoveryFrameRef.current);
      }

      clearRecoveryTimer();

      const video = videoRef.current as VideoWithFrameCallback | null;

      if (
        video &&
        videoFrameCallbackRef.current !== null &&
        video.cancelVideoFrameCallback
      ) {
        video.cancelVideoFrameCallback(videoFrameCallbackRef.current);
      }

      videoRef.current?.pause();
    };
  }, [clearRecoveryTimer, saveCurrentState]);

  /* =======================================================
     ANIMACIONES GENERALES & ESTADOS DE RENDER
  ======================================================= */

  const sectionOpacity = useTransform(scrollYProgress, [0.9, 1], [1, 0]);
  const sectionY = useTransform(scrollYProgress, [0.9, 1], [0, -42]);
  const textTransition: Transition = {
    duration: 0.65,
    ease: [0.16, 1, 0.3, 1],
  };

  const showSplash = !hasScrolled || recovering;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <AnimatePresence mode="wait">
        {!videoReady && <PremiumLoader />}
      </AnimatePresence>

      <div
        ref={containerRef}
        className="relative flex h-[380vh] w-full flex-col bg-[#05080a]"
      >
        <motion.div
          style={{
            opacity: sectionOpacity,
            y: sectionY,
            willChange: "opacity, transform",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: videoReady ? 1 : 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="sticky top-0 z-0 flex h-screen w-full transform-gpu items-center justify-center overflow-hidden bg-[#05080a]"
        >
          {/* VIDEO PRINCIPAL */}
          <div className="absolute inset-0 z-0 h-full w-full overflow-hidden bg-[#05080a]">
            <video
              ref={videoRef}
              src="/videos/hero-3d.mp4"
              muted
              playsInline
              preload="auto"
              disablePictureInPicture
              aria-hidden="true"
              className="h-full w-full object-cover"
              style={{
                transform: "translate3d(0, 0, 0)",
                backfaceVisibility: "hidden",
              }}
              onLoadedMetadata={() => {
                const realProgress = getRealScrollProgress();
                const progress =
                  realProgress > 0.005
                    ? realProgress
                    : restoredProgressRef.current ?? latestProgressRef.current;

                latestProgressRef.current = progress;
                scheduleVideoSync(progress, true);
              }}
              onLoadedData={() => {
                const progress = getPreferredProgress();
                scheduleVideoSync(progress, true);
                waitForPaintedVideoFrame();
              }}
              onCanPlay={() => {
                if (!interfaceStateRef.current.videoReady) {
                  waitForPaintedVideoFrame();
                }
              }}
              onSeeked={() => {
                if (recovering || !interfaceStateRef.current.videoReady) {
                  waitForPaintedVideoFrame();
                }

                scheduleVideoSync(latestProgressRef.current);
              }}
              onError={() => {
                clearRecoveryTimer();
                setReadyState(true);
                setRecoveringState(false);
              }}
            />

            {/* Gradientes livianos: preservan profundidad sin grandes blur filters. */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_58%,_rgba(5,8,10,0.72)_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(5,8,10,0.20)_0%,transparent_42%,rgba(5,8,10,0.78)_100%)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(5,8,10,0.92)_0%,_rgba(5,8,10,0.26)_42%,_transparent_72%)]" />
          </div>

          {/* SPLASH */}
          <AnimatePresence>
            {showSplash && videoReady && (
              <motion.div
                initial={{ opacity: 1 }}
                exit={{
                  opacity: 0,
                  scale: 1.035,
                  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
                }}
                className="absolute inset-0 z-30 flex items-center justify-center overflow-hidden bg-[#05080a]/28 px-8 md:justify-between md:px-20 lg:px-32"
              >
                <motion.div
                  animate={{ opacity: [0.12, 0.22, 0.12] }}
                  transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_28%_50%,rgba(6,182,212,0.24),transparent_34%)]"
                />

                <motion.div
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-10 flex w-full justify-center md:w-1/2 md:justify-start"
                >
                  <div className="relative">
                    <div className="pointer-events-none absolute -inset-12 bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_66%)]" />
                    <img
                      src={logoStack44}
                      alt="Stack44"
                      draggable={false}
                      className="relative z-10 w-56 select-none object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.75)] md:w-80 lg:w-[420px]"
                    />
                  </div>
                </motion.div>

                {!hasScrolled && (
                  <div className="relative z-10 mt-16 flex w-full flex-col items-center md:mt-0 md:w-1/2 md:items-start">
                    <motion.h1
                      initial={{ opacity: 0, y: 24 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.9,
                        delay: 0.24,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="mb-6 text-center text-5xl font-black leading-[0.95] tracking-tighter text-white drop-shadow-2xl sm:text-6xl md:text-left md:text-7xl lg:text-[5.5rem]"
                    >
                      STACK4FOUR
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.9, delay: 0.42, ease: "easeOut" }}
                      className="mb-10 max-w-[420px] text-center text-sm font-medium leading-relaxed text-slate-400 md:text-left md:text-lg lg:text-xl"
                    >
                      El ecosistema definitivo que transforma el cumplimiento
                      legal en una ventaja operativa imbatible.
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.75,
                        delay: 0.58,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      className="flex cursor-default items-center gap-5"
                    >
                      <div className="relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-cyan-500/30 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                        <motion.div
                          animate={{ y: ["-100%", "100%"] }}
                          transition={{
                            repeat: Infinity,
                            duration: 1.8,
                            ease: "linear",
                          }}
                          className="absolute inset-0 h-[200%] w-full bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent"
                        />
                        <div className="relative z-10 h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_2px_rgba(34,211,238,0.9)]" />
                      </div>

                      <div className="flex flex-col text-left">
                        <span className="text-[12px] font-bold uppercase tracking-[0.3em] text-white">
                          Desliza para Iniciar
                        </span>
                        <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-500/80">
                          Secuencia de Inmersión
                        </span>
                      </div>
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CONTENIDO LATERAL DURANTE EL VIDEO */}
          <div className="pointer-events-none absolute right-6 top-1/2 z-10 w-full max-w-lg -translate-y-1/2 md:right-24 md:max-w-xl lg:right-32 xl:right-40">
            <AnimatePresence mode="wait">
              {showText && videoReady && !recovering && (
                <motion.div
                  key="main-text"
                  initial={{ opacity: 0, x: 32 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -32 }}
                  transition={textTransition}
                  style={{ willChange: "opacity, transform" }}
                  className="flex flex-col items-end text-right"
                >
                  <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-[#0c131a] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-slate-300">
                    <ShieldCheck size={14} className="text-cyan-400" />
                    Decreto 1072 &amp; Res. 0312
                  </div>
                  <h2 className="mb-4 text-5xl font-bold leading-[1.05] tracking-tighter text-white sm:text-6xl md:text-7xl md:leading-[1.1]">
                    Cumplimiento Legal.
                    <br />
                    <span className="bg-gradient-to-r from-slate-200 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
                      Sin Complicaciones.
                    </span>
                  </h2>
                  <p className="max-w-md text-[17px] font-medium leading-relaxed tracking-tight text-slate-400/90 sm:text-lg md:text-xl lg:text-2xl">
                    Automatiza las inspecciones y gestiona riesgos en tiempo real.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  );
};
