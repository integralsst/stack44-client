const {buildSync}=require('esbuild');const path=require('node:path'),os=require('node:os'),fs=require('node:fs');
const outfile=path.join(os.tmpdir(),'stack44-v3-motion.cjs');
buildSync({stdin:{contents:`
import assert from 'node:assert/strict';import fs from 'node:fs';import * as THREE from 'three';
import {createCharacters} from './src/features/landing/mini-office/miniOfficeCharacters';
import {OfficeBehaviorController} from './src/features/landing/mini-office/miniOfficeBehaviorController';
import {updateCharacters} from './src/features/landing/mini-office/miniOfficeAnimation';
import {createCampus} from './src/features/landing/mini-office/miniOfficeCampus';
import {createLightSurfaces} from './src/features/landing/mini-office/campusLightSurfaces';
import {applyLocomotion,turnTowards} from './src/features/landing/mini-office/miniOfficeLocomotion';
import {MotionPath} from './src/features/landing/mini-office/miniOfficePath';
const noop=()=>{};const ctx=new Proxy({createRadialGradient:()=>({addColorStop:noop}),createLinearGradient:()=>({addColorStop:noop})},{get:(t,k)=>k in t?t[k as keyof typeof t]:noop});
(globalThis as any).document={createElement:()=>({width:0,height:0,getContext:()=>ctx})};(globalThis as any).Image=class{onload=null;onerror=null;src=''};
const material=new THREE.MeshStandardMaterial(),m=new Proxy({},{get:()=>material}) as never;
const root=new THREE.Group(),chars=createCharacters(root,m),controller=new OfficeBehaviorController();
const fixtures={printerPaper:new THREE.Group(),deliveredPaper:new THREE.Group(),printerLight:new THREE.Mesh()};
const outdoor=new THREE.Group(),textures:THREE.Texture[]=[];const campus=createCampus(outdoor,m,textures,new AbortController().signal,false,createLightSurfaces(textures));
const all=[...chars,...campus.actors],history=new Map<string,{x:number,z:number,angles:number[],yaw:number,feet:THREE.Vector3[],support:boolean[]}>();
const sole=new THREE.Vector3(),point=new THREE.Vector3();let worstSlip:any=null;let movingFrames=0,maxSlip=0,maxGroundError=0,minSeparation=Infinity,stops=0,turns=0;
const boxes=[...chars.map(c=>({name:c.name,x:c.desk.x,z:c.desk.z+.67,w:2.55,d:1.4})),{name:'printer',x:-9.05,z:.87,w:1.55,d:.84}];
const violations:string[]=[];let parkMotion=0;
for(let frame=0;frame<=360*60;frame++){
 const t=frame/60;updateCharacters(chars,t,false,controller,fixtures);campus.update(t,1/60,false);
 for(const c of all){c.root.updateWorldMatrix(true,true);const old=history.get(c.name),angles=[c.leftThigh.rotation.x,c.rightThigh.rotation.x,c.leftShin.rotation.x,c.rightShin.rotation.x];const g=c.locomotion;
  if(old){const ds=Math.hypot(c.root.position.x-old.x,c.root.position.z-old.z),joint=angles.reduce((sum,v,i)=>sum+Math.abs(v-old.angles[i]),0);
   const transition=c.state==='STANDING_UP'||c.state==='SITTING';
   if(ds>.0001&&!transition){movingFrames++;if(c.name==='Visitante parqueadero')parkMotion++;if(joint<1e-6)violations.push(c.name+' moved without gait at '+t);}
   const dy=Math.abs(Math.atan2(Math.sin(c.root.rotation.y-old.yaw),Math.cos(c.root.rotation.y-old.yaw)));if(dy>.002)turns++;assert(dy<.4,'Abrupt rotation '+c.name+' '+dy);
  }
  const feet:THREE.Vector3[]=[],support:boolean[]=[];
  for(let i=0;i<2;i++){
   const foot=i?c.rightFoot:c.leftFoot,f=g.feet[i];sole.set(0,-.06,.08).applyMatrix4(foot.matrixWorld);feet.push(sole.clone());support.push(g.moving&&!f.swing&&g.settle===0);
   if(old&&support[i]&&old.support[i]&&g.initialized){const slip=sole.distanceTo(old.feet[i]);if(slip>maxSlip){maxSlip=slip;worstSlip={name:c.name,time:t,root:c.root.position.toArray(),hipY:c.hip.position.y,foot:sole.toArray(),anchor:[f.x,f.y,f.z],phase:g.phase};}}
   if(g.initialized||c.state==='SITTING'){
     for(const toe of [-.135,.295]){point.set(0,-.06,toe).applyMatrix4(foot.matrixWorld);const floor=chars.includes(c)?-.0125:c.name==='Visitante pérgola'?-.825:campus.groundAt(point.x,point.z);maxGroundError=Math.max(maxGroundError,Math.max(0,floor-point.y));}
   }
  }
  if(old&&!g.moving&&g.settle===0&&Math.hypot(c.root.position.x-old.x,c.root.position.z-old.z)<1e-8)stops++;
  if(chars.includes(c)&&['WALKING','RETURNING_TO_DESK'].includes(c.state)){
   for(const b of boxes){const dx=Math.max(0,Math.abs(c.root.position.x-b.x)-b.w/2),dz=Math.max(0,Math.abs(c.root.position.z-b.z)-b.d/2);if(Math.hypot(dx,dz)<.31)violations.push(c.name+' intersects '+b.name+' at '+t);}
   if(Math.hypot(c.root.position.x+8.07,c.root.position.z+1.88)<1.43)violations.push(c.name+' intersects meeting table at '+t);
  }
  history.set(c.name,{x:c.root.position.x,z:c.root.position.z,angles,yaw:c.root.rotation.y,feet,support});
 }
 for(let i=0;i<chars.length;i++)for(let j=i+1;j<chars.length;j++){
  const a=chars[i],b=chars[j];const d=Math.hypot(a.root.position.x-b.root.position.x,a.root.position.z-b.root.position.z);minSeparation=Math.min(minSeparation,d);
  if(d<.8)violations.push(a.name+'/'+b.name+' overlap at '+t);
 }
}
const frozen=chars.map(c=>({position:c.root.position.toArray(),legs:[c.leftThigh.rotation.x,c.rightThigh.rotation.x]}));
for(let i=0;i<10;i++)updateCharacters(chars,361+i,true,controller,fixtures);
assert.deepEqual(chars.map(c=>({position:c.root.position.toArray(),legs:[c.leftThigh.rotation.x,c.rightThigh.rotation.x]})),frozen,'Reduced motion freezes a current pose');
assert(movingFrames>1000);assert(parkMotion>100,'Parking visitor actually walks');assert(stops>100);assert(turns>100);
// Same travelled distance at three speeds produces the same stride phase.
const cadence=[];for(const fps of [30,60,120])for(const speed of [.25,.5,1]){const c=createCharacters(new THREE.Group(),m,undefined,[0])[0];c.hip.position.y=1;c.root.rotation.y=Math.PI/2;c.locomotion.path=new MotionPath([[0,0],[4,0]]);c.root.position.set(0,0,0);applyLocomotion(c,0,false,0,()=>-.0125);
 const frames=Math.round(2.7/speed*fps);for(let i=1;i<=frames;i++){c.root.position.x=2.7*i/frames;c.locomotion.pathDistance=c.root.position.x;applyLocomotion(c,i/fps,true,0,()=>-.0125);}cadence.push(c.locomotion.cycleDistance);
 const before=c.locomotion.phase;for(let j=1;j<=fps;j++)applyLocomotion(c,(frames+j)/fps,false,0,()=>-.0125);assert.equal(c.locomotion.phase,before,'No phantom steps when stopped');}
assert(Math.max(...cadence)-Math.min(...cadence)<1e-6);
const report={worstSlip,movingFrames,parkMotion,maxStanceDriftPerFrame:maxSlip,maxFloorPenetration:maxGroundError,minCharacterSeparation:minSeparation,stops,turns,cyclesAtEqualDistance:cadence,violations:violations.slice(0,30),violationCount:violations.length};
fs.writeFileSync('docs/design/captures-v3/motion-unit.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
assert.equal(violations.length,0,'Motion or collision regressions, see report');assert(maxSlip<.005,'Planted foot drift exceeds 5 mm/frame');assert(maxGroundError<.015,'Foot below floor');
console.log('PASS: distance cadence, all walking rigs, plant/stop/turn/seat/return, furniture and actor clearance.');
`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',outfile,loader:{'.png':'dataurl'}});require(outfile);fs.unlinkSync(outfile);
