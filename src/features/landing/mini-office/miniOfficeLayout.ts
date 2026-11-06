import * as THREE from 'three';
import { box, cylinder, softBox, type OfficeMaterials } from './miniOfficeMaterials';
import { brandTexture, dashboardTexture } from './miniOfficeScreens';

export const desks = [
  { name: 'Jesús', x: -2.2, z: -2.35, executive: true },
  { name: 'Cristina', x: 2.2, z: -2.35, executive: true },
  { name: 'Apolo', x: -3.45, z: 1.35, executive: false },
  { name: 'Zeus', x: 0, z: 1.35, executive: false },
  { name: 'Hera', x: 3.45, z: 1.35, executive: false },
] as const;

function foliage(root: THREE.Object3D, m: OfficeMaterials, x: number, y: number, z: number, scale = 1, hanging = false) {
  const group = new THREE.Group(); group.position.set(x, y, z); group.scale.setScalar(scale); root.add(group);
  if (!hanging) {
    cylinder(group, .22, .17, .38, 0, .2, 0, m.cream, 12);
    cylinder(group, .18, .18, .025, 0, .4, 0, m.soil);
  }
  const stemY = hanging ? -.3 : .7;
  for (let i = 0; i < 9; i++) {
    const angle = i * Math.PI * 2 / 9;
    const radius = .18 + (i % 3) * .035;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.22, 8, 6), i % 3 ? m.leaf : m.leafLight);
    leaf.scale.set(.52, 1.15 + (i % 2) * .3, .38);
    leaf.position.set(Math.cos(angle) * radius, stemY + (i % 4) * .11, Math.sin(angle) * radius);
    leaf.rotation.z = Math.cos(angle) * .6;
    leaf.rotation.x = Math.sin(angle) * .6;
    leaf.castShadow = true; group.add(leaf);
  }
}

function planterBush(root: THREE.Object3D, m: OfficeMaterials, x: number, z: number, seed: number) {
  const plant = new THREE.Group(); plant.position.set(x, .43, z); root.add(plant);
  for (let stem = 0; stem < 4; stem++) {
    const angle = seed * .8 + stem * 1.57;
    const dx = Math.cos(angle) * (.11 + stem * .025);
    const dz = Math.sin(angle) * (.075 + stem * .018);
    const height = .42 + ((seed + stem) % 3) * .105;
    const stalk = cylinder(plant, .012, .016, height, dx * .45, height / 2, dz * .45, m.forest, 6);
    stalk.rotation.z = dx * .55;
    for (let leafIndex = 0; leafIndex < 2; leafIndex++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), (seed + stem + leafIndex) % 3 ? m.leaf : m.leafLight);
      leaf.position.set(dx * (leafIndex ? 1.1 : .55), height * (.6 + leafIndex * .32), dz * (leafIndex ? 1.1 : .55));
      leaf.scale.set(.13, .29, .095);
      leaf.rotation.z = dx > 0 ? -.45 : .45;
      leaf.castShadow = true; plant.add(leaf);
    }
  }
}

function deskLamp(g: THREE.Group, m: OfficeMaterials, x: number, z: number) {
  cylinder(g, .11, .11, .025, x, 1.45, z, m.brass);
  cylinder(g, .018, .018, .47, x, 1.69, z, m.brass);
  const arm = box(g, .38, .035, .035, x - .18, 1.91, z, m.brass); arm.rotation.z = -.15;
  box(g, .3, .07, .25, x - .38, 1.84, z, m.brass);
  box(g, .22, .01, .17, x - .38, 1.79, z, m.glow);
}

