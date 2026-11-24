import { LevelData, Vec3 } from '../../types/game';
import { distanceXZ } from './NPCStateMachine';

/**
 * HỒN ÁN v5.0 – NPC Perception & Line-of-Sight Occlusion Module
 * Evaluates distance, camera FOV cone, wall/closed-door occlusion,
 * flashlight beam hit, and player noise/posture (sprinting vs crouching)
 * with zero per-frame allocations.
 */

export interface NPCPerceptionSnapshot {
  distance: number;
  inFOV: boolean;
  hasLineOfSight: boolean;
  isIlluminatedByFlashlight: boolean;
  playerNoiseLevel: number; // 0.2 crouching, 0.55 walking, 1.0 sprinting
  angleToPlayer: number;
}

/**
 * Lightweight 2D DDA / ray-march occlusion check against collidable level walls & closed doors.
 * Returns true if an unobstructed line-of-sight exists between point A and point B.
 */
export function hasUnobstructedLineOfSight(
  level: LevelData,
  from: Vec3,
  to: Vec3,
  openDoorIds: string[] = []
): boolean {
  const dx = to[0] - from[0];
  const dz = to[2] - from[2];
  const dist = Math.hypot(dx, dz);
  if (dist < 0.45) return true;

  const steps = Math.min(80, Math.max(8, Math.ceil(dist / 0.15)));
  const stepX = dx / steps;
  const stepZ = dz / steps;

  for (let i = 1; i < steps; i++) {
    const px = from[0] + stepX * i;
    const pz = from[2] + stepZ * i;

    for (const box of level.boxes) {
      if (!box.collidable) continue;
      // Ignore low tables/wells/floors that you can see right over (eye level ~1.55m)
      const top = box.position[1] + box.size[1] / 2;
      const bottom = box.position[1] - box.size[1] / 2;
      if (top < 1.35 || bottom > 2.2) continue;

      const hx = box.size[0] / 2;
      const hz = box.size[2] / 2;
      if (
        px >= box.position[0] - hx &&
        px <= box.position[0] + hx &&
        pz >= box.position[2] - hz &&
        pz <= box.position[2] + hz
      ) {
        return false;
      }
    }

    for (const door of level.doors) {
      if (openDoorIds.includes(door.id)) continue;
      const rot = Math.abs(door.rotationY ?? 0);
      const isRot = rot > Math.PI / 4 && rot < (3 * Math.PI) / 4;
      const hx = (isRot ? door.size[2] : door.size[0]) / 2 + 0.05;
      const hz = (isRot ? door.size[0] : door.size[2]) / 2 + 0.05;
      if (
        px >= door.position[0] - hx &&
        px <= door.position[0] + hx &&
        pz >= door.position[2] - hz &&
        pz <= door.position[2] + hz
      ) {
        return false;
      }
    }
  }

  return true;
}

export function evaluateNPCPerception(params: {
  level: LevelData;
  npcPos: Vec3;
  playerPos: Vec3;
  playerForward: Vec3;
  flashlightOn: boolean;
  isSprinting: boolean;
  isCrouching: boolean;
  openDoorIds: string[];
}): NPCPerceptionSnapshot {
  const { level, npcPos, playerPos, playerForward, flashlightOn, isSprinting, isCrouching, openDoorIds } =
    params;

  const distance = distanceXZ(npcPos, playerPos);
  const dx = npcPos[0] - playerPos[0];
  const dz = npcPos[2] - playerPos[2];
  const invLen = distance > 0.001 ? 1 / distance : 1;
  const fLen = Math.hypot(playerForward[0], playerForward[2]) || 1;
  const dot = (dx * invLen) * (playerForward[0] / fLen) + (dz * invLen) * (playerForward[2] / fLen);

  const inFOV = dot >= 0.56;
  const hasLineOfSight =
    distance < 40 ? hasUnobstructedLineOfSight(level, playerPos, npcPos, openDoorIds) : false;

  // Flashlight cone is narrower (~dot >= 0.86) and reaches ~16m if unobstructed
  const isIlluminatedByFlashlight =
    flashlightOn && distance <= 16 && dot >= 0.86 && hasLineOfSight;

  const playerNoiseLevel = isSprinting ? 1.0 : isCrouching ? 0.2 : 0.55;
  const angleToPlayer = Math.atan2(playerPos[0] - npcPos[0], playerPos[2] - npcPos[2]);

  return {
    distance,
    inFOV,
    hasLineOfSight,
    isIlluminatedByFlashlight,
    playerNoiseLevel,
    angleToPlayer,
  };
}
