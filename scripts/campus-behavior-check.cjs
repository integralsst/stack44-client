// Exercises the production rigs/controller at fixed times, independently of GPU speed.
const {buildSync}=require('esbuild');
const {tmpdir}=require('node:os');
const path=require('node:path');
const fs=require('node:fs');
const outfile=path.join(tmpdir(),'stack44-campus-behavior.cjs');
buildSync({stdin:{contents:`
import * as THREE from 'three';
import assert from 'node:assert/strict';
import {campusTokens as T} from './src/features/landing/mini-office/campusDesignTokens';
import {officeSlab} from './src/features/landing/mini-office/campusArchitecture';
import {createCharacters} from './src/features/landing/mini-office/miniOfficeCharacters';
import {OfficeBehaviorController} from './src/features/landing/mini-office/miniOfficeBehaviorController';
import {updateCharacters} from './src/features/landing/mini-office/miniOfficeAnimation';
const material = new THREE.MeshStandardMaterial();
const m = new Proxy({}, {get:()=>material});
const root=new THREE.Group(), actors=createCharacters(root,m as never), controller=new OfficeBehaviorController({automatic:false});
const fixtures={printerPaper:new THREE.Group(),deliveredPaper:new THREE.Group(),printerLight:new THREE.Mesh()};
root.position.y=T.levels.office;
const actor=(name:string)=>actors.find(a=>a.name===name)!;
const update=(t:number)=>{updateCharacters(actors,t,false,controller,fixtures);root.updateMatrixWorld(true);
 for(const a of actors)assert(a.root.getWorldPosition(new THREE.Vector3()).y>=T.levels.office-.001);};
assert.deepEqual(actors.map(a=>a.name),['Jesús','Cristina','Apolo','Zeus','Hera','Secretaria']);
update(0);controller.request('printer',0,actors);update(9);
assert.equal(actor('Secretaria').state,'PRINTING');assert(fixtures.printerPaper.visible);
update(20);assert.equal(actor('Secretaria').state,'DELIVERING');assert(actor('Secretaria').documents.visible);
update(27);assert(fixtures.deliveredPaper.visible);assert(!actor('Secretaria').documents.visible);
update(39);assert.equal(actor('Secretaria').state,'WORKING');
assert(actor('Secretaria').root.position.distanceTo(new THREE.Vector3(actor('Secretaria').desk.x,0,actor('Secretaria').desk.z))<.001);
let time=40;controller.request('coffee',time,actors);
while(time<100&&actor('Apolo').state!=='COFFEE_BREAK'){time+=.1;update(time);}assert(actor('Apolo').coffeeCup.visible);
while(time<130&&actor('Apolo').state!=='WORKING'){time+=.1;update(time);}assert.equal(actor('Apolo').state,'WORKING');
controller.request('meeting',time,actors);let both=false;
for(let end=time+100;time<end;time+=.1){update(time);if(actor('Zeus').state==='MEETING'&&actor('Hera').state==='MEETING')both=true;if(both&&actor('Zeus').state==='WORKING'&&actor('Hera').state==='WORKING')break;}
assert(both);assert.equal(actor('Zeus').state,'WORKING');assert.equal(actor('Hera').state,'WORKING');
controller.greet('Jesús',time);assert(controller.isGreeting('Jesús',time+1));assert(!controller.isGreeting('Jesús',time+4));
updateCharacters(actors,200,true,controller,fixtures);assert(!fixtures.printerPaper.visible);
// A request made while returning runs after the active job, without a position jump.
const repeatActors=createCharacters(new THREE.Group(),m as never),repeat=new OfficeBehaviorController({automatic:false});
const repeatFixtures={printerPaper:new THREE.Group(),deliveredPaper:new THREE.Group(),printerLight:new THREE.Mesh()};
repeat.request('printer',0,repeatActors);let outputs=0,lastPaper=false,lastX=repeatActors[5].root.position.x,lastZ=repeatActors[5].root.position.z;
for(let i=0;i<85*60;i++){const t=i/60;if(i===31*60)repeat.request('printer',t,repeatActors);updateCharacters(repeatActors,t,false,repeat,repeatFixtures);
 const a=repeatActors[5];assert(Math.hypot(a.root.position.x-lastX,a.root.position.z-lastZ)<.05);lastX=a.root.position.x;lastZ=a.root.position.z;
 if(repeatFixtures.printerPaper.visible&&!lastPaper)outputs++;lastPaper=repeatFixtures.printerPaper.visible;}
assert.equal(outputs,2,'Returning request must not be silently lost or restart in mid-route');
const slabRoot=new THREE.Group();slabRoot.position.y=T.levels.office;
const slab=officeSlab(slabRoot,20.25,12,-.4,.36,material);slabRoot.updateMatrixWorld(true);
const ray=new THREE.Raycaster(new THREE.Vector3(0,5,4.8),new THREE.Vector3(0,-1,0));
assert.equal(ray.intersectObject(slab).length,0,'Stair opening must remain open');
ray.set(new THREE.Vector3(4,5,4.8),new THREE.Vector3(0,-1,0));
assert(Math.abs(ray.intersectObject(slab)[0].point.y-(T.levels.office-.04))<.001);
console.log('PASS: six identities, printing, carried documents, delivery, return, coffee cup, meeting, greetings and reduced motion.');
`,resolveDir:process.cwd(),sourcefile:'campus-behavior-check.ts',loader:'ts'},bundle:true,platform:'node',format:'cjs',outfile,loader:{'.png':'dataurl'}});
require(outfile);fs.unlinkSync(outfile);
