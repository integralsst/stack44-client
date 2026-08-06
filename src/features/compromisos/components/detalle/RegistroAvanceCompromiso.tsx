import {
  FilePlus2,
  MessageSquarePlus,
} from "lucide-react";
import { useState } from "react";

import type { CompromisoDetalle } from "../../types/consulta-compromisos.types";
import type {
  CrearEvidenciaCompromisoInput,
  CrearSeguimientoCompromisoInput,
} from "../../types/operacion-compromisos.types";
import EvidenciaCompromisoForm from "./EvidenciaCompromisoForm";
import SeguimientoCompromisoForm from "./SeguimientoCompromisoForm";

interface Props {
  compromiso: CompromisoDetalle;
  procesando: string | null;
  onCreateFollowUp: (
    input: CrearSeguimientoCompromisoInput
  ) => Promise<boolean>;
  onCreateEvidence: (
    input: CrearEvidenciaCompromisoInput
  ) => Promise<boolean>;
}

type Vista = "SEGUIMIENTO" | "EVIDENCIA";

export default function RegistroAvanceCompromiso({
  compromiso,
  procesando,
  onCreateFollowUp,
  onCreateEvidence,
}: Props) {
  const puedeSeguimiento =
    compromiso.operacion.puedeRegistrarSeguimiento;
  const puedeEvidencia =
    compromiso.operacion.puedeCargarEvidencia;
  const [vista, setVista] = useState<Vista>(
    puedeSeguimiento ? "SEGUIMIENTO" : "EVIDENCIA"
  );

  if (!puedeSeguimiento && !puedeEvidencia) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">
        Paso 2
      </p>
      <h2 className="mt-1 text-base font-bold text-slate-950">
        Registrar avance
      </h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">
        Describe lo realizado y adjunta el enlace de la evidencia cuando exista. Las evidencias respaldan la gestión, pero no sustituyen la actividad ni la recalificación en 5.
      </p>

      <div className="mt-4 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {puedeSeguimiento && (
          <button
            type="button"
            onClick={() => setVista("SEGUIMIENTO")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              vista === "SEGUIMIENTO"
                ? "bg-cyan-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <MessageSquarePlus size={16} />
            Seguimiento
          </button>
        )}
        {puedeEvidencia && (
          <button
            type="button"
            onClick={() => setVista("EVIDENCIA")}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              vista === "EVIDENCIA"
                ? "bg-cyan-600 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <FilePlus2 size={16} />
            Evidencia por enlace
          </button>
        )}
      </div>

      <div className="mt-4">
        {vista === "SEGUIMIENTO" &&
        puedeSeguimiento ? (
          <SeguimientoCompromisoForm
            compromiso={compromiso}
            busy={procesando === "seguimiento"}
            onSubmit={onCreateFollowUp}
            embedded
          />
        ) : puedeEvidencia ? (
          <EvidenciaCompromisoForm
            busy={procesando === "evidencia"}
            onSubmit={onCreateEvidence}
            esUsuarioCliente={
              compromiso.operacion.esUsuarioCliente
            }
            embedded
          />
        ) : null}
      </div>
    </section>
  );
}
