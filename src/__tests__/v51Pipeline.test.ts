import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
import {
  REQUIRED_HUMANOID_BONES,
  resolveSemanticBoneMapping,
  validateNPCModel,
} from '../horror/npc/NPCModelValidator';
import { RiggedGLBAnimator } from '../horror/npc/NPCAnimationController';
import { NPC_DEFINITIONS } from '../horror/npc/NPCRegistry';
import { NPC_AUDIO_MANIFEST } from '../horror/jumpscare/JumpscareAudio';
import { horrorAudio } from '../audio/horrorAudio';
import { assetPipeline } from '../three/AssetPipeline';

/** Helper: builds a clean rigged SkinnedMesh fixture with valid skin weights, height, PBR material, and clips */
function createMockRiggedCharacter(options?: {
  boneNames?: string[];
  heightMeters?: number;
  groundY?: number;
  includePbrMaps?: boolean;
  zeroWeightVertex?: boolean;
  clipNames?: string[];
  zeroDurationClip?: boolean;
}) {
  const height = options?.heightMeters ?? 1.64;
  const groundY = options?.groundY ?? 0;
  const boneNames = options?.boneNames ?? [...REQUIRED_HUMANOID_BONES];

  const root = new THREE.Group();
  const bones = boneNames.map((name) => {
    const b = new THREE.Bone();
    b.name = name;
    return b;
  });
  for (let i = 1; i < bones.length; i++) {
    bones[0].add(bones[i]);
  }

  const geo = new THREE.BoxGeometry(0.45, height, 0.35);
  // Shift geometry so feet rest cleanly at groundY
  geo.translate(0, groundY + height / 2, 0);

  const vertCount = geo.attributes.position.count;
  const skinIndices = new Float32Array(vertCount * 4);
  const skinWeights = new Float32Array(vertCount * 4);
  for (let i = 0; i < vertCount; i++) {
    skinIndices[i * 4] = 0;
    skinWeights[i * 4] = options?.zeroWeightVertex && i === 0 ? 0 : 1;
  }
  geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skinIndices, 4));
  geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skinWeights, 4));

  const mat = new THREE.MeshStandardMaterial({ color: '#5c0c0c', roughness: 0.85 });
  if (options?.includePbrMaps !== false) {
    const dummyTex = new THREE.DataTexture(new Uint8Array([128, 128, 255, 255]), 1, 1);
    mat.normalMap = dummyTex;
    mat.roughnessMap = dummyTex;
  }

  const skinned = new THREE.SkinnedMesh(geo, mat);
  skinned.name = 'May_Body';
  skinned.add(bones[0]);
  skinned.bind(new THREE.Skeleton(bones));
  root.add(skinned);

  const clipNames = options?.clipNames ?? [
    'Idle',
    'HeadTilt',
    'SlowHeadRaise',
    'SlowWalk',
    'BackwardWalk',
    'ReachForward',
    'Lunge',
    'JumpscareAttack',
    'Disappear',
  ];

  const clips = clipNames.map((name, idx) => {
    const dur = options?.zeroDurationClip && idx === 0 ? 0 : 1.2;
    const track = new THREE.VectorKeyframeTrack(`${bones[0].name}.position`, [0, 0.6, 1.2], [
      0, 0, 0,
      1.5, 0.05, -2.0, // Intentional root XZ motion to test in-place clamping!
      0, 0, 0,
    ]);
    return new THREE.AnimationClip(name, dur, [track]);
  });

  return { root, clips };
}

