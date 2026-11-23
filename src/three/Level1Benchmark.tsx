import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vec3 } from '../types/game';
import {
  createCalligraphyTexture,
  createCobwebTexture,
  createHoanhPhiTexture,
  getWorldMaterial,
} from './proceduralTextures';
import { AnimatedWater, GroundMist, IncenseSmoke, NightMoon } from './AtmosphericEffects';
import { ModelSlot } from './ModelSlot';
import { QUALITY_PROFILES } from './AssetPipeline';
import { useGameStore } from '../store/gameStore';
import { VISUAL_STANDARD } from './VisualStandard';

/** Turned cylindrical Vietnamese ironwood pillar resting on carved green-stone plinth (Chân Tảng Đá Xanh) */
const IronwoodPillarWithPlinth: React.FC<{ position: Vec3; height?: number }> = ({
  position,
  height = 3.85,
}) => {
  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  const stoneMat = useMemo(() => getWorldMaterial('stone'), []);
  const r = VISUAL_STANDARD.proportions.pillarRadius;
  const plinthH = VISUAL_STANDARD.proportions.plinthHeight;

  return (
    <group position={position}>
      {/* Square stone base pad */}
      <mesh position={[0, 0.06, 0]} material={stoneMat} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.12, 0.5]} />
      </mesh>
      {/* Chamfered lotus stone plinth (Chân tảng) */}
      <mesh position={[0, 0.18, 0]} material={stoneMat} castShadow receiveShadow>
        <cylinderGeometry args={[r * 1.15, r * 1.48, plinthH * 0.65, 8]} />
      </mesh>
      {/* Turned cylindrical ironwood shaft */}
      <mesh position={[0, plinthH + (height - plinthH) / 2, 0]} material={woodMat} castShadow receiveShadow>
        <cylinderGeometry args={[r * 0.92, r * 1.04, height - plinthH, 12]} />
      </mesh>
      {/* Upper wooden capital & cross-bracket (Kẻ chuyền) */}
      <mesh position={[0, height - 0.22, 0]} material={woodMat} castShadow>
        <boxGeometry args={[0.52, 0.16, 0.52]} />
      </mesh>
    </group>
  );
};

/** Detailed Vietnamese Traditional Wooden Roof Structure (Vì Kèo + Xà Ngang + Đòn Tay) */
const TraditionalTimberCeiling: React.FC = () => {
  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  const woodOldMat = useMemo(() => getWorldMaterial('wood_old'), []);
  const zBays = [-6.3, -2.5, 0.8, 3.6];

  return (
    <group>
      {/* Main transverse trusses (Vì kèo) */}
      {zBays.map((z, i) => (
        <group key={i} position={[0, 3.58, z]}>
          <mesh material={woodMat} castShadow>
            <boxGeometry args={[17.8, 0.24, 0.24]} />
          </mesh>
          <mesh position={[0, 0.34, 0]} material={woodMat}>
            <boxGeometry args={[0.2, 0.55, 0.2]} />
          </mesh>
          <mesh position={[-3.2, 0.22, 0]} material={woodMat}>
            <boxGeometry args={[0.18, 0.42, 0.18]} />
          </mesh>
          <mesh position={[3.2, 0.22, 0]} material={woodMat}>
            <boxGeometry args={[0.18, 0.42, 0.18]} />
          </mesh>
          <mesh position={[0, 0.46, 0]} material={woodOldMat}>
            <boxGeometry args={[10.8, 0.16, 0.18]} />
          </mesh>
        </group>
      ))}
      {/* Longitudinal purlins (Xà dọc) connecting bays */}
      {[-6.2, -2.6, 2.6, 6.2].map((x, idx) => (
        <mesh key={idx} position={[x, 3.74, -1.5]} material={woodOldMat}>
          <boxGeometry args={[0.18, 0.18, 10.6]} />
        </mesh>
      ))}
    </group>
  );
};

