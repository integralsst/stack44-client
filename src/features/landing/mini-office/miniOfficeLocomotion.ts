import * as THREE from 'three';
import type {Character} from './miniOfficeCharacters';
import type {MotionPath,PathSample} from './miniOfficePath';
import {smooth} from './miniOfficePath';

export type Ground=(x:number,z:number)=>number;
type Foot={x:number;y:number;z:number;yaw:number;startX:number;startY:number;startZ:number;startYaw:number;endX:number;endY:number;endZ:number;endYaw:number;swing:boolean;progress:number};
export type Locomotion={lastX:number;lastZ:number;lastYaw:number;lastTime:number|null;distance:number;cycleDistance:number;speed:number;moving:boolean;initialized:boolean;settle:number;phase:number;path:MotionPath|null;pathDistance:number;sample:PathSample;feet:[Foot,Foot];supportError:number;bodyHeight:number;translating:boolean};
export function createLocomotion():Locomotion {
  const foot=():Foot=>({x:0,y:0,z:0,yaw:0,startX:0,startY:0,startZ:0,startYaw:0,endX:0,endY:0,endZ:0,endYaw:0,swing:false,progress:1});
  return {lastX:0,lastZ:0,lastYaw:0,lastTime:null,distance:0,cycleDistance:0,speed:0,moving:false,initialized:false,settle:0,phase:0,path:null,pathDistance:0,sample:{x:0,z:0,yaw:0},feet:[foot(),foot()],supportError:0,bodyHeight:1,translating:false};
}
const angle=(a:number,b:number)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export function turnTowards(current:number,target:number,dt:number) {const change=angle(current,target)*(1-Math.exp(-Math.max(0,dt)*10));return current+THREE.MathUtils.clamp(change,-4*dt,4*dt);}
const CYCLE=.9, UPPER=.43, LOWER=.61, SOLE=.06;

function groundForFoot(ground:Ground,x:number,z:number,yaw:number,scale:number){
  // Sample toe/heel too: an entire sole stays above step edges.
  const s=Math.sin(yaw)*.22*scale,c=Math.cos(yaw)*.22*scale;
  return Math.max(ground(x,z),ground(x+s,z+c),ground(x-s,z-c));
}
function neutral(c:Character,f:Foot,side:number,ground:Ground) {
  const yaw=c.root.rotation.y,scale=c.root.scale.x,s=Math.sin(yaw),co=Math.cos(yaw);
  f.x=c.root.position.x+(side*.21*co+.08*s)*scale;f.z=c.root.position.z+(-side*.21*s+.08*co)*scale;
  f.y=groundForFoot(ground,f.x,f.z,yaw,scale);f.yaw=yaw;f.swing=false;f.progress=1;
}
function solve(c:Character,f:Foot,side:number) {
  const scale=c.root.scale.x,yaw=c.root.rotation.y,sy=Math.sin(yaw),cy=Math.cos(yaw);
  const dx=(f.x-c.root.position.x)/scale-Math.sin(f.yaw)*.08,dz=(f.z-c.root.position.z)/scale-Math.cos(f.yaw)*.08;
  const x=dx*cy-dz*sy-side*.21,y=(f.y+SOLE*scale-c.root.position.y)/scale-c.hip.position.y,z=dx*sy+dz*cy;
  const vertical=Math.hypot(x,y),r=Math.max(.2,Math.min(UPPER+LOWER-.001,Math.hypot(vertical,z)));
  const knee=Math.acos(THREE.MathUtils.clamp((r*r-UPPER*UPPER-LOWER*LOWER)/(2*UPPER*LOWER),-1,1));
  const hip=Math.atan2(-z,vertical)-Math.atan2(LOWER*Math.sin(knee),UPPER+LOWER*Math.cos(knee));
  const roll=Math.atan2(x,-y),thigh=side<0?c.leftThigh:c.rightThigh,shin=side<0?c.leftShin:c.rightShin,foot=side<0?c.leftFoot:c.rightFoot;
  thigh.rotation.set(hip,0,roll,'ZXY');shin.rotation.x=knee;foot.rotation.set(-hip-knee,angle(yaw,f.yaw),-roll,'XZY');
}

