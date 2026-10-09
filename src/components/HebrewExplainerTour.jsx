import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  ArrowLeft, 
  ArrowRight, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  Lightbulb,
  CheckCircle2,
  Tv
} from 'lucide-react';
import { NarrationEngine } from '../core/narration.js';
import { AudioEngine } from '../core/audio.js';

export default function HebrewExplainerTour({ labData = {} }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlayingAuto, setIsPlayingAuto] = useState(false);
  const [narrationState, setNarrationState] = useState(() => NarrationEngine.getState());

  const tourSteps = labData.explainerTour || [
    {
      step: 1,
      title: labData.title || 'הכרת הנושא',
      narrative: labData.conceptExplanation?.summary || 'בואו נחקור יחד את עולם מדעי המחשב והבינה המלאכותית!',
      highlight: 'צעד ראשון במסע'
    }
  ];

  const currentStep = tourSteps[currentStepIndex] || tourSteps[0];
  const totalSteps = tourSteps.length;

  useEffect(() => {
    const unsub = NarrationEngine.subscribe(state => {
      setNarrationState(state);
    });
    return unsub;
  }, []);

  // When step changes while playing, play narration
  useEffect(() => {
    if (isPlayingAuto && currentStep?.narrative) {
      NarrationEngine.play(currentStep.narrative);
    }
  }, [currentStepIndex, isPlayingAuto]);

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex(prev => prev + 1);
      AudioEngine.playStep();
    } else {
      setIsPlayingAuto(false);
      AudioEngine.playSuccess();
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      AudioEngine.playStep();
    }
  };

  const handleToggleAutoPlay = () => {
    if (isPlayingAuto) {
      setIsPlayingAuto(false);
      NarrationEngine.stop();
    } else {
      setIsPlayingAuto(true);
      AudioEngine.playStep();
      if (currentStep?.narrative) {
        NarrationEngine.play(currentStep.narrative);
      }
    }
  };

  const handleReset = () => {
    setCurrentStepIndex(0);
    setIsPlayingAuto(false);
    NarrationEngine.stop();
    AudioEngine.playStep();
  };

  return (
    <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm space-y-6 text-slate-800" dir="rtl">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold shadow-sm">
            <Tv className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>סיור מודרך מונפש בעברית</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                100% עברית קלה
              </span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              הסבר אינטראקטיבי ידידותי שלב-אחר-שלב במקום סרטונים באנגלית
            </p>
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200 text-xs">
          {tourSteps.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setCurrentStepIndex(idx);
                AudioEngine.playStep();
                if (isPlayingAuto && s.narrative) {
                  NarrationEngine.play(s.narrative);
                }
              }}
              className={`px-3 py-1 rounded-md font-bold transition-all text-xs ${
                currentStepIndex === idx
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              {idx + 1}
            </button>
          ))}
          <span className="text-[11px] text-slate-500 font-medium px-2">
            שלב {currentStepIndex + 1} מתוך {totalSteps}
          </span>
        </div>
      </div>

      {/* Main Interactive Stage Box */}
      <div className="relative min-h-[220px] sm:min-h-[260px] bg-gradient-to-br from-blue-50/60 via-white to-amber-50/40 rounded-xl border-2 border-blue-100 p-6 sm:p-8 flex flex-col justify-between shadow-inner overflow-hidden">
        {/* Step Badge & Topic */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-blue-100/90 text-blue-800 text-xs font-extrabold border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>תחנה {currentStepIndex + 1}: {currentStep.title}</span>
            </span>

            {currentStep.highlight && (
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-100/80 px-3 py-1 rounded-md border border-amber-200">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                <span>{currentStep.highlight}</span>
              </span>
            )}
          </div>

          {/* Spoken Narrative in Large, Legible Typography */}
          <div className="text-base sm:text-xl font-medium text-slate-800 leading-relaxed sm:leading-loose pt-2">
            {currentStep.narrative}
          </div>
        </div>

        {/* Live Audio Progress Bar */}
        {narrationState.isPlaying && (
          <div className="mt-4 pt-3 border-t border-blue-100/80">
            <div className="flex items-center justify-between text-xs text-blue-800 font-semibold mb-1">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-blue-600 animate-pulse" />
                <span>הקריינות מושמעת עכשיו...</span>
              </span>
              <span className="font-mono">{narrationState.progress}%</span>
            </div>
            <div className="w-full h-2 bg-blue-100 rounded overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded transition-all duration-200"
                style={{ width: `${narrationState.progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Control Buttons Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Auto Play / Pause Toggle */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToggleAutoPlay}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all ${
              isPlayingAuto
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isPlayingAuto ? (
              <>
                <Pause className="w-4 h-4" />
                <span>השהיית סיור והקראה</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>הפעלת סיור עם קריינות קולית</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors"
            title="התחלת הסיור מההתחלה"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Step Navigation Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border transition-colors ${
              currentStepIndex === 0
                ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>הקודם</span>
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
          >
            <span>{currentStepIndex === totalSteps - 1 ? 'סיום והתחלת מעבדה!' : 'השלב הבא'}</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