/** Ornate Ancestral Altar Setpiece (Án Gian Thờ) wrapped around Level 1's altar bounds */
const OrnateAncestralAltar: React.FC = () => {
  const altarMat = useMemo(() => getWorldMaterial('altar_red'), []);
  const goldMat = useMemo(() => getWorldMaterial('gold'), []);
  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  const curtainMat = useMemo(() => getWorldMaterial('curtain'), []);
  const plaqueTex = useMemo(() => createHoanhPhiTexture('ĐỨC LƯU QUANG'), []);
  const leftTex = useMemo(
    () => createCalligraphyTexture('TỔ TÔNG CÔNG ĐỨC THIÊN NIÊN THỊNH', '#591010', '#d8ab45'),
    []
  );
  const rightTex = useMemo(
    () => createCalligraphyTexture('TỬ HIẾU TÔN HIỀN VẠN ĐẠI VINH', '#591010', '#d8ab45'),
    []
  );

  return (
    <group position={[0, 0, -5.8]}>
      {/* Wooden raised floor dais under altar */}
      <mesh position={[0, 0.04, 0.12]} material={woodMat} receiveShadow>
        <boxGeometry args={[3.9, 0.08, 1.55]} />
      </mesh>
      {/* Carved gold-trimmed apron valance (Yếm bàn thờ) along front face */}
      <mesh position={[0, 0.96, 0.56]} material={goldMat}>
        <boxGeometry args={[3.42, 0.07, 0.04]} />
      </mesh>
      <mesh position={[0, 0.72, 0.56]} material={altarMat}>
        <boxGeometry args={[3.15, 0.36, 0.05]} />
      </mesh>
      {/* Four sculpted corner altar feet */}
      {[
        [-1.62, 0.54],
        [1.62, 0.54],
        [-1.62, -0.52],
        [1.62, -0.52],
      ].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.54, z]} material={goldMat} castShadow>
          <boxGeometry args={[0.14, 1.08, 0.14]} />
        </mesh>
      ))}

      {/* Upper red-velvet hanging valance cloth (Yếm rèm thờ) overhead */}
      <mesh position={[0, 3.2, 0.4]} material={curtainMat}>
        <boxGeometry args={[3.8, 0.52, 0.06]} />
      </mesh>
      <mesh position={[0, 2.93, 0.42]} material={goldMat}>
        <boxGeometry args={[3.82, 0.045, 0.06]} />
      </mesh>

      {/* Hoành Phi Plaque */}
      <group position={[0, 2.65, -0.65]}>
        <mesh castShadow>
          <boxGeometry args={[2.45, 0.82, 0.09]} />
          <meshStandardMaterial map={plaqueTex} roughness={0.44} metalness={0.25} />
        </mesh>
        <mesh position={[0, 0.43, 0]} material={goldMat}>
          <boxGeometry args={[2.54, 0.055, 0.11]} />
        </mesh>
        <mesh position={[0, -0.43, 0]} material={goldMat}>
          <boxGeometry args={[2.54, 0.055, 0.11]} />
        </mesh>
      </group>

      {/* Parallel Couplets (Câu Đối) */}
      <mesh position={[-1.9, 1.85, -0.62]}>
        <boxGeometry args={[0.38, 2.25, 0.06]} />
        <meshStandardMaterial map={leftTex} roughness={0.48} metalness={0.22} />
      </mesh>
      <mesh position={[1.9, 1.85, -0.62]}>
        <boxGeometry args={[0.38, 2.25, 0.06]} />
        <meshStandardMaterial map={rightTex} roughness={0.48} metalness={0.22} />
      </mesh>

      {/* Ancestral framed portrait shadow (Di ảnh mờ) at rear center */}
      <group position={[0, 1.56, -0.35]}>
        <mesh material={woodMat} castShadow>
          <boxGeometry args={[0.42, 0.54, 0.04]} />
        </mesh>
        <mesh position={[0, 0, 0.024]}>
          <planeGeometry args={[0.34, 0.46]} />
          <meshStandardMaterial color="#3c3429" roughness={0.85} />
        </mesh>
      </group>

      {/* Brass offering tray (Mâm bồng) & Ceramic flower vases */}
      <group position={[-0.78, 1.15, -0.1]}>
        <mesh material={goldMat} castShadow>
          <cylinderGeometry args={[0.2, 0.08, 0.14, 14]} />
        </mesh>
      </group>
      {[-1.45, 1.45].map((x, idx) => (
        <group key={idx} position={[x, 1.24, -0.25]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.075, 0.1, 0.32, 12]} />
            <meshStandardMaterial color="#2f434a" roughness={0.38} metalness={0.18} />
          </mesh>
          {/* Dried withered lotus stems */}
          <mesh position={[0.02, 0.28, 0]} rotation={[0.1, 0, 0.16]}>
            <cylinderGeometry args={[0.008, 0.01, 0.34, 5]} />
            <meshStandardMaterial color="#3b2c1d" roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* Brass Candlesticks with realistic warm flames */}
      {[-1.12, 1.12].map((x, idx) => (
        <group key={idx} position={[x, 1.12, 0.18]}>
          <mesh material={goldMat} castShadow>
            <cylinderGeometry args={[0.04, 0.09, 0.32, 12]} />
          </mesh>
          <mesh position={[0, 0.23, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.15, 8]} />
            <meshStandardMaterial color="#a81b1b" roughness={0.62} />
          </mesh>
          <mesh position={[0, 0.33, 0]}>
            <sphereGeometry args={[0.028, 8, 8]} />
            <meshStandardMaterial color="#ffe89c" emissive="#ff851b" emissiveIntensity={3.2} />
          </mesh>
        </group>
      ))}

      <IncenseSmoke position={[0, 1.38, 0.15]} />
    </group>
  );
};

