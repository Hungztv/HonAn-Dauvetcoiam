import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { LevelData, Vec3 } from '../../types/game';
import { useGameStore } from '../../store/gameStore';
import { getLevelNPCBlueprints, NPCSpawnBlueprint } from './NPCRegistry';
import {
  NPCState,
  distanceXZ,
  isPlayerLookingAt,
} from './NPCStateMachine';
import { isPointBlockedInLevel } from './NPCSpawnManager';
import { npcPool } from './NPCPooling';
import { NPCController } from './NPCController';
import { LEVEL_JUMPSCARE_TRIGGERS } from '../jumpscare/JumpscareTriggers';
import {
  PhysicalJumpscareEvent,
  buildPhysicalJumpscareEvent,
  dispatchPhysicalJumpscareAudio,
} from '../jumpscare/PhysicalJumpscareDirector';
import { playNPCDisappearAudio, playNPCFootstepAudio } from '../jumpscare/JumpscareAudio';

/** Single Ambient / Interactive 3D NPC instance inside the level world */
const WorldNPCActor: React.FC<{
  blueprint: NPCSpawnBlueprint;
  level: LevelData;
  currentTier: 1 | 2 | 3;
  cluesFound: number;
  horrorIntensity: number;
  flashlightOn: boolean;
  isGameplayBlocked: boolean;
  openDoorIds: string[];
}> = ({
  blueprint,
  level,
  currentTier,
  cluesFound,
  horrorIntensity,
  flashlightOn,
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
  const [npcState, setNpcState] = useState<NPCState>(blueprint.initialState);
  const [frozenByGaze, setFrozenByGaze] = useState(false);
  const [renderOpacity, setRenderOpacity] = useState(blueprint.initialState === 'Hidden' ? 0 : 1);
  const [isCulled, setIsCulled] = useState(false);
  const [headYaw, setHeadYaw] = useState(0);

  const camDir = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, rawDelta) => {
    if (!groupRef.current) return;
    const delta = Math.min(rawDelta, 0.05);

    const playerPos: Vec3 = [camera.position.x, camera.position.y, camera.position.z];
    camera.getWorldDirection(camDir);
    const playerFwd: Vec3 = [camDir.x, camDir.y, camDir.z];

    const dist = distanceXZ(posRef.current, playerPos);
    const far = dist > 23;
    if (far !== isCulled) setIsCulled(far);
    if (far) return;

    const unlockedByHorror = horrorIntensity >= blueprint.minHorror;
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

    const lookingAtMe = isPlayerLookingAt(playerPos, playerFwd, posRef.current, 0.58);
    const angleToPlayer = Math.atan2(
      playerPos[0] - posRef.current[0],
      playerPos[2] - posRef.current[2]
    );

    // Character-specific AI behaviors!
    if (blueprint.type === 'wooden_statue') {
      // NPC 04 — Weeping-Angel Statue AI: freezes rigid while watched; rotates & steps closer ONLY when player looks away!
      if (lookingAtMe !== frozenByGaze) setFrozenByGaze(lookingAtMe);
      groupRef.current.visible = true;

      if (!lookingAtMe && dist > 2.3 && dist < 16) {
        rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, angleToPlayer, Math.min(1, delta * 2.2));
        statueStepCooldownRef.current -= delta;
        if (statueStepCooldownRef.current <= 0) {
          statueStepCooldownRef.current = 3.2 + Math.random() * 2.4;
          // Attempt a controlled 0.65m step closer within unobstructed hall bounds
          const stepDist = 0.65;
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

    if (blueprint.type === 'faceless_passenger') {
      // NPC 05 — Start seated; turn head as clues are found; all 4 stand simultaneously once Tier >= 3!
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

    if (blueprint.type === 'ferryman') {
      // NPC 06 — Respectful rowing / quiet observation; never breaks ending
      groupRef.current.visible = true;
      if (level.id === 1) {
        // NG+ early appearance in backyard: fades out gently if player walks very close
        if (dist < 4.0 && flashlightOn && lookingAtMe) {
          vanishedCooldownRef.current = 18;
          playNPCDisappearAudio(posRef.current);
          groupRef.current.visible = false;
          return;
        }
      }
      groupRef.current.position.set(posRef.current[0], posRef.current[1], posRef.current[2]);
      groupRef.current.rotation.y = rotYRef.current;
      return;
    }

    if (blueprint.type === 'child_spirit') {
      // NPC 03 — Emerges gently when player comes within 6m of the well; sinks back if very far
      groupRef.current.visible = true;
      const desiredState: NPCState = dist < 5.5 ? 'Observing' : 'Hidden';
      if (desiredState !== npcState) setNpcState(desiredState);
      rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, angleToPlayer, Math.min(1, delta * 2.5));
      groupRef.current.position.set(posRef.current[0], posRef.current[1], posRef.current[2]);
      groupRef.current.rotation.y = rotYRef.current;
      return;
    }

    // NPC 01 (Đào Thị Mây) & NPC 02 (Trần Thị Liên) — Stalking / Observing / Flashlight Vanish
    groupRef.current.visible = true;
    rotYRef.current = THREE.MathUtils.lerp(rotYRef.current, angleToPlayer, Math.min(1, delta * 3.0));
    groupRef.current.position.set(posRef.current[0], posRef.current[1], posRef.current[2]);
    groupRef.current.rotation.y = rotYRef.current;

    if (flashlightOn && lookingAtMe && dist < 4.6 && blueprint.isHostile) {
      // Vanishes into mist when flashlight directly hits her at close range!
      opacityRef.current = Math.max(0, opacityRef.current - delta * 2.8);
      setRenderOpacity(opacityRef.current);
      if (opacityRef.current <= 0.04) {
        playNPCDisappearAudio(posRef.current);
        vanishedCooldownRef.current = 16;
        opacityRef.current = 1;
        setRenderOpacity(1);
      }
    } else if (opacityRef.current < 1) {
      opacityRef.current = Math.min(1, opacityRef.current + delta * 1.4);
      setRenderOpacity(opacityRef.current);
    }
  });

  return (
    <group ref={groupRef} position={blueprint.position} rotation={[0, blueprint.rotationY, 0]}>
      <NPCController
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
      />
    </group>
  );
};

/** Physical 3D Jumpscare Actor: spawns physically in world space, lunges smoothly to safe camera distance, then retreats */
const PhysicalJumpscare3DActor: React.FC<{ event: PhysicalJumpscareEvent }> = ({ event }) => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group | null>(null);
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    if (!groupRef.current) return;
    const elapsedSec = (Date.now() - event.startedAt) / 1000;
    const totalSec = event.durationMs / 1000;
    const progress = Math.min(1, elapsedSec / totalSec);

    // Lunge slightly closer during first 35% (strictly clamped >= 1.25m safe distance from player camera!), then retreat
    const dx = camera.position.x - event.worldPosition[0];
    const dz = camera.position.z - event.worldPosition[2];
    const dist = Math.hypot(dx, dz) || 1;
    const maxApproach = Math.max(0, dist - 1.28);
    const lungeFactor = progress < 0.35 ? progress / 0.35 : 1 - (progress - 0.35) / 0.65;
    const offset = Math.min(0.45, maxApproach) * lungeFactor;

    groupRef.current.position.set(
      event.worldPosition[0] + (dx / dist) * offset,
      event.worldPosition[1],
      event.worldPosition[2] + (dz / dist) * offset
    );
    groupRef.current.rotation.y = Math.atan2(dx, dz);

    // Smooth disappear at tail end of scare
    if (progress > 0.72) {
      setOpacity(Math.max(0, 1 - (progress - 0.72) / 0.28));
    }
  });

  return (
    <group ref={groupRef} position={event.worldPosition} rotation={[0, event.rotationY, 0]}>
      <NPCController
        type={event.npcType}
        state="Jumpscaring"
        opacity={opacity}
        isStanding
      />
      {/* Dramatic cold-crimson localized rim light illuminating the 3D ghost's face/hands */}
      <pointLight position={[0, 1.55, 0.55]} color="#d92b2b" intensity={4.8} distance={3.2} />
      <pointLight position={[0, 1.6, 0.35]} color="#cfdbe8" intensity={2.2} distance={2.4} />
    </group>
  );
};

