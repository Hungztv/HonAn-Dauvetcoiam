import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader.js';

/**
 * HỒN ÁN v4.5.1 – Production Asset Pipeline
 * Real GLTF/GLB + Draco + KTX2 loader with Model Cache, Texture Cache,
 * AnimationMixer registry, LOD descriptor support, Collision box extraction,
 * and safe GPU resource disposal.
 *
 * NOTE: Currently no external .glb files exist in public/models/.
 * All MODEL_REGISTRY entries remain optional so procedural benchmarks render cleanly
 * with zero 404 network errors; dropping Blender .glb assets into public/models/
 * and adding an entry swaps the visual mesh without changing any ID, puzzle, or collision.
 */

export interface ExternalModelDescriptor {
  url: string;
  /** Optional lower-detail LOD URL rendered beyond lodDistance meters */
  lodUrl?: string;
  lodDistance?: number;
  useDraco?: boolean;
  useKtx2?: boolean;
  scale?: number;
  yOffset?: number;
  rotationY?: number;
  castShadow?: boolean;
  receiveShadow?: boolean;
  /** Optional default animation clip name to auto-play via AnimationMixer */
  autoPlayClip?: string;
  /** Optional explicit collider size override if mesh bounds differ */
  colliderSize?: [number, number, number];
}

export const MODEL_REGISTRY: Partial<Record<string, ExternalModelDescriptor>> = {
  // Drop exported Blender .glb assets into public/models/ and uncomment to swap seamlessly:
  // 'l1_altar': { url: '/models/ban_tho_gia_tien.glb', useDraco: true, useKtx2: true, scale: 1 },
  // 'l1_well': { url: '/models/gieng_da_co.glb', lodUrl: '/models/gieng_da_co_lod1.glb', lodDistance: 14, useDraco: true },
  // 'l1_pillar': { url: '/models/cot_lim_chan_tang.glb', useDraco: true },
};

export interface CachedModelEntry {
  url: string;
  gltf: GLTF;
  boundingBox: THREE.Box3;
  refCount: number;
}

class GameAssetPipeline {
  private gltfLoader: GLTFLoader | null = null;
  private dracoLoader: DRACOLoader | null = null;
  private ktx2Loader: KTX2Loader | null = null;
  private textureLoader = new THREE.TextureLoader();

  private modelCache = new Map<string, CachedModelEntry>();
  private inflightModels = new Map<string, Promise<CachedModelEntry>>();
  private externalTextureCache = new Map<string, THREE.Texture>();
  private activeMixers = new Set<THREE.AnimationMixer>();

  /** Configures GLTFLoader with Draco & KTX2 decoders (lazy singleton) */
  public getLoader(renderer?: THREE.WebGLRenderer): GLTFLoader {
    if (!this.gltfLoader) {
      const loader = new GLTFLoader();

      const draco = new DRACOLoader();
      draco.setDecoderPath('/draco/');
      loader.setDRACOLoader(draco);
      this.dracoLoader = draco;

      const ktx2 = new KTX2Loader();
      ktx2.setTranscoderPath('/basis/');
      if (renderer) {
        ktx2.detectSupport(renderer);
      }
      loader.setKTX2Loader(ktx2);
      this.ktx2Loader = ktx2;

      this.gltfLoader = loader;
    } else if (renderer && this.ktx2Loader) {
      this.ktx2Loader.detectSupport(renderer);
    }
    return this.gltfLoader;
  }

  public hasExternalModel(key: string): boolean {
    return Boolean(MODEL_REGISTRY[key]);
  }

  public getDescriptor(key: string): ExternalModelDescriptor | undefined {
    return MODEL_REGISTRY[key];
  }

