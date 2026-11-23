import React from 'react';
import { NPCCharacterType, NPCState } from './NPCStateMachine';
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
}

/**
 * Renders the appropriate full-body articulated 3D NPC character for any NPCCharacterType.
 * Ready to swap to external rigged GLB characters via NPCRegistry.glbUrl without touching AI logic.
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
        />
      );
    case 'tran_thi_lien':
      return (
        <LienCharacter
          state={state}
          opacity={opacity}
          headLookYaw={headLookYaw}
          isCulled={isCulled}
        />
      );
    case 'child_spirit':
      return (
        <ChildSpiritCharacter
          state={state}
          opacity={opacity}
          headLookYaw={headLookYaw}
          isCulled={isCulled}
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
        />
      );
  }
};
