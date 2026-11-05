import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { MiniWorld } from "./officeScene";

/**
 * Portada inmersiva Stack44: solamente el mundo Three.js y acceso al sistema.
 * Se conservan dentro de la escena las pantallas físicas y las animaciones;
 * no se superponen textos, indicadores, rótulos ni controles de cámara.
 */
export default function OfficeHero() {
  const hostRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<MiniWorld | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("./officeScene")
      .then(({ mountOfficeScene }) => {
        if (cancelled || !hostRef.current) return;
        worldRef.current = mountOfficeScene(hostRef.current, () => {
          if (!cancelled) setUnavailable(true);
        });
        // La escena permanece girable y ampliable por gestos, sin botones UI.
        worldRef.current?.setInteractive(true);
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

  return (
    <section
      aria-label="Mundo interactivo 3D de Stack44"
      className="relative isolate h-[100svh] min-h-[520px] w-full overflow-hidden bg-[#f1eee7]"
    >
      <div
        ref={hostRef}
        role="img"
        aria-label="Maqueta interactiva Three.js con oficinas SG-SST, personajes sentados, ciudad y jardines"
        className="absolute inset-0 z-[1] select-none"
      />

      {unavailable && (
        <p role="status" className="sr-only">
          La representación 3D no está disponible en este navegador.
        </p>
      )}

      <Link
        to="/login"
        className="absolute right-4 top-5 z-20 inline-flex min-h-12 items-center justify-center rounded-full border border-white/45 bg-[#152b32]/95 px-6 text-sm font-semibold tracking-wide text-white shadow-[0_12px_40px_rgba(10,28,31,0.25)] backdrop-blur-xl transition-colors hover:bg-[#274b51] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600 sm:right-8 sm:top-8"
      >
        Iniciar sesión
      </Link>
    </section>
  );
}
