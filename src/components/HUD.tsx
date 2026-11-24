import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flashlight, BookOpen, Backpack, Pause, MousePointerClick, AlertCircle, Flame, EyeOff, Map as MapIcon } from 'lucide-react';
import { LevelData } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { FieldMap } from './FieldMap';

interface HUDProps {
  level: LevelData;
  onRequestLock: () => void;
}

export const HUD: React.FC<HUDProps> = ({ level, onRequestLock }) => {
  const pointerLocked = useGameStore((s) => s.pointerLocked);
  const overlay = useGameStore((s) => s.overlay);
  const targeted = useGameStore((s) => s.targetedInteractable);
  const flashlightOn = useGameStore((s) => s.flashlightOn);
  const flashlightBattery = useGameStore((s) => s.flashlightBattery);
  const isCrouching = useGameStore((s) => s.isCrouching);
  const activeHidingSpotId = useGameStore((s) => s.activeHidingSpotId);
  const incenseCharges = useGameStore((s) => s.incenseCharges);
  const useIncenseWard = useGameStore((s) => s.useIncenseWard);
  const setJournalTab = useGameStore((s) => s.setJournalTab);
  const horrorIntensity = useGameStore((s) => s.horrorIntensity);
  const supernaturalGlitch = useGameStore((s) => s.supernaturalGlitch);
  const activeWhisper = useGameStore((s) => s.activeWhisper);
  const notifications = useGameStore((s) => s.notifications);
  const settings = useGameStore((s) => s.settings);
  const narrative = useGameStore((s) => s.narrative);
  const perfStats = useGameStore((s) => s.perfStats);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const progress = useGameStore((s) => s.progressByLevel[level.id]);

  const currentTier = progress?.currentTier ?? 1;
  const tierInfo = level.tiers[currentTier - 1];
  const collectedCount = progress?.collectedEvidenceIds.length ?? 0;
  const cluesCount = progress?.unlockedClueIds.length ?? 0;

  return (
    <div className="pointer-events-none fixed inset-0 z-20 select-none overflow-hidden">
      {/* Subtle Horror Grain & Dynamic Vignette */}
      <div className="horror-grain absolute inset-0 opacity-35" />
      <div
        className={`absolute inset-0 transition-opacity duration-500 ${
          supernaturalGlitch > 0.25 ? 'supernatural-pulse' : ''
        }`}
        style={{
          background: `radial-gradient(circle at center, transparent 48%, rgba(5,3,3,${
            0.55 + horrorIntensity * 0.28
          }) 100%)`,
        }}
      />

      {/* Supernatural Static Distortion Flash */}
      {supernaturalGlitch > 0.08 && (
        <div
          className="absolute inset-0 bg-red-950/20 mix-blend-screen transition-opacity"
          style={{ opacity: supernaturalGlitch * 0.65 }}
        />
      )}

      {/* Top Left: Case & Current Tier Objective */}
      <div className="absolute top-5 left-5 max-w-sm space-y-2">
        <div className="bg-black/55 backdrop-blur-sm border-l-2 border-red-700 px-3.5 py-2.5 rounded-r">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.22em] text-red-400">
            <span>{level.code}</span>
            <span>•</span>
            <span>Tầng {currentTier}/3</span>
          </div>
          <div className="font-serif-vn text-base font-semibold text-[#efe4cc] leading-tight mt-0.5">
            {tierInfo.title}
          </div>
          {settings.showHints && (
            <p className="text-[11px] text-[#c7baa2] mt-1 leading-snug">{tierInfo.objective}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-[10px] text-[#9e907a]">
            <span>Vật chứng: {collectedCount}/{level.evidences.length}</span>
            <span>•</span>
            <span>Manh mối: {cluesCount}/{level.clues.length}</span>
            {narrative.isNewGamePlus && (
              <>
                <span>•</span>
                <span className="text-amber-300 font-semibold">NG+</span>
              </>
            )}
          </div>
        </div>

        {/* Real Measured GPU / FPS Telemetry Panel (when toggled on in Settings) */}
        {settings.showPerfStats && (
          <div className="bg-black/70 border border-[#3d2b1d] px-3 py-1.5 rounded text-[10px] font-mono text-emerald-300/90 flex items-center gap-3">
            <span>{perfStats.fps} FPS</span>
            <span>{perfStats.frameTimeMs}ms</span>
            <span>DC: {perfStats.drawCalls}</span>
            <span>Tri: {perfStats.triangles.toLocaleString()}</span>
            <span className="uppercase text-amber-300">{settings.graphicsQuality}</span>
          </div>
        )}
      </div>

      {/* Top Right: Quick Access Buttons (clickable when unlocked) + Flashlight Battery */}
      <div className="absolute top-5 right-5 z-30 flex flex-col items-end gap-2.5">
        <div className="flex items-center gap-2 bg-black/55 backdrop-blur-sm border border-[#4a3322]/70 px-3 py-1.5 rounded">
          <Flashlight
            className={`w-4 h-4 ${flashlightOn ? 'text-amber-300' : 'text-stone-500'}`}
          />
          <div className="w-24 h-1.5 bg-stone-900 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-200 ${
                flashlightBattery < 25 ? 'bg-red-500' : 'bg-amber-400'
              }`}
              style={{ width: `${flashlightBattery}%` }}
            />
          </div>
          <span className="text-[10px] text-[#d4c8b0] w-7 text-right">
            {Math.round(flashlightBattery)}%
          </span>
        </div>

        <div className="pointer-events-auto flex items-center gap-1.5">
          <button
            onClick={() => useIncenseWard()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-black/60 hover:bg-amber-950/80 border border-amber-700/60 text-[11px] text-amber-200 cursor-pointer"
            title="Đốt Nhang Trầm Hộ Mệnh đẩy lùi ma trong 15m (Phím Q)"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            Trầm (Q): {incenseCharges}
          </button>
          <button
            onClick={() => {
              setJournalTab('map');
              setOverlay('journal');
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-black/60 hover:bg-red-950/75 border border-[#523925]/70 text-[11px] text-[#e5dac2] cursor-pointer"
          >
            <MapIcon className="w-3.5 h-3.5 text-sky-400" />
            Bản đồ
          </button>
          <button
            onClick={() => setOverlay('journal')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-black/60 hover:bg-red-950/75 border border-[#523925]/70 text-[11px] text-[#e5dac2] cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-red-400" />
            Sổ (Tab)
          </button>
          <button
            onClick={() => setOverlay('inventory')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-black/60 hover:bg-red-950/75 border border-[#523925]/70 text-[11px] text-[#e5dac2] cursor-pointer"
          >
            <Backpack className="w-3.5 h-3.5 text-amber-400" />
            Túi (I)
          </button>
          <button
            onClick={() => setOverlay('pause')}
            className="p-1.5 rounded bg-black/60 hover:bg-red-950/75 border border-[#523925]/70 text-[#e5dac2] cursor-pointer"
            title="Tạm dừng (ESC)"
          >
            <Pause className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Center Reticle & Interact Prompt */}
      {overlay === 'none' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className={`rounded-full transition-all duration-150 ${
              targeted
                ? 'w-3 h-3 bg-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.95)] ring-4 ring-amber-400/25'
                : 'w-1.5 h-1.5 bg-[#efe4cc]/75 shadow-[0_0_4px_rgba(0,0,0,0.9)]'
            }`}
          />

          <AnimatePresence>
            {targeted && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                className="mt-5 flex flex-col items-center gap-1 bg-black/75 backdrop-blur-sm border border-[#6e4c30]/80 px-4 py-2 rounded shadow-xl"
              >
                <span className="font-serif-vn text-base font-semibold text-[#f5ebd6]">
                  {targeted.name}
                </span>
                <div className="flex items-center gap-1.5 text-xs text-amber-300">
                  <kbd className="px-1.5 py-0.5 rounded bg-red-900/90 border border-red-600/80 text-[10px] font-bold text-white">
                    E
                  </kbd>
                  <span>{targeted.actionLabel}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Unobtrusive lower-center Pointer Lock Bar so the 3D scene & altar stay completely visible */}
      {overlay === 'none' && !pointerLocked && (
        <div className="pointer-events-none fixed inset-x-0 bottom-12 z-10 flex justify-center px-4">
          <button
            onClick={onRequestLock}
            className="pointer-events-auto flex items-center gap-3 px-5 py-2.5 rounded-lg bg-[#120d0a]/90 hover:bg-[#1e140e] border border-red-800/75 shadow-[0_8px_36px_rgba(0,0,0,0.85)] transition cursor-pointer"
          >
            <MousePointerClick className="w-5 h-5 text-amber-300 animate-pulse shrink-0" />
            <div className="text-left">
              <div className="font-display-vn text-sm text-[#efe4cc]">
                Nhấn để khóa chuột & Điều tra góc nhìn thứ nhất 360°
              </div>
              <div className="text-[10px] text-[#b5a78e]">
                Hoặc giữ chuột kéo trực tiếp trên màn hình để xoay góc nhìn • WASD để di chuyển
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Supernatural Whisper Subtitle */}
      <AnimatePresence>
        {activeWhisper && overlay === 'none' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 left-1/2 -translate-x-1/2 max-w-xl px-5 py-2.5 rounded bg-black/75 border border-red-900/60 text-center"
          >
            <p className="font-serif-vn italic text-base text-red-200/95 tracking-wide">
              {activeWhisper}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stealth Hiding Vignette Slit Indicator */}
      {activeHidingSpotId && overlay === 'none' && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-sky-950/85 border border-sky-500/60 text-sky-200 text-xs flex items-center gap-2 shadow-lg">
          <EyeOff className="w-3.5 h-3.5 text-sky-300" />
          <span>Đang ẩn nấp & nín thở — Nhấn [E] để bước ra ngoài</span>
        </div>
      )}

      {/* Bottom Left: Live Architectural Minimap + Toast Notifications */}
      <div className="absolute bottom-14 left-5 space-y-2.5 max-w-sm">
        {overlay === 'none' && settings.showMinimap && <FieldMap level={level} compact />}
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`px-3.5 py-2.5 rounded border backdrop-blur-md shadow-lg text-xs ${
                n.tone === 'tier'
                  ? 'bg-emerald-950/85 border-emerald-600/80 text-emerald-100'
                  : n.tone === 'evidence'
                  ? 'bg-amber-950/85 border-amber-600/75 text-amber-100'
                  : n.tone === 'horror'
                  ? 'bg-red-950/90 border-red-700 text-red-100'
                  : 'bg-[#17120e]/90 border-[#6e4c30] text-[#efe4cc]'
              }`}
            >
              <div className="font-semibold flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {n.title}
              </div>
              <div className="text-[11px] opacity-90 mt-0.5 leading-snug">{n.message}</div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Compact Keybind Footer */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-1.5 rounded bg-black/50 border border-[#3d2b1d]/60 text-[10px] text-[#a89a82] whitespace-nowrap">
        <span>[WASD] Đi</span>
        <span>[Shift] Chạy</span>
        <span className={isCrouching ? 'text-amber-300 font-semibold' : ''}>[C] Ngồi</span>
        <span>[F] Đèn pin</span>
        <span className="text-amber-200/90">[Q] Nhang trầm ({incenseCharges})</span>
        <span>[E] Tương tác / Nấp</span>
        <span>[M] Minimap</span>
        <span>[Tab] Sổ điều tra</span>
        <span>[ESC] Tạm dừng</span>
      </div>
    </div>
  );
};
