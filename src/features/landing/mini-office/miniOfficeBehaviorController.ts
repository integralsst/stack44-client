import {campusTokens as T} from './campusDesignTokens';
import * as THREE from 'three';
import type {Character,Behavior} from './miniOfficeCharacters';
import {MotionPath,seatExit,aisleX,smooth,travelDistance,walkingDuration,type Point,type PathSample} from './miniOfficePath';

export type OfficeAction='printer'|'coffee'|'meeting';
export type DirectedPose={position:THREE.Vector2;sit:number;walking:boolean;yaw:number;state:Behavior;phase:number;kind:OfficeAction;path:MotionPath|null;pathDistance:number};
type Job={outEnd:number;activityEnd:number;returnStart:number;returnEnd:number;kind:OfficeAction;actor:string;start:number;duration:number;from:Point;exit:Point;desk:Point;startSit:number;outward:MotionPath;delivery:MotionPath;inward:MotionPath;result:DirectedPose;sample:PathSample};
type Pending={kind:OfficeAction;names:readonly string[];requestedAt:number};
const MAIN=['Zeus','Hera'] as const,EXEC=['Jesús','Cristina'] as const,PRINT=['Secretaria'] as const,COFFEE=['Apolo'] as const;

function travel(job:Job,path:MotionPath,time:number,duration:number){
  const r=job.result;r.path=path;r.pathDistance=travelDistance(time,path.length,duration);path.sample(r.pathDistance,job.sample);r.position.set(job.sample.x,job.sample.z);r.yaw=job.sample.yaw;r.walking=true;
}

