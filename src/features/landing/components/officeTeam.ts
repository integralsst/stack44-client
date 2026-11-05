/**
 * Identidades ficticias para una simulación visual de operación SG-SST.
 * No son registros, chat ni actividad real de personas.
 */
export const OFFICE_TEAM = [
  {
    name: "Jesús",
    title: "Gerente",
    x: -15,
    z: -11.25,
    role: "management",
    line: "Cristina, revisemos el cumplimiento del plan anual.",
  },
  {
    name: "Cristina",
    title: "Gerente",
    x: -3.8,
    z: -11.25,
    role: "management",
    line: "Prioricemos acciones, responsables y evidencias.",
  },
  {
    name: "Apolo",
    title: "Profesional SG-SST",
    x: 9,
    z: -11.25,
    role: "operations",
    line: "Actualicé la identificación de peligros y controles.",
  },
  {
    name: "Zeus",
    title: "Coordinador SG-SST",
    x: 14.45,
    z: -11.25,
    role: "operations",
    line: "Consolidé las inspecciones y los compromisos PHVA.",
  },
  {
    name: "Hera",
    title: "Profesional SG-SST",
    x: 19.7,
    z: -11.25,
    role: "operations",
    line: "Estoy organizando capacitaciones e indicadores.",
  },
] as const;

export const VISITOR_TEAM = [
  { name: "Valentina", title: "Cliente empresarial", style: 5 },
  { name: "Mateo", title: "Cliente corporativo", style: 6 },
  { name: "Laura", title: "Cliente de consultoría", style: 7 },
] as const;
