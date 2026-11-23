import * as THREE from 'three';

/**
 * HỒN ÁN v5.1 – Production Rigged GLB Character Validator
 * Validates external Blender-exported .glb characters across 5 strict domains:
 *   1) File & Mesh presence
 *   2) Skeleton 15-bone semantic mapping (supports Mixamo/Rigify/Blender naming) + skinWeight check
 *   3) Animation clip names, positive duration, duplicate check & AnimationMixer compatibility
 *   4) Transform, bounding box height vs NPC target height & ground contact (min.y ~ 0)
 *   5) PBR Material & texture colorSpace / normal / roughness discipline
 *
 * Returns a structured report with overall status: 'VALID' | 'WARNING' | 'INVALID'.
 * Never throws or crashes gameplay on malformed assets.
 */

export const REQUIRED_HUMANOID_BONES = [
  'Hips',
  'Spine',
  'Chest',
  'Neck',
  'Head',
  'LeftArm',
  'RightArm',
  'LeftForeArm',
  'RightForeArm',
  'LeftHand',
  'RightHand',
  'LeftLeg',
  'RightLeg',
  'LeftFoot',
  'RightFoot',
] as const;

export type SemanticBoneName = (typeof REQUIRED_HUMANOID_BONES)[number];

export const EXTENDED_OPTIONAL_BONES = [
  'Jaw',
  'LeftEye',
  'RightEye',
  'LeftShoulder',
  'RightShoulder',
  'Hair',
  'Dress',
  'Cloth',
] as const;

/** Supports canonical v5 names + Mixamo + Blender Rigify/DEF naming conventions */
export const BONE_ALIAS_MAP: Record<SemanticBoneName, string[]> = {
  Hips: ['hips', 'pelvis', 'mixamorig:hips', 'def-spine', 'root_hips'],
  Spine: ['spine', 'spine1', 'mixamorig:spine', 'def-spine.001'],
  Chest: ['chest', 'spine2', 'upperchest', 'mixamorig:spine2', 'def-spine.003'],
  Neck: ['neck', 'mixamorig:neck', 'def-spine.004'],
  Head: ['head', 'mixamorig:head', 'def-spine.006'],
  LeftArm: ['leftarm', 'leftupperarm', 'upper_arm.l', 'mixamorig:leftarm', 'def-upper_arm.l'],
  RightArm: ['rightarm', 'rightupperarm', 'upper_arm.r', 'mixamorig:rightarm', 'def-upper_arm.r'],
  LeftForeArm: ['leftforearm', 'leftlowerarm', 'forearm.l', 'mixamorig:leftforearm', 'def-forearm.l'],
  RightForeArm: ['rightforearm', 'rightlowerarm', 'forearm.r', 'mixamorig:rightforearm', 'def-forearm.r'],
  LeftHand: ['lefthand', 'hand.l', 'mixamorig:lefthand', 'def-hand.l'],
  RightHand: ['righthand', 'hand.r', 'mixamorig:righthand', 'def-hand.r'],
  LeftLeg: ['leftleg', 'leftupleg', 'thigh.l', 'mixamorig:leftupleg', 'def-thigh.l'],
  RightLeg: ['rightleg', 'rightupleg', 'thigh.r', 'mixamorig:rightupleg', 'def-thigh.r'],
  LeftFoot: ['leftfoot', 'foot.l', 'mixamorig:leftfoot', 'def-foot.l'],
  RightFoot: ['rightfoot', 'foot.r', 'mixamorig:rightfoot', 'def-foot.r'],
};

export type ValidationStatus = 'VALID' | 'WARNING' | 'INVALID';

export interface NPCModelValidationReport {
  status: ValidationStatus;
  /** True when rigged with all 15 semantic bones and usable by RiggedGLBAnimator */
  isValidRig: boolean;
  hasMesh: boolean;
  hasSkinnedMesh: boolean;
  meshCount: number;
  totalBoneCount: number;
  foundBones: SemanticBoneName[];
  missingBones: SemanticBoneName[];
  boneMapping: Partial<Record<SemanticBoneName, string>>;
  extendedBonesFound: string[];
  zeroWeightVertices: number;
  availableClips: string[];
  missingClips: string[];
  zeroDurationClips: string[];
  duplicateClips: string[];
  boundingHeight: number;
  groundOffsetY: number;
  materialCount: number;
  pbrIssues: string[];
  warnings: string[];
  errors: string[];
}

export interface ValidateNPCModelOptions {
  expectedClips?: string[];
  expectedHeightMeters?: number;
  requireRigged?: boolean;
}

