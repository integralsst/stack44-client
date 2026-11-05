import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { clearOfficeGeometryCache, materials } from './miniOfficeMaterials';
import { createOfficeLayout } from './miniOfficeLayout';
import { createCharacters } from './miniOfficeCharacters';
import { updateCharacters } from './miniOfficeAnimation';

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
    scene.background = new THREE.Color(0x101b19);
    scene.fog = new THREE.Fog(0x101b19, 31, 56);
    const camera = new THREE.OrthographicCamera();
    const mobileCamera = window.innerWidth < 700;
    camera.position.set(mobileCamera ? 8 : 20, 19, mobileCamera ? 30 : 23);
    camera.lookAt(0, .85, 0);
    const world = new THREE.Group(); scene.add(world);
    const m = materials(); const textures: THREE.Texture[] = [];
    createOfficeLayout(world, m, textures);
    const characters = createCharacters(world, m);
    const ambient = new THREE.HemisphereLight(0xfff3d6, 0x36584c, 2.4); scene.add(ambient);
    const sun = new THREE.DirectionalLight(0xffe8c0, 3.3);
    sun.position.set(-7, 15, 10); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -12; sun.shadow.camera.right = 12;
    sun.shadow.camera.top = 12; sun.shadow.camera.bottom = -12;
    sun.shadow.bias = -.0005; scene.add(sun);
    const fill = new THREE.DirectionalLight(0xa8c9bf, 1.4);
    fill.position.set(10, 8, -6); scene.add(fill);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ color: 0x000000, opacity: .32 }));
    ground.rotation.x = -Math.PI / 2; ground.position.y = -.55; ground.receiveShadow = true; scene.add(ground);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, window.innerWidth < 700 ? 1.3 : 1.8));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.25;
    element.appendChild(renderer.domElement);
    const resize = () => {
      const width = element.clientWidth, height = element.clientHeight;
      if (!width || !height) return;
      const aspect = width / height;
      const viewWidth = aspect < .8 ? 17.3 : aspect < 1.35 ? 20 : 22.4;
      const viewHeight = viewWidth / aspect;
      camera.left = -viewWidth / 2; camera.right = viewWidth / 2;
      camera.top = viewHeight / 2; camera.bottom = -viewHeight / 2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      renderer.render(scene, camera);
    };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    let dragStart: { x: number; angle: number } | null = null;
    let orbit = Math.atan2(camera.position.x, camera.position.z);
    const onDown = (event: PointerEvent) => {
      dragStart = { x: event.clientX, angle: orbit };
      element.setPointerCapture(event.pointerId);
    };
    const onMove = (event: PointerEvent) => {
      if (!dragStart) return;
      orbit = THREE.MathUtils.clamp(dragStart.angle + (event.clientX - dragStart.x) * .002, .12, 1.02);
      const radius = Math.hypot(mobileCamera ? 8 : 20, mobileCamera ? 30 : 23);
      camera.position.set(Math.sin(orbit) * radius, 19, Math.cos(orbit) * radius);
      camera.lookAt(0, .85, 0);
      renderer.render(scene, camera);
    };
    const onUp = () => { dragStart = null; };
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
        renderer.render(scene, camera);
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
      cancelAnimationFrame(frame); observer.disconnect();
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
      materials.forEach(material => material.dispose());
      textures.forEach(texture => texture.dispose());
      ground.material.dispose();
      renderer.dispose(); renderer.domElement.remove();
    };
  }, []);
  return <div ref={host} aria-label="Oficina miniatura Stack44 con cinco profesionales y paneles SG-SST" role="img" className="absolute inset-0 touch-pan-y">
    {failed && <div className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-stone-200">La oficina 3D no está disponible en este dispositivo.</div>}
  </div>;
}
