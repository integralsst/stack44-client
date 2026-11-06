import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export const palette = {
  walnut: 0x74482b, walnutDark: 0x321f17, travertine: 0xd8d0be,
  cream: 0xf0e9da, forest: 0x264c39, brass: 0xd6a75b,
  metal: 0x25292c, charcoal: 0x171b20, glass: 0xacc9c4,
};

function surfaceTexture(base: [number, number, number], variation: number, grain = false) {
  const canvas = document.createElement('canvas'); canvas.width = 256; canvas.height = 256;
  const context = canvas.getContext('2d')!;
  const image = context.createImageData(256, 256);
  for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
    const wave = grain ? Math.sin(x * .2 + Math.sin(y * .065) * 3) * .48 + Math.sin(x * .045) * .32 : Math.sin(x * .075 + y * .035) * .16;
    const noise = (Math.sin(x * 127.1 + y * 311.7) * 43758.5453) % 1;
    const value = wave * variation + noise * variation * .55;
    const offset = (y * 256 + x) * 4;
    image.data[offset] = Math.max(0, Math.min(255, base[0] + value));
    image.data[offset + 1] = Math.max(0, Math.min(255, base[1] + value));
    image.data[offset + 2] = Math.max(0, Math.min(255, base[2] + value));
    image.data[offset + 3] = 255;
  }
  context.putImageData(image, 0, 0);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  texture.anisotropy = 2;
  return texture;
}

export function materials() {
  const make = (color: number, roughness = .72, metalness = 0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
  const result = {
    walnut: make(palette.walnut, .38), walnutDark: make(palette.walnutDark, .4),
    travertine: make(palette.travertine, .78), cream: make(palette.cream, .68),
    forest: make(palette.forest, .48), brass: make(palette.brass, .24, .62),
    metal: make(palette.metal, .32, .7), charcoal: make(palette.charcoal, .45),
    glass: new THREE.MeshPhysicalMaterial({ color: palette.glass, metalness: .18, roughness: .1, transparent: true, opacity: .36, depthWrite: false }),
    screen: new THREE.MeshBasicMaterial({ color: 0x102a2a }),
    white: make(0xffffff, .56), soil: make(0x2d3328), leaf: make(0x3b7849),
    leafLight: make(0x73a44f), glow: new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffd99b).multiplyScalar(1.65), toneMapped: false }),
    stone: make(0x969793, .84), fabric: make(0xb8ae9f, .96),
  };
  result.walnut.map = surfaceTexture([113, 70, 40], 19, true);
  result.walnutDark.map = surfaceTexture([57, 36, 27], 14, true);
  result.travertine.map = surfaceTexture([218, 209, 188], 11);
  result.stone.map = surfaceTexture([155, 154, 150], 14);
  result.fabric.map = surfaceTexture([185, 176, 162], 9);
  for (const material of [result.walnut, result.walnutDark, result.travertine, result.stone, result.fabric])
    material.color.set(0xffffff);
  return result;
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
