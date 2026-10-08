import React, { useState, useEffect } from 'react';
import { 
  Binary, 
  Bot, 
  Network, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Star, 
  BookOpen, 
  Compass,
  Cpu,
  Headphones
} from 'lucide-react';
import curriculumData from './data/curriculum.json';
import { StorageEngine } from './core/storage.js';
import { AudioEngine } from './core/audio.js';
import { NarrationEngine } from './core/narration.js';
import Lab1_BinaryPixels from './labs/Lab1_BinaryPixels.jsx';
import Lab2_AlgorithmicRobot from './labs/Lab2_AlgorithmicRobot.jsx';
import Lab3_MachineLearningClassifier from './labs/Lab3_MachineLearningClassifier.jsx';
import Lab4_LanguageModelPredictor from './labs/Lab4_LanguageModelPredictor.jsx';

export default function App() {
  const [activeLabId, setActiveLabId] = useState(() => StorageEngine.getState().activeLabId || 'lab1');
  const [isMuted, setIsMuted] = useState(() => StorageEngine.getState().isMuted);
  const [totalStars, setTotalStars] = useState(() => StorageEngine.getState().totalStars);
  const [labStars, setLabStars] = useState(() => StorageEngine.getState().labStars);
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(() => StorageEngine.getState().isNarrationEnabled);
  const [narrationState, setNarrationState] = useState(() => NarrationEngine.getState());

  useEffect(() => {
    const unsubStorage = StorageEngine.subscribe(state => {
      setIsMuted(state.isMuted);
      setTotalStars(state.totalStars);
      setLabStars(state.labStars);
      setActiveLabId(state.activeLabId);
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

  const handleLabSelect = (id) => {
    setActiveLabId(id);
    StorageEngine.setActiveLab(id);
    AudioEngine.playStep();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    StorageEngine.setMuted(nextMuted);
  };

  const handleToggleNarration = () => {
    const next = StorageEngine.toggleNarration();
    setIsNarrationEnabled(next);
    if (!next) {
      NarrationEngine.stop();
    } else {
      const curLab = curriculumData.labs[activeLabId];
      if (curLab?.media?.narration?.transcript) {
        NarrationEngine.play(curLab.media.narration.transcript, curLab.media.narration.audioSrc);
      }
    }
  };

  const handleResetProgress = () => {
    if (window.confirm('האם לאפס את כל ההתקדמות והכוכבים שנצברו?')) {
      StorageEngine.resetProgress();
      AudioEngine.playTone(200, 'sawtooth', 0.15);
    }
  };

  const navItems = [
    { id: 'lab1', label: '1. פיקסלים בינאריים', icon: Binary },
    { id: 'lab2', label: '2. רובוט אלגוריתמי', icon: Bot },
    { id: 'lab3', label: '3. מסווג למידת מכונה', icon: Network },
    { id: 'lab4', label: '4. מודל שפה וחיזוי', icon: Sparkles }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-slate-800">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-white">ZenLab</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  v0.2.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                מעבדה אינטראקטיבית למדעי המחשב ובינה מלאכותית
              </p>
            </div>
          </div>

          {/* Action Tools: Stars Counter, Narration Toggle, Audio Toggle, Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stars Achievement Badge */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-semibold text-amber-300">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-mono">{totalStars}</span>
              <span className="text-slate-500 font-normal hidden sm:inline">כוכבים</span>
            </div>

            {/* Voiceover Narration Switch */}
            <button
              type="button"
              onClick={handleToggleNarration}
              title={isNarrationEnabled ? 'השבת ליווי קולי' : 'הפעל ליווי קולי'}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors flex items-center gap-1.5 ${
                isNarrationEnabled 
                  ? 'bg-blue-950/80 border-blue-600 text-blue-300' 
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              <Headphones className={`w-4 h-4 ${narrationState.isPlaying && !narrationState.isPaused ? 'animate-pulse text-blue-400' : ''}`} />
              <span className="hidden md:inline">ליווי קולי</span>
            </button>

            {/* Audio Mute Switch */}
            <button
              type="button"
              onClick={handleToggleMute}
              title={isMuted ? 'הפעל צלילים' : 'השתק צלילים'}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
            </button>

            {/* Reset Progress Button */}
            <button
              type="button"
              onClick={handleResetProgress}
              title="איפוס התקדמות"
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Lab Selection Navigation Tabs */}
      <nav className="bg-slate-900 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto py-2.5 no-scrollbar">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = activeLabId === item.id;
              const stars = labStars[item.id] || 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLabSelect(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {stars > 0 && (
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono ${
                      isActive ? 'bg-blue-700 text-amber-200' : 'bg-slate-900 text-amber-400 border border-slate-800'
                    }`}>
                      {stars}★
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Educational Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeLabId === 'lab1' && <Lab1_BinaryPixels curriculum={curriculumData} />}
        {activeLabId === 'lab2' && <Lab2_AlgorithmicRobot curriculum={curriculumData} />}
        {activeLabId === 'lab3' && <Lab3_MachineLearningClassifier curriculum={curriculumData} />}
        {activeLabId === 'lab4' && <Lab4_LanguageModelPredictor curriculum={curriculumData} />}
      </main>

      {/* Footer Notice with Zero-PII Hygiene */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span>ZenLab &copy; 2026</span>
            <span>&bull;</span>
            <span>רישיון קוד פתוח MIT</span>
            <span>&bull;</span>
            <span>Code &amp; AI Explorer Team</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>פועל במלואו בדפדפן (Client-Side SPA)</span>
            <span>&bull;</span>
            <span>ללא איסוף נתונים (Zero-PII)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
