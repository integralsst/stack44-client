import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ListChecks,
} from "lucide-react";

import type { ResumenCentroAcciones } from "../types/centro-acciones.types";

export default function ResumenAccionesBar({
  resumen,
}: {
  resumen: ResumenCentroAcciones;
}) {
  const items = [
    {
      label: "Acciones",
      valor: resumen.total,
      icon: ListChecks,
      className: "text-slate-700 bg-slate-100",
    },
    {
      label: "Urgentes",
      valor: resumen.urgentes,
      icon: AlertTriangle,
      className: "text-red-700 bg-red-50",
    },
    {
      label: "Empresas pendientes",
      valor: resumen.empresasConAcciones,
      icon: Building2,
      className: "text-amber-700 bg-amber-50",
    },
    {
      label: "Al día",
      valor: resumen.empresasAlDia,
      icon: CheckCircle2,
      className: "text-emerald-700 bg-emerald-50",
    },
  ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
          >
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.className}`}
            >
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xl font-black leading-none text-slate-950">
                {item.valor}
              </p>
              <p className="mt-1 truncate text-[11px] font-semibold text-slate-500">
                {item.label}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
