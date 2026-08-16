import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";

import { useAuth } from "../../auth/context/AuthContext";
import { obtenerAuditoria } from "../api/auditorias.api";
import type { AuditoriaDetalle } from "../types/auditorias.types";
import AuditoriaDetallePage from "./AuditoriaDetallePage";

const AUDITORIA_UPDATED_EVENT = "stack44:auditoria-updated";

export default function AuditoriaDetalleGovernancePage() {
  const { auditoriaId = "" } = useParams<{ auditoriaId: string }>();
  const { token, hasRole } = useAuth();
  const puedeGobernar = hasRole(
    "COORDINATOR",
    "ADMIN",
    "OWNER",
    "SUPERADMIN"
  );

  const [auditoria, setAuditoria] = useState<AuditoriaDetalle | null>(null);

  const cargar = useCallback(async () => {
    if (!token || !auditoriaId) return;
    try {
      setAuditoria(await obtenerAuditoria(token, auditoriaId));
    } catch {
      // La pantalla de detalle conserva su propio manejo de error.
    }
  }, [auditoriaId, token]);

  useEffect(() => {
    void cargar();

    const actualizar = () => void cargar();
    window.addEventListener(AUDITORIA_UPDATED_EVENT, actualizar);
    return () => window.removeEventListener(AUDITORIA_UPDATED_EVENT, actualizar);
  }, [cargar]);

  const pendientes = useMemo(
    () =>
      auditoria?.hallazgos.filter(
        (item) => item.estado === "ABIERTO" || item.estado === "EN_GESTION"
      ).length ?? 0,
    [auditoria]
  );

  const tieneHallazgos = Boolean(auditoria && auditoria.hallazgos.length > 0);
  const ejecucionCompleta =
    auditoria?.estado === "EN_EJECUCION" || auditoria?.estado === "FINALIZADA";
  const seguimientoCompleto = Boolean(
    auditoria &&
      ((auditoria.estado === "EN_EJECUCION" && tieneHallazgos && pendientes === 0) ||
        (auditoria.estado === "FINALIZADA" &&
          (auditoria.hallazgos.length === 0 || pendientes === 0)))
  );
  const cierreCompleto = auditoria?.estado === "FINALIZADA";

  const descripcionSeguimiento = useMemo(() => {
    if (!auditoria) return "Pendiente";
    if (auditoria.estado === "BORRADOR") return "Pendiente de ejecución";
    if (auditoria.hallazgos.length === 0) {
      return auditoria.estado === "FINALIZADA"
        ? "Sin hallazgos"
        : "Revisión en curso";
    }
    return pendientes === 0
      ? "Sin pendientes operativos"
      : `${pendientes} pendiente(s)`;
  }, [auditoria, pendientes]);

  const mensaje = useMemo(() => {
    if (!auditoria) return null;

    if (auditoria.estado === "FINALIZADA") {
      return {
        titulo: "Auditoría finalizada",
        descripcion:
          "El ejercicio auditor quedó formalizado como registro histórico. Los seguimientos posteriores conservan su trazabilidad sin reescribir el contenido auditado.",
        tono: "emerald" as const,
      };
    }

    if (auditoria.estado === "CANCELADA") {
      return {
        titulo: "Auditoría cancelada",
        descripcion:
          "El registro se conserva como histórico, pero ya no admite nuevas actuaciones operativas.",
        tono: "slate" as const,
      };
    }

    if (auditoria.estado === "BORRADOR") {
      return {
        titulo: "Auditoría preparada para iniciar",
        descripcion:
          "Revisa objetivo, alcance y periodo. Los hallazgos se habilitarán cuando coordinación o administración inicie formalmente la auditoría.",
        tono: "cyan" as const,
      };
    }

    if (!puedeGobernar) {
      return {
        titulo: "Participación operativa en la auditoría",
        descripcion:
          "Puedes gestionar hallazgos, recomendaciones y seguimientos asignados. El inicio, cierre o cancelación global de la auditoría corresponde a coordinación o administración.",
        tono: "cyan" as const,
      };
    }

    if (auditoria.hallazgos.length === 0) {
      return {
        titulo: "Auditoría en ejecución",
        descripcion:
          "Continúa la revisión del alcance y registra los hallazgos encontrados. Si la revisión concluye sin hallazgos, podrás finalizar la auditoría mediante confirmación.",
        tono: "cyan" as const,
      };
    }

    if (pendientes === 0) {
      return {
        titulo: "Auditoría lista para finalizar",
        descripcion:
          "No quedan hallazgos operativos pendientes. Revisa la trazabilidad y formaliza el cierre desde el botón “Finalizar auditoría”.",
        tono: "emerald" as const,
      };
    }

    return {
      titulo: `${pendientes} hallazgo(s) continúan en seguimiento`,
      descripcion:
        "Resuelve o cierra los hallazgos operativos pendientes antes de formalizar el cierre de la auditoría. La trazabilidad registrada se conservará durante todo el proceso.",
      tono: "amber" as const,
    };
  }, [auditoria, pendientes, puedeGobernar]);

  const clasesDetalle = [
    !puedeGobernar ? "auditoria-participacion-operativa" : "",
    auditoria?.estado === "BORRADOR" ? "auditoria-en-preparacion" : "",
    auditoria?.estado === "EN_EJECUCION" && pendientes > 0
      ? "auditoria-con-pendientes"
      : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-4">
      {auditoria && mensaje && (
        <section className="mx-auto w-full max-w-6xl rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            <Paso numero="1" titulo="Preparación" descripcion="Auditoría creada" completo />
            <Paso
              numero="2"
              titulo="Ejecución"
              descripcion={ejecucionCompleta ? "Auditoría iniciada" : "Pendiente de iniciar"}
              completo={Boolean(ejecucionCompleta)}
            />
            <Paso
              numero="3"
              titulo="Hallazgos y seguimiento"
              descripcion={descripcionSeguimiento}
              completo={seguimientoCompleto}
            />
            <Paso
              numero="4"
              titulo="Cierre"
              descripcion={cierreCompleto ? "Formalizado" : "Pendiente"}
              completo={Boolean(cierreCompleto)}
            />
          </div>

          <div className={`mt-3 rounded-2xl border px-4 py-3 ${tono(mensaje.tono)}`}>
            <p className="text-sm font-black text-slate-950">{mensaje.titulo}</p>
            <p className="mt-1 text-xs leading-5 text-slate-600">{mensaje.descripcion}</p>
          </div>
        </section>
      )}

      {!puedeGobernar && (
        <style>{`
          .auditoria-participacion-operativa > section > header > div:first-child > div:last-child {
            display: none !important;
          }
        `}</style>
      )}

      {auditoria?.estado === "BORRADOR" && (
        <style>{`
          .auditoria-en-preparacion > section > div.flex.items-center.justify-between.gap-3,
          .auditoria-en-preparacion > section > div.flex.items-center.justify-between.gap-3 + div {
            display: none !important;
          }
        `}</style>
      )}

      {auditoria?.estado === "EN_EJECUCION" && pendientes > 0 && puedeGobernar && (
        <style>{`
          .auditoria-con-pendientes > section > header > div:first-child > div:last-child > button:first-child {
            display: none !important;
          }
        `}</style>
      )}

      <div className={clasesDetalle || undefined}>
        <AuditoriaDetallePage />
      </div>
    </div>
  );
}

function Paso({
  numero,
  titulo,
  descripcion,
  completo,
}: {
  numero: string;
  titulo: string;
  descripcion: string;
  completo: boolean;
}) {
  return (
    <div
      className={`rounded-xl border px-3 py-3 ${
        completo
          ? "border-emerald-200 bg-emerald-50"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
            completo
              ? "bg-emerald-100 text-emerald-800"
              : "bg-slate-200 text-slate-600"
          }`}
        >
          {numero}
        </span>
        <p className="text-xs font-black text-slate-900">{titulo}</p>
      </div>
      <p
        className={`mt-2 text-[10px] font-bold ${
          completo ? "text-emerald-700" : "text-slate-500"
        }`}
      >
        {descripcion}
      </p>
    </div>
  );
}

function tono(value: "emerald" | "cyan" | "amber" | "slate") {
  if (value === "emerald") return "border-emerald-200 bg-emerald-50";
  if (value === "amber") return "border-amber-200 bg-amber-50";
  if (value === "slate") return "border-slate-200 bg-slate-50";
  return "border-cyan-200 bg-cyan-50";
}
