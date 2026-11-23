import React, { useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { AnimatePresence } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import { getLevelById } from './data/levels';
import { LevelEnvironment } from './three/LevelEnvironment';
import { FirstPersonController } from './three/FirstPersonController';
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
      horrorAudio.setMasterVolume(settings.masterVolume);
      horrorAudio.startAmbient(level.ambientTheme);
    }
    const canvas = canvasContainerRef.current?.querySelector('canvas');
    if (canvas && document.pointerLockElement !== canvas) {
      try {
        const res = canvas.requestPointerLock?.() as unknown as Promise<void> | undefined;
        if (res && typeof res.catch === 'function') {
          res.catch(() => {
            // Safely ignore pointer lock rejection (e.g. embedded webview or rapid ESC)
          });
        }
      } catch {
        // Ignore synchronous pointer lock errors
      }
    }
  }, [level, settings.masterVolume]);

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

  return (
    <div ref={canvasContainerRef} className="relative w-full h-full bg-[#060505] overflow-hidden">
      {/* Main 3D First-Person World Canvas */}
      <Canvas
        shadows={settings.graphicsQuality === 'high'}
        camera={{ fov: 68, near: 0.1, far: 80 }}
        dpr={settings.graphicsQuality === 'high' ? [1, 2] : [1, 1.25]}
        onClick={() => {
          if (overlay === 'none') {
            requestLock();
          }
        }}
      >
        <LevelEnvironment level={level} />
        <FirstPersonController level={level} />
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
