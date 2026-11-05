import { OFFICE_TEAM, VISITOR_TEAM } from "./officeTeam";

/**
 * Coreografía causal y determinista del campus. Una misma línea de tiempo
 * coordina reuniones, trabajo, paseo al lounge y visitas de clientes.
 * NO conecta con usuarios, cámaras, calendarios, sistemas ni datos reales.
 */
export type OfficeAction = "work" | "walk" | "talk" | "meet" | "relax" | "greet";
export type OfficePose = {
  x: number;
  z: number;
  yaw: number;
  walking: boolean;
  visible: boolean;
  action: OfficeAction;
};

type Stop = {
  t: number;
  x: number;
  z: number;
  action: OfficeAction;
};
const stop = (t: number, x: number, z: number, action: OfficeAction = "walk"): Stop =>
  ({ t, x, z, action });

const home = OFFICE_TEAM.map((x) => [x.x, x.z] as const);
const schedules: Stop[][] = [
  // Jesús: dirige desde su despacho, baja a reunión y regresa.
  [
    stop(0, ...home[0], "work"), stop(11, ...home[0], "work"),
    stop(18, -14.2, -6.5), stop(24, -8.8, -1.0), stop(31, -4.2, 0.9, "meet"),
    stop(45, -4.2, 0.9, "meet"), stop(52, -8.8, -1.0),
    stop(60, ...home[0], "work"), stop(119.9, ...home[0], "work"),
  ],
  // Cristina: presenta avances, participa en junta y vuelve a gerencia.
  [
    stop(0, ...home[1], "work"), stop(15, ...home[1], "work"),
    stop(21, -3.7, -6.5), stop(27, -1.65, 1.35, "meet"),
    stop(45, -1.65, 1.35, "meet"), stop(50, -3.7, -6.5),
    stop(57, ...home[1], "work"), stop(91, ...home[1], "work"),
    stop(96, -5.9, -6.0), stop(103, -10.0, 7.8, "relax"),
    stop(108, -10.0, 7.8, "relax"),
    stop(114, -6.1, -5.8), stop(119.9, ...home[1], "work"),
  ],
  // Apolo: pasa de la matriz de riesgos a la reunión y luego al lounge.
  [
    stop(0, ...home[2], "work"), stop(21, ...home[2], "work"),
    stop(28, 9.0, -6.2), stop(35, 3.15, 0.8, "meet"),
    stop(45, 3.15, 0.8, "meet"), stop(52, 8.8, -5.9),
    stop(57, ...home[2], "work"), stop(80, ...home[2], "work"),
    stop(87, 9.2, -3.0), stop(94, 8.5, 9.0, "relax"),
    stop(101, 8.5, 9.0, "relax"),
    stop(110, 9.1, -3.3), stop(119.9, ...home[2], "work"),
  ],
  // Zeus: realiza seguimiento en su estación y pasa a la junta.
  [
    stop(0, ...home[3], "work"), stop(34, ...home[3], "work"),
    stop(40, 13.0, -5.4), stop(46, 5.05, 2.65, "meet"),
    stop(55, 5.05, 2.65, "meet"),
    stop(63, 12.6, -5.2), stop(69, ...home[3], "work"),
    stop(119.9, ...home[3], "work"),
  ],
  // Hera: termina el control de evidencias y se reúne con la coordinación.
  [
    stop(0, ...home[4], "work"), stop(40, ...home[4], "work"),
    stop(47, 17.3, -5.5), stop(54, 5.0, -0.25, "meet"),
    stop(60, 5.0, -0.25, "meet"), stop(68, 16.8, -5.5),
    stop(75, ...home[4], "work"), stop(119.9, ...home[4], "work"),
  ],
  // Clienta 1: entra, pasa por recepción, participa en reunión y sale.
  [
    stop(0, -1.0, 22.0, "walk"), stop(7, -1.0, 22.0, "walk"),
    stop(14, -1.0, 9.0), stop(20, -5.3, 5.0, "greet"),
    stop(25, -5.3, 5.0, "greet"), stop(31, -5.8, 2.4, "meet"),
    stop(45, -5.8, 2.4, "meet"), stop(54, -1.2, 9.8),
    stop(62, -1.0, 22.0, "walk"),
    stop(119.9, -1.0, 22.0, "walk"),
  ],
  // Cliente 2: entra después y consulta con operaciones SST.
  [
    stop(0, 1.2, 22.0), stop(30, 1.2, 22.0),
    stop(37, 1.2, 9.0), stop(43, 8.0, 5.3, "greet"),
    stop(49, 8.0, 5.3, "greet"), stop(56, 9.4, -3.4, "meet"),
    stop(65, 9.4, -3.4, "meet"), stop(72, 1.2, 9.0),
    stop(81, 1.2, 22.0), stop(119.9, 1.2, 22.0),
  ],
  // Clienta 3: llega al lounge, conversa y se retira.
  [
    stop(0, 0.0, 22.0), stop(65, 0.0, 22.0),
    stop(72, 0.0, 9.3), stop(79, -9.5, 8.2, "relax"),
    stop(97, -9.5, 8.2, "relax"),
    stop(107, 0.0, 9.0), stop(116, 0.0, 22.0),
    stop(119.9, 0.0, 22.0),
  ],
];

