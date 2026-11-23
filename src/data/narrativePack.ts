/**
 * HỒN ÁN – DẤU VẾT CÕI ÂM
 * Narrative Design Bible v3.0 & Narrative Data Pack v3.1
 * Single canonical source of truth for timeline, Core Truths, Moral Choices,
 * Spirit Score ("Chính Khí"), Ending Resolution, and New Game+ secrets.
 */

export const NARRATIVE_VERSION = '3.1' as const;

export const CORE_TRUTH_IDS = [
  'truth_l1_sealed_room',
  'truth_l2_living_sacrifice',
  'truth_l3_twin_bloodline',
  'truth_l4_forged_edict',
] as const;

export type CoreTruthId = (typeof CORE_TRUTH_IDS)[number];

export interface CoreTruthMeta {
  id: CoreTruthId;
  levelId: 1 | 2 | 3 | 4;
  year: number;
  direction: 'Đông' | 'Nam' | 'Tây' | 'Bắc';
  ritualItem: 'Lược gỗ' | 'Trâm ngọc' | 'Đồng xu sứt' | 'Dùi trống';
  title: string;
  summary: string;
}

export const CORE_TRUTH_CATALOG: Record<CoreTruthId, CoreTruthMeta> = {
  truth_l1_sealed_room: {
    id: 'truth_l1_sealed_room',
    levelId: 1,
    year: 1988,
    direction: 'Đông',
    ritualItem: 'Lược gỗ',
    title: 'Căn Buồng Niêm Phong Năm 1988',
    summary:
      'Năm 1988, Nguyễn Văn Khải phong ấn Trần Thị Liên — mẹ ruột của cặp song sinh — trong gian buồng phía Đông sau cơn loạn trí đau đớn và lời nguyền từ chiếc giếng năm 1978.',
  },
  truth_l2_living_sacrifice: {
    id: 'truth_l2_living_sacrifice',
    levelId: 2,
    year: 1968,
    direction: 'Nam',
    ritualItem: 'Trâm ngọc',
    title: 'Nghi Lễ Hiến Sinh Sống Năm 1968',
    summary:
      'Đào Thị Mây không tự vẫn mà bị thầy cúng Năm Đen và Lý trưởng biến thành vật hiến sinh sống ngay đêm trước lễ cưới, rồi lập miếu dọa dân làng che giấu tội ác.',
  },
  truth_l3_twin_bloodline: {
    id: 'truth_l3_twin_bloodline',
    levelId: 3,
    year: 1978,
    direction: 'Tây',
    ritualItem: 'Đồng xu sứt',
    title: 'Huyết Thống Cặp Song Sinh Năm 1978',
    summary:
      'Sinh ngày 15/07/1978 dương lịch; 34 ngày sau, đúng Rằm tháng Bảy âm lịch (18/08/1978), một đứa trẻ song sinh bị hiến tế xuống giếng. Nguyễn Văn Khải đã đánh đổi tất cả để cứu đứa còn lại — chính là bạn — đưa đi nơi khác nuôi lớn.',
  },
  truth_l4_forged_edict: {
    id: 'truth_l4_forged_edict',
    levelId: 4,
    year: 1958,
    direction: 'Bắc',
    ritualItem: 'Dùi trống',
    title: 'Sắc Phong Giả & Nỗi Oan Ông Từ Năm 1958',
    summary:
      'Từ năm 1958, sắc phong Thành Hoàng đã bị tráo giả, Ông Từ giữ đình bị thủ tiêu, dùi trống bị yểm cất trong kho tế khí cho đến khi Khải lén lấy năm 1988 và giấu sau mảnh phù điêu suốt 10 năm chờ người phá giải.',
  },
};

