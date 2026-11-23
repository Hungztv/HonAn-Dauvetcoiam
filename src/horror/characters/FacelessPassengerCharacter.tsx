import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterProps } from './MayCharacter';
import { updateArticulatedJoints } from '../npc/NPCAnimationController';

interface PassengerProps extends CharacterProps {
  /** 0: 1988 Liên, 1: 1968 Mây, 2: 1978 Song sinh, 3: 1958 Ông Từ */
  variantIndex?: number;
  isStanding?: boolean;
}

const PASSENGER_PALETTES = [
  { robe: '#26201c', accent: '#3d332c', scale: 1.0, hat: false }, // 1988 Trần Thị Liên
  { robe: '#611010', accent: '#801717', scale: 0.98, hat: false }, // 1968 Đào Thị Mây
  { robe: '#3b3730', accent: '#544d42', scale: 0.72, hat: false }, // 1978 Đứa trẻ song sinh
  { robe: '#2b1d15', accent: '#9e7a34', scale: 1.03, hat: true }, // 1958 Ông Từ giữ đình
];

/**
 * NPC 05 — BỐN HÀNH KHÁCH KHÔNG KHUÔN MẶT (Màn 5)
 * Each passenger has a distinct canonical outfit & height, smooth pale blank face,
 * starts sitting silently on the ferryboat benches, turns head on clues,
 * and all 4 stand simultaneously once the ferry chain is unlocked!
 */
export const FacelessPassengerCharacter: React.FC<PassengerProps> = ({
  state,
  opacity = 1,
  headLookYaw = 0,
  isCulled = false,
  variantIndex = 0,
  isStanding = false,
}) => {
  const rootRef = useRef<THREE.Group | null>(null);
  const torsoRef = useRef<THREE.Group | null>(null);
  const headRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const leftLegRef = useRef<THREE.Group | null>(null);
  const rightLegRef = useRef<THREE.Group | null>(null);

  const pal = PASSENGER_PALETTES[variantIndex % PASSENGER_PALETTES.length];

  const mats = useMemo(
    () => ({
      blankFace: new THREE.MeshStandardMaterial({ color: '#d4cab6', roughness: 0.72, transparent: true }),
      robe: new THREE.MeshStandardMaterial({ color: pal.robe, roughness: 0.9, transparent: true }),
      accent: new THREE.MeshStandardMaterial({ color: pal.accent, roughness: 0.82, transparent: true }),
      hat: new THREE.MeshStandardMaterial({ color: '#6b5739', roughness: 0.94, transparent: true }),
    }),
    [pal.robe, pal.accent]
  );

  useFrame((clockState, delta) => {
    const op = Math.max(0, Math.min(1, opacity));
    Object.values(mats).forEach((m) => {
      m.opacity = op;
    });
    if (isCulled || op < 0.02) return;

    // Smooth vertical stand-up transition from seated boat bench!
    if (rootRef.current) {
      const targetY = isStanding ? 0 : -0.34;
      rootRef.current.position.y = THREE.MathUtils.lerp(
        rootRef.current.position.y,
        targetY,
        Math.min(1, delta * 3.8)
      );
    }

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
      { sitting: !isStanding, headLookYaw }
    );
  });

  return (
    <group ref={rootRef} scale={pal.scale}>
      <group ref={leftLegRef} position={[-0.095, 0.76, 0]}>
        <mesh position={[0, -0.34, 0]} material={mats.robe} castShadow>
          <cylinderGeometry args={[0.072, 0.078, 0.68, 8]} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.095, 0.76, 0]}>
        <mesh position={[0, -0.34, 0]} material={mats.robe} castShadow>
          <cylinderGeometry args={[0.072, 0.078, 0.68, 8]} />
        </mesh>
      </group>

      <group ref={torsoRef} position={[0, 0.8, 0]}>
        <mesh position={[0, 0.28, 0]} material={mats.robe} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 0.58, 10]} />
        </mesh>
        <mesh position={[0, 0.32, 0.15]} material={mats.accent}>
          <boxGeometry args={[0.12, 0.42, 0.03]} />
        </mesh>

        {/* Smooth Blank Faceless Head */}
        <group ref={headRef} position={[0, 0.64, 0]}>
          <mesh position={[0, 0.11, 0]} material={mats.blankFace} castShadow>
            <sphereGeometry args={[0.125, 14, 14]} />
          </mesh>
          {pal.hat && (
            <mesh position={[0, 0.24, 0]} material={mats.hat} castShadow>
              <coneGeometry args={[0.38, 0.2, 16]} />
            </mesh>
          )}
        </group>

        <group ref={leftArmRef} position={[-0.21, 0.48, 0]}>
          <mesh position={[0, -0.24, 0]} material={mats.robe} castShadow>
            <cylinderGeometry args={[0.048, 0.06, 0.5, 8]} />
          </mesh>
          <mesh position={[0, -0.52, 0.02]} material={mats.blankFace}>
            <boxGeometry args={[0.055, 0.1, 0.035]} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.21, 0.48, 0]}>
          <mesh position={[0, -0.24, 0]} material={mats.robe} castShadow>
            <cylinderGeometry args={[0.048, 0.06, 0.5, 8]} />
          </mesh>
          <mesh position={[0, -0.52, 0.02]} material={mats.blankFace}>
            <boxGeometry args={[0.055, 0.1, 0.035]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
