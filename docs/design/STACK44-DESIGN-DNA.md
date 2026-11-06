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
| Nogal | #74482b / #321f17, veta sutil procedural, rugosidad .38–.43, relieve fino y mapa lineal de rugosidad |
| Piedra | #d8d0be / #f0e9da, textura mineral sutil, rugosidad .48–.53, relieve mineral y capa pulida moderada |
| Metal | #bfa57d champaña cepillado, #25292c oscuro, metalness controlada |
| Vidrio | #d7e6df, rugosidad .075, opacidad .19 y Fresnel, sin bloquear rostros |
| Vegetación | bosque, oliva, lima moderado; variación determinista por instancia |
| Flores | #9e85b6 y #f0e5c8, agrupadas en macizos arquitectónicos |
| Estudio | carbón #141918, transición inferior hacia la landing |

Iluminación cálida #ffc77f: tiras emisivas, balizas y pequeñas fuentes locales sin sombras. Una luz principal con sombras suaves, relleno y entorno de estudio; bloom HDR limitado (.16, umbral 1.4) y desactivado en móvil. No crear una luz con sombra por luminaria. No quemar blancos ni ocultar la madera.

## Marca y contenido

Exactamente una aparición SIS original atrás y una Stack44 original en monumento exterior, transparentes, centradas, sin deformación ni textos añadidos. Las banderas no llevan branding. No reconstruir los logotipos con texto. Los nombres y señales funcionales pueden aparecer. Los dashboards son explícitamente demostrativos; no sugieren acceso a datos reales.

## Movimiento e interacción

Visitantes pocos y secundarios; rig compartido con los profesionales. Rutas sobre senderos separados de jardines, vehículos y mobiliario. Velocidad aproximada .44 unidades/s, giro según tangente; reposo breve en pérgola. Vehículos estacionados con encendido gradual de faros. Cámara con amortiguación exponencial; no abrir paneles automáticamente. Respetar reduced-motion y navegación por teclado. Mantener impresión/entrega a Jesús, café, juntas, saludos, dashboards y recorrido guiado.

## Cámara, móvil y rendimiento

Encuadre ortográfico basado en proyección de límites reales del conjunto; escritorio muestra plataforma completa. Móvil prioriza oficina/lobby, conserva escala uniforme y permite exploración lateral. Evitar comprimir la arquitectura. Mantener scroll vertical normal y acceso a /login.

Presupuesto: 50–60 FPS escritorio, 30 FPS móvil compatible. DPR máximo inicial 1.6/1.2 y reducción gradual hasta .8 tras muestras sostenidas lentas. Instancing para copas, arbustos y flores; geometrías/materiales compartidos, shadow map 2048 escritorio / 1024 móvil, sin bloom móvil. Estas decisiones no prueban FPS: registrar dispositivo, navegador, renderizador, resolución y tiempos medidos. No presentar SwiftShader como hardware de un usuario real.

## Protocolo de evolución y evaluación

1. Abrir referencia y capturas actuales; identificar arquitectura, materiales y luz que definen su calidad.
2. Registrar las tres diferencias visuales principales antes de cambiar código.
3. Implementar con los tokens manteniendo proporciones y funciones.
4. Capturar antes/después con misma cámara, viewport, DPR, iluminación y estado de animación (preferir reduced-motion para comparación).
5. Revisar arquitectura (25), composición (20), materiales (15), iluminación (15), personajes/interacción (15), móvil/accesibilidad/rendimiento (10). Total 100, objetivo mínimo 90.
6. La puntuación es una revisión humana razonada con evidencias, nunca una verificación automática. Si falta medición, marcarla pendiente y no declarar el objetivo cumplido.
7. Build, TypeScript, ESLint, navegador real, scroll, login y todas las acciones. Comparar las capturas de nuevo y corregir diferencias importantes.
8. Registrar decisiones y pendientes en `CAMPUS-REVIEW.md`. Conservar evidencias versionadas. PR en borrador, sin fusión ni producción sin aprobación.


## Refinamiento V2 — niveles y acabado cinematográfico

Estas reglas precisan la implementación V2 y sustituyen los valores anteriores de altura e iluminación cuando corresponda. No se añaden personajes, módulos ni edificios.

