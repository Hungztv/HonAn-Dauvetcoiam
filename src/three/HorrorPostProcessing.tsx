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
import { LEVEL_VISUAL_PROFILES, VISUAL_STANDARD } from './VisualStandard';

export const HorrorPostProcessing: React.FC = () => {
  const graphicsQuality = useGameStore((s) => s.settings.graphicsQuality);
  const reduceFlashing = useGameStore((s) => s.settings.reduceFlashing);
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const supernaturalGlitch = useGameStore((s) => s.supernaturalGlitch);
  const activeJumpscare = useGameStore((s) => s.activeJumpscare);

  const profile = QUALITY_PROFILES[graphicsQuality];
  const levelVisual = LEVEL_VISUAL_PROFILES[currentLevelId] ?? LEVEL_VISUAL_PROFILES[1];
  const pp = VISUAL_STANDARD.postProcessing;

  // Visual Standard v4.5: Razor-sharp (0 aberration) during calm exploration; spikes only on supernatural anomalies/jumpscares
  const aberrationOffset = useMemo(() => {
    const spike = activeJumpscare
      ? reduceFlashing
        ? 0.0025
        : 0.008
      : supernaturalGlitch * (reduceFlashing ? 0.0018 : 0.0042);
    const strength = pp.restingChromaticAberration + spike;
    return new THREE.Vector2(strength, strength * 0.7);
  }, [activeJumpscare, supernaturalGlitch, reduceFlashing, pp.restingChromaticAberration]);

  if (!profile.enablePostProcessing) {
    return null;
  }

  // MEDIUM preset: lightweight restrained Bloom + Vignette for integrated GPUs
  if (!profile.fullPostProcessing) {
    return (
      <EffectComposer multisampling={0}>
        <Bloom
          mipmapBlur
          luminanceThreshold={pp.bloomThreshold}
          luminanceSmoothing={pp.bloomSmoothing}
          intensity={pp.bloomIntensityMedium}
        />
        <Vignette eskil={false} offset={pp.vignetteOffset} darkness={0.64} />
      </EffectComposer>
    );
  }

  // HIGH / ULTRA preset: restrained realistic Bloom + per-level contrast grading + fine grain + reactive chromatic aberration
  return (
    <EffectComposer multisampling={0}>
      <Bloom
        mipmapBlur
        luminanceThreshold={pp.bloomThreshold}
        luminanceSmoothing={pp.bloomSmoothing}
        intensity={graphicsQuality === 'ultra' ? pp.bloomIntensityUltra : pp.bloomIntensityHigh}
      />
      <ChromaticAberration
        blendFunction={BlendFunction.NORMAL}
        offset={aberrationOffset}
        radialModulation={false}
        modulationOffset={0.15}
      />
      <BrightnessContrast
        brightness={levelVisual.brightnessOffset}
        contrast={levelVisual.contrastBoost}
      />
      <Noise opacity={pp.filmGrainOpacity} premultiply blendFunction={BlendFunction.ADD} />
      <Vignette eskil={false} offset={pp.vignetteOffset} darkness={pp.vignetteDarkness} />
    </EffectComposer>
  );
};
