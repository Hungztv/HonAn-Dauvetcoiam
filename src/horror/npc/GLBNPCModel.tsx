import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { assetPipeline } from '../../three/AssetPipeline';
import { NPCCharacterType, NPCState } from './NPCStateMachine';
import { NPC_DEFINITIONS } from './NPCRegistry';
import {
  NPCAnimationClipName,
  RiggedGLBAnimator,
  resolveClipFromState,
} from './NPCAnimationController';
import { ValidationStatus } from './NPCModelValidator';
import { npcDebugBus } from '../debug/npcDebugBus';

export interface GLBNPCModelProps {
  instanceId?: string;
  type: NPCCharacterType;
  state: NPCState;
  opacity: number;
  isCulled?: boolean;
  isFrozenByGaze?: boolean;
  isStanding?: boolean;
  isRowing?: boolean;
  overrideClip?: NPCAnimationClipName | null;
  crawling?: boolean;
  shieldFace?: boolean;
  /** Dev Debug Panel controls */
  preferredModelMode?: 'AUTO' | 'PROCEDURAL' | 'GLB';
  reloadToken?: number;
  animationPaused?: boolean;
  animationResetToken?: number;
  /** Existing procedural 15-joint articulated character used as zero-pop fallback */
  fallback: React.ReactNode;
}

/**
 * HỒN ÁN v5.1 — Seamless GLB-or-Procedural Character Runtime Slot
 * - Loads external Blender rigged .glb from NPC_DEFINITIONS[type] via AssetPipeline cache
 * - Validates 15 semantic bones, skin weights, clips, transform & PBR via NPCModelValidator v5.1
 * - Clones skeleton & materials per-instance via RiggedGLBAnimator (independent multi-instance state!)
 * - Supports optional LOD GLB swap by camera distance
 * - Falls back cleanly to procedural 3D character when GLB is absent, loading, or INVALID
 *   (zero crashes, zero double-rendering, zero AI state reset, zero 404 spam in default play!)
 */
