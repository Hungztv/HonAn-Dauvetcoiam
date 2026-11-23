import { LevelData, Vec3 } from '../../types/game';
import { NPCCharacterType } from '../npc/NPCStateMachine';
import { findSafeNPCSpawnPosition } from '../npc/NPCSpawnManager';
import { playNPCJumpscareAudio } from './JumpscareAudio';

export interface PhysicalJumpscareEvent {
  id: string;
  npcType: NPCCharacterType;
  caption: string;
  /** Exact 3D world spawn position of the physical 3D NPC (collision-verified!) */
  worldPosition: Vec3;
  /** Eye-level 3D world target for brief camera look-at pull */
  lookAtTarget: Vec3;
  rotationY: number;
  startedAt: number;
  durationMs: number;
}

/**
 * Pure planner for a 3D Physical Jumpscare sequence.
 * Computes an unobstructed 3D position in front of the player (or uses a fixed
 * canonical anchor like Level 3's well center), orients the 3D NPC cleanly toward
 * the player, and calculates eye-height look-at coordinates.
 */
export function buildPhysicalJumpscareEvent(params: {
  level: LevelData;
  npcType: NPCCharacterType;
  caption: string;
  playerPos: Vec3;
  playerForward: Vec3;
  openDoorIds: string[];
  fixedWorldPosition?: Vec3;
  preferredDistance?: number;
  durationMs?: number;
}): PhysicalJumpscareEvent | null {
  const worldPos =
    params.fixedWorldPosition ??
    findSafeNPCSpawnPosition(
      params.level,
      params.playerPos,
      params.playerForward,
      params.preferredDistance ?? 1.68,
      true,
      params.openDoorIds
    );

  if (!worldPos) return null;

  // Orient 3D NPC cleanly toward the player
  const rotationY = Math.atan2(
    params.playerPos[0] - worldPos[0],
    params.playerPos[2] - worldPos[2]
  );

  const eyeY =
    params.npcType === 'child_spirit'
      ? worldPos[1] + 1.05
      : params.npcType === 'wooden_statue'
      ? worldPos[1] + 1.78
      : worldPos[1] + 1.54;

  const now = Date.now();
  return {
    id: `phys_js_${now}`,
    npcType: params.npcType,
    caption: params.caption,
    worldPosition: worldPos,
    lookAtTarget: [worldPos[0], eyeY, worldPos[2]],
    rotationY,
    startedAt: now,
    durationMs: params.durationMs ?? 1150,
  };
}

/** Plays 3D positional audio for a physical jumpscare at the exact 3D NPC coordinates */
export function dispatchPhysicalJumpscareAudio(ev: PhysicalJumpscareEvent) {
  playNPCJumpscareAudio(ev.npcType, ev.worldPosition);
}
