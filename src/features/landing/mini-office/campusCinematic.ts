import * as THREE from 'three';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { campusTokens as T } from './campusDesignTokens';

/** Gentle scene-linear split tone; OutputPass applies ACES and sRGB afterwards. */
export function cinematicPass() {
  return new ShaderPass({
    uniforms: { tDiffuse: {value:null}, saturation:{value:T.lighting.editorialSaturation}, vignette:{value:T.lighting.vignette} },
    vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
    fragmentShader:`uniform sampler2D tDiffuse; uniform float saturation; uniform float vignette; varying vec2 vUv;
      void main(){ vec4 sampleColor=texture2D(tDiffuse,vUv); vec3 c=sampleColor.rgb;
      float l=dot(c,vec3(.2126,.7152,.0722));
      c=mix(vec3(l),c,saturation);
      c*=mix(vec3(.95,1.0,1.065),vec3(1.025,1.0,.965),smoothstep(.02,.8,l));
      c*=1.0-vignette*smoothstep(.22,.75,length(vUv-.5));
      gl_FragColor=vec4(max(c,vec3(0.0)),sampleColor.a); }`,
  });
}

export function studioReflectionCards(studio:THREE.Scene) {
  const add=(w:number,h:number,x:number,y:number,z:number,warm:boolean) => {
    const mat=new THREE.MeshBasicMaterial({color:new THREE.Color(warm?0xffdbac:0xe3eef7).multiplyScalar(3),side:THREE.DoubleSide});
    const card=new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat); card.position.set(x,y,z); card.lookAt(0,1,0); studio.add(card);
  };
  add(14,3,-9,6,4,true); add(12,2,6,8,-7,false); add(3,9,9,4,3,false);
}
