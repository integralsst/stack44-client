import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Batch only rigid opaque meshes. Animated rigs, paper and hit meshes keep their hierarchy. */
export function batchCampusStatics(root: THREE.Group, dynamicRoots: THREE.Object3D[]) {
  root.updateMatrixWorld(true);
  const inverse = root.matrixWorld.clone().invert();
  const buckets = new Map<THREE.Material, THREE.Mesh[]>();
  const visit = (object:THREE.Object3D) => {
    if (dynamicRoots.includes(object)) return;
    if (object instanceof THREE.Mesh && !(object instanceof THREE.InstancedMesh) && !Array.isArray(object.material)
      && !object.material.transparent && !object.userData.officeAction && !object.userData.officeTarget) {
      const bucket=buckets.get(object.material)??[]; bucket.push(object); buckets.set(object.material,bucket);
    }
    object.children.forEach(visit);
  };
  visit(root);
  let removed=0;
  for (const [material, meshes] of buckets) {
    if(meshes.length<3) continue;
    const copies=meshes.map(mesh=>(mesh.geometry.index ? mesh.geometry.toNonIndexed() : mesh.geometry.clone()).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld)));
    // All production primitive surfaces have position/normal/uv attributes.
    const merged=mergeGeometries(copies,false); copies.forEach(g=>g.dispose());
    if(!merged) continue;
    const mesh=new THREE.Mesh(merged,material); mesh.castShadow=true; mesh.receiveShadow=true; mesh.name='campus-static-batch'; root.add(mesh);
    meshes.forEach(original=>original.removeFromParent()); removed+=meshes.length-1;
  }
  return removed;
}

/** Rigid pieces on the SAME bone may merge; bone parents and transforms never merge. */
export function batchCharacterBones(root:THREE.Group){
  root.updateWorldMatrix(true,true);let removed=0;
  const visit=(group:THREE.Object3D)=>{
    for(const child of [...group.children])if(!(child instanceof THREE.Mesh))visit(child);
    const buckets=new Map<THREE.Material,THREE.Mesh[]>();
    for(const child of group.children)if(child instanceof THREE.Mesh&&!(child instanceof THREE.InstancedMesh)&&!Array.isArray(child.material)&&!child.material.transparent){
      const bucket=buckets.get(child.material)??[];bucket.push(child);buckets.set(child.material,bucket);
    }
    const inverse=group.matrixWorld.clone().invert();
    for(const [material,meshes] of buckets){
      if(meshes.length<2)continue;
      const copies=meshes.map(mesh=>(mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone()).applyMatrix4(new THREE.Matrix4().multiplyMatrices(inverse,mesh.matrixWorld)));
      const geometry=mergeGeometries(copies,false);copies.forEach(g=>g.dispose());if(!geometry)continue;
      const mesh=new THREE.Mesh(geometry,material);mesh.name='rig-rigid-parts';mesh.castShadow=meshes.some(m=>m.castShadow);mesh.receiveShadow=meshes.some(m=>m.receiveShadow);group.add(mesh);
      meshes.forEach(m=>m.removeFromParent());removed+=meshes.length-1;
    }
  };visit(root);return removed;
}