function workstation(root: THREE.Group, m: OfficeMaterials, x: number, z: number, executive: boolean, name: string) {
  const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g);
  const top = executive ? m.glass : m.travertine;
  softBox(g, 2.55, .12, 1.4, 0, 1.38, 0, top, .045);
  box(g, 2.45, .045, 1.31, 0, 1.29, 0, executive ? m.brass : m.walnut);
  for (const sx of [-1, 1]) {
    box(g, .1, 1.22, .1, sx * 1.13, .65, -.53, executive ? m.brass : m.metal);
    box(g, .1, 1.22, .1, sx * 1.13, .65, .53, executive ? m.brass : m.metal);
  }
  if (!executive) {
    softBox(g, 2.2, .47, .065, 0, .61, .65, m.walnutDark, .025);
    box(g, 2.17, .3, .03, 0, .995, .69, m.glass);
    box(g, 2.25, .04, .075, 0, .85, .7, m.glow);
    box(g, 2.25, .07, .075, 0, .28, .7, m.metal);
    for (const x of [-.9, .9]) box(g, .045, .48, .08, x, .6, .7, m.brass);
    if (name === 'Zeus') {
      const emblem = box(g, .19, .19, .015, 0, .62, .696, m.brass);
      emblem.rotation.z = Math.PI / 4;
    }
  } else {
    box(g, 2.25, .5, .08, 0, .88, .61, m.walnutDark);
    box(g, 2.2, .045, .08, 0, .61, .66, m.glow);
  }
  // The employee sits at -Z; the keyboard is between them and the display.
  if (executive) {
    softBox(g, .98, .045, .62, 0, 1.47, -.03, m.metal, .02);
    box(g, .88, .01, .48, 0, 1.5, -.04, m.stone);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 7; col++)
      box(g, .075, .008, .055, -.32 + col * .105, 1.511, -.21 + row * .092, m.charcoal);
    box(g, .27, .008, .095, 0, 1.511, .17, m.cream);
    const lid = softBox(g, .99, .58, .045, 0, 1.81, .25, m.stone, .018);
    lid.rotation.x = -.14;
    const display = box(g, .87, .47, .008, 0, 1.81, .22, m.screen); display.rotation.x = -.14;
    box(g, .18, .015, .035, 0, 1.53, -.36, m.brass);
  } else {
    softBox(g, 1.13, .5, .075, 0, 1.74, .49, m.metal, .025);
    box(g, 1.03, .42, .012, 0, 1.74, .443, m.screen);
    for (let i = 0; i < 5; i++) box(g, .62 - i * .08, .025, .015, 0, 1.87 - i * .075, .433, i === 0 ? m.brass : m.leaf);
    const logo = box(g, .095, .095, .01, 0, 1.75, .531, m.brass); logo.rotation.z = Math.PI / 4;
    box(g, .12, .12, .08, 0, 1.49, .49, m.metal);
    box(g, .43, .025, .3, 0, 1.44, .49, m.metal);
    box(g, .95, .025, .28, 0, 1.46, -.25, m.metal);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 9; col++)
      box(g, .078, .009, .052, -.37 + col * .093, 1.478, -.34 + row * .085, m.white);
  }
  cylinder(g, .055, .055, .018, .62, 1.46, -.28, m.metal);
  box(g, .3, .018, .4, -.91, 1.46, .13, m.cream);
  cylinder(g, .085, .085, .18, -.92, 1.55, -.4, m.metal);
  for (const px of [-1.0, -.92, -.84]) cylinder(g, .008, .008, .29, px, 1.75, -.4, px === -.92 ? m.brass : m.white, 6);
  box(g, .22, .015, .28, .92, 1.46, -.28, name === 'Apolo' ? m.brass : m.forest);
  cylinder(g, .085, .075, .18, .92, 1.58, -.28, m.white);
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.065, .018, 6, 12, Math.PI * 1.35), m.white);
  handle.position.set(1.02, 1.59, -.28); handle.rotation.y = Math.PI / 2; g.add(handle);
  if (name !== 'Hera') foliage(g, m, .98, 1.46, .34, .25);
  if (executive) deskLamp(g, m, -.94, .34);
  if (name === 'Apolo') {
    const headset = new THREE.Mesh(new THREE.TorusGeometry(.18, .045, 7, 16, Math.PI), m.charcoal);
    headset.position.set(-.95, 1.55, .4); headset.rotation.x = Math.PI / 2; g.add(headset);
  }
  if (name === 'Zeus') {
    for (let i = 0; i < 3; i++) box(g, .37, .05, .31, -.93, 1.48 + i * .052, .3, i === 1 ? m.brass : m.forest);
  }
  if (name === 'Hera') foliage(g, m, .97, 1.46, .3, .34);
  // Chair with a low seat, curved silhouette and five-spoke base.
  cylinder(g, .43, .43, .08, 0, .76, -.67, m.charcoal);
  const back = softBox(g, .85, .73, .12, 0, 1.14, -1.08, executive ? m.charcoal : m.fabric, .055);
  back.rotation.x = -.08;
  cylinder(g, .045, .045, .67, 0, .38, -.67, m.metal);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    const spoke = box(g, .5, .045, .045, Math.sin(a) * .21, .08, -.67 + Math.cos(a) * .21, m.metal);
    spoke.rotation.y = a;
  }
}

