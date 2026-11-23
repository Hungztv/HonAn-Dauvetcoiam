import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterProps } from './MayCharacter';
import { updateArticulatedJoints } from '../npc/NPCAnimationController';

/**
 * NPC 02 — TRẦN THỊ LIÊN (1988, Màn 1 & Màn 5 — v5.0 Full 15-Joint Rig)
 * Supports low floor Crawling, ShieldFace when hit by flashlight, LimpWalk,
 * and sudden reaching hand lunge toward camera!
 */
export const LienCharacter: React.FC<CharacterProps> = ({
  state,
  opacity = 1,
  headLookYaw = 0,
  isCulled = false,
  overrideClip = null,
  crawling = false,
  shieldFace = false,
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

  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: '#bfb8aa', roughness: 0.84, transparent: true }),
      tunic: new THREE.MeshStandardMaterial({ color: '#2b2420', roughness: 0.94, transparent: true }),
      pants: new THREE.MeshStandardMaterial({ color: '#141110', roughness: 0.96, transparent: true }),
      hair: new THREE.MeshStandardMaterial({ color: '#080708', roughness: 0.95, transparent: true }),
      hollow: new THREE.MeshStandardMaterial({ color: '#050303', roughness: 0.9, transparent: true }),
    }),
    []
  );

  useFrame((clockState, delta) => {
    const op = Math.max(0, Math.min(1, opacity));
    Object.values(mats).forEach((m) => {
      m.opacity = op;
    });
    if (isCulled || op < 0.02) return;

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
      clockState.clock.elapsedTime,
      delta,
      { overrideClip, limp: true, crawling, shieldFace, headLookYaw }
    );
  });

  return (
    <group ref={hipsRef} name="Hips">
      <group ref={leftLegRef} name="LeftLeg" position={[-0.095, 0.76, 0]}>
        <mesh position={[0, -0.34, 0]} material={mats.pants} castShadow>
          <cylinderGeometry args={[0.072, 0.08, 0.68, 8]} />
        </mesh>
        <mesh name="LeftFoot" position={[0, -0.72, 0.035]} material={mats.skin}>
          <boxGeometry args={[0.075, 0.05, 0.16]} />
        </mesh>
      </group>
      <group ref={rightLegRef} name="RightLeg" position={[0.095, 0.76, 0]}>
        <mesh position={[0, -0.34, 0]} material={mats.pants} castShadow>
          <cylinderGeometry args={[0.072, 0.08, 0.68, 8]} />
        </mesh>
        <mesh name="RightFoot" position={[0, -0.72, 0.035]} material={mats.skin}>
          <boxGeometry args={[0.075, 0.05, 0.16]} />
        </mesh>
      </group>

      <group ref={torsoRef} name="Spine" position={[0, 0.8, 0]}>
        <mesh name="Chest" position={[0, 0.25, 0]} material={mats.tunic} castShadow>
          <cylinderGeometry args={[0.15, 0.14, 0.54, 12]} />
        </mesh>
        <mesh position={[0, -0.04, 0]} material={mats.tunic}>
          <cylinderGeometry args={[0.15, 0.18, 0.22, 12]} />
        </mesh>

        <group ref={headRef} name="Head" position={[0, 0.6, 0.02]}>
          <mesh position={[0, 0.1, 0]} material={mats.skin} castShadow>
            <sphereGeometry args={[0.115, 14, 14]} />
          </mesh>
          <mesh position={[-0.042, 0.11, 0.098]} material={mats.hollow}>
            <sphereGeometry args={[0.023, 8, 8]} />
          </mesh>
          <mesh position={[0.042, 0.11, 0.098]} material={mats.hollow}>
            <sphereGeometry args={[0.023, 8, 8]} />
          </mesh>
          <mesh position={[0, 0.042, 0.098]} material={mats.hollow}>
            <sphereGeometry args={[0.025, 8, 8]} />
          </mesh>
          <group ref={hairRef} position={[0, 0.13, -0.02]}>
            <mesh material={mats.hair}>
              <sphereGeometry args={[0.128, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
            </mesh>
            <mesh position={[0, -0.26, -0.06]} material={mats.hair}>
              <boxGeometry args={[0.27, 0.58, 0.08]} />
            </mesh>
            <mesh position={[-0.075, -0.12, 0.09]} rotation={[0, 0, 0.12]} material={mats.hair}>
              <boxGeometry args={[0.055, 0.34, 0.035]} />
            </mesh>
            <mesh position={[0.08, -0.15, 0.085]} rotation={[0, 0, -0.15]} material={mats.hair}>
              <boxGeometry args={[0.05, 0.38, 0.035]} />
            </mesh>
          </group>
        </group>

        {/* Gaunt Articulated Left Arm -> Forearm -> Long Reaching Hand */}
        <group ref={leftArmRef} name="LeftArm" position={[-0.19, 0.45, 0]}>
          <mesh position={[0, -0.14, 0]} material={mats.tunic} castShadow>
            <cylinderGeometry args={[0.042, 0.044, 0.29, 8]} />
          </mesh>
          <group ref={leftForeArmRef} name="LeftForeArm" position={[0, -0.28, 0]}>
            <mesh position={[0, -0.14, 0]} material={mats.tunic} castShadow>
              <cylinderGeometry args={[0.038, 0.042, 0.28, 8]} />
            </mesh>
            <mesh name="LeftHand" position={[0, -0.32, 0.02]} material={mats.skin}>
              <boxGeometry args={[0.056, 0.15, 0.032]} />
            </mesh>
          </group>
        </group>

        {/* Gaunt Articulated Right Arm -> Forearm -> Long Reaching Hand */}
        <group ref={rightArmRef} name="RightArm" position={[0.19, 0.45, 0]}>
          <mesh position={[0, -0.14, 0]} material={mats.tunic} castShadow>
            <cylinderGeometry args={[0.042, 0.044, 0.29, 8]} />
          </mesh>
          <group ref={rightForeArmRef} name="RightForeArm" position={[0, -0.28, 0]}>
            <mesh position={[0, -0.14, 0]} material={mats.tunic} castShadow>
              <cylinderGeometry args={[0.038, 0.042, 0.28, 8]} />
            </mesh>
            <mesh name="RightHand" position={[0, -0.32, 0.02]} material={mats.skin}>
              <boxGeometry args={[0.056, 0.15, 0.032]} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};
