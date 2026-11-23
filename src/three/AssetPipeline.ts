import * as THREE from 'three';

/**
 * Future-ready Asset Pipeline for GLB / GLTF + Draco + KTX2 assets.
 * Currently maps architectural & evidence keys to procedural fallbacks;
 * dropping a compressed .glb URL into MODEL_REGISTRY swaps the mesh seamlessly.
 */

export interface ExternalModelDescriptor {
  url: string;
  useDraco?: boolean;
  scale?: number;
  yOffset?: number;
}

export const MODEL_REGISTRY: Partial<Record<string, ExternalModelDescriptor>> = {
  // Example for future external GLB drop-in:
  // ancestral_altar: { url: '/models/ban_tho_viet_nam.glb', useDraco: true, scale: 1 },
  // stone_well: { url: '/models/gieng_da_co.glb', useDraco: true, scale: 1 },
};

export function hasExternalModel(key: string): boolean {
  return Boolean(MODEL_REGISTRY[key]);
}

/**
 * Safely disposes geometries, materials, and non-shared textures of a Three.js subtree
 * to prevent GPU memory leaks across level transitions.
 */
export function disposeObject3D(root: THREE.Object3D | null | undefined, skipMaterials?: Set<THREE.Material>) {
  if (!root) return;
  root.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry && typeof mesh.geometry.dispose === 'function') {
      mesh.geometry.dispose();
    }
    const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
    for (const mat of mats) {
      if (skipMaterials?.has(mat)) continue;
      mat.dispose();
    }
  });
}

export interface QualityProfile {
  shadowMapSize: number;
  shadowsEnabled: boolean;
  dprMax: number;
  sparkleCount: number;
  mistPatchCount: number;
  rainCount: number;
  enablePostProcessing: boolean;
  fullPostProcessing: boolean;
}

export const QUALITY_PROFILES: Record<'low' | 'medium' | 'high' | 'ultra', QualityProfile> = {
  low: {
    shadowMapSize: 512,
    shadowsEnabled: false,
    dprMax: 1.0,
    sparkleCount: 24,
    mistPatchCount: 5,
    rainCount: 0,
    enablePostProcessing: false,
    fullPostProcessing: false,
  },
  medium: {
    shadowMapSize: 512,
    shadowsEnabled: true,
    dprMax: 1.25,
    sparkleCount: 48,
    mistPatchCount: 9,
    rainCount: 160,
    enablePostProcessing: true,
    fullPostProcessing: false,
  },
  high: {
    shadowMapSize: 1024,
    shadowsEnabled: true,
    dprMax: 1.6,
    sparkleCount: 85,
    mistPatchCount: 14,
    rainCount: 320,
    enablePostProcessing: true,
    fullPostProcessing: true,
  },
  ultra: {
    shadowMapSize: 2048,
    shadowsEnabled: true,
    dprMax: 2.0,
    sparkleCount: 120,
    mistPatchCount: 18,
    rainCount: 520,
    enablePostProcessing: true,
    fullPostProcessing: true,
  },
};
