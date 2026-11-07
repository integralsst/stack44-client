# Revisión V3 — movimiento natural, rendimiento y acabado, 7 de noviembre de 2026

Continuidad: rama `feat/premium-campus`, PR **#157 Draft**, base limpia `5862a77`. Se conservaron instrucciones de AGENTS, PNG originales, seis identidades, oficina elevada, funcionalidades y rutas de la landing. Sin nuevos personajes, edificios ni dependencias de runtime. No se fusiona ni se publica directamente a producción.

## Problemas encontrados y cambios

**A — Inicio:** la muestra V2 tardaba 11.77 s desde el primer render en anunciar una primera actividad. Las rutinas esperaban demasiado y el entorno inicial parecía detenido. El programador ahora inicia impresión a .18 s del reloj de escena, saludo inicial y café escalonado, independientemente del calentamiento de rendimiento. La pose inicial se prepara antes de dibujar. La medición de movimiento físico y la observación de estados se separan abajo.

**B — Caminatas:** el visitante del parqueadero se desplazaba con su marcha desactivada; las oscilaciones dependían del tiempo global. Se reemplazaron por cadencia según distancia, apoyo anclado y dos segmentos IK, con tobillos que mantienen suela nivelada y muestreo de punta/talón sobre escalones. Rutas suavizadas, aceleración/frenado, giros acotados, torso independiente y sillas recogidas durante salida/regreso. Se corrigieron cruces de reunión, rutas junto a impresora y entrega, y reservas de pasillos. Una solicitud en espera ya no arranca con un timestamp pasado al quedar libre la sala. Solicitar otra impresión cuando la primera regresa permite una repetición sin salto.

**C — Rendimiento/carga:** agrupación adicional de piezas rígidas bajo cada hueso (215 mallas de envío menos en el conjunto real), sin fusionar articulaciones. Rutas preparadas, búsqueda binaria, muestras y vectores reutilizados. Se sacaron los grandes literales LTC del JS a tablas binarias originales sin pérdida, cargadas una vez y verificadas bit a bit. Se retiró el MSAA redundante del canvas de escritorio, manteniendo MSAA 4 HDR; gradación editorial incorporada al OutputPass evita otra pasada completa. Iluminación, bloom, sombras y contenido premium permanecen.

**D — Acabado:** tres prioridades revisadas contra la imagen aprobada: lobby plano, copas demasiado uniformes y escala móvil. Se moderaron el punto y la difusión del acceso, se afinó el cristal, el tono mineral, las jambas y la fascia; copas compartidas ligeramente lobuladas y rotadas, sin añadir geometría; pintura menos especular. Móvil acerca el recorte inicial y centra el objetivo al seleccionar, con exploración lateral, teclado y reduced-motion conservados. El refinamiento es deliberadamente sutil; la mejora principal V3 está en actividad y fluidez.

## Evidencia visual y animada nueva

- [V2 base fresca, 1672×941](captures-v3/baseline-reference.png) → [V3 final, misma resolución](captures-v3/after-reference.png).
- [Escritorio final](captures-v3/after-desktop.png), [landing completa](captures-v3/desktop-full.png), [móvil final](captures-v3/after-mobile.png), [selección móvil de secretaria](captures-v3/mobile-secretary-focus.png).
- [Basamento](captures-v3/basement.png), [lobby](captures-v3/lobby.png), [escaleras](captures-v3/stairs.png), [jardín](captures-v3/garden.png), [parqueadero](captures-v3/parking.png), [transición](captures-v3/desktop-transition.png).
- [Caminatas, vídeo WebM de 9 s](captures-v3/walks.webm), [fotograma](captures-v3/early-walk.png), [auditoría de movimiento](captures-v3/animation-browser.json), [muestras originales NDJSON](captures-v3/motion-samples.ndjson).
- [Impresión](captures-v3/printing.png), [transporte](captures-v3/carrying.png), [entrega](captures-v3/delivery.png), [regreso](captures-v3/returned.png), [café](captures-v3/coffee.png), [reunión](captures-v3/meeting.png), [pérgola](captures-v3/pergola-rest.png), [faros](captures-v3/car-lights.png).

