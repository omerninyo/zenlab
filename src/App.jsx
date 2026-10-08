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
  X, 
  Settings,
  Sun,
  Moon
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

  // Modals state
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [isGlossaryOpen, setIsGlossaryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);

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
    { id: 'lab1', label: '1. ציור בפיקסלים', track: 'algorithms', icon: Binary },
    { id: 'lab2', label: '2. לתכנת רובוט', track: 'algorithms', icon: Bot },
    { id: 'lab3', label: '3. עץ החלטות בלשי', track: 'algorithms', icon: GitBranch },
    { id: 'lab4', label: '4. הווייז של הרובוט', track: 'algorithms', icon: Compass },
    { id: 'lab5', label: '5. איך מחשב לומד?', track: 'ai', icon: Network },
    { id: 'lab6', label: '6. העיניים של המחשב', track: 'ai', icon: Eye },
    { id: 'lab7', label: '7. נוירון חכם', track: 'ai', icon: Zap },
    { id: 'lab8', label: '8. מודל שפה חכם', track: 'ai', icon: Sparkles }
  ];

  const filteredNavItems = useMemo(() => {
    if (selectedTrack === 'all') return navItems;
    return navItems.filter(item => item.track === selectedTrack);
  }, [navItems, selectedTrack]);

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-200 ${
      isDark
        ? 'bg-slate-950 text-slate-100 selection:bg-slate-800'
        : 'bg-slate-50 text-slate-800 selection:bg-blue-100 selection:text-blue-900'
    }`} dir="rtl">
      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">ZenLab</span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-slate-800 text-blue-800 dark:text-slate-300 border border-blue-200 dark:border-slate-700">
                  כיתה ה׳
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hidden sm:inline">
                  v0.6.1
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block font-medium">
                מעבדה אינטראקטיבית למדעי המחשב ובינה מלאכותית
              </p>
            </div>
          </div>

          {/* Action Tools: Stars Counter, Theme Toggle, Certificate, Glossary, Narration, Audio, Settings */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Stars Achievement Badge */}
            <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-slate-950 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-slate-800 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 shadow-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
              <span className="font-mono">{totalStars}</span>
              <span className="text-slate-500 font-normal hidden sm:inline">/ 24</span>
            </div>

            {/* Certificate of Achievement Modal Trigger */}
            <button
              type="button"
              onClick={() => { setIsCertificateOpen(true); AudioEngine.playStep(); }}
              title="צפייה והדפסת תעודת הצטיינות"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100/80 hover:bg-amber-200/80 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-600/60 text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300 transition-colors shadow-sm"
            >
              <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span className="hidden md:inline">תעודה</span>
            </button>

            {/* Glossary Modal Trigger */}
            <button
              type="button"
              onClick={() => { setIsGlossaryOpen(true); AudioEngine.playStep(); }}
              title="מילון מושגים קצר וברור"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">מילון מושגים</span>
            </button>

            {/* Voiceover Narration Switch */}
            <button
              type="button"
              onClick={handleToggleNarration}
              title={isNarrationEnabled ? 'השבת ליווי קולי' : 'הפעל ליווי קולי'}
              className={`px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                isNarrationEnabled 
                  ? 'bg-blue-50 dark:bg-blue-950/80 border-blue-400 text-blue-700 dark:text-blue-300' 
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800'
              }`}
            >
              <Headphones className={`w-4 h-4 ${narrationState.isPlaying && !narrationState.isPaused ? 'animate-pulse text-blue-600' : ''}`} />
              <span className="hidden lg:inline">ליווי קולי</span>
            </button>

            {/* Theme Toggle (Light Classroom vs Dark Mode) */}
            <button
              type="button"
              onClick={handleToggleTheme}
              title={isDark ? 'מעבר למצב כיתה מואר' : 'מעבר למצב כהה'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 transition-colors shadow-sm"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-blue-600" />}
            </button>

            {/* Audio Mute Switch */}
            <button
              type="button"
              onClick={handleToggleMute}
              title={isMuted ? 'הפעל צלילים' : 'השתק צלילים'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-slate-400" /> : <Volume2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            </button>

            {/* Classroom Settings & Progress Modal Trigger */}
            <button
              type="button"
              onClick={() => { setIsSettingsOpen(true); AudioEngine.playStep(); }}
              title="הגדרות כיתה וניהול התקדמות"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Lab Selection Navigation Tabs with Track Filters */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Track Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => { setSelectedTrack('all'); AudioEngine.playStep(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTrack === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              כל המעבדות (8)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedTrack('algorithms'); AudioEngine.playStep(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTrack === 'algorithms'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              מסלול 1: אלגוריתמיקה
            </button>
            <button
              type="button"
              onClick={() => { setSelectedTrack('ai'); AudioEngine.playStep(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedTrack === 'ai'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              מסלול 2: בינה מלאכותית
            </button>
          </div>

          {/* Filtered Lab Tabs in Larger, Comfortable Sizes */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
            {filteredNavItems.map(item => {
              const Icon = item.icon;
              const isActive = activeLabId === item.id;
              const stars = labStars[item.id] || 0;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleLabSelect(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                  {stars > 0 && (
                    <span className={`px-2 py-0.2 rounded-full text-xs font-bold font-mono ${
                      isActive ? 'bg-blue-700 text-amber-200' : 'bg-amber-100 dark:bg-slate-900 text-amber-800 dark:text-amber-400 border border-amber-300 dark:border-slate-800'
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Friendly Welcome Card for Israeli 5th Graders */}
        {isWelcomeOpen && (
          <div className="mb-6 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-blue-100/90 via-white to-amber-50 dark:from-blue-950/70 dark:to-slate-900 border-2 border-blue-200 dark:border-blue-800/40 flex items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-md">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  ברוכים הבאים ל-ZenLab: מעבדת מדעי המחשב והבינה המלאכותית לכיתה ה׳!
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                  בחרו מעבדה מהסרגל העליון, התחילו בסיור המודרך המונפש בעברית, ועברו לארגז החול כדי להתנסות, לפתור אתגרים, לצבור עד 24 כוכבים ולזכות בתעודת הצטיינות רשמית!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsWelcomeOpen(false)}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 shrink-0 shadow-sm transition-colors"
              title="סגירת הודעה"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

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
