import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Star,
  Download,
  RotateCcw,
  Eye,
  RefreshCw
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { LAB_METADATA } from '../core/labMeta.js';
import { fireChampagneConfetti } from '../core/confetti.js';
import ZenMascot from './ZenMascot.jsx';
import LessonShell from './LessonShell.jsx';
import { AudioHintButton, QuizStepView, RealWorldStepView } from './LessonSharedViews.jsx';

const TOTAL_STEPS = 7;
const BYTE_WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];
const PENTATONIC_NOTES = [261.63, 293.66, 329.63, 392.0, 440.0, 523.25, 587.33, 659.25];

const PIXEL_PALETTE = [
  { id: 'green', label: 'ירוק', fill: '#58CC02', lip: '#58A700' },
  { id: 'blue', label: 'תכלת', fill: '#1CB0F6', lip: '#1899D6' },
  { id: 'red', label: 'אדום', fill: '#FF4B4B', lip: '#EA2B2B' },
  { id: 'yellow', label: 'צהוב', fill: '#FFC800', lip: '#E5A800' },
  { id: 'charcoal', label: 'פחם', fill: '#3C3C3C', lip: '#1F1F1F' }
];

function playRowChime(rowIndex) {
  const freq = PENTATONIC_NOTES[7 - rowIndex] || 440;
  AudioEngine.playTone(freq, 'sine', 0.12, 0.07);
}

