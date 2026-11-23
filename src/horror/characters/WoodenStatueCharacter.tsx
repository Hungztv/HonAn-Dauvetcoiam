import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterProps } from './MayCharacter';
import { updateArticulatedJoints } from '../npc/NPCAnimationController';

interface StatueCharacterProps extends CharacterProps {
  /** True when the player is looking directly at this statue -> freezes completely! */
  isFrozenByGaze?: boolean;
}

/**
 * NPC 04 — BỐN TƯỢNG QUAN GỖ ĐÌNH LÀNG (1958, Màn 4)
 * Full sculpted wooden guardian statue on stepped pedestal with mandarinal hat,
 * carved vermilion-gold armor robe, articulated arms, legs, and staring wooden head.
 * Freezes rigid when watched; subtly shifts pose/head & advances ONLY when looked away.
 */
export const WoodenStatueCharacter: React.FC<StatueCharacterProps> = ({
  state,
  opacity = 1,
  headLookYaw = 0,
  isCulled = false,
  isFrozenByGaze = false,
  overrideClip = null,
}) => {
  const torsoRef = useRef<THREE.Group | null>(null);
  const headRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const leftLegRef = useRef<THREE.Group | null>(null);
  const rightLegRef = useRef<THREE.Group | null>(null);

  const mats = useMemo(
    () => ({
      pedestal: new THREE.MeshStandardMaterial({ color: '#332015', roughness: 0.88 }),
      robe: new THREE.MeshStandardMaterial({ color: '#5c1914', roughness: 0.65, metalness: 0.12 }),
      goldTrim: new THREE.MeshStandardMaterial({ color: '#b58d38', roughness: 0.38, metalness: 0.72 }),
      carvedWood: new THREE.MeshStandardMaterial({ color: '#a37f52', roughness: 0.64 }),
      hat: new THREE.MeshStandardMaterial({ color: '#1a110d', roughness: 0.76 }),
      eye: new THREE.MeshStandardMaterial({ color: '#0c0706', roughness: 0.4 }),
    }),
    []
  );

  useFrame((clockState, delta) => {
    if (isCulled || opacity < 0.02) return;
    // Weeping-Angel rule: freeze completely still while player observes it (unless active jumpscare or debug clip!)
    if (isFrozenByGaze && state !== 'Jumpscaring' && !overrideClip) return;

    updateArticulatedJoints(
      {
        torso: torsoRef.current,
        head: headRef.current,
        leftArm: leftArmRef.current,
        rightArm: rightArmRef.current,
        leftLeg: leftLegRef.current,
        rightLeg: rightLegRef.current,
      },
      state,
      clockState.clock.elapsedTime,
      delta,
      { headLookYaw, overrideClip }
    );
  });

  return (
    <group>
      {/* Low wooden base plinth */}
      <mesh position={[0, 0.12, 0]} material={mats.pedestal} castShadow receiveShadow>
        <boxGeometry args={[0.74, 0.24, 0.74]} />
      </mesh>

      {/* Carved Boots / Legs */}
      <group ref={leftLegRef} position={[-0.12, 0.86, 0]}>
        <mesh position={[0, -0.32, 0]} material={mats.hat} castShadow>
          <cylinderGeometry args={[0.085, 0.095, 0.62, 8]} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.12, 0.86, 0]}>
        <mesh position={[0, -0.32, 0]} material={mats.hat} castShadow>
          <cylinderGeometry args={[0.085, 0.095, 0.62, 8]} />
        </mesh>
      </group>

      {/* Sculpted Guardian Torso & Lacquered Robe */}
      <group ref={torsoRef} position={[0, 0.9, 0]}>
        <mesh position={[0, 0.34, 0]} material={mats.robe} castShadow>
          <cylinderGeometry args={[0.23, 0.28, 0.76, 10]} />
        </mesh>
        {/* Gold imperial chest plaque (Bổ tử) */}
        <mesh position={[0, 0.42, 0.23]} material={mats.goldTrim}>
          <boxGeometry args={[0.22, 0.22, 0.03]} />
        </mesh>
        {/* Gold ceremonial belt */}
        <mesh position={[0, 0.14, 0]} material={mats.goldTrim}>
          <cylinderGeometry args={[0.275, 0.28, 0.07, 10]} />
        </mesh>

        {/* Carved Wooden Head & Mandarinal Hat (Mũ Cánh Chuồn) */}
        <group ref={headRef} position={[0, 0.82, 0]}>
          <mesh position={[0, 0.12, 0]} material={mats.carvedWood} castShadow>
            <sphereGeometry args={[0.165, 14, 14]} />
          </mesh>
          {/* Painted staring dark eyes */}
          <mesh position={[-0.06, 0.13, 0.148]} material={mats.eye}>
            <sphereGeometry args={[0.024, 8, 8]} />
          </mesh>
          <mesh position={[0.06, 0.13, 0.148]} material={mats.eye}>
            <sphereGeometry args={[0.024, 8, 8]} />
          </mesh>
          {/* Carved frown */}
          <mesh position={[0, 0.045, 0.15]} material={mats.eye}>
            <boxGeometry args={[0.08, 0.016, 0.015]} />
          </mesh>
          {/* Mandarinal Hat + Wings */}
          <mesh position={[0, 0.28, 0]} material={mats.hat} castShadow>
            <cylinderGeometry args={[0.18, 0.16, 0.18, 10]} />
          </mesh>
          <mesh position={[0, 0.24, -0.02]} material={mats.hat}>
            <boxGeometry args={[0.64, 0.05, 0.06]} />
          </mesh>
        </group>

        {/* Wide Ceremonial Sleeves & Wooden Hands */}
        <group ref={leftArmRef} position={[-0.29, 0.56, 0]}>
          <mesh position={[0, -0.25, 0]} material={mats.robe} castShadow>
            <cylinderGeometry args={[0.075, 0.11, 0.54, 8]} />
          </mesh>
          <mesh position={[0, -0.55, 0.02]} material={mats.carvedWood}>
            <boxGeometry args={[0.08, 0.12, 0.06]} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.29, 0.56, 0]}>
          <mesh position={[0, -0.25, 0]} material={mats.robe} castShadow>
            <cylinderGeometry args={[0.075, 0.11, 0.54, 8]} />
          </mesh>
          <mesh position={[0, -0.55, 0.02]} material={mats.carvedWood}>
            <boxGeometry args={[0.08, 0.12, 0.06]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