export const GLBNPCModel: React.FC<GLBNPCModelProps> = ({
  instanceId,
  type,
  state,
  opacity,
  isCulled = false,
  isFrozenByGaze = false,
  isStanding = false,
  isRowing = false,
  overrideClip = null,
  crawling = false,
  shieldFace = false,
  preferredModelMode = 'AUTO',
  reloadToken = 0,
  animationPaused = false,
  animationResetToken = 0,
  fallback,
}) => {
  const { gl, camera } = useThree();
  const def = NPC_DEFINITIONS[type];
  const contract = def.assetContract;

  // Only attempt network GLB fetch if glbUrl/glbAssetPresent is enabled OR dev explicitly forces 'GLB' mode
  const shouldAttemptGlb =
    preferredModelMode !== 'PROCEDURAL' &&
    (Boolean(def.glbUrl) || contract.glbAssetPresent || preferredModelMode === 'GLB');
  const targetUrl = def.glbUrl ?? contract.expectedGlbPath;

  const animatorRef = useRef<RiggedGLBAnimator | null>(null);
  const lodAnimatorRef = useRef<RiggedGLBAnimator | null>(null);
  const groupRef = useRef<THREE.Group | null>(null);
  const worldPosVec = useRef(new THREE.Vector3());

  const [glbReady, setGlbReady] = useState(false);
  const [useLod, setUseLod] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'NONE' | ValidationStatus>('NONE');
  const [fallbackReason, setFallbackReason] = useState<string | null>(
    contract.glbAssetPresent ? null : `Chưa có file GLB tại ${contract.expectedGlbPath} (dùng Procedural 15 khớp)`
  );

  // Load & validate GLB (only when enabled or explicitly forced in Debug Panel)
  useEffect(() => {
    // Cleanup previous instance animator without touching shared cached asset!
    if (animatorRef.current) {
      animatorRef.current.dispose();
      animatorRef.current = null;
    }
    if (lodAnimatorRef.current) {
      lodAnimatorRef.current.dispose();
      lodAnimatorRef.current = null;
    }
    setGlbReady(false);
    setUseLod(false);

    if (!shouldAttemptGlb) {
      setValidationStatus('NONE');
      setFallbackReason(
        preferredModelMode === 'PROCEDURAL'
          ? 'Debug override: PROCEDURAL'
          : `Chưa có file GLB tại ${contract.expectedGlbPath} (dùng Procedural 15 khớp)`
      );
      return;
    }

    let cancelled = false;
    setFallbackReason('Đang tải GLB...');

    assetPipeline
      .loadModel(targetUrl, gl)
      .then((entry) => {
        if (cancelled) {
          assetPipeline.releaseModel(targetUrl);
          return;
        }
        const animator = new RiggedGLBAnimator(
          entry.gltf.scene,
          entry.gltf.animations,
          contract.requiredClips,
          def.heightMeters
        );

        setValidationStatus(animator.validation.status);

        if (animator.validation.status === 'INVALID' || !animator.validation.isValidRig) {
          const reason = animator.validation.errors.join(' | ') || 'Invalid GLB rig';
          animator.dispose();
          assetPipeline.releaseModel(targetUrl);
          setFallbackReason(`GLB INVALID: ${reason}`);
          setGlbReady(false);
          if ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) {
            console.warn(`[HỒN ÁN v5.1] Fallback to procedural for ${type}: ${reason}`);
          }
          return;
        }

        animator.root.scale.setScalar(contract.scale);
        if (contract.groundOffsetY !== 0) {
          animator.root.position.y = contract.groundOffsetY;
        }
        animatorRef.current = animator;
        setFallbackReason(
          animator.validation.status === 'WARNING'
            ? `GLB WARNING: ${animator.validation.warnings[0] ?? 'check PBR/clips'}`
            : null
        );
        setGlbReady(true);

        // Optional LOD GLB load if configured
        if (contract.expectedLodPath) {
          assetPipeline
            .loadModel(contract.expectedLodPath, gl)
            .then((lodEntry) => {
              if (cancelled) {
                assetPipeline.releaseModel(contract.expectedLodPath!);
                return;
              }
              const lodAnim = new RiggedGLBAnimator(
                lodEntry.gltf.scene,
                lodEntry.gltf.animations,
                [],
                def.heightMeters
              );
              if (lodAnim.validation.isValidRig) {
                lodAnim.root.scale.setScalar(contract.scale);
                lodAnimatorRef.current = lodAnim;
              } else {
                lodAnim.dispose();
                assetPipeline.releaseModel(contract.expectedLodPath!);
              }
            })
            .catch(() => {
              // Optional LOD absence is silently tolerated
            });
        }
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setValidationStatus('INVALID');
        setFallbackReason(`Không tải được ${targetUrl} (${msg.slice(0, 64)}) -> Fallback Procedural`);
        setGlbReady(false);
        if ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) {
          console.warn(`[HỒN ÁN v5.1] GLB load failed for ${type} (${targetUrl}), using procedural fallback.`);
        }
      });

    return () => {
      cancelled = true;
      if (animatorRef.current) {
        animatorRef.current.dispose();
        animatorRef.current = null;
        assetPipeline.releaseModel(targetUrl);
      }
      if (lodAnimatorRef.current && contract.expectedLodPath) {
        lodAnimatorRef.current.dispose();
        lodAnimatorRef.current = null;
        assetPipeline.releaseModel(contract.expectedLodPath);
      }
    };
  }, [shouldAttemptGlb, targetUrl, reloadToken, gl, type, def.heightMeters, contract, preferredModelMode]);

  // Handle Debug Panel stop / reset animation controls
  useEffect(() => {
    const active = animatorRef.current;
    if (!active) return;
    if (animationPaused) active.stop();
    else active.reset();
  }, [animationPaused]);

  useEffect(() => {
    if (animationResetToken > 0 && animatorRef.current) {
      animatorRef.current.reset();
    }
  }, [animationResetToken]);

  const activeClip = resolveClipFromState(state, {
    crawling,
    shieldFace,
    sitting: type === 'faceless_passenger' && !isStanding,
    rowing: type === 'ferryman' && isRowing,
    limp: type === 'tran_thi_lien',
    overrideClip,
  });

  // Drive GLB AnimationMixer, crossfade, opacity fade, LOD & Debug Telemetry
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const activeAnim = useLod && lodAnimatorRef.current ? lodAnimatorRef.current : animatorRef.current;

    let lodLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH';
    if (groupRef.current) {
      groupRef.current.getWorldPosition(worldPosVec.current);
      const dist = camera.position.distanceTo(worldPosVec.current);
      if (dist > 18) lodLevel = 'LOW';
      else if (dist > (contract.lodDistanceMeters ?? 14)) lodLevel = 'MEDIUM';

      if (lodAnimatorRef.current && contract.lodDistanceMeters) {
        const shouldUseLod = dist > contract.lodDistanceMeters;
        if (shouldUseLod !== useLod) setUseLod(shouldUseLod);
      }
    }

    if (glbReady && activeAnim && !isCulled && opacity >= 0.02) {
      if (!(isFrozenByGaze && state !== 'Jumpscaring' && !overrideClip) && !animationPaused) {
        const loopOnce = activeClip === 'Disappear' || activeClip === 'StandUp';
        activeAnim.crossfadeTo(activeClip, 0.22, loopOnce);
        activeAnim.update(delta, contract.rootMotionPolicy === 'in-place');
      }
      activeAnim.applyOpacity(opacity);
    }

    if (instanceId && npcDebugBus.enabled) {
      const usingGlb = glbReady && Boolean(activeAnim);
      const val = activeAnim?.validation;
      npcDebugBus.reportModelRuntime(instanceId, {
        modelSource: usingGlb ? 'GLB' : 'PROCEDURAL',
        glbLoaded: glbReady,
        validationStatus,
        skeletonSummary: usingGlb && val
          ? `GLB ${val.foundBones.length}/15 (${val.totalBoneCount} bones)`
          : '15/15 Procedural Rig',
        mixerTime: usingGlb && activeAnim ? activeAnim.getTime() : 0,
        lodLevel,
        boundingHeight: usingGlb && val ? val.boundingHeight : def.heightMeters,
        textureState: usingGlb
          ? 'GLB_PBR'
          : fallbackReason === 'Đang tải GLB...'
          ? 'LOADING'
          : 'PROCEDURAL_PBR',
        fallbackReason,
      });
    }
  });

  if (glbReady && animatorRef.current) {
    const activeRoot = useLod && lodAnimatorRef.current ? lodAnimatorRef.current.root : animatorRef.current.root;
    return (
      <group ref={groupRef}>
        <primitive object={activeRoot} />
      </group>
    );
  }

  return <group ref={groupRef}>{fallback}</group>;
};
