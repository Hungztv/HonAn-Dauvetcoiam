import React, { useMemo } from 'react';
import { EffectComposer, Bloom, Vignette, Noise, ChromaticAberration } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';

export const HorrorPostProcessing: React.FC = () => {
  const graphicsQuality = useGameStore((s) => s.settings.graphicsQuality);
  const supernaturalGlitch = useGameStore((s) => s.supernaturalGlitch);
  const horrorIntensity = useGameStore((s) => s.horrorIntensity);
  const activeJumpscare = useGameStore((s) => s.activeJumpscare);

  // Chromatic aberration intensifies dynamically during horror surges & jumpscares!
  const aberrationOffset = useMemo(() => {
    const strength = activeJumpscare
      ? 0.012
      : 0.0007 + supernaturalGlitch * 0.0055 + horrorIntensity * 0.0012;
    return new THREE.Vector2(strength, strength * 0.7);
  }, [activeJumpscare, supernaturalGlitch, horrorIntensity]);

  // Keep medium quality ultra-fast by bypassing multisampled post-FX if needed
  if (graphicsQuality !== 'high') {
    return null;
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.78}
        luminanceSmoothing={0.35}
        intensity={0.72}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={aberrationOffset}
        radialModulation={false}
        modulationOffset={0.15}
      />
      <Noise opacity={0.045} premultiply blendFunction={BlendFunction.ADD} />
      <Vignette eskil={false} offset={0.22} darkness={0.72} />
    </EffectComposer>
  );
};
