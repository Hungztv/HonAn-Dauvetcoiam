import { Vec3 } from '../../types/game';
import { horrorAudio } from '../../audio/horrorAudio';
import { NPCCharacterType } from '../npc/NPCStateMachine';

/**
 * HỒN ÁN v5.1 — Canonical External Real-Recording Audio Manifest (public/audio/npcs/)
 * All entries default to `enabled: false` because no real recorded .ogg/.mp3 files exist yet.
 * Dropping licensed recordings into public/audio/npcs/<slug>/ and flipping `enabled: true`
 * routes them automatically through HorrorAudioEngine's 3D HRTF PannerNode with procedural fallback.
 */
export interface NPCAudioManifestEntry {
  enabled: boolean;
  jumpscareUrl: string;
  footstepUrl: string;
  ambientUrl: string;
  disappearUrl: string;
}

export const NPC_AUDIO_MANIFEST: Record<NPCCharacterType, NPCAudioManifestEntry> = {
  dao_thi_may: {
    enabled: false,
    jumpscareUrl: '/audio/npcs/dao-thi-may/may_scream_short.ogg',
    footstepUrl: '/audio/npcs/dao-thi-may/may_barefoot_step.ogg',
    ambientUrl: '/audio/npcs/dao-thi-may/may_female_breath_whisper.ogg',
    disappearUrl: '/audio/npcs/dao-thi-may/may_disappear_whoosh.ogg',
  },
  tran_thi_lien: {
    enabled: false,
    jumpscareUrl: '/audio/npcs/tran-thi-lien/lien_gasp_scare.ogg',
    footstepUrl: '/audio/npcs/tran-thi-lien/lien_crawl_wood_scratch.ogg',
    ambientUrl: '/audio/npcs/tran-thi-lien/lien_raspy_breath.ogg',
    disappearUrl: '/audio/npcs/tran-thi-lien/lien_cloth_drag_fade.ogg',
  },
  child_spirit: {
    enabled: false,
    jumpscareUrl: '/audio/npcs/well-child/child_well_splash_scare.ogg',
    footstepUrl: '/audio/npcs/well-child/child_water_bubble.ogg',
    ambientUrl: '/audio/npcs/well-child/child_well_knock.ogg',
    disappearUrl: '/audio/npcs/well-child/child_submerge.ogg',
  },
  wooden_statue: {
    enabled: false,
    jumpscareUrl: '/audio/npcs/wooden-statues/statue_heavy_slam.ogg',
    footstepUrl: '/audio/npcs/wooden-statues/statue_heavy_step.ogg',
    ambientUrl: '/audio/npcs/wooden-statues/statue_wood_creak.ogg',
    disappearUrl: '/audio/npcs/wooden-statues/statue_wood_crack.ogg',
  },
  faceless_passenger: {
    enabled: false,
    jumpscareUrl: '/audio/npcs/faceless-passengers/passengers_collective_gasp.ogg',
    footstepUrl: '/audio/npcs/faceless-passengers/passengers_deck_step.ogg',
    ambientUrl: '/audio/npcs/faceless-passengers/passengers_collective_whisper.ogg',
    disappearUrl: '/audio/npcs/faceless-passengers/passengers_cloth_rustle.ogg',
  },
  ferryman: {
    enabled: false,
    jumpscareUrl: '/audio/npcs/ferryman/ferryman_bell_gong.ogg',
    footstepUrl: '/audio/npcs/ferryman/ferryman_oar_paddle.ogg',
    ambientUrl: '/audio/npcs/ferryman/ferryman_boat_creak.ogg',
    disappearUrl: '/audio/npcs/ferryman/ferryman_mist_fade.ogg',
  },
};

/** Spatial 3D audio dispatcher tailored to each of the 6 Vietnamese horror NPCs */
export function playNPCJumpscareAudio(npcType: NPCCharacterType, npcWorldPos: Vec3) {
  const manifest = NPC_AUDIO_MANIFEST[npcType];
  const url = manifest.enabled ? manifest.jumpscareUrl : null;
  horrorAudio.playSpatialBufferOrFallback(url, npcWorldPos, () => {
    switch (npcType) {
      case 'dao_thi_may':
        horrorAudio.playJumpscare('pale_bride', npcWorldPos);
        horrorAudio.playSpatialBreathing(npcWorldPos);
        break;
      case 'tran_thi_lien':
        horrorAudio.playWallScratching(npcWorldPos);
        horrorAudio.playJumpscare('pale_bride', npcWorldPos);
        horrorAudio.playSpatialBreathing(npcWorldPos);
        break;
      case 'child_spirit':
        horrorAudio.playWaterBubble(npcWorldPos);
        horrorAudio.playJumpscare('blood_hands', npcWorldPos);
        break;
      case 'wooden_statue':
        horrorAudio.playHeavyWoodImpact(npcWorldPos);
        horrorAudio.playJumpscare('statue_face', npcWorldPos);
        break;
      case 'faceless_passenger':
        horrorAudio.playCollectiveWhisper(npcWorldPos);
        horrorAudio.playJumpscare('faceless_ferryman', npcWorldPos);
        break;
      case 'ferryman':
        horrorAudio.playTempleBell(npcWorldPos);
        horrorAudio.playJumpscare('faceless_ferryman', npcWorldPos);
        break;
    }
  });
}

export function playNPCFootstepAudio(npcType: NPCCharacterType, pos: Vec3) {
  const manifest = NPC_AUDIO_MANIFEST[npcType];
  const url = manifest.enabled ? manifest.footstepUrl : null;
  horrorAudio.playSpatialBufferOrFallback(url, pos, () => {
    switch (npcType) {
      case 'wooden_statue':
        horrorAudio.playHeavyWoodImpact(pos);
        break;
      case 'child_spirit':
        horrorAudio.playWaterBubble(pos);
        break;
      case 'tran_thi_lien':
        horrorAudio.playWallScratching(pos);
        break;
      case 'ferryman':
        horrorAudio.playPaddleWater(pos);
        break;
      case 'faceless_passenger':
        horrorAudio.playCollectiveWhisper(pos);
        break;
      case 'dao_thi_may':
      default:
        horrorAudio.playFootstep('dirt', false, pos);
        break;
    }
  });
}

export function playNPCAmbientSignatureAudio(npcType: NPCCharacterType, pos: Vec3) {
  const manifest = NPC_AUDIO_MANIFEST[npcType];
  const url = manifest.enabled ? manifest.ambientUrl : null;
  horrorAudio.playSpatialBufferOrFallback(url, pos, () => {
    switch (npcType) {
      case 'dao_thi_may':
        horrorAudio.playSpatialBreathing(pos);
        break;
      case 'tran_thi_lien':
        horrorAudio.playWallScratching(pos);
        break;
      case 'child_spirit':
        horrorAudio.playWaterBubble(pos);
        break;
      case 'wooden_statue':
        horrorAudio.playWoodCreak(pos);
        break;
      case 'faceless_passenger':
        horrorAudio.playCollectiveWhisper(pos);
        break;
      case 'ferryman':
        horrorAudio.playPaddleWater(pos);
        break;
    }
  });
}

export function playNPCDisappearAudio(pos: Vec3, npcType: NPCCharacterType = 'dao_thi_may') {
  const manifest = NPC_AUDIO_MANIFEST[npcType];
  const url = manifest.enabled ? manifest.disappearUrl : null;
  horrorAudio.playSpatialBufferOrFallback(url, pos, () => {
    horrorAudio.playSpatialDisappear(pos);
  });
}
