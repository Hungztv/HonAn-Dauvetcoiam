import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NPCState } from '../npc/NPCStateMachine';
import { updateArticulatedJoints } from '../npc/NPCAnimationController';

export interface CharacterProps {
  state: NPCState;
  opacity?: number;
  headLookYaw?: number;
  isCulled?: boolean;
  isFriendly?: boolean;
}

/**
 * NPC 01 — ĐÀO THỊ MÂY (Cô Gái Áo Đỏ, 1968)
 * Full-body articulated Vietnamese woman in faded torn crimson áo dài,
 * pale sorrowful face, long flowing black hair, bare feet.
 */
export const MayCharacter: React.FC<CharacterProps> = ({
  state,
  opacity = 1,
  headLookYaw = 0,
  isCulled = false,
  isFriendly = false,
}) => {
  const torsoRef = useRef<THREE.Group | null>(null);
  const headRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const leftLegRef = useRef<THREE.Group | null>(null);
  const rightLegRef = useRef<THREE.Group | null>(null);
  const hairRef = useRef<THREE.Group | null>(null);

  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: '#c9c2b4', roughness: 0.78, transparent: true }),
      aoDai: new THREE.MeshStandardMaterial({
        color: isFriendly ? '#7d1e1e' : '#5e0d0d',
        emissive: isFriendly ? '#260808' : '#1c0303',
        roughness: 0.88,
        transparent: true,
        side: THREE.DoubleSide,
      }),
      pants: new THREE.MeshStandardMaterial({ color: '#1b1716', roughness: 0.92, transparent: true }),
      hair: new THREE.MeshStandardMaterial({ color: '#090809', roughness: 0.94, transparent: true }),
      eyeSocket: new THREE.MeshStandardMaterial({ color: '#070405', roughness: 0.9, transparent: true }),
    }),
    [isFriendly]
  );

  useFrame((clockState, delta) => {
    const op = Math.max(0, Math.min(1, opacity));
    Object.values(mats).forEach((m) => {
      m.opacity = op;
    });
    if (isCulled || op < 0.02) return;

    updateArticulatedJoints(
      {
        torso: torsoRef.current,
        head: headRef.current,
        leftArm: leftArmRef.current,
        rightArm: rightArmRef.current,
        leftLeg: leftLegRef.current,
        rightLeg: rightLegRef.current,
        hair: hairRef.current,
      },
      state,
      clockState.clock.elapsedTime,
      delta,
      { headLookYaw }
    );
  });

  return (
    <group>
      {/* Pelvis / Lower Legs & Bare Feet */}
      <group ref={leftLegRef} position={[-0.09, 0.78, 0]}>
        <mesh position={[0, -0.34, 0]} material={mats.pants} castShadow>
          <cylinderGeometry args={[0.068, 0.082, 0.68, 8]} />
        </mesh>
        {/* Bare pale foot */}
        <mesh position={[0, -0.74, 0.04]} material={mats.skin}>
          <boxGeometry args={[0.075, 0.055, 0.17]} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.09, 0.78, 0]}>
        <mesh position={[0, -0.34, 0]} material={mats.pants} castShadow>
          <cylinderGeometry args={[0.068, 0.082, 0.68, 8]} />
        </mesh>
        <mesh position={[0, -0.74, 0.04]} material={mats.skin}>
          <boxGeometry args={[0.075, 0.055, 0.17]} />
        </mesh>
      </group>

      {/* Articulated Torso + Flowing Tattered Red Áo Dài Panels */}
      <group ref={torsoRef} position={[0, 0.82, 0]}>
        {/* Upper bodice */}
        <mesh position={[0, 0.28, 0]} material={mats.aoDai} castShadow>
          <cylinderGeometry args={[0.145, 0.12, 0.54, 12]} />
        </mesh>
        {/* High traditional collar */}
        <mesh position={[0, 0.56, 0]} material={mats.aoDai}>
          <cylinderGeometry args={[0.065, 0.075, 0.08, 10]} />
        </mesh>
        {/* Front & back hanging tattered áo dài panels (Tà áo dài rách nhẹ) */}
        <mesh position={[0, -0.22, 0.11]} rotation={[0.08, 0, 0]} material={mats.aoDai} castShadow>
          <boxGeometry args={[0.29, 0.66, 0.025]} />
        </mesh>
        <mesh position={[0, -0.24, -0.11]} rotation={[-0.08, 0, 0]} material={mats.aoDai} castShadow>
          <boxGeometry args={[0.31, 0.7, 0.025]} />
        </mesh>

        {/* Articulated Head & Sorrowful Pale Face */}
        <group ref={headRef} position={[0, 0.64, 0]}>
          <mesh position={[0, 0.11, 0]} material={mats.skin} castShadow>
            <sphereGeometry args={[0.118, 14, 14]} />
          </mesh>
          {/* Hollow shadowed eyes */}
          <mesh position={[-0.042, 0.12, 0.1]} material={mats.eyeSocket}>
            <sphereGeometry args={[0.022, 8, 8]} />
          </mesh>
          <mesh position={[0.042, 0.12, 0.1]} material={mats.eyeSocket}>
            <sphereGeometry args={[0.022, 8, 8]} />
          </mesh>
          {/* Subtle mouth line */}
          <mesh position={[0, 0.055, 0.105]} material={mats.eyeSocket}>
            <boxGeometry args={[0.045, 0.012, 0.012]} />
          </mesh>
          {/* Long flowing black hair crown & swaying back curtains */}
          <mesh position={[0, 0.15, -0.02]} material={mats.hair}>
            <sphereGeometry args={[0.128, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
          </mesh>
          <group ref={hairRef} position={[0, 0.09, -0.06]}>
            <mesh position={[0, -0.28, -0.03]} material={mats.hair}>
              <boxGeometry args={[0.25, 0.64, 0.07]} />
            </mesh>
            {/* Framing strands beside pale cheeks */}
            <mesh position={[-0.105, -0.18, 0.09]} material={mats.hair}>
              <boxGeometry args={[0.04, 0.42, 0.04]} />
            </mesh>
            <mesh position={[0.105, -0.18, 0.09]} material={mats.hair}>
              <boxGeometry args={[0.04, 0.42, 0.04]} />
            </mesh>
          </group>
        </group>

        {/* Articulated Left Arm & Pale Hand */}
        <group ref={leftArmRef} position={[-0.19, 0.48, 0]}>
          <mesh position={[0, -0.24, 0]} material={mats.aoDai} castShadow>
            <cylinderGeometry args={[0.045, 0.055, 0.5, 8]} />
          </mesh>
          <mesh position={[0, -0.54, 0.02]} material={mats.skin}>
            <boxGeometry args={[0.055, 0.12, 0.035]} />
          </mesh>
        </group>

        {/* Articulated Right Arm & Pale Hand */}
        <group ref={rightArmRef} position={[0.19, 0.48, 0]}>
          <mesh position={[0, -0.24, 0]} material={mats.aoDai} castShadow>
            <cylinderGeometry args={[0.045, 0.055, 0.5, 8]} />
          </mesh>
          <mesh position={[0, -0.54, 0.02]} material={mats.skin}>
            <boxGeometry args={[0.055, 0.12, 0.035]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
