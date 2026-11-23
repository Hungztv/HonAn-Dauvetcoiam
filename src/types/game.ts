export type Vec3 = [number, number, number];

export type SurfaceType = 'wood' | 'stone' | 'dirt' | 'water';

export type EvidenceModelType =
  | 'comb'
  | 'incense_bowl'
  | 'ritual_paper'
  | 'hairpin'
  | 'torn_photo'
  | 'rusted_knife'
  | 'paper_doll'
  | 'talisman'
  | 'ancient_coin'
  | 'diary'
  | 'ancestral_tablet'
  | 'royal_decree'
  | 'drum_mallet'
  | 'relief_fragment'
  | 'lantern'
  | 'rope'
  | 'ledger';

export type ImportanceLevel = 'quan_trong' | 'then_chot' | 'bo_tro';

export type GraphicsPreset = 'low' | 'medium' | 'high' | 'ultra';

export interface EvidenceHotspot {
  id: string;
  label: string;
  /** Local position on the 3D inspect model */
  position: Vec3;
  /** Detailed description revealed when clicked */
  discoveryText: string;
  /** Clue unlocked when this hotspot is examined */
  unlocksClueId: string;
  /** Optional: requires player to rotate to view this side / zoom in closer */
  requiresZoom?: boolean;
  /** Optional: normal direction hinting which face this hotspot sits on */
  faceHint?: 'front' | 'back' | 'bottom' | 'side';
}

export interface EvidenceItem {
  id: string;
  levelId: number;
  name: string;
  shortDesc: string;
  fullDesc: string;
  modelType: EvidenceModelType;
  importance: ImportanceLevel;
  worldPosition: Vec3;
  worldRotation?: Vec3;
  worldScale?: number;
  locationName: string;
  requiresTier?: 1 | 2 | 3;
  hotspots: EvidenceHotspot[];
  initialClueId?: string;
}

export interface Clue {
  id: string;
  levelId: number;
  title: string;
  summary: string;
  sourceName: string;
  tier: 1 | 2 | 3;
  boardX: number;
  boardY: number;
}

export interface Suspect {
  id: string;
  levelId: number;
  name: string;
  role: string;
  description: string;
  alibi: string;
  secretClueId?: string;
  secretNote?: string;
}

export interface BoardConnection {
  id: string;
  clueA: string;
  clueB: string;
  title: string;
  deductionText: string;
  unlocksClueId?: string;
}

export interface TieredHints {
  /** Level 1: where to observe */
  level1: string;
  /** Level 2: which group of evidence to review */
  level2: string;
  /** Level 3: logical method to apply without giving away raw answer */
  level3: string;
}

export interface CodeLockPuzzle {
  kind: 'code_lock';
  id: string;
  tier: 2 | 3;
  title: string;
  subtitle: string;
  hintNote: string;
  hints?: TieredHints;
  /** Optional board connection IDs that should be solved before or alongside */
  requiredConnectionIds?: string[];
  dials: {
    label: string;
    options: string[];
  }[];
  solution: string[];
  successNarrative: string;
}

export interface SequencePuzzle {
  kind: 'sequence';
  id: string;
  tier: 2 | 3;
  title: string;
  subtitle: string;
  hintNote: string;
  hints?: TieredHints;
  requiredConnectionIds?: string[];
  items: {
    id: string;
    label: string;
    detail: string;
  }[];
  solutionOrder: string[];
  successNarrative: string;
}

export interface DeductionQuestion {
  id: string;
  prompt: string;
  options: {
    id: string;
    label: string;
  }[];
  correctOptionId: string;
}

export interface MoralChoicePromptConfig {
  choiceId: 'fate_dao_thi_may' | 'fate_village_truth' | 'judgment_nguyen_van_khai';
  title: string;
  prompt: string;
  options: {
    value: string;
    label: string;
    consequenceHint: string;
  }[];
}

export interface DeductionPuzzle {
  kind: 'deduction';
  id: string;
  tier: 3;
  title: string;
  subtitle: string;
  hintNote: string;
  hints?: TieredHints;
  questions: DeductionQuestion[];
  /** Core Truth ID unlocked when this level's Tier 3 deduction is completed */
  unlocksCoreTruthId?:
    | 'truth_l1_sealed_room'
    | 'truth_l2_living_sacrifice'
    | 'truth_l3_twin_bloodline'
    | 'truth_l4_forged_edict';
  /** Optional moral choice locked upon completing this level's climax */
  moralChoice?: MoralChoicePromptConfig;
  successNarrative: string;
  epilogueText: string;
}

