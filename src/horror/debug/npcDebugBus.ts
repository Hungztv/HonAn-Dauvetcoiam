import { Vec3 } from '../../types/game';
import { NPCCharacterType, NPCState } from '../npc/NPCStateMachine';
import { NPCAnimationClipName } from '../npc/NPCAnimationController';

export interface NPCDebugSnapshot {
  id: string;
  type: NPCCharacterType;
  state: NPCState;
  clip: NPCAnimationClipName;
  position: Vec3;
  distanceToPlayer: number;
  inPlayerFOV: boolean;
  hasLineOfSight: boolean;
  illuminatedByFlashlight: boolean;
  opacity: number;
  visible: boolean;
  cooldownSec: number;
}

export interface NPCDebugOverrideCommand {
  targetId?: string;
  forceState?: NPCState;
  forceClip?: NPCAnimationClipName | null;
  forceCrawling?: boolean;
  forceShieldFace?: boolean;
  relocateToPlayerFront?: boolean;
  resetAll?: boolean;
  issuedAt: number;
}

/**
 * Lightweight zero-overhead debug bus for Dev Mode (`import.meta.env.DEV` or `?debug=1`).
 * Does NOT trigger React state re-renders during normal gameplay; only queried by NPCDebugPanel.
 */
class NPCDebugBus {
  public enabled = false;
  private snapshots = new Map<string, NPCDebugSnapshot>();
  private pendingCommand: NPCDebugOverrideCommand | null = null;
  private commandSeq = 0;

  public reportSnapshot(snap: NPCDebugSnapshot) {
    if (!this.enabled) return;
    this.snapshots.set(snap.id, snap);
  }

  public removeSnapshot(id: string) {
    this.snapshots.delete(id);
  }

  public getSnapshots(): NPCDebugSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  public clearSnapshots() {
    this.snapshots.clear();
  }

  public issueCommand(cmd: Omit<NPCDebugOverrideCommand, 'issuedAt'>) {
    this.commandSeq += 1;
    this.pendingCommand = { ...cmd, issuedAt: this.commandSeq };
  }

  public getLatestCommand(): NPCDebugOverrideCommand | null {
    return this.pendingCommand;
  }

  public clearCommand() {
    this.pendingCommand = null;
  }
}

export const npcDebugBus = new NPCDebugBus();
