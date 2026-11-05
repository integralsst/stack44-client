import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { OFFICE_TEAM, VISITOR_TEAM } from "./officeTeam";
import { getOfficeDialogue, getOfficePose } from "./officeLife";
import { mountPremiumScreens } from "./officeScreensPremium";

/**
 * Campus ejecutivo SG-SST completamente abierto a la cámara isométrica.
 * Todas las operaciones y conversaciones que muestra son recreaciones demo.
 * En móvil se simplifican sombras, paneles y vegetación secundaria.
 */
export function buildUltraPremiumCampus(world: THREE.Group, mobile: boolean) {
  const meshMat = (color: number, roughness = .6, metalness = 0) =>
    new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const graphite = meshMat(0x19262c, .27, .54);
  const midnight = meshMat(0x101d25, .39, .35);
  const silver = meshMat(0x9fa9ab, .28, .74);
  const bronze = meshMat(0x9d8060, .32, .67);
  const ivory = meshMat(0xece9df, .60);
  const limestone = meshMat(0xcfc8bb, .81);
  const travertine = meshMat(0xe0d9ca, .74);
  const walnut = meshMat(0x694a33, .43);
  const oak = meshMat(0x987352, .49);
  const whiteLeather = meshMat(0xe7dfd2, .73);
  const charcoalLeather = meshMat(0x394247, .75);
  const forest = meshMat(0x254f3c, .78);
  const olive = meshMat(0x57785b, .81);
  const fern = meshMat(0x366447, .76);
  const bark = meshMat(0x68523b, .77);
  const soil = meshMat(0x695b42, .92);
  const goldLight = new THREE.MeshBasicMaterial({ color: 0xffdc9e });
  const glassClear = new THREE.MeshPhysicalMaterial({
    color: 0xc2d8dc, roughness: .085, metalness: .06,
    transparent: true, opacity: mobile ? .52 : .39, depthWrite: false,
    clearcoat: .8, clearcoatRoughness: .05, side: THREE.DoubleSide,
  });
  const glassSmoked = new THREE.MeshPhysicalMaterial({
    color: 0x526976, roughness: .10, metalness: .07,
    transparent: true, opacity: mobile ? .66 : .54, depthWrite: false,
    clearcoat: .85, clearcoatRoughness: .075, side: THREE.DoubleSide,
  });
  const glassWall = new THREE.MeshPhysicalMaterial({
    color: 0x8fa9a6, roughness: .13,
    transparent: true, opacity: mobile ? .13 : .19,
    depthWrite: false, side: THREE.DoubleSide,
  });

  const block = (
    parent: THREE.Object3D, w: number, h: number, d: number,
    material: THREE.Material, x: number, y: number, z: number,
    shadow = true,
  ) => {
    const geom = new THREE.BoxGeometry(w, h, d);
    const box = new THREE.Mesh(geom, material);
    box.position.set(x, y, z);
    box.castShadow = shadow && !mobile;
    box.receiveShadow = !mobile;
    parent.add(box);
    return box;
  };
  const rounded = (
    parent: THREE.Object3D, w: number, h: number, d: number,
    material: THREE.Material, x: number, y: number, z: number,
    radius = .08,
  ) => {
    const m = new THREE.Mesh(
      new RoundedBoxGeometry(w, h, d, 3, Math.min(radius, w / 4, h / 4, d / 4)),
      material,
    );
    m.position.set(x, y, z);
    m.castShadow = !mobile && !material.transparent;
    m.receiveShadow = !mobile;
    parent.add(m);
    return m;
  };
  const cylinder = (
    parent: THREE.Object3D,
    rt: number, rb: number, h: number, material: THREE.Material,
    x: number, y: number, z: number, segments = 16,
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(rt, rb, h, segments), material,
    );
    mesh.position.set(x, y, z);
    mesh.castShadow = !mobile;
    parent.add(mesh);
    return mesh;
  };
  const sphere = (
    parent: THREE.Object3D,
    radius: number, material: THREE.Material,
    x: number, y: number, z: number,
    scale: [number, number, number] = [1, 1, 1],
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(radius, mobile ? 0 : 1),
      material,
    );
    mesh.position.set(x, y, z);
    mesh.scale.set(...scale);
    mesh.castShadow = !mobile;
    parent.add(mesh);
    return mesh;
  };
  const line = (
    parent: THREE.Object3D,
    a: THREE.Vector3, b: THREE.Vector3,
    radius: number, material: THREE.Material,
  ) => {
    const direction = new THREE.Vector3().subVectors(b, a);
    const mesh = new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, direction.length(), 10),
      material,
    );
    mesh.position.copy(a).add(b).multiplyScalar(.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.castShadow = !mobile;
    parent.add(mesh);
  };

  // Basamento arquitectónico más amplio, 48 × 42 unidades (edificio + jardines).
  rounded(world, 48, .73, 42, graphite, 0, -.78, .7, .24);
  rounded(world, 47.6, .20, 41.6, limestone, 0, -.35, .7, .20);
  block(world, 47.2, .075, 24.4, travertine, 0, -.205, -7.2);
  block(world, 47.2, .08, 16.2, limestone, 0, -.19, 12.6);
  // Gran corredor de piedra pulida, alineado con la puerta de entrada.
  for (let i = -7; i <= 7; i += 1) {
    block(world, 2.92, .018, .12, travertine, 0, -.12, i * 2.1 + 7.0, false);
  }
  // Ritmo de losas de piedra y juntas finas: lujo sobrio en lugar de pastel.
  for (let x = -22; x <= 22; x += 3.1) {
    block(world, .018, .013, 21.2, limestone, x, -.145, -7.1, false);
  }
  for (let z = -18; z <= 4; z += 3.1) {
    block(world, 46.5, .013, .018, limestone, 0, -.142, z, false);
  }

  // Fachada posterior contemporánea: piedra, marcos negros y ventanales.
  block(world, 47.1, 3.8, .27, midnight, 0, 1.75, -19.3);
  block(world, 47.3, .27, .37, travertine, 0, 3.78, -19.22);
  for (let i = -22; i <= 22; i += 3.45) {
    block(world, .085, 3.4, .14, silver, i, 1.64, -19.04, false);
  }
  for (const x of [-23.35, 23.35]) {
    block(world, .24, 3.9, 23.4, midnight, x, 1.65, -7.13);
    for (const z of [-16.1, -12.8, -9.5, -6.2, -2.9, .4, 3.7]) {
      block(world, .07, 2.5, 2.6, glassWall, x + (x < 0 ? .12 : -.12), 1.54, z, false);
      block(world, .12, 3.02, .09, silver, x + (x < 0 ? .12 : -.12), 1.53, z + 1.27);
    }
  }
  // Patios abiertos entre los despachos gerenciales; transparencia real.
  for (const x of [-9.15, 3.1, 6.1]) {
    block(world, .08, 2.7, 12, glassWall, x, 1.34, -12.5, false);
    for (const z of [-18.15, -13.7, -9.25, -6.6]) {
      block(world, .115, 2.85, .12, silver, x, 1.39, z);
    }
    block(world, .085, .075, 12.4, bronze, x, 2.73, -12.45, false);
  }
  // Los listones arquitectónicos del fondo aportan profundidad a los despachos.
  for (const cx of [-20.75, -8.25, 3.9, 22.1]) {
    for (let n = 0; n < 6; n += 1) {
      block(world, .12, 3.4, .16, n % 2 ? walnut : oak,
        cx + .24 * n, 1.64, -19.0, false);
    }
  }
  for (const x of [-21.7, -13.2, -4.5, 4.2, 11.0, 18.5]) {
    block(world, .10, .14, 7.4, walnut, x, 4.38, -15.0, false);
    block(world, .075, .04, 7.25, goldLight, x, 4.28, -15.0, false);
  }

  // Jardines escultóricos con jardineras, vegetación orgánica y pasarelas.
  const bush = (x: number, z: number, scale = 1) => {
    const main = [forest, fern, olive][Math.round(Math.abs(x * 3 + z)) % 3];
    sphere(world, .40, main, x, .62 * scale, z, [1.35 * scale, .86 * scale, .98 * scale]);
    sphere(world, .22, fern, x + .16 * scale, .92 * scale, z - .09 * scale);
  };
  const planter = (x: number, z: number, width: number, depth: number, count: number) => {
    rounded(world, width, .48, depth, limestone, x, .10, z, .085);
    block(world, width - .22, .06, depth - .18, soil, x, .35, z, false);
    for (let i = 0; i < count; i += 1) {
      const px = x - (width - .9) / 2 + i * (width - .9) / Math.max(1, count - 1);
      bush(px, z + Math.sin(i * 2.3) * .19, .80 + (i % 3) * .12);
    }
  };
  planter(-16.5, 5.5, 12.5, 1.15, mobile ? 10 : 17);
  planter(15.9, 5.5, 12.2, 1.15, mobile ? 10 : 17);
  planter(-20.7, 16.3, 4.2, .9, 7);
  planter(9.0, 18.1, 5.5, .85, 8);
  // Plazas de sombra y tres árboles de copa irregular.
  for (const [x, z, h] of [[-21.2, 8.4, 2.75], [21.1, 7.5, 2.35], [-20.2, -2.9, 2.2]] as const) {
    cylinder(world, .08, .12, h, bark, x, h / 2, z, 10);
    for (let i = 0; i < (mobile ? 4 : 7); i += 1) {
      const a = i * 2.399;
      sphere(world, .70, i % 3 === 0 ? forest : i % 2 ? olive : fern,
        x + Math.sin(a) * .64, h + Math.sin(a * 1.3) * .23,
        z + Math.cos(a) * .49, [.94, .7, .83]);
    }
  }

  // Lujo gerencial: escritorios enteramente en vidrio templado ahumado y bases
  // esculturales, plantas, luminarias, credenzas, libros y piezas de arte.
  const screens = mountPremiumScreens(world, mobile);
  const table = (
    parent: THREE.Object3D,
    width: number, depth: number,
    smoked: boolean, height: number,
  ) => {
    const glass = smoked ? glassSmoked : glassClear;
    rounded(parent, width, .095, depth, glass, 0, height, 0, .035);
    // Canto metálico pulido que hace legible el vidrio sin opacarlo.
    for (const side of [-1, 1]) {
      block(parent, width - .12, .038, .038, bronze, 0, height - .025, side * (depth / 2 - .038), false);
      block(parent, .038, .038, depth - .16, bronze, side * (width / 2 - .038), height - .025, 0, false);
    }
    for (const x of [-width * .35, width * .35]) {
      block(parent, .10, height - .12, depth * .72, smoked ? bronze : graphite, x, (height - .12) / 2, 0);
    }
    block(parent, width * .76, .08, .095, midnight, 0, .11, 0);
  };
  const ergonomicChair = (x: number, z: number, premium: boolean) => {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    world.add(group);
    rounded(group, premium ? 1.04 : .84, .16, .78, premium ? whiteLeather : charcoalLeather,
      0, .50, 0, .065);
    rounded(group, premium ? 1.04 : .84, 1.14, .16, premium ? whiteLeather : charcoalLeather,
      0, 1.10, -.39, .085);
    for (const dx of [-.51, .51]) {
      block(group, .07, .07, .64, bronze, dx, .67, .04);
    }
    cylinder(group, .07, .07, .42, silver, 0, .25, -.03);
    for (let i = 0; i < 5; i += 1) {
      const a = i * Math.PI * 2 / 5;
      block(group, .43, .05, .09, graphite, Math.sin(a) * .24, .10, Math.cos(a) * .20);
    }
  };

  const label = (name: string, role: string) => {
    const canvas = document.createElement("canvas");
    canvas.width = 640; canvas.height = 172;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#17272d";
      ctx.fillRect(0, 0, 640, 172);
      ctx.fillStyle = "#d8c5a1";
      ctx.fillRect(12, 12, 616, 3);
      ctx.textAlign = "center";
      ctx.fillStyle = "#f5efe2";
      ctx.font = "700 55px Arial";
      ctx.fillText(name.toUpperCase(), 320, 80);
      ctx.fillStyle = "#b4c0b7";
      ctx.font = "26px Arial";
      ctx.fillText(role.toUpperCase(), 320, 128, 620);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return new THREE.Mesh(
      new THREE.PlaneGeometry(1.75, .48),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide }),
    );
  };
  const sculpture = (x: number, z: number) => {
    cylinder(world, .34, .40, .08, bronze, x, 1.25, z);
    sphere(world, .36, bronze, x, 1.63, z, [.62, 1.16, .44]);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(.53, .048, 10, 26), bronze);
    ring.position.set(x, 1.66, z);
    ring.rotation.y = Math.PI / 5;
    world.add(ring);
  };

  OFFICE_TEAM.forEach((person, index) => {
    const office = new THREE.Group();
    const zDesk = person.z - 1.42;
    office.position.set(person.x, 0, zDesk);
    world.add(office);
    const isExecutive = index < 2;
    const width = isExecutive ? 5.35 : 3.65;
    const depth = isExecutive ? 2.18 : 1.77;
    table(office, width, depth, isExecutive, 1.18);
    // Laptop construido en el sentido correcto: bisagra -Z,
    // pantalla mirando +Z hacia el trabajador situado delante.
    screens.laptop(person.x + (isExecutive ? -.24 : 0), 1.255, zDesk + .06, isExecutive ? 1.10 : .97);
    ergonomicChair(person.x, person.z + .05, isExecutive);
    // Placa grabada con su nombre, ubicada en el canto frontal del vidrio.
    const plaque = label(person.name, person.title);
    plaque.position.set(0, 1.02, depth / 2 + .024);
    office.add(plaque);
    // Documentación, accesorios y materiales físicos de trabajo.
    rounded(office, .82, .045, .47, midnight, -width * .35, 1.26, .25);
    rounded(office, .66, .025, .38, ivory, -width * .35, 1.29, .25);
    cylinder(office, .13, .11, .25, isExecutive ? bronze : ivory, width * .36, 1.34, .34);
    if (isExecutive) {
      // Despachos presidenciales: gran aparador, arte, set de libros y
      // conjunto de lámpara de diseño, escultura y tres butacas de visitas.
      rounded(world, 7.4, .72, .65, walnut, person.x, .47, -18.10);
      rounded(world, 7.15, .08, .70, travertine, person.x, .85, -18.11);
      for (let k = 0; k < 10; k += 1) {
        const x = person.x - 3.05 + k * .30;
        block(world, .08 + (k % 3) * .025, .53 + (k % 4) * .09, .30,
          k % 4 === 0 ? bronze : k % 3 === 0 ? ivory : graphite,
          x, 1.22 + (k % 4) * .045, -17.9);
      }
      sculpture(person.x + 3.05, -17.52);
      for (const dx of [-2.42, 2.42]) {
        const lamp = new THREE.Group();
        lamp.position.set(person.x + dx, 0, zDesk - .48);
        world.add(lamp);
        cylinder(lamp, .10, .10, 1.03, bronze, 0, 1.78, 0);
        cylinder(lamp, .39, .21, .30, ivory, 0, 2.36, 0, 20);
      }
      // Mueble de vistas con base de vidrio ahumado.
      for (const dx of [-2.1, 2.1]) {
        ergonomicChair(person.x + dx, person.z + 2.15, true);
      }
      // Alfombra textil beige debajo del escritorio de vidrio.
      rounded(world, 9.6, .045, 7.9, limestone, person.x, -.12, -12.75, .19);
      // Vitrina de arte y pantalla premium dentro de cada gerencia.
      rounded(world, 1.25, 1.65, .38, midnight, person.x + 4.15, .93, -17.95, .09);
      sphere(world, .33, bronze, person.x + 4.15, 1.36, -17.67, [.67, 1.20, .50]);
    } else {
      // Operación SG-SST: soporte de monitor ultrapanorámico de sobremesa.
      block(office, .08, .36, .12, silver, 1.17, 1.40, -.40);
      block(office, .58, .038, .23, graphite, 1.17, 1.25, -.40);
    }
  });

  // Sala de juntas: vidrio ahumado de gran formato, peana escultórica, sillas.
  rounded(world, 12.8, .052, 9.3, limestone, 0, -.107, -.02, .22);
  const meeting = new THREE.Group();
  meeting.position.set(-.1, 0, -.10);
  world.add(meeting);
  rounded(meeting, 8.8, .13, 3.15, glassSmoked, 0, 1.08, 0, .055);
  for (const x of [-3.1, 3.1]) {
    cylinder(meeting, .43, .78, .87, bronze, x, .57, 0, 24);
  }
  for (const [x, z] of [
    [-4.2, -2.3], [-2.4, -2.3], [0, -2.3], [2.4, -2.3], [4.2, -2.3],
    [-4.2, 2.2], [-2.4, 2.2], [0, 2.2], [2.4, 2.2], [4.2, 2.2],
  ] as const) {
    ergonomicChair(x, z, false);
  }
  // Consola de videollamadas y sistema de sonido integrado.
  block(meeting, 1.15, .10, .24, graphite, 0, 1.22, -.45);
  for (const x of [-.35, 0, .35]) {
    sphere(meeting, .036, silver, x, 1.30, -.45);
  }
  // Muros de cristal bajo que definen la sala sin ocultar las reuniones.
  for (const x of [-6.2, 6.2]) {
    block(world, .08, 1.55, 8.8, glassWall, x, .83, 0, false);
    for (const z of [-4.25, .0, 4.25]) {
      block(world, .09, 1.8, .09, silver, x, .89, z);
    }
  }

  // Área lounge: sofás de cuero y mesas auxiliares de vidrio templado.
  rounded(world, 13.1, .055, 9.0, ivory, -14.0, -.098, 11.65, .12);
  const sofa = (x: number, z: number, angle = 0) => {
    const group = new THREE.Group();
    group.position.set(x, 0, z);
    group.rotation.y = angle;
    world.add(group);
    rounded(group, 4.1, .32, 1.25, whiteLeather, 0, .46, 0, .16);
    rounded(group, 4.14, 1.00, .30, charcoalLeather, 0, 1.03, -.54, .12);
    for (const dx of [-1.88, 1.88]) {
      rounded(group, .32, .73, 1.28, walnut, dx, .63, 0, .08);
    }
    for (const dx of [-1.1, 0, 1.1]) {
      rounded(group, 1.06, .11, .91, whiteLeather, dx, .64, .06, .05);
    }
  };
  sofa(-16.8, 11.2, .18);
  sofa(-11.4, 15.0, Math.PI);
  rounded(world, 3.55, .092, 1.80, glassClear, -13.9, .66, 12.35, .034);
  for (const dx of [-1.1, 1.1]) {
    block(world, .09, .60, 1.23, bronze, -13.9 + dx, .31, 12.35);
  }
  // Bar de café profesional, máquina espresso y taburetes arquitectónicos.
  rounded(world, 5.85, 1.05, 1.2, walnut, -19.8, .51, 17.0, .12);
  rounded(world, 5.93, .10, 1.28, travertine, -19.8, 1.08, 17.0, .08);
  rounded(world, .92, .72, .58, graphite, -21.1, 1.49, 16.8, .09);
  cylinder(world, .14, .12, .20, silver, -20.40, 1.29, 16.8);
  for (const x of [-18.2, -16.9]) {
    cylinder(world, .35, .35, .14, charcoalLeather, x, .80, 15.25);
    cylinder(world, .09, .09, .73, graphite, x, .41, 15.25);
  }

  // Zona de juegos corporativa: ping-pong y arcade con muebles sobrios.
  rounded(world, 13.1, .05, 8.9, limestone, 13.4, -.11, 11.6, .12);
  const gameTable = new THREE.Group();
  gameTable.position.set(13.0, 0, 11.1);
  world.add(gameTable);
  rounded(gameTable, 5.18, .16, 2.9, graphite, 0, .86, 0, .045);
  rounded(gameTable, 4.92, .027, 2.69, meshMat(0x244e40, .68), 0, .95, 0, .013);
  block(gameTable, .026, .015, 2.67, ivory, 0, .97, 0, false);
  for (const x of [-2.1, 2.1]) {
    block(gameTable, .11, .80, 1.8, silver, x, .42, 0);
  }
  block(gameTable, .036, .43, 2.67, silver, 0, 1.19, 0);
  const ball = sphere(gameTable, .09, ivory, -.5, 1.04, .52);
  ball.castShadow = false;
  for (const [x, z] of [[-1.8, -1.2], [1.7, .9]] as const) {
    const bat = cylinder(gameTable, .22, .22, .05, walnut, x, 1.03, z);
    bat.rotation.x = Math.PI / 2;
  }
  // Máquina arcade de aspecto vintage premium (no videojuegos interactivos).
  rounded(world, 1.32, 2.47, .86, midnight, 20.1, 1.16, 10.1, .10);
  rounded(world, 1.10, 1.01, .035, forest, 20.1, 1.62, 10.55, .055);
  for (let i = 0; i < 4; i += 1) {
    sphere(world, .072, i % 2 ? bronze : ivory, 19.80 + i * .20, .89, 10.59);
  }
  // Mesa auxiliar de vidrio de zona de juegos.
  rounded(world, 1.8, .075, 1.2, glassClear, 20.1, .53, 13.8, .035);
  cylinder(world, .09, .09, .49, bronze, 20.1, .27, 13.8);

  // Recepción de visitas con piedra y pantalla de bienvenida.
  rounded(world, 6.7, 1.12, 1.33, walnut, -4.9, .53, 11.0, .12);
  rounded(world, 6.78, .095, 1.44, glassSmoked, -4.9, 1.12, 11.0, .05);
  for (let i = 0; i < 8; i += 1) {
    block(world, .04, .62, .07, bronze, -7.9 + i * .87, .58, 11.71);
  }
  const receptionLogo = label("STACK44", "CENTRO DE OPERACIONES SG-SST");
  receptionLogo.position.set(-4.9, 1.52, 11.71);
  world.add(receptionLogo);

  // Helipuerto con helicóptero ejecutivo estilizado: aterrizado y rotor en giro.
  const pad = cylinder(world, 4.1, 4.1, .10, midnight, 18.5, -.115, 18.2, 48);
  pad.receiveShadow = !mobile;
  const circle = new THREE.Mesh(
    new THREE.TorusGeometry(3.37, .065, 9, 56), ivory,
  );
  circle.rotation.x = -Math.PI / 2;
  circle.position.set(18.5, -.051, 18.2);
  world.add(circle);
  block(world, .20, .018, 2.6, ivory, 18.02, -.052, 18.2, false);
  block(world, .20, .018, 2.6, ivory, 18.98, -.052, 18.2, false);
  block(world, 1.10, .018, .21, ivory, 18.5, -.052, 18.2, false);
  const helicopter = new THREE.Group();
  helicopter.name = "Helicóptero ejecutivo · heliopuerto Stack44";
  helicopter.position.set(18.5, .16, 18.3);
  world.add(helicopter);
  const fuselage = sphere(helicopter, 1.05, ivory, -.16, 1.08, .0, [1.68, .71, .76]);
  fuselage.rotation.z = -.07;
  sphere(helicopter, .87, glassSmoked, .54, 1.27, .12, [.82, .64, .72]);
  // Cola, estabilizador y aleta.
  line(helicopter, new THREE.Vector3(-1.05, 1.25, 0),
    new THREE.Vector3(-3.48, 1.41, 0), .16, ivory);
  block(helicopter, .55, .88, .085, graphite, -3.35, 1.73, 0);
  block(helicopter, .65, .06, 1.50, graphite, -3.08, 1.34, 0);
  // Tren de aterrizaje metálico y esquíes longitudinales.
  for (const z of [-.72, .72]) {
    line(helicopter, new THREE.Vector3(-.72, .65, z),
      new THREE.Vector3(-.64, .12, z), .054, bronze);
    line(helicopter, new THREE.Vector3(.73, .67, z),
      new THREE.Vector3(.79, .14, z), .054, bronze);
    line(helicopter, new THREE.Vector3(-1.65, .13, z),
      new THREE.Vector3(1.29, .13, z), .075, silver);
  }
  cylinder(helicopter, .12, .12, .48, silver, -.10, 2.03, 0);
  const rotor = new THREE.Group();
  rotor.position.set(-.10, 2.30, 0);
  helicopter.add(rotor);
  for (let i = 0; i < 4; i += 1) {
    const blade = rounded(rotor, 2.85, .045, .26, graphite, 1.31, 0, 0, .02);
    blade.rotation.y = i * Math.PI / 2;
    // Cada pala pivota alrededor del centro, no del extremo.
    blade.position.set(Math.cos(i * Math.PI / 2) * 1.31, 0,
      -Math.sin(i * Math.PI / 2) * 1.31);
  }
  const tailRotor = new THREE.Group();
  tailRotor.position.set(-3.56, 1.67, .08);
  helicopter.add(tailRotor);
  for (const a of [0, Math.PI / 2]) {
    const blade = block(tailRotor, .045, .88, .12, silver, 0, 0, 0, false);
    blade.rotation.z = a;
  }
  // Luminarias cálidas en el entorno y entrada.
  for (const [x, z] of [[-22, 18], [-8, 19], [7, 19], [22, 3], [-22, 3]] as const) {
    cylinder(world, .065, .084, 2.65, graphite, x, 1.18, z);
    sphere(world, .27, goldLight, x, 2.56, z);
  }

  // Ocho respaldos geométricos simplificados, solo visibles si los GLB fallan.
  // Los tres clientes aparecen únicamente durante sus visitas programadas.
  const fallback = [...OFFICE_TEAM, ...VISITOR_TEAM].map((member, i) => {
    const pose = getOfficePose(i, 0);
    const root = new THREE.Group();
    root.name = "Avatar suplente · " + member.name;
    root.position.set(pose.x, -.12, pose.z);
    const suit = [midnight, ivory, forest, graphite, oak, bronze, charcoalLeather, fern][i];
    for (const dx of [-.23, .23]) {
      rounded(root, .40, .65, .51, graphite, dx, .32, 0, .04);
    }
    rounded(root, .94, .82, .57, suit, 0, 1.09, 0, .09);
    for (const dx of [-.56, .56]) {
      cylinder(root, .16, .13, .60, suit, dx, 1.05, 0);
    }
    const face = meshMat(i % 2 ? 0xd9a26c : 0xeab951, .28);
    cylinder(root, .36, .36, .58, face, 0, 1.88, 0);
    sphere(root, .38, i % 3 ? walnut : midnight, 0, 2.20, 0, [1.0, .32, 1.0]);
    if (i === 1 || i === 4 || i === 5 || i === 7) {
      for (const side of [-1, 1]) {
        sphere(root, .18, walnut, side * .32, 1.88, -.1, [.52, 1.25, .84]);
      }
    }
    world.add(root);
    return { root };
  });

  // Un solo globo de conversación, proyectado en 3D con posición anclada
  // al personaje que habla. Nunca se muestran varios diálogos a la vez.
  const bubbleCanvas = document.createElement("canvas");
  bubbleCanvas.width = 1024; bubbleCanvas.height = 288;
  const bubbleContext = bubbleCanvas.getContext("2d");
  const bubbleTexture = new THREE.CanvasTexture(bubbleCanvas);
  bubbleTexture.colorSpace = THREE.SRGBColorSpace;
  const bubbleMaterial = new THREE.SpriteMaterial({
    map: bubbleTexture, transparent: true, depthWrite: false,
    opacity: .96, sizeAttenuation: true,
  });
  const bubble = new THREE.Sprite(bubbleMaterial);
  bubble.name = "Conversación SG-SST · ejemplo ficticio";
  bubble.scale.set(6.3, 1.77, 1);
  bubble.visible = false;
  bubble.renderOrder = 25;
  world.add(bubble);
  let lastDialogueKey = "";
  const refreshBubble = (who: string, role: string, message: string) => {
    if (!bubbleContext) return;
    const key = who + message;
    if (key === lastDialogueKey) return;
    lastDialogueKey = key;
    const ctx = bubbleContext;
    ctx.clearRect(0, 0, 1024, 288);
    ctx.fillStyle = "rgba(14,30,37,.95)";
    ctx.beginPath(); ctx.roundRect(16, 14, 992, 258, 38); ctx.fill();
    ctx.strokeStyle = "#c6af84"; ctx.lineWidth = 6; ctx.stroke();
    ctx.fillStyle = "#d9c39a"; ctx.font = "700 28px Arial";
    ctx.fillText(who.toUpperCase() + "  ·  " + role.toUpperCase(), 51, 78, 908);
    ctx.fillStyle = "#f8f5ea"; ctx.font = "700 38px Arial";
    const words = message.split(" ");
    const rows: string[] = [];
    let current = "";
    for (const word of words) {
      const next = current ? current + " " + word : word;
      if (ctx.measureText(next).width > 910 && current) {
        rows.push(current);
        current = word;
      } else current = next;
    }
    if (current) rows.push(current);
    rows.slice(0, 2).forEach((row, index) => ctx.fillText(row, 51, 144 + index * 51));
    ctx.fillStyle = "#a7b6ad"; ctx.font = "22px Arial";
    ctx.fillText("SIMULACIÓN VISUAL · OPERACIÓN SG-SST", 51, 250);
    bubbleTexture.needsUpdate = true;
  };

  return {
    fallback,
    update(time: number) {
      screens.update(time);
      rotor.rotation.y = time * 1.75;
      tailRotor.rotation.z = time * 5.0;
      const dialog = getOfficeDialogue(time);
      bubble.visible = dialog !== null;
      if (dialog) {
        refreshBubble(dialog.speaker, dialog.role, dialog.text);
        const pose = getOfficePose(dialog.actor, time);
        bubble.position.set(
          pose.x, dialog.actor >= 5 ? 3.40 : 3.85,
          pose.z + .15,
        );
        const tau = time % 120;
        const fade = Math.abs(Math.sin(tau * .72));
        bubbleMaterial.opacity = .78 + fade * .20;
        bubble.position.y += Math.sin(time * 1.2) * .055;
      }
    },
    resize(isMobile: boolean) {
      bubble.scale.set(isMobile ? 5.0 : 6.3, isMobile ? 1.41 : 1.77, 1);
    },
    dispose() {
      screens.dispose();
      bubbleTexture.dispose();
    },
  };
}
