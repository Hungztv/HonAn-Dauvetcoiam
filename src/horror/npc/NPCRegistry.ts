import { Vec3 } from '../../types/game';
import { NPCCharacterType, NPCState } from './NPCStateMachine';
import { NPCAnimationClipName } from './NPCAnimationController';
import { NarrativeState } from '../../data/narrativePack';

export interface NPCAssetContract {
  /** Canonical target Blender GLB path under public/models/npcs/ */
  expectedGlbPath: string;
  /** Optional lower-detail LOD GLB path for medium/far distances */
  expectedLodPath?: string;
  lodDistanceMeters?: number;
  /** Must only be flipped to true once a real, licensed, rigged .glb file exists at expectedGlbPath */
  glbAssetPresent: boolean;
  /** Priority clips verified by NPCModelValidator v5.1 */
  requiredClips: NPCAnimationClipName[];
  /** Scale multiplier applied after loading GLB */
  scale: number;
  /** Ground contact Y offset */
  groundOffsetY: number;
  /** All NPC navigation is driven by NPCNavigation; GLB animations must be in-place */
  rootMotionPolicy: 'in-place';
  /** Canonical directory for optional real recorded audio files under public/audio/npcs/ */
  expectedAudioDir: string;
}

export interface NPCCharacterDefinition {
  type: NPCCharacterType;
  displayName: string;
  heightMeters: number;
  capsuleRadius: number;
  /** Active external rigged Blender GLB URL (undefined while glbAssetPresent === false -> zero 404s) */
  glbUrl?: string;
  /** Full v5.1 asset & Blender integration contract */
  assetContract: NPCAssetContract;
  defaultSafeDistance: number;
  maxActiveDistance: number;
  supportedAnimations: string[];
}

export interface NPCSpawnBlueprint {
  id: string;
  type: NPCCharacterType;
  levelId: number;
  position: Vec3;
  rotationY: number;
  initialState: NPCState;
  minHorror: number;
  /** Optional variant tag (e.g. passenger outfit 0..3 or statue index 0..3) */
  variantIndex?: number;
  isHostile?: boolean;
  ngPlusOnly?: boolean;
  /** Only spawn if specific moral choice matches */
  requiresMoralChoice?: {
    choiceId: 'fate_dao_thi_may' | 'fate_village_truth';
    value: string;
  };
}

