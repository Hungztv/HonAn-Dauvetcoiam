/**
 * HỒN ÁN – DẤU VẾT CÕI ÂM (v6.0)
 * KỊCH BẢN MỚI: HỒ SƠ ĐỒI SƯƠNG LÂM VIÊN (VIỆT NAM THẬP NIÊN 2000 • 1994–2004)
 * Single canonical source of truth for timeline, 4 Core Truths, 4 Secret Relics,
 * Moral Choices, Spirit Score ("Lương Tâm / Chính Khí"), 4 Endings (incl. Secret Ending), and NG+.
 */

import { SecretRelicId } from '../types/game';

export const NARRATIVE_VERSION = '6.0' as const;

export const CORE_TRUTH_IDS = [
  'truth_l1_sealed_room',
  'truth_l2_living_sacrifice',
  'truth_l3_twin_bloodline',
  'truth_l4_forged_edict',
] as const;

export type CoreTruthId = (typeof CORE_TRUTH_IDS)[number];

export const SECRET_RELIC_IDS: readonly SecretRelicId[] = [
  'relic_l1_cassette',
  'relic_l2_badge',
  'relic_l3_wristband',
  'relic_l4_film_reel',
] as const;

export interface CoreTruthMeta {
  id: CoreTruthId;
  levelId: 1 | 2 | 3 | 4;
  year: number;
  direction: 'Đông' | 'Nam' | 'Tây' | 'Bắc';
  ritualItem: 'Băng Đỏ' | 'Huy Hiệu' | 'Thẻ B3' | 'Cuộn Phim';
  title: string;
  summary: string;
}

export const CORE_TRUTH_CATALOG: Record<CoreTruthId, CoreTruthMeta> = {
  truth_l1_sealed_room: {
    id: 'truth_l1_sealed_room',
    levelId: 1,
    year: 2002,
    direction: 'Đông',
    ritualItem: 'Băng Đỏ',
    title: 'Bức Tường Giả Phòng 404 Khu Tập Thể K7 (2002)',
    summary:
      'Y tá trưởng Nguyễn Thu Hà không hề bỏ trốn vì cờ bạc như biên bản giả năm 2002. Sau khi giấu Cuộn băng Cassette nhãn Đỏ tố cáo đường dây đưa học sinh nội trú đi thử thuốc, bà đã bị nhốt sau vách tường xây bít của Phòng 404.',
  },
  truth_l2_living_sacrifice: {
    id: 'truth_l2_living_sacrifice',
    levelId: 2,
    year: 2000,
    direction: 'Nam',
    ritualItem: 'Huy Hiệu',
    title: 'Đêm Mất Điện 14/11/2000 Tại Trường Nội Trú Đồi Sương',
    summary:
      'Em gái bạn — nữ sinh Lâm Hạ Vy — không tự sát vì trượt đội tuyển. Thư tuyệt mệnh đánh máy là ngụy tạo; đêm 14/11/2000 Vy lẻn vào Phòng Phát Thanh định phát băng vạch trần Hiệu phó Bảo và Viện trưởng Bách, nhưng bị khóa trái cửa sân thượng rồi bị đẩy ngã và mang đi phi tang lúc vẫn còn thở.',
  },
  truth_l3_twin_bloodline: {
    id: 'truth_l3_twin_bloodline',
    levelId: 3,
    year: 1998,
    direction: 'Tây',
    ritualItem: 'Thẻ B3',
    title: 'Dự Án Sóng Hạ Âm Khu B3 & Ký Ức Bị Xóa Của Chính Bạn (1998)',
    summary:
      'Từ năm 1998, Viện Điều Dưỡng Rừng Thông đã thử nghiệm sóng hạ âm 19Hz kèm thuốc xóa ký ức chấn thương khiến Bệnh nhi số 07 (Bé Minh) tử vong dưới bể ngầm. Chính bạn — Lâm Hoàng Quân (Bệnh nhân B3-09) — cũng từng bị tiêm xóa ký ức khiến đêm 14/11/2000 lên cơn hoảng loạn vô thức chốt cửa sân thượng nhốt Hạ Vy ở lại.',
  },
  truth_l4_forged_edict: {
    id: 'truth_l4_forged_edict',
    levelId: 4,
    year: 1994,
    direction: 'Bắc',
    ritualItem: 'Cuộn Phim',
    title: 'Đài Phát Hạ Âm Mỏ Cũ & Cái Chết Kỹ Sư Hòa Năm 1994',
    summary:
      'Mọi thứ khởi phát năm 1994 tại Nhà Văn Hóa & Đài Phát Sóng Đồi Bắc: để che giấu vụ sập hầm khai thác lậu dưới chân đập thủy điện, nhóm lợi ích đã sát hại Kỹ sư trưởng Ông Hòa, dùng máy phát hạ âm biến nơi đây thành vùng "ma ám" cấm người dân bén mảng suốt 10 năm.',
  },
};

