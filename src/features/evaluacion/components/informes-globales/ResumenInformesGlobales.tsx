import {
  Building2,
  Clock3,
  Files,
} from "lucide-react";

import type { InformesGlobalesResponse } from "../../types/informes-globales.types";

interface Props {
  resumen: InformesGlobalesResponse["resumen"] | null;
}

export default function ResumenInformesGlobales({ resumen }: Props) {
  const ultima = resumen?.ultimaGeneracion
    ? new Date(resumen.ultimaGeneracion).toLocaleString("es-CO")
    : "Sin versiones";

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <Metric
        icon={<Files size={17} />}
        label="Versiones"
        value={String(resumen?.totalVersiones ?? 0)}
      />
      <Metric
        icon={<Building2 size={17} />}
        label="Empresas con informes"
        value={String(resumen?.empresasConInformes ?? 0)}
      />
      <Metric
        icon={<Clock3 size={17} />}
        label="Última generación"
        value={ultima}
      />
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-[#101112] p-4">
      <div className="flex items-center gap-2 text-neutral-500">
        {icon}
        <span className="text-[10px] font-bold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <p className="mt-2 truncate text-lg font-semibold text-white" title={value}>
        {value}
      </p>
    </div>
  );
}