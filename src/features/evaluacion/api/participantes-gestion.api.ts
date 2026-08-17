import { apiRequest } from "../../../lib/api";
import type {
  ActualizarParticipanteGestionInput,
  CrearParticipanteGestionInput,
  EquipoGestionResponse,
  ParticipanteGestion,
  ProfesionalDisponibleGestion,
} from "../types/participantes-gestion.types";

export function obtenerEquipoGestion(
  gestionId: string,
  token: string
) {
  return apiRequest<EquipoGestionResponse>(
    `/api/evaluacion/gestiones/${gestionId}/participantes`,
    {},
    token
  );
}

export function obtenerProfesionalesDisponiblesGestion(
  gestionId: string,
  token: string
) {
  return apiRequest<ProfesionalDisponibleGestion[]>(
    `/api/evaluacion/gestiones/${gestionId}/participantes-disponibles`,
    {},
    token
  );
}

export function agregarParticipanteGestion(
  gestionId: string,
  data: CrearParticipanteGestionInput,
  token: string
) {
  return apiRequest<ParticipanteGestion>(
    `/api/evaluacion/gestiones/${gestionId}/participantes`,
    {
      method: "POST",
      body: JSON.stringify(data),
    },
    token
  );
}

export function actualizarParticipanteGestion(
  gestionId: string,
  participanteId: string,
  data: ActualizarParticipanteGestionInput,
  token: string
) {
  return apiRequest<ParticipanteGestion>(
    `/api/evaluacion/gestiones/${gestionId}/participantes/${participanteId}`,
    {
      method: "PATCH",
      body: JSON.stringify(data),
    },
    token
  );
}

export function retirarParticipanteGestion(
  gestionId: string,
  participanteId: string,
  token: string
) {
  return apiRequest<ParticipanteGestion>(
    `/api/evaluacion/gestiones/${gestionId}/participantes/${participanteId}/retirar`,
    {
      method: "POST",
    },
    token
  );
}
