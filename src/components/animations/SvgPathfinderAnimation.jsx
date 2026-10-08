import React, { useState } from 'react';
import { Compass, Play, RotateCcw, Target, Sparkles, Navigation } from 'lucide-react';
import { AudioEngine } from '../../core/audio.js';

export default function SvgPathfinderAnimation() {
  const [algo, setAlgo] = useState('astar'); // 'astar' or 'bfs'
  const [step, setStep] = useState(0);

  // Simple 6x6 mini-grid representation for the animation
  // S at (0, 0), G at (5, 5), walls at (2, 1), (2, 2), (2, 3)
  const totalSteps = algo === 'astar' ? 8 : 16;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(s => s + 1);
      AudioEngine.playStep();
    } else {
      setStep(0);
      AudioEngine.playStep();
    }
  };

  const handleReset = () => {
    setStep(0);
    AudioEngine.playStep();
  };

  const handleSwitchAlgo = (nextAlgo) => {
    setAlgo(nextAlgo);
    setStep(0);
    AudioEngine.playStep();
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-white">הדמיית מנגנון: חיפוש עיוור לכל הכיוונים מול מצפן חכם (A*)</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-[11px] font-medium text-white transition-colors"
          >
            <Play className="w-3 h-3" />
            <span>{step >= totalSteps ? 'התחלה מחדש' : 'צעד קדימה'}</span>
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

      {/* Algorithm Mode Switcher */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => handleSwitchAlgo('astar')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            algo === 'astar'
              ? 'bg-blue-950/80 border-blue-600 text-blue-300 font-semibold'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>חיפוש חכם (A* Heuristic)</span>
        </button>
        <button
          type="button"
          onClick={() => handleSwitchAlgo('bfs')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
            algo === 'bfs'
              ? 'bg-blue-950/80 border-blue-600 text-blue-300 font-semibold'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-slate-400" />
          <span>סריקת רוחב שווה (BFS)</span>
        </button>
      </div>

      {/* SVG Canvas for Pathfinder Expansion */}
      <div className="relative w-full aspect-[2.4/1] bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 600 280" className="w-full h-full select-none">
          {/* Grid Cells (6x6) */}
          {Array.from({ length: 36 }).map((_, idx) => {
            const r = Math.floor(idx / 6);
            const c = idx % 6;
            const x = 160 + c * 45;
            const y = 20 + r * 40;

            const isStart = r === 0 && c === 0;
            const isGoal = r === 5 && c === 5;
            const isWall = (c === 2 && r >= 1 && r <= 3);

            // Simulation of visited nodes
            let isVisited = false;
            let isPath = false;

            if (algo === 'astar') {
              // Direct diagonal corridor
              const dist = r + c;
              if (step >= dist && !isWall) isVisited = true;
              if (step >= totalSteps && ((r === c && !isWall) || (c === 1 && r === 2) || (c === 3 && r === 4))) {
                isPath = true;
              }
            } else {
              // BFS explores outwards like a wave
              const manhattanDist = r + c;
              if (step * 0.9 >= manhattanDist && !isWall) isVisited = true;
              if (step >= totalSteps && (r === c || (c === 1 && r === 2))) {
                isPath = true;
              }
            }

            return (
              <g key={idx}>
                <rect
                  x={x}
                  y={y}
                  width="40"
                  height="36"
                  rx="6"
                  fill={
                    isWall
                      ? '#475569'
                      : isPath
                      ? '#059669'
                      : isVisited
                      ? '#1e3a8a'
                      : '#0f172a'
                  }
                  stroke={isStart || isGoal ? '#38bdf8' : '#1e293b'}
                  strokeWidth={isStart || isGoal ? '2' : '1'}
                  opacity={isVisited && !isPath ? 0.7 : 1}
                />
                {isStart && (
                  <text x={x + 20} y={y + 23} fill="#38bdf8" fontSize="13" fontWeight="bold" textAnchor="middle">
                    S
                  </text>
                )}
                {isGoal && (
                  <text x={x + 20} y={y + 23} fill="#10b981" fontSize="13" fontWeight="bold" textAnchor="middle">
                    G
                  </text>
                )}
                {isWall && (
                  <line x1={x + 8} y1={y + 8} x2={x + 32} y2={y + 28} stroke="#94a3b8" strokeWidth="2" />
                )}
              </g>
            );
          })}

          {/* Legend and Info on Left */}
          <g transform="translate(20, 40)">
            <rect x="0" y="0" width="120" height="200" rx="8" fill="#020617" stroke="#1e293b" />
            <text x="15" y="25" fill="#94a3b8" fontSize="11" fontWeight="bold">מקרא:</text>
            
            <circle cx="20" cy="50" r="5" fill="#38bdf8" />
            <text x="32" y="54" fill="#cbd5e1" fontSize="10">נקודת התחלה (S)</text>

            <circle cx="20" cy="80" r="5" fill="#10b981" />
            <text x="32" y="84" fill="#cbd5e1" fontSize="10">יעד מבוקש (G)</text>

            <rect x="15" y="105" width="10" height="10" rx="2" fill="#475569" />
            <text x="32" y="114" fill="#cbd5e1" fontSize="10">מחסום קיר</text>

            <rect x="15" y="135" width="10" height="10" rx="2" fill="#1e3a8a" />
            <text x="32" y="144" fill="#cbd5e1" fontSize="10">משבצת שנבדקה</text>

            <rect x="15" y="165" width="10" height="10" rx="2" fill="#059669" />
            <text x="32" y="174" fill="#cbd5e1" fontSize="10">מסלול מנצח</text>
          </g>

          {/* Metric Panel on Right */}
          <g transform="translate(450, 40)">
            <rect x="0" y="0" width="130" height="200" rx="8" fill="#020617" stroke="#1e293b" />
            <text x="15" y="25" fill="#94a3b8" fontSize="11" fontWeight="bold">מדדי ביצוע:</text>

            <text x="15" y="60" fill="#64748b" fontSize="10">אלגוריתם:</text>
            <text x="15" y="76" fill="#f8fafc" fontSize="11" fontWeight="bold">
              {algo === 'astar' ? 'A* Heuristic' : 'BFS (רוחב)'}
            </text>

            <text x="15" y="110" fill="#64748b" fontSize="10">משבצות שנבדקו:</text>
            <text x="15" y="126" fill={algo === 'astar' ? '#38bdf8' : '#f59e0b'} fontSize="14" fontWeight="bold">
              {Math.min(step * (algo === 'astar' ? 1 : 2), algo === 'astar' ? 12 : 28)}
            </text>

            <text x="15" y="160" fill="#64748b" fontSize="10">יעילות חיפוש:</text>
            <text x="15" y="176" fill={algo === 'astar' ? '#10b981' : '#ef4444'} fontSize="12" fontWeight="bold">
              {algo === 'astar' ? 'גבוהה (חסכוני)' : 'נמוכה (בזבזני)'}
            </text>
          </g>
        </svg>
      </div>

      <div className="flex items-center justify-between text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
        <span className="text-slate-400">
          {algo === 'astar' 
            ? 'A* משתמש במצפן חכם (משחק חם-קר) שמנחש את הכיוון למטרה, וחוסך בדיקות מיותרות.'
            : 'חיפוש עיוור בודק כל משבצת אפשרית במעגלים לכל הכיוונים, ולכן הוא איטי בהרבה.'}
        </span>
        <span className="font-mono text-slate-300">
          צעד {step} מתוך {totalSteps}
        </span>
      </div>
    </div>
  );
}
