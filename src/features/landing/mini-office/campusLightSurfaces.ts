import * as THREE from 'three';
import { campusTokens as T } from './campusDesignTokens';

/** Low frequency irradiance/contact proxies complement a bounded set of real lights. */
export function createLightSurfaces(textures: THREE.Texture[]) {
  function texture(shadow: boolean) {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 128;
    const c = canvas.getContext('2d')!, gradient = c.createRadialGradient(64,64,0,64,64,64);
    gradient.addColorStop(0, shadow ? 'rgba(0,0,0,.8)' : 'rgba(255,193,103,.8)');
    gradient.addColorStop(.3, shadow ? 'rgba(0,0,0,.5)' : 'rgba(255,166,64,.35)');
    gradient.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = gradient; c.fillRect(0,0,128,128);
    const map = new THREE.CanvasTexture(canvas); map.colorSpace = THREE.SRGBColorSpace; textures.push(map); return map;
  }
  const plane = new THREE.PlaneGeometry(1, 1), shade = texture(true), warm = texture(false);
  const contactMaterial = new THREE.MeshBasicMaterial({ map: shade, transparent:true, opacity:T.lighting.contactOpacity, depthWrite:false, polygonOffset:true, polygonOffsetFactor:-1 });
  const washMaterial = new THREE.MeshBasicMaterial({ map:warm, transparent:true, opacity:.34, depthWrite:false, blending:THREE.AdditiveBlending, toneMapped:false });
  function patch(root: THREE.Object3D, x:number,y:number,z:number,w:number,d:number, shadow:boolean) {
    const mesh = new THREE.Mesh(plane, shadow ? contactMaterial : washMaterial);
    mesh.rotation.x=-Math.PI/2; mesh.position.set(x,y,z); mesh.scale.set(w,d,1); mesh.renderOrder=shadow?1:2; root.add(mesh); return mesh;
  }
  return {
    contact: (root:THREE.Object3D,x:number,y:number,z:number,w:number,d:number)=>patch(root,x,y,z,w,d,true),
    wash: (root:THREE.Object3D,x:number,y:number,z:number,w:number,d:number)=>patch(root,x,y,z,w,d,false),
  };
}
export type LightSurfaces = ReturnType<typeof createLightSurfaces>;
