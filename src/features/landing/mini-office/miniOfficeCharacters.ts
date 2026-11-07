import {createLocomotion,type Locomotion} from './miniOfficeLocomotion';
import * as THREE from 'three';
import { box, cylinder, type OfficeMaterials } from './miniOfficeMaterials';
import { desks } from './miniOfficeLayout';

export type Behavior = 'WORKING' | 'SITTING' | 'STANDING_UP' | 'WALKING' | 'TALKING' | 'MEETING' | 'RETURNING_TO_DESK' | 'COFFEE_BREAK' | 'PRINTING' | 'DELIVERING' | 'GREETING';
export type Character = {
  name: string; root: THREE.Group; hip: THREE.Group; head: THREE.Group;
  leftThigh: THREE.Group; rightThigh: THREE.Group; leftShin: THREE.Group; rightShin: THREE.Group;
  leftArm: THREE.Group; rightArm: THREE.Group; leftForearm: THREE.Group; rightForearm: THREE.Group;
  coffeeCup: THREE.Group; documents: THREE.Group; torso: THREE.Group; leftFoot: THREE.Group; rightFoot: THREE.Group; locomotion:Locomotion; animationTime:number|null; actionPhase:number;
  desk: { x: number; z: number }; spaceScale: { x: number; z: number }; state: Behavior;
};

const style = [
  { name: 'Jesús', jacket: 0x16243b, shirt: 0xf1eee9, pants: 0x172237, hair: 0x151a20, skin: 0xdba476, glasses: true, hairType: 0 },
  { name: 'Cristina', jacket: 0xd9c5ab, shirt: 0x2c2928, pants: 0x3b3433, hair: 0x6d3924, skin: 0xe8b589, glasses: false, hairType: 1 },
  { name: 'Apolo', jacket: 0x2c3741, shirt: 0xf1efea, pants: 0x282b32, hair: 0x38271e, skin: 0xc99167, glasses: false, hairType: 2 },
  { name: 'Zeus', jacket: 0xe9e9e4, shirt: 0x62839c, pants: 0x334157, hair: 0x1c2026, skin: 0xc58f68, glasses: true, hairType: 3 },
  { name: 'Hera', jacket: 0x24523e, shirt: 0xdcd4c8, pants: 0x263c33, hair: 0x211b1b, skin: 0xd7a075, glasses: false, hairType: 4 },
  { name: 'Secretaria', jacket: 0x536b78, shirt: 0xf5ede0, pants: 0x263b49, hair: 0x3f2825, skin: 0xe4ae84, glasses: false, hairType: 5 },
] as const;

function oval(parent: THREE.Object3D, mat: THREE.Material, x: number, y: number, z: number, sx: number, sy: number, sz: number) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 8), mat);
  mesh.position.set(x, y, z); mesh.scale.set(sx, sy, sz); mesh.castShadow = true; parent.add(mesh); return mesh;
}

function limb(parent: THREE.Group, upperMat: THREE.Material, lowerMat: THREE.Material, skin: THREE.Material, x: number, arm: boolean) {
  const pivot = new THREE.Group(); pivot.position.set(x, arm ? .93 : 0, 0); parent.add(pivot);
  const len = arm ? .38 : .43;
  box(pivot, arm ? .24 : .28, len, arm ? .27 : .33, 0, -len / 2, 0, upperMat);
  const lower = new THREE.Group(); lower.position.y = -len; pivot.add(lower);
  box(lower, arm ? .2 : .25, arm ? .28 : .58, arm ? .22 : .3, 0, arm ? -.14 : -.29, 0, lowerMat);
  if (arm) cylinder(lower, .11, .1, .12, 0, -.33, .02, skin);
  const foot=new THREE.Group();
  if(!arm){foot.position.y=-.61;lower.add(foot);box(foot,.31,.12,.43,0,0,.08,lowerMat);}
  return { pivot, lower, foot };
}

