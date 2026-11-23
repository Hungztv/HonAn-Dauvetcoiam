import { create } from 'zustand';
import {
  ActiveOverlay,
  GameScreen,
  GameSettings,
  JumpscareVariant,
  LevelProgress,
  TargetInteractable,
  Vec3,
} from '../types/game';
import { LEVELS, getLevelById } from '../data/levels';
import { horrorAudio } from '../audio/horrorAudio';

const SAVE_KEY = 'hon_an_save_v1';

interface SavedPayload {
  currentLevelId: number;
  unlockedLevelIds: number[];
  progressByLevel: Record<number, LevelProgress>;
  settings: GameSettings;
  savedAt: number;
}

export interface ToastNotification {
  id: string;
  title: string;
  message: string;
  tone: 'clue' | 'evidence' | 'tier' | 'horror' | 'info';
}

function createDefaultProgress(levelId: number): LevelProgress {
  const lvl = getLevelById(levelId);
  return {
    collectedEvidenceIds: [],
    discoveredHotspotIds: [],
    unlockedClueIds: [],
    solvedConnectionIds: [],
    solvedPuzzleIds: [],
    openDoorIds: [],
    currentTier: 1,
    completed: false,
    playerPosition: lvl ? [...lvl.spawnPosition] : [0, 1.65, 5],
    playerYaw: lvl ? lvl.spawnYaw : 0,
  };
}

function loadSavedState(): SavedPayload | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedPayload;
    if (!parsed || typeof parsed.currentLevelId !== 'number') return null;
    return parsed;
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

  // Dynamic Horror & Jumpscare state
  horrorIntensity: number; // 0 to 1
  activeWhisper: string | null;
  supernaturalGlitch: number; // 0 to 1 transient spike
  extinguishedLampIds: string[];
  activeJumpscare: {
    variant: JumpscareVariant;
    caption: string;
    startedAt: number;
  } | null;
  pendingJumpscare: { variant: JumpscareVariant; caption: string } | null;
  lastJumpscareAt: number;
  triggeredZoneScares: string[];

  // Notifications & Settings
  notifications: ToastNotification[];
  settings: GameSettings;

  // Actions
  startNewGame: () => void;
  continueGame: () => void;
  selectLevel: (levelId: number, resetProgress?: boolean) => void;
  beginLevelPlayback: () => void;
  returnToMenu: () => void;

  setOverlay: (overlay: ActiveOverlay) => void;
  setJournalTab: (tab: 'case' | 'evidence' | 'clues' | 'suspects' | 'board') => void;
  setPointerLocked: (locked: boolean) => void;
  setTargetedInteractable: (target: TargetInteractable | null) => void;

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
  attemptBoardConnection: (clueA: string, clueB: string) => { success: boolean; message: string };

  // World & Puzzle Actions
  interactDoor: (doorId: string) => void;
  openPuzzle: (puzzleId: string) => void;
  closePuzzle: () => void;
  markPuzzleSolved: (puzzleId: string) => void;

  // Horror Actions
  triggerHorrorEvent: (whisperText: string, glitchStrength?: number, lampToSnuff?: string) => void;
  triggerJumpscare: (variant: JumpscareVariant, caption: string, force?: boolean) => void;
  queuePostInspectJumpscare: (variant: JumpscareVariant, caption: string) => void;
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

const initialSaved = typeof window !== 'undefined' ? loadSavedState() : null;

const defaultSettings: GameSettings = {
  masterVolume: 0.75,
  mouseSensitivity: 1.0,
  graphicsQuality: 'high',
  showHints: true,
  enableJumpscares: true,
};

