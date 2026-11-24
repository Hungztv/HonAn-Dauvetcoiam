import { describe, it, expect } from 'vitest';
import {
  CORE_TRUTH_IDS,
  SECRET_RELIC_IDS,
  CANONICAL_TIMELINE,
  NarrativeState,
  applyMoralChoice,
  completeGameWithEnding,
  computeSpiritScore,
  createInitialNarrativeState,
  getActiveEvidenceNotes,
  resolveEnding,
  sanitizeNarrativeState,
  startNewGamePlusRun,
  unlockCoreTruth,
  unlockSecretRelic,
} from '../data/narrativePack';
import { SAVE_SCHEMA_VERSION, migrateAndSanitizeSave } from '../store/gameStore';

function buildFullTruthsState(): NarrativeState {
  let state = createInitialNarrativeState();
  for (const tid of CORE_TRUTH_IDS) {
    state = unlockCoreTruth(state, tid);
  }
  return state;
}

describe('Narrative Data Pack v6.0 — 2000s Mystery Timeline & 4-Ending Matrix', () => {
  it('verifies canonical 1994–2004 Đồi Sương Lâm Viên timeline and 4-item sequence', () => {
    expect(CANONICAL_TIMELINE.mineCollapseYear).toBe(1994);
    expect(CANONICAL_TIMELINE.wardExperimentDate).toBe('14/11/1998');
    expect(CANONICAL_TIMELINE.sisterTragedyDate).toBe('14/11/2000');
    expect(CANONICAL_TIMELINE.investigationNight).toBe('14/11/2004');
    expect(CANONICAL_TIMELINE.ritualOrderDirections).toEqual(['Đông', 'Nam', 'Tây', 'Bắc']);
    expect(CANONICAL_TIMELINE.ritualOrderItems).toEqual(['Băng Đỏ', 'Huy Hiệu', 'Thẻ B3', 'Cuộn Phim']);
  });

  it('unlocks the 4th SECRET ENDING when all 4 Core Truths + all 4 Secret Relics + Spirit +2 + forgive are met', () => {
    let st = buildFullTruthsState();
    for (const rid of SECRET_RELIC_IDS) {
      st = unlockSecretRelic(st, rid);
    }
    st = applyMoralChoice(st, 'fate_dao_thi_may', 'release').nextState;
    st = applyMoralChoice(st, 'fate_village_truth', 'reveal').nextState;
    st = applyMoralChoice(st, 'judgment_nguyen_van_khai', 'forgive').nextState;

    const res = resolveEnding(st);
    expect(res.ending).toBe('secret_ending');
    expect(res.hasAllSecretRelics).toBe(true);
    expect(res.darkReason).toBeNull();
  });

  const endingMatrix: Array<{
    may: 'release' | 'keep';
    truth: 'reveal' | 'burn';
    judge: 'forgive' | 'condemn';
    expected: 'true_ending' | 'bittersweet_ending' | 'dark_ending';
    expectedScore: number;
  }> = [
    { may: 'release', truth: 'reveal', judge: 'forgive', expected: 'true_ending', expectedScore: 2 },
    { may: 'release', truth: 'reveal', judge: 'condemn', expected: 'bittersweet_ending', expectedScore: 2 },
    { may: 'release', truth: 'burn', judge: 'forgive', expected: 'dark_ending', expectedScore: 0 },
    { may: 'keep', truth: 'reveal', judge: 'condemn', expected: 'dark_ending', expectedScore: 0 },
    { may: 'keep', truth: 'burn', judge: 'forgive', expected: 'dark_ending', expectedScore: -2 },
  ];

  for (const row of endingMatrix) {
    it(`resolves (${row.may}, ${row.truth}, ${row.judge}) with 4 Core Truths -> ${row.expected}`, () => {
      let st = buildFullTruthsState();
      st = applyMoralChoice(st, 'fate_dao_thi_may', row.may).nextState;
      st = applyMoralChoice(st, 'fate_village_truth', row.truth).nextState;
      st = applyMoralChoice(st, 'judgment_nguyen_van_khai', row.judge).nextState;

      expect(st.spiritScore).toBe(row.expectedScore);
      const res = resolveEnding(st);
      expect(res.ending).toBe(row.expected);
      if (row.expected === 'dark_ending') {
        expect(res.darkReason).toBe('compromised_conscience');
      } else {
        expect(res.darkReason).toBeNull();
      }
    });
  }

  it('triggers Dark Ending (incomplete_truth) when missing each individual Core Truth', () => {
    for (const omitted of CORE_TRUTH_IDS) {
      let st = createInitialNarrativeState();
      for (const tid of CORE_TRUTH_IDS) {
        if (tid !== omitted) st = unlockCoreTruth(st, tid);
      }
      st = applyMoralChoice(st, 'fate_dao_thi_may', 'release').nextState;
      st = applyMoralChoice(st, 'fate_village_truth', 'reveal').nextState;
      st = applyMoralChoice(st, 'judgment_nguyen_van_khai', 'forgive').nextState;

      const res = resolveEnding(st);
      expect(res.ending).toBe('dark_ending');
      expect(res.darkReason).toBe('incomplete_truth');
      expect(res.missingCoreTruths).toEqual([omitted]);
    }
  });

  it('triggers Dark Ending (incomplete_truth) when missing all 4 Core Truths', () => {
    let st = createInitialNarrativeState();
    st = applyMoralChoice(st, 'fate_dao_thi_may', 'release').nextState;
    st = applyMoralChoice(st, 'fate_village_truth', 'reveal').nextState;
    st = applyMoralChoice(st, 'judgment_nguyen_van_khai', 'forgive').nextState;

    const res = resolveEnding(st);
    expect(res.ending).toBe('dark_ending');
    expect(res.darkReason).toBe('incomplete_truth');
    expect(res.missingCoreTruths).toHaveLength(4);
  });

  it('triggers Dark Ending (judgment_missing) when judgment is not made', () => {
    let st = buildFullTruthsState();
    st = applyMoralChoice(st, 'fate_dao_thi_may', 'release').nextState;
    st = applyMoralChoice(st, 'fate_village_truth', 'reveal').nextState;

    const res = resolveEnding(st);
    expect(res.ending).toBe('dark_ending');
    expect(res.darkReason).toBe('judgment_missing');
  });

  it('classifies Dark Ending (multiple) when several requirements fail together', () => {
    const st = createInitialNarrativeState();
    const res = resolveEnding(st);
    expect(res.ending).toBe('dark_ending');
    expect(res.darkReason).toBe('multiple');
  });
});

