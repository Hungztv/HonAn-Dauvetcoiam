import { Vec3 } from '../../types/game';
import { horrorAudio } from '../../audio/horrorAudio';
import { NPCCharacterType } from '../npc/NPCStateMachine';

/** Spatial 3D audio dispatcher tailored to each of the 6 Vietnamese horror NPCs */
export function playNPCJumpscareAudio(npcType: NPCCharacterType, npcWorldPos: Vec3) {
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
}

export function playNPCFootstepAudio(npcType: NPCCharacterType, pos: Vec3) {
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
}

export function playNPCAmbientSignatureAudio(npcType: NPCCharacterType, pos: Vec3) {
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
}

export function playNPCDisappearAudio(pos: Vec3) {
  horrorAudio.playSpatialDisappear(pos);
}