/**
 * Master 3D NPC & Physical Jumpscare Director mounted inside every 3D level scene.
 * Coordinates:
 * - Level NPC roster (pooled & cleaned up on level change)
 * - Proximity trigger volumes -> Physical 3D NPC Jumpscares
 * - Queued post-inspect 3D NPC Jumpscares
 * - Moral choice & NG+ behavioral reactivity
 */
export const NPCBehaviorDirector: React.FC<{ level: LevelData }> = ({ level }) => {
  const { camera } = useThree();
  const narrative = useGameStore((s) => s.narrative);
  const progress = useGameStore((s) => s.progressByLevel[level.id]);
  const horrorIntensity = useGameStore((s) => s.horrorIntensity);
  const flashlightOn = useGameStore((s) => s.flashlightOn);
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
    [level.id, narrative.isNewGamePlus, narrative.moralChoices.fate_dao_thi_may, narrative.moralChoices.fate_village_truth]
  );

  // Pool acquisition & cleanup on level transition
  useEffect(() => {
    npcPool.acquireForLevel(level.id, blueprints);
    return () => {
      npcPool.releaseAll();
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

    // 1. Check queued post-inspect or director-requested 3D physical jumpscare
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
          preferredDistance: 1.65,
        });
        if (ev) {
          dispatchPhysicalJumpscareAudio(ev);
          triggerPhysicalJumpscare(ev, req.force);
        }
      }
      return;
    }

    // 2. Check level proximity trigger volumes (each fires once per run!)
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
        fixedWorldPosition: trig.fixedWorldPosition,
        preferredDistance: trig.preferredDistance,
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
          isGameplayBlocked={isGameplayBlocked}
          openDoorIds={openDoorIds}
        />
      ))}

      {/* Active Physical 3D Jumpscare NPC (spawns directly in 3D space, ZERO 2D/SVG ghost!) */}
      {activePhysicalJumpscare && <PhysicalJumpscare3DActor event={activePhysicalJumpscare} />}
    </group>
  );
};
