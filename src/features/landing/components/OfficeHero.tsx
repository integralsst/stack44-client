import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, Maximize2, Minus, Plus, RotateCcw, ShieldCheck, Sparkles, X } from "lucide-react";
import type { MiniWorld } from "./officeScene";
import type { SstModelStatus } from "./riggedSstTeam";

function ToolButton({
  label, onClick, children, disabled = false,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#132334]/90 text-white shadow-lg backdrop-blur-md transition-colors hover:border-cyan-300/50 hover:bg-[#204459] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300 disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11"
    >
      {children}
    </button>
  );
}

/** Hero V2 decorativo. No conecta agentes a servicios, credenciales ni IA. */
export default function OfficeHero() {
  const hostRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<MiniWorld | null>(null);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [exploring, setExploring] = useState(false);
  const [annexReady, setAnnexReady] = useState(false);
  const [officeFocus, setOfficeFocus] = useState<"main" | "annex">("main");
  const [modelsStatus, setModelsStatus] = useState<SstModelStatus>({
    phase: "loading", loaded: 0, total: 10, errorCount: 0,
  });

  useEffect(() => {
    let cancelled = false;

    import("./officeScene")
      .then(({ mountOfficeScene }) => {
        if (cancelled || !hostRef.current) return;
        worldRef.current = mountOfficeScene(hostRef.current, () => {
          if (!cancelled) setUnavailable(true);
        }, (status) => {
          if (!cancelled) setModelsStatus(status);
        }, (isReady) => {
          if (!cancelled) setAnnexReady(isReady);
        });
        if (worldRef.current) {
          worldRef.current.setInteractive(false);
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });

    return () => {
      cancelled = true;
      worldRef.current?.dispose();
      worldRef.current = null;
    };
  }, []);

  const toggleExploring = useCallback(() => {
    const next = !exploring;
    setExploring(next);
    worldRef.current?.setInteractive(next);
  }, [exploring]);

  const focusOffice = useCallback((office: "main" | "annex") => {
    worldRef.current?.focusOffice(office);
    setOfficeFocus(office);
  }, []);

  const resetView = useCallback(() => {
    worldRef.current?.reset();
  }, []);

  return (
    <section
      aria-label="Mundo de oficinas 3D de Stack44"
      className="relative isolate min-h-[660px] h-[100svh] max-h-[1060px] w-full overflow-hidden bg-[#f7faf8] md:min-h-[720px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_45%,#ffffff_4%,#f5faf8_56%,#e5f1ef_100%)]"
      />

      <div
        ref={hostRef}
        aria-label="Oficina tecnológica de seguridad y salud en el trabajo, con pantallas SG-SST, minifiguras, jardines, espacios abiertos y autos en movimiento"
        role="img"
        className="absolute inset-0 z-[1] select-none"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-36 bg-gradient-to-b from-white/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-56 bg-gradient-to-t from-[#f7faf8]/90 via-[#f7faf8]/20 to-transparent"
      />

      <div className="pointer-events-none absolute inset-0 z-[3] mx-auto flex max-w-[1480px] flex-col justify-between px-5 pb-28 pt-20 sm:px-10 md:pb-14 md:pt-28">
        <div className="w-fit rounded-full border border-emerald-700/15 bg-white/85 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.20em] text-slate-800 shadow-[0_12px_32px_rgba(30,90,90,0.08)] backdrop-blur-xl sm:text-xs">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500" />
          STACK44 <span className="mx-1 text-emerald-600/40">/</span> SG-SST
        </div>
        <div className="max-w-[460px] rounded-[28px] border border-white/70 bg-white/75 p-5 shadow-[0_24px_85px_rgba(28,70,80,0.11)] backdrop-blur-xl sm:p-7 md:bg-white/65">
          <p className="mb-3 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.20em] text-emerald-700 sm:text-[11px]">
            <ShieldCheck size={15} /> Gestión inteligente en SST
          </p>
          <h1 className="text-[30px] font-extrabold leading-[1.04] tracking-tight text-slate-950 sm:text-4xl md:text-[44px]">
            La prevención también tiene un mundo propio.
          </h1>
          <p className="mt-3 max-w-[370px] text-[13px] font-medium leading-relaxed text-slate-700 sm:text-[15px]">
            Explora oficinas, tecnología y personas trabajando por entornos más seguros.
          </p>
          <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
            Minifiguras 3D basadas en el trabajo de{" "}
            <a
              href="https://sketchfab.com/3d-models/lego-minifigure-rigged-42612b64a3004d3c97872c4c444f9544"
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto font-semibold underline underline-offset-2 hover:text-emerald-800"
            >
              Darth Iron
            </a>{" "}
            (CC BY 4.0), adaptadas para Stack44.
            {annexReady && (
              <>
                {" "}· Oficina 3D de{" "}
                <a
                  href="https://sketchfab.com/3d-models/isometric-office-d31464eed8044190911b221648aca432"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pointer-events-auto font-semibold underline underline-offset-2 hover:text-emerald-800"
                >
                  Companion_Cube
                </a>{" "}(CC BY 4.0).
              </>
            )}
          </p>
        </div>
      </div>

      {!ready && (
        <div
          role="status"
          className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center px-6"
        >
          <div className="rounded-2xl border border-emerald-600/10 bg-white/90 px-6 py-5 text-center shadow-2xl backdrop-blur-xl">
            <Sparkles className="mx-auto mb-2 text-emerald-700" size={25} />
            <p className="text-sm font-semibold text-slate-900">
              {unavailable ? "El modo 3D no está disponible en este navegador" : "Preparando el mundo 3D"}
            </p>
            {unavailable && (
              <p className="mt-2 text-xs text-slate-600">Puedes seguir explorando el resto de Stack44.</p>
            )}
          </div>
        </div>
      )}

      <a
        href="#comparativa"
        className="absolute right-5 top-20 z-[5] inline-flex min-h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-4 text-[11px] font-bold text-slate-700 shadow-sm backdrop-blur-xl transition-colors hover:border-emerald-500/30 hover:text-emerald-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600 sm:right-10 md:top-28"
      >
        Continuar <ArrowDown size={14} />
      </a>

      {ready && (
        <div
          role="status"
          aria-live="polite"
          className="absolute left-5 top-36 z-[5] max-w-[calc(100%-40px)] rounded-xl border border-slate-200/90 bg-white/90 px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-sm backdrop-blur-xl sm:left-10 md:top-40"
        >
          {modelsStatus.phase === "loading" && (
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
              Cargando minifiguras 3D reales…
            </span>
          )}
          {modelsStatus.phase === "ready" && (
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {modelsStatus.loaded} minifiguras GLB cargadas
            </span>
          )}
          {modelsStatus.phase === "partial" && (
            <span className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              {modelsStatus.loaded} de {modelsStatus.total} minifiguras GLB cargadas
            </span>
          )}
          {modelsStatus.phase === "error" && (
            <span className="inline-flex items-center gap-2 text-red-700">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Error al cargar GLB: mostrando respaldo 3D
            </span>
          )}
        </div>
      )}

      {ready && (
        <>
          {exploring && (
            <div className="pointer-events-none absolute left-1/2 top-36 z-[4] -translate-x-1/2 rounded-full border border-emerald-700/15 bg-white/90 px-4 py-2 text-center text-[11px] font-medium text-slate-800 shadow-lg backdrop-blur-xl sm:top-28">
              Arrastra para girar · Pellizca para acercarte · Desliza para bajar
            </div>
          )}
          {annexReady && (
            <div className="absolute bottom-[84px] left-1/2 z-[5] flex -translate-x-1/2 items-center gap-1 rounded-2xl border border-slate-200 bg-white/90 p-1 shadow-lg backdrop-blur-xl">
                <button type="button" onClick={() => focusOffice("main")}
                  aria-pressed={officeFocus === "main"}
                  className={`rounded-xl px-3 py-2 text-[11px] font-semibold ${officeFocus === "main" ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
                  Oficina 1
                </button>
                <button type="button" onClick={() => focusOffice("annex")}
                  aria-pressed={officeFocus === "annex"}
                  className={`rounded-xl px-3 py-2 text-[11px] font-semibold ${officeFocus === "annex" ? "bg-slate-800 text-white" : "text-slate-700 hover:bg-slate-100"}`}>
                  Oficina 2
                </button>
            </div>
          )}
          <div className="absolute bottom-5 left-4 right-4 z-[5] flex items-end justify-between gap-2 sm:bottom-7 sm:left-8 sm:right-8">
            <button
              type="button"
              onClick={toggleExploring}
              aria-pressed={exploring}
              className="flex min-h-11 items-center gap-2 rounded-2xl border border-cyan-200/20 bg-[#0c2b3d]/90 px-4 py-3 text-[12px] font-bold text-cyan-50 shadow-lg backdrop-blur-xl transition-colors hover:border-cyan-200/50 hover:bg-[#154053] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
            >
              {exploring ? <X size={16} /> : <Maximize2 size={16} />}
              {exploring ? "Salir de exploración" : "Explorar mundo"}
            </button>

            <div className="flex items-center gap-1.5 rounded-2xl border border-white/10 bg-[#0c2231]/80 p-1.5 shadow-xl backdrop-blur-xl">
              <ToolButton label="Alejar cámara" onClick={() => worldRef.current?.zoomOut()}>
                <Minus size={18} />
              </ToolButton>
              <ToolButton label="Restablecer cámara" onClick={resetView}>
                <RotateCcw size={16} />
              </ToolButton>
              <ToolButton label="Acercar cámara" onClick={() => worldRef.current?.zoomIn()}>
                <Plus size={18} />
              </ToolButton>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
