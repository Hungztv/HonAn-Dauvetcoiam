import { LevelData, Vec3 } from '../../types/game';
import { NPCCharacterType } from '../npc/NPCStateMachine';
import { NPCAnimationClipName } from '../npc/NPCAnimationController';
import { findSafeNPCSpawnPosition } from '../npc/NPCSpawnManager';
import { playNPCJumpscareAudio } from './JumpscareAudio';

export type JumpscareType =
  | 'A_BEHIND_PLAYER'
  | 'B_CORRIDOR_REVEAL'
  | 'C_CORNER_AMBUSH'
  | 'D_SURFACE_REVEAL'
  | 'E_SUDDEN_APPROACH'
  | 'F_LIGHT_TRIGGER'
  | 'G_STATUE_MOVEMENT'
  | 'H_WATER_EMERGENCE';

export type JumpscarePhase =
  | 'PREPARE'
  | 'SPAWN'
  | 'HOLD'
  | 'LUNGE'
  | 'VANISH'
  | 'COOLDOWN';

export interface PhysicalJumpscareEvent {
  id: string;
  npcType: NPCCharacterType;
  jumpscareType: JumpscareType;
  caption: string;
  /** Exact 3D world spawn position of the physical 3D NPC (collision-verified!) */
  worldPosition: Vec3;
  /** Eye-level 3D world target for brief camera look-at pull */
  lookAtTarget: Vec3;
  rotationY: number;
  startedAt: number;
  durationMs: number;
  animationClip?: NPCAnimationClipName;
  crawling?: boolean;
}

/**
 * Evaluates the exact multi-stage sequence phase for a running Physical 3D Jumpscare:
 * PREPARE (0–8%) -> SPAWN (8–22%) -> HOLD (22–45%) -> LUNGE (45–80%) -> VANISH (80–100%) -> COOLDOWN
 */
export function getJumpscarePhase(
  ev: PhysicalJumpscareEvent,
  nowMs: number = Date.now()
): JumpscarePhase {
  const ratio = (nowMs - ev.startedAt) / Math.max(1, ev.durationMs);
  if (ratio < 0.08) return 'PREPARE';
  if (ratio < 0.22) return 'SPAWN';
  if (ratio < 0.45) return 'HOLD';
  if (ratio < 0.8) return 'LUNGE';
  if (ratio <= 1.0) return 'VANISH';
  return 'COOLDOWN';
}

/**
 * Pure planner for a 3D Physical Jumpscare sequence (v5.0 Types A–H).
 * Computes an unobstructed 3D position relative to the player (in front or behind for Type A,
 * or using a canonical world anchor like Level 3's well center), orients the 3D NPC toward
 * the player, and calculates eye-height look-at coordinates (including floor-level for crawling).
 */
export function buildPhysicalJumpscareEvent(params: {
  level: LevelData;
  npcType: NPCCharacterType;
  caption: string;
  playerPos: Vec3;
  playerForward: Vec3;
  openDoorIds: string[];
  jumpscareType?: JumpscareType;
  fixedWorldPosition?: Vec3;
  preferredDistance?: number;
  durationMs?: number;
  animationClip?: NPCAnimationClipName;
  crawling?: boolean;
}): PhysicalJumpscareEvent | null {
  const jumpscareType: JumpscareType = params.jumpscareType ?? 'E_SUDDEN_APPROACH';
  const spawnInFront = jumpscareType !== 'A_BEHIND_PLAYER';

  const worldPos =
    params.fixedWorldPosition ??
    findSafeNPCSpawnPosition(
      params.level,
      params.playerPos,
      params.playerForward,
      params.preferredDistance ?? (jumpscareType === 'B_CORRIDOR_REVEAL' ? 2.4 : 1.68),
      spawnInFront,
      params.openDoorIds
    );

  if (!worldPos) return null;

  // Orient 3D NPC cleanly toward the player
  const rotationY = Math.atan2(
    params.playerPos[0] - worldPos[0],
    params.playerPos[2] - worldPos[2]
  );

  const eyeY = params.crawling
    ? worldPos[1] + 0.62
    : params.npcType === 'child_spirit'
    ? worldPos[1] + 1.05
    : params.npcType === 'wooden_statue'
    ? worldPos[1] + 1.78
    : worldPos[1] + 1.54;

  const now = Date.now();
  return {
    id: `phys_js_${now}`,
    npcType: params.npcType,
    jumpscareType,
    caption: params.caption,
    worldPosition: worldPos,
    lookAtTarget: [worldPos[0], eyeY, worldPos[2]],
    rotationY,
    startedAt: now,
    durationMs: params.durationMs ?? 1250,
    animationClip: params.animationClip,
    crawling: params.crawling,
  };
}

/** Plays 3D positional audio for a physical jumpscare at the exact 3D NPC coordinates */
export function dispatchPhysicalJumpscareAudio(ev: PhysicalJumpscareEvent) {
  playNPCJumpscareAudio(ev.npcType, ev.worldPosition);
}
