import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vec3 } from '../types/game';
import {
  createCalligraphyTexture,
  createHoanhPhiTexture,
  getWorldMaterial,
} from './proceduralTextures';
import { AnimatedWater, GroundMist, IncenseSmoke, NightMoon } from './AtmosphericEffects';

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
      {/* Horizontal Plaque (Hoành Phi) */}
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

      {/* Left & Right Vertical Couplets (Câu Đối) */}
      <mesh position={[-width / 2, 1.45, 0.08]}>
        <boxGeometry args={[0.38, 2.2, 0.06]} />
        <meshStandardMaterial map={leftTex} roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[width / 2, 1.45, 0.08]}>
        <boxGeometry args={[0.38, 2.2, 0.06]} />
        <meshStandardMaterial map={rightTex} roughness={0.5} metalness={0.2} />
      </mesh>

      {/* Brass Altar Candlesticks & Ceramic Vases */}
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
            <meshStandardMaterial color="#ffdd7a" emissive="#ff7b1a" emissiveIntensity={3.2} />
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
          {/* Main horizontal tie beam */}
          <mesh material={woodMat} castShadow>
            <boxGeometry args={[spanWidth, 0.24, 0.24]} />
          </mesh>
          {/* Upper king post & collar beam */}
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
const SculptedStoneWell: React.FC<{ position: Vec3; radius?: number }> = ({
  position,
  radius = 1.05,
}) => {
  const stoneMat = useMemo(() => getWorldMaterial('stone'), []);
  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  const metalMat = useMemo(() => getWorldMaterial('metal'), []);

  return (
    <group position={position}>
      {/* Sculpted cylindrical stone ring */}
      <mesh position={[0, 0.52, 0]} material={stoneMat} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 1.08, 1.04, 20, 1, true]} />
      </mesh>
      {/* Mossy stone capstone lip */}
      <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={stoneMat} castShadow>
        <torusGeometry args={[radius * 0.96, 0.14, 10, 24]} />
      </mesh>
      {/* Wooden winch posts & roof eaves */}
      <mesh position={[-radius * 0.92, 1.65, 0]} material={woodMat} castShadow>
        <cylinderGeometry args={[0.075, 0.085, 2.2, 8]} />
      </mesh>
      <mesh position={[radius * 0.92, 1.65, 0]} material={woodMat} castShadow>
        <cylinderGeometry args={[0.075, 0.085, 2.2, 8]} />
      </mesh>
      {/* Winch crossbar & iron pulley */}
      <mesh position={[0, 2.35, 0]} rotation={[0, 0, Math.PI / 2]} material={woodMat}>
        <cylinderGeometry args={[0.06, 0.06, radius * 2.1, 10]} />
      </mesh>
      <mesh position={[0, 2.25, 0]} material={metalMat}>
        <torusGeometry args={[0.14, 0.03, 8, 16]} />
      </mesh>
      {/* Hanging wet rope descending into dark water */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 1.9, 6]} />
        <meshStandardMaterial color="#614e36" roughness={0.95} />
      </mesh>
      {/* Animated rippling dark well water */}
      <AnimatedWater position={[0, 0.35, 0]} size={[radius * 1.75, radius * 1.75]} tint="#050d10" />
    </group>
  );
};

