import React, { useState } from 'react';
import { GitBranch, Play, RotateCcw, CheckCircle2, HelpCircle } from 'lucide-react';
import { AudioEngine } from '../../core/audio.js';

export default function SvgDecisionTreeAnimation() {
  const [selectedAnimal, setSelectedAnimal] = useState('cat');
  const [activeStep, setActiveStep] = useState(0); // 0: Root, 1: Branch, 2: Leaf

  const animals = {
    cat: { name: 'חתול', canFly: false, hasFur: true, species: 'יונק' },
    eagle: { name: 'נשר', canFly: true, hasFur: false, species: 'עוף' },
    bat: { name: 'עטלף', canFly: true, hasFur: true, species: 'יונק' },
    turtle: { name: 'צב', canFly: false, hasFur: false, species: 'זוחל' }
  };

  const curr = animals[selectedAnimal];

  const handleSelectAnimal = (key) => {
    setSelectedAnimal(key);
    setActiveStep(0);
    AudioEngine.playStep();
  };

  const handleNextStep = () => {
    if (activeStep < 2) {
      setActiveStep(prev => prev + 1);
      AudioEngine.playTone(400 + activeStep * 150, 'sine', 0.12);
    } else {
      setActiveStep(0);
      AudioEngine.playStep();
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    AudioEngine.playStep();
  };

  // Decision path logic
  const isFly = curr.canFly;
  const isFur = curr.hasFur;

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-semibold text-white">הדמיית מנגנון: זרימת החלטה בעץ שאלות כן/לא</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleNextStep}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-[11px] font-medium text-white transition-colors"
          >
            <Play className="w-3 h-3" />
            <span>{activeStep === 2 ? 'התחלה מחדש' : 'צעד הבא'}</span>
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

      {/* Animal Selector Controls */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-[11px] text-slate-400 font-medium">בחר בעל חיים למבחן:</span>
        {Object.entries(animals).map(([k, item]) => (
          <button
            key={k}
            type="button"
            onClick={() => handleSelectAnimal(k)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
              selectedAnimal === k
                ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 font-semibold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.name}
          </button>
        ))}
      </div>

      {/* Interactive SVG Decision Tree Diagram */}
      <div className="relative w-full aspect-[2.4/1] bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 800 320" className="w-full h-full select-none">
          <defs>
            <filter id="glow-tree" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Root Connection Lines */}
          <line
            x1="400" y1="50" x2="220" y2="140"
            stroke={activeStep >= 1 && isFly ? '#10b981' : '#334155'}
            strokeWidth={activeStep >= 1 && isFly ? '3' : '1.5'}
            strokeDasharray={activeStep >= 1 && isFly ? 'none' : '4 4'}
          />
          <line
            x1="400" y1="50" x2="580" y2="140"
            stroke={activeStep >= 1 && !isFly ? '#10b981' : '#334155'}
            strokeWidth={activeStep >= 1 && !isFly ? '3' : '1.5'}
            strokeDasharray={activeStep >= 1 && !isFly ? 'none' : '4 4'}
          />

          {/* Left Branch to Leaves */}
          <line
            x1="220" y1="140" x2="130" y2="240"
            stroke={activeStep === 2 && isFly && isFur ? '#10b981' : '#334155'}
            strokeWidth={activeStep === 2 && isFly && isFur ? '3' : '1.5'}
          />
          <line
            x1="220" y1="140" x2="310" y2="240"
            stroke={activeStep === 2 && isFly && !isFur ? '#10b981' : '#334155'}
            strokeWidth={activeStep === 2 && isFly && !isFur ? '3' : '1.5'}
          />

          {/* Right Branch to Leaves */}
          <line
            x1="580" y1="140" x2="490" y2="240"
            stroke={activeStep === 2 && !isFly && isFur ? '#10b981' : '#334155'}
            strokeWidth={activeStep === 2 && !isFly && isFur ? '3' : '1.5'}
          />
          <line
            x1="580" y1="140" x2="670" y2="240"
            stroke={activeStep === 2 && !isFly && !isFur ? '#10b981' : '#334155'}
            strokeWidth={activeStep === 2 && !isFly && !isFur ? '3' : '1.5'}
          />

          {/* Branch Labels (Yes / No) */}
          <text x="290" y="85" fill={activeStep >= 1 && isFly ? '#10b981' : '#64748b'} fontSize="11" textAnchor="middle" fontWeight="bold">כן (מעופף)</text>
          <text x="510" y="85" fill={activeStep >= 1 && !isFly ? '#10b981' : '#64748b'} fontSize="11" textAnchor="middle" fontWeight="bold">לא (הולך)</text>

          <text x="160" y="185" fill={activeStep === 2 && isFly && isFur ? '#10b981' : '#64748b'} fontSize="10" textAnchor="middle">פרווה</text>
          <text x="280" y="185" fill={activeStep === 2 && isFly && !isFur ? '#10b981' : '#64748b'} fontSize="10" textAnchor="middle">נוצות</text>

          <text x="520" y="185" fill={activeStep === 2 && !isFly && isFur ? '#10b981' : '#64748b'} fontSize="10" textAnchor="middle">פרווה</text>
          <text x="640" y="185" fill={activeStep === 2 && !isFly && !isFur ? '#10b981' : '#64748b'} fontSize="10" textAnchor="middle">שריון/קשקשים</text>

          {/* Root Node */}
          <g transform="translate(400, 50)">
            <rect
              x="-80" y="-22" width="160" height="44" rx="8"
              fill={activeStep === 0 ? '#1e293b' : '#0f172a'}
              stroke={activeStep === 0 ? '#3b82f6' : '#334155'}
              strokeWidth={activeStep === 0 ? '2.5' : '1.5'}
            />
            <text x="0" y="5" fill="#f8fafc" fontSize="12" fontWeight="bold" textAnchor="middle">
              האם יכול לעוף?
            </text>
          </g>

          {/* Node Level 1 Left */}
          <g transform="translate(220, 140)">
            <rect
              x="-65" y="-18" width="130" height="36" rx="6"
              fill={activeStep === 1 && isFly ? '#1e293b' : '#0f172a'}
              stroke={activeStep === 1 && isFly ? '#10b981' : '#334155'}
              strokeWidth={activeStep === 1 && isFly ? '2' : '1'}
            />
            <text x="0" y="4" fill="#e2e8f0" fontSize="11" textAnchor="middle">
              בעל פרווה?
            </text>
          </g>

          {/* Node Level 1 Right */}
          <g transform="translate(580, 140)">
            <rect
              x="-65" y="-18" width="130" height="36" rx="6"
              fill={activeStep === 1 && !isFly ? '#1e293b' : '#0f172a'}
              stroke={activeStep === 1 && !isFly ? '#10b981' : '#334155'}
              strokeWidth={activeStep === 1 && !isFly ? '2' : '1'}
            />
            <text x="0" y="4" fill="#e2e8f0" fontSize="11" textAnchor="middle">
              בעל פרווה?
            </text>
          </g>

          {/* Leaf 1: Bat */}
          <g transform="translate(130, 240)">
            <rect
              x="-45" y="-18" width="90" height="36" rx="6"
              fill={activeStep === 2 && isFly && isFur ? '#064e3b' : '#020617'}
              stroke={activeStep === 2 && isFly && isFur ? '#10b981' : '#1e293b'}
              strokeWidth={activeStep === 2 && isFly && isFur ? '2' : '1'}
            />
            <text x="0" y="-1" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">עטלף</text>
            <text x="0" y="12" fill="#94a3b8" fontSize="9" textAnchor="middle">(יונק)</text>
          </g>

          {/* Leaf 2: Bird */}
          <g transform="translate(310, 240)">
            <rect
              x="-45" y="-18" width="90" height="36" rx="6"
              fill={activeStep === 2 && isFly && !isFur ? '#064e3b' : '#020617'}
              stroke={activeStep === 2 && isFly && !isFur ? '#10b981' : '#1e293b'}
              strokeWidth={activeStep === 2 && isFly && !isFur ? '2' : '1'}
            />
            <text x="0" y="-1" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">נשר / ציפור</text>
            <text x="0" y="12" fill="#94a3b8" fontSize="9" textAnchor="middle">(עוף)</text>
          </g>

          {/* Leaf 3: Cat / Dog */}
          <g transform="translate(490, 240)">
            <rect
              x="-45" y="-18" width="90" height="36" rx="6"
              fill={activeStep === 2 && !isFly && isFur ? '#064e3b' : '#020617'}
              stroke={activeStep === 2 && !isFly && isFur ? '#10b981' : '#1e293b'}
              strokeWidth={activeStep === 2 && !isFly && isFur ? '2' : '1'}
            />
            <text x="0" y="-1" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">חתול / כלב</text>
            <text x="0" y="12" fill="#94a3b8" fontSize="9" textAnchor="middle">(יונק)</text>
          </g>

          {/* Leaf 4: Reptile */}
          <g transform="translate(670, 240)">
            <rect
              x="-45" y="-18" width="90" height="36" rx="6"
              fill={activeStep === 2 && !isFly && !isFur ? '#064e3b' : '#020617'}
              stroke={activeStep === 2 && !isFly && !isFur ? '#10b981' : '#1e293b'}
              strokeWidth={activeStep === 2 && !isFly && !isFur ? '2' : '1'}
            />
            <text x="0" y="-1" fill="#f8fafc" fontSize="11" fontWeight="bold" textAnchor="middle">צב / לטאה</text>
            <text x="0" y="12" fill="#94a3b8" fontSize="9" textAnchor="middle">(זוחל)</text>
          </g>

          {/* Current Animal Marker */}
          {activeStep === 0 && (
            <circle cx="400" cy="50" r="6" fill="#38bdf8" className="animate-ping" opacity="0.6" />
          )}
          {activeStep === 1 && (
            <circle cx={isFly ? 220 : 580} cy="140" r="6" fill="#38bdf8" className="animate-ping" opacity="0.6" />
          )}
          {activeStep === 2 && (
            <circle
              cx={isFly ? (isFur ? 130 : 310) : (isFur ? 490 : 670)}
              cy="240"
              r="6"
              fill="#10b981"
              className="animate-ping"
              opacity="0.6"
            />
          )}
        </svg>
      </div>

      {/* Live Decision Tracker Status */}
      <div className="flex items-center justify-between text-xs bg-slate-900/80 p-3 rounded-lg border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">נבדק כעת:</span>
          <span className="font-bold text-white">{curr.name}</span>
          <span className="text-slate-500">|</span>
          <span className="text-slate-400">תכונות:</span>
          <span className="font-mono text-slate-300">
            עף: {curr.canFly ? 'כן' : 'לא'}, פרווה: {curr.hasFur ? 'כן' : 'לא'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
          {activeStep === 2 && (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>סיווג סופי: מחלקת ה{curr.species}ים</span>
            </>
          )}
          {activeStep < 2 && (
            <span className="text-slate-400">שלב החלטה {activeStep + 1} מתוך 3</span>
          )}
        </div>
      </div>
    </div>
  );
}
