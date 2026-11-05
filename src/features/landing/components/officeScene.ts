import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { buildUltraPremiumCampus } from "./ultraPremiumCampus";
import { buildMiniatureCity } from "./miniatureCity";
import { mountRiggedSstTeam, type SstModelStatus } from "./riggedSstTeam";

/**
 * Campus SG-SST ultra premium: cinco colaboradores, visitas, zonas de trabajo,
 * reuniones, jardines, sala de juegos, lounge y helipuerto.
 * La navegación de la página sigue teniendo prioridad sobre orbit / zoom.
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
  let compact = host.clientWidth < 720;
  let renderer: THREE.WebGLRenderer;
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
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.05 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.22;
  renderer.setClearColor(0xf1eee7, 1);
  renderer.shadowMap.enabled = !compact;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "h-full w-full outline-none";
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.display = "block";
  renderer.domElement.style.pointerEvents = "none";
  renderer.domElement.style.touchAction = "pan-y";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf1eee7);
  const world = new THREE.Group();
  scene.add(world);

  const camera = new THREE.OrthographicCamera(-23, 23, 21, -21, .1, 180);
  camera.position.set(31, 36, 38);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, .52, .5);
  controls.enableDamping = true;
  controls.dampingFactor = .065;
  controls.enablePan = true;
  controls.enableRotate = true;
  controls.enableZoom = true;
  controls.rotateSpeed = .52;
  controls.panSpeed = .70;
  controls.zoomSpeed = .76;
  controls.minZoom = .72;
  controls.maxZoom = 4.5;
  controls.minPolarAngle = Math.PI * .11;
  controls.maxPolarAngle = Math.PI * .48;
  controls.minAzimuthAngle = -Math.PI * .42;
  controls.maxAzimuthAngle = Math.PI * .47;
  controls.enabled = false;
  controls.update();
  controls.saveState();

  scene.add(new THREE.AmbientLight(0xeceadd, 1.20));
  const hemisphere = new THREE.HemisphereLight(0xfdfffa, 0x7b7f73, 2.05);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight(0xfff4e7, 2.9);
  sun.position.set(-17, 32, 21);
  sun.castShadow = !compact;
  sun.shadow.mapSize.set(compact ? 512 : 1536, compact ? 512 : 1536);
  sun.shadow.camera.left = -35;
  sun.shadow.camera.right = 35;
  sun.shadow.camera.top = 32;
  sun.shadow.camera.bottom = -32;
  sun.shadow.normalBias = .025;
  scene.add(sun);
  const bounce = new THREE.DirectionalLight(0xc9e3db, .72);
  bounce.position.set(21, 10, -16);
  scene.add(bounce);

  let destroyed = false;
  let inViewport = true;
  let interactive = false;
  let raf = 0;
  let lastFrame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let userAdjustedZoom = false;
  let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  // La oficina se interpreta ahora como una maqueta compacta, protagonista
  // pero rodeada de una ciudad. Los personajes se reducen con el edificio
  // para que escritorios, sillas y rutas mantengan sus proporciones.
  const campusRoot = new THREE.Group();
  campusRoot.name = "Campus SG-SST compacto";
  campusRoot.scale.setScalar(.64);
  world.add(campusRoot);
  const city = buildMiniatureCity(world, compact);
  const campus = buildUltraPremiumCampus(campusRoot, compact);

  const render = () => {
    if (destroyed) return;
    controls.update();
    renderer.render(scene, camera);
  };
  const team = mountRiggedSstTeam(campusRoot, campus.fallback, () => compact, (status) => {
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
    const halfHeight = compact ? 21.4 : width < 1130 ? 22.8 : 23.2;
    const aspect = width / height;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    // La ciudad enmarca el campus sin apoderarse de todo el hero.
    // En móvil priorizamos mostrar los cinco puestos; el barrio puede recortarse.
    world.scale.setScalar(compact ? .48 : width < 1130 ? .76 : .96);
    if (!userAdjustedZoom) camera.zoom = 1;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.05 : 1.5));
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = !compact;
    sun.castShadow = !compact;
    campus.resize(compact);
    team.resize();
    render();
  };

  const frame = (now: number) => {
    raf = 0;
    if (destroyed || !inViewport || document.hidden) return;
    const frameDelay = 1000 / (compact ? 30 : 52);
    if (!reducedMotion && now - lastFrame < frameDelay) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const dt = Math.min(lastTime ? (now - lastTime) / 1000 : .016, .075);
    lastTime = now;
    lastFrame = now;
    if (!reducedMotion) elapsed += dt;
    // En modo sin animaciones queda un fotograma representativo con pantallas.
    const time = reducedMotion ? 2 : elapsed;
    campus.update(time);
    city.update(time);
    team.update(dt, time);
    render();
    if (!reducedMotion || interactive) raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (destroyed || raf || !inViewport || document.hidden) return;
    lastFrame = 0;
    lastTime = 0;
    raf = requestAnimationFrame(frame);
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastTime = 0;
  };
  const preservePageScroll = (event: WheelEvent) => {
    // La rueda desplaza la página, no modifica el zoom ni roba navegación.
    event.stopPropagation();
  };
  host.addEventListener("wheel", preservePageScroll, { capture: true, passive: true });
  const intersection = new IntersectionObserver(([entry]) => {
    inViewport = !!entry?.isIntersecting;
    if (inViewport) start();
    else stop();
  }, { threshold: .01 });
  const ro = new ResizeObserver(resize);
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  const updateMotion = () => {
    reducedMotion = mq.matches;
    if (reducedMotion) {
      stop();
      frame(0);
    } else start();
  };
  const changeVisibility = () => {
    if (document.hidden) stop();
    else start();
  };
  const lost = (event: Event) => {
    event.preventDefault();
    stop();
    onUnavailable();
  };
  intersection.observe(host);
  ro.observe(host);
  mq.addEventListener("change", updateMotion);
  document.addEventListener("visibilitychange", changeVisibility);
  renderer.domElement.addEventListener("webglcontextlost", lost);
  resize();
  start();

  const changeZoom = (factor: number) => {
    userAdjustedZoom = true;
    camera.zoom = THREE.MathUtils.clamp(
      camera.zoom * factor, controls.minZoom, controls.maxZoom,
    );
    camera.updateProjectionMatrix();
    render();
    start();
  };

  return {
    zoomIn: () => changeZoom(1.24),
    zoomOut: () => changeZoom(1 / 1.24),
    reset() {
      userAdjustedZoom = false;
      controls.reset();
      camera.zoom = 1;
      camera.updateProjectionMatrix();
      render();
    },
    setInteractive(enabled) {
      interactive = enabled;
      controls.enabled = enabled;
      renderer.domElement.style.pointerEvents = enabled ? "auto" : "none";
      renderer.domElement.style.touchAction = "pan-y";
      if (enabled) start();
      else render();
    },
    dispose() {
      destroyed = true;
      stop();
      intersection.disconnect();
      ro.disconnect();
      mq.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", changeVisibility);
      renderer.domElement.removeEventListener("webglcontextlost", lost);
      host.removeEventListener("wheel", preservePageScroll, { capture: true });
      controls.dispose();
      team.dispose();
      campus.dispose();

      const geos = new Set<THREE.BufferGeometry>();
      const materials = new Set<THREE.Material>();
      const textures = new Set<THREE.Texture>();
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          geos.add(object.geometry);
          (Array.isArray(object.material) ? object.material : [object.material])
            .forEach((material) => materials.add(material));
        } else if (object instanceof THREE.Sprite) {
          materials.add(object.material);
        }
      });
      materials.forEach((material) => {
        const any = material as THREE.MeshStandardMaterial & {
          normalMap?: THREE.Texture;
          alphaMap?: THREE.Texture;
          emissiveMap?: THREE.Texture;
          roughnessMap?: THREE.Texture;
        };
        for (const texture of [any.map, any.normalMap, any.alphaMap, any.emissiveMap, any.roughnessMap]) {
          if (texture) textures.add(texture);
        }
        material.dispose();
      });
      geos.forEach((geometry) => geometry.dispose());
      textures.forEach((texture) => texture.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
