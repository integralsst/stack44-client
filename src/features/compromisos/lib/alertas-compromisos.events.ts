export const COMPROMISOS_ACTUALIZADOS_EVENT =
  "stack44:compromisos-actualizados";

export function notificarCambioCompromisos(): void {
  window.dispatchEvent(
    new CustomEvent(COMPROMISOS_ACTUALIZADOS_EVENT)
  );
}
