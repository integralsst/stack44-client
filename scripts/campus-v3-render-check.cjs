const {buildSync}=require('esbuild');const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
(async()=>{
 const {RectAreaLightTexturesLib}=await import('three/addons/lights/RectAreaLightTexturesLib.js');RectAreaLightTexturesLib.init();
 const {gunzipSync}=require('node:zlib');
 for(const [name,prefix,width] of [['f32','LTC_FLOAT',4],['f16','LTC_HALF',2]]){
  const official=Buffer.concat([1,2].map(i=>{const a=RectAreaLightTexturesLib[prefix+'_'+i].image.data;return Buffer.from(a.buffer,a.byteOffset,a.byteLength)}));
  const raw=fs.readFileSync('src/features/landing/mini-office/lighting-data/campus-ltc-'+name+'.bin');const shuffled=gunzipSync(fs.readFileSync('src/features/landing/mini-office/lighting-data/campus-ltc-'+name+'.bin.gz'));const restored=Buffer.alloc(shuffled.length),count=restored.length/width;
  for(let b=0;b<width;b++)for(let i=0;i<count;i++)restored[i*width+b]=shuffled[b*count+i];
  require('node:assert/strict').deepEqual(raw,official);require('node:assert/strict').deepEqual(restored,official);
 }
 const outfile=path.join(os.tmpdir(),'stack44-v3-render.cjs');buildSync({stdin:{contents:`
 import assert from 'node:assert/strict';import * as THREE from 'three';
 import {createCharacters} from './src/features/landing/mini-office/miniOfficeCharacters';
 import {batchCharacterBones} from './src/features/landing/mini-office/campusStaticBatch';
 import {applyLocomotion} from './src/features/landing/mini-office/miniOfficeLocomotion';
 const shared=new THREE.MeshStandardMaterial();const m=new Proxy({},{get:()=>shared});const root=new THREE.Group();const actors=createCharacters(root,m as never);
 function triangles(){let n=0;root.traverse(o=>{if(o instanceof THREE.Mesh)n+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3});return n;}
 const before=triangles(),bones=actors.flatMap(a=>[a.hip,a.torso,a.head,a.leftThigh,a.leftShin,a.leftFoot,a.rightFoot,a.leftForearm,a.coffeeCup,a.documents]);
 let removed=0;for(const a of actors)removed+=batchCharacterBones(a.root);assert.equal(triangles(),before,'No geometry deleted');assert(removed>80,'Rigid-part batching reduces submissions');
 for(const bone of bones){let parent:THREE.Object3D|null=bone;while(parent&&parent!==root)parent=parent.parent;assert.equal(parent,root,'Every animated bone survives batching');}
 const actor=actors[0];actor.hip.position.y=1;actor.root.position.set(0,0,0);applyLocomotion(actor,0,false,0,()=>-.0125);
 for(let i=1;i<60;i++){actor.root.position.z=i*.01;applyLocomotion(actor,i/60,true,0,()=>-.0125);}assert(actor.locomotion.distance>.5);
 console.log('PASS: exact FP32/FP16 lookup data; '+removed+' rigid meshes merged; triangle count and animated bone hierarchy preserved.');
 `,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',outfile,loader:{'.png':'dataurl'}});require(outfile);fs.unlinkSync(outfile);
})().catch(e=>{console.error(e);process.exit(1)});