export type LevelPuzzle = CodeLockPuzzle | SequencePuzzle | DeductionPuzzle;

export interface WorldBox {
  id: string;
  position: Vec3;
  size: Vec3;
  rotationY?: number;
  material:
    | 'wood_dark'
    | 'wood_old'
    | 'plaster'
    | 'brick'
    | 'stone'
    | 'dirt'
    | 'tile_floor'
    | 'roof'
    | 'altar_red'
    | 'bamboo'
    | 'water'
    | 'curtain'
    | 'metal'
    | 'gold'
    | 'paper';
  collidable?: boolean;
  horrorText?: string;
}

export interface WorldDoor {
  id: string;
  name: string;
  position: Vec3;
  size: Vec3;
  rotationY?: number;
  lockedByPuzzleId?: string;
  lockedMessage?: string;
  hasTalisman?: boolean;
}

export interface WorldLamp {
  id: string;
  position: Vec3;
  color: string;
  intensity: number;
  distance: number;
  flicker?: boolean;
  type: 'oil_lamp' | 'lantern' | 'incense' | 'moonlight';
}

export interface PuzzleStation {
  id: string;
  puzzleId: string;
  name: string;
  promptLabel: string;
  position: Vec3;
  requiresTier?: 1 | 2 | 3;
  visualType: 'altar_seal' | 'shrine_tablet' | 'well_winch' | 'festival_drum' | 'ferry_chest' | 'truth_altar';
}

export interface SurfaceZone {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  surface: SurfaceType;
}

export interface HorrorAnchor {
  id: string;
  position: Vec3;
  type: 'shadow_figure' | 'moving_statue' | 'wall_script' | 'faceless_passenger';
  minHorror: number;
  text?: string;
  rotationY?: number;
  /** Optional: only visible during NG+ */
  ngPlusOnly?: boolean;
}

export interface TierMeta {
  tier: 1 | 2 | 3;
  title: string;
  objective: string;
  completionHint: string;
}

export interface LevelData {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  location: string;
  era: string;
  victim: string;
  synopsis: string;
  introQuote: string;
  ambientTheme: 'house' | 'shrine' | 'village' | 'temple' | 'river';
  fogColor: string;
  fogNear: number;
  fogFar: number;
  skyColor: string;
  ambientLightColor: string;
  ambientLightIntensity: number;
  spawnPosition: Vec3;
  spawnYaw: number;
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  surfaceZones: SurfaceZone[];
  tiers: [TierMeta, TierMeta, TierMeta];
  tier1RequiredClues: number;
  tier2RequiredConnections?: string[];
  tier2Puzzle: CodeLockPuzzle | SequencePuzzle;
  tier3Puzzle: DeductionPuzzle;
  evidences: EvidenceItem[];
  clues: Clue[];
  suspects: Suspect[];
  boardConnections: BoardConnection[];
  boxes: WorldBox[];
  doors: WorldDoor[];
  lamps: WorldLamp[];
  puzzleStations: PuzzleStation[];
  horrorAnchors: HorrorAnchor[];
  horrorWhispers: string[];
  /** Optional NG+ extra whisper lines */
  ngPlusWhispers?: string[];
}

export type GameScreen = 'menu' | 'chapter_intro' | 'playing' | 'level_complete' | 'ending';

export type ActiveOverlay = 'none' | 'inspect' | 'journal' | 'inventory' | 'puzzle' | 'pause' | 'settings';

export type JumpscareVariant =
  | 'pale_bride'
  | 'statue_face'
  | 'faceless_ferryman'
  | 'blood_hands';

export interface GameSettings {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  mouseSensitivity: number;
  graphicsQuality: GraphicsPreset;
  resolutionScale: number;
  cameraShake: boolean;
  reduceFlashing: boolean;
  showHints: boolean;
  enableJumpscares: boolean;
  showPerfStats: boolean;
}

export interface TargetInteractable {
  kind: 'evidence' | 'door' | 'puzzle';
  id: string;
  name: string;
  actionLabel: string;
  distance: number;
}

export interface LevelProgress {
  collectedEvidenceIds: string[];
  discoveredHotspotIds: string[];
  unlockedClueIds: string[];
  readClueIds: string[];
  solvedConnectionIds: string[];
  solvedPuzzleIds: string[];
  openDoorIds: string[];
  currentTier: 1 | 2 | 3;
  completed: boolean;
  playerPosition: Vec3;
  playerYaw: number;
}