export const CANONICAL_TIMELINE = {
  twinBirthSolar: '15/07/1978',
  sacrificeLunar: 'Rằm tháng Bảy Âm lịch 1978',
  sacrificeSolar: '18/08/1978',
  daysBetweenBirthAndSacrifice: 34,
  returnLunar: 'Rằm tháng Bảy Âm lịch 1998',
  returnSolar: '05/09/1998',
  protagonistAgeAtReturn: 20,
  ritualOrderDirections: ['Đông', 'Nam', 'Tây', 'Bắc'] as const,
  ritualOrderItems: ['Lược', 'Trâm', 'Xu', 'Trống'] as const,
} as const;

export type MoralChoiceId =
  | 'fate_dao_thi_may'
  | 'fate_village_truth'
  | 'judgment_nguyen_van_khai';

export interface MoralChoiceValueMap {
  fate_dao_thi_may: 'release' | 'keep';
  fate_village_truth: 'reveal' | 'burn';
  judgment_nguyen_van_khai: 'forgive' | 'condemn';
}

export type MoralChoiceRecord = {
  [K in MoralChoiceId]?: MoralChoiceValueMap[K];
};

export const VALID_MORAL_VALUES: {
  [K in MoralChoiceId]: readonly MoralChoiceValueMap[K][];
} = {
  fate_dao_thi_may: ['release', 'keep'],
  fate_village_truth: ['reveal', 'burn'],
  judgment_nguyen_van_khai: ['forgive', 'condemn'],
};

export type EndingType = 'true_ending' | 'bittersweet_ending' | 'dark_ending';

export type DarkEndingReason =
  | 'incomplete_truth'
  | 'compromised_conscience'
  | 'judgment_missing'
  | 'multiple';

export interface EndingResolution {
  ending: EndingType;
  spiritScore: number;
  hasAllCoreTruths: boolean;
  missingCoreTruths: CoreTruthId[];
  judgment: MoralChoiceValueMap['judgment_nguyen_van_khai'] | null;
  darkReason: DarkEndingReason | null;
  title: string;
  subtitle: string;
  narrative: string;
  epilogue: string;
}

export interface NarrativeState {
  coreTruths: CoreTruthId[];
  moralChoices: MoralChoiceRecord;
  /** Recomputed strictly from valid moralChoices */
  spiritScore: number;
  isNewGamePlus: boolean;
  ngPlusUnlocked: boolean;
  ngPlusRunCount: number;
  completedEndings: EndingType[];
  lastEnding: EndingResolution | null;
}

export function createInitialNarrativeState(preserveMeta?: Partial<NarrativeState>): NarrativeState {
  return {
    coreTruths: [],
    moralChoices: {},
    spiritScore: 0,
    isNewGamePlus: false,
    ngPlusUnlocked: Boolean(preserveMeta?.ngPlusUnlocked),
    ngPlusRunCount: typeof preserveMeta?.ngPlusRunCount === 'number' ? Math.max(0, preserveMeta.ngPlusRunCount) : 0,
    completedEndings: Array.isArray(preserveMeta?.completedEndings)
      ? Array.from(new Set(preserveMeta.completedEndings))
      : [],
    lastEnding: null,
  };
}

/**
 * Computes Chính Khí (Spirit Score) strictly from validated moral choices.
 * - fate_dao_thi_may: release (+1) | keep (-1)
 * - fate_village_truth: reveal (+1) | burn (-1)
 * - judgment_nguyen_van_khai: forgive (0) | condemn (0)
 */
export function computeSpiritScore(choices: MoralChoiceRecord): number {
  let score = 0;
  if (choices.fate_dao_thi_may === 'release') score += 1;
  else if (choices.fate_dao_thi_may === 'keep') score -= 1;

  if (choices.fate_village_truth === 'reveal') score += 1;
  else if (choices.fate_village_truth === 'burn') score -= 1;

  return score;
}

/**
 * Locks a moral choice permanently for the current run.
 * If the choice has already been made, returns state unchanged (cannot overwrite).
 */
