import React, { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Sparkles, Text } from '@react-three/drei';
import * as THREE from 'three';
import { LevelData, PuzzleStation, WorldDoor, WorldLamp } from '../types/game';
import { getWorldMaterial, createCalligraphyTexture } from './proceduralTextures';
import { EvidenceModel } from './EvidenceModels';
import { VietnameseLevelSetpieces } from './VietnameseProps';
import { QUALITY_PROFILES } from './AssetPipeline';
import { useGameStore } from '../store/gameStore';
import { horrorAudio } from '../audio/horrorAudio';

interface LevelEnvironmentProps {
  level: LevelData;
}

const FlickeringLamp: React.FC<{ lamp: WorldLamp; extinguished: boolean }> = ({ lamp, extinguished }) => {
  const lightRef = useRef<THREE.PointLight | null>(null);
  const swayRef = useRef<THREE.Group | null>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (swayRef.current && lamp.type === 'lantern') {
      swayRef.current.rotation.z = Math.sin(t * 1.4 + lamp.position[0]) * 0.06;
      swayRef.current.rotation.x = Math.cos(t * 1.1 + lamp.position[2]) * 0.04;
    }
    if (!lightRef.current) return;
    if (extinguished) {
      lightRef.current.intensity = 0;
      return;
    }
    if (lamp.flicker) {
      const wave =
        Math.sin(t * 7.2 + lamp.position[0]) * 0.14 +
        Math.sin(t * 15.7 + lamp.position[2]) * 0.09;
      lightRef.current.intensity = Math.max(0.25, lamp.intensity * (1 + wave));
    }
  });

  return (
    <group ref={swayRef} position={lamp.position}>
      <pointLight
        ref={lightRef}
        color={lamp.color}
        intensity={extinguished ? 0 : lamp.intensity}
        distance={lamp.distance}
        decay={1.75}
      />
      {lamp.type === 'oil_lamp' && (
        <group>
          {/* Brass & terracotta lamp base */}
          <mesh position={[0, -0.11, 0]}>
            <cylinderGeometry args={[0.075, 0.11, 0.13, 14]} />
            <meshStandardMaterial color="#4a2e1a" roughness={0.55} metalness={0.35} />
          </mesh>
          {/* Brass collar */}
          <mesh position={[0, -0.03, 0]}>
            <cylinderGeometry args={[0.055, 0.065, 0.04, 12]} />
            <meshStandardMaterial color="#b58d3b" roughness={0.35} metalness={0.8} />
          </mesh>
          {/* Inner glowing flame core (triggers Bloom!) */}
          {!extinguished && (
            <mesh position={[0, 0.025, 0]}>
              <sphereGeometry args={[0.028, 10, 10]} />
              <meshStandardMaterial
                color="#fff3c4"
                emissive="#ff9524"
                emissiveIntensity={4.5}
              />
            </mesh>
          )}
          {/* Glass chimney */}
          <mesh position={[0, 0.06, 0]}>
            <cylinderGeometry args={[0.042, 0.058, 0.19, 12]} />
            <meshStandardMaterial
              color="#ffe4b5"
              emissive={extinguished ? '#000000' : '#ff8c24'}
              emissiveIntensity={extinguished ? 0 : 0.7}
              transparent
              opacity={0.42}
              roughness={0.15}
            />
          </mesh>
        </group>
      )}
      {lamp.type === 'lantern' && (
        <group>
          {/* Hanging cord */}
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.01, 0.01, 0.3, 6]} />
            <meshStandardMaterial color="#1f1610" />
          </mesh>
          {/* Top & bottom lacquered caps */}
          <mesh position={[0, 0.19, 0]}>
            <cylinderGeometry args={[0.09, 0.12, 0.045, 12]} />
            <meshStandardMaterial color="#2b170e" roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.19, 0]}>
            <cylinderGeometry args={[0.12, 0.09, 0.045, 12]} />
            <meshStandardMaterial color="#2b170e" roughness={0.6} />
          </mesh>
          {/* Glowing crimson silk lantern body */}
          <mesh scale={[1, 1.15, 1]}>
            <sphereGeometry args={[0.17, 16, 14]} />
            <meshStandardMaterial
              color="#b91c1c"
              emissive={extinguished ? '#000000' : '#ef3b2d'}
              emissiveIntensity={extinguished ? 0 : 2.8}
              roughness={0.6}
            />
          </mesh>
          {/* Golden silk tassel */}
          <mesh position={[0, -0.32, 0]}>
            <coneGeometry args={[0.032, 0.22, 8]} />
            <meshStandardMaterial color="#c99b3b" roughness={0.75} />
          </mesh>
        </group>
      )}
      {lamp.type === 'incense' && (
        <mesh>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial
            color="#ff511a"
            emissive={extinguished ? '#000000' : '#ff3300'}
            emissiveIntensity={extinguished ? 0 : 3.2}
          />
        </mesh>
      )}
    </group>
  );
};

