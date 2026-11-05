import * as THREE from 'three';
import { box, cylinder, type OfficeMaterials } from './miniOfficeMaterials';
import { desks } from './miniOfficeLayout';

export type Behavior = 'WORKING' | 'SITTING' | 'STANDING_UP' | 'WALKING' | 'TALKING' | 'MEETING' | 'RETURNING_TO_DESK' | 'COFFEE_BREAK';
export type Character = {
  name: string; root: THREE.Group; hip: THREE.Group; head: THREE.Group;
  leftThigh: THREE.Group; rightThigh: THREE.Group; leftShin: THREE.Group; rightShin: THREE.Group;
  leftArm: THREE.Group; rightArm: THREE.Group; leftForearm: THREE.Group; rightForearm: THREE.Group;
  desk: { x: number; z: number }; state: Behavior;
};

const style = [
  { name: 'Jesús', jacket: 0x172a3b, shirt: 0xecebe5, pants: 0x182333, hair: 0x231b18, skin: 0xb88661, glasses: true, hairType: 0 },
  { name: 'Cristina', jacket: 0xd5c4aa, shirt: 0x3b3938, pants: 0x353031, hair: 0x4a261d, skin: 0xe5b58c, glasses: false, hairType: 2 },
  { name: 'Apolo', jacket: 0x536d5d, shirt: 0xd9dfd4, pants: 0x343b3d, hair: 0x2d241f, skin: 0xc99770, glasses: false, hairType: 1 },
  { name: 'Zeus', jacket: 0x7b8d9a, shirt: 0xe7e8e3, pants: 0x353b46, hair: 0x4d3b2e, skin: 0xcf9e77, glasses: true, hairType: 1 },
  { name: 'Hera', jacket: 0x344c45, shirt: 0xe1d5c3, pants: 0x2c3030, hair: 0x281c1c, skin: 0xb98161, glasses: false, hairType: 3 },
] as const;

function limb(parent: THREE.Group, upperMat: THREE.Material, lowerMat: THREE.Material, skin: THREE.Material, x: number, arm: boolean) {
  const pivot = new THREE.Group(); pivot.position.set(x, arm ? .94 : 0, 0); parent.add(pivot);
  const len = arm ? .38 : .43;
  box(pivot, arm ? .23 : .26, len, arm ? .25 : .31, 0, -len / 2, 0, upperMat);
  const lower = new THREE.Group(); lower.position.y = -len; pivot.add(lower);
  box(lower, arm ? .19 : .24, arm ? .28 : .58, arm ? .2 : .29, 0, arm ? -.14 : -.29, 0, lowerMat);
  if (arm) cylinder(lower, .11, .1, .12, 0, -.33, 0, skin);
  else box(lower, .29, .12, .42, 0, -.61, .08, lowerMat);
  return { pivot, lower };
}

export function createCharacters(root: THREE.Group, m: OfficeMaterials): Character[] {
  return style.map((s, i) => {
    const desk = desks[i]; const figure = new THREE.Group();
    figure.position.set(desk.x - 1.05, 0, desk.z); figure.rotation.y = Math.PI / 2; root.add(figure);
    const jacket = new THREE.MeshStandardMaterial({ color: s.jacket, roughness: .68 });
    const shirt = new THREE.MeshStandardMaterial({ color: s.shirt, roughness: .76 });
    const pants = new THREE.MeshStandardMaterial({ color: s.pants, roughness: .75 });
    const hair = new THREE.MeshStandardMaterial({ color: s.hair, roughness: .82 });
    const skin = new THREE.MeshStandardMaterial({ color: s.skin, roughness: .77 });
    const hip = new THREE.Group(); hip.position.y = .84; figure.add(hip);
    box(hip, .7, .22, .38, 0, .04, 0, pants);
    const torso = new THREE.Mesh(new THREE.CylinderGeometry(.34, .43, .82, 4), jacket);
    torso.position.y = .57; torso.castShadow = true; hip.add(torso);
    torso.rotation.y = Math.PI / 4;
    box(hip, .2, .58, .012, 0, .55, .246, shirt);
    if (i === 0) box(hip, .07, .4, .02, 0, .55, .263, m.brass);
    if (i === 3) box(hip, .55, .08, .027, 0, .35, .267, shirt);
    cylinder(hip, .18, .18, .14, 0, 1.02, 0, skin);
    const head = new THREE.Group(); head.position.y = 1.27; hip.add(head);
    cylinder(head, .29, .29, .43, 0, 0, 0, skin, 20);
    cylinder(head, .12, .12, .095, 0, .265, 0, skin);
    // Smiling face is on +Z and stays legible from the isometric camera.
    for (const x of [-.105, .105]) cylinder(head, .024, .024, .01, x, .07, .294, m.charcoal, 8).rotation.x = Math.PI / 2;
    const mouth = box(head, .13, .018, .012, 0, -.095, .298, m.walnutDark);
    mouth.rotation.z = -.08;
    cylinder(head, .3, .28, .17, 0, .25, -.02, hair, 16);
    if (s.hairType === 1) for (let h = 0; h < 5; h++) {
      const tuft = box(head, .15, .16 + h * .01, .15, -.22 + h * .11, .34, .07, hair);
      tuft.rotation.z = -.22;
    }
    if (s.hairType === 2) {
      box(head, .16, .47, .36, -.27, .04, -.05, hair);
      box(head, .16, .47, .36, .27, .04, -.05, hair);
      box(head, .5, .16, .22, 0, .32, .12, hair);
    }
    if (s.hairType === 3) cylinder(head, .22, .2, .24, 0, .08, -.32, hair);
    if (s.glasses) {
      for (const x of [-.105, .105]) {
        const frame = new THREE.Mesh(new THREE.TorusGeometry(.095, .014, 5, 12), m.metal);
        frame.position.set(x, .07, .307); head.add(frame);
      }
      box(head, .06, .015, .015, 0, .075, .31, m.metal);
    }
    const lLeg = limb(hip, pants, pants, skin, -.19, false);
    const rLeg = limb(hip, pants, pants, skin, .19, false);
    const lArm = limb(hip, jacket, shirt, skin, -.51, true);
    const rArm = limb(hip, jacket, shirt, skin, .51, true);
    return { name: s.name, root: figure, hip, head,
      leftThigh: lLeg.pivot, rightThigh: rLeg.pivot, leftShin: lLeg.lower, rightShin: rLeg.lower,
      leftArm: lArm.pivot, rightArm: rArm.pivot, leftForearm: lArm.lower, rightForearm: rArm.lower,
      desk: { x: desk.x - 1.05, z: desk.z }, state: 'WORKING' };
  });
}
