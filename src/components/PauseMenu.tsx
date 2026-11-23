import React from 'react';
import { motion } from 'framer-motion';
import { Play, BookOpen, Backpack, Home, Volume2, Mouse } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export const PauseMenu: React.FC = () => {
  const setOverlay = useGameStore((s) => s.setOverlay);
  const returnToMenu = useGameStore((s) => s.returnToMenu);
  const settings = useGameStore((s) => s.settings);
  const updateSettings = useGameStore((s) => s.updateSettings);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/82 backdrop-blur-md p-4"
    >
      <div className="w-full max-w-md bg-[#130e0b] border border-[#614229] rounded-lg shadow-2xl p-6 space-y-5">
        <div className="text-center border-b border-[#3d2a1b] pb-4">
          <div className="text-[10px] uppercase tracking-[0.28em] text-red-400">Hồn Án</div>
          <h2 className="font-display-vn text-3xl text-[#efe4cc] mt-1">Tạm Dừng</h2>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => setOverlay('none')}
            className="flex items-center justify-center gap-2 py-3 rounded bg-red-900 hover:bg-red-800 text-white text-xs uppercase tracking-wider font-semibold cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            Tiếp Tục Điều Tra
          </button>

          <button
            onClick={() => setOverlay('journal')}
            className="flex items-center justify-center gap-2 py-2.5 rounded bg-[#1d1510] hover:bg-[#2b1e15] border border-[#593d27] text-[#efe4cc] text-xs uppercase tracking-wider cursor-pointer"
          >
            <BookOpen className="w-4 h-4 text-red-400" />
            Sổ Điều Tra (Tab)
          </button>

          <button
            onClick={() => setOverlay('inventory')}
            className="flex items-center justify-center gap-2 py-2.5 rounded bg-[#1d1510] hover:bg-[#2b1e15] border border-[#593d27] text-[#efe4cc] text-xs uppercase tracking-wider cursor-pointer"
          >
            <Backpack className="w-4 h-4 text-amber-400" />
            Túi Vật Phẩm (I)
          </button>
        </div>

        {/* Inline quick settings */}
        <div className="pt-3 border-t border-[#3d2a1b] space-y-3 text-xs text-[#cfc3ab]">
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-amber-400" /> Âm lượng
            </span>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={settings.masterVolume}
              onChange={(e) => updateSettings({ masterVolume: parseFloat(e.target.value) })}
              className="w-36 accent-red-700"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-1.5">
              <Mouse className="w-3.5 h-3.5 text-amber-400" /> Độ nhạy chuột
            </span>
            <input
              type="range"
              min={0.4}
              max={2.2}
              step={0.1}
              value={settings.mouseSensitivity}
              onChange={(e) => updateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
              className="w-36 accent-red-700"
            />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span>Tình huống Jumpscare</span>
            <input
              type="checkbox"
              checked={settings.enableJumpscares}
              onChange={(e) => updateSettings({ enableJumpscares: e.target.checked })}
              className="w-4 h-4 accent-red-700"
            />
          </div>
        </div>

        <button
          onClick={returnToMenu}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-[#16100c] hover:bg-red-950/70 border border-red-900/50 text-red-200 text-xs uppercase tracking-wider cursor-pointer"
        >
          <Home className="w-4 h-4" />
          Lưu & Quay Về Menu Chính
        </button>
      </div>
    </motion.div>
  );
};
