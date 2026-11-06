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
