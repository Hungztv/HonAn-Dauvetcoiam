import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LevelData, Vec3 } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { getLevelNPCBlueprints, NPC_DEFINITIONS, NPCSpawnBlueprint } from './NPCRegistry';
import { NPCState, distanceXZ } from './NPCStateMachine';
import { evaluateNPCPerception } from './NPCPerception';
import {
  computeSafeStepToward,
  pickUnseenStalkingWaypoint,
} from './NPCNavigation';
import {
  NPCAnimationClipName,
  resolveClipFromState,
} from './NPCAnimationController';
import { findSafeNPCSpawnPosition, isPointBlockedInLevel } from './NPCSpawnManager';
import { npcPool } from './NPCPooling';
import { NPCController } from './NPCController';
import { LEVEL_JUMPSCARE_TRIGGERS } from '../jumpscare/JumpscareTriggers';
import {
  PhysicalJumpscareEvent,
  buildPhysicalJumpscareEvent,
  dispatchPhysicalJumpscareAudio,
  getJumpscarePhase,
} from '../jumpscare/PhysicalJumpscareDirector';
import {
  playNPCAmbientSignatureAudio,
  playNPCDisappearAudio,
  playNPCFootstepAudio,
} from '../jumpscare/JumpscareAudio';
import { npcDebugBus } from '../debug/npcDebugBus';

