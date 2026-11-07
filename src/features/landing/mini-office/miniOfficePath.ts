export type Point = readonly [number, number];
export type PathSample = { x:number; z:number; yaw:number };
export const smooth = (n:number) => {const t=Math.max(0,Math.min(1,n));return t*t*(3-2*t)};

/** Arc lengths and softened corners are prepared once, never rebuilt in a frame. */
export class MotionPath {
  readonly points: Point[];
  readonly lengths: number[]=[];
  readonly length:number;
  constructor(points:readonly Point[], radius=.16) {
    const clean=points.filter((p,i)=>!i||Math.hypot(p[0]-points[i-1][0],p[1]-points[i-1][1])>.0001);
    const rounded:Point[]=[clean[0]];
    for(let i=1;radius>0&&i<clean.length-1;i++) {
      const a=clean[i-1],b=clean[i],c=clean[i+1];
      const ab=Math.hypot(b[0]-a[0],b[1]-a[1]),bc=Math.hypot(c[0]-b[0],c[1]-b[1]);
      const r=Math.min(radius,ab*.25,bc*.25);
      const ax=b[0]+(a[0]-b[0])*r/ab,az=b[1]+(a[1]-b[1])*r/ab;
      const cx=b[0]+(c[0]-b[0])*r/bc,cz=b[1]+(c[1]-b[1])*r/bc;
      rounded.push([ax,az]);
      for(let j=1;j<=5;j++){const t=j/5,u=1-t;rounded.push([u*u*ax+2*u*t*b[0]+t*t*cx,u*u*az+2*u*t*b[1]+t*t*cz]);}
    }
    if(radius<=0)rounded.push(...clean.slice(1));else rounded.push(clean[clean.length-1]);this.points=rounded;
    let length=0;for(let i=1;i<rounded.length;i++){length+=Math.hypot(rounded[i][0]-rounded[i-1][0],rounded[i][1]-rounded[i-1][1]);this.lengths.push(length);}this.length=length;
  }
  sample(distance:number,out:PathSample) {
    const d=Math.max(0,Math.min(this.length,distance));let i=0;
    let hi=this.lengths.length-1;while(i<hi){const mid=(i+hi)>>1;if(d>this.lengths[mid])i=mid+1;else hi=mid;}
    const a=this.points[i],b=this.points[i+1],start=i?this.lengths[i-1]:0,length=this.lengths[i]-start;
    const t=length>0?(d-start)/length:0;out.x=a[0]+(b[0]-a[0])*t;out.z=a[1]+(b[1]-a[1])*t;out.yaw=Math.atan2(b[0]-a[0],b[1]-a[1]);return out;
  }
  reverse(){return new MotionPath([...this.points].reverse(),0)}
}

/** Exit behind the desk, away from the chair. Work coordinates are kept unchanged. */
export function seatExit(desk:{x:number;z:number}, name:string):Point {
  const sign=name==='Jesús'?1:name==='Cristina'?-1:name==='Hera'?1:-1;
  return [desk.x+sign*.8,desk.z-.72];
}
export function aisleX(name:string,scale=1) {
  return (name==='Jesús'||name==='Cristina'?0:name==='Zeus'?-2.025:name==='Hera'?2.025:name==='Apolo'?-2.025:-6.075)*scale;
}

/** Smooth acceleration into a cruise speed, rather than accelerating across the entire trip. */
export function travelDistance(time:number,length:number,duration:number){
  const t=Math.max(0,Math.min(duration,time)),a=Math.min(.7,duration/3),v=length/(duration-a);
  const ramp=(u:number)=>u*u*u-.5*u*u*u*u;
  if(t<a)return v*a*ramp(t/a);
  if(t>duration-a)return length-v*a*ramp((duration-t)/a);
  return v*(t-a/2);
}
export const walkingDuration=(path:MotionPath)=>Math.max(4,path.length/.95+.7);
