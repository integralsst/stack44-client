import * as THREE from "three";

type HairStyle = "side-part" | "soft-waves" | "elegant-bun" | "short-curls";

const STYLES: Array<{
  style: HairStyle; main: number; light: number;
}> = [
  { style: "side-part", main: 0x4b3025, light: 0x785444 },
  { style: "soft-waves", main: 0x5a302b, light: 0x985b49 },
  { style: "elegant-bun", main: 0x352b2c, light: 0x6c5150 },
  { style: "short-curls", main: 0x202c39, light: 0x536376 },
];

const sphereGeometry = new THREE.SphereGeometry(1, 22, 14);
const makeMaterial = (hex: number) => new THREE.MeshPhysicalMaterial({
  color: hex,
  roughness: 0.31,
  metalness: 0.0,
  clearcoat: 0.32,
  clearcoatRoughness: 0.35,
});

function ellipsoid(
  parent: THREE.Group,
  material: THREE.Material,
  x: number, y: number, z: number,
  sx: number, sy: number, sz: number,
  rotationZ = 0,
) {
  const mesh = new THREE.Mesh(sphereGeometry, material);
  mesh.position.set(x, y, z);
  mesh.scale.set(sx, sy, sz);
  mesh.rotation.z = rotationZ;
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

function lock(
  parent: THREE.Group,
  material: THREE.Material,
  coords: number[][],
  radius: number,
) {
  const curve = new THREE.CatmullRomCurve3(coords.map(([x, y, z]) =>
    new THREE.Vector3(x, y, z)), false, "catmullrom", 0.45);
  const mesh = new THREE.Mesh(
    new THREE.TubeGeometry(curve, 17, radius, 7, false),
    material,
  );
  mesh.castShadow = true;
  parent.add(mesh);
}

/**
 * Sustituye los cabellos geométricos sencillos incluidos en la descarga.
 *
 * La cabellera nueva se vincula al hueso de la cabeza; no queda "flotando"
 * cuando la minifigura mueve la cabeza, saluda o camina.
 *
 * Es un detalle visual agregado al GLB en tiempo de carga, sin cambiar su
 * esqueleto ni compartir geometrías mutables entre personajes.
 */
export function applyPremiumSstHair(
  model: THREE.Object3D,
  variant: number,
  keepSafetyHelmet: boolean,
): void {
  const selected = STYLES[variant] ?? STYLES[0];
  const main = makeMaterial(selected.main);
  const light = makeMaterial(selected.light);
  const hair = new THREE.Group();
  hair.name = "Stack44 · Cabello Premium";
  const rigBase = model.getObjectByName("GLTF_created_0") ?? model;
  const headBone = model.getObjectByName("Bone.005_0");

  // En este GLB, el centro de la parte superior de la cabeza está cerca de Y=4.
  hair.position.set(0, 4.0, 0);

  const s = (m: THREE.Material, x: number, y: number, z: number,
    sx: number, sy: number, sz: number, rz = 0) =>
    ellipsoid(hair, m, x, y, z, sx, sy, sz, rz);

  // Casquete de cabello con distintas densidades; el plano facial (+Z)
  // queda despejado para que se vean los ojos y la expresión original.
  s(main, 0, 0.12, -0.025, 0.55, 0.245, 0.55);
  s(light, -0.17, 0.20, -0.16, 0.27, 0.14, 0.34, -0.16);

  if (selected.style === "side-part") {
    // Peinado corporativo con raya y tupé esculpido hacia un costado.
    s(main, 0.26, 0.17, 0.16, 0.34, 0.24, 0.32, -0.38);
    lock(hair, main, [
      [-0.41, 0.16, 0.28], [-0.18, 0.28, 0.34],
      [0.12, 0.25, 0.43], [0.35, 0.11, 0.37],
    ], 0.105);
    lock(hair, light, [
      [-0.36, 0.29, 0.21], [-0.10, 0.35, 0.33],
      [0.22, 0.30, 0.35],
    ], 0.050);
    s(main, -0.43, -0.04, 0.03, 0.13, 0.20, 0.31);
  }

  if (selected.style === "soft-waves") {
    // Melena a los hombros, no "bolas" aisladas: mechones continuos y ondas.
    s(main, 0, 0.07, -0.42, 0.50, 0.35, 0.23);
    for (const side of [-1, 1]) {
      s(main, side * 0.46, -0.19, -0.13, 0.18, 0.38, 0.30, side * 0.09);
      s(main, side * 0.47, -0.47, -0.15, 0.20, 0.19, 0.26);
      lock(hair, light, [
        [side * 0.29, 0.27, 0.22],
        [side * 0.46, 0.04, 0.20],
        [side * 0.49, -0.26, 0.14],
        [side * 0.43, -0.51, 0.11],
      ], 0.054);
      lock(hair, main, [
        [side * 0.30, 0.15, -0.38],
        [side * 0.47, -0.05, -0.42],
        [side * 0.45, -0.42, -0.40],
      ], 0.12);
    }
    lock(hair, main, [
      [-0.44, 0.21, 0.21], [-0.22, 0.24, 0.40],
      [0.11, 0.15, 0.42], [0.32, 0.07, 0.34],
    ], 0.09);
  }

  if (selected.style === "elegant-bun") {
    // Cabello recogido, raya lateral y moño de varias capas atrás.
    for (let i = 0; i < 5; i += 1) {
      const x = -0.42 + i * 0.20;
      lock(hair, i % 2 === 0 ? light : main, [
        [x, 0.16, 0.29],
        [x * 0.85, 0.32, 0.09],
        [x * 0.55, 0.21, -0.40],
      ], 0.038);
    }
    s(main, 0, 0.02, -0.56, 0.32, 0.31, 0.25);
    for (let i = 0; i < 7; i += 1) {
      const angle = (i * Math.PI * 2) / 7;
      s(i % 2 ? main : light,
        Math.cos(angle) * 0.18, Math.sin(angle) * 0.18,
        -0.68, 0.10, 0.12, 0.12);
    }
    lock(hair, main, [
      [-0.43, 0.15, 0.15], [-0.18, 0.26, 0.38],
      [0.16, 0.17, 0.37],
    ], 0.092);
  }

  if (selected.style === "short-curls") {
    // Rizos compactos definidos de tamaños y tonos alternados.
    for (let ring = 0; ring < 2; ring += 1) {
      const count = ring === 0 ? 11 : 7;
      for (let i = 0; i < count; i += 1) {
        const angle = (i / count) * Math.PI * 2 + ring * 0.18;
        const radius = ring === 0 ? 0.38 : 0.22;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius - 0.035;
        const y = ring === 0 ? 0.16 : 0.35;
        s(i % 3 === 0 ? light : main, x, y, z,
          0.135, 0.14 + (i % 3) * 0.015, 0.13);
      }
    }
    for (const side of [-1, 1]) {
      s(main, side * 0.46, -0.02, 0.02, 0.145, 0.23, 0.28);
    }
  }

  // Los cascos son parte del EPP. Se conservan en roles de visita/inspección.
  // En el resto de puestos se muestra el cabello completo.
  model.traverse((object) => {
    const name = object.name.toLowerCase();
    const originalHair = /hair|fringe|bang|^bun$/.test(name);
    const helmet = /hardhat/.test(name);
    if (originalHair || (helmet && !keepSafetyHelmet)) object.visible = false;
  });

  rigBase.add(hair);
  model.updateMatrixWorld(true);

  // Vincular a Bone.005_0 mediante Object3D.attach conserva la transformación
  // mundial y hace que la cabellera siga las rotaciones de cabeza.
  if (headBone) {
    headBone.attach(hair);
  }
}
