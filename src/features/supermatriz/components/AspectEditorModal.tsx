import {
  CalendarClock,
  CheckCircle2,
  FileCheck2,
  FileText,
  Loader2,
  Settings2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import AppModal from "../../../components/ui/AppModal";
import AppSelect from "../../../components/ui/AppSelect";

import type {
  ApprovalRulePayload,
  AspectCatalog,
  AspectPayload,
  BaseDateType,
  EvergreenBlock,
  ManagementMode,
  MatrixCatalogs,
  PeriodicitySource,
  PeriodicityUnit,
  RecordStatus,
  RequirementPayload,
} from "../types/supermatriz.types";

interface Props {
  open: boolean;
  current: AspectCatalog | null;
  versionSupermatrizId: number;
  catalogs: MatrixCatalogs;
  initialStandardId?: number | null;
  onClose: () => void;
  onDeactivate?: () => Promise<unknown>;
  onSave: (
    current: AspectCatalog | null,
    payload: AspectPayload,
    logicaEvaluacion: string | null
  ) => Promise<unknown>;
}

type EditorSection =
  | "basico"
  | "seguimiento"
  | "evidencia"
  | "avanzado";

type PeriodPreset =
  | "MENSUAL"
  | "TRIMESTRAL"
  | "SEMESTRAL"
  | "ANUAL"
  | "CADA_3_ANIOS"
  | "PERSONALIZADA";

interface AspectFormState {
  standardId: string;
  code: string;
  name: string;
  description: string;
  order: string;
  status: RecordStatus;
  actionPlan: string;

  isEvergreen: boolean;
  evergreenBlock: EvergreenBlock | "";
  periodicDocument: boolean;
  dailyTask: boolean;
  includeTaskReport: boolean;
  allowsNotApplicable: boolean;

  baseDateType: BaseDateType;
  periodicitySource: PeriodicitySource;
  periodicityAmount: string;
  periodicityUnit: PeriodicityUnit | "";
  alertDays: string;
  allowsManualDate: boolean;
  fixedMonth: string;
  fixedDay: string;
  validityRule: string;

  requiresEvidence: boolean;
  evidenceDescription: string;
  visibleToClient: boolean;

  requiresTechnicalReview: boolean;
  reviewObservations: string;

  dailyTarget: string;
  dailyUnit: PeriodicityUnit;
  dailyDescription: string;

  evaluationLogic: string;
  keywords: string;
  requirementsText: string;
  rulesText: string;
}

const inputClass =
  "w-full rounded-xl border border-neutral-800 bg-[#090909] px-3 py-2.5 text-sm text-white outline-none [color-scheme:dark] placeholder:text-neutral-600 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/10";

const sections: Array<{
  id: EditorSection;
  label: string;
  description: string;
  icon: typeof FileText;
}> = [
  {
    id: "basico",
    label: "1. Información básica",
    description: "Qué se revisa y qué debe hacer la empresa.",
    icon: FileText,
  },
  {
    id: "seguimiento",
    label: "2. Seguimiento",
    description: "Periodicidad, vigencia y evergreen.",
    icon: CalendarClock,
  },
  {
    id: "evidencia",
    label: "3. Evidencia y revisión",
    description: "Soportes, validación técnica y tarea cotidiana.",
    icon: ShieldCheck,
  },
  {
    id: "avanzado",
    label: "4. Información avanzada",
    description: "Lógica, palabras clave, normativa y aprobaciones.",
    icon: Settings2,
  },
];

function defaultForm(
  suggestedOrder: number,
  initialStandardId?: number | null
): AspectFormState {
  return {
    standardId: initialStandardId
      ? String(initialStandardId)
      : "",
    code: "",
    name: "",
    description: "",
    order: String(suggestedOrder),
    status: "ACTIVO",
    actionPlan: "",

    isEvergreen: false,
    evergreenBlock: "",
    periodicDocument: false,
    dailyTask: false,
    includeTaskReport: false,
    allowsNotApplicable: true,

    baseDateType: "FECHA_DOCUMENTO",
    periodicitySource: "CONFIGURACION_TECNICA",
    periodicityAmount: "12",
    periodicityUnit: "MES",
    alertDays: "30",
    allowsManualDate: true,
    fixedMonth: "",
    fixedDay: "",
    validityRule: "",

    requiresEvidence: false,
    evidenceDescription: "",
    visibleToClient: false,

    requiresTechnicalReview: false,
    reviewObservations: "",

    dailyTarget: "1",
    dailyUnit: "MES",
    dailyDescription: "",

    evaluationLogic: "",
    keywords: "",
    requirementsText: "",
    rulesText: "",
  };
}

function formFromAspect(
  aspect: AspectCatalog,
  suggestedOrder: number
): AspectFormState {
  const base = defaultForm(suggestedOrder, aspect.estandarId);
  const aspectWithEvaluationLogic = aspect as AspectCatalog & {
    logicaEvaluacion?: string | null;
  };

  return {
    ...base,
    standardId: String(aspect.estandarId),
    code: aspect.codigo ?? "",
    name: aspect.nombre,
    description: aspect.descripcion ?? "",
    order: String(aspect.orden),
    status: aspect.estado,
    actionPlan:
      aspect.planAccionEspecifico?.descripcion ?? "",

    isEvergreen:
      aspect.configuracion?.esEvergreen ?? false,
    evergreenBlock:
      aspect.configuracion?.bloqueEvergreen ?? "",
    periodicDocument:
      aspect.configuracion
        ?.documentoActualizacionPeriodica ?? false,
    dailyTask:
      aspect.configuracion?.tareaEjecucionCotidiana ??
      false,
    includeTaskReport:
      aspect.configuracion
        ?.incluirInformeEstadoTareas ?? false,
    allowsNotApplicable:
      aspect.configuracion?.permiteNoAplica ?? true,

    baseDateType:
      aspect.configuracionVigencia?.tipoFechaBase ??
      "FECHA_DOCUMENTO",
    periodicitySource:
      aspect.configuracionVigencia?.fuentePeriodicidad ??
      "CONFIGURACION_TECNICA",
    periodicityAmount: String(
      aspect.configuracionVigencia?.cantidad ?? 12
    ),
    periodicityUnit:
      aspect.configuracionVigencia?.unidad ?? "MES",
    alertDays: String(
      aspect.configuracionVigencia?.diasAlertaPrevia ?? 30
    ),
    allowsManualDate:
      aspect.configuracionVigencia?.permiteFechaManual ??
      true,
    fixedMonth: String(
      aspect.configuracionVigencia?.mesFechaFija ?? ""
    ),
    fixedDay: String(
      aspect.configuracionVigencia?.diaFechaFija ?? ""
    ),
    validityRule:
      aspect.configuracionVigencia?.descripcionRegla ?? "",

    requiresEvidence:
      aspect.configuracionEvidencia?.requiereEvidencia ??
      false,
    evidenceDescription:
      aspect.configuracionEvidencia?.descripcionEvidencia ??
      "",
    visibleToClient:
      aspect.configuracionEvidencia
        ?.visibleClienteDefault ?? false,

    requiresTechnicalReview:
      aspect.configuracionRevision
        ?.requiereRevisionTecnica ?? false,
    reviewObservations:
      aspect.configuracionRevision?.observaciones ?? "",

    dailyTarget: String(
      aspect.configuracionTareaCotidiana
        ?.cantidadObjetivo ?? 1
    ),
    dailyUnit:
      aspect.configuracionTareaCotidiana?.unidad ?? "MES",
    dailyDescription:
      aspect.configuracionTareaCotidiana?.descripcion ?? "",

    evaluationLogic:
      aspectWithEvaluationLogic.logicaEvaluacion ?? "",
    keywords:
      aspect.palabrasClave
        ?.map((item) => item.palabraClave.nombre)
        .join(", ") ?? "",
    requirementsText:
      aspect.requisitosNormativos
        ?.map((item) => {
          const requirement = item.requisitoNormativo;
          return [
            requirement.norma,
            requirement.articulo ?? "",
            requirement.descripcion ?? "",
          ].join(" | ");
        })
        .join("\n") ?? "",
    rulesText:
      aspect.reglasAprobacion
        ?.map((rule) =>
          [
            rule.modalidad ?? "",
            rule.tipoActividad ?? "",
            rule.criterio,
          ].join(" | ")
        )
        .join("\n") ?? "",
  };
}

export default function AspectEditorModal({
  open,
  current,
  versionSupermatrizId,
  catalogs,
  initialStandardId = null,
  onClose,
  onDeactivate,
  onSave,
}: Props) {
  const [section, setSection] =
    useState<EditorSection>("basico");
  const [form, setForm] = useState<AspectFormState>(() =>
    defaultForm(1, initialStandardId)
  );
  const [saving, setSaving] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const suggestedOrder = useMemo(() => {
    const standardId = current?.estandarId ?? initialStandardId;
    const orders = catalogs.aspectos
      .filter(
        (item) => !standardId || item.estandarId === standardId
      )
      .map((item) => item.orden);

    return Math.max(0, ...orders) + 1;
  }, [catalogs.aspectos, current?.estandarId, initialStandardId]);

  useEffect(() => {
    if (!open) return;

    setSection("basico");
    setForm(
      current
        ? formFromAspect(current, suggestedOrder)
        : defaultForm(suggestedOrder, initialStandardId)
    );
    setSaving(false);
    setDeactivating(false);
    setError(null);
  }, [
    open,
    current,
    initialStandardId,
    suggestedOrder,
  ]);

  const selectedStandard = useMemo(
    () =>
      catalogs.estandares.find(
        (item) => item.id === Number(form.standardId)
      ) ?? null,
    [catalogs.estandares, form.standardId]
  );

  const periodPreset = useMemo(
    () => detectPreset(form),
    [form.periodicityAmount, form.periodicityUnit]
  );

  function patch(patchValue: Partial<AspectFormState>) {
    setForm((currentForm) => ({
      ...currentForm,
      ...patchValue,
    }));
    setError(null);
  }

  function applyPreset(preset: PeriodPreset) {
    const values: Record<
      Exclude<PeriodPreset, "PERSONALIZADA">,
      Pick<
        AspectFormState,
        "periodicityAmount" | "periodicityUnit"
      >
    > = {
      MENSUAL: {
        periodicityAmount: "1",
        periodicityUnit: "MES",
      },
      TRIMESTRAL: {
        periodicityAmount: "3",
        periodicityUnit: "MES",
      },
      SEMESTRAL: {
        periodicityAmount: "6",
        periodicityUnit: "MES",
      },
      ANUAL: {
        periodicityAmount: "12",
        periodicityUnit: "MES",
      },
      CADA_3_ANIOS: {
        periodicityAmount: "3",
        periodicityUnit: "ANIO",
      },
    };

    if (preset !== "PERSONALIZADA") {
      patch(values[preset]);
    }
  }

  function validate(): string | null {
    if (!form.standardId) {
      setSection("basico");
      return "Selecciona el estándar que contendrá este aspecto.";
    }

    if (!form.name.trim()) {
      setSection("basico");
      return "Escribe el nombre del aspecto.";
    }

    if (!form.actionPlan.trim()) {
      setSection("basico");
      return "Escribe el plan de acción específico. Cada aspecto debe tener uno.";
    }

    if (
      !Number.isInteger(Number(form.order)) ||
      Number(form.order) < 0
    ) {
      setSection("basico");
      return "El orden debe ser un número entero igual o mayor que cero.";
    }

    if (
      form.baseDateType === "FECHA_FIJA_CALENDARIO" &&
      (!form.fixedMonth || !form.fixedDay)
    ) {
      setSection("seguimiento");
      return "Para usar una fecha fija, indica el mes y el día.";
    }

    if (form.dailyTask && Number(form.dailyTarget) < 1) {
      setSection("evidencia");
      return "La tarea cotidiana debe tener una cantidad objetivo igual o mayor que uno.";
    }

    return null;
  }

  async function submit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    setError(null);

    try {
      await onSave(
        current,
        {
          versionSupermatrizId,
          estandarId: Number(form.standardId),
          codigo: form.code.trim() || null,
          nombre: form.name.trim(),
          descripcion: form.description.trim() || null,
          orden: Number(form.order),
          estado: form.status,
          planAccionEspecifico: form.actionPlan.trim(),
          configuracion: {
            esEvergreen: form.isEvergreen,
            bloqueEvergreen:
              form.isEvergreen && form.evergreenBlock
                ? form.evergreenBlock
                : null,
            documentoActualizacionPeriodica:
              form.periodicDocument,
            tareaEjecucionCotidiana: form.dailyTask,
            incluirInformeEstadoTareas:
              form.includeTaskReport,
            permiteNoAplica: form.allowsNotApplicable,
          },
          configuracionVigencia: {
            tipoFechaBase: form.baseDateType,
            fuentePeriodicidad: form.periodicitySource,
            cantidad:
              form.periodicityUnit && form.periodicityAmount
                ? Number(form.periodicityAmount)
                : null,
            unidad: form.periodicityUnit || null,
            diasAlertaPrevia: Number(form.alertDays || 0),
            permiteFechaManual: form.allowsManualDate,
            mesFechaFija: form.fixedMonth
              ? Number(form.fixedMonth)
              : null,
            diaFechaFija: form.fixedDay
              ? Number(form.fixedDay)
              : null,
            descripcionRegla:
              form.validityRule.trim() || null,
          },
          configuracionEvidencia: {
            requiereEvidencia: form.requiresEvidence,
            descripcionEvidencia:
              form.evidenceDescription.trim() || null,
            visibleClienteDefault: form.visibleToClient,
          },
          configuracionRevision: {
            requiereRevisionTecnica:
              form.requiresTechnicalReview,
            observaciones:
              form.reviewObservations.trim() || null,
          },
          configuracionTareaCotidiana: form.dailyTask
            ? {
                cantidadObjetivo: Number(form.dailyTarget),
                unidad: form.dailyUnit,
                descripcion:
                  form.dailyDescription.trim() || null,
              }
            : null,
          palabrasClave: form.keywords
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
          requisitosNormativos: parseRequirements(
            form.requirementsText
          ),
          reglasAprobacion: parseRules(form.rulesText),
        },
        form.evaluationLogic.trim() || null
      );

      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible guardar el aspecto."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deactivateCurrent() {
    if (!current || !onDeactivate) return;

    setDeactivating(true);
    setError(null);

    try {
      const result = await onDeactivate();
      if (result === false) return;
      onClose();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "No fue posible desactivar el aspecto."
      );
    } finally {
      setDeactivating(false);
    }
  }

  const busy = saving || deactivating;

  return (
    <AppModal
      open={open}
      title={current ? "Editar aspecto" : "Crear aspecto"}
      description="El aspecto es el punto exacto que se evaluará. Aquí también se configura su plan de acción, vigencia, evidencia y revisión técnica."
      onClose={onClose}
      busy={busy}
      size="2xl"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {current && onDeactivate && (
              <button
                type="button"
                onClick={() => void deactivateCurrent()}
                disabled={busy}
                className="flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm font-medium text-red-400 disabled:opacity-50"
              >
                {deactivating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                Desactivar aspecto
              </button>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="rounded-xl border border-neutral-700 bg-neutral-800 px-5 py-2.5 text-sm font-medium text-neutral-300 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="aspect-editor-form"
              disabled={busy}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"
            >
              {saving && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Guardar aspecto
            </button>
          </div>
        </div>
      }
    >
      <form
        id="aspect-editor-form"
        onSubmit={submit}
        className="space-y-5"
      >
        <SectionNavigator
          current={section}
          onChange={setSection}
        />

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-300">
            <strong className="block text-red-200">
              Revisa esta información
            </strong>
            {error}
          </div>
        )}

        {section === "basico" && (
          <BasicSection
            form={form}
            catalogs={catalogs}
            selectedStandard={selectedStandard}
            patch={patch}
          />
        )}

        {section === "seguimiento" && (
          <TrackingSection
            form={form}
            preset={periodPreset}
            patch={patch}
            applyPreset={applyPreset}
          />
        )}

        {section === "evidencia" && (
          <EvidenceSection form={form} patch={patch} />
        )}

        {section === "avanzado" && (
          <AdvancedSection form={form} patch={patch} />
        )}
      </form>
    </AppModal>
  );
}

function SectionNavigator({
  current,
  onChange,
}: {
  current: EditorSection;
  onChange: (section: EditorSection) => void;
}) {
  return (
    <div className="grid gap-2 lg:grid-cols-4">
      {sections.map((item) => {
        const Icon = item.icon;
        const active = current === item.id;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`rounded-xl border p-3 text-left transition-colors ${
              active
                ? "border-cyan-500/30 bg-cyan-500/10"
                : "border-neutral-800 bg-[#090909] hover:border-neutral-700"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  active
                    ? "bg-cyan-500/10 text-cyan-400"
                    : "bg-neutral-800 text-neutral-500"
                }`}
              >
                <Icon size={16} />
              </div>
              <div>
                <p
                  className={`text-xs font-semibold ${
                    active ? "text-cyan-200" : "text-neutral-300"
                  }`}
                >
                  {item.label}
                </p>
                <p className="mt-1 text-[10px] leading-4 text-neutral-600">
                  {item.description}
                </p>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function BasicSection({
  form,
  catalogs,
  selectedStandard,
  patch,
}: {
  form: AspectFormState;
  catalogs: MatrixCatalogs;
  selectedStandard: MatrixCatalogs["estandares"][number] | null;
  patch: (patchValue: Partial<AspectFormState>) => void;
}) {
  return (
    <SectionCard
      title="Información básica"
      description="Primero define dónde vive el aspecto y qué debe cumplir la empresa."
      icon={FileText}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Estándar *"
          help="El estándar determina automáticamente el ciclo PHVA, la categoría y los grupos 7/21/60."
          spanTwo
        >
          <AppSelect
            required
            value={form.standardId}
            onChange={(event) =>
              patch({ standardId: event.target.value })
            }
          >
            <option value="">
              Selecciona un estándar
            </option>
            {catalogs.estandares
              .filter((standard) => standard.estado === "ACTIVO")
              .map((standard) => (
                <option key={standard.id} value={standard.id}>
                  {standard.categoriaEstandar.cicloPhva.nombre} ·{" "}
                  {standard.categoriaEstandar.nombre} ·{" "}
                  {standard.codigo
                    ? `${standard.codigo}. `
                    : ""}
                  {standard.nombre}
                </option>
              ))}
          </AppSelect>
        </Field>

        {selectedStandard && (
          <div className="md:col-span-2 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
              Ruta automática
            </p>
            <p className="mt-2 text-sm leading-6 text-neutral-200">
              <strong>
                {selectedStandard.categoriaEstandar.cicloPhva.nombre}
              </strong>{" "}
              → {selectedStandard.categoriaEstandar.nombre} →{" "}
              {selectedStandard.nombre}
            </p>
          </div>
        )}

        <Field label="Código">
          <input
            value={form.code}
            onChange={(event) =>
              patch({ code: event.target.value })
            }
            placeholder="Ej. 1111"
            className={inputClass}
          />
        </Field>

        <Field
          label="Orden *"
          help="Posición del aspecto dentro del estándar."
        >
          <input
            required
            type="number"
            min={0}
            value={form.order}
            onChange={(event) =>
              patch({ order: event.target.value })
            }
            className={inputClass}
          />
        </Field>

        <Field label="Nombre del aspecto *" spanTwo>
          <textarea
            required
            rows={3}
            value={form.name}
            onChange={(event) =>
              patch({ name: event.target.value })
            }
            placeholder="Ej. Documento de designación del responsable del SG-SST, con la asignación de responsabilidades."
            className={`${inputClass} resize-y`}
          />
        </Field>

        <Field
          label="Descripción complementaria"
          help="Opcional. Úsala solo cuando el nombre no sea suficiente para explicar el alcance."
          spanTwo
        >
          <textarea
            rows={3}
            value={form.description}
            onChange={(event) =>
              patch({ description: event.target.value })
            }
            className={`${inputClass} resize-y`}
          />
        </Field>

        <Field
          label="Plan de acción específico *"
          help="Indica qué debe hacer la empresa para cumplir. Debe existir un solo plan por aspecto."
          spanTwo
        >
          <textarea
            required
            rows={4}
            value={form.actionPlan}
            onChange={(event) =>
              patch({ actionPlan: event.target.value })
            }
            placeholder="Ej. Elaborar el documento para la asignación del responsable del SG-SST."
            className={`${inputClass} resize-y text-blue-200`}
          />
        </Field>

        <Field label="Estado">
          <AppSelect
            value={form.status}
            onChange={(event) =>
              patch({
                status:
                  event.target.value as RecordStatus,
              })
            }
          >
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </AppSelect>
        </Field>
      </div>
    </SectionCard>
  );
}

function TrackingSection({
  form,
  preset,
  patch,
  applyPreset,
}: {
  form: AspectFormState;
  preset: PeriodPreset;
  patch: (patchValue: Partial<AspectFormState>) => void;
  applyPreset: (preset: PeriodPreset) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionCard
        title="Periodicidad y vigencia"
        description="Selecciona una opción sencilla o usa la configuración personalizada."
        icon={CalendarClock}
      >
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
          {(
            [
              ["MENSUAL", "Mensual"],
              ["TRIMESTRAL", "Trimestral"],
              ["SEMESTRAL", "Semestral"],
              ["ANUAL", "Anual"],
              ["CADA_3_ANIOS", "Cada 3 años"],
            ] as Array<[PeriodPreset, string]>
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => applyPreset(value)}
              className={`rounded-xl border px-3 py-3 text-xs font-semibold transition-colors ${
                preset === value
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-neutral-800 bg-[#090909] text-neutral-400 hover:border-neutral-700"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <Field label="Cantidad">
            <input
              type="number"
              min={1}
              value={form.periodicityAmount}
              onChange={(event) =>
                patch({ periodicityAmount: event.target.value })
              }
              className={inputClass}
            />
          </Field>

          <Field label="Unidad">
            <AppSelect
              value={form.periodicityUnit}
              onChange={(event) =>
                patch({
                  periodicityUnit:
                    event.target.value as PeriodicityUnit | "",
                })
              }
            >
              <option value="">Sin periodicidad</option>
              <option value="DIA">Día</option>
              <option value="SEMANA">Semana</option>
              <option value="MES">Mes</option>
              <option value="ANIO">Año</option>
            </AppSelect>
          </Field>

          <Field
            label="Fecha base"
            help="Para documentos, normalmente se usa la fecha de elaboración."
          >
            <AppSelect
              value={form.baseDateType}
              onChange={(event) =>
                patch({
                  baseDateType:
                    event.target.value as BaseDateType,
                })
              }
            >
              <option value="FECHA_DOCUMENTO">
                Fecha de elaboración del documento
              </option>
              <option value="FECHA_ULTIMA_REVISION">
                Fecha de la última revisión
              </option>
              <option value="FECHA_FIJA_CALENDARIO">
                Fecha fija del calendario
              </option>
            </AppSelect>
          </Field>

          <Field label="Origen de la periodicidad">
            <AppSelect
              value={form.periodicitySource}
              onChange={(event) =>
                patch({
                  periodicitySource:
                    event.target
                      .value as PeriodicitySource,
                })
              }
            >
              <option value="NORMATIVA">
                Definida por norma
              </option>
              <option value="DIRECTRIZ_INTERNA">
                Directriz interna
              </option>
              <option value="CONFIGURACION_TECNICA">
                Configuración técnica
              </option>
            </AppSelect>
          </Field>

          <Field label="Días de alerta previa">
            <input
              type="number"
              min={0}
              value={form.alertDays}
              onChange={(event) =>
                patch({ alertDays: event.target.value })
              }
              className={inputClass}
            />
          </Field>

          <div className="flex items-end">
            <CheckCard
              label="Permitir fecha manual"
              description="El profesional podrá indicar la fecha real del documento evidenciado."
              checked={form.allowsManualDate}
              onChange={(checked) =>
                patch({ allowsManualDate: checked })
              }
            />
          </div>

          {form.baseDateType ===
            "FECHA_FIJA_CALENDARIO" && (
            <>
              <Field label="Mes fijo">
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={form.fixedMonth}
                  onChange={(event) =>
                    patch({ fixedMonth: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
              <Field label="Día fijo">
                <input
                  type="number"
                  min={1}
                  max={31}
                  value={form.fixedDay}
                  onChange={(event) =>
                    patch({ fixedDay: event.target.value })
                  }
                  className={inputClass}
                />
              </Field>
            </>
          )}

          <Field
            label="Explicación de la regla"
            help="Opcional. Útil cuando la periodicidad requiere una aclaración especial."
            spanTwo
          >
            <textarea
              rows={3}
              value={form.validityRule}
              onChange={(event) =>
                patch({ validityRule: event.target.value })
              }
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="Comportamiento en la matriz"
        description="Estas opciones controlan alertas y reportes, pero no cambian la relación con el estándar."
        icon={CheckCircle2}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <CheckCard
            label="Seguimiento permanente (Evergreen)"
            description="Mantiene el aspecto activo y visible para seguimiento continuo."
            checked={form.isEvergreen}
            onChange={(checked) =>
              patch({
                isEvergreen: checked,
                evergreenBlock: checked
                  ? form.evergreenBlock
                  : "",
              })
            }
          />
          <CheckCard
            label="Documento de actualización periódica"
            description="Muestra la periodicidad en la columna correspondiente del Excel visual."
            checked={form.periodicDocument}
            onChange={(checked) =>
              patch({ periodicDocument: checked })
            }
          />
          <CheckCard
            label="Incluir en informe de estado de tareas"
            description="La fila aparecerá en el informe operativo de tareas."
            checked={form.includeTaskReport}
            onChange={(checked) =>
              patch({ includeTaskReport: checked })
            }
          />
          <CheckCard
            label="Permite No Aplica"
            description="No Aplica se interpretará como cumplido según la regla definida."
            checked={form.allowsNotApplicable}
            onChange={(checked) =>
              patch({ allowsNotApplicable: checked })
            }
          />
        </div>

        {form.isEvergreen && (
          <div className="mt-4 max-w-md">
            <Field label="Bloque evergreen">
              <AppSelect
                value={form.evergreenBlock}
                onChange={(event) =>
                  patch({
                    evergreenBlock:
                      event.target.value as EvergreenBlock | "",
                  })
                }
              >
                <option value="">Sin bloque específico</option>
                <option value="PRIMER_CUATRIMESTRE">
                  Bloque 1 · Primer cuatrimestre
                </option>
                <option value="SEGUNDO_CUATRIMESTRE">
                  Bloque 2 · Segundo cuatrimestre
                </option>
                <option value="TERCER_CUATRIMESTRE">
                  Bloque 3 · Tercer cuatrimestre
                </option>
              </AppSelect>
            </Field>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function EvidenceSection({
  form,
  patch,
}: {
  form: AspectFormState;
  patch: (patchValue: Partial<AspectFormState>) => void;
}) {
  return (
    <div className="space-y-5">
      <SectionCard
        title="Evidencia"
        description="Define si la evaluación debe tener un soporte adjunto y qué espera encontrar el profesional."
        icon={FileCheck2}
      >
        <div className="grid gap-3 md:grid-cols-2">
          <CheckCard
            label="Requiere evidencia"
            description="La evaluación deberá incluir un archivo, registro, fotografía o soporte equivalente."
            checked={form.requiresEvidence}
            onChange={(checked) =>
              patch({ requiresEvidence: checked })
            }
          />
          <CheckCard
            label="Visible para el cliente por defecto"
            description="La evidencia quedará visible para el cliente salvo que se cambie en el registro."
            checked={form.visibleToClient}
            onChange={(checked) =>
              patch({ visibleToClient: checked })
            }
          />
        </div>

        <div className="mt-4">
          <Field label="Qué evidencia se espera">
            <textarea
              rows={3}
              value={form.evidenceDescription}
              onChange={(event) =>
                patch({
                  evidenceDescription: event.target.value,
                })
              }
              placeholder="Ej. Acta firmada por gerencia, certificado vigente o registro de asistencia."
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="Revisión técnica"
        description="Úsala en aspectos que deben ser validados por un coordinador, auditor o especialista."
        icon={ShieldCheck}
      >
        <CheckCard
          label="Requiere revisión técnica"
          description="La evaluación quedará marcada para validación antes de considerarse final."
          checked={form.requiresTechnicalReview}
          onChange={(checked) =>
            patch({ requiresTechnicalReview: checked })
          }
        />

        <div className="mt-4">
          <Field label="Observaciones para la revisión">
            <textarea
              rows={3}
              value={form.reviewObservations}
              onChange={(event) =>
                patch({ reviewObservations: event.target.value })
              }
              placeholder="Ej. Debe revisarse la metodología y la coherencia de los controles propuestos."
              className={`${inputClass} resize-y`}
            />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="Tarea de ejecución cotidiana"
        description="Actívala cuando el aspecto no sea un documento puntual, sino una actividad repetitiva."
        icon={CalendarClock}
      >
        <CheckCard
          label="Gestionar como tarea cotidiana"
          description="Permite definir una meta de frecuencia para la actividad."
          checked={form.dailyTask}
          onChange={(checked) =>
            patch({ dailyTask: checked })
          }
        />

        {form.dailyTask && (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <Field label="Cantidad objetivo">
              <input
                type="number"
                min={1}
                value={form.dailyTarget}
                onChange={(event) =>
                  patch({ dailyTarget: event.target.value })
                }
                className={inputClass}
              />
            </Field>

            <Field label="Unidad">
              <AppSelect
                value={form.dailyUnit}
                onChange={(event) =>
                  patch({
                    dailyUnit:
                      event.target.value as PeriodicityUnit,
                  })
                }
              >
                <option value="DIA">Día</option>
                <option value="SEMANA">Semana</option>
                <option value="MES">Mes</option>
                <option value="ANIO">Año</option>
              </AppSelect>
            </Field>

            <Field label="Explicación de la meta" spanTwo>
              <textarea
                rows={3}
                value={form.dailyDescription}
                onChange={(event) =>
                  patch({ dailyDescription: event.target.value })
                }
                className={`${inputClass} resize-y`}
              />
            </Field>
          </div>
        )}
      </SectionCard>
    </div>
  );
}

function AdvancedSection({
  form,
  patch,
}: {
  form: AspectFormState;
  patch: (patchValue: Partial<AspectFormState>) => void;
}) {
  return (
    <SectionCard
      title="Información avanzada"
      description="Configura la lógica específica del aspecto y la información de apoyo para búsqueda y trazabilidad."
      icon={Settings2}
    >
      <div className="space-y-5">
        <Field
          label="Lógica de evaluación"
          help="Regla específica del aspecto que utiliza la Bitácora IA para interpretar 0, 3 o 5. Si se deja vacía, Stack44 conserva el criterio general 0/3/5. La lógica se versiona junto con la Supermatriz."
        >
          <textarea
            rows={7}
            value={form.evaluationLogic}
            onChange={(event) =>
              patch({ evaluationLogic: event.target.value })
            }
            placeholder={"5 - Cumple cuando se evidencia la totalidad del criterio requerido.\n3 - Cumple parcialmente cuando existe avance verificable pero faltan elementos del criterio.\n0 - No cumple cuando no existe evidencia suficiente del criterio."}
            className={`${inputClass} resize-y font-mono text-xs leading-5`}
          />
        </Field>

        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 px-4 py-3 text-xs leading-5 text-neutral-400">
          Esta regla no reemplaza el motor de evaluación de Stack44. Orienta la interpretación del aspecto y queda asociada a esta versión de la Supermatriz.
        </div>

        <Field
          label="Palabras clave"
          help="Sepáralas por comas. Ayudan a encontrar el aspecto aunque el usuario no escriba el nombre exacto."
        >
          <input
            value={form.keywords}
            onChange={(event) =>
              patch({ keywords: event.target.value })
            }
            placeholder="responsable, designación, sg-sst"
            className={inputClass}
          />
        </Field>

        <Field
          label="Requisitos normativos"
          help="Una línea por requisito: Norma | Artículo | Descripción."
        >
          <textarea
            rows={5}
            value={form.requirementsText}
            onChange={(event) =>
              patch({ requirementsText: event.target.value })
            }
            placeholder="Decreto 1072 de 2015 | 2.2.4.6.8 | Obligaciones del empleador"
            className={`${inputClass} resize-y font-mono text-xs`}
          />
        </Field>

        <Field
          label="Reglas de aprobación"
          help="Una línea por regla: Modalidad | Tipo de actividad | Criterio. Modalidades: PRESENCIAL, REMOTA, OFICINA o SEGUIMIENTO_PUNTUAL."
        >
          <textarea
            rows={5}
            value={form.rulesText}
            onChange={(event) =>
              patch({ rulesText: event.target.value })
            }
            placeholder="SEGUIMIENTO_PUNTUAL | Actualización documental | Requiere validación del coordinador"
            className={`${inputClass} resize-y font-mono text-xs`}
          />
        </Field>
      </div>
    </SectionCard>
  );
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
}: {
  title: string;
  description: string;
  icon: typeof FileText;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-neutral-800 bg-[#101010] p-5">
      <div className="mb-5 flex items-start gap-3 border-b border-neutral-800 pb-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-neutral-800 bg-[#080808] text-cyan-400">
          <Icon size={18} />
        </div>
        <div>
          <h3 className="font-bold text-white">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-neutral-500">
            {description}
          </p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({
  label,
  help,
  children,
  spanTwo = false,
}: {
  label: string;
  help?: string;
  children: ReactNode;
  spanTwo?: boolean;
}) {
  return (
    <label className={spanTwo ? "md:col-span-2" : ""}>
      <span className="mb-1.5 block text-xs font-medium text-neutral-300">
        {label}
      </span>
      {children}
      {help && (
        <span className="mt-1.5 block text-[11px] leading-5 text-neutral-600">
          {help}
        </span>
      )}
    </label>
  );
}

function CheckCard({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors ${
        checked
          ? "border-cyan-500/25 bg-cyan-500/10"
          : "border-neutral-800 bg-[#090909] hover:border-neutral-700"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1"
      />
      <div>
        <p
          className={`text-sm font-semibold ${
            checked ? "text-cyan-200" : "text-neutral-300"
          }`}
        >
          {label}
        </p>
        <p className="mt-1 text-xs leading-5 text-neutral-600">
          {description}
        </p>
      </div>
    </label>
  );
}

function detectPreset(form: AspectFormState): PeriodPreset {
  const amount = Number(form.periodicityAmount);
  const unit = form.periodicityUnit;

  if (amount === 1 && unit === "MES") return "MENSUAL";
  if (amount === 3 && unit === "MES") return "TRIMESTRAL";
  if (amount === 6 && unit === "MES") return "SEMESTRAL";
  if (amount === 12 && unit === "MES") return "ANUAL";
  if (amount === 3 && unit === "ANIO") return "CADA_3_ANIOS";
  return "PERSONALIZADA";
}

function parseRequirements(
  value: string
): RequirementPayload[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [norma, articulo, descripcion] = line
        .split("|")
        .map((part) => part.trim());

      return {
        norma,
        articulo: articulo || null,
        descripcion: descripcion || null,
      };
    })
    .filter((item) => Boolean(item.norma));
}

function parseRules(value: string): ApprovalRulePayload[] {
  const validModes: ManagementMode[] = [
    "PRESENCIAL",
    "REMOTA",
    "OFICINA",
    "SEGUIMIENTO_PUNTUAL",
  ];

  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [modalidad, tipoActividad, criterio] = line
        .split("|")
        .map((part) => part.trim());

      return {
        modalidad: validModes.includes(
          modalidad as ManagementMode
        )
          ? (modalidad as ManagementMode)
          : null,
        tipoActividad: tipoActividad || null,
        criterio: criterio || "",
        requiereAprobacion: true,
      };
    })
    .filter((item) => Boolean(item.criterio));
}
