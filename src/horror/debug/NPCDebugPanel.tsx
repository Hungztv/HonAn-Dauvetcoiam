import React, { useEffect, useState } from 'react';
import { Bug, CheckCircle2, Eye, Ghost, Play, RefreshCw, Skull, Square, X } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { npcDebugBus, NPCDebugSnapshot } from './npcDebugBus';
import { NPCAnimationClipName } from '../npc/NPCAnimationController';
import { JumpscareType, getJumpscarePhase } from '../jumpscare/PhysicalJumpscareDirector';

const ANIMATION_CLIPS: NPCAnimationClipName[] = [
  'Idle',
  'HeadTilt',
  'SlowHeadRaise',
  'SlowWalk',
  'BackwardWalk',
  'Crawling',
  'ShieldFace',
  'ReachForward',
  'Lunge',
  'JumpscareAttack',
  'WaterRise',
  'StandUp',
  'Rowing',
  'Disappear',
];

const JUMPSCARE_TYPES: JumpscareType[] = [
  'A_BEHIND_PLAYER',
  'B_CORRIDOR_REVEAL',
  'C_CORNER_AMBUSH',
  'D_SURFACE_REVEAL',
  'E_SUDDEN_APPROACH',
  'F_LIGHT_TRIGGER',
  'G_STATUE_MOVEMENT',
  'H_WATER_EMERGENCE',
];

