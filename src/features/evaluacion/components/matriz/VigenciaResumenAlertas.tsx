import { useMemo } from "react";

import type { FilaEvaluacion } from "../../../../types/evaluacion.types";
import AppAlert from "../feedback/AppAlert";

export default function VigenciaResumenAlertas({
  filas,
}: {
  filas: FilaEvaluacion[];
}) {
  const resumen = useMemo(() => {
    const aspectos = new Map(
      filas.map((fila) => [
        fila.aspecto.id,
        fila,
      ])
    );

    const unicas = [
      ...aspectos.values(),
    ];

    return {
      faltaFecha: unicas.filter(
        (fila) =>
          fila.estadoVigencia ===
          "FALTA_FECHA_DOCUMENTO"
      ).length,
      periodicidad: unicas.filter(
        (fila) =>
          fila.estadoVigencia ===
          "PERIODICIDAD_NO_CONFIGURADA"
      ).length,
    };
  }, [filas]);

  const total =
    resumen.faltaFecha +
    resumen.periodicidad;

  if (total === 0) {
    return null;
  }

  const partes: string[] = [];

  if (resumen.faltaFecha > 0) {
    partes.push(
      `${resumen.faltaFecha} sin fecha del documento`
    );
  }

  if (resumen.periodicidad > 0) {
    partes.push(
      `${resumen.periodicidad} sin periodicidad completa`
    );
  }

  return (
    <AppAlert
      tone="warning"
      title={`${total} aspecto(s) requieren completar la vigencia`}
      description={`${partes.join(
        " · "
      )}. Abre o edita la evaluación correspondiente para completar la información.`}
      className="mx-3 mt-3 sm:mx-4"
    />
  );
}
