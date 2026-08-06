import BandejaCompromisos from "../components/bandeja/BandejaCompromisos";

export default function MisCompromisosPage() {
  return (
    <BandejaCompromisos
      alcance="MIS_COMPROMISOS"
      title="Mis compromisos"
      description="Consulta las actividades donde apareces como responsable principal o de apoyo, con su empresa, fecha límite y estado actual."
      detalleBasePath="/dashboard/mis-compromisos"
    />
  );
}