| Nivel / elemento | Coordenada Y mundial |
| --- | ---: |
| Fondo inferior de la base | -1.68 |
| Jardín | -0.98 |
| Pavimento exterior | -0.85 |
| Piso del lobby | +0.05 |
| Datum de oficina / rigs | +1.30 |
| Superficie superior del piso de oficina | +1.2875 |

Arquitectura, seis rigs, escritorios, impresora y documentos comparten `office-upper-level`. Sus coordenadas y rutas interiores siguen siendo locales: nunca compensar la altura personaje por personaje. Los puntos de cámara y raycasting usan transformaciones mundiales. El basamento de piedra se retrae respecto a la losa superior y mantiene una abertura real de 3.1 unidades para la escalera interior. La escalinata exterior usa cinco contrahuellas de .15; la interior siete contrahuellas de (1.30−.05)/7. El visitante exterior sigue la altura de las huellas, no la altura interpolada de una curva a través de los escalones.

El perímetro conserva aproximadamente 32 × 24 unidades; tiene hombros curvos, entrante de acceso, zócalo oscuro, capa mineral y junta metálica fina. Evitar convertir el canto en un marco blanco luminoso. Las juntas del pavimento son discretas y se dibujan por instancing.

Materiales: mapas procedurales de 256² para albedo sRGB, microrelieve y rugosidad lineal. Nogal con veta longitudinal menos ondulada; bronce metalness .84, roughness .34; piedra roughness .48–.53 con clearcoat moderado; vidrio no metálico, IOR 1.48, opacidad .19, grosor .06 y reflejo de entorno. Vehículos con clearcoat 1, roughness .2 y cristales oscuros independientes. No modificar los PNG originales de marca.

Iluminación V2: una luz principal con sombras, relleno frío, hemisferio tenue, tres fuentes de área (pared posterior, oficina y escalinata), dos luces puntuales (lobby y pérgola) y dos focos ascendentes sin sombras en los árboles. Nueve fuentes directas sin contar el hemisferio, una sola con sombras. La luz de pared posterior debe ser uniforme: evitar manchas blancas sobre el nogal. Los focos ascendentes apuntan al tronco/copa, no al pavimento. Lobby, huellas y muebles combinan iluminación real y difusión de baja frecuencia con degradados. Las sombras de contacto son proxies suaves de superficie; no equivalen a AO volumétrica ni GI real.

Reflejos: entorno de estudio PMREM con tarjetas luminosas; afectan vidrio, metales y pintura PBR. Son reflejos de entorno, no reflejos dinámicos completos de todos los objetos del campus. El suelo de estudio limita su intensidad de entorno a .12 para evitar una gran mancha gris detrás de la maqueta.

Postprocesamiento de escritorio: render targets HDR HalfFloat con MSAA 4, ACES, exposición .94, bloom por luminancia HDR (umbral 1.4, fuerza .16), saturación .95, separación cromática fría en sombra y cálida en luces y viñeta .055. No usar render targets UnsignedByte para HDR: recortan los emisivos antes del tone mapping. Móvil conserva render directo ACES y omite el postprocesamiento. El perfil adaptativo espera cinco segundos de calentamiento para no degradar permanentemente la calidad por compilación inicial de shaders; después puede retirar bloom y reducir DPR; publicar FPS junto con el perfil realmente medido, nunca como rendimiento garantizado del máximo acabado.

Cámara: semillas de posición [10,23,37] escritorio / [0,25,31] móvil, dirección conservada al centrar sobre los límites; margen escritorio 1.025. La comparación V2 toma capturas nuevas con las mismas resoluciones, estado estático y DPR de navegador. El encuadre cambia con los límites del edificio elevado; documentar ese cambio, no afirmar cámaras idénticas.

Las mallas rígidas opacas se agrupan por material para compensar el coste del acabado. No agrupar rigs, papel, documentos, testigos animados, cristales, instancias o zonas de interacción. Liberar todos los mapas y pases al desmontar. Las inspecciones QA solo existen en desarrollo mediante petición explícita `?campusQA=1`; no forman parte de producción.
