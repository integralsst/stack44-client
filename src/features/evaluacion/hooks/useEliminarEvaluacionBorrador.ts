import { useCallback, useState } from "react";

import { useAuth } from "../../auth/context/AuthContext";
import { eliminarEvaluacionBorrador } from "../api/evaluacion.api";
import { notificarCambioEvaluacionBorrador } from "../lib/evaluacion-borrador.events";

export function useEliminarEvaluacionBorrador() {
  const { token } = useAuth();
  const [eliminandoAspectoId, setEliminandoAspectoId] =
    useState<number | null>(null);

  const eliminar = useCallback(
    async (gestionId: string, aspectoId: number) => {
      if (!token) {
        throw new Error("Tu sesión no está disponible.");
      }

      setEliminandoAspectoId(aspectoId);

      try {
        await eliminarEvaluacionBorrador(
          gestionId,
          aspectoId,
          token
        );
        notificarCambioEvaluacionBorrador();
      } finally {
        setEliminandoAspectoId(null);
      }
    },
    [token]
  );

  return {
    eliminar,
    eliminandoAspectoId,
  };
}
