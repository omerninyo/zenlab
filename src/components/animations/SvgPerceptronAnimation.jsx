import React, { useState } from 'react';
import { Network, Play, RotateCcw, Sliders, Zap } from 'lucide-react';
import { AudioEngine } from '../../core/audio.js';

export default function SvgPerceptronAnimation() {
  const [x1, setX1] = useState(1);
  const [x2, setX2] = useState(0);
  const [w1, setW1] = useState(1.5);
  const [w2, setW2] = useState(1.5);
  const [bias, setBias] = useState(-1.0);

  const toggleX1 = () => {
    const next = x1 === 1 ? 0 : 1;
    setX1(next);
    AudioEngine.playToggle(next === 1);
  };

  const toggleX2 = () => {
    const next = x2 === 1 ? 0 : 1;
    setX2(next);
    AudioEngine.playToggle(next === 1);
  };

  const handleReset = () => {
    setX1(1);
    setX2(0);
    setW1(1.5);
    setW2(1.5);
    setBias(-1.0);
    AudioEngine.playStep();
  };

  // Perceptron calculation
  const z = Math.round((x1 * w1 + x2 * w2 + bias) * 100) / 100;
  const isFired = z >= 0;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-purple-400" />
          <h3 className="text-xs font-semibold text-white">איך נוירון חושב ומחליט: קלטים, חשיבות וסף החלטה</h3>
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

      {/* Input Toggles & Quick Sliders */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">נתוני קלט:</span>
          <button
            type="button"
            onClick={toggleX1}
            className={`px-3 py-1 rounded-lg border font-mono font-bold transition-colors ${
              x1 === 1
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            קלט 1: {x1}
          </button>
          <button
            type="button"
            onClick={toggleX2}
            className={`px-3 py-1 rounded-lg border font-mono font-bold transition-colors ${
              x2 === 1
                ? 'bg-blue-600 text-white border-blue-500'
                : 'bg-slate-900 text-slate-400 border-slate-800'
            }`}
          >
            קלט 2: {x2}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">משקל 1:</span>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.5"
              value={w1}
              onChange={e => setW1(parseFloat(e.target.value))}
              className="w-16 accent-purple-500 cursor-pointer"
            />
            <span className="font-mono text-purple-300 w-6">{w1}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">משקל 2:</span>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.5"
              value={w2}
              onChange={e => setW2(parseFloat(e.target.value))}
              className="w-16 accent-purple-500 cursor-pointer"
            />
            <span className="font-mono text-purple-300 w-6">{w2}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">סף (Bias):</span>
            <input
              type="range"
              min="-3"
              max="2"
              step="0.5"
              value={bias}
              onChange={e => setBias(parseFloat(e.target.value))}
              className="w-16 accent-amber-500 cursor-pointer"
            />
            <span className="font-mono text-amber-300 w-8">{bias}</span>
          </div>
        </div>
      </div>

      {/* SVG Perceptron Architecture Diagram */}
      <div className="relative w-full aspect-[2.4/1] bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 760 260" className="w-full h-full select-none">
          {/* Connecting Synapse Lines */}
          <line
            x1="120" y1="70" x2="380" y2="130"
            stroke={x1 === 1 ? '#38bdf8' : '#334155'}
            strokeWidth={Math.max(1, Math.abs(w1) * 2.5)}
          />
          <line
            x1="120" y1="190" x2="380" y2="130"
            stroke={x2 === 1 ? '#38bdf8' : '#334155'}
            strokeWidth={Math.max(1, Math.abs(w2) * 2.5)}
          />
          <line
            x1="260" y1="30" x2="380" y2="130"
            stroke="#f59e0b"
            strokeWidth="2"
            strokeDasharray="4 2"
          />
          <line
            x1="450" y1="130" x2="640" y2="130"
            stroke={isFired ? '#10b981' : '#475569'}
            strokeWidth={isFired ? '4' : '2'}
          />

          {/* Input Nodes (x1, x2) */}
          <g transform="translate(120, 70)">
            <circle cx="0" cy="0" r="26" fill={x1 === 1 ? '#0284c7' : '#0f172a'} stroke="#38bdf8" strokeWidth="2" />
            <text x="0" y="5" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">קלט: {x1}</text>
            <text x="60" y="-8" fill="#c084fc" fontSize="11" fontWeight="bold">משקל: {w1}</text>
          </g>

          <g transform="translate(120, 190)">
            <circle cx="0" cy="0" r="26" fill={x2 === 1 ? '#0284c7' : '#0f172a'} stroke="#38bdf8" strokeWidth="2" />
            <text x="0" y="5" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle">קלט: {x2}</text>
            <text x="60" y="16" fill="#c084fc" fontSize="11" fontWeight="bold">משקל: {w2}</text>
          </g>

          {/* Bias Node */}
          <g transform="translate(260, 30)">
            <rect x="-35" y="-14" width="70" height="28" rx="6" fill="#78350f" stroke="#f59e0b" strokeWidth="1.5" />
            <text x="0" y="4" fill="#fef3c7" fontSize="11" fontWeight="bold" textAnchor="middle">סף: {bias}</text>
          </g>

          {/* Central Summation & Activation Node (The Neuron Cell Body) */}
          <g transform="translate(415, 130)">
            <circle
              cx="0" cy="0" r="42"
              fill={isFired ? '#064e3b' : '#1e1b4b'}
              stroke={isFired ? '#10b981' : '#6366f1'}
              strokeWidth="3"
            />
            <text x="0" y="-8" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">סכום החישוב</text>
            <text x="0" y="12" fill="#cbd5e1" fontSize="12" fontWeight="bold" textAnchor="middle">ניקוד: {z}</text>
            <text x="0" y="26" fill={z >= 0 ? '#4ade80' : '#f87171'} fontSize="10" fontWeight="bold" textAnchor="middle">
              {z >= 0 ? 'עבר את הסף!' : 'לא עבר את הסף'}
            </text>
          </g>

          {/* Output Signal Node */}
          <g transform="translate(640, 130)">
            <circle
              cx="0" cy="0" r="30"
              fill={isFired ? '#059669' : '#0f172a'}
              stroke={isFired ? '#34d399' : '#334155'}
              strokeWidth="3"
              className={isFired ? 'animate-pulse' : ''}
            />
            <text x="0" y="5" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">
              {isFired ? '1 (נדלק!)' : '0 (כבוי)'}
            </text>
            <text x="0" y="44" fill="#94a3b8" fontSize="11" textAnchor="middle">
              התוצאה הסופית
            </text>
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
        <span className="text-slate-400">
          חישוב הנוירון: <code className="font-mono text-purple-300">({x1} × {w1}) + ({x2} × {w2}) + ({bias}) = {z}</code>
        </span>
        <span className="font-semibold text-white">
          {isFired ? 'הנוירון נדלק! (1) - מעביר אות הלאה' : 'הנוירון נשאר כבוי (0) - האות חלש מדי'}
        </span>
      </div>
    </div>
  );
}