/** Traditional Wooden Barred Window (Cửa Song Gỗ) with subtle volumetric moonlight shaft */
const MoonlitBarredWindow: React.FC<{
  position: Vec3;
  rotationY?: number;
  showShaft: boolean;
}> = ({ position, rotationY = 0, showShaft }) => {
  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Window outer wooden casing */}
      <mesh position={[0, 0.62, 0]} material={woodMat}>
        <boxGeometry args={[1.45, 0.12, 0.16]} />
      </mesh>
      <mesh position={[0, -0.62, 0]} material={woodMat}>
        <boxGeometry args={[1.45, 0.12, 0.18]} />
      </mesh>
      <mesh position={[-0.68, 0, 0]} material={woodMat}>
        <boxGeometry args={[0.12, 1.24, 0.16]} />
      </mesh>
      <mesh position={[0.68, 0, 0]} material={woodMat}>
        <boxGeometry args={[0.12, 1.24, 0.16]} />
      </mesh>
      {/* Dim moonlit night backdrop pane */}
      <mesh position={[0, 0, -0.04]}>
        <planeGeometry args={[1.24, 1.12]} />
        <meshBasicMaterial color="#1f2d42" />
      </mesh>
      {/* Vertical wooden lattice bars (Song gỗ) */}
      {[-0.45, -0.22, 0, 0.22, 0.45].map((x, idx) => (
        <mesh key={idx} position={[x, 0, 0.02]} material={woodMat}>
          <cylinderGeometry args={[0.022, 0.022, 1.16, 6]} />
        </mesh>
      ))}
      {/* Subtle angled volumetric moonlight dust shaft pouring inward */}
      {showShaft && (
        <mesh position={[0, -0.65, 1.45]} rotation={[0.52, 0, 0]}>
          <planeGeometry args={[1.2, 3.2]} />
          <meshBasicMaterial
            color="#7ea3cc"
            transparent
            opacity={0.055}
            depthWrite={false}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};

/** Upgraded Ancient Stone Well with Tiled Roof Canopy, Bucket & Animated Water Drips */
const BenchmarkStoneWell: React.FC<{ position: Vec3 }> = ({ position }) => {
  const stoneMat = useMemo(() => getWorldMaterial('stone'), []);
  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  const roofMat = useMemo(() => getWorldMaterial('roof'), []);
  const metalMat = useMemo(() => getWorldMaterial('metal'), []);
  const dripRef = useRef<THREE.Mesh | null>(null);

  useFrame((state) => {
    if (!dripRef.current) return;
    const cycle = (state.clock.elapsedTime * 0.65) % 1;
    dripRef.current.position.y = 2.1 - cycle * 1.75;
    dripRef.current.scale.setScalar(cycle > 0.94 ? 0.01 : 1);
  });

  const radius = 1.26;
  return (
    <group position={position}>
      {/* Circular stone stepped apron */}
      <mesh position={[0, 0.04, 0]} material={stoneMat} receiveShadow>
        <cylinderGeometry args={[radius + 0.48, radius + 0.56, 0.08, 22]} />
      </mesh>
      {/* Mortared stone well shaft */}
      <mesh position={[0, 0.52, 0]} material={stoneMat} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 1.08, 1.04, 22, 1, true]} />
      </mesh>
      {/* Mossy stone capstone lip */}
      <mesh position={[0, 1.02, 0]} rotation={[Math.PI / 2, 0, 0]} material={stoneMat} castShadow>
        <torusGeometry args={[radius * 0.96, 0.14, 10, 24]} />
      </mesh>
      {/* Wooden A-Frame posts supporting pitched terracotta well roof */}
      <mesh position={[-radius * 0.92, 1.68, 0]} material={woodMat} castShadow>
        <cylinderGeometry args={[0.08, 0.095, 2.35, 8]} />
      </mesh>
      <mesh position={[radius * 0.92, 1.68, 0]} material={woodMat} castShadow>
        <cylinderGeometry args={[0.08, 0.095, 2.35, 8]} />
      </mesh>
      {/* Pitched mossy tiled canopy roof over well */}
      <mesh position={[0, 2.95, 0.42]} rotation={[0.45, 0, 0]} material={roofMat} castShadow>
        <boxGeometry args={[2.95, 0.1, 1.25]} />
      </mesh>
      <mesh position={[0, 2.95, -0.42]} rotation={[-0.45, 0, 0]} material={roofMat} castShadow>
        <boxGeometry args={[2.95, 0.1, 1.25]} />
      </mesh>
      <mesh position={[0, 3.24, 0]} material={woodMat}>
        <boxGeometry args={[3.0, 0.12, 0.14]} />
      </mesh>
      {/* Winch axle, crank handle, iron pulley & rope */}
      <mesh position={[0, 2.32, 0]} rotation={[0, 0, Math.PI / 2]} material={woodMat}>
        <cylinderGeometry args={[0.065, 0.065, radius * 2.15, 10]} />
      </mesh>
      <mesh position={[radius * 1.12, 2.22, 0.14]} material={metalMat}>
        <boxGeometry args={[0.05, 0.34, 0.05]} />
      </mesh>
      <mesh position={[0, 2.22, 0]} material={metalMat}>
        <torusGeometry args={[0.14, 0.03, 8, 16]} />
      </mesh>
      <mesh position={[0, 1.28, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 1.9, 6]} />
        <meshStandardMaterial color="#614e36" roughness={0.95} />
      </mesh>
      {/* Falling water droplet animation */}
      <mesh ref={dripRef} position={[0.06, 1.8, 0]}>
        <sphereGeometry args={[0.022, 6, 6]} />
        <meshBasicMaterial color="#9fc2d9" transparent opacity={0.75} />
      </mesh>
      {/* Rippling dark reflective well water */}
      <AnimatedWater position={[0, 0.35, 0]} size={[radius * 1.75, radius * 1.75]} tint="#040b0e" />
    </group>
  );
};

