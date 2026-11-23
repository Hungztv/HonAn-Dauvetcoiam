import React, { useMemo } from 'react';
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
  BrightnessContrast,
} from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';
import { useGameStore } from '../store/gameStore';
import { QUALITY_PROFILES } from './AssetPipeline';

export const HorrorPostProcessing: React.FC = () => {
  const graphicsQuality = useGameStore((s) => s.settings.graphicsQuality);
  const reduceFlashing = useGameStore((s) => s.settings.reduceFlashing);
  const supernaturalGlitch = useGameStore((s) => s.supernaturalGlitch);
  const horrorIntensity = useGameStore((s) => s.horrorIntensity);
  const activeJumpscare = useGameStore((s) => s.activeJumpscare);

  const profile = QUALITY_PROFILES[graphicsQuality];

  const aberrationOffset = useMemo(() => {
    const base = reduceFlashing ? 0.0004 : 0.0006;
    const spike = activeJumpscare
      ? reduceFlashing
        ? 0.003
        : 0.009
      : supernaturalGlitch * (reduceFlashing ? 0.002 : 0.0045) + horrorIntensity * 0.0009;
    const strength = base + spike;
    return new THREE.Vector2(strength, strength * 0.7);
  }, [activeJumpscare, supernaturalGlitch, horrorIntensity, reduceFlashing]);

  if (!profile.enablePostProcessing) {
    return null;
  }

  // MEDIUM preset: lightweight Bloom + Vignette only for high FPS on integrated GPUs
  if (!profile.fullPostProcessing) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.3} intensity={0.5} />
        <Vignette eskil={false} offset={0.24} darkness={0.65} />
      </EffectComposer>
    );
  }

  // HIGH / ULTRA preset: selective cinematic Bloom + subtle Chromatic + Grain + Contrast grading
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        luminanceThreshold={0.82}
        luminanceSmoothing={0.35}
        intensity={graphicsQuality === 'ultra' ? 0.74 : 0.62}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={aberrationOffset}
        radialModulation={false}
        modulationOffset={0.15}
      />
      <BrightnessContrast
        brightness={-0.02}
        contrast={graphicsQuality === 'ultra' ? 0.09 : 0.06}
      />
      <Noise opacity={0.036} premultiply blendFunction={BlendFunction.ADD} />
      <Vignette eskil={false} offset={0.22} darkness={0.72} />
    </EffectComposer>
  );
};
