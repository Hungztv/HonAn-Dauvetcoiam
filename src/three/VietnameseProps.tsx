import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vec3 } from '../types/game';
import {
  createCalligraphyTexture,
  createHoanhPhiTexture,
  getWorldMaterial,
} from './proceduralTextures';
import {
  AnimatedWater,
  GroundMist,
  IncenseSmoke,
  InstancedRain,
  NightMoon,
} from './AtmosphericEffects';
import { Level1HouseBenchmark } from './Level1Benchmark';

/** Traditional Vietnamese Hoành Phi (horizontal plaque) + Câu Đối (vertical couplets) */
const AltarCalligraphySet: React.FC<{
  position: Vec3;
  title: string;
  leftCouplet: string;
  rightCouplet: string;
  width?: number;
}> = ({ position, title, leftCouplet, rightCouplet, width = 3.2 }) => {
  const plaqueTex = useMemo(() => createHoanhPhiTexture(title), [title]);
  const leftTex = useMemo(() => createCalligraphyTexture(leftCouplet, '#591010', '#e3b84f'), [leftCouplet]);
  const rightTex = useMemo(() => createCalligraphyTexture(rightCouplet, '#591010', '#e3b84f'), [rightCouplet]);
  const goldMat = useMemo(() => getWorldMaterial('gold'), []);

  return (
    <group position={position}>
      <group position={[0, 2.55, 0]}>
        <mesh castShadow>
          <boxGeometry args={[2.35, 0.78, 0.08]} />
          <meshStandardMaterial map={plaqueTex} roughness={0.45} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.41, 0]} material={goldMat}>
          <boxGeometry args={[2.44, 0.05, 0.1]} />
        </mesh>
        <mesh position={[0, -0.41, 0]} material={goldMat}>
          <boxGeometry args={[2.44, 0.05, 0.1]} />
        </mesh>
      </group>

      <mesh position={[-width / 2, 1.45, 0.08]}>
        <boxGeometry args={[0.38, 2.2, 0.06]} />
        <meshStandardMaterial map={leftTex} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[width / 2, 1.45, 0.08]}>
        <boxGeometry args={[0.38, 2.2, 0.06]} />
        <meshStandardMaterial map={rightTex} roughness={0.5} metalness={0.2} />
      </mesh>

      {[-1.1, 1.1].map((x, idx) => (
        <group key={idx} position={[x, 0.62, 0.18]}>
          <mesh material={goldMat} castShadow>
            <cylinderGeometry args={[0.04, 0.09, 0.34, 12]} />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 0.16, 8]} />
            <meshStandardMaterial color="#b91c1c" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.35, 0]}>
            <sphereGeometry args={[0.032, 8, 8]} />
            <meshStandardMaterial color="#ffdd7a" emissive="#ff7b1a" emissiveIntensity={3.0} />
          </mesh>
        </group>
      ))}

      <IncenseSmoke position={[0, 0.75, 0.25]} />
    </group>
  );
};

/** Exposed Traditional Vietnamese Wooden Roof Rafters & Crossbeams (Vì Kèo Gỗ Lim) */
const WoodenRoofTrusses: React.FC<{
  zPositions: number[];
  spanWidth: number;
  height: number;
}> = ({ zPositions, spanWidth, height }) => {
  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  return (
    <group>
      {zPositions.map((z, i) => (
        <group key={i} position={[0, height, z]}>
          <mesh material={woodMat} castShadow>
            <boxGeometry args={[spanWidth, 0.24, 0.24]} />
          </mesh>
          <mesh position={[0, 0.38, 0]} material={woodMat}>
            <boxGeometry args={[0.2, 0.65, 0.2]} />
          </mesh>
          <mesh position={[0, 0.52, 0]} material={woodMat}>
            <boxGeometry args={[spanWidth * 0.55, 0.18, 0.18]} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

/** Sculpted Round Ancient Stone Well with Wooden A-Frame Winch & Animated Reflective Water */
const SculptedStoneWell: React.FC<{ position: Vec3; radius?: number; showBasket?: boolean }> = ({
  position,
  radius = 1.26,
  showBasket = false,
}) => {
  const stoneMat = useMemo(() => getWorldMaterial('stone'), []);
  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  const metalMat = useMemo(() => getWorldMaterial('metal'), []);

  return (
    <group position={position}>
      <mesh position={[0, 0.52, 0]} material={stoneMat} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 1.08, 1.04, 20, 1, true]} />
      </mesh>
      <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={stoneMat} castShadow>
        <torusGeometry args={[radius * 0.96, 0.14, 10, 24]} />
      </mesh>
      <mesh position={[-radius * 0.92, 1.65, 0]} material={woodMat} castShadow>
        <cylinderGeometry args={[0.075, 0.085, 2.2, 8]} />
      </mesh>
      <mesh position={[radius * 0.92, 1.65, 0]} material={woodMat} castShadow>
        <cylinderGeometry args={[0.075, 0.085, 2.2, 8]} />
      </mesh>
      <mesh position={[0, 2.35, 0]} rotation={[0, 0, Math.PI / 2]} material={woodMat}>
        <cylinderGeometry args={[0.06, 0.06, radius * 2.1, 10]} />
      </mesh>
      <mesh position={[0, 2.25, 0]} material={metalMat}>
        <torusGeometry args={[0.14, 0.03, 8, 16]} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 1.9, 6]} />
        <meshStandardMaterial color="#614e36" roughness={0.95} />
      </mesh>
      {/* Narrative v3.1 Prop: Bamboo Basket (Chiếc giỏ tre 1978) near well rim */}
      {showBasket && (
        <group position={[radius * 1.18, 0.24, 0.65]} rotation={[0.18, 0.4, 0.22]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.32, 0.22, 0.42, 12, 1, true]} />
            <meshStandardMaterial color="#7c5d36" roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, -0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.22, 12]} />
            <meshStandardMaterial color="#634828" roughness={0.96} />
          </mesh>
        </group>
      )}
      <AnimatedWater position={[0, 0.35, 0]} size={[radius * 1.75, radius * 1.75]} tint="#050d10" />
    </group>
  );
};

