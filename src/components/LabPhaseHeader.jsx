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
    <div className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-7 space-y-5 shadow-sm text-slate-900 dark:text-white" dir="rtl">
      {/* Top Meta Line & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-slate-800 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-slate-700">
              {data.badge}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400">
              מעבדה {data.number} מתוך 8
            </span>
            <div className="flex items-center gap-1.5 mr-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-slate-950 border border-amber-300 dark:border-slate-800 text-amber-800 dark:text-amber-300 text-xs sm:text-sm font-bold shadow-sm">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span>{starsEarned}/{starsTotal} כוכבים</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {data.title}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {data.subtitle}
          </p>
        </div>

        {/* Global Persistent Voiceover / Narration Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleToggleNarration}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border-2 text-xs sm:text-sm font-bold transition-all shadow-sm ${
              isNarrationEnabled
                ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-500 text-blue-800 dark:text-blue-200'
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="הפעלה/השבתה של ליווי קולי"
          >
            <Headphones className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-blue-600 dark:text-blue-400' : ''}`} />
            <span>הסבר קולי</span>
            {isSpeaking && (
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 dark:bg-blue-400 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Two-Phase Navigation Switcher */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleSelectPhase('theory')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activePhase === 'theory'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/60'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>שלב 1: הבנה וסיור מודרך</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPhase('interactive')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activePhase === 'interactive'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-900/60'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>שלב 2: התנסות אינטראקטיבית</span>
          </button>
        </div>

        <div className="text-xs sm:text-sm font-semibold text-slate-500 dark:text-slate-400 hidden sm:block">
          {activePhase === 'theory' ? (
            <span>למדו את הרעיון וההדמיה, ולאחר מכן עברו לתרגול מעשי &larr;</span>
          ) : (
            <span>מעבדת התנסות חיה: השלימו את האתגרים וצברו כוכבים &larr;</span>
          )}
        </div>
      </div>
    </div>
  );
}
