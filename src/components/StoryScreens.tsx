import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Home, CheckCircle2, Sparkles } from 'lucide-react';
import { LevelData } from '../types/game';
import { LEVELS } from '../data/levels';
import { useGameStore } from '../store/gameStore';

export const ChapterIntro: React.FC<{ level: LevelData }> = ({ level }) => {
  const beginLevelPlayback = useGameStore((s) => s.beginLevelPlayback);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070505] p-6">
      <div className="horror-grain absolute inset-0 opacity-35 pointer-events-none" />
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="relative max-w-2xl w-full bg-[#110d0a]/95 border border-[#5c3e26]/80 rounded-lg p-8 md:p-10 shadow-[0_0_90px_rgba(127,29,29,0.25)] space-y-6"
      >
        <div className="space-y-1.5 border-b border-[#3d2a1b] pb-5">
          <div className="text-xs uppercase tracking-[0.3em] text-red-400">{level.code}</div>
          <h1 className="font-display-vn text-4xl md:text-5xl text-[#f2e8d2]">{level.title}</h1>
          <p className="font-serif-vn text-lg italic text-amber-200/80">{level.subtitle}</p>
        </div>

        <p className="text-sm leading-relaxed text-[#dfd4bc]">{level.synopsis}</p>

        <blockquote className="p-4 rounded bg-red-950/25 border-l-2 border-red-700 font-serif-vn italic text-base text-red-200/90">
          “{level.introQuote}”
        </blockquote>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#b5a78e] bg-[#18120e] p-4 rounded border border-[#3d2a1b]">
          <div>
            <span className="text-[#857661] block">Địa điểm</span>
            <span className="text-[#efe4cc]">{level.location}</span>
          </div>
          <div>
            <span className="text-[#857661] block">Thời điểm</span>
            <span className="text-[#efe4cc]">{level.era}</span>
          </div>
        </div>

        <button
          onClick={beginLevelPlayback}
          className="w-full py-3.5 rounded bg-red-900 hover:bg-red-800 text-[#f7eedb] font-semibold uppercase tracking-widest text-xs flex items-center justify-center gap-2 transition cursor-pointer"
        >
          Bước vào hiện trường
          <ArrowRight className="w-4 h-4" />
        </button>
      </motion.div>
    </div>
  );
};

export const LevelCompleteModal: React.FC<{ level: LevelData }> = ({ level }) => {
  const selectLevel = useGameStore((s) => s.selectLevel);
  const returnToMenu = useGameStore((s) => s.returnToMenu);
  const nextLevel = LEVELS.find((l) => l.id === level.id + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060505]/95 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-[#120e0b] border border-emerald-800/70 rounded-lg p-8 md:p-10 shadow-2xl space-y-6"
      >
        <div className="flex items-center gap-3 text-emerald-400">
          <CheckCircle2 className="w-7 h-7" />
          <span className="text-xs uppercase tracking-[0.26em] font-semibold">
            Hoàn thành {level.code} — Sự thật đã sáng tỏ
          </span>
        </div>

        <h2 className="font-display-vn text-4xl text-[#f2e8d2]">{level.title}</h2>

        <p className="text-sm leading-relaxed text-[#e5dac2]">{level.tier3Puzzle.successNarrative}</p>

        <div className="p-4 rounded bg-[#1a1410] border-l-2 border-amber-600 text-xs italic text-amber-100/90 leading-relaxed">
          {level.tier3Puzzle.epilogueText}
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          {nextLevel && (
            <button
              onClick={() => selectLevel(nextLevel.id, false)}
              className="flex-1 py-3.5 px-5 rounded bg-red-900 hover:bg-red-800 text-white text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 cursor-pointer"
            >
              Tiếp tục: {nextLevel.code} — {nextLevel.title}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={returnToMenu}
            className="py-3.5 px-5 rounded bg-[#1e1610] hover:bg-[#2b1f16] border border-[#5c402a] text-[#efe4cc] text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Menu Chính
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export const GrandEndingScreen: React.FC<{ level: LevelData }> = ({ level }) => {
  const returnToMenu = useGameStore((s) => s.returnToMenu);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b from-[#07090d] via-[#100b0a] to-[#060505] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
        className="max-w-2xl w-full bg-[#120e0b]/95 border border-amber-700/70 rounded-lg p-10 shadow-[0_0_100px_rgba(217,119,6,0.2)] text-center space-y-6"
      >
        <Sparkles className="w-10 h-10 text-amber-400 mx-auto" />
        <div className="text-xs uppercase tracking-[0.3em] text-amber-400">
          Hồi Kết — Hồn Án Khép Lại
        </div>
        <h1 className="font-display-vn text-4xl md:text-5xl text-[#f5ebd6]">
          Ánh Bình Minh Trên Bến Đò Âm
        </h1>
        <p className="text-sm leading-relaxed text-[#e5dac2] text-left">
          {level.tier3Puzzle.successNarrative}
        </p>
        <p className="font-serif-vn italic text-lg text-amber-200/90">
          “{level.tier3Puzzle.epilogueText}”
        </p>
        <div className="text-xs text-[#9c8e76] pt-2">
          Cảm ơn bạn đã phá giải trọn vẹn cả 5 vụ án của <strong>HỒN ÁN – DẤU VẾT CÕI ÂM</strong>.
        </div>
        <button
          onClick={returnToMenu}
          className="px-8 py-3.5 rounded bg-red-900 hover:bg-red-800 text-white text-xs uppercase tracking-widest font-semibold cursor-pointer"
        >
          Quay về Menu Chính
        </button>
      </motion.div>
    </div>
  );
};
