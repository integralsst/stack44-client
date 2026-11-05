import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

/**
 * Ala de oficinas adicional derivada del modelo "Isometric office"
 * de Companion_Cube (CC BY 4.0), adaptada para Stack44.
 *
 * Modelo: /public/models/sst/isometric_office_stack44_optimized.glb
 * Archivo binario requerido: NO se incluye implícitamente en este TS.
 * La escena original no se modifica hasta que el modelo se haya cargado.
 */
export const SST_OFFICE_ANNEX_PATH =
  "/models/sst/isometric_office_stack44_optimized.glb";

type AnnexState = "ready" | "missing";

export type OfficeAnnexHandle = {
  dispose(): void;
};

export function mountOfficeAnnex(
  world: THREE.Group,
  isMobile: () => boolean,
  onStatus: (status: AnnexState) => void,
): OfficeAnnexHandle {
  let disposed = false;
  let annex: THREE.Group | null = null;

  const shell = new THREE.Group();
  shell.name = "Stack44 · Campus SG-SST / Oficina 2";
  shell.position.set(18.3, 0, -3.3);

  const porcelain = new THREE.MeshStandardMaterial({
    color: 0xf3f7f2, roughness: 0.6, metalness: 0.05,
  });
  const soil = new THREE.MeshStandardMaterial({
    color: 0xc7d9cf, roughness: 0.83,
  });
  const asphalt = new THREE.MeshStandardMaterial({
    color: 0x454e57, roughness: 0.92,
  });
  const whitePaint = new THREE.MeshStandardMaterial({
    color: 0xf7f5e9, roughness: 0.82,
  });
  const emerald = new THREE.MeshStandardMaterial({
    color: 0x50866c, roughness: 0.67,
  });
  const sage = new THREE.MeshStandardMaterial({
    color: 0x96bd8b, roughness: 0.72,
  });
  const stone = new THREE.MeshStandardMaterial({
    color: 0xc9d3cc, roughness: 0.7,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x263e4a, roughness: 0.33, metalness: 0.35,
  });

  const box = (
    parent: THREE.Group,
    width: number, height: number, depth: number,
    material: THREE.Material, x: number, y: number, z: number,
  ) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth), material,
    );
    mesh.position.set(x, y, z);
    mesh.receiveShadow = true;
    mesh.castShadow = false;
    parent.add(mesh);
    return mesh;
  };

  const shrub = (x: number, z: number) => {
    const stem = new THREE.Mesh(
      new THREE.CylinderGeometry(0.13, 0.18, 0.38, 9),
      stone,
    );
    stem.position.set(x, -0.01, z);
    shell.add(stem);
    for (let i = 0; i < 3; i += 1) {
      const leaf = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.29, 1),
        i % 2 ? emerald : sage,
      );
      leaf.position.set(x + Math.sin(i * 2.09) * 0.19, 0.36, z + Math.cos(i * 2.09) * 0.19);
      leaf.scale.set(1.0, 0.84, 0.8);
      shell.add(leaf);
    }
  };

  function makeSign(text: string) {
    const canvas = document.createElement("canvas");
    canvas.width = 640;
    canvas.height = 132;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#f1f8f4";
    ctx.beginPath();
    ctx.roundRect(4, 4, 632, 124, 22);
    ctx.fill();
    ctx.strokeStyle = "#73b9a6";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.font = "700 44px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#193b4c";
    ctx.fillText(text, 320, 67, 600);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const banner = new THREE.Sprite(new THREE.SpriteMaterial({
      map: texture, depthWrite: false, transparent: true,
    }));
    banner.position.set(0, 3.58, -4.55);
    banner.scale.set(5.2, 1.07, 1);
    shell.add(banner);
  }

  // Los elementos del campus solo se añaden al mundo después de validar el GLB.
  function addGround() {
    box(shell, 13.7, 0.45, 19.8, porcelain, 0, -0.64, 3.3);
    box(shell, 13.5, 0.085, 11.9, stone, 0, -0.33, -0.55);
    box(shell, 13.5, 0.045, 4.6, asphalt, 0, -0.28, 7.63);
    box(shell, 13.6, 0.10, 1.0, porcelain, 0, -0.23, 4.75);
    for (let i = -3; i <= 3; i += 1) {
      box(shell, 1.10, 0.014, 0.07, whitePaint, i * 1.89, -0.248, 7.5);
    }
    for (let i = -2; i <= 2; i += 1) {
      shrub(i * 2.45, 4.37);
    }
    for (const x of [-5.8, 5.8]) {
      for (const z of [-5.1, -2.65, 0.25]) shrub(x, z);
    }
    // Una pérgola liviana enlaza ambas áreas; no hay edificios al frente.
    for (const x of [-6.5, 6.5]) {
      box(shell, 0.08, 3.1, 0.08, dark, x, 1.34, 3.90);
    }
    box(shell, 13.1, 0.07, 0.09, dark, 0, 2.86, 3.90);
    makeSign("STACK44 · OFICINAS SST");
  }

  const controller = new AbortController();

  async function loadAnnex() {
    // Vercel puede devolver index.html para rutas inexistentes con estado 200:
    // comprobamos la firma GLB antes de parsear el archivo.
    const response = await fetch(SST_OFFICE_ANNEX_PATH, {
      signal: controller.signal,
      cache: "force-cache",
    });
    if (!response.ok) throw new Error("HTTP " + response.status);
    const bytes = await response.arrayBuffer();
    const head = new Uint8Array(bytes, 0, Math.min(bytes.byteLength, 4));
    if (head.length !== 4 || String.fromCharCode(...head) !== "glTF") {
      throw new Error("El servidor no devolvió la oficina GLB");
    }

    const gltf = await new GLTFLoader().parseAsync(bytes, "");
    if (disposed) return;

    const model = gltf.scene;
    model.updateMatrixWorld(true);
    const bounds = new THREE.Box3().setFromObject(model);
    const center = bounds.getCenter(new THREE.Vector3());
    const scale = 1.13;
    model.scale.setScalar(scale);
    model.position.set(-center.x * scale, -bounds.min.y * scale - 0.14, -center.z * scale);
    model.name = "Isometric office · Companion_Cube (adaptada)";

    // Conservamos su geometría y sus texturas originales, pero bajamos
    // sombras y detalles imperceptibles en móviles.
    const walls = new Map<THREE.Material, THREE.Material>();
    model.traverse((object) => {
      if (!(object instanceof THREE.Mesh)) return;
      object.castShadow = false;
      object.receiveShadow = !isMobile();
      if (isMobile()) {
        object.geometry.computeBoundingSphere();
        const radius = object.geometry.boundingSphere?.radius ?? 1;
        if (radius < 0.025) object.visible = false;
      }
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      const next = materials.map((material) => {
        if (!material.name.toLowerCase().includes("wall_material")) return material;
        const existing = walls.get(material);
        if (existing) return existing;
        const copy = material.clone() as THREE.MeshStandardMaterial;
        copy.transparent = true;
        copy.opacity = 0.57;
        copy.depthWrite = false;
        copy.side = THREE.DoubleSide;
        walls.set(material, copy);
        return copy;
      });
      object.material = Array.isArray(object.material) ? next : next[0];
    });

    shell.add(model);
    addGround();
    world.add(shell);
    annex = shell;
    onStatus("ready");
  }

  void loadAnnex().catch((error: unknown) => {
    if (!disposed) {
      console.warn("[Stack44] Anexo de oficina aún no disponible:", error);
      onStatus("missing");
    }
  });

  return {
    dispose() {
      disposed = true;
      controller.abort();
      // La escena principal elimina materiales y geometrías al desmontarse.
      annex = null;
    },
  };
}
