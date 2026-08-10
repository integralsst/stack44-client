export function decisionNoAplicaClass(estado: string) {
  if (estado === "APROBADO") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (estado === "RECHAZADO") {
    return "border-red-200 bg-red-50 text-red-800";
  }

  return "border-amber-200 bg-amber-50 text-amber-800";
}

export function decisionNoAplicaLabel(estado: string) {
  if (estado === "APROBADO") return "No aplica aprobado";
  if (estado === "RECHAZADO") return "No aplica rechazado";
  return "No aplica pendiente";
}