export function resolveSemanticBoneMapping(
  rawBoneNames: string[]
): {
  foundBones: SemanticBoneName[];
  missingBones: SemanticBoneName[];
  boneMapping: Partial<Record<SemanticBoneName, string>>;
} {
  const lowered = rawBoneNames.map((n) => ({ raw: n, low: n.toLowerCase() }));
  const foundBones: SemanticBoneName[] = [];
  const missingBones: SemanticBoneName[] = [];
  const boneMapping: Partial<Record<SemanticBoneName, string>> = {};

  for (const semantic of REQUIRED_HUMANOID_BONES) {
    const aliases = BONE_ALIAS_MAP[semantic];
    // Prefer exact match first, then substring alias match
    const exact = lowered.find((b) => aliases.includes(b.low));
    const partial = exact ?? lowered.find((b) => aliases.some((a) => b.low.includes(a)));
    if (partial) {
      foundBones.push(semantic);
      boneMapping[semantic] = partial.raw;
    } else {
      missingBones.push(semantic);
    }
  }

  return { foundBones, missingBones, boneMapping };
}

export function validateNPCModel(
  scene: THREE.Object3D,
  clips: THREE.AnimationClip[],
  expectedClipsOrOptions: string[] | ValidateNPCModelOptions = []
): NPCModelValidationReport {
  const opts: ValidateNPCModelOptions = Array.isArray(expectedClipsOrOptions)
    ? { expectedClips: expectedClipsOrOptions, requireRigged: true }
    : { requireRigged: true, ...expectedClipsOrOptions };

  const expectedClips = opts.expectedClips ?? [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const pbrIssues: string[] = [];

  let meshCount = 0;
  let hasSkinnedMesh = false;
  let zeroWeightVertices = 0;
  const rawBoneSet = new Set<string>();
  const materials = new Set<THREE.Material>();

  scene.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.isMesh) {
      meshCount += 1;
      const mats = Array.isArray(mesh.material) ? mesh.material : mesh.material ? [mesh.material] : [];
      if (mats.length === 0) {
        errors.push(`Mesh "${mesh.name || 'unnamed'}" has no material.`);
      }
      for (const m of mats) {
        materials.add(m);
      }
    }

    const skinned = obj as THREE.SkinnedMesh;
    if (skinned.isSkinnedMesh) {
      hasSkinnedMesh = true;
      skinned.skeleton?.bones.forEach((b) => rawBoneSet.add(b.name));

      const skinWeight = skinned.geometry?.attributes?.skinWeight;
      if (skinWeight) {
        for (let i = 0; i < skinWeight.count; i++) {
          const sum =
            skinWeight.getX(i) +
            skinWeight.getY(i) +
            skinWeight.getZ(i) +
            skinWeight.getW(i);
          if (!Number.isFinite(sum) || sum <= 0.001) {
            zeroWeightVertices += 1;
          }
        }
      }
    }

    if ((obj as THREE.Bone).isBone) {
      rawBoneSet.add(obj.name);
    }
  });

  const hasMesh = meshCount > 0;
  if (!hasMesh) {
    errors.push('GLB scene contains zero meshes.');
  }

  // 1. Skeleton & Bone Mapping
  const rawBoneNames = Array.from(rawBoneSet);
  const { foundBones, missingBones, boneMapping } = resolveSemanticBoneMapping(rawBoneNames);
  const extendedBonesFound = EXTENDED_OPTIONAL_BONES.filter((ext) =>
    rawBoneNames.some((b) => b.toLowerCase().includes(ext.toLowerCase()))
  );

  if (opts.requireRigged && !hasSkinnedMesh) {
    errors.push('Model has no SkinnedMesh (not rigged).');
  }
  if (opts.requireRigged && missingBones.length > 0) {
    errors.push(`Missing ${missingBones.length} required humanoid bones: ${missingBones.join(', ')}.`);
  }
  if (zeroWeightVertices > 0) {
    warnings.push(`${zeroWeightVertices} vertices have zero/invalid skin weights.`);
  }

  // 2. Animation Clips
  const availableClips = clips.map((c) => c.name);
  const clipCountMap = new Map<string, number>();
  const zeroDurationClips: string[] = [];
  for (const clip of clips) {
    const low = clip.name.toLowerCase();
    clipCountMap.set(low, (clipCountMap.get(low) ?? 0) + 1);
    if (!Number.isFinite(clip.duration) || clip.duration <= 0) {
      zeroDurationClips.push(clip.name);
    }
  }
  const duplicateClips = Array.from(clipCountMap.entries())
    .filter(([, count]) => count > 1)
    .map(([name]) => name);

  const availLow = new Set(availableClips.map((c) => c.toLowerCase()));
  const missingClips = expectedClips.filter((c) => !availLow.has(c.toLowerCase()));

  if (clips.length === 0 && opts.requireRigged) {
    warnings.push('Rigged GLB contains 0 animation clips.');
  }
  if (missingClips.length > 0) {
    warnings.push(`Missing expected animation clips: ${missingClips.join(', ')}.`);
  }
  if (zeroDurationClips.length > 0) {
    warnings.push(`Zero-duration clips detected: ${zeroDurationClips.join(', ')}.`);
  }
  if (duplicateClips.length > 0) {
    warnings.push(`Duplicate clip names: ${duplicateClips.join(', ')}.`);
  }

  // 3. Transform, Bounding Box & Ground Contact (guarded against malformed SkinnedMesh missing skinWeight!)
  const box = new THREE.Box3();
  try {
    box.setFromObject(scene);
  } catch {
    scene.traverse((obj) => {
      const mesh = obj as THREE.Mesh;
      if (mesh.isMesh && mesh.geometry) {
        mesh.geometry.computeBoundingBox();
        if (mesh.geometry.boundingBox) {
          box.union(mesh.geometry.boundingBox);
        }
      }
    });
  }
  const size = new THREE.Vector3();
  const hasValidBox = !box.isEmpty() && Number.isFinite(box.min.y) && Number.isFinite(box.max.y);
  if (hasValidBox) {
    box.getSize(size);
  }
  const boundingHeight = hasValidBox ? size.y : 0;
  const groundOffsetY = hasValidBox ? box.min.y : 0;

  if (hasMesh && boundingHeight <= 0.05) {
    errors.push(`Invalid bounding height (${boundingHeight.toFixed(3)}m).`);
  } else if (opts.expectedHeightMeters && boundingHeight > 0.05) {
    const ratioDiff = Math.abs(boundingHeight - opts.expectedHeightMeters) / opts.expectedHeightMeters;
    if (ratioDiff > 0.5) {
      errors.push(
        `Model height ${boundingHeight.toFixed(2)}m deviates >50% from target ${opts.expectedHeightMeters.toFixed(2)}m.`
      );
    } else if (ratioDiff > 0.22) {
      warnings.push(
        `Model height ${boundingHeight.toFixed(2)}m differs from target ${opts.expectedHeightMeters.toFixed(2)}m.`
      );
    }
  }

  if (hasValidBox && Math.abs(groundOffsetY) > 0.2) {
    warnings.push(`Model feet/origin ground offset is ${groundOffsetY.toFixed(2)}m (expected ~0.00m).`);
  }

  // 4. Material & PBR Discipline
  for (const mat of materials) {
    const std = mat as THREE.MeshStandardMaterial;
    if (std.isMeshStandardMaterial || (mat as THREE.MeshPhysicalMaterial).isMeshPhysicalMaterial) {
      if (std.map && std.map.colorSpace !== THREE.SRGBColorSpace) {
        pbrIssues.push(`Material "${mat.name || 'unnamed'}" albedo map is not SRGBColorSpace.`);
      }
      if (!std.normalMap && !std.roughnessMap) {
        pbrIssues.push(`Material "${mat.name || 'unnamed'}" has neither normalMap nor roughnessMap.`);
      }
    } else if ((mat as THREE.MeshBasicMaterial).isMeshBasicMaterial) {
      pbrIssues.push(`Material "${mat.name || 'unnamed'}" uses unlit MeshBasicMaterial instead of PBR.`);
    }
  }
  for (const issue of pbrIssues) {
    warnings.push(issue);
  }

  const isValidRig = hasMesh && (!opts.requireRigged || (hasSkinnedMesh && missingBones.length === 0));
  const status: ValidationStatus =
    errors.length > 0 ? 'INVALID' : warnings.length > 0 ? 'WARNING' : 'VALID';

  return {
    status,
    isValidRig,
    hasMesh,
    hasSkinnedMesh,
    meshCount,
    totalBoneCount: rawBoneNames.length,
    foundBones,
    missingBones,
    boneMapping,
    extendedBonesFound,
    zeroWeightVertices,
    availableClips,
    missingClips,
    zeroDurationClips,
    duplicateClips,
    boundingHeight,
    groundOffsetY,
    materialCount: materials.size,
    pbrIssues,
    warnings,
    errors,
  };
}
