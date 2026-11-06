# Stack44 · oficina miniatura 3D

Esta carpeta reúne capturas **reales de Chrome** de las iteraciones del hero. Las imágenes conceptuales proporcionadas por el usuario sirvieron como dirección artística; la escena y el mobiliario son originales.

## Capturas

| Vista | Captura |
| --- | --- |
| Primera versión | [before.png](before.png) |
| Nueva oficina en escritorio, 1440 × 900 | [desktop.png](desktop.png) |
| Primer plano de personajes y escritorios | [detail.png](detail.png) |
| Nueva oficina en móvil, 390 × 844 | [mobile.png](mobile.png) |
| Conversación y reunión | [meeting.png](meeting.png) |
| Zona de café | [coffee.png](coffee.png) |

### Iteración de oficina ampliada

| Vista | Captura |
| --- | --- |
| Oficina completa, 1440 × 900 | [desktop-v3.png](desktop-v3.png) |
| Móvil, 390 × 844 | [mobile-v3.png](mobile-v3.png) |
| Sala de juntas con Zeus y Hera | [meeting-v3.png](meeting-v3.png) |
| Reunión de Jesús y Cristina | [managers-v3.png](managers-v3.png) |
| Apolo en el café | [coffee-v3.png](coffee-v3.png) |
| Jardín y borde del diorama | [exterior-v3.png](exterior-v3.png) |
| Rostros, escritorios y cinco placas | [nameplates-v3.png](nameplates-v3.png) |

La planta ampliada mide aproximadamente 20,25 × 12 unidades, con jardín exterior de 24 × 16,1. En móvil se distribuye en una proporción más estrecha y profunda para mostrar las cinco figuras y las cuatro áreas. La cámara ortográfica admite un giro suave en escritorio y desplazamiento horizontal en móvil.

La escena usa nogal con textura procedural, piedra, vidrio, metal, iluminación cálida, reflejos de entorno y un resplandor limitado a las luces. Los cinco personajes procedurales tienen rasgos, peinados, ropa y accesorios distintos. Su ciclo de 120 segundos incluye trabajo sentado, conversación, reunión, café y regreso al puesto. Con movimiento reducido quedan estáticos.

La iteración ampliada añade libros de ocho tonos, una sala de juntas delimitada por vidrio bajo, árboles y arbustos exteriores, y placas con los nombres Jesús, Cristina, Apolo, Zeus y Hera. Los paneles decorativos cargan los logotipos reales una vez cada uno desde `public/brands/stack44.png` (asset ya existente en el frontend) y `public/brands/sis.png` (archivo proporcionado por el usuario). El hero conserva solo el botón de inicio de sesión; las secciones de la landing vuelven a aparecer al desplazarse.

## Comparación visual

Las referencias muestran una representación con acabado de render conceptual. Esta implementación en tiempo real reproduce la composición compacta, los cinco personajes, el muro cálido de madera, el mobiliario de vidrio y metal, las pantallas SG-SST y la vegetación. Los primeros planos permiten revisar las diferencias restantes en detalle de rostros, cabello y follaje antes de aprobar cualquier fusión.

El GLB original inspeccionado y su licencia están documentados en [MODEL_NOTES.md](../../src/features/landing/mini-office/MODEL_NOTES.md).