La base se capturó antes de editar, con V2 conservada en un build inmutable local. Vistas generales comparables: 1672×941, navegador DPR 1, misma dirección ortográfica, iluminación estable y poses iniciales mediante reduced-motion. Las poses V3 corrigen apoyos y el encuadre móvil cambia explícitamente; no son diferencias de píxeles con rigs idénticos. Detalles son recortes de la implementación, no renders sustitutivos. Las vistas native Metal finales se generan con `campus-v3-visual-qa.cjs`; las imágenes `desktop.png/mobile.png` de QA funcional usan SwiftShader y **no acreditan calidad ni FPS de hardware**.

Primera comparación D: cristal/floor del lobby aún parecía blanco plano; se volvió a revisar y oscureció el piso mineral, afinando perfiles. Después se repitieron capturas de detalles. El lobby conserva menos articulación y transparencia aparente que la referencia; no se marca equivalencia lograda.

## Medición comparable V2 → V3

Fuentes: [baseline-metrics.json](captures-v3/baseline-metrics.json), [final-metrics.json](captures-v3/final-metrics.json), [prueba alternada de carga](captures-v3/paired-readiness.json). Chrome headless nativo, ANGLE Metal **Apple M4**, sin throttling. FPS: viewport 1672×941, DPR efectivo 1, bloom activo, 5 s de calentamiento + 10 s de muestra, sin otro Chrome de QA simultáneo. Draw calls/triángulos son un fotograma observado, pueden variar con visibilidad/estado.

| Indicador | V2 base fresca | V3 final |
| --- | ---: | ---: |
| FPS escritorio | 55.12 | **60.09** |
| p95 / p99 frame | 33.3 / 33.4 ms | **16.7 / 16.8 ms** |
| Draw calls escritorio | 1,062 | **741** (−30.2%) |
| Triángulos escritorio | 774,787 | 785,398 (+1.4%, pies articulados) |
| Navegación → primer dibujo, mediana de 3 cargas frías locales | 602.7 ms | 596.0 ms |
| JS transferido en esas cargas | 427,781 B | 329,127 B |
| LTC separado transferido | incluido en JS | 90,331 B |
| JS + LTC | 427,781 B | 419,458 B (−1.9%) |
| Chunk 3D minificado / gzip | 918.30 / 280.82 kB | 680.79 / 182.15 kB, **más LTC** |
| Viewport móvil emulado, FPS / p95 | 60.10 / 16.7 ms | 60.04 / 16.7 ms |

El formato FP16 comprimido cuesta 40.05 kB y raw FP32 cuesta 131.07 kB cuando falta descompresión nativa; la reducción total anterior corresponde al formato FP32 comprimido que cargó este M4. PNG originales y otros recursos no se incluyen en JS+LTC. No se oculta el coste de las tablas separadas.

Una prueba adicional alternó tres cargas de cada build para reducir sesgo de orden: mediana navegación→primer dibujo **603.4→592.6 ms**; contexto WebGL preparado→primer dibujo **257.2→248.2 ms**. Esta segunda medida incluye construcción, solicitud LTC, compilación y primer envío gráfico, no solo tiempo CPU. Clic real→siguiente RAF tras insertar panel: mediana **32.8→32.8 ms**. La prueba principal registró además 50.9→45.1 ms de extremo a extremo de automatización, incluyendo espera de Playwright; no se interpreta como latencia pura de la app. La pequeña mejora de carga en localhost no acredita mejora bajo redes reales ni en hardware lento.

Inicio: el sondeo comparable de estados registró **11,765.7→535.6 ms** después del primer dibujo. Ese sondeo termina después de network-idle y no localiza el primer movimiento exacto. La auditoría física separada exige levantarse más de .02 unidades antes de 1 s, además de verificar el cambio de estado. La muestra final detectó el levantamiento físico a **382.4 ms** desde el primer render completado; inicialización desde setup hasta ese render **270.3 ms** en desarrollo. El resultado exacto está en `animation-browser.json`; el test determinista verifica movimiento significativo antes de .8 s. Ninguno espera al calentamiento gráfico de 5 s. Con reduced-motion no se exige movimiento.