export interface SecretRelicMeta {
  id: SecretRelicId;
  levelId: 1 | 2 | 3 | 4;
  title: string;
  summary: string;
}

export const SECRET_RELIC_CATALOG: Record<SecretRelicId, SecretRelicMeta> = {
  relic_l1_cassette: {
    id: 'relic_l1_cassette',
    levelId: 1,
    title: 'Máy Nghe Băng Walkman Cũ (Mật Thất Hầm Điện K7)',
    summary: 'Lưu đoạn băng nháp giọng Hạ Vy nhờ y tá Thu Hà giữ kín chuyện anh trai Quân từng bị tiêm thuốc ở Khu B3.',
  },
  relic_l2_badge: {
    id: 'relic_l2_badge',
    levelId: 2,
    title: 'Cuộn Băng Mặt B Của Hạ Vy (Hầm Sân Khấu Hội Trường)',
    summary: 'Lời nhắn cuối cùng của Hạ Vy gửi anh trai: "Em biết anh bị thuốc làm mờ trí nhớ nên mới khóa cửa vì tưởng đang cứu em — đừng bao giờ tự trách mình, anh nhé".',
  },
  relic_l3_wristband: {
    id: 'relic_l3_wristband',
    levelId: 3,
    title: 'Phim X-Quang & Phác Đồ Giải Độc B3-09 (Phòng Rửa Phim Ẩn)',
    summary: 'Bằng chứng gốc có chữ ký sống của Bác sĩ Vũ Đình Bách ra lệnh xóa ký ức của Quân năm 1998.',
  },
  relic_l4_film_reel: {
    id: 'relic_l4_film_reel',
    levelId: 4,
    title: 'Bản Âm Bản Phim Nhựa 35mm Năm 1994 (Buồng Tối Tráng Phim)',
    summary: 'Ghi hình toàn bộ mặt thật nhóm quan chức và Viện trưởng Bách tại hiện trường sập hầm 1994.',
  },
};

