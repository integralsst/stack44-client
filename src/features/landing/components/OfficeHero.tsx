import { useEffect, useRef, useState } from "react";
import { ChevronDown, Sparkles } from "lucide-react";

/**
 * Solo una experiencia visual: los personajes no ejecutan tareas reales,
 * no están conectados a servicios ni reciben instrucciones.
 */
export default function OfficeHero() {
  const sceneHostRef = useRef<HTMLDivElement>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let disposeScene: (() => void) | undefined;

    // Three.js queda fuera del bundle inicial del resto de la plataforma.
    import("./officeScene")
      .then(({ mountOfficeScene }) => {
        if (cancelled || !sceneHostRef.current) return;
        disposeScene = mountOfficeScene(sceneHostRef.current, () => {
          if (!cancelled) setUnavailable(true);
        });
      })
      .catch(() => {
        if (!cancelled) setUnavailable(true);
      });

    return () => {
      cancelled = true;
      disposeScene?.();
    };
  }, []);

  return (
    <section
      aria-label="Oficina 3D animada de agentes virtuales de Stack44"
      className="relative isolate h-[100svh] min-h-[590px] max-h-[1020px] w-full overflow-hidden bg-[#05080a] md:min-h-[690px]"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_40%,#133748_0%,#081723_42%,#05080a_82%)]"
      />
      <div
        ref={sceneHostRef}
        role="img"
        aria-label="Oficina tridimensional con cinco figuras de bloques que trabajan, caminan, escriben y presentan tareas"
        className="absolute inset-0 z-[1] overflow-hidden"
      />
      {unavailable && (
        <div
          role="status"
          className="absolute inset-0 z-[2] flex items-center justify-center px-8 text-center"
        >
          <div className="max-w-sm rounded-3xl border border-cyan-400/15 bg-slate-950/70 p-8 shadow-2xl">
            <Sparkles className="mx-auto mb-4 text-cyan-300" size={32} />
            <p className="text-xl font-bold text-white">Oficina de agentes virtuales</p>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              La vista 3D no está disponible en este navegador.
            </p>
          </div>
        </div>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[37%] bg-gradient-to-t from-[#05080a] via-[#05080a]/30 to-transparent"
      />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] h-44 bg-gradient-to-b from-[#05080a]/55 to-transparent" />

      <div className="pointer-events-none absolute inset-0 z-[3] mx-auto flex max-w-7xl flex-col justify-between px-6 pb-12 pt-20 sm:px-10 md:pb-16 md:pt-28">
        <div className="self-start rounded-full border border-cyan-400/25 bg-[#0b2330]/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-200 backdrop-blur-lg sm:text-xs">
          <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
          Stack44 · Oficina virtual
        </div>

        <div className="max-w-xl">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.32em] text-cyan-300/80 sm:text-xs">
            Una demostración visual
          </p>
          <h1 className="max-w-[20ch] text-3xl font-black leading-[1.05] tracking-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] sm:text-4xl md:text-5xl">
            Pequeños agentes. Grandes ideas.
          </h1>
          <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-slate-300/90 sm:text-base">
            Una oficina animada donde cada personaje tiene su propio movimiento.
          </p>
        </div>
      </div>
      <a
        href="#comparativa"
        aria-label="Desplazarse a la siguiente sección"
        className="absolute bottom-5 right-6 z-[4] flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/50 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-200 backdrop-blur-md transition-colors hover:border-cyan-300/40 hover:text-cyan-200 md:bottom-8 md:right-10"
      >
        Explorar <ChevronDown size={14} />
      </a>
    </section>
  );
}
