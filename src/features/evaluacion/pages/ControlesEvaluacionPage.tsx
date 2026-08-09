import {
  ArrowLeft,
  ClipboardCheck,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";

import type { ContextoEvaluacionResponse } from "../../../types/evaluacion.types";
import { useAuth } from "../../auth/context/AuthContext";
import { obtenerContextoEvaluacion } from "../api/evaluacion.api";
import AprobacionesGestionPanel from "../components/aprobaciones/AprobacionesGestionPanel";
import NoAplicaPeriodoPanel from "../components/no-aplica/NoAplicaPeriodoPanel";
import { useControlesEvaluacion } from "../hooks/useControlesEvaluacion";

type TabControl = "no-aplica" | "aprobaciones";

type ResultadoContexto = {
  key: string;
  contexto: ContextoEvaluacionResponse | null;
  error: string | null;
};

export default function ControlesEvaluacionPage() {
  const { empresaId } = useParams<{ empresaId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { token, hasRole } = useAuth();
  const anioParam = Number(searchParams.get("anio"));
  const anio =
    Number.isInteger(anioParam) && anioParam >= 2000 && anioParam <= 2100
      ? anioParam
      : new Date().getFullYear();
  const tab: TabControl =
    searchParams.get("tab") === "aprobaciones"
      ? "aprobaciones"
      : "no-aplica";
  const requestKey = `${empresaId ?? "sin-empresa"}:${anio}:${token ?? "sin-token"}`;

  const [resultadoContexto, setResultadoContexto] =
    useState<ResultadoContexto | null>(null);

  useEffect(() => {
    if (!empresaId || !token) return;

    let active = true;
    const keyActual = requestKey;

    obtenerContextoEvaluacion(empresaId, anio, token)
      .then((data) => {
        if (!active) return;

        setResultadoContexto({
          key: keyActual,
          contexto: data,
          error: null,
        });
      })
      .catch((error) => {
        if (!active) return;

        setResultadoContexto({
          key: keyActual,
          contexto: null,
          error:
            error instanceof Error
              ? error.message
              : "No fue posible consultar la empresa.",
        });
      });

    return () => {
      active = false;
    };
  }, [anio, empresaId, requestKey, token]);

  const resultadoActual =
    resultadoContexto?.key === requestKey
      ? resultadoContexto
      : null;
  const contexto = resultadoActual?.contexto ?? null;
  const errorContexto = resultadoActual?.error ?? null;
  const cargandoContexto =
    Boolean(empresaId && token) && !resultadoActual;

  const controles = useControlesEvaluacion(
    contexto?.periodo?.id ?? null,
    Boolean(contexto?.periodo)
  );

  const cambiarTab = (next: TabControl) => {
    const params = new URLSearchParams(searchParams);
    params.set("anio", String(anio));
    params.set("tab", next);
    setSearchParams(params, { replace: true });
  };

  const volver = () => {
    if (!empresaId) return navigate("/dashboard/empresas");
    navigate(
      `/dashboard/empresas/${empresaId}/evaluacion?anio=${anio}`
    );
  };

  const puedeVerNoAplica = hasRole(
    "PROFESSIONAL",
    "COORDINATOR",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );
  const puedeVerAprobaciones = hasRole(
    "PROFESSIONAL",
    "COORDINATOR",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );

  if (cargandoContexto) {
    return (
      <div className="flex min-h-72 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  if (!contexto || errorContexto) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-100">
        <p className="font-bold">No fue posible abrir los controles</p>
        <p className="mt-1 text-sm">
          {errorContexto ?? "La empresa no está disponible."}
        </p>
        <button
          type="button"
          onClick={volver}
          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-bold text-black"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-col gap-4 pb-6">
      <header className="rounded-2xl border border-neutral-800 bg-[#101112] p-4 shadow-xl">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={volver}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-700 bg-[#08090a] text-neutral-300 hover:border-cyan-500/40 hover:text-cyan-200"
              aria-label="Volver a evaluación"
            >
              <ArrowLeft size={17} />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">
                Controles de evaluación
              </p>
              <h1 className="mt-1 text-xl font-bold text-white">
                {contexto.empresa.nombre}
              </h1>
              <p className="mt-1 text-xs text-neutral-500">
                Periodo {anio} · decisiones posteriores a gestiones finalizadas
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={
              controles.cargando || Boolean(controles.procesando)
            }
            onClick={() => void controles.recargar()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-[#08090a] px-4 py-2.5 text-sm font-semibold text-neutral-300 hover:border-cyan-500/40 hover:text-cyan-200 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={controles.cargando ? "animate-spin" : ""}
            />
            Actualizar
          </button>
        </div>
      </header>

      {!contexto.periodo ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-amber-100">
          El periodo {anio} todavía no está abierto. Abre el periodo desde
          Evaluación antes de usar estos controles.
        </div>
      ) : (
        <>
          <div className="grid gap-2 rounded-2xl border border-neutral-800 bg-[#101112] p-2 sm:grid-cols-2">
            {puedeVerNoAplica && (
              <button
                type="button"
                onClick={() => cambiarTab("no-aplica")}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                  tab === "no-aplica"
                    ? "bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-500/30"
                    : "bg-[#08090a] text-neutral-300 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2 font-bold">
                  <ClipboardCheck size={17} />
                  No aplica
                </span>
                <span className="rounded-full bg-black/20 px-2 py-1 text-xs font-bold">
                  {controles.noAplica?.resumen.pendientes ?? 0}
                </span>
              </button>
            )}

            {puedeVerAprobaciones && (
              <button
                type="button"
                onClick={() => cambiarTab("aprobaciones")}
                className={`flex items-center justify-between rounded-xl px-4 py-3 text-left transition ${
                  tab === "aprobaciones"
                    ? "bg-cyan-500/15 text-cyan-100 ring-1 ring-cyan-500/30"
                    : "bg-[#08090a] text-neutral-300 hover:text-white"
                }`}
              >
                <span className="flex items-center gap-2 font-bold">
                  <ShieldCheck size={17} />
                  Aprobaciones de gestión
                </span>
                <span className="rounded-full bg-black/20 px-2 py-1 text-xs font-bold">
                  {controles.aprobaciones?.resumen.pendientes ?? 0}
                </span>
              </button>
            )}
          </div>

          {controles.error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {controles.error}
            </div>
          )}

          {tab === "no-aplica" ? (
            <NoAplicaPeriodoPanel
              data={controles.noAplica}
              cargando={controles.cargando}
              procesando={controles.procesando}
              onDecide={controles.decidirSolicitudNoAplica}
            />
          ) : (
            <AprobacionesGestionPanel
              data={controles.aprobaciones}
              cargando={controles.cargando}
              procesando={controles.procesando}
              onDecide={controles.decidirGestion}
            />
          )}
        </>
      )}
    </div>
  );
}
