import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Video,
  Volume2,
  VolumeX,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Star,
  ArrowLeft,
  Flame,
  Lightbulb
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { NarrationEngine } from '../core/narration.js';
import { StorageEngine } from '../core/storage.js';
import { LAB_METADATA } from '../core/labMeta.js';
import MediaDrawerModal from './MediaDrawerModal.jsx';
import DaylightTutorModal from './DaylightTutorModal.jsx';
import { AudioHintButton } from './LessonSharedViews.jsx';

const LAB_SEQUENCE = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5', 'lab6', 'lab7', 'lab8'];

export default function LessonShell({
  labId,
  labData,
  totalSteps,
  step,
  onStepChange,
  isLessonComplete,
  onExit,
  onNextStation,
  onOpenCertificate,
  feedback,
  isActionDisabled,
  primaryButtonLabel,
  onPrimaryAction,
  hintText = '',
  hintAudioSrc = '',
  streak = 0,
  bestLessonStreak = 0,
  retryCount = 0,
  victoryTitle,
  victorySubtitle,
  victoryTakeaways = [],
  children
}) {
  const labMeta = LAB_METADATA[labId] || {};
  const nextIndex = LAB_SEQUENCE.indexOf(labId) + 1;
  const nextLabId = nextIndex > 0 && nextIndex < LAB_SEQUENCE.length ? LAB_SEQUENCE[nextIndex] : null;
  const nextLabMeta = nextLabId ? LAB_METADATA[nextLabId] : null;

  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(() => StorageEngine.getState().isMuted);

  const exitDialogRef = useRef(null);
  const pointerOutsideExitRef = useRef(false);

  // Sync dynamic document title & reset transient hint drawer on step change
  useEffect(() => {
    if (typeof document !== 'undefined' && labMeta.title) {
      document.title = `תחנה ${labMeta.number}: ${labMeta.title} | ZenLab`;
    }
    setIsHintOpen(false);
  }, [labMeta.number, labMeta.title, step]);

  // Clear saved resume step when station completes
  useEffect(() => {
    if (isLessonComplete && labId) {
      StorageEngine.clearLabStep(labId);
    }
  }, [isLessonComplete, labId]);

  useEffect(() => {
    const unsub = StorageEngine.subscribe((s) => {
      if (typeof s.isMuted === 'boolean') setIsMuted(s.isMuted);
    });
    return () => {
      unsub();
      NarrationEngine.stop?.();
    };
  }, []);

  // Safe exit confirmation native dialog management
  useEffect(() => {
    const dlg = exitDialogRef.current;
    if (!dlg) return;
    if (isExitConfirmOpen && !dlg.open) {
      dlg.showModal();
    } else if (!isExitConfirmOpen && dlg.open) {
      dlg.close();
    }
  }, [isExitConfirmOpen]);

  useEffect(() => {
    const dlg = exitDialogRef.current;
    if (!dlg) return;
    const handleNativeClose = () => {
      dlg.returnValue = '';
      setIsExitConfirmOpen(false);
    };
    dlg.addEventListener('close', handleNativeClose);
    return () => dlg.removeEventListener('close', handleNativeClose);
  }, []);

  // Keyboard Enter shortcut triggers bottom action when no dialog/input owns focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key !== 'Enter') return;
      if (isMediaOpen || isTutorOpen || isExitConfirmOpen || isLessonComplete || isActionDisabled) {
        return;
      }
      const active = document.activeElement;
      const tag = active?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || tag === 'BUTTON') {
        return;
      }
      e.preventDefault();
      onPrimaryAction?.();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMediaOpen, isTutorOpen, isExitConfirmOpen, isLessonComplete, isActionDisabled, onPrimaryAction]);

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    StorageEngine.setMuted(next);
    if (!next) AudioEngine.playStep();
  };

  const confirmExitNow = () => {
    setIsExitConfirmOpen(false);
    NarrationEngine.stop?.();
    AudioEngine.playStep();
    onExit?.();
  };

  const handleRequestExit = () => {
    if (step > 0 && !isLessonComplete) {
      AudioEngine.playStep();
      setIsExitConfirmOpen(true);
      return;
    }
    confirmExitNow();
  };

  // Victory Screen
  if (isLessonComplete) {
    return (
      <div className="min-h-screen bg-white text-[#3C3C3C] flex flex-col justify-between" dir="rtl">
        <main className="flex-1 max-w-lg mx-auto w-full px-5 py-10 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-36 h-36">
            <img
              src="/illustrations/zen_cheer.png"
              alt="זֶן חוגג הצלחה"
              className="w-full h-full object-contain select-none"
              draggable={false}
            />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C3C3C]">
              {victoryTitle || `כל הכבוד! סיימתם את תחנה ${labMeta.number}`}
            </h1>
            {victorySubtitle && (
              <p className="text-sm sm:text-base text-[#777777] font-medium">
                {victorySubtitle}
              </p>
            )}
          </div>

          {/* 3 Golden Stars Earned */}
          <div className="flex items-center justify-center gap-4 py-1">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="w-16 h-16 rounded-2xl bg-[#FFFDF2] border-2 border-[#FFC800] flex items-center justify-center"
                style={{ boxShadow: '0 4px 0 #E5A800' }}
              >
                <Star className="w-9 h-9 fill-[#FFC800] text-[#FFC800]" />
              </div>
            ))}
          </div>

          {bestLessonStreak >= 2 && (
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#FFF0D6] border-2 border-[#FF9600] text-[#E08200] text-sm font-extrabold">
              <Flame className="w-4 h-4 fill-[#FF9600] text-[#FF9600]" />
              <span>שיא רצף בשיעור: {bestLessonStreak} הצלחות רצופות</span>
            </div>
          )}

          {/* 3 Concise Takeaways */}
          <div className="w-full space-y-2.5 text-right">
            {victoryTakeaways.map((point, idx) => (
              <div
                key={idx}
                className="card-duo p-3.5 flex items-center gap-3 text-sm font-bold text-[#4B4B4B]"
              >
                <CheckCircle2 className="w-5 h-5 text-[#58CC02] shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </main>

        <footer className="border-t-2 border-[#E5E5E5] bg-white py-4 px-5">
          <div className="max-w-lg mx-auto flex flex-col sm:flex-row items-stretch gap-3">
            {nextLabMeta && onNextStation ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    NarrationEngine.stop?.();
                    AudioEngine.playStep();
                    onNextStation(nextLabId);
                  }}
                  className="btn-duo-green flex-1 py-3.5 px-5 text-base"
                >
                  <span>המשיכו לתחנה {nextLabMeta.number}: {nextLabMeta.title}</span>
                </button>
                <button
                  type="button"
                  onClick={confirmExitNow}
                  className="btn-duo-white py-3.5 px-5 text-sm sm:text-base"
                >
                  <span>חזרה למפה</span>
                </button>
              </>
            ) : (
              <>
                {onOpenCertificate && (
                  <button
                    type="button"
                    onClick={() => {
                      NarrationEngine.stop?.();
                      AudioEngine.playStep();
                      onOpenCertificate();
                    }}
                    className="btn-duo-green flex-1 py-3.5 px-5 text-base"
                  >
                    <span>פתיחת תעודת ההצטיינות הרשמית</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={confirmExitNow}
                  className="btn-duo-white py-3.5 px-5 text-sm sm:text-base"
                >
                  <span>חזרה למפת המסע</span>
                </button>
              </>
            )}
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#3C3C3C] flex flex-col" dir="rtl">
      {/* 1. Minimal Lesson Player Top Bar */}
      <header className="h-16 sm:h-20 max-w-4xl w-full mx-auto px-3 sm:px-4 flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          type="button"
          onClick={handleRequestExit}
          className="w-10 h-10 rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] flex items-center justify-center text-[#777777] hover:text-[#3C3C3C] cursor-pointer shrink-0"
          aria-label="חזרה למפת המסע"
          title="יציאה למפת המסע"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Native HTML5 Progress Bar + Direct Step Pips */}
        <div className="flex-1 flex flex-col gap-1.5 min-w-0">
          <progress
            className="progress-duo w-full h-3.5 sm:h-4"
            value={step + 1}
            max={totalSteps}
            aria-label={`שלב ${step + 1} מתוך ${totalSteps}`}
          />

          <div className="flex items-center justify-between px-1" aria-label="שלבי השיעור">
            {Array.from({ length: totalSteps }).map((_, idx) => {
              const isCurrent = idx === step;
              const isPast = idx < step;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onStepChange?.(idx)}
                  className={`text-[11px] font-extrabold px-1.5 py-0.5 rounded-md cursor-pointer transition-colors ${
                    isCurrent
                      ? 'text-[#58A700] bg-[#D7FFB8]'
                      : isPast
                      ? 'text-[#58CC02] hover:bg-[#F7F7F5]'
                      : 'text-[#AFAFAF] hover:text-[#777777]'
                  }`}
                  title={`מעבר לשלב ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Non-punitive Positive Streak Badge */}
        {streak >= 2 && (
          <div
            className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FF9600] text-white text-xs font-extrabold shrink-0"
            style={{ boxShadow: '0 3px 0 #E08200' }}
            title="רצף הצלחות בניסיון ראשון"
          >
            <Flame className="w-3.5 h-3.5 fill-white shrink-0" />
            <span>{streak} ברצף!</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            AudioEngine.playStep();
            setIsMediaOpen(true);
          }}
          className="btn-duo-white px-2.5 sm:px-3 py-2 text-xs sm:text-sm shrink-0"
          title="סרטון והקלטת פודקאסט"
        >
          <Video className="w-4 h-4 text-[#1CB0F6] shrink-0" />
          <span className="hidden md:inline">סרטון ופודקאסט</span>
        </button>

        <button
          type="button"
          onClick={() => {
            AudioEngine.playStep();
            setIsTutorOpen(true);
          }}
          className="w-10 h-10 sm:w-auto sm:px-3 rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] flex items-center justify-center gap-1.5 text-xs sm:text-sm font-bold text-[#4B4B4B] cursor-pointer shrink-0"
          aria-label="שאלו את זֶן החונך"
          title="שאלו את זֶן החונך"
        >
          <HelpCircle className="w-4 h-4 text-[#FF9600] shrink-0" />
          <span className="hidden md:inline">עזרה</span>
        </button>

        <button
          type="button"
          onClick={handleToggleMute}
          className="w-10 h-10 rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] flex items-center justify-center cursor-pointer shrink-0"
          aria-label={isMuted ? 'הפעלת צלילים' : 'השתקת צלילים'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-[#AFAFAF]" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#1CB0F6]" />
          )}
        </button>
      </header>

      {/* 2. Single-Focus Center Activity */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-3 sm:py-5 flex flex-col justify-center">
        {children}
      </main>

      {/* Optional Just-In-Time Graded Scaffolding Hint Banner */}
      {isHintOpen && hintText && (
        <div className="sticky bottom-[76px] z-20 max-w-3xl w-full mx-auto px-4 pb-2 pointer-events-auto">
          <div className="rounded-2xl bg-[#FFFDF2] border-2 border-[#FFC800] p-3.5 sm:p-4 flex items-center justify-between gap-3">
            <div className="flex items-start gap-2.5 text-sm font-bold text-[#3C3C3C] leading-relaxed">
              <Lightbulb className="w-5 h-5 text-[#FF9600] shrink-0 mt-0.5" />
              <span>{hintText}</span>
            </div>
            <AudioHintButton text={hintText} audioSrc={hintAudioSrc} />
          </div>
        </div>
      )}

      {/* 3. Pinned Bottom Duolingo Check / Continue Footer */}
      <footer
        className={`sticky bottom-0 z-20 border-t-2 transition-colors shrink-0 ${
          feedback?.status === 'pass'
            ? 'bg-[#D7FFB8] border-[#B8F28B]'
            : feedback?.status === 'retry'
            ? 'bg-[#FFDFE0] border-[#FFC1C4]'
            : 'bg-white border-[#E5E5E5]'
        }`}
      >
        <div className="max-w-3xl mx-auto px-4 py-3.5 sm:py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-h-[28px]" role="status" aria-live="polite">
            {feedback?.status === 'pass' ? (
              <>
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#58CC02] shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#58A700]">נכון מאוד!</div>
                  <p className="text-xs sm:text-sm font-bold text-[#467E00] leading-snug">
                    {feedback.text}
                  </p>
                </div>
              </>
            ) : feedback?.status === 'retry' ? (
              <>
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#FF4B4B] shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-sm font-extrabold text-[#EA2B2B]">עוד ניסיון קטן</div>
                  <p className="text-xs sm:text-sm font-bold text-[#B91C1C] leading-snug">
                    {feedback.text}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-bold text-[#777777]">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => onStepChange?.(step - 1)}
                    className="inline-flex items-center gap-1 text-[#777777] hover:text-[#3C3C3C] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 rotate-180" />
                    <span>הקודם</span>
                  </button>
                )}
                <span>•</span>
                <span>שלב {step + 1} מתוך {totalSteps}</span>
                {hintText && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsHintOpen((v) => !v);
                      AudioEngine.playStep();
                    }}
                    className={`mr-1 px-3 py-1 rounded-xl border-2 text-xs font-extrabold inline-flex items-center gap-1 cursor-pointer transition-colors ${
                      isHintOpen || retryCount >= 2
                        ? 'bg-[#FFF6D6] border-[#FFC800] text-[#9A6700]'
                        : 'bg-[#F7F7F5] border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#FFF6D6]'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-[#FF9600]" />
                    <span>{retryCount >= 2 && !isHintOpen ? 'צריכים רמז?' : 'רמז'}</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={isActionDisabled}
            onClick={onPrimaryAction}
            className={`px-8 py-3.5 text-base min-w-[160px] ${
              isActionDisabled
                ? 'btn-duo-disabled'
                : feedback?.status === 'retry'
                ? 'rounded-2xl font-extrabold text-white bg-[#FF4B4B] hover:bg-[#EA2B2B] border-2 border-[#FF4B4B] cursor-pointer select-none transition-transform active:translate-y-[4px]'
                : 'btn-duo-green'
            }`}
            style={
              !isActionDisabled && feedback?.status === 'retry'
                ? { boxShadow: '0 4px 0 #EA2B2B' }
                : undefined
            }
          >
            {primaryButtonLabel}
          </button>
        </div>
      </footer>

      <MediaDrawerModal
        isOpen={isMediaOpen}
        onClose={() => setIsMediaOpen(false)}
        labData={labData}
      />

      <DaylightTutorModal
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        currentLabId={labId}
      />

      {/* Safe Mid-Lesson Exit Guard Dialog */}
      <dialog
        ref={exitDialogRef}
        closedby="any"
        aria-labelledby="lesson-exit-dialog-title"
        onPointerDown={(e) => {
          if (exitDialogRef.current) {
            const r = exitDialogRef.current.getBoundingClientRect();
            pointerOutsideExitRef.current =
              e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
          }
        }}
        onPointerUp={(e) => {
          if (pointerOutsideExitRef.current && exitDialogRef.current) {
            const r = exitDialogRef.current.getBoundingClientRect();
            const out =
              e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
            if (out) setIsExitConfirmOpen(false);
          }
          pointerOutsideExitRef.current = false;
        }}
        className="w-[min(92vw,420px)] p-6 rounded-3xl border-2 border-[#E5E5E5] bg-white text-[#3C3C3C] shadow-none"
      >
        {isExitConfirmOpen && (
          <div className="space-y-5 text-center" dir="rtl">
            <div className="w-24 h-24 mx-auto">
              <img
                src="/illustrations/zen_think.png"
                alt="זֶן"
                className="w-full h-full object-contain select-none"
                draggable={false}
              />
            </div>
            <div className="space-y-1.5">
              <h2 id="lesson-exit-dialog-title" className="text-xl font-extrabold text-[#3C3C3C]">
                לצאת למפת המסע?
              </h2>
              <p className="text-sm font-medium text-[#777777] leading-relaxed">
                אל דאגה — הכוכבים שכבר צברתם והמיקום שלכם בשלב שמורים אוטומטית לחזרה מהירה.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
              <button
                type="button"
                autoFocus
                onClick={() => {
                  setIsExitConfirmOpen(false);
                  AudioEngine.playStep();
                }}
                className="btn-duo-green flex-1 py-3 px-4 text-sm"
              >
                המשך בשיעור
              </button>
              <button
                type="button"
                onClick={confirmExitNow}
                className="btn-duo-white flex-1 py-3 px-4 text-sm"
              >
                יציאה למפה
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