/**
 * GPU-Instanced Swaying Bamboo Grove (Only 2 draw calls total for dozens of bamboo culms & leaves!)
 */
const SwayingBambooGrove: React.FC<{ positions: Vec3[] }> = ({ positions }) => {
  const stalkMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const leafMeshRef = useRef<THREE.InstancedMesh | null>(null);
  const bambooMat = useMemo(() => getWorldMaterial('bamboo'), []);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const stalks = useMemo(() => {
    const out: { x: number; z: number; tiltX: number; tiltZ: number; scaleY: number; phase: number }[] = [];
    const offsets = [
      [0, 0],
      [0.36, 0.22],
      [-0.28, 0.3],
      [0.14, -0.34],
    ];
    positions.forEach((p, gIdx) => {
      offsets.forEach(([ox, oz], cIdx) => {
        out.push({
          x: p[0] + ox,
          z: p[2] + oz,
          tiltX: (cIdx % 2 === 0 ? 1 : -1) * 0.04,
          tiltZ: ((cIdx - 1.5) * 0.03),
          scaleY: 0.88 + ((gIdx + cIdx) % 4) * 0.1,
          phase: gIdx * 1.1 + cIdx * 0.7,
        });
      });
    });
    return out;
  }, [positions]);

  useEffect(() => {
    return () => {
      stalkMeshRef.current?.geometry.dispose();
      leafMeshRef.current?.geometry.dispose();
    };
  }, []);

  useFrame((state) => {
    if (!stalkMeshRef.current || !leafMeshRef.current) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < stalks.length; i++) {
      const s = stalks[i];
      const swayZ = s.tiltZ + Math.sin(t * 0.9 + s.phase) * 0.034;
      const swayX = s.tiltX + Math.cos(t * 0.7 + s.phase) * 0.022;

      dummy.position.set(s.x, 3.1 * s.scaleY, s.z);
      dummy.rotation.set(swayX, i * 0.6, swayZ);
      dummy.scale.set(1, s.scaleY, 1);
      dummy.updateMatrix();
      stalkMeshRef.current.setMatrixAt(i, dummy.matrix);

      dummy.position.set(s.x + swayZ * 2.2, 4.9 * s.scaleY, s.z + swayX * 2.2);
      dummy.rotation.set(swayX, i * 1.2, swayZ);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      leafMeshRef.current.setMatrixAt(i, dummy.matrix);
    }
    stalkMeshRef.current.instanceMatrix.needsUpdate = true;
    leafMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (stalks.length === 0) return null;

  return (
    <group>
      <instancedMesh ref={stalkMeshRef} args={[undefined, undefined, stalks.length]} material={bambooMat} castShadow>
        <cylinderGeometry args={[0.062, 0.092, 6.2, 7]} />
      </instancedMesh>
      <instancedMesh ref={leafMeshRef} args={[undefined, undefined, stalks.length]}>
        <coneGeometry args={[0.92, 1.55, 6]} />
        <meshStandardMaterial color="#192915" roughness={0.92} />
      </instancedMesh>
    </group>
  );
};

/** Sculpted Banyan Tree Canopy & Aerial Roots (Cây Đa Cổ Thụ) */
const AncientBanyanCanopy: React.FC<{ position: Vec3 }> = ({ position }) => {
  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  return (
    <group position={position}>
      <mesh position={[0, 4.6, 0]} castShadow>
        <dodecahedronGeometry args={[3.4, 1]} />
        <meshStandardMaterial color="#152113" roughness={0.95} />
      </mesh>
      <mesh position={[1.6, 4.1, 1.0]}>
        <dodecahedronGeometry args={[2.2, 1]} />
        <meshStandardMaterial color="#182615" roughness={0.95} />
      </mesh>
      {[-1.4, -0.7, 0.9, 1.5].map((x, idx) => (
        <mesh key={idx} position={[x, 2.1, 0.9 - (idx % 2) * 0.6]} material={woodMat}>
          <cylinderGeometry args={[0.04, 0.07, 4.2, 6]} />
        </mesh>
      ))}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.98, 0.98, 0.35, 12]} />
        <meshStandardMaterial color="#6e1111" roughness={0.88} />
      </mesh>
    </group>
  );
};

