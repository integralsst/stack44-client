import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * GLB de los personajes personalizados por Stack44.
 *
 * IMPORTANTE: los GLB originales son archivos binarios. Hasta que estén
 * cargados en public/models/sst, mantenemos los personajes Three.js actuales.
 * No dispara peticiones 404 ni impide el resto de la landing.
 */
export const SST_MODELS_ENABLED = false;

const MODELS = [
  "/models/sst/sst_coordinador.glb",
  "/models/sst/sst_profesional.glb",
  "/models/sst/sst_inspector.glb",
  "/models/sst/sst_analista.glb",
] as const;

export type RiggedOfficeFigure = {
  root: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  role: string;
};

export type SstModelBundle = {
  dispose(): void;
  update(time: number): void;
};

export function attachCustomSstModels(
  figures: RiggedOfficeFigure[],
): SstModelBundle {
  const loaded: Array<{ model: THREE.Object3D; bones: THREE.Bone[]; role: string }> = [];
  let canceled = false;

  if (SST_MODELS_ENABLED) {
    const loader = new GLTFLoader();
    // Los índices corresponden a personajes principales de la escena.
    const slots = [0, 1, 5, 3];
    MODELS.forEach((url, index) => {
      const target = figures[slots[index]];
      if (!target) return;
      loader.load(
        url,
        (asset) => {
          if (canceled) return;
          const model = asset.scene;
          model.name = "Stack44 GLB SST " + index;
          model.scale.setScalar(0.51);
          // La minifigura tiene 4 unidades de altura y las figuras del mundo ≈2.
          model.position.set(0, 0, 0);
          // Conserva la animación base del personaje mediante su contenedor.
          // El modelo no contiene clips: para caminar/teclear animamos huesos.
          const bones: THREE.Bone[] = [];
          model.traverse((child) => {
            if (child instanceof THREE.Bone) bones.push(child);
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
              child.receiveShadow = true;
            }
          });
          target.root.children.forEach((child) => { child.visible = false; });
          model.visible = true;
          target.root.add(model);
          loaded.push({ model, bones, role: target.role });
        },
        undefined,
        () => {
          // Respaldo seguro: la minifigura procedural sigue visible.
        },
      );
    });
  }

  return {
    update(time) {
      loaded.forEach(({ bones, role }) => {
        bones.forEach((bone, i) => {
          if (/Bone\.00[3-9]|Bone\.01/.test(bone.name)) {
            bone.rotation.x = Math.sin(time * 2.2 + i * 1.6) *
              (role === "walking" ? 0.22 : role === "typing" ? 0.09 : 0.04);
          }
        });
      });
    },
    dispose() {
      canceled = true;
      for (const { model } of loaded) {
        model.parent?.remove(model);
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (Array.isArray(child.material) ? child.material : [child.material])
              .forEach((m: THREE.Material) => m.dispose());
          }
        });
      }
    },
  };
}
