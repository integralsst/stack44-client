import { officeSlab } from './campusArchitecture';
import * as THREE from 'three';
import sisLogoUrl from '../../../../referencias-diseno/sis-logo.png';
import { box, cylinder, softBox, type OfficeMaterials } from './miniOfficeMaterials';
import { logoPanelTexture, nameplateTexture, dashboardTexture } from './miniOfficeScreens';

export const desks = [
  { name: 'Jesús', x: -2.55, z: -3.0, executive: true },
  { name: 'Cristina', x: 2.55, z: -3.0, executive: true },
  { name: 'Apolo', x: -4.05, z: 1.55, executive: false },
  { name: 'Zeus', x: 0, z: 1.55, executive: false },
  { name: 'Hera', x: 4.05, z: 1.55, executive: false },
  { name: 'Secretaria', x: -8.35, z: 3.55, executive: false },
] as const;

export type OfficeFixtures = { printerPaper: THREE.Group; deliveredPaper: THREE.Group; printerLight: THREE.Mesh };

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

function workstation(root: THREE.Group, m: OfficeMaterials, textures: THREE.Texture[], x: number, z: number, executive: boolean, name: string) {
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
  const plaqueY = executive ? .88 : .62;
  const plaqueZ = executive ? .675 : .745;
  const plaqueX = name === 'Cristina' ? -.58 : 0;
  softBox(g, 1.26, .32, .045, plaqueX, plaqueY, plaqueZ, m.brass, .018);
  const nameTexture = nameplateTexture(name); textures.push(nameTexture);
  const plaque = new THREE.Mesh(new THREE.PlaneGeometry(1.18, .27), new THREE.MeshBasicMaterial({ map: nameTexture }));
  plaque.position.set(plaqueX, plaqueY, plaqueZ + .027); g.add(plaque);
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
  softBox(root, 3.1, .025, 4.85, -6.35, .02, -2.4, m.fabric, .012);
  box(root, 3.12, .025, .04, -6.35, .045, -4.82, m.brass);
  box(root, 3.12, .025, .04, -6.35, .045, .02, m.brass);
  cylinder(root, 1.11, 1.11, .075, -6.35, 1.13, -1.5, m.glass, 32);
  const edge = new THREE.Mesh(new THREE.TorusGeometry(1.11, .027, 8, 40), m.brass);
  edge.rotation.x = Math.PI / 2; edge.position.set(-6.35, 1.14, -1.5); root.add(edge);
  cylinder(root, .31, .42, 1.04, -6.35, .57, -1.5, m.brass, 16);
  const chairs = [
    [-7.63, -1.5, Math.PI / 2], [-5.07, -1.5, -Math.PI / 2],
    [-6.35, -.02, Math.PI], [-6.35, -3.02, 0],
  ] as const;
  for (const [x, z, angle] of chairs) {
    const seat = new THREE.Group(); seat.position.set(x, 0, z); seat.rotation.y = angle; root.add(seat);
    softBox(seat, .65, .13, .61, 0, .66, 0, m.cream, .055);
    const back = softBox(seat, .7, .78, .13, 0, 1.05, .37, m.fabric, .06);
    back.rotation.x = -.1;
    cylinder(seat, .047, .047, .58, 0, .31, 0, m.metal);
    for (const s of [-1, 1]) box(seat, .4, .04, .04, s * .19, .1, 0, m.metal);
  }
  foliage(root, m, -6.35, 1.17, -1.5, .35);
  box(root, .68, .045, .43, -5.9, 1.2, -1.73, m.charcoal);
  for (let i = 0; i < 3; i++) box(root, .43, .012, .05, -5.9, 1.23, -1.85 + i * .1, i === 0 ? m.brass : m.leaf);
  foliage(root, m, -7.65, .02, -4.02, .6);
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
  mesh.position.set(x, y, z + .068); mesh.userData.officeAction = 'dashboard'; root.add(mesh);
}