/** Distance-driven stance/swing cycle with planted world-space feet and two-bone IK. */
export function applyLocomotion(c:Character,time:number,allowed:boolean,sit:number,ground:Ground) {
  const g=c.locomotion,x=c.root.position.x,z=c.root.position.z,yaw=c.root.rotation.y,scale=c.root.scale.x;
  const rawDt=g.lastTime===null?0:Math.max(0,time-g.lastTime),dt=Math.min(rawDt,.05);
  const distance=g.lastTime===null?0:Math.hypot(x-g.lastX,z-g.lastZ),turn=g.lastTime===null?0:Math.abs(angle(g.lastYaw,yaw));
  g.lastX=x;g.lastZ=z;g.lastYaw=yaw;g.lastTime=time;
  if(sit>.01) {
    g.initialized=false;g.moving=false;g.translating=false;g.speed=0;g.bodyHeight=c.hip.position.y;c.torso.rotation.set(0,0,0);
    for(let i=0;i<2;i++){const f=g.feet[i];neutral(c,f,i?1:-1,ground);f.x+=Math.sin(yaw)*.4*sit*scale;f.z+=Math.cos(yaw)*.4*sit*scale;f.y=groundForFoot(ground,f.x,f.z,yaw,scale);solve(c,f,i?1:-1);}return;
  }
  if(!g.initialized||rawDt>.25) {neutral(c,g.feet[0],-1,ground);neutral(c,g.feet[1],1,ground);g.initialized=true;g.cycleDistance=0;g.speed=0;}
  const moving=allowed&&distance>1e-6,pivot=!moving&&turn>.002;
  if(moving&&!g.translating){
    const heading=g.path?g.path.sample(g.pathDistance,g.sample).yaw:yaw,s=Math.sin(heading),co=Math.cos(heading);
    const left=(g.feet[0].x-x)*s+(g.feet[0].z-z)*co,right=(g.feet[1].x-x)*s+(g.feet[1].z-z)*co;
    g.cycleDistance=left<=right?0:CYCLE*.5;g.feet[0].swing=g.feet[1].swing=false;
  }
  g.translating=moving;
  g.distance+=distance/scale;
  g.speed=THREE.MathUtils.lerp(g.speed,rawDt>0&&rawDt<.25?distance/rawDt:0,1-Math.exp(-dt*12));
  g.cycleDistance+=(moving?distance/scale:0)+(pivot?turn*.18:0);g.phase=(g.cycleDistance/CYCLE)%1;
  const wasMoving=g.moving;g.moving=moving||pivot;
  if(!g.moving&&wasMoving)g.settle=.22;
  if(g.moving)g.settle=0;
  const velocityGain=Math.min(1,g.speed/(.65*scale)),lift=(pivot?.075:.12)*scale;
  for(let i=0;i<2;i++) {
    const side=i?1:-1,f=g.feet[i],phase=(g.phase+i*.5)%1;
    if(g.moving&&phase<.4) {
      if(!f.swing) {
        f.startX=f.x;f.startY=f.y;f.startZ=f.z;f.startYaw=f.yaw;
        let tx=x,tz=z,heading=yaw;
        if(moving&&g.path){g.path.sample(g.pathDistance+CYCLE*.7*scale,g.sample);tx=g.sample.x;tz=g.sample.z;heading=g.sample.yaw;}
        else if(moving){const a=Math.atan2(x-g.lastX,z-g.lastZ);heading=Number.isFinite(a)&&distance>1e-6?yaw:heading;tx+=Math.sin(heading)*CYCLE*.7*scale;tz+=Math.cos(heading)*CYCLE*.7*scale;}
        f.endX=tx+(side*.21*Math.cos(heading)+.08*Math.sin(heading))*scale;
        f.endZ=tz+(-side*.21*Math.sin(heading)+.08*Math.cos(heading))*scale;
        f.endYaw=heading;f.endY=groundForFoot(ground,f.endX,f.endZ,heading,scale);f.swing=true;
      }
      const progress=phase/.4,e=smooth(progress);f.progress=progress;
      f.x=THREE.MathUtils.lerp(f.startX,f.endX,e);f.z=THREE.MathUtils.lerp(f.startZ,f.endZ,e);
      f.y=THREE.MathUtils.lerp(f.startY,f.endY,e)+Math.sin(progress*Math.PI)*(lift+Math.max(0,f.endY-f.startY)*.35);
      f.yaw=f.startYaw+angle(f.startYaw,f.endYaw)*e;f.y=Math.max(f.y,groundForFoot(ground,f.x,f.z,f.yaw,scale));
    } else if(f.swing&&g.moving) {f.x=f.endX;f.y=f.endY;f.z=f.endZ;f.yaw=f.endYaw;f.swing=false;f.progress=1;}
    else if(!g.moving&&g.settle>0) {
      const blend=Math.min(1,dt/Math.max(.01,g.settle));
      const nx=x+(side*.21*Math.cos(yaw)+.08*Math.sin(yaw))*scale,nz=z+(-side*.21*Math.sin(yaw)+.08*Math.cos(yaw))*scale;
      f.x=THREE.MathUtils.lerp(f.x,nx,blend);f.z=THREE.MathUtils.lerp(f.z,nz,blend);f.y=THREE.MathUtils.lerp(f.y,groundForFoot(ground,nx,nz,yaw,scale),blend);f.yaw+=angle(f.yaw,yaw)*blend;f.swing=false;f.progress=1;
    }
  }
  // Transfer body weight between step levels without stretching a planted leg.
  let available=c.hip.position.y;
  for(const f of g.feet){
    const dx=(f.x-x)/scale-Math.sin(f.yaw)*.08,dz=(f.z-z)/scale-Math.cos(f.yaw)*.08;
    const side=f===g.feet[0]?-1:1;
    const lx=dx*Math.cos(yaw)-dz*Math.sin(yaw)-side*.21,lz=dx*Math.sin(yaw)+dz*Math.cos(yaw);
    const reach=Math.sqrt(Math.max(.02,(UPPER+LOWER-.003)**2-lx*lx-lz*lz));
    available=Math.min(available,(f.y+SOLE*scale-c.root.position.y)/scale+reach);
  }
  const desired=Math.max(.55,available);
  g.bodyHeight=desired<g.bodyHeight?desired:THREE.MathUtils.lerp(g.bodyHeight,desired,1-Math.exp(-dt*10));c.hip.position.y=g.bodyHeight;
  solve(c,g.feet[0],-1);solve(c,g.feet[1],1);
  g.settle=Math.max(0,g.settle-dt);
  c.torso.rotation.x=g.moving?.035*velocityGain:0;c.torso.rotation.z=g.moving?Math.sin(g.phase*Math.PI*4)*.018*velocityGain:0;
  const arms=g.moving?Math.sin(g.phase*Math.PI*2)*.34*velocityGain:0;c.leftArm.rotation.x=arms;c.rightArm.rotation.x=-arms;
}
