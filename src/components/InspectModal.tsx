import React, { useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, ContactShadows } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCw, ZoomIn, Eye, CheckCircle2, Sparkles, BookMarked } from 'lucide-react';
import * as THREE from 'three';
import { EvidenceItem, EvidenceHotspot } from '../types/game';
import { EvidenceModel } from '../three/EvidenceModels';
import { useGameStore } from '../store/gameStore';
import { getActiveEvidenceNotes } from '../data/narrativePack';

interface InspectModalProps {
  evidence: EvidenceItem;
}

const IMPORTANCE_LABELS = {
  then_chot: { text: 'Vật chứng then chốt', cls: 'bg-red-950/90 text-red-200 border-red-700/60' },
  quan_trong: { text: 'Quan trọng', cls: 'bg-amber-950/80 text-amber-200 border-amber-700/50' },
  bo_tro: { text: 'Bổ trợ', cls: 'bg-stone-900/90 text-stone-300 border-stone-600/50' },
  nhieu_gia: { text: 'Nghi vấn / Ngụy tạo', cls: 'bg-rose-950/90 text-rose-200 border-rose-500/70' },
  mat_vat: { text: 'Mật vật ẩn (Kết cục Bí mật)', cls: 'bg-purple-950/90 text-purple-200 border-purple-500/70' },
};

/** Angle & Zoom-aware 3D hotspot marker so back/bottom details reward genuine 360° rotation */
const SmartHotspotMarker: React.FC<{
  hs: EvidenceHotspot;
  found: boolean;
  isSelected: boolean;
  onClick: () => void;
}> = ({ hs, found, isSelected, onClick }) => {
  const { camera } = useThree();
  const [visibleToInspect, setVisibleToInspect] = useState(found || !hs.faceHint || hs.faceHint === 'front');
  const [needsCloserZoom, setNeedsCloserZoom] = useState(false);

  useFrame(() => {
    if (found) {
      if (!visibleToInspect) setVisibleToInspect(true);
      if (needsCloserZoom) setNeedsCloserZoom(false);
      return;
    }

    const camPos = camera.position;
    const dist = camPos.length();
    let faceOk = true;
    if (hs.faceHint === 'back') faceOk = camPos.z < -0.35;
    else if (hs.faceHint === 'bottom') faceOk = camPos.y < -0.25;
    else if (hs.faceHint === 'side') faceOk = Math.abs(camPos.x) > 0.35 || camPos.z > 0.15;

    const zoomOk = !hs.requiresZoom || dist < 2.15;

    if (faceOk !== visibleToInspect) setVisibleToInspect(faceOk);
    if ((faceOk && !zoomOk) !== needsCloserZoom) setNeedsCloserZoom(faceOk && !zoomOk);
  });

  if (!visibleToInspect) return null;

  return (
    <Html position={hs.position} center distanceFactor={3.5} zIndexRange={[10, 0]}>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (needsCloserZoom) return;
          onClick();
        }}
        title={needsCloserZoom ? 'Cuộn chuột phóng to gần hơn để soi chi tiết này' : hs.label}
        className={`group relative flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${
          found
            ? isSelected
              ? 'bg-emerald-700/90 border-emerald-300 scale-115 shadow-[0_0_16px_rgba(52,211,153,0.9)]'
              : 'bg-emerald-950/85 border-emerald-500/80 hover:scale-110'
            : needsCloserZoom
            ? 'bg-amber-950/80 border-amber-400/70 opacity-80'
            : 'bg-red-900/85 border-amber-300 animate-pulse hover:scale-120 shadow-[0_0_18px_rgba(220,38,38,0.85)]'
        }`}
      >
        {found ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
        ) : needsCloserZoom ? (
          <ZoomIn className="w-4 h-4 text-amber-300" />
        ) : (
          <Eye className="w-4 h-4 text-amber-200" />
        )}
        <span className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 whitespace-nowrap bg-black/90 border border-[#6e4c32] px-2 py-0.5 rounded text-[11px] text-[#efe4cc]">
          {found ? hs.label : needsCloserZoom ? 'Phóng to gần hơn để soi rõ' : 'Kiểm tra chi tiết ẩn'}
        </span>
      </button>
    </Html>
  );
};

