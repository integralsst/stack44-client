import BandejaCompromisos from "../components/bandeja/BandejaCompromisos";

export default function CompromisosPage() {
  return (
    <BandejaCompromisos
      alcance="SUPERVISION"
      title="Compromisos"
      description="Supervisa los compromisos de las empresas dentro de tu alcance, identifica vencimientos y revisa responsables, actividades y trazabilidad."
      detalleBasePath="/dashboard/compromisos"
    />
  );
}
