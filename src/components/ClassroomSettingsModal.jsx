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
  Moon
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { ZEN_THEMES } from './ThemeSelectorModal.jsx';

export default function ClassroomSettingsModal({ isOpen, onClose }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [isMuted, setIsMuted] = useState(() => StorageEngine.getState().isMuted);
  const [activePalette, setActivePalette] = useState(() => StorageEngine.getDapimPalette());
  const [activeTheme, setActiveTheme] = useState(() => StorageEngine.getTheme());
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsub = StorageEngine.subscribe(state => {
      if (state.dapimPalette) setActivePalette(state.dapimPalette);
      if (state.theme) setActiveTheme(state.theme);
      if (state.isMuted !== undefined) setIsMuted(state.isMuted);
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

  const handleToggleThemeMode = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    StorageEngine.setTheme(nextTheme);
    setActiveTheme(nextTheme);
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
                הגדרות כיתה וניהול התקדמות
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">כלים למורים, הורים ולמידה עצמאית</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[var(--slate-4)] transition-colors cursor-pointer"
            title="סגירה (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Notification */}
        {importStatus && (
          <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
            importStatus.type === 'success' 
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300' 
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/60 text-rose-800 dark:text-rose-300'
          }`}>
            {importStatus.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span>{importStatus.text}</span>
          </div>
        )}

        {/* Section: Themes & Lighting Register */}
        <div className="p-4 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[var(--accent-base)]" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">ערכת צבעי מעבדה (Themes)</span>
            </div>
            
            <button
              type="button"
              onClick={handleToggleThemeMode}
              className="btn-glass text-xs !py-1 !px-2 flex items-center gap-1.5 cursor-pointer font-medium"
              title="החלפת מצב תאורה"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
              <span>{isDark ? 'מואר' : 'כהה'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {ZEN_THEMES.map((theme) => {
              const isSelected = activePalette === theme.id;
              const displayHex = isDark ? theme.accentDark : theme.accentLight;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectPalette(theme.id)}
                  className={`text-right p-2.5 rounded-lg border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-[var(--accent-wash)] border-[var(--accent-base)] ring-1 ring-[var(--accent-base)]'
                      : 'bg-[var(--slate-2)] hover:bg-[var(--slate-4)] border-[var(--slate-6)]'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs ring-1 ring-black/10 dark:ring-white/10"
                      style={{ backgroundColor: displayHex }}
                    />
                    <div className="truncate">
                      <span className="text-xs font-bold block text-slate-800 dark:text-slate-100 truncate">
                        {theme.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-[var(--accent-base)] stroke-[3] shrink-0" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Audio Controls */}
        <div className="p-4 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-[var(--accent-base)]" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">צלילי משוב אינטראקטיביים</span>
            </div>
            <button
              type="button"
              onClick={handleToggleMute}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800/60 text-rose-700 dark:text-rose-300'
                  : 'btn-glass'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'מושתק' : 'פעיל'}</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-[var(--slate-6)]">
            <span>צלילי סינתזה מקומיים (Web Audio API)</span>
            <button
              type="button"
              onClick={handleTestSound}
              disabled={isMuted}
              className="text-[var(--accent-base)] hover:underline disabled:opacity-40 font-medium cursor-pointer"
            >
              בדיקת צליל
            </button>
          </div>
        </div>

        {/* Backup and Restore */}
        <div className="p-4 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)] space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[var(--accent-base)]" />
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200">גיבוי וטעינת התקדמות (ללא צורך בחשבון)</h3>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
            מתאים למעבר בין מחשבים בכיתת המחשבים או לשמירת ההישגים בבית בסיום השיעור:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleExportJSON}
              className="btn-glass flex items-center justify-center gap-2 text-xs !py-2 cursor-pointer font-medium"
            >
              <Download className="w-3.5 h-3.5 text-[var(--accent-base)]" />
              <span>ייצוא התקדמות (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-glass flex items-center justify-center gap-2 text-xs !py-2 cursor-pointer font-medium"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-500" />
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

        {/* Reset Progress Section */}
        <div className="p-4 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">איפוס התקדמות לשיעור חדש</span>
            </div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-800/60 text-xs font-medium text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
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
                  className="btn-glass text-xs !py-1 !px-2 cursor-pointer"
                >
                  ביטול
                </button>
              </div>
            )}
          </div>
          {confirmReset && (
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/50">
              שימו לב: פעולה זו תאפס את כל הכוכבים והאתגרים שנפתרו ותחזיר את המעבדות למצב ההתחלתי.
            </p>
          )}
        </div>

        {/* Privacy & Zero-PII Card */}
        <div className="p-3.5 rounded-xl bg-[var(--slate-2)] border border-[var(--slate-6)] text-[11px] text-slate-500 dark:text-slate-400 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
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
