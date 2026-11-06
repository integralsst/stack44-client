export type OfficeTarget = 'Jesús' | 'Cristina' | 'Apolo' | 'Zeus' | 'Hera' | 'Secretaria' | 'dashboard' | 'meeting' | 'printer' | 'coffee' | 'lobby' | 'pergola' | 'monument' | 'car-dark' | 'car-silver';
export type OfficeLink = { label: string; href: string };
export type OfficeStory = { title: string; role: string; description: string; points: string[]; links: OfficeLink[] };

/** Demonstration copy only. Links lead to modules already present in the public landing. */
export const officeStories: Record<OfficeTarget, OfficeStory> = {
  lobby: { title: 'Bienvenido al campus', role: 'Vestíbulo de acceso', description: 'Entra y conoce al equipo de esta oficina interactiva.', points: ['Inicia el recorrido o selecciona a uno de los seis profesionales.', 'Experiencia demostrativa: los indicadores no son datos reales.'], links: [] },
  pergola: { title: 'Una pausa en el jardín', role: 'Zona de descanso', description: 'La pérgola invita a una breve pausa antes de continuar el recorrido.', points: ['Un visitante descansa unos segundos bajo la cubierta de nogal.'], links: [] },
  monument: { title: 'Conoce Stack44', role: 'Campus corporativo', description: 'Explora una forma cercana de conocer la gestión del SG-SST.', points: ['Selecciona personas, espacios y pantallas.', 'El recorrido es opcional y puedes cerrarlo en cualquier momento.'], links: [{label:'Explorar módulos',href:'#modulos'}] },
  'car-dark': { title: 'Llegada al campus', role: 'Parqueadero ejecutivo', description: 'Las luces de bienvenida se encienden suavemente al seleccionar el vehículo.', points: ['Vehículo de demostración, estacionado fuera de los senderos.'], links: [] },
  'car-silver': { title: 'Bienvenida ejecutiva', role: 'Parqueadero ejecutivo', description: 'El sedán ilumina sus faros mientras conoces el campus.', points: ['Continúa hacia el vestíbulo para iniciar el recorrido.'], links: [] },
  'Jesús': {
    title: 'Bienvenido a Stack44', role: 'Jesús · Gerencia',
    description: 'Conoce cómo dirigir y supervisar el SG-SST desde un solo lugar.',
    points: ['Vista de gestión para dar seguimiento al equipo.', 'Indicadores y tareas de ejemplo en esta oficina demostrativa.'],
    links: [{ label: 'Conocer la plataforma', href: '#modulos' }, { label: 'Ver indicadores', href: '#dashboard' }, { label: 'Solicitar asesoría', href: 'mailto:contacto@sis.com' }],
  },
  'Cristina': {
    title: 'Indicadores y control', role: 'Cristina · Gerencia',
    description: 'Una vista clara del avance y los compromisos facilita las decisiones del equipo.',
    points: ['Seguimiento del plan anual y del ciclo PHVA.', 'Gestión documental e indicadores ilustrativos.'],
    links: [{ label: 'Explorar indicadores', href: '#dashboard' }, { label: 'Ver módulos', href: '#modulos' }],
  },
  'Apolo': {
    title: 'Diagnóstico SG-SST', role: 'Apolo · Profesional SG-SST',
    description: 'Explora el diagnóstico público disponible en Stack44.',
    points: ['Evaluación guiada de demostración.', 'Los datos de la oficina son ilustrativos; no representan resultados reales.'],
    links: [{ label: 'Iniciar diagnóstico', href: '#diagnostico' }, { label: 'Conocer estándares', href: '/diagnostico' }],
  },
  'Zeus': {
    title: 'Plan de trabajo', role: 'Zeus · Coordinación SG-SST',
    description: 'Organiza compromisos, responsables y evidencias para dar continuidad al trabajo.',
    points: ['Planificación y seguimiento PHVA.', 'Responsables y evidencias dentro de los módulos de la plataforma.'],
    links: [{ label: 'Ver módulos', href: '#modulos' }, { label: 'Ver indicadores', href: '#dashboard' }],
  },
  'Hera': {
    title: 'Capacitación y mejora', role: 'Hera · Profesional SG-SST',
    description: 'Conoce el seguimiento de capacitaciones, inspecciones y acciones de mejora.',
    points: ['Capacitaciones e inspecciones.', 'Acciones correctivas y evidencias para el seguimiento.'],
    links: [{ label: 'Explorar módulos', href: '#modulos' }, { label: 'Solicitar asesoría', href: 'mailto:contacto@sis.com' }],
  },
  'Secretaria': {
    title: '¡Bienvenido a Stack44!', role: 'Recepción',
    description: '¿En qué podemos ayudarte? Elige un recorrido o explora la plataforma.',
    points: ['Evalúa tu empresa con el diagnóstico público.', 'Conoce a los profesionales de esta oficina interactiva.'],
    links: [{ label: 'Evaluar mi empresa', href: '#diagnostico' }, { label: 'Solicitar asesoría', href: 'mailto:contacto@sis.com' }],
  },
  dashboard: {
    title: 'Tablero SG-SST', role: 'Pantalla interactiva · Datos demostrativos',
    description: 'Los gráficos ilustran cómo se pueden leer tendencias y avances.',
    points: ['Plan anual: 87 % en esta demostración.', 'Seguimiento PHVA, inspecciones y acciones pendientes.'],
    links: [{ label: 'Ver tablero de muestra', href: '#dashboard' }],
  },
  meeting: {
    title: 'Trabajo colaborativo', role: 'Sala de juntas',
    description: 'El equipo revisa compromisos, responsables y avances del plan de trabajo.',
    points: ['Reunión breve y seguimiento de tareas.', 'Pantallas con datos ilustrativos.'],
    links: [{ label: 'Conocer los módulos', href: '#modulos' }],
  },
  printer: {
    title: 'Documentos en movimiento', role: 'Estación de impresión',
    description: 'La secretaria prepara y entrega documentos a gerencia.',
    points: ['Observa el trayecto desde la impresora hasta el escritorio de Jesús.'], links: [],
  },
  coffee: {
    title: 'Pausa de café', role: 'Zona de descanso',
    description: 'Apolo toma una breve pausa y después regresa a su puesto.',
    points: ['La taza acompaña su mano durante la animación.'], links: [],
  },
};

export const tourStops: OfficeTarget[] = ['Secretaria', 'Jesús', 'Cristina', 'Apolo', 'Zeus', 'Hera', 'dashboard'];
