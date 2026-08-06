import { useState } from "react";

import { crearBorradoresCompromisos } from "../forms/compromisos-finalizacion.form";
import type {
  ApoyoCompromisoDraft,
  CompromisoFinalizacionDraft,
  CompromisosFinalizacionDraft,
} from "../types/compromiso-formulario.types";
import type {
  PreparacionFinalizacionResponse,
} from "../types/compromiso.types";

export function useCompromisosFinalizacionForm(
  preparacion: PreparacionFinalizacionResponse
) {
  const [borradores, setBorradores] =
    useState<CompromisosFinalizacionDraft>(() =>
      crearBorradoresCompromisos(preparacion)
    );

  const actualizarBorrador = (
    evaluacionId: string,
    patch: Partial<CompromisoFinalizacionDraft>
  ) => {
    setBorradores((current) => {
      const draft = current[evaluacionId];

      if (!draft) {
        return current;
      }

      return {
        ...current,
        [evaluacionId]: {
          ...draft,
          ...patch,
        },
      };
    });
  };

  const agregarApoyo = (evaluacionId: string) => {
    setBorradores((current) => {
      const draft = current[evaluacionId];

      if (!draft) {
        return current;
      }

      return {
        ...current,
        [evaluacionId]: {
          ...draft,
          apoyos: [
            ...draft.apoyos,
            {
              key: `${evaluacionId}-${draft.apoyos.length}-${Date.now()}`,
              usuarioResponsableId: "",
              actividad: "",
            },
          ],
        },
      };
    });
  };

  const actualizarApoyo = (
    evaluacionId: string,
    key: string,
    patch: Partial<ApoyoCompromisoDraft>
  ) => {
    setBorradores((current) => {
      const draft = current[evaluacionId];

      if (!draft) {
        return current;
      }

      return {
        ...current,
        [evaluacionId]: {
          ...draft,
          apoyos: draft.apoyos.map((apoyo) =>
            apoyo.key === key
              ? {
                  ...apoyo,
                  ...patch,
                }
              : apoyo
          ),
        },
      };
    });
  };

  const eliminarApoyo = (
    evaluacionId: string,
    key: string
  ) => {
    setBorradores((current) => {
      const draft = current[evaluacionId];

      if (!draft) {
        return current;
      }

      return {
        ...current,
        [evaluacionId]: {
          ...draft,
          apoyos: draft.apoyos.filter(
            (apoyo) => apoyo.key !== key
          ),
        },
      };
    });
  };

  return {
    borradores,
    actualizarBorrador,
    agregarApoyo,
    actualizarApoyo,
    eliminarApoyo,
  };
}
