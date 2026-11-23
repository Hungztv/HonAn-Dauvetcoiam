import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterProps } from './MayCharacter';
import { updateArticulatedJoints } from '../npc/NPCAnimationController';

interface FerrymanProps extends CharacterProps {
  isRowing?: boolean;
}

/**
 * NPC 06 — NGƯỜI LÁI ĐÒ / NGUYỄN VĂN KHẢI (Màn 5 & NG+ Màn 1)
 * Gaunt elderly Vietnamese man in weathered dark traditional tunic (áo nâu sẫm),
 * tattered conical hat (nón lá rách) shadowing his face, gripping a wooden ferry oar.
 */
export const FerrymanCharacter: React.FC<FerrymanProps> = ({
  state,
  opacity = 1,
  headLookYaw = 0,
  isCulled = false,
  isRowing = false,
  overrideClip = null,
}) => {
  const torsoRef = useRef<THREE.Group | null>(null);
  const headRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const leftLegRef = useRef<THREE.Group | null>(null);
  const rightLegRef = useRef<THREE.Group | null>(null);
  const oarRef = useRef<THREE.Group | null>(null);

  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: '#9c8a74', roughness: 0.85, transparent: true }),
      tunic: new THREE.MeshStandardMaterial({ color: '#2b1e15', roughness: 0.94, transparent: true }),
      pants: new THREE.MeshStandardMaterial({ color: '#17120e', roughness: 0.96, transparent: true }),
      hat: new THREE.MeshStandardMaterial({ color: '#6b5637', roughness: 0.96, transparent: true }),
      wood: new THREE.MeshStandardMaterial({ color: '#3b2416', roughness: 0.88, transparent: true }),
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
        torso: torsoRef.current,
        head: headRef.current,
        leftArm: leftArmRef.current,
        rightArm: rightArmRef.current,
        leftLeg: leftLegRef.current,
        rightLeg: rightLegRef.current,
        oar: oarRef.current,
      },
      state,
      clockState.clock.elapsedTime,
      delta,
      { rowing: isRowing && state !== 'Jumpscaring', headLookYaw, overrideClip }
    );
  });

  return (
    <group>
      <group ref={leftLegRef} position={[-0.095, 0.8, 0]}>
        <mesh position={[0, -0.36, 0]} material={mats.pants} castShadow>
          <cylinderGeometry args={[0.068, 0.072, 0.72, 8]} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.095, 0.8, 0]}>
        <mesh position={[0, -0.36, 0]} material={mats.pants} castShadow>
          <cylinderGeometry args={[0.068, 0.072, 0.72, 8]} />
        </mesh>
      </group>

      <group ref={torsoRef} position={[0, 0.84, 0]}>
        {/* Gaunt elderly shoulders & tunic */}
        <mesh position={[0, 0.29, 0]} material={mats.tunic} castShadow>
          <cylinderGeometry args={[0.155, 0.145, 0.58, 10]} />
        </mesh>
        {/* Draped faded scarf around shoulders */}
        <mesh position={[0, 0.54, 0.02]} material={mats.hat}>
          <torusGeometry args={[0.14, 0.032, 6, 14]} />
        </mesh>

        {/* Shadowed Head under Tattered Conical Hat (Nón lá rách) */}
        <group ref={headRef} position={[0, 0.64, 0.02]}>
          <mesh position={[0, 0.11, 0]} material={mats.skin} castShadow>
            <sphereGeometry args={[0.118, 12, 12]} />
          </mesh>
          <mesh position={[0, 0.24, 0]} rotation={[0.1, 0, 0]} material={mats.hat} castShadow>
            <coneGeometry args={[0.45, 0.24, 18]} />
          </mesh>
        </group>

        <group ref={leftArmRef} position={[-0.19, 0.48, 0]}>
          <mesh position={[0, -0.25, 0]} material={mats.tunic} castShadow>
            <cylinderGeometry args={[0.045, 0.048, 0.52, 8]} />
          </mesh>
          <mesh position={[0, -0.54, 0.02]} material={mats.skin}>
            <boxGeometry args={[0.055, 0.1, 0.035]} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.19, 0.48, 0]}>
          <mesh position={[0, -0.25, 0]} material={mats.tunic} castShadow>
            <cylinderGeometry args={[0.045, 0.048, 0.52, 8]} />
          </mesh>
          <mesh position={[0, -0.54, 0.02]} material={mats.skin}>
            <boxGeometry args={[0.055, 0.1, 0.035]} />
          </mesh>
        </group>

        {/* Articulated Wooden Ferry Oar */}
        {isRowing && (
          <group ref={oarRef} position={[0.22, 0.12, 0.35]} rotation={[0.35, 0, -0.18]}>
            <mesh material={mats.wood} castShadow>
              <cylinderGeometry args={[0.028, 0.032, 2.35, 8]} />
            </mesh>
            <mesh position={[0, -1.12, 0]} material={mats.wood}>
              <boxGeometry args={[0.16, 0.46, 0.03]} />
            </mesh>
          </group>
        )}
      </group>
    </group>
  );
};
