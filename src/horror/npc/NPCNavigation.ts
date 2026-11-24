import { LevelData, Vec3 } from '../../types/game';
import { isPointBlockedInLevel } from './NPCSpawnManager';
import { distanceXZ } from './NPCStateMachine';
import { hasUnobstructedLineOfSight } from './NPCPerception';

/**
 * HỒN ÁN v6.0 – Large-Scale Waypoint Stalking & Wall-Avoiding Navigation (56x56m – 64x64m Maps)
 * Covers corridors, courtyards, side wings, and flanking cover across all 5 2000s levels.
 */

export const LEVEL_STALK_WAYPOINTS: Record<number, Vec3[]> = {
  1: [
    [-12.0, 0, 14.0], // Near bike shed
    [10.0, 0, 14.5], // East courtyard before substation
    [-14.5, 0, 1.5], // West Block A corridor
    [0.0, 0, -1.5], // Central stairwell corridor
    [15.0, 0, 1.5], // East Block A corridor
    [-10.5, 0, -11.5], // Inside Room 402
    [0.0, 0, -13.0], // North pass-through hall
    [5.5, 0, -23.0], // North laundry yard
    [15.0, 0, -12.0], // Inside Room 404
  ],
  2: [
    [-9.5, 0, 20.0], // South-West yard flank
    [9.5, 0, 20.0], // South-East yard flank
    [-8.5, 0, 8.5], // Before Classroom 12A
    [8.5, 0, 8.5], // Before Dormitory B12
    [-17.5, 0, 0.0], // Inside Classroom 12A
    [17.5, 0, 0.0], // Inside Dormitory B12
    [-6.0, 0, -1.5], // Central walkway north
    [6.0, 0, -1.5], // Central walkway east
    [0.0, 0, -7.5], // Radio building lobby
    [0.0, 0, -19.5], // Inside Radio Studio
  ],
  3: [
    [-8.5, 0, 14.0],
    [8.5, 0, 14.0],
    [-8.5, 0, -6.5],
    [8.5, 0, -6.5],
    [-17.0, 0, 0.0],
    [17.0, 0, 0.0],
  ],
  4: [
    [-10.0, 0, 16.0],
    [10.0, 0, 16.0],
    [-13.5, 0, 2.0],
    [13.5, 0, 2.0],
    [-13.5, 0, -9.5],
    [13.5, 0, -9.5],
    [0.0, 0, -2.0],
    [22.0, 0, -2.0],
  ],
  5: [
    [-10.0, 0, 20.0],
    [10.0, 0, 20.0],
    [-14.0, 0, 13.0],
    [14.0, 0, 13.0],
    [0.0, 0, 3.5],
    [0.0, 0, -6.0],
    [0.0, 0, -16.0],
  ],
};

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
    if (dPlayer < 3.4 || dPlayer > 36.0 || dSelf < 2.0) continue;
    if (isPointBlockedInLevel(level, wp[0], wp[2], 0.4, openDoorIds)) continue;

    const dx = (wp[0] - playerPos[0]) / dPlayer;
    const dz = (wp[2] - playerPos[2]) / dPlayer;
    const dot = dx * fx + dz * fz;
    const isOutOfView = dot < 0.38;
    const isOccluded = !hasUnobstructedLineOfSight(level, playerPos, wp, openDoorIds);

    if (isOutOfView || isOccluded) {
      candidates.push(wp);
    }
  }

  if (candidates.length === 0) return null;
  return candidates[Math.floor(Math.random() * candidates.length)];
}