function meeting(root: THREE.Group, m: OfficeMaterials) {
  cylinder(root, .95, .95, .065, -6.35, 1.11, -1.35, m.glass, 24);
  cylinder(root, .33, .4, 1.03, -6.35, .55, -1.35, m.brass, 16);
  for (const [x, z, angle] of [[-7.3, -1.35, 1.57], [-5.4, -1.35, -1.57], [-6.35, -.18, 0]] as const) {
    cylinder(root, .31, .31, .1, x, .63, z, m.fabric);
    const back = box(root, .66, .66, .11, x, .98, z + .32, m.cream);
    back.rotation.y = angle;
    cylinder(root, .035, .035, .58, x, .31, z, m.metal);
  }
  foliage(root, m, -6.35, 1.14, -1.35, .35);
  box(root, 2.8, .04, .05, -6.35, .04, .7, m.brass);
}

function coffee(root: THREE.Group, m: OfficeMaterials) {
  softBox(root, 2.75, 1.14, .84, 6.5, .57, -3.38, m.walnut, .065);
  softBox(root, 2.83, .12, .94, 6.5, 1.2, -3.38, m.travertine, .055);
  box(root, 2.58, .055, .075, 6.5, .42, -2.92, m.glow);
  box(root, .69, .54, .52, 5.63, 1.55, -3.42, m.metal);
  box(root, .53, .06, .34, 5.63, 1.82, -3.19, m.brass);
  cylinder(root, .13, .13, .14, 5.63, 1.34, -3.13, m.white);
  for (const x of [6.25, 6.65, 7.05]) cylinder(root, .1, .08, .16, x, 1.36, -3.13, m.white);
  for (const x of [5.75, 6.75, 7.65]) {
    cylinder(root, .28, .28, .08, x, .73, -2.35, m.charcoal);
    cylinder(root, .045, .045, .66, x, .38, -2.35, m.brass);
    cylinder(root, .24, .24, .035, x, .07, -2.35, m.metal);
  }
  for (const x of [5.85, 7.1]) {
    cylinder(root, .012, .012, .65, x, 3.3, -3.0, m.metal);
    cylinder(root, .1, .28, .27, x, 2.84, -3.0, m.metal, 16);
    cylinder(root, .21, .21, .018, x, 2.69, -3.0, m.glow, 16);
  }
  softBox(root, 2.66, .45, .76, 6.46, .4, 1.46, m.fabric, .09);
  softBox(root, 2.66, .58, .18, 6.46, .77, 1.02, m.fabric, .07);
  softBox(root, .18, .62, .75, 5.03, .7, 1.46, m.fabric, .07);
  softBox(root, .18, .62, .75, 7.88, .7, 1.46, m.fabric, .07);
  softBox(root, .58, .32, .16, 6.08, .82, 1.44, m.forest, .055);
  softBox(root, .58, .32, .16, 6.85, .82, 1.44, m.brass, .055);
  cylinder(root, .48, .48, .075, 6.48, .46, 2.55, m.walnut, 20);
  cylinder(root, .07, .07, .4, 6.48, .24, 2.55, m.brass);
  box(root, .35, .04, .25, 6.28, .52, 2.53, m.cream);
  box(root, .35, .04, .25, 6.29, .56, 2.55, m.forest);
  foliage(root, m, 6.8, .5, 2.55, .24);
  box(root, 3.25, .02, 2.35, 6.48, .03, 1.85, m.fabric);
  foliage(root, m, 5.11, .04, 2.7, .75);
}

