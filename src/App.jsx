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
  MoreVertical
} from 'lucide-react';
import curriculumData from './data/curriculum.json';
import { StorageEngine } from './core/storage.js';
import { AudioEngine } from './core/audio.js';
import { NarrationEngine } from './core/narration.js';
import CertificateModal from './components/CertificateModal.jsx';
import GlossaryModal from './components/GlossaryModal.jsx';
import ClassroomSettingsModal from './components/ClassroomSettingsModal.jsx';
import ZenAiTutor from './components/ZenAiTutor.jsx';
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
  const [isMuted, setIsMuted] = useState(() => StorageEngine.getState().isMuted);
  const [totalStars, setTotalStars] = useState(() => StorageEngine.getState().totalStars);
  const [labStars, setLabStars] = useState(() => StorageEngine.getState().labStars);
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(() => StorageEngine.getState().isNarrationEnabled);
  const [narrationState, setNarrationState] = useState(() => NarrationEngine.getState());
  const [theme, setTheme] = useState(() => StorageEngine.getTheme());

  // Track filter state: 'all' | 'algorithms' | 'ai'
  const [selectedTrack, setSelectedTrack] = useState('all');

  // Modals & Menu Drawers state
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLabMenuOpen, setIsLabMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  useEffect(() => {
    const unsubStorage = StorageEngine.subscribe(state => {
      setTotalStars(state.totalStars);
      setLabStars(state.labStars);
      setIsMuted(state.isMuted);
      setIsNarrationEnabled(state.isNarrationEnabled);
      if (state.theme) setTheme(state.theme);
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
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark
        ? 'bg-slate-950 text-slate-100 selection:bg-slate-800'
        : 'bg-slate-50 text-slate-800 selection:bg-blue-100 selection:text-blue-900'
    }`} dir="rtl">
      {/* Top Application Bar - Apple Minimalist & Child-Friendly */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
          
          {/* Right (RTL): Brand Identity */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Cpu className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">ZenLab</span>
                <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-slate-800 text-blue-800 dark:text-slate-300 border border-blue-200/60 dark:border-slate-700 hidden sm:inline">
                  כיתה ה׳
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden md:block">
                From Zero to Neural
              </p>
            </div>
          </div>

          {/* Center: Kid-Friendly Apple Stepper & Lab Popover Drawer */}
          <div className="relative flex items-center justify-center">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-0.5 sm:p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-inner">
              {/* Prev Button (In RTL, ChevronRight moves to previous index) */}
              <button
                type="button"
                onClick={handlePrevLab}
                disabled={currentIdx === 0}
                className="p-1 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="מעבדה קודמת"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Lab Selector Center Button with Icon and Title */}
              <button
                type="button"
                onClick={() => { setIsLabMenuOpen(!isLabMenuOpen); AudioEngine.playStep(); }}
                className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3.5 py-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-900 dark:text-white transition-colors"
                title="לחצו לבחירת מעבדה מתוך 8"
              >
                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs ${
                  currentLab.track === 'ai' ? 'bg-indigo-600' : 'bg-blue-600'
                }`}>
                  <CurrentIcon className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </div>
                <span className="text-xs sm:text-sm font-bold truncate max-w-[95px] xs:max-w-[140px] sm:max-w-[220px]">
                  <span className="sm:hidden">{currentLab.shortLabel}</span>
                  <span className="hidden sm:inline">{currentLab.label}</span>
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 shrink-0 ${isLabMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Next Button (In RTL, ChevronLeft moves to next index) */}
              <button
                type="button"
                onClick={handleNextLab}
                disabled={currentIdx === navItems.length - 1}
                className="p-1 sm:p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="מעבדה הבאה"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            {/* Popover Grid: All 8 Labs */}
            {isLabMenuOpen && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setIsLabMenuOpen(false)} 
                />
                <div className="absolute top-full mt-2 z-50 w-[92vw] sm:w-[460px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-bold">
                    <span>בחרו מעבדה לחקירה (8 מעבדות)</span>
                    <span className="font-mono text-amber-500">★ {totalStars}/24 כוכבים</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeLabId === item.id;
                      const stars = labStars[item.id] || 0;
                      const isAi = item.track === 'ai';

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            handleLabSelect(item.id);
                            setIsLabMenuOpen(false);
                          }}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-right transition-all ${
                            isActive
                              ? isAi
                                ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-400 dark:border-indigo-600 ring-2 ring-indigo-400/20'
                                : 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-600 ring-2 ring-blue-400/20'
                              : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs ${
                              isAi ? 'bg-indigo-600' : 'bg-blue-600'
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
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Stars Achievement Badge */}
            <div className="flex items-center gap-1 sm:gap-1.5 bg-amber-50 dark:bg-slate-950 px-2 sm:px-3 py-1.5 rounded-xl border border-amber-300/80 dark:border-slate-800 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 shadow-xs">
              <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 fill-amber-400" />
              <span className="font-mono">{totalStars}</span>
              <span className="text-slate-500 font-normal hidden sm:inline">/ 24</span>
            </div>

            {/* Certificate Button */}
            <button
              type="button"
              onClick={() => { setIsCertificateOpen(true); AudioEngine.playStep(); }}
              title="צפייה והדפסת תעודת הצטיינות"
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 transition-colors shadow-xs"
            >
              <Award className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">תעודה</span>
            </button>

            {/* Audio Mute Switch */}
            <button
              type="button"
              onClick={handleToggleMute}
              title={isMuted ? 'הפעל צלילים' : 'השתק צלילים'}
              className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            </button>

            {/* More Tools Dropdown Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                title="אפשרויות נוספות"
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition-colors"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {isMoreMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsMoreMenuOpen(false)} 
                  />
                  <div className="absolute left-0 mt-2 z-50 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-1.5 shadow-xl animate-in fade-in zoom-in-95 duration-150 text-right">
                    
                    {/* Glossary */}
                    <button
                      type="button"
                      onClick={() => { setIsGlossaryOpen(true); setIsMoreMenuOpen(false); AudioEngine.playStep(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>מילון מושגים</span>
                    </button>

                    {/* Narration */}
                    <button
                      type="button"
                      onClick={() => { handleToggleNarration(); setIsMoreMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <Headphones className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      <span>{isNarrationEnabled ? 'השבת ליווי קולי' : 'הפעל ליווי קולי'}</span>
                    </button>

                    {/* Theme Toggle */}
                    <button
                      type="button"
                      onClick={() => { handleToggleTheme(); setIsMoreMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
                      <span>{isDark ? 'מצב מואר' : 'מצב כהה'}</span>
                    </button>

                    {/* Classroom Settings */}
                    <button
                      type="button"
                      onClick={() => { setIsSettingsOpen(true); setIsMoreMenuOpen(false); AudioEngine.playStep(); }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-200 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-slate-500" />
                      <span>הגדרות כיתה</span>
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

        {activeLabId === 'lab1' && <Lab1_BinaryPixels curriculum={curriculumData} />}
        {activeLabId === 'lab2' && <Lab2_AlgorithmicRobot curriculum={curriculumData} />}
        {activeLabId === 'lab3' && <Lab3_DecisionTree curriculum={curriculumData} />}
        {activeLabId === 'lab4' && <Lab4_Pathfinder curriculum={curriculumData} />}
        {activeLabId === 'lab5' && <Lab5_MachineLearningClassifier curriculum={curriculumData} />}
        {activeLabId === 'lab6' && <Lab6_VisionKernels curriculum={curriculumData} />}
        {activeLabId === 'lab7' && <Lab7_Perceptron curriculum={curriculumData} />}
        {activeLabId === 'lab8' && <Lab8_LanguageModelPredictor curriculum={curriculumData} />}
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

      {/* Zen AI Tutor Floating Classroom Companion */}
      <ZenAiTutor currentLabId={activeLabId} />

      {/* Footer Notice with Zero-PII Hygiene */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-xs text-slate-500 dark:text-slate-400">
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
