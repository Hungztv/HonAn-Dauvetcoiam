import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterProps } from './MayCharacter';
import { updateArticulatedJoints } from '../npc/NPCAnimationController';

/**
 * NPC 03 — HỒN ĐỨA TRẺ DƯỚI GIẾNG (1978, Màn 3)
 * Respectful, haunting small child silhouette (~0.96m) in wet mud-stained simple cloth.
 * Slowly rises from the dark well water with small hands gripping the stone rim,
 * turns its head toward the player, then sinks silently beneath the water.
 * Zero graphic violence.
 */
export const ChildSpiritCharacter: React.FC<CharacterProps> = ({
  state,
  opacity = 1,
  headLookYaw = 0,
  isCulled = false,
}) => {
  const rootRef = useRef<THREE.Group | null>(null);
  const torsoRef = useRef<THREE.Group | null>(null);
  const headRef = useRef<THREE.Group | null>(null);
  const leftArmRef = useRef<THREE.Group | null>(null);
  const rightArmRef = useRef<THREE.Group | null>(null);
  const leftLegRef = useRef<THREE.Group | null>(null);
  const rightLegRef = useRef<THREE.Group | null>(null);

  const mats = useMemo(
    () => ({
      skin: new THREE.MeshStandardMaterial({ color: '#b4bdbd', roughness: 0.48, metalness: 0.08, transparent: true }),
      cloth: new THREE.MeshStandardMaterial({ color: '#433e36', roughness: 0.65, transparent: true }),
      hair: new THREE.MeshStandardMaterial({ color: '#0d0d0e', roughness: 0.72, transparent: true }),
      eyes: new THREE.MeshStandardMaterial({ color: '#08090b', roughness: 0.9, transparent: true }),
    }),
    []
  );

  useFrame((clockState, delta) => {
    const op = Math.max(0, Math.min(1, opacity));
    Object.values(mats).forEach((m) => {
      m.opacity = op;
    });
    if (isCulled || op < 0.02) return;

    const t = clockState.clock.elapsedTime;
    // Slow eerie vertical emergence / floating over the well water
    if (rootRef.current) {
      const targetY =
        state === 'Jumpscaring' || state === 'Approaching'
          ? 0.65 + Math.sin(t * 2.4) * 0.04
          : state === 'Observing'
          ? 0.28 + Math.sin(t * 1.4) * 0.06
          : -0.35;
      rootRef.current.position.y = THREE.MathUtils.lerp(
        rootRef.current.position.y,
        targetY,
        Math.min(1, delta * 3.5)
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
      t,
      delta,
      { headLookYaw }
    );
  });

  return (
    <group ref={rootRef} scale={0.62}>
      <group ref={leftLegRef} position={[-0.085, 0.66, 0]}>
        <mesh position={[0, -0.28, 0]} material={mats.cloth}>
          <cylinderGeometry args={[0.06, 0.055, 0.54, 8]} />
        </mesh>
        <mesh position={[0, -0.58, 0.03]} material={mats.skin}>
          <boxGeometry args={[0.065, 0.045, 0.13]} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.085, 0.66, 0]}>
        <mesh position={[0, -0.28, 0]} material={mats.cloth}>
          <cylinderGeometry args={[0.06, 0.055, 0.54, 8]} />
        </mesh>
        <mesh position={[0, -0.58, 0.03]} material={mats.skin}>
          <boxGeometry args={[0.065, 0.045, 0.13]} />
        </mesh>
      </group>

      <group ref={torsoRef} position={[0, 0.7, 0]}>
        <mesh position={[0, 0.24, 0]} material={mats.cloth} castShadow>
          <cylinderGeometry args={[0.145, 0.165, 0.5, 10]} />
        </mesh>

        <group ref={headRef} position={[0, 0.56, 0]}>
          <mesh position={[0, 0.12, 0]} material={mats.skin} castShadow>
            <sphereGeometry args={[0.13, 14, 14]} />
          </mesh>
          <mesh position={[0, 0.15, -0.01]} material={mats.hair}>
            <sphereGeometry args={[0.136, 12, 12, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
          </mesh>
          <mesh position={[-0.045, 0.13, 0.112]} material={mats.eyes}>
            <sphereGeometry args={[0.018, 8, 8]} />
          </mesh>
          <mesh position={[0.045, 0.13, 0.112]} material={mats.eyes}>
            <sphereGeometry args={[0.018, 8, 8]} />
          </mesh>
        </group>

        <group ref={leftArmRef} position={[-0.18, 0.42, 0]}>
          <mesh position={[0, -0.2, 0]} material={mats.cloth}>
            <cylinderGeometry args={[0.042, 0.045, 0.42, 8]} />
          </mesh>
          <mesh position={[0, -0.45, 0.02]} material={mats.skin}>
            <boxGeometry args={[0.05, 0.1, 0.032]} />
          </mesh>
        </group>
        <group ref={rightArmRef} position={[0.18, 0.42, 0]}>
          <mesh position={[0, -0.2, 0]} material={mats.cloth}>
            <cylinderGeometry args={[0.042, 0.045, 0.42, 8]} />
          </mesh>
          <mesh position={[0, -0.45, 0.02]} material={mats.skin}>
            <boxGeometry args={[0.05, 0.1, 0.032]} />
          </mesh>
        </group>
      </group>
    </group>
  );
};