Las muestras finitas del M4 cumplen el objetivo de escritorio, sin garantizar 60 FPS en todos los equipos. Móvil 390×844, navegador DPR 2 / efectivo 1.2 y sin bloom, está **emulado sobre GPU de escritorio**. Falta medir un teléfono físico compatible para certificar 30 FPS sostenidos.

## Pruebas y alcance real

- Build (TypeScript + Vite), `npx tsc -b`, ESLint del campus y `git diff --check`: correctos; continúa advertencia de chunk >500 kB.
- Lint global: **68 errores y 11 advertencias existentes fuera del campus**. No se declara verde el lint del frontend completo.
- `campus-v3-startup-check.cjs`: actividad significativa antes de .8 s, desfase entre rutinas y reduced-motion estático.
- `campus-v3-motion-check.cjs`: rigs reales durante 360 s a 60 Hz, nueve combinaciones de velocidad/FPS 30/60/120, distancia/cadencia coherente, caminar/parar/girar/sentarse/levantarse/escaleras/regresar. **78,318 frames móviles auditados**, ningún desplazamiento con piernas inmóviles; separación mínima entre protagonistas .925 unidades, máximo avance por frame .02086. Deslizamiento de apoyo y penetración del modelo de suelo quedan bajo tolerancia, con residuos numéricos ~10⁻¹⁵. No son una garantía universal: obstáculos usan envolventes simplificadas y recorridos finitos, no física general ni barrido exhaustivo de cualquier clic posible.
- `campus-behavior-check.cjs`: identidades, papel, documentos, entrega a Jesús, regreso, café, juntas, saludos, reduced-motion y repetición en retorno sin teletransporte.
- `campus-v3-render-check.cjs`: LUT FP32/FP16 idénticas bit a bit a Three.js; batching mantiene triángulos y jerarquía de articulaciones.
- `campus-v3-animation-qa.cjs`: Chrome nativo, movimiento físico inicial, posición contra articulaciones, parqueadero corregido, pausa y reanudación por reduced-motion, vídeo y errores de consola.
- `campus-v3-compat-qa.cjs`: carga FP16 y fallback sin DecompressionStream en navegador, selección móvil de secretaria/Hera/pérgola/vehículo centrada. [Resultados](captures-v3/compatibility.json).
- `campus-qa.cjs`: 15 objetivos por teclado/menú, recorrido de 7 pasos, /login, scroll y gesto táctil sobre canvas; sin overflow ni errores. [Resultados](captures-v3/qa.json).
- `campus-actions-qa.cjs`: seis personajes y cinco espacios por raycast, estados efectivos afirmados antes de cada captura de rutinas; sin errores. [Resultados](captures-v3/actions-qa.json).
- No se modificaron PNG ni duplicaron marcas; siguen un SIS trasero y un Stack44 en monumento. Inspector QA solo en desarrollo, nunca en producción.

## Evaluación editorial y pendientes

Revisión manual provisional sobre escala del DNA: arquitectura **22/25**, composición **18/20**, materiales **12/15**, iluminación **12/15**, personajes/interacción **14/15**, móvil/accesibilidad/rendimiento **7/10**: **85/100**. Es juicio editorial con las capturas enlazadas, **no test automático ni aprobación del usuario; objetivo ≥90 pendiente**.

Las tres diferencias principales restantes son profundidad/articulación del lobby, riqueza del rebote y contactos respecto al render offline, y siluetas aún estilizadas de copas/vehículos. Mejoró la variación vegetal sin aumentar vértices, pero no equivale al concepto. El vídeo muestra la marcha procedural; falta juicio visual del usuario sobre naturalidad y un teléfono físico para validar rendimiento, carga y gestos reales. No añadir densidad para ocultar estas diferencias ni sacrificar la actividad al perseguir fidelidad offline. PR #157 debe continuar Draft hasta revisión y aprobación.

---

# Archivo V2 — evidencia histórica, no validación de V3

# Revisión V2 — campus cinematográfico, 6 de noviembre de 2026

Rama conservada: `feat/premium-campus`. PR conservado: **#157**, en borrador. Punto de partida limpio: `af45336`. No se crean personajes, módulos o edificios; no se modifican los PNG de marca, las rutas funcionales ni producción.

## Comparación nueva, no evidencia reciclada

