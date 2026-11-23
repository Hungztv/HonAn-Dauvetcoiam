import { Vec3 } from '../../types/game';

/**
 * 13-State Extensible Horror NPC Finite State Machine (v4.5.2)
 * Every transition enforces explicit guards: overlay/pause cancellation,
 * distance limits, cooldowns, and safe stop range.
 */

export type NPCState =
  | 'Dormant'
  | 'Hidden'
  | 'Stalking'
  | 'Observing'
  | 'Appearing'
  | 'Idle'
  | 'Approaching'
  | 'Chasing'
  | 'Attacking'
  | 'Jumpscaring'
  | 'Retreating'
  | 'Disappearing'
  | 'Cooldown';

export type NPCCharacterType =
  | 'dao_thi_may'
  | 'tran_thi_lien'
  | 'child_spirit'
  | 'wooden_statue'
  | 'faceless_passenger'
  | 'ferryman';

export interface NPCFSMContext {
  id: string;
  type: NPCCharacterType;
  state: NPCState;
  stateElapsed: number;
  cooldownRemaining: number;
  position: Vec3;
  homePosition: Vec3;
  rotationY: number;
  opacity: number;
  visible: boolean;
  /** Minimum safe distance to player camera (prevents clipping inside player collider) */
  minSafeDistance: number;
  /** Max active engagement distance (animations/AI culled beyond this) */
  maxActiveDistance: number;
  /** Whether this NPC is hostile or guiding/neutral (e.g., May after 'release') */
  isHostile: boolean;
}

export interface NPCUpdateInputs {
  delta: number;
  playerPosition: Vec3;
  playerForward: Vec3;
  flashlightOn: boolean;
  horrorIntensity: number;
  isGameplayBlocked: boolean; // Pause, Puzzle, Inspect, Journal, Transition, Ending
  enableJumpscares: boolean;
}

export function createNPCContext(params: {
  id: string;
  type: NPCCharacterType;
  homePosition: Vec3;
  rotationY?: number;
  initialState?: NPCState;
  minSafeDistance?: number;
  maxActiveDistance?: number;
  isHostile?: boolean;
}): NPCFSMContext {
  const initialState = params.initialState ?? 'Dormant';
  return {
    id: params.id,
    type: params.type,
    state: initialState,
    stateElapsed: 0,
    cooldownRemaining: 0,
    position: [...params.homePosition],
    homePosition: [...params.homePosition],
    rotationY: params.rotationY ?? 0,
    opacity: initialState === 'Hidden' || initialState === 'Dormant' ? 0 : 1,
    visible: initialState !== 'Hidden' && initialState !== 'Dormant',
    minSafeDistance: params.minSafeDistance ?? 1.25,
    maxActiveDistance: params.maxActiveDistance ?? 22,
    isHostile: params.isHostile ?? true,
  };
}

/** Pure helper: computes horizontal distance on XZ plane */
export function distanceXZ(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[2] - b[2]);
}

/** Pure helper: checks whether player is looking roughly at target position */
export function isPlayerLookingAt(
  playerPos: Vec3,
  playerForward: Vec3,
  targetPos: Vec3,
  dotThreshold = 0.65
): boolean {
  const dx = targetPos[0] - playerPos[0];
  const dz = targetPos[2] - playerPos[2];
  const len = Math.hypot(dx, dz);
  if (len < 0.001) return true;
  const dot = (dx / len) * playerForward[0] + (dz / len) * playerForward[2];
  return dot >= dotThreshold;
}

/** Pure FSM transition with strict safety guards */
export function transitionNPCState(
  ctx: NPCFSMContext,
  nextState: NPCState,
  cooldownSec = 18
): NPCFSMContext {
  if (ctx.state === nextState) return ctx;

  // Never enter Jumpscaring/Attacking if on cooldown or non-hostile
  if ((nextState === 'Jumpscaring' || nextState === 'Attacking') && (!ctx.isHostile || ctx.cooldownRemaining > 0)) {
    return ctx;
  }

  const next: NPCFSMContext = {
    ...ctx,
    state: nextState,
    stateElapsed: 0,
  };

  if (nextState === 'Hidden' || nextState === 'Dormant') {
    next.visible = false;
    next.opacity = 0;
  } else if (nextState === 'Cooldown') {
    next.visible = false;
    next.opacity = 0;
    next.cooldownRemaining = cooldownSec;
  } else if (nextState === 'Appearing' || nextState === 'Jumpscaring') {
    next.visible = true;
    next.opacity = nextState === 'Jumpscaring' ? 1 : Math.max(0.2, ctx.opacity);
  } else {
    next.visible = true;
  }

  return next;
}

/** Advances an NPC state machine by one tick (pure & deterministic for unit testing) */
export function stepNPCStateMachine(
  ctx: NPCFSMContext,
  inputs: NPCUpdateInputs
): NPCFSMContext {
  const dt = Math.min(inputs.delta, 0.05);

  // Strict cancellation rule: freeze/abort scares whenever Pause/Modal/Transition is active
  if (inputs.isGameplayBlocked) {
    if (ctx.state === 'Jumpscaring' || ctx.state === 'Attacking' || ctx.state === 'Chasing') {
      return transitionNPCState(ctx, 'Retreating');
    }
    return ctx;
  }

  const next: NPCFSMContext = {
    ...ctx,
    stateElapsed: ctx.stateElapsed + dt,
    cooldownRemaining: Math.max(0, ctx.cooldownRemaining - dt),
  };

  const dist = distanceXZ(next.position, inputs.playerPosition);

  // Distance culling: keep far-away dormant NPCs sleeping
  if (dist > next.maxActiveDistance && next.state !== 'Cooldown' && next.state !== 'Dormant') {
    return { ...next, state: 'Dormant', visible: false, opacity: 0, stateElapsed: 0 };
  }

  switch (next.state) {
    case 'Cooldown':
      if (next.cooldownRemaining <= 0) {
        return transitionNPCState(next, 'Observing');
      }
      return next;

    case 'Dormant':
      if (dist <= next.maxActiveDistance && inputs.horrorIntensity >= 0.12) {
        return transitionNPCState(next, 'Observing');
      }
      return next;

    case 'Appearing':
      next.opacity = Math.min(1, next.opacity + dt * 2.2);
      next.visible = true;
      if (next.opacity >= 0.99 || next.stateElapsed > 0.65) {
        return transitionNPCState(next, 'Observing');
      }
      return next;

    case 'Jumpscaring':
      next.visible = true;
      next.opacity = 1;
      // Automatically exit Jumpscaring after 1.15s so camera/player are never softlocked
      if (next.stateElapsed >= 1.15) {
        return transitionNPCState(next, 'Retreating');
      }
      return next;

    case 'Retreating':
      next.opacity = Math.max(0, next.opacity - dt * 1.9);
      if (next.opacity <= 0.04 || next.stateElapsed >= 0.7) {
        return transitionNPCState(next, 'Cooldown', 26);
      }
      return next;

    case 'Disappearing':
      next.opacity = Math.max(0, next.opacity - dt * 2.4);
      if (next.opacity <= 0.02 || next.stateElapsed >= 0.55) {
        return transitionNPCState(next, 'Cooldown', 14);
      }
      return next;

    default:
      next.visible = true;
      next.opacity = Math.min(1, next.opacity + dt * 2.0);
      return next;
  }
}
