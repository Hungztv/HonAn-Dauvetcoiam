import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Vec3 } from '../types/game';

/** Custom GLSL animated dark moonlit water shader with subtle crimson shimmer */
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
      <planeGeometry args={[size[0], size[1], 32, 32]} />
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
            float w1 = sin(pos.x * 1.6 + uTime * 1.4) * 0.035;
            float w2 = cos(pos.y * 2.1 - uTime * 1.1) * 0.028;
            float w3 = sin((pos.x + pos.y) * 2.8 + uTime * 1.9) * 0.015;
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
            float ripple = smoothstep(0.018, 0.068, vWave);
            float shimmer = pow(max(0.0, sin(vUv.x * 28.0 + uTime * 1.8) * cos(vUv.y * 24.0 - uTime * 1.3)), 4.0);
            float lanternReflect = exp(-pow((vUv.x - 0.5) * 3.8, 2.0)) * (0.35 + 0.35 * sin(vUv.y * 30.0 - uTime * 3.5));
            vec3 col = mix(uBaseColor, uHighlightColor, ripple * 0.36 + shimmer * 0.25);
            col += uCrimsonColor * lanternReflect * 0.28;
            gl_FragColor = vec4(col, 0.92);
          }
        `}
      />
    </mesh>
  );
};

/** Soft radial mist sprite texture cached once */
function createMistTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  const grad = ctx.createRadialGradient(128, 128, 12, 128, 128, 125);
  grad.addColorStop(0, 'rgba(210, 218, 224, 0.32)');
  grad.addColorStop(0.5, 'rgba(175, 185, 195, 0.14)');
  grad.addColorStop(1, 'rgba(150, 160, 170, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** Drifting knee-height ground mist layers for Unity-style volumetric atmosphere */
export const GroundMist: React.FC<{
  color?: string;
  opacity?: number;
  y?: number;
  spread?: number;
}> = ({ color = '#9aa7b0', opacity = 0.26, y = 0.28, spread = 16 }) => {
  const groupRef = useRef<THREE.Group | null>(null);
  const mistTex = useMemo(() => createMistTexture(), []);

  const patches = useMemo(() => {
    const arr: { pos: Vec3; scale: number; speed: number; phase: number }[] = [];
    for (let i = 0; i < 14; i++) {
      const angle = (i / 14) * Math.PI * 2;
      const dist = (i % 3) * (spread * 0.28) + 1.5;
      arr.push({
        pos: [Math.cos(angle) * dist, y + (i % 3) * 0.16, Math.sin(angle) * dist],
        scale: 5.5 + (i % 4) * 2.2,
        speed: 0.12 + (i % 3) * 0.05,
        phase: i * 1.1,
      });
    }
    return arr;
  }, [y, spread]);

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
            blending={THREE.NormalBlending}
          />
        </mesh>
      ))}
    </group>
  );
};

/** Gentle rising incense smoke wisps above altars */
export const IncenseSmoke: React.FC<{ position: Vec3 }> = ({ position }) => {
  const ref = useRef<THREE.Group | null>(null);
  const smokeTex = useMemo(() => createMistTexture(), []);

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
        mat.opacity = Math.sin(cycle * Math.PI) * 0.28;
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

/** Glowing Pale Full Moon in the misty night sky */
export const NightMoon: React.FC<{ position?: Vec3; color?: string }> = ({
  position = [18, 20, -28],
  color = '#d9e3f0',
}) => {
  return (
    <group position={position}>
      <mesh>
        <sphereGeometry args={[2.2, 24, 24]} />
        <meshBasicMaterial color={color} fog={false} />
      </mesh>
      <mesh scale={2.1}>
        <sphereGeometry args={[2.2, 16, 16]} />
        <meshBasicMaterial color="#7e94b5" transparent opacity={0.14} fog={false} />
      </mesh>
    </group>
  );
};
