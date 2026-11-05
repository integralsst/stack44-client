import * as THREE from 'three';
import type { Character } from './miniOfficeCharacters';

const cycle = 120;
const events: Record<string, { start: number; end: number; target: [number, number]; kind: 'meeting' | 'coffee' }> = {
  Zeus: { start: 12, end: 42, target: [3.05, 2.65], kind: 'meeting' },
  Hera: { start: 15, end: 43, target: [5.7, 3.5], kind: 'meeting' },
  Jesús: { start: 52, end: 80, target: [3.05, 2.65], kind: 'meeting' },
  Cristina: { start: 55, end: 81, target: [5.7, 3.5], kind: 'meeting' },
  Apolo: { start: 88, end: 110, target: [3.35, -2.55], kind: 'coffee' },
};
const ease = (t: number) => { const v = THREE.MathUtils.clamp(t, 0, 1); return v * v * (3 - 2 * v); };

function route(c: Character, target: [number, number]) {
  const rear = c.desk.z < 0;
  return rear
    ? [[c.desk.x, c.desk.z], [c.desk.x, -1.23], [3.1, -1.23], [3.1, target[1]], target]
    : [[c.desk.x, c.desk.z], [c.desk.x, 2.7], [3.1, 2.7], [3.1, target[1]], target];
}
function follow(points: number[][], t: number) {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  const total = lengths.reduce((a, b) => a + b, 0); let distance = total * THREE.MathUtils.clamp(t, 0, 1);
  for (let i = 0; i < lengths.length; i++) {
    if (distance <= lengths[i] || i === lengths.length - 1) {
      const u = lengths[i] ? distance / lengths[i] : 0;
      return new THREE.Vector2(THREE.MathUtils.lerp(points[i][0], points[i + 1][0], u), THREE.MathUtils.lerp(points[i][1], points[i + 1][1], u));
    }
    distance -= lengths[i];
  }
  return new THREE.Vector2(points[0][0], points[0][1]);
}

export function updateCharacters(characters: Character[], elapsed: number, reducedMotion: boolean) {
  const motionTime = reducedMotion ? 0 : elapsed;
  const t = motionTime % cycle;
  for (const c of characters) {
    const event = events[c.name]; const atDesk = !event || t < event.start || t >= event.end;
    let sit = 1; let walking = false; let pos = new THREE.Vector2(c.desk.x, c.desk.z);
    let desiredYaw = Math.PI / 2;
    if (!atDesk && event) {
      sit = 0;
      const e = t - event.start, duration = event.end - event.start;
      const outward = route(c, event.target);
      const inward = [...outward].reverse();
      if (e < 2) { sit = 1 - ease(e / 2); c.state = 'STANDING_UP'; }
      else if (e < 10) { pos = follow(outward, ease((e - 2) / 8)); walking = true; c.state = 'WALKING'; }
      else if (e < duration - 10) { pos.set(...event.target); c.state = event.kind === 'coffee' ? 'COFFEE_BREAK' : 'MEETING'; }
      else if (e < duration - 2) { pos = follow(inward, ease((e - (duration - 10)) / 8)); walking = true; c.state = 'RETURNING_TO_DESK'; }
      else { sit = ease((e - (duration - 2)) / 2); c.state = 'SITTING'; }
      if (walking) {
        const next = e < 10 ? follow(outward, ease((e - 2 + .08) / 8)) : follow(inward, ease((e - (duration - 10) + .08) / 8));
        const heading = Math.atan2(next.x - pos.x, next.y - pos.y);
        desiredYaw = heading;
      } else if (sit < .5) {
        desiredYaw = event.kind === 'meeting' ? (c.name === 'Zeus' || c.name === 'Jesús' ? 1.0 : -1.4) : Math.PI / 2;
      }
    } else c.state = 'WORKING';
    c.root.position.set(pos.x, walking ? Math.abs(Math.sin(motionTime * 9)) * .045 : 0, pos.y);
    const delta = Math.atan2(Math.sin(desiredYaw - c.root.rotation.y), Math.cos(desiredYaw - c.root.rotation.y));
    c.root.rotation.y += delta * .13;
    c.hip.position.y = THREE.MathUtils.lerp(1.06, .84, sit);
    const stride = walking ? Math.sin(motionTime * 8) * .48 : 0;
    c.leftThigh.rotation.x = -sit * 1.15 + stride;
    c.rightThigh.rotation.x = -sit * 1.15 - stride;
    c.leftShin.rotation.x = sit * 1.14 + (walking ? Math.max(0, -stride) * .45 : 0);
    c.rightShin.rotation.x = sit * 1.14 + (walking ? Math.max(0, stride) * .45 : 0);
    const typing = reducedMotion ? 0 : sit * Math.sin(motionTime * 9 + c.desk.x) * .035;
    c.leftArm.rotation.x = -sit * 1.0 - (walking ? stride * .75 : 0) + typing;
    c.rightArm.rotation.x = -sit * 1.0 + (walking ? stride * .75 : 0) - typing;
    c.leftForearm.rotation.x = -sit * .38;
    c.rightForearm.rotation.x = -sit * .38;
    c.head.rotation.y = reducedMotion ? 0 : Math.sin(motionTime * .8 + c.desk.x) * .06;
    c.head.rotation.z = reducedMotion ? 0 : Math.sin(motionTime * 1.1 + c.desk.z) * .025;
  }
}
