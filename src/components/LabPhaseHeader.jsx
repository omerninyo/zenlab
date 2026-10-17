import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sliders, 
  Star
} from 'lucide-react';
import { StorageEngine } from '../core/storage.js';
import { NarrationEngine } from '../core/narration.js';
import { AudioEngine } from '../core/audio.js';
import { getLabMeta } from '../core/labMeta.js';
import { BespokeStarBadge } from './BespokeIllustrations.jsx';

export default function LabPhaseHeader({ 
  labData, 
  currentPhase, 
  onPhaseChange,
  earnedStars = 0,
  totalLabChallenges = 3,
  phase,
  setPhase,
  title,
  subtitle,
  badge,
  number,
  completedCount,
  totalCount,
  labId
}) {
  const [, setIsNarrationEnabled] = useState(() => StorageEngine.getState().isNarrationEnabled);
  const [, setNarrationState] = useState(() => NarrationEngine.getState());
  const [isDapimActive, setIsDapimActive] = useState(() => StorageEngine.getDapimMode());

  const activePhase = currentPhase || phase || 'theory';
  const setActivePhase = onPhaseChange || setPhase || (() => {});
  const starsEarned = earnedStars || completedCount || 0;
  const starsTotal = totalLabChallenges || totalCount || 3;
  const data = labData || {
    id: labId || 'unknown',
    number: number || 1,
    title: title || '',
    subtitle: subtitle || '',
    badge: badge || 'מדעי המחשב',
    challenges: []
  };

  const meta = getLabMeta(data.id);

  useEffect(() => {
    const unsubStorage = StorageEngine.subscribe(state => {
      setIsNarrationEnabled(state.isNarrationEnabled);
      if (typeof state.dapimMode === 'boolean') {
        setIsDapimActive(state.dapimMode);
      }
    });
    const unsubNarration = NarrationEngine.subscribe(state => {
      setNarrationState(state);
    });

    return () => {
      unsubStorage();
      unsubNarration();
    };
  }, []);

  const handleSelectPhase = (newPhase) => {
    const applyPhase = () => {
      setActivePhase(newPhase);
      if (data.id && data.id !== 'unknown') {
        StorageEngine.setLabPhase(data.id, newPhase);
      }
    };
    if (typeof document !== 'undefined' && typeof document.startViewTransition === 'function') {
      document.startViewTransition(() => {
        applyPhase();
      });
    } else {
      applyPhase();
    }
    AudioEngine.playStep();
  };

  return (
    <div className={
      isDapimActive
        ? "card-tactile !p-2.5 sm:!p-3.5 rounded-2xl text-slate-900 dark:text-white"
        : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3.5 shadow-xs text-slate-900 dark:text-white"
    } dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        
        {/* Right Side (RTL Start): Lab Icon + Title + Subtitle */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-900 dark:bg-slate-800 border border-amber-400/40 flex items-center justify-center shrink-0 text-amber-400 shadow-sm">
            {React.createElement(meta.icon, { className: "w-4.5 h-4.5 sm:w-5 sm:h-5" })}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
                תחנה {data.number}/8
              </span>
              <h1 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight leading-snug truncate">
                {data.title}
              </h1>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug font-medium line-clamp-1 hidden sm:block">
              {data.subtitle}
            </p>
          </div>
        </div>

        {/* Left Side (RTL End): 2-Phase Segmented Switch + Earned Stars Pill */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
          
          {/* 2-Phase Segmented Switch */}
          <div className={
            isDapimActive
              ? "segmented-glass-container flex-1 sm:flex-initial"
              : "flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700/80 flex-1 sm:flex-initial shadow-inner"
          }>
            <button
              type="button"
              onClick={() => handleSelectPhase('theory')}
              className={
                isDapimActive
                  ? `segmented-glass-item flex-1 sm:flex-initial !py-1.5 !px-3 !text-xs ${
                      activePhase === 'theory' ? 'segmented-glass-item-active' : ''
                    }`
                  : `flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activePhase === 'theory'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
              }
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0" />
              <span>1. סיפור ומדיה</span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectPhase('interactive')}
              className={
                isDapimActive
                  ? `segmented-glass-item flex-1 sm:flex-initial !py-1.5 !px-3 !text-xs ${
                      activePhase === 'interactive' ? 'segmented-glass-item-active' : ''
                    }`
                  : `flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activePhase === 'interactive'
                        ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`
              }
            >
              <Sliders className="w-3.5 h-3.5 shrink-0" />
              <span>2. מעבדת המשחק</span>
              {starsEarned < starsTotal && activePhase !== 'interactive' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
              )}
            </button>
          </div>

          {/* Earned Stars Pill */}
          <div className={
            isDapimActive
              ? "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)] text-amber-400 text-xs font-black shadow-xs shrink-0"
              : "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-slate-950 border border-amber-300/80 dark:border-amber-500/40 text-amber-900 dark:text-amber-300 text-xs font-black shadow-xs shrink-0"
          }>
            <BespokeStarBadge size={15} filled={starsEarned > 0} />
            <span>{starsEarned}/{starsTotal}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
