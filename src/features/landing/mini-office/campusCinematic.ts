import * as THREE from 'three';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { campusTokens as T } from './campusDesignTokens';

/** Scene-linear grade fused into Three's output pass: one HDR read instead of two. */
export function cinematicPass() {
  const pass=new OutputPass(),source=pass.material.fragmentShader;
  if(!source.includes('// tone mapping')||!source.includes('uniform sampler2D tDiffuse;'))throw new Error('Revisar el adaptador cinematográfico al actualizar Three.js.');
  pass.uniforms.saturation={value:T.lighting.editorialSaturation};pass.uniforms.vignette={value:T.lighting.vignette};
  pass.material.fragmentShader=source.replace('uniform sampler2D tDiffuse;','uniform sampler2D tDiffuse; uniform float saturation; uniform float vignette;')
    .replace('// tone mapping',`vec3 c=gl_FragColor.rgb;
      float l=dot(c,vec3(.2126,.7152,.0722));
      c=mix(vec3(l),c,saturation);
      c*=mix(vec3(.95,1.0,1.065),vec3(1.025,1.0,.965),smoothstep(.02,.8,l));
      c*=1.0-vignette*smoothstep(.22,.75,length(vUv-.5));
      gl_FragColor.rgb=max(c,vec3(0.0));
      // tone mapping`);
  return pass;
}

export function studioReflectionCards(studio:THREE.Scene) {
  const add=(w:number,h:number,x:number,y:number,z:number,warm:boolean) => {
    const mat=new THREE.MeshBasicMaterial({color:new THREE.Color(warm?0xffdbac:0xe3eef7).multiplyScalar(3),side:THREE.DoubleSide});
    const card=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); card.position.set(x,y,z); card.lookAt(0,1,0); studio.add(card);
  };
  add(14,3,-9,6,4,true); add(12,2,6,8,-7,false); add(3,9,9,4,3,false);
}
