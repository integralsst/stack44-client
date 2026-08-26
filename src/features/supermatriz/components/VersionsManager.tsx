import {
  CheckCircle2,
  Copy,
  Edit2,
  Plus,
} from "lucide-react";
import {
  useState,
  type ReactNode,
} from "react";

import type {
  MatrixVersion,
  MatrixVersionPayload,
} from "../types/supermatriz.types";
import StatusBadge from "./StatusBadge";
import VersionModal, {
  type VersionModalMode,
} from "./VersionModal";

interface Props {
  versions: MatrixVersion[];
  selectedVersionId: number;
  canAdminister: boolean;
  onSelect: (
    id: number
  ) => void;
  onCreate: (
    payload: MatrixVersionPayload
  ) => Promise<unknown>;
  onUpdate: (
    id: number,
    payload: MatrixVersionPayload
  ) => Promise<unknown>;
  onClone: (
    id: number,
    payload: MatrixVersionPayload
  ) => Promise<unknown>;
  onPublish: (
    id: number
  ) => Promise<unknown>;
}

function parseCalendarDate(
  value: string
): Date {
  const [year, month, day] = value
    .slice(0, 10)
    .split("-")
    .map(Number);

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12
    )
  );
}

function formatCalendarDate(
  value: string | null
): string | null {
  if (!value) return null;

  return new Intl.DateTimeFormat(
    "es-CO",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(parseCalendarDate(value));
}

function previousCalendarDate(
  value: string
): string {
  const date = parseCalendarDate(value);
  date.setUTCDate(date.getUTCDate() - 1);

  return new Intl.DateTimeFormat(
    "es-CO",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    }
  ).format(date);
}

function validityLabel(
  version: MatrixVersion
): string {
  if (version.estado === "CERRADA") {
    const until = formatCalendarDate(
      version.vigenteHasta
    );

    return until
      ? `Aplicó hasta ${until}`
      : "Versión histórica";
  }

  if (version.estado === "VIGENTE") {
    const from = formatCalendarDate(
      version.vigenteDesde
    );

    return from
      ? `Vigente desde ${from}`
      : "Vigente desde el inicio";
  }

  if (version.clonadaDeId) {
    const from = formatCalendarDate(
      version.vigenteDesde
    );

    return from
      ? `Programada desde ${from}`
      : "Fecha de vigencia pendiente";
  }

  return "Versión inicial en preparación";
}