function screen(root: THREE.Group, m: OfficeMaterials, textures: THREE.Texture[], title: string, x: number, y: number, z: number, width: number) {
  const height = width * .57;
  box(root, width + .15, height + .15, .11, x, y, z, m.metal);
  const texture = dashboardTexture(title); textures.push(texture);
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), new THREE.MeshBasicMaterial({ map: texture }));
  mesh.position.set(x, y, z + .068); root.add(mesh);
}

export function createOfficeLayout(root: THREE.Group, m: OfficeMaterials, textures: THREE.Texture[]) {
  box(root, 16.4, .36, 9.9, 0, -.22, -.46, m.travertine);
  box(root, 16.6, .13, 10.1, 0, -.48, -.46, m.walnutDark);
  box(root, 16.05, .025, 9.48, 0, -.025, -.46, m.stone);
  const studs = new THREE.InstancedMesh(new THREE.CylinderGeometry(.055, .055, .025, 10), m.travertine, 500);
  const transform = new THREE.Object3D(); let count = 0;
  for (let x = -7.7; x < 7.8; x += .55) for (let z = -4.95; z < 4.1; z += .65) {
    transform.position.set(x, .005, z); transform.updateMatrix(); studs.setMatrixAt(count++, transform.matrix);
  }
  studs.count = count; studs.instanceMatrix.needsUpdate = true; root.add(studs);
  // A compact open cutaway: back wall, low side walls and a slender roof frame.
  box(root, 16.2, 3.75, .2, 0, 1.87, -5.29, m.walnutDark);
  for (const x of [-8.02, 8.02]) {
    box(root, .09, .38, 6.8, x, .19, -1.8, m.cream);
    box(root, .045, .035, 6.8, x, .42, -1.8, m.brass);
  }
  box(root, 16.5, .22, .32, 0, 3.8, -5.3, m.metal);
  for (const x of [-8.05, 8.05]) box(root, .17, .15, 2.5, x, 3.8, -4.02, m.metal);
  box(root, 16.1, .045, .08, 0, 3.63, -5.13, m.glow);
  for (const x of [-6.8, -4.2, -1.7, .8, 3.3, 5.8]) {
    cylinder(root, .12, .15, .12, x, 3.66, -4.65, m.metal);
    cylinder(root, .075, .075, .012, x, 3.59, -4.65, m.glow);
  }
  // Walnut slats, books, art and a three-dimensional brand panel.
  box(root, 7.6, 3.35, .06, -.1, 1.85, -5.16, m.walnut);
  for (let i = 0; i < 34; i++) box(root, .065, 3.35, .09, -3.76 + i * .22, 1.85, -5.1, m.walnutDark);
  for (const x of [-7.2, -5.45, 5.22, 7.0]) {
    box(root, 1.26, 2.3, .31, x, 1.56, -4.95, m.walnutDark);
    for (const y of [.62, 1.27, 1.92, 2.56]) box(root, 1.2, .055, .36, x, y, -4.77, m.brass);
    for (const y of [.59, 1.24, 1.89]) box(root, 1.17, .018, .045, x, y, -4.57, m.glow);
    for (let i = 0; i < 6; i++) box(root, .09, .27 + (i % 3) * .08, .19, x - .42 + i * .16, .8, -4.73, i % 2 ? m.cream : m.forest);
  }
  // Gold objects, ceramics and more greenery soften the long rear wall.
  for (const x of [-7.2, 7.0]) {
    const globe = new THREE.Mesh(new THREE.SphereGeometry(.17, 12, 8), m.brass);
    globe.position.set(x, 2.83, -4.74); globe.castShadow = true; root.add(globe);
    cylinder(root, .07, .09, .09, x, 2.65, -4.74, m.metal);
  }
  foliage(root, m, -4.6, 0, -4.14, .82);
  foliage(root, m, 4.65, 0, -4.1, .92);
  const brand = brandTexture(); textures.push(brand);
  box(root, 2.85, 1.05, .12, -.2, 2.83, -4.94, m.charcoal);
  const sign = new THREE.Mesh(new THREE.PlaneGeometry(2.68, .9), new THREE.MeshBasicMaterial({ map: brand }));
  sign.position.set(-.2, 2.83, -4.867); root.add(sign);
  screen(root, m, textures, 'CUMPLIMIENTO SG-SST', -6.42, 2.9, -4.73, 2.0);
  screen(root, m, textures, 'SEGUIMIENTO PHVA', 4.46, 2.92, -4.74, 2.37);
  const cupCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(6.06, 2.69, -4.87), new THREE.Vector3(6.12, 2.43, -4.87),
    new THREE.Vector3(6.56, 2.43, -4.87), new THREE.Vector3(6.65, 2.69, -4.87),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(cupCurve, 18, .028, 7, false), m.glow));
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.13, .025, 7, 14, Math.PI * 1.3), m.glow);
  handle.position.set(6.71, 2.56, -4.87); handle.rotation.z = -.55; root.add(handle);
  for (const x of [6.16, 6.37, 6.58]) {
    const steam = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 2.79, -4.87), new THREE.Vector3(x + .04, 2.93, -4.87),
      new THREE.Vector3(x, 3.08, -4.87),
    ]), 12, .013, 5, false), m.glow);
    root.add(steam);
  }
  for (const x of [-7.64, -4.8, 4.85, 7.7]) foliage(root, m, x, 2.8, -4.82, .52, true);
  desks.forEach(d => workstation(root, m, d.x, d.z, d.executive, d.name));
  for (const x of [-1.73, 1.73]) {
    box(root, .045, 1.2, 1.25, x, 1.46, 1.32, m.glass);
    box(root, .055, .035, 1.29, x, 2.08, 1.32, m.brass);
    for (const z of [.72, 1.92]) box(root, .045, 1.25, .045, x, 1.46, z, m.metal);
  }
  meeting(root, m); coffee(root, m);
  // Glass front railing with low planted bays keeps faces and keyboards visible.
  for (const [x, width] of [[-6.35, 2.3], [-2.1, 2.3], [2.1, 2.3], [6.35, 2.3]] as const) {
    box(root, width, .38, .48, x, .21, 4.07, m.cream);
    box(root, width - .16, .035, .39, x, .42, 4.07, m.soil);
    for (let i = 0; i < 7; i++) planterBush(root, m, x - width * .42 + i * width * .14, 4.07, i + Math.round(x * 2));
  }
  for (const x of [-7.85, -4.85, -1.15, 1.15, 4.85, 7.85]) {
    box(root, .08, .9, .08, x, .52, 4.25, m.brass);
    box(root, .13, .11, .13, x, .99, 4.25, m.glow);
  }
  box(root, 15.72, .055, .07, 0, .98, 4.25, m.brass);
  box(root, 15.65, .76, .025, 0, .57, 4.22, m.glass);
  foliage(root, m, -7.5, 0, 2.85, .75);
  foliage(root, m, 7.5, 0, -1.05, 1.15);
}
