import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import { JumpscareVariant } from '../types/game';

const JumpscareArt: React.FC<{ variant: JumpscareVariant }> = ({ variant }) => {
  if (variant === 'pale_bride') {
    // Oan hồn áo đỏ / cô gái giếng nước — pale sunken face, pitch-black hollow eyes, wet black hair, crimson collar
    return (
      <svg viewBox="0 0 600 600" className="w-[82vmin] h-[82vmin] drop-shadow-[0_0_55px_rgba(185,28,28,0.95)]">
        <defs>
          <radialGradient id="paleSkin" cx="50%" cy="46%" r="50%">
            <stop offset="0%" stopColor="#d8d4c8" />
            <stop offset="68%" stopColor="#8d8a80" />
            <stop offset="100%" stopColor="#1b1817" />
          </radialGradient>
        </defs>
        {/* Tangled long wet black hair shroud */}
        <path
          d="M110,590 C70,380 85,120 185,60 C250,20 355,20 420,65 C515,130 535,380 495,590 Z"
          fill="#070607"
        />
        {/* Crimson áo dài collar */}
        <path d="M175,585 L255,440 L345,440 L425,585 Z" fill="#590909" />
        {/* Pale gaunt face */}
        <ellipse cx="300" cy="270" rx="115" ry="155" fill="url(#paleSkin)" />
        {/* Hair strands across forehead */}
        <path d="M210,130 Q225,220 198,320 M255,112 Q245,190 258,240 M360,118 Q385,210 398,330 M325,112 Q342,175 330,220" stroke="#080707" strokeWidth="10" fill="none" strokeLinecap="round" />
        {/* Hollow pitch-black eye sockets with tiny pinprick crimson pupils */}
        <ellipse cx="248" cy="245" rx="34" ry="25" fill="#040304" />
        <ellipse cx="352" cy="245" rx="34" ry="25" fill="#040304" />
        <circle cx="250" cy="246" r="3.5" fill="#ef4444" />
        <circle cx="350" cy="246" r="3.5" fill="#ef4444" />
        {/* Tears of blood */}
        <path d="M244,268 Q236,315 246,365 M356,268 Q364,322 352,374" stroke="#7f1d1d" strokeWidth="9" fill="none" strokeLinecap="round" />
        {/* Screaming gaping mouth */}
        <ellipse cx="300" cy="355" rx="44" ry="62" fill="#060303" />
        <path d="M262,330 Q300,342 338,330" stroke="#a69f90" strokeWidth="5" fill="none" />
      </svg>
    );
  }

  if (variant === 'statue_face') {
    // Tượng quan gỗ mắt máu trong Ngôi Đình Cổ
    return (
      <svg viewBox="0 0 600 600" className="w-[82vmin] h-[82vmin] drop-shadow-[0_0_55px_rgba(220,38,38,0.9)]">
        <defs>
          <radialGradient id="woodMask" cx="50%" cy="48%" r="52%">
            <stop offset="0%" stopColor="#9c7548" />
            <stop offset="65%" stopColor="#4f2c18" />
            <stop offset="100%" stopColor="#140b06" />
          </radialGradient>
        </defs>
        {/* Mandarinal wooden hat */}
        <path d="M120,165 L480,165 L435,65 L165,65 Z" fill="#170e09" stroke="#7c2d12" strokeWidth="5" />
        {/* Cracked carved wooden face */}
        <rect x="165" y="155" width="270" height="335" rx="115" fill="url(#woodMask)" stroke="#1a0d06" strokeWidth="8" />
        {/* Deep jagged wood cracks glowing dark red */}
        <path d="M295,158 L280,235 L312,295 L292,390 L306,485" stroke="#991b1b" strokeWidth="6" fill="none" />
        <path d="M190,280 L255,310 L215,380" stroke="#450a0a" strokeWidth="5" fill="none" />
        {/* Staring carved wooden eyes snapping wide open */}
        <ellipse cx="242" cy="268" rx="38" ry="22" fill="#090504" />
        <ellipse cx="358" cy="268" rx="38" ry="22" fill="#090504" />
        <circle cx="242" cy="268" r="11" fill="#dc2626" />
        <circle cx="358" cy="268" r="11" fill="#dc2626" />
        <circle cx="242" cy="268" r="4" fill="#fef08a" />
        <circle cx="358" cy="268" r="4" fill="#fef08a" />
        {/* Rigid grimace */}
        <path d="M225,388 Q300,350 375,388 Q300,435 225,388 Z" fill="#0b0504" />
      </svg>
    );
  }

  if (variant === 'faceless_ferryman') {
    // Người lái đò nón lá rách không khuôn mặt
    return (
      <svg viewBox="0 0 600 600" className="w-[84vmin] h-[84vmin] drop-shadow-[0_0_60px_rgba(153,27,27,0.85)]">
        {/* Tattered conical hat (Nón lá rách) */}
        <polygon points="300,35 45,250 555,250" fill="#2e2418" stroke="#0d0a07" strokeWidth="8" />
        <path d="M120,250 L105,280 M475,250 L495,285 M220,250 L215,270" stroke="#1c150d" strokeWidth="7" />
        {/* Dark robe shoulders */}
        <path d="M110,590 C130,420 190,375 300,375 C410,375 470,420 490,590 Z" fill="#090809" />
        {/* Smooth eerie blank pale face under hat brim */}
        <ellipse cx="300" cy="315" rx="108" ry="135" fill="#cbc2ad" />
        {/* Shadow from hat brim */}
        <ellipse cx="300" cy="235" rx="115" ry="42" fill="#090807" opacity="0.88" />
        {/* Vertical pitch-black void rift splitting the blank face */}
        <path d="M300,220 C325,285 330,355 300,425 C270,355 275,285 300,220 Z" fill="#050203" />
        <path d="M300,235 L300,410" stroke="#b91c1c" strokeWidth="4" />
      </svg>
    );
  }

  // blood_hands — Bàn tay trắng bệch & vệt máu cào từ đáy giếng
  return (
    <svg viewBox="0 0 600 600" className="w-[88vmin] h-[88vmin] drop-shadow-[0_0_50px_rgba(127,29,29,0.95)]">
      {/* Clawed bloody drag streaks */}
      <path d="M140,80 L175,540 M220,60 L245,560 M365,65 L345,555 M445,85 L415,540" stroke="#7f1d1d" strokeWidth="18" strokeLinecap="round" opacity="0.8" />
      {/* Left lunging pale hand */}
      <g transform="translate(90,145) rotate(-14)">
        <path
          d="M55,340 L45,190 L22,95 L48,90 L75,175 L82,50 L112,52 L112,170 L132,58 L160,64 L145,180 L180,92 L205,105 L168,220 L155,340 Z"
          fill="#b8b2a6"
          stroke="#1c1614"
          strokeWidth="6"
        />
      </g>
      {/* Right lunging pale hand */}
      <g transform="translate(320,130) rotate(14)">
        <path
          d="M55,340 L45,190 L22,95 L48,90 L75,175 L82,50 L112,52 L112,170 L132,58 L160,64 L145,180 L180,92 L205,105 L168,220 L155,340 Z"
          fill="#ada79a"
          stroke="#1c1614"
          strokeWidth="6"
        />
      </g>
    </svg>
  );
};

export const JumpscareOverlay: React.FC = () => {
  const activeJumpscare = useGameStore((s) => s.activeJumpscare);

  return (
    <AnimatePresence>
      {activeJumpscare && (
        <motion.div
          key={activeJumpscare.startedAt}
          initial={{ opacity: 0, scale: 0.72 }}
          animate={{
            opacity: [0, 1, 0.35, 1, 0.85, 1, 0],
            scale: [0.75, 1.24, 1.15, 1.32, 1.18, 1.28, 1.4],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.92, times: [0, 0.08, 0.18, 0.3, 0.55, 0.78, 1] }}
          className="pointer-events-none fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/92 overflow-hidden jumpscare-shake"
        >
          {/* Red & white horror strobe flash */}
          <div className="absolute inset-0 bg-red-900/45 mix-blend-hard-light jumpscare-strobe" />

          {/* Apparition Graphic */}
          <div className="relative z-10 flex flex-col items-center">
            <JumpscareArt variant={activeJumpscare.variant} />
            <div className="mt-2 font-display-vn text-2xl md:text-4xl font-bold tracking-[0.2em] text-red-500 drop-shadow-[0_0_20px_rgba(220,38,38,1)] uppercase text-center px-6">
              {activeJumpscare.caption}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
