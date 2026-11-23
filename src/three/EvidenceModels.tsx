import React, { useMemo } from 'react';
import * as THREE from 'three';
import { EvidenceModelType } from '../types/game';
import { createCalligraphyTexture } from './proceduralTextures';

interface EvidenceModelProps {
  type: EvidenceModelType;
  scale?: number;
}

export const EvidenceModel: React.FC<EvidenceModelProps> = ({ type, scale = 1 }) => {
  const talismanTex = useMemo(() => createCalligraphyTexture('TRẤN YỂM CÕI ÂM', '#d9b95b', '#8b1111'), []);
  const ritualTex = useMemo(() => createCalligraphyTexture('SỚ CÚNG RẰM THÁNG BẢY', '#d4c39b', '#7f1212'), []);
  const decreeTex = useMemo(() => createCalligraphyTexture('SẮC PHONG THẦN HOÀNG', '#d4a946', '#6b1212'), []);

  return (
    <group scale={scale}>
      {type === 'comb' && (
        <group>
          {/* Curved wooden spine */}
          <mesh position={[0, 0.12, 0]} castShadow>
            <boxGeometry args={[0.92, 0.16, 0.08]} />
            <meshStandardMaterial color="#4a2c18" roughness={0.78} />
          </mesh>
          {/* Comb teeth */}
          {Array.from({ length: 13 }).map((_, i) => (
            <mesh key={i} position={[-0.4 + i * 0.066, -0.08, 0]} castShadow>
              <boxGeometry args={[0.028, 0.28, 0.045]} />
              <meshStandardMaterial color="#59351e" roughness={0.8} />
            </mesh>
          ))}
          {/* Tangled dark hair strands */}
          <mesh position={[0.14, -0.05, 0.03]} rotation={[0, 0, 0.35]}>
            <torusGeometry args={[0.12, 0.012, 6, 16, Math.PI * 1.4]} />
            <meshStandardMaterial color="#0b0a0a" roughness={0.9} />
          </mesh>
          <mesh position={[-0.08, -0.09, -0.025]} rotation={[0.4, 0.2, -0.4]}>
            <torusGeometry args={[0.14, 0.01, 6, 16, Math.PI * 1.2]} />
            <meshStandardMaterial color="#121010" roughness={0.9} />
          </mesh>
          {/* Dried dark red stain on spine underside */}
          <mesh position={[-0.25, 0.12, 0.042]}>
            <circleGeometry args={[0.055, 12]} />
            <meshStandardMaterial color="#4a0909" roughness={0.6} />
          </mesh>
        </group>
      )}

      {type === 'incense_bowl' && (
        <group>
          {/* Ceramic body */}
          <mesh position={[0, 0, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.28, 0.42, 20]} />
            <meshStandardMaterial color="#3c4b52" roughness={0.55} metalness={0.12} />
          </mesh>
          {/* Rim */}
          <mesh position={[0, 0.21, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.37, 0.04, 10, 24]} />
            <meshStandardMaterial color="#2f3b40" roughness={0.5} />
          </mesh>
          {/* Ash surface */}
          <mesh position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.34, 18]} />
            <meshStandardMaterial color="#706c64" roughness={0.98} />
          </mesh>
          {/* Dark crack line on side */}
          <mesh position={[0.34, 0.02, 0.14]} rotation={[0, 0.4, 0.22]}>
            <boxGeometry args={[0.02, 0.34, 0.025]} />
            <meshStandardMaterial color="#0d0a09" roughness={0.95} />
          </mesh>
          {/* Three bent incense sticks */}
          {[-0.08, 0.02, 0.1].map((x, idx) => (
            <group key={idx} position={[x, 0.34, idx * 0.04 - 0.04]} rotation={[0.12 * (idx - 1), 0, 0.15 * (idx - 1)]}>
              <mesh>
                <cylinderGeometry args={[0.012, 0.012, 0.38, 6]} />
                <meshStandardMaterial color="#8f2419" roughness={0.9} />
              </mesh>
              <mesh position={[0, 0.19, 0]}>
                <sphereGeometry args={[0.018, 8, 8]} />
                <meshStandardMaterial color="#ff4d1a" emissive="#ff3300" emissiveIntensity={1.6} />
              </mesh>
            </group>
          ))}
          {/* Hidden brass ring tucked under rim base */}
          <mesh position={[0, -0.215, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.14, 0.018, 8, 16]} />
            <meshStandardMaterial color="#9e7a34" metalness={0.8} roughness={0.35} />
          </mesh>
        </group>
      )}

      {type === 'ritual_paper' && (
        <group rotation={[-0.2, 0, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.68, 0.92, 0.015]} />
            <meshStandardMaterial map={ritualTex} roughness={0.94} />
          </mesh>
          {/* Charred corner */}
          <mesh position={[0.26, -0.38, 0.01]}>
            <circleGeometry args={[0.14, 10]} />
            <meshStandardMaterial color="#1a120d" roughness={0.98} />
          </mesh>
        </group>
      )}

      {type === 'talisman' && (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.42, 0.98, 0.015]} />
            <meshStandardMaterial map={talismanTex} roughness={0.9} />
          </mesh>
          {/* Crimson wax seal on back */}
          <mesh position={[0, -0.1, -0.012]} rotation={[0, Math.PI, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.018, 16]} />
            <meshStandardMaterial color="#7a1111" roughness={0.5} />
          </mesh>
        </group>
      )}

      {type === 'hairpin' && (
        <group rotation={[0, 0, -0.45]}>
          {/* Silver/bone pin shaft */}
          <mesh castShadow>
            <cylinderGeometry args={[0.022, 0.008, 1.05, 10]} />
            <meshStandardMaterial color="#b5b2a8" metalness={0.78} roughness={0.32} />
          </mesh>
          {/* Carved jade lotus ornament */}
          <mesh position={[0, 0.52, 0]} castShadow>
            <dodecahedronGeometry args={[0.11, 0]} />
            <meshStandardMaterial color="#2e6b54" roughness={0.32} metalness={0.18} />
          </mesh>
          {/* Red silk tassel */}
          <mesh position={[0.04, 0.34, 0]}>
            <coneGeometry args={[0.04, 0.22, 8]} />
            <meshStandardMaterial color="#8c1616" roughness={0.85} />
          </mesh>
        </group>
      )}

      {type === 'torn_photo' && (
        <group>
          {/* Aged wood frame edge */}
          <mesh castShadow>
            <boxGeometry args={[0.84, 0.64, 0.035]} />
            <meshStandardMaterial color="#2e1d12" roughness={0.85} />
          </mesh>
          {/* Sepia photo surface */}
          <mesh position={[0, 0, 0.02]}>
            <planeGeometry args={[0.74, 0.54]} />
            <meshStandardMaterial color="#9c8a6b" roughness={0.9} />
          </mesh>
          {/* Silhouettes of family figures */}
          <mesh position={[-0.18, -0.02, 0.024]}>
            <boxGeometry args={[0.13, 0.3, 0.004]} />
            <meshStandardMaterial color="#2a2219" />
          </mesh>
          <mesh position={[0.02, 0.01, 0.024]}>
            <boxGeometry args={[0.14, 0.34, 0.004]} />
            <meshStandardMaterial color="#261e16" />
          </mesh>
          {/* Torn / scratched out third figure */}
          <mesh position={[0.22, -0.02, 0.025]} rotation={[0, 0, 0.14]}>
            <boxGeometry args={[0.16, 0.36, 0.006]} />
            <meshStandardMaterial color="#5c1313" roughness={0.95} />
          </mesh>
          {/* Back handwriting plate */}
          <mesh position={[0, 0, -0.02]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[0.72, 0.52]} />
            <meshStandardMaterial color="#cbb994" roughness={0.95} />
          </mesh>
        </group>
      )}

      {type === 'rusted_knife' && (
        <group rotation={[0, 0, 0.3]}>
          {/* Blade */}
          <mesh position={[0.18, 0, 0]} castShadow>
            <boxGeometry args={[0.68, 0.13, 0.022]} />
            <meshStandardMaterial color="#5e3e31" roughness={0.78} metalness={0.62} />
          </mesh>
          {/* Tip */}
          <mesh position={[0.58, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <coneGeometry args={[0.065, 0.14, 4]} />
            <meshStandardMaterial color="#593529" roughness={0.8} metalness={0.55} />
          </mesh>
          {/* Guard */}
          <mesh position={[-0.17, 0, 0]}>
            <boxGeometry args={[0.04, 0.22, 0.06]} />
            <meshStandardMaterial color="#3b322b" metalness={0.7} roughness={0.6} />
          </mesh>
          {/* Wooden handle */}
          <mesh position={[-0.4, 0, 0]} castShadow>
            <cylinderGeometry args={[0.045, 0.052, 0.42, 10]} />
            <meshStandardMaterial color="#382114" roughness={0.9} />
          </mesh>
          {/* Dark bloodstain near hilt */}
          <mesh position={[0.02, 0, 0.014]}>
            <circleGeometry args={[0.055, 10]} />
            <meshStandardMaterial color="#4d0b0b" roughness={0.65} />
          </mesh>
        </group>
      )}

      {type === 'paper_doll' && (
        <group>
          {/* Head */}
          <mesh position={[0, 0.34, 0]} castShadow>
            <cylinderGeometry args={[0.13, 0.13, 0.03, 18]} />
            <meshStandardMaterial color="#d9ccb2" roughness={0.95} />
          </mesh>
          {/* Torso */}
          <mesh position={[0, 0.05, 0]} castShadow>
            <coneGeometry args={[0.24, 0.46, 4]} />
            <meshStandardMaterial color="#8c1c1c" roughness={0.9} />
          </mesh>
          {/* Arms */}
          <mesh position={[0, 0.16, 0]}>
            <boxGeometry args={[0.68, 0.08, 0.025]} />
            <meshStandardMaterial color="#c9baa0" roughness={0.95} />
          </mesh>
          {/* Red binding thread wrapped around waist */}
          <mesh position={[0, 0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.14, 0.016, 6, 16]} />
            <meshStandardMaterial color="#9e1313" roughness={0.8} />
          </mesh>
          {/* Pin stuck through chest */}
          <mesh position={[0, 0.12, 0.04]} rotation={[1.2, 0.2, 0]}>
            <cylinderGeometry args={[0.008, 0.004, 0.28, 6]} />
            <meshStandardMaterial color="#8f8c84" metalness={0.85} roughness={0.3} />
          </mesh>
        </group>
      )}

      {type === 'ancient_coin' && (
        <group>
          {/* Bronze ring coin */}
          <mesh rotation={[0, 0, 0]} castShadow>
            <torusGeometry args={[0.26, 0.12, 10, 28]} />
            <meshStandardMaterial color="#6e5a34" metalness={0.76} roughness={0.44} />
          </mesh>
          {/* Verdigris green oxidation patches */}
          <mesh position={[0.18, 0.15, 0.09]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color="#3c6b58" roughness={0.85} />
          </mesh>
          {/* Red string through square center */}
          <mesh position={[0, 0.34, 0]}>
            <torusGeometry args={[0.14, 0.015, 6, 16]} />
            <meshStandardMaterial color="#7d1616" roughness={0.9} />
          </mesh>
        </group>
      )}

      {(type === 'diary' || type === 'ledger') && (
        <group>
          {/* Leather / stitched cover */}
          <mesh castShadow>
            <boxGeometry args={[0.66, 0.86, 0.14]} />
            <meshStandardMaterial color={type === 'ledger' ? '#261e17' : '#3d1f16'} roughness={0.88} />
          </mesh>
          {/* Aged pages block */}
          <mesh position={[0.03, 0, 0]}>
            <boxGeometry args={[0.62, 0.8, 0.1]} />
            <meshStandardMaterial color="#ccb98f" roughness={0.95} />
          </mesh>
          {/* Traditional thread spine stitches */}
          {[-0.28, -0.1, 0.1, 0.28].map((y, idx) => (
            <mesh key={idx} position={[-0.33, y, 0]}>
              <boxGeometry args={[0.04, 0.025, 0.15]} />
              <meshStandardMaterial color="#a89060" roughness={0.9} />
            </mesh>
          ))}
          {/* Cover title label */}
          <mesh position={[0.05, 0.12, 0.072]}>
            <planeGeometry args={[0.24, 0.48]} />
            <meshStandardMaterial color="#d4c298" roughness={0.95} />
          </mesh>
        </group>
      )}

      {type === 'ancestral_tablet' && (
        <group>
          {/* Stepped lotus base */}
          <mesh position={[0, -0.44, 0]} castShadow>
            <boxGeometry args={[0.52, 0.14, 0.24]} />
            <meshStandardMaterial color="#4a1313" roughness={0.62} />
          </mesh>
          {/* Upright lacquered tablet */}
          <mesh position={[0, 0.04, 0]} castShadow>
            <boxGeometry args={[0.34, 0.84, 0.09]} />
            <meshStandardMaterial color="#5c1414" roughness={0.55} />
          </mesh>
          {/* Gold inlaid front panel */}
          <mesh position={[0, 0.04, 0.048]}>
            <planeGeometry args={[0.22, 0.68]} />
            <meshStandardMaterial color="#c49a3f" metalness={0.65} roughness={0.4} />
          </mesh>
        </group>
      )}

      {type === 'royal_decree' && (
        <group rotation={[0, 0, Math.PI / 2]}>
          {/* Unrolled yellow silk scroll */}
          <mesh position={[0, 0, 0]} castShadow>
            <boxGeometry args={[0.55, 0.96, 0.02]} />
            <meshStandardMaterial map={decreeTex} roughness={0.82} />
          </mesh>
          {/* Wooden roller ends */}
          <mesh position={[0, 0.48, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.64, 12]} />
            <meshStandardMaterial color="#3b1d12" roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.48, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.64, 12]} />
            <meshStandardMaterial color="#3b1d12" roughness={0.7} />
          </mesh>
        </group>
      )}

      {type === 'drum_mallet' && (
        <group rotation={[0, 0, -0.4]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.032, 0.04, 0.92, 12]} />
            <meshStandardMaterial color="#3d2314" roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.46, 0]} castShadow>
            <sphereGeometry args={[0.13, 14, 14]} />
            <meshStandardMaterial color="#8f2419" roughness={0.9} />
          </mesh>
        </group>
      )}

      {type === 'relief_fragment' && (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.72, 0.62, 0.16]} />
            <meshStandardMaterial color="#595852" roughness={0.92} />
          </mesh>
          {/* Carved dragon/wave ridge */}
          <mesh position={[0, 0.05, 0.09]} rotation={[0, 0, 0.2]}>
            <torusGeometry args={[0.18, 0.045, 8, 18, Math.PI * 1.4]} />
            <meshStandardMaterial color="#484742" roughness={0.9} />
          </mesh>
        </group>
      )}

      {type === 'lantern' && (
        <group>
          {/* Top & bottom caps */}
          <mesh position={[0, 0.36, 0]}>
            <cylinderGeometry args={[0.14, 0.16, 0.06, 12]} />
            <meshStandardMaterial color="#24160e" roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.36, 0]}>
            <cylinderGeometry args={[0.16, 0.12, 0.06, 12]} />
            <meshStandardMaterial color="#24160e" roughness={0.8} />
          </mesh>
          {/* Red silk lantern body */}
          <mesh castShadow>
            <sphereGeometry args={[0.32, 16, 14]} />
            <meshStandardMaterial
              color="#9e1b1b"
              emissive="#8a1808"
              emissiveIntensity={0.85}
              roughness={0.8}
            />
          </mesh>
          {/* Tassel */}
          <mesh position={[0, -0.5, 0]}>
            <cylinderGeometry args={[0.02, 0.04, 0.24, 8]} />
            <meshStandardMaterial color="#a88438" roughness={0.85} />
          </mesh>
        </group>
      )}

      {type === 'rope' && (
        <group>
          {[0, 0.08, 0.16].map((y, idx) => (
            <mesh key={idx} position={[0, y - 0.08, 0]} rotation={[Math.PI / 2, 0, idx * 0.4]} castShadow>
              <torusGeometry args={[0.26 - idx * 0.02, 0.048, 10, 24]} />
              <meshStandardMaterial color={idx === 1 ? '#573628' : '#7a6548'} roughness={0.96} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
};
