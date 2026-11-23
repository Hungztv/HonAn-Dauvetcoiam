import { LevelData, Vec3 } from '../../types/game';

/**
 * Collision-aware safe spawn solver for 3D Horror NPCs.
 * Ensures an NPC NEVER spawns inside walls, closed doors, level bounds,
 * or inside the player's personal capsule collider.
 */

export function isPointBlockedInLevel(
  level: LevelData,
  x: number,
  z: number,
  radius = 0.42,
  openDoorIds: string[] = []
): boolean {
  if (
    x < level.bounds.minX + radius ||
    x > level.bounds.maxX - radius ||
    z < level.bounds.minZ + radius ||
    z > level.bounds.maxZ - radius
  ) {
    return true;
  }

  for (const box of level.boxes) {
    if (!box.collidable) continue;
    const top = box.position[1] + box.size[1] / 2;
    const bottom = box.position[1] - box.size[1] / 2;
    if (top < 0.35 || bottom > 1.9) continue;

    const hx = box.size[0] / 2 + radius;
    const hz = box.size[2] / 2 + radius;
    if (
      x > box.position[0] - hx &&
      x < box.position[0] + hx &&
      z > box.position[2] - hz &&
      z < box.position[2] + hz
    ) {
      return true;
    }
  }

  for (const door of level.doors) {
    if (openDoorIds.includes(door.id)) continue;
    const rot = Math.abs(door.rotationY ?? 0);
    const isRot = rot > Math.PI / 4 && rot < (3 * Math.PI) / 4;
    const wX = isRot ? door.size[2] : door.size[0];
    const wZ = isRot ? door.size[0] : door.size[2];
    if (
      x > door.position[0] - (wX / 2 + radius) &&
      x < door.position[0] + (wX / 2 + radius) &&
      z > door.position[2] - (wZ / 2 + radius) &&
      z < door.position[2] + (wZ / 2 + radius)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Finds a safe, unobstructed 3D world position at a controlled distance in front of
 * (or behind) the player for a physical 3D NPC reveal / jumpscare.
 */
export function findSafeNPCSpawnPosition(
  level: LevelData,
  playerPos: Vec3,
  playerForward: Vec3,
  preferredDistance = 1.65,
  inFront = true,
  openDoorIds: string[] = []
): Vec3 | null {
  const dirSign = inFront ? 1 : -1;
  const fLen = Math.hypot(playerForward[0], playerForward[2]) || 1;
  const fx = (playerForward[0] / fLen) * dirSign;
  const fz = (playerForward[2] / fLen) * dirSign;

  // Try straight ahead/behind first, then small angle offsets to dodge walls/pillars cleanly
  const angleOffsets = [0, 0.32, -0.32, 0.65, -0.65, 1.0, -1.0];
  const distSteps = [preferredDistance, Math.max(1.28, preferredDistance - 0.35), preferredDistance + 0.5];

  for (const dist of distSteps) {
    for (const ang of angleOffsets) {
      const cos = Math.cos(ang);
      const sin = Math.sin(ang);
      const dx = fx * cos - fz * sin;
      const dz = fx * sin + fz * cos;
      const cx = playerPos[0] + dx * dist;
      const cz = playerPos[2] + dz * dist;

      if (!isPointBlockedInLevel(level, cx, cz, 0.38, openDoorIds)) {
        return [cx, 0.0, cz];
      }
    }
  }
  return null;
}
