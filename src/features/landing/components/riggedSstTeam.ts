import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

type FigureRole = "typing" | "walking" | "presenting" | "reception" | "training" | "meeting";
type Figure = {
  root: THREE.Object3D;
  mixer: THREE.AnimationMixer;
  role: FigureRole;
  phase: number;
  position: THREE.Vector3;
};

const MODEL_PATHS = [
  "/models/sst/profesional_sst.glb",
  "/models/sst/inspectora_sst.glb",
  "/models/sst/coordinadora_sst.glb",
  "/models/sst/auditor_sst.glb",
] as const;

// Cada modelo procede del GLB aportado, editado y guardado en public/models/sst.
// El modelo fuente está bajo CC BY 4.0, con atribución visible en OfficeHero.
const TEAM = [
  { model: 0, x: -1.9, z: -7.7, turn: Math.PI, role: "typing", phase: 0.1 },
  { model: 1, x: 1.4, z: -7.7, turn: Math.PI, role: "typing", phase: 1.6 },
  { model: 3, x: -1.9, z: -4.7, turn: Math.PI, role: "typing", phase: 2.0 },
  { model: 2, x: 1.4, z: -4.7, turn: Math.PI, role: "typing", phase: 2.8 },
  { model: 2, x: -7.1, z: -0.80, turn: Math.PI, role: "reception", phase: 0.4 },
  { model: 1, x: 6.35, z: -6.65, turn: 0.22, role: "presenting", phase: 1.2 },
  { model: 0, x: 8.70, z: -5.58, turn: -0.4, role: "meeting", phase: 2.3 },
  { model: 2, x: 6.55, z: -2.7, turn: Math.PI, role: "meeting", phase: 3.1 },
  { model: 3, x: -8.10, z: -4.35, turn: 0.25, role: "training", phase: 0.4 },
  { model: 0, x: -0.3, z: 2.33, turn: Math.PI / 2, role: "walking", phase: 1.5 },
] satisfies Array<{
  model: number; x: number; z: number; turn: number; role: FigureRole; phase: number;
}>;

/**
 * Carga los modelos GLB originales y muestra personajes animados.
 * Mientras llegan, se mantienen las figuras procedurales originales.
 * Un fallo de red/WebGL nunca elimina el contenido de la oficina.
 */
export function mountRiggedSstTeam(
  world: THREE.Group,
  fallback: Array<{ root: THREE.Group }>,
  isMobile: () => boolean,
): {
  update: (delta: number, time: number) => void;
  resize: () => void;
  dispose: () => void;
} {
  const loader = new GLTFLoader();
  const figures: Figure[] = [];
  let disposed = false;

  // La carga ocurre con el hero en pantalla. Se comparten geometrías y
  // materiales por archivo y se clonan esqueletos para instanciar el equipo.
  void Promise.allSettled(MODEL_PATHS.map((url) => loader.loadAsync(url))).then((results) => {
    if (disposed) return;
    const available = results.map((result) =>
      result.status === "fulfilled" ? result.value : null,
    );

    for (const [index, setup] of TEAM.entries()) {
      const source = available[setup.model];
      if (!source) continue;
      const model = cloneSkeleton(source.scene);
      model.name = "SST · " + (setup.role === "walking" ? "Recorrido" : setup.role);
      model.scale.setScalar(0.50);
      model.position.set(setup.x, -0.12, setup.z);
      model.rotation.y = setup.turn;
      model.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.castShadow = !isMobile();
          object.receiveShadow = !isMobile();
        }
      });

      const mixer = new THREE.AnimationMixer(model);
      const clipName = setup.role === "walking"
        ? "Caminar"
        : setup.role === "presenting" || setup.role === "training"
          ? "Saludar" : "Idle";
      const clip = THREE.AnimationClip.findByName(source.animations, clipName)
        ?? source.animations[0];
      if (clip) {
        const action = mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.play();
        mixer.update(setup.phase);
      }
      world.add(model);
      figures.push({
        root: model, mixer, role: setup.role, phase: setup.phase,
        position: model.position.clone(),
      });
      model.visible = !isMobile() || index < 6;
    }

    // Solo ocultamos los anteriores cuando hay suficientes modelos nuevos.
    if (figures.length >= 4) fallback.forEach(({ root }) => { root.visible = false; });
  });

  return {
    update: (delta, time) => {
      if (disposed) return;
      for (const figure of figures) {
        if (!figure.root.visible) continue;
        figure.mixer.update(delta);
        if (figure.role === "walking") {
          figure.root.position.x = figure.position.x + Math.sin(time * 0.46) * 2.65;
          figure.root.rotation.y = Math.cos(time * 0.46) > 0 ? Math.PI / 2 : -Math.PI / 2;
          figure.root.position.y = figure.position.y + Math.abs(Math.sin(time * 5)) * 0.045;
        }
      }
    },
    resize: () => {
      for (const [index, figure] of figures.entries()) {
        figure.root.visible = !isMobile() || index < 6;
        figure.root.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.castShadow = !isMobile();
            obj.receiveShadow = !isMobile();
          }
        });
      }
    },
    dispose: () => {
      disposed = true;
      for (const figure of figures) {
        figure.mixer.stopAllAction();
        figure.mixer.uncacheRoot(figure.root);
      }
      // El padre OfficeScene libera los buffers/materiales al recorrer scene.
    },
  };
}
