import * as THREE from 'three';
import type { Character } from './miniOfficeCharacters';

const cycle = 120;
type Event = { start: number; end: number; target: [number, number]; kind: 'meeting' | 'coffee' };
const events: Record<string, Event> = {
  Zeus: { start: 12, end: 42, target: [-5.0, -.7], kind: 'meeting' },
  Hera: { start: 15, end: 43, target: [-6.35, .2], kind: 'meeting' },
  Jesús: { start: 52, end: 81, target: [-5.0, -.7], kind: 'meeting' },
  Cristina: { start: 55, end: 82, target: [-6.35, .2], kind: 'meeting' },
  Apolo: { start: 90, end: 112, target: [5.35, -2.35], kind: 'coffee' },
};
const ease = (value: number) => {
  const t = THREE.MathUtils.clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

function route(character: Character, event: Event, target: [number, number]) {
  const backRow = character.desk.z < -1;
  const offset = (character.name === 'Jesús' || character.name === 'Zeus' || character.name === 'Apolo' ? -1.6 : 1.6) * character.spaceScale.x;
  const sideX = character.desk.x + offset;
  const corridorZ = -.65 * character.spaceScale.z;
  const turnX = (event.kind === 'coffee' ? 5.15 : -5.1) * character.spaceScale.x;
  const points: number[][] = [
    [character.desk.x, character.desk.z],
    [sideX, character.desk.z],
    [sideX, corridorZ],
    [turnX, corridorZ],
  ];
  if (event.kind === 'coffee') points.push([turnX, target[1]]);
  else if (backRow) points.push([turnX, target[1]]);
  points.push(target);
  return points;
}

function follow(points: number[][], progress: number) {
  const lengths = points.slice(1).map((point, i) => Math.hypot(point[0] - points[i][0], point[1] - points[i][1]));
  const total = lengths.reduce((a, b) => a + b, 0);
  let remaining = total * THREE.MathUtils.clamp(progress, 0, 1);
  for (let i = 0; i < lengths.length; i++) {
    if (remaining <= lengths[i] || i === lengths.length - 1) {
      const t = lengths[i] ? remaining / lengths[i] : 0;
      return new THREE.Vector2(THREE.MathUtils.lerp(points[i][0], points[i + 1][0], t), THREE.MathUtils.lerp(points[i][1], points[i + 1][1], t));
    }
    remaining -= lengths[i];
  }
  return new THREE.Vector2(points[0][0], points[0][1]);
}

export function updateCharacters(characters: Character[], elapsed: number, reducedMotion: boolean) {
  const time = reducedMotion ? 0 : elapsed;
  const t = time % cycle;
  for (const character of characters) {
    const event = events[character.name];
    let sit = 1;
    let walking = false;
    let position = new THREE.Vector2(character.desk.x, character.desk.z);
    let desiredYaw = 0;
    if (event && t >= event.start && t < event.end) {
      sit = 0;
      const moment = t - event.start;
      const duration = event.end - event.start;
      const target: [number, number] = [event.target[0] * character.spaceScale.x, event.target[1] * character.spaceScale.z];
      const outward = route(character, event, target);
      const inward = [...outward].reverse();
      if (moment < 2) {
        sit = 1 - ease(moment / 2);
        character.state = 'STANDING_UP';
      } else if (moment < 10) {
        position = follow(outward, ease((moment - 2) / 8));
        walking = true; character.state = 'WALKING';
      } else if (moment < duration - 10) {
        position.set(...target);
        character.state = event.kind === 'coffee' ? 'COFFEE_BREAK' : (character.name === 'Zeus' || character.name === 'Hera' ? 'TALKING' : 'MEETING');
      } else if (moment < duration - 2) {
        position = follow(inward, ease((moment - duration + 10) / 8));
        walking = true; character.state = 'RETURNING_TO_DESK';
      } else {
        sit = ease((moment - duration + 2) / 2);
        character.state = 'SITTING';
      }
      if (walking) {
        const next = moment < 10
          ? follow(outward, ease((moment - 1.92) / 8))
          : follow(inward, ease((moment - duration + 10.08) / 8));
        desiredYaw = Math.atan2(next.x - position.x, next.y - position.y);
      } else if (sit < .5) {
        if (event.kind === 'coffee') desiredYaw = Math.PI;
        else desiredYaw = character.name === 'Zeus' || character.name === 'Jesús' ? -1.0 : 2.15;
      }
    } else character.state = 'WORKING';
    character.root.position.set(position.x, walking ? Math.abs(Math.sin(time * 8)) * .035 : 0, position.y);
    const delta = Math.atan2(Math.sin(desiredYaw - character.root.rotation.y), Math.cos(desiredYaw - character.root.rotation.y));
    character.root.rotation.y += delta * .14;
    character.hip.position.y = THREE.MathUtils.lerp(1.06, .84, sit);
    const stride = walking ? Math.sin(time * 7.5) * .44 : 0;
    character.leftThigh.rotation.x = -sit * 1.15 + stride;
    character.rightThigh.rotation.x = -sit * 1.15 - stride;
    character.leftShin.rotation.x = sit * 1.14 + (walking ? Math.max(0, -stride) * .42 : 0);
    character.rightShin.rotation.x = sit * 1.14 + (walking ? Math.max(0, stride) * .42 : 0);
    const typing = reducedMotion ? 0 : sit * Math.sin(time * 9 + character.desk.x) * .055;
    const talking = !reducedMotion && (character.state === 'MEETING' || character.state === 'TALKING') ? .18 + Math.sin(time * 2.7 + character.desk.x) * .12 : 0;
    character.leftArm.rotation.x = -sit * .88 - (walking ? stride * .7 : 0) - talking + typing;
    character.rightArm.rotation.x = -sit * .88 + (walking ? stride * .7 : 0) - talking * .6 - typing;
    character.leftForearm.rotation.x = -sit * .42 - talking * .5;
    character.rightForearm.rotation.x = -sit * .42;
    character.head.rotation.y = reducedMotion ? 0 : Math.sin(time * .78 + character.desk.x) * .065;
    character.head.rotation.z = reducedMotion ? 0 : Math.sin(time * 1.05 + character.desk.z) * .023;
  }
}
