import type {
  MatrixVersionStatus,
  RecordStatus,
} from "../types/supermatriz.types";

export default function StatusBadge({
  status,
}: {
  status: RecordStatus | MatrixVersionStatus;
}) {
  const styles = {
    ACTIVO: "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
    INACTIVO: "border-neutral-700 bg-neutral-800 text-neutral-400",
    BORRADOR: "border-amber-500/20 bg-amber-500/10 text-amber-400",
    VIGENTE: "border-cyan-500/20 bg-cyan-500/10 text-cyan-400",
    CERRADA: "border-neutral-700 bg-neutral-800 text-neutral-400",
  }[status];

  const label =
    status === "CERRADA"
      ? "HISTÓRICA"
      : status;

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${styles}`}
    >
      {label}
    </span>
  );
}
