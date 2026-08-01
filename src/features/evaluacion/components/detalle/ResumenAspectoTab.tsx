import {
  BookOpenCheck,
  CalendarClock,
  ClipboardCheck,
  FileCheck2,
  FileText,
  Layers3,
  Route,
  ShieldCheck,
  Tag,
  UserRound,
  Wrench,
} from "lucide-react";

import type { DetalleAspectoResponse } from "../../types/detalle-aspecto.types";
import VigenciaBadge from "../matriz/VigenciaBadge";
import {
  BooleanCard,
  DetailSection,
  InfoCard,
} from "./DetalleAspectoUi";

const periodicityLabels: Record<string, string> = {
  DIA: "día(s)",
  SEMANA: "semana(s)",
  MES: "mes(es)",
  ANIO: "año(s)",
};

const baseDateLabels: Record<string, string> = {
  FECHA_DOCUMENTO: "Fecha de elaboración del documento",
  FECHA_ULTIMA_REVISION: "Fecha de la última revisión",
  FECHA_FIJA_CALENDARIO: "Fecha fija del calendario",
};

const sourceLabels: Record<string, string> = {
  NORMATIVA: "Definida por una norma",
  DIRECTRIZ_INTERNA: "Definida por directriz interna",
  CONFIGURACION_TECNICA: "Definida por configuración técnica",
};

function textOrFallback(
  value: string | null | undefined,
  fallback: string
) {
  return value?.trim() || fallback;
}

