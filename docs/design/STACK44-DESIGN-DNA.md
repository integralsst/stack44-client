# Stack44 — dirección de arte permanente

## Fuente visual y criterio

Abrir y examinar visualmente `referencias-diseno/campus-premium-referencia.png` antes de cada expansión. Es una maqueta arquitectónica corporativa de noche, horizontal, vista elevada de tres cuartos. La geometría real es obligatoria: nunca sustituirla por una imagen de fondo. La oficina debe dominar sobre el paisaje. Más objetos no equivalen a mayor calidad.

## Jerarquía y proporciones

1. Oficina abierta elevada detrás: nogal, listones verticales, borde LED continuo, escritorios claros, gerencia atrás y equipo operativo delante. Seis protagonistas con nombres y puestos.
2. Vestíbulo central delantero compacto: vidrio, metal oscuro, bronce, cubierta de listones, dos macetas y escalinata iluminada. Su cubierta debe dejar visibles los rostros interiores.
3. Paisaje organizado que enmarca: pérgola izquierda, árboles de copas redondeadas, bordes curvos, arbustos contenidos y flores lavanda/blanco cálido. Dos coches estilizados a la derecha.

Unidad de escena aproximadamente métrica. Conservar las coordenadas interiores y sus destinos animados al ampliar el exterior. Plataforma 32 × 24; oficina 20.25 × 12; lobby 7 × 3.4 y altura 2.6; figuras principales sin deformación por viewport. Evitar cambios de escala independientes entre muebles y personajes.

## Tokens y materiales

Fuente reutilizable: `src/features/landing/mini-office/campusDesignTokens.ts`; los materiales interiores consumen la misma paleta.

| Familia | Dirección |
| --- | --- |
| Nogal | #74482b / #321f17, veta sutil procedural, rugosidad .38–.4 |
| Piedra | #d8d0be / #f0e9da, textura mineral sutil, rugosidad .68–.84 |
| Metal | #d6a75b champaña, #25292c oscuro, metalness controlada |
| Vidrio | #acc9c4, rugosidad .1, transparencia discreta, sin bloquear rostros |
| Vegetación | bosque, oliva, lima moderado; variación determinista por instancia |
| Flores | #9e85b6 y #f0e5c8, agrupadas en macizos arquitectónicos |
| Estudio | carbón #141918, transición inferior hacia la landing |

Iluminación cálida #ffc77f: tiras emisivas, balizas y pequeñas fuentes locales sin sombras. Una luz principal con sombras suaves, relleno y entorno de estudio; bloom limitado (.13) y desactivado en móvil. No crear una luz con sombra por luminaria. No quemar blancos ni ocultar la madera.

## Marca y contenido

Exactamente una aparición SIS original atrás y una Stack44 original en monumento exterior, transparentes, centradas, sin deformación ni textos añadidos. Las banderas no llevan branding. No reconstruir los logotipos con texto. Los nombres y señales funcionales pueden aparecer. Los dashboards son explícitamente demostrativos; no sugieren acceso a datos reales.

## Movimiento e interacción

Visitantes pocos y secundarios; rig compartido con los profesionales. Rutas sobre senderos separados de jardines, vehículos y mobiliario. Velocidad aproximada .44 unidades/s, giro según tangente; reposo breve en pérgola. Vehículos estacionados con encendido gradual de faros. Cámara con amortiguación exponencial; no abrir paneles automáticamente. Respetar reduced-motion y navegación por teclado. Mantener impresión/entrega a Jesús, café, juntas, saludos, dashboards y recorrido guiado.

## Cámara, móvil y rendimiento

Encuadre ortográfico basado en proyección de límites reales del conjunto; escritorio muestra plataforma completa. Móvil prioriza oficina/lobby, conserva escala uniforme y permite exploración lateral. Evitar comprimir la arquitectura. Mantener scroll vertical normal y acceso a /login.

Presupuesto: 50–60 FPS escritorio, 30 FPS móvil compatible. DPR inicial 1.6/1.2 y reducción gradual hasta .8 tras muestras sostenidas lentas. Instancing para copas, arbustos y flores; geometrías/materiales compartidos, shadow map 2048 escritorio / 1024 móvil, sin bloom móvil. Estas decisiones no prueban FPS: registrar dispositivo, navegador, renderizador, resolución y tiempos medidos. No presentar SwiftShader como hardware de un usuario real.

## Protocolo de evolución y evaluación

1. Abrir referencia y capturas actuales; identificar arquitectura, materiales y luz que definen su calidad.
2. Registrar las tres diferencias visuales principales antes de cambiar código.
3. Implementar con los tokens manteniendo proporciones y funciones.
4. Capturar antes/después con misma cámara, viewport, DPR, iluminación y estado de animación (preferir reduced-motion para comparación).
5. Revisar arquitectura (25), composición (20), materiales (15), iluminación (15), personajes/interacción (15), móvil/accesibilidad/rendimiento (10). Total 100, objetivo mínimo 90.
6. La puntuación es una revisión humana razonada con evidencias, nunca una verificación automática. Si falta medición, marcarla pendiente y no declarar el objetivo cumplido.
7. Build, TypeScript, ESLint, navegador real, scroll, login y todas las acciones. Comparar las capturas de nuevo y corregir diferencias importantes.
8. Registrar decisiones y pendientes en `CAMPUS-REVIEW.md`. Conservar evidencias versionadas. PR en borrador, sin fusión ni producción sin aprobación.
