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
import { OfficeBehaviorController } from './miniOfficeBehaviorController';
import { createOfficeInteractions } from './miniOfficeInteractions';
import { MiniOfficeContextPanel } from './MiniOfficeContextPanel';
import { tourStops, type OfficeTarget } from './miniOfficeContent';

export function MiniOfficeHero() {
  const host = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<OfficeTarget | null>(null);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const selectScene = useRef<(target: OfficeTarget | null) => void>(() => {});
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
    camera.zoom = mobileCamera ? 1.08 : 1;
    camera.position.set(mobileCamera ? 0 : 10.5, mobileCamera ? 18 : 15, mobileCamera ? 30 : 28);
    camera.lookAt(0, 1.35, -.4);
    const world = new THREE.Group(); scene.add(world);
    const m = materials(); const textures: THREE.Texture[] = [];
    const assetController = new AbortController();
    const backdrop = backdropTexture(); textures.push(backdrop); scene.background = backdrop;
    const architecture = new THREE.Group(); world.add(architecture);
    const spaceScale = mobileCamera ? { x: .72, z: 1.35 } : { x: 1, z: 1 };
    architecture.scale.set(spaceScale.x, 1, spaceScale.z);
    const fixtures = createOfficeLayout(architecture, m, textures, assetController.signal);
    const characters = createCharacters(world, m, spaceScale);
    const behavior = new OfficeBehaviorController();

    // Encuadre basado en límites reales del diorama. No incluir el suelo de
    // 200x200: forma parte de scene, no de world.
    const worldBounds = new THREE.Box3().setFromObject(world);
    const focus = worldBounds.getCenter(new THREE.Vector3());
    const viewFocus = focus.clone();
    const desiredFocus = focus.clone();
    const originalFocus = new THREE.Vector3(0, 1.35, -.4);
    const cameraOffset = camera.position.clone().sub(originalFocus);
    camera.position.copy(focus).add(cameraOffset);
    camera.lookAt(focus);
    const interactions = createOfficeInteractions(architecture, characters, mobileCamera);

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
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x101b19, roughness: 1 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.755; ground.receiveShadow = true; scene.add(ground);
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
    let dragStart: { x: number; y: number; angle: number; pan: number } | null = null;
    let orbit = Math.atan2(camera.position.x, camera.position.z);
    let panX = 0;
    const onDown = (event: PointerEvent) => {
      if (event.target !== renderer.domElement) return;
      dragStart = { x: event.clientX, y: event.clientY, angle: orbit, pan: panX };
      // Capturar solo el ratón: gestos verticales en móvil deben desplazar
      // la landing y no quedar atrapados dentro del canvas Three.js.
      if (event.pointerType === 'mouse') element.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!dragStart) {
        element.style.cursor = interactions.pick(event.clientX, event.clientY, renderer.domElement, camera) ? 'pointer' : 'grab';
        return;
      }
      if (mobileCamera) {
        panX = THREE.MathUtils.clamp(dragStart.pan - (event.clientX - dragStart.x) * .009, -1.7, 1.7);
        camera.position.x = viewFocus.x + panX;
      } else {
        orbit = THREE.MathUtils.clamp(dragStart.angle + (event.clientX - dragStart.x) * .002, .12, 1.02);
        const radius = Math.hypot(cameraOffset.x, cameraOffset.z);
        camera.position.set(
          viewFocus.x + Math.sin(orbit) * radius,
          viewFocus.y + cameraOffset.y,
          viewFocus.z + Math.cos(orbit) * radius,
        );
      }
      camera.lookAt(viewFocus.x + panX, viewFocus.y, viewFocus.z);
      // No recrear buffers de WebGL en cada movimiento del ratón.
      fitCamera(element.clientWidth, element.clientHeight);
      renderScene();
    };
    const onUp = (event: PointerEvent) => {
      const wasClick = dragStart && Math.hypot(event.clientX - dragStart.x, event.clientY - dragStart.y) < 7;
      dragStart = null;
      if (element.hasPointerCapture(event.pointerId)) element.releasePointerCapture(event.pointerId);
      if (wasClick) {
        const target = interactions.pick(event.clientX, event.clientY, renderer.domElement, camera);
        if (target) selectScene.current(target);
      }
    };
    element.addEventListener('pointerdown', onDown);
    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerup', onUp);
    element.addEventListener('pointercancel', onUp);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0, elapsed = 0, last = performance.now(), renderedStatic = false;
    selectScene.current = (target) => {
      setSelected(target);
      if (!target) { desiredFocus.copy(focus); renderedStatic = false; return; }
      const actor = characters.find(character => character.name === target);
      if (actor) behavior.greet(actor.name, elapsed);
      if (!reduced.matches && (target === 'printer' || target === 'coffee' || target === 'meeting'))
        behavior.request(target, elapsed, characters);
      const point = actor ? actor.root.position.clone().add(new THREE.Vector3(0, 1.2, 0))
        : target === 'printer' ? new THREE.Vector3(-9 * spaceScale.x, 1, .9 * spaceScale.z)
          : target === 'coffee' ? new THREE.Vector3(8.2 * spaceScale.x, 1, -3.5 * spaceScale.z)
            : target === 'meeting' ? new THREE.Vector3(-8 * spaceScale.x, 1, -2 * spaceScale.z)
              : new THREE.Vector3(0, 2.6, -5.9 * spaceScale.z);
      desiredFocus.copy(focus).lerp(point, mobileCamera ? .12 : .25);
      renderedStatic = false;
    };
    const tick = (now: number) => {
      const delta = Math.max(0, (now - last) / 1000); last = now;
      if (!document.hidden && (!reduced.matches || !renderedStatic)) {
        elapsed += delta;
        updateCharacters(characters, elapsed, reduced.matches, behavior, fixtures);
        if (!reduced.matches) {
          const previous = viewFocus.clone();
          viewFocus.lerp(desiredFocus, Math.min(1, delta * 1.9));
          camera.position.add(viewFocus.sub(previous));
          viewFocus.add(previous);
          camera.lookAt(viewFocus.x + panX, viewFocus.y, viewFocus.z);
        }
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
      selectScene.current = () => {};
    };
  }, []);
  const close = () => { setTourIndex(null); selectScene.current(null); };
  const changeTour = (index: number | null) => {
    if (index === null) { close(); return; }
    setTourIndex(index); selectScene.current(tourStops[index]);
  };
  return <div ref={host} aria-label="Oficina miniatura interactiva Stack44 con seis personajes" className="absolute inset-0 touch-pan-y">
    {failed && <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-stone-200">La oficina 3D no está disponible en este dispositivo.</div>}
    {!selected && <button type="button" onClick={() => selectScene.current('Secretaria')}
      className="absolute bottom-6 left-5 z-20 rounded-full border border-cyan-300/35 bg-[#0b1b21]/85 px-4 py-2.5 text-xs font-semibold text-cyan-100 shadow-lg backdrop-blur-xl hover:bg-[#14313a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 sm:bottom-8 sm:left-8">
      Explorar oficina
    </button>}
    {selected && <MiniOfficeContextPanel target={selected} tourIndex={tourIndex} onClose={close} onTour={changeTour} onAction={target => selectScene.current(target)} />}
  </div>;
}
