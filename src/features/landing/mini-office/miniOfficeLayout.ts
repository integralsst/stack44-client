import * as THREE from 'three';
import { box, cylinder, type OfficeMaterials } from './miniOfficeMaterials';
import { dashboardTexture } from './miniOfficeScreens';

export const desks = [
  { name: 'Jesús', x: -5.05, z: -2.5, executive: true },
  { name: 'Cristina', x: -1.85, z: -2.5, executive: true },
  { name: 'Apolo', x: 1.35, z: -2.5, executive: false },
  { name: 'Zeus', x: -5.05, z: 1.45, executive: false },
  { name: 'Hera', x: -1.85, z: 1.45, executive: false },
] as const;

function plant(root: THREE.Group, m: OfficeMaterials, x: number, z: number, scale = 1) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(scale); root.add(g);
  cylinder(g, .23, .18, .38, 0, .24, 0, m.cream);
  cylinder(g, .18, .18, .04, 0, .45, 0, m.soil);
  box(g, .055, .74, .055, 0, .83, 0, m.forest);
  for (let i = 0; i < 7; i++) {
    const a = i * Math.PI * 2 / 7;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(.27, 8, 6), m.leaf);
    leaf.scale.set(.45, 1.15, .38); leaf.position.set(Math.sin(a) * .23, .94 + (i % 3) * .16, Math.cos(a) * .23);
    leaf.rotation.z = Math.sin(a) * .55; leaf.rotation.x = Math.cos(a) * .55; leaf.castShadow = true; g.add(leaf);
  }
}

function workstation(root: THREE.Group, m: OfficeMaterials, x: number, z: number, executive: boolean, name: string) {
  const g = new THREE.Group(); g.position.set(x, 0, z); root.add(g);
  const top = executive ? m.glass : m.walnut;
  box(g, 2.65, .13, 1.55, 0, 1.37, 0, top);
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    box(g, .075, 1.28, .075, sx * 1.13, .68, sz * .62, executive ? m.brass : m.metal);
  box(g, 2.4, .06, .07, 0, 1.26, -.69, m.brass);
  // Facing +X: the lit plane is the -X face of the display.
  box(g, .09, .78, 1.05, .66, 2.02, -.11, m.metal);
  box(g, .012, .64, .91, .605, 2.02, -.11, m.screen);
  for (let i = 0; i < 4; i++) box(g, .014, .055, .13 + i * .13, .592, 2.13 - i * .15, -.16, i === 0 ? m.brass : m.forest);
  box(g, .09, .26, .08, .67, 1.57, -.11, m.metal);
  box(g, .35, .025, .35, .67, 1.43, -.11, m.metal);
  box(g, .35, .022, .72, -.23, 1.46, -.09, m.metal);
  for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++)
    box(g, .035, .009, .075, -.35 + i * .12, 1.478, -.31 + j * .18, m.white);
  cylinder(g, .055, .055, .018, -.22, 1.47, .44, m.metal);
  box(g, .3, .018, .42, .12, 1.46, .52, m.cream);
  box(g, .25, .012, .25, 1.02, 1.45, .43, executive ? m.brass : m.forest);
  cylinder(g, .075, .075, .22, 1.02, 1.57, .43, m.cream);
  if (executive) {
    cylinder(g, .12, .12, .025, 1.05, 1.48, -.49, m.brass);
    cylinder(g, .025, .025, .43, 1.05, 1.7, -.49, m.brass);
    const shade = box(g, .38, .075, .28, .92, 1.94, -.49, m.brass);
    shade.rotation.z = -.2;
  }
  if (name === 'Apolo') {
    cylinder(g, .17, .19, .12, 1.03, 1.5, -.46, m.brass);
    box(g, .34, .05, .32, 1.03, 1.58, -.46, m.brass);
  } else if (name === 'Zeus') {
    box(g, .33, .025, .43, 1.01, 1.46, -.42, m.forest);
    box(g, .18, .015, .025, 1.01, 1.48, -.59, m.brass);
  } else if (name === 'Hera') {
    for (let i = 0; i < 3; i++) box(g, .24, .055, .31, 1.02, 1.49 + i * .058, -.48, i === 1 ? m.brass : m.cream);
  }
  // Chair is behind the keyboard and its seat remains below the desk.
  cylinder(g, .42, .42, .08, -1.05, .77, 0, m.metal);
  box(g, .13, .78, .9, -1.52, 1.16, 0, executive ? m.forest : m.charcoal);
  cylinder(g, .045, .045, .65, -1.05, .39, 0, m.metal);
  for (let i = 0; i < 5; i++) {
    const a = i * Math.PI * 2 / 5;
    const arm = box(g, .52, .045, .045, -1.05 + Math.cos(a) * .22, .1, Math.sin(a) * .22, m.metal);
    arm.rotation.y = -a;
  }
}

