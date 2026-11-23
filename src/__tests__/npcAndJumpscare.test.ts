import { describe, it, expect } from 'vitest';
import * as THREE from 'three';
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
import {
  evaluateNPCPerception,
  hasUnobstructedLineOfSight,
} from '../horror/npc/NPCPerception';
import {
  computeSafeStepToward,
  pickUnseenStalkingWaypoint,
} from '../horror/npc/NPCNavigation';
import {
  REQUIRED_HUMANOID_BONES,
  validateNPCModel,
} from '../horror/npc/NPCModelValidator';
import { resolveClipFromState } from '../horror/npc/NPCAnimationController';
import {
  buildPhysicalJumpscareEvent,
  getJumpscarePhase,
} from '../horror/jumpscare/PhysicalJumpscareDirector';
import { LEVEL_JUMPSCARE_TRIGGERS } from '../horror/jumpscare/JumpscareTriggers';

describe('HỒN ÁN v5.0 — 3D NPC System, Perception, Navigation, Animation & Physical Jumpscare Tests', () => {
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

  it('evaluates 3D NPC Perception (LOS wall/door occlusion, FOV, flashlight beam, player noise)', () => {
    const level1 = LEVELS[0];
    // Player inside main hall [0, 1.65, 0.5] looking +X toward sealed East Room [5.2, 0, 0.5]
    // Closed door at x=3.2 blocks LOS!
    expect(hasUnobstructedLineOfSight(level1, [0, 1.65, 0.5], [5.2, 0, 0.5], [])).toBe(false);
    // Opening the sealed door restores LOS!
    expect(
      hasUnobstructedLineOfSight(level1, [0, 1.65, 0.5], [5.2, 0, 0.5], ['door_l1_sealed'])
    ).toBe(true);

    // Direct flashlight beam hits NPC in front with open LOS
    const lit = evaluateNPCPerception({
      level: level1,
      npcPos: [0, 0, -1.5],
      playerPos: [0, 1.65, 2.5],
      playerForward: [0, 0, -1],
      flashlightOn: true,
      isSprinting: true,
      isCrouching: false,
      openDoorIds: [],
    });
    expect(lit.inFOV).toBe(true);
    expect(lit.hasLineOfSight).toBe(true);
    expect(lit.isIlluminatedByFlashlight).toBe(true);
    expect(lit.playerNoiseLevel).toBe(1.0);

    // Flashlight off -> NOT illuminated
    const unlit = evaluateNPCPerception({
      level: level1,
      npcPos: [0, 0, -1.5],
      playerPos: [0, 1.65, 2.5],
      playerForward: [0, 0, -1],
      flashlightOn: false,
      isSprinting: false,
      isCrouching: true,
      openDoorIds: [],
    });
    expect(unlit.isIlluminatedByFlashlight).toBe(false);
    expect(unlit.playerNoiseLevel).toBeLessThan(0.25);
  });

  it('navigates safely around walls and picks unseen stalking cover waypoints', () => {
    const level2 = LEVELS[1];
    const cover = pickUnseenStalkingWaypoint({
      level: level2,
      currentPos: [-5.4, 0, 3.8],
      playerPos: [0, 1.65, 8],
      playerForward: [0, 0, -1],
      openDoorIds: [],
    });
    expect(cover).not.toBeNull();

    const step = computeSafeStepToward({
      level: level2,
      currentPos: [-5.4, 0, 3.8],
      targetPos: [-2.0, 0, 3.8],
      speed: 1.5,
      delta: 0.25,
      minStopDistance: 0.4,
      capsuleRadius: 0.4,
      openDoorIds: [],
    });
    expect(step.moved).toBe(true);
    expect(step.nextPos[0]).toBeGreaterThan(-5.4);
  });

  it('validates external Blender GLB SkinnedMesh bone rig & animation clips accurately', () => {
    // Build a minimal valid SkinnedMesh with all 15 required humanoid bones
    const root = new THREE.Group();
    const bones: THREE.Bone[] = REQUIRED_HUMANOID_BONES.map((name) => {
      const b = new THREE.Bone();
      b.name = name;
      return b;
    });
    for (let i = 1; i < bones.length; i++) {
      bones[0].add(bones[i]);
    }
    const geo = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const mat = new THREE.MeshStandardMaterial();
    const skinned = new THREE.SkinnedMesh(geo, mat);
    skinned.add(bones[0]);
    skinned.bind(new THREE.Skeleton(bones));
    root.add(skinned);

    const clip = new THREE.AnimationClip('Idle', 1, []);
    const valid = validateNPCModel(root, [clip]);
    expect(valid.isValidRig).toBe(true);
    expect(valid.hasSkinnedMesh).toBe(true);
    expect(valid.missingBones).toHaveLength(0);

    // Empty group fails validation with all 15 missing bones reported honestly
    const invalid = validateNPCModel(new THREE.Group(), []);
    expect(invalid.isValidRig).toBe(false);
    expect(invalid.missingBones.length).toBe(REQUIRED_HUMANOID_BONES.length);
  });

  it('resolves all 16 NPC animation clips and plans Physical Jumpscare Types A–H & phases', () => {
    expect(resolveClipFromState('Observing')).toBe('SlowHeadRaise');
    expect(resolveClipFromState('Retreating', { shieldFace: true })).toBe('ShieldFace');
    expect(resolveClipFromState('Approaching', { crawling: true })).toBe('Crawling');
    expect(resolveClipFromState('Idle', { rowing: true })).toBe('Rowing');
    expect(resolveClipFromState('Idle', { overrideClip: 'WaterRise' })).toBe('WaterRise');

    const level1 = LEVELS[0];
    // Crawling jumpscare lowers eye target near floor (~0.62m)
    const crawlEv = buildPhysicalJumpscareEvent({
      level: level1,
      npcType: 'tran_thi_lien',
      jumpscareType: 'D_SURFACE_REVEAL',
      caption: 'Crawl Test',
      playerPos: [0, 1.65, 2.5],
      playerForward: [0, 0, -1],
      openDoorIds: [],
      animationClip: 'Crawling',
      crawling: true,
      durationMs: 1000,
    });
    expect(crawlEv).not.toBeNull();
    expect(crawlEv!.jumpscareType).toBe('D_SURFACE_REVEAL');
    expect(crawlEv!.lookAtTarget[1]).toBeLessThan(0.8);

    // Multi-stage jumpscare phases progress cleanly from PREPARE -> LUNGE -> COOLDOWN
    expect(getJumpscarePhase(crawlEv!, crawlEv!.startedAt + 10)).toBe('PREPARE');
    expect(getJumpscarePhase(crawlEv!, crawlEv!.startedAt + 150)).toBe('SPAWN');
    expect(getJumpscarePhase(crawlEv!, crawlEv!.startedAt + 350)).toBe('HOLD');
    expect(getJumpscarePhase(crawlEv!, crawlEv!.startedAt + 600)).toBe('LUNGE');
    expect(getJumpscarePhase(crawlEv!, crawlEv!.startedAt + 900)).toBe('VANISH');
    expect(getJumpscarePhase(crawlEv!, crawlEv!.startedAt + 1100)).toBe('COOLDOWN');

    // Type A_BEHIND_PLAYER spawns behind player
    const behindEv = buildPhysicalJumpscareEvent({
      level: LEVELS[1],
      npcType: 'dao_thi_may',
      jumpscareType: 'A_BEHIND_PLAYER',
      caption: 'Behind Test',
      playerPos: [0, 1.65, 2.0],
      playerForward: [0, 0, -1],
      openDoorIds: [],
    });
    expect(behindEv).not.toBeNull();
    expect(behindEv!.worldPosition[2]).toBeGreaterThan(2.0);
  });
});
