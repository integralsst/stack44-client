import * as THREE from "three";

/**
 * Escena decorativa y autocontenida: no usa IA, APIs, modelos externos ni física.
 * Geometrías ligeras, render pausado fuera de pantalla y framing adaptable a móvil.
 */
type AgentMode = "typing" | "walking" | "presenting";

type OfficeAgent = {
  root: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  position: THREE.Vector3;
  mode: AgentMode;
  phase: number;
};

export function mountOfficeScene(
  host: HTMLElement,
  onUnavailable: () => void
): () => void {
  const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reducedMotion = reducedMotionQuery.matches;
  let compact = host.clientWidth < 700;
  let renderer: THREE.WebGLRenderer;

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !compact,
      powerPreference: compact ? "low-power" : "high-performance",
    });
  } catch {
    onUnavailable();
    return () => undefined;
  }

  renderer.setClearColor(0x05080a, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.55;
  renderer.shadowMap.enabled = !compact;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.setAttribute("aria-hidden", "true");
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05080a, 0.015);
  const world = new THREE.Group();
  scene.add(world);

  const camera = new THREE.OrthographicCamera(-8, 8, 7, -7, 0.1, 100);
  camera.position.set(12, 11, 16);

  const material = (color: number, roughness = 0.54, metalness = 0.07) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });

  const midnight = material(0x0f1d2d);
  const navy = material(0x192b3d);
  const slate = material(0x31445b);
  const trim = material(0x50687b, 0.4, 0.45);
  const pale = material(0xd9e9eb);
  const pearl = material(0xa9cbd3);
  const cyan = material(0x24d5e8, 0.33, 0.2);
  const yellow = material(0xffd151, 0.4);
  const ocean = material(0x1999bb);
  const violet = material(0x8377e8);
  const coral = material(0xf58d76);
  const mint = material(0x62d5ae);
  const wood = material(0x9d8270);
  const darkFace = material(0x283449);
  const leaf = material(0x438f7e);
  const softBlue = new THREE.MeshBasicMaterial({ color: 0x68eaff });
  const screen = new THREE.MeshBasicMaterial({ color: 0x0c3544 });
  const litScreen = new THREE.MeshBasicMaterial({ color: 0x3ae1f2 });
  const windowGlass = new THREE.MeshStandardMaterial({
    color: 0x194454,
    metalness: 0.26,
    roughness: 0.21,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
  });

  function box(
    parent: THREE.Object3D,
    width: number,
    height: number,
    depth: number,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0
  ) {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth),
      mat
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = !compact;
    mesh.receiveShadow = !compact;
    parent.add(mesh);
    return mesh;
  }

  function cylinder(
    parent: THREE.Object3D,
    radiusTop: number,
    radiusBottom: number,
    height: number,
    mat: THREE.Material,
    x = 0,
    y = 0,
    z = 0,
    segments = 16
  ) {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments),
      mat
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = !compact;
    parent.add(mesh);
    return mesh;
  }

  function sphere(
    parent: THREE.Object3D,
    radius: number,
    mat: THREE.Material,
    x: number,
    y: number,
    z: number
  ) {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 10, 8), mat);
    mesh.position.set(x, y, z);
    parent.add(mesh);
    return mesh;
  }

  // Plataforma y piso de la oficina.
  box(world, 16.8, 0.38, 10.7, midnight, 0, -0.26, 0);
  box(world, 16.3, 0.08, 10.2, navy, 0, -0.015, 0);
  box(world, 16.85, 0.10, 10.75, cyan, 0, -0.44, 0);
  box(world, 11.5, 0.025, 2.7, slate, 0, 0.04, 3.15);

  // Cristaleras, paneles y silueta de edificios al fondo.
  box(world, 16, 4.9, 0.13, midnight, 0, 2.4, -5.05);
  for (let i = 0; i < 6; i += 1) {
    const x = -6.55 + i * 2.62;
    box(world, 2.38, 3.65, 0.055, windowGlass, x, 2.62, -4.92);
    box(world, 0.08, 3.75, 0.11, trim, x + 1.26, 2.62, -4.86);
    const buildingHeight = 0.8 + (i % 3) * 0.45;
    box(world, 1.38, buildingHeight, 0.07, slate, x, 0.85 + buildingHeight / 2, -4.81);
  }
  box(world, 16, 0.12, 0.18, trim, 0, 4.55, -4.86);
  box(world, 16, 0.16, 0.18, trim, 0, 0.86, -4.86);

  // Iluminación arquitectónica.
  scene.add(new THREE.HemisphereLight(0xa6e9ff, 0x182132, 2.8));
  const keyLight = new THREE.DirectionalLight(0xffffff, 3.1);
  keyLight.position.set(-4, 12, 7);
  keyLight.castShadow = !compact;
  keyLight.shadow.mapSize.set(1024, 1024);
  keyLight.shadow.camera.left = -12;
  keyLight.shadow.camera.right = 12;
  keyLight.shadow.camera.top = 12;
  keyLight.shadow.camera.bottom = -12;
  keyLight.shadow.normalBias = 0.018;
  scene.add(keyLight);
  const edgeLight = new THREE.PointLight(0x26cfff, 26, 24, 2);
  edgeLight.position.set(5, 4, -2.5);
  scene.add(edgeLight);

  // Escritorios, pantallas y accesorios: una única maqueta para ambas vistas.
  function createDesk(x: number, z: number, accent: THREE.Material) {
    const desk = new THREE.Group();
    desk.position.set(x, 0, z);
    world.add(desk);
    box(desk, 3.35, 0.15, 1.55, pearl, 0, 0.93, 0);
    for (const dx of [-1.47, 1.47]) {
      for (const dz of [-0.57, 0.57]) {
        box(desk, 0.11, 0.84, 0.13, trim, dx, 0.45, dz);
      }
    }
    box(desk, 1.04, 0.66, 0.12, midnight, 0.02, 1.54, -0.24);
    box(desk, 0.91, 0.53, 0.015, screen, 0.02, 1.54, -0.171);
    box(desk, 0.45, 0.035, 0.016, accent, -0.12, 1.68, -0.155);
    box(desk, 0.65, 0.027, 0.016, softBlue, 0, 1.54, -0.153);
    box(desk, 0.40, 0.027, 0.016, accent, -0.12, 1.42, -0.152);
    box(desk, 0.12, 0.24, 0.12, trim, 0.02, 1.08, -0.25);
    box(desk, 0.52, 0.05, 0.31, trim, 0.02, 0.98, -0.25);
    box(desk, 0.87, 0.025, 0.33, pale, 0.03, 1.02, 0.44);
    cylinder(desk, 0.14, 0.14, 0.27, pale, 1.12, 1.13, 0.23);
    cylinder(desk, 0.10, 0.10, 0.022, accent, 1.12, 1.28, 0.23);
  }
  createDesk(-4.8, -0.86, cyan);
  createDesk(0, -0.86, mint);
  createDesk(4.8, -0.86, violet);

  // Sillas detrás de los escritorios.
  for (const x of [-4.8, 0, 4.8]) {
    box(world, 1.0, 1.05, 0.15, slate, x, 0.95, -2.14);
    box(world, 0.95, 0.14, 0.84, slate, x, 0.47, -1.78);
    cylinder(world, 0.07, 0.07, 0.4, trim, x, 0.25, -1.86);
  }

  // Pizarra de tareas, impresora, plantas y luminarias.
  box(world, 2.6, 1.45, 0.12, pale, 5.92, 2.72, -4.69);
  box(world, 2.75, 1.6, 0.12, trim, 5.92, 2.72, -4.76);
  box(world, 2.48, 1.34, 0.07, pale, 5.92, 2.72, -4.66);
  for (let i = 0; i < 4; i += 1) {
    box(world, 0.32, 0.19, 0.02, i % 2 === 0 ? cyan : violet, 5.10 + i * 0.53, 2.93, -4.60);
    box(world, 0.30, 0.035, 0.02, slate, 5.10 + i * 0.53, 2.63, -4.60);
  }
  box(world, 1.18, 0.65, 0.76, pale, -6.95, 0.88, 1.78);
  box(world, 0.80, 0.22, 0.78, midnight, -6.95, 1.26, 1.78);
  box(world, 0.52, 0.028, 0.33, cyan, -6.95, 1.42, 1.73);
  for (const x of [-7.3, 7.3]) {
    cylinder(world, 0.43, 0.32, 0.6, wood, x, 0.32, 3.22);
    cylinder(world, 0.07, 0.08, 0.83, leaf, x, 0.98, 3.22);
    for (let i = 0; i < 5; i += 1) {
      const angle = (Math.PI * 2 * i) / 5;
      sphere(world, 0.40, leaf, x + Math.sin(angle) * 0.32, 1.53, 3.22 + Math.cos(angle) * 0.32);
    }
  }
  for (const x of [-4.8, 0, 4.8]) {
    cylinder(world, 0.43, 0.43, 0.07, pale, x, 4.7, -0.35);
    cylinder(world, 0.56, 0.56, 0.04, cyan, x, 4.64, -0.35);
  }

  // Minifiguras articuladas, modeladas de forma procedural.
  function createAgent(
    x: number,
    z: number,
    outfit: THREE.Material,
    mode: AgentMode,
    phase: number
  ): OfficeAgent {
    const root = new THREE.Group();
    root.position.set(x, 0.07, z);
    world.add(root);
    box(root, 0.91, 0.72, 0.53, outfit, 0, 1.03, 0);
    box(root, 0.90, 0.18, 0.48, darkFace, 0, 0.60, 0);
    cylinder(root, 0.12, 0.12, 0.16, yellow, 0, 1.48, 0);
    const head = new THREE.Group();
    head.position.set(0, 1.76, 0);
    root.add(head);
    cylinder(head, 0.32, 0.32, 0.52, yellow);
    cylinder(head, 0.23, 0.23, 0.10, yellow, 0, 0.31, 0);
    for (const eyeX of [-0.12, 0.12]) {
      sphere(head, 0.033, darkFace, eyeX, 0.08, 0.306);
    }
    box(head, 0.16, 0.028, 0.018, darkFace, 0, -0.12, 0.311);
    cylinder(head, 0.34, 0.34, 0.105, navy, 0, 0.265, 0);

    const leftArm = new THREE.Group();
    const rightArm = new THREE.Group();
    leftArm.position.set(-0.56, 1.31, 0);
    rightArm.position.set(0.56, 1.31, 0);
    root.add(leftArm, rightArm);
    cylinder(leftArm, 0.17, 0.14, 0.47, outfit, 0, -0.25, 0);
    cylinder(rightArm, 0.17, 0.14, 0.47, outfit, 0, -0.25, 0);
    cylinder(leftArm, 0.15, 0.15, 0.20, yellow, 0, -0.56, 0);
    cylinder(rightArm, 0.15, 0.15, 0.20, yellow, 0, -0.56, 0);

    const leftLeg = new THREE.Group();
    const rightLeg = new THREE.Group();
    leftLeg.position.set(-0.23, 0.53, 0);
    rightLeg.position.set(0.23, 0.53, 0);
    root.add(leftLeg, rightLeg);
    box(leftLeg, 0.36, 0.44, 0.48, slate, 0, -0.24, 0);
    box(rightLeg, 0.36, 0.44, 0.48, slate, 0, -0.24, 0);
    box(leftLeg, 0.39, 0.15, 0.58, midnight, 0, -0.46, 0.06);
    box(rightLeg, 0.39, 0.15, 0.58, midnight, 0, -0.46, 0.06);
    return {
      root, head, leftArm, rightArm, leftLeg, rightLeg,
      position: root.position.clone(), mode, phase,
    };
  }

  const agents: OfficeAgent[] = [
    createAgent(-4.8, -1.92, ocean, "typing", 0.2),
    createAgent(0, -1.92, coral, "typing", 1.5),
    createAgent(4.8, -1.92, violet, "typing", 2.7),
    createAgent(-1.3, 2.25, mint, "walking", 0.6),
    createAgent(6.05, -3.53, ocean, "presenting", 1.3),
  ];

  // Pequeños detalles de movimiento lumínico en el fondo.
  const decorativeLights: THREE.Mesh[] = [];
  for (let i = 0; i < 12; i += 1) {
    const item = box(
      world, 0.13, 0.035, 0.05, litScreen,
      -6.85 + (i % 6) * 2.48, 3.35 - Math.floor(i / 6) * 0.45, -4.79
    );
    decorativeLights.push(item);
  }

  const resize = () => {
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    compact = width < 700;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.25 : 1.65));
    renderer.setSize(width, height, false);
    const heightInWorld = compact ? 21 : width < 1100 ? 15.5 : 13.8;
    const halfHeight = heightInWorld / 2;
    const halfWidth = halfHeight * (width / height);
    camera.left = -halfWidth;
    camera.right = halfWidth;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    camera.position.set(compact ? 11 : 12, compact ? 13 : 11, compact ? 20 : 16);
    camera.lookAt(0, compact ? 1.25 : 1.1, -0.35);
    camera.updateProjectionMatrix();
    world.scale.setScalar(compact ? 0.81 : 1);
    renderer.shadowMap.enabled = !compact;
    keyLight.castShadow = !compact;
    renderer.render(scene, camera);
  };

  let frameId = 0;
  let visible = true;
  let disposed = false;
  let lastFrame = 0;
  const clock = new THREE.Clock();

  const animate = (time: number) => {
    frameId = 0;
    if (disposed || !visible || document.hidden || reducedMotion) return;

    // En móviles limitamos a ~30 fps para preservar batería y fluidez de scroll.
    if (time - lastFrame < (compact ? 32 : 16)) {
      frameId = requestAnimationFrame(animate);
      return;
    }
    lastFrame = time;
    const t = clock.getElapsedTime();

    for (const agent of agents) {
      const phase = t * 2.2 + agent.phase;
      agent.head.rotation.z = Math.sin(phase * 0.65) * 0.065;
      if (agent.mode === "typing") {
        agent.leftArm.rotation.x = -0.88 + Math.sin(phase * 3.0) * 0.20;
        agent.rightArm.rotation.x = -0.88 + Math.sin(phase * 3.0 + 2.2) * 0.20;
        agent.root.position.y = agent.position.y + Math.sin(phase) * 0.025;
      } else if (agent.mode === "walking") {
        const stride = Math.sin(t * 0.64);
        agent.root.position.x = agent.position.x + stride * 2.15;
        agent.root.position.y = agent.position.y + Math.abs(Math.sin(t * 4)) * 0.11;
        agent.root.rotation.y = Math.cos(t * 0.64) >= 0 ? Math.PI / 2 : -Math.PI / 2;
        agent.leftLeg.rotation.x = Math.sin(t * 4) * 0.48;
        agent.rightLeg.rotation.x = -agent.leftLeg.rotation.x;
        agent.leftArm.rotation.x = -agent.leftLeg.rotation.x * 0.5;
        agent.rightArm.rotation.x = agent.leftLeg.rotation.x * 0.5;
      } else {
        agent.root.rotation.y = -0.42;
        agent.rightArm.rotation.z = 1.75 + Math.sin(phase) * 0.24;
        agent.leftArm.rotation.x = Math.sin(phase * 0.45) * 0.22;
      }
    }
    decorativeLights.forEach((light, index) => {
      light.visible = Math.sin(t * 1.5 + index * 1.8) > -0.32;
    });
    camera.position.x += (12 - camera.position.x) * 0.0007;
    renderer.render(scene, camera);
    frameId = requestAnimationFrame(animate);
  };

  const start = () => {
    if (frameId || !visible || document.hidden || reducedMotion || disposed) return;
    clock.start();
    frameId = requestAnimationFrame(animate);
  };
  const stop = () => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    clock.stop();
  };
  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };
  const onMotionPreference = () => {
    reducedMotion = reducedMotionQuery.matches;
    if (reducedMotion) {
      stop();
      renderer.render(scene, camera);
    } else {
      start();
    }
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    stop();
    onUnavailable();
  };

  const observer = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? false;
      if (visible) start();
      else stop();
    },
    { threshold: 0.02 }
  );
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  observer.observe(host);
  reducedMotionQuery.addEventListener("change", onMotionPreference);
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  document.addEventListener("visibilitychange", onVisibility);

  resize();
  start();

  return () => {
    disposed = true;
    stop();
    observer.disconnect();
    resizeObserver.disconnect();
    document.removeEventListener("visibilitychange", onVisibility);
    reducedMotionQuery.removeEventListener("change", onMotionPreference);
    renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
    const geometries = new Set<THREE.BufferGeometry>();
    const materials = new Set<THREE.Material>();
    scene.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      geometries.add(object.geometry);
      const meshMaterials = Array.isArray(object.material) ? object.material : [object.material];
      meshMaterials.forEach((entry) => materials.add(entry));
    });
    geometries.forEach((geometry) => geometry.dispose());
    materials.forEach((entry) => entry.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}
