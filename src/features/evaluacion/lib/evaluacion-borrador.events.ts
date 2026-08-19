const EVALUACION_BORRADOR_CAMBIO_EVENT =
  "stack44:evaluacion-borrador-cambio";

export function notificarCambioEvaluacionBorrador(): void {
  window.dispatchEvent(
    new CustomEvent(EVALUACION_BORRADOR_CAMBIO_EVENT)
  );
}

export function escucharCambiosEvaluacionBorrador(
  listener: () => void
): () => void {
  window.addEventListener(
    EVALUACION_BORRADOR_CAMBIO_EVENT,
    listener
  );

  return () =>
    window.removeEventListener(
      EVALUACION_BORRADOR_CAMBIO_EVENT,
      listener
    );
}
