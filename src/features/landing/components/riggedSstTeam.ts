import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";

type FigureRole = "typing" | "walking" | "presenting" | "reception" | "training" | "meeting";

export type SstModelStatus = {
  phase: "loading" | "ready" | "partial" | "error";
  loaded: number;
  total: number;
  errorCount: number;
};

type Figure = {
  root: THREE.Group;
  mixer: THREE.AnimationMixer;
  role: FigureRole;
  phase: number;
  position: THREE.Vector3;
  slot: number;
};

const MODEL_PATHS = [
  "/models/sst/profesional_sst.glb",
  "/models/sst/inspectora_sst.glb",
  "/models/sst/coordinadora_sst.glb",
  "/models/sst/auditor_sst.glb",
] as const;

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
 * Los modelos personalizados reemplazan a los muñecos geométricos por posición.
 * Cada fuente GLB se valida antes de ocultar su correspondiente respaldo.
 * El indicador de estado permite comprobar la carga real en la página.
 */
export function mountRiggedSstTeam(
  world: THREE.Group,
  fallback: Array<{ root: THREE.Group }>,
  isMobile: () => boolean,
  report?: (status: SstModelStatus) => void,
): {
  update: (delta: number, time: number) => void;
  resize: () => void;
  dispose: () => void;
} {
  const loader = new GLTFLoader();
  const figures: Figure[] = [];
  const controllers: AbortController[] = [];
  let disposed = false;

  report?.({ phase: "loading", loaded: 0, total: TEAM.length, errorCount: 0 });

  // Un archivo inexistente o una respuesta HTML del router SPA no se confunden
  // silenciosamente con un modelo 3D válido.
  const loadChecked = async (url: string) => {
    const controller = new AbortController();
    controllers.push(controller);
    const response = await fetch(url + "?rev=sst149a", {
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) {
      throw new Error(url + ": respuesta HTTP " + response.status);
    }
    const buffer = await response.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    if (bytes.length < 20 ||
        bytes[0] !== 0x67 || bytes[1] !== 0x6c ||
        bytes[2] !== 0x54 || bytes[3] !== 0x46) {
      throw new Error(url + ": el servidor no devolvió un archivo GLB válido");
    }
    return loader.parseAsync(buffer, "");
  };

  void Promise.allSettled(MODEL_PATHS.map(loadChecked)).then((results) => {
    if (disposed) return;
    const available = results.map((result, i) => {
      if (result.status === "fulfilled") return result.value;
      console.error("[Stack44] No se pudo cargar el modelo SST:", MODEL_PATHS[i], result.reason);
      return null;
    });

    for (const [index, setup] of TEAM.entries()) {
      const source = available[setup.model];
      if (!source) continue;
      try {
        const model = cloneSkeleton(source.scene);
        if (!model) throw new Error("No se pudo clonar la jerarquía del GLB");
        model.name = "Stack44 GLB · " + setup.role;

        // Ajuste automático con medidas reales del GLB (altura ≈4 unidades).
        // Evita que un modelo importado aparezca escondido bajo el piso o sea
        // demasiado pequeño para reconocerse frente al resto de la maqueta.
        model.updateMatrixWorld(true);
        const bounds = new THREE.Box3().setFromObject(model);
        const height = bounds.max.y - bounds.min.y;
        if (!Number.isFinite(height) || height <= 0.01) {
          throw new Error("Dimensiones del GLB inválidas");
        }
        model.scale.setScalar(2.18 / height);
        model.updateMatrixWorld(true);
        const fitted = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        fitted.getCenter(center);
        model.position.x -= center.x;
        model.position.y -= fitted.min.y;
        model.position.z -= center.z;

        const root = new THREE.Group();
        root.name = "Personaje SST · " + index;
        root.position.set(setup.x, -0.12, setup.z);
        root.rotation.y = setup.turn;
        root.add(model);
        root.updateMatrixWorld(true);
        root.traverse((object) => {
          if (object instanceof THREE.Mesh || object instanceof THREE.SkinnedMesh) {
            object.castShadow = !isMobile();
            object.receiveShadow = !isMobile();
          }
        });

        const mixer = new THREE.AnimationMixer(model);
        const clipName = setup.role === "walking" ? "Caminar"
          : setup.role === "presenting" || setup.role === "training" ? "Saludar" : "Idle";
        const clip = THREE.AnimationClip.findByName(source.animations, clipName)
          ?? source.animations[0];
        if (clip) {
          const action = mixer.clipAction(clip);
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.play();
          mixer.update(setup.phase);
        }

        // El reemplazo es individual. Nunca ocultamos todo el equipo
        // si uno de los cuatro archivos no se pudo cargar.
        root.visible = !isMobile() || index < 6;
        world.add(root);
        fallback[index]?.root && (fallback[index].root.visible = false);
        figures.push({
          root, mixer, role: setup.role, phase: setup.phase,
          position: root.position.clone(), slot: index,
        });
      } catch (error) {
        console.error("[Stack44] Falló el personaje SST en la posición", index, error);
      }
    }

    const loaded = figures.length;
    report?.({
      phase: loaded === TEAM.length ? "ready" : loaded > 0 ? "partial" : "error",
      loaded,
      total: TEAM.length,
      errorCount: results.filter((x) => x.status === "rejected").length
        + TEAM.length - loaded - TEAM.filter((x) => available[x.model] === null).length,
    });
  }).catch((error: unknown) => {
    if (!disposed) {
      console.error("[Stack44] Falló la importación del equipo SST", error);
      report?.({ phase: "error", loaded: 0, total: TEAM.length, errorCount: MODEL_PATHS.length });
    }
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
      for (const figure of figures) {
        figure.root.visible = !isMobile() || figure.slot < 6;
        figure.root.traverse((obj) => {
          if (obj instanceof THREE.Mesh || obj instanceof THREE.SkinnedMesh) {
            obj.castShadow = !isMobile();
            obj.receiveShadow = !isMobile();
          }
        });
      }
    },
    dispose: () => {
      disposed = true;
      controllers.forEach((controller) => controller.abort());
      for (const figure of figures) {
        figure.mixer.stopAllAction();
        figure.mixer.uncacheRoot(figure.root);
      }
    },
  };
}
