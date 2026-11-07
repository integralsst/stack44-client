import * as THREE from 'three';
import type {Character} from './miniOfficeCharacters';
import type {OfficeFixtures} from './miniOfficeLayout';
import {OfficeBehaviorController,type DirectedPose} from './miniOfficeBehaviorController';
import {applyLocomotion,turnTowards} from './miniOfficeLocomotion';
const officeGround=()=>-.0125;

export function updateCharacters(characters:Character[],elapsed:number,reduced:boolean,controller:OfficeBehaviorController,fixtures:OfficeFixtures){
  // Freeze an already visible pose on preference changes; first reduced render stays seated.
  if(reduced&&characters.every(c=>c.animationTime!==null))return;
  const time=reduced?0:elapsed;controller.updateRoutine(time,characters,reduced);
  let delivery:DirectedPose|null=null;
  for(const c of characters){
    const previousTime=c.animationTime,dt=previousTime===null?0:Math.max(0,time-previousTime);c.animationTime=time;
    const pose=reduced?null:controller.pose(c.name,time),sit=pose?.sit??1,walking=pose?.walking??false;
    if(c.name==='Secretaria')delivery=pose;
    c.state=pose?.state??'WORKING';c.actionPhase=pose?.phase??-1;
    c.root.position.set(pose?.position.x??c.desk.x,0,pose?.position.y??c.desk.z);
    c.root.rotation.y=turnTowards(c.root.rotation.y,pose?.yaw??0,Math.min(dt,.1));
    c.hip.position.y=THREE.MathUtils.lerp(1.0,.84,sit);
    c.leftThigh.rotation.set(-sit*1.15,0,0);c.rightThigh.rotation.set(-sit*1.15,0,0);
    c.leftShin.rotation.x=c.rightShin.rotation.x=sit*1.14;
    const seed=c.desk.x*.7+c.desk.z*.3;
    const typing=reduced?0:sit*Math.sin(time*(7.8+Math.abs(seed%2))+seed)*.055;
    const talking=!reduced&&c.state==='MEETING'?.15+Math.sin(time*2.2+seed)*.1:0;
    c.leftArm.rotation.x=-sit*.88-talking+typing;c.rightArm.rotation.x=-sit*.88-talking*.6-typing;
    c.leftForearm.rotation.x=-sit*.42-talking*.5;c.rightForearm.rotation.x=-sit*.42;
    c.locomotion.path=pose?.path??null;c.locomotion.pathDistance=pose?.pathDistance??0;
    if(!reduced)applyLocomotion(c,time,walking,sit,officeGround);
    if(!reduced&&controller.isGreeting(c.name,time)){c.rightArm.rotation.x=-1.3;c.rightForearm.rotation.x=-.55+Math.sin(time*5)*.14;}
    const coffee=c.state==='COFFEE_BREAK';c.coffeeCup.visible=coffee;
    if(coffee){const sip=(Math.sin(time*2.1)+1)*.5;c.rightArm.rotation.x=-1.18-sip*.23;c.rightForearm.rotation.x=-.82-sip*.16;c.coffeeCup.rotation.x=-c.rightArm.rotation.x-c.rightForearm.rotation.x;c.leftArm.rotation.x=-.18;}
    const carrying=c.name==='Secretaria'&&!!pose&&pose.phase>=12&&pose.phase<26;c.documents.visible=carrying;
    if(carrying){c.leftArm.rotation.x=-.88;c.leftForearm.rotation.x=-.48;}
    if(c.state==='PRINTING'){c.rightArm.rotation.x=-.95;c.rightForearm.rotation.x=-.5+Math.sin(time*3)*.05;}
    c.head.rotation.x=coffee?Math.sin(time*2.1)*.035:0;
    c.head.rotation.y=reduced?0:Math.sin(time*.78+seed)*.065;c.head.rotation.z=reduced?0:Math.sin(time*1.05+seed)*.023;
    const chair=fixtures.chairs?.get(c.name);if(chair){const tuck=1-sit;chair.position.z=tuck*.65;chair.scale.y=1-tuck*.14;}
  }
  const jesus=characters.find(c=>c.name==='Jesús');if(jesus&&delivery&&delivery.phase>=24&&delivery.phase<28){jesus.rightArm.rotation.x=-.9;jesus.head.rotation.y=-.25;}
  fixtures.printerPaper.visible=!!delivery&&delivery.phase>=8&&delivery.phase<12;
  if(delivery)fixtures.printerPaper.position.z=.39+THREE.MathUtils.clamp((delivery.phase-8)/4,0,1)*.2;
  fixtures.printerLight.visible=!!delivery&&delivery.phase>=7&&delivery.phase<12&&Math.sin(time*14)>0;
  fixtures.deliveredPaper.visible=(!!delivery&&delivery.phase>=26)||time<controller.deliveredUntil;
}
