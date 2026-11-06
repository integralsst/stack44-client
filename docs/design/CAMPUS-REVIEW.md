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
