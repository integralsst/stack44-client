import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { clone as cloneSkeleton } from "three/examples/jsm/utils/SkeletonUtils.js";
import { decorateAnimatedSstFigure } from "./animatedSstCharacters";
import { getOfficePose, type OfficeAction } from "./officeLife";
import { OFFICE_TEAM, VISITOR_TEAM } from "./officeTeam";

export type SstModelStatus = {
  phase: "loading" | "ready" | "partial" | "error";
  loaded: number;
  total: number;
  errorCount: number;
  source?: "animated" | "legacy";
};

type BoneJoint = {
  bone: THREE.Bone;
  neutral: THREE.Quaternion;
  part: "legL" | "legR" | "armL" | "armR" | "head";
};
type Avatar = {
  root: THREE.Group;
  model: THREE.Object3D;
  joints: BoneJoint[];
  index: number;
  seated: number;
  yaw: number;
};

const MODEL = "/models/sst/lego_minifigure_animated.glb";
const ACTORS = [...OFFICE_TEAM, ...VISITOR_TEAM];

/**
 * Un único GLB animable compartido por 5 empleados y 3 clientes.
 * La línea de tiempo de officeLife dicta dónde está y qué hace cada persona.
 * No se reproduce "Take 001" porque mezcla más movimientos que caminar.
 */