export const InspectModal: React.FC<InspectModalProps> = ({ evidence }) => {
  const closeInspect = useGameStore((s) => s.closeInspect);
  const discoverHotspot = useGameStore((s) => s.discoverHotspot);
  const narrative = useGameStore((s) => s.narrative);
  const progress = useGameStore((s) => s.progressByLevel[evidence.levelId]);
  const discoveredIds = progress?.discoveredHotspotIds ?? [];

  const [selectedHotspot, setSelectedHotspot] = useState<EvidenceHotspot | null>(null);

  const discoveredCount = evidence.hotspots.filter((h) => discoveredIds.includes(h.id)).length;
  const importance = IMPORTANCE_LABELS[evidence.importance];
  const extraNotes = getActiveEvidenceNotes(evidence.id, narrative);
  const hasHiddenBackOrBottom = evidence.hotspots.some(
    (h) => !discoveredIds.includes(h.id) && (h.faceHint === 'back' || h.faceHint === 'bottom')
  );

  const handleClickHotspot = (hs: EvidenceHotspot) => {
    discoverHotspot(evidence.id, hs.id);
    setSelectedHotspot(hs);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
    >
      <div className="relative w-full max-w-5xl h-[86vh] bg-[#0e0b09]/95 border border-[#5c3e26]/70 rounded-lg shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col md:flex-row">
        <button
          onClick={closeInspect}
          className="absolute top-4 right-4 z-30 flex items-center gap-1.5 px-3 py-1.5 bg-[#1b1410] hover:bg-red-950/80 border border-[#6e4c32]/70 text-[#e5dcc5] text-xs tracking-wider uppercase rounded transition cursor-pointer"
        >
          <X className="w-4 h-4" />
          Đóng (ESC)
        </button>

        {/* Left / Center: Interactive 3D Object Viewport */}
        <div className="relative flex-1 h-[55%] md:h-full bg-gradient-to-b from-[#17120e] via-[#0c0907] to-[#080605]">
          <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col gap-1.5">
            <span className="text-[11px] uppercase tracking-[0.22em] text-red-400/90 font-semibold">
              Kiểm tra vật chứng 3D
            </span>
            <h2 className="font-display-vn text-2xl md:text-3xl text-[#efe4cc] drop-shadow">
              {evidence.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[11px] px-2.5 py-0.5 rounded border ${importance.cls}`}>
                {importance.text}
              </span>
              <span className="text-xs text-[#a89b84]">Vị trí: {evidence.locationName}</span>
            </div>
          </div>

          <Canvas
            camera={{ position: [0, 0.35, 2.35], fov: 40 }}
            dpr={[1, 2]}
            gl={{ toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
          >
            <color attach="background" args={['#0b0907']} />
            <ambientLight intensity={0.7} color="#d6c4a5" />
            <spotLight position={[3, 4, 3]} intensity={26} angle={0.6} penumbra={0.7} color="#ffe7c2" />
            <spotLight position={[-3, -2, -2]} intensity={14} color="#8c2d2d" />
            <pointLight position={[0, 2, 2]} intensity={4} color="#fff4dc" />

            <group scale={1.35}>
              <EvidenceModel type={evidence.modelType} />

              {evidence.hotspots.map((hs) => (
                <SmartHotspotMarker
                  key={hs.id}
                  hs={hs}
                  found={discoveredIds.includes(hs.id)}
                  isSelected={selectedHotspot?.id === hs.id}
                  onClick={() => handleClickHotspot(hs)}
                />
              ))}
            </group>

            <ContactShadows position={[0, -0.95, 0]} opacity={0.45} blur={2.4} scale={5} />
            <OrbitControls
              enablePan={false}
              minDistance={1.1}
              maxDistance={3.8}
              rotateSpeed={0.85}
              zoomSpeed={0.9}
            />
          </Canvas>

          {/* Bottom Controls Hint */}
          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[#b7aa92] pointer-events-none">
            <div className="flex flex-wrap items-center gap-4 bg-black/65 border border-[#4a3525]/60 px-3 py-1.5 rounded">
              <span className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-amber-400" />
                Kéo chuột xoay 360°
              </span>
              <span className="flex items-center gap-1.5">
                <ZoomIn className="w-3.5 h-3.5 text-amber-400" />
                Cuộn phóng to để soi chữ khắc
              </span>
              {hasHiddenBackOrBottom && (
                <span className="text-amber-300 font-medium">
                  • Có dấu vết ẩn ở mặt sau / mặt đáy!
                </span>
              )}
            </div>
            <div className="bg-black/65 border border-red-900/60 px-3 py-1.5 rounded text-amber-200">
              Chi tiết đã soi: <strong>{discoveredCount}/{evidence.hotspots.length}</strong>
            </div>
          </div>
        </div>

        {/* Right Panel: Lore, Details & Discovered Annotations */}
        <div className="w-full md:w-[355px] h-[45%] md:h-full border-t md:border-t-0 md:border-l border-[#4f3622]/70 bg-[#120e0b] p-5 flex flex-col overflow-y-auto">
          <div className="mb-4 pt-6 md:pt-8">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#a38b6b] mb-2">
              Mô tả vật chứng
            </h3>
            <p className="text-sm leading-relaxed text-[#dfd4bc]">{evidence.fullDesc}</p>
          </div>

          {/* Active NG+ & Moral-Choice-Reactive Secret Notes */}
          {extraNotes.length > 0 && (
            <div className="mb-4 space-y-2">
              {extraNotes.map((note) => (
                <div
                  key={note.id}
                  className="p-3 rounded bg-amber-950/35 border border-amber-700/60 text-xs space-y-1"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-amber-300">
                    <BookMarked className="w-3.5 h-3.5" />
                    Ghi chú đặc biệt ({note.tag})
                  </div>
                  <p className="text-[#efe4cc] leading-relaxed">{note.text}</p>
                </div>
              ))}
            </div>
          )}

          <div className="border-t border-[#3b291c] pt-4 flex-1">
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#a38b6b] mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-red-400" />
              Điểm bất thường ({discoveredCount}/{evidence.hotspots.length})
            </h3>

            <div className="space-y-2.5">
              {evidence.hotspots.map((hs, idx) => {
                const found = discoveredIds.includes(hs.id);
                const active = selectedHotspot?.id === hs.id;
                const faceLabel =
                  hs.faceHint === 'back'
                    ? 'mặt sau'
                    : hs.faceHint === 'bottom'
                    ? 'mặt đáy'
                    : hs.faceHint === 'side'
                    ? 'cạnh bên'
                    : 'mặt trước';
                return (
                  <div
                    key={hs.id}
                    onClick={() => found && setSelectedHotspot(hs)}
                    className={`p-3 rounded border transition ${
                      found
                        ? active
                          ? 'bg-red-950/35 border-red-700/80 cursor-pointer'
                          : 'bg-[#1a1410] border-[#4f3a29] hover:border-amber-700/70 cursor-pointer'
                        : 'bg-[#110d0a] border-[#2c2119] opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-[#ede2ca]">
                        {found ? hs.label : `Chi tiết ẩn #${idx + 1}`}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded ${
                          found ? 'bg-emerald-950 text-emerald-300' : 'bg-stone-900 text-stone-400'
                        }`}
                      >
                        {found ? 'Đã rõ' : 'Chưa soi'}
                      </span>
                    </div>
                    {found ? (
                      <p className="text-xs text-[#c7baa2] mt-1.5 leading-relaxed">
                        {hs.discoveryText}
                      </p>
                    ) : (
                      <p className="text-[11px] italic text-[#877a66] mt-1">
                        Hãy xoay kiểm tra {faceLabel}
                        {hs.requiresZoom ? ' và phóng to gần hơn' : ''} để phát hiện điểm phát sáng.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {selectedHotspot && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 p-3 rounded bg-red-950/40 border border-red-800/70 text-xs text-amber-100"
              >
                <div className="font-semibold text-red-300 mb-1">
                  Đã ghi vào Sổ điều tra: {selectedHotspot.label}
                </div>
                <p className="leading-relaxed text-[#e8dec8]">{selectedHotspot.discoveryText}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