export function applyMoralChoice<K extends MoralChoiceId>(
  state: NarrativeState,
  choiceId: K,
  value: MoralChoiceValueMap[K]
): { nextState: NarrativeState; applied: boolean; reason?: 'already_locked' | 'invalid_value' } {
  const validValues = VALID_MORAL_VALUES[choiceId] as readonly string[];
  if (!validValues.includes(value)) {
    return { nextState: state, applied: false, reason: 'invalid_value' };
  }
  if (state.moralChoices[choiceId] !== undefined) {
    return { nextState: state, applied: false, reason: 'already_locked' };
  }

  const nextChoices: MoralChoiceRecord = {
    ...state.moralChoices,
    [choiceId]: value,
  };

  return {
    applied: true,
    nextState: {
      ...state,
      moralChoices: nextChoices,
      spiritScore: computeSpiritScore(nextChoices),
    },
  };
}

/** Unlocks a canonical Core Truth ID cleanly without duplicates. */
export function unlockCoreTruth(state: NarrativeState, truthId: CoreTruthId): NarrativeState {
  if (!CORE_TRUTH_IDS.includes(truthId)) return state;
  if (state.coreTruths.includes(truthId)) return state;
  return {
    ...state,
    coreTruths: [...state.coreTruths, truthId],
  };
}

/**
 * Sanitizes untrusted/corrupted/legacy NarrativeState from localStorage:
 * - Strips invalid & duplicate CoreTruth IDs
 * - Strips invalid MoralChoice keys/values
 * - Recomputes spiritScore from valid moralChoices (ignores forged/stale spiritScore!)
 * - Normalizes completedEndings & NG+ flags
 */
export function sanitizeNarrativeState(raw: unknown): NarrativeState {
  if (!raw || typeof raw !== 'object') {
    return createInitialNarrativeState();
  }
  const obj = raw as Record<string, unknown>;

  const rawTruths = Array.isArray(obj.coreTruths) ? obj.coreTruths : [];
  const coreTruths: CoreTruthId[] = [];
  for (const item of rawTruths) {
    if (
      typeof item === 'string' &&
      (CORE_TRUTH_IDS as readonly string[]).includes(item) &&
      !coreTruths.includes(item as CoreTruthId)
    ) {
      coreTruths.push(item as CoreTruthId);
    }
  }

  const rawChoices =
    obj.moralChoices && typeof obj.moralChoices === 'object'
      ? (obj.moralChoices as Record<string, unknown>)
      : {};
  const moralChoices: MoralChoiceRecord = {};

  const mayVal = rawChoices.fate_dao_thi_may;
  if (mayVal === 'release' || mayVal === 'keep') {
    moralChoices.fate_dao_thi_may = mayVal;
  }
  const truthVal = rawChoices.fate_village_truth;
  if (truthVal === 'reveal' || truthVal === 'burn') {
    moralChoices.fate_village_truth = truthVal;
  }
  const judgeVal = rawChoices.judgment_nguyen_van_khai;
  if (judgeVal === 'forgive' || judgeVal === 'condemn') {
    moralChoices.judgment_nguyen_van_khai = judgeVal;
  }

  const validEndings: EndingType[] = ['true_ending', 'bittersweet_ending', 'dark_ending'];
  const rawEndings = Array.isArray(obj.completedEndings) ? obj.completedEndings : [];
  const completedEndings: EndingType[] = [];
  for (const e of rawEndings) {
    if (typeof e === 'string' && validEndings.includes(e as EndingType) && !completedEndings.includes(e as EndingType)) {
      completedEndings.push(e as EndingType);
    }
  }

  const ngPlusUnlocked = Boolean(obj.ngPlusUnlocked) || completedEndings.length > 0;
  const isNewGamePlus = Boolean(obj.isNewGamePlus) && ngPlusUnlocked;
  const ngPlusRunCount =
    typeof obj.ngPlusRunCount === 'number' && Number.isFinite(obj.ngPlusRunCount)
      ? Math.max(0, Math.floor(obj.ngPlusRunCount))
      : 0;

  return {
    coreTruths,
    moralChoices,
    spiritScore: computeSpiritScore(moralChoices),
    isNewGamePlus,
    ngPlusUnlocked,
    ngPlusRunCount,
    completedEndings,
    lastEnding: null,
  };
}