function computeHorrorIntensity(levelId: number, progress: LevelProgress): number {
  const level = getLevelById(levelId);
  if (!level) return 0.15;
  const clueRatio = Math.min(1, progress.unlockedClueIds.length / Math.max(1, level.clues.length));
  const tierBoost = progress.currentTier === 1 ? 0.1 : progress.currentTier === 2 ? 0.42 : 0.78;
  return Math.min(1, Math.max(0.12, tierBoost * 0.65 + clueRatio * 0.45));
}

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  overlay: 'none',
  currentLevelId: initialSaved?.currentLevelId ?? 1,
  unlockedLevelIds: initialSaved?.unlockedLevelIds ?? [1],
  progressByLevel: initialSaved?.progressByLevel ?? { 1: createDefaultProgress(1) },
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

  horrorIntensity: 0.15,
  activeWhisper: null,
  supernaturalGlitch: 0,
  extinguishedLampIds: [],
  activeJumpscare: null,
  pendingJumpscare: null,
  lastJumpscareAt: 0,
  triggeredZoneScares: [],

  notifications: [],
  settings: { ...defaultSettings, ...(initialSaved?.settings ?? {}) },

  getCurrentProgress: () => {
    const { currentLevelId, progressByLevel } = get();
    return progressByLevel[currentLevelId] ?? createDefaultProgress(currentLevelId);
  },

  saveToStorage: () => {
    const state = get();
    try {
      const payload: SavedPayload = {
        currentLevelId: state.currentLevelId,
        unlockedLevelIds: state.unlockedLevelIds,
        progressByLevel: state.progressByLevel,
        settings: state.settings,
        savedAt: Date.now(),
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(payload));
      set({ hasSaveData: true });
    } catch {
      // Ignore quota errors
    }
  },

  startNewGame: () => {
    const fresh: Record<number, LevelProgress> = {
      1: createDefaultProgress(1),
    };
    set({
      currentLevelId: 1,
      unlockedLevelIds: [1],
      progressByLevel: fresh,
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
      notifications: [],
    });
    get().saveToStorage();
  },

  continueGame: () => {
    const state = get();
    const prog = state.progressByLevel[state.currentLevelId] ?? createDefaultProgress(state.currentLevelId);
    set({
      progressByLevel: {
        ...state.progressByLevel,
        [state.currentLevelId]: prog,
      },
      screen: 'playing',
      overlay: 'none',
      horrorIntensity: computeHorrorIntensity(state.currentLevelId, prog),
      extinguishedLampIds: [],
      activeWhisper: null,
    });
  },

  selectLevel: (levelId: number, resetProgress = false) => {
    const state = get();
    const existing = state.progressByLevel[levelId];
    const prog = resetProgress || !existing ? createDefaultProgress(levelId) : existing;
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
      horrorIntensity: computeHorrorIntensity(levelId, prog),
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
    horrorAudio.setMasterVolume(settings.masterVolume);
    if (level) {
      horrorAudio.startAmbient(level.ambientTheme);
    }
    set({ screen: 'playing', overlay: 'none' });
  },

  returnToMenu: () => {
    if (document.pointerLockElement) {
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
    });
  },

  setOverlay: (overlay) => {
    if (overlay !== 'none' && document.pointerLockElement) {
      document.exitPointerLock();
    }
    set({ overlay });
  },

  setJournalTab: (journalTab) => set({ journalTab }),
  setPointerLocked: (pointerLocked) => set({ pointerLocked }),
  setTargetedInteractable: (targetedInteractable) => set({ targetedInteractable }),

  toggleFlashlight: () => {
    const { flashlightOn, flashlightBattery } = get();
    horrorAudio.playClick();
    if (!flashlightOn && flashlightBattery <= 2) {
      get().pushNotification('Đèn pin cạn pin', 'Hãy tắt đèn một lúc để hồi phục nhẹ pin dự phòng.', 'info');
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
    const { currentLevelId, progressByLevel } = get();
    const prog = progressByLevel[currentLevelId] ?? createDefaultProgress(currentLevelId);
    prog.playerPosition = pos;
    prog.playerYaw = yaw;
  },

  openInspect: (evidenceId) => {
    const state = get();
    const level = getLevelById(state.currentLevelId);
    const ev = level?.evidences.find((e) => e.id === evidenceId);
    if (!ev) return;

    if (document.pointerLockElement) {
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

    // Check Tier 1 -> Tier 2 advancement
    if (prog.currentTier === 1 && level && prog.unlockedClueIds.length >= level.tier1RequiredClues) {
      prog.currentTier = 2;
      horrorAudio.playTierAdvance();
      state.pushNotification(
        'HOÀN THÀNH TẦNG 1',
        `Đã đủ manh mối! Chuyển sang Tầng 2: ${level.tiers[1].title}`,
        'tier'
      );
    }

    const horrorIntensity = computeHorrorIntensity(state.currentLevelId, prog);

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
    const pending = get().pendingJumpscare;
    set({ overlay: 'none', inspectingEvidenceId: null, pendingJumpscare: null });
    if (pending && get().settings.enableJumpscares) {
      // Strike 1.2s after putting the cursed evidence down!
      setTimeout(() => {
        const s = get();
        if (s.screen === 'playing' && s.overlay === 'none') {
          s.triggerJumpscare(pending.variant, pending.caption);
        }
      }, 1250);
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

    // Queue a chilling post-inspect jumpscare on pivotal horror discoveries
    const scareMap: Record<string, { variant: JumpscareVariant; caption: string }> = {
      l1_hs_comb_hair: { variant: 'blood_hands', caption: '“TRẢ LẠI TÓC CHO TÔI...”' },
      l1_hs_photo_front: { variant: 'pale_bride', caption: '“SAO CHA LẠI XÉ MẶT CON?”' },
      l2_hs_doll_pin: { variant: 'pale_bride', caption: '“ĐỪNG RÚT KIM RA...”' },
      l3_hs_rope_cut: { variant: 'blood_hands', caption: '“AI ĐÃ CẮT DÂY GIẾNG?!”' },
      l4_hs_relief_front: { variant: 'statue_face', caption: '“NHÌN RA SAU LƯNG NGƯƠI KIA...”' },
      l5_hs_token_name: { variant: 'faceless_ferryman', caption: '“ĐẾN LƯỢT NGƯƠI LÊN ĐÒ RỒI!”' },
    };
    const queuedScare = scareMap[hotspotId];
    if (queuedScare) {
      state.queuePostInspectJumpscare(queuedScare.variant, queuedScare.caption);
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

    const horrorIntensity = computeHorrorIntensity(state.currentLevelId, prog);
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
      horrorIntensity: computeHorrorIntensity(state.currentLevelId, prog),
      progressByLevel: {
        ...state.progressByLevel,
        [state.currentLevelId]: prog,
      },
    });
    get().saveToStorage();
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
        message: 'Hai manh mối này chưa tạo thành mối liên hệ trực tiếp. Hãy suy luận kỹ hơn.',
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
      horrorIntensity: computeHorrorIntensity(state.currentLevelId, prog),
      progressByLevel: {
        ...state.progressByLevel,
        [state.currentLevelId]: prog,
      },
    });
    get().saveToStorage();
    return { success: true, message: match.deductionText };
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
        'Hãy hoàn thành cơ chế giải mã Tầng 2 trước khi thực hiện nghi thức/kết luận cuối cùng.',
        'info'
      );
      return;
    }

    if (document.pointerLockElement) {
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
      // Automatically unseal doors tied to this puzzle and play dramatic sound
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
        horrorIntensity: Math.max(0.82, computeHorrorIntensity(state.currentLevelId, prog)),
        supernaturalGlitch: 0.75,
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
      const nextLevelId = state.currentLevelId + 1;
      const unlocked =
        nextLevelId <= LEVELS.length && !state.unlockedLevelIds.includes(nextLevelId)
          ? [...state.unlockedLevelIds, nextLevelId]
          : state.unlockedLevelIds;

      horrorAudio.playTierAdvance();
      horrorAudio.playTempleBell();

      const isFinalLevel = state.currentLevelId >= LEVELS.length;

      set({
        unlockedLevelIds: unlocked,
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

  queuePostInspectJumpscare: (variant, caption) => {
    set({ pendingJumpscare: { variant, caption } });
  },

  markZoneScareTriggered: (zoneKey) => {
    const list = get().triggeredZoneScares;
    if (list.includes(zoneKey)) return false;
    set({ triggeredZoneScares: [...list, zoneKey] });
    return true;
  },

  triggerJumpscare: (variant, caption, force = false) => {
    const state = get();
    if (!state.settings.enableJumpscares) return;
    if (state.screen !== 'playing' || state.overlay !== 'none') return;
    const now = Date.now();
    // Respect 32s cooldown unless forced by major story trigger
    if (!force && now - state.lastJumpscareAt < 32000) return;

    horrorAudio.playJumpscare(variant);
    set({
      activeJumpscare: { variant, caption, startedAt: now },
      lastJumpscareAt: now,
      supernaturalGlitch: 1.0,
      activeWhisper: caption,
    });

    setTimeout(() => {
      const cur = get().activeJumpscare;
      if (cur && cur.startedAt === now) {
        set({ activeJumpscare: null });
      }
    }, 950);
  },

  clearJumpscare: () => set({ activeJumpscare: null }),

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
    horrorAudio.setMasterVolume(next.masterVolume);
    set({ settings: next });
    get().saveToStorage();
  },
}));
