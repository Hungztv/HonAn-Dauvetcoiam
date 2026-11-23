import { Vec3 } from '../../types/game';
import { NPCCharacterType, NPCState } from '../npc/NPCStateMachine';
import { NPCAnimationClipName } from '../npc/NPCAnimationController';
import { ValidationStatus } from '../npc/NPCModelValidator';

export interface NPCModelRuntimeInfo {
  modelSource: 'PROCEDURAL' | 'GLB';
  glbLoaded: boolean;
  validationStatus: 'NONE' | ValidationStatus;
  skeletonSummary: string;
  mixerTime: number;
  lodLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  boundingHeight: number;
  textureState: 'PROCEDURAL_PBR' | 'GLB_PBR' | 'LOADING';
  fallbackReason: string | null;
}

export interface NPCDebugSnapshot extends NPCModelRuntimeInfo {
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
  /** v5.1 Model & Animation Debug Controls */
  preferredModelMode?: 'AUTO' | 'PROCEDURAL' | 'GLB';
  reloadGlb?: boolean;
  validateNow?: boolean;
  stopAnimation?: boolean;
  resetAnimation?: boolean;
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
  private modelRuntime = new Map<string, NPCModelRuntimeInfo>();
  private pendingCommand: NPCDebugOverrideCommand | null = null;
  private commandSeq = 0;

  public reportModelRuntime(id: string, info: NPCModelRuntimeInfo) {
    if (!this.enabled) return;
    this.modelRuntime.set(id, info);
  }

  public getModelRuntime(id: string): NPCModelRuntimeInfo | undefined {
    return this.modelRuntime.get(id);
  }

  public reportSnapshot(snap: NPCDebugSnapshot) {
    if (!this.enabled) return;
    this.snapshots.set(snap.id, snap);
  }

  public removeSnapshot(id: string) {
    this.snapshots.delete(id);
    this.modelRuntime.delete(id);
  }

  public getSnapshots(): NPCDebugSnapshot[] {
    return Array.from(this.snapshots.values());
  }

  public clearSnapshots() {
    this.snapshots.clear();
    this.modelRuntime.clear();
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