Se abrió y examinó de nuevo la referencia aprobada. Antes de editar se ejecutó Chrome y se capturó V1 otra vez: [1672×941](captures-v2/before-reference.png), [1440×900](captures-v2/before-desktop.png), [390×844](captures-v2/before-mobile.png). Estas imágenes son capturas nuevas de esta sesión, no copias de la entrega anterior.

Tres diferencias iniciales: oficina poco elevada, perímetro verde demasiado plano y predominio de luz ambiental sin irradiación arquitectónica convincente.

## Resultado y evidencia V2

- [Campus equivalente a la referencia, 1672×941](captures-v2/after-reference.png).
- [Escritorio, 1440×900](captures-v2/after-desktop.png) y [móvil, 390×844](captures-v2/after-mobile.png).
- [Basamento elevado](captures-v2/basement.png), [lobby](captures-v2/lobby.png), [escaleras LED](captures-v2/stairs.png), [jardín nocturno](captures-v2/garden.png), [parqueadero y reflejos](captures-v2/parking.png).
- [Transición escritorio](captures-v2/desktop-transition.png) y [transición móvil](captures-v2/mobile-transition.png).
- [Impresión](captures-v2/printing.png), [documentos en mano](captures-v2/carrying.png), [entrega](captures-v2/delivery.png), [regreso](captures-v2/returned.png), [café](captures-v2/coffee.png), [reunión](captures-v2/meeting.png), [descanso](captures-v2/pergola-rest.png), [faros](captures-v2/car-lights.png).

Antes/después: navegador DPR 1, resoluciones iguales, estado estático mediante reduced-motion, mismo renderizador Metal para la comparación general. La dirección de cámara se refina aproximadamente 1–2 grados y el encuadre se recalcula con los límites del conjunto elevado; no se presenta como comparación de píxeles con cámara idéntica. Los detalles son recortes de la captura V2 real, sin render sustitutivo. Las capturas de acciones se sincronizan con estados comprobados en el navegador.

## Cambios evaluados

| Criterio | Diferencia observada en V2 | Límite pendiente |
| --- | --- | --- |
| Jerarquía arquitectónica | Datum de oficina +1.30 sobre jardín -.98; losa gruesa, basamento pétreo retraído, abertura y escalera interior real | El concepto sigue teniendo una articulación de fachada más rica |
| Base | Silueta curva con hombros y acceso, canto biselado, estratos de piedra/metal/terreno | Algunos macizos y bordes aún se perciben demasiado regulares |
| Iluminación | Fuentes de área reales, luz interior, focos ascendentes, difusión bajo peldaños y muebles | Los proxies de contacto no reproducen rebote global ni AO volumétrica |
| Materiales | Microrelieve y rugosidad mineral, veta fina, metal champaña y clearcoat de vehículos | Las formas de las copas y automóviles conservan la estilización de minifiguras |
| Cristales y reflejos | Vidrio menos opaco, grosor de fachada, tiradores y entorno PMREM con tarjetas | Reflejo de estudio, sin reflejar dinámicamente cada objeto cercano |
| Acabado | HDR real, ACES, bloom por umbral de luminancia, separación cromática y viñeta discreta | En dispositivos lentos el perfil reduce resolución y retira bloom |
| Funciones | Seis personajes, impresión/entrega/café/juntas, raycasting, recorrido, scroll y login comprobados | Medición en teléfono físico pendiente |

La escala editorial 0–100 y objetivo ≥90 del manual se conservan. La puntuación provisional V1 que se archiva abajo no constituye evidencia ni aprobación de V2. Esta entrega se fundamenta en las comparaciones y pruebas descritas; no se transforma la revisión visual pendiente del usuario en una puntuación automática.

## Iteración visual efectuada

La primera pasada V2 corrigió alturas y base, pero dejó piedra sobreexpuesta, borde exterior demasiado claro y puntos calientes en nogal/pavimento. Se corrigieron esas tres diferencias mediante exposición/entorno más contenidos, canto de piedra oscura y sustitución de puntos posteriores por una fuente de área uniforme. Se pasó de luces sobre pavimento a focos ascendentes dirigidos a árboles. Después se repitieron las capturas y se revisaron fachada, caras, libros, escalinata y vehículos contra la referencia.

