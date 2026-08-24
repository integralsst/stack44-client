import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  RefreshCw,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Link,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../auth/context/AuthContext";
import { obtenerAccionesDestacadas } from "../api/centro-acciones.api";
import type {
  AccionDestacada,
  AccionesDestacadasResponse,
} from "../types/centro-acciones.types";

const ACTUALIZACION_MS = 60_000;

interface Props {
  onTotalChange?: (total: number) => void;
}

export default function CentroAlertasAcciones({
  onTotalChange,
}: Props) {
  const { token } = useAuth();
  const location = useLocation();
  const contenedorRef = useRef<HTMLDivElement>(null);
  const [abierto, setAbierto] = useState(false);
  const [data, setData] =
    useState<AccionesDestacadasResponse | null>(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    if (!token) return;

    setCargando(true);
    setError(null);

    try {
      const response = await obtenerAccionesDestacadas(token);
      setData(response);
      onTotalChange?.(response.resumen.total);
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : "No fue posible consultar tus acciones pendientes."
      );
    } finally {
      setCargando(false);
    }
  }, [onTotalChange, token]);

  useEffect(() => {
    void cargar();

    const interval = window.setInterval(
      () => void cargar(),
      ACTUALIZACION_MS
    );

    return () => window.clearInterval(interval);
  }, [cargar, location.key]);

  useEffect(() => {
    const actualizar = () => void cargar();
    const actualizarAlVolver = () => {
      if (document.visibilityState === "visible") {
        void cargar();
      }
    };

    window.addEventListener("focus", actualizar);
    document.addEventListener(
      "visibilitychange",
      actualizarAlVolver
    );

    return () => {
      window.removeEventListener("focus", actualizar);
      document.removeEventListener(
        "visibilitychange",
        actualizarAlVolver
      );
    };
  }, [cargar]);

  useEffect(() => {
    const cerrarFuera = (event: PointerEvent) => {
      if (
        abierto &&
        contenedorRef.current &&
        !contenedorRef.current.contains(
          event.target as Node
        )
      ) {
        setAbierto(false);
      }
    };

    document.addEventListener("pointerdown", cerrarFuera);

    return () =>
      document.removeEventListener(
        "pointerdown",
        cerrarFuera
      );
  }, [abierto]);

  const total = data?.resumen.total ?? 0;
  const urgentes = data?.resumen.urgentes ?? 0;

  return (
    <div className="relative" ref={contenedorRef}>
      <button
        type="button"
        onClick={() => {
          const siguiente = !abierto;
          setAbierto(siguiente);

          if (siguiente) {
            void cargar();
          }
        }}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 hover:text-cyan-700"
        aria-label={
          total > 0
            ? `Abrir acciones pendientes: ${total}`
            : "Abrir centro de acciones"
        }
        aria-expanded={abierto}
        title="Pendientes y siguientes acciones"
      >
        <Bell size={18} />
        {total > 0 && (
          <span
            className={`absolute -right-1.5 -top-1.5 flex min-h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white ring-2 ring-white ${
              urgentes > 0
                ? "bg-red-600"
                : "bg-cyan-600"
            }`}
          >
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {abierto && (
        <section className="fixed inset-x-3 top-[4.5rem] z-[100] max-h-[min(72vh,42rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-[min(92vw,28rem)]">
          <div className="flex items-start justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div>
              <p className="text-sm font-bold text-slate-950">
                Siguientes acciones
              </p>
              <p className="mt-0.5 text-xs text-slate-600">
                Solo aparecen eventos que requieren una acción concreta de tu rol.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void cargar()}
              disabled={cargando}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:text-cyan-700 disabled:opacity-50"
              aria-label="Actualizar acciones"
              title="Actualizar"
            >
              <RefreshCw
                size={16}
                className={cargando ? "animate-spin" : ""}
              />
            </button>
          </div>

          <div className="max-h-[calc(min(72vh,42rem)-4.5rem)] overflow-y-auto p-3">
            {error && (
              <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-3 text-xs leading-5 text-red-800">
                {error}
              </div>
            )}

            {!cargando &&
              !error &&
              (data?.alertas.length ?? 0) === 0 && (
                <div className="px-4 py-9 text-center">
                  <CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" />
                  <p className="mt-3 text-sm font-bold text-slate-900">
                    Todo al día
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    No tienes acciones pendientes en este momento.
                  </p>
                </div>
              )}

            <div className="space-y-2">
              {data?.alertas.map((alerta) => (
                <AlertaItem
                  key={alerta.id}
                  alerta={alerta}
                  onOpen={() => setAbierto(false)}
                />
              ))}
            </div>

            {data && data.resumen.total > data.alertas.length && (
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-center text-xs text-slate-600">
                Se muestran las {data.alertas.length} acciones más prioritarias de {data.resumen.total}.
              </p>
            )}

            <Link
              to="/dashboard/acciones"
              onClick={() => setAbierto(false)}
              className="mt-3 flex min-h-10 w-full items-center justify-center rounded-xl border border-cyan-200 bg-cyan-50 px-4 py-2 text-xs font-extrabold text-cyan-800 transition hover:border-cyan-300 hover:bg-cyan-100"
            >
              Ver todas las acciones
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}

function AlertaItem({
  alerta,
  onOpen,
}: {
  alerta: AccionDestacada;
  onOpen: () => void;
}) {
  const configuracion = {
    ALTA: {
      icon: AlertTriangle,
      wrapper: "border-red-200 bg-red-50",
      iconBox: "bg-red-100 text-red-700",
      badge: "bg-red-100 text-red-800",
      label: "Urgente",
    },
    MEDIA: {
      icon: Clock3,
      wrapper: "border-amber-200 bg-amber-50",
      iconBox: "bg-amber-100 text-amber-700",
      badge: "bg-amber-100 text-amber-800",
      label: "Pendiente",
    },
    BAJA: {
      icon: Bell,
      wrapper: "border-cyan-200 bg-cyan-50",
      iconBox: "bg-cyan-100 text-cyan-700",
      badge: "bg-cyan-100 text-cyan-800",
      label: "Próximo",
    },
  }[alerta.nivel];
  const Icon = configuracion.icon;

  return (
    <article
      className={`rounded-xl border p-3 ${configuracion.wrapper}`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${configuracion.iconBox}`}
        >
          <Icon size={16} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold leading-5 text-slate-950">
              {alerta.titulo}
            </p>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${configuracion.badge}`}
            >
              {configuracion.label}
            </span>
          </div>
          <p className="mt-1 text-xs leading-5 text-slate-700">
            {alerta.descripcion}
          </p>
          <Link
            to={alerta.accion.ruta}
            onClick={onOpen}
            className="mt-3 inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-950 !bg-slate-950 px-4 py-2 text-xs font-extrabold !text-white shadow-sm transition hover:!border-cyan-700 hover:!bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-600 focus:ring-offset-2"
            style={{
              backgroundColor: "#020617",
              color: "#ffffff",
            }}
          >
            <span className="!text-white">
              {alerta.accion.etiqueta}
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
