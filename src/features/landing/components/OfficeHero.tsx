import { useCallback, useEffect, useRef, useState } from "react";
import { Maximize2, Minus, Plus, RotateCcw, Sparkles, X } from "lucide-react";
import type { MiniWorld } from "./officeScene";

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

  useEffect(() => {
    let cancelled = false;

    import("./officeScene")
      .then(({ mountOfficeScene }) => {
        if (cancelled || !hostRef.current) return;
        worldRef.current = mountOfficeScene(hostRef.current, () => {
          if (!cancelled) setUnavailable(true);
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

  const resetView = useCallback(() => {
    worldRef.current?.reset();
  }, []);

  return (
    <section
      aria-label="Mundo de oficinas 3D de Stack44"
      className="relative isolate min-h-[660px] h-[100svh] max-h-[1060px] w-full overflow-hidden bg-[#07121c] md:min-h-[720px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_52%,#1a3949_0%,#0d2030_46%,#07121c_87%)]"
      />

      <div
        ref={hostRef}
        aria-label="Maqueta tridimensional interactiva: una oficina corporativa con recepción, sala de juntas, puestos de trabajo, cafetería, calle y autos en movimiento"
        role="img"
        className="absolute inset-0 z-[1] select-none"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-44 bg-gradient-to-b from-[#07121c]/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-44 bg-gradient-to-t from-[#07121c]/80 via-[#07121c]/35 to-transparent"
      />

      <div className="pointer-events-none absolute inset-0 z-[3] mx-auto flex max-w-[1480px] flex-col justify-between px-5 pb-24 pt-20 sm:px-10 md:pb-12 md:pt-28">
        <div className="w-fit rounded-full border border-cyan-200/15 bg-[#0a2535]/70 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-cyan-100/90 shadow-xl backdrop-blur-xl sm:text-xs">
          <span className="mr-2 inline-block h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_11px_rgba(77,229,241,0.9)]" />
          STACK44 <span className="mx-1 text-cyan-300/40">/</span> Un mundo en movimiento
        </div>
        <div className="max-w-[460px]">
          <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.31em] text-cyan-200/80 sm:text-[11px]">
            Explora cada rincón
          </p>
          <h1 className="text-[30px] font-extrabold leading-[1.02] tracking-tight text-white drop-shadow-[0_7px_24px_rgba(0,0,0,0.8)] sm:text-4xl md:text-[44px]">
            Bienvenido a un mundo de ideas.
          </h1>
          <p className="mt-3 max-w-[370px] text-[13px] font-medium leading-relaxed text-slate-200/85 sm:text-[15px]">
            Un pequeño universo donde cada personaje tiene una tarea.
          </p>
        </div>
      </div>

      {!ready && (
        <div
          role="status"
          className="pointer-events-none absolute inset-0 z-[4] flex items-center justify-center px-6"
        >
          <div className="rounded-2xl border border-white/10 bg-[#0a2535]/85 px-6 py-5 text-center shadow-2xl backdrop-blur-xl">
            <Sparkles className="mx-auto mb-2 text-cyan-300" size={25} />
            <p className="text-sm font-semibold text-white">
              {unavailable ? "El modo 3D no está disponible en este navegador" : "Preparando el mundo 3D"}
            </p>
            {unavailable && (
              <p className="mt-2 text-xs text-slate-300">Puedes seguir explorando el resto de Stack44.</p>
            )}
          </div>
        </div>
      )}

      {ready && (
        <>
          {exploring && (
            <div className="pointer-events-none absolute left-1/2 top-24 z-[4] -translate-x-1/2 rounded-full border border-cyan-300/25 bg-[#0b2738]/80 px-4 py-2 text-center text-[11px] font-medium text-cyan-100 backdrop-blur-xl sm:top-28">
              Arrastra para girar · Pellizca o usa la rueda para acercarte
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