const visibility: Array<[number, number]> = [
  [0, 120], [0, 120], [0, 120], [0, 120], [0, 120],
  [7, 62], [30, 81], [65, 116],
];

export const OFFICE_CYCLE_SECONDS = 120;
export const ACTOR_NAMES = [
  ...OFFICE_TEAM.map((m) => m.name),
  ...VISITOR_TEAM.map((m) => m.name),
];

const smooth = (x: number) => {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
};

export function getOfficePose(actor: number, elapsed: number): OfficePose {
  const timeline = schedules[actor] ?? schedules[0];
  const t = ((elapsed % OFFICE_CYCLE_SECONDS) + OFFICE_CYCLE_SECONDS) %
    OFFICE_CYCLE_SECONDS;
  let begin = timeline[0];
  let end = timeline[timeline.length - 1];
  for (let i = 1; i < timeline.length; i += 1) {
    if (t <= timeline[i].t) {
      begin = timeline[i - 1];
      end = timeline[i];
      break;
    }
  }
  const seconds = Math.max(0.001, end.t - begin.t);
  const amount = smooth((t - begin.t) / seconds);
  const x = begin.x + (end.x - begin.x) * amount;
  const z = begin.z + (end.z - begin.z) * amount;
  const vx = end.x - begin.x;
  const vz = end.z - begin.z;
  const walking = Math.hypot(vx, vz) >= 0.35 && amount > 0.015 && amount < 0.985;
  const range = visibility[actor] ?? visibility[0];
  return {
    x, z,
    yaw: walking ? Math.atan2(vx, vz) : 0,
    walking,
    visible: t >= range[0] && t <= range[1],
    action: walking ? "walk" : end.action,
  };
}

export type OfficeDialogue = {
  actor: number;
  text: string;
  speaker: string;
  role: string;
};

const DIALOGUES: Array<{ from: number; to: number; actor: number; text: string }> = [
  { from: 2, to: 9, actor: 0, text: "Cristina, revisemos los avances del plan anual." },
  { from: 9, to: 16, actor: 1, text: "Tenemos pendientes de auditoría y mejora continua." },
  { from: 16, to: 23, actor: 2, text: "El mapa de riesgos ya está actualizado." },
  { from: 23, to: 30, actor: 5, text: "Buenos días. Venimos a revisar nuestro SG-SST." },
  { from: 30, to: 37, actor: 0, text: "Bienvenidos. Miremos el tablero de cumplimiento." },
  { from: 37, to: 44, actor: 1, text: "Definamos fechas, responsables y seguimiento." },
  { from: 44, to: 51, actor: 3, text: "Verifiqué inspecciones y compromisos PHVA." },
  { from: 51, to: 58, actor: 4, text: "Puedo mostrar las evidencias de capacitación." },
  { from: 58, to: 65, actor: 6, text: "Excelente, necesitamos el plan de acción." },
  { from: 65, to: 72, actor: 2, text: "Prioricemos controles en cada proceso." },
  { from: 72, to: 79, actor: 7, text: "Gracias por recibirnos; volveremos a evaluar." },
  { from: 79, to: 86, actor: 4, text: "Los indicadores se actualizan por cada período." },
  { from: 86, to: 93, actor: 2, text: "Nos vemos en la revisión del comité." },
  { from: 93, to: 100, actor: 1, text: "La trazabilidad queda en la bitácora." },
  { from: 100, to: 108, actor: 3, text: "El seguimiento preventivo sigue en marcha." },
  { from: 108, to: 116, actor: 0, text: "El objetivo es convertir planes en resultados." },
];

export function getOfficeDialogue(elapsed: number): OfficeDialogue | null {
  const t = ((elapsed % OFFICE_CYCLE_SECONDS) + OFFICE_CYCLE_SECONDS) %
    OFFICE_CYCLE_SECONDS;
  const item = DIALOGUES.find((entry) => t >= entry.from && t < entry.to);
  if (!item) return null;
  const member = item.actor < OFFICE_TEAM.length
    ? OFFICE_TEAM[item.actor]
    : VISITOR_TEAM[item.actor - OFFICE_TEAM.length];
  if (!member) return null;
  return {
    actor: item.actor,
    text: item.text,
    speaker: member.name,
    role: member.title,
  };
}
