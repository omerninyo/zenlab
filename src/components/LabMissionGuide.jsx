import React, { useState } from 'react';
import { 
  Target, 
  CheckCircle2, 
  HelpCircle, 
  Volume2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Award, 
  ArrowLeft,
  Star
} from 'lucide-react';
import { NarrationEngine } from '../core/narration.js';
import { AudioEngine } from '../core/audio.js';

/**
 * LabMissionGuide
 * 
 * An interactive, child-centric banner displayed at the top of Phase 2 (Sandbox) in every lab.
 * Guides 5th-grade learners (ages 10-11) step-by-step:
 * 1. Highlights the current active challenge (what to do next).
 * 2. Provides actionable micro-instructions and toggleable hints.
 * 3. Offers one-click Hebrew voice narration for reading support.
 * 4. Shows a celebratory banner when all 3 challenges are completed.
 */
export default function LabMissionGuide({
  challenges = [],
  completedChallenges = {},
  labNumber = 1,
  onOpenNextLab = null
}) {
  const [showHint, setShowHint] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Find the first uncompleted challenge
  const activeIndex = challenges.findIndex(ch => !completedChallenges[ch.id]);
  const isAllCompleted = activeIndex === -1 && challenges.length > 0;
  const currentChallenge = isAllCompleted ? null : challenges[activeIndex];
  const completedCount = challenges.filter(ch => completedChallenges[ch.id]).length;

  const handleSpeakMission = () => {
    if (!currentChallenge) return;
    const textToSpeak = `משימה ${activeIndex + 1}: ${currentChallenge.title}. ${currentChallenge.instructions || currentChallenge.description || ''}`;
    
    setIsSpeaking(true);
    AudioEngine.playStep();
    NarrationEngine.speak(textToSpeak);
    setTimeout(() => setIsSpeaking(false), 4000);
  };

  if (!challenges || challenges.length === 0) return null;

  // All challenges completed: Celebration Banner
  if (isAllCompleted) {
    return (
      <div 
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-emerald-950/80 border-2 border-emerald-500/70 p-4 sm:p-5 shadow-lg animate-in fade-in duration-300"
        dir="rtl"
      >
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 text-center sm:text-right">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shrink-0 shadow-inner">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold mb-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>המעבדה הושלמה בהצטיינות!</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                כל הכבוד! פתרתם את כל {challenges.length} האתגרים וצברתם את כל הכוכבים!
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                אתם שולטים בעקרון בצורה מושלמת. המשיכו לחקור בחופשיות או עברו לתחנה הבאה במסע.
              </p>
            </div>
          </div>

          {onOpenNextLab && (
            <button
              type="button"
              onClick={onOpenNextLab}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all shrink-0"
            >
              <span>לתחנה הבאה</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Active Mission Banner
  return (
    <div 
      className="relative rounded-2xl bg-slate-900/95 dark:bg-slate-900/95 border-2 border-blue-500/50 dark:border-blue-500/50 p-3.5 sm:p-4 shadow-md transition-all duration-200"
      dir="rtl"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left/Main: Current Step Badge + Mission Details */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-400/40 flex items-center justify-center text-blue-400 shrink-0 mt-0.5 shadow-inner">
            <Target className="w-5 h-5 animate-pulse" />
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-bold">
                <span>🎯 המשימה הנוכחית שלכם</span>
                <span className="font-mono text-[11px]">({activeIndex + 1} מתוך {challenges.length})</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>פרס: +1 כוכב</span>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
              {currentChallenge.title}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
              {currentChallenge.instructions || currentChallenge.description}
            </p>
          </div>
        </div>

        {/* Action buttons: Read aloud & Hint toggle */}
        <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 w-full sm:w-auto justify-between sm:justify-end">
          <button
            type="button"
            onClick={handleSpeakMission}
            title="הקראת המשימה בקול"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isSpeaking
                ? 'bg-blue-600 border-blue-400 text-white animate-pulse'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'
            }`}
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{isSpeaking ? 'מקריא...' : 'הקרא משימה'}</span>
          </button>

          {(currentChallenge.hint || currentChallenge.successMessage) && (
            <button
              type="button"
              onClick={() => {
                setShowHint(prev => !prev);
                AudioEngine.playStep();
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-800/60 text-amber-300 text-xs font-semibold transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>צריכים רמז?</span>
              {showHint ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable Hint Drawer */}
      {showHint && currentChallenge.hint && (
        <div className="mt-3 pt-3 border-t border-slate-800 text-xs text-amber-200/90 bg-amber-950/30 p-2.5 rounded-xl border border-amber-800/40 flex items-start gap-2 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-300">טיפ בלשי קטן: </strong>
            <span>{currentChallenge.hint}</span>
          </div>
        </div>
      )}
    </div>
  );
}
