import * as THREE from 'three';
import { clone as cloneSkinned } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { assetPipeline } from '../../three/AssetPipeline';
import { validateNPCModel, type NPCModelValidationReport } from './NPCModelValidator';
import { NPCState } from './NPCStateMachine';

/**
 * HỒN ÁN v5.0 – Unified 15-Joint Articulated & GLB-Rigged Animation Controller
 * Supports:
 * 1) External Blender Rigged GLB characters via SkeletonUtils.clone + AnimationMixer + Crossfade + Clip Validation
 * 2) Full 15-Joint Articulated Procedural Humanoid Skeleton (Hips -> Spine -> Chest -> Neck -> Head,
 *    UpperArm -> ForeArm -> Hand, Leg -> Foot, Hair, Oar) with 16 named animation states!
 */

export type NPCAnimationClipName =
  | 'Idle'
  | 'HeadTilt'
  | 'SlowHeadRaise'
  | 'SlowWalk'
  | 'BackwardWalk'
  | 'LimpWalk'
  | 'Crawling'
  | 'ShieldFace'
  | 'ReachForward'
  | 'Lunge'
  | 'JumpscareAttack'
  | 'SittingIdle'
  | 'StandUp'
  | 'Rowing'
  | 'WaterRise'
  | 'Disappear';

export interface ArticulatedJoints {
  root?: THREE.Group | null;
  hips?: THREE.Group | null;
  torso?: THREE.Group | null; // Spine / Chest
  neck?: THREE.Group | null;
  head?: THREE.Group | null;
  leftArm?: THREE.Group | null;
  rightArm?: THREE.Group | null;
  leftForeArm?: THREE.Group | null;
  rightForeArm?: THREE.Group | null;
  leftLeg?: THREE.Group | null;
  rightLeg?: THREE.Group | null;
  hair?: THREE.Group | null;
  oar?: THREE.Group | null;
}

export class RiggedGLBAnimator {
  public root: THREE.Object3D;
  public mixer: THREE.AnimationMixer;
  public validation: NPCModelValidationReport;
  private actions = new Map<string, THREE.AnimationAction>();
  private currentAction: THREE.AnimationAction | null = null;

  constructor(sourceScene: THREE.Object3D, clips: THREE.AnimationClip[], expectedClips: string[] = []) {
    this.root = cloneSkinned(sourceScene);
    this.validation = validateNPCModel(this.root, clips, expectedClips);
    this.mixer = new THREE.AnimationMixer(this.root);
    for (const clip of clips) {
      const action = this.mixer.clipAction(clip);
      this.actions.set(clip.name.toLowerCase(), action);
    }
  }