function PixelMatrix8x8({
  grid,
  onSetCell,
  guideGrid = null,
  showGuide = false,
  showDigits = false,
  fillColor = '#FF4B4B',
  lipColor = '#EA2B2B',
  guideBorderClass = 'border-[#FFAFB2] bg-[#FFF5F5]',
  compact = false
}) {
  const paintModeRef = useRef(null);

  useEffect(() => {
    const clearPaint = () => {
      paintModeRef.current = null;
    };
    window.addEventListener('pointerup', clearPaint);
    window.addEventListener('pointercancel', clearPaint);
    return () => {
      window.removeEventListener('pointerup', clearPaint);
      window.removeEventListener('pointercancel', clearPaint);
    };
  }, []);

  const handleTileDown = (idx, e) => {
    e.preventDefault();
    const nextVal = grid[idx] === 1 ? 0 : 1;
    paintModeRef.current = nextVal;
    onSetCell(idx, nextVal);
  };

  const handleTileEnter = (idx) => {
    if (paintModeRef.current === null) return;
    if (grid[idx] !== paintModeRef.current) {
      onSetCell(idx, paintModeRef.current);
    }
  };

  const tileSizeClass = compact
    ? 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10'
    : 'w-9 h-9 sm:w-11 sm:h-11';

  return (
    <div
      className="inline-block bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-2.5 sm:p-3.5 select-none"
      style={{ touchAction: 'none' }}
      dir="ltr"
    >
      <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
        {grid.map((val, idx) => {
          const isLit = val === 1;
          const isGuideTarget = Boolean(showGuide && guideGrid && guideGrid[idx] === 1);
          const isDarkFill =
            fillColor === '#3C3C3C' ||
            fillColor === '#FF4B4B' ||
            fillColor === '#58CC02' ||
            fillColor === '#1CB0F6';

          return (
            <button
              key={idx}
              type="button"
              onPointerDown={(e) => handleTileDown(idx, e)}
              onPointerEnter={() => handleTileEnter(idx)}
              aria-label={`משבצת ${idx + 1}: ${isLit ? '1 דולקת' : '0 כבויה'}`}
              className={`${tileSizeClass} rounded-xl flex items-center justify-center font-mono font-extrabold text-xs sm:text-sm cursor-pointer transition-transform active:translate-y-[2px] ${
                isLit
                  ? 'border-2'
                  : isGuideTarget
                  ? `border-2 border-dashed ${guideBorderClass}`
                  : 'bg-white border-2 border-[#E5E5E5] hover:bg-[#F2F2F0]'
              }`}
              style={
                isLit
                  ? {
                      backgroundColor: fillColor,
                      borderColor: lipColor,
                      boxShadow: `0 3px 0 ${lipColor}`,
                      color: isDarkFill ? '#FFFFFF' : '#3C3C3C'
                    }
                  : {
                      boxShadow: '0 2px 0 #E5E5E5',
                      color: isGuideTarget ? '#999999' : '#CCCCCC'
                    }
              }
            >
              {showDigits ? (isLit ? '1' : '0') : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function Station1LessonPlayer({
  curriculum,
  onExit,
  onNextStation,
  onOpenCertificate
}) {
  const labData = curriculum?.labs?.lab1 || {};
  const labMeta = LAB_METADATA.lab1;
  const heartPreset = labData?.presets?.heart?.grid || [];
  const smileyPreset = labData?.presets?.smiley?.grid || [];
  const quizItem = labMeta?.miniQuiz?.[1] || labMeta?.miniQuiz?.[0];

  const [step, setStep] = useState(() => {
    const saved = StorageEngine.getLabStep('lab1');
    return saved < TOTAL_STEPS - 1 ? saved : 0;
  });
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestLessonStreak, setBestLessonStreak] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Step 0: 3 giant tactile switches
  const [introSwitches, setIntroSwitches] = useState([0, 0, 0]);

  // Step 1: Heart 8x8
  const [heartGrid, setHeartGrid] = useState(() => new Array(64).fill(0));
  const [showHeartGuide, setShowHeartGuide] = useState(true);
  const [showHeartDigits, setShowHeartDigits] = useState(false);

  // Step 2: Single Byte Calculator (make 10)
  const [byteSwitches, setByteSwitches] = useState([0, 0, 0, 0, 0, 0, 0, 0]);

  // Step 3: Multiple choice quiz
  const [selectedChoiceIdx, setSelectedChoiceIdx] = useState(null);

  // Step 4: Smiley 8x8
  const [smileyGrid, setSmileyGrid] = useState(() => new Array(64).fill(0));
  const [showSmileyGuide, setShowSmileyGuide] = useState(true);
  const [showSmileyDigits, setShowSmileyDigits] = useState(true);

  // Step 6: Custom creation & PNG export
  const [customGrid, setCustomGrid] = useState(() => new Array(64).fill(0));
  const [customColorId, setCustomColorId] = useState('green');

  const activeCustomPalette =
    PIXEL_PALETTE.find((c) => c.id === customColorId) || PIXEL_PALETTE[0];

  const allIntroLit = introSwitches.every((v) => v === 1);
  const heartLitCount = useMemo(() => heartGrid.filter((v) => v === 1).length, [heartGrid]);

  const byteSum = useMemo(() => {
    return byteSwitches.reduce((sum, bit, i) => sum + (bit === 1 ? BYTE_WEIGHTS[i] : 0), 0);
  }, [byteSwitches]);
  const byteBinary = byteSwitches.join('');
  const byteActiveTerms = useMemo(() => {
    return BYTE_WEIGHTS.filter((_, i) => byteSwitches[i] === 1);
  }, [byteSwitches]);

  const smileyRows = useMemo(() => {
    const rows = [];
    for (let r = 0; r < 8; r++) {
      const slice = smileyGrid.slice(r * 8, r * 8 + 8);
      const bin = slice.join('');
      const dec = parseInt(bin, 2);
      rows.push({ rowIndex: r, bin, dec, active: dec > 0 });
    }
    return rows;
  }, [smileyGrid]);

  const smileyLitCount = useMemo(() => smileyGrid.filter((v) => v === 1).length, [smileyGrid]);
  const customLitCount = useMemo(() => customGrid.filter((v) => v === 1).length, [customGrid]);

  const goToStep = (nextStep) => {
    const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, nextStep));
    setFeedback(null);
    setRetryCount(0);
    setStep(clamped);
    StorageEngine.setLabStep('lab1', clamped);
    AudioEngine.playStep();
  };

  const recordPass = (message) => {
    const nextStreak = retryCount === 0 ? streak + 1 : 1;
    setStreak(nextStreak);
    if (nextStreak > bestLessonStreak) setBestLessonStreak(nextStreak);
    StorageEngine.recordStreak(nextStreak);
    if (nextStreak >= 2) {
      AudioEngine.playCombo(nextStreak);
    } else {
      AudioEngine.playSuccess();
    }
    setFeedback({ status: 'pass', text: message });
  };

  const recordRetry = (message) => {
    setStreak(0);
    setRetryCount((c) => c + 1);
    AudioEngine.playError();
    setFeedback({ status: 'retry', text: message });
  };

  const updateGridCell = (setter) => (idx, val) => {
    setFeedback(null);
    setter((prev) => {
      if (prev[idx] === val) return prev;
      const next = [...prev];
      next[idx] = val;
      return next;
    });
    const row = Math.floor(idx / 8);
    if (val === 1) {
      playRowChime(row);
    } else {
      AudioEngine.playTone(210, 'triangle', 0.05, 0.04);
    }
  };

  const handleInvertSmiley = () => {
    setFeedback(null);
    setSmileyGrid((prev) => prev.map((b) => (b === 1 ? 0 : 1)));
    AudioEngine.playStep();
  };

  const handleDownloadPng = () => {
    if (typeof document === 'undefined') return;
    const canvas = document.createElement('canvas');
    const size = 512;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    const margin = 24;
    const cardSize = size - margin * 2;
    ctx.fillStyle = '#F7F7F5';
    ctx.strokeStyle = '#E5E5E5';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(margin, margin, cardSize, cardSize, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#3C3C3C';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ציור פיקסלים בינארי (8×8)', size / 2, 52);

    const gridPad = 68;
    const inner = size - gridPad * 2;
    const cell = inner / 8;
    const gap = 5;

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const idx = r * 8 + c;
        const lit = customGrid[idx] === 1;
        const x = gridPad + c * cell + gap / 2;
        const y = gridPad + r * cell + gap / 2;
        const w = cell - gap;
        const h = cell - gap;

        ctx.fillStyle = lit ? activeCustomPalette.fill : '#FFFFFF';
        ctx.beginPath();
        ctx.roundRect(x, y, w, h, 8);
        ctx.fill();

        ctx.strokeStyle = lit ? activeCustomPalette.lip : '#E5E5E5';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = lit
          ? activeCustomPalette.id === 'yellow'
            ? '#3C3C3C'
            : '#FFFFFF'
          : '#CCCCCC';
        ctx.font = 'bold 13px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lit ? '1' : '0', x + w / 2, y + h / 2);
      }
    }

    ctx.fillStyle = '#777777';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText('ZenLab • מעבדת הפיקסלים', size / 2, size - 36);

    const link = document.createElement('a');
    link.download = 'zenlab-pixel-art.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
    AudioEngine.playCollect();
  };

  const handleBottomAction = () => {
    if (feedback?.status === 'pass') {
      if (step < TOTAL_STEPS - 1) {
        goToStep(step + 1);
      } else {
        setIsLessonComplete(true);
      }
      return;
    }

    if (feedback?.status === 'retry') {
      setFeedback(null);
      return;
    }

    if (step === 0 || step === 5) {
      goToStep(step + 1);
      return;
    }

    if (step === 1) {
      const exactMatch =
        heartPreset.length === 64 && heartPreset.every((val, i) => val === heartGrid[i]);
      if (exactMatch) {
        StorageEngine.completeChallenge('lab1', 'lab1_challenge1', 1);
        recordPass(labData.challenges?.[0]?.successMessage || 'ציור הלב הושלם! אספתם כוכב ראשון.');
      } else {
        setShowHeartGuide(true);
        recordRetry(
          'כמעט! בדקו שהדלקתם בדיוק את המשבצות המסומנות בקו המקווקו ושאין משבצות מיותרות דולקות.'
        );
      }
      return;
    }

    if (step === 2) {
      if (byteSum === 10) {
        recordPass('בדיוק! 8 ועוד 2 שווה 10 — בשורת הבייט המחשב שומר 00001010 בזיכרון.');
      } else {
        recordRetry(`הסכום כרגע הוא ${byteSum}, ואנחנו צריכים 10. איזה שתי משבצות חיבורן נותן 10?`);
      }
      return;
    }

    if (step === 3 && quizItem) {
      if (selectedChoiceIdx === quizItem.correctIndex) {
        recordPass(quizItem.explanation);
      } else {
        recordRetry('נסו שוב: היזכרו במתג של 2 ובמתג של 1 משלב הבייט הקודם!');
      }
      return;
    }

    if (step === 4) {
      const exactMatch =
        smileyPreset.length === 64 && smileyPreset.every((val, i) => val === smileyGrid[i]);
      if (exactMatch) {
        StorageEngine.completeChallenge('lab1', 'lab1_challenge2', 1);
        recordPass(labData.challenges?.[1]?.successMessage || 'מעולה! הסמיילי מחייך והקוד מוכן.');
      } else {
        setShowSmileyGuide(true);
        recordRetry('קרוב מאוד! עקבו אחרי הקו המקווקו של העיניים והחיוך כדי להשלים את הסמיילי.');
      }
      return;
    }

    if (step === 6) {
      if (customLitCount >= 14 && customLitCount < 58) {
        StorageEngine.completeChallenge('lab1', 'lab1_challenge3', 1);
        AudioEngine.playZenChime();
        fireChampagneConfetti();
        setIsLessonComplete(true);
      }
    }
  };

  const isActionDisabled = useMemo(() => {
    if (feedback) return false;
    if (step === 0) return !allIntroLit;
    if (step === 1) return heartLitCount === 0;
    if (step === 2) return byteSum === 0;
    if (step === 3) return selectedChoiceIdx === null;
    if (step === 4) return smileyLitCount === 0;
    if (step === 5) return false;
    if (step === 6) return customLitCount < 14 || customLitCount >= 58;
    return false;
  }, [
    feedback,
    step,
    allIntroLit,
    heartLitCount,
    byteSum,
    selectedChoiceIdx,
    smileyLitCount,
    customLitCount
  ]);

  const primaryButtonLabel = useMemo(() => {
    if (feedback?.status === 'pass') return 'המשך';
    if (feedback?.status === 'retry') return 'נסה שוב';
    if (step === 0 || step === 5) return 'המשך';
    if (step === 6) return 'סיום השיעור!';
    return 'בדיקה';
  }, [feedback, step]);

  const stepHintConfig = useMemo(() => {
    if (step === 1) {
      return {
        text: labData.challenges?.[0]?.hint,
        audioSrc: '/audio/hints/lab1_ch1.mp3?v=3.1.1'
      };
    }
    if (step === 2) {
      return {
        text: 'כדי להגיע בדיוק ל-10, הדליקו את המתג שמעליו כתוב 8 ואת המתג שמעליו כתוב 2.',
        audioSrc: '/audio/steps/lab1_step2_hint.mp3?v=3.1.1'
      };
    }
    if (step === 4) {
      return {
        text: labData.challenges?.[1]?.hint,
        audioSrc: '/audio/hints/lab1_ch2.mp3?v=3.1.1'
      };
    }
    if (step === 6) {
      return {
        text: labData.challenges?.[2]?.hint,
        audioSrc: '/audio/hints/lab1_ch3.mp3?v=3.1.1'
      };
    }
    return { text: '', audioSrc: '' };
  }, [step, labData.challenges]);

  return (
    <LessonShell
      labId="lab1"
      labData={labData}
      totalSteps={TOTAL_STEPS}
      step={step}
      onStepChange={goToStep}
      isLessonComplete={isLessonComplete}
      onExit={onExit}
      onNextStation={onNextStation}
      onOpenCertificate={onOpenCertificate}
      feedback={feedback}
      isActionDisabled={isActionDisabled}
      primaryButtonLabel={primaryButtonLabel}
      onPrimaryAction={handleBottomAction}
      hintText={stepHintConfig.text}
      hintAudioSrc={stepHintConfig.audioSrc}
      streak={streak}
      bestLessonStreak={bestLessonStreak}
      retryCount={retryCount}
      victoryTitle="כל הכבוד! סיימתם את שיעור הפיקסלים"
      victorySubtitle="למדתם איך מסך מצייר תמונות ומייצג מספרים בעזרת מתגים של 0 ו-1 בלבד."
      victoryTakeaways={[
        'כל נקודת אור במסך נקראת פיקסל — 0 זה כבוי ו-1 זה דולק.',
        '8 מתגים בשורה יוצרים יחד ״בייט״ אחד שמייצג מספר בין 0 ל-255 בזיכרון.',
        'לוח של 8×8 משבצות מכיל 64 ביטים בדיוק, שזה 8 בייטים של זיכרון.'
      ]}
    >
      {/* STEP 0: First 3 Switches (0 and 1) */}
      {step === 0 && (
        <div className="max-w-xl mx-auto w-full space-y-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C3C3C] text-center">
            איך מסך מצייר תמונות ממספרים?
          </h1>

          <ZenMascot
            pose="teach"
            size="md"
            message="בתוך כל מסך יש מיליוני נקודות אור שנקראות פיקסלים. כל נקודה היא כמו מתג קטן: 0 זה כבוי, ו-1 זה דולק!"
            audioSrc="/audio/steps/lab1_intro.mp3?v=3.1.1"
            spokenFallback="בתוך כל מסך יש מיליוני נקודות אור שנקראות פיקסלים. כל נקודה היא כמו מתג קטן: 0 זה כבוי, ו-1 זה דולק!"
          />

          <div className="text-center space-y-5 pt-2">
            <p className="text-base font-bold text-[#4B4B4B]">
              לחצו על 3 המתגים הכבויים כדי להדליק אותם מ-0 ל-1:
            </p>

            <div className="flex items-center justify-center gap-4 sm:gap-6" dir="ltr">
              {introSwitches.map((val, idx) => {
                const isOn = val === 1;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const nextVal = isOn ? 0 : 1;
                      setIntroSwitches((prev) => {
                        const copy = [...prev];
                        copy[idx] = nextVal;
                        return copy;
                      });
                      AudioEngine.playToggle(nextVal === 1);
                    }}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 cursor-pointer transition-transform active:translate-y-[4px]"
                    style={
                      isOn
                        ? {
                            backgroundColor: '#FFC800',
                            borderColor: '#E5A800',
                            boxShadow: '0 5px 0 #E5A800',
                            color: '#3C3C3C'
                          }
                        : {
                            backgroundColor: '#FFFFFF',
                            borderColor: '#E5E5E5',
                            boxShadow: '0 5px 0 #E5E5E5',
                            color: '#AFAFAF'
                          }
                    }
                    aria-label={`מתג ${idx + 1}: ${isOn ? 'דולק 1' : 'כבוי 0'}`}
                  >
                    <span className="font-mono text-3xl sm:text-4xl font-extrabold">
                      {isOn ? '1' : '0'}
                    </span>
                    <span className="text-xs font-bold">{isOn ? 'דולק' : 'כבוי'}</span>
                  </button>
                );
              })}
            </div>

            <div className="min-h-[24px] text-sm font-extrabold text-[#58A700]">
              {allIntroLit ? 'מצוין! עכשיו אפשר לעבור לציור של ממש.' : ''}
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: Star 1 — Draw Heart on 8x8 Board */}
      {step === 1 && (
        <div className="max-w-xl mx-auto w-full flex flex-col items-center space-y-5">
          <div className="flex items-center justify-center gap-3 text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#3C3C3C]">
              משימה 1: ציירו לב ממתגים של 0 ו-1
            </h1>
            <AudioHintButton
              text={labData.challenges?.[0]?.instructions || 'ציירו לב על לוח המשבצות.'}
              audioSrc="/audio/steps/lab1_inst1.mp3?v=3.1.1"
            />
          </div>

          <p className="text-sm font-medium text-[#777777] text-center">
            לחצו או החליקו עם האצבע על המשבצות כדי להדליק ציור של לב.
          </p>

          <PixelMatrix8x8
            grid={heartGrid}
            onSetCell={updateGridCell(setHeartGrid)}
            guideGrid={heartPreset}
            showGuide={showHeartGuide}
            showDigits={showHeartDigits}
            fillColor="#FF4B4B"
            lipColor="#EA2B2B"
            guideBorderClass="border-[#FFAFB2] bg-[#FFF5F5]"
          />

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setShowHeartGuide((v) => !v);
                AudioEngine.playStep();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                showHeartGuide
                  ? 'bg-[#DDF4FF] border-[#84D8FF] text-[#1899D6]'
                  : 'bg-white border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#F7F7F7]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>קווי עזר</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowHeartDigits((v) => !v);
                AudioEngine.playStep();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 cursor-pointer transition-colors ${
                showHeartDigits
                  ? 'bg-[#DDF4FF] border-[#84D8FF] text-[#1899D6]'
                  : 'bg-white border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#F7F7F7]'
              }`}
            >
              הצג ספרות 0/1
            </button>

            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setHeartGrid(new Array(64).fill(0));
                AudioEngine.playStep();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] text-[#4B4B4B] flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ניקוי</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: Secret of a Byte (Single 8-bit Row = Make 10) */}
      {step === 2 && (
        <div className="max-w-xl mx-auto w-full space-y-7">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3C3C3C] text-center">
            שורה של 8 מתגים נקראת ״בייט״ (Byte)
          </h1>

          <ZenMascot
            pose="think"
            size="md"
            message="לכל מתג בשורה יש משקל משלו — בדיוק כפול מזה שלימינו! כשמדליקים כמה מתגים, המחשב פשוט מחבר אותם."
            audioSrc="/audio/steps/lab1_step2.mp3?v=3.1.1"
            spokenFallback="לכל מתג בשורה יש משקל משלו — בדיוק כפול מזה שלימינו! כשמדליקים כמה מתגים, המחשב פשוט מחבר אותם."
          />

          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-4 sm:p-6 space-y-5">
            <p className="text-sm sm:text-base font-extrabold text-[#3C3C3C] text-center">
              הדליקו את המתגים הנכונים בשורה כדי להגיע בדיוק למספר{' '}
              <span className="text-[#1899D6] font-mono text-lg">10</span> במשקל:
            </p>

            <div className="grid grid-cols-8 gap-1.5 sm:gap-2.5 max-w-md mx-auto" dir="ltr">
              {BYTE_WEIGHTS.map((weight, idx) => {
                const isOn = byteSwitches[idx] === 1;
                return (
                  <div key={weight} className="flex flex-col items-center gap-1.5">
                    <span className="font-mono text-xs sm:text-sm font-extrabold text-[#777777]">
                      {weight}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        const nextVal = isOn ? 0 : 1;
                        setByteSwitches((prev) => {
                          const copy = [...prev];
                          copy[idx] = nextVal;
                          return copy;
                        });
                        AudioEngine.playToggle(nextVal === 1);
                      }}
                      className="w-full h-12 sm:h-14 rounded-xl border-2 font-mono font-extrabold text-base sm:text-lg cursor-pointer transition-transform active:translate-y-[3px]"
                      style={
                        isOn
                          ? {
                              backgroundColor: '#1CB0F6',
                              borderColor: '#1899D6',
                              boxShadow: '0 4px 0 #1899D6',
                              color: '#FFFFFF'
                            }
                          : {
                              backgroundColor: '#FFFFFF',
                              borderColor: '#E5E5E5',
                              boxShadow: '0 4px 0 #E5E5E5',
                              color: '#AFAFAF'
                            }
                      }
                      aria-label={`מתג משקל ${weight}: ${isOn ? '1' : '0'}`}
                    >
                      {isOn ? '1' : '0'}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-sm font-bold text-[#4B4B4B]" dir="ltr">
                {byteActiveTerms.length > 0 ? (
                  <span>
                    {byteActiveTerms.join(' + ')} ={' '}
                    <strong className="text-xl text-[#3C3C3C]">{byteSum}</strong>
                  </span>
                ) : (
                  <span dir="rtl" className="text-[#AFAFAF]">סכום נוכחי: 0</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-[#777777]">
                <span>קוד בינארי:</span>
                <span
                  className="font-mono font-extrabold text-[#1899D6] bg-[#DDF4FF] px-2.5 py-1 rounded-lg"
                  dir="ltr"
                >
                  {byteBinary}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Fast Duolingo-Style Multiple Choice Quiz */}
      {step === 3 && (
        <QuizStepView
          quizItem={quizItem}
          selectedChoiceIdx={selectedChoiceIdx}
          audioSrc="/audio/steps/lab1_quiz1.mp3?v=3.1.1"
          onSelectChoice={(idx) => {
            setFeedback(null);
            setSelectedChoiceIdx(idx);
          }}
        />
      )}

      {/* STEP 4: Star 2 — Smiley 8x8 + Calm Light 8-Byte Strip */}
      {step === 4 && (
        <div className="w-full space-y-5">
          <div className="flex items-center justify-center gap-3 text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#3C3C3C]">
              משימה 2: סמיילי של 8 בייטים
            </h1>
            <AudioHintButton
              text={labData.challenges?.[1]?.instructions || 'ציירו סמיילי שמח על הלוח.'}
              audioSrc="/audio/steps/lab1_inst2.mp3?v=3.1.1"
            />
          </div>

          <p className="text-sm font-medium text-[#777777] text-center">
            ציירו את הסמיילי וראו איך כל שורה הופכת לשורת אפסים ואחדים בזמן אמת:
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6">
            <PixelMatrix8x8
              grid={smileyGrid}
              onSetCell={updateGridCell(setSmileyGrid)}
              guideGrid={smileyPreset}
              showGuide={showSmileyGuide}
              showDigits={showSmileyDigits}
              fillColor="#FFC800"
              lipColor="#E5A800"
              guideBorderClass="border-[#F59E0B] bg-[#FFFDF0]"
              compact
            />

            <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-2xl p-3.5 w-full max-w-[272px] shrink-0 space-y-1.5">
              <div className="text-xs font-extrabold text-[#777777] pb-1 border-b border-[#E5E5E5]">
                זיכרון התמונה (8 בייטים):
              </div>
              {smileyRows.map((row) => (
                <div
                  key={row.rowIndex}
                  className={`flex items-center justify-between px-2.5 py-1 rounded-xl text-xs transition-colors ${
                    row.active
                      ? 'bg-white border border-[#FFC800] text-[#3C3C3C] font-bold'
                      : 'text-[#AFAFAF]'
                  }`}
                >
                  <span className="font-bold">שורה {row.rowIndex + 1}</span>
                  <div className="flex items-center gap-2 font-mono" dir="ltr">
                    <span>{row.bin}</span>
                    <span className="w-8 text-right text-[#777777]">={row.dec}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setShowSmileyGuide((v) => !v);
                AudioEngine.playStep();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 flex items-center gap-1.5 cursor-pointer transition-colors ${
                showSmileyGuide
                  ? 'bg-[#DDF4FF] border-[#84D8FF] text-[#1899D6]'
                  : 'bg-white border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#F7F7F7]'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>קווי עזר</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setShowSmileyDigits((v) => !v);
                AudioEngine.playStep();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border-2 cursor-pointer transition-colors ${
                showSmileyDigits
                  ? 'bg-[#DDF4FF] border-[#84D8FF] text-[#1899D6]'
                  : 'bg-white border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#F7F7F7]'
              }`}
            >
              ספרות 0/1
            </button>

            <button
              type="button"
              onClick={handleInvertSmiley}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] text-[#4B4B4B] flex items-center gap-1.5 cursor-pointer"
              title="היפוך לוגי: 0 הופך ל-1 ו-1 הופך ל-0"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>היפוך 0↔1</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setFeedback(null);
                setSmileyGrid(new Array(64).fill(0));
                AudioEngine.playStep();
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] text-[#4B4B4B] flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ניקוי</span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: Real-World Connections + Critical Thinking */}
      {step === 5 && (
        <RealWorldStepView
          title="איפה מסתתרים הפיקסלים בחיים האמיתיים?"
          mascotMessage="עכשיו כשאתם יודעים מה זה פיקסל וביט, שימו לב איפה המחשב משתמש בזה כל יום:"
          spokenFallback="עכשיו כשאתם יודעים מה זה פיקסל וביט, שימו לב איפה המחשב משתמש בזה כל יום:"
          audioSrc="/audio/steps/lab1_realworld.mp3?v=3.1.1"
          labMeta={labMeta}
        />
      )}

      {/* STEP 6: Star 3 — Free Pixel Art + Color Picker + PNG Export */}
      {step === 6 && (
        <div className="max-w-xl mx-auto w-full flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#3C3C3C]">
              משימה 3: יצירה חופשית ושמירה כתמונה
            </h1>
            <AudioHintButton
              text={labData.challenges?.[2]?.instructions || 'ציירו סמל או את האות הראשונה של השם שלכם.'}
              audioSrc="/audio/steps/lab1_inst3.mp3?v=3.1.1"
            />
          </div>

          <p className="text-sm font-medium text-[#777777] text-center">
            ציירו את האות הראשונה של שמכם או כל סמל שתרצו עם לפחות 14 משבצות דולקות:
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-2 bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-2xl px-3 py-1.5">
              {PIXEL_PALETTE.map((swatch) => {
                const selected = swatch.id === customColorId;
                return (
                  <button
                    key={swatch.id}
                    type="button"
                    onClick={() => {
                      setCustomColorId(swatch.id);
                      AudioEngine.playStep();
                    }}
                    className={`w-7 h-7 rounded-full cursor-pointer transition-transform ${
                      selected ? 'scale-110 ring-2 ring-offset-2 ring-[#3C3C3C]' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: swatch.fill }}
                    title={swatch.label}
                    aria-label={`צבע ${swatch.label}`}
                  />
                );
              })}
            </div>

            <div
              className={`px-3.5 py-2 rounded-2xl border-2 text-xs sm:text-sm font-extrabold ${
                customLitCount >= 14 && customLitCount < 58
                  ? 'bg-[#D7FFB8] border-[#58CC02] text-[#58A700]'
                  : 'bg-white border-[#E5E5E5] text-[#4B4B4B]'
              }`}
            >
              {customLitCount} / 14 משבצות דולקות
            </div>
          </div>

          <PixelMatrix8x8
            grid={customGrid}
            onSetCell={updateGridCell(setCustomGrid)}
            showDigits={false}
            fillColor={activeCustomPalette.fill}
            lipColor={activeCustomPalette.lip}
          />

          <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleDownloadPng}
              className="btn-duo-blue px-4 py-2.5 text-sm"
            >
              <Download className="w-4 h-4" />
              <span>הורדת הציור כתמונה (PNG)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCustomGrid(new Array(64).fill(0));
                AudioEngine.playStep();
              }}
              className="btn-duo-white px-4 py-2.5 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>ניקוי</span>
            </button>
          </div>
        </div>
      )}
    </LessonShell>
  );
}
