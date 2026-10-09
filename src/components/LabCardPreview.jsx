import React from 'react';

/**
 * LabCardPreview
 * Compact, responsive micro-visual preview graphics for the 8 lab stations.
 * Gives 5th-grade learners an immediate visual preview of the lab's core mechanism.
 * Dimensions: 54px x 42px (compact, zero layout disruption on mobile).
 */
export default function LabCardPreview({ labId, isDapimActive = false }) {
  const strokeColor = isDapimActive ? 'var(--slate-8)' : '#94a3b8';
  const accentColor = isDapimActive ? 'var(--accent-base)' : '#2563eb';
  const nodeBg = isDapimActive ? 'var(--slate-4)' : '#e2e8f0';

  switch (labId) {
    case 'lab1': // Pixel Art (4x4 bit grid)
      return (
        <div className="w-[54px] h-[42px] rounded-md bg-[var(--slate-3)] border border-[var(--slate-6)] p-1 grid grid-cols-4 gap-0.5 shrink-0 shadow-xs">
          {[1, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0].map((val, idx) => (
            <div
              key={idx}
              className={`rounded-[1.5px] transition-colors ${
                val ? 'bg-amber-400 dark:bg-amber-500' : 'bg-slate-200 dark:bg-slate-800'
              }`}
            />
          ))}
        </div>
      );

    case 'lab2': // Algorithmic Robot (3x3 grid with arrow)
      return (
        <div className="w-[54px] h-[42px] rounded-md bg-[var(--slate-3)] border border-[var(--slate-6)] p-1 flex items-center justify-between gap-1 shrink-0 shadow-xs">
          <div className="grid grid-cols-3 gap-0.5 w-7 h-7">
            {[0, 0, 2, 1, 1, 0, 0, 0, 0].map((val, idx) => (
              <div
                key={idx}
                className={`rounded-[1px] ${
                  val === 2
                    ? 'bg-emerald-500'
                    : val === 1
                    ? 'bg-blue-500'
                    : 'bg-slate-200 dark:bg-slate-800'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] font-mono font-bold text-blue-500">&rarr;</span>
        </div>
      );

    case 'lab3': // Decision Tree (Node branches)
      return (
        <div className="w-[54px] h-[42px] rounded-md bg-[var(--slate-3)] border border-[var(--slate-6)] p-1 flex flex-col items-center justify-center shrink-0 shadow-xs">
          <svg width="44" height="34" viewBox="0 0 44 34" fill="none">
            {/* Top Node */}
            <circle cx="22" cy="7" r="4" fill={accentColor} />
            {/* Branches */}
            <path d="M22 11 L12 23" stroke={strokeColor} strokeWidth="1.5" />
            <path d="M22 11 L32 23" stroke={strokeColor} strokeWidth="1.5" />
            {/* Leaf Nodes */}
            <rect x="8" y="23" width="8" height="6" rx="1.5" fill="#10b981" />
            <rect x="28" y="23" width="8" height="6" rx="1.5" fill="#f43f5e" />
          </svg>
        </div>
      );

    case 'lab4': // Waze Robot Pathfinding
      return (
        <div className="w-[54px] h-[42px] rounded-md bg-[var(--slate-3)] border border-[var(--slate-6)] p-1 flex items-center justify-center shrink-0 shadow-xs">
          <svg width="46" height="34" viewBox="0 0 46 34" fill="none">
            {/* Path */}
            <path
              d="M8 26 L22 26 L22 10 L38 10"
              stroke={accentColor}
              strokeWidth="2.5"
              strokeDasharray="3 2"
              strokeLinecap="round"
            />
            {/* Start & End Points */}
            <circle cx="8" cy="26" r="3.5" fill="#0284c7" />
            <circle cx="38" cy="10" r="3.5" fill="#10b981" />
          </svg>
        </div>
      );

    case 'lab5': // Machine Learning Classifier (2 clusters)
      return (
        <div className="w-[54px] h-[42px] rounded-md bg-[var(--slate-3)] border border-[var(--slate-6)] p-1 flex items-center justify-center shrink-0 shadow-xs">
          <svg width="46" height="34" viewBox="0 0 46 34" fill="none">
            {/* Decision Boundary Line */}
            <line x1="8" y1="30" x2="38" y2="4" stroke={strokeColor} strokeWidth="1.5" strokeDasharray="2 2" />
            {/* Cluster A (Cats) */}
            <circle cx="14" cy="10" r="2.5" fill="#38bdf8" />
            <circle cx="18" cy="16" r="2.5" fill="#38bdf8" />
            <circle cx="10" cy="18" r="2.5" fill="#38bdf8" />
            {/* Cluster B (Dogs) */}
            <circle cx="28" cy="26" r="2.5" fill="#ca8a04" />
            <circle cx="34" cy="20" r="2.5" fill="#ca8a04" />
            <circle cx="36" cy="28" r="2.5" fill="#ca8a04" />
          </svg>
        </div>
      );

    case 'lab6': // Computer Vision Kernel Matrix
      return (
        <div className="w-[54px] h-[42px] rounded-md bg-[var(--slate-3)] border border-[var(--slate-6)] p-1 flex items-center justify-center shrink-0 shadow-xs">
          <div className="relative w-8 h-8 rounded border border-blue-400 bg-blue-500/10 flex items-center justify-center">
            <div className="w-4 h-4 border border-dashed border-amber-500 bg-amber-500/20 rounded-[1px]" />
            <span className="absolute -top-1 -right-1 text-[8px] font-mono text-amber-500 font-bold">3x3</span>
          </div>
        </div>
      );

    case 'lab7': // Smart Perceptron (Inputs -> Weights -> Output)
      return (
        <div className="w-[54px] h-[42px] rounded-md bg-[var(--slate-3)] border border-[var(--slate-6)] p-1 flex items-center justify-center shrink-0 shadow-xs">
          <svg width="46" height="34" viewBox="0 0 46 34" fill="none">
            {/* Lines from 3 inputs */}
            <line x1="8" y1="8" x2="26" y2="17" stroke={strokeColor} strokeWidth="1.2" />
            <line x1="8" y1="17" x2="26" y2="17" stroke={strokeColor} strokeWidth="1.2" />
            <line x1="8" y1="26" x2="26" y2="17" stroke={strokeColor} strokeWidth="1.2" />
            {/* 3 Inputs */}
            <circle cx="8" cy="8" r="2.5" fill={nodeBg} stroke={strokeColor} strokeWidth="1" />
            <circle cx="8" cy="17" r="2.5" fill={nodeBg} stroke={strokeColor} strokeWidth="1" />
            <circle cx="8" cy="26" r="2.5" fill={nodeBg} stroke={strokeColor} strokeWidth="1" />
            {/* Perceptron Node */}
            <circle cx="26" cy="17" r="5" fill="#e11d48" />
            {/* Output Line */}
            <line x1="31" y1="17" x2="40" y2="17" stroke="#e11d48" strokeWidth="1.5" />
          </svg>
        </div>
      );

    case 'lab8': // Language Model Predictor (Next token chip)
      return (
        <div className="w-[54px] h-[42px] rounded-md bg-[var(--slate-3)] border border-[var(--slate-6)] p-1 flex flex-col items-center justify-center gap-0.5 shrink-0 shadow-xs">
          <span className="text-[9px] font-bold text-slate-500">שלום</span>
          <span className="text-[9px] font-bold text-[var(--accent-base)] bg-[var(--accent-wash)] px-1 rounded-[2px] border border-[var(--accent-rim)]">
            עולם✦
          </span>
        </div>
      );

    default:
      return null;
  }
}
