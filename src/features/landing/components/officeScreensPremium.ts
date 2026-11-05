import * as THREE from "three";

export type DashboardMode = "direction" | "risk" | "actions" | "board" | "portable";

type Screen = { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture; mode: DashboardMode; seed: number };
const screens: Screen[] = [];

const palette = {
  background: "#0a141a", panel: "#14232a", panel2: "#1b3136",
  white: "#f1f2eb", light: "#a5c9bc", muted: "#79978f",
  grid: "#31463f", teal: "#6dd0b0", gold: "#d8bc89",
  blue: "#88b8d9", charcoal: "#102028",
};

function rounded(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  w: number, h: number, radius: number, color: string,
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.fill();
}

function text(
  ctx: CanvasRenderingContext2D, value: string,
  x: number, y: number, size: number, color: string,
  weight: number | "bold" = 500,
) {
  ctx.fillStyle = color;
  ctx.font = weight + " " + size + "px Arial, sans-serif";
  ctx.fillText(value, x, y);
}

function progress(
  ctx: CanvasRenderingContext2D, x: number, y: number,
  w: number, value: number, tint: string,
) {
  rounded(ctx, x, y, w, 11, 5, "#31444a");
  rounded(ctx, x, y, w * Math.max(.04, Math.min(1, value)), 11, 5, tint);
}

