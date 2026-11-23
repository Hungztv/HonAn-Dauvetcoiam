import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  FileText,
  Package,
  Search,
  Users,
  Network,
  X,
  CheckCircle2,
  Lock,
  Eye,
  Link2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { LevelData } from '../types/game';
import { useGameStore } from '../store/gameStore';
import { CORE_TRUTH_CATALOG, CORE_TRUTH_IDS } from '../data/narrativePack';

interface InvestigationJournalProps {
  level: LevelData;
}

export const InvestigationJournal: React.FC<InvestigationJournalProps> = ({ level }) => {
  const journalTab = useGameStore((s) => s.journalTab);
  const setJournalTab = useGameStore((s) => s.setJournalTab);
  const setOverlay = useGameStore((s) => s.setOverlay);
  const openInspect = useGameStore((s) => s.openInspect);
  const markClueRead = useGameStore((s) => s.markClueRead);
  const attemptBoardConnection = useGameStore((s) => s.attemptBoardConnection);
  const narrative = useGameStore((s) => s.narrative);
  const progress = useGameStore((s) => s.progressByLevel[level.id]);

  const [searchQuery, setSearchQuery] = useState('');

  // Connection board interactive state
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [cardPositions, setCardPositions] = useState<Record<string, { x: number; y: number }>>(() => {
    const map: Record<string, { x: number; y: number }> = {};
    level.clues.forEach((c) => {
      map[c.id] = { x: c.boardX, y: c.boardY };
    });
    return map;
  });
  const [selectedClueId, setSelectedClueId] = useState<string | null>(null);
  const [boardFeedback, setBoardFeedback] = useState<{ ok: boolean; text: string } | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const collectedEvIds = progress?.collectedEvidenceIds ?? [];
  const unlockedClueIds = progress?.unlockedClueIds ?? [];
  const readClueIds = progress?.readClueIds ?? [];
  const discoveredHotspotIds = progress?.discoveredHotspotIds ?? [];
  const solvedConnIds = progress?.solvedConnectionIds ?? [];
  const currentTier = progress?.currentTier ?? 1;

  const unlockedClues = level.clues.filter((c) => unlockedClueIds.includes(c.id));
  const collectedEvidences = level.evidences.filter((e) => collectedEvIds.includes(e.id));
  const unreadClueCount = unlockedClues.filter((c) => !readClueIds.includes(c.id)).length;

  const q = searchQuery.trim().toLowerCase();
  const filteredEvidences = q
    ? collectedEvidences.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          e.shortDesc.toLowerCase().includes(q) ||
          e.locationName.toLowerCase().includes(q)
      )
    : collectedEvidences;
  const filteredClues = q
    ? unlockedClues.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.sourceName.toLowerCase().includes(q)
      )
    : unlockedClues;

  const handleCardClick = (clueId: string) => {
    markClueRead(clueId);
    if (!selectedClueId) {
      setSelectedClueId(clueId);
      setBoardFeedback(null);
      return;
    }
    if (selectedClueId === clueId) {
      setSelectedClueId(null);
      return;
    }
    const res = attemptBoardConnection(selectedClueId, clueId);
    setBoardFeedback({ ok: res.success, text: res.message });
    setSelectedClueId(null);
  };

  const handleBoardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!draggingId || !boardRef.current) return;
    const rect = boardRef.current.getBoundingClientRect();
    const xPct = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100));
    const yPct = Math.max(10, Math.min(88, ((e.clientY - rect.top) / rect.height) * 100));
    setCardPositions((prev) => ({ ...prev, [draggingId]: { x: xPct, y: yPct } }));
  };

  const tabs = [
    { id: 'case' as const, label: 'Hồ Sơ Vụ Án', icon: FileText },
    { id: 'evidence' as const, label: `Vật Chứng (${collectedEvidences.length}/${level.evidences.length})`, icon: Package },
    {
      id: 'clues' as const,
      label: `Manh Mối (${unlockedClues.length}/${level.clues.length})${unreadClueCount > 0 ? ` • ${unreadClueCount} mới` : ''}`,
      icon: Search,
    },
    { id: 'suspects' as const, label: 'Nghi Can', icon: Users },
    {
      id: 'board' as const,
      label: `Bảng Kết Nối (${solvedConnIds.length}/${level.boardConnections.length})`,
      icon: Network,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/82 backdrop-blur-md p-4"
    >
      <div className="w-full max-w-6xl h-[88vh] bg-[#120e0b] border border-[#614229]/80 rounded-lg shadow-[0_0_90px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#19130e] border-b border-[#4a321f]">
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6 text-red-500" />
            <div>
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-red-400">
                <span>Sổ Điều Tra — {level.code}</span>
                {narrative.isNewGamePlus && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-900/70 text-amber-200 text-[10px]">
                    NEW GAME+
                  </span>
                )}
              </div>
              <h2 className="font-display-vn text-2xl text-[#efe4cc]">{level.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {(journalTab === 'evidence' || journalTab === 'clues') && (
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8a7c66] absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm trong hồ sơ..."
                  className="bg-[#0e0b08] border border-[#4f3622] rounded pl-8 pr-3 py-1.5 text-xs text-[#efe4cc] placeholder:text-[#786b58] focus:outline-none focus:border-amber-600"
                />
              </div>
            )}
            <button
              onClick={() => setOverlay('none')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#241a13] hover:bg-red-950 border border-[#614229] text-xs uppercase tracking-wider text-[#efe4cc] rounded cursor-pointer"
            >
              <X className="w-4 h-4" />
              Đóng (Tab / ESC)
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-1 px-4 pt-3 bg-[#15100c] border-b border-[#3d2a1b]">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = journalTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setJournalTab(t.id)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-medium tracking-wide rounded-t border-t border-x transition cursor-pointer ${
                  active
                    ? 'bg-[#1e1610] text-amber-200 border-[#6e4a2d] -mb-px'
                    : 'bg-transparent text-[#9c8f79] border-transparent hover:text-[#dfd4bc]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-[#130f0c]">
          {/* TAB 1: CASE FILE */}
          {journalTab === 'case' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-5">
                <div className="p-5 rounded bg-[#1a140f] border border-[#4a3322]">
                  <div className="text-xs uppercase tracking-[0.2em] text-red-400 mb-2">
                    Hồ sơ hiện trường
                  </div>
                  <p className="text-sm leading-relaxed text-[#e5dac2]">{level.synopsis}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-4 border-t border-[#362519] text-xs">
                    <div>
                      <span className="text-[#8e7f68] block mb-0.5">Địa điểm</span>
                      <span className="text-[#efe4cc] font-medium">{level.location}</span>
                    </div>
                    <div>
                      <span className="text-[#8e7f68] block mb-0.5">Thời điểm</span>
                      <span className="text-[#efe4cc] font-medium">{level.era}</span>
                    </div>
                    <div>
                      <span className="text-[#8e7f68] block mb-0.5">Trung tâm vụ án</span>
                      <span className="text-red-300 font-medium">{level.victim}</span>
                    </div>
                  </div>
                </div>

                {/* 3-Tier Puzzle Progression */}
                <div className="space-y-3">
                  <h3 className="text-xs uppercase tracking-[0.2em] text-[#a38b6b]">
                    Tiến trình giải đố 3 tầng
                  </h3>
                  {level.tiers.map((tier) => {
                    const done = currentTier > tier.tier || progress?.completed;
                    const active = currentTier === tier.tier && !progress?.completed;
                    return (
                      <div
                        key={tier.tier}
                        className={`p-4 rounded border ${
                          done
                            ? 'bg-emerald-950/25 border-emerald-800/60'
                            : active
                            ? 'bg-red-950/25 border-red-800/70'
                            : 'bg-[#16110d] border-[#2e2218] opacity-65'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-serif-vn text-lg font-semibold text-[#efe4cc]">
                            Tầng {tier.tier}: {tier.title}
                          </span>
                          {done ? (
                            <span className="flex items-center gap-1 text-xs text-emerald-300">
                              <CheckCircle2 className="w-4 h-4" /> Hoàn thành
                            </span>
                          ) : active ? (
                            <span className="text-xs px-2 py-0.5 rounded bg-red-900/70 text-red-100">
                              Đang thực hiện
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-stone-400">
                              <Lock className="w-3.5 h-3.5" /> Chưa mở
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#d1c5ad] leading-relaxed">{tier.objective}</p>
                        {active && (
                          <p className="text-[11px] text-amber-300/90 mt-2 italic">
                            Hướng điều tra: {tier.completionHint}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Narrative Core Truths & Chính Khí Ledger */}
              <div className="space-y-4">
                <div className="p-5 rounded bg-[#19130e] border border-[#473120] space-y-3">
                  <div className="flex items-center justify-between border-b border-[#3a281a] pb-2">
                    <h3 className="font-serif-vn text-xl text-amber-200 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      Chính Khí & Chân Lý
                    </h3>
                    <span
                      className={`text-sm font-bold px-2 py-0.5 rounded ${
                        narrative.spiritScore > 0
                          ? 'bg-emerald-950 text-emerald-300'
                          : narrative.spiritScore < 0
                          ? 'bg-red-950 text-red-300'
                          : 'bg-stone-900 text-stone-300'
                      }`}
                    >
                      {narrative.spiritScore >= 0 ? `+${narrative.spiritScore}` : narrative.spiritScore}
                    </span>
                  </div>

                  <div className="text-xs text-[#b5a78e]">
                    Chân Lý Cốt Lõi ({narrative.coreTruths.length}/4):
                  </div>
                  <div className="space-y-1.5">
                    {CORE_TRUTH_IDS.map((tid) => {
                      const unlocked = narrative.coreTruths.includes(tid);
                      const meta = CORE_TRUTH_CATALOG[tid];
                      return (
                        <div
                          key={tid}
                          className={`p-2 rounded border text-[11px] flex items-center justify-between gap-2 ${
                            unlocked
                              ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-200'
                              : 'bg-[#120e0b] border-[#2c2119] text-[#786b58]'
                          }`}
                        >
                          <span>
                            {meta.direction} ({meta.year}): {unlocked ? meta.title : 'Chưa sáng tỏ'}
                          </span>
                          {unlocked ? (
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                          ) : (
                            <Lock className="w-3 h-3 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Moral Choices Ledger */}
                  <div className="pt-2 border-t border-[#3a281a] text-[11px] space-y-1.5 text-[#c7baa2]">
                    <div className="text-[#94856e] uppercase tracking-wider text-[10px]">
                      Lựa chọn đạo đức đã chốt
                    </div>
                    <div>
                      • Đào Thị Mây (Án 02):{' '}
                      <strong className="text-amber-200">
                        {narrative.moralChoices.fate_dao_thi_may === 'release'
                          ? 'Giải thoát (+1)'
                          : narrative.moralChoices.fate_dao_thi_may === 'keep'
                          ? 'Giữ lại (-1)'
                          : 'Chưa quyết định'}
                      </strong>
                    </div>
                    <div>
                      • Hồ sơ Ngôi Đình (Án 04):{' '}
                      <strong className="text-amber-200">
                        {narrative.moralChoices.fate_village_truth === 'reveal'
                          ? 'Công bố sự thật (+1)'
                          : narrative.moralChoices.fate_village_truth === 'burn'
                          ? 'Thiêu hủy (-1)'
                          : 'Chưa quyết định'}
                      </strong>
                    </div>
                    <div>
                      • Phán quyết Nguyễn Văn Khải (Án 05):{' '}
                      <strong className="text-amber-200">
                        {narrative.moralChoices.judgment_nguyen_van_khai === 'forgive'
                          ? 'Tha thứ'
                          : narrative.moralChoices.judgment_nguyen_van_khai === 'condemn'
                          ? 'Kết tội'
                          : 'Chưa tuyên án'}
                      </strong>
                    </div>
                  </div>
                </div>

                <blockquote className="text-xs italic text-[#b8aa90] border-l-2 border-red-800 pl-3 py-1">
                  “{level.introQuote}”
                </blockquote>
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE */}
          {journalTab === 'evidence' && (
            <div>
              {filteredEvidences.length === 0 ? (
                <div className="text-center py-16 text-[#8f826c] text-sm">
                  {collectedEvidences.length === 0
                    ? 'Chưa thu thập vật chứng nào. Hãy khám phá hiện trường và nhấn E để kiểm tra đồ vật.'
                    : 'Không tìm thấy vật chứng khớp với từ khóa.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEvidences.map((ev) => {
                    const foundHs = ev.hotspots.filter((h) => discoveredHotspotIds.includes(h.id)).length;
                    return (
                      <div
                        key={ev.id}
                        className="p-4 rounded bg-[#1a1410] border border-[#4a3322] flex flex-col justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-serif-vn text-lg font-semibold text-[#efe4cc]">{ev.name}</h4>
                            <span className="text-[11px] px-2 py-0.5 rounded bg-black/50 text-amber-300 border border-amber-800/40 shrink-0">
                              {foundHs}/{ev.hotspots.length} chi tiết
                            </span>
                          </div>
                          <div className="text-[11px] text-[#94846d] mt-0.5">{ev.locationName}</div>
                          <p className="text-xs text-[#cec2aa] mt-2 leading-relaxed">{ev.shortDesc}</p>
                        </div>
                        <button
                          onClick={() => openInspect(ev.id)}
                          className="w-full py-2 px-3 rounded bg-[#2a1d14] hover:bg-red-950 border border-[#6e4c30] text-xs font-medium text-amber-100 flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Xoay 360° & Kiểm tra lại
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CLUES */}
          {journalTab === 'clues' && (
            <div>
              {filteredClues.length === 0 ? (
                <div className="text-center py-16 text-[#8f826c] text-sm">
                  {unlockedClues.length === 0
                    ? 'Chưa có manh mối nào được ghi nhận. Hãy xoay vật chứng 3D và soi các chi tiết ẩn!'
                    : 'Không tìm thấy manh mối khớp với từ khóa.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredClues.map((clue) => {
                    const isUnread = !readClueIds.includes(clue.id);
                    return (
                      <div
                        key={clue.id}
                        onClick={() => markClueRead(clue.id)}
                        className={`p-4 rounded border space-y-1.5 transition cursor-pointer ${
                          isUnread
                            ? 'bg-[#221711] border-amber-600/80'
                            : 'bg-[#1b1510] border-[#523925]'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-red-950/70 text-red-200 border border-red-800/50">
                              Tầng {clue.tier}
                            </span>
                            {isUnread && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-600 text-black font-bold flex items-center gap-0.5">
                                <Sparkles className="w-2.5 h-2.5" /> MỚI
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-[#8f7f67]">Nguồn: {clue.sourceName}</span>
                        </div>
                        <h4 className="font-serif-vn text-lg text-amber-100 font-semibold">{clue.title}</h4>
                        <p className="text-xs text-[#d6cab3] leading-relaxed">{clue.summary}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SUSPECTS */}
          {journalTab === 'suspects' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {level.suspects.map((sus) => {
                const secretUnlocked = sus.secretClueId ? unlockedClueIds.includes(sus.secretClueId) : false;
                return (
                  <div
                    key={sus.id}
                    className="p-5 rounded bg-[#1a1410] border border-[#4a3322] space-y-2.5"
                  >
                    <div className="flex items-baseline justify-between gap-2 border-b border-[#362519] pb-2">
                      <h4 className="font-display-vn text-xl text-[#efe4cc]">{sus.name}</h4>
                      <span className="text-xs text-red-300/90">{sus.role}</span>
                    </div>
                    <p className="text-xs text-[#d1c5ad] leading-relaxed">{sus.description}</p>
                    <div className="text-xs text-[#a89a82]">
                      <strong className="text-[#dfd4bc]">Dấu vết / Lời khai:</strong> {sus.alibi}
                    </div>
                    {sus.secretNote && (
                      <div
                        className={`p-3 rounded text-xs border ${
                          secretUnlocked
                            ? 'bg-red-950/35 border-red-800/70 text-red-100'
                            : 'bg-[#120e0b] border-[#2e231a] text-[#756958] italic'
                        }`}
                      >
                        {secretUnlocked
                          ? `Bí mật phát hiện: ${sus.secretNote}`
                          : 'Chưa đủ manh mối để vạch trần bí mật của nhân vật này.'}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 5: CONNECTION BOARD */}
          {journalTab === 'board' && (
            <div className="flex flex-col h-full gap-4">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-[#1a1410] border border-[#4a3322] px-4 py-3 rounded text-xs">
                <div className="flex items-center gap-2 text-[#dfd4bc]">
                  <Link2 className="w-4 h-4 text-red-400" />
                  <span>
                    Nhấn lần lượt <strong>2 thẻ manh mối</strong> để kéo sợi chỉ đỏ xác thực suy luận (bắt buộc để mở khóa cơ chế Tầng 2). Giữ chuột để kéo sắp xếp vị trí thẻ.
                  </span>
                </div>
                {selectedClueId && (
                  <span className="text-amber-300 font-medium">
                    Đang chọn 1 thẻ — hãy nhấn thẻ thứ hai để liên kết...
                  </span>
                )}
              </div>

              {boardFeedback && (
                <div
                  className={`px-4 py-2.5 rounded border text-xs ${
                    boardFeedback.ok
                      ? 'bg-emerald-950/45 border-emerald-700/70 text-emerald-100'
                      : 'bg-red-950/45 border-red-800/70 text-red-200'
                  }`}
                >
                  {boardFeedback.text}
                </div>
              )}

              <div
                ref={boardRef}
                onMouseMove={handleBoardMouseMove}
                onMouseUp={() => setDraggingId(null)}
                onMouseLeave={() => setDraggingId(null)}
                className="relative flex-1 min-h-[400px] rounded-lg border-2 border-[#473120] bg-[radial-gradient(circle_at_center,#231a13_0%,#120d09_100%)] overflow-hidden"
              >
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {level.boardConnections
                    .filter((conn) => solvedConnIds.includes(conn.id))
                    .map((conn) => {
                      const pA = cardPositions[conn.clueA];
                      const pB = cardPositions[conn.clueB];
                      if (!pA || !pB) return null;
                      return (
                        <g key={conn.id}>
                          <line
                            x1={`${pA.x}%`}
                            y1={`${pA.y}%`}
                            x2={`${pB.x}%`}
                            y2={`${pB.y}%`}
                            stroke="#b91c1c"
                            strokeWidth="2.8"
                            strokeDasharray="6 3"
                          />
                        </g>
                      );
                    })}
                </svg>

                {unlockedClues.length === 0 ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-[#8a7d67]">
                    Hãy thu thập manh mối ở hiện trường trước khi phân tích trên Bảng Kết Nối.
                  </div>
                ) : (
                  unlockedClues.map((clue) => {
                    const pos = cardPositions[clue.id] ?? { x: clue.boardX, y: clue.boardY };
                    const isSelected = selectedClueId === clue.id;
                    const isLinked = level.boardConnections.some(
                      (c) => solvedConnIds.includes(c.id) && (c.clueA === clue.id || c.clueB === clue.id)
                    );
                    return (
                      <div
                        key={clue.id}
                        style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        onMouseDown={() => setDraggingId(clue.id)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCardClick(clue.id);
                        }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 w-48 p-3 rounded shadow-xl border transition select-none cursor-pointer ${
                          isSelected
                            ? 'bg-[#361c17] border-amber-400 scale-105 z-20 shadow-[0_0_24px_rgba(245,158,11,0.45)]'
                            : isLinked
                            ? 'bg-[#251a13] border-red-700/80 z-10'
                            : 'bg-[#1f1711] border-[#61452d] hover:border-amber-600/80 z-10'
                        }`}
                      >
                        <div className="w-2.5 h-2.5 rounded-full bg-red-700 border border-amber-200 mx-auto -mt-4 mb-1.5 shadow" />
                        <div className="text-[11px] font-semibold text-amber-100 leading-snug">
                          {clue.title}
                        </div>
                        <p className="text-[10px] text-[#c2b59d] mt-1 line-clamp-3 leading-relaxed">
                          {clue.summary}
                        </p>
                      </div>
                    );
                  })
                )}
              </div>

              {solvedConnIds.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {level.boardConnections
                    .filter((c) => solvedConnIds.includes(c.id))
                    .map((conn) => (
                      <div
                        key={conn.id}
                        className="p-3 rounded bg-red-950/30 border border-red-800/60 text-xs"
                      >
                        <div className="font-semibold text-amber-200 mb-1">✓ {conn.title}</div>
                        <p className="text-[#dfd4bc] leading-relaxed">{conn.deductionText}</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
