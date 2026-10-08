import React, { useState, useEffect } from 'react';
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
  X
} from 'lucide-react';
import curriculumData from './data/curriculum.json';
import { StorageEngine } from './core/storage.js';
import { AudioEngine } from './core/audio.js';
import { NarrationEngine } from './core/narration.js';
import CertificateModal from './components/CertificateModal.jsx';
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

  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState('all'); // 'all' | 'algorithms' | 'ai'
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(true);

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
    { id: 'lab1', label: '1. פיקסלים וביטים', track: 'algorithms', icon: Binary },
    { id: 'lab2', label: '2. רובוט אלגוריתמי', track: 'algorithms', icon: Bot },
    { id: 'lab3', label: '3. עץ החלטות בלשי', track: 'algorithms', icon: GitBranch },
    { id: 'lab4', label: '4. מבוך חיפוש ו-A*', track: 'algorithms', icon: Compass },
    { id: 'lab5', label: '5. מסווג למידת מכונה', track: 'ai', icon: Network },
    { id: 'lab6', label: '6. ראייה ופילטרים', track: 'ai', icon: Eye },
    { id: 'lab7', label: '7. מתג נוירון ו-XOR', track: 'ai', icon: Zap },
    { id: 'lab8', label: '8. מודל שפה וחיזוי', track: 'ai', icon: Sparkles }
  ];

  const filteredNavItems = useMemo(() => {
    if (selectedTrack === 'all') return navItems;
    return navItems.filter(item => item.track === selectedTrack);
  }, [navItems, selectedTrack]);

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
                  v0.3.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                מעבדה אינטראקטיבית למדעי המחשב ובינה מלאכותית
              </p>
            </div>
          </div>

          {/* Action Tools: Stars Counter, Certificate, Narration, Audio, Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stars Achievement Badge */}
            <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-semibold text-amber-300">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-mono">{totalStars}</span>
              <span className="text-slate-500 font-normal hidden sm:inline">/ 24 כוכבים</span>
            </div>

            {/* Certificate of Achievement Modal Trigger */}
            <button
              type="button"
              onClick={() => { setIsCertificateOpen(true); AudioEngine.playStep(); }}
              title="צפייה והדפסת תעודת הצטיינות"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 border border-amber-600/60 text-xs font-semibold text-amber-300 transition-colors shadow-sm"
            >
              <Award className="w-4 h-4 text-amber-400" />
              <span className="hidden md:inline">תעודת הצטיינות</span>
            </button>

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

      {/* Lab Selection Navigation Tabs with Track Filters */}
      <nav className="bg-slate-900 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Track Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0 self-start md:self-auto">
            <button
              type="button"
              onClick={() => { setSelectedTrack('all'); AudioEngine.playStep(); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                selectedTrack === 'all'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              כל המעבדות (8)
            </button>
            <button
              type="button"
              onClick={() => { setSelectedTrack('algorithms'); AudioEngine.playStep(); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                selectedTrack === 'algorithms'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              מסלול 1: אלגוריתמיקה
            </button>
            <button
              type="button"
              onClick={() => { setSelectedTrack('ai'); AudioEngine.playStep(); }}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                selectedTrack === 'ai'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              מסלול 2: בינה מלאכותית
            </button>
          </div>

          {/* Filtered Lab Tabs */}
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
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
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
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Friendly Welcome Card for Israeli 5th Graders */}
        {isWelcomeOpen && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-950/70 to-slate-900 border border-blue-800/40 flex items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-white mb-0.5">
                  ברוכים הבאים ל-ZenLab: מעבדת מדעי המחשב והבינה המלאכותית לכיתה ה'
                </h3>
                <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed">
                  בחרו מעבדה מהסרגל העליון, התחילו ברקע התיאורטי ובאנימציה החיה, ועברו לארגז החול כדי לפתור אתגרים, לצבור עד 24 כוכבים ולזכות בתעודת הצטיינות רשמית!
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsWelcomeOpen(false)}
              className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 shrink-0"
              title="סגירת הודעה"
            >
              <X className="w-4 h-4" />
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
