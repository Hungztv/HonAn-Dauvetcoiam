import { describe, it, expect } from 'vitest';
import { LEVELS } from '../data/levels';
import { CORE_TRUTH_IDS } from '../data/narrativePack';
import { LEVEL_VISUAL_PROFILES, VISUAL_STANDARD } from '../three/VisualStandard';
import { QUALITY_PROFILES, assetPipeline } from '../three/AssetPipeline';

describe('All 5 Levels & 3-Tier Puzzle Integrity', () => {
  it('contains exactly 5 playable levels with unique IDs across evidences, clues, hotspots, doors, puzzles', () => {
    expect(LEVELS).toHaveLength(5);

    const evIds = new Set<string>();
    const hsIds = new Set<string>();
    const clueIds = new Set<string>();
    const connIds = new Set<string>();
    const puzzleIds = new Set<string>();
    const doorIds = new Set<string>();

    for (const lvl of LEVELS) {
      expect(lvl.tiers).toHaveLength(3);
      expect(lvl.evidences.length).toBeGreaterThanOrEqual(4);
      expect(lvl.clues.length).toBeGreaterThanOrEqual(lvl.tier1RequiredClues);

      const levelClueSet = new Set(lvl.clues.map((c) => c.id));

      for (const ev of lvl.evidences) {
        expect(evIds.has(ev.id)).toBe(false);
        evIds.add(ev.id);
        for (const hs of ev.hotspots) {
          expect(hsIds.has(hs.id)).toBe(false);
          hsIds.add(hs.id);
          expect(levelClueSet.has(hs.unlocksClueId)).toBe(true);
        }
      }

      for (const c of lvl.clues) {
        expect(clueIds.has(c.id)).toBe(false);
        clueIds.add(c.id);
      }

      for (const conn of lvl.boardConnections) {
        expect(connIds.has(conn.id)).toBe(false);
        connIds.add(conn.id);
        expect(levelClueSet.has(conn.clueA)).toBe(true);
        expect(levelClueSet.has(conn.clueB)).toBe(true);
      }

      for (const d of lvl.doors) {
        expect(doorIds.has(d.id)).toBe(false);
        doorIds.add(d.id);
      }

      expect(puzzleIds.has(lvl.tier2Puzzle.id)).toBe(false);
      puzzleIds.add(lvl.tier2Puzzle.id);
      expect(puzzleIds.has(lvl.tier3Puzzle.id)).toBe(false);
      puzzleIds.add(lvl.tier3Puzzle.id);
    }
  });

  it('enforces exact canonical puzzle solutions & Thuận Dương Phá Âm consistency across Levels 1–5', () => {
    const [l1, l2, l3, l4, l5] = LEVELS;

    // Level 1: Altar lock 1507 & unlocks truth_l1_sealed_room
    expect(l1.tier2Puzzle.kind).toBe('code_lock');
    if (l1.tier2Puzzle.kind === 'code_lock') {
      expect(l1.tier2Puzzle.solution).toEqual(['1', '5', '0', '7']);
    }
    expect(l1.tier3Puzzle.unlocksCoreTruthId).toBe(CORE_TRUTH_IDS[0]);

    // Level 2: Sequence & Moral Choice #1 (Đào Thị Mây) & unlocks truth_l2_living_sacrifice
    expect(l2.tier2Puzzle.kind).toBe('sequence');
    expect(l2.tier3Puzzle.unlocksCoreTruthId).toBe(CORE_TRUTH_IDS[1]);
    expect(l2.tier3Puzzle.moralChoice?.choiceId).toBe('fate_dao_thi_may');

    // Level 3: Well Winch 1978 & unlocks truth_l3_twin_bloodline
    expect(l3.tier2Puzzle.kind).toBe('code_lock');
    if (l3.tier2Puzzle.kind === 'code_lock') {
      expect(l3.tier2Puzzle.solution).toEqual(['1', '9', '7', '8']);
    }
    expect(l3.tier3Puzzle.unlocksCoreTruthId).toBe(CORE_TRUTH_IDS[2]);

    // Level 4: Festival Drum Đông -> Nam -> Tây -> Bắc & Moral Choice #2 & unlocks truth_l4_forged_edict
    expect(l4.tier2Puzzle.kind).toBe('sequence');
    if (l4.tier2Puzzle.kind === 'sequence') {
      expect(l4.tier2Puzzle.solutionOrder).toEqual(['drum_dong', 'drum_nam', 'drum_tay', 'drum_bac']);
    }
    expect(l4.tier3Puzzle.unlocksCoreTruthId).toBe(CORE_TRUTH_IDS[3]);
    expect(l4.tier3Puzzle.moralChoice?.choiceId).toBe('fate_village_truth');

    // Level 5: Ferryman Iron Chest Lược -> Trâm -> Xu -> Trống & Moral Choice #3 (Judgment)
    expect(l5.tier2Puzzle.kind).toBe('code_lock');
    if (l5.tier2Puzzle.kind === 'code_lock') {
      expect(l5.tier2Puzzle.solution).toEqual(['Lược', 'Trâm', 'Xu', 'Trống']);
    }
    expect(l5.tier3Puzzle.moralChoice?.choiceId).toBe('judgment_nguyen_van_khai');
  });

  it('defines Visual Standard v4.5.1 profiles for all 5 levels and all 4 quality tiers', () => {
    expect(VISUAL_STANDARD.postProcessing.restingChromaticAberration).toBe(0);
    expect(VISUAL_STANDARD.postProcessing.bloomThreshold).toBeGreaterThanOrEqual(0.9);
    for (const lvl of LEVELS) {
      expect(LEVEL_VISUAL_PROFILES[lvl.id]).toBeDefined();
    }
    expect(Object.keys(QUALITY_PROFILES)).toEqual(['low', 'medium', 'high', 'ultra']);
    const stats = assetPipeline.getStats();
    expect(stats.cachedModels).toBe(0);
  });
});
