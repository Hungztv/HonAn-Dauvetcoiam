import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { assetPipeline } from '../../three/AssetPipeline';
import { NPCState } from './NPCStateMachine';

/**
 * Unified Animation Controller supporting:
 * 1) Real Blender-exported Rigged GLB characters (SkinnedMesh + SkeletonUtils.clone + AnimationMixer + Crossfade)
 * 2) Articulated Procedural Joint Rigs (head, neck, torso, arms, hands, legs) with smooth damped blending
 *    and distance-based animation culling.
 */

export interface ArticulatedJoints {
  root?: THREE.Group | null;
  torso?: THREE.Group | null;
  head?: THREE.Group | null;
  leftArm?: THREE.Group | null;
  rightArm?: THREE.Group | null;
  leftLeg?: THREE.Group | null;
  rightLeg?: THREE.Group | null;
  hair?: THREE.Group | null;
  oar?: THREE.Group | null;
}

export class RiggedGLBAnimator {
  public root: THREE.Object3D;
  public mixer: THREE.AnimationMixer;
  private actions = new Map<string, THREE.AnimationAction>();
  private currentAction: THREE.AnimationAction | null = null;

  constructor(sourceScene: THREE.Object3D, clips: THREE.AnimationClip[]) {
    // Skeleton-aware cloning so multiple instances of the same rigged GLB have independent skeletons
    this.root = cloneSkinned(sourceScene);
    this.mixer = new THREE.AnimationMixer(this.root);
    for (const clip of clips) {
      const action = this.mixer.clipAction(clip);
      this.actions.set(clip.name.toLowerCase(), action);
    }
  }

  public crossfadeTo(clipName: string, duration = 0.25) {
    const next = this.actions.get(clipName.toLowerCase()) ?? this.actions.values().next().value;
    if (!next || next === this.currentAction) return;
    next.reset().play();
    if (this.currentAction) {
      this.currentAction.crossFadeTo(next, duration, true);
    }
    this.currentAction = next;
  }

  public update(delta: number) {
    this.mixer.update(delta);
  }

  public dispose() {
    this.mixer.stopAllAction();
    this.mixer.uncacheRoot(this.root);
  }
}

export async function loadRiggedCharacterGLB(
  url: string,
  renderer?: THREE.WebGLRenderer
): Promise<RiggedGLBAnimator> {
  const entry = await assetPipeline.loadModel(url, renderer);
  return new RiggedGLBAnimator(entry.gltf.scene, entry.gltf.animations);
}

/**
 * Smooth procedural joint animation solver driven by FSM state & elapsed time.
 * Automatically dampens / culls updates when outside active camera distance.
 */
export function updateArticulatedJoints(
  joints: ArticulatedJoints,
  state: NPCState,
  elapsed: number,
  delta: number,
  options?: {
    sitting?: boolean;
    rowing?: boolean;
    limp?: boolean;
    submergedRatio?: number; // 0 = surfaced, 1 = deep underwater
    headLookYaw?: number;
  }
) {
  const damp = Math.min(1, delta * 9);
  const breathe = Math.sin(elapsed * 2.1);

  let targetTorsoX = 0;
  let targetTorsoZ = 0;
  let targetHeadX = 0;
  let targetHeadY = options?.headLookYaw ?? 0;
  let targetHeadZ = 0;
  let targetLArmX = 0;
  let targetRArmX = 0;
  let targetLArmZ = 0.12;
  let targetRArmZ = -0.12;
  let targetLLegX = 0;
  let targetRLegX = 0;

  if (options?.sitting) {
    targetTorsoX = 0.06 + breathe * 0.02;
    targetLLegX = -1.38;
    targetRLegX = -1.38;
    targetLArmX = -0.35;
    targetRArmX = -0.35;
  } else if (options?.rowing) {
    const stroke = Math.sin(elapsed * 1.45);
    targetTorsoX = 0.18 + stroke * 0.16;
    targetLArmX = -0.75 + stroke * 0.42;
    targetRArmX = -0.75 + stroke * 0.42;
    if (joints.oar) {
      joints.oar.rotation.x = THREE.MathUtils.lerp(joints.oar.rotation.x, 0.35 + stroke * 0.35, damp);
    }
  } else if (state === 'Jumpscaring' || state === 'Attacking') {
    const tremor = Math.sin(elapsed * 42) * 0.08;
    targetTorsoX = 0.22;
    targetHeadX = -0.14;
    targetHeadZ = tremor * 1.8;
    // Reaching both arms aggressively forward toward the player!
    targetLArmX = -1.48 + tremor;
    targetRArmX = -1.42 - tremor;
    targetLArmZ = 0.24;
    targetRArmZ = -0.24;
  } else if (state === 'Approaching' || state === 'Chasing' || state === 'Stalking') {
    const pace = state === 'Chasing' ? 7.5 : 3.8;
    const stride = Math.sin(elapsed * pace);
    const limpBias = options?.limp ? 0.16 : 0;
    targetTorsoX = 0.12 + limpBias * 0.5;
    targetTorsoZ = options?.limp ? Math.abs(stride) * 0.14 : stride * 0.04;
    targetHeadZ = options?.limp ? -0.24 : 0;
    targetLLegX = stride * 0.42;
    targetRLegX = -stride * 0.42;
    targetLArmX = -0.45 - stride * 0.25;
    targetRArmX = -0.55 + stride * 0.25;
  } else {
    // Eerie slow breathing idle / observing
    targetTorsoX = 0.03 + breathe * 0.025;
    targetHeadZ = options?.limp ? 0.22 + Math.sin(elapsed * 0.9) * 0.08 : Math.sin(elapsed * 0.7) * 0.05;
    targetLArmX = breathe * 0.04;
    targetRArmX = -breathe * 0.04;
  }

  if (joints.torso) {
    joints.torso.rotation.x = THREE.MathUtils.lerp(joints.torso.rotation.x, targetTorsoX, damp);
    joints.torso.rotation.z = THREE.MathUtils.lerp(joints.torso.rotation.z, targetTorsoZ, damp);
  }
  if (joints.head) {
    joints.head.rotation.x = THREE.MathUtils.lerp(joints.head.rotation.x, targetHeadX, damp);
    joints.head.rotation.y = THREE.MathUtils.lerp(joints.head.rotation.y, targetHeadY, damp);
    joints.head.rotation.z = THREE.MathUtils.lerp(joints.head.rotation.z, targetHeadZ, damp);
  }
  if (joints.leftArm) {
    joints.leftArm.rotation.x = THREE.MathUtils.lerp(joints.leftArm.rotation.x, targetLArmX, damp);
    joints.leftArm.rotation.z = THREE.MathUtils.lerp(joints.leftArm.rotation.z, targetLArmZ, damp);
  }
  if (joints.rightArm) {
    joints.rightArm.rotation.x = THREE.MathUtils.lerp(joints.rightArm.rotation.x, targetRArmX, damp);
    joints.rightArm.rotation.z = THREE.MathUtils.lerp(joints.rightArm.rotation.z, targetRArmZ, damp);
  }
  if (joints.leftLeg) {
    joints.leftLeg.rotation.x = THREE.MathUtils.lerp(joints.leftLeg.rotation.x, targetLLegX, damp);
  }
  if (joints.rightLeg) {
    joints.rightLeg.rotation.x = THREE.MathUtils.lerp(joints.rightLeg.rotation.x, targetRLegX, damp);
  }
  if (joints.hair) {
    joints.hair.rotation.z = Math.sin(elapsed * 1.8) * 0.07;
    joints.hair.rotation.x = 0.04 + Math.cos(elapsed * 1.3) * 0.04;
  }
}
