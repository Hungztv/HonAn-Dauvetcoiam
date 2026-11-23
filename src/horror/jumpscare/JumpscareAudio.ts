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
      horrorAudio.playWoodCreak(npcWorldPos);
      horrorAudio.playJumpscare('pale_bride', npcWorldPos);
      horrorAudio.playSpatialBreathing(npcWorldPos);
      break;
    case 'child_spirit':
      horrorAudio.playWaterDrip(npcWorldPos);
      horrorAudio.playJumpscare('blood_hands', npcWorldPos);
      break;
    case 'wooden_statue':
      horrorAudio.playWoodCreak(npcWorldPos);
      horrorAudio.playJumpscare('statue_face', npcWorldPos);
      break;
    case 'faceless_passenger':
    case 'ferryman':
      horrorAudio.playTempleBell(npcWorldPos);
      horrorAudio.playJumpscare('faceless_ferryman', npcWorldPos);
      break;
  }
}

export function playNPCFootstepAudio(npcType: NPCCharacterType, pos: Vec3) {
  if (npcType === 'wooden_statue') {
    horrorAudio.playWoodCreak(pos);
  } else if (npcType === 'child_spirit') {
    horrorAudio.playWaterDrip(pos);
  } else {
    horrorAudio.playFootstep('wood', false, pos);
  }
}

export function playNPCDisappearAudio(pos: Vec3) {
  horrorAudio.playSpatialDisappear(pos);
}