/**
 * LEVEL 1 VISUAL BENCHMARK — Nhà Gỗ Ba Gian Bắc Bộ (v4.5.1 Realistic Horror Reference)
 * Preserves 100% of Level 1 collision boxes, door IDs, evidence IDs, and puzzles.
 */
export const Level1HouseBenchmark: React.FC = () => {
  const quality = useGameStore((s) => s.settings.graphicsQuality);
  const profile = QUALITY_PROFILES[quality];

  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  const woodOldMat = useMemo(() => getWorldMaterial('wood_old'), []);
  const stoneMat = useMemo(() => getWorldMaterial('stone'), []);
  const roofMat = useMemo(() => getWorldMaterial('roof'), []);
  const cobwebTex = useMemo(() => createCobwebTexture(), []);

  return (
    <group>
      {/* 1. Turned Ironwood Pillars + Green-Stone Plinths */}
      {[
        [-2.6, 0, -2.5],
        [2.6, 0, -2.5],
        [-2.6, 0, -6.5],
        [2.6, 0, -6.5],
        [-2.6, 0, 3.65],
        [2.6, 0, 3.65],
      ].map((pos, idx) => (
        <ModelSlot
          key={idx}
          assetKey="l1_pillar"
          position={pos as Vec3}
          fallback={<IronwoodPillarWithPlinth position={[0, 0, 0]} />}
        />
      ))}

      {/* 2. Exposed Traditional Timber Ceiling (Vì kèo + Xà dọc) */}
      <TraditionalTimberCeiling />

      {/* 3. Ornate Ancestral Altar (Án Gian Thờ) via replaceable ModelSlot */}
      <ModelSlot assetKey="l1_altar" fallback={<OrnateAncestralAltar />} />

      {/* 4. Wooden Doorway Frames, Threshold Sills (Bậu cửa) & Baseboard Skirting */}
      {/* South backyard main doorway casing */}
      <group position={[0, 0, 4.0]}>
        <mesh position={[-1.24, 1.45, 0]} material={woodMat} castShadow>
          <boxGeometry args={[0.16, 2.9, 0.48]} />
        </mesh>
        <mesh position={[1.24, 1.45, 0]} material={woodMat} castShadow>
          <boxGeometry args={[0.16, 2.9, 0.48]} />
        </mesh>
        <mesh position={[0, 2.86, 0]} material={woodMat}>
          <boxGeometry args={[2.65, 0.16, 0.5]} />
        </mesh>
        {/* Raised wooden veranda threshold */}
        <mesh position={[0, 0.05, 0]} material={woodOldMat}>
          <boxGeometry args={[2.45, 0.1, 0.46]} />
        </mesh>
        {/* Overhanging tiled back veranda eaves (Mái hiên sau nhà) */}
        <mesh position={[0, 3.35, 0.95]} rotation={[0.32, 0, 0]} material={roofMat} castShadow>
          <boxGeometry args={[18.8, 0.14, 1.85]} />
        </mesh>
      </group>

      {/* West Bedroom & East Sealed Room interior wooden door casings */}
      {[-3.2, 3.2].map((x, idx) => (
        <group key={idx} position={[x, 0, 0.5]}>
          <mesh position={[0, 1.4, -0.96]} material={woodMat}>
            <boxGeometry args={[0.38, 2.8, 0.14]} />
          </mesh>
          <mesh position={[0, 1.4, 0.96]} material={woodMat}>
            <boxGeometry args={[0.38, 2.8, 0.14]} />
          </mesh>
          <mesh position={[0, 2.74, 0]} material={woodMat}>
            <boxGeometry args={[0.4, 0.14, 2.05]} />
          </mesh>
        </group>
      ))}

      {/* Wooden wall baseboards (Len chân tường chống ẩm) */}
      <mesh position={[0, 0.11, -6.76]} material={woodMat}>
        <boxGeometry args={[17.8, 0.22, 0.08]} />
      </mesh>
      <mesh position={[-8.76, 0.11, -1.5]} material={woodMat}>
        <boxGeometry args={[0.08, 0.22, 10.8]} />
      </mesh>
      <mesh position={[8.76, 0.11, -1.5]} material={woodMat}>
        <boxGeometry args={[0.08, 0.22, 10.8]} />
      </mesh>

      {/* 5. Moonlit Wooden Barred Windows (Cửa sổ song gỗ) with Volumetric Moonlight Shafts */}
      <MoonlitBarredWindow
        position={[-8.76, 1.95, -1.2]}
        rotationY={Math.PI / 2}
        showShaft={profile.enableVolumetricMoonShafts}
      />
      <MoonlitBarredWindow
        position={[8.76, 1.95, -1.2]}
        rotationY={-Math.PI / 2}
        showShaft={profile.enableVolumetricMoonShafts}
      />

      {/* 6. Detailed Bedroom & Domestic Environmental Storytelling Props (Non-blocking) */}
      {/* Four-poster mosquito net frame (Khung màn cổ) & sedge mat on West bed */}
      <group position={[-7.2, 0, -4.6]}>
        {[
          [-1.12, -1.52],
          [1.12, -1.52],
          [-1.12, 1.52],
          [1.12, 1.52],
        ].map(([bx, bz], i) => (
          <mesh key={i} position={[bx, 1.35, bz]} material={woodMat}>
            <cylinderGeometry args={[0.035, 0.04, 2.1, 8]} />
          </mesh>
        ))}
        {/* Top mosquito net canopy rails */}
        <mesh position={[0, 2.38, -1.52]} material={woodMat}>
          <boxGeometry args={[2.3, 0.05, 0.05]} />
        </mesh>
        <mesh position={[0, 2.38, 1.52]} material={woodMat}>
          <boxGeometry args={[2.3, 0.05, 0.05]} />
        </mesh>
        {/* Woven sedge mat (Chiếu cói cũ) & wooden bolster */}
        <mesh position={[0, 0.65, 0]}>
          <boxGeometry args={[2.22, 0.03, 3.0]} />
          <meshStandardMaterial color="#8f7c54" roughness={0.95} />
        </mesh>
        <mesh position={[0, 0.74, -1.15]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 1.1, 10]} />
          <meshStandardMaterial color="#6e251f" roughness={0.9} />
        </mesh>
        {/* Torn pale mosquito net drape hanging along rear of bed */}
        <mesh position={[0, 1.65, -1.48]}>
          <planeGeometry args={[2.2, 1.5]} />
          <meshStandardMaterial color="#cfc8b8" transparent opacity={0.34} side={THREE.DoubleSide} roughness={0.95} />
        </mesh>
      </group>

      {/* Traditional Earthen Water Jar (Chum sành) & clay bowls by West storage shelf */}
      <group position={[-7.6, 0, 2.9]}>
        <mesh position={[0, 0.38, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.22, 0.76, 14]} />
          <meshStandardMaterial color="#4f2a1d" roughness={0.48} metalness={0.12} />
        </mesh>
        <mesh position={[0, 0.77, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.23, 0.035, 8, 16]} />
          <meshStandardMaterial color="#3d1f15" roughness={0.5} />
        </mesh>
      </group>

      {/* Dusty Cobweb Decals in upper wooden corners */}
      {[
        { p: [-2.85, 3.3, -6.5] as Vec3, ry: 0.4 },
        { p: [2.85, 3.3, -6.5] as Vec3, ry: -0.4 },
        { p: [-8.4, 3.3, -6.5] as Vec3, ry: 0.5 },
        { p: [8.4, 3.3, -6.5] as Vec3, ry: -0.5 },
      ].map((c, idx) => (
        <mesh key={idx} position={c.p} rotation={[0, c.ry, 0]}>
          <planeGeometry args={[0.95, 0.95]} />
          <meshBasicMaterial map={cobwebTex} transparent opacity={0.55} depthWrite={false} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* 7. Backyard Stone Flagstone Path, Brick Coping & Upgraded Well Canopy */}
      {[4.6, 5.3, 6.0].map((z, idx) => (
        <mesh key={idx} position={[(idx % 2 === 0 ? -0.08 : 0.08), -0.04, z]} material={stoneMat} receiveShadow>
          <boxGeometry args={[1.45, 0.06, 0.52]} />
        </mesh>
      ))}
      {/* Backyard brick wall capstones */}
      <mesh position={[0, 2.24, 10.6]} material={stoneMat}>
        <boxGeometry args={[21.2, 0.12, 0.52]} />
      </mesh>

      {/* Ancient Stone Well wrapped in replaceable ModelSlot */}
      <ModelSlot assetKey="l1_well" fallback={<BenchmarkStoneWell position={[0, 0, 7.6]} />} />

      {/* 8. Atmospheric Ground Mist & Pale Moonlight */}
      <GroundMist color="#8795a6" opacity={0.2} y={0.22} spread={14} />
      <NightMoon position={[16, 18, 26]} color="#dce8f8" />
    </group>
  );
};