/** Single Ambient / Interactive 3D NPC instance inside the level world (v5.0 Level 3 AI) */
const WorldNPCActor: React.FC<{
  blueprint: NPCSpawnBlueprint;
  level: LevelData;
  currentTier: 1 | 2 | 3;
  cluesFound: number;
  horrorIntensity: number;
  flashlightOn: boolean;
  isSprinting: boolean;
  isCrouching: boolean;
  isPlayerHidden: boolean;
  lastIncenseWardAt: number;
  isGameplayBlocked: boolean;
  openDoorIds: string[];
}> = ({
  blueprint,
  level,
  currentTier,
  cluesFound,
  horrorIntensity,
  flashlightOn,
  isSprinting,
  isCrouching,
  isPlayerHidden,
  lastIncenseWardAt,
  isGameplayBlocked,
  openDoorIds,
}) => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group | null>(null);
  const posRef = useRef<Vec3>([...blueprint.position]);
  const rotYRef = useRef(blueprint.rotationY);
  const opacityRef = useRef(blueprint.initialState === 'Hidden' ? 0 : 1);
  const vanishedCooldownRef = useRef(0);
  const statueStepCooldownRef = useRef(2.5);
  const ambientAudioCooldownRef = useRef(4.5 + Math.random() * 4);
  const stalkWaypointRef = useRef<Vec3 | null>(null);
  const lastDebugCmdSeqRef = useRef(0);
  const aiTickAccumRef = useRef(0);

  const [npcState, setNpcState] = useState<NPCState>(blueprint.initialState);
  const [overrideClip, setOverrideClip] = useState<NPCAnimationClipName | null>(null);
  const [isCrawling, setIsCrawling] = useState(false);
  const [isShieldingFace, setIsShieldingFace] = useState(false);
  const [frozenByGaze, setFrozenByGaze] = useState(false);
  const [renderOpacity, setRenderOpacity] = useState(blueprint.initialState === 'Hidden' ? 0 : 1);
  const [isCulled, setIsCulled] = useState(false);
  const [headYaw, setHeadYaw] = useState(0);
  const [preferredModelMode, setPreferredModelMode] = useState<'AUTO' | 'PROCEDURAL' | 'GLB'>('AUTO');
  const [reloadToken, setReloadToken] = useState(0);
  const [animationPaused, setAnimationPaused] = useState(false);
  const [animationResetToken, setAnimationResetToken] = useState(0);

  const camDir = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => {
    return () => {
      npcDebugBus.removeSnapshot(blueprint.id);
    };
  }, [blueprint.id]);

  useFrame((_, rawDelta) => {
    if (!groupRef.current) return;
    const delta = Math.min(rawDelta, 0.05);

    const playerPos: Vec3 = [camera.position.x, camera.position.y, camera.position.z];
    camera.getWorldDirection(camDir);
    const playerFwd: Vec3 = [camDir.x, camDir.y, camDir.z];

    // Check Dev Debug Panel override commands (zero-cost integer compare)
    const debugCmd = npcDebugBus.getLatestCommand();
    if (debugCmd && debugCmd.issuedAt !== lastDebugCmdSeqRef.current) {
      if (!debugCmd.targetId || debugCmd.targetId === blueprint.id || debugCmd.resetAll) {
        lastDebugCmdSeqRef.current = debugCmd.issuedAt;
        if (debugCmd.resetAll) {
          posRef.current = [...blueprint.position];
          rotYRef.current = blueprint.rotationY;
          vanishedCooldownRef.current = 0;
          opacityRef.current = 1;
          setRenderOpacity(1);
          setNpcState(blueprint.initialState);
          setOverrideClip(null);
          setIsCrawling(false);
          setIsShieldingFace(false);
          setPreferredModelMode('AUTO');
          setAnimationPaused(false);
        } else {
          if (debugCmd.forceState) {
            vanishedCooldownRef.current = 0;
            opacityRef.current = 1;
            setRenderOpacity(1);
            setNpcState(debugCmd.forceState);
          }
          if (debugCmd.forceClip !== undefined) {
            vanishedCooldownRef.current = 0;
            opacityRef.current = 1;
            setRenderOpacity(1);
            setAnimationPaused(false);
            setOverrideClip(debugCmd.forceClip);
          }
          if (debugCmd.forceCrawling !== undefined) {
            setIsCrawling(debugCmd.forceCrawling);
          }
          if (debugCmd.forceShieldFace !== undefined) {
            setIsShieldingFace(debugCmd.forceShieldFace);
          }
          if (debugCmd.preferredModelMode) {
            setPreferredModelMode(debugCmd.preferredModelMode);
          }
          if (debugCmd.reloadGlb || debugCmd.validateNow) {
            setReloadToken((n) => n + 1);
          }
          if (debugCmd.stopAnimation !== undefined) {
            setAnimationPaused(debugCmd.stopAnimation);
          }
          if (debugCmd.resetAnimation) {
            setAnimationPaused(false);
            setOverrideClip(null);
            setAnimationResetToken((n) => n + 1);
          }
          if (debugCmd.relocateToPlayerFront) {
            const frontPos = findSafeNPCSpawnPosition(level, playerPos, playerFwd, 2.35, true, openDoorIds);
            if (frontPos) {
              posRef.current = frontPos;
              rotYRef.current = Math.atan2(playerPos[0] - frontPos[0], playerPos[2] - frontPos[2]);
              vanishedCooldownRef.current = 0;
              opacityRef.current = 1;
              setRenderOpacity(1);
              groupRef.current.visible = true;
            }
          }
        }
      }
    }

    const dist = distanceXZ(posRef.current, playerPos);
    const far = dist > 48;
    if (far !== isCulled) setIsCulled(far);

    // Distance-tiered AI perception tick throttling for high FPS stability across 64x64m maps
    const tickInterval = dist < 14 ? 0.0 : dist < 28 ? 0.08 : 0.25;
    aiTickAccumRef.current += delta;
    const runPerceptionTick = aiTickAccumRef.current >= tickInterval;
    if (runPerceptionTick) aiTickAccumRef.current = 0;

    const perception = evaluateNPCPerception({
      level,
      npcPos: posRef.current,
      playerPos,
      playerForward: playerFwd,
      flashlightOn,
      isSprinting,
      isCrouching,
      openDoorIds,
    });

    const activeClip = resolveClipFromState(npcState, {
      crawling: isCrawling,
      shieldFace: isShieldingFace,
      sitting: blueprint.type === 'faceless_passenger' && currentTier < 3,
      rowing: blueprint.type === 'ferryman' && level.id === 5,
      overrideClip,
    });

    if (npcDebugBus.enabled) {
      const def = NPC_DEFINITIONS[blueprint.type];
      const runtime = npcDebugBus.getModelRuntime(blueprint.id);
      npcDebugBus.reportSnapshot({
        id: blueprint.id,
        type: blueprint.type,
        state: npcState,
        clip: activeClip,
        position: [posRef.current[0], posRef.current[1], posRef.current[2]],
        distanceToPlayer: perception.distance,
        inPlayerFOV: perception.inFOV,
        hasLineOfSight: perception.hasLineOfSight,
        illuminatedByFlashlight: perception.isIlluminatedByFlashlight,
        opacity: opacityRef.current,
        visible: groupRef.current.visible,
        cooldownSec: Math.max(0, vanishedCooldownRef.current),
        modelSource: runtime?.modelSource ?? 'PROCEDURAL',
        glbLoaded: runtime?.glbLoaded ?? false,
        validationStatus: runtime?.validationStatus ?? 'NONE',
        skeletonSummary: runtime?.skeletonSummary ?? '15/15 Procedural Rig',
        mixerTime: runtime?.mixerTime ?? 0,
        lodLevel: runtime?.lodLevel ?? 'HIGH',
        boundingHeight: runtime?.boundingHeight ?? def.heightMeters,
        textureState: runtime?.textureState ?? 'PROCEDURAL_PBR',
        fallbackReason:
          runtime?.fallbackReason ??
          `Chưa có file GLB tại ${def.assetContract.expectedGlbPath} (dùng Procedural 15 khớp)`,
      });
    }

    if (far && !overrideClip) return;

    const unlockedByHorror = horrorIntensity >= blueprint.minHorror || Boolean(overrideClip);
    if (!unlockedByHorror) {
      groupRef.current.visible = false;
      return;
    }

    if (isGameplayBlocked) return;

    if (vanishedCooldownRef.current > 0) {
      vanishedCooldownRef.current -= delta;
      groupRef.current.visible = false;
      return;
    }

    const directlyWatched = !isPlayerHidden && perception.inFOV && perception.hasLineOfSight;
    const angleToPlayer = perception.angleToPlayer;
    const repelledByIncense =
      blueprint.isHostile !== false &&
      Date.now() - lastIncenseWardAt < 6000 &&
      dist < 15.5;

    if (repelledByIncense && !overrideClip) {
      if (npcState !== 'Retreating') setNpcState('Retreating');
      const backX = posRef.current[0] - Math.sin(angleToPlayer) * 2.2 * delta;
      const backZ = posRef.current[2] - Math.cos(angleToPlayer) * 2.2 * delta;
      if (!isPointBlockedInLevel(level, backX, backZ, 0.45, openDoorIds)) {
        posRef.current = [backX, posRef.current[1], backZ];
      }
      opacityRef.current = Math.max(0, opacityRef.current - delta * 2.4);
      setRenderOpacity(opacityRef.current);
      if (opacityRef.current <= 0.06) {
        playNPCDisappearAudio(posRef.current, blueprint.type);
        vanishedCooldownRef.current = 14;
        opacityRef.current = 1;
        setRenderOpacity(1);
        const nextCover = pickUnseenStalkingWaypoint({
          level,
          currentPos: posRef.current,
          playerPos,
          playerForward: playerFwd,
          openDoorIds,
        });
        if (nextCover) posRef.current = nextCover;
        setNpcState('Stalking');
      }
      groupRef.current.position.set(posRef.current[0], posRef.current[1], posRef.current[2]);
      groupRef.current.rotation.y = rotYRef.current;
      return;
    }

    // Periodic subtle spatialized signature sound when nearby
    ambientAudioCooldownRef.current -= delta;
    if (ambientAudioCooldownRef.current <= 0 && dist < 12) {
      ambientAudioCooldownRef.current = 7.5 + Math.random() * 5.5;
      playNPCAmbientSignatureAudio(blueprint.type, posRef.current);
    }

    // ------------------------------------------------------------------
    // NPC 04 — BỐN TƯỢNG QUAN GỖ (Weeping-Angel LOS Statue AI)
    // ------------------------------------------------------------------
    if (blueprint.type === 'wooden_statue') {
      if (directlyWatched !== frozenByGaze) setFrozenByGaze(directlyWatched);
      groupRef.current.visible = true;

      if (!directlyWatched && dist > 2.3 && dist < 17 && !overrideClip) {
        rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, angleToPlayer, Math.min(1, delta * 2.4));
        statueStepCooldownRef.current -= delta;
        if (statueStepCooldownRef.current <= 0) {
          statueStepCooldownRef.current = 3.0 + Math.random() * 2.2;
          const stepDist = 0.72;
          const nx = posRef.current[0] + Math.sin(angleToPlayer) * stepDist;
          const nz = posRef.current[2] + Math.cos(angleToPlayer) * stepDist;
          if (
            distanceXZ([nx, 0, nz], playerPos) > 2.0 &&
            !isPointBlockedInLevel(level, nx, nz, 0.45, openDoorIds)
          ) {
            posRef.current = [nx, posRef.current[1], nz];
            playNPCFootstepAudio('wooden_statue', posRef.current);
          }
        }
      }
      groupRef.current.position.set(posRef.current[0], posRef.current[1], posRef.current[2]);
      groupRef.current.rotation.y = rotYRef.current;
      return;
    }

    // ------------------------------------------------------------------
    // NPC 05 — BỐN HÀNH KHÁCH KHÔNG KHUÔN MẶT (Seated -> Collective Stand)
    // ------------------------------------------------------------------
    if (blueprint.type === 'faceless_passenger') {
      groupRef.current.visible = true;
      const shouldTurnHead = cluesFound > (blueprint.variantIndex ?? 0) || currentTier >= 3;
      if (shouldTurnHead) {
        const relYaw = THREE.MathUtils.clamp(angleToPlayer - rotYRef.current, -0.9, 0.9);
        setHeadYaw(relYaw);
      }
      if (currentTier >= 3) {
        rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, angleToPlayer, Math.min(1, delta * 1.8));
      }
      groupRef.current.position.set(posRef.current[0], posRef.current[1], posRef.current[2]);
      groupRef.current.rotation.y = rotYRef.current;
      return;
    }

    // ------------------------------------------------------------------
    // NPC 06 — NGƯỜI LÁI ĐÒ (Respectful Rowing / NG+ Silhouette)
    // ------------------------------------------------------------------
    if (blueprint.type === 'ferryman') {
      groupRef.current.visible = true;
      if (level.id === 1 && perception.isIlluminatedByFlashlight && dist < 4.5 && !overrideClip) {
        vanishedCooldownRef.current = 18;
        playNPCDisappearAudio(posRef.current);
        groupRef.current.visible = false;
        return;
      }
      groupRef.current.position.set(posRef.current[0], posRef.current[1], posRef.current[2]);
      groupRef.current.rotation.y = rotYRef.current;
      return;
    }

    // ------------------------------------------------------------------
    // NPC 03 — HỒN ĐỨA TRẺ DƯỚI GIẾNG (Water Emergence)
    // ------------------------------------------------------------------
    if (blueprint.type === 'child_spirit') {
      groupRef.current.visible = true;
      const desiredState: NPCState = dist < 5.5 ? 'Observing' : 'Hidden';
      if (desiredState !== npcState) setNpcState(desiredState);
      rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, angleToPlayer, Math.min(1, delta * 2.5));
      groupRef.current.position.set(posRef.current[0], posRef.current[1], posRef.current[2]);
      groupRef.current.rotation.y = rotYRef.current;
      return;
    }

    // ------------------------------------------------------------------
    // NPC 01 (ĐÀO THỊ MÂY) & NPC 02 (TRẦN THỊ LIÊN) — Level 3 Stalker + Flashlight AI
    // ------------------------------------------------------------------
    groupRef.current.visible = true;
    rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, angleToPlayer, Math.min(1, delta * 3.2));

    if (!overrideClip) {
      // A. Illuminated by Flashlight at close/medium range
      if (perception.isIlluminatedByFlashlight && dist < 6.2 && blueprint.isHostile) {
        if (blueprint.type === 'tran_thi_lien') {
          // Trần Thị Liên shields face from flashlight, drops into crawl, retreats into darkness!
          if (!isShieldingFace) setIsShieldingFace(true);
          if (dist < 4.2 && !isCrawling) setIsCrawling(true);
          if (npcState !== 'Retreating') setNpcState('Retreating');
        } else {
          // Đào Thị Mây halts, steps backward, then vanishes and relocates behind cover!
          if (npcState !== 'Retreating') setNpcState('Retreating');
        }

        // Step backward slightly while fading into mist
        const backX = posRef.current[0] - Math.sin(angleToPlayer) * 1.1 * delta;
        const backZ = posRef.current[2] - Math.cos(angleToPlayer) * 1.1 * delta;
        if (!isPointBlockedInLevel(level, backX, backZ, 0.42, openDoorIds)) {
          posRef.current = [backX, posRef.current[1], backZ];
        }

        opacityRef.current = Math.max(0, opacityRef.current - delta * 1.85);
        setRenderOpacity(opacityRef.current);

        if (opacityRef.current <= 0.05) {
          playNPCDisappearAudio(posRef.current);
          vanishedCooldownRef.current = 11;
          opacityRef.current = 1;
          setRenderOpacity(1);
          setIsShieldingFace(false);
          setIsCrawling(false);

          // Relocate to an unseen cover waypoint so she truly stalks the player!
          const nextCover = pickUnseenStalkingWaypoint({
            level,
            currentPos: posRef.current,
            playerPos,
            playerForward: playerFwd,
            openDoorIds,
          });
          if (nextCover) {
            posRef.current = nextCover;
            stalkWaypointRef.current = null;
          }
          setNpcState('Stalking');
        }
      } else {
        // Not directly hit by flashlight beam
        if (isShieldingFace) setIsShieldingFace(false);
        if (opacityRef.current < 1) {
          opacityRef.current = Math.min(1, opacityRef.current + delta * 1.4);
          setRenderOpacity(opacityRef.current);
        }

        // B. Directly observed (without flashlight close burn) -> eerie Freeze + SlowHeadRaise
        if (directlyWatched && dist < 8.5) {
          if (npcState !== 'Observing') setNpcState('Observing');
          if (isCrawling) setIsCrawling(false);
        } else if (blueprint.isHostile && dist > 3.5 && dist < 19) {
          // C. Unseen Stalking between cover waypoints (avoiding walls & closed doors!)
          if (npcState !== 'Stalking') setNpcState('Stalking');
          if (!stalkWaypointRef.current || distanceXZ(posRef.current, stalkWaypointRef.current) < 0.7) {
            stalkWaypointRef.current = pickUnseenStalkingWaypoint({
              level,
              currentPos: posRef.current,
              playerPos,
              playerForward: playerFwd,
              openDoorIds,
            });
          }

          if (stalkWaypointRef.current) {
            const speed = blueprint.type === 'tran_thi_lien' ? 1.15 : 1.35;
            const step = computeSafeStepToward({
              level,
              currentPos: posRef.current,
              targetPos: stalkWaypointRef.current,
              speed,
              delta,
              minStopDistance: 0.45,
              capsuleRadius: 0.42,
              openDoorIds,
            });
            if (step.moved && distanceXZ(step.nextPos, playerPos) > 2.8) {
              rotYRef.current = step.yaw;
              posRef.current = step.nextPos;
            } else {
              stalkWaypointRef.current = null;
            }
          }
        }
      }
    }

    groupRef.current.position.set(posRef.current[0], posRef.current[1], posRef.current[2]);
    groupRef.current.rotation.y = rotYRef.current;
  });

  return (
    <group ref={groupRef} position={blueprint.position} rotation={[0, blueprint.rotationY, 0]}>
      <NPCController
        instanceId={blueprint.id}
        type={blueprint.type}
        state={npcState}
        opacity={renderOpacity}
        headLookYaw={headYaw}
        isCulled={isCulled}
        variantIndex={blueprint.variantIndex}
        isFrozenByGaze={frozenByGaze}
        isStanding={blueprint.type === 'faceless_passenger' && currentTier >= 3}
        isRowing={blueprint.type === 'ferryman' && level.id === 5}
        isFriendly={blueprint.isHostile === false}
        overrideClip={overrideClip}
        crawling={isCrawling}
        shieldFace={isShieldingFace}
        preferredModelMode={preferredModelMode}
        reloadToken={reloadToken}
        animationPaused={animationPaused}
        animationResetToken={animationResetToken}
      />
    </group>
  );
};

