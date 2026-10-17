import React, { useState, useRef, useEffect } from 'react';
import { 
  Settings, 
  RotateCcw, 
  Download, 
  Upload, 
  Volume2, 
  VolumeX, 
  ShieldCheck, 
  X, 
  AlertCircle, 
  Check,
  Music,
  FileText,
  Palette,
  Sun,
  Moon,
  BookOpen,
  Sparkles
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';

export const ZEN_THEMES = [
  {
    id: 'champagne-gold',
    name: 'זהב שמפניה',
    englishName: 'Champagne Gold',
    badge: 'ברירת מחדל',
    tagline: 'חם, יוקרתי וממוקד ללמידה ממושכת',
    accentLight: '#ca8a04',
    accentDark: '#eab308'
  },
  {
    id: 'nordic-ice',
    name: 'קרח נורדי',
    englishName: 'Nordic Ice',
    badge: 'סייבר וחלל',
    tagline: 'טכנולוגי, קריר וחד לקונסולות תוכנה',
    accentLight: '#0284c7',
    accentDark: '#38bdf8'
  },
  {
    id: 'emerald-sanctuary',
    name: 'ברקת עמוקה',
    englishName: 'Emerald Sanctuary',
    badge: 'טבע ומחקר',
    tagline: 'אורגני ומרגיע המפחית עייפות בעיניים',
    accentLight: '#059669',
    accentDark: '#10b981'
  },
  {
    id: 'matte-amber',
    name: 'ענבר חם',
    englishName: 'Matte Amber',
    badge: 'ספרייה קלאסית',
    tagline: 'טרקוטה ארכיונית חמימה ואינטימית',
    accentLight: '#c26928',
    accentDark: '#d48344'
  }
];

export default function ClassroomSettingsModal({ isOpen, onClose, onOpenGlossary }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [isMuted, setIsMuted] = useState(() => StorageEngine.getState().isMuted);
  const [activePalette, setActivePalette] = useState(() => StorageEngine.getDapimPalette());
  const [activeTheme, setActiveTheme] = useState(() => StorageEngine.getTheme());
  const [saveCodeInput, setSaveCodeInput] = useState('');
  const [currentSaveCode, setCurrentSaveCode] = useState(() => StorageEngine.getSaveCode());
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsub = StorageEngine.subscribe(state => {
      if (state.dapimPalette) setActivePalette(state.dapimPalette);
      if (state.theme) setActiveTheme(state.theme);
      if (state.isMuted !== undefined) setIsMuted(state.isMuted);
      setCurrentSaveCode(StorageEngine.getSaveCode());
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDark = activeTheme === 'dark';

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    StorageEngine.setMuted(nextMuted);
    if (!nextMuted) {
      AudioEngine.playStep();
    }
  };

  const handleSetThemeMode = (mode) => {
    if (activeTheme === mode) return;
    StorageEngine.setTheme(mode);
    setActiveTheme(mode);
    AudioEngine.playStep();
  };

  const handleSelectPalette = (paletteId) => {
    setActivePalette(paletteId);
    StorageEngine.setDapimPalette(paletteId);
    AudioEngine.playStep();
  };

  const handleTestSound = () => {
    AudioEngine.playSuccess();
  };

  const handleResetProgress = () => {
    StorageEngine.resetProgress();
    AudioEngine.playStep();
    setConfirmReset(false);
    setImportStatus({ type: 'success', text: 'ההתקדמות אופסה בהצלחה לשיעור חדש!' });
    setTimeout(() => setImportStatus(null), 3500);
  };

  const handleExportJSON = () => {
    try {
      const dataStr = StorageEngine.exportStateJSON();
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      link.href = url;
      link.download = `zenlab-progress-${dateStr}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      AudioEngine.playStep();
      setImportStatus({ type: 'success', text: 'קובץ ההתקדמות הורד בהצלחה!' });
      setTimeout(() => setImportStatus(null), 3500);
    } catch {
      setImportStatus({ type: 'error', text: 'שגיאה בייצוא הקובץ' });
      setTimeout(() => setImportStatus(null), 3500);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const result = StorageEngine.importStateJSON(content);
        if (result.success) {
          AudioEngine.playSuccess();
          setImportStatus({ 
            type: 'success', 
            text: `ההתקדמות נטענה בהצלחה! סך הכל ${result.totalStars} כוכבים.` 
          });
        } else {
          setImportStatus({ type: 'error', text: `שגיאה בטעינת הקובץ: ${result.error}` });
        }
        setTimeout(() => setImportStatus(null), 4000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCopySaveCode = () => {
    const code = StorageEngine.getSaveCode();
    setCurrentSaveCode(code);
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(`ZN-${code}`).catch(() => {});
    }
    AudioEngine.playStep();
    setImportStatus({ type: 'success', text: `קוד השמירה ZN-${code} הועתק! רשמו אותו במחברת.` });
    setTimeout(() => setImportStatus(null), 3500);
  };

  const handleRestoreSaveCode = (e) => {
    if (e) e.preventDefault();
    const res = StorageEngine.restoreFromSaveCode(saveCodeInput);
    if (res.success) {
      AudioEngine.playSuccess();
      setCurrentSaveCode(StorageEngine.getSaveCode());
      setSaveCodeInput('');
      setImportStatus({
        type: 'success',
        text: `הקוד שוחזר בהצלחה! סך הכל ${res.totalStars} כוכבים פעילים.`
      });
    } else {
      AudioEngine.playError();
      setImportStatus({ type: 'error', text: res.error });
    }
    setTimeout(() => setImportStatus(null), 4000);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={onClose}
    >
      <div 
        className="relative bg-[var(--slate-2)] text-[var(--text-primary)] border border-[var(--slate-6)] rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--slate-6)] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--accent-wash)] border border-[var(--accent-rim)] flex items-center justify-center text-[var(--accent-base)] shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-base font-bold text-slate-900 dark:text-white">
                הגדרות מעבדה ותצוגה
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                התאמה אישית, תאורה, צלילים וניהול התקדמות
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-[var(--slate-4)] transition-colors cursor-pointer"
            title="סגירה (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {importStatus && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            importStatus.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-300' 
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/60 text-rose-900 dark:text-rose-300'
          }`}>
            {importStatus.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-medium">{importStatus.text}</span>
          </div>
        )}

        {/* Section 1: Lighting Register (Day / Night Mode) */}
        <div className="p-4 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)] space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-slate-100">
            <span className="flex items-center gap-1.5">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>תאורת סביבת העבודה</span>
            </span>
            <span className="text-[11px] font-normal text-slate-600 dark:text-slate-400">
              {isDark ? 'מצב כהה פעיל' : 'מצב מואר פעיל (ברירת מחדל)'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSetThemeMode('light')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                !isDark
                  ? 'bg-white text-slate-900 border-slate-300 shadow-sm ring-2 ring-[var(--accent-base)]'
                  : 'bg-[var(--slate-2)] text-slate-700 dark:text-slate-300 border-[var(--slate-6)] hover:bg-[var(--slate-4)]'
              }`}
            >
              <Sun className="w-4 h-4 text-amber-500" />
              <span>מצב מואר (כיתה/יום)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSetThemeMode('dark')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                isDark
                  ? 'bg-slate-900 text-white border-slate-700 shadow-sm ring-2 ring-[var(--accent-base)]'
                  : 'bg-[var(--slate-2)] text-slate-700 dark:text-slate-300 border-[var(--slate-6)] hover:bg-[var(--slate-4)]'
              }`}
            >
              <Moon className="w-4 h-4 text-blue-400" />
              <span>מצב כהה (סייבר/לילה)</span>
            </button>
          </div>
        </div>

        {/* Section 2: Themes & Laboratory Color Presets */}
        <div className="p-4 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--accent-base)]" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">ערכות צבעי מעבדה (Themes)</span>
            </div>
            <span className="text-[10px] font-mono font-medium text-[var(--accent-base)] bg-[var(--slate-2)] px-2 py-0.5 rounded-full border border-[var(--accent-rim)]">
              Zen 2.0
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {ZEN_THEMES.map((theme) => {
              const isSelected = activePalette === theme.id;
              const displayHex = isDark ? theme.accentDark : theme.accentLight;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectPalette(theme.id)}
                  className={`text-right p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--accent-wash)] border-[var(--accent-base)] shadow-xs ring-1 ring-[var(--accent-base)]'
                      : 'bg-[var(--slate-2)] hover:bg-[var(--slate-4)] border-[var(--slate-6)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span 
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs ring-2 ring-white/60 dark:ring-black/40"
                        style={{ backgroundColor: displayHex }}
                      />
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {theme.name}
                      </span>
                    </div>
                    {isSelected ? (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-[var(--accent-base)] bg-[var(--slate-2)] px-1.5 py-0.5 rounded-md border border-[var(--accent-rim)]">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>נבחר</span>
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {theme.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
                    {theme.tagline}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section 3: Audio Feedback */}
        <div className="p-4 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-[var(--accent-base)]" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">צלילי משוב אינטראקטיביים</span>
            </div>
            <button
              type="button"
              onClick={handleToggleMute}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
                  : 'btn-glass text-slate-900 dark:text-white'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'מושתק' : 'פעיל'}</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-[var(--slate-6)]">
            <span>צלילי סינתזה בזמן אמת (Web Audio API)</span>
            <button
              type="button"
              onClick={handleTestSound}
              disabled={isMuted}
              className="text-[var(--accent-base)] hover:underline disabled:opacity-40 font-bold cursor-pointer"
            >
              בדיקת צליל
            </button>
          </div>
        </div>

        {/* Section 4: Scientific Glossary Shortcut */}
        {onOpenGlossary && (
          <div className="p-4 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-[var(--accent-base)]" />
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">מילון מושגים מדעי</span>
                <span className="text-[11px] text-slate-600 dark:text-slate-400">הגדרות פשוטות לכל מונחי המחשוב והבינה המלאכותית</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { onClose(); onOpenGlossary(); AudioEngine.playStep(); }}
              className="btn-glass text-xs !py-1.5 !px-3 font-bold cursor-pointer"
            >
              פתיחת מילון
            </button>
          </div>
        )}

        {/* Section 5: Backup and Restore (6-Char Classroom Code + JSON) */}
        <div className="p-4 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[var(--accent-base)]" />
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">קוד שמירה למחברת וגיבוי התקדמות (Zero-PII)</h3>
            </div>
            <button
              type="button"
              onClick={handleCopySaveCode}
              className="px-2.5 py-1 rounded-lg bg-[var(--slate-2)] border border-[var(--accent-rim)] font-mono text-xs font-black text-[var(--accent-base)] hover:opacity-90 cursor-pointer"
              title="לחצו להעתקת קוד השמירה האישי"
            >
              ZN-{currentSaveCode} 📋
            </button>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            תלמידים יכולים להעתיק למחברת את קוד 6 התווים למעלה ולהזין אותו בשיעור הבא כדי לשחזר מיד את כל הכוכבים שלהם:
          </p>

          <form onSubmit={handleRestoreSaveCode} className="flex items-center gap-2">
            <input
              type="text"
              dir="ltr"
              maxLength={9}
              value={saveCodeInput}
              onChange={(e) => setSaveCodeInput(e.target.value.toUpperCase())}
              placeholder="הזינו קוד (למשל ZN-5A454E)"
              className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--slate-2)] border border-[var(--slate-6)] text-xs font-mono font-bold text-center text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-base)]"
            />
            <button
              type="submit"
              className="btn-glass text-xs !py-1.5 !px-3 font-bold cursor-pointer text-slate-900 dark:text-white shrink-0"
            >
              שחזור מקוד
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[var(--slate-6)]">
            <button
              type="button"
              onClick={handleExportJSON}
              className="btn-glass flex items-center justify-center gap-2 text-xs !py-2 cursor-pointer font-bold text-slate-900 dark:text-white"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-base)]" />
              <span>ייצוא התקדמות (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-glass flex items-center justify-center gap-2 text-xs !py-2 cursor-pointer font-bold text-slate-900 dark:text-white"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>טעינת התקדמות מקובץ</span>
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleFileChange}
            />
          </div>
        </div>

        {/* Section 6: Reset Progress */}
        <div className="p-4 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">איפוס התקדמות לשיעור חדש</span>
            </div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-800/60 text-xs font-bold text-amber-900 dark:text-amber-300 transition-colors cursor-pointer"
              >
                איפוס נתונים
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="px-2.5 py-1 rounded-md bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  אישור מחיקה
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="btn-glass text-xs !py-1 !px-2 font-bold cursor-pointer"
                >
                  ביטול
                </button>
              </div>
            )}
          </div>
          {confirmReset && (
            <p className="text-[11px] text-amber-900 dark:text-amber-300 leading-relaxed bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/50 font-medium">
              שימו לב: פעולה זו תאפס את כל הכוכבים והאתגרים שנפתרו ותחזיר את המעבדות למצב ההתחלתי.
            </p>
          )}
        </div>

        {/* Section 7: Privacy & Zero-PII Card */}
        <div className="p-3.5 rounded-xl bg-[var(--slate-2)] border border-[var(--slate-6)] text-[11px] text-slate-600 dark:text-slate-400 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-900 dark:text-slate-200 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>התחייבות לבטיחות ופרטיות מלאה (Zero-PII)</span>
          </div>
          <p className="leading-relaxed">
            ZenLab פועלת 100% במחשב המקומי (Client-side). המערכת אינה דורשת הרשמה, אינה שומרת עוגיות (Cookies), אינה מפעילה מעקבים ואינה אוספת שום פרט מזהה על התלמידים.
          </p>
        </div>

      </div>
    </div>
  );
}