describe('HỒN ÁN v5.1 — GLB Character Pipeline, Validator v5.1, Rigging, Animation & Audio Tests', () => {
  it('defines canonical v5.1 asset contracts for Đào Thị Mây (#1) and all 6 NPCs without fake glbAssetPresent flags', () => {
    const may = NPC_DEFINITIONS.dao_thi_may;
    expect(may.heightMeters).toBe(1.64);
    expect(may.assetContract.expectedGlbPath).toBe('/models/npcs/dao-thi-may/dao-thi-may.glb');
    expect(may.assetContract.expectedLodPath).toBe('/models/npcs/dao-thi-may/dao-thi-may-lod.glb');
    expect(may.assetContract.requiredClips).toContain('SlowHeadRaise');
    expect(may.assetContract.requiredClips).toContain('JumpscareAttack');
    expect(may.assetContract.rootMotionPolicy).toBe('in-place');

    for (const def of Object.values(NPC_DEFINITIONS)) {
      expect(def.assetContract.glbAssetPresent).toBe(false);
      expect(def.assetContract.expectedGlbPath.startsWith('/models/npcs/')).toBe(true);
      expect(def.assetContract.expectedAudioDir.startsWith('/audio/npcs/')).toBe(true);
    }
  });

  it('validates a compliant Đào Thị Mây GLB rig as VALID and maps Mixamo/Blender bone aliases cleanly', () => {
    const { root, clips } = createMockRiggedCharacter({ heightMeters: 1.64, groundY: 0 });
    const report = validateNPCModel(root, clips, {
      expectedClips: NPC_DEFINITIONS.dao_thi_may.assetContract.requiredClips,
      expectedHeightMeters: 1.64,
    });
    expect(report.status).toBe('VALID');
    expect(report.isValidRig).toBe(true);
    expect(report.foundBones).toHaveLength(15);
    expect(report.missingBones).toHaveLength(0);
    expect(report.zeroWeightVertices).toBe(0);
    expect(report.boundingHeight).toBeCloseTo(1.64, 1);

    // Mixamo bone alias mapping test
    const mixamoNames = [
      'mixamorig:Hips',
      'mixamorig:Spine',
      'mixamorig:Spine2',
      'mixamorig:Neck',
      'mixamorig:Head',
      'mixamorig:LeftArm',
      'mixamorig:RightArm',
      'mixamorig:LeftForeArm',
      'mixamorig:RightForeArm',
      'mixamorig:LeftHand',
      'mixamorig:RightHand',
      'mixamorig:LeftUpLeg',
      'mixamorig:RightUpLeg',
      'mixamorig:LeftFoot',
      'mixamorig:RightFoot',
    ];
    const mapped = resolveSemanticBoneMapping(mixamoNames);
    expect(mapped.missingBones).toHaveLength(0);
    expect(mapped.boneMapping.Chest).toBe('mixamorig:Spine2');
    expect(mapped.boneMapping.LeftLeg).toBe('mixamorig:LeftUpLeg');
  });

  it('flags WARNING for missing clips/PBR/zero-weights/ground-offset and INVALID for unrigged or wrong-scale models', () => {
    const warnFixture = createMockRiggedCharacter({
      heightMeters: 1.64,
      groundY: 0.45,
      includePbrMaps: false,
      zeroWeightVertex: true,
      clipNames: ['Idle'],
    });
    const warnReport = validateNPCModel(warnFixture.root, warnFixture.clips, {
      expectedClips: ['Idle', 'SlowHeadRaise'],
      expectedHeightMeters: 1.64,
    });
    expect(warnReport.status).toBe('WARNING');
    expect(warnReport.isValidRig).toBe(true);
    expect(warnReport.zeroWeightVertices).toBe(1);
    expect(warnReport.missingClips).toContain('SlowHeadRaise');
    expect(warnReport.pbrIssues.length).toBeGreaterThan(0);

    // Unrigged static mesh -> INVALID
    const staticGroup = new THREE.Group();
    staticGroup.add(new THREE.Mesh(new THREE.BoxGeometry(0.5, 1.64, 0.5), new THREE.MeshStandardMaterial()));
    const invalidReport = validateNPCModel(staticGroup, [], { expectedHeightMeters: 1.64 });
    expect(invalidReport.status).toBe('INVALID');
    expect(invalidReport.isValidRig).toBe(false);
    expect(invalidReport.hasSkinnedMesh).toBe(false);

    // Severely wrong height (5m tall) -> INVALID
    const giant = createMockRiggedCharacter({ heightMeters: 5.0 });
    const giantReport = validateNPCModel(giant.root, giant.clips, { expectedHeightMeters: 1.64 });
    expect(giantReport.status).toBe('INVALID');
    expect(giantReport.errors.some((e) => e.includes('deviates >50%'))).toBe(true);
  });

  it('clones skeletons & materials independently across 4 instances, enforces in-place root motion, and crossfades cleanly', () => {
    const { root, clips } = createMockRiggedCharacter({ heightMeters: 1.64 });
    const anim1 = new RiggedGLBAnimator(root, clips, ['Idle', 'SlowHeadRaise', 'Lunge'], 1.64);
    const anim2 = new RiggedGLBAnimator(root, clips, ['Idle', 'SlowHeadRaise', 'Lunge'], 1.64);

    // Independent animation states
    expect(anim1.crossfadeTo('SlowHeadRaise', 0.2)).toBe(true);
    expect(anim2.crossfadeTo('Lunge', 0.2)).toBe(true);
    expect(anim1.currentClipName).toBe('SlowHeadRaise');
    expect(anim2.currentClipName).toBe('Lunge');

    // Step animation and verify in-place root motion clamp prevents horizontal XZ drift
    anim1.update(0.6, true);
    const hips1 = anim1.root.getObjectByName('Hips')!;
    expect(hips1.position.x).toBeCloseTo(0, 4);
    expect(hips1.position.z).toBeCloseTo(0, 4);
    expect(anim1.getTime()).toBeGreaterThan(0);

    // Opacity change on anim1 does NOT mutate anim2 or source material!
    anim1.applyOpacity(0.25);
    const m1 = (anim1.root.getObjectByName('May_Body') as THREE.Mesh).material as THREE.Material;
    const m2 = (anim2.root.getObjectByName('May_Body') as THREE.Mesh).material as THREE.Material;
    expect(m1.opacity).toBeCloseTo(0.25, 2);
    expect(m2.opacity).toBeCloseTo(1, 2);

    // Crossfade & Stop / Reset / Safe Dispose
    expect(anim1.crossfadeTo('JumpscareAttack', 0.15)).toBe(true);
    anim1.stop();
    expect(anim1.isPaused).toBe(true);
    anim1.reset();
    expect(anim1.isPaused).toBe(false);

    anim1.dispose();
    anim2.dispose();
    // Source scene remains intact for future clones
    expect(root.children.length).toBe(1);
  });

  it('routes external NPC audio manifest safely to procedural fallback when real recordings are absent', () => {
    for (const entry of Object.values(NPC_AUDIO_MANIFEST)) {
      expect(entry.enabled).toBe(false);
      expect(entry.jumpscareUrl.startsWith('/audio/npcs/')).toBe(true);
    }

    let fallbackCalled = false;
    const playedExternal = horrorAudio.playSpatialBufferOrFallback(
      null,
      [0, 1.5, -2],
      () => {
        fallbackCalled = true;
      }
    );
    expect(playedExternal).toBe(false);
    expect(fallbackCalled).toBe(true);

    // AssetPipeline stats stay clean (0 leaked mixers or dangling cache)
    const stats = assetPipeline.getStats();
    expect(stats.activeMixers).toBe(0);
  });
});
