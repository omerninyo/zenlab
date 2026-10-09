import React, { useState, useEffect, useMemo } from 'react';
import { 
  Binary, 
  Bot, 
  GitBranch, 
  Compass, 
  Network, 
  Eye, 
  Zap, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Star, 
  BookOpen, 
  Cpu, 
  Headphones, 
  Award, 
  Filter, 
  CheckCircle2, 
  Settings,
  Sun,
  Moon,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  MoreVertical,
  Home,
  Palette
} from 'lucide-react';
import curriculumData from './data/curriculum.json';
import { StorageEngine } from './core/storage.js';
import { AudioEngine } from './core/audio.js';
import { NarrationEngine } from './core/narration.js';
import CertificateModal from './components/CertificateModal.jsx';
import GlossaryModal from './components/GlossaryModal.jsx';
import ClassroomSettingsModal from './components/ClassroomSettingsModal.jsx';
import DesignSystemTestModal from './components/DesignSystemTestModal.jsx';
import ZenAiTutor from './components/ZenAiTutor.jsx';
import HomeDashboard from './components/HomeDashboard.jsx';
import Lab1_BinaryPixels from './labs/Lab1_BinaryPixels.jsx';
import Lab2_AlgorithmicRobot from './labs/Lab2_AlgorithmicRobot.jsx';
import Lab3_DecisionTree from './labs/Lab3_DecisionTree.jsx';
import Lab4_Pathfinder from './labs/Lab4_Pathfinder.jsx';
import Lab5_MachineLearningClassifier from './labs/Lab5_MachineLearningClassifier.jsx';
import Lab6_VisionKernels from './labs/Lab6_VisionKernels.jsx';
import Lab7_Perceptron from './labs/Lab7_Perceptron.jsx';
import Lab8_LanguageModelPredictor from './labs/Lab8_LanguageModelPredictor.jsx';