/** Physical 3D Jumpscare Actor: spawns physically in world space, executes Types A–H lunge & vanish */
const PhysicalJumpscare3DActor: React.FC<{ event: PhysicalJumpscareEvent }> = ({ event }) => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group | null>(null);
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    if (!groupRef.current) return;
    const now = Date.now();
    const phase = getJumpscarePhase(event, now);
    const elapsedSec = (now - event.startedAt) / 1000;
    const totalSec = event.durationMs / 1000;
    const progress = Math.min(1, elapsedSec / totalSec);

    // Compute safe forward lunge clamped >= 1.25m from camera (never clips into camera!)
    const dx = camera.position.x - event.worldPosition[0];
    const dz = camera.position.z - event.worldPosition[2];
    const dist = Math.hypot(dx, dz) || 1;
    const maxApproach = Math.max(0, dist - 1.26);

    const lungeFactor =
      phase === 'PREPARE'
        ? 0
        : phase === 'SPAWN' || phase === 'HOLD'
        ? progress * 0.65
        : phase === 'LUNGE'
        ? 1.0
        : Math.max(0, 1 - (progress - 0.8) / 0.2);

    const offset = Math.min(0.48, maxApproach) * lungeFactor;

    groupRef.current.position.set(
      event.worldPosition[0] + (dx / dist) * offset,
      event.worldPosition[1],
      event.worldPosition[2] + (dz / dist) * offset
    );
    groupRef.current.rotation.y = Math.atan2(dx, dz);

    if (phase === 'VANISH' || phase === 'COOLDOWN') {
      setOpacity(Math.max(0, 1 - (progress - 0.78) / 0.22));
    } else {
      setOpacity(1);
    }
  });

  return (
    <group ref={groupRef} position={event.worldPosition} rotation={[0, event.rotationY, 0]}>
      <NPCController
        type={event.npcType}
        state="Jumpscaring"
        opacity={opacity}
        isStanding
        overrideClip={event.animationClip ?? null}
        crawling={Boolean(event.crawling)}
      />
      {/* Dramatic cold-crimson localized rim lights illuminating the 3D ghost's face/hands */}
      <pointLight
        position={[0, event.crawling ? 0.85 : 1.55, 0.55]}
        color="#d92b2b"
        intensity={5.0}
        distance={3.4}
      />
      <pointLight
        position={[0, event.crawling ? 0.9 : 1.6, 0.35]}
        color="#cfdbe8"
        intensity={2.4}
        distance={2.6}
      />
    </group>
  );
};