function drawDashboard(screen: Screen, time: number) {
  const ctx = screen.canvas.getContext("2d");
  if (!ctx) return;
  const { width, height } = screen.canvas;
  const sx = width / 1280;
  const sy = height / 720;
  ctx.save();
  ctx.scale(sx, sy);
  const W = 1280, H = 720;
  ctx.fillStyle = palette.background;
  ctx.fillRect(0, 0, W, H);
  // Gradiente arquitectónico: discreto, sin saturación pastel.
  const gradient = ctx.createLinearGradient(0, 0, W, H);
  gradient.addColorStop(0, "#16332b");
  gradient.addColorStop(0.55, "#11262c");
  gradient.addColorStop(1, "#0a1620");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "rgba(218,234,222,.05)";
  for (let i = 0; i < 20; i += 1) {
    ctx.fillRect(i * 70, 0, 1, H);
  }
  rounded(ctx, 38, 32, 1204, 654, 24, "rgba(9,19,24,.47)");
  text(ctx, "STACK44", 77, 95, 34, palette.white, 800);
  rounded(ctx, 267, 65, 3, 39, 1, palette.gold);
  text(ctx, "INTELLIGENCE / SG-SST", 289, 91, 19, palette.muted, 600);
  text(ctx, "DEMO · DATOS ILUSTRATIVOS", 938, 94, 17, palette.gold, 600);

  const titles: Record<DashboardMode, string> = {
    direction: "Dirección estratégica",
    risk: "Riesgos y prevención",
    actions: "Plan anual y acciones",
    board: "Comité y seguimiento",
    portable: "Puesto digital SG-SST",
  };
  text(ctx, titles[screen.mode], 78, 174, 46, palette.white, 700);
  text(ctx, "Control y trazabilidad de procesos", 80, 212, 21, palette.light, 500);

  const base = screen.mode === "direction" ? [82, 91, 74]
    : screen.mode === "risk" ? [78, 89, 84]
      : screen.mode === "actions" ? [87, 76, 92]
        : screen.mode === "board" ? [91, 83, 79]
          : [84, 88, 73];
  const names = screen.mode === "risk"
    ? ["CONTROLES", "INSPECCIONES", "VERIFICACIONES"]
    : screen.mode === "actions"
      ? ["PLAN ANUAL", "RESPONSABLES", "EVIDENCIAS"]
      : screen.mode === "board"
        ? ["COMPROMISOS", "SEGUIMIENTO", "ACTAS"]
        : ["CUMPLIMIENTO", "PREVENCIÓN", "GESTIÓN"];
  const tint = [palette.teal, palette.gold, palette.blue];
  for (let i = 0; i < 3; i += 1) {
    const x = 78 + i * 389;
    const v = base[i] + Math.sin(time * .36 + i * 2.4 + screen.seed) * 1.5;
    rounded(ctx, x, 245, 366, 144, 17, palette.panel);
    text(ctx, names[i], x + 25, 288, 17, palette.muted, 700);
    text(ctx, Math.round(v) + "%", x + 25, 347, 42, palette.white, 700);
    progress(ctx, x + 162, 331, 168, v / 100, tint[i]);
    // Micro-indicador y brillo sutil
    rounded(ctx, x + 338, 270, 6, 12, 3, tint[i]);
  }

  // Tendencia de progreso con una gráfica propia, leyenda y retícula.
  rounded(ctx, 78, 416, 750, 217, 18, palette.panel);
  text(ctx, "EVOLUCIÓN DE GESTIÓN", 104, 461, 20, palette.white, 700);
  text(ctx, "Ejemplo visual · 12 períodos", 539, 461, 15, palette.muted);
  for (let row = 0; row <= 3; row += 1) {
    ctx.beginPath();
    ctx.strokeStyle = palette.grid;
    ctx.lineWidth = 1;
    ctx.moveTo(109, 494 + row * 35);
    ctx.lineTo(792, 494 + row * 35);
    ctx.stroke();
  }
  const points = Array.from({ length: 12 }, (_, i) => {
    const value = 32 + i * 3.5 + Math.sin(i * 0.9 + screen.seed) * 6;
    return [124 + i * 57.8, 609 - value * 1.13] as const;
  });
  // Área degradada bajo la curva.
  ctx.beginPath();
  points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  ctx.lineTo(points[points.length - 1][0], 609);
  ctx.lineTo(points[0][0], 609);
  ctx.closePath();
  const area = ctx.createLinearGradient(0, 470, 0, 628);
  area.addColorStop(0, "rgba(106,202,169,.35)");
  area.addColorStop(1, "rgba(106,202,169,.01)");
  ctx.fillStyle = area;
  ctx.fill();
  ctx.beginPath();
  points.forEach(([x, y], i) => i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y));
  ctx.strokeStyle = palette.teal;
  ctx.lineWidth = 5;
  ctx.lineJoin = "round";
  ctx.stroke();
  points.forEach(([x, y], i) => {
    if (i % 2) return;
    ctx.beginPath();
    ctx.fillStyle = palette.white;
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
  });
  // Donut de seguimiento y resumen lateral.
  rounded(ctx, 849, 416, 354, 217, 18, palette.panel2);
  text(ctx, "CICLO PHVA", 879, 462, 19, palette.white, 700);
  ctx.beginPath();
  ctx.arc(930, 546, 58, 0, Math.PI * 2);
  ctx.lineWidth = 17;
  ctx.strokeStyle = "#32484c";
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(930, 546, 58, -Math.PI / 2, -Math.PI / 2 + Math.PI * 1.68);
  ctx.lineWidth = 17;
  ctx.lineCap = "round";
  ctx.strokeStyle = palette.teal;
  ctx.stroke();
  text(ctx, "84%", 903, 554, 26, palette.white, 700);
  text(ctx, "PLANEAR", 1020, 507, 17, palette.light, 700);
  text(ctx, "HACER", 1020, 538, 17, palette.gold, 700);
  text(ctx, "VERIFICAR", 1020, 569, 17, palette.blue, 700);
  text(ctx, "ACTUAR", 1020, 600, 17, palette.white, 700);

  text(ctx, "MONITOREO / SIMULACIÓN VISUAL — NO ES INFORMACIÓN EMPRESARIAL REAL",
    79, 666, 16, palette.muted, 500);
  ctx.restore();
  screen.texture.needsUpdate = true;
}

function makeTexture(mode: DashboardMode, mobile: boolean, seed: number) {
  const canvas = document.createElement("canvas");
  canvas.width = mobile ? 896 : 1536;
  canvas.height = mobile ? 504 : 864;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = mobile ? 1 : 4;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const item = { canvas, texture, mode, seed };
  screens.push(item);
  drawDashboard(item, 0);
  return texture;
}

