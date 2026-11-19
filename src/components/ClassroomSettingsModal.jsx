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
  BookOpen
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';

export default function ClassroomSettingsModal({ isOpen, onClose, onOpenGlossary }) {
  const [confirmReset, setConfirmReset] = useState(false);
  const [importStatus, setImportStatus] = useState(null);
  const [isMuted, setIsMuted] = useState(() => StorageEngine.getState().isMuted);
  const [saveCodeInput, setSaveCodeInput] = useState('');
  const [currentSaveCode, setCurrentSaveCode] = useState(() => StorageEngine.getSaveCode());
  const fileInputRef = useRef(null);

  useEffect(() => {
    const unsub = StorageEngine.subscribe(state => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      onClick={onClose}
    >
      <div
        className="relative bg-white text-[#3C3C3C] border-2 border-[#E5E5E5] rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-5 max-h-[92vh] overflow-y-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#E5E5E5] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#DDF4FF] border-2 border-[#84D8FF] flex items-center justify-center text-[#1899D6]">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 id="settings-modal-title" className="text-base sm:text-lg font-extrabold text-[#3C3C3C]">
                הגדרות כיתה וניהול התקדמות
              </h2>
              <p className="text-xs text-[#777777] font-medium">
                צלילים, קוד שמירה למחברת, ייצוא ואיפוס
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white hover:bg-[#F7F7F7] text-[#777777] hover:text-[#3C3C3C] border-2 border-[#E5E5E5] flex items-center justify-center cursor-pointer"
            title="סגירה"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Notification */}
        {importStatus && (
          <div className={`p-3 rounded-2xl border-2 text-xs flex items-center gap-2 ${
            importStatus.type === 'success'
              ? 'bg-[#D7FFB8] border-[#58CC02] text-[#58A700]'
              : 'bg-[#FFDFE0] border-[#FF4B4B] text-[#EA2B2B]'
          }`}>
            {importStatus.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span className="font-bold">{importStatus.text}</span>
          </div>
        )}

        {/* Section 1: Audio Feedback */}
        <div className="p-4 rounded-2xl bg-[#F7F7F5] border-2 border-[#E5E5E5] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-[#1CB0F6]" />
              <span className="text-sm font-extrabold text-[#3C3C3C]">צלילי משוב בכיתה</span>
            </div>
            <button
              type="button"
              onClick={handleToggleMute}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 cursor-pointer transition-colors ${
                isMuted
                  ? 'bg-[#FFDFE0] border-[#FF4B4B] text-[#EA2B2B]'
                  : 'bg-[#D7FFB8] border-[#58CC02] text-[#58A700]'
              }`}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'מושתק' : 'פעיל'}</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-xs text-[#777777] pt-2 border-t border-[#E5E5E5]">
            <span>סינתזת צלילים מקומית בדפדפן</span>
            <button
              type="button"
              onClick={handleTestSound}
              disabled={isMuted}
              className="text-[#1899D6] hover:underline disabled:opacity-40 font-bold cursor-pointer"
            >
              בדיקת צליל
            </button>
          </div>
        </div>

        {/* Section 2: Glossary Shortcut */}
        {onOpenGlossary && (
          <div className="p-4 rounded-2xl bg-[#F7F7F5] border-2 border-[#E5E5E5] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-[#1CB0F6] shrink-0" />
              <div>
                <span className="text-sm font-extrabold text-[#3C3C3C] block">מילון מושגים</span>
                <span className="text-xs text-[#777777]">הגדרות פשוטות לכל מונחי הלמידה</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => { onClose(); onOpenGlossary(); AudioEngine.playStep(); }}
              className="btn-duo-white text-xs px-3.5 py-2 shrink-0"
            >
              פתיחת מילון
            </button>
          </div>
        )}

        {/* Section 3: Backup and Restore (6-Char Classroom Code + JSON) */}
        <div className="p-4 rounded-2xl bg-[#F7F7F5] border-2 border-[#E5E5E5] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#FF9600]" />
              <h3 className="text-sm font-extrabold text-[#3C3C3C]">קוד שמירה למחברת (Zero-PII)</h3>
            </div>
            <button
              type="button"
              onClick={handleCopySaveCode}
              className="px-3 py-1 rounded-xl bg-white border-2 border-[#E5E5E5] font-mono text-xs font-extrabold text-[#1899D6] hover:bg-[#DDF4FF] cursor-pointer"
              title="לחצו להעתקת קוד השמירה האישי"
            >
              ZN-{currentSaveCode}
            </button>
          </div>
          <p className="text-xs text-[#777777] leading-relaxed">
            תלמידים יכולים לרשום במחברת את קוד 6 התווים ולהזין אותו בשיעור הבא כדי לשחזר את כל הכוכבים:
          </p>

          <form onSubmit={handleRestoreSaveCode} className="flex items-center gap-2">
            <input
              type="text"
              dir="ltr"
              maxLength={9}
              value={saveCodeInput}
              onChange={(e) => setSaveCodeInput(e.target.value.toUpperCase())}
              placeholder="למשל ZN-5A454E"
              className="flex-1 px-3 py-2 rounded-xl bg-white border-2 border-[#E5E5E5] text-xs font-mono font-bold text-center text-[#3C3C3C] focus:outline-none focus:border-[#1CB0F6]"
            />
            <button
              type="submit"
              className="btn-duo-blue text-xs px-4 py-2 shrink-0"
            >
              שחזור מקוד
            </button>
          </form>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#E5E5E5]">
            <button
              type="button"
              onClick={handleExportJSON}
              className="btn-duo-white text-xs py-2.5 px-3"
            >
              <Download className="w-3.5 h-3.5 text-[#1CB0F6]" />
              <span>ייצוא התקדמות (JSON)</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="btn-duo-white text-xs py-2.5 px-3"
            >
              <Upload className="w-3.5 h-3.5 text-[#58CC02]" />
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

        {/* Section 4: Reset Progress */}
        <div className="p-4 rounded-2xl bg-[#F7F7F5] border-2 border-[#E5E5E5] space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-[#FF9600]" />
              <span className="text-sm font-extrabold text-[#3C3C3C]">איפוס התקדמות לשיעור חדש</span>
            </div>
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FFDFE0] border-2 border-[#E5E5E5] hover:border-[#FF4B4B] text-xs font-bold text-[#EA2B2B] transition-colors cursor-pointer"
              >
                איפוס נתונים
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetProgress}
                  className="px-3 py-1.5 rounded-xl bg-[#FF4B4B] hover:bg-[#EA2B2B] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  אישור מחיקה
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="btn-duo-white text-xs px-3 py-1.5"
                >
                  ביטול
                </button>
              </div>
            )}
          </div>
          {confirmReset && (
            <p className="text-xs text-[#EA2B2B] leading-relaxed bg-[#FFDFE0] p-3 rounded-xl border-2 border-[#FF4B4B] font-bold">
              שימו לב: פעולה זו תאפס את כל הכוכבים והאתגרים שנפתרו ותחזיר את התחנות למצב ההתחלתי.
            </p>
          )}
        </div>

        {/* Section 5: Privacy & Zero-PII Card */}
        <div className="p-4 rounded-2xl bg-white border-2 border-[#E5E5E5] text-xs text-[#777777] space-y-1">
          <div className="flex items-center gap-1.5 text-[#3C3C3C] font-extrabold">
            <ShieldCheck className="w-4 h-4 text-[#58CC02]" />
            <span>בטיחות ופרטיות מלאה (Zero-PII)</span>
          </div>
          <p className="leading-relaxed">
            ZenLab פועלת בדפדפן בלבד ללא הרשמה, ללא עוגיות מעקב וללא איסוף מידע אישי על התלמידים.
          </p>
        </div>
      </div>
    </div>
  );
}
