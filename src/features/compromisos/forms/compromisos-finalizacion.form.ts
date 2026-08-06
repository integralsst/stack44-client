import type {
  CompromisoFinalizacionInput,
  EvaluacionPreparacionCompromiso,
  PreparacionFinalizacionResponse,
} from "../types/compromiso.types";
import type {
  CompromisosFinalizacionDraft,
} from "../types/compromiso-formulario.types";

export function fechaMinimaCompromiso(): string {
  const now = new Date();
  const offset = now.getTimezoneOffset();

  return new Date(now.getTime() - offset * 60_000)
    .toISOString()
    .slice(0, 10);
}

export function crearBorradoresCompromisos(
  preparacion: PreparacionFinalizacionResponse
): CompromisosFinalizacionDraft {
  return Object.fromEntries(
    preparacion.evaluaciones
      .filter((evaluacion) => evaluacion.accion === "CREAR")
      .map((evaluacion) => [
        evaluacion.evaluacionId,
        {
          descripcion: "",
          recursos: "",
          fechaLimite: "",
          responsablePrincipalId: "",
          actividadPrincipal: "",
          apoyos: [],
        },
      ])
  );
}

export function construirCompromisosFinalizacion(
  evaluaciones: EvaluacionPreparacionCompromiso[],
  borradores: CompromisosFinalizacionDraft
): CompromisoFinalizacionInput[] {
  return evaluaciones.map((evaluacion, index) => {
    const draft =
      borradores[evaluacion.evaluacionId];
    const etiqueta = `Compromiso ${index + 1}`;

    if (!draft) {
      throw new Error(
        `${etiqueta}: no fue posible preparar el formulario.`
      );
    }

    const descripcion = draft.descripcion.trim();
    const actividadPrincipal =
      draft.actividadPrincipal.trim();

    if (descripcion.length < 10) {
      throw new Error(
        `${etiqueta}: la descripción debe tener al menos 10 caracteres.`
      );
    }

    if (!draft.fechaLimite) {
      throw new Error(
        `${etiqueta}: selecciona una fecha límite.`
      );
    }

    if (!draft.responsablePrincipalId) {
      throw new Error(
        `${etiqueta}: selecciona el responsable principal.`
      );
    }

    if (actividadPrincipal.length < 5) {
      throw new Error(
        `${etiqueta}: la actividad del responsable principal debe tener al menos 5 caracteres.`
      );
    }

    const apoyos = draft.apoyos.map(
      (apoyo, apoyoIndex) => {
        const actividad = apoyo.actividad.trim();

        if (!apoyo.usuarioResponsableId) {
          throw new Error(
            `${etiqueta}: selecciona la persona del apoyo ${apoyoIndex + 1}.`
          );
        }

        if (actividad.length < 5) {
          throw new Error(
            `${etiqueta}: la actividad del apoyo ${apoyoIndex + 1} debe tener al menos 5 caracteres.`
          );
        }

        return {
          usuarioResponsableId:
            apoyo.usuarioResponsableId,
          tipo: "APOYO" as const,
          actividad,
        };
      }
    );

    const idsResponsables = [
      draft.responsablePrincipalId,
      ...apoyos.map(
        (apoyo) => apoyo.usuarioResponsableId
      ),
    ];

    if (
      new Set(idsResponsables).size !==
      idsResponsables.length
    ) {
      throw new Error(
        `${etiqueta}: una persona no puede repetirse como responsable principal y apoyo.`
      );
    }

    return {
      evaluacionId: evaluacion.evaluacionId,
      descripcion,
      recursos: draft.recursos.trim() || null,
      fechaLimite: draft.fechaLimite,
      responsables: [
        {
          usuarioResponsableId:
            draft.responsablePrincipalId,
          tipo: "PRINCIPAL",
          actividad: actividadPrincipal,
        },
        ...apoyos,
      ],
    };
  });
}