La segunda revisión técnica detectó que la compilación inicial de shaders causaba una bajada permanente de calidad. El perfil ahora espera cinco segundos antes de evaluar lentitud sostenida. La última muestra conserva bloom activo y DPR 1 en escritorio.

## Alturas, rutas y recursos

`office-upper-level` contiene arquitectura, seis rigs, escritorios, impresora y documentos. Las animaciones siguen usando sus coordenadas locales, sin escalar o recolocar individualmente a los protagonistas. Raycasting y destinos de cámara se convierten a coordenadas mundiales. El piso tiene un corte real de 3.1 unidades para el vuelo interior; se comprueba por raycast que el hueco está abierto y el pavimento adyacente mantiene su altura. Las rutas interiores no pasan por ese hueco. El visitante exterior sigue las cotas de la escalinata.

La agrupación estática elimina **1667 mallas de envío independientes**; deja fuera rigs, papel, documentos, testigos, cristales e instancias. Los mapas procedurales son de 256², compartidos y liberados al desmontar, al igual que los pases y el shadow map. Sin dependencias nuevas en V2. La luz de área usa el módulo LTC ya incluido en Three.js; aumenta el chunk diferido del hero a **918.30 kB / 280.82 kB gzip**, frente a aproximadamente 654 / 173 kB en V1. Es el coste de transferencia del acabado y debe seguir vigilándose.

## Verificaciones V2

- `npm run build`: TypeScript + Vite correctos; permanece advertencia de chunk >500 kB.
- `npx tsc -b`: correcto.
- `npx eslint src/features/landing/mini-office`: correcto.
- `npm run lint`: conserva 68 errores y 11 advertencias fuera del campus, sin nuevas incidencias en el alcance modificado.
- `git diff --check`: correcto.
- `node scripts/campus-behavior-check.cjs`: seis identidades, fases de impresión/entrega/regreso, taza de café, juntas, saludo, reduced-motion, altura mundial consistente y hueco de escalera real.
- `CAMPUS_QA_DIR=docs/design/captures-v2/ node scripts/campus-qa.cjs`: 15 objetivos, siete pasos del recorrido, /login, scroll, gesto táctil sobre canvas, sin desbordamiento ni errores. [Resultados](captures-v2/qa.json).
- `CAMPUS_QA_DIR=docs/design/captures-v2/ node scripts/campus-actions-qa.cjs`: clic directo a seis personajes y cinco espacios, estados de impresión/papel/documentos/entrega/café/juntas realmente afirmados antes de capturar, cotas mundiales comprobadas. [Resultados](captures-v2/actions-qa.json).
- `node scripts/campus-v2-qa.cjs --before` se ejecutó antes de editar; sin el argumento genera las vistas nuevas y los detalles.
- Inspección de QA habilitada únicamente por opt-in en desarrollo; la cadena `campus:inspect` está ausente del bundle de producción.

## FPS medidos, con calidad declarada

Fuente: [performance.json](captures-v2/performance.json). Chrome headless, ANGLE Metal Apple M4; cinco segundos de calentamiento y diez de muestra por perfil. Medición repetida sin otras capturas de Chrome simultáneas.

| Perfil | Resolución | DPR efectivo | Bloom | Media FPS | p95 frame |
| --- | --- | ---: | --- | ---: | ---: |
| Escritorio | 1672×941 | 1.0 | Activo | **55.36** | 33.3 ms |
| Móvil emulado sobre M4 | 390×844 | 1.2 | Omitido | **60.04** | 16.8 ms |

[Calidad real al final de la muestra de escritorio](captures-v2/desktop-live-quality.png) · [calidad móvil emulada](captures-v2/mobile-emulated-live-quality.png). El sample de escritorio cumple el intervalo medio objetivo 50–60, pero el p95 registra frames de 33 ms: no es una garantía de 60 FPS constantes. La muestra móvil es una emulación de viewport sobre GPU de escritorio y no acredita 30 FPS en un teléfono real.

## Pendientes de revisión

