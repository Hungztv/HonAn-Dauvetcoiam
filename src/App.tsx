import React, { useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { getLevelById } from './data/levels';
import { LevelEnvironment } from './three/LevelEnvironment';
import { FirstPersonController } from './three/FirstPersonController';
import { HorrorPostProcessing } from './three/HorrorPostProcessing';
import { QUALITY_PROFILES } from './three/AssetPipeline';
import { MainMenu } from './components/MainMenu';
import { HUD } from './components/HUD';
import { InspectModal } from './components/InspectModal';
import { InvestigationJournal } from './components/InvestigationJournal';
import { InventoryModal } from './components/InventoryModal';
import { PuzzleModal } from './components/PuzzleModal';
import { PauseMenu } from './components/PauseMenu';
import { JumpscareOverlay } from './components/JumpscareOverlay';
import { ChapterIntro, LevelCompleteModal, GrandEndingScreen } from './components/StoryScreens';
import { horrorAudio } from './audio/horrorAudio';

export function App() {
  const screen = useGameStore((s) => s.screen);
  const overlay = useGameStore((s) => s.overlay);
  const currentLevelId = useGameStore((s) => s.currentLevelId);
  const inspectingEvidenceId = useGameStore((s) => s.inspectingEvidenceId);
  const activePuzzleId = useGameStore((s) => s.activePuzzleId);
  const settings = useGameStore((s) => s.settings);

  const canvasContainerRef = useRef<HTMLDivElement | null>(null);
  const level = getLevelById(currentLevelId);

  const requestLock = useCallback(() => {
    horrorAudio.init();
    if (level) {
      horrorAudio.applyVolumes(settings.masterVolume, settings.musicVolume, settings.sfxVolume);
      horrorAudio.startAmbient(level.ambientTheme);
    }
    const canvas = canvasContainerRef.current?.querySelector('canvas');
    if (canvas && document.pointerLockElement !== canvas) {
      try {
        const res = canvas.requestPointerLock?.() as unknown as Promise<void> | undefined;
        if (res && typeof res.catch === 'function') {
          res.catch(() => {});
        }
      } catch {
        // Ignore synchronous pointer lock errors
      }
    }
  }, [level, settings.masterVolume, settings.musicVolume, settings.sfxVolume]);

  if (screen === 'menu' || !level) {
    return <MainMenu />;
  }

  if (screen === 'chapter_intro') {
    return <ChapterIntro level={level} />;
  }

  if (screen === 'level_complete') {
    return <LevelCompleteModal level={level} />;
  }

  if (screen === 'ending') {
    return <GrandEndingScreen level={level} />;
  }

  const inspectingEvidence = inspectingEvidenceId
    ? level.evidences.find((e) => e.id === inspectingEvidenceId) ?? null
    : null;

  const qualityProfile = QUALITY_PROFILES[settings.graphicsQuality];
  const effectiveDpr = Math.max(0.6, Math.min(2.0, qualityProfile.dprMax * settings.resolutionScale));

  return (
    <div ref={canvasContainerRef} className="relative w-full h-full bg-[#060505] overflow-hidden">
      {/* Main 3D First-Person World Canvas with Unity-style ACES Filmic Tone Mapping & Post-FX */}
      <Canvas
        shadows={qualityProfile.shadowsEnabled}
        camera={{ fov: 68, near: 0.1, far: 85 }}
        dpr={[Math.min(0.85, effectiveDpr), effectiveDpr]}
        gl={{
          antialias: settings.graphicsQuality !== 'low',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.12,
          powerPreference: 'high-performance',
        }}
        onClick={() => {
          if (overlay === 'none') {
            requestLock();
          }
        }}
      >
        <LevelEnvironment level={level} />
        <FirstPersonController level={level} />
        <HorrorPostProcessing />
      </Canvas>

      {/* In-game HUD */}
      <HUD level={level} onRequestLock={requestLock} />

      {/* Cinematic Horror Jumpscare Overlay */}
      <JumpscareOverlay />

      {/* Active Interactive Overlays */}
      <AnimatePresence>
        {overlay === 'inspect' && inspectingEvidence && (
          <InspectModal key="inspect" evidence={inspectingEvidence} />
        )}
        {overlay === 'journal' && (
          <InvestigationJournal key="journal" level={level} />
        )}
        {overlay === 'inventory' && (
          <InventoryModal key="inventory" level={level} />
        )}
        {overlay === 'puzzle' && activePuzzleId && (
          <PuzzleModal key="puzzle" level={level} puzzleId={activePuzzleId} />
        )}
        {overlay === 'pause' && <PauseMenu key="pause" />}
      </AnimatePresence>
    </div>
  );
}

export default App;
