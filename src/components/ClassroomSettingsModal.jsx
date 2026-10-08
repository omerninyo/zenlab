import React, { useState, useRef } from 'react';
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
  FileText
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';

export default function ClassroomSettingsModal({ isOpen, onClose }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [isMuted, setIsMuted] = useState(() => StorageEngine.getState().isMuted);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    StorageEngine.setMuted(nextMuted);
    if (!nextMuted) {
      AudioEngine.playStep();
    }
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 text-slate-100 max-h-[90vh] overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">הגדרות כיתה וניהול התקדמות</h2>
              <p className="text-xs text-slate-400">כלים למורים, הורים ולמידה עצמאית</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
            title="סגירה"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Notification */}
        {importStatus && (
          <div className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
            importStatus.type === 'success' 
              ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300' 
              : 'bg-rose-950/40 border-rose-800/60 text-rose-300'
          }`}>
            {importStatus.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{importStatus.text}</span>
          </div>
        )}

        {/* Audio Controls */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-200">צלילי משוב אינטראקטיביים</span>
            </div>
            <button
              type="button"
              onClick={handleToggleMute}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isMuted
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:bg-rose-900/50'
                  : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'מושתק' : 'פעיל'}</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>צלילי סינתזה בזמן אמת (Web Audio API)</span>
            <button
              type="button"
              onClick={handleTestSound}
              disabled={isMuted}
              className="text-blue-400 hover:text-blue-300 disabled:opacity-40 underline underline-offset-2"
            >
              בדיקת צליל
            </button>
          </div>
        </div>

        {/* Backup and Restore */}
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-200">גיבוי וטעינת התקדמות (ללא צורך בחשבון)</h3>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            מתאימים למעבר בין מחשבים בכיתת המחשבים או לשמירת ההישגים בבית בסיום השיעור:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>ייצוא התקדמות (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
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
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">איפוס התקדמות לשיעור חדש</span>
            </div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-950/30 hover:bg-amber-900/50 border border-amber-800/60 text-xs font-medium text-amber-300 transition-colors"
              >
                איפוס נתונים
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-colors"
                >
                  אישור מחיקה
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                >
                  ביטול
                </button>
              </div>
            )}
          </div>
          {confirmReset && (
            <p className="text-[11px] text-amber-300/90 leading-relaxed bg-amber-950/30 p-2.5 rounded-lg border border-amber-900/50">
              שימו לב: פעולה זו תאפס את כל הכוכבים והאתגרים שנפתרו ותחזיר את המעבדות למצב ההתחלתי.
            </p>
          )}
        </div>

        {/* Privacy & Zero-PII Card */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
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