/** Detailed Ferryboat canopy ribs, bow searchlight & yellow phone booth on Dam Road for Level 5 (64x64m) */
const FerryboatDetails: React.FC = () => {
  const woodMat = useMemo(() => getWorldMaterial('metal'), []);
  return (
    <group>
      {/* Steel Ferry Canopy Ribs centered on the moored ferry at [0, 0.1, -19.0] */}
      <group position={[0, 0.1, -19.0]}>
        {[-4.2, -1.4, 1.4, 4.2].map((z, idx) => (
          <mesh key={idx} position={[0, 2.5, z]} material={woodMat}>
            <torusGeometry args={[4.4, 0.08, 8, 20, Math.PI]} />
          </mesh>
        ))}
        <mesh position={[0, 2.3, -6.2]}>
          <sphereGeometry args={[0.24, 12, 12]} />
          <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={3.4} />
        </mesh>
      </group>
      {/* Iconic 2000s Yellow Public Phone Booth Frame at [-6.5, 0, 20.5] */}
      <group position={[-6.5, 0, 20.5]}>
        <mesh position={[0, 2.25, 0]}>
          <boxGeometry args={[1.35, 0.22, 1.35]} />
          <meshStandardMaterial color="#eab308" emissive="#ca8a04" emissiveIntensity={0.45} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
};

/** Renders handcrafted 2000s Vietnamese atmospheric setpieces across the 56x56m - 64x64m maps */
export const VietnameseLevelSetpieces: React.FC<{ levelId: number }> = ({ levelId }) => {
  return (
    <group>
      {levelId === 1 && (
        <>
          <IncenseSmoke position={[0, 1.28, 2.5]} />
          <InstancedRain area={54} height={12} />
          <GroundMist color="#7a8b99" opacity={0.22} y={0.25} spread={48} />
          <NightMoon position={[-22, 28, -42]} color="#dce7f5" />
        </>
      )}

      {levelId === 2 && (
        <>
          <AncientBanyanCanopy position={[-6.2, 0, 14.5]} />
          <SwayingBambooGrove
            positions={[
              [-26, 0, 10],
              [-24, 0, -14],
              [26, 0, 10],
              [24, 0, -14],
              [-15, 0, 26],
              [15, 0, 26],
              [-16, 0, -24],
              [16, 0, -24],
            ]}
          />
          <InstancedRain area={58} height={12} />
          <GroundMist color="#a37a82" opacity={0.25} y={0.3} spread={52} />
          <NightMoon position={[-18, 28, -44]} color="#f0d5d8" />
        </>
      )}

      {levelId === 3 && (
        <>
          <SculptedStoneWell position={[0, 0, 0]} radius={1.65} showBasket />
          <SwayingBambooGrove
            positions={[
              [-12, 0, 14],
              [12, 0, 14],
              [-12, 0, 24],
              [12, 0, 24],
              [-28, 0, -12],
              [28, 0, -12],
            ]}
          />
          <InstancedRain area={60} height={12} />
          <GroundMist color="#7e949c" opacity={0.28} y={0.28} spread={54} />
          <NightMoon position={[22, 30, -45]} />
        </>
      )}

      {levelId === 4 && (
        <>
          <AltarCalligraphySet
            position={[0, 1.1, -13.6]}
            title="RẠP CHIẾU BÓNG LÂM VIÊN"
            leftCouplet="ÁNH ĐÈN MÀN BẠC PHAI NĂM THÁNG"
            rightCouplet="SÓNG NGẦM ĐỒI BẮC GIỮ CHÂN TƯỚNG"
            width={5.4}
          />
          <WoodenRoofTrusses zPositions={[-11.5, -5.5, 0.5, 6.5, 11.0]} spanWidth={34} height={4.8} />
          <GroundMist color="#9c8a78" opacity={0.2} y={0.24} spread={48} />
          <NightMoon position={[0, 30, 46]} color="#e2dcd3" />
        </>
      )}

      {levelId === 5 && (
        <>
          <AnimatedWater position={[0, -0.24, -10.5]} size={[66, 44]} tint="#051117" />
          <FerryboatDetails />
          <SwayingBambooGrove
            positions={[
              [-28, 0, 24],
              [-24, 0, 28],
              [28, 0, 24],
              [24, 0, 28],
            ]}
          />
          <InstancedRain area={62} height={13} />
          <GroundMist color="#8ca5b2" opacity={0.34} y={0.35} spread={56} />
          <NightMoon position={[0, 26, -48]} color="#dce8f5" />
        </>
      )}
    </group>
  );
};
