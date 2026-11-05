import * as THREE from "three";

/**
 * Vestuario, sonrisa, gafas y cabello aplicados a clones individuales del GLB
 * "LEGO Minifigure (Animated)" de Ben Shaffer (CC BY 4.0).
 *
 * Un mismo archivo binario puede representar seis profesionales de SG-SST.
 * Todos los accesorios siguen los huesos del modelo, sin crear más descargas.
 */
type CharacterStyle = {
  name: string;
  shirt: number;
  pants: number;
  hair: number;
  secondaryHair: number;
  hairStyle: "executive" | "waves" | "bob" | "bun" | "curls" | "swept";
  eyewear: "none" | "rectangular" | "round" | "safety";
  safety: boolean;
  blazer: boolean;
};

const STYLES: CharacterStyle[] = [
  { name: "Coordinador SST", shirt: 0x1b99a4, pants: 0x28374b, hair: 0x29201c, secondaryHair: 0x62443a, hairStyle: "executive", eyewear: "rectangular", safety: false, blazer: false },
  { name: "Profesional SST", shirt: 0xf1e7d8, pants: 0x39435d, hair: 0x57352a, secondaryHair: 0x956548, hairStyle: "waves", eyewear: "none", safety: false, blazer: true },
  { name: "Inspectora SST", shirt: 0xdb802d, pants: 0x263e4e, hair: 0x322f2e, secondaryHair: 0x65605a, hairStyle: "bob", eyewear: "safety", safety: true, blazer: false },
  { name: "Coordinadora", shirt: 0xa84e6e, pants: 0x242e47, hair: 0x242128, secondaryHair: 0x5f4c52, hairStyle: "bun", eyewear: "round", safety: false, blazer: true },
  { name: "Analista de prevención", shirt: 0x4d8c64, pants: 0x384158, hair: 0x171f29, secondaryHair: 0x445364, hairStyle: "curls", eyewear: "none", safety: false, blazer: false },
  { name: "Auditor SST", shirt: 0x4762a6, pants: 0x2b344c, hair: 0x69402a, secondaryHair: 0x9b6345, hairStyle: "swept", eyewear: "rectangular", safety: false, blazer: true },
];

function polished(color: number, transparent = false) {
  return new THREE.MeshPhysicalMaterial({
    color, roughness: 0.26, metalness: 0,
    clearcoat: 0.52, clearcoatRoughness: 0.18,
    transparent, opacity: transparent ? 0.48 : 1,
  });
}

function sphere(
  parent: THREE.Object3D,
  material: THREE.Material,
  x: number, y: number, z: number,
  sx: number, sy: number, sz: number,
) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(1, 14, 10), material);
  m.scale.set(sx, sy, sz);
  m.position.set(x, y, z);
  m.castShadow = true;
  parent.add(m);
  return m;
}

function bar(
  parent: THREE.Object3D,
  material: THREE.Material,
  w: number, h: number, d: number,
  x: number, y: number, z: number,
  rotateZ = 0,
) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.rotation.z = rotateZ;
  m.castShadow = true;
  parent.add(m);
  return m;
}

function lock(
  parent: THREE.Object3D,
  material: THREE.Material,
  positions: [number, number, number][],
  radius: number,
) {
  const curve = new THREE.CatmullRomCurve3(
    positions.map(([x, y, z]) => new THREE.Vector3(x, y, z)),
  );
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, radius, 7, false), material);
  mesh.castShadow = true;
  parent.add(mesh);
}

function attachToBone(
  model: THREE.Object3D,
  boneName: string,
  accessory: THREE.Group,
) {
  // Las coordenadas se expresan en el espacio local del GLB; attach conserva
  // el lugar en pantalla y convierte la matriz al espacio del hueso.
  model.updateMatrixWorld(true);
  model.add(accessory);
  model.updateMatrixWorld(true);
  const bone = model.getObjectByName(boneName);
  if (bone) bone.attach(accessory);
}

/**
 * Mantiene el rostro sonriente real: Object_77 (Head01_Smile_Matv2_0).
 * Oculta la cabeza alternativa "dead" y el plano de Sketchfab.
 */
