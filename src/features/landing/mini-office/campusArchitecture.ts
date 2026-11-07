import * as THREE from 'three';
/** Shared footprint: a real opening for the short flight from lobby to the upper office. */
export function officeSlab(root:THREE.Object3D,width:number,depth:number,bottom:number,height:number,material:THREE.Material) {
  const rear=-.48-depth/2, front=-.48+depth/2;
  const outline=[[-width/2,rear],[width/2,rear],[width/2,front],[1.55,front],[1.55,3.55],[-1.55,3.55],[-1.55,front],[-width/2,front]];
  const shape=new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x,-z)));
  const mesh=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:height,steps:1,bevelEnabled:false}),material);
  mesh.rotation.x=-Math.PI/2;mesh.position.y=bottom;mesh.castShadow=true;mesh.receiveShadow=true;root.add(mesh);return mesh;
}
