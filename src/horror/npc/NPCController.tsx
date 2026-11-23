import React from 'react';
import { NPCCharacterType, NPCState } from './NPCStateMachine';
import { NPCAnimationClipName } from './NPCAnimationController';
import { GLBNPCModel } from './GLBNPCModel';
import { MayCharacter } from '../characters/MayCharacter';
import { LienCharacter } from '../characters/LienCharacter';
import { ChildSpiritCharacter } from '../characters/ChildSpiritCharacter';
import { WoodenStatueCharacter } from '../characters/WoodenStatueCharacter';
import { FacelessPassengerCharacter } from '../characters/FacelessPassengerCharacter';
import { FerrymanCharacter } from '../characters/FerrymanCharacter';

interface NPCControllerProps {
  instanceId?: string;
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
  /** v5.1 Debug overrides */
  preferredModelMode?: 'AUTO' | 'PROCEDURAL' | 'GLB';
  reloadToken?: number;
  animationPaused?: boolean;
  animationResetToken?: number;
}

/**
 * Renders the appropriate full-body articulated 3D NPC character for any NPCCharacterType (v5.1).
 * Routes through GLBNPCModel for validated Blender rigged .glb loading + independent SkeletonUtils.clone
 * + LOD, with zero-pop fallback to the 15-joint procedural 3D character without touching AI logic.
 */
export const NPCController: React.FC<NPCControllerProps> = ({
  instanceId,
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
  preferredModelMode = 'AUTO',
  reloadToken = 0,
  animationPaused = false,
  animationResetToken = 0,
}) => {
  const renderProceduralFallback = () => {
    switch (type) {
      case 'dao_thi_may':
        return (
          <MayCharacter
            state={state}
            opacity={opacity}
            headLookYaw={headLookYaw}
            isCulled={isCulled || animationPaused}
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
            isCulled={isCulled || animationPaused}
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
            isCulled={isCulled || animationPaused}
            overrideClip={overrideClip}
          />
        );
      case 'wooden_statue':
        return (
          <WoodenStatueCharacter
            state={state}
            opacity={opacity}
            headLookYaw={headLookYaw}
            isCulled={isCulled || animationPaused}
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
            isCulled={isCulled || animationPaused}
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
            isCulled={isCulled || animationPaused}
            isRowing={isRowing}
            overrideClip={overrideClip}
          />
        );
    }
  };

  return (
    <GLBNPCModel
      instanceId={instanceId}
      type={type}
      state={state}
      opacity={opacity}
      isCulled={isCulled}
      isFrozenByGaze={isFrozenByGaze}
      isStanding={isStanding}
      isRowing={isRowing}
      overrideClip={overrideClip}
      crawling={crawling}
      shieldFace={shieldFace}
      preferredModelMode={preferredModelMode}
      reloadToken={reloadToken}
      animationPaused={animationPaused}
      animationResetToken={animationResetToken}
      fallback={renderProceduralFallback()}
    />
  );
};