/**
 * Master 3D NPC & Physical Jumpscare Director mounted inside every 3D level scene (v5.0).
 * Coordinates:
 * - Level NPC roster (pooled & cleaned up on level change)
 * - Level 3 Perception (LOS + FOV + Flashlight Beam) & Waypoint Stalking
 * - Proximity trigger volumes -> Physical 3D NPC Jumpscares (Types A–H)
 * - Queued post-inspect & Debug Panel 3D NPC Jumpscares
 * - Moral choice & NG+ behavioral reactivity
 */
export const NPCBehaviorDirector: React.FC<{ level: LevelData }> = ({ level }) => {
  const { camera } = useThree();
  const narrative = useGameStore((s) => s.narrative);
  const progress = useGameStore((s) => s.progressByLevel[level.id]);
  const horrorIntensity = useGameStore((s) => s.horrorIntensity);
  const flashlightOn = useGameStore((s) => s.flashlightOn);
  const isSprinting = useGameStore((s) => s.isSprinting);
  const isCrouching = useGameStore((s) => s.isCrouching);
  const activeHidingSpotId = useGameStore((s) => s.activeHidingSpotId);
  const lastIncenseWardAt = useGameStore((s) => s.lastIncenseWardAt);
  const overlay = useGameStore((s) => s.overlay);
  const screen = useGameStore((s) => s.screen);
  const settings = useGameStore((s) => s.settings);
  const activePhysicalJumpscare = useGameStore((s) => s.activePhysicalJumpscare);
  const pendingPhysicalScareRequest = useGameStore((s) => s.pendingPhysicalScareRequest);
  const triggerPhysicalJumpscare = useGameStore((s) => s.triggerPhysicalJumpscare);
  const consumePendingPhysicalScare = useGameStore((s) => s.consumePendingPhysicalScare);
  const markZoneScareTriggered = useGameStore((s) => s.markZoneScareTriggered);

  const camDir = useMemo(() => new THREE.Vector3(), []);

  const blueprints = useMemo(
    () => getLevelNPCBlueprints(level.id, narrative),
    [
      level.id,
      narrative.isNewGamePlus,
      narrative.moralChoices.fate_dao_thi_may,
      narrative.moralChoices.fate_village_truth,
    ]
  );

  // Pool acquisition & cleanup on level transition
  useEffect(() => {
    npcPool.acquireForLevel(level.id, blueprints);
    npcDebugBus.clearSnapshots();
    return () => {
      npcPool.releaseAll();
      npcDebugBus.clearSnapshots();
    };
  }, [level.id, blueprints]);

  const isGameplayBlocked = screen !== 'playing' || overlay !== 'none';
  const openDoorIds = progress?.openDoorIds ?? [];
  const currentTier = progress?.currentTier ?? 1;
  const cluesFound = progress?.unlockedClueIds.length ?? 0;

  useFrame(() => {
    if (isGameplayBlocked || !settings.enableJumpscares || activePhysicalJumpscare) return;

    const playerPos: Vec3 = [camera.position.x, camera.position.y, camera.position.z];
    camera.getWorldDirection(camDir);
    const playerFwd: Vec3 = [camDir.x, camDir.y, camDir.z];

    // 1. Check queued post-inspect or Debug Panel 3D physical jumpscare
    if (pendingPhysicalScareRequest) {
      const req = consumePendingPhysicalScare();
      if (req) {
        const ev = buildPhysicalJumpscareEvent({
          level,
          npcType: req.npcType,
          caption: req.caption,
          playerPos,
          playerForward: playerFwd,
          openDoorIds,
          jumpscareType: req.jumpscareType,
          preferredDistance: 1.65,
          animationClip: req.animationClip,
          crawling: req.crawling,
        });
        if (ev) {
          dispatchPhysicalJumpscareAudio(ev);
          triggerPhysicalJumpscare(ev, req.force);
        }
      }
      return;
    }

    // 2. Check level proximity trigger volumes (suppressed while player is safely hiding or burning Incense Ward!)
    if (activeHidingSpotId || Date.now() - lastIncenseWardAt < 6000) return;

    for (const trig of LEVEL_JUMPSCARE_TRIGGERS) {
      if (trig.levelId !== level.id) continue;
      if (!trig.test(playerPos, narrative)) continue;
      if (!markZoneScareTriggered(trig.key)) continue;

      const ev = buildPhysicalJumpscareEvent({
        level,
        npcType: trig.npcType,
        caption: trig.caption,
        playerPos,
        playerForward: playerFwd,
        openDoorIds,
        jumpscareType: trig.jumpscareType,
        fixedWorldPosition: trig.fixedWorldPosition,
        preferredDistance: trig.preferredDistance,
        animationClip: trig.animationClip,
        crawling: trig.crawling,
      });
      if (ev) {
        dispatchPhysicalJumpscareAudio(ev);
        triggerPhysicalJumpscare(ev, true);
      }
      break;
    }
  });

  return (
    <group>
      {/* Persistent World 3D NPCs for this level */}
      {blueprints.map((bp) => (
        <WorldNPCActor
          key={bp.id}
          blueprint={bp}
          level={level}
          currentTier={currentTier}
          cluesFound={cluesFound}
          horrorIntensity={horrorIntensity}
          flashlightOn={flashlightOn}
          isSprinting={isSprinting}
          isCrouching={isCrouching}
          isPlayerHidden={Boolean(activeHidingSpotId)}
          lastIncenseWardAt={lastIncenseWardAt}
          isGameplayBlocked={isGameplayBlocked}
          openDoorIds={openDoorIds}
        />
      ))}

      {/* Active Physical 3D Jumpscare NPC (spawns directly in 3D space, ZERO 2D/SVG ghost!) */}
      {activePhysicalJumpscare && <PhysicalJumpscare3DActor event={activePhysicalJumpscare} />}
    </group>
  );
};
