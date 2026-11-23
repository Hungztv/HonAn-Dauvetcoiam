import { create } from 'zustand';
import {
  ActiveOverlay,
  GameScreen,
  GameSettings,
  GraphicsPreset,
  JumpscareVariant,
  LevelProgress,
  TargetInteractable,
  Vec3,
} from '../types/game';
import { LEVELS, getLevelById } from '../data/levels';
import {
  CoreTruthId,
  MoralChoiceId,
  MoralChoiceValueMap,
  NarrativeState,
  applyMoralChoice,
  completeGameWithEnding,
  createInitialNarrativeState,
  sanitizeNarrativeState,
  startNewGamePlusRun,
  unlockCoreTruth,
} from '../data/narrativePack';
import { horrorAudio } from '../audio/horrorAudio';
import { NPCCharacterType } from '../horror/npc/NPCStateMachine';
import { PhysicalJumpscareEvent } from '../horror/jumpscare/PhysicalJumpscareDirector';

export const SAVE_KEY = 'hon_an_save_v1';
export const SAVE_SCHEMA_VERSION = 4;

export interface SavedPayload {
  schemaVersion: number;
  currentLevelId: number;
  unlockedLevelIds: number[];
  progressByLevel: Record<number, LevelProgress>;
  narrative: NarrativeState;
  settings: GameSettings;
  savedAt: number;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  tone: 'clue' | 'evidence' | 'tier' | 'horror' | 'info';
}

export interface PerfStats {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
}

export const defaultSettings: GameSettings = {
  masterVolume: 0.75,
  musicVolume: 0.75,
  sfxVolume: 0.85,
  mouseSensitivity: 1.0,
  graphicsQuality: 'high',
  resolutionScale: 1.0,
  cameraShake: true,
  reduceFlashing: false,
  showHints: true,
  enableJumpscares: true,
  showPerfStats: false,
};