La mejora visible se concentra en niveles, canto arquitectónico, irradiación, acabados y HDR, conforme al alcance solicitado. La referencia offline conserva más riqueza de rebote/contacto y mayor organicidad de masas vegetales. No se agregaron elementos para esconder esas diferencias. Queda pendiente la revisión visual del usuario y probar un móvil físico antes de certificar su presupuesto. **PR #157 continúa en borrador; no fusionar ni publicar directamente en producción.**

---

# Archivo de revisión V1 — evidencia histórica

La sección siguiente se conserva como historial; sus capturas y puntuación no se presentan como validación de V2.

# Revisión del campus — 6 de noviembre de 2026

## Referencia y prioridades

La referencia original fue abierta y examinada visualmente antes de modificar código. Se preservó el PNG local sin seguimiento y se incorpora como fuente aprobada. Se confirmó que #156 estaba fusionado; `feat/premium-campus` parte de `origin/main` en `0691105`. No se alteraron cambios locales previos.

Tres diferencias prioritarias respecto a la oficina anterior:

1. Faltaba el vestíbulo delantero, con marquesina, vidrio y escalinata LED.
2. Faltaban la pérgola lateral, jardines de copas redondeadas, flores claras/lavanda y caminos curvos.
3. Faltaban el parqueadero con dos vehículos y la composición de plataforma completa.

## Decisiones

Se conserva el sistema de personajes y el controlador de comportamiento interior. No se mueven los seis escritorios, destinos de impresora/entrega, juntas o café. Se abre un hueco central real en la barandilla para conectar el vestíbulo. El campus comparte paleta y unidades con la oficina. El encuadre de escritorio usa los límites proyectados reales; móvil prioriza el interior y el lobby, con exploración lateral y sin deformar arquitectura o figuras.

La pérgola tiene un visitante sentado que se relaja al seleccionarla. Otros visitantes recorren senderos separados de las plazas. Los coches permanecen estacionados; sus faros se encienden gradualmente, evitando incorporar una trayectoria vehicular que invada caminos. Las balizas usan difusores emisivos y manchas suaves de luz, con una sola fuente de sombras principal. Copas, arbustos y flores se instancian; geometrías repetidas y materiales se comparten.

Los logos originales se cargan como PNG transparentes: solo se recorta el margen de píxeles completamente transparentes en tiempo de carga, sin modificar los archivos ni deformar su contenido. SIS aparece una vez en el cuadro posterior y Stack44 una vez en el monumento. Banderas, automóviles y pantallas no repiten las marcas. Señal P funcional discreta.

Se corrige además el repintado de texturas cargadas asíncronamente con reduced-motion: una escena estática ya renderizada debe actualizarse cuando termina de cargar un logo. La selección no abre paneles automáticamente; los espacios tienen también acceso por teclado mediante un menú nativo desplegable.

## Evidencia y comparación

- [Antes escritorio](captures/before-desktop.png), [después escritorio](captures/desktop.png).
- [Antes móvil](captures/before-mobile.png), [después móvil](captures/mobile.png).
- [Página completa escritorio](captures/desktop-full.png), [página completa móvil](captures/mobile-full.png).
- [Encuadre equivalente a la referencia, 1672×941](captures/reference-view.png).
- [Impresión](captures/printing.png), [transporte](captures/carrying.png), [entrega](captures/delivery.png), [regreso](captures/returned.png), [café](captures/coffee.png), [juntas](captures/meeting.png), [descanso](captures/pergola-rest.png), [faros](captures/car-lights.png).
- [Transición escritorio](captures/desktop-transition.png), [transición móvil](captures/mobile-transition.png).

Las comparaciones antes/después usan 1440×900 y 390×844, DPR 1 de navegador, cámara inicial adaptada a los nuevos límites. La cámara cambia deliberadamente para mostrar la nueva plataforma; no es una comparación de píxeles con cámara idéntica. El antes se tomó en la pose inicial con animación activa, y el después con reduced-motion para repetir el estado. Las capturas de acciones usan el reloj de Chrome; los estados se comprueban además con el rig/controlador real a tiempos fijos. No se confunde una captura bonita con una prueba funcional.

## Escala de revisión editorial

Escala permanente 0–100, objetivo ≥90. Esta autoevaluación del implementador es **subjetiva y provisional**; no es una comprobación automática, una certificación de fidelidad ni la aprobación del propietario.

