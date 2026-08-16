const EVIDENCIA_EVALUACION_CAMBIO_EVENT =
  "stack44:evidencia-evaluacion-cambio";

export function notificarCambioEvidenciaEvaluacion(): void {
  window.dispatchEvent(
    new CustomEvent(EVIDENCIA_EVALUACION_CAMBIO_EVENT)
  );
}

export function escucharCambiosEvidenciaEvaluacion(
  listener: () => void
): () => void {
  window.addEventListener(
    EVIDENCIA_EVALUACION_CAMBIO_EVENT,
    listener
  );

  return () =>
    window.removeEventListener(
      EVIDENCIA_EVALUACION_CAMBIO_EVENT,
      listener
    );
}
