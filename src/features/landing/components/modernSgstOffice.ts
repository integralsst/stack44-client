import * as THREE from "three";
import { OFFICE_TEAM } from "./officeTeam";

/**
 * Maqueta cinematográfica SG-SST: cinco escritorios ejecutivos, pantallas
 * panorámicas, MacBooks estilizados, vegetación y arquitectura contemporánea.
 * Los datos de las pantallas y las conversaciones son SOLO demostrativos.
 */
export function buildExecutiveOffice(world: THREE.Group, compact: boolean) {
  const mat = (color: number, roughness = 0.45, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const ivory = mat(0xf2f0e9, 0.63);
  const stone = mat(0xd0ccc2, 0.84);
  const warmConcrete = mat(0xc2b8a8, 0.85);
  const travertine = mat(0xe2d9c9, 0.79);
  const graphite = mat(0x18252e, 0.28, 0.42);
  const metallic = mat(0x8c989b, 0.31, 0.74);
  const bronze = mat(0xa5886a, 0.43, 0.56);
  const walnut = mat(0x73543c, 0.39);
  const oak = mat(0xa88764, 0.51);
  const leather = mat(0x39454a, 0.83);
  const fern = mat(0x28543c, 0.74);
  const olive = mat(0x54765a, 0.76);
  const sage = mat(0x769275, 0.83);
  const moss = mat(0x3a5b40, 0.88);
  const clay = mat(0x967d61, 0.87);
  const warmLight = new THREE.MeshBasicMaterial({ color: 0xf9e5bd });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x95b8b6, transparent: true, opacity: 0.18, roughness: 0.08,
    metalness: 0.04, depthWrite: false, side: THREE.DoubleSide,
  });

  const box = (
    parent: THREE.Object3D, w: number, h: number, d: number,
    material: THREE.Material, x: number, y: number, z: number,
    cast = true,
  ) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    m.castShadow = cast && !compact;
    m.receiveShadow = !compact;
    parent.add(m);
    return m;
  };
  const cylinder = (
    parent: THREE.Object3D, top: number, bottom: number, height: number,
    material: THREE.Material, x: number, y: number, z: number,
    sides = 14,
  ) => {
    const m = new THREE.Mesh(
      new THREE.CylinderGeometry(top, bottom, height, sides), material,
    );
    m.position.set(x, y, z);
    m.castShadow = !compact;
    m.receiveShadow = !compact;
    parent.add(m);
    return m;
  };
  const ellipsoid = (
    parent: THREE.Object3D, r: number, material: THREE.Material,
    x: number, y: number, z: number, sx = 1, sy = 1, sz = 1,
  ) => {
    const m = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r, compact ? 0 : 1), material,
    );
    m.position.set(x, y, z);
    m.scale.set(sx, sy, sz);
    m.castShadow = !compact;
    parent.add(m);
    return m;
  };

  // Plataforma monocromática con piso de piedra y área ajardinada frontal.
  box(world, 24.3, 0.56, 19.1, graphite, 0, -0.69, -1.05);
  box(world, 24.0, 0.15, 18.9, travertine, 0, -0.34, -1.05);
  box(world, 23.6, 0.07, 13.15, stone, 0, -0.215, -3.9);
  box(world, 23.8, 0.09, 3.05, warmConcrete, 0, -0.22, 4.52);
  box(world, 23.7, 0.07, 1.35, travertine, 0, -0.20, 7.05);

  // Suelo interior con juntas de piedra, evitando un acabado juguete pastel.
  for (let i = -5; i <= 5; i += 1) {
    box(world, 0.015, 0.008, 12.7, warmConcrete, i * 2.13, -0.166, -3.9, false);
  }
  for (let z = -9.25; z <= 2.6; z += 2.34) {
    box(world, 23.2, 0.008, 0.018, warmConcrete, 0, -0.164, z, false);
  }

  // Fachada de vidrio ahumado, piedra travertino y perfiles de aluminio negro.
  box(world, 23.7, 3.55, 0.22, graphite, 0, 1.63, -9.55);
  box(world, 23.7, 0.23, 0.34, travertine, 0, 3.48, -9.46);
  box(world, 0.25, 3.75, 12.2, graphite, -11.65, 1.67, -3.65);
  box(world, 0.25, 3.75, 12.2, graphite, 11.65, 1.67, -3.65);
  for (const x of [-11.4, -7.45, -3.35, 0.6, 4.7, 8.6, 11.4]) {
    box(world, 0.085, 3.30, 0.10, metallic, x, 1.55, -9.34);
  }
  // Ventanales verticales en paredes laterales: estructura abierta y luminosa.
  for (const x of [-11.45, 11.45]) {
    for (const z of [-7.4, -4.7, -1.9, 0.8]) {
      box(world, 0.045, 2.4, 2.17, glass, x, 1.54, z, false);
      box(world, 0.115, 2.65, 0.12, graphite, x, 1.45, z + 1.14);
    }
  }
  // Vigas de pérgola elevadas; el centro queda libre para ver personas y TVs.
  for (const x of [-11.4, -8.8, -6.1, -3.4, -0.7, 2, 4.7, 7.4, 10.3]) {
    box(world, 0.12, 0.16, 2.7, walnut, x, 4.24, -8.10, false);
  }
  box(world, 23.4, 0.16, 0.16, graphite, 0, 4.18, -9.45);
  box(world, 23.4, 0.16, 0.16, graphite, 0, 4.18, -6.76);

  // Paramentos de roble y nichos verdes en extremos, sin paneles color pastel.
  for (const x of [-10.82, 10.78]) {
    box(world, 1.16, 3.25, 0.15, walnut, x, 1.50, -9.22);
    for (let i = 0; i < 7; i += 1) {
      box(world, 0.05, 3.10, 0.18, oak, x - 0.46 + i * 0.15, 1.55, -9.10, false);
    }
  }

  // Iluminación indirecta tipo oficina de arquitectura contemporánea.
  for (const [x, z] of [
    [-7.3, -6.25], [-0.2, -6.25], [6.8, -6.25],
    [-3.4, -2.15], [4, -2.15],
  ] as const) {
    box(world, 2.58, 0.06, 0.07, graphite, x, 3.78, z, false);
    box(world, 2.34, 0.018, 0.075, warmLight, x, 3.72, z + 0.02, false);
  }

  // Vegetación exterior: jardineras lineales, pequeños árboles y estanque.
  const shrub = (x: number, y: number, z: number, radius = 0.31) => {
    ellipsoid(world, radius, moss, x, y, z, 1.35, 0.77, 0.89);
    ellipsoid(world, radius * 0.64, olive, x + radius * 0.32, y + radius * 0.38, z - 0.09);
  };
  const planter = (x: number, z: number, w: number, d = 1.07) => {
    box(world, w, 0.39, d, travertine, x, 0.04, z);
    box(world, w - 0.18, 0.05, d - 0.15, clay, x, 0.26, z);
    const count = Math.max(4, Math.floor(w / 0.45));
    for (let i = 0; i < count; i += 1) {
      const px = x - w / 2 + 0.30 + i * (w - 0.6) / Math.max(1, count - 1);
      shrub(px, 0.55 + (i % 3) * 0.04, z, 0.25 + (i % 2) * 0.06);
    }
  };
  planter(-7.85, 3.95, 6.1);
  planter(7.85, 3.95, 6.1);
  planter(-9.2, 7.38, 3.7, 0.68);
  planter(9.2, 7.38, 3.7, 0.68);
  // Corredor de entrada y placas de piedra.
  box(world, 3.1, 0.06, 4.1, travertine, 0, -0.145, 4.90);
  for (const z of [3.15, 4.08, 5.01, 5.94, 6.88]) {
    box(world, 2.43, 0.032, 0.57, ivory, 0, -0.100, z, false);
  }
  // Bambú/árboles escultóricos en jardines, raíces y copas volumétricas.
  for (const [x, z, height] of [[-10.25, 3.14, 2.1], [10.24, 3.13, 2.45], [-10.2, -0.65, 1.7], [10.17, -0.55, 1.84]] as const) {
    cylinder(world, 0.065, 0.093, height, walnut, x, height / 2 + 0.07, z, 9);
    for (let i = 0; i < 5; i += 1) {
      const angle = i * (Math.PI * 2 / 5);
      ellipsoid(world, 0.63, i % 2 ? fern : sage,
        x + Math.sin(angle) * 0.50,
        height + Math.sin(i * 2.3) * 0.17,
        z + Math.cos(angle) * 0.39, 0.8, 0.68, 0.83);
    }
  }

  // TVs de marco ultrafino, proporción 16:9 y superficies con contenido
  // de alta definición. "4K" identifica el tipo de pantalla; la textura de
  // canvas se adapta al rendimiento y NO representa un panel físico 4K real.
  type Dashboard = "leadership" | "prevention" | "performance" | "laptop";
  const buildScreen = (kind: Dashboard, seed: number) => {
    const canvas = document.createElement("canvas");
    const W = compact ? 1024 : 1536;
    const H = Math.round(W * 9 / 16);
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const scale = W / 1024;
      ctx.scale(scale, scale);
      const w = 1024, h = 576;
      ctx.fillStyle = "#0b1820";
      ctx.fillRect(0, 0, w, h);
      const grad = ctx.createLinearGradient(0, 0, w, h);
      grad.addColorStop(0, "#17362e");
      grad.addColorStop(0.5, "#10242b");
      grad.addColorStop(1, "#0c1924");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#bcd9c7";
      ctx.font = "700 25px Arial, sans-serif";
      ctx.fillText("STACK44  /  CENTRO DE GESTIÓN", 42, 56);
      ctx.fillStyle = "#6e9786";
      ctx.font = "700 14px Arial, sans-serif";
      ctx.fillText("SG-SST · INTERFAZ DEMOSTRATIVA", 43, 88);
      const title: Record<Dashboard, string> = {
        leadership: "OPERACIÓN SG-SST",
        prevention: "RIESGOS Y CONTROLES",
        performance: "SEGUIMIENTO PHVA",
        laptop: "PLAN DE TRABAJO",
      };
      ctx.font = "bold 42px Arial, sans-serif";
      ctx.fillStyle = "#f4f1e8";
      ctx.fillText(title[kind], 42, 158);
      // Componentes de un dashboard sobrio, sin cifras empresariales inventadas.
      for (let i = 0; i < 3; i += 1) {
        const x = 43 + i * 316;
        ctx.fillStyle = "#1b3b3d";
        ctx.beginPath();
        ctx.roundRect(x, 195, 288, 142, 15);
        ctx.fill();
        const labels = kind === "leadership"
          ? ["PLAN ANUAL", "COMPROMISOS", "EVIDENCIAS"]
          : kind === "prevention"
            ? ["IDENTIFICACIÓN", "INSPECCIONES", "CONTROLES"]
            : ["PLANEAR", "HACER", "VERIFICAR"];
        ctx.font = "700 18px Arial, sans-serif";
        ctx.fillStyle = "#b7cac4";
        ctx.fillText(labels[i], x + 18, 234);
        ctx.fillStyle = i === 1 ? "#d0b48a" : "#6ead98";
        ctx.fillRect(x + 18, 273, 178 + (seed + i * 31) % 78, 9);
      }
      ctx.strokeStyle = "#47665f";
      ctx.lineWidth = 4;
      ctx.beginPath();
      for (let i = 0; i < 25; i += 1) {
        const x = 46 + i * 39;
        const y = 451 - i * 1.8 - Math.sin(i * 0.62 + seed) * 37;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "#c0d6cc";
      ctx.font = "18px Arial, sans-serif";
      ctx.fillText("Control documental   ·   Seguimiento   ·   Mejora continua", 44, 536);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  };
  const tv = (x: number, y: number, z: number, width: number, kind: Dashboard, seed: number) => {
    const h = width * 9 / 16;
    box(world, width + 0.14, h + 0.16, 0.10, graphite, x, y, z - 0.07);
    box(world, width + 0.035, h + 0.035, 0.012, metallic, x, y, z - 0.009, false);
    const screen = new THREE.Mesh(
      new THREE.PlaneGeometry(width, h),
      new THREE.MeshBasicMaterial({
        map: buildScreen(kind, seed), toneMapped: false, side: THREE.DoubleSide,
      }),
    );
    screen.position.set(x, y, z + 0.005);
    world.add(screen);
    box(world, 0.31, 0.045, 0.05, bronze, x, y - h / 2 - 0.13, z - 0.02, false);
  };
  tv(0.0, 2.42, -9.35, 5.1, "leadership", 1);
  tv(-8.2, 2.40, -9.35, 3.1, "prevention", 4);
  tv(8.2, 2.40, -9.35, 3.1, "performance", 7);

  // Pantallas personales de los MacBooks, sin contenido ni telemetría real.
  const laptopTexture = buildScreen("laptop", 3);
  const laptopDisplay = new THREE.MeshBasicMaterial({
    map: laptopTexture, toneMapped: false, side: THREE.DoubleSide,
  });
  const keyboardCanvas = document.createElement("canvas");
  keyboardCanvas.width = 512;
  keyboardCanvas.height = 256;
  const kc = keyboardCanvas.getContext("2d");
  if (kc) {
    kc.fillStyle = "#aab2b2";
    kc.fillRect(0, 0, 512, 256);
    kc.fillStyle = "#26333b";
    for (let row = 0; row < 4; row += 1) {
      for (let col = 0; col < 13; col += 1) {
        kc.beginPath();
        kc.roundRect(15 + col * 37, 18 + row * 41, 29, 29, 4);
        kc.fill();
      }
    }
    kc.fillStyle = "#cfd4d3";
    kc.beginPath();
    kc.roundRect(171, 184, 170, 49, 7);
    kc.fill();
  }
  const keyboard = new THREE.CanvasTexture(keyboardCanvas);
  keyboard.colorSpace = THREE.SRGBColorSpace;
  const keyboardMat = new THREE.MeshBasicMaterial({ map: keyboard });

  const desk = (member: (typeof OFFICE_TEAM)[number], index: number) => {
    const x = member.x, z = member.z + 1.18;
    const group = new THREE.Group();
    group.position.set(x, -0.15, z);
    world.add(group);
    // Tapa de roble nogal, bordes finos y patas de acero grafito.
    box(group, 3.58, 0.13, 1.62, walnut, 0, 1.12, 0);
    box(group, 3.40, 0.030, 1.48, oak, 0, 1.201, 0);
    for (const dx of [-1.48, 1.48]) {
      box(group, 0.07, 1.04, 1.24, graphite, dx, 0.53, 0);
      box(group, 0.15, 0.055, 1.22, bronze, dx, 0.075, 0);
    }
    // Laptop tipo MacBook: pantalla 16:10, marco ultrafino y teclado físico.
    box(group, 1.20, 0.047, 0.77, metallic, 0, 1.255, 0.27);
    const keys = new THREE.Mesh(new THREE.PlaneGeometry(1.09, 0.54), keyboardMat);
    keys.rotation.x = -Math.PI / 2;
    keys.position.set(0, 1.289, 0.20);
    group.add(keys);
    const lid = new THREE.Group();
    lid.position.set(0, 1.31, -0.11);
    lid.rotation.x = -0.13;
    group.add(lid);
    box(lid, 1.22, 0.72, 0.055, metallic, 0, 0.36, 0);
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.13, 0.63), laptopDisplay);
    screen.position.set(0, 0.36, 0.034);
    lid.add(screen);
    box(lid, 0.08, 0.012, 0.012, graphite, 0, 0.695, 0.041, false);
    // Escritorio ejecutivo: taza negra mate y libreta de trabajo SST.
    cylinder(group, 0.12, 0.10, 0.20, ivory, 1.25, 1.35, 0.21);
    box(group, 0.52, 0.035, 0.40, graphite, -1.17, 1.25, 0.19);
    box(group, 0.40, 0.013, 0.31, stone, -1.17, 1.27, 0.19);
    // Silla ergonómica en tono carbón, situada detrás del personaje.
    box(world, 0.84, 0.95, 0.16, leather, x, 0.89, member.z - 0.48);
    box(world, 0.85, 0.15, 0.78, leather, x, 0.46, member.z - 0.22);
    cylinder(world, 0.05, 0.05, 0.40, metallic, x, 0.22, member.z - 0.25);
    // Placa de metal en el canto del escritorio con nombre real del personaje.
    const labelCanvas = document.createElement("canvas");
    labelCanvas.width = 512;
    labelCanvas.height = 128;
    const lc = labelCanvas.getContext("2d");
    if (lc) {
      lc.fillStyle = "#172831";
      lc.fillRect(0, 0, 512, 128);
      lc.fillStyle = "#ecede7";
      lc.textAlign = "center";
      lc.font = "bold 45px Arial, sans-serif";
      lc.fillText(member.name.toUpperCase(), 256, 58);
      lc.fillStyle = "#b7a88e";
      lc.font = "25px Arial, sans-serif";
      lc.fillText(member.title.toUpperCase(), 256, 99, 492);
    }
    const labelTex = new THREE.CanvasTexture(labelCanvas);
    labelTex.colorSpace = THREE.SRGBColorSpace;
    const plaque = new THREE.Mesh(
      new THREE.PlaneGeometry(1.34, 0.34),
      new THREE.MeshBasicMaterial({ map: labelTex, side: THREE.DoubleSide }),
    );
    plaque.position.set(0, 1.00, 0.818);
    group.add(plaque);
    // Maceta pequeña y lámpara de mesa en las gerencias.
    if (index < 2) {
      cylinder(group, 0.12, 0.085, 0.28, stone, 1.54, 1.38, -0.40);
      for (let i = 0; i < 5; i += 1) {
        ellipsoid(group, 0.19, i % 2 ? fern : olive,
          1.54 + Math.sin(i * 2.4) * 0.16,
          1.69 + (i % 2) * 0.08,
          -0.40 + Math.cos(i * 2.4) * 0.12, 0.55, 1.0, 0.61);
      }
    }
  };
  OFFICE_TEAM.forEach(desk);

  // Pequeños biombos de vidrio entre puestos de gerencia, no bloquean el hero.
  for (const x of [-3.72, 3.3]) {
    box(world, 0.08, 1.47, 2.14, glass, x, 1.24, -6.55, false);
    box(world, 0.075, 1.78, 0.075, graphite, x, 1.28, -7.56);
    box(world, 0.075, 1.78, 0.075, graphite, x, 1.28, -5.52);
  }

  // Personajes geométricos de respaldo visibles hasta que los GLB se carguen;
  // exactamente cinco, nunca se agregan empleados extra.
  const fallback = OFFICE_TEAM.map((member, i) => {
    const root = new THREE.Group();
    root.name = "Respaldo · " + member.name;
    root.position.set(member.x, -0.17, member.z);
    const suit = i === 0 ? graphite : i === 1 ? ivory : i === 2 ? fern : i === 3 ? leather : travertine;
    for (const x of [-0.21, 0.21]) {
      box(root, 0.37, 0.54, 0.43, graphite, x, 0.27, 0);
    }
    box(root, 0.89, 0.72, 0.5, suit, 0, 1.03, 0);
    for (const x of [-0.54, 0.54]) {
      cylinder(root, 0.14, 0.14, 0.65, suit, x, 1.06, 0);
    }
    cylinder(root, 0.33, 0.33, 0.55, mat(0xe0b65d, 0.29), 0, 1.80, 0);
    ellipsoid(root, 0.35, i < 2 ? walnut : graphite, 0, 2.09, 0, 1, 0.32, 1);
    world.add(root);
    return { root };
  });

  // Burbujas en el espacio 3D, un solo diálogo a la vez para evitar ruido.
  // La conversación representa un ejemplo ilustrativo del trabajo del SG-SST.
  const conversation = OFFICE_TEAM.map((member, index) => {
    const canvas = document.createElement("canvas");
    canvas.width = 960;
    canvas.height = 276;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 960, 276);
      ctx.fillStyle = "#14252bf2";
      ctx.beginPath();
      ctx.roundRect(16, 12, 928, 244, 40);
      ctx.fill();
      ctx.strokeStyle = "#9db99d";
      ctx.lineWidth = 5;
      ctx.stroke();
      ctx.fillStyle = "#c5d2c4";
      ctx.font = "bold 29px Arial, sans-serif";
      ctx.fillText(member.name.toUpperCase() + "  ·  " + member.title.toUpperCase(), 48, 71, 860);
      ctx.fillStyle = "#f7f6ee";
      ctx.font = "bold 38px Arial, sans-serif";
      const words = member.line.split(" ");
      let current = "";
      const lines: string[] = [];
      for (const word of words) {
        const candidate = current ? current + " " + word : word;
        if (ctx.measureText(candidate).width > 840 && current) {
          lines.push(current);
          current = word;
        } else current = candidate;
      }
      if (current) lines.push(current);
      lines.slice(0, 2).forEach((text, i) => ctx.fillText(text, 47, 139 + i * 48));
      ctx.font = "21px Arial, sans-serif";
      ctx.fillStyle = "#a8b4a9";
      ctx.fillText("CONVERSACIÓN SIMULADA · STACK44", 48, 238);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const material = new THREE.SpriteMaterial({
      map: texture, transparent: true, depthWrite: false, opacity: 0,
    });
    const sprite = new THREE.Sprite(material);
    sprite.name = "SG-SST · diálogo de " + member.name;
    sprite.position.set(member.x, 3.55, member.z + 0.55);
    sprite.scale.set(compact ? 4.15 : 4.85, compact ? 1.19 : 1.39, 1);
    sprite.renderOrder = 12 + index;
    sprite.visible = false;
    world.add(sprite);
    return { sprite, material };
  });

  return {
    fallback,
    update(time: number) {
      const cycle = 5.8;
      const index = Math.floor(time / cycle) % conversation.length;
      const progress = time % cycle;
      const fadeIn = Math.min(1, progress / 0.55);
      const fadeOut = Math.min(1, (cycle - progress) / 0.70);
      const opacity = Math.max(0, Math.min(fadeIn, fadeOut));
      conversation.forEach(({ sprite, material }, i) => {
        sprite.visible = i === index;
        if (i === index) {
          material.opacity = opacity * 0.96;
          sprite.position.y = 3.53 + Math.sin(time * 1.05) * 0.07;
        }
      });
    },
    resize(isMobile: boolean) {
      conversation.forEach(({ sprite }) => {
        sprite.scale.set(isMobile ? 4.1 : 4.85, isMobile ? 1.18 : 1.39, 1);
      });
    },
  };
}