export const NPC_DEFINITIONS: Record<NPCCharacterType, NPCCharacterDefinition> = {
  dao_thi_may: {
    type: 'dao_thi_may',
    displayName: 'Đào Thị Mây (Cô Gái Áo Đỏ)',
    heightMeters: 1.64,
    capsuleRadius: 0.34,
    assetContract: {
      expectedGlbPath: '/models/npcs/dao-thi-may/dao-thi-may.glb',
      expectedLodPath: '/models/npcs/dao-thi-may/dao-thi-may-lod.glb',
      lodDistanceMeters: 14,
      glbAssetPresent: false,
      requiredClips: [
        'Idle',
        'HeadTilt',
        'SlowHeadRaise',
        'SlowWalk',
        'BackwardWalk',
        'ReachForward',
        'Lunge',
        'JumpscareAttack',
        'Disappear',
      ],
      scale: 1,
      groundOffsetY: 0,
      rootMotionPolicy: 'in-place',
      expectedAudioDir: '/audio/npcs/dao-thi-may/',
    },
    defaultSafeDistance: 1.35,
    maxActiveDistance: 22,
    supportedAnimations: [
      'idle',
      'breathing',
      'head_turn',
      'slow_walk',
      'sudden_look',
      'fast_approach',
      'fade_disappear',
    ],
  },
  tran_thi_lien: {
    type: 'tran_thi_lien',
    displayName: 'Trần Thị Liên (1988)',
    heightMeters: 1.62,
    capsuleRadius: 0.34,
    assetContract: {
      expectedGlbPath: '/models/npcs/tran-thi-lien/tran-thi-lien.glb',
      lodDistanceMeters: 14,
      glbAssetPresent: false,
      requiredClips: [
        'Idle',
        'LimpWalk',
        'Crawling',
        'ShieldFace',
        'ReachForward',
        'JumpscareAttack',
        'Disappear',
      ],
      scale: 1,
      groundOffsetY: 0,
      rootMotionPolicy: 'in-place',
      expectedAudioDir: '/audio/npcs/tran-thi-lien/',
    },
    defaultSafeDistance: 1.3,
    maxActiveDistance: 20,
    supportedAnimations: [
      'idle',
      'breathing',
      'limp_walk',
      'neck_rotation',
      'hand_reaching',
      'sudden_turn',
      'disappear',
    ],
  },
  child_spirit: {
    type: 'child_spirit',
    displayName: 'Hồn Đứa Trẻ Dưới Giếng (1978)',
    heightMeters: 0.96,
    capsuleRadius: 0.26,
    assetContract: {
      expectedGlbPath: '/models/npcs/well-child/well-child.glb',
      lodDistanceMeters: 12,
      glbAssetPresent: false,
      requiredClips: ['Idle', 'HeadTilt', 'WaterRise', 'ReachForward', 'Disappear'],
      scale: 1,
      groundOffsetY: 0,
      rootMotionPolicy: 'in-place',
      expectedAudioDir: '/audio/npcs/well-child/',
    },
    defaultSafeDistance: 1.4,
    maxActiveDistance: 18,
    supportedAnimations: [
      'submerged_idle',
      'slow_emergence',
      'floating',
      'head_turn',
      'hand_movement',
      'disappear_underwater',
    ],
  },
  wooden_statue: {
    type: 'wooden_statue',
    displayName: 'Tượng Quan Gỗ Đình Làng (1958)',
    heightMeters: 2.05,
    capsuleRadius: 0.42,
    assetContract: {
      expectedGlbPath: '/models/npcs/wooden-statues/wooden-statue.glb',
      lodDistanceMeters: 16,
      glbAssetPresent: false,
      requiredClips: ['Idle', 'HeadTilt', 'SlowWalk', 'ReachForward', 'Lunge'],
      scale: 1,
      groundOffsetY: 0,
      rootMotionPolicy: 'in-place',
      expectedAudioDir: '/audio/npcs/wooden-statues/',
    },
    defaultSafeDistance: 1.75,
    maxActiveDistance: 24,
    supportedAnimations: [
      'static_idle',
      'head_turn',
      'body_rotation',
      'step_forward',
      'sudden_pose',
      'controlled_lunge',
    ],
  },
  faceless_passenger: {
    type: 'faceless_passenger',
    displayName: 'Hành Khách Không Khuôn Mặt',
    heightMeters: 1.68,
    capsuleRadius: 0.34,
    assetContract: {
      expectedGlbPath: '/models/npcs/faceless-passengers/faceless-passenger.glb',
      lodDistanceMeters: 16,
      glbAssetPresent: false,
      requiredClips: ['SittingIdle', 'HeadTilt', 'StandUp', 'SlowWalk', 'Disappear'],
      scale: 1,
      groundOffsetY: 0,
      rootMotionPolicy: 'in-place',
      expectedAudioDir: '/audio/npcs/faceless-passengers/',
    },
    defaultSafeDistance: 1.45,
    maxActiveDistance: 24,
    supportedAnimations: [
      'sitting_idle',
      'breathing',
      'head_rotation',
      'simultaneous_look',
      'stand_up',
      'walk_toward',
      'disappear',
    ],
  },
  ferryman: {
    type: 'ferryman',
    displayName: 'Người Lái Đò (Nguyễn Văn Khải)',
    heightMeters: 1.7,
    capsuleRadius: 0.36,
    assetContract: {
      expectedGlbPath: '/models/npcs/ferryman/ferryman.glb',
      lodDistanceMeters: 18,
      glbAssetPresent: false,
      requiredClips: ['SittingIdle', 'Rowing', 'Idle', 'StandUp', 'SlowWalk', 'Disappear'],
      scale: 1,
      groundOffsetY: 0,
      rootMotionPolicy: 'in-place',
      expectedAudioDir: '/audio/npcs/ferryman/',
    },
    defaultSafeDistance: 1.65,
    maxActiveDistance: 26,
    supportedAnimations: ['rowing', 'idle', 'walking', 'head_turn', 'sudden_approach', 'disappear'],
  },
};

