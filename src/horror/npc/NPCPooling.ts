import { NPCFSMContext, createNPCContext } from './NPCStateMachine';
import { NPCSpawnBlueprint } from './NPCRegistry';

/**
 * Lightweight NPC instance pool per level so switching levels
 * reuses / cleanly resets contexts without leaking zombie entries.
 */
class NPCPoolManager {
  private pool = new Map<string, NPCFSMContext>();
  private activeLevelId: number | null = null;

  public acquireForLevel(levelId: number, blueprints: NPCSpawnBlueprint[]): NPCFSMContext[] {
    if (this.activeLevelId !== levelId) {
      this.releaseAll();
      this.activeLevelId = levelId;
    }

    const activeIds = new Set<string>();
    const list: NPCFSMContext[] = [];

    for (const bp of blueprints) {
      activeIds.add(bp.id);
      let ctx = this.pool.get(bp.id);
      if (!ctx) {
        ctx = createNPCContext({
          id: bp.id,
          type: bp.type,
          homePosition: bp.position,
          rotationY: bp.rotationY,
          initialState: bp.initialState,
          isHostile: bp.isHostile ?? true,
        });
        this.pool.set(bp.id, ctx);
      }
      list.push(ctx);
    }

    // Prune any NPC no longer valid (e.g. moral choice changed)
    for (const id of Array.from(this.pool.keys())) {
      if (!activeIds.has(id)) {
        this.pool.delete(id);
      }
    }

    return list;
  }

  public get(id: string): NPCFSMContext | undefined {
    return this.pool.get(id);
  }

  public update(id: string, next: NPCFSMContext) {
    this.pool.set(id, next);
  }

  public releaseAll() {
    this.pool.clear();
    this.activeLevelId = null;
  }

  public size(): number {
    return this.pool.size;
  }
}

export const npcPool = new NPCPoolManager();