export default function App() {
  const [activeLabId, setActiveLabId] = useState(() => StorageEngine.getState().activeLabId || 'lab1');
  const [viewMode, setViewMode] = useState(() => StorageEngine.getViewMode?.() || 'home');
  const [isMuted, setIsMuted] = useState(() => StorageEngine.getState().isMuted);
  const [totalStars, setTotalStars] = useState(() => StorageEngine.getState().totalStars);
  const [labStars, setLabStars] = useState(() => StorageEngine.getState().labStars);
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(() => StorageEngine.getState().isNarrationEnabled);
  const [narrationState, setNarrationState] = useState(() => NarrationEngine.getState());
  const [theme, setTheme] = useState(() => StorageEngine.getTheme());
  const [isDapimActive, setIsDapimActive] = useState(() => StorageEngine.getDapimMode());
  const [dapimPalette, setDapimPalette] = useState(() => StorageEngine.getDapimPalette());

  // Track filter state: 'all' | 'algorithms' | 'ai'
  const [selectedTrack, setSelectedTrack] = useState('all');

  // Modals & Menu Drawers state
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isDesignTestOpen, setIsDesignTestOpen] = useState(false);
  const [isLabMenuOpen, setIsLabMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  useEffect(() => {
    // Check URL parameters for instant testing on mobile/remote (?design=zen2, ?zen2=true, ?theme=dark|light)
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        const designParam = params.get('design') || params.get('zen2');
        if (designParam === 'zen2' || designParam === 'true' || designParam === '2') {
          StorageEngine.setDapimMode(true);
        }
        const paletteParam = params.get('palette');
        if (paletteParam) {
          StorageEngine.setDapimPalette(paletteParam);
        }
        const themeParam = params.get('theme');
        if (themeParam === 'dark' || themeParam === 'light') {
          StorageEngine.setTheme(themeParam);
        }
      } catch {}
    }

    const unsubStorage = StorageEngine.subscribe(state => {
      setTotalStars(state.totalStars);
      setLabStars(state.labStars);
      setIsMuted(state.isMuted);
      setIsNarrationEnabled(state.isNarrationEnabled);
      if (state.theme) setTheme(state.theme);
      if (state.viewMode) setViewMode(state.viewMode);
      if (state.activeLabId) setActiveLabId(state.activeLabId);
      if (typeof state.dapimMode === 'boolean') setIsDapimActive(state.dapimMode);
      if (state.dapimPalette) setDapimPalette(state.dapimPalette);
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
    setViewMode('lab');
    StorageEngine.setViewMode('lab');
    AudioEngine.playStep();
  };

  const handleGoHome = () => {
    setViewMode('home');
    StorageEngine.setViewMode('home');
    AudioEngine.playStep();
  };

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    StorageEngine.setMuted(nextMuted);
  };

  const handleToggleTheme = () => {
    const nextTheme = StorageEngine.toggleTheme();
    setTheme(nextTheme);
    AudioEngine.playStep();
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

  const navItems = [
    { id: 'lab1', number: 1, label: '1. ציור בפיקסלים', shortLabel: 'ציור בפיקסלים', track: 'algorithms', trackName: 'אלגוריתמיקה', icon: Binary },
    { id: 'lab2', number: 2, label: '2. לתכנת רובוט', shortLabel: 'לתכנת רובוט', track: 'algorithms', trackName: 'אלגוריתמיקה', icon: Bot },
    { id: 'lab3', number: 3, label: '3. עץ החלטות בלשי', shortLabel: 'עץ החלטות בלשי', track: 'algorithms', trackName: 'אלגוריתמיקה', icon: GitBranch },
    { id: 'lab4', number: 4, label: '4. הווייז של הרובוט', shortLabel: 'הווייז של הרובוט', track: 'algorithms', trackName: 'אלגוריתמיקה', icon: Compass },
    { id: 'lab5', number: 5, label: '5. איך מחשב לומד?', shortLabel: 'איך מחשב לומד?', track: 'ai', trackName: 'בינה מלאכותית', icon: Network },
    { id: 'lab6', number: 6, label: '6. העיניים של המחשב', shortLabel: 'העיניים של המחשב', track: 'ai', trackName: 'בינה מלאכותית', icon: Eye },
    { id: 'lab7', number: 7, label: '7. נוירון חכם', shortLabel: 'נוירון חכם', track: 'ai', trackName: 'בינה מלאכותית', icon: Zap },
    { id: 'lab8', number: 8, label: '8. מודל שפה חכם', shortLabel: 'מודל שפה חכם', track: 'ai', trackName: 'בינה מלאכותית', icon: Sparkles }
  ];

  const currentIdx = navItems.findIndex(item => item.id === activeLabId);
  const currentLab = navItems[currentIdx] || navItems[0];
  const CurrentIcon = currentLab.icon;

  const handlePrevLab = () => {
    if (currentIdx > 0) {
      handleLabSelect(navItems[currentIdx - 1].id);
    }
  };

  const handleNextLab = () => {
    if (currentIdx < navItems.length - 1) {
      handleLabSelect(navItems[currentIdx + 1].id);
    }
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
        isDapimActive
          ? 'dapim-preview-container'
          : isDark
          ? 'bg-slate-950 text-slate-100 selection:bg-slate-800'
          : 'bg-slate-50 text-slate-800 selection:bg-blue-100 selection:text-blue-900'
      }`}
      data-theme={dapimPalette}
      dir="rtl"
    >
      {/* Top Application Bar - Apple Minimalist & Child-Friendly / Liquid Glass */}
      <header className={isDapimActive ? 'header-glass' : 'sticky top-0 z-40 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs'}>
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Right (RTL): Brand Identity & Dedicated Home Button */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={handleGoHome}
              className="flex items-center gap-2 group text-right cursor-pointer"
              title="חזרה למפת המסע של ZenLab"
            >
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-all ${
                isDapimActive
                  ? 'bg-[var(--slate-3)] border border-[var(--slate-6)] text-[var(--accent-base)] shadow-xs group-hover:border-[var(--accent-rim)]'
                  : 'bg-blue-600 text-white shadow-xs group-hover:bg-blue-500'
              }`}>
                <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 dark:text-white">ZenLab</span>
                  <span className={`text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded-md hidden sm:inline ${
                    isDapimActive
                      ? 'badge-glass badge-glass-accent !text-[10px] !px-1.5 !py-0'
                      : 'bg-blue-100 dark:bg-slate-800 text-blue-800 dark:text-slate-300 border border-blue-200/60 dark:border-slate-700'
                  }`}>
                    כיתה ה׳
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">
                  From Zero to Neural
                </p>
              </div>
            </button>

            {/* Dedicated Home / Roadmap Button (Desktop/Tablet) */}
            <button
              type="button"
              onClick={handleGoHome}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                viewMode === 'home'
                  ? isDapimActive
                    ? 'btn-hollow-primary !h-8 !px-2.5 !text-xs'
                    : 'bg-blue-600 text-white shadow-xs'
                  : isDapimActive
                  ? 'btn-hollow !h-8 !px-2.5 !text-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
              }`}
              title="מפת מסלול הלמידה"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">מפת המסע</span>
            </button>
          </div>

          {/* Center: Compact on Mobile, Full Stepper on Desktop */}
          <div className="relative flex items-center justify-center">
            <div className={
              isDapimActive
                ? "segmented-glass-container"
                : "flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 sm:p-1 rounded-lg border border-slate-200/80 dark:border-slate-700/80 shadow-inner"
            }>
              {/* Prev Button (In RTL, ChevronRight moves to previous index) - Desktop Only */}
              <button
                type="button"
                onClick={handlePrevLab}
                disabled={currentIdx === 0}
                className={`hidden sm:flex p-1 sm:p-1.5 rounded-md disabled:opacity-30 disabled:pointer-events-none transition-colors ${
                  isDapimActive 
                    ? 'text-slate-400 hover:text-white' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
                title="מעבדה קודמת"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Lab Selector Center Button with Icon and Title */}
              <button
                type="button"
                onClick={() => { setIsLabMenuOpen(!isLabMenuOpen); AudioEngine.playStep(); }}
                className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 rounded-md transition-colors cursor-pointer ${
                  isDapimActive
                    ? 'segmented-glass-item segmented-glass-item-active !px-2 sm:!px-2.5 !py-1'
                    : 'hover:bg-white dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                }`}
                title="לחצו לבחירת מעבדה מתוך 8"
              >
                <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-md flex items-center justify-center shrink-0 shadow-xs ${
                  isDapimActive
                    ? 'bg-[var(--slate-4)] text-[var(--accent-base)]'
                    : currentLab.track === 'ai' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
                }`}>
                  <CurrentIcon className="w-3 h-3" />
                </div>
                <span className="text-xs sm:text-sm font-bold truncate max-w-[80px] xs:max-w-[120px] sm:max-w-[200px]">
                  <span className="sm:hidden">מעבדה {currentLab.number}</span>
                  <span className="hidden sm:inline">{currentLab.label}</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isLabMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Next Button (In RTL, ChevronLeft moves to next index) - Desktop Only */}
              <button
                type="button"
                onClick={handleNextLab}
                disabled={currentIdx === navItems.length - 1}
                className={`hidden sm:flex p-1 sm:p-1.5 rounded-md disabled:opacity-30 disabled:pointer-events-none transition-colors ${
                  isDapimActive 
                    ? 'text-slate-400 hover:text-white' 
                    : 'text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700'
                }`}
                title="מעבדה הבאה"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Popover Grid: All 8 Labs */}
            {isLabMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs" 
                  onClick={() => setIsLabMenuOpen(false)} 
                />
                <div className={
                  isDapimActive
                    ? "fixed inset-x-3 top-16 sm:absolute sm:top-full sm:inset-x-auto sm:mt-2 z-50 sm:w-[460px] max-h-[80vh] overflow-y-auto card-tactile !p-3 sm:!p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                    : "fixed inset-x-3 top-16 sm:absolute sm:top-full sm:inset-x-auto sm:mt-2 z-50 sm:w-[460px] max-h-[80vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
                }>
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-bold">
                    <button
                      type="button"
                      onClick={() => { handleGoHome(); setIsLabMenuOpen(false); }}
                      className={`flex items-center gap-1.5 hover:underline cursor-pointer ${
                        isDapimActive ? 'text-[var(--accent-base)]' : 'text-blue-600 dark:text-blue-400'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>חזרה למפת המסע</span>
                    </button>
                    <span className="font-mono text-amber-500">★ {totalStars}/24 כוכבים</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeLabId === item.id;
                      const stars = labStars[item.id] || 0;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            handleLabSelect(item.id);
                            setIsLabMenuOpen(false);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
                            isDapimActive
                              ? isActive
                                ? 'bg-[var(--accent-wash)] border-[var(--accent-rim)] text-white shadow-sm'
                                : 'bg-[var(--slate-3)] hover:bg-[var(--slate-4)] border-[var(--slate-6)] text-slate-200'
                              : isActive
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 ring-2 ring-blue-400/20'
                              : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 shadow-xs ${
                              isDapimActive
                                ? 'bg-[var(--slate-4)] text-[var(--accent-base)]'
                                : item.track === 'ai' ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'
                            }`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                {item.label}
                              </span>
                              <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                                {item.trackName}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 font-mono text-xs font-bold text-amber-500 shrink-0">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>{stars}/3</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Left: Star Counter, Certificate, Audio & More Tools Menu */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Stars Achievement Badge - Tapping on mobile opens Certificate */}
            <button
              type="button"
              onClick={() => { setIsCertificateOpen(true); AudioEngine.playStep(); }}
              title="כוכבים שהושגו - לחצו לצפייה בתעודה"
              className="flex items-center gap-1 sm:gap-1.5 bg-amber-50 dark:bg-slate-950 px-2 sm:px-2.5 py-1.5 rounded-lg border border-amber-300/80 dark:border-slate-800 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 shadow-xs hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-400" />
              <span className="font-mono">{totalStars}</span>
              <span className="text-slate-500 font-normal hidden sm:inline">/ 24</span>
            </button>

            {/* Certificate Button (Desktop Only) */}
            <button
              type="button"
              onClick={() => { setIsCertificateOpen(true); AudioEngine.playStep(); }}
              title="צפייה והדפסת תעודת הצטיינות"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 transition-colors shadow-xs cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>תעודה</span>
            </button>

            {/* Direct Zen 2.0 Design Toggle Button (Desktop Only) */}
            <button
              type="button"
              onClick={() => {
                StorageEngine.toggleDapimMode();
                AudioEngine.playStep();
              }}
              title={isDapimActive ? 'מעבר למצב רגיל' : 'מעבר לעיצוב זֶן 2.0 (Apple Liquid Glass)'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isDapimActive
                  ? 'btn-hollow-primary !h-8 !px-2.5 !text-xs ring-1 ring-[var(--accent-rim)]'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full shrink-0 ${isDapimActive ? 'bg-[var(--accent-base)] animate-pulse' : 'bg-slate-400'}`} />
              <span>עיצוב זֶן 2.0</span>
            </button>

            {/* Test Bench Modal Trigger (Palette) (Desktop Only) */}
            <button
              type="button"
              onClick={() => { setIsDesignTestOpen(true); AudioEngine.playStep(); }}
              title="מעבדת בדיקת פלטות ורכיבים של זֶן 2.0"
              className={`hidden sm:flex items-center justify-center p-2 rounded-lg transition-all cursor-pointer ${
                isDapimActive
                  ? 'btn-hollow !h-8 !w-8 !p-0'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              <Palette className="w-4 h-4 text-[var(--accent-base)]" />
            </button>

            {/* Audio Mute Switch (Desktop Only) */}
            <button
              type="button"
              onClick={handleToggleMute}
              title={isMuted ? 'הפעל צלילים' : 'השתק צלילים'}
              className="hidden sm:flex p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            </button>

            {/* Direct Theme Switcher (Desktop & Mobile) */}
            <button
              type="button"
              onClick={handleToggleTheme}
              title={isDark ? 'מעבר למצב מואר (Light Mode)' : 'מעבר למצב כהה (Dark Mode)'}
              className={`p-1.5 sm:p-2 rounded-lg border transition-colors cursor-pointer ${
                isDapimActive
                  ? isDark
                    ? 'bg-[var(--slate-3)] hover:bg-[var(--slate-4)] border-[var(--slate-6)] text-amber-400'
                    : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700'
              }`}
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />}
            </button>

            {/* More Tools Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                title="אפשרויות נוספות"
                className="p-1.5 sm:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMoreMenuOpen(false)} 
                  />
                  <div className="absolute left-0 mt-2 z-50 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-right">
                    
                    {/* Home / Roadmap (Mobile) */}
                    <button
                      type="button"
                      onClick={() => { handleGoHome(); setIsMoreMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <Home className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>מפת המסע הראשית</span>
                    </button>

                    {/* Certificate (Mobile) */}
                    <button
                      type="button"
                      onClick={() => { setIsCertificateOpen(true); setIsMoreMenuOpen(false); AudioEngine.playStep(); }}
                      className="w-full sm:hidden flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-amber-700 dark:text-amber-400 transition-colors"
                    >
                      <Award className="w-4 h-4 text-amber-500" />
                      <span>תעודת הצטיינות</span>
                    </button>

                    {/* Audio Mute Switch (Mobile) */}
                    <button
                      type="button"
                      onClick={() => { handleToggleMute(); setIsMoreMenuOpen(false); }}
                      className="w-full sm:hidden flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      <span>{isMuted ? 'הפעל צלילים' : 'השתק צלילים'}</span>
                    </button>

                    {/* Glossary */}
                    <button
                      type="button"
                      onClick={() => { setIsGlossaryOpen(true); setIsMoreMenuOpen(false); AudioEngine.playStep(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>מילון מושגים</span>
                    </button>

                    {/* Narration */}
                    <button
                      type="button"
                      onClick={() => { handleToggleNarration(); setIsMoreMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <Headphones className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{isNarrationEnabled ? 'השבת ליווי קולי' : 'הפעל ליווי קולי'}</span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                      type="button"
                      onClick={() => { handleToggleTheme(); setIsMoreMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
                      <span>{isDark ? 'מצב מואר' : 'מצב כהה'}</span>
                    </button>

                    {/* Classroom Settings */}
                    <button
                      type="button"
                      onClick={() => { setIsSettingsOpen(true); setIsMoreMenuOpen(false); AudioEngine.playStep(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>הגדרות כיתה</span>
                    </button>

                    {/* Design System Zen 2.0 Toggle (Mobile/Drawer) */}
                    <button
                      type="button"
                      onClick={() => {
                        StorageEngine.toggleDapimMode();
                        setIsMoreMenuOpen(false);
                        AudioEngine.playStep();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold transition-colors border-t border-slate-100 dark:border-slate-800/80 mt-1 pt-2 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${isDapimActive ? 'bg-[var(--accent-base)] animate-pulse' : 'bg-slate-400'}`} />
                        <span className={isDapimActive ? 'text-[var(--accent-base)] font-bold' : 'text-slate-700 dark:text-slate-200'}>עיצוב זֶן 2.0</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">
                        {isDapimActive ? 'פעיל' : 'כבוי'}
                      </span>
                    </button>

                    {/* Design System Zen 2.0 Test Bench (Mobile/Drawer) */}
                    <button
                      type="button"
                      onClick={() => { setIsDesignTestOpen(true); setIsMoreMenuOpen(false); AudioEngine.playStep(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <Palette className="w-4 h-4 text-[var(--accent-base)]" />
                      <span>מעבדת בדיקות ופלטות</span>
                    </button>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* Main Educational Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        {viewMode === 'home' ? (
          <HomeDashboard
            curriculum={curriculumData}
            labStars={labStars}
            totalStars={totalStars}
            onSelectLab={handleLabSelect}
            onOpenCertificate={() => setIsCertificateOpen(true)}
            onOpenGlossary={() => setIsGlossaryOpen(true)}
            isDapimActive={isDapimActive}
          />
        ) : (
          <div>
            {/* Quick Breadcrumb back to Home / Roadmap */}
            <div className="flex items-center justify-between gap-2 mb-4 pb-2.5 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400">
              <button
                type="button"
                onClick={handleGoHome}
                className={`inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isDapimActive
                    ? 'btn-hollow !h-8 !px-3 !text-xs font-bold'
                    : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                <span>חזרה למפת המסלול</span>
              </button>
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-400 dark:text-slate-500">
                  מעבדה {currentLab.number} מתוך 8
                </span>
                <span className="font-mono text-amber-500">
                  ★ {labStars[activeLabId] || 0}/3
                </span>
              </div>
            </div>

            {activeLabId === 'lab1' && <Lab1_BinaryPixels curriculum={curriculumData} />}
            {activeLabId === 'lab2' && <Lab2_AlgorithmicRobot curriculum={curriculumData} />}
            {activeLabId === 'lab3' && <Lab3_DecisionTree curriculum={curriculumData} />}
            {activeLabId === 'lab4' && <Lab4_Pathfinder curriculum={curriculumData} />}
            {activeLabId === 'lab5' && <Lab5_MachineLearningClassifier curriculum={curriculumData} />}
            {activeLabId === 'lab6' && <Lab6_VisionKernels curriculum={curriculumData} />}
            {activeLabId === 'lab7' && <Lab7_Perceptron curriculum={curriculumData} />}
            {activeLabId === 'lab8' && <Lab8_LanguageModelPredictor curriculum={curriculumData} />}
          </div>
        )}
      </main>

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={isCertificateOpen}
        onClose={() => setIsCertificateOpen(false)}
        totalStars={totalStars}
      />

      {/* Glossary Modal */}
      <GlossaryModal
        isOpen={isGlossaryOpen}
        onClose={() => setIsGlossaryOpen(false)}
        curriculum={curriculumData}
      />

      {/* Classroom Settings Modal */}
      <ClassroomSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Dapim 4.0 Liquid Glass & Hollow Restraint Interactive Design Test Modal */}
      <DesignSystemTestModal
        isOpen={isDesignTestOpen}
        onClose={() => setIsDesignTestOpen(false)}
      />

      {/* Zen AI Tutor Floating Classroom Companion */}
      <ZenAiTutor currentLabId={viewMode === 'home' ? 'home' : activeLabId} />

      {/* Footer Notice with Zero-PII Hygiene */}
      <footer className={
        isDapimActive
          ? "bg-[var(--slate-2)] border-t border-[var(--slate-6)] py-6 text-xs text-slate-400"
          : "bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400"
      }>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-slate-300">ZenLab &copy; 2026</span>
            <span>&bull;</span>
            <span>רישיון קוד פתוח MIT</span>
            <span>&bull;</span>
            <span>Code &amp; AI Explorer Team</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
            <span>פועל במלואו בדפדפן (Client-Side SPA)</span>
            <span>&bull;</span>
            <span>ללא איסוף נתונים (Zero-PII)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