export const CANONICAL_TIMELINE = {
  mineCollapseYear: 1994,
  wardExperimentDate: '14/11/1998',
  sisterTragedyDate: '14/11/2000',
  nurseDisappearanceYear: 2002,
  investigationNight: '14/11/2004',
  protagonistAgeAtReturn: 26,
  ritualOrderDirections: ['Đông', 'Nam', 'Tây', 'Bắc'] as const,
  ritualOrderItems: ['Băng Đỏ', 'Huy Hiệu', 'Thẻ B3', 'Cuộn Phim'] as const,
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

export type EndingType =
  | 'secret_ending'
  | 'true_ending'
  | 'bittersweet_ending'
  | 'dark_ending';

export type DarkEndingReason =
  | 'incomplete_truth'
  | 'compromised_conscience'
  | 'judgment_missing'
  | 'multiple';

export interface EndingResolution {
  ending: EndingType;
  spiritScore: number;
  hasAllCoreTruths: boolean;
  hasAllSecretRelics: boolean;
  missingCoreTruths: CoreTruthId[];
  missingSecretRelics: SecretRelicId[];
  judgment: MoralChoiceValueMap['judgment_nguyen_van_khai'] | null;
  darkReason: DarkEndingReason | null;
  title: string;
  subtitle: string;
  narrative: string;
  epilogue: string;
}

export interface NarrativeState {
  coreTruths: CoreTruthId[];
  secretRelics: SecretRelicId[];
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
    secretRelics: [],
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
 * Computes Lương Tâm / Chính Khí (Spirit Score) strictly from validated moral choices:
 * - fate_dao_thi_may (Lâm Hạ Vy): release (+1) | keep (-1)
 * - fate_village_truth (Hồ sơ Đài Phát Sóng): reveal (+1) | burn (-1)
 * - judgment_nguyen_van_khai (Ông Lâm Văn Khải): forgive (0) | condemn (0)
 */
export function computeSpiritScore(choices: MoralChoiceRecord): number {
  let score = 0;
  if (choices.fate_dao_thi_may === 'release') score += 1;
  else if (choices.fate_dao_thi_may === 'keep') score -= 1;

  if (choices.fate_village_truth === 'reveal') score += 1;
  else if (choices.fate_village_truth === 'burn') score -= 1;

  return score;
}

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

export function unlockCoreTruth(state: NarrativeState, truthId: CoreTruthId): NarrativeState {
  if (!CORE_TRUTH_IDS.includes(truthId)) return state;
  if (state.coreTruths.includes(truthId)) return state;
  return {
    ...state,
    coreTruths: [...state.coreTruths, truthId],
  };
}

export function unlockSecretRelic(state: NarrativeState, relicId: SecretRelicId): NarrativeState {
  if (!SECRET_RELIC_IDS.includes(relicId)) return state;
  if (state.secretRelics.includes(relicId)) return state;
  return {
    ...state,
    secretRelics: [...state.secretRelics, relicId],
  };
}

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

  const rawRelics = Array.isArray(obj.secretRelics) ? obj.secretRelics : [];
  const secretRelics: SecretRelicId[] = [];
  for (const item of rawRelics) {
    if (
      typeof item === 'string' &&
      (SECRET_RELIC_IDS as readonly string[]).includes(item) &&
      !secretRelics.includes(item as SecretRelicId)
    ) {
      secretRelics.push(item as SecretRelicId);
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

  const validEndings: EndingType[] = [
    'secret_ending',
    'true_ending',
    'bittersweet_ending',
    'dark_ending',
  ];
  const rawEndings = Array.isArray(obj.completedEndings) ? obj.completedEndings : [];
  const completedEndings: EndingType[] = [];
  for (const e of rawEndings) {
    if (
      typeof e === 'string' &&
      validEndings.includes(e as EndingType) &&
      !completedEndings.includes(e as EndingType)
    ) {
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
    secretRelics,
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
 * - Secret Ending (4th Ending): all 4 Core Truths && all 4 Secret Relics && spiritScore === 2 && judgment === 'forgive'
 * - True Ending: all 4 Core Truths && spiritScore === 2 && judgment === 'forgive'
 * - Bittersweet Ending: all 4 Core Truths && spiritScore === 2 && judgment === 'condemn'
 * - Dark Ending: otherwise, classified with exact darkReason
 */
export function resolveEnding(inputState: NarrativeState): EndingResolution {
  const state = sanitizeNarrativeState(inputState);
  const spiritScore = state.spiritScore;
  const missingCoreTruths = CORE_TRUTH_IDS.filter((id) => !state.coreTruths.includes(id));
  const missingSecretRelics = SECRET_RELIC_IDS.filter((id) => !state.secretRelics.includes(id));
  const hasAllCoreTruths = missingCoreTruths.length === 0;
  const hasAllSecretRelics = missingSecretRelics.length === 0;
  const judgment = state.moralChoices.judgment_nguyen_van_khai ?? null;

  if (hasAllCoreTruths && hasAllSecretRelics && spiritScore === 2 && judgment === 'forgive') {
    return {
      ending: 'secret_ending',
      spiritScore,
      hasAllCoreTruths,
      hasAllSecretRelics,
      missingCoreTruths,
      missingSecretRelics,
      judgment,
      darkReason: null,
      title: 'KẾT CỤC BÍ MẬT — BẢN THU ÂM MẶT B LÚC BÌNH MINH',
      subtitle: 'Đủ 4 Mật Vật Ẩn • 4 Chân Lý • Lương Tâm Trọn Vẹn • Sự Tha Thứ Của Hạ Vy',
      narrative:
        'Khi đặt chiếc Walkman cũ lên cabin phà và lật sang Mặt B cuộn băng giấu dưới hầm hội trường, giọng nói trong trẻo của Lâm Hạ Vy vang lên giữa tiếng sóng vỗ rạng sáng 15/11/2004: "Anh Quân ơi, nếu anh nghe được mặt băng này nghĩa là anh đã nhớ lại tất cả. Em biết đêm đó anh lên cơn hoảng loạn vì thuốc của Khu B3 nên mới khóa cửa sân thượng để chắn bọn họ cho em. Em chưa bao giờ giận anh hay giận bố!". Trên sóng FM toàn tỉnh, toàn bộ phim nhựa 1994, bệnh án 1998 và băng ghi âm 2000–2002 đồng loạt được phát đi. Bốn bóng người lặng lẽ tan thành sương trắng ấm áp dưới nắng sớm Đồi Lâm Viên.',
      epilogue:
        'Đoàn xe thanh tra đặc biệt kéo còi vang vọng triền đèo lúc 6 giờ sáng. Trên bến phà lộng gió, ông Lâm Văn Khải cởi chiếc áo mưa sờn rách khoác lên vai con trai — mười năm bóng tối chính thức khép lại trọn vẹn không còn một mảnh khuất tất nào.',
    };
  }

  if (hasAllCoreTruths && spiritScore === 2 && judgment === 'forgive') {
    return {
      ending: 'true_ending',
      spiritScore,
      hasAllCoreTruths,
      hasAllSecretRelics,
      missingCoreTruths,
      missingSecretRelics,
      judgment,
      darkReason: null,
      title: 'KẾT CỤC THẬT — ÁNH ĐÈN BÊN KIA BỜ ĐẬP',
      subtitle: 'Sự Thật Phơi Bày • Lương Tâm Vững Vàng • Hóa Giải Mặc Cảm',
      narrative:
        'Bốn vật chứng Băng Đỏ – Huy Hiệu – Thẻ B3 – Cuộn Phim khớp nối hoàn chỉnh toàn bộ hồ sơ tội ác từ 1994 đến 2002. Tín hiệu hạ âm trên đỉnh đồi chấm dứt, trả lại sự tĩnh lặng cho mặt hồ Lâm Viên. Linh hồn Hạ Vy, y tá Thu Hà, bé Minh và kỹ sư Hòa khẽ mỉm cười trước khi tan vào làn sương bạc đầu ngày. Ông Lâm Văn Khải buông dây neo phà, nghẹn ngào nắm lấy bàn tay run rẩy của đứa con trai đã 4 năm mang gánh nặng ký ức khuyết thiếu.',
      epilogue:
        'Vụ án Đồi Sương Lâm Viên được mở lại trên mặt báo sáng hôm sau. (Gợi ý: Vẫn còn 4 Mật Vật Ẩn trong các mật thất có thể mở khóa Kết Cục Bí Mật thứ 4!).',
    };
  }

  if (hasAllCoreTruths && spiritScore === 2 && judgment === 'condemn') {
    return {
      ending: 'bittersweet_ending',
      spiritScore,
      hasAllCoreTruths,
      hasAllSecretRelics,
      missingCoreTruths,
      missingSecretRelics,
      judgment,
      darkReason: null,
      title: 'KẾT CỤC NGẬM NGÙI — TIẾNG CÒI PHÀ TRONG MƯA LẠNH',
      subtitle: 'Công Lý Nghiêm Khắc • Không Lời Bào Chữa',
      narrative:
        'Toàn bộ hồ sơ đen của Viện trưởng Bách và Hiệu phó Bảo đã được gửi thẳng tới cơ quan điều tra tỉnh, trả lại danh dự cho bốn nạn nhân. Thế nhưng trước lời phán xét nghiêm khắc về bốn năm che giấu sự thật làm giả hiện trường, ông Lâm Văn Khải chỉ lặng lẽ gật đầu chấp nhận. Ông tự tay khóa cabin, ngồi đợi đoàn xe công an đến bên cầu phao dưới cơn mưa lạnh buốt tháng Mười Một.',
      epilogue:
        'Án oan đã được rửa sạch trên giấy trắng mực đen, nhưng khoảng lặng giữa hai cha con bên hồ thủy điện mãi mãi không bao giờ hàn gắn được.',
    };
  }

  const reasons: ('incomplete_truth' | 'compromised_conscience' | 'judgment_missing')[] = [];
  if (!hasAllCoreTruths) reasons.push('incomplete_truth');
  if (spiritScore < 2) reasons.push('compromised_conscience');
  if (!judgment) reasons.push('judgment_missing');

  const darkReason: DarkEndingReason =
    reasons.length > 1 ? 'multiple' : reasons[0] ?? 'compromised_conscience';

  const reasonLine =
    darkReason === 'incomplete_truth'
      ? 'Hồ sơ điều tra vẫn khuyết những mắt xích cốt lõi — biên bản ngụy tạo của Viện trưởng Bách dễ dàng bẻ gãy lời tố cáo của bạn.'
      : darkReason === 'compromised_conscience'
      ? 'Những thỏa hiệp tiêu hủy bằng chứng và níu giữ oán niệm đã làm vẩn đục lương tâm người cầm bút.'
      : darkReason === 'judgment_missing'
      ? 'Sự do dự không dám đối diện trách nhiệm cuối cùng khiến chuyến phà kẹt lại giữa màn sương đặc quánh.'
      : 'Vừa bỏ sót chân tướng cốt lõi vừa đánh mất lương tâm nghề nghiệp — màn đêm Đồi Lâm Viên lập tức nuốt chửng sự thật.';

  return {
    ending: 'dark_ending',
    spiritScore,
    hasAllCoreTruths,
    hasAllSecretRelics,
    missingCoreTruths,
    missingSecretRelics,
    judgment,
    darkReason,
    title: 'KẾT CỤC BÓNG TỐI — TẦN SỐ VĨNH CỬU 404Hz',
    subtitle: 'Sóng Hạ Âm Phản Phệ • Vòng Lặp Đêm 14/11',
    narrative:
      `Cuộc đối chất trên chuyến phà sụp đổ. ${reasonLine} Tiếng ù hạ âm 19Hz từ đỉnh đồi bất ngờ dội vang làm toàn bộ đèn cao áp trên đập thủy điện nổ tung. Giọng băng cassette rè đặc lặp đi lặp lại trong đầu bạn, và khi mở mắt ra, đồng hồ điện tử trên cổ tay lại nhảy lùi về đúng 23:45 đêm 14/11/2004...`,
    epilogue:
      'Sự thật vẫn chìm dưới đáy hồ Lâm Viên. Hãy thu thập đủ 4 Chân Lý Cốt Lõi, phân biệt rõ manh mối giả và giữ vững Lương Tâm (+2) để phá vỡ vòng lặp.',
  };
}

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

export function startNewGamePlusRun(state: NarrativeState): NarrativeState {
  const sanitized = sanitizeNarrativeState(state);
  if (!sanitized.ngPlusUnlocked) {
    return sanitized;
  }
  return {
    coreTruths: [],
    secretRelics: [],
    moralChoices: {},
    spiritScore: 0,
    isNewGamePlus: true,
    ngPlusUnlocked: true,
    ngPlusRunCount: sanitized.ngPlusRunCount + 1,
    completedEndings: [...sanitized.completedEndings],
    lastEnding: null,
  };
}

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
      text: 'Rọi sát đèn vào đáy bát hương bàn thờ cầu thang K7, bạn nhận ra mặt trong nắp pin đèn pin của mình có dán tem kiểm định của "Trạm Thủy Điện Lâm Viên — L.V.Khải 2000".',
    },
  ],
  l1_ritual_paper: [
    {
      id: 'ngp_red_petition',
      tag: 'NG+',
      text: 'Mặt sau tờ biên bản công an có dấu bút chì mờ của ông Khải: "Giấy đòi nợ ở phòng 402 là giả — đừng tin lời gã bảo vệ trực đêm".',
    },
  ],
  l4_mallet: [
    {
      id: 'ngp_mallet_10y',
      tag: 'NG+',
      text: 'Khắc bên trong hộp sắt cuộn phim: "Bố đã lén tráo cuộn phim gốc năm 2001 trước khi đám người của Bách đốt kho Nhà Văn Hóa".',
    },
  ],
  l5_letter: [
    {
      id: 'ngp_khai_dialogue',
      tag: 'NG+',
      text: 'Dòng tái bút mới của ông Lâm Văn Khải ở Màn 5: "Hãy tìm đủ cả 4 Mật Vật Ẩn ở các hầm ngầm nếu con muốn nghe trọn vẹn mặt B cuộn băng của bé Hạ Vy".',
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

  if (evidenceId === 'l3_register' && narrative.moralChoices.fate_dao_thi_may === 'release') {
    notes.push({
      id: 'mc_may_blessing',
      tag: 'Chính Khí',
      text: 'Nhờ bạn đã thanh thản trao trả kỷ vật cho Hạ Vy ở Trường Nội Trú, kẹp giữa trang bệnh án B3-09 hiện rõ tờ ghi chú giúp bạn phân biệt ngay hồ sơ thật và hồ sơ bị sửa.',
    });
  }
  if (evidenceId === 'l3_register' && narrative.moralChoices.fate_dao_thi_may === 'keep') {
    notes.push({
      id: 'mc_may_curse',
      tag: 'Chính Khí',
      text: 'Vệt nước mưa đen ngòm nhỏ xuống nhòe một góc bệnh án B3-09 — nỗi uất ức của Hạ Vy đang bám theo bước chân bạn khắp hành lang Viện Điều Dưỡng.',
    });
  }
  if (evidenceId === 'l5_ledger' && narrative.moralChoices.fate_village_truth === 'reveal') {
    notes.push({
      id: 'mc_truth_light',
      tag: 'Chính Khí',
      text: 'Tín hiệu phát thanh công bố sự thật từ Đồi Bắc giúp bốn dải tần trên Sổ Trực Phà ổn định rõ nét.',
    });
  }
  if (evidenceId === 'l5_ledger' && narrative.moralChoices.fate_village_truth === 'burn') {
    notes.push({
      id: 'mc_truth_ash',
      tag: 'Chính Khí',
      text: 'Mùi khét lẹt của cuộn hồ sơ bị đốt ở Đài Phát Sóng ám chặt lên Sổ Trực Phà — sóng hạ âm đang nhiễu loạn dữ dội quanh cabin.',
    });
  }

  return notes;
}
