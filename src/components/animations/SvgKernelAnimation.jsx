import React, { useState } from 'react';
import { Eye, Play, RotateCcw, ScanLine } from 'lucide-react';
import { AudioEngine } from '../../core/audio.js';

export default function SvgKernelAnimation() {
  const [windowPos, setWindowPos] = useState({ x: 2, y: 2 });
  const [selectedFilter, setSelectedFilter] = useState('vertical'); // 'vertical' or 'horizontal'

  const moveWindow = (dx, dy) => {
    setWindowPos(prev => {
      const nx = Math.max(1, Math.min(6, prev.x + dx));
      const ny = Math.max(1, Math.min(6, prev.y + dy));
      return { x: nx, y: ny };
    });
    AudioEngine.playStep();
  };

  const handleReset = () => {
    setWindowPos({ x: 2, y: 2 });
    AudioEngine.playStep();
  };

  // Sample 8x8 vertical stripe pattern
  const isInputActive = (r, c) => c === 3 || c === 4;

  // Kernel weights
  const kernelV = [
    [-1, 0, 1],
    [-1, 0, 1],
    [-1, 0, 1]
  ];
  const kernelH = [
    [-1, -1, -1],
    [0, 0, 0],
    [1, 1, 1]
  ];
  const activeKernel = selectedFilter === 'vertical' ? kernelV : kernelH;

  // Calculate local dot product at windowPos
  let dotSum = 0;
  for (let ky = -1; ky <= 1; ky++) {
    for (let kx = -1; kx <= 1; kx++) {
      const px = isInputActive(windowPos.y + ky, windowPos.x + kx) ? 1 : 0;
      const kw = activeKernel[ky + 1][kx + 1];
      dotSum += px * kw;
    }
  }

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-semibold text-white">הדמיית מנגנון: חלון קונבולוציה נע 3x3 ומפת מאפיינים</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleReset}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title="איפוס"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Movement Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">פילטר:</span>
          <button
            type="button"
            onClick={() => { setSelectedFilter('vertical'); AudioEngine.playStep(); }}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              selectedFilter === 'vertical'
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            קצוות אנכיים
          </button>
          <button
            type="button"
            onClick={() => { setSelectedFilter('horizontal'); AudioEngine.playStep(); }}
            className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
              selectedFilter === 'horizontal'
                ? 'bg-amber-950/80 border-amber-600 text-amber-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            קצוות אופקיים
          </button>
        </div>

        {/* Direction Pad to move the 3x3 window */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] text-slate-400 ml-1">הזזת החלון:</span>
          <button
            type="button"
            onClick={() => moveWindow(-1, 0)}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800"
          >
            ימינה
          </button>
          <button
            type="button"
            onClick={() => moveWindow(1, 0)}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800"
          >
            שמאלה
          </button>
          <button
            type="button"
            onClick={() => moveWindow(0, -1)}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800"
          >
            למעלה
          </button>
          <button
            type="button"
            onClick={() => moveWindow(0, 1)}
            className="px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800"
          >
            למטה
          </button>
        </div>
      </div>

      {/* SVG Convolution Arena */}
      <div className="relative w-full aspect-[2.4/1] bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 760 280" className="w-full h-full select-none">
          {/* Section 1: Input Matrix (8x8) */}
          <g transform="translate(30, 20)">
            <text x="96" y="-6" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
              1. תמונת קלט (8x8)
            </text>
            {Array.from({ length: 64 }).map((_, idx) => {
              const r = Math.floor(idx / 8);
              const c = idx % 8;
              const isActive = isInputActive(r, c);
              const cellSize = 24;

              return (
                <rect
                  key={idx}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  rx="3"
                  fill={isActive ? '#38bdf8' : '#0f172a'}
                  stroke="#1e293b"
                  strokeWidth="1"
                />
              );
            })}

            {/* Sliding 3x3 Window Highlight */}
            <rect
              x={(windowPos.x - 1) * 24 - 2}
              y={(windowPos.y - 1) * 24 - 2}
              width={74}
              height={74}
              rx="6"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeDasharray="4 2"
              className="animate-pulse"
            />
          </g>

          {/* Section 2: Kernel Multiplier (Center Math) */}
          <g transform="translate(260, 20)">
            <text x="110" y="-6" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
              2. פילטר 3x3 & חישוב
            </text>
            <rect x="0" y="0" width="220" height="200" rx="8" fill="#020617" stroke="#1e293b" />

            {/* 3x3 Kernel Matrix Display */}
            {activeKernel.map((row, ky) =>
              row.map((val, kx) => (
                <g key={`${ky}-${kx}`} transform={`translate(${20 + kx * 45}, ${20 + ky * 40})`}>
                  <rect x="0" y="0" width="38" height="32" rx="4" fill="#0f172a" stroke="#334155" />
                  <text x="19" y="20" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">
                    {val > 0 ? `+${val}` : val}
                  </text>
                </g>
              ))
            )}

            {/* Live Sum Calculation */}
            <text x="110" y="160" fill="#94a3b8" fontSize="10" textAnchor="middle">
              סכום מכפלות הפיקסלים:
            </text>
            <text
              x="110"
              y="185"
              fill={dotSum !== 0 ? '#10b981' : '#64748b'}
              fontSize="16"
              fontWeight="bold"
              textAnchor="middle"
            >
              תוצאה: {dotSum}
            </text>
          </g>

          {/* Section 3: Feature Map Matrix (8x8) */}
          <g transform="translate(520, 20)">
            <text x="96" y="-6" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">
              3. מפת מאפיינים
            </text>
            {Array.from({ length: 64 }).map((_, idx) => {
              const r = Math.floor(idx / 8);
              const c = idx % 8;
              const isCurrent = r === windowPos.y && c === windowPos.x;
              const cellSize = 24;

              // Theoretical edge map for vertical stripe: edges at c=2 (+3) and c=5 (-3)
              let intensity = 0;
              if (selectedFilter === 'vertical') {
                if (c === 2) intensity = 1;
                if (c === 5) intensity = 1;
              }

              return (
                <rect
                  key={idx}
                  x={c * cellSize}
                  y={r * cellSize}
                  width={cellSize - 2}
                  height={cellSize - 2}
                  rx="3"
                  fill={isCurrent ? '#f59e0b' : intensity ? '#10b981' : '#0f172a'}
                  stroke="#1e293b"
                  strokeWidth="1"
                  opacity={isCurrent ? 1 : intensity ? 0.85 : 0.4}
                />
              );
            })}
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
        <span className="text-slate-400">
          חלון ה-3x3 מחליק על פני התמונה. כאשר הוא פוגש מעבר בין כהה לבהיר (קצה), המכפלה מניבה ערך גבוה ומסמנת קו!
        </span>
        <span className="font-mono text-amber-400 font-bold">
          ערך הפיקסל המחושב: {dotSum}
        </span>
      </div>
    </div>
  );
}