export function createOfficeLayout(root: THREE.Group, m: OfficeMaterials, textures: THREE.Texture[]) {
  box(root, 15.5, .38, 10.2, 0, -.22, -.7, m.travertine);
  box(root, 15.7, .12, 10.4, 0, -.47, -.7, m.walnutDark);
  box(root, 15.2, .025, 9.85, 0, .012, -.7, m.cream);
  const studs = new THREE.InstancedMesh(new THREE.CylinderGeometry(.045, .045, .025, 8), m.cream, 240);
  const studTransform = new THREE.Object3D(); let studCount = 0;
  for (let x = -7.1; x < 7.15; x += .7) for (let z = -5.05; z < 3.7; z += .8) {
    studTransform.position.set(x, .044, z); studTransform.updateMatrix();
    studs.setMatrixAt(studCount++, studTransform.matrix);
  }
  studs.count = studCount; studs.instanceMatrix.needsUpdate = true; root.add(studs);
  // Two low rear walls and a glass band keep the interior open.
  box(root, 15.3, 2.2, .17, 0, 1.1, -5.55, m.cream);
  box(root, .17, 2.2, 9.8, -7.57, 1.1, -.7, m.cream);
  box(root, 15.4, .09, .22, 0, 2.22, -5.55, m.walnut);
  for (const x of [-5.7, -2.5, .7, 3.9, 7.1]) box(root, .07, 1.4, .08, x, 1.45, -5.42, m.metal);
  box(root, 12.6, 1.35, .04, -.45, 1.45, -5.41, m.glass);
  box(root, 15.2, .15, .15, 0, .075, 4.12, m.walnut);
  box(root, .12, 1.1, 2.5, 7.49, .56, 2.55, m.glass);
  // Floor inset lines and a compact rug.
  for (let x = -6.5; x < 7; x += 1.7) box(root, .012, .007, 9.5, x, .03, -.7, m.travertine);
  box(root, 3.1, .025, 3.15, 4.55, .04, 1.55, m.forest);
  desks.forEach(d => workstation(root, m, d.x, d.z, d.executive, d.name));
  // Compact meeting room at the front right.
  box(root, 2.35, .08, 1.55, 4.7, 1.19, 1.55, m.glass);
  for (const x of [3.72, 5.68]) for (const z of [1.02, 2.08])
    cylinder(root, .035, .035, 1.12, x, .6, z, m.brass);
  for (const [x, z] of [[3.28, 1.48], [6.1, 1.48], [4.7, 2.85]]) {
    cylinder(root, .32, .32, .1, x, .55, z, m.charcoal);
    box(root, .12, .62, .55, x, .91, z + .26, m.cream);
  }
  // Coffee counter and lounge.
  box(root, 3.45, 1.13, .74, 5.55, .56, -3.61, m.walnut);
  box(root, 3.55, .1, .84, 5.55, 1.18, -3.61, m.travertine);
  box(root, .66, .57, .52, 4.55, 1.51, -3.69, m.metal);
  box(root, .4, .08, .28, 4.55, 1.77, -3.37, m.brass);
  for (const x of [5.55, 5.96, 6.37]) cylinder(root, .09, .075, .16, x, 1.33, -3.35, m.white);
  for (const x of [4.8, 6.15]) {
    cylinder(root, .3, .3, .07, x, .68, -2.53, m.charcoal);
    cylinder(root, .055, .055, .6, x, .34, -2.53, m.metal);
  }
  box(root, 2.35, .48, .8, 5.52, .43, -1.15, m.forest);
  box(root, 2.35, .64, .17, 5.52, .78, -1.53, m.forest);
  box(root, .7, .07, .62, 5.5, .58, -.12, m.walnut);
  // Rear shelving and architectural details.
  for (const x of [-6.35, -3.15, .05]) {
    box(root, .85, 1.6, .28, x, 1.2, -5.04, m.walnutDark);
    for (const y of [.66, 1.18, 1.72]) box(root, .82, .055, .32, x, y, -4.84, m.brass);
    for (let i = 0; i < 5; i++) box(root, .075, .25 + (i % 3) * .07, .19, x - .3 + i * .15, .83, -4.83, i % 2 ? m.cream : m.forest);
  }
  const dash = dashboardTexture('OFICINA SG-SST'); textures.push(dash);
  box(root, 2.7, 1.58, .08, 4.5, 1.42, -5.29, m.metal);
  const tv = new THREE.Mesh(new THREE.PlaneGeometry(2.52, 1.42), new THREE.MeshBasicMaterial({ map: dash }));
  tv.position.set(4.5, 1.42, -5.235); root.add(tv);
  // Framed art and perimeter greenery.
  box(root, 1.1, .7, .06, 1.05, 1.33, -5.29, m.walnutDark);
  box(root, .87, .48, .01, 1.05, 1.33, -5.245, m.forest);
  for (const [x, z, s] of [[-6.85, 3.45, .8], [-3.55, 3.5, .65], [2.05, 3.55, .65], [7.0, -4.8, .95], [3.35, -4.95, .7]] as const) plant(root, m, x, z, s);
  box(root, 3.1, .33, .46, -5.75, .18, 3.88, m.walnut);
  for (let i = 0; i < 8; i++) plant(root, m, -6.94 + i * .36, 3.88, .36);
}