/** One scheduler owns every activity. Shared left circulation is reserved, never teleported through. */
export class OfficeBehaviorController {
  private jobs=new Map<string,Job>();
  private pending:Pending[]=[];
  private greeted=new Map<string,number>();
  private lastEnd:Record<OfficeAction,number>={printer:0,coffee:0,meeting:0};
  private automatic:boolean;
  private schedule=[{at:T.motion.firstRoutine,kind:'printer' as OfficeAction,names:PRINT,cycle:-1},{at:6,kind:'coffee' as OfficeAction,names:COFFEE,cycle:-1},
    {at:42,kind:'meeting' as OfficeAction,names:MAIN,cycle:-1},{at:82,kind:'meeting' as OfficeAction,names:EXEC,cycle:-1}];
  deliveredUntil=0;
  constructor(options:{automatic?:boolean}={}){this.automatic=options.automatic??true;}
  greet(name:string,time:number){this.greeted.set(name,time+3.5);}
  isGreeting(name:string,time:number){return (this.greeted.get(name)??0)>time;}
  private prune(time:number){
    for(const [name,job] of this.jobs)if(time>=job.start+job.duration){
      if(job.kind==='printer')this.deliveredUntil=job.start+job.duration+8;
      this.jobs.delete(name);
    }
  }
  private busyUntil(kind:OfficeAction){let end=0;for(const job of this.jobs.values())if(kind==='meeting'||job.kind==='meeting'||(kind==='coffee')===(job.kind==='coffee'))end=Math.max(end,job.start+job.duration);return end;}
  request(kind:OfficeAction,time:number,characters:Character[],names:readonly string[]=kind==='printer'?PRINT:kind==='coffee'?COFFEE:MAIN,repeat=true){
    this.prune(time);
    const active=names.some(name=>this.jobs.has(name));
    if(active&&(!repeat||names.every(name=>{const job=this.jobs.get(name);return job&&time<job.start+job.activityEnd;})))return;
    if(this.pending.some(p=>p.kind===kind&&p.names[0]===names[0]))return;
    const entry={kind,names,requestedAt:time};if(repeat)this.pending.unshift(entry);else this.pending.push(entry);this.flush(time,characters);
  }
  private flush(time:number,characters:Character[]){
    for(let i=0;i<this.pending.length;){
      const p=this.pending[i];if(this.busyUntil(p.kind)>time||p.names.some(name=>this.jobs.has(name))){i++;continue;}
      const available=p.kind==='meeting'?Math.max(this.lastEnd.printer,this.lastEnd.coffee,this.lastEnd.meeting):Math.max(this.lastEnd[p.kind],this.lastEnd.meeting);
      const start=Math.max(p.requestedAt,available);
      if(start>time){i++;continue;}
      const created:Job[]=[];
      p.names.forEach((name,index)=>{const actor=characters.find(c=>c.name===name);if(actor)created.push(this.createJob(p.kind,start+(p.kind==='meeting'?index*1.5:0),actor));});
      if(p.kind==='meeting'){
        const sharedEnd=Math.max(...created.map(job=>job.start+job.activityEnd));
        created.forEach((job,index)=>{job.activityEnd=sharedEnd-job.start;job.returnStart=job.activityEnd+index*1.5;job.returnEnd=job.returnStart+walkingDuration(job.inward);job.duration=job.returnEnd+2;});
      }
      this.lastEnd[p.kind]=Math.max(...created.map(job=>job.start+job.duration));
      this.pending.splice(i,1);
    }
  }
  private createJob(kind:OfficeAction,start:number,c:Character){
    const from:Point=[c.root.position.x,c.root.position.z],desk:Point=[c.desk.x,c.desk.z];
    const seated=Math.hypot(from[0]-desk[0],from[1]-desk[1])<.5;
    const exit:Point=seated?seatExit(c.desk,c.name):from;
    const second=c.name==='Hera'||c.name==='Cristina',aisle=aisleX(c.name,c.spaceScale.x);
    const target:Point=kind==='printer'?[-8.85,1.72]:kind==='coffee'?[6.64,-2.3]:second?[-9.05,-.43]:[-7,-.43];
    let points:Point[];
    if(kind==='printer')points=[exit,target];
    else{
      points=[exit,[aisle,exit[1]],[aisle,-.58]];
      if(kind==='coffee')points.push([6.55,-.58],target);
      else if(second)points.push([-6.075,-.58],[-6.075,.5],[-7.5,.5],target);
      else points.push([-6.075,0],target);
    }
    const outward=new MotionPath(points);
    const delivery=new MotionPath([target,[-7.7,1.72],[-7.7,0],[-4.15,0],[-3.35,-1.98]]);
    const inward=kind==='printer'?new MotionPath([[-3.35,-1.98],[-4.15,0],[-7.7,0],[-7.7,exit[1]],exit]):outward.reverse();
    const outEnd=kind==='printer'?7:2+walkingDuration(outward),activityEnd=kind==='printer'?15:outEnd+10;
    const returnStart=kind==='printer'?28:activityEnd,returnEnd=kind==='printer'?36:returnStart+walkingDuration(inward);
    const job:Job={kind,actor:c.name,start,duration:returnEnd+2,outEnd,activityEnd,returnStart,returnEnd,from,exit,desk,startSit:seated?1:0,outward,delivery,inward,
      sample:{x:0,z:0,yaw:0},result:{position:new THREE.Vector2(...from),sit:1,walking:false,yaw:0,state:'WORKING',phase:0,kind,path:null,pathDistance:0}};this.jobs.set(c.name,job);return job;
  }
  updateRoutine(time:number,characters:Character[],reduced:boolean){
    if(reduced)return;this.prune(time);
    if(this.automatic){const cycle=Math.floor(time/T.motion.routineCycle);for(const event of this.schedule){const due=cycle*T.motion.routineCycle+event.at;if(time>=due&&event.cycle!==cycle){event.cycle=cycle;this.request(event.kind,due,characters,event.names,false);}}}
    this.flush(time,characters);
  }
  pose(name:string,time:number):DirectedPose|null{
    const job=this.jobs.get(name);if(!job)return null;
    const phase=time-job.start,r=job.result,printer=job.kind==='printer';
    if(phase>=job.duration)return null;
    r.phase=phase;r.sit=0;r.walking=false;r.path=null;r.pathDistance=0;r.yaw=0;r.state='WALKING';
    if(phase<0){r.position.set(...job.from);r.sit=job.startSit;r.state='WORKING';return r;}
    const {outEnd,activityEnd,returnStart,returnEnd}=job;

    if(phase<2){const t=smooth(phase/2);r.sit=job.startSit*(1-t);r.position.set(THREE.MathUtils.lerp(job.from[0],job.exit[0],t),THREE.MathUtils.lerp(job.from[1],job.exit[1],t));r.state='STANDING_UP';}
    else if(phase<outEnd)travel(job,job.outward,phase-2,outEnd-2);
    else if(phase<(printer?activityEnd:returnStart)){job.outward.sample(job.outward.length,job.sample);r.position.set(job.sample.x,job.sample.z);r.state=printer?'PRINTING':job.kind==='coffee'?'COFFEE_BREAK':'MEETING';r.yaw=printer?Math.PI:job.kind==='coffee'?2.3:job.actor==='Zeus'||job.actor==='Jesús'?-1:2.15;}
    else if(printer&&phase<24){travel(job,job.delivery,phase-15,9);r.state='DELIVERING';}
    else if(printer&&phase<28){job.delivery.sample(job.delivery.length,job.sample);r.position.set(job.sample.x,job.sample.z);r.yaw=2.47;r.state='DELIVERING';}
    else if(phase<returnEnd){travel(job,job.inward,phase-returnStart,returnEnd-returnStart);r.state='RETURNING_TO_DESK';}
    else {const t=smooth((phase-returnEnd)/2);r.position.set(THREE.MathUtils.lerp(job.exit[0],job.desk[0],t),THREE.MathUtils.lerp(job.exit[1],job.desk[1],t));r.sit=t;r.state='SITTING';}
    return r;
  }
}
