import { Vec3 } from '../../types/game';
import { NPCCharacterType } from '../npc/NPCStateMachine';
import { NPCAnimationClipName } from '../npc/NPCAnimationController';
import { NarrativeState } from '../../data/narrativePack';
import { JumpscareType } from './PhysicalJumpscareDirector';

export interface JumpscareTriggerVolume {
  key: string;
  levelId: number;
  npcType: NPCCharacterType;
  jumpscareType: JumpscareType;
  caption: string;
  /** Checks whether player position is inside this trigger volume */
  test: (playerPos: Vec3, narrative: NarrativeState) => boolean;
  /** Optional fixed dramatic anchor (e.g., child spirit at well center); otherwise spawned safely ahead/behind player */
  fixedWorldPosition?: Vec3;
  preferredDistance?: number;
  animationClip?: NPCAnimationClipName;
  crawling?: boolean;
}

export const LEVEL_JUMPSCARE_TRIGGERS: JumpscareTriggerVolume[] = [
  // LEVEL 1 — Trần Thị Liên (backyard well approach & floor-crawling reveal inside East Room)
  {
    key: 'l1_well_scare',
    levelId: 1,
    npcType: 'tran_thi_lien',
    jumpscareType: 'C_CORNER_AMBUSH',
    caption: '“CON ƠI... ĐỪNG LẠI GẦN GIẾNG!”',
    test: ([px, , pz]) => pz > 5.8 && Math.abs(px) < 2.6,
    preferredDistance: 1.75,
    animationClip: 'ReachForward',
  },
  {
    key: 'l1_sealed_scare',
    levelId: 1,
    npcType: 'tran_thi_lien',
    jumpscareType: 'D_SURFACE_REVEAL',
    caption: '“AI DÁM XÉ BÙA BUỒNG ĐÔNG 1988?!”',
    test: ([px, , pz]) => px > 4.2 && pz < 1.5,
    preferredDistance: 1.65,
    animationClip: 'Crawling',
    crawling: true,
  },

  // LEVEL 2 — Đào Thị Mây (Banyan tree SlowHeadRaise & Hậu Cung Behind-Player Reveal — suppressed if 'release')
  {
    key: 'l2_banyan_scare',
    levelId: 2,
    npcType: 'dao_thi_may',
    jumpscareType: 'E_SUDDEN_APPROACH',
    caption: '“ÁO ĐỎ ĐÂY RỒI... KIỆU HOA ĐÂU?!”',
    test: ([px, , pz], narrative) =>
      narrative.moralChoices.fate_dao_thi_may !== 'release' && px < -3.5 && pz > 0.8 && pz < 4.8,
    preferredDistance: 1.75,
    animationClip: 'SlowHeadRaise',
  },
  {
    key: 'l2_inner_scare',
    levelId: 2,
    npcType: 'dao_thi_may',
    jumpscareType: 'A_BEHIND_PLAYER',
    caption: '“TRẢ LẠI TÊN CHO ĐÀO THỊ MÂY!”',
    test: ([, , pz], narrative) =>
      narrative.moralChoices.fate_dao_thi_may !== 'release' && pz < -6.8,
    preferredDistance: 1.65,
    animationClip: 'Lunge',
  },

  // LEVEL 3 — Hồn Đứa Trẻ Dưới Giếng (rises at well rim) + Headman's Hut
  {
    key: 'l3_well_scare',
    levelId: 3,
    npcType: 'child_spirit',
    jumpscareType: 'H_WATER_EMERGENCE',
    caption: '“18/08/1978... SAO CHỈ KÉO MỘT GIỎ LÊN?!”',
    test: ([px, , pz]) => Math.hypot(px, pz) < 3.0,
    fixedWorldPosition: [0.0, 0.4, 0.0],
    animationClip: 'WaterRise',
  },
  {
    key: 'l3_headman_scare',
    levelId: 3,
    npcType: 'tran_thi_lien',
    jumpscareType: 'F_LIGHT_TRIGGER',
    caption: '“NGƯƠI BIẾT HUYẾT THỐNG CỦA MÌNH RỒI SAO?!”',
    test: ([px, , pz]) => pz < -6.3 && Math.abs(px) < 3.5,
    preferredDistance: 1.7,
    animationClip: 'Lunge',
  },

  // LEVEL 4 — Bốn Tượng Quan Gỗ (sudden pose when approaching or entering Hậu Cung) + May ambush if 'keep'
  {
    key: 'l4_statue_scare',
    levelId: 4,
    npcType: 'wooden_statue',
    jumpscareType: 'G_STATUE_MOVEMENT',
    caption: '“ĐỪNG QUAY LƯNG LẠI VỚI CHÚNG TA!”',
    test: ([px, , pz]) => Math.abs(px) > 5.2 && pz < 5.5 && pz > -4.0,
    preferredDistance: 1.85,
    animationClip: 'ReachForward',
  },
  {
    key: 'l4_sanctum_scare',
    levelId: 4,
    npcType: 'wooden_statue',
    jumpscareType: 'G_STATUE_MOVEMENT',
    caption: '“SẮC PHONG 1958 ĐÃ BỊ TRÁO!”',
    test: ([, , pz]) => pz < -7.2,
    preferredDistance: 1.85,
    animationClip: 'Lunge',
  },
  {
    key: 'l4_may_keep_ambush',
    levelId: 4,
    npcType: 'dao_thi_may',
    jumpscareType: 'A_BEHIND_PLAYER',
    caption: '“NGƯƠI GIỮ TA LẠI... TA SẼ KHÔNG BUÔNG THA!”',
    test: ([px, , pz], narrative) =>
      narrative.moralChoices.fate_dao_thi_may === 'keep' && pz < -2.0 && Math.abs(px) < 3.0,
    preferredDistance: 1.65,
    animationClip: 'JumpscareAttack',
  },

  // LEVEL 5 — Hành Khách Không Mặt on Ferryboat + May ambush if 'keep'
  {
    key: 'l5_boat_scare',
    levelId: 5,
    npcType: 'faceless_passenger',
    jumpscareType: 'B_CORRIDOR_REVEAL',
    caption: '“ĐÒ NHỔ SÀO RỒI... HÃY PHÁN QUYẾT ĐI!”',
    test: ([, , pz]) => pz < -4.8,
    preferredDistance: 1.9,
    animationClip: 'StandUp',
  },
  {
    key: 'l5_may_keep_ambush',
    levelId: 5,
    npcType: 'dao_thi_may',
    jumpscareType: 'E_SUDDEN_APPROACH',
    caption: '“OÁN NIỆM CỦA TA THEO NGƯƠI TỚI TẬN BẾN ĐÒ!”',
    test: ([px, , pz], narrative) =>
      narrative.moralChoices.fate_dao_thi_may === 'keep' && pz < 1.5 && pz > -2.5,
    preferredDistance: 1.65,
    animationClip: 'JumpscareAttack',
  },
];
