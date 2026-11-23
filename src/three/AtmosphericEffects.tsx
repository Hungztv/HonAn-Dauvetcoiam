import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vec3 } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { QUALITY_PROFILES } from './AssetPipeline';

/** Cached mist sprite texture so switching levels never leaks GPU textures */
let cachedMistTexture: THREE.CanvasTexture | null = null;

function getMistTexture(): THREE.CanvasTexture {
  if (cachedMistTexture) return cachedMistTexture;
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 125);
  grad.addColorStop(0, 'rgba(210, 218, 224, 0.30)');
  grad.addColorStop(0.5, 'rgba(175, 185, 195, 0.13)');
  grad.addColorStop(1, 'rgba(150, 160, 170, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  cachedMistTexture = tex;
  return tex;
}

/** Custom GLSL animated dark moonlit water shader with Fresnel & crimson lantern shimmer */
export const AnimatedWater: React.FC<{
  position: Vec3;
  size: [number, number];
  tint?: string;
}> = ({ position, size, tint = '#0b1d24' }) => {
  const matRef = useRef<THREE.ShaderMaterial | null>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBaseColor: { value: new THREE.Color(tint) },
      uHighlightColor: { value: new THREE.Color('#6b8fa3') },
      uCrimsonColor: { value: new THREE.Color('#8c1d1d') },
    }),
    [tint]
  );

  useFrame((_, delta) => {
    if (matRef.current) {
      matRef.current.uniforms.uTime.value += Math.min(delta, 0.05);
    }
  });

  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[size[0], size[1], 28, 28]} />
      <shaderMaterial
        ref={matRef}
        transparent
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            vUv = uv;
            vec3 pos = position;
            float w1 = sin(pos.x * 1.6 + uTime * 1.4) * 0.032;
            float w2 = cos(pos.y * 2.1 - uTime * 1.1) * 0.025;
            float w3 = sin((pos.x + pos.y) * 2.8 + uTime * 1.9) * 0.014;
            pos.z += w1 + w2 + w3;
            vWave = w1 + w2 + w3;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uBaseColor;
          uniform vec3 uHighlightColor;
          uniform vec3 uCrimsonColor;
          varying vec2 vUv;
          varying float vWave;
          void main() {
            float ripple = smoothstep(0.018, 0.064, vWave);
            float shimmer = pow(max(0.0, sin(vUv.x * 26.0 + uTime * 1.8) * cos(vUv.y * 22.0 - uTime * 1.3)), 4.0);
            float lanternReflect = exp(-pow((vUv.x - 0.5) * 3.8, 2.0)) * (0.35 + 0.35 * sin(vUv.y * 28.0 - uTime * 3.4));
            vec3 col = mix(uBaseColor, uHighlightColor, ripple * 0.36 + shimmer * 0.24);
            col += uCrimsonColor * lanternReflect * 0.26;
            gl_FragColor = vec4(col, 0.92);
          }
        `}
      />
    </mesh>
  );
};

/** Drifting knee-height ground mist layers scaled to active quality preset */
export const GroundMist: React.FC<{
  color?: string;
  opacity?: number;
  y?: number;
  spread?: number;
}> = ({ color = '#9aa7b0', opacity = 0.24, y = 0.28, spread = 16 }) => {
  const quality = useGameStore((s) => s.settings.graphicsQuality);
  const count = QUALITY_PROFILES[quality].mistPatchCount;
  const groupRef = useRef<THREE.Group | null>(null);
  const mistTex = useMemo(() => getMistTexture(), []);

  const patches = useMemo(() => {
    const arr: { pos: Vec3; scale: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = (i % 3) * (spread * 0.28) + 1.5;
      arr.push({
        pos: [Math.cos(angle) * dist, y + (i % 3) * 0.16, Math.sin(angle) * dist],
        scale: 5.5 + (i % 4) * 2.2,
        speed: 0.12 + (i % 3) * 0.05,
        phase: i * 1.1,
      });
    }
    return arr;
  }, [y, spread, count]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.children.forEach((child, idx) => {
      const p = patches[idx];
      if (!p) return;
      child.rotation.z = t * p.speed * (idx % 2 === 0 ? 1 : -1) * 0.25;
      child.position.x = p.pos[0] + Math.sin(t * p.speed + p.phase) * 0.9;
      child.position.z = p.pos[2] + Math.cos(t * p.speed + p.phase) * 0.9;
    });
  });

  return (
    <group ref={groupRef}>
      {patches.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[p.scale, p.scale]} />
          <meshBasicMaterial
            map={mistTex}
            color={color}
            transparent
            opacity={opacity}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
};

/** Gentle rising incense smoke wisps above altars */
export const IncenseSmoke: React.FC<{ position: Vec3 }> = ({ position }) => {
  const ref = useRef<THREE.Group | null>(null);
  const smokeTex = useMemo(() => getMistTexture(), []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.children.forEach((child, i) => {
      const cycle = (t * 0.24 + i * 0.25) % 1;
      child.position.y = cycle * 1.35;
      child.position.x = Math.sin(t * 1.2 + i * 2) * 0.12 * cycle;
      child.position.z = Math.cos(t * 0.9 + i * 1.7) * 0.08 * cycle;
      const sc = 0.25 + cycle * 0.65;
      child.scale.set(sc, sc, sc);
      const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = Math.sin(cycle * Math.PI) * 0.26;
      }
    });
  });

  return (
    <group ref={ref} position={position}>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i}>
          <planeGeometry args={[0.7, 0.7]} />
          <meshBasicMaterial
            map={smokeTex}
            color="#d8d2c5"
            transparent
            opacity={0.2}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
};

/** GPU-Instanced Night Drizzle (1 single draw call!) for stormy outdoor levels */
export const InstancedRain: React.FC<{ area?: number; height?: number }> = ({
  area = 24,
  height = 10,
}) => {
  const quality = useGameStore((s) => s.settings.graphicsQuality);
  const count = QUALITY_PROFILES[quality].rainCount;
  const meshRef = useRef<THREE.InstancedMesh | null>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const drops = useMemo(() => {
    const arr: { x: number; y: number; z: number; speed: number }[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * area,
        y: Math.random() * height,
        z: (Math.random() - 0.5) * area,
        speed: 8.5 + Math.random() * 4.5,
      });
    }
    return arr;
  }, [count, area, height]);

  useEffect(() => {
    return () => {
      meshRef.current?.geometry.dispose();
    };
  }, []);

  useFrame((_, rawDelta) => {
    if (!meshRef.current || count === 0) return;
    const delta = Math.min(rawDelta, 0.05);
    for (let i = 0; i < count; i++) {
      const d = drops[i];
      d.y -= d.speed * delta;
      if (d.y < 0.1) d.y = height;
      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(0, 0, 0.08);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  if (count === 0) return null;

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]} frustumCulled={false}>
      <cylinderGeometry args={[0.006, 0.006, 0.42, 4]} />
      <meshBasicMaterial color="#9cb6c9" transparent opacity={0.28} depthWrite={false} />
    </instancedMesh>
  );
};

/** Glowing Pale Full Moon in the misty night sky */
export const NightMoon: React.FC<{ position?: Vec3; color?: string }> = ({
  position = [18, 20, -28],
  color = '#d9e3f0',
}) => {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[2.2, 20, 20]} />
        <meshBasicMaterial color={color} fog={false} />
      </mesh>
      <mesh scale={2.1}>
        <sphereGeometry args={[2.2, 14, 14]} />
        <meshBasicMaterial color="#7e94b5" transparent opacity={0.14} fog={false} />
      </mesh>
    </group>
  );
};
