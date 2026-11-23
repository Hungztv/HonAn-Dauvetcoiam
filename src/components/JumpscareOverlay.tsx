import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';

/**
 * HỒN ÁN v4.5.2 – Pure Cinematic Edge Feedback Layer (ZERO 2D/SVG Ghost Art!)
 * All horror ghosts & jumpscares are rendered as real full-body 3D NPCs in the Three.js scene
 * via NPCBehaviorDirector & PhysicalJumpscareDirector.
 * This layer provides ONLY subtle peripheral vignette tension & horror caption feedback.
 */
export const JumpscareOverlay: React.FC = () => {
  const activePhysicalJumpscare = useGameStore((s) => s.activePhysicalJumpscare);
  const reduceFlashing = useGameStore((s) => s.settings.reduceFlashing);

  return (
    <AnimatePresence>
      {activePhysicalJumpscare && (
        <motion.div
          key={activePhysicalJumpscare.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.9, 0.7, 0] }}
          exit={{ opacity: 0 }}
          transition={{ duration: activePhysicalJumpscare.durationMs / 1000 }}
          className="pointer-events-none fixed inset-0 z-30 flex flex-col justify-end items-center pb-24"
          style={{
            boxShadow: reduceFlashing
              ? 'inset 0 0 110px rgba(127, 29, 29, 0.48)'
              : 'inset 0 0 165px rgba(153, 27, 27, 0.72)',
          }}
        >
          <div className="px-6 py-2.5 rounded bg-black/75 border border-red-900/75 shadow-2xl">
            <span className="font-display-vn text-xl md:text-3xl font-bold tracking-[0.16em] text-red-400 uppercase drop-shadow-[0_0_14px_rgba(220,38,38,0.8)]">
              {activePhysicalJumpscare.caption}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
