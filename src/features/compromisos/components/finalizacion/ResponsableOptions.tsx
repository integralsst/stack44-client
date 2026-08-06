import type {
  ResponsableDisponibleCompromiso,
} from "../../types/compromiso.types";

interface Props {
  responsables: ResponsableDisponibleCompromiso[];
}

export default function ResponsableOptions({
  responsables,
}: Props) {
  const internos = responsables.filter(
    (responsable) => responsable.tipoActor === "INTERNO"
  );
  const clientes = responsables.filter(
    (responsable) => responsable.tipoActor === "CLIENTE"
  );

  return (
    <>
      {internos.length > 0 && (
        <optgroup label="Equipo interno">
          {internos.map((responsable) => (
            <option
              key={responsable.id}
              value={responsable.id}
            >
              {responsable.nombre} ·{" "}
              {responsable.rol.replaceAll("_", " ")}
            </option>
          ))}
        </optgroup>
      )}

      {clientes.length > 0 && (
        <optgroup label="Equipo de la empresa">
          {clientes.map((responsable) => (
            <option
              key={responsable.id}
              value={responsable.id}
            >
              {responsable.nombre} ·{" "}
              {responsable.rol.replaceAll("_", " ")}
            </option>
          ))}
        </optgroup>
      )}
    </>
  );
}