const InteractiveDoorMesh: React.FC<{ door: WorldDoor; isOpen: boolean; isTargeted: boolean }> = ({
  door,
  isOpen,
  isTargeted,
}) => {
  const pivotRef = useRef<THREE.Group | null>(null);
  const woodMat = useMemo(() => getWorldMaterial('wood_dark'), []);
  const talismanTex = useMemo(() => createCalligraphyTexture('PHONG ẤN CẤM ĐỊA', '#d8b454', '#8b0f0f'), []);

  useFrame((_, delta) => {
    if (!pivotRef.current) return;
    const targetRot = (door.rotationY ?? 0) + (isOpen ? Math.PI * 0.48 : 0);
    pivotRef.current.rotation.y = THREE.MathUtils.lerp(
      pivotRef.current.rotation.y,
      targetRot,
      Math.min(1, delta * 5.5)
    );
  });

  return (
    <group ref={pivotRef} position={door.position}>
      <mesh material={woodMat} castShadow receiveShadow>
        <boxGeometry args={door.size} />
      </mesh>
      {/* Brass door handle / ring */}
      <mesh position={[door.size[0] * 0.34, 0, door.size[2] / 2 + 0.03]}>
        <torusGeometry args={[0.06, 0.015, 8, 16]} />
        <meshStandardMaterial
          color={isTargeted ? '#f5cf6e' : '#8f6c2e'}
          emissive={isTargeted ? '#a16207' : '#000000'}
          emissiveIntensity={isTargeted ? 0.6 : 0}
          metalness={0.8}
          roughness={0.35}
        />
      </mesh>
      {/* Sealing talisman strips if sealed */}
      {door.hasTalisman && !isOpen && (
        <>
          <mesh position={[0, 0.25, door.size[2] / 2 + 0.015]} rotation={[0, 0, 0.35]}>
            <planeGeometry args={[0.24, 0.72]} />
            <meshStandardMaterial map={talismanTex} side={THREE.DoubleSide} />
          </mesh>
          <mesh position={[0, 0.25, door.size[2] / 2 + 0.018]} rotation={[0, 0, -0.35]}>
            <planeGeometry args={[0.24, 0.72]} />
            <meshStandardMaterial map={talismanTex} side={THREE.DoubleSide} />
          </mesh>
        </>
      )}
    </group>
  );
};

const PuzzleStationMesh: React.FC<{
  station: PuzzleStation;
  isSolved: boolean;
  isTargeted: boolean;
}> = ({ station, isSolved, isTargeted }) => {
  const glowRef = useRef<THREE.Mesh | null>(null);

  useFrame((state) => {
    if (glowRef.current) {
      const s = 1 + Math.sin(state.clock.elapsedTime * 3.2) * 0.08;
      glowRef.current.scale.set(s, s, s);
    }
  });

  const accentColor = isSolved ? '#3f7d58' : isTargeted ? '#eab308' : '#b91c1c';

  return (
    <group position={station.position}>
      {station.visualType === 'festival_drum' ? (
        <group>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.52, 0.52, 0.68, 20]} />
            <meshStandardMaterial color="#6e1717" roughness={0.65} />
          </mesh>
          <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.48, 0.48, 0.02, 20]} />
            <meshStandardMaterial color="#cdb584" roughness={0.88} />
          </mesh>
        </group>
      ) : station.visualType === 'well_winch' ? (
        <group>
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.14, 1.1, 12]} />
            <meshStandardMaterial color="#3b2619" roughness={0.85} />
          </mesh>
          <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.04, 8, 16]} />
            <meshStandardMaterial color="#705d43" roughness={0.95} />
          </mesh>
        </group>
      ) : (
        <group>
          <mesh castShadow>
            <boxGeometry args={[0.62, 0.44, 0.44]} />
            <meshStandardMaterial color="#3a1912" roughness={0.72} />
          </mesh>
          <mesh position={[0, 0.24, 0]}>
            <cylinderGeometry args={[0.18, 0.22, 0.06, 16]} />
            <meshStandardMaterial color="#9c7934" metalness={0.75} roughness={0.35} />
          </mesh>
        </group>
      )}

      {/* Subtle supernatural seal aura */}
      <mesh ref={glowRef} position={[0, 0.42, 0]}>
        <octahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={isTargeted ? 2.2 : 1.1}
          transparent
          opacity={0.85}
        />
      </mesh>
    </group>
  );
};