function dedupeStrings(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  const out: string[] = [];
  for (const item of arr) {
    if (typeof item === 'string' && !out.includes(item)) {
      out.push(item);
    }
  }
  return out;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

export function createDefaultProgress(levelId: number): LevelProgress {
  const lvl = getLevelById(levelId);
  return {
    collectedEvidenceIds: [],
    discoveredHotspotIds: [],
    unlockedClueIds: [],
    readClueIds: [],
    solvedConnectionIds: [],
    solvedPuzzleIds: [],
    openDoorIds: [],
    currentTier: 1,
    completed: false,
    playerPosition: lvl ? [...lvl.spawnPosition] : [0, 1.65, 5],
    playerYaw: lvl ? lvl.spawnYaw : 0,
  };
}

function sanitizeSettings(raw: unknown): GameSettings {
  if (!raw || typeof raw !== 'object') return { ...defaultSettings };
  const s = raw as Record<string, unknown>;
  const validPresets: GraphicsPreset[] = ['low', 'medium', 'high', 'ultra'];
  const graphicsQuality: GraphicsPreset =
    typeof s.graphicsQuality === 'string' && validPresets.includes(s.graphicsQuality as GraphicsPreset)
      ? (s.graphicsQuality as GraphicsPreset)
      : defaultSettings.graphicsQuality;

  return {
    masterVolume: typeof s.masterVolume === 'number' && Number.isFinite(s.masterVolume) ? clamp(s.masterVolume, 0, 1) : defaultSettings.masterVolume,
    musicVolume: typeof s.musicVolume === 'number' && Number.isFinite(s.musicVolume) ? clamp(s.musicVolume, 0, 1) : defaultSettings.musicVolume,
    sfxVolume: typeof s.sfxVolume === 'number' && Number.isFinite(s.sfxVolume) ? clamp(s.sfxVolume, 0, 1) : defaultSettings.sfxVolume,
    mouseSensitivity:
      typeof s.mouseSensitivity === 'number' && Number.isFinite(s.mouseSensitivity)
        ? clamp(s.mouseSensitivity, 0.3, 2.5)
        : defaultSettings.mouseSensitivity,
    graphicsQuality,
    resolutionScale:
      typeof s.resolutionScale === 'number' && Number.isFinite(s.resolutionScale)
        ? clamp(s.resolutionScale, 0.5, 1.5)
        : defaultSettings.resolutionScale,
    cameraShake: typeof s.cameraShake === 'boolean' ? s.cameraShake : defaultSettings.cameraShake,
    reduceFlashing: typeof s.reduceFlashing === 'boolean' ? s.reduceFlashing : defaultSettings.reduceFlashing,
    showHints: typeof s.showHints === 'boolean' ? s.showHints : defaultSettings.showHints,
    enableJumpscares: typeof s.enableJumpscares === 'boolean' ? s.enableJumpscares : defaultSettings.enableJumpscares,
    showPerfStats: typeof s.showPerfStats === 'boolean' ? s.showPerfStats : defaultSettings.showPerfStats,
  };
}

function sanitizeLevelProgress(levelId: number, raw: unknown): LevelProgress {
  const base = createDefaultProgress(levelId);
  if (!raw || typeof raw !== 'object') return base;
  const p = raw as Record<string, unknown>;
  const lvl = getLevelById(levelId);

  let pos: Vec3 = base.playerPosition;
  if (
    Array.isArray(p.playerPosition) &&
    p.playerPosition.length === 3 &&
    p.playerPosition.every((n) => typeof n === 'number' && Number.isFinite(n))
  ) {
    if (lvl) {
      pos = [
        clamp(p.playerPosition[0], lvl.bounds.minX + 0.5, lvl.bounds.maxX - 0.5),
        clamp(p.playerPosition[1], 1.0, 2.2),
        clamp(p.playerPosition[2], lvl.bounds.minZ + 0.5, lvl.bounds.maxZ - 0.5),
      ];
    } else {
      pos = [p.playerPosition[0], p.playerPosition[1], p.playerPosition[2]];
    }
  }

  const tier = p.currentTier === 1 || p.currentTier === 2 || p.currentTier === 3 ? p.currentTier : 1;

  return {
    collectedEvidenceIds: dedupeStrings(p.collectedEvidenceIds),
    discoveredHotspotIds: dedupeStrings(p.discoveredHotspotIds),
    unlockedClueIds: dedupeStrings(p.unlockedClueIds),
    readClueIds: dedupeStrings(p.readClueIds),
    solvedConnectionIds: dedupeStrings(p.solvedConnectionIds),
    solvedPuzzleIds: dedupeStrings(p.solvedPuzzleIds),
    openDoorIds: dedupeStrings(p.openDoorIds),
    currentTier: tier,
    completed: Boolean(p.completed),
    playerPosition: pos,
    playerYaw: typeof p.playerYaw === 'number' && Number.isFinite(p.playerYaw) ? p.playerYaw : base.playerYaw,
  };
}

/**
 * Migrates & validates legacy (v1) or current (v4) save JSON safely.
 * Returns null if JSON is corrupted or unusable without crashing.
 */
export function migrateAndSanitizeSave(rawJson: string | null): SavedPayload | null {
  if (!rawJson || typeof rawJson !== 'string') return null;
  try {
    const parsed = JSON.parse(rawJson) as Record<string, unknown>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.currentLevelId !== 'number' || !Number.isFinite(parsed.currentLevelId)) return null;

    const currentLevelId = clamp(Math.floor(parsed.currentLevelId), 1, LEVELS.length);

    const unlockedRaw = Array.isArray(parsed.unlockedLevelIds) ? parsed.unlockedLevelIds : [1];
    const unlockedSet = new Set<number>([1]);
    for (const id of unlockedRaw) {
      if (typeof id === 'number' && Number.isInteger(id) && id >= 1 && id <= LEVELS.length) {
        unlockedSet.add(id);
      }
    }
    unlockedSet.add(currentLevelId);

    const progressByLevel: Record<number, LevelProgress> = {};
    const rawProgMap =
      parsed.progressByLevel && typeof parsed.progressByLevel === 'object'
        ? (parsed.progressByLevel as Record<string, unknown>)
        : {};
    for (const lvl of LEVELS) {
      if (rawProgMap[String(lvl.id)]) {
        progressByLevel[lvl.id] = sanitizeLevelProgress(lvl.id, rawProgMap[String(lvl.id)]);
      }
    }
    if (!progressByLevel[currentLevelId]) {
      progressByLevel[currentLevelId] = createDefaultProgress(currentLevelId);
    }

    // Migrate narrative state (and retroactively award Core Truths for completed legacy levels!)
    let narrative = sanitizeNarrativeState(parsed.narrative);
    for (const lvl of LEVELS) {
      const lp = progressByLevel[lvl.id];
      const truthId = lvl.tier3Puzzle.unlocksCoreTruthId;
      if (lp?.completed && truthId) {
        narrative = unlockCoreTruth(narrative, truthId);
      }
    }

    return {
      schemaVersion: SAVE_SCHEMA_VERSION,
      currentLevelId,
      unlockedLevelIds: Array.from(unlockedSet).sort((a, b) => a - b),
      progressByLevel,
      narrative,
      settings: sanitizeSettings(parsed.settings),
      savedAt: typeof parsed.savedAt === 'number' && Number.isFinite(parsed.savedAt) ? parsed.savedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

function loadSavedState(): SavedPayload | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return migrateAndSanitizeSave(window.localStorage.getItem(SAVE_KEY));
  } catch {
    return null;
  }
}

interface GameState {
  screen: GameScreen;
  overlay: ActiveOverlay;
  currentLevelId: number;
  unlockedLevelIds: number[];
  progressByLevel: Record<number, LevelProgress>;
  narrative: NarrativeState;
  hasSaveData: boolean;

  // Live gameplay state
  pointerLocked: boolean;
  flashlightOn: boolean;
  flashlightBattery: number;
  isCrouching: boolean;
  isSprinting: boolean;
  inspectingEvidenceId: string | null;
  activePuzzleId: string | null;
  journalTab: 'case' | 'evidence' | 'clues' | 'suspects' | 'board';
  targetedInteractable: TargetInteractable | null;
  perfStats: PerfStats;

  // Dynamic Horror & Physical 3D Jumpscare state
  horrorIntensity: number;
  activeWhisper: string | null;
  supernaturalGlitch: number;
  extinguishedLampIds: string[];
  activePhysicalJumpscare: PhysicalJumpscareEvent | null;
  pendingPhysicalScareRequest: {
    npcType: NPCCharacterType;
    caption: string;
    force?: boolean;
  } | null;
  pendingPostInspectScare: {
    npcType: NPCCharacterType;
    caption: string;
  } | null;
  lastJumpscareAt: number;
  triggeredZoneScares: string[];

  // Notifications & Settings
  notifications: ToastNotification[];
  settings: GameSettings;

  // Actions
  startNewGame: () => void;
  startNewGamePlus: () => void;
  continueGame: () => void;
  selectLevel: (levelId: number, resetProgress?: boolean) => void;
  beginLevelPlayback: () => void;
  returnToMenu: () => void;

  setOverlay: (overlay: ActiveOverlay) => void;
  setJournalTab: (tab: 'case' | 'evidence' | 'clues' | 'suspects' | 'board') => void;
  setPointerLocked: (locked: boolean) => void;
  setTargetedInteractable: (target: TargetInteractable | null) => void;
  setPerfStats: (stats: PerfStats) => void;

  toggleFlashlight: () => void;
  drainFlashlight: (delta: number) => void;
  setCrouching: (v: boolean) => void;
  setSprinting: (v: boolean) => void;
  updatePlayerTransform: (pos: Vec3, yaw: number) => void;

  // Investigation Actions
  openInspect: (evidenceId: string) => void;
  closeInspect: () => void;
  discoverHotspot: (evidenceId: string, hotspotId: string) => void;
  unlockClue: (clueId: string) => void;
  markClueRead: (clueId: string) => void;
  attemptBoardConnection: (clueA: string, clueB: string) => { success: boolean; message: string };

  // Narrative & Moral Actions
  makeMoralChoice: <K extends MoralChoiceId>(choiceId: K, value: MoralChoiceValueMap[K]) => boolean;
  grantCoreTruth: (truthId: CoreTruthId) => void;

  // World & Puzzle Actions
  interactDoor: (doorId: string) => void;
  openPuzzle: (puzzleId: string) => void;
  closePuzzle: () => void;
  markPuzzleSolved: (puzzleId: string) => void;

  // Horror Actions (3D Physical NPC Jumpscare Pipeline)
  triggerHorrorEvent: (whisperText: string, glitchStrength?: number, lampToSnuff?: string) => void;
  triggerPhysicalJumpscare: (event: PhysicalJumpscareEvent, force?: boolean) => boolean;
  requestPhysicalJumpscare: (npcType: NPCCharacterType, caption: string, force?: boolean) => void;
  consumePendingPhysicalScare: () => { npcType: NPCCharacterType; caption: string; force?: boolean } | null;
  queuePostInspectScare: (npcType: NPCCharacterType, caption: string) => void;
  markZoneScareTriggered: (zoneKey: string) => boolean;
  clearJumpscare: () => void;
  decayGlitch: (delta: number) => void;
  clearWhisper: () => void;

  // Utility
  pushNotification: (title: string, message: string, tone?: ToastNotification['tone']) => void;
  dismissNotification: (id: string) => void;
  updateSettings: (partial: Partial<GameSettings>) => void;
  saveToStorage: () => void;
  getCurrentProgress: () => LevelProgress;
}

const initialSaved = loadSavedState();

function computeHorrorIntensity(
  levelId: number,
  progress: LevelProgress,
  narrative: NarrativeState
): number {
  const level = getLevelById(levelId);
  if (!level) return 0.15;
  const clueRatio = Math.min(1, progress.unlockedClueIds.length / Math.max(1, level.clues.length));
  const tierBoost = progress.currentTier === 1 ? 0.1 : progress.currentTier === 2 ? 0.42 : 0.78;
  // Moral choice reactivity: negative Chính Khí raises supernatural hostility!
  const spiritModifier = narrative.spiritScore < 0 ? 0.16 : narrative.spiritScore > 0 ? -0.05 : 0;
  const ngPlusBoost = narrative.isNewGamePlus ? 0.08 : 0;
  return clamp(tierBoost * 0.62 + clueRatio * 0.4 + spiritModifier + ngPlusBoost, 0.12, 1);
}

let lastSaveTimestamp = 0;

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  overlay: 'none',
  currentLevelId: initialSaved?.currentLevelId ?? 1,
  unlockedLevelIds: initialSaved?.unlockedLevelIds ?? [1],
  progressByLevel: initialSaved?.progressByLevel ?? { 1: createDefaultProgress(1) },
  narrative: initialSaved?.narrative ?? createInitialNarrativeState(),
  hasSaveData: Boolean(initialSaved),

  pointerLocked: false,
  flashlightOn: true,
  flashlightBattery: 100,
  isCrouching: false,
  isSprinting: false,
  inspectingEvidenceId: null,
  activePuzzleId: null,
  journalTab: 'case',
  targetedInteractable: null,
  perfStats: { fps: 60, frameTimeMs: 16.6, drawCalls: 0, triangles: 0 },

  horrorIntensity: 0.15,
  activeWhisper: null,
  supernaturalGlitch: 0,
  extinguishedLampIds: [],
  activePhysicalJumpscare: null,
  pendingPhysicalScareRequest: null,
  pendingPostInspectScare: null,
  lastJumpscareAt: 0,
  triggeredZoneScares: [],

  notifications: [],
  settings: initialSaved?.settings ?? { ...defaultSettings },

  getCurrentProgress: () => {
    const { currentLevelId, progressByLevel } = get();
    return progressByLevel[currentLevelId] ?? createDefaultProgress(currentLevelId);
  },

  saveToStorage: () => {
    const state = get();
    try {
      if (typeof window === 'undefined' || !window.localStorage) return;
      const sanitizedNarrative = sanitizeNarrativeState(state.narrative);
      const payload: SavedPayload = {
        schemaVersion: SAVE_SCHEMA_VERSION,
        currentLevelId: state.currentLevelId,
        unlockedLevelIds: state.unlockedLevelIds,
        progressByLevel: state.progressByLevel,
        narrative: sanitizedNarrative,
        settings: state.settings,
        savedAt: Date.now(),
      };
      window.localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      lastSaveTimestamp = Date.now();
      set({ hasSaveData: true });
    } catch {
      // Ignore quota errors
    }
  },

  startNewGame: () => {
    const prevNarrative = get().narrative;
    const freshNarrative = createInitialNarrativeState({
      ngPlusUnlocked: prevNarrative.ngPlusUnlocked,
      ngPlusRunCount: prevNarrative.ngPlusRunCount,
      completedEndings: prevNarrative.completedEndings,
    });
    const fresh: Record<number, LevelProgress> = {
      1: createDefaultProgress(1),
    };
    set({
      currentLevelId: 1,
      unlockedLevelIds: [1],
      progressByLevel: fresh,
      narrative: freshNarrative,
      screen: 'chapter_intro',
      overlay: 'none',
      flashlightOn: true,
      flashlightBattery: 100,
      inspectingEvidenceId: null,
      activePuzzleId: null,
      horrorIntensity: 0.15,
      extinguishedLampIds: [],
      activeWhisper: null,
      supernaturalGlitch: 0,
      triggeredZoneScares: [],
      notifications: [],
    });
    get().saveToStorage();
  },

  startNewGamePlus: () => {
    const state = get();
    if (!state.narrative.ngPlusUnlocked) return;
    const ngNarrative = startNewGamePlusRun(state.narrative);
    const fresh: Record<number, LevelProgress> = {
      1: createDefaultProgress(1),
    };
    set({
      currentLevelId: 1,
      unlockedLevelIds: [1, 2, 3, 4, 5],
      progressByLevel: fresh,
      narrative: ngNarrative,
      screen: 'chapter_intro',
      overlay: 'none',
      flashlightOn: true,
      flashlightBattery: 100,
      inspectingEvidenceId: null,
      activePuzzleId: null,
      horrorIntensity: 0.24,
      extinguishedLampIds: [],
      activeWhisper: null,
      supernaturalGlitch: 0,
      triggeredZoneScares: [],
      notifications: [],
    });
    get().pushNotification(
      'NEW GAME+ KÍCH HOẠT',
      'Ký ức bị chôn giấu và các ghi chú ẩn của Nguyễn Văn Khải đã bắt đầu hiển lộ...',
      'tier'
    );
    get().saveToStorage();
  },

  continueGame: () => {
    const state = get();
    const prog = state.progressByLevel[state.currentLevelId] ?? createDefaultProgress(state.currentLevelId);
    const level = getLevelById(state.currentLevelId);
    horrorAudio.init();
    horrorAudio.applyVolumes(state.settings.masterVolume, state.settings.musicVolume, state.settings.sfxVolume);
    if (level) {
      horrorAudio.startAmbient(level.ambientTheme);
    }
    set({
      progressByLevel: {
        ...state.progressByLevel,
        [state.currentLevelId]: prog,
      },
      screen: 'playing',
      overlay: 'none',
      horrorIntensity: computeHorrorIntensity(state.currentLevelId, prog, state.narrative),
      extinguishedLampIds: [],
      activeWhisper: null,
    });
  },

  selectLevel: (levelId: number, resetProgress = false) => {
    const state = get();
    const existing = state.progressByLevel[levelId];
    const prog = resetProgress || !existing ? createDefaultProgress(levelId) : existing;
    horrorAudio.stopAmbient();
    set({
      currentLevelId: levelId,
      progressByLevel: {
        ...state.progressByLevel,
        [levelId]: prog,
      },
      screen: 'chapter_intro',
      overlay: 'none',
      flashlightOn: true,
      flashlightBattery: 100,
      inspectingEvidenceId: null,
      activePuzzleId: null,
      horrorIntensity: computeHorrorIntensity(levelId, prog, state.narrative),
      extinguishedLampIds: [],
      activeWhisper: null,
      supernaturalGlitch: 0,
    });
    get().saveToStorage();
  },

  beginLevelPlayback: () => {
    const { currentLevelId, settings } = get();
    const level = getLevelById(currentLevelId);
    horrorAudio.init();
    horrorAudio.applyVolumes(settings.masterVolume, settings.musicVolume, settings.sfxVolume);
    if (level) {
      horrorAudio.startAmbient(level.ambientTheme);
    }
    set({ screen: 'playing', overlay: 'none' });
  },

  returnToMenu: () => {
    if (typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
    horrorAudio.stopAmbient();
    get().saveToStorage();
    set({
      screen: 'menu',
      overlay: 'none',
      pointerLocked: false,
      inspectingEvidenceId: null,
      activePuzzleId: null,
      targetedInteractable: null,
      activePhysicalJumpscare: null,
      pendingPhysicalScareRequest: null,
    });
  },

  setOverlay: (overlay) => {
    if (overlay !== 'none' && typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
    horrorAudio.setPaused(overlay === 'pause');
    // Immediately cancel any active physical jumpscare when a modal/pause menu opens
    set({
      overlay,
      ...(overlay !== 'none' ? { activePhysicalJumpscare: null } : {}),
    });
  },

  setJournalTab: (journalTab) => set({ journalTab }),
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
  setTargetedInteractable: (targetedInteractable) => set({ targetedInteractable }),
  setPerfStats: (perfStats) => set({ perfStats }),

  toggleFlashlight: () => {
    const { flashlightOn, flashlightBattery } = get();
    horrorAudio.playClick();
    if (!flashlightOn && flashlightBattery <= 2) {
      get().pushNotification('Đèn pin cạn pin', 'Hãy tắt đèn vài giây để hồi phục pin dự phòng.', 'info');
      return;
    }
    set({ flashlightOn: !flashlightOn });
  },

  drainFlashlight: (delta) => {
    const { flashlightOn, flashlightBattery, overlay, screen } = get();
    if (screen !== 'playing' || overlay !== 'none') return;
    if (flashlightOn) {
      const next = Math.max(0, flashlightBattery - delta * 0.42);
      if (next <= 0) {
        set({ flashlightBattery: 0, flashlightOn: false });
        get().pushNotification('Đèn pin tắt ngấm', 'Ánh sáng vụt tắt. Chờ vài giây để pin tự nạp khẩn cấp.', 'horror');
      } else {
        set({ flashlightBattery: next });
      }
    } else if (flashlightBattery < 100) {
      set({ flashlightBattery: Math.min(100, flashlightBattery + delta * 3.8) });
    }
  },

  setCrouching: (isCrouching) => set({ isCrouching }),
  setSprinting: (isSprinting) => set({ isSprinting }),

  updatePlayerTransform: (pos, yaw) => {
    const state = get();
    const prog = state.progressByLevel[state.currentLevelId] ?? createDefaultProgress(state.currentLevelId);
    prog.playerPosition = pos;
    prog.playerYaw = yaw;
    // Throttled auto-save position every 8s so storage writes don't stutter frames
    if (Date.now() - lastSaveTimestamp > 8000) {
      state.saveToStorage();
    }
  },

  openInspect: (evidenceId) => {
    const state = get();
    const level = getLevelById(state.currentLevelId);
    const ev = level?.evidences.find((e) => e.id === evidenceId);
    if (!ev) return;

    if (typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }

    const prog = { ...(state.progressByLevel[state.currentLevelId] ?? createDefaultProgress(state.currentLevelId)) };
    const isNew = !prog.collectedEvidenceIds.includes(evidenceId);
    if (isNew) {
      prog.collectedEvidenceIds = [...prog.collectedEvidenceIds, evidenceId];
      horrorAudio.playEvidencePickup();
      state.pushNotification('Thu thập vật chứng', ev.name, 'evidence');
    } else {
      horrorAudio.playClick();
    }

    if (ev.initialClueId && !prog.unlockedClueIds.includes(ev.initialClueId)) {
      prog.unlockedClueIds = [...prog.unlockedClueIds, ev.initialClueId];
      const clue = level?.clues.find((c) => c.id === ev.initialClueId);
      if (clue) {
        state.pushNotification('Manh mối mới', clue.title, 'clue');
      }
    }

    if (prog.currentTier === 1 && level && prog.unlockedClueIds.length >= level.tier1RequiredClues) {
      prog.currentTier = 2;
      horrorAudio.playTierAdvance();
      state.pushNotification(
        'HOÀN THÀNH TẦNG 1',
        `Đã đủ manh mối! Chuyển sang Tầng 2: ${level.tiers[1].title}`,
        'tier'
      );
    }

    const horrorIntensity = computeHorrorIntensity(state.currentLevelId, prog, state.narrative);

    set({
      overlay: 'inspect',
      inspectingEvidenceId: evidenceId,
      horrorIntensity,
      progressByLevel: {
        ...state.progressByLevel,
        [state.currentLevelId]: prog,
      },
    });
    get().saveToStorage();
  },

  closeInspect: () => {
    const pending = get().pendingPostInspectScare;
    set({ overlay: 'none', inspectingEvidenceId: null, pendingPostInspectScare: null });
    if (pending && get().settings.enableJumpscares) {
      setTimeout(() => {
        const s = get();
        if (s.screen === 'playing' && s.overlay === 'none') {
          s.requestPhysicalJumpscare(pending.npcType, pending.caption, false);
        }
      }, 1350);
    }
  },

  discoverHotspot: (evidenceId, hotspotId) => {
    const state = get();
    const level = getLevelById(state.currentLevelId);
    const ev = level?.evidences.find((e) => e.id === evidenceId);
    const hs = ev?.hotspots.find((h) => h.id === hotspotId);
    if (!ev || !hs) return;

    const prog = { ...(state.progressByLevel[state.currentLevelId] ?? createDefaultProgress(state.currentLevelId)) };
    if (prog.discoveredHotspotIds.includes(hotspotId)) return;

    prog.discoveredHotspotIds = [...prog.discoveredHotspotIds, hotspotId];
    horrorAudio.playHotspotFound();

    const scareMap: Record<string, { npcType: NPCCharacterType; caption: string }> = {
      l1_hs_comb_hair: { npcType: 'tran_thi_lien', caption: '“CON ƠI... ĐỪNG QUAY LẠI...”' },
      l1_hs_photo_front: { npcType: 'tran_thi_lien', caption: '“SAO ÔNG LẠI NIÊM PHONG TÔI TRONG BUỒNG ĐÔNG?!”' },
      l2_hs_doll_pin: { npcType: 'dao_thi_may', caption: '“ĐỪNG RÚT KIM RA...”' },
      l3_hs_rope_cut: { npcType: 'child_spirit', caption: '“18/08/1978... SAO CHỈ KÉO MỘT GIỎ LÊN?!”' },
      l4_hs_relief_front: { npcType: 'wooden_statue', caption: '“NHÌN RA SAU LƯNG NGƯƠI KIA...”' },
      l5_hs_token_name: { npcType: 'faceless_passenger', caption: '“ĐẾN LƯỢT NGƯƠI PHÁN QUYẾT RỒI!”' },
    };
    const queuedScare = scareMap[hotspotId];
    if (queuedScare) {
      state.queuePostInspectScare(queuedScare.npcType, queuedScare.caption);
    }

    if (hs.unlocksClueId && !prog.unlockedClueIds.includes(hs.unlocksClueId)) {
      prog.unlockedClueIds = [...prog.unlockedClueIds, hs.unlocksClueId];
      const clue = level?.clues.find((c) => c.id === hs.unlocksClueId);
      if (clue) {
        state.pushNotification('Phát hiện chi tiết quan trọng', clue.title, 'clue');
      }
    }

    if (prog.currentTier === 1 && level && prog.unlockedClueIds.length >= level.tier1RequiredClues) {
      prog.currentTier = 2;
      horrorAudio.playTierAdvance();
      state.pushNotification(
        'MỞ KHÓA TẦNG 2',
        `${level.tiers[1].title} — Hãy mở Sổ điều tra (Tab) để kết nối manh mối và giải mã!`,
        'tier'
      );
    }

    const horrorIntensity = computeHorrorIntensity(state.currentLevelId, prog, state.narrative);
    set({
      horrorIntensity,
      progressByLevel: {
        ...state.progressByLevel,
        [state.currentLevelId]: prog,
      },
    });
    get().saveToStorage();
  },

  unlockClue: (clueId) => {
    const state = get();
    const level = getLevelById(state.currentLevelId);
    const prog = { ...(state.progressByLevel[state.currentLevelId] ?? createDefaultProgress(state.currentLevelId)) };
    if (prog.unlockedClueIds.includes(clueId)) return;
    prog.unlockedClueIds = [...prog.unlockedClueIds, clueId];
    const clue = level?.clues.find((c) => c.id === clueId);
    if (clue) {
      state.pushNotification('Ghi nhận manh mối', clue.title, 'clue');
    }
    set({
      horrorIntensity: computeHorrorIntensity(state.currentLevelId, prog, state.narrative),
      progressByLevel: {
        ...state.progressByLevel,
        [state.currentLevelId]: prog,
      },
    });
    get().saveToStorage();
  },

  markClueRead: (clueId) => {
    const state = get();
    const prog = { ...(state.progressByLevel[state.currentLevelId] ?? createDefaultProgress(state.currentLevelId)) };
    if (prog.readClueIds.includes(clueId)) return;
    prog.readClueIds = [...prog.readClueIds, clueId];
    set({
      progressByLevel: {
        ...state.progressByLevel,
        [state.currentLevelId]: prog,
      },
    });
  },

  attemptBoardConnection: (clueA, clueB) => {
    const state = get();
    const level = getLevelById(state.currentLevelId);
    if (!level) return { success: false, message: 'Không có dữ liệu màn chơi.' };

    const prog = { ...(state.progressByLevel[state.currentLevelId] ?? createDefaultProgress(state.currentLevelId)) };
    const match = level.boardConnections.find(
      (c) =>
        (c.clueA === clueA && c.clueB === clueB) ||
        (c.clueA === clueB && c.clueB === clueA)
    );

    if (!match) {
      horrorAudio.playError();
      return {
        success: false,
        message: 'Hai manh mối này chưa tạo thành mối liên hệ trực tiếp. Hãy đối chiếu kỹ mốc năm và chi tiết vật chứng.',
      };
    }

    if (prog.solvedConnectionIds.includes(match.id)) {
      return { success: true, message: 'Liên kết này đã được xác nhận.' };
    }

    prog.solvedConnectionIds = [...prog.solvedConnectionIds, match.id];
    horrorAudio.playHotspotFound();

    if (match.unlocksClueId && !prog.unlockedClueIds.includes(match.unlocksClueId)) {
      prog.unlockedClueIds = [...prog.unlockedClueIds, match.unlocksClueId];
    }

    state.pushNotification('Kết nối suy luận thành công', match.title, 'tier');
    set({
      horrorIntensity: computeHorrorIntensity(state.currentLevelId, prog, state.narrative),
      progressByLevel: {
        ...state.progressByLevel,
        [state.currentLevelId]: prog,
      },
    });
    get().saveToStorage();
    return { success: true, message: match.deductionText };
  },

  makeMoralChoice: (choiceId, value) => {
    const state = get();
    const { nextState, applied } = applyMoralChoice(state.narrative, choiceId, value);
    if (!applied) return false;

    const prog = state.progressByLevel[state.currentLevelId] ?? createDefaultProgress(state.currentLevelId);
    set({
      narrative: nextState,
      horrorIntensity: computeHorrorIntensity(state.currentLevelId, prog, nextState),
    });
    get().saveToStorage();
    return true;
  },

  grantCoreTruth: (truthId) => {
    const nextNarrative = unlockCoreTruth(get().narrative, truthId);
    set({ narrative: nextNarrative });
    get().saveToStorage();
  },

  interactDoor: (doorId) => {
    const state = get();
    const level = getLevelById(state.currentLevelId);
    const door = level?.doors.find((d) => d.id === doorId);
    if (!door) return;

    const prog = { ...(state.progressByLevel[state.currentLevelId] ?? createDefaultProgress(state.currentLevelId)) };

    if (door.lockedByPuzzleId && !prog.solvedPuzzleIds.includes(door.lockedByPuzzleId)) {
      horrorAudio.playLockedDoor();
      state.pushNotification(
        door.name + ' đang bị niêm phong',
        door.lockedMessage ?? 'Cần giải mã cơ chế Tầng 2 để mở cánh cửa này.',
        'info'
      );
      return;
    }

    const isOpen = prog.openDoorIds.includes(doorId);
    prog.openDoorIds = isOpen
      ? prog.openDoorIds.filter((id) => id !== doorId)
      : [...prog.openDoorIds, doorId];

    horrorAudio.playDoorCreak();
    set({
      progressByLevel: {
        ...state.progressByLevel,
        [state.currentLevelId]: prog,
      },
    });
    get().saveToStorage();
  },

  openPuzzle: (puzzleId) => {
    const state = get();
    const level = getLevelById(state.currentLevelId);
    if (!level) return;
    const prog = state.progressByLevel[state.currentLevelId] ?? createDefaultProgress(state.currentLevelId);

    const isTier3 = level.tier3Puzzle.id === puzzleId;
    if (isTier3 && prog.currentTier < 3) {
      horrorAudio.playError();
      state.pushNotification(
        'Chưa đủ điều kiện đối mặt sự thật',
        'Hãy hoàn thành cơ chế giải mã Tầng 2 trước khi thực hiện phán quyết cuối cùng.',
        'info'
      );
      return;
    }

    // Enforce mandatory Connection Board deduction if configured on Tier 2
    if (level.tier2Puzzle.id === puzzleId && level.tier2Puzzle.requiredConnectionIds?.length) {
      const missingConn = level.tier2Puzzle.requiredConnectionIds.some(
        (cid) => !prog.solvedConnectionIds.includes(cid)
      );
      if (missingConn) {
        horrorAudio.playError();
        state.pushNotification(
          'Cần liên kết suy luận trước',
          'Mở Sổ điều tra (Tab) → Bảng Kết Nối để nối cặp manh mối then chốt trước khi mở khóa cơ chế này!',
          'clue'
        );
        return;
      }
    }

    if (typeof document !== 'undefined' && document.pointerLockElement) {
      document.exitPointerLock();
    }
    horrorAudio.playClick();
    set({ overlay: 'puzzle', activePuzzleId: puzzleId });
  },

  closePuzzle: () => set({ overlay: 'none', activePuzzleId: null }),

  markPuzzleSolved: (puzzleId) => {
    const state = get();
    const level = getLevelById(state.currentLevelId);
    if (!level) return;

    const prog = { ...(state.progressByLevel[state.currentLevelId] ?? createDefaultProgress(state.currentLevelId)) };
    if (!prog.solvedPuzzleIds.includes(puzzleId)) {
      prog.solvedPuzzleIds = [...prog.solvedPuzzleIds, puzzleId];
    }

    if (puzzleId === level.tier2Puzzle.id) {
      prog.currentTier = 3;
      const unlockedDoors = level.doors
        .filter((d) => d.lockedByPuzzleId === puzzleId)
        .map((d) => d.id);
      prog.openDoorIds = Array.from(new Set([...prog.openDoorIds, ...unlockedDoors]));
      horrorAudio.playTierAdvance();
      horrorAudio.playTempleBell();

      state.pushNotification(
        'MỞ KHÓA TẦNG 3 — ĐỐI MẶT SỰ THẬT',
        level.tiers[2].objective,
        'tier'
      );

      set({
        horrorIntensity: Math.max(0.82, computeHorrorIntensity(state.currentLevelId, prog, state.narrative)),
        supernaturalGlitch: 0.72,
        progressByLevel: {
          ...state.progressByLevel,
          [state.currentLevelId]: prog,
        },
      });
      get().saveToStorage();
      return;
    }

    if (puzzleId === level.tier3Puzzle.id) {
      prog.completed = true;
      let nextNarrative = state.narrative;

      // Unlock canonical Core Truth for Levels 1-4
      if (level.tier3Puzzle.unlocksCoreTruthId) {
        nextNarrative = unlockCoreTruth(nextNarrative, level.tier3Puzzle.unlocksCoreTruthId);
      }

      const nextLevelId = state.currentLevelId + 1;
      const unlocked =
        nextLevelId <= LEVELS.length && !state.unlockedLevelIds.includes(nextLevelId)
          ? [...state.unlockedLevelIds, nextLevelId]
          : state.unlockedLevelIds;

      horrorAudio.playTierAdvance();
      horrorAudio.playTempleBell();

      const isFinalLevel = state.currentLevelId >= LEVELS.length;

      if (isFinalLevel) {
        const { nextState } = completeGameWithEnding(nextNarrative);
        nextNarrative = nextState;
      }

      set({
        unlockedLevelIds: unlocked,
        narrative: nextNarrative,
        overlay: 'none',
        activePuzzleId: null,
        screen: isFinalLevel ? 'ending' : 'level_complete',
        progressByLevel: {
          ...state.progressByLevel,
          [state.currentLevelId]: prog,
        },
      });
      get().saveToStorage();
    }
  },

  triggerHorrorEvent: (whisperText, glitchStrength = 0.45, lampToSnuff) => {
    set((s) => ({
      activeWhisper: whisperText,
      supernaturalGlitch: Math.min(1, Math.max(s.supernaturalGlitch, glitchStrength)),
      extinguishedLampIds: lampToSnuff
        ? Array.from(new Set([...s.extinguishedLampIds, lampToSnuff]))
        : s.extinguishedLampIds,
    }));
  },

  queuePostInspectScare: (npcType, caption) => {
    set({ pendingPostInspectScare: { npcType, caption } });
  },

  requestPhysicalJumpscare: (npcType, caption, force = false) => {
    const state = get();
    if (!state.settings.enableJumpscares) return;
    if (state.screen !== 'playing' || state.overlay !== 'none') return;
    set({ pendingPhysicalScareRequest: { npcType, caption, force } });
  },

  consumePendingPhysicalScare: () => {
    const req = get().pendingPhysicalScareRequest;
    if (!req) return null;
    set({ pendingPhysicalScareRequest: null });
    return req;
  },

  markZoneScareTriggered: (zoneKey) => {
    const list = get().triggeredZoneScares;
    if (list.includes(zoneKey)) return false;
    set({ triggeredZoneScares: [...list, zoneKey] });
    return true;
  },

  triggerPhysicalJumpscare: (event, force = false) => {
    const state = get();
    if (!state.settings.enableJumpscares) return false;
    if (state.screen !== 'playing' || state.overlay !== 'none') return false;
    const now = Date.now();
    if (!force && now - state.lastJumpscareAt < 34000) return false;

    set({
      activePhysicalJumpscare: event,
      lastJumpscareAt: now,
      supernaturalGlitch: state.settings.reduceFlashing ? 0.35 : 0.92,
      activeWhisper: event.caption,
    });

    setTimeout(() => {
      const cur = get().activePhysicalJumpscare;
      if (cur && cur.id === event.id) {
        set({ activePhysicalJumpscare: null });
      }
    }, event.durationMs);
    return true;
  },

  clearJumpscare: () => set({ activePhysicalJumpscare: null, pendingPhysicalScareRequest: null }),

  decayGlitch: (delta) => {
    const g = get().supernaturalGlitch;
    if (g > 0.005) {
      set({ supernaturalGlitch: Math.max(0, g - delta * 0.45) });
    } else if (g !== 0) {
      set({ supernaturalGlitch: 0 });
    }
  },

  clearWhisper: () => set({ activeWhisper: null }),

  pushNotification: (title, message, tone = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({
      notifications: [...s.notifications.slice(-3), { id, title, message, tone }],
    }));
    setTimeout(() => {
      get().dismissNotification(id);
    }, 5200);
  },

  dismissNotification: (id) => {
    set((s) => ({
      notifications: s.notifications.filter((n) => n.id !== id),
    }));
  },

  updateSettings: (partial) => {
    const next = { ...get().settings, ...partial };
    horrorAudio.applyVolumes(next.masterVolume, next.musicVolume, next.sfxVolume);
    set({ settings: next });
    get().saveToStorage();
  },
}));
