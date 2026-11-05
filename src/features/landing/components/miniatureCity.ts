import * as THREE from "three";

/**
 * Contexto urbano en miniatura. El edificio SG-SST está dentro de esta ciudad;
 * las calles, árboles y fachadas forman un anillo, sin tapar oficinas.
 * Todo es decorativo y ligero, sin nuevos archivos ni servicios externos.
 */
export function buildMiniatureCity(world: THREE.Group, compact: boolean) {
  const color = (hex: number, roughness = .65, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color: hex, roughness, metalness });
  const concrete = color(0xd4cfc3, .92);
  const limestone = color(0xe7e3d9, .77);
  const asphalt = color(0x4c5359, .96);
  const roadMark = color(0xecebe4, .88);
  const dark = color(0x263139, .45, .27);
  const aluminum = color(0x849398, .33, .59);
  const warm = color(0xa98b70, .72);
  const brick = color(0x947965, .79);
  const white = color(0xe8e9e3, .70);
  const green = color(0x3c6650, .75);
  const sage = color(0x69846b, .8);
  const pine = color(0x264d3a, .86);
  const glass = new THREE.MeshStandardMaterial({
    color: 0x638e98, roughness: .14, metalness: .30, transparent: true,
    opacity: .72, depthWrite: false,
  });
  const lamp = new THREE.MeshBasicMaterial({ color: 0xffecc9 });
  const city = new THREE.Group();
  city.name = "Stack44 · barrio empresarial miniatura";
  world.add(city);

  const box = (
    p: THREE.Object3D, w: number, h: number, d: number,
    material: THREE.Material, x: number, y: number, z: number,
    shadow = false,
  ) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    m.position.set(x, y, z);
    m.castShadow = shadow && !compact;
    m.receiveShadow = !compact;
    p.add(m);
    return m;
  };
  const sphere = (
    p: THREE.Object3D, r: number, material: THREE.Material,
    x: number, y: number, z: number,
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(r, compact ? 0 : 1), material,
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = !compact;
    p.add(mesh);
  };

  // Ciudad compacta, con espacios alrededor del edificio y calle continua.
  box(city, 67, .33, 60, concrete, 0, -.55, .2);
  box(city, 66, .11, 59, limestone, 0, -.32, .2);
  // Un anillo perimetral para que el edificio destaque y no se confunda
  // con las manzanas. La calle delantera conecta con el acceso de clientes.
  for (const x of [-18.8, 18.8]) {
    box(city, 4.15, .045, 58.6, asphalt, x, -.24, 0);
    for (let z = -25; z <= 25; z += 3.9) {
      box(city, .08, .008, 1.65, roadMark, x, -.206, z);
    }
  }
  for (const z of [-17.2, 16.9]) {
    box(city, 64.5, .045, 4.2, asphalt, 0, -.234, z);
    for (let x = -29; x <= 29; x += 4.3) {
      box(city, 1.7, .008, .07, roadMark, x, -.200, z);
    }
  }
  // Cebras peatonales frente a la entrada del campus.
  for (let i = -3; i <= 3; i += 1) {
    box(city, .30, .009, 3.2, roadMark, i * .62, -.204, 16.9);
  }

  type Block = { x: number; z: number; w: number; d: number; h: number; tint: THREE.Material };
  const blocks: Block[] = [
    { x: -27.8, z: -24.0, w: 7.5, d: 7.6, h: 6.5, tint: dark },
    { x: -27.2, z: -10.1, w: 7.0, d: 6.1, h: 4.8, tint: white },
    { x: -27.7, z: 1.3, w: 6.8, d: 7.1, h: 5.8, tint: warm },
    { x: -27.5, z: 24.4, w: 7.4, d: 6.5, h: 3.0, tint: white },
    { x: 27.5, z: -24.0, w: 7.5, d: 7.6, h: 7.2, tint: white },
    { x: 27.2, z: -10.5, w: 7.0, d: 6.5, h: 5.4, tint: dark },
    { x: 27.7, z: .8, w: 7.3, d: 6.6, h: 5.0, tint: brick },
    { x: 27.3, z: 24.8, w: 7.1, d: 6.2, h: 3.4, tint: warm },
    // Solo en el fondo: edificios bajos dejan ver la arquitectura del SG-SST.
    { x: -11.1, z: -25.7, w: 6.2, d: 4.3, h: 3.1, tint: white },
    { x: 1.6, z: -25.7, w: 8.4, d: 4.4, h: 3.8, tint: dark },
    { x: 13.2, z: -25.7, w: 6.3, d: 4.6, h: 3.25, tint: warm },
  ];

  const building = (info: Block, index: number) => {
    const { x, z, w, d, h, tint } = info;
    box(city, w + .48, .16, d + .52, concrete, x, -.11, z);
    box(city, w, h, d, tint, x, h / 2, z, true);
    // Estructura más limpia y ligera que un bloque macizo.
    box(city, w + .17, .16, d + .17, dark, x, h + .09, z);
    box(city, w - .6, .11, d - .6, aluminum, x, h + .19, z);
    const cols = compact ? 2 : 4;
    const rows = compact ? Math.min(3, Math.floor(h)) : Math.max(2, Math.round(h / 1.12));
    const windowW = (w - 1.0) / cols - .16;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const wx = x - w / 2 + .62 + col * (w - 1.24) / Math.max(1, cols - 1);
        const wy = h * (row + 1) / (rows + 1);
        const faceZ = z + d / 2 + .027;
        box(city, windowW, .52, .045, glass, wx, wy, faceZ);
        // Balcones horizontales y perfiles mínimos.
        if (row % 2 === 0) {
          box(city, windowW + .1, .035, .12, aluminum, wx, wy - .33, faceZ);
        }
      }
    }
    if (index % 2 === 0) {
      box(city, 1.8, .05, .6, aluminum, x, h + .27, z - .3);
    }
    // Planta baja iluminada, acento residencial / comercial.
    box(city, w * .63, .70, .07, glass, x, .58, z + d / 2 + .05);
    box(city, w * .63, .065, .14, dark, x, .96, z + d / 2 + .07);
  };
  blocks.forEach(building);

  const tree = (x: number, z: number, scale = 1) => {
    const trunk = box(city, .13 * scale, .95 * scale, .12 * scale,
      warm, x, .37 * scale, z);
    trunk.castShadow = false;
    sphere(city, .67 * scale, pine, x, 1.21 * scale, z);
    sphere(city, .48 * scale, sage, x + .32 * scale, 1.12 * scale, z - .20 * scale);
    sphere(city, .42 * scale, green, x - .21 * scale, 1.52 * scale, z);
  };
  for (const x of [-22.6, -14.5, -7.8, 7.8, 14.5, 22.6]) {
    tree(x, -19.9, .75);
    tree(x, 19.7, .75);
  }
  for (const z of [-10, 0, 8]) {
    tree(-22.4, z, .65);
    tree(22.4, z, .65);
  }
  // Farolas y bancas en las esquinas del barrio.
  for (const [x, z] of [[-22.2, -14.7], [22.2, -14.7], [-22.2, 16.0], [22.2, 16.0]] as const) {
    box(city, .10, 2.1, .11, dark, x, .85, z);
    sphere(city, .24, lamp, x, 1.98, z);
    box(city, 1.4, .13, .51, warm, x + .9, .24, z + .45);
  }

  // Tres automóviles a escala en el anillo, con movimiento circular ligero.
  const cars: Array<{ root: THREE.Group; lane: number; phase: number }> = [];
  const car = (lane: number, phase: number, body: THREE.Material) => {
    const root = new THREE.Group();
    city.add(root);
    box(root, 1.16, .35, .63, body, 0, .23, 0);
    box(root, .68, .30, .58, glass, -.10, .52, 0);
    for (const x of [-.38, .38]) {
      for (const z of [-.31, .31]) {
        const wheel = new THREE.Mesh(
          new THREE.CylinderGeometry(.13, .13, .11, 9), dark,
        );
        wheel.rotation.x = Math.PI / 2;
        wheel.position.set(x, .12, z);
        root.add(wheel);
      }
    }
    cars.push({ root, lane, phase });
  };
  car(0, .20, white);
  car(1, .43, dark);
  if (!compact) car(2, .74, warm);
  const update = (time: number) => {
    cars.forEach(({ root, lane, phase }) => {
      const period = lane === 2 ? 46 : 58;
      const t = ((time / period + phase) % 1 + 1) % 1;
      if (lane === 2) {
        root.position.set(18.8, -.16, -22 + t * 44);
        root.rotation.y = 0;
      } else {
        root.position.set(-30 + t * 60, -.16, lane === 0 ? 17.15 : -17.05);
        root.rotation.y = lane === 0 ? Math.PI / 2 : -Math.PI / 2;
      }
    });
  };
  update(0);
  return { update };
}
