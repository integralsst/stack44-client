import * as THREE from 'three';

export const palette = {
  walnut: 0x6a432b, walnutDark: 0x3e281d, travertine: 0xd8ccaf,
  cream: 0xeee7d7, forest: 0x244a39, brass: 0xb79353,
  metal: 0x242b2c, charcoal: 0x172021, glass: 0x8fa9a3,
};

export function materials() {
  const make = (color: number, roughness = .72, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  return {
    walnut: make(palette.walnut, .38), walnutDark: make(palette.walnutDark, .4),
    travertine: make(palette.travertine, .9), cream: make(palette.cream, .86),
    forest: make(palette.forest, .6), brass: make(palette.brass, .28, .6),
    metal: make(palette.metal, .32, .7), charcoal: make(palette.charcoal, .45),
    glass: new THREE.MeshPhysicalMaterial({ color: palette.glass, metalness: .12, roughness: .13, transparent: true, opacity: .48, depthWrite: false }),
    screen: new THREE.MeshBasicMaterial({ color: 0x102a2a }),
    white: make(0xffffff, .72), soil: make(0x2d3328), leaf: make(0x467351),
  };
}

export type OfficeMaterials = ReturnType<typeof materials>;

const boxGeometries = new Map<string, THREE.BoxGeometry>();
const cylinderGeometries = new Map<string, THREE.CylinderGeometry>();
export function clearOfficeGeometryCache() {
  boxGeometries.clear(); cylinderGeometries.clear();
}

export function box(parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material) {
  const key = [w, h, d].join('/');
  let geometry = boxGeometries.get(key);
  if (!geometry) { geometry = new THREE.BoxGeometry(w, h, d); boxGeometries.set(key, geometry); }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

export function cylinder(parent: THREE.Object3D, top: number, bottom: number, h: number, x: number, y: number, z: number, material: THREE.Material, segments = 12) {
  const key = [top, bottom, h, segments].join('/');
  let geometry = cylinderGeometries.get(key);
  if (!geometry) { geometry = new THREE.CylinderGeometry(top, bottom, h, segments); cylinderGeometries.set(key, geometry); }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
