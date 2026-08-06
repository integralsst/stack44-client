import type {
  EstadoCompromiso,
  SemaforoCompromiso,
} from "../../types/consulta-compromisos.types";
import {
  CLASE_ESTADO_COMPROMISO,
  CLASE_SEMAFORO_COMPROMISO,
  ETIQUETA_ESTADO_COMPROMISO,
  ETIQUETA_SEMAFORO_COMPROMISO,
} from "../../presentacion/estado-compromiso";

interface EstadoBadgeProps {
  estado: EstadoCompromiso;
}

export function EstadoCompromisoBadge({
  estado,
}: EstadoBadgeProps) {
  return (
    <span
      className={
        "inline-flex min-h-7 items-center justify-center whitespace-nowrap rounded-full border px-3 py-1 text-center text-[11px] font-semibold leading-none " +
        CLASE_ESTADO_COMPROMISO[estado]
      }
    >
      {ETIQUETA_ESTADO_COMPROMISO[estado]}
    </span>
  );
}

interface SemaforoBadgeProps {
  semaforo: SemaforoCompromiso;
}

export function SemaforoCompromisoBadge({
  semaforo,
}: SemaforoBadgeProps) {
  return (
    <span
      className={
        "inline-flex min-h-7 items-center justify-center whitespace-nowrap rounded-full border px-3 py-1 text-center text-[11px] font-semibold leading-none " +
        CLASE_SEMAFORO_COMPROMISO[
          semaforo
        ]
      }
    >
      {
        ETIQUETA_SEMAFORO_COMPROMISO[
          semaforo
        ]
      }
    </span>
  );
}
