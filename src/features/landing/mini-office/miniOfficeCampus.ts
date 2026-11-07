import { officeSlab } from './campusArchitecture';
import type { LightSurfaces } from './campusLightSurfaces';
import {MotionPath,smooth} from './miniOfficePath';
import {applyLocomotion,turnTowards} from './miniOfficeLocomotion';
import * as THREE from 'three';
import stackLogo from '../../../assets/logostack44.png';
import { box, softBox, cylinder, type OfficeMaterials } from './miniOfficeMaterials';
import { logoPanelTexture } from './miniOfficeScreens';
import { createCharacters } from './miniOfficeCharacters';
import { campusTokens as T } from './campusDesignTokens';
import type { OfficeTarget } from './miniOfficeContent';

/** Campus is built around the existing office coordinate system. Interior routes never move. */
export function createCampus(root: THREE.Group, m: OfficeMaterials, textures: THREE.Texture[], signal: AbortSignal, mobile: boolean, light: LightSurfaces) {
  const make = (color: number, roughness = .8) => new THREE.MeshStandardMaterial({ color, roughness });
  const lavender = make(T.colors.lavender), olive = make(T.colors.olive);
  const asphalt = new THREE.MeshStandardMaterial({color:0x343b3d,roughness:.38,metalness:.12}), turf = m.turf;
  function roundedSlab(width: number, depth: number, height: number, y: number, material: THREE.Material) {
    const x = -width / 2, z = -depth / 2, r = 1.5;
    const shape = new THREE.Shape(); shape.moveTo(x+r,z); shape.lineTo(x+width-r,z);
    shape.quadraticCurveTo(x+width,z,x+width,z+r); shape.lineTo(x+width,z+depth-2);
    shape.quadraticCurveTo(x+width,z+depth-.35,x+width-1.7,z+depth-.35);
    shape.lineTo(4.4,z+depth-.35); shape.quadraticCurveTo(3.8,z+depth-.35,3.8,z+depth+.05);
    shape.lineTo(3.8,z+depth+.2); shape.quadraticCurveTo(3.8,z+depth+.5,3.4,z+depth+.5);
    shape.lineTo(-3.4,z+depth+.5); shape.quadraticCurveTo(-3.8,z+depth+.5,-3.8,z+depth+.2);
    shape.lineTo(-3.8,z+depth+.05); shape.quadraticCurveTo(-3.8,z+depth-.35,-4.4,z+depth-.35);
    shape.lineTo(x+1.7,z+depth-.35); shape.quadraticCurveTo(x,z+depth-.35,x,z+depth-2);
    shape.lineTo(x,z+r); shape.quadraticCurveTo(x,z,x+r,z);
    const mesh = new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:height,bevelEnabled:true,bevelSize:.08,bevelThickness:.045,bevelSegments:3,steps:1}), material);
    mesh.rotation.x=-Math.PI/2; mesh.position.set(0,y,2.4); mesh.castShadow=true; mesh.receiveShadow=true; root.add(mesh);
  }
  roundedSlab(T.dimensions.width,T.dimensions.depth,.48,T.levels.baseBottom,m.foundation);
  roundedSlab(31.88,23.88,.045,-1.2,m.brass);
  roundedSlab(31.8,23.8,.16,-1.16,m.foundation);
  roundedSlab(31.4,23.4,.075,-1.055,turf);
  // Upper storey: recessed stone support, ventilated bronze reveals and a real stair opening.
  officeSlab(root,20.08,11.86,-.99,T.levels.office-.545+.99,m.foundation);
  for (const x of [-6,6]) {
    box(root,8.8,.045,.045,x,.36,5.48,m.brass);
    box(root,8.8,.025,.06,x,T.levels.office-.49,5.5,m.glow);
    for (let i=0;i<5;i++) box(root,.035,1.45,.025,x-3.5+i*1.75,-.12,5.47,m.metal);
    light.contact(root,x,-.976,5.65,10,1.9);
  }
  for (const x of [-10.08,10.08]) {
    box(root,.055,1.5,11.4,x,-.1,-.48,m.foundation);
    box(root,.065,.025,11.6,x,T.levels.office-.49,-.48,m.glow);
  }
  // Internal flight is below the cutout, beyond the rear edge of the lobby canopy.
  for(let i=0;i<T.stairs.innerCount;i++) {
    const top=T.levels.office-i*(T.levels.office-T.levels.lobby)/T.stairs.innerCount;
    const z=T.stairs.innerStartZ+i*T.stairs.innerTread;
    box(root,3,top-T.levels.lobby+.12,T.stairs.innerTread+.02,0,(top+T.levels.lobby-.12)/2,z,m.travertine);
    box(root,2.88,.022,.018,0,top-.04,z+T.stairs.innerTread/2,m.glow);
    light.wash(root,0,top+.005,z,3.1,.6);
  }
  box(root,3,.18,.35,0,T.levels.lobby-.09,5.5,m.travertine);
  for(const x of [-1.6,1.6]) {
    const topStart=T.levels.office+.85, topEnd=T.levels.lobby+.85;
    const rail=new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(new THREE.Vector3(x,topStart,3.55),new THREE.Vector3(x,topEnd,5.55)),1,.025,8,false),m.brass);root.add(rail);
    for(let i=0;i<3;i++) {const t=i/2;const floor=THREE.MathUtils.lerp(T.levels.office,T.levels.lobby,t);cylinder(root,.022,.022,.85,x,floor+.425,3.55+t*2,m.brass);}
  }
  // Stone promenades: continuous accessible spine and two curved garden walks.
  softBox(root, 7.8, .13, 8.7, 0, -.91, 9.65, m.travertine);
  softBox(root, 28.8, .09, 2, 0, -.94, 7.3, m.travertine);
  function ribbon(points: THREE.Vector3[], width: number) {
    const curve = new THREE.CatmullRomCurve3(points);
    const shape = new THREE.Shape(); const sides: THREE.Vector2[][] = [[], []];
    for (let i = 0; i <= 60; i++) {
      const p = curve.getPoint(i / 60), tangent = curve.getTangent(i / 60);
      const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
      for (const [j, side] of [-1, 1].entries()) sides[j].push(new THREE.Vector2(p.x + normal.x * width * side / 2, -p.z - normal.z * width * side / 2));
    }
    shape.setFromPoints([...sides[0], ...sides[1].reverse()]);
    const mesh = new THREE.Mesh(new THREE.ShapeGeometry(shape, 60), m.travertine);
    mesh.rotation.x = -Math.PI / 2; mesh.position.y = -.88; mesh.receiveShadow = true; root.add(mesh);
    for (let i = 1; i < 28; i++) {
      const p = curve.getPoint(i / 28), t = curve.getTangent(i / 28);
      const joint = box(root, width * .94, .006, .018, p.x, -.873, p.z, m.fabric);
      joint.rotation.y = -Math.atan2(t.z, t.x) + Math.PI / 2;
    }
  }
  ribbon([new THREE.Vector3(-12.6, 0, -5.7), new THREE.Vector3(-12.5, 0, 2), new THREE.Vector3(-12.8, 0, 5.4), new THREE.Vector3(-9, 0, 8.2), new THREE.Vector3(-5, 0, 11.5), new THREE.Vector3(0, 0, 12.5)], 1.65);
  ribbon([new THREE.Vector3(12, 0, -6.1), new THREE.Vector3(12, 0, 1.7), new THREE.Vector3(11, 0, 5.7), new THREE.Vector3(8.4, 0, 7.5)], 1.45);
  // Joints keep large stone slabs tactile without adding separate tiles.
  for (let z = 5.7; z < 14; z += .62) box(root, 7.65, .008, .015, 0, -.837, z, m.fabric);
  for (let x = -3.5; x < 3.8; x += .7) box(root, .015, .008, 8.4, x, -.837, 9.65, m.fabric);

  const lobby = new THREE.Group(); lobby.position.set(0, T.levels.lobby, 7.25); root.add(lobby);
  lobby.userData.officeAction = 'lobby';
  const entranceGlass=m.glass.clone();
  entranceGlass.color.setHex(0x91b0b5); entranceGlass.opacity=T.surfaces.lobbyGlassOpacity;
  entranceGlass.envMapIntensity=T.surfaces.lobbyGlassEnvironment;
  softBox(lobby, 7, .2, 3.4, 0, -.1, 0, m.stone);
  for (const x of [-3.25, -2.3, 2.3, 3.25]) {
    box(lobby, .2, 2.55, .22, x, 1.23, .93, m.metal);
    box(lobby, .045, 2.32, .025, x + .12, 1.2, 1.07, m.glow);
    box(lobby, .2, 2.55, .22, x, 1.23, -1.4, m.walnutDark);
  }
  for (const x of [-2.75, 2.75]) {
    box(lobby, .85, 2.3, .035, x, 1.15, .96, entranceGlass);
    box(lobby, .9, .08, .075, x, .06, 1, m.brass);
  }
  for (const x of [-1.12, 1.12]) {
    box(lobby, 2.2, 2.3, .045, x, 1.15, .96, entranceGlass);
    for (const edge of [-1.1, 1.1]) box(lobby, .035, 2.32, .07, x + edge, 1.16, 1, m.brass);
    box(lobby, 2.2, .04, .07, x, 2.31, 1, m.brass);
    cylinder(lobby, .027, .027, .65, x < 0 ? -.17 : .17, 1.1, 1.14, m.brass);
    for (const y of [.83,1.37]) { const mount=box(lobby,.035,.035,.14,x<0?-.17:.17,y,1.07,m.brass); mount.castShadow=false; }
  }
  for (const x of [-3.25, 3.25]) box(lobby, .03, 2.3, 2.35, x, 1.15, -.2, entranceGlass);
  // Open-backed vestibule connects to an actual gap in the office balustrade.
  softBox(lobby, 7.1, .15, 3.6, 0, 2.55, -.12, m.metal);
  box(lobby,7.06,.025,.035,0,2.5,1.69,m.brass);
  box(lobby,6.6,.045,3.15,0,2.46,-.12,m.walnutDark);
  box(lobby, 6.85, .035, .04, 0, 2.37, 1.63, m.glow);
  for (let x = -3.3; x <= 3.3; x += .2) box(lobby, .065, .045, 3.4, x, 2.64, -.12, m.walnut);
  softBox(lobby, 4.4, .065, .75, 0, 2.49, 1.85, m.walnut);
  box(lobby, 4.3, .025, .035, 0, 2.37, 2.2, m.glow);
  for (const x of [-2.75, 2.75]) {
    cylinder(root, .4, .3, .7, x, -.35, 9.05, m.cream, 20);
    for (let i = 0; i < 9; i++) {
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 6), i % 2 ? m.leaf : olive);
      const a = i * 2.4; leaf.position.set(x + Math.sin(a) * .22, .2 + i % 3 * .17, 9.05 + Math.cos(a) * .22);
      leaf.scale.set(.14, .65, .1); leaf.rotation.z = Math.sin(a) * .45; root.add(leaf);
    }
  }
  box(root,4.7,.18,.32,0,T.levels.lobby-.09,9.03,m.travertine);
  light.contact(root,0,-.83,9.5,8.5,4.4);
  const vestibuleWash=light.wash(lobby,0,.012,.8,6.8,3.3);
  const vestibuleWashMaterial=(vestibuleWash.material as THREE.MeshBasicMaterial).clone();
  vestibuleWashMaterial.opacity=T.lighting.lobbyWashOpacity; vestibuleWash.material=vestibuleWashMaterial;
  for (let i = 0; i < T.stairs.frontCount; i++) {
    const z=T.stairs.frontStartZ+i*T.stairs.frontTread;
    const top=T.levels.lobby-(i+1)*T.stairs.frontRiser;
    const height=top-T.levels.promenade;
    softBox(root,4.7,height,T.stairs.frontTread+.025,0,T.levels.promenade+height/2,z,m.travertine);
    box(root,4.45,.024,.025,0,top-.045,z+T.stairs.frontTread/2,m.glow);
    light.wash(root,0,top-T.stairs.frontRiser+.008,z+.43,4.5,.9);
  }
  // Pergola with fine walnut battens, cream upholstery and warm underside.
  const pergola = new THREE.Group(); pergola.position.set(-12.7, -.85, -2.8); root.add(pergola);
  pergola.userData.officeAction = 'pergola';
  softBox(pergola, 4.3, .15, 4.5, 0, -.05, 0, m.travertine);
  for (const x of [-1.85, 1.85]) for (const z of [-1.9, 1.9]) box(pergola, .14, 2.9, .14, x, 1.45, z, m.walnutDark);
  for (const x of [-1.9, 1.9]) box(pergola, .16, .2, 4.1, x, 2.9, 0, m.metal);
  for (const z of [-2, 2]) { box(pergola, 4, .2, .16, 0, 2.9, z, m.metal); box(pergola, 3.75, .03, .045, 0, 2.78, z, m.glow); }
  for (let z = -1.9; z <= 1.95; z += .24) box(pergola, 3.85, .09, .07, 0, 2.9, z, m.walnut);
  for (let x = -1.8; x <= 1.8; x += .19) box(pergola, .055, 2.1, .1, x, 1.65, -1.9, m.walnut);
  for (const x of [-1.14, 1.14]) {
    softBox(pergola, 1.25, .4, 1.7, x, .39, -.3, m.fabric, .09);
    softBox(pergola, 1.25, .58, .22, x, .8, -1.1, m.cream, .09);
    softBox(pergola, 1.12, .16, 1.3, x, .64, -.28, m.cream, .07);
    for (const dx of [-.63, .63]) softBox(pergola, .12, .55, 1.7, x + dx, .65, -.3, m.walnutDark);
  }
  cylinder(pergola, .51, .51, .09, 0, .58, .9, m.walnut, 24);
  cylinder(pergola, .08, .18, .5, 0, .28, .9, m.brass);
  cylinder(pergola, .12, .1, .16, 0, .7, .9, m.cream);
  // Ornament trees / flowers / shrubs use shared instanced geometries.
  const balls: { p: number[]; s: number[]; color: number }[] = [];
  const flowers: typeof balls = [];
  function bush(x: number, z: number, size: number, seed: number) {
    balls.push({ p: [x, -.85 + size * .35, z], s: [size, size * .7, size * .8], color: seed % 2 ? 0x507344 : 0x71854a });
  }
  let bedIndex = 0;
  function bed(x: number, z: number, size: number) {
    const seed = bedIndex++;
    softBox(root, size * 2.5, .15, size * 1.8, x, -.91, z, m.travertine);
    for (let i = 0; i < 17; i++) {
      const a = i * 2.4, r = Math.sqrt(i / 17) * size;
      const bx = x + Math.cos(a) * r, bz = z + Math.sin(a) * r * .6;
      bush(bx, bz, .31, i);
      for (let j = 0; j < 7; j++) flowers.push({ p: [bx + Math.sin(j * 2.4) * .14, -.35 + (i % 3) * .065, bz + Math.cos(j * 2.4) * .14], s: [.09, .085, .09], color: Math.abs(seed) % 2 ? T.colors.lavender : T.colors.ivory });
    }
  }
  function tree(x: number, z: number, size: number) {
    light.contact(root,x,-.971,z,size*3.4,size*3.4);
    light.wash(root,x,-.966,z,size*2.1,size*2.1);
    cylinder(root, .13, .2, 2.6 * size, x, -.95 + 1.3 * size, z, m.walnut, 9);
    for (let i = 0; i < 4; i++) {
      const branch = cylinder(root, .055, .09, 1.3 * size, x + Math.sin(i * 1.57) * .3 * size, .7 * size, z + Math.cos(i * 1.57) * .3 * size, m.walnut, 7);
      branch.rotation.z = Math.sin(i * 1.57) * -.65; branch.rotation.x = Math.cos(i * 1.57) * .65;
    }
    for (let i = 0; i < (mobile ? 18 : 29); i++) {
      const a = i * 2.399, r = Math.sqrt(i / 29) * size * 1.17;
      balls.push({ p: [x + Math.sin(a) * r, -.9 + 3.1 * size + Math.sin(i * 8.1) * .5 * size, z + Math.cos(a) * r], s: [(.47+(i%4)*.035) * size, (.42+(i%3)*.05) * size, (.48+(i%5)*.018) * size], color: [0x284530, 0x49633b, 0x748348][i % 3] });
    }
  }
  for (const [x, z, s] of [[-14,-6.8,1],[-14,3.2,1],[-14,9.6,.95],[-10.6,-7.5,1.25],[12.5,-6.6,1.12],[14,-1,1],[8.5,11.7,.74],[13.7,12,.6]] ) tree(x,z,s);
  for (const [x,z,s] of [[-14,12.7,1],[-11.4,12.7,.9],[-6,12.7,.85],[-8.5,9.8,1],[-10,5.4,.8],[-14,-.2,.65],[-14,-8,.7],[14,-4,.8],[14,2.6,1],[11,3.7,.65],[5,12.4,.8],[10,12.8,.8],[14,12.7,.7],[-11,-6.5,.65],[11,-7,.7]]) bed(x,z,s);
  for (let i = 0; i < 24; i++) {
    bush(-14.8 + i * .42, 13.7, .26 + (i % 3) * .055, i);
    bush(5 + i * .42, 13.7, .3, i);
  }
  for (let i = 0; i < 18; i++) bush(14.6, -7.3 + i * .63, .42, i);
  function instances(items: typeof balls, geometry: THREE.BufferGeometry, material: THREE.Material) {
    const mesh = new THREE.InstancedMesh(geometry, material, items.length); const obj = new THREE.Object3D();
    items.forEach((item, i) => { obj.position.fromArray(item.p); obj.scale.fromArray(item.s); obj.rotation.set(0,i*2.399,Math.sin(i*1.7)*.12); obj.updateMatrix(); mesh.setMatrixAt(i, obj.matrix); mesh.setColorAt(i, new THREE.Color(item.color)); });
    mesh.castShadow = true; mesh.receiveShadow = true; root.add(mesh);
  }
  // One shared lobed silhouette; no extra vertices or per-frame deformation.
  const crown=new THREE.SphereGeometry(1,mobile?8:12,mobile?6:9);
  const vertices=crown.getAttribute('position');
  for(let i=0;i<vertices.count;i++) {
    const x=vertices.getX(i),y=vertices.getY(i),z=vertices.getZ(i);
    const radius=1+.055*Math.sin(x*5+y*3)*Math.cos(z*4-y*2);
    vertices.setXYZ(i,x*radius,y*radius,z*radius);
  }
  crown.computeVertexNormals();
  instances(balls,crown,make(0xffffff));
  instances(flowers, new THREE.IcosahedronGeometry(1, 1), make(0xffffff));
  // Bollards use luminous diffusers and ground pools, not dozens of dynamic lights.
  const poolCanvas = document.createElement('canvas'); poolCanvas.width=64; poolCanvas.height=64;
  const poolContext=poolCanvas.getContext('2d')!, gradient=poolContext.createRadialGradient(32,32,0,32,32,32);
  gradient.addColorStop(0,'rgba(255,181,70,.55)'); gradient.addColorStop(.3,'rgba(255,169,56,.2)'); gradient.addColorStop(1,'rgba(255,169,56,0)');
  poolContext.fillStyle=gradient; poolContext.fillRect(0,0,64,64);
  const poolTexture=new THREE.CanvasTexture(poolCanvas); poolTexture.colorSpace=THREE.SRGBColorSpace; textures.push(poolTexture);
  const poolMaterial = new THREE.MeshBasicMaterial({ map:poolTexture, transparent:true, opacity:1, depthWrite:false, blending:THREE.AdditiveBlending });
  for (const [x,z] of [[-14.5,6],[-11,2],[-10,8],[-5,10.5],[-4,13],[4,13],[4,9.8],[7.2,7],[10.5,4],[14.7,8],[14,-5],[-13,-6],[10.5,12],[-10.2,12.7]]) {
    cylinder(root, .085, .12, .93, x, -.45, z, m.metal);
    cylinder(root, .105, .105, .22, x, .02, z, m.glow);
    cylinder(root, .12, .12, .045, x, .15, z, m.brass);
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 2.4), poolMaterial); pool.rotation.x = -Math.PI / 2; pool.position.set(x,-.83,z); root.add(pool);
  }
  // Exactly one Stack44 logo; no copy or repeated branding in the miniature.
  const monument = new THREE.Group(); monument.position.set(-8.6, -.85, 11.5); root.add(monument);
  monument.userData.officeAction = 'monument';
  softBox(monument, 4.9, 2.05, .38, 0, 1, 0, m.charcoal, .06);
  box(monument, 4.75, .035, .06, 0, .05, .23, m.glow);
  const logoMaterial = new THREE.MeshBasicMaterial({ transparent: true, depthWrite: false });
  const initial = logoPanelTexture(stackLogo, [0,0,1,1], signal, loaded => { textures.push(loaded); logoMaterial.map = loaded; logoMaterial.needsUpdate = true; });
  textures.push(initial); logoMaterial.map = initial;
  const logo = new THREE.Mesh(new THREE.PlaneGeometry(2.8,2.8), logoMaterial); logo.position.set(0,1.15,.2); monument.add(logo);
  // Plain decorative pennants. They deliberately carry no logos.
  for (const x of [13,15]) {
    cylinder(root,.035,.045,4.4,x,1.3,-5.5,m.brass);
    const flag = box(root,.95,2,.035,x+.49,2.3,-5.5,m.fabric); flag.material = lavender;
    const finial = new THREE.Mesh(new THREE.SphereGeometry(.085,8,6),m.brass); finial.position.set(x,3.55,-5.5); root.add(finial);
  }
  const carWashes: THREE.Mesh[] = [];
  const carLights: THREE.MeshStandardMaterial[] = [];
  softBox(root, 5.9, .08, 6.3, 11.1, -.87, 8.6, asphalt);
  for (const z of [5.6,8.6,11.6]) box(root, 5.5, .012, .045, 11.1, -.818, z, m.cream);
  box(root,.045,.012,5.9,13.85,-.818,8.6,m.cream);
  const lightSurfacesWash=(x:number,z:number)=>{ const patch=light.wash(root,x,-.807,z,3.5,1.2); patch.material=patch.material.clone(); return patch; };
  function car(z: number, color: number, target: OfficeTarget) {
    const g = new THREE.Group(); g.position.set(11.1,-.8,z); root.add(g); g.userData.officeAction = target;
    const paint = new THREE.MeshPhysicalMaterial({color,roughness:T.surfaces.carRoughness,metalness:T.surfaces.carMetalness,clearcoat:T.surfaces.carClearcoat,clearcoatRoughness:T.surfaces.carClearcoatRoughness,envMapIntensity:1.4});
    light.contact(root,11.1,-.815,z,5.3,2.5);
    softBox(g,4.3,.58,1.9,0,.64,0,paint,.19);
    const cabin = new THREE.Shape(); cabin.moveTo(-1.3,.85); cabin.lineTo(-.85,1.47); cabin.lineTo(.68,1.47); cabin.lineTo(1.3,.85); cabin.closePath();
    const cabinMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(cabin,{depth:1.55,bevelEnabled:true,bevelSize:.05,bevelThickness:.045,bevelSegments:2,steps:1}),m.charcoal);
    cabinMesh.position.z=-.775; cabinMesh.castShadow=true; g.add(cabinMesh);
    softBox(g,1.48,.085,1.55,-.08,1.5,0,paint);
    const windshield = box(g,.045,.73,1.4,1.0,1.17,0,m.carGlass); windshield.rotation.z = Math.PI/4;
    for (const side of [-1,1]) {
      const sideWindow=new THREE.Shape();sideWindow.moveTo(-1.14,.93);sideWindow.lineTo(-.8,1.4);sideWindow.lineTo(.62,1.4);sideWindow.lineTo(1.08,.93);sideWindow.closePath();
      const windowMesh=new THREE.Mesh(new THREE.ShapeGeometry(sideWindow),m.carGlass);windowMesh.position.z=side*.835; if(side<0)windowMesh.rotation.y=Math.PI;g.add(windowMesh);
      box(g,.06,.5,.04,-.18,1.14,side*.85,paint);
      softBox(g,.3,.13,.22,.68,1.04,side*1.03,paint);
      for (const x of [-1.34,1.34]) {
        const wheel = cylinder(g,.36,.36,.22,x,.36,side*.92,m.charcoal,20); wheel.rotation.x = Math.PI/2;
        const rim = cylinder(g,.23,.23,.235,x,.36,side*.93,m.metal,16); rim.rotation.x = Math.PI/2;
        for (let i=0;i<5;i++) { const spoke=box(g,.035,.35,.02,x,.36,side*1.055,m.brass); spoke.rotation.z=i*Math.PI/5; }
      }
      const light = new THREE.MeshStandardMaterial({color:0xffe4ae,emissive:0xffd399,emissiveIntensity:.12}); carLights.push(light);
      const wash=lightSurfacesWash(11.1+3.3,z+side*.57); carWashes.push(wash);
      box(g,.035,.13,.47,2.16,.73,side*.57,light);
      box(g,.035,.1,.5,-2.16,.75,side*.6,new THREE.MeshStandardMaterial({color:0x822b24,emissive:0x8f2b14,emissiveIntensity:.3}));
    }
    box(g,.04,.17,.73,2.17,.45,0,m.metal);
    box(g,.04,.08,.31,2.195,.46,0,m.cream);
    box(g,.04,.08,1.5,-2.17,.42,0,m.brass);
  }
  car(7.05,0x252e35,'car-dark'); car(10.05,0xe5e3d9,'car-silver');
  const signCanvas = document.createElement('canvas'); signCanvas.width=128; signCanvas.height=128;
  const signContext=signCanvas.getContext('2d')!; signContext.fillStyle='#25292c'; signContext.fillRect(0,0,128,128);
  signContext.strokeStyle='#e7d6b5'; signContext.lineWidth=5; signContext.beginPath(); signContext.arc(64,64,49,0,Math.PI*2); signContext.stroke();
  signContext.fillStyle='#f0e9da'; signContext.font='bold 76px Arial'; signContext.textAlign='center'; signContext.textBaseline='middle'; signContext.fillText('P',64,69);
  const signTexture=new THREE.CanvasTexture(signCanvas); signTexture.colorSpace=THREE.SRGBColorSpace; textures.push(signTexture);
  box(root,1.05,.85,.12,11.7,-.18,12.6,m.charcoal);
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(.7,.7),new THREE.MeshBasicMaterial({map:signTexture})); sign.position.set(11.7,-.18,12.67); root.add(sign);
  box(root,1,.025,.05,11.7,-.58,12.68,m.glow);
  // Reuse the same articulated minifigure rig, with independent identities and routes.
  const visitorRoot = new THREE.Group(); root.add(visitorRoot);
  const visitors = createCharacters(visitorRoot,m,{x:1,z:1},[0,1,3,4]);
  const routes = [
    [new THREE.Vector3(-.9,T.levels.promenade,13),new THREE.Vector3(-.9,T.levels.promenade,11.8),new THREE.Vector3(-.9,T.levels.lobby,9.05),new THREE.Vector3(-.9,T.levels.lobby,8.7)],
    [new THREE.Vector3(-12.5,-.85,3.6),new THREE.Vector3(-12.8,-.85,5.2),new THREE.Vector3(-10.9,-.85,7.1),new THREE.Vector3(-10.1,-.85,7.5)],
    [new THREE.Vector3(7,-.85,7.3),new THREE.Vector3(8.3,-.85,7.3)],
    [new THREE.Vector3(-12.2,-.85,2.5),new THREE.Vector3(-12.2,-.85,3.1)],
  ];
  const curves = routes.map(points=>new THREE.CatmullRomCurve3(points,false,'centripetal'));
  const paths=curves.map(curve=>new MotionPath(Array.from({length:65},(_,i)=>{const p=curve.getPoint(i/64);return [p.x,p.z] as const;}),0));
  const reverse=paths.map(path=>path.reverse()),sample={x:0,z:0,yaw:0};
  const visitorNames=['Visitante lobby','Visitante jardín','Visitante parqueadero','Visitante pérgola'];
  visitors.forEach((actor,i)=>{actor.name=visitorNames[i];actor.root.scale.setScalar(.82);});
  const outdoorGround=(x:number,z:number)=>{
    if(Math.abs(x)<2.5&&z<11.61&&z>=9.1)return Math.max(T.levels.promenade,T.levels.lobby-(Math.floor((z-9.1)/T.stairs.frontTread)+1)*T.stairs.frontRiser);
    if(Math.abs(x)<3.5&&z<9.1&&z>5.5)return T.levels.lobby;
    if(Math.abs(x)<3.9)return -.845;
    return x>5&&z>6.3&&z<8.3?-.895:-.88;
  };
  let restUntil = -1;
  let activeCar: OfficeTarget | null = null;
  return {
    actors:visitors,
    groundAt:outdoorGround,
    dynamicRoots: [visitorRoot],
    activate(target: OfficeTarget, elapsed: number) { if(target==='pergola') restUntil=elapsed+T.motion.restSeconds; activeCar=target; },
    update(elapsed: number, delta: number, reduced: boolean) {
      for(let i=0;i<visitors.length;i++) {
        const actor=visitors[i];
        if(reduced&&actor.animationTime!==null)continue;
        const dt=actor.animationTime===null?0:Math.max(0,elapsed-actor.animationTime),initial=actor.animationTime===null;actor.animationTime=elapsed;
        if(i===3){
          actor.root.position.set(-13.84,-.85,-3.1);actor.root.rotation.y=0;actor.hip.position.y=.95;
          actor.hip.rotation.x=0;actor.state='SITTING';applyLocomotion(actor,elapsed,false,1,()=>-.825);
          actor.torso.rotation.x=!reduced&&elapsed<restUntil?-.1*Math.sin((restUntil-elapsed)/T.motion.restSeconds*Math.PI):0;
          continue;
        }
        const path=paths[i],duration=path.length/T.motion.visitorSpeed,pause=.6,period=duration*2+pause*2;
        const clock=reduced?duration*.35:(elapsed+i*period*.17)%period;
        const returning=clock>=duration+pause,active=returning?reverse[i]:path;
        const fraction=returning?Math.min(1,(clock-duration-pause)/duration):Math.min(1,clock/duration);
        const distance=active.length*smooth(fraction);active.sample(distance,sample);
        actor.root.position.x=sample.x;actor.root.position.z=sample.z;
        const floor=outdoorGround(sample.x,sample.z);
        actor.root.position.y=initial||reduced||dt>.25?floor:THREE.MathUtils.lerp(actor.root.position.y,floor,1-Math.exp(-dt*14));
        actor.root.rotation.y=initial||reduced?sample.yaw:turnTowards(actor.root.rotation.y,sample.yaw,Math.min(.1,dt));
        actor.hip.position.y=1;actor.state=reduced?'WORKING':fraction<1?'WALKING':'TALKING';
        actor.locomotion.path=active;actor.locomotion.pathDistance=distance;
        actor.leftForearm.rotation.x=actor.rightForearm.rotation.x=0;
        if(!reduced)applyLocomotion(actor,elapsed,fraction<1,0,outdoorGround);
        else {actor.leftThigh.rotation.x=actor.rightThigh.rotation.x=0;actor.leftArm.rotation.x=actor.rightArm.rotation.x=0;}
        actor.head.rotation.y=reduced?0:Math.sin(elapsed*.7+i)*.06;
      }
      carLights.forEach((light,i)=> { const enabled=activeCar===(i<2?'car-dark':'car-silver'); light.emissiveIntensity=reduced ? (enabled?2:.12) : THREE.MathUtils.lerp(light.emissiveIntensity,enabled?2:.12,1-Math.exp(-delta*T.motion.carFade)); (carWashes[i].material as THREE.MeshBasicMaterial).opacity=light.emissiveIntensity*.27; });
    },
  };
}
