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

    const unicas = [...aspectos.values()];
    const evidenciasPendientes = unicas.filter(
      (fila) => fila.evidenciaPendiente
    );

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
      evidenciasPendientes,
    };
  }, [filas]);

  const totalVigencia =
    resumen.faltaFecha + resumen.periodicidad;
  const totalEvidencias =
    resumen.evidenciasPendientes.length;

  if (totalVigencia === 0 && totalEvidencias === 0) {
    return null;
  }

  const partesVigencia: string[] = [];

  if (resumen.faltaFecha > 0) {
    partesVigencia.push(
      `${resumen.faltaFecha} sin fecha del documento`
    );
  }

  if (resumen.periodicidad > 0) {
    partesVigencia.push(
      `${resumen.periodicidad} sin periodicidad completa`
    );
  }

  const nombresPendientes = resumen.evidenciasPendientes
    .slice(0, 3)
    .map((fila) => fila.aspecto.nombre);
  const adicionales = Math.max(
    0,
    totalEvidencias - nombresPendientes.length
  );

  return (
    <div className="space-y-2 px-3 pt-3 sm:px-4">
      {totalEvidencias > 0 && (
        <AppAlert
          tone="warning"
          title={`${totalEvidencias} aspecto(s) tienen evidencia pendiente`}
          description={`Conservan su calificación en 5, pero requieren completar soporte documental. ${nombresPendientes.join(
            " · "
          )}${
            adicionales > 0
              ? ` · y ${adicionales} más`
              : ""
          }.`}
        />
      )}

      {totalVigencia > 0 && (
        <AppAlert
          tone="warning"
          title={`${totalVigencia} aspecto(s) requieren completar la vigencia`}
          description={`${partesVigencia.join(
            " · "
          )}. Abre o edita la evaluación correspondiente para completar la información.`}
        />
      )}
    </div>
  );
}
