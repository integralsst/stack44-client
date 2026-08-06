import type { ReactNode } from "react";

interface Props {
  label: string;
  required?: boolean;
  children: ReactNode;
}

export default function CampoCompromiso({
  label,
  required = false,
  children,
}: Props) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
        {required ? " *" : ""}
      </span>
      {children}
    </label>
  );
}