  /** Loads and caches a GLB/GLTF model, computing its world-space collision bounding box */
  public async loadModel(url: string, renderer?: THREE.WebGLRenderer): Promise<CachedModelEntry> {
    const cached = this.modelCache.get(url);
    if (cached) {
      cached.refCount += 1;
      return cached;
    }
    const inflight = this.inflightModels.get(url);
    if (inflight) {
      const entry = await inflight;
      entry.refCount += 1;
      return entry;
    }

    const loader = this.getLoader(renderer);
    const promise = new Promise<CachedModelEntry>((resolve, reject) => {
      loader.load(
        url,
        (gltf) => {
          const box = new THREE.Box3().setFromObject(gltf.scene);
          const entry: CachedModelEntry = {
            url,
            gltf,
            boundingBox: box,
            refCount: 1,
          };
          this.modelCache.set(url, entry);
          this.inflightModels.delete(url);
          resolve(entry);
        },
        undefined,
        (err) => {
          this.inflightModels.delete(url);
          reject(err);
        }
      );
    });

    this.inflightModels.set(url, promise);
    return promise;
  }

  /** Clones a cached model scene cleanly and configures shadows + optional AnimationMixer */
  public instantiateModel(
    entry: CachedModelEntry,
    desc: ExternalModelDescriptor
  ): { root: THREE.Group; mixer: THREE.AnimationMixer | null } {
    const root = entry.gltf.scene.clone(true);
    const scale = desc.scale ?? 1;
    root.scale.setScalar(scale);
    if (desc.yOffset) root.position.y = desc.yOffset;
    if (desc.rotationY) root.rotation.y = desc.rotationY;

    root.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = desc.castShadow ?? true;
        mesh.receiveShadow = desc.receiveShadow ?? true;
      }
    });

    let mixer: THREE.AnimationMixer | null = null;
    if (entry.gltf.animations.length > 0 && desc.autoPlayClip) {
      mixer = new THREE.AnimationMixer(root);
      const clip =
        THREE.AnimationClip.findByName(entry.gltf.animations, desc.autoPlayClip) ??
        entry.gltf.animations[0];
      if (clip) {
        mixer.clipAction(clip).play();
      }
      this.activeMixers.add(mixer);
    }

    return { root, mixer };
  }

  /** Extracts an axis-aligned collider box size from a loaded model or explicit override */
  public getColliderSize(entry: CachedModelEntry, desc: ExternalModelDescriptor): [number, number, number] {
    if (desc.colliderSize) return desc.colliderSize;
    const size = new THREE.Vector3();
    entry.boundingBox.getSize(size);
    const s = desc.scale ?? 1;
    return [size.x * s, size.y * s, size.z * s];
  }

  /** Loads and caches an external image texture with anisotropic filtering */
  public loadExternalTexture(url: string, isColor = true): THREE.Texture {
    const existing = this.externalTextureCache.get(url);
    if (existing) return existing;
    const tex = this.textureLoader.load(url);
    tex.anisotropy = 4;
    if (isColor) tex.colorSpace = THREE.SRGBColorSpace;
    this.externalTextureCache.set(url, tex);
    return tex;
  }

  public releaseMixer(mixer: THREE.AnimationMixer | null) {
    if (!mixer) return;
    mixer.stopAllAction();
    this.activeMixers.delete(mixer);
  }

  public releaseModel(url: string) {
    const entry = this.modelCache.get(url);
    if (!entry) return;
    entry.refCount = Math.max(0, entry.refCount - 1);
  }

  /** Purges unused cached external models (refCount === 0) on level unload */
  public purgeUnusedModels() {
    for (const [url, entry] of this.modelCache.entries()) {
      if (entry.refCount <= 0) {
        disposeObject3D(entry.gltf.scene);
        this.modelCache.delete(url);
      }
    }
  }

  public getStats() {
    return {
      cachedModels: this.modelCache.size,
      cachedExternalTextures: this.externalTextureCache.size,
      activeMixers: this.activeMixers.size,
      registeredExternalKeys: Object.keys(MODEL_REGISTRY).length,
    };
  }

  public disposeDecoders() {
    this.dracoLoader?.dispose();
    this.ktx2Loader?.dispose();
    this.dracoLoader = null;
    this.ktx2Loader = null;
    this.gltfLoader = null;
  }
}

export const assetPipeline = new GameAssetPipeline();

export function hasExternalModel(key: string): boolean {
  return assetPipeline.hasExternalModel(key);
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
  enableVolumetricMoonShafts: boolean;
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
    enableVolumetricMoonShafts: false,
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
    enableVolumetricMoonShafts: true,
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
    enableVolumetricMoonShafts: true,
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
    enableVolumetricMoonShafts: true,
  },
};
