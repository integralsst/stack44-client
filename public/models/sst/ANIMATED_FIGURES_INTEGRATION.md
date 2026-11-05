# Nuevas minifiguras animadas SST — Stack44

## Archivo requerido
- `lego_minifigure_animated.glb` en `public/models/sst/`
- Fuente del archivo: GLB aportado por el usuario, "LEGO Minifigure (Animated)".
- Autor del modelo original: **Ben Shaffer / BentheCreator**.
- URL: https://sketchfab.com/3d-models/lego-minifigure-animated-ce3274a82ee74249901010d93fce3853
- Metadatos de licencia del GLB: CC BY 4.0.

## Estado del PR
**No fusionar este PR sin subir el GLB** y validar el resultado en navegador.

El cargador busca el nuevo modelo antes de mostrar las seis variantes. Si la ruta
no existe o Vercel entrega index.html para una URL inexistente, continúa usando
las figuras GLB previas y la interfaz muestra **personajes anteriores**.

## Personajes a partir de un solo GLB
1. Coordinador SST: camisa turquesa, pelo ejecutivo, gafas rectangulares.
2. Profesional SST: vestuario claro, cabello ondulado, blazer.
3. Inspectora SST: uniforme naranja, casco y gafas de protección.
4. Coordinadora: blazer, moño y gafas redondas.
5. Analista de prevención: uniforme verde y rizos cortos.
6. Auditor SST: formal azul, cabello lateral y gafas ejecutivas.

Todos se instancian desde el mismo GLB usando `SkeletonUtils.clone`.
Los nuevos accesorios se vinculan a huesos para acompañar el movimiento.

## Movimiento
- No reproduce automáticamente el clip `Take 001`: contiene más canales
  que caminar y todavía necesita evaluación específica.
- El caminar usa un pequeño ciclo causal de piernas/brazos y trayecto
  elíptico, sin cambios bruscos de orientación.
- Los personajes de oficina gesticulan de forma sutil según su función.
- Se respeta preferencia de movimiento reducido y pausa fuera de viewport.

## Verificaciones
1. Comprobar por red `/models/sst/lego_minifigure_animated.glb` (firma `glTF`).
2. La interfaz debe mostrar `10 minifiguras animadas · 6 estilos SST`.
3. Revisar cabello/gafas frente a la cámara 3D y la sonrisa visible.
4. Comprobar caminado, móvil, zoom y scroll.
5. Revisar derechos del diseño LEGO antes de uso comercial definitivo.