function face(head: THREE.Group, skin: THREE.Material, hair: THREE.Material, m: OfficeMaterials, index: number) {
  // A clean cylindrical toy head with softened rims and printed features.
  cylinder(head, .34, .34, .49, 0, 0, 0, skin, 32);
  for (const y of [-.225, .225]) {
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.318, .024, 8, 32), skin);
    rim.rotation.x = Math.PI / 2; rim.position.y = y; head.add(rim);
  }
  cylinder(head, .13, .13, .09, 0, .285, 0, skin);
  for (const x of [-.13, .13]) {
    oval(head, m.charcoal, x, .045, .346, .033, .044, .008);
    const brow = box(head, .092, .014, .008, x, .155, .338, hair); brow.rotation.z = x < 0 ? -.08 : .08;
  }
  const smile = new THREE.Mesh(
    new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-.095, -.115, .33), new THREE.Vector3(0, -.19, .349), new THREE.Vector3(.095, -.115, .33)
    ), 12, .012, 5, false), m.walnutDark
  ); head.add(smile);
  const blush = new THREE.MeshStandardMaterial({ color: 0xc78d77, roughness: .9 });
  for (const x of [-.235, .235]) oval(head, blush, x, -.09, .265, .032, .018, .006);
  cylinder(head, .35, .34, .14, 0, .285, -.015, hair, 20);
  if (index === 0) {
    for (let i = 0; i < 4; i++) {
      const swoop = oval(head, hair, -.18 + i * .12, .35 + (i % 2) * .025, .13, .14, .105, .18);
      swoop.rotation.z = -.2;
    }
  } else if (index === 1) {
    for (const side of [-1, 1]) for (let i = 0; i < 5; i++)
      oval(head, hair, side * (.29 + i * .012), .2 - i * .17, -.055, .105, .14, .15);
    oval(head, hair, 0, .32, .16, .3, .12, .17);
    oval(head, hair, 0, -.13, -.25, .3, .46, .14);
    for (const x of [-.34, .34]) oval(head, hair, x, -.38, .03, .11, .15, .12);
    for (const x of [-.32, .32]) {
      const earring = new THREE.Mesh(new THREE.TorusGeometry(.038, .011, 6, 12), m.brass);
      earring.position.set(x, -.1, .17); head.add(earring);
    }
  } else if (index === 2) {
    for (let i = 0; i < 24; i++) {
      const angle = i * 2.399;
      oval(head, hair, Math.sin(angle) * .255, .34 + (i % 4) * .055, Math.cos(angle) * .22, .083, .09, .085);
    }
  } else if (index === 3) {
    for (let i = 0; i < 5; i++) {
      const tuft = oval(head, hair, -.22 + i * .11, .38 + (i % 3) * .055, .11, .11, .16, .19);
      tuft.rotation.z = -.33;
    }
  } else if (index === 4) {
    oval(head, hair, 0, .36, -.28, .24, .25, .24);
    oval(head, hair, -.16, .32, .18, .2, .12, .17);
    for (const x of [-.3, .3]) {
      const earring = new THREE.Mesh(new THREE.TorusGeometry(.045, .012, 6, 12), m.brass);
      earring.position.set(x, -.08, .12); head.add(earring);
    }
  } else {
    oval(head, hair, 0, .37, -.21, .31, .14, .22);
    for (const x of [-.25, .25]) oval(head, hair, x, .2, -.08, .11, .25, .14);
    oval(head, hair, 0, .18, -.37, .2, .28, .18);
    for (const x of [-.32, .32]) {
      const earring = new THREE.Mesh(new THREE.TorusGeometry(.03, .009, 6, 12), m.brass);
      earring.position.set(x, -.12, .15); head.add(earring);
    }
  }
}