/** Shadow figure or moving wooden statue driven by Dynamic Horror System */
const HorrorEntity: React.FC<{
  anchor: LevelData['horrorAnchors'][number];
  horrorIntensity: number;
  flashlightOn: boolean;
}> = ({ anchor, horrorIntensity, flashlightOn }) => {
  const { camera } = useThree();
  const groupRef = useRef<THREE.Group | null>(null);
  const vanishedRef = useRef(false);
  const camDir = useMemo(() => new THREE.Vector3(), []);
  const toMe = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const visible = horrorIntensity >= anchor.minHorror;

    if (anchor.type === 'shadow_figure') {
      if (!visible) {
        groupRef.current.visible = false;
        return;
      }
      toMe.set(
        anchor.position[0] - camera.position.x,
        0,
        anchor.position[2] - camera.position.z
      );
      const dist = toMe.length();
      camera.getWorldDirection(camDir);
      const dot = camDir.dot(toMe.clone().normalize());

      // Vanish eerily if player shines flashlight directly from close range
      if (flashlightOn && dist < 4.5 && dot > 0.94) {
        vanishedRef.current = true;
      }
      if (dist > 8 && dot < 0.2) {
        vanishedRef.current = false; // Reappears when player looks away!
      }
      groupRef.current.visible = !vanishedRef.current;
      // Subtle ghostly sway
      groupRef.current.position.y = anchor.position[1] + Math.sin(state.clock.elapsedTime * 1.8) * 0.04;
      groupRef.current.lookAt(camera.position.x, anchor.position[1], camera.position.z);
    }

    if (anchor.type === 'moving_statue') {
      // Classic creepy mechanic: wooden temple statue rotates toward player ONLY when outside player's view!
      toMe.set(
        anchor.position[0] - camera.position.x,
        0,
        anchor.position[2] - camera.position.z
      ).normalize();
      camera.getWorldDirection(camDir);
      const lookingAtMe = camDir.dot(toMe) > 0.55;
      if (!lookingAtMe && horrorIntensity >= anchor.minHorror) {
        const targetAngle = Math.atan2(
          camera.position.x - anchor.position[0],
          camera.position.z - anchor.position[2]
        );
        groupRef.current.rotation.y = THREE.MathUtils.lerp(
          groupRef.current.rotation.y,
          targetAngle,
          Math.min(1, delta * 1.4)
        );
      }
    }

    if (anchor.type === 'faceless_passenger') {
      groupRef.current.position.y = anchor.position[1] + Math.sin(state.clock.elapsedTime * 1.3 + anchor.position[0]) * 0.05;
    }
  });

  if (anchor.type === 'wall_script') {
    if (horrorIntensity < anchor.minHorror) return null;
    return (
      <Text
        position={anchor.position}
        rotation={[0, anchor.rotationY ?? 0, 0]}
        fontSize={0.22}
        maxWidth={2.4}
        color="#7a1111"
        anchorX="center"
        anchorY="middle"
      >
        {anchor.text ?? 'ĐỪNG QUAY LẠI'}
      </Text>
    );
  }

  if (anchor.type === 'moving_statue') {
    return (
      <group ref={groupRef} position={anchor.position} rotation={[0, anchor.rotationY ?? 0, 0]}>
        {/* Pedestal */}
        <mesh position={[0, 0.35, 0]} castShadow>
          <boxGeometry args={[0.72, 0.7, 0.72]} />
          <meshStandardMaterial color="#3b2619" roughness={0.85} />
        </mesh>
        {/* Wooden guardian body */}
        <mesh position={[0, 1.25, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.32, 1.15, 10]} />
          <meshStandardMaterial color="#592218" roughness={0.72} />
        </mesh>
        {/* Carved head */}
        <mesh position={[0, 1.98, 0]} castShadow>
          <sphereGeometry args={[0.19, 12, 12]} />
          <meshStandardMaterial color="#a68358" roughness={0.68} />
        </mesh>
        {/* Eyes facing +Z so player notices when statue turns! */}
        <mesh position={[-0.07, 2.0, 0.17]}>
          <sphereGeometry args={[0.026, 8, 8]} />
          <meshStandardMaterial color="#0b0807" />
        </mesh>
        <mesh position={[0.07, 2.0, 0.17]}>
          <sphereGeometry args={[0.026, 8, 8]} />
          <meshStandardMaterial color="#0b0807" />
        </mesh>
        {/* Mandarinal hat */}
        <mesh position={[0, 2.18, 0]}>
          <cylinderGeometry args={[0.22, 0.18, 0.18, 8]} />
          <meshStandardMaterial color="#1f1410" roughness={0.75} />
        </mesh>
      </group>
    );
  }

  // Shadow figure / faceless passenger sculpted silhouette (Vietnamese áo dài / conical hat)
  const isRedBride = anchor.id.includes('bride') || anchor.id.includes('co_do');
  return (
    <group ref={groupRef} position={anchor.position} rotation={[0, anchor.rotationY ?? 0, 0]}>
      {/* Draped lower skirt / robe */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.42, 1.1, 14]} />
        <meshStandardMaterial
          color={isRedBride ? '#590b0b' : '#09080a'}
          emissive={isRedBride ? '#360505' : '#000000'}
          transparent
          opacity={0.92}
          roughness={0.88}
        />
      </mesh>
      {/* Torso & shoulders */}
      <mesh position={[0, 1.32, 0]} castShadow>
        <cylinderGeometry args={[0.22, 0.19, 0.52, 12]} />
        <meshStandardMaterial
          color={isRedBride ? '#6b0f0f' : '#0b0a0d'}
          emissive={isRedBride ? '#420606' : '#000000'}
          roughness={0.85}
        />
      </mesh>
      {/* Draped sleeves */}
      <mesh position={[-0.26, 1.18, 0.04]} rotation={[0.1, 0, 0.2]}>
        <cylinderGeometry args={[0.065, 0.11, 0.62, 8]} />
        <meshStandardMaterial color={isRedBride ? '#590b0b' : '#09080a'} roughness={0.9} />
      </mesh>
      <mesh position={[0.26, 1.18, 0.04]} rotation={[0.1, 0, -0.2]}>
        <cylinderGeometry args={[0.065, 0.11, 0.62, 8]} />
        <meshStandardMaterial color={isRedBride ? '#590b0b' : '#09080a'} roughness={0.9} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.72, 0]}>
        <sphereGeometry args={[0.145, 14, 14]} />
        <meshStandardMaterial
          color={anchor.type === 'faceless_passenger' ? '#d4cab5' : isRedBride ? '#c4bdb0' : '#0a090c'}
          roughness={0.75}
        />
      </mesh>
      {/* Long tangled dark hair shroud for female ghost / shadow */}
      {anchor.type !== 'faceless_passenger' && (
        <mesh position={[0, 1.56, -0.04]}>
          <cylinderGeometry args={[0.16, 0.24, 0.58, 12]} />
          <meshStandardMaterial color="#050406" roughness={0.95} />
        </mesh>
      )}
      {/* Conical Vietnamese hat (Nón lá) for Ferryboat passengers */}
      {anchor.type === 'faceless_passenger' && (
        <mesh position={[0, 1.88, 0]} castShadow>
          <coneGeometry args={[0.42, 0.22, 20]} />
          <meshStandardMaterial color="#6e5a3b" roughness={0.95} />
        </mesh>
      )}
    </group>
  );
};

