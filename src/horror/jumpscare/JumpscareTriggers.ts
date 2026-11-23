import { Vec3 } from '../../types/game';
import { NPCCharacterType } from '../npc/NPCStateMachine';
import { NarrativeState } from '../../data/narrativePack';

export interface JumpscareTriggerVolume {
  key: string;
  levelId: number;
  npcType: NPCCharacterType;
  caption: string;
  /** Checks whether player position is inside this trigger volume */
  test: (playerPos: Vec3, narrative: NarrativeState) => boolean;
  /** Optional fixed dramatic anchor (e.g., child spirit at well center); otherwise spawned safely ahead of player */
  fixedWorldPosition?: Vec3;
  preferredDistance?: number;
}

export const LEVEL_JUMPSCARE_TRIGGERS: JumpscareTriggerVolume[] = [
  // LEVEL 1 — Trần Thị Liên (backyard well approach & entering unsealed East Room)
  {
    key: 'l1_well_scare',
    levelId: 1,
    npcType: 'tran_thi_lien',
    caption: '“CON ƠI... ĐỪNG LẠI GẦN GIẾNG!”',
    test: ([px, , pz]) => pz > 5.8 && Math.abs(px) < 2.6,
    preferredDistance: 1.75,
  },
  {
    key: 'l1_sealed_scare',
    levelId: 1,
    npcType: 'tran_thi_lien',
    caption: '“AI DÁM XÉ BÙA BUỒNG ĐÔNG 1988?!”',
    test: ([px, , pz]) => px > 4.2 && pz < 1.5,
    preferredDistance: 1.65,
  },

  // LEVEL 2 — Đào Thị Mây (Banyan tree & Hậu Cung sanctuary — suppressed if 'release')
  {
    key: 'l2_banyan_scare',
    levelId: 2,
    npcType: 'dao_thi_may',
    caption: '“ÁO ĐỎ ĐÂY RỒI... KIỆU HOA ĐÂU?!”',
    test: ([px, , pz], narrative) =>
      narrative.moralChoices.fate_dao_thi_may !== 'release' && px < -3.5 && pz > 0.8 && pz < 4.8,
    preferredDistance: 1.7,
  },
  {
    key: 'l2_inner_scare',
    levelId: 2,
    npcType: 'dao_thi_may',
    caption: '“TRẢ LẠI TÊN CHO ĐÀO THỊ MÂY!”',
    test: ([, , pz], narrative) =>
      narrative.moralChoices.fate_dao_thi_may !== 'release' && pz < -6.8,
    preferredDistance: 1.65,
  },

  // LEVEL 3 — Hồn Đứa Trẻ Dưới Giếng (rises at well rim) + Headman's Hut
  {
    key: 'l3_well_scare',
    levelId: 3,
    npcType: 'child_spirit',
    caption: '“18/08/1978... SAO CHỈ KÉO MỘT GIỎ LÊN?!”',
    test: ([px, , pz]) => Math.hypot(px, pz) < 3.0,
    fixedWorldPosition: [0.0, 0.4, 0.0],
  },
  {
    key: 'l3_headman_scare',
    levelId: 3,
    npcType: 'tran_thi_lien',
    caption: '“NGƯƠI BIẾT HUYẾT THỐNG CỦA MÌNH RỒI SAO?!”',
    test: ([px, , pz]) => pz < -6.3 && Math.abs(px) < 3.5,
    preferredDistance: 1.7,
  },

  // LEVEL 4 — Bốn Tượng Quan Gỗ (sudden pose when approaching or entering Hậu Cung) + May ambush if 'keep'
  {
    key: 'l4_statue_scare',
    levelId: 4,
    npcType: 'wooden_statue',
    caption: '“ĐỪNG QUAY LƯNG LẠI VỚI CHÚNG TA!”',
    test: ([px, , pz]) => Math.abs(px) > 5.2 && pz < 5.5 && pz > -4.0,
    preferredDistance: 1.85,
  },
  {
    key: 'l4_sanctum_scare',
    levelId: 4,
    npcType: 'wooden_statue',
    caption: '“SẮC PHONG 1958 ĐÃ BỊ TRÁO!”',
    test: ([, , pz]) => pz < -7.2,
    preferredDistance: 1.85,
  },
  {
    key: 'l4_may_keep_ambush',
    levelId: 4,
    npcType: 'dao_thi_may',
    caption: '“NGƯƠI GIỮ TA LẠI... TA SẼ KHÔNG BUÔNG THA!”',
    test: ([px, , pz], narrative) =>
      narrative.moralChoices.fate_dao_thi_may === 'keep' && pz < -2.0 && Math.abs(px) < 3.0,
    preferredDistance: 1.65,
  },

  // LEVEL 5 — Hành Khách Không Mặt on Ferryboat + May ambush if 'keep'
  {
    key: 'l5_boat_scare',
    levelId: 5,
    npcType: 'faceless_passenger',
    caption: '“ĐÒ NHỔ SÀO RỒI... HÃY PHÁN QUYẾT ĐI!”',
    test: ([, , pz]) => pz < -4.8,
    preferredDistance: 1.8,
  },
  {
    key: 'l5_may_keep_ambush',
    levelId: 5,
    npcType: 'dao_thi_may',
    caption: '“OÁN NIỆM CỦA TA THEO NGƯƠI TỚI TẬN BẾN ĐÒ!”',
    test: ([, , pz], narrative) =>
      narrative.moralChoices.fate_dao_thi_may === 'keep' && pz < 1.5 && pz > -2.5,
    preferredDistance: 1.65,
  },
];
