import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

import { campusTokens } from './campusDesignTokens';

export const palette = campusTokens.colors;

/** Small deterministic albedo + linear micro-surface maps; no external texture downloads. */
function surface(base: [number, number, number], variation: number, grain = false) {
  const colorCanvas = document.createElement('canvas'), detailCanvas = document.createElement('canvas');
  colorCanvas.width = colorCanvas.height = detailCanvas.width = detailCanvas.height = 256;
  const c = colorCanvas.getContext('2d')!, d = detailCanvas.getContext('2d')!;
  const albedo = c.createImageData(256, 256), detail = d.createImageData(256, 256);
  const noise = (x: number, y: number) => { const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return n - Math.floor(n); };
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const fine = noise(x, y) - .5;
    const vein = grain ? Math.sin(x * .34 + Math.sin(y * .023) * 1.2 + Math.sin(x * .027) * 2) * .36
      + Math.sin(x * 1.3 + y * .007) * .12 : Math.sin(x * .031 + Math.sin(y * .047)) * .16;
    const value = (vein + fine * .3) * variation;
    const offset = (y * 256 + x) * 4;
    for (let channel = 0; channel < 3; channel++) {
      albedo.data[offset + channel] = base[channel] + value;
      detail.data[offset + channel] = 222 + fine * 23 + vein * 15;
    }
    albedo.data[offset + 3] = detail.data[offset + 3] = 255;
  }
  c.putImageData(albedo, 0, 0); d.putImageData(detail, 0, 0);
  const map = new THREE.CanvasTexture(colorCanvas), micro = new THREE.CanvasTexture(detailCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  for (const texture of [map, micro]) { texture.wrapS = texture.wrapT = THREE.RepeatWrapping; texture.anisotropy = 4; }
  return { map, bumpMap: micro, roughnessMap: micro };
}

export function materials() {
  const p = campusTokens.surfaces;
  const make = (color: number, roughness = .72, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  return {
    walnut: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: p.woodRoughness, bumpScale: .018, ...surface([102, 64, 39], 16, true) }),
    walnutDark: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: p.darkWoodRoughness, bumpScale: .014, ...surface([47, 33, 25], 13, true) }),
    travertine: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: p.stoneRoughness, bumpScale: .018, clearcoat: .2, clearcoatRoughness: .4, ...surface([218, 207, 187], 13) }),
    stone: new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .53, bumpScale: .013, clearcoat: .13, clearcoatRoughness: .45, ...surface([184, 178, 163], 15) }),
    cream: make(palette.cream, .55), forest: make(palette.forest, .68),
    brass: new THREE.MeshStandardMaterial({ color: palette.brass, roughness: p.brassRoughness, metalness: p.brassMetalness, roughnessMap: surface([220,220,220],8,true).roughnessMap, envMapIntensity: 1.25 }),
    metal: make(palette.metal, .3, .82), charcoal: make(palette.charcoal, .42),
    foundation: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .62, bumpScale: .025, ...surface([55, 58, 54], 14) }),
    turf: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, bumpScale: .055, ...surface([62, 77, 43], 27) }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xd7e6df, metalness: 0, roughness: p.glassRoughness,
      transparent: true, opacity: p.glassOpacity, depthWrite: false, ior: 1.48, thickness: .06, clearcoat: .6, envMapIntensity: 1.15 }),
    carGlass: new THREE.MeshPhysicalMaterial({ color: 0x172a31, metalness: .18, roughness: .13, clearcoat: 1, clearcoatRoughness: .09, envMapIntensity: 1.5 }),
    screen: new THREE.MeshBasicMaterial({ color: 0x102a2a }),
    white: make(0xfaf8f1, .45), soil: make(0x252d22), leaf: make(0x3c6540, .82), leafLight: make(0x78924d, .8),
    glow: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffb857).multiplyScalar(3.2), toneMapped: false }),
    fabric: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: .96, bumpScale: .015, ...surface([190, 180, 163], 12) }),
  };
}

export type OfficeMaterials = ReturnType<typeof materials>;

const boxGeometries = new Map<string, THREE.BoxGeometry>();
const roundedGeometries = new Map<string, RoundedBoxGeometry>();
const cylinderGeometries = new Map<string, THREE.CylinderGeometry>();
export function clearOfficeGeometryCache() {
  boxGeometries.clear(); roundedGeometries.clear(); cylinderGeometries.clear();
}

export function box(parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material) {
  const key = [w, h, d].join('/');
  let geometry = boxGeometries.get(key);
  if (!geometry) { geometry = new THREE.BoxGeometry(w, h, d); boxGeometries.set(key, geometry); }
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

export function softBox(parent: THREE.Object3D, w: number, h: number, d: number, x: number, y: number, z: number, material: THREE.Material, radius = .045) {
  const safeRadius = Math.min(radius, w * .45, h * .45, d * .45);
  const key = [w, h, d, safeRadius].join('/');
  let geometry = roundedGeometries.get(key);
  if (!geometry) { geometry = new RoundedBoxGeometry(w, h, d, 2, safeRadius); roundedGeometries.set(key, geometry); }
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