export function decorateAnimatedSstFigure(
  model: THREE.Object3D,
  variant: number,
): void {
  const design = STYLES[variant % STYLES.length];

  model.name = "Stack44 · " + design.name;
  const jacketMaterial = polished(design.shirt);
  const pantsMaterial = polished(design.pants);
  const hairMain = polished(design.hair);
  const hairShine = polished(design.secondaryHair);
  const frame = polished(0x273747);
  const glass = polished(0x89b3be, true);
  const ivory = polished(0xfff1d8);
  const highVis = polished(0xffcf3f);
  const reflector = polished(0xe8f9f5);
  const badgeTeal = polished(0x19b2aa);

  model.traverse((object) => {
    if (!(object instanceof THREE.Mesh)) return;
    if (object.name === "Floor_Floor_Tex_0" || object.name === "Object_79") {
      object.visible = false;
      return;
    }
    // Duplicamos materiales: los diez personajes no comparten colores.
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    const mapped = materials.map((material) => {
      const name = material.name.toLowerCase();
      if (name.includes("red_mat")) return jacketMaterial;
      if (name.includes("blue_mat")) return pantsMaterial;
      return material;
    });
    object.material = Array.isArray(object.material) ? mapped : mapped[0];
  });

  // Cabello situado sobre el cilindro real de cabeza (y = .77 a 1.07).
  const hair = new THREE.Group();
  hair.name = "Stack44 · Peinado " + design.hairStyle;
  sphere(hair, hairMain, 0, 1.067, 0.065, 0.142, 0.055, 0.135);
  if (design.hairStyle === "executive" || design.hairStyle === "swept") {
    sphere(hair, hairMain, 0.048, 1.081, 0.108, 0.104, 0.052, 0.084);
    lock(hair, hairShine, [
      [-0.10, 1.092, 0.15], [-0.04, 1.125, 0.16],
      [0.065, 1.095, 0.165], [0.119, 1.065, 0.105],
    ], 0.017);
  } else if (design.hairStyle === "waves") {
    for (const side of [-1, 1]) {
      sphere(hair, hairMain, side * 0.119, 0.927, -0.018, 0.051, 0.139, 0.084);
      lock(hair, hairShine, [
        [side * 0.102, 1.084, 0.110], [side * 0.130, 0.992, 0.138],
        [side * 0.141, 0.917, 0.116], [side * 0.111, 0.852, 0.087],
      ], 0.017);
    }
  } else if (design.hairStyle === "bob") {
    for (const side of [-1, 1]) {
      sphere(hair, hairMain, side * 0.122, 0.945, -0.003, 0.050, 0.122, 0.083);
      sphere(hair, hairShine, side * 0.12, 0.870, 0.04, 0.04, 0.041, 0.057);
    }
  } else if (design.hairStyle === "bun") {
    sphere(hair, hairMain, 0, 1.060, -0.13, 0.12, 0.092, 0.095);
    sphere(hair, hairShine, 0.025, 1.111, -0.16, 0.068, 0.064, 0.062);
    lock(hair, hairShine, [
      [-0.11, 1.084, 0.10], [-0.055, 1.116, 0.15], [0.07, 1.10, 0.124],
    ], 0.012);
  } else if (design.hairStyle === "curls") {
    for (let i = 0; i < 12; i += 1) {
      const angle = 2 * Math.PI * i / 12;
      sphere(hair, i % 3 ? hairMain : hairShine,
        Math.cos(angle) * 0.112, 1.081 + (i % 2) * 0.029,
        Math.sin(angle) * 0.109 + 0.045, 0.039, 0.038, 0.039);
    }
  }
  if (design.safety) {
    bar(hair, highVis, 0.33, 0.035, 0.26, 0, 1.124, 0.056);
    sphere(hair, highVis, 0, 1.147, 0.050, 0.148, 0.060, 0.139);
  }
  attachToBone(model, "Head_00", hair);

  // Armazones en el plano facial (+Z); el modelo conserva su sonrisa original.
  if (design.eyewear !== "none") {
    const glasses = new THREE.Group();
    glasses.name = "Stack44 · Gafas " + design.eyewear;
    const eyeY = 0.941;
    const eyeZ = 0.205;
    if (design.eyewear === "round") {
      for (const x of [-0.064, 0.064]) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(0.051, 0.009, 7, 14), frame,
        );
        ring.position.set(x, eyeY, eyeZ);
        glasses.add(ring);
      }
    } else {
      for (const x of [-0.065, 0.065]) {
        if (design.eyewear === "safety") {
          bar(glasses, glass, 0.125, 0.076, 0.009, x, eyeY, eyeZ - 0.003);
        }
        for (const y of [-0.041, 0.041]) {
          bar(glasses, frame, 0.109, 0.009, 0.015, x, eyeY + y, eyeZ);
        }
        for (const side of [-0.053, 0.053]) {
          bar(glasses, frame, 0.009, 0.087, 0.015, x + side, eyeY, eyeZ);
        }
      }
    }
    bar(glasses, frame, 0.031, 0.009, 0.013, 0, eyeY + 0.015, eyeZ);
    for (const side of [-1, 1]) {
      bar(glasses, frame, 0.056, 0.012, 0.014, side * 0.137, eyeY + 0.01, eyeZ - 0.028);
    }
    attachToBone(model, "Head_00", glasses);
  }

  const clothing = new THREE.Group();
  clothing.name = "Stack44 · Uniforme SST";
  // Pin SG-SST y lanyard corporativo a nivel de torso.
  bar(clothing, badgeTeal, 0.065, 0.055, 0.01, -0.10, 0.714, 0.17);
  bar(clothing, ivory, 0.039, 0.025, 0.011, -0.10, 0.713, 0.179);
  if (design.blazer) {
    bar(clothing, ivory, 0.046, 0.19, 0.01, -0.050, 0.68, 0.18, -0.25);
    bar(clothing, ivory, 0.046, 0.19, 0.01, 0.050, 0.68, 0.18, 0.25);
  }
  if (design.safety) {
    bar(clothing, highVis, 0.35, 0.09, 0.012, 0, 0.68, 0.178);
    for (const x of [-0.115, 0.115]) {
      bar(clothing, reflector, 0.032, 0.27, 0.015, x, 0.68, 0.181);
    }
  }
  attachToBone(model, "Torso_026", clothing);
}
