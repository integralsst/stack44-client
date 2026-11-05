# Oficina isométrica · Segunda ala del campus SG-SST

## Estado de integración

Se añadió el cargador `src/features/landing/components/officeAnnex.ts`.
El archivo requerido es `public/models/sst/isometric_office_stack44_optimized.glb`.

**Importante:** el archivo GLB (binario) se debe subir a esta ruta del repositorio.
La carga no puede considerarse terminada mientras ese recurso no exista en el branch de despliegue. El código comprueba su firma binaria para no confundir la respuesta HTML del SPA con un GLB.

## Archivo y optimización

- Original aportado por el usuario: `isometric_office.glb` (19.257.452 bytes).
- Versión optimizada: `isometric_office_stack44_optimized.glb` (10.378.896 bytes).
- Se conservaron las 748 mallas y la distribución original, con imágenes rebajadas a un máximo de 768 px para color y 512 px para mapas técnicos.
- Formato GLB v2 validado tras la optimización; 48 materiales, 22 texturas e interior de aproximadamente 10 x 10 unidades.

## Integración visual

- Se añade como **Oficina 2** contigua a la derecha del mundo SST, con jardín y continuidad del boulevard.
- La primera oficina y las figuras animadas se conservan.
- Se muestran los controles **Oficina 1 / Oficina 2** únicamente cuando el modelo está realmente cargado.
- La cámara puede hacer zoom, rotar y dejar pasar el scroll vertical a los otros componentes.
- Si no se encuentra el GLB se conserva el hero actual y la oficina nueva no se simula.

## Procedencia y atribución

Los metadatos internos del GLB aportado indican:
- Título: `Isometric office`
- Autor: `Companion_Cube`
- Fuente: https://sketchfab.com/3d-models/isometric-office-d31464eed8044190911b221648aca432
- Licencia declarada: CC BY 4.0 https://creativecommons.org/licenses/by/4.0/

En el hero se muestra la atribución si la oficina adicional se carga.

## Publicación final

1. Subir `isometric_office_stack44_optimized.glb` a `public/models/sst/` en el branch del PR.
2. Esperar el build de Vercel y comprobar los modelos en escritorio y móvil.
3. Fusionar el PR únicamente cuando se haya confirmado que el GLB está en el repositorio.

## Rendimiento

El GLB conserva 748 mallas, un nivel de detalle importante para móvil. Se desactivan sombras y piezas diminutas en móviles, pero la experiencia se debe probar en hardware real; la compilación por sí sola no valida el framerate.
