import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NPCState } from '../npc/NPCStateMachine';
import {
  NPCAnimationClipName,
  updateArticulatedJoints,
} from '../npc/NPCAnimationController';

export interface CharacterProps {
  state: NPCState;
  opacity?: number;
  headLookYaw?: number;
  isCulled?: boolean;
  isFriendly?: boolean;
  overrideClip?: NPCAnimationClipName | null;
  crawling?: boolean;
  shieldFace?: boolean;
}

/**
 * NPC 01 — ĐÀO THỊ MÂY (Priority #1 Hero Horror NPC — v5.0 Full 15-Joint Articulated Rig)
 * Vietnamese adult woman in aged torn crimson áo dài, long black hair draping over her pale face,
 * articulated elbows/forearms/hands, bare feet, swaying dress panels & hair strands.
 */
export const MayCharacter: React.FC<CharacterProps> = ({
  state,
  opacity = 1,
  headLookYaw = 0,
  isCulled = false,
  isFriendly = false,
  overrideClip = null,
}) => {
  const hipsRef = useRef<THREE.Group | null>(null);
  const torsoRef = useRef<THREE.Group | null>(null);
  const headRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const leftForeArmRef = useRef<THREE.Group | null>(null);
  const rightForeArmRef = useRef<THREE.Group | null>(null);
  const leftLegRef = useRef<THREE.Group | null>(null);
  const rightLegRef = useRef<THREE.Group | null>(null);
  const hairRef = useRef<THREE.Group | null>(null);
  const dressFrontRef = useRef<THREE.Mesh | null>(null);

  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: '#a8a296', roughness: 0.84, transparent: true }),
      aoDai: new THREE.MeshStandardMaterial({
        color: isFriendly ? '#7d1e1e' : '#5c0c0c',
        emissive: isFriendly ? '#240707' : '#180202',
        roughness: 0.86,
        transparent: true,
        side: THREE.DoubleSide,
      }),
      pants: new THREE.MeshStandardMaterial({ color: '#191514', roughness: 0.92, transparent: true }),
      hair: new THREE.MeshStandardMaterial({ color: '#080708', roughness: 0.94, transparent: true }),
      eyeSocket: new THREE.MeshStandardMaterial({ color: '#060304', roughness: 0.9, transparent: true }),
    }),
    [isFriendly]
  );

  useFrame((clockState, delta) => {
    const op = Math.max(0, Math.min(1, opacity));
    Object.values(mats).forEach((m) => {
      m.opacity = op;
    });
    if (isCulled || op < 0.02) return;

    const t = clockState.clock.elapsedTime;
    updateArticulatedJoints(
      {
        hips: hipsRef.current,
        torso: torsoRef.current,
        head: headRef.current,
        leftArm: leftArmRef.current,
        rightArm: rightArmRef.current,
        leftForeArm: leftForeArmRef.current,
        rightForeArm: rightForeArmRef.current,
        leftLeg: leftLegRef.current,
        rightLeg: rightLegRef.current,
        hair: hairRef.current,
      },
      state,
      t,
      delta,
      { overrideClip, headLookYaw }
    );

    // Subtle cloth flutter on front áo dài panel
    if (dressFrontRef.current) {
      dressFrontRef.current.rotation.x = 0.08 + Math.sin(t * 2.4) * 0.05;
    }
  });

  return (
    <group ref={hipsRef} name="Hips">
      {/* Legs & Bare Pale Feet */}
      <group ref={leftLegRef} name="LeftLeg" position={[-0.09, 0.78, 0]}>
        <mesh position={[0, -0.34, 0]} material={mats.pants} castShadow>
          <cylinderGeometry args={[0.068, 0.082, 0.68, 8]} />
        </mesh>
        <mesh name="LeftFoot" position={[0, -0.74, 0.04]} material={mats.skin}>
          <boxGeometry args={[0.075, 0.052, 0.17]} />
        </mesh>
      </group>
      <group ref={rightLegRef} name="RightLeg" position={[0.09, 0.78, 0]}>
        <mesh position={[0, -0.34, 0]} material={mats.pants} castShadow>
          <cylinderGeometry args={[0.068, 0.082, 0.68, 8]} />
        </mesh>
        <mesh name="RightFoot" position={[0, -0.74, 0.04]} material={mats.skin}>
          <boxGeometry args={[0.075, 0.052, 0.17]} />
        </mesh>
      </group>

      {/* Spine / Chest + Flowing Torn Crimson Áo Dài */}
      <group ref={torsoRef} name="Spine" position={[0, 0.82, 0]}>
        <mesh name="Chest" position={[0, 0.28, 0]} material={mats.aoDai} castShadow>
          <cylinderGeometry args={[0.145, 0.12, 0.54, 12]} />
        </mesh>
        <mesh name="Neck" position={[0, 0.57, 0]} material={mats.aoDai}>
          <cylinderGeometry args={[0.06, 0.072, 0.09, 10]} />
        </mesh>
        {/* Front & back hanging tattered áo dài flaps */}
        <mesh ref={dressFrontRef} position={[0, -0.22, 0.11]} rotation={[0.08, 0, 0]} material={mats.aoDai} castShadow>
          <boxGeometry args={[0.29, 0.68, 0.022]} />
        </mesh>
        <mesh position={[0, -0.24, -0.11]} rotation={[-0.08, 0, 0]} material={mats.aoDai} castShadow>
          <boxGeometry args={[0.31, 0.72, 0.022]} />
        </mesh>

        {/* Articulated Head + Hair Veiling Face */}
        <group ref={headRef} name="Head" position={[0, 0.64, 0]}>
          <mesh position={[0, 0.11, 0]} material={mats.skin} castShadow>
            <sphereGeometry args={[0.118, 14, 14]} />
          </mesh>
          <mesh position={[-0.042, 0.12, 0.1]} material={mats.eyeSocket}>
            <sphereGeometry args={[0.022, 8, 8]} />
          </mesh>
          <mesh position={[0.042, 0.12, 0.1]} material={mats.eyeSocket}>
            <sphereGeometry args={[0.022, 8, 8]} />
          </mesh>
          <mesh position={[0, 0.055, 0.105]} material={mats.eyeSocket}>
            <boxGeometry args={[0.044, 0.012, 0.012]} />
          </mesh>
          {/* Long black hair draping over temples & partial face (HairCoverFace silhouette) */}
          <mesh position={[0, 0.15, -0.02]} material={mats.hair}>
            <sphereGeometry args={[0.13, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.64]} />
          </mesh>
          <group ref={hairRef} position={[0, 0.09, -0.05]}>
            <mesh position={[0, -0.3, -0.04]} material={mats.hair}>
              <boxGeometry args={[0.26, 0.7, 0.07]} />
            </mesh>
            <mesh position={[-0.085, -0.2, 0.11]} material={mats.hair}>
              <boxGeometry args={[0.05, 0.48, 0.032]} />
            </mesh>
            <mesh position={[0.085, -0.2, 0.11]} material={mats.hair}>
              <boxGeometry args={[0.05, 0.48, 0.032]} />
            </mesh>
            <mesh position={[-0.02, -0.14, 0.145]} rotation={[0, 0, 0.08]} material={mats.hair}>
              <boxGeometry args={[0.035, 0.34, 0.018]} />
            </mesh>
          </group>
        </group>

        {/* Left Upper Arm -> Elbow Forearm -> Pale Hand */}
        <group ref={leftArmRef} name="LeftArm" position={[-0.19, 0.48, 0]}>
          <mesh position={[0, -0.13, 0]} material={mats.aoDai} castShadow>
            <cylinderGeometry args={[0.044, 0.046, 0.28, 8]} />
          </mesh>
          <group ref={leftForeArmRef} name="LeftForeArm" position={[0, -0.27, 0]}>
            <mesh position={[0, -0.12, 0]} material={mats.aoDai} castShadow>
              <cylinderGeometry args={[0.042, 0.052, 0.26, 8]} />
            </mesh>
            <mesh name="LeftHand" position={[0, -0.29, 0.02]} material={mats.skin}>
              <boxGeometry args={[0.052, 0.12, 0.032]} />
            </mesh>
          </group>
        </group>

        {/* Right Upper Arm -> Elbow Forearm -> Pale Hand */}
        <group ref={rightArmRef} name="RightArm" position={[0.19, 0.48, 0]}>
          <mesh position={[0, -0.13, 0]} material={mats.aoDai} castShadow>
            <cylinderGeometry args={[0.044, 0.046, 0.28, 8]} />
          </mesh>
          <group ref={rightForeArmRef} name="RightForeArm" position={[0, -0.27, 0]}>
            <mesh position={[0, -0.12, 0]} material={mats.aoDai} castShadow>
              <cylinderGeometry args={[0.042, 0.052, 0.26, 8]} />
            </mesh>
            <mesh name="RightHand" position={[0, -0.29, 0.02]} material={mats.skin}>
              <boxGeometry args={[0.052, 0.12, 0.032]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