/**
 * Resolves the canonical ending strictly from sanitized state:
 * - True Ending: spiritScore === 2 && all 4 Core Truths && judgment === 'forgive'
 * - Bittersweet Ending: spiritScore === 2 && all 4 Core Truths && judgment === 'condemn'
 * - Dark Ending: otherwise, classified with exact darkReason
 */
export function resolveEnding(inputState: NarrativeState): EndingResolution {
  const state = sanitizeNarrativeState(inputState);
  const spiritScore = state.spiritScore;
  const missingCoreTruths = CORE_TRUTH_IDS.filter((id) => !state.coreTruths.includes(id));
  const hasAllCoreTruths = missingCoreTruths.length === 0;
  const judgment = state.moralChoices.judgment_nguyen_van_khai ?? null;

  if (hasAllCoreTruths && spiritScore === 2 && judgment === 'forgive') {
    return {
      ending: 'true_ending',
      spiritScore,
      hasAllCoreTruths,
      missingCoreTruths,
      judgment,
      darkReason: null,
      title: 'KẾT CỤC THẬT — BÌNH MINH TRÊN BẾN ĐÒ ÂM',
      subtitle: 'Thuận Dương Phá Âm • Chính Khí Viên Mãn • Tha Thứ',
      narrative:
        'Bốn tín vật Đông – Nam – Tây – Bắc (Lược – Trâm – Xu – Trống) đồng loạt tỏa sáng vàng ấm áp. Sương mù trên khúc sông làng Đông Mộ tan biến trước ánh nắng rạng đông 05/09/1998. Bốn oan hồn — Trần Thị Liên, Đào Thị Mây, người em song sinh yểu mệnh và Ông Từ giữ đình — khẽ cúi đầu siêu thoát. Nguyễn Văn Khải buông mái chèo cũ, rơi nước mắt thanh thản khi nghe chính đứa con năm xưa mình cứu sống gọi một tiếng "Cha".',
      epilogue:
        'Lời nguyền 40 năm từ 1958 đến 1998 chính thức khép lại. Trên bến sông vắng chỉ còn tiếng nước chảy êm đềm và chiếc đèn pin cũ khắc dòng chữ của người cha.',
    };
  }

  if (hasAllCoreTruths && spiritScore === 2 && judgment === 'condemn') {
    return {
      ending: 'bittersweet_ending',
      spiritScore,
      hasAllCoreTruths,
      missingCoreTruths,
      judgment,
      darkReason: null,
      title: 'KẾT CỤC NGẬM NGÙI — ĐÒ RỜI BẾN VẮNG',
      subtitle: 'Sự Thật Sáng Tỏ • Chính Khí Trọn Vẹn • Phán Xét Nghiêm Khắc',
      narrative:
        'Mọi uẩn khúc suốt 40 năm đã được phơi bày trước ánh sáng công lý. Đào Thị Mây, Trần Thị Liên, đứa trẻ song sinh và Ông Từ đều được hóa giải oan khuất, nhẹ nhàng sang bờ bên kia. Thế nhưng trước lời kết tội lạnh lùng của bạn, Nguyễn Văn Khải không biện minh một lời — ông lặng lẽ đội lại chiếc nón lá rách, một mình chèo con đò trống chìm dần vào làn sương trắng để tự gánh phần nghiệp cuối cùng.',
      epilogue:
        'Án oan đã giải, nhưng sự tha thứ chưa từng được nói ra. Bình minh lên trên bến vắng mang theo nỗi buồn day dứt không thể gọi tên.',
    };
  }

  // Classify Dark Ending failure reasons accurately
  const reasons: ('incomplete_truth' | 'compromised_conscience' | 'judgment_missing')[] = [];
  if (!hasAllCoreTruths) reasons.push('incomplete_truth');
  if (spiritScore < 2) reasons.push('compromised_conscience');
  if (!judgment) reasons.push('judgment_missing');

  const darkReason: DarkEndingReason =
    reasons.length > 1 ? 'multiple' : reasons[0] ?? 'compromised_conscience';

  const reasonLine =
    darkReason === 'incomplete_truth'
      ? 'Những mảnh ghép cốt lõi của 4 vụ án vẫn còn bỏ sót — oan hồn chưa thể gọi đủ tên để siêu thoát.'
      : darkReason === 'compromised_conscience'
      ? 'Lương tâm đã bị lung lay bởi những lựa chọn vị kỷ — Chính Khí không đủ để phá vỡ tà trận.'
      : darkReason === 'judgment_missing'
      ? 'Lời phán quyết cuối cùng chưa được tuyên — con đò mãi kẹt giữa ranh giới âm dương.'
      : 'Vừa thiếu chân lý cốt lõi vừa đánh mất Chính Khí — bóng tối cõi âm lập tức nuốt trọn bến đò.';

  return {
    ending: 'dark_ending',
    spiritScore,
    hasAllCoreTruths,
    missingCoreTruths,
    judgment,
    darkReason,
    title: 'KẾT CỤC BÓNG TỐI — CHUYẾN ĐÒ KHÔNG BẾN',
    subtitle: 'Âm Khí Phản Phệ • Vòng Lặp Lời Nguyền Tiếp Diễn',
    narrative:
      `Nghi thức Thuận Dương Phá Âm gãy đoạn giữa chừng. ${reasonLine} Bốn ngọn đèn lồng trên đò phụt tắt trong làn gió lạnh cắt da. Tiếng trống đình và tiếng gõ đáy giếng đồng loạt vang lên từ bốn phương, còn chiếc nón lá rách rơi xuống ngay trước chân bạn — buộc bạn ở lại làm người lái đò mới cho đến đêm Rằm tháng Bảy tiếp theo.`,
    epilogue:
      'Bóng tối vẫn chưa buông tha làng Đông Mộ. Hãy quay lại điều tra đủ 4 Chân Lý Cốt Lõi và giữ vững Chính Khí (+2) để thay đổi định mệnh.',
  };
}

