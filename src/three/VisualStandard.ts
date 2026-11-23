import * as THREE from 'three';

/**
 * HỒN ÁN v4.5 – REALISTIC VIETNAMESE RURAL HORROR VISUAL STANDARD
 * Unified artistic & technical reference shared across all 5 levels, lighting,
 * post-processing, and future Blender GLB asset drops.
 */

export const VISUAL_STANDARD = {
  version: '4.5.1',
  style: 'Realistic Vietnamese Rural Psychological Horror',

  /** Believable real-world Vietnamese rural architectural proportions (meters) */
  proportions: {
    eyeHeight: 1.65,
    crouchHeight: 1.05,
    doorHeight: 2.68,
    doorWidth: 1.85,
    pillarRadius: 0.165,
    plinthHeight: 0.24,
    baseboardHeight: 0.22,
    altarHeight: 1.1,
    wellRimHeight: 1.02,
    rafterHeightHouse: 3.62,
  },

  /** Deliberate dark-vs-warm lighting contrast ratios */
  lighting: {
    moonlightColor: '#84a3cc',
    moonlightIntensity: 0.62,
    hemisphereSky: '#567096',
    hemisphereGround: '#1c120b',
    hemisphereIntensity: 0.34,
    ambientMultiplier: 0.52, // Keeps shadows deep so flashlight & oil lamps matter
    oilLampColor: '#ff8e30',
    lanternColor: '#d92622',
    flashlightColor: '#fff2db',
    flashlightIntensity: 24,
    flashlightDistance: 25,
    flashlightAngle: 0.46,
    flashlightPenumbra: 0.72,
    evidenceGlintBase: 0.16, // Restrained realistic glint (no arcade neon glow)
    evidenceGlintTargeted: 0.65,
  },

  /** Restrained cinema post-processing (no cartoonish over-bloom or constant RGB blur) */
  postProcessing: {
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.08,
    bloomThreshold: 0.94,
    bloomSmoothing: 0.32,
    bloomIntensityMedium: 0.34,
    bloomIntensityHigh: 0.44,
    bloomIntensityUltra: 0.52,
    filmGrainOpacity: 0.024,
    vignetteOffset: 0.24,
    vignetteDarkness: 0.72,
    restingChromaticAberration: 0.0, // Razor-sharp during normal exploration
  },

  /** PBR surface target roughness / normal relief discipline */
  pbr: {
    woodDarkNormal: 0.85,
    woodOldNormal: 0.95,
    plasterNormal: 1.15,
    brickNormal: 1.25,
    tileFloorNormal: 0.85,
    stoneNormal: 1.35,
    dirtNormal: 1.05,
    altarLacquerNormal: 0.55,
  },
} as const;

export interface LevelVisualProfile {
  levelId: number;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  moonColor: string;
  mistColor: string;
  mistOpacity: number;
  contrastBoost: number;
  brightnessOffset: number;
}

export const LEVEL_VISUAL_PROFILES: Record<number, LevelVisualProfile> = {
  1: {
    levelId: 1,
    fogColor: '#0a0909',
    fogNear: 3.2,
    fogFar: 21,
    moonColor: '#8aaad6',
    mistColor: '#8795a6',
    mistOpacity: 0.2,
    contrastBoost: 0.08,
    brightnessOffset: -0.025,
  },
  2: {
    levelId: 2,
    fogColor: '#100809',
    fogNear: 2.8,
    fogFar: 19,
    moonColor: '#d9b8bc',
    mistColor: '#9c7478',
    mistOpacity: 0.25,
    contrastBoost: 0.09,
    brightnessOffset: -0.03,
  },
  3: {
    levelId: 3,
    fogColor: '#080c0d',
    fogNear: 3.2,
    fogFar: 21,
    moonColor: '#88a8b8',
    mistColor: '#768d96',
    mistOpacity: 0.28,
    contrastBoost: 0.08,
    brightnessOffset: -0.025,
  },
  4: {
    levelId: 4,
    fogColor: '#0d0907',
    fogNear: 3.4,
    fogFar: 23,
    moonColor: '#9da9bd',
    mistColor: '#8f7d6c',
    mistOpacity: 0.17,
    contrastBoost: 0.09,
    brightnessOffset: -0.02,
  },
  5: {
    levelId: 5,
    fogColor: '#060b0d',
    fogNear: 2.6,
    fogFar: 21,
    moonColor: '#a6c4db',
    mistColor: '#839dab',
    mistOpacity: 0.34,
    contrastBoost: 0.1,
    brightnessOffset: -0.03,
  },
};
