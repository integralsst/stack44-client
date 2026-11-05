import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { addSstOfficeDetails } from "./officeSSTDetails";

export type MiniWorld = {
  dispose: () => void;
  zoomIn: () => void;
  zoomOut: () => void;
  reset: () => void;
  setInteractive: (enabled: boolean) => void;
};

type AgentRole = "typing" | "walking" | "presenting" | "meeting" | "coffee" | "reception";

type Minifigure = {
  root: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  position: THREE.Vector3;
  direction: number;
  role: AgentRole;
  phase: number;
};

type Vehicle = { root: THREE.Group; wheels: THREE.Mesh[]; speed: number; start: number; lane: number };

export function mountOfficeScene(
  host: HTMLElement,
  onUnavailable: () => void,
): MiniWorld | null {
  let renderer: THREE.WebGLRenderer;
  let compact = host.clientWidth < 720;
  let destroyed = false;
  let interactive = false;
  let inViewport = true;
  let raf = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let lastTime = 0;
  let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: !compact,
      powerPreference: compact ? "low-power" : "high-performance",
    });
  } catch {
    onUnavailable();
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.15 : 1.65));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.35;
  renderer.setClearColor(0xf7faf8, 1);
  renderer.shadowMap.enabled = !compact;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.className = "h-full w-full outline-none";
  renderer.domElement.setAttribute("aria-hidden", "true");
  renderer.domElement.style.display = "block";
  renderer.domElement.style.pointerEvents = "none";
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf7faf8);
  const world = new THREE.Group();
  scene.add(world);

  const camera = new THREE.OrthographicCamera(-15, 15, 12, -12, 0.1, 140);
  camera.position.set(25, 24, 29);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.enableRotate = true;
  controls.rotateSpeed = 0.62;
  controls.panSpeed = 0.74;
  controls.zoomSpeed = 0.77;
  controls.minZoom = 0.72;
  controls.maxZoom = 3.3;
  controls.minPolarAngle = Math.PI * 0.16;
  controls.maxPolarAngle = Math.PI * 0.43;
  controls.minAzimuthAngle = -Math.PI * 0.43;
  controls.maxAzimuthAngle = Math.PI * 0.48;
  controls.target.set(0, 0.25, 0);
  controls.update();
  // El gesto vertical sigue desplazando la página incluso en modo exploración.
  renderer.domElement.style.touchAction = "pan-y";

  const mat = (hex: number, gloss = 0.35, metal = 0) =>
    new THREE.MeshPhysicalMaterial({
      color: hex,
      roughness: gloss,
      metalness: metal,
      clearcoat: metal ? 0.06 : 0.35,
      clearcoatRoughness: 0.26,
    });
  const color = {
    dark: mat(0x334655),
    outline: mat(0x81929b, 0.34, 0.35),
    base: mat(0xf0f1ed, 0.36),
    white: mat(0xf8f8f4, 0.26),
    cream: mat(0xe9e3d7, 0.42),
    tile: mat(0xe1e8e6, 0.38),
    glass: new THREE.MeshPhysicalMaterial({
      color: 0x98e9ff, roughness: 0.09, metalness: 0.1, transparent: true,
      opacity: 0.36, depthWrite: false, side: THREE.DoubleSide,
    }),
    wood: mat(0xffffff, 0.39),
    darkWood: mat(0xe6c2a6, 0.35),
    asphalt: mat(0x414c56, 0.91),
    line: mat(0xe8e4cf),
    green: mat(0x4e9e6e, 0.59),
    greenDark: mat(0x2f7754, 0.55),
    greenLight: mat(0x92cb8b, 0.58),
    yellow: mat(0xffd242, 0.20),
    skinBrown: mat(0xa86842, 0.20),
    skinTan: mat(0xe4ad78, 0.20),
    black: mat(0x19252b, 0.29),
    hairBrown: mat(0x693821, 0.26),
    hairRed: mat(0xa94a2d, 0.27),
    hairBlonde: mat(0xe0ac57, 0.28),
    cyan: mat(0x16bcc6, 0.20),
    royal: mat(0x2877bb, 0.21),
    navy: mat(0x284d69, 0.22),
    red: mat(0xdd5865, 0.23),
    tan: mat(0xcab6a0, 0.33),
    violet: mat(0x9878c1, 0.23),
    mint: mat(0x47b2a6, 0.23),
    orange: mat(0xeb9857, 0.24),
    light: new THREE.MeshBasicMaterial({ color: 0x8befff }),
    ink: new THREE.MeshBasicMaterial({ color: 0x253447 }),
    screen: new THREE.MeshBasicMaterial({ color: 0x163b4a }),
    whiteScreen: new THREE.MeshBasicMaterial({ color: 0xc8f8ff }),
    windowDark: new THREE.MeshBasicMaterial({ color: 0x27546b }),
  };


  // Textura de veta de roble cálido con variación física (no una superficie plana).
  const woodCanvas = document.createElement("canvas");
  woodCanvas.width = woodCanvas.height = 256;
  const woodContext = woodCanvas.getContext("2d");
  if (woodContext) {
    woodContext.fillStyle = "#af8568";
    woodContext.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 90; i += 1) {
      const y = (i * 23.7) % 256;
      const alpha = (i % 5 === 0 ? 0.19 : 0.07);
      woodContext.strokeStyle = i % 4 === 0
        ? "rgba(71,44,28," + alpha + ")"
        : "rgba(245,224,191," + alpha + ")";
      woodContext.lineWidth = (i % 7 === 0 ? 2.1 : 0.9);
      woodContext.beginPath();
      woodContext.moveTo(0, y);
      woodContext.bezierCurveTo(70, y - 4, 168, y + 4, 256, y + 1);
      woodContext.stroke();
    }
  }
  const woodTexture = new THREE.CanvasTexture(woodCanvas);
  woodTexture.colorSpace = THREE.SRGBColorSpace;
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(1.2, 1.0);
  color.wood.map = woodTexture;
  color.wood.needsUpdate = true;

  const box = (
    parent: THREE.Object3D, w: number, h: number, d: number,
    material: THREE.Material, x = 0, y = 0, z = 0,
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = !compact;
    mesh.receiveShadow = !compact;
    parent.add(mesh);
    return mesh;
  };
  const cylinder = (
    parent: THREE.Object3D, rt: number, rb: number, h: number,
    material: THREE.Material, x = 0, y = 0, z = 0, segments = 18,
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(rt, rb, h, segments), material,
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = !compact;
    parent.add(mesh);
    return mesh;
  };
  const sphere = (
    parent: THREE.Object3D, radius: number, material: THREE.Material,
    x: number, y: number, z: number,
  ) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, 13, 9), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = !compact;
    parent.add(mesh);
    return mesh;
  };
  const roundBox = (
    parent: THREE.Object3D, w: number, h: number, d: number,
    material: THREE.Material, x = 0, y = 0, z = 0, bevel = 0.09,
  ) => {
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 + bevel, -h / 2);
    shape.lineTo(w / 2 - bevel, -h / 2);
    shape.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + bevel);
    shape.lineTo(w / 2, h / 2 - bevel);
    shape.quadraticCurveTo(w / 2, h / 2, w / 2 - bevel, h / 2);
    shape.lineTo(-w / 2 + bevel, h / 2);
    shape.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - bevel);
    shape.lineTo(-w / 2, -h / 2 + bevel);
    shape.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + bevel, -h / 2);
    const geometry = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.015, d - bevel * 2), bevelEnabled: true,
      bevelThickness: bevel, bevelSize: 0.015, bevelSegments: 2, curveSegments: 3,
    });
    geometry.translate(0, 0, -(d - bevel * 2) / 2);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = !compact;
    mesh.receiveShadow = !compact;
    parent.add(mesh);
    return mesh;
  };
  const makeLabel = (text: string, x: number, y: number, z: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = 384;
    canvas.height = 90;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "rgba(12,30,47,0.89)";
    ctx.beginPath();
    ctx.roundRect(3, 3, 378, 84, 25);
    ctx.fill();
    ctx.strokeStyle = "rgba(111,237,242,0.45)";
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillStyle = "#b9f9f7";
    ctx.font = "700 34px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 192, 46, 358);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture, transparent: true, depthWrite: false,
    }));
    sprite.position.set(x, y, z);
    sprite.scale.set(3.25, 0.77, 1);
    world.add(sprite);
    return sprite;
  };

  scene.add(new THREE.HemisphereLight(0xe9faff, 0x536571, 3));
  const sun = new THREE.DirectionalLight(0xfffaf0, 3.3);
  sun.position.set(-7, 18, 10);
  sun.castShadow = !compact;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -19;
  sun.shadow.camera.right = 19;
  sun.shadow.camera.top = 18;
  sun.shadow.camera.bottom = -18;
  sun.shadow.normalBias = 0.03;
  scene.add(sun);
  const accentLight = new THREE.PointLight(0x41dbef, 38, 28);
  accentLight.position.set(8, 8, -5);
  scene.add(accentLight);

  // Base de maqueta, baldosas, jardines y un boulevard transitable.
  roundBox(world, 23.8, 0.48, 20.0, color.white, 0, -0.62, 0.1, 0.17);
  box(world, 23.6, 0.085, 19.9, color.cream, 0, -0.34, 0.1);
  roundBox(world, 23.9, 0.09, 20.15, color.outline, 0, -0.96, 0.1, 0.05);
  box(world, 23.2, 0.07, 12.1, color.tile, 0, -0.245, -3.65);
  box(world, 23.4, 0.035, 4.65, color.asphalt, 0, -0.28, 7.57);
  box(world, 23.3, 0.09, 1.00, color.cream, 0, -0.22, 4.75);

  // Pintura sobre el asfalto: dos carriles, marcas centrales, pasos peatonales.
  for (let i = -5; i <= 5; i += 1) {
    box(world, 1.1, 0.008, 0.07, color.line, i * 2.15, -0.250, 7.50);
  }
  for (let i = 0; i < 7; i += 1) {
    box(world, 0.23, 0.009, 2.9, color.line, 8.65 + i * 0.40, -0.244, 7.5);
  }
  box(world, 23.5, 0.013, 0.10, color.line, 0, -0.246, 5.35);
  box(world, 23.5, 0.013, 0.10, color.line, 0, -0.246, 9.78);

  // Baldosas de piso del edificio: tramas con líneas finas en vez de cientos de mallas.
  const tileCanvas = document.createElement("canvas");
  tileCanvas.width = tileCanvas.height = 512;
  const tc = tileCanvas.getContext("2d");
  let tileTexture: THREE.CanvasTexture | null = null;
  if (tc) {
    tc.fillStyle = "#e6e9e5";
    tc.fillRect(0, 0, 512, 512);
    tc.strokeStyle = "#d3dcd9";
    tc.lineWidth = 3;
    for (let i = 0; i <= 8; i += 1) {
      const n = i * 64;
      tc.beginPath();
      tc.moveTo(n, 0);
      tc.lineTo(n, 512);
      tc.moveTo(0, n);
      tc.lineTo(512, n);
      tc.stroke();
    }
    tileTexture = new THREE.CanvasTexture(tileCanvas);
    tileTexture.colorSpace = THREE.SRGBColorSpace;
    tileTexture.wrapS = tileTexture.wrapT = THREE.RepeatWrapping;
    tileTexture.repeat.set(2.3, 1.3);
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(22.5, 11.85),
      new THREE.MeshStandardMaterial({ map: tileTexture, roughness: 0.92 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, -0.201, -3.58);
    floor.receiveShadow = !compact;
    world.add(floor);
  }

  // Arquitectura cutaway: paredes bajas, cristales y marcos que no ocultan la vista.
  const wall = (
    x: number, z: number, w: number, d: number, h = 1.5,
    material: THREE.Material = color.white,
  ) => {
    roundBox(world, w, h, d, material, x, (h / 2) - 0.17, z, 0.06);
    box(world, w, 0.075, d + 0.015, color.cream, x, h - 0.12, z);
  };
  wall(0, -9.45, 22.7, 0.30, 2.3);
  wall(-11.27, -3.55, 0.28, 11.7, 1.85);
  wall(11.27, -3.55, 0.28, 11.7, 1.85);
  wall(-3.7, -6.05, 0.22, 6.0, 1.45);
  wall(3.8, -6.05, 0.22, 6.1, 1.55);
  wall(3.9, 0.45, 0.20, 4.4, 1.15);
  wall(-8.6, -0.55, 5.3, 0.17, 1.25);
  wall(7.8, -1.65, 6.6, 0.15, 1.1);
  // Transparencias y postes sutiles de la sala de juntas.
  for (const x of [4.12, 6.5, 8.88, 11.06]) {
    box(world, 0.085, 1.35, 0.085, color.outline, x, 1.6, -1.58);
  }
  box(world, 6.95, 1.06, 0.045, color.glass, 7.55, 1.49, -1.59);

  const labels = [
    makeLabel("RECEPCIÓN", -7.0, 2.55, 1.80),
    makeLabel("OPERACIONES", -0.22, 2.70, -6.45),
    makeLabel("SALA DE JUNTAS", 7.35, 2.68, -3.00),
    makeLabel("CAFETERÍA", -7.55, 2.7, -7.95),
  ].filter((value): value is THREE.Sprite => value !== null);

  // Paneles de fondo que sugieren ventanas y ambiente corporativo.
  const windowPanel = (x: number, z: number, w: number) => {
    box(world, w, 1.35, 0.065, color.outline, x, 1.30, z);
    box(world, w - 0.17, 1.21, 0.07, color.glass, x, 1.30, z + 0.06);
    box(world, 0.05, 1.26, 0.07, color.white, x, 1.30, z + 0.12);
  };
  for (const x of [-8.9, -5.5, -2.1, 1.3, 4.7, 8.1]) {
    windowPanel(x, -9.20, 2.7);
  }

  function desk(x: number, z: number, deskColor: THREE.Material, rotation = 0) {
    const group = new THREE.Group();
    group.position.set(x, -0.15, z);
    group.rotation.y = rotation;
    world.add(group);
    roundBox(group, 2.45, 0.15, 1.25, deskColor, 0, 1.05, 0, 0.07);
    for (const dx of [-1.00, 1.00]) {
      for (const dz of [-0.46, 0.46]) box(group, 0.09, 0.97, 0.10, color.outline, dx, 0.48, dz);
    }
    box(group, 0.89, 0.59, 0.085, color.black, 0.05, 1.57, -0.30);
    box(group, 0.80, 0.50, 0.01, color.screen, 0.05, 1.57, -0.250);
    box(group, 0.53, 0.055, 0.015, color.light, 0.00, 1.69, -0.24);
    box(group, 0.66, 0.029, 0.015, color.whiteScreen, 0.0, 1.55, -0.24);
    box(group, 0.36, 0.025, 0.015, color.cyan, -0.15, 1.43, -0.24);
    box(group, 0.055, 0.18, 0.075, color.outline, 0.05, 1.19, -0.34);
    box(group, 0.46, 0.04, 0.24, color.outline, 0.05, 1.11, -0.34);
    roundBox(group, 0.70, 0.025, 0.23, color.white, 0.05, 1.14, 0.32, 0.015);
    cylinder(group, 0.11, 0.105, 0.22, color.white, 0.92, 1.25, 0.24);
    return group;
  }

  desk(-2.20, -6.60, color.white);
  desk(1.20, -6.60, color.white);
  desk(-2.20, -3.60, color.white);
  desk(1.20, -3.60, color.white);

  function chair(x: number, z: number, rotation = 0) {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = rotation;
    world.add(group);
    roundBox(group, 0.80, 0.76, 0.16, color.navy, 0, 0.80, -0.20, 0.07);
    roundBox(group, 0.80, 0.14, 0.78, color.navy, 0, 0.48, 0.07, 0.04);
    cylinder(group, 0.045, 0.045, 0.39, color.outline, 0, 0.24, 0.04);
    box(group, 0.90, 0.06, 0.12, color.outline, 0, 0.055, 0.05);
    return group;
  }
  for (const x of [-2.20, 1.20]) {
    chair(x, -7.75);
    chair(x, -4.75);
  }

  // Recepción: mostrador, portátiles y documentación.
  const reception = new THREE.Group();
  reception.position.set(-7.0, -0.16, 1.26);
  world.add(reception);
  roundBox(reception, 4.2, 1.15, 1.05, color.wood, 0, 0.63, 0, 0.10);
  roundBox(reception, 4.28, 0.11, 1.19, color.white, 0, 1.25, 0, 0.07);
  box(reception, 3.5, 0.04, 0.04, color.cyan, 0, 0.77, 0.54);
  box(reception, 0.83, 0.57, 0.06, color.black, -0.74, 1.57, -0.12);
  box(reception, 0.71, 0.47, 0.015, color.screen, -0.74, 1.57, -0.075);
  for (let i = 0; i < 3; i += 1) box(reception, 0.48, 0.05, 0.33, i === 0 ? color.cyan : color.white, 0.62, 1.39 + i * 0.065, 0);

  // Sala de juntas premium: mesa ovalada, asientos, panel de presentación.
  const meetingTable = new THREE.Group();
  meetingTable.position.set(7.65, 0, -4.32);
  world.add(meetingTable);
  const tableTop = cylinder(meetingTable, 2.16, 2.16, 0.19, color.darkWood, 0, 1.04, 0, 32);
  tableTop.scale.set(1.08, 1, 0.62);
  cylinder(meetingTable, 0.56, 0.68, 0.94, color.outline, 0, 0.51, 0);
  for (const [x, z] of [[-1.85, 0], [1.85, 0], [-1.0, -1.1], [1.0, -1.1], [-1.0, 1.1], [1.0, 1.1]]) {
    chair(7.65 + x, -4.32 + z, z > 0 ? Math.PI : 0);
  }
  box(world, 3.0, 1.42, 0.09, color.dark, 7.4, 2.33, -9.12);
  box(world, 2.74, 1.22, 0.01, color.screen, 7.4, 2.33, -9.04);
  box(world, 1.70, 0.09, 0.02, color.cyan, 7.22, 2.60, -9.025);
  box(world, 0.70, 0.075, 0.02, color.whiteScreen, 6.80, 2.34, -9.023);
  box(world, 1.32, 0.07, 0.02, color.whiteScreen, 7.20, 2.17, -9.023);

  // Cafetería: isla, cafetera, muebles y área de descanso.
  roundBox(world, 4.30, 0.76, 0.68, color.white, -8.23, 0.30, -8.45, 0.08);
  box(world, 4.3, 0.13, 0.83, color.wood, -8.23, 0.72, -8.45);
  box(world, 0.62, 0.48, 0.53, color.black, -9.14, 1.01, -8.44);
  box(world, 0.44, 0.16, 0.08, color.cyan, -9.14, 1.08, -8.13);
  cylinder(world, 0.18, 0.17, 0.30, color.orange, -6.98, 1.06, -8.42);
  roundBox(world, 2.8, 0.28, 1.05, color.violet, -7.52, 0.59, -5.48, 0.11);
  roundBox(world, 2.8, 0.75, 0.24, color.violet, -7.52, 1.00, -5.98, 0.07);
  cylinder(world, 0.62, 0.62, 0.07, color.wood, -8.80, 0.60, -3.60);
  cylinder(world, 0.09, 0.09, 0.59, color.outline, -8.80, 0.27, -3.60);

  // Macetas con hojas poligonales y luminarias urbanas.
  function plant(x: number, z: number, scale = 1) {
    const g = new THREE.Group();
    g.position.set(x, -0.15, z);
    g.scale.setScalar(scale);
    world.add(g);
    cylinder(g, 0.39, 0.28, 0.56, color.white, 0, 0.30, 0);
    cylinder(g, 0.12, 0.13, 0.70, color.greenDark, 0, 0.87, 0);
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2;
      const leaf = sphere(g, 0.35, i % 2 ? color.green : color.greenLight,
        Math.sin(a) * 0.35, 1.25 + (i % 3) * 0.10, Math.cos(a) * 0.35);
      leaf.scale.set(0.65, 1.28, 0.55);
    }
  }
  for (const [x, z, s] of [
    [-10.7, 3.6, 0.95], [-3.65, 2.5, 0.72], [3.2, 2.5, 0.75],
    [10.7, 3.5, 0.92], [-10.65, -8.4, 0.75], [10.62, -8.3, 0.82],
    [-10.5, 5.05, 0.8], [0.6, 5.05, 0.8], [10.0, 5.05, 0.8],
  ] as const) plant(x, z, s);
  for (const x of [-8, 0, 8]) {
    cylinder(world, 0.07, 0.09, 3.55, color.dark, x, 1.65, 5.04);
    sphere(world, 0.26, color.white, x, 3.50, 5.04);
  }

  // Figuras articuladas de juguete: cabeza cilíndrica, manos en C, ropa y cabellos.
  function minifigure(
    x: number, z: number, outfit: THREE.Material, role: AgentRole,
    phase: number, hairstyle: "short" | "long" | "waves" | "spikes" | "bun",
    hairColor: THREE.Material, skin: THREE.Material = color.yellow,
    direction = 0,
  ): Minifigure {
    const root = new THREE.Group();
    root.position.set(x, -0.10, z);
    root.rotation.y = direction;
    world.add(root);

    // Pantalón y torso trapezoidal.
    for (const dx of [-0.23, 0.23]) {
      roundBox(root, 0.39, 0.56, 0.55, color.navy, dx, 0.27, 0.01, 0.05);
      roundBox(root, 0.40, 0.16, 0.64, color.black, dx, 0.065, 0.08, 0.06);
    }
    roundBox(root, 0.89, 0.77, 0.57, outfit, 0, 0.98, 0, 0.085);
    // Cuello, camisa, corbata en la superficie frontal.
    box(root, 0.30, 0.35, 0.019, color.white, 0, 1.14, 0.30);
    box(root, 0.09, 0.29, 0.023, color.red, 0, 1.02, 0.319);
    cylinder(root, 0.11, 0.11, 0.13, skin, 0, 1.45, 0);

    const head = new THREE.Group();
    head.position.y = 1.79;
    root.add(head);
    cylinder(head, 0.34, 0.34, 0.54, skin);
    cylinder(head, 0.23, 0.23, 0.10, skin, 0, 0.31, 0);
    // Facciones frontales (frente hacia +Z).
    sphere(head, 0.033, color.ink, -0.13, 0.06, 0.333);
    sphere(head, 0.033, color.ink, 0.13, 0.06, 0.333);
    const mouth = new THREE.Mesh(
      new THREE.TorusGeometry(0.10, 0.013, 6, 16, Math.PI),
      color.ink,
    );
    mouth.position.set(0, -0.090, 0.337);
    mouth.rotation.z = Math.PI;
    head.add(mouth);

    // Cabelleras volumétricas moldeadas (en lugar de un simple cilindro).
    const cap = sphere(head, 0.345, hairColor, 0, 0.28, -0.02);
    cap.scale.set(1.04, 0.47, 1.07);
    if (hairstyle === "spikes") {
      for (let i = 0; i < 5; i += 1) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.27, 6), hairColor);
        cone.position.set(-0.25 + i * 0.13, 0.44 + (i % 2) * 0.09, 0.04);
        cone.rotation.z = -0.35;
        head.add(cone);
      }
    }
    if (hairstyle === "long" || hairstyle === "waves") {
      for (const dx of [-0.30, 0.30]) {
        for (let i = 0; i < (hairstyle === "waves" ? 3 : 2); i += 1) {
          sphere(head, 0.19, hairColor, dx + (i % 2) * 0.027, -0.04 - i * 0.16, -0.08);
        }
      }
    }
    if (hairstyle === "bun") {
      sphere(head, 0.20, hairColor, 0, 0.31, -0.34);
    }
    if (hairstyle === "short") {
      box(head, 0.48, 0.09, 0.12, hairColor, 0, 0.28, 0.28);
    }

    const leftArm = new THREE.Group();
    const rightArm = new THREE.Group();
    for (const [arm, side] of [[leftArm, -1], [rightArm, 1]] as const) {
      arm.position.set(side * 0.57, 1.30, 0);
      root.add(arm);
      cylinder(arm, 0.165, 0.135, 0.54, outfit, 0, -0.27, 0);
      // Mano C articulada: aro abierto, visible incluso en la cámara oblicua.
      const hand = new THREE.Mesh(
        new THREE.TorusGeometry(0.13, 0.057, 7, 12, Math.PI * 1.64), skin,
      );
      hand.position.set(0, -0.61, 0.03);
      hand.rotation.x = Math.PI / 2;
      arm.add(hand);
    }
    const leftLeg = new THREE.Group();
    const rightLeg = new THREE.Group();
    // Pivotes para caminar; las piernas visuales están ancladas a los grupos.
    for (const [leg, side] of [[leftLeg, -1], [rightLeg, 1]] as const) {
      leg.position.set(side * 0.23, 0.53, 0);
      root.add(leg);
      roundBox(leg, 0.38, 0.50, 0.54, color.navy, 0, -0.27, 0, 0.045);
      box(leg, 0.40, 0.15, 0.64, color.black, 0, -0.52, 0.08);
    }

    return {
      root, head, leftArm, rightArm, leftLeg, rightLeg,
      position: root.position.clone(), direction, role, phase,
    };
  }

  const people: Minifigure[] = [
    minifigure(-1.9, -7.7, color.royal, "typing", 0.2, "short", color.black, color.yellow, 0),
    minifigure(1.4, -7.7, color.red, "typing", 0.8, "waves", color.hairBrown, color.skinTan, 0),
    minifigure(-1.9, -4.7, color.navy, "typing", 1.9, "spikes", color.black, color.yellow, 0),
    minifigure(1.4, -4.7, color.tan, "typing", 2.7, "long", color.hairBlonde, color.yellow, 0),
    minifigure(-7.1, -0.80, color.mint, "reception", 1.2, "bun", color.hairBrown, color.skinBrown, Math.PI),
    minifigure(6.35, -6.65, color.royal, "presenting", 1.2, "short", color.black, color.yellow, 0.3),
    minifigure(8.70, -5.58, color.red, "meeting", 2.4, "waves", color.hairRed, color.skinTan, -0.4),
    minifigure(6.55, -2.7, color.tan, "meeting", 3.2, "long", color.hairBlonde, color.yellow, Math.PI),
    minifigure(-8.10, -4.35, color.orange, "coffee", 0.5, "spikes", color.black, color.skinBrown),
    minifigure(-0.3, 2.33, color.violet, "walking", 1.5, "short", color.black, color.yellow),
  ];

  // Ruedas y autos cruzando la carretera, no solo decoración estática.
  function car(baseColor: THREE.Material, x: number, lane: number, speed: number) {
    const root = new THREE.Group();
    root.position.set(x, -0.04, lane);
    world.add(root);
    roundBox(root, 2.05, 0.52, 1.02, baseColor, 0, 0.42, 0, 0.18);
    roundBox(root, 1.12, 0.51, 0.86, baseColor, -0.12, 0.84, 0, 0.11);
    box(root, 0.51, 0.32, 0.02, color.glass, -0.12, 0.89, 0.445);
    box(root, 0.51, 0.32, 0.02, color.glass, -0.12, 0.89, -0.445);
    for (const dx of [-0.68, 0.68]) {
      box(root, 0.08, 0.13, 0.21, color.whiteScreen, dx, 0.53, 0.51);
      box(root, 0.08, 0.13, 0.21, color.red, dx, 0.53, -0.51);
    }
    const wheels: THREE.Mesh[] = [];
    for (const dx of [-0.70, 0.70]) {
      for (const dz of [-0.51, 0.51]) {
        const wheel = cylinder(root, 0.235, 0.235, 0.155, color.black, dx, 0.18, dz, 16);
        wheel.rotation.x = Math.PI / 2;
        wheels.push(wheel);
        cylinder(root, 0.07, 0.07, 0.01, color.white, dx, 0.18, dz, 10).rotation.x = Math.PI / 2;
      }
    }
    return { root, wheels, speed, start: x, lane };
  }
  const vehicles: Vehicle[] = [
    car(color.cyan, -10.0, 6.35, 1.18),
    car(color.orange, 5.0, 8.72, -1.0),
    car(color.red, 12.8, 6.35, 0.88),
  ];

  // Campus abierto: retiramos por completo los edificios del primer plano.
  // Añadimos pantallas SG-SST, acabados premium, jardines y más detalle a figuras.
  addSstOfficeDetails(world, people);

  // El scroll vertical siempre tiene prioridad frente a OrbitControls.
  const allowPageScroll = (event: WheelEvent) => {
    // La rueda y Ctrl+rueda conservan el desplazamiento/zoom del navegador.
    // El zoom del mundo queda en botones y gesto táctil de dos dedos.
    event.stopPropagation();
  };
  host.addEventListener("wheel", allowPageScroll, { capture: true, passive: true });

  let initialZoom = 1;
  let userAdjustedZoom = false;
  const render = () => {
    controls.update();
    renderer.render(scene, camera);
  };
  const resize = () => {
    if (destroyed) return;
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    compact = width < 720;
    const halfHeight = compact ? 14.6 : width < 1100 ? 11.5 : 10.1;
    const aspect = width / height;
    camera.left = -halfHeight * aspect;
    camera.right = halfHeight * aspect;
    camera.top = halfHeight;
    camera.bottom = -halfHeight;
    world.scale.setScalar(compact ? 0.53 : width < 1100 ? 0.80 : 1);
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, compact ? 1.15 : 1.65));
    renderer.setSize(width, height, false);
    renderer.shadowMap.enabled = !compact;
    sun.castShadow = !compact;
    labels.forEach((label) => { label.visible = !compact; });
    initialZoom = 1;
    if (!userAdjustedZoom) camera.zoom = initialZoom;
    camera.updateProjectionMatrix();
    render();
  };
  const frame = (time: number) => {
    raf = 0;
    if (destroyed || !inViewport || document.hidden) return;
    const fpsTarget = compact ? 32 : 60;
    const minimumFrame = 1000 / fpsTarget;
    if (time - lastFrame < minimumFrame && !reducedMotion) {
      raf = requestAnimationFrame(frame);
      return;
    }
    const dt = Math.min(lastTime ? (time - lastTime) / 1000 : 0.016, 0.10);
    lastTime = time;
    lastFrame = time;
    if (!reducedMotion) {
      elapsed += dt;
      const t = elapsed;
      for (const person of people) {
        const phase = t * 2.0 + person.phase;
        person.head.rotation.z = Math.sin(phase * 0.67) * 0.06;
        person.leftArm.rotation.x = 0;
        person.rightArm.rotation.x = 0;
        if (person.role === "typing" || person.role === "reception") {
          person.leftArm.rotation.x = -0.85 + Math.sin(phase * 3.2) * 0.22;
          person.rightArm.rotation.x = -0.85 + Math.sin(phase * 3.2 + 1.7) * 0.22;
          person.root.position.y = person.position.y + Math.sin(phase) * 0.02;
        }
        if (person.role === "walking") {
          person.root.position.x = person.position.x + Math.sin(t * 0.46) * 2.65;
          person.root.position.y = person.position.y + Math.abs(Math.sin(t * 5)) * 0.09;
          person.root.rotation.y = Math.cos(t * 0.46) > 0 ? Math.PI / 2 : -Math.PI / 2;
          person.leftLeg.rotation.x = Math.sin(t * 5) * 0.4;
          person.rightLeg.rotation.x = -person.leftLeg.rotation.x;
          person.leftArm.rotation.x = -person.leftLeg.rotation.x * 0.6;
          person.rightArm.rotation.x = -person.rightLeg.rotation.x * 0.6;
        }
        if (person.role === "presenting") {
          person.rightArm.rotation.z = -1.45 + Math.sin(phase) * 0.2;
          person.head.rotation.y = Math.sin(t * 0.38) * 0.25;
        }
        if (person.role === "meeting") {
          person.rightArm.rotation.z = -0.3 + Math.sin(phase) * 0.4;
          person.head.rotation.y = Math.sin(phase * 0.53) * 0.18;
        }
        if (person.role === "coffee") {
          person.rightArm.rotation.x = -0.6 + Math.sin(phase) * 0.25;
          person.head.rotation.x = Math.sin(phase * 0.6) * 0.04;
        }
      }
      for (const vehicle of vehicles) {
        let x = vehicle.start + t * vehicle.speed * 1.65;
        if (vehicle.speed > 0) x = ((x + 15) % 32 + 32) % 32 - 15;
        else x = 15 - (((15 - x) % 32 + 32) % 32);
        vehicle.root.position.x = x;
        vehicle.wheels.forEach((wheel) => wheel.rotateY(dt * vehicle.speed * 2.4));
      }
    }
    render();
    if (!reducedMotion || interactive) raf = requestAnimationFrame(frame);
  };
  const start = () => {
    if (!raf && !destroyed && inViewport && !document.hidden) {
      lastTime = 0;
      raf = requestAnimationFrame(frame);
    }
  };
  const stop = () => {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    lastTime = 0;
  };
  const io = new IntersectionObserver((entries) => {
    inViewport = entries[0]?.isIntersecting ?? false;
    if (inViewport) start();
    else stop();
  }, { threshold: 0.02 });
  const ro = new ResizeObserver(resize);
  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const motionChange = () => {
    reducedMotion = motionQuery.matches;
    if (reducedMotion) {
      stop();
      render();
    } else {
      start();
    }
  };
  const visibilityChange = () => { if (document.hidden) stop(); else start(); };
  const contextLost = (event: Event) => {
    event.preventDefault();
    stop();
    onUnavailable();
  };
  ro.observe(host);
  io.observe(host);
  motionQuery.addEventListener("change", motionChange);
  document.addEventListener("visibilitychange", visibilityChange);
  renderer.domElement.addEventListener("webglcontextlost", contextLost);
  resize();
  start();

  const changeZoom = (multiplier: number) => {
    userAdjustedZoom = true;
    camera.zoom = THREE.MathUtils.clamp(camera.zoom * multiplier, controls.minZoom, controls.maxZoom);
    camera.updateProjectionMatrix();
    render();
    start();
  };
  return {
    zoomIn: () => changeZoom(1.23),
    zoomOut: () => changeZoom(1 / 1.23),
    reset: () => {
      userAdjustedZoom = false;
      controls.reset();
      camera.zoom = initialZoom;
      camera.updateProjectionMatrix();
      render();
    },
    setInteractive: (enabled) => {
      interactive = enabled;
      renderer.domElement.style.pointerEvents = enabled ? "auto" : "none";
      renderer.domElement.style.touchAction = "pan-y";
      controls.enabled = enabled;
      if (enabled) start();
      else render();
    },
    dispose: () => {
      destroyed = true;
      stop();
      io.disconnect();
      ro.disconnect();
      motionQuery.removeEventListener("change", motionChange);
      document.removeEventListener("visibilitychange", visibilityChange);
      renderer.domElement.removeEventListener("webglcontextlost", contextLost);
      host.removeEventListener("wheel", allowPageScroll, { capture: true });
      controls.dispose();
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
        const maybeMap = (m as THREE.MeshStandardMaterial).map;
        if (maybeMap) textures.add(maybeMap);
        m.dispose();
      });
      if (tileTexture) textures.add(tileTexture);
      textures.forEach((texture) => texture.dispose());
      geos.forEach((geo) => geo.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