function isNPCDebugAllowed(): boolean {
  if (typeof window === 'undefined') return false;
  const isDev = Boolean((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV);
  return isDev || window.location.search.includes('debug=1');
}

/**
 * Developer-only 3D NPC, GLB Pipeline & Physical Jumpscare Inspector (v5.1).
 * Strictly gated to DEV mode or `?debug=1` query param, toggleable via F9.
 * Never exposed to normal production players.
 */
export const NPCDebugPanel: React.FC = () => {
  const allowed = isNPCDebugAllowed();
  const [open, setOpen] = useState(
    () => typeof window !== 'undefined' && window.location.search.includes('debug=1')
  );
  const [snapshots, setSnapshots] = useState<NPCDebugSnapshot[]>([]);
  const [selectedClip, setSelectedClip] = useState<NPCAnimationClipName>('SlowHeadRaise');
  const [selectedScareType, setSelectedScareType] = useState<JumpscareType>('E_SUDDEN_APPROACH');

  const requestPhysicalJumpscare = useGameStore((s) => s.requestPhysicalJumpscare);
  const activePhysicalJumpscare = useGameStore((s) => s.activePhysicalJumpscare);
  const lastJumpscareAt = useGameStore((s) => s.lastJumpscareAt);
  const currentLevelId = useGameStore((s) => s.currentLevelId);

  useEffect(() => {
    if (!allowed) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'F9') {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [allowed]);

  useEffect(() => {
    if (!allowed) return;
    npcDebugBus.enabled = open;
    if (!open) return;

    const timer = window.setInterval(() => {
      setSnapshots(npcDebugBus.getSnapshots());
    }, 220);

    return () => {
      window.clearInterval(timer);
      npcDebugBus.enabled = false;
    };
  }, [allowed, open]);

  if (!allowed) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 px-2.5 py-1.5 rounded bg-black/75 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono flex items-center gap-1.5 hover:bg-emerald-950/70 transition cursor-pointer"
        title="Mở NPC 3D Debug Panel (F9)"
      >
        <Bug className="w-3.5 h-3.5" />
        NPC Debug (F9)
      </button>
    );
  }

  const cooldownLeft = Math.max(0, Math.ceil((34000 - (Date.now() - lastJumpscareAt)) / 1000));
  const activePhase = activePhysicalJumpscare ? getJumpscarePhase(activePhysicalJumpscare) : 'IDLE';

  return (
    <div
      className="fixed top-20 right-4 z-40 w-[365px] max-h-[82vh] overflow-y-auto rounded-lg bg-[#090b0f]/92 border border-emerald-500/40 shadow-2xl text-zinc-100 font-mono text-[11px] p-3 space-y-3 backdrop-blur-md"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-emerald-500/25 pb-2">
        <div className="flex items-center gap-1.5 text-emerald-300 font-bold tracking-wide">
          <Bug className="w-4 h-4" />
          <span>HỒN ÁN v5.1 — 3D NPC & GLB DEBUG</span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="p-1 text-zinc-400 hover:text-white cursor-pointer"
          title="Đóng (F9)"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Live Status Bar */}
      <div className="grid grid-cols-2 gap-1.5 bg-black/50 p-2 rounded border border-zinc-800">
        <div>
          <span className="text-zinc-500">Level:</span>{' '}
          <span className="text-amber-300 font-semibold">Màn {currentLevelId}</span>
        </div>
        <div>
          <span className="text-zinc-500">Cooldown:</span>{' '}
          <span className={cooldownLeft > 0 ? 'text-amber-400' : 'text-emerald-400'}>
            {cooldownLeft}s
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-zinc-500">Jumpscare:</span>{' '}
          <span className={activePhysicalJumpscare ? 'text-red-400 font-bold' : 'text-zinc-400'}>
            {activePhysicalJumpscare
              ? `${activePhysicalJumpscare.npcType} [${activePhysicalJumpscare.jumpscareType} / ${activePhase}]`
              : 'IDLE (Zero 2D/SVG)'}
          </span>
        </div>
      </div>

      {/* Quick Physical 3D Jumpscare Triggers */}
      <div className="space-y-1.5">
        <div className="text-[10px] uppercase tracking-wider text-zinc-400 flex items-center gap-1">
          <Skull className="w-3 h-3 text-red-400" />
          Force Physical 3D Jumpscare
        </div>
        <select
          value={selectedScareType}
          onChange={(e) => setSelectedScareType(e.target.value as JumpscareType)}
          className="w-full bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-200"
        >
          {JUMPSCARE_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <div className="grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() =>
              requestPhysicalJumpscare(
                'dao_thi_may',
                '“ĐÀO THỊ MÂY — TRẢ LẠI TÊN CHO TA!”',
                true,
                { jumpscareType: selectedScareType, animationClip: 'Lunge' }
              )
            }
            className="px-2 py-1.5 rounded bg-red-900/70 hover:bg-red-800/80 border border-red-500/40 text-red-100 text-center cursor-pointer"
          >
            May 3D Scare
          </button>
          <button
            type="button"
            onClick={() =>
              requestPhysicalJumpscare(
                'tran_thi_lien',
                '“TRẦN THỊ LIÊN — BÒ RA TỪ BUỒNG ĐÔNG!”',
                true,
                { jumpscareType: 'D_SURFACE_REVEAL', animationClip: 'Crawling', crawling: true }
              )
            }
            className="px-2 py-1.5 rounded bg-red-950/80 hover:bg-red-900/80 border border-red-500/40 text-red-200 text-center cursor-pointer"
          >
            Liên Crawl Scare
          </button>
          <button
            type="button"
            onClick={() =>
              requestPhysicalJumpscare(
                'wooden_statue',
                '“TƯỢNG QUAN GỖ — ĐỪNG QUAY LƯNG!”',
                true,
                { jumpscareType: 'G_STATUE_MOVEMENT', animationClip: 'ReachForward' }
              )
            }
            className="px-2 py-1.5 rounded bg-amber-950/70 hover:bg-amber-900/70 border border-amber-500/40 text-amber-200 text-center cursor-pointer"
          >
            Statue Scare
          </button>
          <button
            type="button"
            onClick={() =>
              requestPhysicalJumpscare(
                'child_spirit',
                '“HỒN TRẺ DƯỚI GIẾNG — 18/08/1978!”',
                true,
                { jumpscareType: 'H_WATER_EMERGENCE', animationClip: 'WaterRise' }
              )
            }
            className="px-2 py-1.5 rounded bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-500/40 text-cyan-200 text-center cursor-pointer"
          >
            Child Spirit
          </button>
        </div>
      </div>

      {/* v5.1 GLB Model & Validation Controls */}
      <div className="space-y-1.5 border-t border-zinc-800 pt-2">
        <div className="text-[10px] uppercase tracking-wider text-zinc-400 flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-cyan-400" />
          v5.1 Model Pipeline Controls
        </div>
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => npcDebugBus.issueCommand({ preferredModelMode: 'GLB', reloadGlb: true })}
            className="px-1.5 py-1 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-200 cursor-pointer"
          >
            Use GLB
          </button>
          <button
            type="button"
            onClick={() => npcDebugBus.issueCommand({ preferredModelMode: 'PROCEDURAL' })}
            className="px-1.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-200 cursor-pointer"
          >
            Use Proc
          </button>
          <button
            type="button"
            onClick={() => npcDebugBus.issueCommand({ reloadGlb: true })}
            className="px-1.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-amber-200 cursor-pointer"
          >
            Reload
          </button>
          <button
            type="button"
            onClick={() => npcDebugBus.issueCommand({ validateNow: true })}
            className="px-1.5 py-1 rounded bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-200 cursor-pointer"
          >
            Validate
          </button>
        </div>
      </div>

      {/* World NPC Animation & Positioning Controls */}
      <div className="space-y-1.5 border-t border-zinc-800 pt-2">
        <div className="text-[10px] uppercase tracking-wider text-zinc-400 flex items-center gap-1">
          <Play className="w-3 h-3 text-emerald-400" />
          Animation & AI Overrides
        </div>
        <div className="flex gap-1.5">
          <select
            value={selectedClip}
            onChange={(e) => setSelectedClip(e.target.value as NPCAnimationClipName)}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-[11px] text-zinc-200"
          >
            {ANIMATION_CLIPS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() =>
              npcDebugBus.issueCommand({
                forceClip: selectedClip,
                forceCrawling: selectedClip === 'Crawling',
                forceShieldFace: selectedClip === 'ShieldFace',
                stopAnimation: false,
              })
            }
            className="px-2 py-1 rounded bg-emerald-800/75 hover:bg-emerald-700 border border-emerald-500/40 text-emerald-100 cursor-pointer"
          >
            Play
          </button>
          <button
            type="button"
            onClick={() => npcDebugBus.issueCommand({ stopAnimation: true })}
            className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-red-300 cursor-pointer"
            title="Stop Animation"
          >
            <Square className="w-3 h-3" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => npcDebugBus.issueCommand({ relocateToPlayerFront: true, forceState: 'Observing' })}
            className="px-1.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-100 flex items-center justify-center gap-1 cursor-pointer"
          >
            <Eye className="w-3 h-3" /> Front
          </button>
          <button
            type="button"
            onClick={() => npcDebugBus.issueCommand({ forceState: 'Stalking', forceClip: null })}
            className="px-1.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-zinc-100 flex items-center justify-center gap-1 cursor-pointer"
          >
            <Ghost className="w-3 h-3" /> Stalk
          </button>
          <button
            type="button"
            onClick={() => npcDebugBus.issueCommand({ resetAnimation: true })}
            className="px-1.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-cyan-200 cursor-pointer"
          >
            ResetAnim
          </button>
          <button
            type="button"
            onClick={() => npcDebugBus.issueCommand({ resetAll: true })}
            className="px-1.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 text-amber-200 flex items-center justify-center gap-1 cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Active World NPC Telemetry List */}
      <div className="space-y-1.5 border-t border-zinc-800 pt-2">
        <div className="text-[10px] uppercase tracking-wider text-zinc-400">
          Active 3D NPCs ({snapshots.length})
        </div>
        {snapshots.length === 0 ? (
          <div className="text-zinc-500 italic">Không có NPC active trong scene...</div>
        ) : (
          snapshots.map((npc) => (
            <div
              key={npc.id}
              className="p-2 rounded bg-black/55 border border-zinc-800 space-y-0.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-emerald-300 font-semibold">{npc.id}</span>
                <span className="text-amber-300">{npc.distanceToPlayer.toFixed(1)}m</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-300">
                <span>State: {npc.state}</span>
                <span>Clip: {npc.clip}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-cyan-300">
                <span>
                  Src: {npc.modelSource} ({npc.glbLoaded ? 'GLB OK' : 'Fallback'})
                </span>
                <span>Val: {npc.validationStatus}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>Skel: {npc.skeletonSummary}</span>
                <span>
                  H: {npc.boundingHeight.toFixed(2)}m • LOD:{npc.lodLevel}
                </span>
              </div>
              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span>
                  Tex: {npc.textureState} • T:{npc.mixerTime.toFixed(2)}s
                </span>
                <span>Op: {npc.opacity.toFixed(2)}</span>
              </div>
              {npc.fallbackReason && (
                <div className="text-[9.5px] text-amber-400/90 leading-tight pt-0.5">
                  {npc.fallbackReason}
                </div>
              )}
              <div className="flex gap-1.5 text-[9px] pt-0.5">
                <span
                  className={`px-1 rounded ${
                    npc.inPlayerFOV ? 'bg-amber-900/60 text-amber-200' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  FOV:{npc.inPlayerFOV ? 'YES' : 'NO'}
                </span>
                <span
                  className={`px-1 rounded ${
                    npc.hasLineOfSight ? 'bg-emerald-900/60 text-emerald-200' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  LOS:{npc.hasLineOfSight ? 'CLEAR' : 'WALL'}
                </span>
                <span
                  className={`px-1 rounded ${
                    npc.illuminatedByFlashlight
                      ? 'bg-red-900/70 text-red-200'
                      : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  FLASH:{npc.illuminatedByFlashlight ? 'HIT' : 'OFF'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
