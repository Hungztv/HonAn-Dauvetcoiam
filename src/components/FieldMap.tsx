import React from 'react';
import { Compass } from 'lucide-react';
import { LevelData } from '../types/game';
import { useGameStore } from '../store/gameStore';

interface FieldMapProps {
  level: LevelData;
  /** Compact radar minimap for HUD vs full annotated architectural map inside Investigation Journal */
  compact?: boolean;
}

/**
 * Hand-drawn / Blueprint 2D Field Map for 56x56m – 64x64m Investigation Levels (v6.0).
 * Renders architectural walls, named zones, locked/open doors, hiding lockers, puzzle stations,
 * collected evidences, and live player position + heading cone.
 */
export const FieldMap: React.FC<FieldMapProps> = ({ level, compact = false }) => {
  const progress = useGameStore((s) => s.progressByLevel[level.id]);
  const activeHidingSpotId = useGameStore((s) => s.activeHidingSpotId);

  const playerPos = progress?.playerPosition ?? level.spawnPosition;
  const playerYaw = progress?.playerYaw ?? level.spawnYaw;
  const openDoorIds = progress?.openDoorIds ?? [];
  const collectedIds = progress?.collectedEvidenceIds ?? [];
  const currentTier = progress?.currentTier ?? 1;

  const { minX, maxX, minZ, maxZ } = level.bounds;
  const spanX = Math.max(1, maxX - minX);
  const spanZ = Math.max(1, maxZ - minZ);

  const toPctX = (x: number) => ((x - minX) / spanX) * 100;
  const toPctY = (z: number) => ((z - minZ) / spanZ) * 100;

  // Player heading in SVG degrees (yaw=0 looks along -Z, i.e. UP on the map!)
  const headingDeg = (-playerYaw * 180) / Math.PI;

  const structuralWalls = level.boxes.filter((b) => {
    if (!b.collidable) return false;
    const top = b.position[1] + b.size[1] / 2;
    return top >= 1.4;
  });

  if (compact) {
    return (
      <div className="pointer-events-auto w-44 h-44 rounded-lg bg-[#0b0e12]/85 border border-[#543c28]/85 shadow-2xl backdrop-blur-sm overflow-hidden relative">
        <div className="absolute top-1.5 left-2 right-2 z-10 flex items-center justify-between text-[9px] font-mono text-amber-200/90">
          <span className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-red-400" />
            BẢN ĐỒ [M]
          </span>
          <span className="text-[#9e907a]">BẮC ↑</span>
        </div>

        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Subtle coordinate grid */}
          <defs>
            <pattern id="minimapGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(168,154,130,0.08)" strokeWidth="0.4" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#minimapGrid)" />

          {/* Structural Walls */}
          {structuralWalls.map((w) => {
            const cx = toPctX(w.position[0]);
            const cy = toPctY(w.position[2]);
            const ww = Math.max(0.9, (w.size[0] / spanX) * 100);
            const wh = Math.max(0.9, (w.size[2] / spanZ) * 100);
            return (
              <rect
                key={w.id}
                x={cx - ww / 2}
                y={cy - wh / 2}
                width={ww}
                height={wh}
                fill="#6b5642"
                opacity={0.85}
              />
            );
          })}

          {/* Doors */}
          {level.doors.map((d) => {
            const isOpen = openDoorIds.includes(d.id);
            return (
              <circle
                key={d.id}
                cx={toPctX(d.position[0])}
                cy={toPctY(d.position[2])}
                r={1.8}
                fill={isOpen ? '#10b981' : '#ef4444'}
              />
            );
          })}

          {/* Hiding Spots */}
          {level.hidingSpots?.map((h) => (
            <rect
              key={h.id}
              x={toPctX(h.position[0]) - 1.2}
              y={toPctY(h.position[2]) - 1.2}
              width={2.4}
              height={2.4}
              fill={activeHidingSpotId === h.id ? '#38bdf8' : '#0284c7'}
            />
          ))}

          {/* Collected Evidences */}
          {level.evidences
            .filter((e) => collectedIds.includes(e.id))
            .map((e) => (
              <circle
                key={e.id}
                cx={toPctX(e.worldPosition[0])}
                cy={toPctY(e.worldPosition[2])}
                r={1.3}
                fill="#fbbf24"
              />
            ))}

          {/* Live Player Marker + FOV Cone */}
          <g transform={`translate(${toPctX(playerPos[0])}, ${toPctY(playerPos[2])}) rotate(${headingDeg})`}>
            <polygon points="0,0 -5,-12 5,-12" fill="rgba(251,191,36,0.22)" />
            <polygon points="0,-3.2 -2.4,2.6 2.4,2.6" fill="#fef08a" stroke="#b91c1c" strokeWidth="0.6" />
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-full">
      {/* Main Blueprint Map Canvas */}
      <div className="flex-1 min-h-[420px] rounded-lg border-2 border-[#4f3622] bg-[#0d1014] relative overflow-hidden p-3">
        <div className="absolute top-3 left-4 z-10 text-[11px] font-mono text-amber-200/90 bg-black/65 px-2.5 py-1 rounded border border-[#4f3622]">
          SƠ ĐỒ KIẾN TRÚC HIỆN TRƯỜNG ({Math.round(spanX)}m × {Math.round(spanZ)}m) • BẮC ↑
        </div>

        <svg viewBox="0 0 100 100" className="w-full h-full max-h-[62vh]">
          <defs>
            <pattern id="fullMapGrid" width="5" height="5" patternUnits="userSpaceOnUse">
              <path d="M 5 0 L 0 0 0 5" fill="none" stroke="rgba(212,166,68,0.08)" strokeWidth="0.25" />
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#fullMapGrid)" />

          {/* Architectural Walls */}
          {structuralWalls.map((w) => {
            const cx = toPctX(w.position[0]);
            const cy = toPctY(w.position[2]);
            const ww = Math.max(0.7, (w.size[0] / spanX) * 100);
            const wh = Math.max(0.7, (w.size[2] / spanZ) * 100);
            return (
              <rect
                key={w.id}
                x={cx - ww / 2}
                y={cy - wh / 2}
                width={ww}
                height={wh}
                fill="#7c6248"
                opacity={0.9}
              />
            );
          })}

          {/* Zone Labels */}
          {level.mapZones?.map((z) => (
            <g key={z.id} transform={`translate(${toPctX(z.x)}, ${toPctY(z.z)})`}>
              <circle r={0.9} fill={z.isSecret ? '#c084fc' : '#d4a644'} opacity={0.85} />
              <text
                y={-1.6}
                textAnchor="middle"
                fill={z.isSecret ? '#e9d5ff' : '#efe4cc'}
                fontSize="2.35"
                fontWeight="600"
              >
                {z.name}
              </text>
            </g>
          ))}

          {/* Doors */}
          {level.doors.map((d) => {
            const isOpen = openDoorIds.includes(d.id);
            return (
              <g key={d.id} transform={`translate(${toPctX(d.position[0])}, ${toPctY(d.position[2])})`}>
                <rect
                  x={-1.6}
                  y={-1.6}
                  width={3.2}
                  height={3.2}
                  rx={0.5}
                  fill={isOpen ? '#10b981' : '#ef4444'}
                  stroke="#000"
                  strokeWidth={0.35}
                />
              </g>
            );
          })}

          {/* Puzzle Stations */}
          {level.puzzleStations
            .filter((s) => !s.requiresTier || currentTier >= s.requiresTier)
            .map((s) => (
              <polygon
                key={s.id}
                points={`${toPctX(s.position[0])},${toPctY(s.position[2]) - 1.8} ${
                  toPctX(s.position[0]) + 1.8
                },${toPctY(s.position[2])} ${toPctX(s.position[0])},${toPctY(s.position[2]) + 1.8} ${
                  toPctX(s.position[0]) - 1.8
                },${toPctY(s.position[2])}`}
                fill="#f59e0b"
                stroke="#111"
                strokeWidth={0.3}
              />
            ))}

          {/* Hiding Spots */}
          {level.hidingSpots?.map((h) => (
            <rect
              key={h.id}
              x={toPctX(h.position[0]) - 1.1}
              y={toPctY(h.position[2]) - 1.1}
              width={2.2}
              height={2.2}
              fill="#38bdf8"
              stroke="#082f49"
              strokeWidth={0.3}
            />
          ))}

          {/* Collected Evidences */}
          {level.evidences
            .filter((e) => collectedIds.includes(e.id))
            .map((e) => (
              <circle
                key={e.id}
                cx={toPctX(e.worldPosition[0])}
                cy={toPctY(e.worldPosition[2])}
                r={1.15}
                fill={e.isRedHerring ? '#fb7185' : e.unlocksSecretRelicId ? '#c084fc' : '#fde047'}
              />
            ))}

          {/* Live Player Arrow & View Cone */}
          <g transform={`translate(${toPctX(playerPos[0])}, ${toPctY(playerPos[2])}) rotate(${headingDeg})`}>
            <polygon points="0,0 -6,-15 6,-15" fill="rgba(251,191,36,0.22)" />
            <polygon points="0,-2.8 -2.1,2.3 2.1,2.3" fill="#fef08a" stroke="#dc2626" strokeWidth="0.55" />
          </g>
        </svg>
      </div>

      {/* Legend & Area Directory */}
      <div className="w-full lg:w-72 bg-[#18120e] border border-[#4a3322] rounded-lg p-4 space-y-4 text-xs">
        <h4 className="font-display-vn text-lg text-amber-200 border-b border-[#38271a] pb-2">
          Chú Giải Bản Đồ
        </h4>
        <div className="space-y-2 text-[#d4c8b0]">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-yellow-300 border border-red-600 inline-block" />
            <span>Vị trí & hướng nhìn của bạn</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-sm bg-red-500 inline-block" />
            <span>Cửa đang khóa niêm phong</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500 inline-block" />
            <span>Cửa đã mở khóa</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rotate-45 bg-amber-500 inline-block" />
            <span>Trạm cơ chế giải đố</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-sm bg-sky-400 inline-block" />
            <span>Chỗ ẩn nấp an toàn [E]</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-purple-400 inline-block" />
            <span>Khu vực Mật Thất / Mật Vật Ẩn</span>
          </div>
        </div>

        <div className="border-t border-[#38271a] pt-3 space-y-1.5">
          <div className="text-[11px] uppercase tracking-wider text-[#9c8f79]">
            Các Khu Vực Trong Màn ({level.mapZones?.length ?? 0})
          </div>
          {level.mapZones?.map((z) => (
            <div
              key={z.id}
              className={`px-2.5 py-1.5 rounded border text-[11px] ${
                z.isSecret
                  ? 'bg-purple-950/30 border-purple-700/50 text-purple-200'
                  : 'bg-[#120e0b] border-[#332419] text-[#dfd4bc]'
              }`}
            >
              {z.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