export const LevelEnvironment: React.FC<LevelEnvironmentProps> = ({ level }) => {
  const { camera, gl, scene } = useThree();
  const progress = useGameStore((s) => s.progressByLevel[level.id]);
  const narrative = useGameStore((s) => s.narrative);
  const settings = useGameStore((s) => s.settings);
  const targeted = useGameStore((s) => s.targetedInteractable);
  const horrorIntensity = useGameStore((s) => s.horrorIntensity);
  const flashlightOn = useGameStore((s) => s.flashlightOn);
  const extinguishedLampIds = useGameStore((s) => s.extinguishedLampIds);
  const overlay = useGameStore((s) => s.overlay);
  const screen = useGameStore((s) => s.screen);
  const triggerHorrorEvent = useGameStore((s) => s.triggerHorrorEvent);
  const triggerJumpscare = useGameStore((s) => s.triggerJumpscare);
  const markZoneScareTriggered = useGameStore((s) => s.markZoneScareTriggered);
  const clearWhisper = useGameStore((s) => s.clearWhisper);
  const setPerfStats = useGameStore((s) => s.setPerfStats);

  const eventTimerRef = useRef(11);
  const whisperClearRef = useRef(0);
  const perfFramesRef = useRef(0);
  const perfAccumRef = useRef(0);
  const camDir = useMemo(() => new THREE.Vector3(), []);

  const qualityProfile = QUALITY_PROFILES[settings.graphicsQuality];

  // Dynamic Horror & Jumpscare Event Director + Real GPU Telemetry
  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);

    // Real measured FPS & scene geometry telemetry (sampled every 0.6s)
    perfFramesRef.current += 1;
    perfAccumRef.current += rawDelta;
    if (perfAccumRef.current >= 0.6) {
      const fps = Math.round(perfFramesRef.current / perfAccumRef.current);
      const frameTimeMs = Number(((perfAccumRef.current / perfFramesRef.current) * 1000).toFixed(1));
      // Count actual visible scene meshes & triangles (since EffectComposer resets gl.info.render to the final quad)
      let meshCalls = 0;
      let sceneTris = 0;
      scene.traverse((obj) => {
        const m = obj as THREE.Mesh;
        if (!m.visible || !m.geometry) return;
        const isInst = (m as THREE.InstancedMesh).isInstancedMesh;
        const count = isInst ? (m as THREE.InstancedMesh).count : 1;
        meshCalls += 1;
        const index = m.geometry.index;
        const posAttr = m.geometry.attributes?.position;
        if (index) sceneTris += (index.count / 3) * count;
        else if (posAttr) sceneTris += (posAttr.count / 3) * count;
      });
      setPerfStats({
        fps,
        frameTimeMs,
        drawCalls: Math.max(gl.info.render.calls, meshCalls),
        triangles: Math.max(gl.info.render.triangles, Math.round(sceneTris)),
      });
      perfFramesRef.current = 0;
      perfAccumRef.current = 0;
    }

    if (screen !== 'playing' || overlay !== 'none') return;

    if (whisperClearRef.current > 0) {
      whisperClearRef.current -= delta;
      if (whisperClearRef.current <= 0) {
        clearWhisper();
      }
    }

    // 1. Story-driven Location / Proximity Jumpscare Zones per Level (fires once each!)
    const px = camera.position.x;
    const pz = camera.position.z;

    if (level.id === 1) {
      if (pz > 5.8 && Math.abs(px) < 2.6 && markZoneScareTriggered('l1_well_scare')) {
        triggerJumpscare('blood_hands', '“CON ƠI... ĐỪNG LẠI GẦN GIẾNG!”', true);
      }
      if (px > 4.2 && pz < 1.5 && markZoneScareTriggered('l1_sealed_scare')) {
        triggerJumpscare('pale_bride', '“AI DÁM XÉ BÙA BUỒNG ĐÔNG 1988?!”', true);
      }
    } else if (level.id === 2) {
      if (px < -3.5 && pz > 0.8 && pz < 4.8 && markZoneScareTriggered('l2_banyan_scare')) {
        triggerJumpscare('pale_bride', '“ÁO ĐỎ ĐÂY RỒI... KIỆU HOA ĐÂU?!”', true);
      }
      if (pz < -6.8 && markZoneScareTriggered('l2_inner_scare')) {
        triggerJumpscare('pale_bride', '“TRẢ LẠI TÊN CHO ĐÀO THỊ MÂY!”', true);
      }
    } else if (level.id === 3) {
      if (Math.hypot(px, pz) < 2.9 && markZoneScareTriggered('l3_well_scare')) {
        triggerJumpscare('blood_hands', '“18/08/1978... SAO CHỈ KÉO MỘT GIỎ LÊN?!”', true);
      }
      if (pz < -6.3 && Math.abs(px) < 3.5 && markZoneScareTriggered('l3_headman_scare')) {
        triggerJumpscare('faceless_ferryman', '“NGƯƠI BIẾT HUYẾT THỐNG CỦA MÌNH RỒI SAO?!”', true);
      }
    } else if (level.id === 4) {
      if (Math.abs(px) > 5.2 && pz < 5.5 && pz > -4.0 && markZoneScareTriggered('l4_statue_scare')) {
        triggerJumpscare('statue_face', '“ĐỪNG QUAY LƯNG LẠI VỚI CHÚNG TA!”', true);
      }
      if (pz < -7.2 && markZoneScareTriggered('l4_sanctum_scare')) {
        triggerJumpscare('statue_face', '“SẮC PHONG 1958 ĐÃ BỊ TRÁO!”', true);
      }
    } else if (level.id === 5) {
      if (pz < -4.8 && markZoneScareTriggered('l5_boat_scare')) {
        triggerJumpscare('faceless_ferryman', '“ĐÒ NHỔ SÀO RỒI... HÃY PHÁN QUYẾT ĐI!”', true);
      }
    }

    // 2. Periodic Dynamic Psychological Horror + Moral-Choice-Reactive Events
    eventTimerRef.current -= delta * (0.7 + horrorIntensity * 1.15);
    if (eventTimerRef.current <= 0) {
      eventTimerRef.current = 14 + Math.random() * 14;
      const roll = Math.random();
      camera.getWorldDirection(camDir);
      const behindPos: [number, number, number] = [
        camera.position.x - camDir.x * 3.2,
        1.2,
        camera.position.z - camDir.z * 3.2,
      ];

      const whisperPool = [
        ...level.horrorWhispers,
        ...(narrative.isNewGamePlus && level.ngPlusWhispers ? level.ngPlusWhispers : []),
        ...(narrative.moralChoices.fate_dao_thi_may === 'keep'
          ? ['“Ngươi giữ linh hồn ta lại... ngươi sẽ không bao giờ yên đâu...”']
          : []),
      ];
      const whisper =
        whisperPool[Math.floor(Math.random() * whisperPool.length)] ??
        'Có ai đó đang đứng sau lưng bạn...';

      const ambushChance = narrative.spiritScore < 0 ? 0.28 : 0.18;

      if (roll < ambushChance && horrorIntensity >= 0.4) {
        const variantByLevel =
          level.id === 1 || level.id === 2
            ? 'pale_bride'
            : level.id === 3
            ? 'blood_hands'
            : level.id === 4
            ? 'statue_face'
            : 'faceless_ferryman';
        triggerJumpscare(variantByLevel, whisper, false);
      } else if (roll < 0.44) {
        horrorAudio.playFootstep('wood', false, behindPos);
        setTimeout(() => horrorAudio.playFootstep('wood', false, behindPos), 520);
        triggerHorrorEvent(whisper, 0.35);
      } else if (roll < 0.64) {
        horrorAudio.playEerieKnock(behindPos);
        triggerHorrorEvent(whisper, 0.48);
      } else if (roll < 0.8) {
        if (level.id === 1 || level.id === 2 || level.id === 5) {
          horrorAudio.playGhostLullaby(behindPos);
        } else {
          horrorAudio.playWoodenFish(behindPos);
          setTimeout(() => horrorAudio.playWoodenFish(behindPos), 460);
        }
        triggerHorrorEvent(whisper, 0.42);
      } else if (roll < 0.92 && horrorIntensity > 0.35 && level.lamps.length > 0) {
        const oilLamps = level.lamps.filter(
          (l) => l.type === 'oil_lamp' && !extinguishedLampIds.includes(l.id)
        );
        if (oilLamps.length > 1) {
          const victimLamp = oilLamps[Math.floor(Math.random() * oilLamps.length)];
          horrorAudio.playWoodCreak(victimLamp.position);
          triggerHorrorEvent('Ngọn đèn dầu vừa tự vụt tắt giữa không gian tĩnh lặng...', 0.55, victimLamp.id);
        } else {
          horrorAudio.playTempleBell(behindPos);
          triggerHorrorEvent(whisper, 0.45);
        }
      } else {
        horrorAudio.playTempleBell(behindPos);
        triggerHorrorEvent(whisper, 0.52);
      }
      whisperClearRef.current = 4.5;
    }
  });

  const openDoors = progress?.openDoorIds ?? [];
  const solvedPuzzles = progress?.solvedPuzzleIds ?? [];
  const collectedEvidence = progress?.collectedEvidenceIds ?? [];
  const currentTier = progress?.currentTier ?? 1;

  return (
    <>
      <color attach="background" args={[level.skyColor]} />
      <fog attach="fog" args={[level.fogColor, level.fogNear, level.fogFar]} />

      {/* Cool moonlight top + warm earthy ground hemisphere bounce + moon directional shadow */}
      <hemisphereLight args={['#5e7699', '#24170f', 0.45]} />
      <ambientLight color={level.ambientLightColor} intensity={level.ambientLightIntensity * 0.75} />
      <directionalLight
        position={[12, 22, 8]}
        intensity={0.52}
        color="#8aa8d1"
        castShadow={qualityProfile.shadowsEnabled}
        shadow-mapSize={[qualityProfile.shadowMapSize, qualityProfile.shadowMapSize]}
        shadow-bias={-0.0005}
      />

      {/* Unity-grade sculpted Vietnamese architectural setpieces, animated water, incense smoke & ground mist */}
      <VietnameseLevelSetpieces levelId={level.id} />

      {/* Atmospheric floating dust / incense ash / river mist particles */}
      <Sparkles
        count={qualityProfile.sparkleCount}
        scale={[26, 5, 26]}
        position={[0, 2.2, 0]}
        size={1.8}
        speed={0.25}
        opacity={0.32}
        color={level.id === 2 ? '#c47676' : level.id === 5 ? '#9ab7c4' : '#d1bf97'}
      />

      {/* World architectural boxes */}
      {level.boxes.map((box) => {
        const mat = getWorldMaterial(box.material);
        return (
          <mesh
            key={box.id}
            position={box.position}
            rotation={[0, box.rotationY ?? 0, 0]}
            material={mat}
            castShadow={box.material !== 'dirt' && box.material !== 'tile_floor' && box.material !== 'water'}
            receiveShadow
          >
            <boxGeometry args={box.size} />
          </mesh>
        );
      })}

      {/* Lamps & Oil lights */}
      {level.lamps.map((lamp) => (
        <FlickeringLamp
          key={lamp.id}
          lamp={lamp}
          extinguished={extinguishedLampIds.includes(lamp.id)}
        />
      ))}

      {/* Interactive Doors */}
      {level.doors.map((door) => (
        <InteractiveDoorMesh
          key={door.id}
          door={door}
          isOpen={openDoors.includes(door.id)}
          isTargeted={targeted?.kind === 'door' && targeted.id === door.id}
        />
      ))}

      {/* Interactive 3D Evidence Objects placed in the world */}
      {level.evidences.map((ev) => {
        if (ev.requiresTier && currentTier < ev.requiresTier) return null;
        const isTargeted = targeted?.kind === 'evidence' && targeted.id === ev.id;
        const isCollected = collectedEvidence.includes(ev.id);

        return (
          <group
            key={ev.id}
            position={ev.worldPosition}
            rotation={ev.worldRotation ?? [0, 0, 0]}
          >
            <EvidenceModel type={ev.modelType} scale={ev.worldScale ?? 0.55} />
            {/* Subtle warm highlight beacon so evidence is discoverable in the dark */}
            <pointLight
              position={[0, 0.28, 0]}
              color={isTargeted ? '#fde047' : isCollected ? '#4ade80' : '#f59e0b'}
              intensity={isTargeted ? 1.8 : isCollected ? 0.25 : 0.75}
              distance={2.1}
            />
          </group>
        );
      })}

      {/* Interactive 3D Puzzle Mechanisms */}
      {level.puzzleStations.map((station) => {
        if (station.requiresTier && currentTier < station.requiresTier) return null;
        return (
          <PuzzleStationMesh
            key={station.id}
            station={station}
            isSolved={solvedPuzzles.includes(station.puzzleId)}
            isTargeted={targeted?.kind === 'puzzle' && targeted.id === station.puzzleId}
          />
        );
      })}

      {/* Dynamic Psychological Horror Entities (including NG+ early Ferryman apparition!) */}
      {level.horrorAnchors
        .filter((anchor) => !anchor.ngPlusOnly || narrative.isNewGamePlus)
        .map((anchor) => (
          <HorrorEntity
            key={anchor.id}
            anchor={anchor}
            horrorIntensity={horrorIntensity}
            flashlightOn={flashlightOn}
          />
        ))}
    </>
  );
};
