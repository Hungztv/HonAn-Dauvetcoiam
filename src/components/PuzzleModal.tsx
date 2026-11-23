import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Unlock, ChevronUp, ChevronDown, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';
import { LevelData } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { horrorAudio } from '../audio/horrorAudio';

interface PuzzleModalProps {
  level: LevelData;
  puzzleId: string;
}

export const PuzzleModal: React.FC<PuzzleModalProps> = ({ level, puzzleId }) => {
  const closePuzzle = useGameStore((s) => s.closePuzzle);
  const markPuzzleSolved = useGameStore((s) => s.markPuzzleSolved);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const setJournalTab = useGameStore((s) => s.setJournalTab);
  const progress = useGameStore((s) => s.progressByLevel[level.id]);

  const puzzle =
    level.tier2Puzzle.id === puzzleId
      ? level.tier2Puzzle
      : level.tier3Puzzle.id === puzzleId
      ? level.tier3Puzzle
      : null;

  const alreadySolved = progress?.solvedPuzzleIds.includes(puzzleId) ?? false;

  // Code lock state
  const [dialIndices, setDialIndices] = useState<number[]>(() =>
    puzzle?.kind === 'code_lock' ? puzzle.dials.map(() => 0) : []
  );

  // Sequence state
  const [chosenSequence, setChosenSequence] = useState<string[]>([]);

  // Deduction state
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [solvedBanner, setSolvedBanner] = useState<string | null>(
    alreadySolved && puzzle ? puzzle.successNarrative : null
  );

  if (!puzzle) return null;

  const shiftDial = (dialIdx: number, dir: 1 | -1) => {
    if (puzzle.kind !== 'code_lock' || alreadySolved) return;
    horrorAudio.playClick();
    setErrorMsg(null);
    setDialIndices((prev) => {
      const next = [...prev];
      const len = puzzle.dials[dialIdx].options.length;
      next[dialIdx] = (next[dialIdx] + dir + len) % len;
      return next;
    });
  };

  const handleSubmitCodeLock = () => {
    if (puzzle.kind !== 'code_lock') return;
    const current = dialIndices.map((idx, d) => puzzle.dials[d].options[idx]);
    const isMatch = puzzle.solution.every((val, idx) => current[idx] === val);
    if (isMatch) {
      setSolvedBanner(puzzle.successNarrative);
      markPuzzleSolved(puzzle.id);
    } else {
      horrorAudio.playError();
      setErrorMsg('Cơ chế không chuyển động. Các ký tự hoặc con số chưa khớp với manh mối trong Sổ điều tra.');
    }
  };

  const handlePickSequenceItem = (itemId: string) => {
    if (puzzle.kind !== 'sequence' || alreadySolved) return;
    if (chosenSequence.includes(itemId)) return;
    horrorAudio.playWoodenFish();
    setErrorMsg(null);
    setChosenSequence((prev) => [...prev, itemId]);
  };

  const handleSubmitSequence = () => {
    if (puzzle.kind !== 'sequence') return;
    if (chosenSequence.length !== puzzle.solutionOrder.length) {
      setErrorMsg('Hãy chọn đủ trình tự các bước trước khi kích hoạt.');
      return;
    }
    const ok = puzzle.solutionOrder.every((id, idx) => chosenSequence[idx] === id);
    if (ok) {
      setSolvedBanner(puzzle.successNarrative);
      markPuzzleSolved(puzzle.id);
    } else {
      horrorAudio.playError();
      setErrorMsg('Trình tự nghi thức sai lệch — tiếng gỗ rền vang lạnh lẽo. Hãy kiểm tra lại manh mối!');
      setChosenSequence([]);
    }
  };

  const handleSubmitDeduction = () => {
    if (puzzle.kind !== 'deduction') return;
    const unanswered = puzzle.questions.some((q) => !answers[q.id]);
    if (unanswered) {
      setErrorMsg('Hãy trả lời đầy đủ tất cả các suy luận để đối mặt với sự thật.');
      return;
    }
    const allCorrect = puzzle.questions.every((q) => answers[q.id] === q.correctOptionId);
    if (allCorrect) {
      setSolvedBanner(puzzle.successNarrative);
      markPuzzleSolved(puzzle.id);
    } else {
      horrorAudio.playError();
      setErrorMsg('Có điểm chưa trùng khớp với chứng cứ hiện trường. Hãy mở Sổ điều tra để đối chiếu kỹ hơn.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <div className="w-full max-w-2xl max-h-[88vh] bg-[#130e0b] border border-[#6e472a] rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#1b130e] border-b border-[#4d321e]">
          <div className="flex items-center gap-3">
            {solvedBanner ? (
              <Unlock className="w-5 h-5 text-emerald-400" />
            ) : (
              <Lock className="w-5 h-5 text-red-500" />
            )}
            <div>
              <div className="text-[11px] uppercase tracking-[0.2em] text-red-400">
                Giải đố Tầng {puzzle.tier}
              </div>
              <h2 className="font-display-vn text-2xl text-[#efe4cc]">{puzzle.title}</h2>
            </div>
          </div>
          <button
            onClick={closePuzzle}
            className="p-1.5 rounded bg-[#261a12] hover:bg-red-950 text-[#e5dcc5] border border-[#5e3f27] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <p className="text-sm text-[#d9ceb6] leading-relaxed">{puzzle.subtitle}</p>

          <div className="p-3 rounded bg-[#1a130e] border border-[#453020] text-xs text-amber-200/90 flex items-center justify-between gap-3">
            <span>Gợi ý: {puzzle.hintNote}</span>
            <button
              onClick={() => {
                setJournalTab('clues');
                setOverlay('journal');
              }}
              className="shrink-0 px-2.5 py-1 rounded bg-[#2d1e14] hover:bg-[#3d291b] border border-[#6e4c30] text-[11px] text-amber-100 cursor-pointer"
            >
              Xem Sổ điều tra
            </button>
          </div>

          {/* CODE LOCK UI */}
          {puzzle.kind === 'code_lock' && !solvedBanner && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {puzzle.dials.map((dial, dIdx) => (
                  <div
                    key={dial.label}
                    className="flex flex-col items-center p-3 rounded bg-[#1b140f] border border-[#593d27]"
                  >
                    <span className="text-[11px] uppercase tracking-wider text-[#9c8c74] mb-2">
                      {dial.label}
                    </span>
                    <button
                      onClick={() => shiftDial(dIdx, -1)}
                      className="p-1 hover:text-amber-300 text-[#b8aa90] cursor-pointer"
                    >
                      <ChevronUp className="w-5 h-5" />
                    </button>
                    <div className="my-2 w-full py-3 text-center rounded bg-[#0c0907] border border-amber-800/60 font-serif-vn text-xl font-bold text-amber-200">
                      {dial.options[dialIndices[dIdx]]}
                    </div>
                    <button
                      onClick={() => shiftDial(dIdx, 1)}
                      className="p-1 hover:text-amber-300 text-[#b8aa90] cursor-pointer"
                    >
                      <ChevronDown className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                onClick={handleSubmitCodeLock}
                className="w-full py-3 rounded bg-red-900 hover:bg-red-800 text-[#f5ebd6] font-semibold tracking-wider uppercase text-xs transition cursor-pointer"
              >
                Kích hoạt cơ chế mở khóa
              </button>
            </div>
          )}

          {/* SEQUENCE UI */}
          {puzzle.kind === 'sequence' && !solvedBanner && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {puzzle.items.map((item) => {
                  const stepIndex = chosenSequence.indexOf(item.id);
                  const chosen = stepIndex !== -1;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handlePickSequenceItem(item.id)}
                      disabled={chosen}
                      className={`p-3.5 rounded border text-left transition cursor-pointer ${
                        chosen
                          ? 'bg-red-950/50 border-amber-500/80 text-amber-100'
                          : 'bg-[#1c1510] border-[#4d3523] hover:border-amber-600/70 text-[#e3d8c0]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-serif-vn text-lg font-semibold">{item.label}</span>
                        {chosen && (
                          <span className="w-6 h-6 rounded-full bg-amber-600 text-black font-bold text-xs flex items-center justify-center">
                            {stepIndex + 1}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#b5a78e] mt-1">{item.detail}</p>
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setChosenSequence([])}
                  className="px-4 py-3 rounded bg-[#241a13] hover:bg-[#33241a] border border-[#5c402a] text-xs text-[#d6cab3] flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Đặt lại
                </button>
                <button
                  onClick={handleSubmitSequence}
                  className="flex-1 py-3 rounded bg-red-900 hover:bg-red-800 text-[#f5ebd6] font-semibold tracking-wider uppercase text-xs transition cursor-pointer"
                >
                  Thực hiện trình tự ({chosenSequence.length}/{puzzle.solutionOrder.length})
                </button>
              </div>
            </div>
          )}

          {/* TIER 3 DEDUCTION UI */}
          {puzzle.kind === 'deduction' && !solvedBanner && (
            <div className="space-y-5">
              {puzzle.questions.map((q, qIdx) => (
                <div key={q.id} className="p-4 rounded bg-[#1a140f] border border-[#4a3322] space-y-2.5">
                  <div className="text-sm font-semibold text-amber-100">
                    {qIdx + 1}. {q.prompt}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt) => {
                      const active = answers[q.id] === opt.id;
                      return (
                        <button
                          key={opt.id}
                          onClick={() => {
                            horrorAudio.playClick();
                            setErrorMsg(null);
                            setAnswers((prev) => ({ ...prev, [q.id]: opt.id }));
                          }}
                          className={`w-full text-left px-3.5 py-2.5 rounded border text-xs transition cursor-pointer ${
                            active
                              ? 'bg-red-950/70 border-amber-400 text-amber-100'
                              : 'bg-[#120d0a] border-[#38271b] hover:border-[#6e4c32] text-[#d6cab3]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <button
                onClick={handleSubmitDeduction}
                className="w-full py-3.5 rounded bg-red-900 hover:bg-red-800 text-[#f7eedb] font-semibold tracking-wider uppercase text-xs transition cursor-pointer"
              >
                Công bố sự thật & Hóa giải án oan
              </button>
            </div>
          )}

          {/* Error Feedback */}
          {errorMsg && (
            <div className="p-3 rounded bg-red-950/60 border border-red-700/70 text-xs text-red-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Solved Narrative */}
          {solvedBanner && (
            <div className="p-5 rounded bg-emerald-950/35 border border-emerald-700/70 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5" />
                Cơ chế đã được giải mã!
              </div>
              <p className="text-sm text-[#e8dec8] leading-relaxed">{solvedBanner}</p>
              <button
                onClick={closePuzzle}
                className="px-5 py-2 rounded bg-emerald-800 hover:bg-emerald-700 text-white text-xs uppercase tracking-wider font-semibold cursor-pointer"
              >
                Tiếp tục điều tra hiện trường
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