export function mountRiggedSstTeam(
  world: THREE.Group,
  fallback: Array<{ root: THREE.Group }>,
  mobile: () => boolean,
  report?: (status: SstModelStatus) => void,
): {
  update: (delta: number, time: number) => void;
  resize: () => void;
  dispose: () => void;
} {
  const avatars: Avatar[] = [];
  const controller = new AbortController();
  let disposed = false;
  let elapsed = 0;
  report?.({
    phase: "loading", loaded: 0, total: ACTORS.length, errorCount: 0,
  });

  const jointNames: Array<[string, BoneJoint["part"]]> = [
    ["L_Leg_04", "legL"],
    ["R_Reg_08", "legR"],
    ["L_Arm_02", "armL"],
    ["R_Arm_06", "armR"],
    ["Head_00", "head"],
  ];

  const getBounds = (model: THREE.Object3D): THREE.Box3 => {
    const bounds = new THREE.Box3();
    model.updateMatrixWorld(true);
    // La descarga incluye suelo y cabeza "dead" ocultos. Excluirlos es
    // importante: de lo contrario el autoencuadre escala mal los personajes.
    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.visible) return;
      if (/Floor|Object_79|Head02/i.test(child.name)) return;
      bounds.union(new THREE.Box3().setFromObject(child));
    });
    return bounds;
  };

  void (async () => {
    const response = await fetch(MODEL + "?rev=campus-20261105", {
      signal: controller.signal,
      cache: "force-cache",
    });
    if (!response.ok) throw new Error("GLB HTTP " + response.status);
    const buffer = await response.arrayBuffer();
    const sig = new Uint8Array(buffer.slice(0, 4));
    if (sig.length !== 4 ||
      sig[0] !== 103 || sig[1] !== 108 || sig[2] !== 84 || sig[3] !== 70) {
      throw new Error("El servidor devolvió una página HTML en vez del GLB");
    }
    const glb = await new GLTFLoader().parseAsync(buffer, "");
    if (disposed) return;

    for (const [index, actor] of ACTORS.entries()) {
      const root = new THREE.Group();
      let model: THREE.Object3D;
      try {
        model = cloneSkeleton(glb.scene);
        decorateAnimatedSstFigure(model, index);
        model.name = actor.name + " · " + actor.title;
        const bounds = getBounds(model);
        const height = bounds.max.y - bounds.min.y;
        if (!Number.isFinite(height) || height < .15) throw new Error("Altura del personaje inválida");
        const scale = (index >= OFFICE_TEAM.length ? 2.0 : 2.18) / height;
        model.scale.setScalar(scale);
        model.updateMatrixWorld(true);
        const fitted = getBounds(model);
        const center = fitted.getCenter(new THREE.Vector3());
        model.position.set(-center.x, -fitted.min.y, -center.z);
      } catch (error) {
        console.warn("[Stack44] Personaje no utilizable:", actor.name, error);
        continue;
      }

      const joints: BoneJoint[] = [];
      jointNames.forEach(([name, part]) => {
        const joint = model.getObjectByName(name);
        if (joint instanceof THREE.Bone) {
          joints.push({ bone: joint, neutral: joint.quaternion.clone(), part });
        }
      });
      const pose = getOfficePose(index, elapsed);
      root.name = "Stack44 / " + actor.name;
      root.position.set(pose.x, -.18, pose.z);
      root.rotation.y = pose.yaw;
      root.add(model);
      root.traverse((child) => {
        if (child instanceof THREE.Mesh || child instanceof THREE.SkinnedMesh) {
          child.castShadow = !mobile();
          child.receiveShadow = !mobile();
        }
      });
      world.add(root);
      fallback[index]?.root && (fallback[index].root.visible = false);
      avatars.push({ root, model, joints, index, seated: 0, yaw: pose.yaw });
    }

    const count = avatars.length;
    report?.({
      phase: count === ACTORS.length ? "ready" : count ? "partial" : "error",
      loaded: count, total: ACTORS.length, errorCount: ACTORS.length - count,
      source: "animated",
    });
  })().catch((error: unknown) => {
    if (disposed || controller.signal.aborted) return;
    console.error("[Stack44] No se cargó el GLB de los personajes:", error);
    report?.({
      phase: "error", loaded: 0, total: ACTORS.length,
      errorCount: ACTORS.length, source: "legacy",
    });
  });

  const axis = new THREE.Vector3(1, 0, 0);
  const angleOffset = new THREE.Quaternion();
  const smoothTarget = new THREE.Quaternion();
  const idle = (joint: BoneJoint, action: OfficeAction, time: number, index: number) => {
    const t = time * 2.3 + index * .95;
    if (joint.part === "head") return Math.sin(t * .47) * .035;
    // Los huesos de piernas del GLB están espejados: una pierna necesita
    // rotación local negativa y la otra positiva para apuntar hacia delante.
    // Ángulo de ~60 grados: postura sentada reconocible.
    const seated = action === "work" || action === "meet" || action === "relax";
    if (joint.part === "legL") return seated ? -1.04 : 0;
    if (joint.part === "legR") return seated ? 1.04 : 0;
    const right = joint.part === "armR";
    if (action === "work") {
      // Ambos antebrazos hacia el teclado (+Z local): huesos espejados.
      const sign = right ? 1 : -1;
      return sign * (.45 + Math.sin(t * 1.75 + (right ? Math.PI : 0)) * .065);
    }
    if (action === "talk" || action === "meet") {
      return right ? -.24 + Math.sin(t * .9) * .14 : -.10;
    }
    if (action === "greet") {
      return right ? -.47 + Math.sin(t * 1.3) * .17 : -.04;
    }
    return .04 + Math.sin(t * .54 + (right ? Math.PI : 0)) * .06;
  };
  const update = (delta: number, time: number) => {
    elapsed = time;
    // Respaldo geométrico también se desplaza si el GLB no llega a cargar.
    fallback.forEach(({ root }, index) => {
      if (!root.visible && avatars.some((avatar) => avatar.index === index)) return;
      const pose = getOfficePose(index, time);
      root.visible = pose.visible && (!mobile() || index < 6);
      const isSitting = pose.action === "work" || pose.action === "meet" ||
        pose.action === "relax";
      root.position.set(pose.x, isSitting ? -.66 : -.16, pose.z);
      root.rotation.y = pose.yaw;
    });

    avatars.forEach((avatar) => {
      const pose = getOfficePose(avatar.index, time);
      avatar.root.visible = pose.visible && (!mobile() || avatar.index < 6);
      if (!avatar.root.visible) return;

      avatar.root.position.x = pose.x;
      avatar.root.position.z = pose.z;
      const sitting = pose.action === "work" ? .58
        : pose.action === "meet" ? .50 : pose.action === "relax" ? .40 : 0;
      avatar.seated = THREE.MathUtils.damp(avatar.seated, sitting, 4.4, delta);
      avatar.root.position.y = -.18 - avatar.seated;

      const desired = pose.yaw;
      const diff = Math.atan2(Math.sin(desired - avatar.yaw), Math.cos(desired - avatar.yaw));
      avatar.yaw += diff * Math.min(1, delta * 4.7);
      avatar.root.rotation.y = avatar.yaw;

      const stride = Math.sin(time * 7.3 + avatar.index * .43);
      for (const joint of avatar.joints) {
        let angle = idle(joint, pose.action, time, avatar.index);
        if (pose.walking) {
          if (joint.part === "legL") angle = stride * .28;
          else if (joint.part === "legR") angle = -stride * .28;
          else if (joint.part === "armL") angle = -stride * .18;
          else if (joint.part === "armR") angle = stride * .18;
          else angle = Math.sin(time * 3.65) * .02;
        }
        angleOffset.setFromAxisAngle(axis, angle);
        // Interpolar el hueso evita saltos al pasar de sentado a caminando.
        smoothTarget.copy(joint.neutral).multiply(angleOffset);
        joint.bone.quaternion.slerp(smoothTarget, Math.min(1, delta * 8));
      }
      if (pose.walking) {
        avatar.root.position.y += Math.abs(Math.sin(time * 7.3)) * .025;
      }
    });
  };

  return {
    update,
    resize: () => update(.016, elapsed),
    dispose() {
      disposed = true;
      controller.abort();
      avatars.forEach(({ root }) => {
        world.remove(root);
      });
    },
  };
}
