import {
  CheckCircle2,
  Circle,
  Clock3,
} from "lucide-react";

import type { CompromisoDetalle } from "../../types/consulta-compromisos.types";

interface Props {
  compromiso: CompromisoDetalle;
}

export default function CompromisoRutaTrabajo({
  compromiso,
}: Props) {
  const pendientes = compromiso.responsables.filter(
    (responsable) =>
      responsable.estado === "ASIGNADA" &&
      responsable.actividad?.estado !== "ATENDIDA"
  );
  const solicitudPendiente =
    compromiso.solicitudesCierre.some(
      (solicitud) => solicitud.estado === "PENDIENTE"
    );

  const siguienteAccion = obtenerSiguienteAccion(
    compromiso,
    pendientes.map(
      (responsable) =>
        responsable.usuarioResponsable.nombre
    )
  );

  const pasos = [
    {
      numero: 1,
      titulo: "Completar actividades",
      detalle:
        compromiso.progreso.actividadesPendientes === 0
          ? "Todas las actividades activas están completas."
          : `${compromiso.progreso.actividadesPendientes} actividad(es) pendiente(s).`,
      completado:
        compromiso.progreso.actividadesTotal > 0 &&
        compromiso.progreso.actividadesPendientes === 0,
      actual:
        compromiso.progreso.actividadesPendientes > 0,
    },
    {
      numero: 2,
      titulo: "Registrar avances",
      detalle:
        compromiso.progreso.evidencias > 0 ||
        compromiso.seguimientos.length > 0
          ? "Hay avances o evidencias registrados."
          : "Agrega seguimiento y evidencia de soporte.",
      completado:
        compromiso.progreso.evidencias > 0 ||
        compromiso.seguimientos.length > 0,
      actual: false,
    },
    {
      numero: 3,
      titulo: "Recalificar el aspecto",
      detalle:
        compromiso.progreso.aspectoRecalificadoEnCinco
          ? "Existe una evaluación posterior en 5."
          : "Se requiere una evaluación posterior en 5.",
      completado:
        compromiso.progreso.aspectoRecalificadoEnCinco,
      actual:
        compromiso.progreso.actividadesPendientes === 0 &&
        !compromiso.progreso.aspectoRecalificadoEnCinco,
    },
    {
      numero: 4,
      titulo: "Revisar y cerrar",
      detalle:
        compromiso.estado === "CUMPLIDO"
          ? "El cierre fue aprobado."
          : solicitudPendiente
            ? "La solicitud está pendiente de revisión."
            : "Un supervisor diferente debe aprobar el cierre.",
      completado: compromiso.estado === "CUMPLIDO",
      actual:
        solicitudPendiente ||
        compromiso.progreso.listoParaSolicitarCierre,
    },
  ];

  return (
    <section className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm">
      <div className="rounded-xl border border-cyan-200 bg-cyan-50 p-4">
        <div className="flex items-start gap-3">
          <Clock3
            size={20}
            className="mt-0.5 shrink-0 text-cyan-700"
          />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-cyan-800">
              Siguiente acción
            </p>
            <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">
              {siguienteAccion}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {pasos.map((paso) => (
          <article
            key={paso.numero}
            className={`rounded-xl border p-4 ${
              paso.completado
                ? "border-emerald-200 bg-emerald-50"
                : paso.actual
                  ? "border-cyan-200 bg-cyan-50"
                  : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-2">
              {paso.completado ? (
                <CheckCircle2
                  size={17}
                  className="text-emerald-700"
                />
              ) : (
                <Circle
                  size={17}
                  className={
                    paso.actual
                      ? "text-cyan-700"
                      : "text-slate-400"
                  }
                />
              )}
              <p className="text-xs font-bold uppercase tracking-wide text-slate-600">
                Paso {paso.numero}
              </p>
            </div>
            <h2 className="mt-3 text-sm font-bold text-slate-950">
              {paso.titulo}
            </h2>
            <p className="mt-1 text-xs leading-5 text-slate-600">
              {paso.detalle}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function obtenerSiguienteAccion(
  compromiso: CompromisoDetalle,
  responsablesPendientes: string[]
): string {
  if (compromiso.estado === "CUMPLIDO") {
    return "El compromiso ya fue aprobado y cerrado formalmente.";
  }

  if (compromiso.estado === "SOLICITUD_DE_CIERRE") {
    return "La solicitud está lista para que un coordinador o administrador autorizado la revise.";
  }

  if (compromiso.estado === "PENDIENTE_DE_REASIGNACION") {
    return "Un coordinador o administrador debe reasignar la actividad rechazada.";
  }

  if (responsablesPendientes.length > 0) {
    return `${responsablesPendientes.join(", ")} debe completar su actividad. “Completar mi actividad” confirma únicamente esa tarea; no cierra el compromiso.`;
  }

  if (!compromiso.progreso.aspectoRecalificadoEnCinco) {
    return "Un profesional autorizado debe evaluar nuevamente este mismo aspecto y registrarlo con nota 5.";
  }

  return compromiso.operacion.esUsuarioCliente
    ? "Ya puedes solicitar que SIS revise el cierre del compromiso."
    : "El compromiso reúne los requisitos; ya puedes solicitar su cierre formal.";
}
