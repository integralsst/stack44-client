# Personajes SG-SST · Stack44

## Procedencia y atribución obligatoria
- Modelo base: **"Lego Minifigure Rigged"**, de **Darth Iron**.
- URL de origen: https://sketchfab.com/3d-models/lego-minifigure-rigged-42612b64a3004d3c97872c4c444f9544
- Licencia declarada por el archivo de origen: **Creative Commons Attribution 4.0 International (CC BY 4.0)**, https://creativecommons.org/licenses/by/4.0/
- Cambios hechos para Stack44 (2026): cuatro variantes de cabello, vestuario, accesorios de seguridad y salud en el trabajo, expresión facial y tres animaciones esqueléticas de demostración (Idle, Caminar, Saludar).
- La atribución también se muestra en el hero.

## Archivos
- profesional_sst.glb
- inspectora_sst.glb
- coordinadora_sst.glb
- auditor_sst.glb

## Aviso de derechos
Aunque el creador compartió el archivo bajo CC BY 4.0, esa licencia no garantiza derechos de terceros sobre el diseño de minifiguras LEGO. Esta integración es una **versión de prueba visual**; revisar derechos de marca, apariencia comercial/diseño e idoneidad para uso público comercial antes de adoptarla definitivamente.

## Integración
El componente `src/features/landing/components/riggedSstTeam.ts` utiliza `GLTFLoader`, `SkeletonUtils.clone` y `AnimationMixer` de Three.js. Carga las cuatro variantes una sola vez, reutiliza las geometrías y reduce el número de personajes visibles en pantallas pequeñas. Si falla una carga, conserva la versión geométrica anterior.
