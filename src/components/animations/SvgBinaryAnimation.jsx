import React, { useState } from 'react';
import { Play, Pause, RotateCcw, Zap, Sparkles } from 'lucide-react';
import { AudioEngine } from '../../core/audio.js';

export default function SvgBinaryAnimation() {
  const [bits, setBits] = useState([1, 0, 1, 1, 0, 0, 1, 0]);
  const [isPlayingPulse, setIsPlayingPulse] = useState(false);

  const bitWeights = [128, 64, 32, 16, 8, 4, 2, 1];

  const decimalValue = bits.reduce((acc, bit, idx) => acc + bit * bitWeights[idx], 0);
  const hexValue = decimalValue.toString(16).toUpperCase().padStart(2, '0');

  const toggleBit = (index) => {
    const next = [...bits];
    next[index] = next[index] === 1 ? 0 : 1;
    setBits(next);
    AudioEngine.playToggle(next[index] === 1);
  };

  const handleInvertAll = () => {
    setBits(bits.map(b => b === 1 ? 0 : 1));
    AudioEngine.playStep();
  };

  const handleReset = () => {
    setBits([1, 0, 1, 1, 0, 0, 1, 0]);
    AudioEngine.playStep();
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-white">איך ביטים הופכים לפיקסלים ולמספרים</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleInvertAll}
            className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-[11px] font-medium text-slate-300 border border-slate-800 transition-colors"
          >
            היפוך כל המתגים
          </button>
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

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[2.6/1] bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 800 300" className="w-full h-full select-none">
          {/* Signal Bus Line */}
          <line x1="40" y1="45" x2="760" y2="45" stroke="#334155" strokeWidth="3" strokeDasharray="6,4" />

          {bits.map((bit, idx) => {
            const x = 70 + idx * 88;
            const isHigh = bit === 1;

            return (
              <g key={idx} className="cursor-pointer" onClick={() => toggleBit(idx)}>
                {/* Connecting wire from bus */}
                <line
                  x1={x + 25}
                  y1="45"
                  x2={x + 25}
                  y2="85"
                  stroke={isHigh ? '#38bdf8' : '#334155'}
                  strokeWidth="3"
                  className="transition-colors duration-200"
                />

                {/* Bit weight label */}
                <text x={x + 25} y="32" textAnchor="middle" fill="#94a3b8" fontSize="12" fontWeight="bold" fontFamily="monospace">
                  {bitWeights[idx]}
                </text>

                {/* Electric Switch / Bit Register Box */}
                <rect
                  x={x}
                  y="85"
                  width="50"
                  height="55"
                  rx="8"
                  fill={isHigh ? '#0284c7' : '#0f172a'}
                  stroke={isHigh ? '#38bdf8' : '#334155'}
                  strokeWidth="2"
                  className="transition-all duration-200 hover:stroke-blue-400"
                />

                {/* Bit Value Text */}
                <text
                  x={x + 25}
                  y={122}
                  textAnchor="middle"
                  fill={isHigh ? '#ffffff' : '#64748b'}
                  fontSize="24"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {bit}
                </text>

                {/* Connecting Wire from register to pixel */}
                <line
                  x1={x + 25}
                  y1="140"
                  x2={x + 25}
                  y2="185"
                  stroke={isHigh ? '#38bdf8' : '#334155'}
                  strokeWidth="3"
                  className="transition-colors duration-200"
                />

                {/* Visual Pixel representation on Screen */}
                <rect
                  x={x + 5}
                  y="185"
                  width="40"
                  height="40"
                  rx="6"
                  fill={isHigh ? '#f8fafc' : '#020617'}
                  stroke={isHigh ? '#cbd5e1' : '#1e293b'}
                  strokeWidth="2"
                  className="transition-all duration-200"
                />

                {/* Subtitle state */}
                <text
                  x={x + 25}
                  y="245"
                  textAnchor="middle"
                  fill={isHigh ? '#38bdf8' : '#64748b'}
                  fontSize="11"
                  fontWeight="medium"
                >
                  {isHigh ? 'דולק' : 'כבוי'}
                </text>
              </g>
            );
          })}

          {/* Bottom Summary Bar in SVG */}
          <line x1="40" y1="265" x2="760" y2="265" stroke="#1e293b" strokeWidth="1" />
        </svg>
      </div>

      {/* Real-time Math Translation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400">קוד בינארי (8 ביטים):</div>
          <div className="font-mono text-sm font-bold text-blue-400 mt-0.5 tracking-widest">{bits.join('')}</div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400">המספר הרגיל שלנו:</div>
          <div className="font-mono text-sm font-bold text-white mt-0.5">{decimalValue} / 255</div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-center">
          <div className="text-[10px] text-slate-400">קוד מקוצר למחשב (Hex):</div>
          <div className="font-mono text-sm font-bold text-emerald-400 mt-0.5">0x{hexValue}</div>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 text-center">
        לחצו על המתגים למעלה כדי להדליק או לכבות ביטים, וראו איך הפיקסל והמספר משתנים!
      </p>
    </div>
  );
}
