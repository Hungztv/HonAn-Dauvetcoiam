import React from 'react';
import { NPCCharacterType, NPCState } from './NPCStateMachine';
import { NPCAnimationClipName } from './NPCAnimationController';
import { MayCharacter } from '../characters/MayCharacter';
import { LienCharacter } from '../characters/LienCharacter';
import { ChildSpiritCharacter } from '../characters/ChildSpiritCharacter';
import { WoodenStatueCharacter } from '../characters/WoodenStatueCharacter';
import { FacelessPassengerCharacter } from '../characters/FacelessPassengerCharacter';
import { FerrymanCharacter } from '../characters/FerrymanCharacter';

interface NPCControllerProps {
  type: NPCCharacterType;
  state: NPCState;
  opacity: number;
  headLookYaw?: number;
  isCulled?: boolean;
  variantIndex?: number;
  isFrozenByGaze?: boolean;
  isStanding?: boolean;
  isRowing?: boolean;
  isFriendly?: boolean;
  overrideClip?: NPCAnimationClipName | null;
  crawling?: boolean;
  shieldFace?: boolean;
}

/**
 * Renders the appropriate full-body articulated 3D NPC character for any NPCCharacterType.
 * Supports v5.0 16-clip animation overrides, floor crawling, flashlight face-shielding,
 * and seamless swap to external rigged GLB characters via NPCRegistry.glbUrl.
 */
export const NPCController: React.FC<NPCControllerProps> = ({
  type,
  state,
  opacity,
  headLookYaw = 0,
  isCulled = false,
  variantIndex = 0,
  isFrozenByGaze = false,
  isStanding = false,
  isRowing = false,
  isFriendly = false,
  overrideClip = null,
  crawling = false,
  shieldFace = false,
}) => {
  switch (type) {
    case 'dao_thi_may':
      return (
        <MayCharacter
          state={state}
          opacity={opacity}
          headLookYaw={headLookYaw}
          isCulled={isCulled}
          isFriendly={isFriendly}
          overrideClip={overrideClip}
        />
      );
    case 'tran_thi_lien':
      return (
        <LienCharacter
          state={state}
          opacity={opacity}
          headLookYaw={headLookYaw}
          isCulled={isCulled}
          overrideClip={overrideClip}
          crawling={crawling}
          shieldFace={shieldFace}
        />
      );
    case 'child_spirit':
      return (
        <ChildSpiritCharacter
          state={state}
          opacity={opacity}
          headLookYaw={headLookYaw}
          isCulled={isCulled}
          overrideClip={overrideClip}
        />
      );
    case 'wooden_statue':
      return (
        <WoodenStatueCharacter
          state={state}
          opacity={opacity}
          headLookYaw={headLookYaw}
          isCulled={isCulled}
          isFrozenByGaze={isFrozenByGaze}
          overrideClip={overrideClip}
        />
      );
    case 'faceless_passenger':
      return (
        <FacelessPassengerCharacter
          state={state}
          opacity={opacity}
          headLookYaw={headLookYaw}
          isCulled={isCulled}
          variantIndex={variantIndex}
          isStanding={isStanding}
          overrideClip={overrideClip}
        />
      );
    case 'ferryman':
      return (
        <FerrymanCharacter
          state={state}
          opacity={opacity}
          headLookYaw={headLookYaw}
          isCulled={isCulled}
          isRowing={isRowing}
          overrideClip={overrideClip}
        />
      );
  }
};
