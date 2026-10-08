import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Play, 
  Sliders, 
  Headphones, 
  Volume2, 
  VolumeX, 
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
    });
    const unsubNarration = NarrationEngine.subscribe(state => {
      setNarrationState(state);
    });

    return () => {
      unsubStorage();
      unsubNarration();
    };
  }, []);

  const handleToggleNarration = () => {
    const next = StorageEngine.toggleNarration();
    setIsNarrationEnabled(next);
    if (!next) {
      NarrationEngine.stop();
    } else if (data.media?.narration?.transcript) {
      NarrationEngine.play(data.media.narration.transcript, data.media.narration.audioSrc);
    } else {
      AudioEngine.playStep();
    }
  };

  const handleSelectPhase = (newPhase) => {
    setActivePhase(newPhase);
    if (data.id && data.id !== 'unknown') {
      StorageEngine.setLabPhase(data.id, newPhase);
    }
    AudioEngine.playStep();
  };

  const isSpeaking = narrationState.isPlaying && !narrationState.isPaused;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs text-slate-900 dark:text-white" dir="rtl">
      {/* Top Meta Line & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60">
              {data.badge}
            </span>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              מעבדה {data.number} מתוך 8
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {data.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {data.subtitle}
          </p>
        </div>

        {/* Stars Progress for this lab */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-slate-950 border border-amber-300/80 dark:border-slate-800 text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-bold shadow-xs shrink-0 self-start sm:self-auto">
          <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
          <span>{starsEarned}/{starsTotal} כוכבים הושלמו</span>
        </div>
      </div>

      {/* Apple-Style Segmented Control for Phases */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            onClick={() => handleSelectPhase('theory')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activePhase === 'theory'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>שלב 1: הבנה ומדיה</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPhase('interactive')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activePhase === 'interactive'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>שלב 2: מעבדה מעשית (3 אתגרים)</span>
            {starsEarned < starsTotal && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
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
    </div>
  );
}