export default function VersionsManager({
  versions,
  selectedVersionId,
  canAdminister,
  onSelect,
  onCreate,
  onUpdate,
  onClone,
  onPublish,
}: Props) {
  const [modal, setModal] =
    useState<{
      open: boolean;
      mode: VersionModalMode;
      current: MatrixVersion | null;
    }>({
      open: false,
      mode: "crear",
      current: null,
    });

  const hasPublishedLine =
    versions.some(
      (version) =>
        version.estado === "VIGENTE" ||
        version.estado === "CERRADA"
    );

  async function publish(
    version: MatrixVersion
  ) {
    const from = formatCalendarDate(
      version.vigenteDesde
    );

    const message =
      version.vigenteDesde && from
        ? `¿Publicar "${version.nombre}" desde ${from}? La versión vigente anterior pasará automáticamente a histórica hasta ${previousCalendarDate(
            version.vigenteDesde
          )}.`
        : `¿Publicar "${version.nombre}" como versión inicial vigente? Aplicará desde el inicio de la operación.`;

    if (!window.confirm(message)) {
      return;
    }

    await onPublish(version.id);
  }

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-4 rounded-2xl border border-neutral-800/70 bg-[#111111] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-white">
            Versiones de la Supermatriz
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-neutral-500">
            La Supermatriz funciona como una línea temporal. Cada actualización entra en vigor desde una fecha y la versión anterior queda protegida como histórica.
          </p>
        </div>

        {canAdminister &&
          !hasPublishedLine && (
            <button
              type="button"
              onClick={() =>
                setModal({
                  open: true,
                  mode: "crear",
                  current: null,
                })
              }
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-black"
            >
              <Plus size={17} />
              Crear versión inicial
            </button>
          )}
      </header>

      <section className="grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
        {versions.map(
          (version) => {
            const selected =
              version.id ===
              selectedVersionId;

            return (
              <article
                key={version.id}
                className={`rounded-2xl border p-5 ${
                  selected
                    ? "border-cyan-500/30 bg-cyan-500/5"
                    : "border-neutral-800/70 bg-[#111111]"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    onSelect(
                      version.id
                    )
                  }
                  className="w-full text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-white">
                        {
                          version.nombre
                        }
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-neutral-500">
                        {version.descripcion ??
                          "Sin descripción"}
                      </p>
                    </div>
                    <StatusBadge
                      status={
                        version.estado
                      }
                    />
                  </div>

                  <div className="mt-4 rounded-xl border border-neutral-800 bg-[#0a0a0a] px-3 py-2.5">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-600">
                      Vigencia
                    </p>
                    <p className="mt-1 text-xs font-semibold text-neutral-300">
                      {validityLabel(version)}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <Metric
                      label="Filas"
                      value={
                        version
                          ._count
                          ?.tareas ?? 0
                      }
                    />
                    <Metric
                      label="Aspectos"
                      value={
                        version
                          ._count
                          ?.aspectos ?? 0
                      }
                    />
                    <Metric
                      label="Procesos"
                      value={
                        version
                          ._count
                          ?.procesos ?? 0
                      }
                    />
                  </div>

                  <div className="mt-4 text-[11px] text-neutral-600">
                    {version.clonadaDe
                      ? `Basada en ${version.clonadaDe.nombre}`
                      : "Versión original"}
                  </div>
                </button>

                {canAdminister && (
                  <div className="mt-5 flex flex-wrap gap-2 border-t border-neutral-800 pt-4">
                    {version.estado ===
                      "BORRADOR" && (
                      <>
                        <Action
                          icon={
                            <Edit2
                              size={
                                14
                              }
                            />
                          }
                          label="Editar"
                          onClick={() =>
                            setModal(
                              {
                                open: true,
                                mode:
                                  "editar",
                                current:
                                  version,
                              }
                            )
                          }
                        />
                        <Action
                          icon={
                            <CheckCircle2
                              size={
                                14
                              }
                            />
                          }
                          label="Publicar"
                          onClick={() =>
                            void publish(
                              version
                            )
                          }
                          emphasis
                        />
                      </>
                    )}

                    {version.estado ===
                      "VIGENTE" && (
                      <Action
                        icon={
                          <Copy
                            size={
                              14
                            }
                          />
                        }
                        label="Crear sucesora"
                        onClick={() =>
                          setModal({
                            open: true,
                            mode:
                              "clonar",
                            current:
                              version,
                          })
                        }
                      />
                    )}
                  </div>
                )}
              </article>
            );
          }
        )}
      </section>

      {versions.length === 0 && (
        <div className="rounded-2xl border border-dashed border-neutral-800 px-6 py-16 text-center text-sm text-neutral-500">
          No existen versiones de la Supermatriz.
        </div>
      )}

      <VersionModal
        open={modal.open}
        mode={modal.mode}
        current={modal.current}
        onClose={() =>
          setModal({
            open: false,
            mode: "crear",
            current: null,
          })
        }
        onSave={(payload) => {
          if (
            modal.mode ===
              "editar" &&
            modal.current
          ) {
            return onUpdate(
              modal.current.id,
              payload
            );
          }

          if (
            modal.mode ===
              "clonar" &&
            modal.current
          ) {
            return onClone(
              modal.current.id,
              payload
            );
          }

          return onCreate(
            payload
          );
        }}
      />
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-[#0a0a0a] px-2 py-3">
      <p className="text-lg font-bold text-white">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wider text-neutral-600">
        {label}
      </p>
    </div>
  );
}

function Action({
  icon,
  label,
  onClick,
  emphasis = false,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  emphasis?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[11px] font-medium ${
        emphasis
          ? "border-cyan-500/20 bg-cyan-500/10 text-cyan-300"
          : "border-neutral-800 text-neutral-300 hover:text-white"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