describe('Moral Choice Immutability & Narrative Sanitization', () => {
  it('locks a moral choice after confirmation and prevents overwriting or double-calling', () => {
    const base = createInitialNarrativeState();
    const first = applyMoralChoice(base, 'fate_dao_thi_may', 'release');
    expect(first.applied).toBe(true);
    expect(first.nextState.spiritScore).toBe(1);

    // Calling again with same value must not alter state
    const dup = applyMoralChoice(first.nextState, 'fate_dao_thi_may', 'release');
    expect(dup.applied).toBe(false);
    expect(dup.reason).toBe('already_locked');
    expect(dup.nextState.spiritScore).toBe(1);

    // Trying to overwrite with opposite value must fail
    const overwrite = applyMoralChoice(first.nextState, 'fate_dao_thi_may', 'keep');
    expect(overwrite.applied).toBe(false);
    expect(overwrite.reason).toBe('already_locked');
    expect(overwrite.nextState.moralChoices.fate_dao_thi_may).toBe('release');
    expect(overwrite.nextState.spiritScore).toBe(1);
  });

  it('recomputes spiritScore from valid choices and rejects forged spiritScore or duplicate IDs', () => {
    const poisoned = {
      coreTruths: [
        'truth_l1_sealed_room',
        'truth_l1_sealed_room',
        'fake_truth_id',
        'truth_l2_living_sacrifice',
      ],
      moralChoices: {
        fate_dao_thi_may: 'keep',
        fate_village_truth: 'burn',
        judgment_nguyen_van_khai: 'invalid_choice',
      },
      spiritScore: 999, // Forged!
      completedEndings: ['true_ending', 'true_ending', 'fake_ending'],
      ngPlusUnlocked: true,
      isNewGamePlus: true,
    };

    const clean = sanitizeNarrativeState(poisoned);
    expect(clean.coreTruths).toEqual(['truth_l1_sealed_room', 'truth_l2_living_sacrifice']);
    expect(clean.moralChoices).toEqual({ fate_dao_thi_may: 'keep', fate_village_truth: 'burn' });
    expect(clean.spiritScore).toBe(-2);
    expect(computeSpiritScore(clean.moralChoices)).toBe(-2);
    expect(clean.completedEndings).toEqual(['true_ending']);
  });
});

