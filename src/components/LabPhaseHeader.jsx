import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Sliders, 
  Star,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { StorageEngine } from '../core/storage.js';
import { NarrationEngine } from '../core/narration.js';
import { AudioEngine } from '../core/audio.js';

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
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(() => StorageEngine.getState().isNarrationEnabled);
  const [narrationState, setNarrationState] = useState(() => NarrationEngine.getState());
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
    setActivePhase(newPhase);
    if (data.id && data.id !== 'unknown') {
      StorageEngine.setLabPhase(data.id, newPhase);
    }
    AudioEngine.playStep();
  };

  return (
    <div className={
      isDapimActive
        ? "card-tactile !p-3 sm:!p-5 space-y-3 sm:space-y-4 text-white"
        : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 sm:p-6 space-y-3 sm:space-y-4 shadow-xs text-slate-900 dark:text-white"
    } dir="rtl">
      
      {/* Top on Mobile / Bottom on Desktop: Apple-Style Segmented Control for Phases */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:order-last sm:pt-2 sm:border-t sm:border-slate-100 sm:dark:border-slate-800/80">
        <div className={
          isDapimActive
            ? "segmented-glass-container"
            : "flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80"
        }>
          <button
            type="button"
            onClick={() => handleSelectPhase('theory')}
            className={
              isDapimActive
                ? `segmented-glass-item flex-1 sm:flex-initial !py-1.5 sm:!py-2 !px-3 sm:!px-4 !text-xs sm:!text-sm ${
                    activePhase === 'theory' ? 'segmented-glass-item-active' : ''
                  }`
                : `flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-bold transition-all ${
                    activePhase === 'theory'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
            }
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="sm:hidden">שלב 1: לומדים</span>
            <span className="hidden sm:inline">שלב 1: הבנה ומדיה</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPhase('interactive')}
            className={
              isDapimActive
                ? `segmented-glass-item flex-1 sm:flex-initial !py-1.5 sm:!py-2 !px-3 sm:!px-4 !text-xs sm:!text-sm ${
                    activePhase === 'interactive' ? 'segmented-glass-item-active' : ''
                  }`
                : `flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-bold transition-all ${
                    activePhase === 'interactive'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
            }
          >
            <Sliders className="w-4 h-4 shrink-0" />
            <span className="sm:hidden">שלב 2: מתנסים</span>
            <span className="hidden sm:inline">שלב 2: מעבדה מעשית (3 אתגרים)</span>
            {starsEarned < starsTotal && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            )}
          </button>
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
          {activePhase === 'theory' ? (
            <span>הסבר מודרך, סרטון ופודקאסט &larr;</span>
          ) : (
            <span>ארגז חול חי: פתרו אתגרים וצברו כוכבים &larr;</span>
          )}
        </div>
      </div>

      {/* Lab Title, Badge & Star Progress */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5 sm:space-y-1">
          <div className="hidden sm:flex items-center gap-2">
            <span className={
              isDapimActive
                ? "badge-glass badge-glass-accent"
                : "px-2.5 py-0.5 rounded-md text-xs font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
            }>
              {data.badge}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              מעבדה {data.number} מתוך 8
            </span>
          </div>

          <h1 className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
            {data.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mt-0.5">
            {data.subtitle}
          </p>
        </div>

        {/* Stars Progress for this lab */}
        <div className={
          isDapimActive
            ? "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md bg-[var(--slate-3)] border border-[var(--slate-6)] text-amber-400 text-xs sm:text-sm font-bold shadow-xs shrink-0"
            : "flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md bg-amber-50 dark:bg-slate-950 border border-amber-300/80 dark:border-slate-800 text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-bold shadow-xs shrink-0"
        }>
          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-500" />
          <span className="sm:hidden">{starsEarned}/{starsTotal} כוכבים</span>
          <span className="hidden sm:inline">{starsEarned}/{starsTotal} כוכבים הושלמו</span>
        </div>
      </div>

    </div>
  );
}