/** Gently swaying bamboo clusters with layered dark foliage for Level 2 & Level 5 */
const SwayingBambooGrove: React.FC<{ positions: Vec3[] }> = ({ positions }) => {
  const groupRef = useRef<THREE.Group | null>(null);
  const bambooMat = useMemo(() => getWorldMaterial('bamboo'), []);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, idx) => {
      child.rotation.z = Math.sin(t * 0.85 + idx * 1.3) * 0.038;
      child.rotation.x = Math.cos(t * 0.65 + idx * 0.9) * 0.024;
    });
  });

  return (
    <group ref={groupRef}>
      {positions.map((pos, idx) => (
        <group key={idx} position={pos}>
          {/* 3 clustered slender bamboo culms */}
          {[
            [0, 0, 0],
            [0.35, 0, 0.22],
            [-0.28, 0, 0.3],
          ].map(([ox, , oz], cIdx) => (
            <group key={cIdx} position={[ox, 0, oz]} rotation={[0, cIdx * 1.1, (cIdx - 1) * 0.06]}>
              <mesh position={[0, 3.2, 0]} material={bambooMat} castShadow>
                <cylinderGeometry args={[0.065, 0.095, 6.4, 8]} />
              </mesh>
              {/* Layered foliage canopies */}
              <mesh position={[0.25, 4.4, 0]}>
                <coneGeometry args={[0.85, 1.3, 6]} />
                <meshStandardMaterial color="#182614" roughness={0.92} />
              </mesh>
              <mesh position={[-0.2, 5.5, 0.1]}>
                <coneGeometry args={[0.95, 1.5, 6]} />
                <meshStandardMaterial color="#1d2e18" roughness={0.92} />
              </mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  );
};

/** Sculpted Banyan Tree Canopy & Aerial Roots (Cây Đa Cổ Thụ) */
const AncientBanyanCanopy: React.FC<{ position: Vec3 }> = ({ position }) => {
  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  return (
    <group position={position}>
      {/* Spreading dark leafy crown */}
      <mesh position={[0, 4.6, 0]} castShadow>
        <dodecahedronGeometry args={[3.4, 1]} />
        <meshStandardMaterial color="#152113" roughness={0.95} />
      </mesh>
      <mesh position={[1.6, 4.1, 1.0]}>
        <dodecahedronGeometry args={[2.2, 1]} />
        <meshStandardMaterial color="#182615" roughness={0.95} />
      </mesh>
      {/* Hanging aerial roots (rễ đa buông rủ) */}
      {[-1.4, -0.7, 0.9, 1.5].map((x, idx) => (
        <mesh key={idx} position={[x, 2.1, 0.9 - (idx % 2) * 0.6]} material={woodMat}>
          <cylinderGeometry args={[0.04, 0.07, 4.2, 6]} />
        </mesh>
      ))}
      {/* Red prayer cloth tied around trunk */}
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
      {/* Curved arched bamboo roof ribs */}
      {[-1.8, -0.6, 0.6, 1.8].map((z, idx) => (
        <mesh key={idx} position={[0, 2.2, z]} rotation={[0, 0, 0]} material={woodMat}>
          <torusGeometry args={[2.45, 0.06, 8, 20, Math.PI]} />
        </mesh>
      ))}
      {/* Long wooden oar resting along starboard */}
      <mesh position={[2.25, 0.95, 1.2]} rotation={[0.25, 0, -0.15]} material={woodMat}>
        <cylinderGeometry args={[0.045, 0.055, 4.6, 8]} />
      </mesh>
      {/* Glowing golden bow lantern */}
      <mesh position={[0, 1.95, -3.5]}>
        <sphereGeometry args={[0.2, 12, 12]} />
        <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={3.5} />
      </mesh>
    </group>
  );
};

/** Renders Unity-grade handcrafted Vietnamese architectural & atmospheric setpieces per level */
export const VietnameseLevelSetpieces: React.FC<{ levelId: number }> = ({ levelId }) => {
  return (
    <group>
      {/* Level 1: Nhà Gỗ Ba Gian */}
      {levelId === 1 && (
        <>
          <AltarCalligraphySet
            position={[0, 0.6, -6.4]}
            title="ĐỨC LƯU QUANG"
            leftCouplet="TỔ TÔNG CÔNG ĐỨC THIÊN NIÊN THỊNH"
            rightCouplet="TỬ HIẾU TÔN HIỀN VẠN ĐẠI VINH"
            width={3.5}
          />
          <WoodenRoofTrusses zPositions={[-5.2, -1.6, 2.0]} spanWidth={18} height={3.65} />
          <SculptedStoneWell position={[0, 0, 7.6]} radius={1.26} />
          <GroundMist color="#8b96a0" opacity={0.22} y={0.22} spread={14} />
          <NightMoon position={[16, 18, 26]} />
        </>
      )}

      {/* Level 2: Miếu Cô Gái Áo Đỏ */}
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
            ]}
          />
          <GroundMist color="#a37a7d" opacity={0.28} y={0.32} spread={16} />
          <NightMoon position={[-14, 18, -26]} color="#f0d5d5" />
        </>
      )}

      {/* Level 3: Tiếng Gõ Từ Đáy Giếng */}
      {levelId === 3 && (
        <>
          <SculptedStoneWell position={[0, 0, 0]} radius={1.58} />
          <SwayingBambooGrove
            positions={[
              [-11.2, 0, 7.2],
              [11.0, 0, 7.5],
              [-10.8, 0, -8.2],
              [10.8, 0, -8.2],
            ]}
          />
          <GroundMist color="#7e949c" opacity={0.3} y={0.28} spread={18} />
          <NightMoon position={[18, 22, -24]} />
        </>
      )}

      {/* Level 4: Ngôi Đình Lúc Nửa Đêm */}
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

      {/* Level 5: Chuyến Đò Sang Cõi Âm */}
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
          <GroundMist color="#8ca5b2" opacity={0.36} y={0.35} spread={18} />
          <NightMoon position={[0, 15, -32]} color="#dce8f5" />
        </>
      )}
    </group>
  );
};
