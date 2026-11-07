import * as THREE from 'three';
import type { Character, Behavior } from './miniOfficeCharacters';

export type OfficeAction = 'printer' | 'coffee' | 'meeting';
type Point = [number, number];
type Job = { kind: OfficeAction; actor: string; start: number; from: Point; outward: Point[]; delivery: Point[]; inward: Point[]; duration: number };
export type DirectedPose = { position: THREE.Vector2; sit: number; walking: boolean; yaw: number; state: Behavior; phase: number; kind: OfficeAction };

const smooth = (n: number) => { const t = THREE.MathUtils.clamp(n, 0, 1); return t * t * (3 - 2 * t); };
function path(points: Point[], progress: number) {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let distance = lengths.reduce((a, b) => a + b, 0) * THREE.MathUtils.clamp(progress, 0, 1);
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i] || i === lengths.length - 1) {
      const t = lengths[i] ? distance / lengths[i] : 0;
      return new THREE.Vector2(THREE.MathUtils.lerp(points[i][0], points[i + 1][0], t), THREE.MathUtils.lerp(points[i][1], points[i + 1][1], t));
    }
    distance -= lengths[i];
  }
  return new THREE.Vector2(...points[0]);
}

/** Visitor requests own the selected actor until the actor is safely back at the desk. */
export class OfficeBehaviorController {
  private jobs = new Map<string, Job>();
  private offsets = new Map<string, number>();
  private nextRoutinePrint = .18;
  private greeted = new Map<string, number>();
  deliveredUntil = 0;

  autonomousTime(name: string, elapsed: number) { return elapsed - (this.offsets.get(name) ?? 0); }
  greet(name: string, elapsed: number) { this.greeted.set(name, elapsed + 3.5); }
  isGreeting(name: string, elapsed: number) { return (this.greeted.get(name) ?? 0) > elapsed; }

  request(kind: OfficeAction, elapsed: number, characters: Character[]) {
    const names = kind === 'meeting' ? ['Zeus', 'Hera'] : [kind === 'printer' ? 'Secretaria' : 'Apolo'];
    if (kind === 'printer' && characters.find(c => c.name === 'Secretaria')?.state !== 'WORKING') {
      return;
    }
    if (kind === 'printer') this.nextRoutinePrint = Math.max(this.nextRoutinePrint, elapsed + 120);
    for (const name of names) {
      const character = characters.find(c => c.name === name);
      if (!character) continue;
      const scale = character.spaceScale;
      const from: Point = [character.root.position.x, character.root.position.z];
      const desk: Point = [character.desk.x, character.desk.z];
      let outward: Point[];
      if (kind === 'printer') outward = [from, [-8.55 * scale.x, 1.72 * scale.z], [-8.85 * scale.x, 1.72 * scale.z]];
      else {
        const x = kind === 'coffee' ? 6.55 : -6.43;
        const target: Point = kind === 'coffee' ? [6.64 * scale.x, -2.3 * scale.z]
          : [(name === 'Zeus' ? -7 : -9.05) * scale.x, -.43 * scale.z];
        outward = [from, [from[0] + (name === 'Zeus' || name === 'Apolo' ? -1.3 : 1.3) * scale.x, from[1]],
          [from[0] + (name === 'Zeus' || name === 'Apolo' ? -1.3 : 1.3) * scale.x, -.58 * scale.z],
          [x * scale.x, -.58 * scale.z], target];
      }
      const delivery: Point[] = [[-8.85 * scale.x, 1.72 * scale.z], [-8.55 * scale.x, -.58 * scale.z],
        [-4.15 * scale.x, -.58 * scale.z], [-3.35 * scale.x, -1.98 * scale.z]];
      const inward = kind === 'printer'
        ? [[-3.35 * scale.x, -1.98 * scale.z], [-4.15 * scale.x, -.58 * scale.z],
          [-8.55 * scale.x, -.58 * scale.z], [-8.55 * scale.x, desk[1]], desk] as Point[]
        : [...outward].reverse().slice(0, -1).concat([desk]);
      this.jobs.set(name, { kind, actor: name, start: elapsed, from, outward, delivery, inward, duration: kind === 'printer' ? 38 : 30 });
    }
  }

  updateRoutine(elapsed: number, characters: Character[], reducedMotion: boolean) {
    if (reducedMotion || elapsed < this.nextRoutinePrint) return;
    if (characters.find(c => c.name === 'Secretaria')?.state !== 'WORKING' || this.jobs.has('Secretaria')) return;
    this.nextRoutinePrint = elapsed + 120;
    this.request('printer', elapsed, characters);
  }

  pose(name: string, elapsed: number): DirectedPose | null {
    const job = this.jobs.get(name);
    if (!job) return null;
    const phase = elapsed - job.start;
    if (phase >= job.duration) {
      if (job.kind === 'printer') this.deliveredUntil = elapsed + 8;
      this.jobs.delete(name); this.offsets.set(name, elapsed); return null;
    }
    const printer = job.kind === 'printer';
    const outboundEnd = printer ? 7 : 10;
    const activityEnd = printer ? 15 : 20;
    const returnEnd = job.duration - 2;
    let position = new THREE.Vector2(...job.from), sit = 0, walking = false, state: Behavior = 'WALKING';
    if (phase < 2) { sit = 1 - smooth(phase / 2); state = 'STANDING_UP'; }
    else if (phase < outboundEnd) { position = path(job.outward, smooth((phase - 2) / (outboundEnd - 2))); walking = true; }
    else if (phase < activityEnd) {
      position = path(job.outward, 1);
      state = printer ? 'PRINTING' : job.kind === 'coffee' ? 'COFFEE_BREAK' : 'MEETING';
    } else if (printer && phase < 24) {
      position = path(job.delivery, smooth((phase - 15) / 9));
      walking = true; state = 'DELIVERING';
    } else if (printer && phase < 28) {
      position = new THREE.Vector2(...job.inward[0]); state = 'DELIVERING';
    } else if (phase < returnEnd) {
      position = path(job.inward, smooth((phase - (printer ? 28 : activityEnd)) / (returnEnd - (printer ? 28 : activityEnd))));
      walking = true; state = 'RETURNING_TO_DESK';
    } else {
      position = path(job.inward, 1); sit = smooth((phase - returnEnd) / 2); state = 'SITTING';
    }
    const next = walking ? (printer && phase >= 15 && phase < 24
      ? path(job.delivery, smooth((phase - 14.92) / 9))
      : path(phase < outboundEnd ? job.outward : job.inward, smooth((phase - (phase < outboundEnd ? 1.92 : printer ? 27.92 : activityEnd - .08)) / (phase < outboundEnd ? outboundEnd - 2 : returnEnd - (printer ? 28 : activityEnd)))))
      : null;
    const yaw = next ? Math.atan2(next.x - position.x, next.y - position.y)
      : state === 'COFFEE_BREAK' ? .55 : state === 'DELIVERING' ? .4 : 0;
    return { position, sit, walking, yaw, state, phase, kind: job.kind };
  }
}
