export type NivelAlertaCompromiso =
  | "ALTA"
  | "MEDIA"
  | "BAJA";

export interface AlertaCompromiso {
  id: string;
  compromisoId: string;
  tipo: string;
  nivel: NivelAlertaCompromiso;
  titulo: string;
  descripcion: string;
  empresa: {
    id: string;
    nombre: string;
  };
  aspecto: {
    id: number;
    nombre: string;
  };
  fechaLimite: string;
  accion: {
    etiqueta: string;
    ruta: string;
  };
}

export interface AlertasCompromisosResponse {
  resumen: {
    total: number;
    urgentes: number;
  };
  alertas: AlertaCompromiso[];
  generadasEn: string;
}
