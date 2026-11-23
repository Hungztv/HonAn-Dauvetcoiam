import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  RotateCcw,
  Layers,
  Settings,
  Info,
  Lock,
  CheckCircle2,
  X,
  Volume2,
  Mouse,
  Monitor,
} from 'lucide-react';
import { LEVELS } from '../data/levels';
import { useGameStore } from '../store/gameStore';
import { horrorAudio } from '../audio/horrorAudio';

/** Live 3D haunted Vietnamese ancestral house diorama in mist for the Main Menu backdrop */
const HauntedMenuDiorama: React.FC = () => {
  const lampRef = useRef<THREE.PointLight | null>(null);
  const camGroup = useRef<THREE.Group | null>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (lampRef.current) {
      lampRef.current.intensity = 6.5 + Math.sin(t * 7.5) * 0.9 + Math.sin(t * 17) * 0.4;
    }
    if (camGroup.current) {
      camGroup.current.rotation.y = Math.sin(t * 0.14) * 0.16;
    }
  });

  return (
    <>
      <color attach="background" args={['#060506']} />
      <fog attach="fog" args={['#090707', 4, 18]} />
      <ambientLight intensity={0.25} color="#768499" />
      <directionalLight position={[6, 10, 5]} intensity={0.45} color="#8ba3c4" />

      <group ref={camGroup} position={[1.4, -1.1, -3.5]}>
        {/* Misty village ground */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[28, 28]} />
          <meshStandardMaterial color="#171410" roughness={0.95} />
        </mesh>

        {/* Traditional 3-compartment wooden house silhouette */}
        <mesh position={[0, 1.4, -2]}>
          <boxGeometry args={[6.4, 2.8, 3.6]} />
          <meshStandardMaterial color="#241710" roughness={0.9} />
        </mesh>
        {/* Pitched dark terracotta roof */}
        <mesh position={[0, 3.45, -2]} rotation={[0, Math.PI / 4, 0]}>
          <coneGeometry args={[5.2, 1.9, 4]} />
          <meshStandardMaterial color="#2e1813" roughness={0.92} />
        </mesh>
        {/* Glowing crimson doorway / window */}
        <mesh position={[0, 1.15, -0.18]}>
          <planeGeometry args={[1.15, 2.1]} />
          <meshStandardMaterial color="#4a0f0f" emissive="#8f1d1d" emissiveIntensity={1.4} />
        </mesh>
        {/* Flickering red lantern hanging on porch */}
        <mesh position={[-1.4, 2.1, -0.05]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshStandardMaterial color="#b91c1c" emissive="#dc2626" emissiveIntensity={2.2} />
        </mesh>
        <pointLight ref={lampRef} position={[-1.4, 2.0, 0.3]} color="#ea580c" intensity={6.5} distance={11} />

        {/* Stone well silhouette in front yard */}
        <mesh position={[2.6, 0.45, 1.2]}>
          <cylinderGeometry args={[0.72, 0.78, 0.9, 14]} />
          <meshStandardMaterial color="#2c2b29" roughness={0.95} />
        </mesh>

        {/* Bamboo silhouettes */}
        {[-4.4, -3.9, 4.1, 4.7].map((x, idx) => (
          <mesh key={idx} position={[x, 2.8, -0.5 + idx * 0.4]}>
            <cylinderGeometry args={[0.07, 0.09, 5.6, 8]} />
            <meshStandardMaterial color="#192116" roughness={0.9} />
          </mesh>
        ))}

        <Sparkles count={75} scale={[14, 5, 12]} position={[0, 2, 0]} size={2} speed={0.22} opacity={0.35} color="#d6c5a3" />
      </group>
    </>
  );
};