export function createCharacters(root: THREE.Group, m: OfficeMaterials, spaceScale = { x: 1, z: 1 }, indices?: number[]): Character[] {
  return style.flatMap((s, index) => {
    if (indices && !indices.includes(index)) return [];
    const desk = desks[index]; const figure = new THREE.Group();
    figure.position.set(desk.x * spaceScale.x, 0, (desk.z - .67) * spaceScale.z);
    if (spaceScale.x !== 1) figure.scale.setScalar(.9);
    root.add(figure);
    const jacket = new THREE.MeshStandardMaterial({ color: s.jacket, roughness: .55 });
    const shirt = new THREE.MeshStandardMaterial({ color: s.shirt, roughness: .72 });
    const pants = new THREE.MeshStandardMaterial({ color: s.pants, roughness: .69 });
    const hair = new THREE.MeshStandardMaterial({ color: s.hair, roughness: .64 });
    const skin = new THREE.MeshStandardMaterial({ color: s.skin, roughness: .7 });
    const hip = new THREE.Group(); hip.position.y = .84; figure.add(hip);
    box(hip, .72, .22, .4, 0, .04, 0, pants);
    const upperBody=new THREE.Group();hip.add(upperBody);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(.36, .43, .84, 4), jacket);
    torso.position.y = .57; torso.rotation.y = Math.PI / 4; torso.castShadow = true; upperBody.add(torso);
    box(upperBody, .24, .61, .015, 0, .55, .275, shirt);
    if (index < 2) {
      for (const side of [-1, 1]) {
        const lapel = box(upperBody, .13, .39, .02, side * .18, .7, .284, jacket);
        lapel.rotation.z = side * .29;
      }
    }
    if (index === 0) box(upperBody, .07, .42, .025, 0, .57, .298, m.brass);
    if (index === 3) {
      box(upperBody, .33, .05, .027, 0, .85, .292, m.forest);
      box(upperBody, .08, .13, .025, 0, .4, .29, m.brass);
    }
    if (index === 4) box(upperBody, .05, .42, .03, 0, .57, .294, m.brass);
    if (index === 2) {
      const headset = new THREE.Mesh(new THREE.TorusGeometry(.27, .045, 7, 18, Math.PI), m.charcoal);
      headset.position.set(0, 1.11, .17); headset.rotation.z = Math.PI; upperBody.add(headset);
      for (const x of [-.27, .27]) oval(upperBody, m.charcoal, x, 1.11, .18, .085, .13, .075);
    }
    cylinder(upperBody, .17, .17, .13, 0, 1.04, 0, skin);
    const head = new THREE.Group(); head.position.y = 1.29; upperBody.add(head);
    head.scale.setScalar(1.15);
    face(head, skin, hair, m, index);
    if (s.glasses) {
      for (const x of [-.13, .13]) {
        box(head, .19, .015, .02, x, .128, .352, m.metal);
        box(head, .19, .015, .02, x, -.005, .352, m.metal);
        box(head, .015, .13, .02, x - .095, .061, .352, m.metal);
        box(head, .015, .13, .02, x + .095, .061, .352, m.metal);
      }
      box(head, .055, .018, .02, 0, .067, .356, m.metal);
    }
    const lLeg = limb(hip, pants, pants, skin, -.21, false);
    const rLeg = limb(hip, pants, pants, skin, .21, false);
    const lArm = limb(upperBody, jacket, shirt, skin, -.52, true);
    const rArm = limb(upperBody, jacket, shirt, skin, .52, true);
    const coffeeCup = new THREE.Group(); coffeeCup.position.set(0, -.39, .09); coffeeCup.visible = false;
    rArm.lower.add(coffeeCup);
    cylinder(coffeeCup, .09, .078, .16, 0, .035, 0, m.cream, 16);
    cylinder(coffeeCup, .072, .072, .012, 0, .121, 0, m.walnutDark, 16);
    const cupHandle = new THREE.Mesh(new THREE.TorusGeometry(.055, .015, 6, 12, Math.PI * 1.5), m.brass);
    cupHandle.position.set(.095, .04, 0); cupHandle.rotation.y = Math.PI / 2; coffeeCup.add(cupHandle);
    const documents = new THREE.Group(); documents.position.set(0, -.4, .18); documents.visible = false;
    lArm.lower.add(documents);
    box(documents, .52, .025, .38, 0, -.01, 0, m.forest);
    for (let sheet = 0; sheet < 3; sheet++) box(documents, .46, .008, .32, 0, .015 + sheet * .014, 0, m.white);
    box(documents, .26, .006, .016, -.07, .063, -.07, m.brass);
    if (index === 5) box(upperBody, .08, .42, .024, 0, .56, .3, m.brass);
    return { name: s.name, root: figure, hip, head,
      leftThigh: lLeg.pivot, rightThigh: rLeg.pivot, leftShin: lLeg.lower, rightShin: rLeg.lower,
      leftArm: lArm.pivot, rightArm: rArm.pivot, leftForearm: lArm.lower, rightForearm: rArm.lower,
      coffeeCup, documents, torso:upperBody,leftFoot:lLeg.foot,rightFoot:rLeg.foot,locomotion:createLocomotion(),animationTime:null,actionPhase:-1,
      desk: { x: desk.x * spaceScale.x, z: (desk.z - .67) * spaceScale.z }, spaceScale, state: 'WORKING' };
  });
}