describe('Save Migration, Corruption Recovery & New Game+ Lifecycle', () => {
  it('migrates legacy v1 save safely, deduplicates IDs, and retroactively awards Core Truths', () => {
    const legacyV1 = JSON.stringify({
      currentLevelId: 2,
      unlockedLevelIds: [1, 2, 2, 99],
      progressByLevel: {
        1: {
          collectedEvidenceIds: ['l1_comb', 'l1_comb'],
          discoveredHotspotIds: ['l1_hs_comb_hair'],
          unlockedClueIds: ['l1_c1', 'l1_c1'],
          solvedConnectionIds: ['l1_conn_1'],
          solvedPuzzleIds: ['l1_altar_lock', 'l1_truth_deduction'],
          openDoorIds: ['door_l1_sealed'],
          currentTier: 3,
          completed: true,
          playerPosition: [999, 1.65, -999], // Out of bounds -> clamped
          playerYaw: 0,
        },
      },
      settings: { masterVolume: 0.8, graphicsQuality: 'high' },
    });

    const migrated = migrateAndSanitizeSave(legacyV1);
    expect(migrated).not.toBeNull();
    expect(migrated!.schemaVersion).toBe(SAVE_SCHEMA_VERSION);
    expect(migrated!.unlockedLevelIds).toEqual([1, 2]);
    expect(migrated!.progressByLevel[1].collectedEvidenceIds).toEqual(['l1_comb']);
    expect(migrated!.progressByLevel[1].unlockedClueIds).toEqual(['l1_c1']);
    expect(migrated!.progressByLevel[1].playerPosition[0]).toBeLessThanOrEqual(27.6);
    expect(migrated!.narrative.coreTruths).toContain('truth_l1_sealed_room');
    expect(migrated!.settings.musicVolume).toBe(0.75); // filled default
  });

  it('recovers safely from corrupted JSON without throwing', () => {
    expect(migrateAndSanitizeSave('{corrupted json')).toBeNull();
    expect(migrateAndSanitizeSave('')).toBeNull();
    expect(migrateAndSanitizeSave(null)).toBeNull();
  });

  it('completes full New Game+ lifecycle: finish -> unlock NG+ -> reset run -> keep meta -> NG+ notes -> finish NG+', () => {
    let st = buildFullTruthsState();
    st = applyMoralChoice(st, 'fate_dao_thi_may', 'release').nextState;
    st = applyMoralChoice(st, 'fate_village_truth', 'reveal').nextState;
    st = applyMoralChoice(st, 'judgment_nguyen_van_khai', 'condemn').nextState;

    // 1. Complete normal run (Bittersweet)
    const run1 = completeGameWithEnding(st);
    expect(run1.resolution.ending).toBe('bittersweet_ending');
    expect(run1.nextState.ngPlusUnlocked).toBe(true);
    expect(run1.nextState.completedEndings).toEqual(['bittersweet_ending']);

    // Before starting NG+, NG+ notes must NOT appear
    expect(getActiveEvidenceNotes('l1_incense_bowl', run1.nextState)).toHaveLength(0);

    // 2. Start New Game+ run
    const ng = startNewGamePlusRun(run1.nextState);
    expect(ng.isNewGamePlus).toBe(true);
    expect(ng.ngPlusUnlocked).toBe(true);
    expect(ng.ngPlusRunCount).toBe(1);
    expect(ng.coreTruths).toEqual([]);
    expect(ng.moralChoices).toEqual({});
    expect(ng.spiritScore).toBe(0);
    expect(ng.completedEndings).toEqual(['bittersweet_ending']);

    // Hidden NG+ notes are now active!
    expect(getActiveEvidenceNotes('l1_incense_bowl', ng).length).toBeGreaterThan(0);
    expect(getActiveEvidenceNotes('l1_ritual_paper', ng).length).toBeGreaterThan(0);
    expect(getActiveEvidenceNotes('l4_mallet', ng).length).toBeGreaterThan(0);
    expect(getActiveEvidenceNotes('l5_letter', ng).length).toBeGreaterThan(0);

    // 3. Complete NG+ run with True Ending
    let ngEnd = ng;
    for (const tid of CORE_TRUTH_IDS) ngEnd = unlockCoreTruth(ngEnd, tid);
    ngEnd = applyMoralChoice(ngEnd, 'fate_dao_thi_may', 'release').nextState;
    ngEnd = applyMoralChoice(ngEnd, 'fate_village_truth', 'reveal').nextState;
    ngEnd = applyMoralChoice(ngEnd, 'judgment_nguyen_van_khai', 'forgive').nextState;

    const run2 = completeGameWithEnding(ngEnd);
    expect(run2.resolution.ending).toBe('true_ending');
    expect(run2.nextState.completedEndings).toEqual(['bittersweet_ending', 'true_ending']);
  });
});
