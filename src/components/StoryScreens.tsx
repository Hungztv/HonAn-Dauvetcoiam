import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Home,
  CheckCircle2,
  Sparkles,
  Flame,
  CloudMoon,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { LevelData } from '../types/game';
import { LEVELS } from '../data/levels';
import { useGameStore } from '../store/gameStore';
import { resolveEnding } from '../data/narrativePack';

export const ChapterIntro: React.FC<{ level: LevelData }> = ({ level }) => {
  const beginLevelPlayback = useGameStore((s) => s.beginLevelPlayback);
  const isNewGamePlus = useGameStore((s) => s.narrative.isNewGamePlus);

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
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs uppercase tracking-[0.3em] text-red-400">{level.code}</span>
            {isNewGamePlus && (
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-amber-900/70 text-amber-200 border border-amber-600/60">
                NEW GAME+
              </span>
            )}
          </div>
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
  const narrative = useGameStore((s) => s.narrative);
  const nextLevel = LEVELS.find((l) => l.id === level.id + 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060505]/95 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full bg-[#120e0b] border border-emerald-800/70 rounded-lg p-8 md:p-10 shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-7 h-7" />
            <span className="text-xs uppercase tracking-[0.26em] font-semibold">
              Hoàn thành {level.code} — Chân Lý Cốt Lõi Đã Mở
            </span>
          </div>
          <span className="text-xs px-2.5 py-1 rounded bg-[#1d1510] border border-[#593d27] text-amber-200">
            Chính Khí: {narrative.spiritScore >= 0 ? `+${narrative.spiritScore}` : narrative.spiritScore} • Chân Lý: {narrative.coreTruths.length}/4
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

export const GrandEndingScreen: React.FC<{ level: LevelData }> = () => {
  const returnToMenu = useGameStore((s) => s.returnToMenu);
  const startNewGamePlus = useGameStore((s) => s.startNewGamePlus);
  const narrative = useGameStore((s) => s.narrative);

  const resolution = narrative.lastEnding ?? resolveEnding(narrative);

  const theme =
    resolution.ending === 'true_ending'
      ? {
          bg: 'from-[#1a1408] via-[#120e09] to-[#060505]',
          border: 'border-amber-600/80 shadow-[0_0_110px_rgba(217,119,6,0.28)]',
          accent: 'text-amber-300',
          Icon: Sparkles,
        }
      : resolution.ending === 'bittersweet_ending'
      ? {
          bg: 'from-[#0b131a] via-[#101216] to-[#060709]',
          border: 'border-slate-500/70 shadow-[0_0_95px_rgba(100,116,139,0.22)]',
          accent: 'text-sky-200',
          Icon: CloudMoon,
        }
      : {
          bg: 'from-[#1f0606] via-[#110606] to-[#050303]',
          border: 'border-red-800/90 shadow-[0_0_110px_rgba(185,28,28,0.35)]',
          accent: 'text-red-400',
          Icon: Flame,
        };

  const EndingIcon = theme.Icon;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-b ${theme.bg} p-6 overflow-y-auto`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className={`max-w-2xl w-full bg-[#120e0b]/95 border ${theme.border} rounded-lg p-8 md:p-10 text-center space-y-6 my-auto`}
      >
        <EndingIcon className={`w-11 h-11 mx-auto ${theme.accent}`} />

        <div className="space-y-1.5">
          <div className={`text-xs uppercase tracking-[0.28em] font-semibold ${theme.accent}`}>
            {resolution.subtitle}
          </div>
          <h1 className="font-display-vn text-3xl md:text-4xl text-[#f5ebd6]">
            {resolution.title}
          </h1>
        </div>

        <p className="text-sm leading-relaxed text-[#e5dac2] text-left">
          {resolution.narrative}
        </p>

        <blockquote className={`font-serif-vn italic text-lg ${theme.accent} opacity-90`}>
          “{resolution.epilogue}”
        </blockquote>

        {/* Canonical Ending Resolution Breakdown */}
        <div className="grid grid-cols-3 gap-3 bg-[#18120e] border border-[#3d2a1b] rounded p-4 text-xs text-left">
          <div>
            <span className="text-[#8f816c] block">Chân Lý Cốt Lõi</span>
            <strong className={resolution.hasAllCoreTruths ? 'text-emerald-300' : 'text-red-300'}>
              {4 - resolution.missingCoreTruths.length} / 4
            </strong>
          </div>
          <div>
            <span className="text-[#8f816c] block">Điểm Chính Khí</span>
            <strong className={resolution.spiritScore === 2 ? 'text-emerald-300' : 'text-red-300'}>
              {resolution.spiritScore >= 0 ? `+${resolution.spiritScore}` : resolution.spiritScore} / +2
            </strong>
          </div>
          <div>
            <span className="text-[#8f816c] block">Phán Quyết Khải</span>
            <strong className="text-amber-200">
              {resolution.judgment === 'forgive'
                ? 'Tha thứ'
                : resolution.judgment === 'condemn'
                ? 'Kết tội'
                : 'Chưa phán quyết'}
            </strong>
          </div>
        </div>

        {resolution.darkReason && (
          <div className="text-xs text-red-300/90 bg-red-950/40 border border-red-900/60 px-4 py-2 rounded">
            Nguyên nhân Kết Cục Bóng Tối: <code>{resolution.darkReason}</code>
          </div>
        )}

        <div className="flex items-center justify-center gap-2 text-xs text-amber-300/90">
          <ShieldCheck className="w-4 h-4" />
          <span>
            Đã mở khóa <strong>NEW GAME+</strong> • Kết cục đã đạt: {narrative.completedEndings.length}/3
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {narrative.ngPlusUnlocked && (
            <button
              onClick={startNewGamePlus}
              className="px-6 py-3 rounded bg-amber-700 hover:bg-amber-600 text-black text-xs uppercase tracking-widest font-bold flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Bắt đầu New Game+ (Bí mật ẩn)
            </button>
          )}
          <button
            onClick={returnToMenu}
            className="px-6 py-3 rounded bg-red-900 hover:bg-red-800 text-white text-xs uppercase tracking-widest font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            Quay về Menu Chính
          </button>
        </div>
      </motion.div>
    </div>
  );
};
