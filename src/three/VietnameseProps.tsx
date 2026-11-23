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

/** Detailed Ferryboat curved canopy ribs, prow finial & hanging lanterns for Level 5 */
const FerryboatDetails: React.FC = () => {
  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  return (
    <group position={[0, 0.1, -7.8]}>
      {[-1.8, -0.6, 0.6, 1.8].map((z, idx) => (
        <mesh key={idx} position={[0, 2.2, z]} material={woodMat}>
          <torusGeometry args={[2.45, 0.06, 8, 20, Math.PI]} />
        </mesh>
      ))}
      <mesh position={[2.25, 0.95, 1.2]} rotation={[0.25, 0, -0.15]} material={woodMat}>
        <cylinderGeometry args={[0.045, 0.055, 4.6, 8]} />
      </mesh>
      <mesh position={[0, 1.95, -3.5]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={3.2} />
      </mesh>
    </group>
  );
};

/** Renders Unity-grade handcrafted Vietnamese architectural & atmospheric setpieces per level */
export const VietnameseLevelSetpieces: React.FC<{ levelId: number }> = ({ levelId }) => {
  return (
    <group>
      {levelId === 1 && <Level1HouseBenchmark />}

      {levelId === 2 && (
        <>
          <AltarCalligraphySet
            position={[0, 0.55, -9.9]}
            title="LINH MIẾU CÔ ĐỎ"
            leftCouplet="ÁO ĐỎ RỪNG TRE SƯƠNG LẠNH BUỐT"
            rightCouplet="OAN HỒN LỆ RƠI ĐỢI GIẢI OAN"
            width={4.0}
          />
          <WoodenRoofTrusses zPositions={[-8.8, -5.2, -2.2]} spanWidth={10} height={3.55} />
          <AncientBanyanCanopy position={[-6.8, 0, 2.8]} />
          <SwayingBambooGrove
            positions={[
              [-9.2, 0, -2.5],
              [-8.0, 0, 5.8],
              [-4.5, 0, 7.2],
              [7.2, 0, 1.5],
              [6.2, 0, 5.5],
              [8.8, 0, -2.8],
              [4.8, 0, 8.2],
              [-7.5, 0, -7.2],
              [7.5, 0, -7.2],
              [-10.2, 0, 1.8],
              [9.8, 0, 3.2],
            ]}
          />
          <GroundMist color="#a37a7d" opacity={0.26} y={0.32} spread={16} />
          <NightMoon position={[-14, 18, -26]} color="#f0d5d5" />
        </>
      )}

      {levelId === 3 && (
        <>
          <SculptedStoneWell position={[0, 0, 0]} radius={1.58} showBasket />
          <SwayingBambooGrove
            positions={[
              [-11.2, 0, 7.2],
              [11.0, 0, 7.5],
              [-10.8, 0, -8.2],
              [10.8, 0, -8.2],
            ]}
          />
          <InstancedRain area={26} height={10} />
          <GroundMist color="#7e949c" opacity={0.28} y={0.28} spread={18} />
          <NightMoon position={[18, 22, -24]} />
        </>
      )}

      {levelId === 4 && (
        <>
          <AltarCalligraphySet
            position={[0, 0.65, -10.8]}
            title="THÀNH HOÀNG BẢO HỘ"
            leftCouplet="ĐÌNH CỔ NỬA ĐÊM CHUÔNG TRỐNG VỌNG"
            rightCouplet="SẮC PHONG GHI TẠC CHÍNH KHÍ TRỜI"
            width={4.6}
          />
          <WoodenRoofTrusses zPositions={[-8.8, -4.2, 0.0, 4.5, 8.0]} spanWidth={22} height={4.6} />
          <IncenseSmoke position={[0, 1.25, -3.5]} />
          <GroundMist color="#9c8a78" opacity={0.18} y={0.22} spread={15} />
        </>
      )}

      {levelId === 5 && (
        <>
          <AnimatedWater position={[0, -0.22, -5.2]} size={[34, 24]} tint="#061217" />
          <FerryboatDetails />
          <SwayingBambooGrove
            positions={[
              [-8.2, 0, 6.2],
              [-6.2, 0, 7.8],
              [7.8, 0, 6.0],
              [6.0, 0, 7.6],
            ]}
          />
          <InstancedRain area={24} height={9} />
          <GroundMist color="#8ca5b2" opacity={0.34} y={0.35} spread={18} />
          <NightMoon position={[0, 15, -32]} color="#dce8f5" />
        </>
      )}
    </group>
  );
};
