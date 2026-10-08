import React, { useState, useMemo } from 'react';
import { Sliders, RotateCcw, Network } from 'lucide-react';
import { AudioEngine } from '../../core/audio.js';

export default function SvgClassifierAnimation() {
  const [k, setK] = useState(3);
  const [queryPoint, setQueryPoint] = useState({ x: 190, y: 140 });

  // Fixed sample training clusters
  const trainingPoints = [
    // Class A (Red, Apples) - generally top-left
    { id: 1, x: 90, y: 60, label: 'A' },
    { id: 2, x: 140, y: 80, label: 'A' },
    { id: 3, x: 110, y: 120, label: 'A' },
    { id: 4, x: 70, y: 150, label: 'A' },
    { id: 5, x: 150, y: 130, label: 'A' },
    // Class B (Green, Watermelons) - generally bottom-right
    { id: 6, x: 270, y: 170, label: 'B' },
    { id: 7, x: 320, y: 190, label: 'B' },
    { id: 8, x: 250, y: 220, label: 'B' },
    { id: 9, x: 350, y: 150, label: 'B' },
    { id: 10, x: 230, y: 150, label: 'B' }
  ];

  // Calculate distances and k-NN
  const { nearestNeighbors, radius, votes, prediction, confidence } = useMemo(() => {
    const withDist = trainingPoints.map(p => {
      const dx = p.x - queryPoint.x;
      const dy = p.y - queryPoint.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return { ...p, dist };
    });

    withDist.sort((a, b) => a.dist - b.dist);
    const nn = withDist.slice(0, k);
    const maxRadius = nn.length > 0 ? nn[nn.length - 1].dist : 40;

    const voteCount = { A: 0, B: 0 };
    nn.forEach(item => {
      voteCount[item.label] = (voteCount[item.label] || 0) + 1;
    });

    const pred = voteCount.A >= voteCount.B ? 'A' : 'B';
    const conf = Math.round((Math.max(voteCount.A, voteCount.B) / k) * 100);

    return {
      nearestNeighbors: nn,
      radius: maxRadius,
      votes: voteCount,
      prediction: pred,
      confidence: conf
    };
  }, [queryPoint, k]);

  const handleSvgClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 450;
    const clickY = ((e.clientY - rect.top) / rect.height) * 280;

    setQueryPoint({
      x: Math.max(30, Math.min(420, Math.round(clickX))),
      y: Math.max(30, Math.min(250, Math.round(clickY)))
    });
    AudioEngine.playStep();
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-white">הדמיית מנגנון: מרחב תכונות ומעגל השכנים (k-NN)</h3>
        </div>

        {/* Hyperparameter selector */}
        <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
          <span className="text-[10px] text-slate-400 font-mono">k =</span>
          {[1, 3, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => {
                setK(val);
                AudioEngine.playStep();
              }}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                k === val ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {val}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive 2D Feature Space SVG */}
      <div className="relative w-full aspect-[2.2/1] bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="0 0 450 280"
          onClick={handleSvgClick}
          className="w-full h-full cursor-crosshair select-none"
        >
          {/* Axis and Grid */}
          <line x1="40" y1="20" x2="40" y2="250" stroke="#334155" strokeWidth="2" />
          <line x1="40" y1="250" x2="430" y2="250" stroke="#334155" strokeWidth="2" />
          <text x="420" y="242" textAnchor="end" fill="#64748b" fontSize="10">גודל (X) &rarr;</text>
          <text x="50" y="32" textAnchor="start" fill="#64748b" fontSize="10">&uarr; משקל (Y)</text>

          {/* Theoretical Decision Boundary Line */}
          <line x1="60" y1="250" x2="350" y2="30" stroke="#475569" strokeWidth="1.5" strokeDasharray="4,4" className="opacity-50" />
          <text x="210" y="100" fill="#475569" fontSize="9" transform="rotate(-36 210,100)">גבול הפרדה תיאורטי</text>

          {/* k-NN Neighborhood Radius Circle */}
          <circle
            cx={queryPoint.x}
            cy={queryPoint.y}
            r={radius + 4}
            fill="#38bdf8"
            fillOpacity="0.08"
            stroke="#38bdf8"
            strokeWidth="1.5"
            strokeDasharray="4,3"
            className="transition-all duration-300 pointer-events-none"
          />

          {/* Connecting Distance Vectors to Nearest Neighbors */}
          {nearestNeighbors.map(nn => (
            <line
              key={`line-${nn.id}`}
              x1={queryPoint.x}
              y1={queryPoint.y}
              x2={nn.x}
              y2={nn.y}
              stroke="#38bdf8"
              strokeWidth="1.2"
              className="opacity-80 pointer-events-none"
            />
          ))}

          {/* Training Points */}
          {trainingPoints.map(p => {
            const isNN = nearestNeighbors.some(item => item.id === p.id);
            const isA = p.label === 'A';
            return (
              <g key={p.id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isNN ? 7 : 5}
                  fill={isA ? '#ef4444' : '#10b981'}
                  stroke={isNN ? '#ffffff' : '#0f172a'}
                  strokeWidth={isNN ? 2 : 1}
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* Query Point (Interactive) */}
          <g transform={`translate(${queryPoint.x}, ${queryPoint.y})`} className="pointer-events-none">
            <circle
              cx="0"
              cy="0"
              r="9"
              fill={prediction === 'A' ? '#ef4444' : '#10b981'}
              stroke="#ffffff"
              strokeWidth="2.5"
              className="drop-shadow"
            />
            <circle cx="0" cy="0" r="14" fill="none" stroke="#38bdf8" strokeWidth="1" className="animate-ping opacity-40" />
            <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">?</text>
          </g>
        </svg>
      </div>

      {/* Real-time Classification Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400">סיווג הרוב (k={k}):</div>
          <div className={`text-xs font-bold mt-0.5 ${prediction === 'A' ? 'text-red-400' : 'text-emerald-400'}`}>
            {prediction === 'A' ? 'תפוח אדום (A)' : 'אבטיח ירוק (B)'}
          </div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400">התפלגות קולות השכנים:</div>
          <div className="text-xs font-mono text-white mt-0.5">
            <span className="text-red-400 font-bold">{votes.A}</span> אדום : <span className="text-emerald-400 font-bold">{votes.B}</span> ירוק
          </div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400">רמת ביטחון:</div>
          <div className="text-xs font-mono font-bold text-blue-400 mt-0.5">{confidence}%</div>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 text-center">
        הקליקו במקומות שונים על הגרף כדי להזיז את עצם הבדיקה (?) ולראות כיצד המעגל מקיף את השכנים הקרובים ומכריע לפי רוב.
      </p>
    </div>
  );
}
