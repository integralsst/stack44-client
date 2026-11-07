const {buildSync}=require('esbuild');const os=require('node:os'),path=require('node:path'),fs=require('node:fs');
const outfile=path.join(os.tmpdir(),'stack44-v3-startup.cjs');
buildSync({stdin:{contents:`
import assert from 'node:assert/strict';import * as THREE from 'three';
import {createCharacters} from './src/features/landing/mini-office/miniOfficeCharacters';
import {OfficeBehaviorController} from './src/features/landing/mini-office/miniOfficeBehaviorController';
import {updateCharacters} from './src/features/landing/mini-office/miniOfficeAnimation';
const m=new Proxy({},{get:()=>new THREE.MeshStandardMaterial()});
function setup(){const chars=createCharacters(new THREE.Group(),m as never);return{chars,behavior:new OfficeBehaviorController(),fixtures:{printerPaper:new THREE.Group(),deliveredPaper:new THREE.Group(),printerLight:new THREE.Mesh()}}}
const s=setup(),secretary=s.chars.find(c=>c.name==='Secretaria')!;
updateCharacters(s.chars,0,false,s.behavior,s.fixtures);const seated=secretary.hip.position.y;
for(let t=.05;t<=.8;t+=.05)updateCharacters(s.chars,t,false,s.behavior,s.fixtures);
assert.equal(secretary.state,'STANDING_UP');assert(secretary.hip.position.y-seated>.025,'Visible stand-up within first second');
updateCharacters(s.chars,7,false,s.behavior,s.fixtures);assert.notEqual(s.chars.find(c=>c.name==='Apolo')!.state,secretary.state,'Routines staggered');
const reduced=setup();for(const t of [0,.3,1,7,30])updateCharacters(reduced.chars,t,true,reduced.behavior,reduced.fixtures);
assert(reduced.chars.every(c=>c.state==='WORKING'));assert(!reduced.fixtures.printerPaper.visible);
console.log('PASS: significant motion before 0.8 s, staggered activities, reduced-motion static.');
`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'cjs',outfile,loader:{'.png':'dataurl'}});require(outfile);fs.unlinkSync(outfile);
