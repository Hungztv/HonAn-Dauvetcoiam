import { describe, it, expect } from 'vitest';
import { LEVELS } from '../data/levels';
import {
  applyMoralChoice,
  completeGameWithEnding,
  createInitialNarrativeState,
  startNewGamePlusRun,
} from '../data/narrativePack';
import {
  createNPCContext,
  stepNPCStateMachine,
  transitionNPCState,
} from '../horror/npc/NPCStateMachine';
import { NPC_DEFINITIONS, getLevelNPCBlueprints } from '../horror/npc/NPCRegistry';
import { npcPool } from '../horror/npc/NPCPooling';
import { findSafeNPCSpawnPosition, isPointBlockedInLevel } from '../horror/npc/NPCSpawnManager';
import { buildPhysicalJumpscareEvent } from '../horror/jumpscare/PhysicalJumpscareDirector';
import { LEVEL_JUMPSCARE_TRIGGERS } from '../horror/jumpscare/JumpscareTriggers';

describe('HỒN ÁN v4.5.2 — 3D NPC System, FSM & Physical Jumpscare Tests', () => {
  it('registers all 6 required Vietnamese horror NPCs with realistic heights & safe distances', () => {
    const types = Object.keys(NPC_DEFINITIONS);
    expect(types).toEqual([
      'dao_thi_may',
      'tran_thi_lien',
      'child_spirit',
      'wooden_statue',
      'faceless_passenger',
      'ferryman',
    ]);
    for (const def of Object.values(NPC_DEFINITIONS)) {
      expect(def.heightMeters).toBeGreaterThan(0.8);
      expect(def.defaultSafeDistance).toBeGreaterThanOrEqual(1.25);
      expect(def.supportedAnimations.length).toBeGreaterThanOrEqual(5);
    }
  });

  it('aborts active Jumpscaring immediately when Pause / Puzzle / Modal blocks gameplay', () => {
    let ctx = createNPCContext({
      id: 'test_lien',
      type: 'tran_thi_lien',
      homePosition: [0, 0, 0],
      initialState: 'Observing',
      isHostile: true,
    });
    ctx = transitionNPCState(ctx, 'Jumpscaring');
    expect(ctx.state).toBe('Jumpscaring');

    const blocked = stepNPCStateMachine(ctx, {
      delta: 0.016,
      playerPosition: [0, 1.65, 2],
      playerForward: [0, 0, -1],
      flashlightOn: true,
      horrorIntensity: 0.8,
      isGameplayBlocked: true,
      enableJumpscares: true,
    });
    expect(blocked.state).toBe('Retreating');
  });

  it('prevents infinite jumpscares via auto-exit timer and cooldown guard', () => {
    let ctx = createNPCContext({
      id: 'test_may',
      type: 'dao_thi_may',
      homePosition: [0, 0, 0],
      initialState: 'Observing',
      isHostile: true,
    });
    ctx = transitionNPCState(ctx, 'Jumpscaring');
    // Simulate 1.2s elapsed in 25 steps of 0.05s
    for (let i = 0; i < 25; i++) {
      ctx = stepNPCStateMachine(ctx, {
        delta: 0.05,
        playerPosition: [0, 1.65, 2],
        playerForward: [0, 0, -1],
        flashlightOn: true,
        horrorIntensity: 0.8,
        isGameplayBlocked: false,
        enableJumpscares: true,
      });
    }
    expect(ctx.state).toBe('Retreating');

    // Once on Cooldown, cannot re-enter Jumpscaring immediately
    ctx = transitionNPCState(ctx, 'Cooldown', 20);
    const blockedRetry = transitionNPCState(ctx, 'Jumpscaring');
    expect(blockedRetry.state).toBe('Cooldown');
  });

  it('culls distant NPCs to Dormant beyond maxActiveDistance', () => {
    const ctx = createNPCContext({
      id: 'test_far',
      type: 'wooden_statue',
      homePosition: [0, 0, 0],
      initialState: 'Observing',
      maxActiveDistance: 15,
    });
    const stepped = stepNPCStateMachine(ctx, {
      delta: 0.016,
      playerPosition: [0, 1.65, 25],
      playerForward: [0, 0, -1],
      flashlightOn: true,
      horrorIntensity: 0.5,
      isGameplayBlocked: false,
      enableJumpscares: true,
    });
    expect(stepped.state).toBe('Dormant');
    expect(stepped.visible).toBe(false);
  });

  it('never spawns 3D jumpscare NPCs inside walls or closed doors and plans valid 3D world positions', () => {
    const level1 = LEVELS[0];
    // North outer wall at Z=-7 must be detected as blocked
    expect(isPointBlockedInLevel(level1, 0, -7, 0.4, [])).toBe(true);
    // Closed sealed East Room door at [3.2, 0.5] must be blocked when closed, open when in openDoorIds
    expect(isPointBlockedInLevel(level1, 3.2, 0.5, 0.4, [])).toBe(true);
    expect(isPointBlockedInLevel(level1, 3.2, 0.5, 0.4, ['door_l1_sealed'])).toBe(false);

    // Safe physical jumpscare placement from Level 1 spawn
    const safePos = findSafeNPCSpawnPosition(level1, [0, 1.65, 2.9], [0, 0, -1], 1.7, true, []);
    expect(safePos).not.toBeNull();
    expect(isPointBlockedInLevel(level1, safePos![0], safePos![2], 0.35, [])).toBe(false);

    const ev = buildPhysicalJumpscareEvent({
      level: level1,
      npcType: 'tran_thi_lien',
      caption: 'Test 3D Scare',
      playerPos: [0, 1.65, 2.9],
      playerForward: [0, 0, -1],
      openDoorIds: [],
    });
    expect(ev).not.toBeNull();
    expect(ev!.lookAtTarget[1]).toBeGreaterThan(1.4);
  });

  it('changes NPC spawns and hostility accurately for Moral Choices (release/keep) and NG+', () => {
    const base = createInitialNarrativeState();
    // Normal run Level 1 does NOT have NG+ Ferryman
    expect(getLevelNPCBlueprints(1, base).some((b) => b.id === 'npc_l1_ngp_ferryman')).toBe(false);

    // NG+ run Level 1 DOES spawn early Ferryman
    const completed = completeGameWithEnding(base).nextState;
    const ng = startNewGamePlusRun(completed);
    expect(getLevelNPCBlueprints(1, ng).some((b) => b.id === 'npc_l1_ngp_ferryman')).toBe(true);

    // Choosing 'release' makes May non-hostile and disables Level 2 hostile trigger volumes
    const released = applyMoralChoice(base, 'fate_dao_thi_may', 'release').nextState;
    const l2May = getLevelNPCBlueprints(2, released).find((b) => b.type === 'dao_thi_may');
    expect(l2May?.isHostile).toBe(false);
    const l2Trig = LEVEL_JUMPSCARE_TRIGGERS.find((t) => t.key === 'l2_inner_scare')!;
    expect(l2Trig.test([0, 1.65, -7.5], released)).toBe(false);

    // Choosing 'keep' adds hostile May ambush blueprints in Level 4 and Level 5
    const kept = applyMoralChoice(base, 'fate_dao_thi_may', 'keep').nextState;
    expect(getLevelNPCBlueprints(4, kept).some((b) => b.id === 'npc_l4_may_ambush')).toBe(true);
    expect(getLevelNPCBlueprints(5, kept).some((b) => b.id === 'npc_l5_may_ambush')).toBe(true);
  });

  it('pools and cleanly releases NPCs across level transitions', () => {
    const base = createInitialNarrativeState();
    const l4 = getLevelNPCBlueprints(4, base);
    npcPool.acquireForLevel(4, l4);
    expect(npcPool.size()).toBe(4); // 4 independent wooden statues

    const l5 = getLevelNPCBlueprints(5, base);
    npcPool.acquireForLevel(5, l5);
    expect(npcPool.size()).toBe(5); // 4 faceless passengers + 1 ferryman (old L4 statues purged!)

    npcPool.releaseAll();
    expect(npcPool.size()).toBe(0);
  });
});