export function mountPremiumScreens(
  world: THREE.Group,
  mobile: boolean,
) {
  const local: Screen[] = [];
  const previous = screens.length;
  const textures: Record<DashboardMode, THREE.CanvasTexture> = {
    direction: makeTexture("direction", mobile, 1),
    risk: makeTexture("risk", mobile, 3),
    actions: makeTexture("actions", mobile, 7),
    board: makeTexture("board", mobile, 5),
    portable: makeTexture("portable", mobile, 2),
  };
  local.push(...screens.slice(previous));
  const charcoal = new THREE.MeshPhysicalMaterial({
    color: 0x15242b, roughness: .22, metalness: .42, clearcoat: .28,
  });
  const aluminum = new THREE.MeshStandardMaterial({
    color: 0x858e90, roughness: .27, metalness: .75,
  });

  const block = (
    w: number, h: number, d: number,
    mat: THREE.Material, x: number, y: number, z: number,
  ) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    m.position.set(x, y, z);
    m.castShadow = !mobile;
    world.add(m);
    return m;
  };
  const tv = (
    x: number, y: number, z: number,
    width: number, mode: DashboardMode,
  ) => {
    const height = width * 9 / 16;
    block(width + .095, height + .11, .09, charcoal, x, y, z - .07);
    block(width + .016, height + .026, .01, aluminum, x, y, z - .017);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({
        map: textures[mode], toneMapped: false, side: THREE.FrontSide,
      }),
    );
    screen.position.set(x, y, z);
    world.add(screen);
    block(width * .12, .048, .12, charcoal, x, y - height / 2 - .12, z - .13);
  };
  // Paneles ubicados en pared trasera, pantallas mirando +Z hacia los usuarios.
  tv(-15.0, 2.59, -17.76, 5.15, "direction");
  tv(-3.8, 2.59, -17.76, 5.15, "actions");
  tv(14.3, 2.63, -17.76, 6.9, "risk");
  tv(-.6, 2.58, -6.62, 5.15, "board");

  // MacBook estilizado: cubierta delgada de aluminio, teclado/trackpad,
  // bisagra atrás (-Z), pantalla con frente +Z mirando al personaje sentado.
  const keyboardCanvas = document.createElement("canvas");
  keyboardCanvas.width = 512;
  keyboardCanvas.height = 256;
  const kc = keyboardCanvas.getContext("2d");
  if (kc) {
    kc.fillStyle = "#aeb6b8";
    kc.fillRect(0, 0, 512, 256);
    kc.fillStyle = "#233139";
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 13; col += 1) {
        kc.beginPath();
        kc.roundRect(17 + col * 37, 16 + row * 38, 27, 25, 4);
        kc.fill();
      }
    }
    kc.fillStyle = "#cdd5d5";
    kc.beginPath();
    kc.roundRect(179, 180, 154, 56, 6);
    kc.fill();
  }
  const keysTex = new THREE.CanvasTexture(keyboardCanvas);
  keysTex.colorSpace = THREE.SRGBColorSpace;
  const keysMat = new THREE.MeshBasicMaterial({ map: keysTex });
  const laptopScreenMat = new THREE.MeshBasicMaterial({
    map: textures.portable, toneMapped: false, side: THREE.FrontSide,
  });
  const createLaptop = (x: number, y: number, z: number, size = 1.0, angle = 0) => {
    const unit = new THREE.Group();
    unit.position.set(x, y, z);
    unit.rotation.y = angle;
    unit.scale.setScalar(size);
    world.add(unit);
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.27, .045, .86), aluminum);
    base.position.set(0, .025, .10);
    base.castShadow = !mobile;
    unit.add(base);
    const keycap = new THREE.Mesh(new THREE.PlaneGeometry(1.17, .63), keysMat);
    keycap.rotation.x = -Math.PI / 2;
    keycap.position.set(0, .051, .07);
    unit.add(keycap);
    const lid = new THREE.Group();
    lid.position.set(0, .044, -.34);
    // Su cara con el dashboard (+Z) apunta al personaje delante del escritorio.
    lid.rotation.x = -.18;
    unit.add(lid);
    const cover = new THREE.Mesh(new THREE.BoxGeometry(1.31, .82, .043), aluminum);
    cover.position.set(0, .41, 0);
    cover.castShadow = !mobile;
    lid.add(cover);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.22, .72), laptopScreenMat);
    screen.position.set(0, .41, .025);
    lid.add(screen);
    const camera = new THREE.Mesh(new THREE.SphereGeometry(.009, 8, 6), charcoal);
    camera.position.set(0, .789, .026);
    lid.add(camera);
    return unit;
  };
  let lastDraw = -1;
  return {
    laptop: createLaptop,
    update(time: number) {
      const sample = Math.floor(time * 2.2);
      if (sample === lastDraw) return;
      lastDraw = sample;
      local.forEach((item) => drawDashboard(item, time));
    },
    dispose() {
      local.forEach(({ texture }) => texture.dispose());
      keysTex.dispose();
      local.forEach((item) => {
        const i = screens.indexOf(item);
        if (i >= 0) screens.splice(i, 1);
      });
    },
  };
}