  public crossfadeTo(clipName: string, duration = 0.25, loopOnce = false): boolean {
    const next =
      this.actions.get(clipName.toLowerCase()) ??
      this.actions.get('idle') ??
      this.actions.values().next().value;
    if (!next) return false;
    if (next === this.currentAction) return true;

    next.reset();
    next.setLoop(loopOnce ? THREE.LoopOnce : THREE.LoopRepeat, loopOnce ? 1 : Infinity);
    next.clampWhenFinished = loopOnce;
    next.play();
    if (this.currentAction) {
      this.currentAction.crossFadeTo(next, duration, true);
    }
    this.currentAction = next;
    return true;
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
  expectedClips: string[] = [],
  renderer?: THREE.WebGLRenderer
): Promise<RiggedGLBAnimator> {
  const entry = await assetPipeline.loadModel(url, renderer);
  return new RiggedGLBAnimator(entry.gltf.scene, entry.gltf.animations, expectedClips);
}

/** Maps an NPC FSM state to a sensible default animation clip name */
export function resolveClipFromState(
  state: NPCState,
  opts?: {
    sitting?: boolean;
    rowing?: boolean;
    limp?: boolean;
    crawling?: boolean;
    shieldFace?: boolean;
    overrideClip?: NPCAnimationClipName | null;
  }
): NPCAnimationClipName {
  if (opts?.overrideClip) return opts.overrideClip;
  if (opts?.shieldFace) return 'ShieldFace';
  if (opts?.crawling) return 'Crawling';
  if (opts?.sitting) return 'SittingIdle';
  if (opts?.rowing && state !== 'Jumpscaring') return 'Rowing';
  switch (state) {
    case 'Jumpscaring':
      return 'JumpscareAttack';
    case 'Attacking':
      return 'Lunge';
    case 'Chasing':
      return opts?.limp ? 'LimpWalk' : 'ReachForward';
    case 'Approaching':
    case 'Stalking':
      return opts?.limp ? 'LimpWalk' : 'SlowWalk';
    case 'Retreating':
      return 'BackwardWalk';
    case 'Disappearing':
      return 'Disappear';
    case 'Observing':
      return 'SlowHeadRaise';
    default:
      return 'Idle';
  }
}

/**
 * Full 15-joint articulated procedural pose solver for all 16 named animation clips.
 * Zero object allocations per frame; smooth exponential damping prevents joint snapping.
 */
export function updateArticulatedJoints(
  joints: ArticulatedJoints,
  state: NPCState,
  elapsed: number,
  delta: number,
  options?: {
    overrideClip?: NPCAnimationClipName | null;
    sitting?: boolean;
    rowing?: boolean;
    limp?: boolean;
    crawling?: boolean;
    shieldFace?: boolean;
    headLookYaw?: number;
  }
) {
  const clip = options?.overrideClip ?? resolveClipFromState(state, options);
  const damp = Math.min(1, delta * 9.5);
  const breathe = Math.sin(elapsed * 2.1);

  let hipsY = 0;
  let hipsXRot = 0;
  let torsoX = 0;
  let torsoZ = 0;
  let headX = 0;
  let headY = options?.headLookYaw ?? 0;
  let headZ = 0;
  let lArmX = 0;
  let rArmX = 0;
  let lArmZ = 0.1;
  let rArmZ = -0.1;
  let lForeX = -0.12;
  let rForeX = -0.12;
  let lLegX = 0;
  let rLegX = 0;

  switch (clip) {
    case 'Crawling': {
      // Trần Thị Liên low floor crawl ABOVE floor plane (y=0) with alternating arm/knee reach!
      const crawl = Math.sin(elapsed * 5.2);
      hipsY = 0.16;
      hipsXRot = 1.16; // Low forward crawling posture keeping torso & head clearly above floor (y ~ 0.45-0.68m)
      torsoX = 0.12;
      torsoZ = crawl * 0.14;
      headX = -0.95; // Chin raised eerily toward player!
      headZ = Math.sin(elapsed * 2.8) * 0.22;
      lArmX = -1.35 + crawl * 0.45;
      rArmX = -1.35 - crawl * 0.45;
      lForeX = -0.55;
      rForeX = -0.55;
      lLegX = 0.35 - crawl * 0.35;
      rLegX = 0.35 + crawl * 0.35;
      break;
    }

    case 'ShieldFace': {
      // Flashing light onto Trần Thị Liên: recoils & raises forearm across her pale face
      const tremble = Math.sin(elapsed * 26) * 0.04;
      torsoX = -0.14;
      headX = 0.22;
      headZ = 0.28 + tremble;
      lArmX = -1.55;
      lArmZ = -0.45;
      lForeX = -1.1;
      rArmX = -1.15;
      rForeX = -0.75;
      break;
    }

    case 'SlowHeadRaise': {
      // Đào Thị Mây standing motionless ~2m away, hair covering face, then slowly raising head!
      const raiseCycle = 0.5 + 0.5 * Math.sin(elapsed * 0.75 - Math.PI / 2);
      torsoX = 0.08 + breathe * 0.025;
      headX = THREE.MathUtils.lerp(0.55, -0.18, raiseCycle);
      headZ = 0.18 * (1 - raiseCycle);
      lArmX = -0.15 + breathe * 0.04;
      rArmX = -0.15 - breathe * 0.04;
      lForeX = -0.25;
      rForeX = -0.25;
      break;
    }

    case 'HeadTilt': {
      torsoX = 0.04 + breathe * 0.02;
      headZ = 0.42 + Math.sin(elapsed * 1.4) * 0.08;
      headX = -0.08;
      break;
    }

    case 'SittingIdle': {
      hipsY = -0.34;
      torsoX = 0.06 + breathe * 0.02;
      lLegX = -1.38;
      rLegX = -1.38;
      lArmX = -0.38;
      rArmX = -0.38;
      lForeX = -0.42;
      rForeX = -0.42;
      break;
    }

    case 'StandUp': {
      hipsY = 0;
      torsoX = 0.04;
      lArmX = -0.18;
      rArmX = -0.18;
      break;
    }

    case 'Rowing': {
      const stroke = Math.sin(elapsed * 1.45);
      torsoX = 0.18 + stroke * 0.16;
      lArmX = -0.78 + stroke * 0.4;
      rArmX = -0.78 + stroke * 0.4;
      lForeX = -0.45;
      rForeX = -0.45;
      if (joints.oar) {
        joints.oar.rotation.x = THREE.MathUtils.lerp(joints.oar.rotation.x, 0.35 + stroke * 0.36, damp);
      }
      break;
    }

    case 'JumpscareAttack':
    case 'Lunge': {
      const tremor = Math.sin(elapsed * 44) * 0.08;
      torsoX = 0.26;
      headX = -0.18;
      headZ = tremor * 2.0;
      lArmX = -1.52 + tremor;
      rArmX = -1.46 - tremor;
      lArmZ = 0.22;
      rArmZ = -0.22;
      lForeX = -0.35;
      rForeX = -0.35;
      break;
    }

    case 'ReachForward': {
      const stride = Math.sin(elapsed * 5.2);
      torsoX = 0.18;
      lArmX = -1.28 + stride * 0.14;
      rArmX = -1.24 - stride * 0.14;
      lForeX = -0.22;
      rForeX = -0.22;
      lLegX = stride * 0.42;
      rLegX = -stride * 0.42;
      break;
    }

    case 'SlowWalk':
    case 'LimpWalk':
    case 'BackwardWalk': {
      const dir = clip === 'BackwardWalk' ? -1 : 1;
      const limp = clip === 'LimpWalk' || Boolean(options?.limp);
      const stride = Math.sin(elapsed * (limp ? 3.2 : 4.0)) * dir;
      torsoX = limp ? 0.18 : 0.09;
      torsoZ = limp ? Math.abs(stride) * 0.16 : stride * 0.04;
      headZ = limp ? -0.26 : Math.sin(elapsed * 1.1) * 0.06;
      lLegX = stride * 0.38;
      rLegX = -stride * 0.38;
      lArmX = -0.32 - stride * 0.22;
      rArmX = -0.36 + stride * 0.22;
      lForeX = -0.32;
      rForeX = -0.32;
      break;
    }

    case 'WaterRise': {
      torsoX = 0.1;
      headX = -0.15;
      lArmX = -1.1;
      rArmX = -1.1;
      lForeX = -0.4;
      rForeX = -0.4;
      break;
    }

    case 'Disappear': {
      torsoX = -0.18;
      headX = 0.32;
      lArmX = -0.4;
      rArmX = -0.4;
      break;
    }

    default: {
      // Eerie breathing Idle
      torsoX = 0.04 + breathe * 0.025;
      headZ = options?.limp ? 0.22 + Math.sin(elapsed * 0.9) * 0.08 : Math.sin(elapsed * 0.7) * 0.06;
      lArmX = breathe * 0.04;
      rArmX = -breathe * 0.04;
      break;
    }
  }

  if (joints.hips) {
    joints.hips.position.y = THREE.MathUtils.lerp(joints.hips.position.y, hipsY, damp);
    joints.hips.rotation.x = THREE.MathUtils.lerp(joints.hips.rotation.x, hipsXRot, damp);
  }
  if (joints.torso) {
    joints.torso.rotation.x = THREE.MathUtils.lerp(joints.torso.rotation.x, torsoX, damp);
    joints.torso.rotation.z = THREE.MathUtils.lerp(joints.torso.rotation.z, torsoZ, damp);
  }
  if (joints.head) {
    joints.head.rotation.x = THREE.MathUtils.lerp(joints.head.rotation.x, headX, damp);
    joints.head.rotation.y = THREE.MathUtils.lerp(joints.head.rotation.y, headY, damp);
    joints.head.rotation.z = THREE.MathUtils.lerp(joints.head.rotation.z, headZ, damp);
  }
  if (joints.leftArm) {
    joints.leftArm.rotation.x = THREE.MathUtils.lerp(joints.leftArm.rotation.x, lArmX, damp);
    joints.leftArm.rotation.z = THREE.MathUtils.lerp(joints.leftArm.rotation.z, lArmZ, damp);
  }
  if (joints.rightArm) {
    joints.rightArm.rotation.x = THREE.MathUtils.lerp(joints.rightArm.rotation.x, rArmX, damp);
    joints.rightArm.rotation.z = THREE.MathUtils.lerp(joints.rightArm.rotation.z, rArmZ, damp);
  }
  if (joints.leftForeArm) {
    joints.leftForeArm.rotation.x = THREE.MathUtils.lerp(joints.leftForeArm.rotation.x, lForeX, damp);
  }
  if (joints.rightForeArm) {
    joints.rightForeArm.rotation.x = THREE.MathUtils.lerp(joints.rightForeArm.rotation.x, rForeX, damp);
  }
  if (joints.leftLeg) {
    joints.leftLeg.rotation.x = THREE.MathUtils.lerp(joints.leftLeg.rotation.x, lLegX, damp);
  }
  if (joints.rightLeg) {
    joints.rightLeg.rotation.x = THREE.MathUtils.lerp(joints.rightLeg.rotation.x, rLegX, damp);
  }
  if (joints.hair) {
    joints.hair.rotation.z = Math.sin(elapsed * 1.9) * 0.08;
    joints.hair.rotation.x = 0.05 + Math.cos(elapsed * 1.4) * 0.05;
  }
}
