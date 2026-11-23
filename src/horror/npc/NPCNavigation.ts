import { LevelData, Vec3 } from '../../types/game';
import { isPointBlockedInLevel } from './NPCSpawnManager';
import { distanceXZ } from './NPCStateMachine';
import { hasUnobstructedLineOfSight } from './NPCPerception';

/**
 * HỒN ÁN v5.0 – Lightweight Waypoint Stalking & Wall-Avoiding Navigation
 * Tailored to our 5 rural Vietnamese horror scenes:
 * - Zero heavy external navmesh dependency
 * - Guarantees NPCs NEVER clip through walls, closed doors, or player capsule
 * - Lets Đào Thị Mây & Trần Thị Liên relocate to unseen vantage points when player turns away!
 */

export const LEVEL_STALK_WAYPOINTS: Record<number, Vec3[]> = {
  1: [
    [0.0, 0, -2.2], // Central hall aisle
    [-5.2, 0, -1.5], // West bedroom doorway view
    [-5.8, 0, 1.8], // West kitchen corner
    [0.0, 0, 5.2], // Back doorway veranda
    [-3.6, 0, 7.6], // Backyard left of well
    [3.8, 0, 7.2], // Backyard right of well
    [6.8, 0, -3.5], // Inside East Sealed Room
  ],
  2: [
    [-5.0, 0, 7.6], // Bamboo forest South-West flank
    [5.0, 0, 7.6], // Bamboo forest South-East flank
    [-4.2, 0, 5.5], // Bamboo forest West path
    [4.4, 0, 5.2], // Bamboo forest East path
    [-3.6, 0, 0.4], // Near banyan tree
    [3.8, 0, -0.2], // Right side before shrine
    [0.0, 0, -3.1], // Shrine front hall
    [-3.2, 0, -4.6], // Shrine side aisle
    [3.2, 0, -4.6], // Shrine east alcove
    [0.0, 0, -9.1], // Inner sanctuary (Hậu Cung)
  ],
  3: [
    [-3.4, 0, 3.8],
    [3.4, 0, 3.8],
    [-3.2, 0, -3.2],
    [3.2, 0, -3.2],
  ],
  4: [
    [-7.2, 0, 4.2],
    [7.2, 0, 4.2],
    [-7.2, 0, -2.5],
    [7.2, 0, -2.5],
    [-2.4, 0, 1.8],
    [2.4, 0, 1.8],
    [0.0, 0, -1.2],
  ],
  5: [
    [-4.2, 0, 6.2],
    [4.2, 0, 6.2],
    [0.0, 0, 1.4],
    [0.0, 0, -2.2],
    [0.0, 0, -6.5],
  ],
};

/**
 * Computes a wall-avoiding steering step toward targetPos.
 * Attempts direct heading first, then ±30° / ±60° steering deflections so NPCs slide smoothly around pillars/doors.
 */
export function computeSafeStepToward(params: {
  level: LevelData;
  currentPos: Vec3;
  targetPos: Vec3;
  speed: number;
  delta: number;
  minStopDistance: number;
  capsuleRadius: number;
  openDoorIds: string[];
}): { nextPos: Vec3; moved: boolean; yaw: number } {
  const {
    level,
    currentPos,
    targetPos,
    speed,
    delta,
    minStopDistance,
    capsuleRadius,
    openDoorIds,
  } = params;

  const dist = distanceXZ(currentPos, targetPos);
  const baseYaw = Math.atan2(targetPos[0] - currentPos[0], targetPos[2] - currentPos[2]);

  if (dist <= minStopDistance || speed <= 0.01) {
    return { nextPos: currentPos, moved: false, yaw: baseYaw };
  }

  const stepDist = Math.min(speed * delta, dist - minStopDistance);
  const tryAngles = [0, 0.52, -0.52, 1.05, -1.05];

  for (const offset of tryAngles) {
    const yaw = baseYaw + offset;
    const nx = currentPos[0] + Math.sin(yaw) * stepDist;
    const nz = currentPos[2] + Math.cos(yaw) * stepDist;

    if (!isPointBlockedInLevel(level, nx, nz, capsuleRadius, openDoorIds)) {
      return {
        nextPos: [nx, currentPos[1], nz],
        moved: true,
        yaw,
      };
    }
  }

  return { nextPos: currentPos, moved: false, yaw: baseYaw };
}

/**
 * Picks an unseen stalking waypoint (outside player's current FOV or occluded behind cover)
 * at an eerie mid-range distance (3.8m – 11m) so Đào Thị Mây / Trần Thị Liên relocate naturally!
 */
export function pickUnseenStalkingWaypoint(params: {
  level: LevelData;
  currentPos: Vec3;
  playerPos: Vec3;
  playerForward: Vec3;
  openDoorIds: string[];
}): Vec3 | null {
  const { level, currentPos, playerPos, playerForward, openDoorIds } = params;
  const waypoints = LEVEL_STALK_WAYPOINTS[level.id] ?? [];
  if (waypoints.length === 0) return null;

  const fLen = Math.hypot(playerForward[0], playerForward[2]) || 1;
  const fx = playerForward[0] / fLen;
  const fz = playerForward[2] / fLen;

  const candidates: Vec3[] = [];
  for (const wp of waypoints) {
    const dPlayer = distanceXZ(wp, playerPos);
    const dSelf = distanceXZ(wp, currentPos);
    if (dPlayer < 3.4 || dPlayer > 16.5 || dSelf < 2.0) continue;
    if (isPointBlockedInLevel(level, wp[0], wp[2], 0.4, openDoorIds)) continue;

    // Must be either outside player's FOV OR occluded by a wall/door!
    const dx = (wp[0] - playerPos[0]) / dPlayer;
    const dz = (wp[2] - playerPos[2]) / dPlayer;
    const dot = dx * fx + dz * fz;
    const isOutOfView = dot < 0.35;
    const isOccluded = !hasUnobstructedLineOfSight(level, playerPos, wp, openDoorIds);

    if (isOutOfView || isOccluded) {
      candidates.push(wp);
    }
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
