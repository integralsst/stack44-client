import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildExecutiveOffice } from "./modernSgstOffice";
import { mountRiggedSstTeam, type SstModelStatus } from "./riggedSstTeam";

/**
 * Hero SG-SST: escena ejecutiva con exactamente cinco colaboradores.
 * La navegación de página tiene prioridad sobre la interacción 3D.
 */
export type MiniWorld = {
  dispose: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  setInteractive: (enabled: boolean) => void;
};

export function mountOfficeScene(
  host: HTMLElement,
  onUnavailable: () => void,
  onModelsStatus?: (status: SstModelStatus) => void,
): MiniWorld | null {
  let renderer: THREE.WebGLRenderer;
  let compact = host.clientWidth < 720;
  try {
    renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: !compact,
      powerPreference: compact ? "low-power" : "high-performance",
    });
  } catch {
    onUnavailable();
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.1 : 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.18;
  renderer.setClearColor(0xf4f3ef, 1);
  renderer.shadowMap.enabled = !compact;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "h-full w-full outline-none";
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.display = "block";
  renderer.domElement.style.pointerEvents = "none";
  renderer.domElement.style.touchAction = "pan-y";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf4f3ef);
  const world = new THREE.Group();
  scene.add(world);

  const camera = new THREE.OrthographicCamera(-17, 17, 11, -11, 0.1, 160);
  camera.position.set(24, 24, 28);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.60, -0.80);
  controls.enableDamping = true;
  controls.dampingFactor = 0.07;
  controls.enablePan = true;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.rotateSpeed = 0.58;
  controls.zoomSpeed = 0.75;
  controls.panSpeed = 0.67;
  controls.minZoom = 0.76;
  controls.maxZoom = 3.45;
  controls.minPolarAngle = Math.PI * 0.13;
  controls.maxPolarAngle = Math.PI * 0.47;
  controls.minAzimuthAngle = -Math.PI * 0.42;
  controls.maxAzimuthAngle = Math.PI * 0.46;
  controls.enabled = false;
  controls.update();
  controls.saveState();

  // Luz natural de estudio y reflejos suaves sobre aluminio / vidrio.
  scene.add(new THREE.AmbientLight(0xf1ede0, 1.45));
  const sky = new THREE.HemisphereLight(0xf8faf8, 0x7a7467, 2.18);
  scene.add(sky);
  const sun = new THREE.DirectionalLight(0xfff7eb, 2.85);
  sun.position.set(-12, 19, 14);
  sun.castShadow = !compact;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -19;
  sun.shadow.camera.right = 19;
  sun.shadow.camera.top = 19;
  sun.shadow.camera.bottom = -19;
  sun.shadow.normalBias = 0.034;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xd9e9e7, 0.85);
  fill.position.set(12, 8, -8);
  scene.add(fill);

  const office = buildExecutiveOffice(world, compact);
  let destroyed = false;
  let inViewport = true;
  let interactive = false;
  let raf = 0;
  let lastFrame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let userAdjustedZoom = false;
  let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const render = () => {
    if (destroyed) return;
    controls.update();
    renderer.render(scene, camera);
  };

  // Una vez que el GLB esté listo, sus cinco personajes sustituyen a los
  // cinco de respaldo sin crear trabajadores fantasma.
  const team = mountRiggedSstTeam(world, office.fallback, () => compact, (status) => {
    if (!destroyed) {
      onModelsStatus?.(status);
      render();
    }
  });

  const resize = () => {
    if (destroyed) return;
    const width = Math.max(1, host.clientWidth);
    const height = Math.max(1, host.clientHeight);
    compact = width < 720;
    const halfHeight = compact ? 17.8 : width < 1120 ? 13.9 : 11.4;
    const ratio = width / height;
    camera.left = -halfHeight * ratio;
    camera.right = halfHeight * ratio;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    world.scale.setScalar(compact ? 0.61 : width < 1120 ? 0.82 : 1);
    if (!userAdjustedZoom) camera.zoom = 1;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.1 : 1.65));
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = !compact;
    sun.castShadow = !compact;
    office.resize(compact);
    team.resize();
    render();
  };

  const frame = (now: number) => {
    raf = 0;
    if (destroyed || !inViewport || document.hidden) return;
    const minFrameMs = 1000 / (compact ? 30 : 55);
    if (now - lastFrame < minFrameMs && !reducedMotion) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const delta = Math.min(lastTime ? (now - lastTime) / 1000 : 0.016, 0.08);
    lastTime = now;
    lastFrame = now;
    if (!reducedMotion) {
      elapsed += delta;
      office.update(elapsed);
      team.update(delta, elapsed);
    } else {
      office.update(1.1);
    }
    render();
    if (!reducedMotion || interactive) raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (raf || destroyed || !inViewport || document.hidden) return;
    lastFrame = 0;
    lastTime = 0;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastTime = 0;
  };

  const allowPageScroll = (event: WheelEvent) => {
    // Evita que OrbitControls capture el scroll del sitio incluso al explorar.
    event.stopPropagation();
  };
  host.addEventListener("wheel", allowPageScroll, { capture: true, passive: true });
  const intersection = new IntersectionObserver(([entry]) => {
    inViewport = !!entry?.isIntersecting;
    if (inViewport) start();
    else stop();
  }, { threshold: 0.01 });
  intersection.observe(host);

  const observer = new ResizeObserver(resize);
  observer.observe(host);
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const onMotion = () => {
    reducedMotion = motionQuery.matches;
    if (reducedMotion) {
      stop();
      office.update(1.1);
      render();
    } else start();
  };
  const onVisibility = () => { if (document.hidden) stop(); else start(); };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    stop();
    onUnavailable();
  };
  motionQuery.addEventListener("change", onMotion);
  document.addEventListener("visibilitychange", onVisibility);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  resize();
  start();

  const zoom = (multiplier: number) => {
    userAdjustedZoom = true;
    camera.zoom = THREE.MathUtils.clamp(camera.zoom * multiplier, controls.minZoom, controls.maxZoom);
    camera.updateProjectionMatrix();
    render();
    start();
  };

  return {
    zoomIn: () => zoom(1.23),
    zoomOut: () => zoom(1 / 1.23),
    reset: () => {
      userAdjustedZoom = false;
      controls.reset();
      camera.zoom = 1;
      camera.updateProjectionMatrix();
      render();
    },
    setInteractive: (enabled) => {
      interactive = enabled;
      controls.enabled = enabled;
      renderer.domElement.style.pointerEvents = enabled ? "auto" : "none";
      renderer.domElement.style.touchAction = "pan-y";
      if (enabled) start();
      else render();
    },
    dispose: () => {
      destroyed = true;
      stop();
      intersection.disconnect();
      observer.disconnect();
      motionQuery.removeEventListener("change", onMotion);
      document.removeEventListener("visibilitychange", onVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
      host.removeEventListener("wheel", allowPageScroll, { capture: true });
      controls.dispose();
      team.dispose();

      const geos = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      const textures = new Set<THREE.Texture>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geos.add(object.geometry);
          (Array.isArray(object.material) ? object.material : [object.material])
            .forEach((m) => materials.add(m));
        } else if (object instanceof THREE.Sprite) {
          materials.add(object.material);
        }
      });
      materials.forEach((m) => {
        const possible = m as THREE.MeshStandardMaterial & {
          alphaMap?: THREE.Texture; normalMap?: THREE.Texture;
          emissiveMap?: THREE.Texture; roughnessMap?: THREE.Texture;
        };
        for (const tex of [
          possible.map, possible.alphaMap, possible.normalMap,
          possible.emissiveMap, possible.roughnessMap,
        ]) {
          if (tex) textures.add(tex);
        }
        m.dispose();
      });
      geos.forEach((geo) => geo.dispose());
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