/** Canonical NPC roster across all 5 levels, dynamically reacting to Moral Choices & NG+ */
export function getLevelNPCBlueprints(
  levelId: number,
  narrative: NarrativeState
): NPCSpawnBlueprint[] {
  const mayKept = narrative.moralChoices.fate_dao_thi_may === 'keep';
  const mayReleased = narrative.moralChoices.fate_dao_thi_may === 'release';

  const all: NPCSpawnBlueprint[] = [
    // LEVEL 1 — Trần Thị Liên + NG+ Early Ferryman
    {
      id: 'npc_l1_lien_curtain',
      type: 'tran_thi_lien',
      levelId: 1,
      position: [7.4, 0.0, -5.2],
      rotationY: -0.6,
      initialState: 'Observing',
      minHorror: 0.15,
      isHostile: true,
    },
    {
      id: 'npc_l1_lien_hall',
      type: 'tran_thi_lien',
      levelId: 1,
      position: [-2.1, 0.0, 8.2],
      rotationY: 0.5,
      initialState: 'Hidden',
      minHorror: 0.3,
      isHostile: true,
    },
    {
      id: 'npc_l1_ngp_ferryman',
      type: 'ferryman',
      levelId: 1,
      position: [4.4, 0.0, 8.4],
      rotationY: -2.4,
      initialState: 'Observing',
      minHorror: 0.0,
      isHostile: false,
      ngPlusOnly: true,
    },

    // LEVEL 2 — Đào Thị Mây (Forest stalker + Hậu Cung sanctuary)
    {
      id: 'npc_l2_may_forest',
      type: 'dao_thi_may',
      levelId: 2,
      position: [5.4, 0.0, 3.2],
      rotationY: -1.1,
      initialState: 'Observing',
      minHorror: 0.12,
      isHostile: !mayReleased,
    },
    {
      id: 'npc_l2_may_sanctuary',
      type: 'dao_thi_may',
      levelId: 2,
      position: [0.0, 0.08, -9.2],
      rotationY: 0,
      initialState: 'Observing',
      minHorror: 0.1,
      isHostile: !mayReleased,
    },

    // LEVEL 3 — Hồn Đứa Trẻ Dưới Giếng (1978)
    {
      id: 'npc_l3_child_well',
      type: 'child_spirit',
      levelId: 3,
      position: [0.0, 0.12, 0.0],
      rotationY: 0,
      initialState: 'Observing',
      minHorror: 0.1,
      isHostile: true,
    },

    // LEVEL 4 — Bốn Tượng Quan Gỗ Đình Làng (Independent Weeping-Angel AI) + Optional May ambush if 'keep'
    {
      id: 'npc_l4_statue_0',
      type: 'wooden_statue',
      levelId: 4,
      position: [-7.5, 0, 4.2],
      rotationY: Math.PI / 2,
      initialState: 'Observing',
      minHorror: 0.0,
      variantIndex: 0,
      isHostile: true,
    },
    {
      id: 'npc_l4_statue_1',
      type: 'wooden_statue',
      levelId: 4,
      position: [7.5, 0, 4.2],
      rotationY: -Math.PI / 2,
      initialState: 'Observing',
      minHorror: 0.0,
      variantIndex: 1,
      isHostile: true,
    },
    {
      id: 'npc_l4_statue_2',
      type: 'wooden_statue',
      levelId: 4,
      position: [-7.5, 0, -2.5],
      rotationY: Math.PI / 2,
      initialState: 'Observing',
      minHorror: 0.0,
      variantIndex: 2,
      isHostile: true,
    },
    {
      id: 'npc_l4_statue_3',
      type: 'wooden_statue',
      levelId: 4,
      position: [7.5, 0, -2.5],
      rotationY: -Math.PI / 2,
      initialState: 'Observing',
      minHorror: 0.0,
      variantIndex: 3,
      isHostile: true,
    },
    {
      id: 'npc_l4_may_ambush',
      type: 'dao_thi_may',
      levelId: 4,
      position: [2.8, 0, -8.8],
      rotationY: -0.4,
      initialState: 'Hidden',
      minHorror: 0.25,
      isHostile: true,
      requiresMoralChoice: { choiceId: 'fate_dao_thi_may', value: 'keep' },
    },

    // LEVEL 5 — 4 Hành Khách Không Mặt + Người Lái Đò (Nguyễn Văn Khải) + Optional May ambush if 'keep'
    {
      id: 'npc_l5_pass_0',
      type: 'faceless_passenger',
      levelId: 5,
      position: [-1.85, 0.14, -5.8],
      rotationY: 0.45,
      initialState: 'Idle',
      minHorror: 0.0,
      variantIndex: 0, // 1988 Liên
      isHostile: false,
    },
    {
      id: 'npc_l5_pass_1',
      type: 'faceless_passenger',
      levelId: 5,
      position: [1.85, 0.14, -6.1],
      rotationY: -0.45,
      initialState: 'Idle',
      minHorror: 0.0,
      variantIndex: 1, // 1968 Mây
      isHostile: false,
    },
    {
      id: 'npc_l5_pass_2',
      type: 'faceless_passenger',
      levelId: 5,
      position: [-1.75, 0.14, -8.9],
      rotationY: 0.35,
      initialState: 'Idle',
      minHorror: 0.0,
      variantIndex: 2, // 1978 Song sinh
      isHostile: false,
    },
    {
      id: 'npc_l5_pass_3',
      type: 'faceless_passenger',
      levelId: 5,
      position: [1.75, 0.14, -8.9],
      rotationY: -0.35,
      initialState: 'Idle',
      minHorror: 0.0,
      variantIndex: 3, // 1958 Ông Từ
      isHostile: false,
    },
    {
      id: 'npc_l5_ferryman',
      type: 'ferryman',
      levelId: 5,
      position: [1.35, 0.14, -10.3],
      rotationY: -0.35,
      initialState: 'Idle',
      minHorror: 0.0,
      isHostile: false,
    },
    ...(mayKept
      ? [
          {
            id: 'npc_l5_may_ambush',
            type: 'dao_thi_may' as const,
            levelId: 5,
            position: [-3.8, 0, 5.4] as Vec3,
            rotationY: 0.9,
            initialState: 'Stalking' as const,
            minHorror: 0.2,
            isHostile: true,
          },
        ]
      : []),
  ];

  return all.filter((bp) => {
    if (bp.levelId !== levelId) return false;
    if (bp.ngPlusOnly && !narrative.isNewGamePlus) return false;
    if (bp.requiresMoralChoice) {
      const chosen = narrative.moralChoices[bp.requiresMoralChoice.choiceId];
      if (chosen !== bp.requiresMoralChoice.value) return false;
    }
    return true;
  });
}
