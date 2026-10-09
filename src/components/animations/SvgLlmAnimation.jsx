import React, { useState, useMemo } from 'react';
import { Sliders, Sparkles, Flame, Snowflake, RefreshCw } from 'lucide-react';
import { AudioEngine } from '../../core/audio.js';
import { AIService } from '../../services/ai.js';

export default function SvgLlmAnimation() {
  const [temperature, setTemperature] = useState(0.7);
  const [sampledToken, setSampledToken] = useState(null);

  const sampleVocabulary = [
    { token: 'מכשול', baseScore: 4.5, explanation: 'סבירות גבוהה' },
    { token: 'דלת', baseScore: 3.5, explanation: 'סבירות בינונית' },
    { token: 'מפתח', baseScore: 2.8, explanation: 'סבירות בינונית' },
    { token: 'פרח', baseScore: 1.0, explanation: 'סבירות נמוכה' }
  ];

  const distribution = useMemo(() => {
    return AIService.computeTokenProbabilities(sampleVocabulary, temperature);
  }, [temperature]);

  const handleSample = () => {
    const chosen = AIService.sampleToken(distribution, temperature);
    setSampledToken(chosen);
    AudioEngine.playToken();
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-white">מודל שפה: איך ה-AI בוחר את המילה הבאה ואיך מד החום משפיע עליו</h3>
        </div>

        <button
          type="button"
          onClick={handleSample}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>בחירת מילה (הגרלה לפי סיכוי)</span>
        </button>
      </div>

      {/* SVG Canvas for Softmax Curve & Candidate Bars */}
      <div className="relative w-full aspect-[2.4/1] bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 600 240" className="w-full h-full select-none">
          {/* Base Axis */}
          <line x1="50" y1="190" x2="550" y2="190" stroke="#334155" strokeWidth="2" />
          <line x1="50" y1="30" x2="50" y2="190" stroke="#334155" strokeWidth="2" />
          <text x="45" y="24" textAnchor="end" fill="#64748b" fontSize="10">סיכוי (%)</text>

          {/* Probability Bars and Labels */}
          {distribution.map((item, idx) => {
            const bx = 90 + idx * 115;
            const barHeight = Math.max(4, (item.probability / 100) * 140);
            const by = 190 - barHeight;
            const isSampled = sampledToken === item.token;

            return (
              <g key={idx}>
                {/* Probability Bar */}
                <rect
                  x={bx}
                  y={by}
                  width="65"
                  height={barHeight}
                  rx="4"
                  fill={isSampled ? '#38bdf8' : idx === 0 ? '#3b82f6' : '#1e3a8a'}
                  stroke={isSampled ? '#ffffff' : '#60a5fa'}
                  strokeWidth={isSampled ? 2 : 1}
                  className="transition-all duration-300"
                />

                {/* Percentage text above bar */}
                <text
                  x={bx + 32}
                  y={by - 6}
                  textAnchor="middle"
                  fill={isSampled ? '#38bdf8' : '#e2e8f0'}
                  fontSize="12"
                  fontWeight="bold"
                  fontFamily="monospace"
                >
                  {item.probability}%
                </text>

                {/* Token Label beneath axis */}
                <text
                  x={bx + 32}
                  y="212"
                  textAnchor="middle"
                  fill={isSampled ? '#38bdf8' : '#cbd5e1'}
                  fontSize="12"
                  fontWeight="bold"
                >
                  "{item.token}"
                </text>

                {/* Raw logit indicator */}
                <text
                  x={bx + 32}
                  y="226"
                  textAnchor="middle"
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  ניקוד: {item.rawProb ? (item.rawProb * 10).toFixed(1) : 0}
                </text>
              </g>
            );
          })}

          {/* Interpolated Softmax Distribution Curve Line */}
          <path
            d={`M 122 ${190 - (distribution[0].probability / 100) * 140} 
               Q 180 ${190 - (distribution[0].probability / 100) * 140}, 237 ${190 - (distribution[1].probability / 100) * 140} 
               T 352 ${190 - (distribution[2].probability / 100) * 140} 
               T 467 ${190 - (distribution[3].probability / 100) * 140}`}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeDasharray="3,3"
            className="transition-all duration-300 opacity-80"
          />
        </svg>
      </div>

      {/* Temperature Slider & Mathematical Status */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs font-semibold text-slate-200">מד החום (טמפרטורה) - כמה המחשב יצירתי?</span>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800">
            {temperature <= 0.05 ? (
              <span className="flex items-center gap-1 text-cyan-400">
                <Snowflake className="w-3 h-3" /> T = 0.0 (בטוח וצפוי ביותר)
              </span>
            ) : temperature >= 0.9 ? (
              <span className="flex items-center gap-1 text-amber-400">
                <Flame className="w-3 h-3" /> T = {temperature.toFixed(2)} (יצירתי ומפתיע)
              </span>
            ) : (
              <span className="text-blue-400">T = {temperature.toFixed(2)} (מאוזן)</span>
            )}
          </div>
        </div>

        <input
          type="range"
          min="0"
          max="1.5"
          step="0.05"
          value={temperature}
          onChange={(e) => setTemperature(parseFloat(e.target.value))}
          className="w-full accent-blue-500 cursor-pointer"
        />

        <div className="flex justify-between text-[10px] text-slate-500">
          <span>T=0: תמיד המילה הצפויה והבטוחה ביותר</span>
          <span>T=0.7: איזון בין היגיון ליצירתיות</span>
          <span>T=1.5: פרוע ומפתיע (סיכוי שווה לכל מילה)</span>
        </div>
      </div>

      {sampledToken && (
        <div className="p-2.5 rounded-lg bg-blue-950/60 border border-blue-800/80 text-xs text-center text-blue-200 animate-fadeIn">
          המילה שנבחרה כעת בהגרלה: <span className="font-bold text-white">&quot;{sampledToken}&quot;</span>
        </div>
      )}
    </div>
  );
}