export function createOfficeLayout(root: THREE.Group, m: OfficeMaterials, textures: THREE.Texture[], signal: AbortSignal): OfficeFixtures {
  officeSlab(root,20.25,12,-.4,.36,m.travertine);
  officeSlab(root,20.45,12.2,-.545,.13,m.metal);
  officeSlab(root,19.95,11.66,-.0375,.025,m.stone);
  const studs = new THREE.InstancedMesh(new THREE.CylinderGeometry(.055, .055, .025, 10), m.travertine, 900);
  const transform = new THREE.Object3D(); let count = 0;
  for (let x = -9.75; x < 9.8; x += .55) for (let z = -6.05; z < 5.15; z += .65) {
    if (Math.abs(x)<1.65 && z>3.45) continue;
    transform.position.set(x, .005, z); transform.updateMatrix(); studs.setMatrixAt(count++, transform.matrix);
  }
  studs.count = count; studs.instanceMatrix.needsUpdate = true; root.add(studs);
  const joints=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m.fabric,70);
  let jointCount=0;
  for(let x=-9.5;x<10;x+=.85) {
    const depth=Math.abs(x)<1.7?9.55:11.6;
    transform.position.set(x,-.006,Math.abs(x)<1.7?-1.25:-.48); transform.scale.set(.012,.004,depth); transform.updateMatrix(); joints.setMatrixAt(jointCount++,transform.matrix);
  }
  for(let z=-5.9;z<5.3;z+=.72) {
    if(z>3.5) for(const x of [-5.8,5.8]) { transform.position.set(x,-.006,z);transform.scale.set(8.3,.004,.012);transform.updateMatrix();joints.setMatrixAt(jointCount++,transform.matrix); }
    else { transform.position.set(0,-.006,z);transform.scale.set(19.8,.004,.012);transform.updateMatrix();joints.setMatrixAt(jointCount++,transform.matrix); }
  }
  joints.count=jointCount; joints.receiveShadow=true; root.add(joints);
  // A compact open cutaway: back wall, low side walls and a slender roof frame.
  box(root, 20.0, 3.75, .2, 0, 1.87, -6.49, m.walnutDark);
  for (const x of [-9.98, 9.98]) {
    box(root, .09, .38, 8.0, x, .19, -2.2, m.cream);
    box(root, .045, .035, 8.0, x, .42, -2.2, m.brass);
  }
  box(root, 20.2, .22, .32, 0, 3.8, -6.5, m.metal);
  for (const x of [-10.02, 10.02]) box(root, .17, .15, 2.5, x, 3.8, -5.22, m.metal);
  box(root, 19.9, .045, .08, 0, 3.63, -6.33, m.glow);
  for (const x of [-8.5, -5.8, -3.1, -.4, 2.3, 5, 7.7]) {
    cylinder(root, .12, .15, .12, x, 3.66, -5.85, m.metal);
    cylinder(root, .075, .075, .012, x, 3.59, -5.85, m.glow);
  }
  // Walnut slats, books, art and a three-dimensional brand panel.
  box(root, 7.6, 3.35, .06, -.1, 1.85, -6.36, m.walnut);
  for (let i = 0; i < 34; i++) box(root, .065, 3.35, .09, -3.76 + i * .22, 1.85, -6.3, m.walnutDark);
  const bookColors = [0x315f4b, 0x375774, 0xf0ece3, 0xc7b79d, 0xc5a366, 0xa45d46, 0x777c7e, 0x25282c];
  const books = bookColors.map(color => new THREE.MeshStandardMaterial({ color, roughness: .76 }));
  for (const x of [-8.9, -6.85, 6.9, 8.9]) {
    box(root, 1.47, 2.68, .31, x, 1.5, -6.15, m.walnutDark);
    for (const y of [.52, 1.17, 1.82, 2.47]) box(root, 1.4, .055, .36, x, y, -5.97, m.brass);
    for (const y of [.49, 1.14, 1.79]) box(root, 1.37, .018, .045, x, y, -5.77, m.glow);
    for (let shelf = 0; shelf < 3; shelf++) for (let i = 0; i < 8; i++) {
      const height = .29 + ((i + shelf) % 3) * .07;
      box(root, .105 + (i % 2) * .02, height, .19, x - .51 + i * .145, .55 + shelf * .65 + height / 2, -5.92, books[(i * 3 + shelf * 5) % books.length]);
    }
  }
  // Gold objects, ceramics and more greenery soften the long rear wall.
  for (const x of [-8.9, 8.9]) {
    const globe = new THREE.Mesh(new THREE.SphereGeometry(.17, 12, 8), m.brass);
    globe.position.set(x, 3.04, -5.94); globe.castShadow = true; root.add(globe);
    cylinder(root, .07, .09, .09, x, 2.87, -5.94, m.metal);
  }
  foliage(root, m, -4.85, 0, -5.48, .82);
  foliage(root, m, 4.85, 0, -5.48, .92);
  const brandPanels = [
    { x: .45, url: sisLogoUrl, crop: [0, 0, 1, 1] as [number, number, number, number], width: 2.22, height: 1.61 },
  ];
  for (const panel of brandPanels) {
    box(root, panel.width + .08, panel.height + .08, .12, panel.x, 2.84, -6.14, m.brass);
    box(root, panel.width, panel.height, .018, panel.x, 2.84, -6.068, m.walnutDark);
    const material = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
    const initial = logoPanelTexture(panel.url, panel.crop, signal, loaded => {
      textures.push(loaded); material.map = loaded; material.needsUpdate = true;
    });
    textures.push(initial); material.map = initial;
    const imageSide = Math.min(panel.width - .18, panel.height - .15);
    const logo = new THREE.Mesh(new THREE.PlaneGeometry(imageSide, imageSide), material);
    logo.position.set(panel.x, 2.84, -6.052); root.add(logo);
  }
  screen(root, m, textures, 'CUMPLIMIENTO SG-SST', -6.05, 2.9, -5.94, 2.1);
  screen(root, m, textures, 'SEGUIMIENTO PHVA', 5.28, 2.92, -5.94, 2.42);
  const cupCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(7.4, 2.69, -6.07), new THREE.Vector3(7.46, 2.43, -6.07),
    new THREE.Vector3(7.9, 2.43, -6.07), new THREE.Vector3(7.99, 2.69, -6.07),
  ]);
  root.add(new THREE.Mesh(new THREE.TubeGeometry(cupCurve, 18, .028, 7, false), m.glow));
  const handle = new THREE.Mesh(new THREE.TorusGeometry(.13, .025, 7, 14, Math.PI * 1.3), m.glow);
  handle.position.set(8.05, 2.56, -6.07); handle.rotation.z = -.55; root.add(handle);
  for (const x of [7.5, 7.71, 7.92]) {
    const steam = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
      new THREE.Vector3(x, 2.79, -6.07), new THREE.Vector3(x + .04, 2.93, -6.07),
      new THREE.Vector3(x, 3.08, -6.07),
    ]), 12, .013, 5, false), m.glow);
    root.add(steam);
  }
  for (const x of [-9.56, -4.75, 4.7, 9.55]) foliage(root, m, x, 2.8, -5.99, .52, true);
  // Shared material zones make the management pair and three-person team read as departments.
  softBox(root, 9.55, .025, 3.72, 0, .018, -3.22, m.fabric, .012);
  for (const x of [-4.78, 4.78]) {
    box(root, .05, 1.12, 2.95, x, .62, -3.18, m.glass);
    for (const z of [-4.63, -1.72]) box(root, .07, 1.18, .07, x, .62, z, m.brass);
    box(root, .065, .035, 2.97, x, 1.19, -3.18, m.brass);
  }
  box(root, 11.5, .02, 3.34, 0, .006, 1.55, m.travertine);
  for (const x of [-5.74, 5.74]) box(root, .04, .024, 3.34, x, .02, 1.55, m.brass);
  desks.forEach(d => workstation(root, m, textures, d.x, d.z, d.executive, d.name));
  for (const x of [-2.03, 2.03]) {
    box(root, .045, 1.2, 1.25, x, 1.46, 1.52, m.glass);
    box(root, .055, .035, 1.29, x, 2.08, 1.52, m.brass);
    for (const z of [.92, 2.12]) box(root, .045, 1.25, .045, x, 1.46, z, m.metal);
  }
  const meetingRoom = new THREE.Group(); meetingRoom.position.set(-1.72, 0, -.38); root.add(meetingRoom); meeting(meetingRoom, m);
  meetingRoom.userData.officeAction = 'meeting';
  const cafe = new THREE.Group(); cafe.position.set(1.72, 0, -.38); root.add(cafe); coffee(cafe, m);
  cafe.userData.officeAction = 'coffee';
  // Printer near reception. The output sheet and the delivered copy are animated independently.
  const printStation = new THREE.Group(); printStation.position.set(-9.05, 0, .87); root.add(printStation);
  softBox(printStation, 1.5, .89, .78, 0, .45, 0, m.walnutDark, .055);
  softBox(printStation, 1.55, .08, .84, 0, .94, 0, m.travertine, .03);
  softBox(printStation, 1.02, .52, .61, 0, 1.25, -.03, m.metal, .055);
  box(printStation, .86, .035, .52, 0, 1.52, -.04, m.stone);
  box(printStation, .69, .08, .11, 0, 1.19, .29, m.charcoal);
  box(printStation, .25, .055, .012, -.23, 1.41, .278, m.glow);
  for (const x of [.12, .22, .32]) box(printStation, .035, .035, .012, x, 1.41, .278, m.brass);
  const printerLight = box(printStation, .11, .025, .01, .39, 1.41, .278, m.leafLight);
  const printerPaper = new THREE.Group(); printerPaper.position.set(0, 1.13, .39); printStation.add(printerPaper);
  for (let i = 0; i < 3; i++) box(printerPaper, .6, .008, .39, 0, i * .012, i * .017, m.white);
  for (let i = 0; i < 3; i++) box(printerPaper, .27 - i * .04, .004, .009, -.08, .04, -.1 + i * .06, m.forest);
  printerPaper.visible = false;
  printStation.userData.officeAction = 'printer';
  const deliveredPaper = new THREE.Group(); deliveredPaper.position.set(-3.33, 1.47, -2.47); root.add(deliveredPaper);
  box(deliveredPaper, .5, .012, .36, 0, 0, 0, m.forest);
  for (let i = 0; i < 3; i++) box(deliveredPaper, .44, .008, .31, 0, .016 + i * .012, i * .012, m.white);
  deliveredPaper.visible = false;
  // The conference room is framed by low glazing, leaving its table and screen visible.
  box(root, .045, 1.45, 2.95, -6.75, .77, -2.92, m.glass);
  for (const z of [-4.4, -1.44]) box(root, .07, 1.5, .07, -6.75, .78, z, m.brass);
  box(root, .09, .035, 2.98, -6.75, 1.53, -2.92, m.brass);
  screen(root, m, textures, 'SALA DE JUNTAS · PHVA', -9.05, 2.05, -5.94, 1.58);
  // Glass front railing with low planted bays keeps faces and keyboards visible.
  for (const [x, width] of [[-8.65, 2.25], [-4.3, 2.25], [4.3, 2.25], [8.65, 2.25]] as const) {
    box(root, width, .38, .48, x, .21, 5.21, m.cream);
    box(root, width - .16, .035, .39, x, .42, 5.21, m.soil);
    for (let i = 0; i < 7; i++) planterBush(root, m, x - width * .42 + i * width * .14, 5.21, i + Math.round(x * 2));
  }
  for (const x of [-9.85, -6.6, -3.3, 3.3, 6.6, 9.85]) {
    box(root, .08, .9, .08, x, .52, 5.4, m.brass);
    box(root, .13, .11, .13, x, .99, 5.4, m.glow);
  }
  for (const x of [-6.6, 6.6]) {
    box(root, 6.5, .055, .07, x, .98, 5.4, m.brass);
    box(root, 6.45, .76, .025, x, .57, 5.37, m.glass);
  }
  foliage(root, m, -9.2, 0, 2.9, .75);
  foliage(root, m, 9.2, 0, -1.05, 1.15);

  return { printerPaper, deliveredPaper, printerLight };
}
