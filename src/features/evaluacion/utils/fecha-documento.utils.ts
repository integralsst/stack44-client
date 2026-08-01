export function normalizarFechaInput(
  value: string | null | undefined
): string {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

export function esFechaInputValida(
  value: string
): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T12:00:00.000Z`);

  return !Number.isNaN(date.getTime());
}

export function formatearFechaInput(
  value: string,
  locale = "es-CO"
): string {
  if (!esFechaInputValida(value)) {
    return "Seleccionar fecha";
  }

  return new Date(
    `${value}T12:00:00.000Z`
  ).toLocaleDateString(locale);
}

export function existeCambioFechaDocumento(
  valorActual: string,
  valorGuardado: string | null | undefined
): boolean {
  return (
    normalizarFechaInput(valorActual) !==
    normalizarFechaInput(valorGuardado)
  );
}
