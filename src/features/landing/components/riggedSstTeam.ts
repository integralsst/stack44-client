import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { applyPremiumSstHair } from "./premiumSstHair";
import { decorateAnimatedSstFigure } from "./animatedSstCharacters";

type FigureRole = "typing" | "walking" | "presenting" | "reception" | "training" | "meeting";

export type SstModelStatus = {
  phase: "loading" | "ready" | "partial" | "error";
  loaded: number;
  total: number;
  errorCount: number;
  source?: "animated" | "legacy";
};

type WalkBone = { bone: THREE.Bone; rest: THREE.Quaternion; swingDirection: number; amplitude: number };
type Figure = {
  root: THREE.Group;
  mixer: THREE.AnimationMixer;
  role: FigureRole;
  phase: number;
  position: THREE.Vector3;
  slot: number;
  walkBones: WalkBone[];
  animatedSource: boolean;
};

const MODEL_PATHS = [
  "/models/sst/profesional_sst.glb",
  "/models/sst/inspectora_sst.glb",
  "/models/sst/coordinadora_sst.glb",
  "/models/sst/auditor_sst.glb",
  "/models/sst/lego_minifigure_animated.glb",
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
    const response = await fetch(url + "?rev=sst151a", {
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
      if (i === 4) console.info("[Stack44] Modelo nuevo todavía no publicado. Se usan los personajes existentes.");
      else console.error("[Stack44] No se pudo cargar el modelo SST:", MODEL_PATHS[i], result.reason);
      return null;
    });

    const animatedSourceReady = available[4] !== null;
    for (const [index, setup] of TEAM.entries()) {
      const source = available[4] ?? available[setup.model];
      if (!source) continue;
      try {
        const model = cloneSkeleton(source.scene);
        if (!model) throw new Error("No se pudo clonar la jerarquía del GLB");
        model.name = "Stack44 GLB · " + setup.role;
        if (animatedSourceReady) {
          decorateAnimatedSstFigure(model, index % 6);
        } else {
          // Las cuatro figuras GLB anteriores permanecen como respaldo hasta
          // que el archivo animado nuevo se haya publicado realmente.
          applyPremiumSstHair(
            model, setup.model,
            setup.role === "presenting" || setup.role === "training",
          );
        }

        // Ajuste automático: el modelo nuevo mide ~1.07 y el anterior ~4.
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
        root.position.set(setup.x, -0.19, setup.z);
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
        // El clip Caminar exportado podía torcer las articulaciones y hacer
        // que el muñeco saltara. Lo sustituimos por un ciclo articulado corto,
        // calculado respecto a la posición neutral real de cada hueso.
        const clipName = setup.role === "presenting" || setup.role === "training"
          ? "Saludar" : "Idle";
        if (!animatedSourceReady && setup.role !== "walking") {
          const clip = THREE.AnimationClip.findByName(source.animations, clipName)
            ?? source.animations[0];
          if (clip) {
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.play();
            mixer.update(setup.phase);
          }
        }
        const walkBones: WalkBone[] = [];
        if (animatedSourceReady || setup.role === "walking") {
          const walkSetup = animatedSourceReady ? [
            ["L_Leg_04", 1, 0.22],
            ["R_Reg_08", -1, 0.22],
            ["L_Arm_02", -1, 0.15],
            ["R_Arm_06", 1, 0.15],
            ["Head_00", 1, 0.025],
          ] as const : [
            ["Bone.003_9", 1, 0.24],
            ["Bone.004_11", -1, 0.24],
            ["Bone.007_3", -1, 0.15],
            ["Bone.006_6", 1, 0.15],
          ] as const;
          for (const [name, direction, amplitude] of walkSetup) {
            const bone = model.getObjectByName(name);
            if (bone instanceof THREE.Bone) {
              walkBones.push({
                bone, rest: bone.quaternion.clone(),
                swingDirection: direction, amplitude,
              });
            }
          }
        }

        // El reemplazo es individual. Nunca ocultamos todo el equipo
        // si uno de los cuatro archivos no se pudo cargar.
        root.visible = !isMobile() || index < 6;
        world.add(root);
        fallback[index]?.root && (fallback[index].root.visible = false);
        figures.push({
          root, mixer, role: setup.role, phase: setup.phase,
          position: root.position.clone(), slot: index, walkBones,
          animatedSource: animatedSourceReady,
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
      errorCount: TEAM.length - loaded,
      source: animatedSourceReady ? "animated" : "legacy",
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
        if (figure.animatedSource && figure.role !== "walking") {
          const t = time * 2.0 + figure.phase;
          const offset = new THREE.Quaternion();
          const axis = new THREE.Vector3(1, 0, 0);
          for (const joint of figure.walkBones) {
            const leg = /Leg|Reg/.test(joint.bone.name);
            const head = /Head/.test(joint.bone.name);
            const right = /R_Arm/.test(joint.bone.name);
            let angle = 0;
            if (head) angle = Math.sin(t * 0.43) * 0.027;
            else if (leg) angle = 0;
            else if (figure.role === "typing" || figure.role === "reception") {
              angle = -0.10 + Math.sin(t * 3.0 + (right ? Math.PI : 0)) * 0.055;
            } else if (figure.role === "presenting" || figure.role === "training") {
              angle = right ? -0.26 + Math.sin(t * 0.9) * 0.08 : 0.015;
            } else if (figure.role === "meeting") {
              angle = right ? Math.sin(t * 0.65) * 0.055 : 0;
            }
            offset.setFromAxisAngle(axis, angle);
            joint.bone.quaternion.copy(joint.rest).multiply(offset);
          }
        }
        if (figure.role === "walking") {
          // Recorrido continuo elíptico por el pasillo: sin teletransportes
          // ni cambios bruscos de orientación al llegar a los extremos.
          const phase = time * 0.42 + figure.phase * 0.08;
          const rx = 2.20;
          const rz = 0.47;
          figure.root.position.x = figure.position.x + Math.sin(phase) * rx;
          figure.root.position.z = figure.position.z + (Math.cos(phase) - 1) * rz;
          const dx = Math.cos(phase) * rx;
          const dz = -Math.sin(phase) * rz;
          const targetYaw = Math.atan2(dx, dz);
          const yawError = Math.atan2(
            Math.sin(targetYaw - figure.root.rotation.y),
            Math.cos(targetYaw - figure.root.rotation.y),
          );
          figure.root.rotation.y += yawError * Math.min(1, delta * 5.5);
          const stepPhase = time * 4.6 + figure.phase;
          const swing = Math.sin(stepPhase);
          figure.root.position.y = figure.position.y + (1 - Math.cos(2 * stepPhase)) * 0.008;
          const axis = new THREE.Vector3(1, 0, 0);
          const offset = new THREE.Quaternion();
          for (const joint of figure.walkBones) {
            offset.setFromAxisAngle(axis, swing * joint.swingDirection * joint.amplitude);
            joint.bone.quaternion.copy(joint.rest).multiply(offset);
          }
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
