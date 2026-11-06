import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { clearOfficeGeometryCache, materials } from './miniOfficeMaterials';
import { createOfficeLayout } from './miniOfficeLayout';
import { createCharacters } from './miniOfficeCharacters';
import { updateCharacters } from './miniOfficeAnimation';
import { backdropTexture } from './miniOfficeScreens';

export function MiniOfficeHero() {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch { queueMicrotask(() => setFailed(true)); return; }
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x111917, 43, 74);
    const camera = new THREE.OrthographicCamera();
    const mobileCamera = window.innerWidth < 700;
    camera.position.set(mobileCamera ? 0 : 10.5, mobileCamera ? 21 : 15, mobileCamera ? 30 : 28);
    camera.lookAt(0, 1.35, -.4);
    const world = new THREE.Group(); scene.add(world);
    const m = materials(); const textures: THREE.Texture[] = [];
    const assetController = new AbortController();
    const backdrop = backdropTexture(); textures.push(backdrop); scene.background = backdrop;
    const architecture = new THREE.Group(); world.add(architecture);
    const spaceScale = mobileCamera ? { x: .72, z: 1.9 } : { x: 1, z: 1 };
    architecture.scale.set(spaceScale.x, 1, spaceScale.z);
    createOfficeLayout(architecture, m, textures, assetController.signal);
    const characters = createCharacters(world, m, spaceScale);

    // Encuadre basado en límites reales del diorama. No incluir el suelo de
    // 200x200: forma parte de scene, no de world.
    const worldBounds = new THREE.Box3().setFromObject(world);
    const focus = worldBounds.getCenter(new THREE.Vector3());
    const originalFocus = new THREE.Vector3(0, 1.35, -.4);
    const cameraOffset = camera.position.clone().sub(originalFocus);
    camera.position.copy(focus).add(cameraOffset);
    camera.lookAt(focus);

    const ambient = new THREE.HemisphereLight(0xffe9c6, 0x395c50, .85); scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffe5ba, 1.9);
    sun.position.set(-6, 13, 11); sun.castShadow = true;
    sun.shadow.mapSize.set(mobileCamera ? 1024 : 2048, mobileCamera ? 1024 : 2048);
    sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
    sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
    sun.shadow.bias = -.0005; sun.shadow.radius = 3; scene.add(sun);
    const fill = new THREE.DirectionalLight(0xa8c9bf, .5);
    fill.position.set(10, 8, -6); scene.add(fill);
    for (const x of [-8, -4.1, 0, 4.1, 8]) {
      const warm = new THREE.PointLight(0xffbe73, 8, 6, 2);
      warm.position.set(x, 3.35, -4.45); scene.add(warm);
    }
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: 0x000000, opacity: .32 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.55; ground.receiveShadow = true; scene.add(ground);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.3 : 1.8));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .9;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const studio = new RoomEnvironment();
    const environment = pmrem.fromScene(studio);
    studio.dispose();
    scene.environment = environment.texture;
    scene.environmentIntensity = .25;
    const composer = mobileCamera ? null : new EffectComposer(renderer);
    if (composer) {
      composer.addPass(new RenderPass(scene, camera));
      composer.addPass(new UnrealBloomPass(new THREE.Vector2(1, 1), .18, .28, 1.05));
      composer.addPass(new OutputPass());
    }
    const renderScene = () => { if (composer) composer.render(); else renderer.render(scene, camera); };
    // MUY IMPORTANTE: pixelRatio solo afecta la resolución interna del canvas.
    // El tamaño CSS siempre debe coincidir con el host; de lo contrario un
    // Retina 2x dibuja un canvas 2x más grande y recorta la oficina.
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.touchAction = 'pan-y';
    element.appendChild(renderer.domElement);
    const fitCamera = (width: number, height: number) => {
      if (!width || !height) return;
      const aspect = width / height;
      // Proyectar las ocho esquinas del volumen real de la oficina sobre los
      // ejes de la cámara, considerando profundidad, altura y giro isométrico.
      // Así se adapta a cualquier viewport sin cortar esquinas ni personajes.
      const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
      const cameraUp = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      let halfProjectedWidth = 0;
      let halfProjectedHeight = 0;
      for (const x of [worldBounds.min.x, worldBounds.max.x]) {
        for (const y of [worldBounds.min.y, worldBounds.max.y]) {
          for (const z of [worldBounds.min.z, worldBounds.max.z]) {
            const relative = new THREE.Vector3(x, y, z).sub(focus);
            halfProjectedWidth = Math.max(
              halfProjectedWidth, Math.abs(relative.dot(cameraRight)),
            );
            halfProjectedHeight = Math.max(
              halfProjectedHeight, Math.abs(relative.dot(cameraUp)),
            );
          }
        }
      }
      const margin = aspect < .8 ? 1.06 : 1.04;
      const halfHeight = Math.max(halfProjectedHeight, halfProjectedWidth / aspect) * margin;
      const halfWidth = halfHeight * aspect;
      camera.left = -halfWidth; camera.right = halfWidth;
      camera.top = halfHeight; camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
    };
    const resize = () => {
      const width = element.clientWidth, height = element.clientHeight;
      if (!width || !height) return;
      fitCamera(width, height);
      // Con updateStyle=true, Three.js sincroniza CSS con el tamaño lógico
      // del host incluso si window.devicePixelRatio es 1.8 o 2.
      renderer.setSize(width, height, true);
      composer?.setSize(width, height);
      renderScene();
    };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    let dragStart: { x: number; angle: number; pan: number } | null = null;
    let orbit = Math.atan2(camera.position.x, camera.position.z);
    let panX = 0;
    const onDown = (event: PointerEvent) => {
      dragStart = { x: event.clientX, angle: orbit, pan: panX };
      // Capturar solo el ratón: gestos verticales en móvil deben desplazar
      // la landing y no quedar atrapados dentro del canvas Three.js.
      if (event.pointerType === 'mouse') element.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!dragStart) return;
      if (mobileCamera) {
        panX = THREE.MathUtils.clamp(dragStart.pan - (event.clientX - dragStart.x) * .009, -1.7, 1.7);
        camera.position.x = focus.x + panX;
      } else {
        orbit = THREE.MathUtils.clamp(dragStart.angle + (event.clientX - dragStart.x) * .002, .12, 1.02);
        const radius = Math.hypot(cameraOffset.x, cameraOffset.z);
        camera.position.set(
          focus.x + Math.sin(orbit) * radius,
          focus.y + cameraOffset.y,
          focus.z + Math.cos(orbit) * radius,
        );
      }
      camera.lookAt(focus.x + panX, focus.y, focus.z);
      // No recrear buffers de WebGL en cada movimiento del ratón.
      fitCamera(element.clientWidth, element.clientHeight);
      renderScene();
    };
    const onUp = (event: PointerEvent) => {
      dragStart = null;
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
    };
    element.addEventListener('pointerdown', onDown);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerup', onUp);
    element.addEventListener('pointercancel', onUp);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, elapsed = 0, last = performance.now(), renderedStatic = false;
    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, .1); last = now;
      if (!document.hidden && (!reduced.matches || !renderedStatic)) {
        elapsed += delta;
        updateCharacters(characters, elapsed, reduced.matches);
        renderScene();
        renderedStatic = reduced.matches;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const visibility = () => { last = performance.now(); };
    document.addEventListener('visibilitychange', visibility);
    const onLost = (event: Event) => { event.preventDefault(); setFailed(true); };
    renderer.domElement.addEventListener('webglcontextlost', onLost);
    return () => {
      cancelAnimationFrame(frame); observer.disconnect(); assetController.abort();
      element.removeEventListener('pointerdown', onDown);
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerup', onUp);
      element.removeEventListener('pointercancel', onUp);
      document.removeEventListener('visibilitychange', visibility);
      renderer.domElement.removeEventListener('webglcontextlost', onLost);
      const geometries = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      scene.traverse(object => {
        if (object instanceof THREE.Mesh) {
          geometries.add(object.geometry);
          const mats = Array.isArray(object.material) ? object.material : [object.material];
          mats.forEach(material => materials.add(material));
        }
      });
      geometries.forEach(geometry => geometry.dispose());
      clearOfficeGeometryCache();
      const ownedTextures = new Set(textures);
      materials.forEach(material => {
        if ('map' in material && material.map instanceof THREE.Texture) ownedTextures.add(material.map);
        material.dispose();
      });
      ownedTextures.forEach(texture => texture.dispose());
      ground.material.dispose();
      environment.dispose(); pmrem.dispose();
      composer?.dispose();
      renderer.dispose(); renderer.domElement.remove();
    };
  }, []);
  return <div ref={host} aria-label="Oficina miniatura Stack44 con cinco profesionales y paneles SG-SST" role="img" className="absolute inset-0 touch-pan-y">
    {failed && <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-stone-200">La oficina 3D no está disponible en este dispositivo.</div>}
  </div>;
}