/** Completes the game run, resolves ending, records it, and unlocks New Game+. */
export function completeGameWithEnding(state: NarrativeState): {
  nextState: NarrativeState;
  resolution: EndingResolution;
} {
  const sanitized = sanitizeNarrativeState(state);
  const resolution = resolveEnding(sanitized);
  const completedEndings = sanitized.completedEndings.includes(resolution.ending)
    ? sanitized.completedEndings
    : [...sanitized.completedEndings, resolution.ending];

  return {
    resolution,
    nextState: {
      ...sanitized,
      ngPlusUnlocked: true,
      completedEndings,
      lastEnding: resolution,
    },
  };
}

/**
 * Starts a clean New Game+ run:
 * - Resets coreTruths, moralChoices, spiritScore, lastEnding for the new run
 * - Preserves ngPlusUnlocked & completedEndings
 * - Enables isNewGamePlus = true and increments ngPlusRunCount
 */
export function startNewGamePlusRun(state: NarrativeState): NarrativeState {
  const sanitized = sanitizeNarrativeState(state);
  if (!sanitized.ngPlusUnlocked) {
    return sanitized;
  }
  return {
    coreTruths: [],
    moralChoices: {},
    spiritScore: 0,
    isNewGamePlus: true,
    ngPlusUnlocked: true,
    ngPlusRunCount: sanitized.ngPlusRunCount + 1,
    completedEndings: [...sanitized.completedEndings],
    lastEnding: null,
  };
}

/** Hidden NG+ & moral-choice-reactive evidence notes shown when inspecting items or opening Journal */
export interface ActiveEvidenceNote {
  id: string;
  tag: 'NG+' | 'Chính Khí' | 'Cốt Truyện';
  text: string;
}

