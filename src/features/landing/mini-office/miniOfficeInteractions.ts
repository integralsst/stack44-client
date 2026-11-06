import * as THREE from 'three';
import type { Character } from './miniOfficeCharacters';
import type { OfficeTarget } from './miniOfficeContent';

/** Separate hit geometry keeps invisible furniture out of the raycast and enlarges mobile targets. */
export function createOfficeInteractions(architecture: THREE.Group, characters: Character[], mobile: boolean) {
  const material = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false });
  const targets: THREE.Mesh[] = [];
  const addHit = (parent: THREE.Object3D, target: OfficeTarget, geometry: THREE.BufferGeometry, x: number, y: number, z: number) => {
    const hit = new THREE.Mesh(geometry, material);
    hit.position.set(x, y, z); hit.userData.officeTarget = target;
    parent.add(hit); targets.push(hit);
  };
  for (const character of characters) {
    addHit(character.root, character.name as OfficeTarget,
      new THREE.SphereGeometry(mobile ? 1.08 : .92, 8, 6), 0, 1.7, 0);
  }
  addHit(architecture, 'meeting', new THREE.BoxGeometry(3.2, 1.3, 2.3), -8.1, 1.2, -1.9);
  addHit(architecture, 'printer', new THREE.BoxGeometry(1.9, 1.5, 1.3), -9.05, 1.1, .87);
  addHit(architecture, 'coffee', new THREE.BoxGeometry(3.2, 1.5, 1.4), 8.22, 1.35, -3.76);
  for (const mesh of architecture.children) {
    if (mesh instanceof THREE.Mesh && mesh.userData.officeAction === 'dashboard') {
      mesh.userData.officeTarget = 'dashboard'; targets.push(mesh);
    }
  }
  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();
  return {
    pick(clientX: number, clientY: number, canvas: HTMLCanvasElement, camera: THREE.Camera): OfficeTarget | null {
      const bounds = canvas.getBoundingClientRect();
      pointer.set(((clientX - bounds.left) / bounds.width) * 2 - 1, -((clientY - bounds.top) / bounds.height) * 2 + 1);
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(targets, false);
      const hit = hits.sort((a, b) => {
        const distance = (object: THREE.Object3D) => {
          const center = object.getWorldPosition(new THREE.Vector3()).project(camera);
          const x = bounds.left + (center.x + 1) * bounds.width / 2;
          const y = bounds.top + (1 - center.y) * bounds.height / 2;
          return (x - clientX) ** 2 + (y - clientY) ** 2;
        };
        return distance(a.object) - distance(b.object);
      })[0];
      return hit ? hit.object.userData.officeTarget as OfficeTarget : null;
    },
  };
}
