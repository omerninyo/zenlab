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
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:p-6 space-y-4 shadow-sm">
      {/* Top Meta Line & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
              {data.badge}
            </span>
            <span className="text-xs text-slate-400">מעבדה {data.number} מתוך 8</span>
            <div className="flex items-center gap-1 mr-2 px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-amber-300 text-xs font-mono">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{starsEarned}/{starsTotal} כוכבים</span>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white tracking-tight">{data.title}</h1>
          <p className="text-sm text-slate-400 mt-1">{data.subtitle}</p>
        </div>

        {/* Global Persistent Voiceover / Narration Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            type="button"
            onClick={handleToggleNarration}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
              isNarrationEnabled
                ? 'bg-blue-950/80 border-blue-600 text-blue-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="הפעלה/השבתה של ליווי קולי"
          >
            <Headphones className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-blue-400' : ''}`} />
            <span>הסבר קולי</span>
            {isSpeaking && (
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            )}
          </button>
        </div>
      </div>

      {/* Two-Phase Navigation Switcher */}
      <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            type="button"
            onClick={() => handleSelectPhase('theory')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activePhase === 'theory'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>שלב 1: הבנה תיאורטית ומדיה</span>
          </button>

          <button
            type="button"
            onClick={() => handleSelectPhase('interactive')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition-all ${
              activePhase === 'interactive'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>שלב 2: התנסות אינטראקטיבית</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-400 hidden sm:block">
          {activePhase === 'theory' ? (
            <span>למדו את העקרונות וההדמיה, ולאחר מכן עברו לתרגול מעשי &larr;</span>
          ) : (
            <span>מעבדת התנסות חיה: השלימו את האתגרים וצברו כוכבים &larr;</span>
          )}
        </div>
      </div>
    </div>
  );
}