const NG_PLUS_NOTES_BY_EVIDENCE: Record<string, ActiveEvidenceNote[]> = {
  l1_incense_bowl: [
    {
      id: 'ngp_flashlight_note',
      tag: 'NG+',
      text: 'Khi rọi kỹ ánh đèn pin vào thành bát hương, bạn chợt nhận ra trên thân đèn pin của mình có dòng chữ khắc mờ của Nguyễn Văn Khải: "Con phải sống qua tuổi 20 — đừng quay về trước Rằm tháng Bảy 1998".',
    },
  ],
  l1_ritual_paper: [
    {
      id: 'ngp_red_petition',
      tag: 'NG+',
      text: 'Kẹp sau tờ sớ cúng xuất hiện thêm một lá đơn đỏ gấp nhỏ: "Đứa trẻ sinh ngày 15/07/1978 đã sống trọn tuổi 20 — đêm 05/09/1998 này là cơ hội duy nhất để hóa giải án oan".',
    },
  ],
  l4_mallet: [
    {
      id: 'ngp_mallet_10y',
      tag: 'NG+',
      text: 'Ghi chú ẩn khắc mặt trong cán dùi trống: "Năm 1988, ta lén lấy dùi trống từ kho tế khí trước khi chúng đốt, giấu sau mảnh phù điêu suốt 10 năm trời chờ con tìm thấy".',
    },
  ],
  l5_letter: [
    {
      id: 'ngp_khai_dialogue',
      tag: 'NG+',
      text: 'Dòng tái bút mới của Nguyễn Văn Khải ở Màn 5: "Cha đã đứng đợi trên bến đò từ khi con còn đặt chân vào nhà gỗ ba gian. Tha thứ hay phán xét — cha đều chấp nhận".',
    },
  ],
};

export function getActiveEvidenceNotes(
  evidenceId: string,
  narrative: NarrativeState
): ActiveEvidenceNote[] {
  const notes: ActiveEvidenceNote[] = [];

  if (narrative.isNewGamePlus && NG_PLUS_NOTES_BY_EVIDENCE[evidenceId]) {
    notes.push(...NG_PLUS_NOTES_BY_EVIDENCE[evidenceId]);
  }

  // Moral choice reactivity notes
  if (evidenceId === 'l3_register' && narrative.moralChoices.fate_dao_thi_may === 'release') {
    notes.push({
      id: 'mc_may_blessing',
      tag: 'Chính Khí',
      text: 'Hơi ấm thoang thoảng mùi hương sen từ Miếu Cô Đỏ làm rõ thêm nét mực bị xóa trên giấy khai sinh ngày 15/07/1978.',
    });
  }
  if (evidenceId === 'l3_register' && narrative.moralChoices.fate_dao_thi_may === 'keep') {
    notes.push({
      id: 'mc_may_curse',
      tag: 'Chính Khí',
      text: 'Vệt mực đỏ sẫm như máu rỉ ra che mờ lề trang sổ — oan khí của Đào Thị Mây đang bám theo bạn tới tận Làng Giếng Cũ.',
    });
  }
  if (evidenceId === 'l5_ledger' && narrative.moralChoices.fate_village_truth === 'reveal') {
    notes.push({
      id: 'mc_truth_light',
      tag: 'Chính Khí',
      text: 'Nhờ bạn đã công bố sự thật tại Ngôi Đình Cổ, bốn dòng tên trên sổ lái đò sáng rõ mạch lạc, sẵn sàng cho nghi thức Thuận Dương Phá Âm.',
    });
  }
  if (evidenceId === 'l5_ledger' && narrative.moralChoices.fate_village_truth === 'burn') {
    notes.push({
      id: 'mc_truth_ash',
      tag: 'Chính Khí',
      text: 'Mép sổ lái đò cháy sém đen ngòm như vừa bị lửa thiêu từ Ngôi Đình Cổ — tà khí đang cản trở chuyến đò siêu thoát.',
    });
  }

  return notes;
}