export default function ResumenAspectoTab({
  data,
}: {
  data: DetalleAspectoResponse;
}) {
  const task = data.tarea;
  const aspect = task.aspecto;
  const standard = aspect.estandar;
  const category = standard.categoriaEstandar;
  const cycle = category.cicloPhva;
  const validity = aspect.configuracionVigencia;
  const config = aspect.configuracion;
  const evidence = aspect.configuracionEvidencia;
  const review = aspect.configuracionRevision;
  const daily = aspect.configuracionTareaCotidiana;

  const periodicity =
    validity?.cantidad && validity.unidad
      ? `Cada ${validity.cantidad} ${
          periodicityLabels[validity.unidad] ?? validity.unidad
        }`
      : config?.esEvergreen
        ? "Seguimiento permanente"
        : "Periodicidad pendiente";

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-400">
          Estado actual del aspecto
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <h3 className="text-lg font-bold leading-7 text-white">
              {aspect.nombre}
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-400">
              Esta fila conecta el aspecto con el proceso{" "}
              <strong className="text-neutral-200">
                {task.proceso.nombre}
              </strong>
              . La configuración viene de la Supermatriz y la evaluación corresponde a la empresa seleccionada.
            </p>
          </div>
          <div className="shrink-0">
            <VigenciaBadge detalle={data.detalleVigencia} />
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Orden" value={String(task.orden)} />
          <InfoCard
            label="Código"
            value={task.codigo ?? aspect.codigo ?? `#${task.id}`}
          />
          <InfoCard
            label="Versión"
            value={task.versionSupermatriz.nombre}
          />
          <InfoCard
            label="Gestiones"
            value={
              task.categoriasGestion.map((item) => item.nombre).join(", ") ||
              "Sin categoría"
            }
          />
        </div>
      </section>

      <DetailSection
        icon={Route}
        title="Ruta dentro de la Supermatriz"
        description="Permite entender de dónde viene el aspecto y con qué proceso se ejecuta."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <InfoCard label="Ciclo PHVA" value={cycle.nombre} />
          <InfoCard label="Categoría" value={category.nombre} />
          <InfoCard label="Estándar" value={standard.nombre} />
          <InfoCard label="Aspecto" value={aspect.nombre} />
          <InfoCard label="Proceso" value={task.proceso.nombre} />
          <InfoCard
            label="Grupos ministeriales"
            value={
              standard.gruposMinisteriales.map((item) => item.nombre).join(", ") ||
              "Sin clasificación"
            }
          />
        </div>
      </DetailSection>

      <DetailSection
        icon={BookOpenCheck}
        title="Qué debe cumplir la empresa"
        description="Punto que se revisa y orientación práctica para alcanzar el cumplimiento."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <InfoCard
            label="Aspecto que se revisa"
            value={textOrFallback(
              aspect.descripcion,
              aspect.nombre
            )}
          />
          <InfoCard
            label="Plan de acción específico"
            accent
            value={textOrFallback(
              aspect.planAccionEspecifico?.descripcion,
              "No se definió un plan de acción."
            )}
          />
        </div>
      </DetailSection>

      <DetailSection
        icon={Wrench}
        title="Cómo se ejecuta"
        description="Guía operativa para el profesional que desarrolla o verifica la actividad."
      >
        <div className="grid gap-3 lg:grid-cols-2">
          <InfoCard
            label="Ejecución"
            accent
            value={textOrFallback(
              task.ejecucion,
              "No se registró una explicación de ejecución."
            )}
          />
          <InfoCard
            label="Fundamentos y soportes"
            value={textOrFallback(
              task.fundamentosSoportes,
              "No se registraron fundamentos ni soportes."
            )}
          />
          <InfoCard
            label="Responsable sugerido"
            value={
              <span className="flex items-start gap-2">
                <UserRound size={15} className="mt-1 shrink-0 text-cyan-400" />
                {textOrFallback(
                  task.responsableActividad,
                  "No definido"
                )}
              </span>
            }
          />
          <InfoCard
            label="Meta esperada"
            value={
              <span className="flex items-start gap-2">
                <ClipboardCheck size={15} className="mt-1 shrink-0 text-cyan-400" />
                {textOrFallback(task.metasEstandar, "No definida")}
              </span>
            }
          />
          <div className="lg:col-span-2">
            <InfoCard
              label="Recursos administrativos"
              value={
                <span className="flex items-start gap-2">
                  <Layers3 size={15} className="mt-1 shrink-0 text-cyan-400" />
                  {textOrFallback(
                    task.recursosAdministrativos,
                    "No registrados"
                  )}
                </span>
              }
            />
          </div>
        </div>
      </DetailSection>

      <DetailSection
        icon={CalendarClock}
        title="Reglas de seguimiento y vigencia"
        description="La periodicidad se administra en la Supermatriz; el profesional registra la fecha real del soporte."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <InfoCard label="Periodicidad" value={periodicity} />
          <InfoCard
            label="Fecha base"
            value={
              validity
                ? baseDateLabels[validity.tipoFechaBase] ??
                  validity.tipoFechaBase
                : "Sin configuración"
            }
          />
          <InfoCard
            label="Origen"
            value={
              validity
                ? sourceLabels[validity.fuentePeriodicidad] ??
                  validity.fuentePeriodicidad
                : "Sin configuración"
            }
          />
          <InfoCard
            label="Alerta previa"
            value={`${validity?.diasAlertaPrevia ?? 30} día(s) antes`}
          />
        </div>

        {validity?.descripcionRegla && (
          <div className="mt-3">
            <InfoCard
              label="Explicación de la regla"
              value={validity.descripcionRegla}
            />
          </div>
        )}

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <BooleanCard
            label="Seguimiento permanente (Evergreen)"
            value={Boolean(config?.esEvergreen)}
            detail={config?.bloqueEvergreen}
          />
          <BooleanCard
            label="Documento de actualización periódica"
            value={Boolean(config?.documentoActualizacionPeriodica)}
          />
          <BooleanCard
            label="Permite No aplica"
            value={Boolean(config?.permiteNoAplica)}
          />
          <BooleanCard
            label="Permite registrar fecha manual"
            value={Boolean(validity?.permiteFechaManual)}
          />
          <BooleanCard
            label="Incluir en informe de estado de tareas"
            value={Boolean(config?.incluirInformeEstadoTareas)}
          />
          <BooleanCard
            label="Visible al cliente por defecto"
            value={Boolean(evidence?.visibleClienteDefault)}
          />
        </div>
      </DetailSection>

      <DetailSection
        icon={ShieldCheck}
        title="Evidencia, revisión técnica y tareas cotidianas"
      >
        <div className="grid gap-3 lg:grid-cols-3">
          <InfoCard
            label="Evidencia"
            value={
              <span className="flex items-start gap-2">
                <FileCheck2 size={15} className="mt-1 shrink-0 text-cyan-400" />
                {evidence?.requiereEvidencia
                  ? evidence.descripcionEvidencia ||
                    "Se debe adjuntar evidencia."
                  : "No es obligatoria por configuración."}
              </span>
            }
          />
          <InfoCard
            label="Revisión técnica"
            value={
              <span className="flex items-start gap-2">
                <ShieldCheck size={15} className="mt-1 shrink-0 text-cyan-400" />
                {review?.requiereRevisionTecnica
                  ? review.observaciones ||
                    "Requiere validación técnica."
                  : "No requiere revisión técnica."}
              </span>
            }
          />
          <InfoCard
            label="Tarea cotidiana"
            value={
              daily
                ? `Objetivo: ${daily.cantidadObjetivo} ${
                    periodicityLabels[daily.unidad] ?? daily.unidad
                  }. ${daily.descripcion ?? ""}`
                : "No se gestiona como tarea cotidiana."
            }
          />
        </div>
      </DetailSection>

      <DetailSection
        icon={FileText}
        title="Normativa y búsqueda"
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-500">
              <Tag size={14} /> Palabras clave
            </p>
            <div className="flex flex-wrap gap-2">
              {aspect.palabrasClave.length > 0 ? (
                aspect.palabrasClave.map((item) => (
                  <span
                    key={item.id}
                    className="rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-xs text-neutral-300"
                  >
                    {item.nombre}
                  </span>
                ))
              ) : (
                <p className="text-sm text-neutral-600">
                  No hay palabras clave.
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
              Requisitos normativos
            </p>
            <div className="space-y-2">
              {aspect.requisitosNormativos.length > 0 ? (
                aspect.requisitosNormativos.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-neutral-800 bg-[#090a0b] p-3"
                  >
                    <p className="text-sm font-semibold text-white">
                      {item.norma}
                      {item.articulo ? ` · ${item.articulo}` : ""}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-neutral-500">
                      {item.descripcion || item.clave}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-neutral-600">
                  No hay requisitos normativos asociados.
                </p>
              )}
            </div>
          </div>
        </div>
      </DetailSection>
    </div>
  );
}
