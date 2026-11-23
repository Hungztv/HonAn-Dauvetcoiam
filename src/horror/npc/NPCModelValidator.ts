import * as THREE from 'three';

/**
 * HỒN ÁN v5.0 – Rigged GLB Character Validator
 * Validates external Blender-exported .glb characters before activating SkinnedMesh animations:
 * checks required humanoid skeleton bones, verifies animation clips, and reports missing assets cleanly.
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

export interface NPCModelValidationReport {
  isValidRig: boolean;
  hasSkinnedMesh: boolean;
  foundBones: string[];
  missingBones: string[];
  availableClips: string[];
  missingClips: string[];
}

export function validateNPCModel(
  scene: THREE.Object3D,
  clips: THREE.AnimationClip[],
  expectedClips: string[] = []
): NPCModelValidationReport {
  let hasSkinnedMesh = false;
  const boneNames = new Set<string>();

  scene.traverse((obj) => {
    if ((obj as THREE.SkinnedMesh).isSkinnedMesh) {
      hasSkinnedMesh = true;
      const skel = (obj as THREE.SkinnedMesh).skeleton;
      skel?.bones.forEach((b) => boneNames.add(b.name.toLowerCase()));
    }
    if ((obj as THREE.Bone).isBone) {
      boneNames.add(obj.name.toLowerCase());
    }
  });

  const foundBones: string[] = [];
  const missingBones: string[] = [];
  for (const req of REQUIRED_HUMANOID_BONES) {
    const low = req.toLowerCase();
    const matched = Array.from(boneNames).some((b) => b.includes(low));
    if (matched) foundBones.push(req);
    else missingBones.push(req);
  }

  const availableClips = clips.map((c) => c.name);
  const availLow = new Set(availableClips.map((c) => c.toLowerCase()));
  const missingClips = expectedClips.filter((c) => !availLow.has(c.toLowerCase()));

  return {
    isValidRig: hasSkinnedMesh && missingBones.length === 0,
    hasSkinnedMesh,
    foundBones,
    missingBones,
    availableClips,
    missingClips,
  };
}