| Criterio | Máximo | Revisión provisional | Evidencia / limitación |
| --- | ---: | ---: | --- |
| Arquitectura | 25 | 24 | Oficina posterior abierta, lobby central proporcionado, pérgola y acceso; la cubierta puede refinarse más. |
| Composición | 20 | 18 | Plataforma completa en escritorio, jerarquía interior y paisaje lateral; la referencia tiene una transición paisajística más orgánica. |
| Materiales | 15 | 13 | Nogal procedural, piedra, bronce, vidrio y tapicería; falta la sutileza mineral del render conceptual. |
| Iluminación | 15 | 13 | LEDs, balizas, entorno y sombras; la referencia conserva más rebote luminoso y contacto bajo vegetación. |
| Personajes e interacción | 15 | 14 | Seis identidades y ciclos conservados, visitantes, objetivos contextuales; refinamiento secundario de giros pendiente. |
| Móvil, accesibilidad y rendimiento | 10 | 8 | Proporciones uniformes, menú por teclado, scroll táctil y DPR adaptativo; rendimiento móvil real pendiente. |
| **Total editorial provisional** | **100** | **90** | **Requiere revisión visual del usuario. No equivale a un “test ≥90” aprobado.** |

## Validación técnica

- `npm run build`: TypeScript + Vite correctos. Advertencia de tamaño del chunk 3D (~655 kB minificado); se mantiene carga diferida del hero y no se añaden dependencias de producción. `playwright-core` se declara solo para desarrollo, sin descargar navegadores. Configurar `CHROME_PATH` para usar otra instalación de Chrome.
- `npx tsc -b`: correcto.
- `npx eslint src/features/landing/mini-office`: correcto.
- `npm run lint`: falla con 68 errores y 11 advertencias en archivos existentes fuera del campus. No se amplía el alcance para corregir componentes funcionales ajenos.
- `git diff --check`: correcto.
- `node scripts/campus-behavior-check.cjs`: seis identidades, impresión, documentos unidos a la mano, entrega, regreso a puesto, taza de café, juntas, saludos y reduced-motion.
- `node scripts/campus-qa.cjs`: Chrome a 1440×900 y 390×844; 15 objetivos contextuales, siete pasos del recorrido, /login, scroll, ausencia de desbordamiento y errores. El gesto táctil real emulado sobre el canvas desplaza la página.
- `node scripts/campus-actions-qa.cjs`: capturas de fases y raycasting de seis personajes, lobby, pérgola, monumento y dos vehículos. Compara los títulos exactos esperados.
- `node scripts/campus-reference-qa.cjs`: captura 1672×941 y muestra breve de renderizado, identificando el renderizador; resultado en `captures/render-sample.json`. No sustituye una medición sostenida de dispositivos móviles reales.

## Rendimiento y próximos ajustes

Objetivos: 50–60 FPS escritorio y 30 FPS móvil compatible. DPR inicial 1.6/1.2, reducción hasta .8 y retirada del bloom tras lentitud sostenida. Sin bloom móvil, sombras 2048/1024 y MSAA de escritorio. Muestra real de escritorio en este host: Chrome headless, ANGLE Metal sobre Apple M4, 1672×941, DPR 1, 8 s de calentamiento + 3 s de muestreo: **52.7 FPS de media**, p95 de frame **33.4 ms**. Cumple el intervalo objetivo en esta muestra breve; el p95 muestra fluctuaciones. No demuestra fluidez sostenida ni garantiza el presupuesto en otros dispositivos. El móvil de QA es emulado, por lo que 30 FPS en teléfono real sigue pendiente. Las pruebas funcionales principales usan SwiftShader para reproducibilidad; la muestra Metal se ejecuta por separado sin forzar software.

Pendientes de dirección de arte: más contacto suave bajo árboles/vehículos sin multiplicar luces, piedra con variación más fina, paisaje menos repetitivo en el borde delantero y ajuste de rotación al invertir rutas de visitantes. Mantener el edificio como protagonista y evaluar cada mejora con capturas equivalentes. La referencia conceptual conserva un nivel de iluminación de render offline que esta escena de tiempo real todavía puede aproximar más.

Se entrega en PR en borrador para revisión. No fusionar ni desplegar directamente a producción.
