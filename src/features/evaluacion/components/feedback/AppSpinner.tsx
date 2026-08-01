interface Props {
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

const sizes = {
  sm: "h-3.5 w-3.5 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
};

export default function AppSpinner({
  size = "md",
  label = "Cargando",
  className = "",
}: Props) {
  return (
    <span
      role="status"
      aria-label={label}
      className={`inline-block shrink-0 animate-spin rounded-full border-current border-r-transparent bg-transparent ${sizes[size]} ${className}`}
    >
      <span className="sr-only">{label}</span>
    </span>
  );
}
