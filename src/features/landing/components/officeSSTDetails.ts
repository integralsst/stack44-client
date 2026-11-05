import * as THREE from "three";

/**
 * Detalles de arquitectura + pantallas SG-SST para la maqueta.
 * Visualización de muestra: ninguna cifra se obtiene de datos reales.
 * Sin assets externos; texturas diseñadas en canvas para evitar peticiones de red.
 */
export function addSstOfficeDetails(
  world: THREE.Group,
  figures: Array<{ root: THREE.Group; head: THREE.Group }>,
): void {
  const porcelain = new THREE.MeshPhysicalMaterial({
    color: 0xf4f5ef, roughness: 0.26, clearcoat: 0.24, clearcoatRoughness: 0.2,
  });
  const ivory = new THREE.MeshPhysicalMaterial({
    color: 0xe7e3da, roughness: 0.45, clearcoat: 0.12,
  });
  const graphite = new THREE.MeshPhysicalMaterial({
    color: 0x202e39, roughness: 0.31, metalness: 0.32,
  });
  const brushedMetal = new THREE.MeshStandardMaterial({
    color: 0xa4b6bc, metalness: 0.7, roughness: 0.32,
  });
  const jade = new THREE.MeshStandardMaterial({ color: 0x428d74, roughness: 0.63 });
  const olive = new THREE.MeshStandardMaterial({ color: 0x74b88a, roughness: 0.67 });
  const leafLight = new THREE.MeshStandardMaterial({ color: 0xa5cc80, roughness: 0.68 });
  const coolGlow = new THREE.MeshBasicMaterial({ color: 0x9beeff });
  const amber = new THREE.MeshPhysicalMaterial({ color: 0xffc23c, roughness: 0.27, clearcoat: 0.8 });
  const safetyOrange = new THREE.MeshPhysicalMaterial({ color: 0xec853e, roughness: 0.31, clearcoat: 0.5 });
  const signalRed = new THREE.MeshPhysicalMaterial({ color: 0xc54444, roughness: 0.29, clearcoat: 0.4 });

  const cube = (
    parent: THREE.Object3D, w: number, h: number, d: number,
    material: THREE.Material, x: number, y: number, z: number,
  ) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const ball = (
    parent: THREE.Object3D, radius: number, material: THREE.Material,
    x: number, y: number, z: number, detail = 12,
  ) => {
    const mesh = new THREE.Mesh(new THREE.SphereGeometry(radius, detail, 9), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };
  const cylinder = (
    parent: THREE.Object3D, radius: number, h: number, material: THREE.Material,
    x: number, y: number, z: number,
  ) => {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, h, 14), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    parent.add(mesh);
    return mesh;
  };

  type DashboardMode = "overview" | "meeting" | "training" | "device" | "reception";
  function displayTexture(mode: DashboardMode, seed: number): THREE.CanvasTexture {
    const c = document.createElement("canvas");
    const ctx = c.getContext("2d");
    c.width = 768;
    c.height = 430;
    if (ctx) {
      const w = c.width;
      const h = c.height;
      ctx.fillStyle = mode === "reception" ? "#12313e" : "#0e2532";
      ctx.fillRect(0, 0, w, h);
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, "rgba(48,205,199,.16)");
      gradient.addColorStop(1, "rgba(12,23,50,.02)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#51ded3";
      ctx.fillRect(38, 32, 58, 5);
      ctx.fillStyle = "#ecfaf9";
      ctx.font = "bold 32px Arial, sans-serif";
      const titles: Record<DashboardMode, string> = {
        overview: "CENTRO DE CONTROL SG-SST",
        meeting: "PLAN DE ACCIÓN · SG-SST",
        training: "FORMACIÓN Y PREVENCIÓN",
        device: ["INSPECCIONES", "PELIGROS Y RIESGOS", "EVIDENCIAS", "SEGUIMIENTO"][seed % 4],
        reception: "STACK44  /  SST DIGITAL",
      };
      ctx.fillText(titles[mode], 38, 86, w - 76);
      ctx.fillStyle = "#81adb6";
      ctx.font = "21px Arial, sans-serif";
      ctx.fillText("ENTORNO DEMOSTRATIVO", 39, 119, w - 70);

      if (mode === "reception") {
        ctx.font = "bold 78px Arial, sans-serif";
        ctx.fillStyle = "#f2fdfb";
        ctx.fillText("BIENVENIDOS", 40, 250);
        ctx.font = "26px Arial, sans-serif";
        ctx.fillStyle = "#a3d7d3";
        ctx.fillText("Tecnología al servicio de la prevención", 41, 308, w - 75);
      } else {
        const palettes = ["#5ce0d2", "#7fa4ff", "#fbbd6e", "#9de69a"];
        const labels = mode === "meeting"
          ? ["ACCIÓN", "RESPONSABLE", "EVIDENCIA"]
          : mode === "training"
            ? ["INDUCCIÓN", "EMERGENCIAS", "AUTOCUIDADO"]
            : ["CONTROL", "SEGUIMIENTO", "PREVENCIÓN"];
        for (let i = 0; i < 3; i += 1) {
          const x = 38 + i * 244;
          ctx.fillStyle = "#173947";
          ctx.beginPath();
          ctx.roundRect(x, 150, 224, 94, 15);
          ctx.fill();
          ctx.fillStyle = "#95bdc3";
          ctx.font = "bold 16px Arial, sans-serif";
          ctx.fillText(labels[i], x + 18, 182);
          ctx.fillStyle = palettes[i];
          ctx.fillRect(x + 18, 204, 105 + (seed % 3) * 17 + i * 16, 9);
        }
        ctx.strokeStyle = "#294d59";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(39, 373);
        ctx.lineTo(730, 373);
        ctx.stroke();
        ctx.beginPath();
        for (let i = 0; i < 18; i += 1) {
          const x = 45 + i * 38;
          const y = 325 - Math.sin(i * 0.47 + seed) * 26 - i * 1.3;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#53dcca";
        ctx.stroke();
        for (let i = 0; i < 18; i += 1) {
          const x = 45 + i * 38;
          const y = 325 - Math.sin(i * 0.47 + seed) * 26 - i * 1.3;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fillStyle = "#dcfffb";
          ctx.fill();
        }
        ctx.fillStyle = "#63838c";
        ctx.font = "17px Arial, sans-serif";
        ctx.fillText("CICLO PHVA", 42, 407);
      }
    }
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }

  function tv(x: number, y: number, z: number, w: number, h: number, mode: DashboardMode, seed = 0) {
    cube(world, w + 0.16, h + 0.16, 0.095, graphite, x, y, z - 0.055);
    const texture = displayTexture(mode, seed);
    const surface = new THREE.Mesh(
      new THREE.PlaneGeometry(w, h),
      new THREE.MeshBasicMaterial({ map: texture, toneMapped: false, side: THREE.DoubleSide }),
    );
    surface.position.set(x, y, z + 0.006);
    world.add(surface);
    cube(world, w * 0.12, 0.035, 0.13, brushedMetal, x, y - h / 2 - 0.11, z - 0.04);
  }

  // Gigantescas pantallas luminosas decorativas, no métricas verdaderas.
  tv(-0.05, 3.18, -9.10, 4.85, 1.60, "overview");
  tv(7.40, 2.42, -8.91, 2.76, 1.20, "meeting");
  tv(-7.30, 3.10, -9.07, 3.45, 1.30, "training");
  tv(-7.00, 1.86, 2.00, 2.95, 0.82, "reception");

  // Acabados arquitectónicos: listones de madera, plafones, LEDs y estructura abierta.
  for (let i = 0; i < 12; i += 1) {
    cube(world, 0.052, 2.0, 0.10, i % 2 ? ivory : porcelain,
      -10.82 + i * 0.21, 1.70, -9.07);
  }
  for (const x of [-3.65, 3.8, 11.07]) {
    cube(world, 0.10, 3.45, 0.10, brushedMetal, x, 1.62, -8.93);
  }
  for (const [x, z] of [[-1.7, -6.5], [1.5, -6.5], [-1.7, -3.55], [1.5, -3.55]] as const) {
    // Pantallas individuales con ilustraciones SG-SST.
    tv(x, 1.43, z - 0.24, 0.73, 0.44, "device", Math.round(Math.abs(x + z) * 5));
  }
  // Luces lineales empotradas del techo abierto para no tapar la vista.
  for (const [x, z] of [[-2.1, -7.85], [1.3, -7.85], [-2.1, -4.65], [1.3, -4.65], [7.65, -4.3]] as const) {
    cube(world, 2.2, 0.055, 0.14, coolGlow, x, 3.48, z);
    cube(world, 2.32, 0.065, 0.24, brushedMetal, x, 3.53, z);
  }

  // Puesto de bienestar: desfibrilador, botiquín, señalizaciones y EPP.
  cube(world, 0.88, 0.95, 0.36, porcelain, 10.28, 1.19, -8.82);
  cube(world, 0.57, 0.57, 0.05, jade, 10.28, 1.21, -8.59);
  cube(world, 0.13, 0.43, 0.06, porcelain, 10.28, 1.21, -8.55);
  cube(world, 0.40, 0.13, 0.06, porcelain, 10.28, 1.21, -8.53);
  cylinder(world, 0.16, 0.48, signalRed, 4.2, 0.18, -3.6);
  ball(world, 0.14, signalRed, 4.2, 0.48, -3.6);
  cube(world, 0.20, 0.16, 0.10, graphite, 4.2, 0.60, -3.6);
  cube(world, 0.49, 0.13, 0.035, porcelain, 4.2, 0.39, -3.44);
  // Indicador de salida de emergencia, solo ambiental.
  cube(world, 0.95, 0.30, 0.055, jade, 3.8, 2.84, -6.70);
  cube(world, 0.40, 0.065, 0.066, porcelain, 3.8, 2.84, -6.65);

  // Jardinería de paisajismo: bajo perfil para no obstruir la vista a la oficina.
  function hedge(x: number, z: number, width: number) {
    cube(world, width + 0.36, 0.34, 0.65, porcelain, x, 0.06, z);
    const count = Math.max(3, Math.round(width / 0.37));
    for (let i = 0; i < count; i += 1) {
      const bx = x - width * 0.5 + (width / Math.max(1, count - 1)) * i;
      ball(world, 0.31, i % 3 === 0 ? leafLight : i % 2 ? jade : olive,
        bx, 0.43 + (i % 3) * 0.04, z, 10);
    }
  }
  hedge(-6.80, 4.48, 4.8);
  hedge(6.80, 4.48, 4.8);
  hedge(-8.0, 9.97, 3.8);
  hedge(8.1, 9.97, 3.8);
  for (const [x, z] of [[-10.50, 4.43], [10.50, 4.43], [-0.75, 4.43], [0.75, 4.43]] as const) {
    const planter = new THREE.Group();
    planter.position.set(x, 0.05, z);
    world.add(planter);
    cylinder(planter, 0.34, 0.45, porcelain, 0, 0.13, 0);
    cylinder(planter, 0.06, 1.0, jade, 0, 0.76, 0);
    for (let a = 0; a < 6; a += 1) {
      const theta = a * Math.PI / 3;
      const leaf = ball(planter, 0.30, a % 2 ? jade : olive,
        Math.cos(theta) * 0.24, 1.27 + (a % 2) * 0.08, Math.sin(theta) * 0.24);
      leaf.scale.set(0.57, 1.14, 0.54);
    }
  }
  // Jardineras y bancos de concreto blanco a los lados de la vía.
  for (const x of [-10.7, 10.7]) {
    cube(world, 0.75, 0.13, 1.45, porcelain, x, 0.15, 3.85);
    cube(world, 0.14, 0.36, 1.35, brushedMetal, x - 0.22, -0.06, 3.85);
    cube(world, 0.14, 0.36, 1.35, brushedMetal, x + 0.22, -0.06, 3.85);
  }

  // Minifiguras con acabado moldeado + calcomanías de identificación SST.
  function idCardTexture() {
    const c = document.createElement("canvas");
    c.width = 200;
    c.height = 150;
    const ctx = c.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#f8fffe";
      ctx.fillRect(0, 0, 200, 150);
      ctx.fillStyle = "#1a9fa7";
      ctx.fillRect(0, 0, 200, 30);
      ctx.fillStyle = "#182d3e";
      ctx.font = "bold 64px Arial, sans-serif";
      ctx.fillText("SST", 32, 104);
      ctx.fillStyle = "#50bdb7";
      ctx.fillRect(24, 119, 152, 8);
    }
    const texture = new THREE.CanvasTexture(c);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }
  const badgeMap = idCardTexture();
  const idMaterial = new THREE.MeshBasicMaterial({ map: badgeMap, side: THREE.DoubleSide });
  for (const [index, figure] of figures.entries()) {
    const id = new THREE.Mesh(new THREE.PlaneGeometry(0.25, 0.19), idMaterial);
    id.position.set(0.28, 1.04, 0.313);
    figure.root.add(id);
    // 2 figuras con casco certificado como elemento visual, sin logos ajenos.
    if (index === 5 || index === 9) {
      const brim = cylinder(figure.head, 0.395, 0.10, amber, 0, 0.43, 0);
      brim.scale.set(1.0, 1.0, 1.12);
      const dome = ball(figure.head, 0.355, amber, 0, 0.57, -0.02);
      dome.scale.set(1.0, 0.63, 1.0);
      cube(figure.root, 0.80, 0.10, 0.025, safetyOrange, 0, 1.19, 0.31);
      cube(figure.root, 0.80, 0.075, 0.025, porcelain, 0, 0.82, 0.31);
    }
  }
}
