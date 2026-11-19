import React, { useState, useMemo } from 'react';
import { RotateCcw, Search } from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { AIService } from '../services/ai.js';
import { LAB_METADATA } from '../core/labMeta.js';
import { fireChampagneConfetti } from '../core/confetti.js';
import ZenMascot from './ZenMascot.jsx';
import LessonShell from './LessonShell.jsx';
import { AudioHintButton, QuizStepView, RealWorldStepView } from './LessonSharedViews.jsx';

const TOTAL_STEPS = 7;

export default function Station6VisionLesson({
  curriculum,
  onExit,
  onNextStation,
  onOpenCertificate
}) {
  const labData = curriculum?.labs?.lab6 || {};
  const labMeta = LAB_METADATA.lab6;
  const presets = labData.presets || {};
  const kernels = labData.kernels || {};

  const [step, setStep] = useState(() => {
    const saved = StorageEngine.getLabStep('lab6');
    return saved < TOTAL_STEPS - 1 ? saved : 0;
  });
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestLessonStreak, setBestLessonStreak] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Convolution workspace state
  const [selectedPreset, setSelectedPreset] = useState('cross');
  const [inputGrid, setInputGrid] = useState(
    () => presets.cross?.grid || new Array(64).fill(0)
  );
  const [activeKernelKey, setActiveKernelKey] = useState('blur');
  const [inspectedCell, setInspectedCell] = useState(null);

  // Quizzes
  const [quiz1Choice, setQuiz1Choice] = useState(null);
  const [quiz2Choice, setQuiz2Choice] = useState(null);

  const currentKernel = kernels[activeKernelKey] || {
    name: 'פילטר',
    matrix: [
      [0, 0, 0],
      [0, 1, 0],
      [0, 0, 0]
    ]
  };

  const convolutionResult = useMemo(() => {
    return AIService.computeConvolution({
      inputGrid,
      width: 8,
      height: 8,
      kernel: currentKernel.matrix
    });
  }, [inputGrid, currentKernel]);

  const inspectedDetail = useMemo(() => {
    if (!inspectedCell) return null;
    return convolutionResult.details.find(
      (d) => d.x === inspectedCell.x && d.y === inspectedCell.y
    );
  }, [convolutionResult, inspectedCell]);

  const inspectedMatrixCells = useMemo(() => {
    if (!inspectedCell) return [];
    const cells = [];
    for (let ky = -1; ky <= 1; ky++) {
      for (let kx = -1; kx <= 1; kx++) {
        const nx = inspectedCell.x + kx;
        const ny = inspectedCell.y + ky;
        const px = nx >= 0 && nx < 8 && ny >= 0 && ny < 8 ? inputGrid[ny * 8 + nx] || 0 : 0;
        const kw = currentKernel.matrix?.[ky + 1]?.[kx + 1] ?? 0;
        const prod = px * kw;
        cells.push({ px, kw, prod, isCenter: kx === 0 && ky === 0 });
      }
    }
    return cells;
  }, [inspectedCell, inputGrid, currentKernel]);

  const goToStep = (nextStep) => {
    const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, nextStep));
    setFeedback(null);
    setRetryCount(0);
    if (clamped === 4 && !inspectedCell) {
      setSelectedPreset('square');
      if (presets.square?.grid) setInputGrid([...presets.square.grid]);
      setActiveKernelKey('verticalEdge');
    }
    setStep(clamped);
    StorageEngine.setLabStep('lab6', clamped);
    AudioEngine.playStep();
  };

  const recordPass = (message) => {
    const nextStreak = retryCount === 0 ? streak + 1 : 1;
    setStreak(nextStreak);
    if (nextStreak > bestLessonStreak) setBestLessonStreak(nextStreak);
    StorageEngine.recordStreak(nextStreak);
    if (nextStreak >= 2) AudioEngine.playCombo(nextStreak);
    else AudioEngine.playSuccess();
    setFeedback({ status: 'pass', text: message });
  };

  const recordRetry = (message) => {
    setStreak(0);
    setRetryCount((c) => c + 1);
    AudioEngine.playError();
    setFeedback({ status: 'retry', text: message });
  };

  const handleSelectPreset = (key) => {
    setFeedback(null);
    setSelectedPreset(key);
    if (presets[key]?.grid) setInputGrid([...presets[key].grid]);
    AudioEngine.playStep();
  };

  const handleBottomAction = () => {
    if (feedback?.status === 'pass') {
      if (step < TOTAL_STEPS - 1) goToStep(step + 1);
      else setIsLessonComplete(true);
      return;
    }
    if (feedback?.status === 'retry') {
      setFeedback(null);
      return;
    }

    if (step === 0) {
      goToStep(1);
      return;
    }

    if (step === 1) {
      if (selectedPreset === 'verticalStripe' && activeKernelKey === 'verticalEdge') {
        StorageEngine.completeChallenge('lab6', 'lab6_challenge1', 1);
        recordPass(
          labData.challenges?.[0]?.successMessage ||
            'הפילטר זיהה בדיוק את הגבולות האנכיים משמאל ומימין והאיר אותם בירוק!'
        );
      } else {
        recordRetry(
          'בחרו בתמונת "פס אנכי" והפעילו את הפילטר "זיהוי קצוות אנכיים"!'
        );
      }
      return;
    }

    if (step === 2) {
      if (
        selectedPreset === 'square' &&
        (activeKernelKey === 'horizontalEdge' || activeKernelKey === 'verticalEdge')
      ) {
        StorageEngine.completeChallenge('lab6', 'lab6_challenge2', 1);
        recordPass(
          labData.challenges?.[1]?.successMessage ||
            'קצוות הריבוע זוהו בהצלחה על ידי הפילטר — בלי לצייר את הפנים המלא!'
        );
      } else {
        recordRetry(
          'בחרו בתמונת "ריבוע מרכזי" והפעילו פילטר קצוות (אופקיים או אנכיים) כדי לחשוף את הגבולות!'
        );
      }
      return;
    }

    if (step === 3) {
      const q = labMeta.miniQuiz[1];
      if (quiz1Choice === q.correctIndex) recordPass(q.explanation);
      else recordRetry('נסו שוב: איך ההפרש בין צד בהיר לצד כהה מדליק גבול?');
      return;
    }

    if (step === 4) {
      if (inspectedCell) {
        StorageEngine.completeChallenge('lab6', 'lab6_challenge1', 1);
        StorageEngine.completeChallenge('lab6', 'lab6_challenge2', 1);
        StorageEngine.completeChallenge('lab6', 'lab6_challenge3', 1);
        fireChampagneConfetti();
        recordPass(
          labData.challenges?.[2]?.successMessage ||
            'הבלש בפעולה! ראיתם איך זכוכית המגדלת (3×3) כופלת ומחברת את 9 המשבצות השכנות.'
        );
      } else {
        recordRetry('לחצו על משבצת כלשהי בלוח כדי להקפיא עליה את זכוכית המגדלת של 3×3!');
      }
      return;
    }

    if (step === 5) {
      const q = labMeta.miniQuiz[2];
      if (quiz2Choice === q.correctIndex) recordPass(q.explanation);
      else recordRetry('נסו שוב: אילו קווים בריבוע שוכבים למעלה ולמטה?');
      return;
    }

    if (step === 6) {
      setIsLessonComplete(true);
    }
  };

  const isActionDisabled = useMemo(() => {
    if (feedback) return false;
    if (step === 3) return quiz1Choice === null;
    if (step === 4) return !inspectedCell;
    if (step === 5) return quiz2Choice === null;
    return false;
  }, [feedback, step, quiz1Choice, inspectedCell, quiz2Choice]);

  const primaryButtonLabel = useMemo(() => {
    if (feedback?.status === 'pass') return step === TOTAL_STEPS - 1 ? 'סיום השיעור!' : 'המשך';
    if (feedback?.status === 'retry') return 'נסה שוב';
    if (step === 0 || step === 6) return step === 6 ? 'סיום השיעור!' : 'המשך';
    return 'בדיקה';
  }, [feedback, step]);

  const hintConfig = useMemo(() => {
    if (step === 1) return { text: labData.challenges?.[0]?.hint, audioSrc: '/audio/hints/lab6_ch1.mp3?v=3.1.1' };
    if (step === 2) return { text: labData.challenges?.[1]?.hint, audioSrc: '/audio/hints/lab6_ch2.mp3?v=3.1.1' };
    if (step === 4) return { text: labData.challenges?.[2]?.hint, audioSrc: '/audio/hints/lab6_ch3.mp3?v=3.1.1' };
    return { text: '', audioSrc: '' };
  }, [step, labData.challenges]);

  const isVisionStep = step === 1 || step === 2 || step === 4;

  return (
    <LessonShell
      labId="lab6"
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
      hintText={hintConfig.text}
      hintAudioSrc={hintConfig.audioSrc}
      streak={streak}
      bestLessonStreak={bestLessonStreak}
      retryCount={retryCount}
      victoryTitle="בלשי הראייה! פיצחתם את עיני המחשב"
      victorySubtitle="גיליתם איך זכוכית מגדלת מתמטית סורקת פיקסלים וחושפת קווים וצורות."
      victoryTakeaways={[
        'פילטר (Kernel 3×3) מחליק על התמונה ומשווה כל פיקסל לשמונה שכניו.',
        'מעבר חד מאור (1) לחושך (0) מדליק קו גבול — כך מכונית חכמה מזהה תמרורים!',
        'פילטרים שונים מוצאים תכונות שונות: קצוות אנכיים, אופקיים, חידוד או החלקה.'
      ]}
    >
      {/* STEP 0: Intro */}
      {step === 0 && (
        <div className="max-w-xl mx-auto w-full space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C3C3C] text-center">
            איך מכונית ללא נהג &quot;רואה&quot; את הכביש?
          </h1>

          <ZenMascot
            pose="teach"
            size="md"
            message="מצלמה מעבירה למחשב טבלה ענקית של מספרים. בעזרת פילטר בגודל 3×3, המחשב סורק כל פיקסל ושכניו ומגלה איפה מסתתרים קווים וצורות!"
            audioSrc="/audio/steps/lab6_intro.mp3?v=3.1.1"
            spokenFallback="מצלמה מעבירה למחשב טבלה ענקית של מספרים. בעזרת פילטר בגודל 3×3, המחשב סורק כל פיקסל ושכניו ומגלה איפה מסתתרים קווים וצורות!"
          />

          <div className="card-duo p-5 bg-[#F7F7F5] space-y-3 text-center">
            <div className="text-xs sm:text-sm font-extrabold text-[#3C3C3C]">
              דוגמה לזכוכית מגדלת לזיהוי קצוות אנכיים (3×3):
            </div>
            <div className="grid grid-cols-3 gap-2 max-w-[190px] mx-auto" dir="ltr">
              {[-1, 0, 1, -1, 0, 1, -1, 0, 1].map((w, i) => (
                <div
                  key={i}
                  className={`h-11 rounded-xl border-2 font-mono font-extrabold text-sm flex items-center justify-center ${
                    w < 0
                      ? 'bg-[#FFDFE0] border-[#FF4B4B] text-[#B91C1C]'
                      : w > 0
                      ? 'bg-[#D7FFB8] border-[#58CC02] text-[#467E00]'
                      : 'bg-white border-[#E5E5E5] text-[#777777]'
                  }`}
                >
                  {w > 0 ? `+${w}` : w}
                </div>
              ))}
            </div>
            <p className="text-xs text-[#777777] font-medium">
              כשבצד אחד יש אור (+1) ובצד השני חושך (-1), ההפרש מאיר ומתגלה גבול!
            </p>
          </div>
        </div>
      )}

      {/* STEPS 1, 2, 4: Interactive Dual 8x8 Convolution Workspace */}
      {isVisionStep && (
        <div className="w-full space-y-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#3C3C3C]">
              {step === 1
                ? 'משימה 1: חשפו גבולות של פס אנכי'
                : step === 2
                ? 'משימה 2: חשפו את קווי המתאר של הריבוע'
                : 'משימה 3: בלש 9 השכנים — לחצו על משבצת לבדיקה'}
            </h1>
            <AudioHintButton
              text={
                step === 1
                  ? labData.challenges?.[0]?.instructions
                  : step === 2
                  ? labData.challenges?.[1]?.instructions
                  : labData.challenges?.[2]?.instructions
              }
              audioSrc={
                step === 1
                  ? '/audio/steps/lab6_inst1.mp3?v=3.1.1'
                  : step === 2
                  ? '/audio/steps/lab6_inst2.mp3?v=3.1.1'
                  : '/audio/steps/lab6_inst3.mp3?v=3.1.1'
              }
            />
          </div>

          {/* Preset & Kernel Strip */}
          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-2xl p-3 space-y-2.5 max-w-2xl mx-auto">
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-extrabold text-[#777777]">תמונת מקור:</span>
              {Object.entries(presets).map(([k, p]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => handleSelectPreset(k)}
                  className={`px-3 py-1.5 rounded-xl border-2 text-xs font-extrabold cursor-pointer ${
                    selectedPreset === k
                      ? 'bg-[#FFC800] border-[#E5A800] text-[#3C3C3C]'
                      : 'bg-white border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#F7F7F7]'
                  }`}
                >
                  {p.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setInputGrid(new Array(64).fill(0));
                  setSelectedPreset('custom');
                  AudioEngine.playStep();
                }}
                className="px-2.5 py-1.5 rounded-xl border-2 border-[#E5E5E5] bg-white text-xs font-bold text-[#777777] cursor-pointer"
                title="ניקוי הלוח"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="text-xs font-extrabold text-[#777777]">פילטר סריקה:</span>
              {Object.entries(kernels).map(([k, item]) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setFeedback(null);
                    setActiveKernelKey(k);
                    AudioEngine.playStep();
                  }}
                  className={`px-3 py-1.5 rounded-xl border-2 text-xs font-extrabold cursor-pointer ${
                    activeKernelKey === k
                      ? 'bg-[#1CB0F6] border-[#1899D6] text-white'
                      : 'bg-white border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#DDF4FF]'
                  }`}
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>

          {/* Dual 8x8 Grids (dir="ltr" so left/right alignment matches vertical/horizontal matrices) */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-5">
            {/* Input Image Grid */}
            <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-3 sm:p-4 text-center space-y-2">
              <div className="text-xs font-extrabold text-[#3C3C3C]">
                תמונת המקור (לחצו לעריכה/בדיקה)
              </div>
              <div className="grid grid-cols-8 gap-1" dir="ltr">
                {inputGrid.map((val, idx) => {
                  const x = idx % 8;
                  const y = Math.floor(idx / 8);
                  const isInWindow =
                    inspectedCell &&
                    Math.abs(x - inspectedCell.x) <= 1 &&
                    Math.abs(y - inspectedCell.y) <= 1;
                  const isCenter =
                    inspectedCell && inspectedCell.x === x && inspectedCell.y === y;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        if (step === 4) {
                          setInspectedCell({ x, y });
                          AudioEngine.playStep();
                        } else {
                          setInputGrid((prev) => {
                            const next = [...prev];
                            next[idx] = next[idx] === 1 ? 0 : 1;
                            return next;
                          });
                          setSelectedPreset('custom');
                          AudioEngine.playToggle(val === 0);
                        }
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 font-mono text-[10px] font-extrabold cursor-pointer ${
                        isCenter
                          ? 'ring-2 ring-[#FF9600]'
                          : isInWindow
                          ? 'ring-2 ring-[#1CB0F6]'
                          : ''
                      }`}
                      style={{
                        backgroundColor: val === 1 ? '#3C3C3C' : '#FFFFFF',
                        borderColor: isInWindow ? '#1CB0F6' : val === 1 ? '#1F1F1F' : '#E5E5E5',
                        color: val === 1 ? '#FFFFFF' : '#AFAFAF'
                      }}
                    >
                      {val}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Output Feature Map Grid */}
            <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-3 sm:p-4 text-center space-y-2">
              <div className="text-xs font-extrabold text-[#467E00]">
                תמונת התוצאה — גבולות מאירים!
              </div>
              <div className="grid grid-cols-8 gap-1" dir="ltr">
                {convolutionResult.outputGrid.map((val, idx) => {
                  const x = idx % 8;
                  const y = Math.floor(idx / 8);
                  const isSelected = inspectedCell && inspectedCell.x === x && inspectedCell.y === y;
                  const isStrong = val >= 0.4;
                  const isMid = val > 0 && val < 0.4;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        setInspectedCell({ x, y });
                        AudioEngine.playStep();
                      }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg border-2 font-mono text-[10px] font-extrabold cursor-pointer ${
                        isSelected ? 'ring-2 ring-[#FF9600]' : ''
                      }`}
                      style={{
                        backgroundColor: isStrong
                          ? '#58CC02'
                          : isMid
                          ? '#D7FFB8'
                          : '#FFFFFF',
                        borderColor: isSelected
                          ? '#FF9600'
                          : isStrong
                          ? '#58A700'
                          : '#E5E5E5',
                        color: isStrong ? '#FFFFFF' : '#4B4B4B'
                      }}
                    >
                      {val > 0 ? val.toFixed(1).replace('.0', '') : '0'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 4 3x3 Neighborhood Inspector Breakdown */}
          {step === 4 && (
            <div className="max-w-md mx-auto card-duo p-3.5 text-center space-y-2 bg-[#FFFDF2] border-[#1CB0F6]">
              {inspectedDetail ? (
                <>
                  <div className="text-xs font-extrabold text-[#1899D6] flex items-center justify-center gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    <span>
                      זכוכית מגדלת (3×3) במשבצת ({inspectedCell.x}, {inspectedCell.y})
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5 max-w-[280px] mx-auto" dir="ltr">
                    {inspectedMatrixCells.map((cell, i) => {
                      const prodStr = Number.isInteger(cell.prod) ? cell.prod : cell.prod.toFixed(1);
                      const kwStr = cell.kw < 0 ? `(${cell.kw})` : cell.kw;
                      return (
                        <div
                          key={i}
                          className={`py-1 px-1.5 rounded-lg border font-mono text-[10px] font-bold ${
                            cell.isCenter
                              ? 'bg-[#FFFDF2] border-[#FF9600] text-[#3C3C3C]'
                              : cell.prod !== 0
                              ? 'bg-[#DDF4FF] border-[#84D8FF] text-[#1899D6]'
                              : 'bg-white border-[#E5E5E5] text-[#777777]'
                          }`}
                        >
                          {cell.px}×{kwStr}={prodStr}
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-xs font-extrabold text-[#3C3C3C]">
                    סכום 9 המשבצות: <span className="font-mono">{inspectedDetail.sum.toFixed(1)}</span>{' '}
                    ← עוצמה במפה: <span className="font-mono text-[#58A700]">{inspectedDetail.clamped}</span>
                  </div>
                </>
              ) : (
                <p className="text-xs font-bold text-[#777777]">
                  לחצו על משבצת כלשהי באחד הלוחות כדי לראות את חישוב 9 המשבצות שלה!
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* STEP 3: Quiz 1 */}
      {step === 3 && (
        <QuizStepView
          quizItem={labMeta.miniQuiz[1]}
          selectedChoiceIdx={quiz1Choice}
          audioSrc="/audio/steps/lab6_quiz1.mp3?v=3.1.1"
          onSelectChoice={(idx) => {
            setFeedback(null);
            setQuiz1Choice(idx);
          }}
        />
      )}

      {/* STEP 5: Quiz 2 */}
      {step === 5 && (
        <QuizStepView
          quizItem={labMeta.miniQuiz[2]}
          selectedChoiceIdx={quiz2Choice}
          audioSrc="/audio/steps/lab6_quiz2.mp3?v=3.1.1"
          onSelectChoice={(idx) => {
            setFeedback(null);
            setQuiz2Choice(idx);
          }}
          badgeText="בדיקת הבנה"
        />
      )}

      {/* STEP 6: Real-World Connections */}
      {step === 6 && (
        <RealWorldStepView
          title="איפה פועלת ראייה ממוחשבת בחיים האמיתיים?"
          mascotMessage="הפילטרים שסורקים 9 פיקסלים הם אבן הבניין של פתיחת טלפון עם פנים ורכבים בטיחותיים:"
          spokenFallback="הפילטרים שסורקים 9 פיקסלים הם אבן הבניין של פתיחת טלפון עם פנים ורכבים בטיחותיים:"
          audioSrc="/audio/steps/lab6_realworld.mp3?v=3.1.1"
          labMeta={labMeta}
        />
      )}
    </LessonShell>
  );
}
