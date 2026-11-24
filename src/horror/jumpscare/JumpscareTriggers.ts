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
  fixedWorldPosition?: Vec3;
  preferredDistance?: number;
  animationClip?: NPCAnimationClipName;
  crawling?: boolean;
}

export const LEVEL_JUMPSCARE_TRIGGERS: JumpscareTriggerVolume[] = [
  // LEVEL 1 — Y tá Nguyễn Thu Hà (Sân phơi Bắc & bò dưới sàn Phòng 404)
  {
    key: 'l1_well_scare',
    levelId: 1,
    npcType: 'tran_thi_lien',
    jumpscareType: 'C_CORNER_AMBUSH',
    caption: '“ĐỪNG TIN TỜ GIẤY ĐÒI NỢ... CHÚNG TRÁT KÍN TÔI TRONG TƯỜNG!”',
    test: ([px, , pz]) => pz < -21.0 && Math.abs(px) < 6.0,
    preferredDistance: 1.75,
    animationClip: 'ReachForward',
  },
  {
    key: 'l1_sealed_scare',
    levelId: 1,
    npcType: 'tran_thi_lien',
    jumpscareType: 'D_SURFACE_REVEAL',
    caption: '“PHÒNG 404... CỨU TÔI RA KHỎI VÁCH VÔI NÀY!”',
    test: ([px, , pz]) => px > 8.5 && pz < -9.5,
    preferredDistance: 1.65,
    animationClip: 'Crawling',
    crawling: true,
  },

  // LEVEL 2 — Nữ sinh Lâm Hạ Vy (Gốc phượng già & Phòng Phát Thanh — tắt nếu chọn 'release')
  {
    key: 'l2_banyan_scare',
    levelId: 2,
    npcType: 'dao_thi_may',
    jumpscareType: 'E_SUDDEN_APPROACH',
    caption: '“ANH QUÂN ƠI... THƯ TUYỆT MỆNH ĐÓ KHÔNG PHẢI EM VIẾT!”',
    test: ([px, , pz], narrative) =>
      narrative.moralChoices.fate_dao_thi_may !== 'release' && px < -2.5 && pz > 10.5 && pz < 18.0,
    preferredDistance: 1.75,
    animationClip: 'SlowHeadRaise',
  },
  {
    key: 'l2_inner_scare',
    levelId: 2,
    npcType: 'dao_thi_may',
    jumpscareType: 'A_BEHIND_PLAYER',
    caption: '“SAO ĐÊM ĐÓ CỬA SÂN THƯỢNG LẠI KHÓA TRÁI?!”',
    test: ([, , pz], narrative) =>
      narrative.moralChoices.fate_dao_thi_may !== 'release' && pz < -17.5,
    preferredDistance: 1.65,
    animationClip: 'Lunge',
  },

  // LEVEL 3 — Bệnh nhi số 07 Bé Minh (trồi lên từ Bể Nước Ngầm [0,0,0]) + Khu Cách Ly B3
  {
    key: 'l3_well_scare',
    levelId: 3,
    npcType: 'child_spirit',
    jumpscareType: 'H_WATER_EMERGENCE',
    caption: '“ANH B3-09 ƠI... DƯỚI ĐÁY BỂ LẠNH LẮM!”',
    test: ([px, , pz]) => Math.hypot(px, pz) < 3.4,
    fixedWorldPosition: [0.0, 0.4, 0.0],
    animationClip: 'WaterRise',
  },
  {
    key: 'l3_headman_scare',
    levelId: 3,
    npcType: 'tran_thi_lien',
    jumpscareType: 'F_LIGHT_TRIGGER',
    caption: '“ANH NHỚ LẠI CÁI ĐÊM Ở KHU B3 RỒI PHẢI KHÔNG?!”',
    test: ([px, , pz]) => pz < -14.5 && Math.abs(px) < 5.0,
    preferredDistance: 1.7,
    animationClip: 'Lunge',
  },

  // LEVEL 4 — 4 Hình Nhân Rạp Chiếu Bóng + Hạ Vy phục kích nếu chọn 'keep'
  {
    key: 'l4_statue_scare',
    levelId: 4,
    npcType: 'wooden_statue',
    jumpscareType: 'G_STATUE_MOVEMENT',
    caption: '“ĐỪNG TẮT ĐÈN PIN TRONG KHÁN PHÒNG!”',
    test: ([px, , pz]) => Math.abs(px) > 10.5 && pz < 9.5 && pz > -10.0,
    preferredDistance: 1.85,
    animationClip: 'ReachForward',
  },
  {
    key: 'l4_sanctum_scare',
    levelId: 4,
    npcType: 'wooden_statue',
    jumpscareType: 'G_STATUE_MOVEMENT',
    caption: '“MÁY PHÁT 19Hz VẪN ĐANG CHẠY!”',
    test: ([, , pz]) => pz < -16.5,
    preferredDistance: 1.85,
    animationClip: 'Lunge',
  },
  {
    key: 'l4_may_keep_ambush',
    levelId: 4,
    npcType: 'dao_thi_may',
    jumpscareType: 'A_BEHIND_PLAYER',
    caption: '“ANH LỢI DỤNG NỖI ĐAU CỦA EM... EM SẼ KHÔNG DỪNG LẠI!”',
    test: ([px, , pz], narrative) =>
      narrative.moralChoices.fate_dao_thi_may === 'keep' && pz < -6.5 && Math.abs(px) < 4.5,
    preferredDistance: 1.65,
    animationClip: 'JumpscareAttack',
  },

  // LEVEL 5 — 4 Bóng Người Trên Phà Sắt + Hạ Vy phục kích nếu chọn 'keep'
  {
    key: 'l5_boat_scare',
    levelId: 5,
    npcType: 'faceless_passenger',
    jumpscareType: 'B_CORRIDOR_REVEAL',
    caption: '“TRỜI SẮP SÁNG RỒI... HÃY ĐỐI DIỆN SỰ THẬT ĐI!”',
    test: ([, , pz]) => pz < -12.5,
    preferredDistance: 1.9,
    animationClip: 'StandUp',
  },
  {
    key: 'l5_may_keep_ambush',
    levelId: 5,
    npcType: 'dao_thi_may',
    jumpscareType: 'E_SUDDEN_APPROACH',
    caption: '“OÁN NIỆM CỦA EM THEO ANH RA TẬN BẾN PHÀ ĐẬP NƯỚC!”',
    test: ([, , pz], narrative) =>
      narrative.moralChoices.fate_dao_thi_may === 'keep' && pz < 6.5 && pz > -6.5,
    preferredDistance: 1.65,
    animationClip: 'JumpscareAttack',
  },
];
