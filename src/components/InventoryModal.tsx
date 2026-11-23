import React from 'react';
import { motion } from 'framer-motion';
import { Backpack, Eye, X, Flashlight } from 'lucide-react';
import { LevelData } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface InventoryModalProps {
  level: LevelData;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({ level }) => {
  const setOverlay = useGameStore((s) => s.setOverlay);
  const openInspect = useGameStore((s) => s.openInspect);
  const flashlightBattery = useGameStore((s) => s.flashlightBattery);
  const progress = useGameStore((s) => s.progressByLevel[level.id]);

  const collectedIds = progress?.collectedEvidenceIds ?? [];
  const discoveredIds = progress?.discoveredHotspotIds ?? [];
  const items = level.evidences.filter((e) => collectedIds.includes(e.id));

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
    >
      <div className="w-full max-w-4xl max-h-[82vh] bg-[#120e0b] border border-[#614229] rounded-lg shadow-2xl flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-[#1a130e] border-b border-[#4a321f]">
          <div className="flex items-center gap-3">
            <Backpack className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-amber-400/80">
                Hành trang điều tra viên
              </div>
              <h2 className="font-display-vn text-2xl text-[#efe4cc]">Túi Đồ & Vật Chứng</h2>
            </div>
          </div>
          <button
            onClick={() => setOverlay('none')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#261b13] hover:bg-red-950 border border-[#614229] text-xs uppercase text-[#efe4cc] cursor-pointer"
          >
            <X className="w-4 h-4" />
            Đóng (I / ESC)
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-5">
          {/* Standard investigator gear */}
          <div className="p-4 rounded bg-[#1a1410] border border-[#4a3322] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-amber-950/60 border border-amber-700/50 flex items-center justify-center">
                <Flashlight className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#efe4cc]">Đèn pin cầm tay cũ</div>
                <div className="text-xs text-[#a69880]">Nhấn F để bật / tắt. Tắt đèn giúp hồi phục pin dự phòng.</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-amber-300 font-semibold">{Math.round(flashlightBattery)}%</div>
              <div className="w-24 h-1.5 bg-stone-900 rounded overflow-hidden mt-1">
                <div className="h-full bg-amber-500" style={{ width: `${flashlightBattery}%` }} />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#a38b6b] mb-3">
              Vật chứng đang mang theo ({items.length})
            </h3>
            {items.length === 0 ? (
              <div className="text-center py-10 text-sm text-[#8a7d67]">
                Túi đồ chưa có vật chứng nào từ hiện trường này.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((ev) => {
                  const found = ev.hotspots.filter((h) => discoveredIds.includes(h.id)).length;
                  return (
                    <div
                      key={ev.id}
                      className="p-4 rounded bg-[#1a1410] border border-[#4a3322] flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-serif-vn text-lg text-[#efe4cc] font-semibold">{ev.name}</div>
                        <div className="text-xs text-[#9c8e76] mt-0.5">
                          Đã kiểm tra {found}/{ev.hotspots.length} chi tiết
                        </div>
                      </div>
                      <button
                        onClick={() => openInspect(ev.id)}
                        className="shrink-0 px-3 py-2 rounded bg-[#2b1d14] hover:bg-red-950 border border-[#6e4c30] text-xs text-amber-100 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Soi 3D
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
