import React, { useState } from 'react';
import { Sparkles, Network, Grid, Info } from 'lucide-react';
import { AudioEngine } from '../../core/audio.js';

const TOKENS = ["הרובוט", "החכם", "זיהה", "את", "המפתח", "במבוך"];

// Precomputed attention weights for the sentence
const ATTENTION_WEIGHTS = {
  0: [0.10, 0.40, 0.30, 0.05, 0.10, 0.05], // הרובוט -> החכם (40%), זיהה (30%)
  1: [0.60, 0.15, 0.15, 0.02, 0.05, 0.03], // החכם -> הרובוט (60%)
  2: [0.40, 0.05, 0.10, 0.05, 0.35, 0.05], // זיהה -> הרובוט (40%), המפתח (35%)
  3: [0.05, 0.02, 0.15, 0.05, 0.70, 0.03], // את -> המפתח (70%)
  4: [0.15, 0.05, 0.45, 0.15, 0.10, 0.10], // המפתח -> זיהה (45%)
  5: [0.30, 0.05, 0.20, 0.05, 0.25, 0.15], // במבוך -> הרובוט (30%), המפתח (25%)
};

export default function SvgSelfAttentionAnimation() {
  const [selectedTokenIdx, setSelectedTokenIdx] = useState(2); // default "זיהה"
  const [viewMode, setViewMode] = useState('arcs'); // 'arcs' | 'matrix'

  const currentWeights = ATTENTION_WEIGHTS[selectedTokenIdx] || ATTENTION_WEIGHTS[0];

  const handleSelectToken = (idx) => {
    setSelectedTokenIdx(idx);
    AudioEngine.playStep();
  };

  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5" dir="rtl">
      {/* Header and Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-xs font-bold text-white">
              מנגנון תשומת הלב (Self-Attention ב-Transformers)
            </h3>
            <p className="text-[11px] text-slate-400">
              לחצו על כל מילה במשפט כדי לראות לאילו מילים אחרות המודל מקדיש "תשומת לב"
            </p>
          </div>
        </div>

        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => { setViewMode('arcs'); AudioEngine.playStep(); }}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMode === 'arcs' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            קשתי תשומת לב
          </button>
          <button
            type="button"
            onClick={() => { setViewMode('matrix'); AudioEngine.playStep(); }}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              viewMode === 'matrix' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            מטריצת חום ($Q \times K$)
          </button>
        </div>
      </div>

      {viewMode === 'arcs' ? (
        /* Arc Graph View */
        <div className="space-y-4">
          {/* Interactive Token Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 py-2">
            {TOKENS.map((token, idx) => {
              const isSelected = selectedTokenIdx === idx;
              const weight = currentWeights[idx];
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectToken(idx)}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all border flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-900/40 scale-105'
                      : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <span>{token}</span>
                  {!isSelected && (
                    <span className="text-[10px] font-mono text-slate-400">
                      {(weight * 100).toFixed(0)}%
                    </span>
                  )}
                  {isSelected && (
                    <span className="text-[10px] font-mono bg-blue-700 px-1.5 py-0.2 rounded text-blue-100">
                      מילת שאילתה (Query)
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* SVG Connection Arcs Canvas */}
          <div className="relative w-full h-44 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden">
            <svg viewBox="0 0 600 160" className="w-full h-full">
              <defs>
                <linearGradient id="attentionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#60a5fa" />
                </linearGradient>
              </defs>

              {/* Render attention arcs from selected token */}
              {TOKENS.map((_, targetIdx) => {
                if (targetIdx === selectedTokenIdx) return null;
                const weight = currentWeights[targetIdx];
                const startX = 50 + selectedTokenIdx * 100;
                const endX = 50 + targetIdx * 100;
                const midX = (startX + endX) / 2;
                const distance = Math.abs(selectedTokenIdx - targetIdx);
                const arcHeight = 30 + distance * 18;
                const strokeWidth = Math.max(1.5, weight * 12);
                const opacity = Math.max(0.15, weight);

                return (
                  <g key={targetIdx}>
                    <path
                      d={`M ${startX} 130 Q ${midX} ${130 - arcHeight} ${endX} 130`}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth={strokeWidth}
                      strokeOpacity={opacity}
                      strokeLinecap="round"
                      className="transition-all duration-300"
                    />
                    {/* Weight badge near arc peak */}
                    {weight >= 0.15 && (
                      <g>
                        <rect
                          x={midX - 16}
                          y={130 - arcHeight - 12}
                          width="32"
                          height="16"
                          rx="4"
                          fill="#020617"
                          stroke="#1e3a8a"
                          strokeWidth="1"
                        />
                        <text
                          x={midX}
                          y={130 - arcHeight}
                          textAnchor="middle"
                          fill="#93c5fd"
                          fontSize="9"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          {(weight * 100).toFixed(0)}%
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Bottom Token Anchor Nodes */}
              {TOKENS.map((token, idx) => {
                const x = 50 + idx * 100;
                const isSelected = selectedTokenIdx === idx;
                return (
                  <g key={idx}>
                    <circle
                      cx={x}
                      cy="130"
                      r={isSelected ? "8" : "5"}
                      fill={isSelected ? "#2563eb" : "#475569"}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    <text
                      x={x}
                      y="150"
                      textAnchor="middle"
                      fill={isSelected ? "#60a5fa" : "#94a3b8"}
                      fontSize="11"
                      fontWeight={isSelected ? "bold" : "normal"}
                    >
                      {token}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      ) : (
        /* Attention Matrix Heatmap View */
        <div className="space-y-3">
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead>
                <tr>
                  <th className="p-2 text-[11px] text-slate-400 font-normal">שאילתה \ מפתח</th>
                  {TOKENS.map((token, i) => (
                    <th key={i} className="p-2 text-xs font-semibold text-slate-200">
                      {token}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TOKENS.map((rowToken, rowIdx) => (
                  <tr key={rowIdx} className="border-t border-slate-800/60">
                    <td className="p-2 text-xs font-bold text-slate-300 text-right">
                      {rowToken}
                    </td>
                    {ATTENTION_WEIGHTS[rowIdx].map((val, colIdx) => {
                      const pct = Math.round(val * 100);
                      const bgOpacity = Math.max(0.08, val);
                      return (
                        <td 
                          key={colIdx} 
                          className="p-2 cursor-pointer transition-colors"
                          onClick={() => handleSelectToken(rowIdx)}
                          title={`${rowToken} מקדיש ${pct}% תשומת לב ל-${TOKENS[colIdx]}`}
                        >
                          <div 
                            className="w-full py-1.5 rounded text-[11px] font-mono font-medium transition-all"
                            style={{ 
                              backgroundColor: `rgba(37, 99, 235, ${bgOpacity})`,
                              color: val > 0.3 ? '#ffffff' : '#94a3b8',
                              border: rowIdx === selectedTokenIdx ? '1px solid #3b82f6' : '1px solid transparent'
                            }}
                          >
                            {pct}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Explanatory Callout */}
      <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
        <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white">איך מודל שפה מבין משמעות?</strong>
          <p className="text-[11px] text-slate-400 mt-0.5">
            במשפט לעיל, המילה <strong>"{TOKENS[selectedTokenIdx]}"</strong> לא נבחנת בנפרד. באמצעות מנגנון ה-Attention, המודל מחשב מכפלה וקטורית בין שאילתה (Query) לבין מפתחות (Keys) של כל שאר המילים, וכך מבין את ההקשר התחבירי המדויק.
          </p>
        </div>
      </div>
    </div>
  );
}