export const MainMenu: React.FC = () => {
  const hasSaveData = useGameStore((s) => s.hasSaveData);
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const unlockedLevelIds = useGameStore((s) => s.unlockedLevelIds);
  const progressByLevel = useGameStore((s) => s.progressByLevel);
  const settings = useGameStore((s) => s.settings);

  const startNewGame = useGameStore((s) => s.startNewGame);
  const continueGame = useGameStore((s) => s.continueGame);
  const selectLevel = useGameStore((s) => s.selectLevel);
  const updateSettings = useGameStore((s) => s.updateSettings);

  const [subModal, setSubModal] = useState<'none' | 'chapters' | 'settings' | 'credits'>('none');

  const handleClickSound = () => {
    horrorAudio.init();
    horrorAudio.playClick();
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#060506]">
      {/* Live 3D Misty House Background */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 1.35, 5.2], fov: 46 }}>
          <HauntedMenuDiorama />
        </Canvas>
      </div>

      {/* Atmospheric Dark Gradient Scrim */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070505]/92 via-[#090606]/70 to-transparent" />
      <div className="horror-grain absolute inset-0 opacity-40 pointer-events-none" />

      {/* Main Menu Navigation Column */}
      <div className="relative z-10 h-full flex flex-col justify-between p-8 md:p-14 max-w-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-red-400/90 border-b border-red-900/60 pb-1.5">
            <span>Trinh Thám Kinh Dị Dân Gian Việt Nam</span>
          </div>
          <h1 className="font-display-vn text-5xl md:text-7xl font-bold tracking-wider text-[#f2e8d2] drop-shadow-[0_4px_24px_rgba(127,29,29,0.65)] flicker-subtle">
            HỒN ÁN
          </h1>
          <p className="font-serif-vn text-xl md:text-2xl italic text-red-300/90 tracking-widest">
            DẤU VẾT CÕI ÂM
          </p>
        </div>

        <nav className="flex flex-col gap-3 max-w-xs">
          {hasSaveData && (
            <button
              onClick={() => {
                handleClickSound();
                continueGame();
              }}
              className="group flex items-center justify-between px-5 py-3.5 rounded bg-red-950/85 hover:bg-red-900 border border-red-700/80 text-[#f7eedb] transition cursor-pointer shadow-lg"
            >
              <span className="flex items-center gap-3 font-semibold tracking-wider uppercase text-sm">
                <Play className="w-4 h-4 fill-current text-amber-300" />
                Tiếp Tục (Án 0{currentLevelId})
              </span>
              <span className="text-[11px] text-amber-200/80 group-hover:translate-x-1 transition">→</span>
            </button>
          )}

          <button
            onClick={() => {
              handleClickSound();
              startNewGame();
            }}
            className="group flex items-center justify-between px-5 py-3.5 rounded bg-[#18120e]/90 hover:bg-[#291b14] border border-[#614229]/80 text-[#efe4cc] transition cursor-pointer"
          >
            <span className="flex items-center gap-3 font-medium tracking-wider uppercase text-sm">
              <RotateCcw className="w-4 h-4 text-red-400" />
              Trò Chơi Mới
            </span>
          </button>

          <button
            onClick={() => {
              handleClickSound();
              setSubModal('chapters');
            }}
            className="flex items-center gap-3 px-5 py-3 rounded bg-[#140f0c]/85 hover:bg-[#241912] border border-[#4a3322]/75 text-[#dfd4bc] text-sm uppercase tracking-wider transition cursor-pointer"
          >
            <Layers className="w-4 h-4 text-amber-400" />
            Chọn Chương ({unlockedLevelIds.length}/5)
          </button>

          <button
            onClick={() => {
              handleClickSound();
              setSubModal('settings');
            }}
            className="flex items-center gap-3 px-5 py-3 rounded bg-[#140f0c]/85 hover:bg-[#241912] border border-[#4a3322]/75 text-[#dfd4bc] text-sm uppercase tracking-wider transition cursor-pointer"
          >
            <Settings className="w-4 h-4 text-[#b5a48b]" />
            Cài Đặt
          </button>

          <button
            onClick={() => {
              handleClickSound();
              setSubModal('credits');
            }}
            className="flex items-center gap-3 px-5 py-3 rounded bg-[#140f0c]/85 hover:bg-[#241912] border border-[#4a3322]/75 text-[#dfd4bc] text-sm uppercase tracking-wider transition cursor-pointer"
          >
            <Info className="w-4 h-4 text-[#b5a48b]" />
            Giới Thiệu & Đội Ngũ
          </button>
        </nav>

        <div className="text-[11px] text-[#8f816c] space-y-1">
          <p>Khuyến nghị đeo tai nghe để trải nghiệm âm thanh 3D kinh dị tâm lý.</p>
          <p className="text-[#6b6050]">3D First-Person Investigation • 5 Vụ Án • Giải Đố 3 Tầng</p>
        </div>
      </div>

      {/* Sub-modals: Chapter Select / Settings / Credits */}
      <AnimatePresence>
        {subModal !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          >
            <div className="w-full max-w-3xl max-h-[85vh] bg-[#120e0b] border border-[#614229] rounded-lg shadow-2xl flex flex-col overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 bg-[#1a130e] border-b border-[#4a321f]">
                <h2 className="font-display-vn text-2xl text-[#efe4cc]">
                  {subModal === 'chapters' && 'Chọn Chương Điều Tra'}
                  {subModal === 'settings' && 'Cài Đặt Hệ Thống'}
                  {subModal === 'credits' && 'HỒN ÁN — Giới Thiệu'}
                </h2>
                <button
                  onClick={() => setSubModal('none')}
                  className="p-1.5 rounded bg-[#241a13] hover:bg-red-950 text-[#efe4cc] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-3">
                {subModal === 'chapters' && (
                  <>
                    <div className="flex items-center justify-between text-xs text-[#a89a82] mb-2">
                      <span>Hoàn thành từng vụ án để mở khóa chương tiếp theo, hoặc mở nhanh để trải nghiệm tự do.</span>
                      {unlockedLevelIds.length < LEVELS.length && (
                        <button
                          onClick={() => {
                            useGameStore.setState({ unlockedLevelIds: [1, 2, 3, 4, 5] });
                            useGameStore.getState().saveToStorage();
                          }}
                          className="text-amber-300 hover:underline cursor-pointer shrink-0 ml-3"
                        >
                          Mở khóa tất cả 5 chương
                        </button>
                      )}
                    </div>
                    {LEVELS.map((lvl) => {
                      const unlocked = unlockedLevelIds.includes(lvl.id);
                      const completed = progressByLevel[lvl.id]?.completed;
                      return (
                        <div
                          key={lvl.id}
                          className={`p-4 rounded border flex items-center justify-between gap-4 ${
                            unlocked
                              ? 'bg-[#1a1410] border-[#523925]'
                              : 'bg-[#110d0a] border-[#2c2119] opacity-60'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2 text-xs text-red-400">
                              <span>{lvl.code}</span>
                              {completed && (
                                <span className="flex items-center gap-1 text-emerald-400">
                                  <CheckCircle2 className="w-3.5 h-3.5" /> Đã phá án
                                </span>
                              )}
                            </div>
                            <h3 className="font-serif-vn text-xl text-[#efe4cc] font-semibold">
                              {lvl.title}
                            </h3>
                            <p className="text-xs text-[#b5a78e] mt-0.5">{lvl.subtitle}</p>
                          </div>
                          {unlocked ? (
                            <button
                              onClick={() => {
                                handleClickSound();
                                selectLevel(lvl.id, false);
                              }}
                              className="shrink-0 px-4 py-2 rounded bg-red-900 hover:bg-red-800 text-xs uppercase tracking-wider text-white font-semibold cursor-pointer"
                            >
                              Vào hiện trường
                            </button>
                          ) : (
                            <div className="shrink-0 flex items-center gap-1.5 text-xs text-stone-500">
                              <Lock className="w-4 h-4" /> Chưa mở
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </>
                )}

                {subModal === 'settings' && (
                  <div className="space-y-5 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 text-[#dfd4bc]">
                        <Volume2 className="w-4 h-4 text-amber-400" />
                        Âm lượng tổng ({Math.round(settings.masterVolume * 100)}%)
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={settings.masterVolume}
                        onChange={(e) => updateSettings({ masterVolume: parseFloat(e.target.value) })}
                        className="w-48 accent-red-700"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 text-[#dfd4bc]">
                        <Mouse className="w-4 h-4 text-amber-400" />
                        Độ nhạy chuột ({settings.mouseSensitivity.toFixed(1)}x)
                      </label>
                      <input
                        type="range"
                        min={0.4}
                        max={2.2}
                        step={0.1}
                        value={settings.mouseSensitivity}
                        onChange={(e) => updateSettings({ mouseSensitivity: parseFloat(e.target.value) })}
                        className="w-48 accent-red-700"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <label className="flex items-center gap-2 text-[#dfd4bc]">
                        <Monitor className="w-4 h-4 text-amber-400" />
                        Chất lượng đổ bóng 3D
                      </label>
                      <select
                        value={settings.graphicsQuality}
                        onChange={(e) =>
                          updateSettings({ graphicsQuality: e.target.value as 'high' | 'medium' })
                        }
                        className="bg-[#1d1510] border border-[#593d27] rounded px-3 py-1.5 text-xs text-[#efe4cc]"
                      >
                        <option value="high">Cao (Đổ bóng đèn pin động)</option>
                        <option value="medium">Trung bình (Tối ưu FPS)</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-[#dfd4bc]">Hiển thị mục tiêu trên HUD</label>
                      <input
                        type="checkbox"
                        checked={settings.showHints}
                        onChange={(e) => updateSettings({ showHints: e.target.checked })}
                        className="w-4 h-4 accent-red-700"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <label className="text-[#dfd4bc]">Bật tình huống Jumpscare</label>
                      <input
                        type="checkbox"
                        checked={settings.enableJumpscares}
                        onChange={(e) => updateSettings({ enableJumpscares: e.target.checked })}
                        className="w-4 h-4 accent-red-700"
                      />
                    </div>
                  </div>
                )}

                {subModal === 'credits' && (
                  <div className="space-y-4 text-sm text-[#d9ceb6] leading-relaxed">
                    <p>
                      <strong className="text-amber-200">HỒN ÁN – DẤU VẾT CÕI ÂM</strong> là trò chơi trinh thám kinh dị góc nhìn thứ nhất 3D lấy cảm hứng từ kiến trúc, tín ngưỡng và văn hóa dân gian Việt Nam.
                    </p>
                    <div className="p-4 rounded bg-[#1a1410] border border-[#4a3322] text-xs space-y-1.5">
                      <div>• <strong>Engine 3D:</strong> React + TypeScript + Three.js + React Three Fiber & Drei</div>
                      <div>• <strong>Âm thanh 3D:</strong> Web Audio API HRTF Positional Audio (Tổng hợp thủ công tiếng mõ, chuông chùa, gió, bước chân, hát ru ngũ cung)</div>
                      <div>• <strong>Cơ chế cốt lõi:</strong> Di chuyển First Person, Kiểm tra vật chứng xoay 360° có điểm tương tác ẩn, Sổ điều tra & Bảng kết nối chỉ đỏ, Giải đố 3 Tầng xuyên suốt 5 Vụ Án.</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
