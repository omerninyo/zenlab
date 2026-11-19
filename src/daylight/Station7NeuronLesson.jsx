import React, { useState, useMemo } from 'react';
import { RotateCcw, Wand2, Network, Plus, Minus } from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { AIService } from '../services/ai.js';
import { LAB_METADATA } from '../core/labMeta.js';
import { fireChampagneConfetti } from '../core/confetti.js';
import ZenMascot from './ZenMascot.jsx';
import LessonShell from './LessonShell.jsx';
import { AudioHintButton, QuizStepView, RealWorldStepView } from './LessonSharedViews.jsx';

const TOTAL_STEPS = 7;

function clampVal(v) {
  return Math.max(-3.0, Math.min(3.0, Math.round(v * 10) / 10));
}

function toPlotCoords(x1, x2) {
  return { cx: 26 + x1 * 68, cy: 94 - x2 * 68 };
}

function computeLineSegment(w1, w2, bias) {
  if (Math.abs(w2) > 0.05) {
    const xA = -0.35;
    const xB = 1.35;
    const yA = -(w1 * xA + bias) / w2;
    const yB = -(w1 * xB + bias) / w2;
    return { p1: toPlotCoords(xA, yA), p2: toPlotCoords(xB, yB) };
  }
  if (Math.abs(w1) > 0.05) {
    const x = -bias / w1;
    return { p1: toPlotCoords(x, -0.35), p2: toPlotCoords(x, 1.35) };
  }
  return null;
}

export default function Station7NeuronLesson({
  curriculum,
  onExit,
  onNextStation,
  onOpenCertificate
}) {
  const labData = curriculum?.labs?.lab7 || {};
  const labMeta = LAB_METADATA.lab7;

  const [step, setStep] = useState(() => {
    const saved = StorageEngine.getLabStep('lab7');
    return saved < TOTAL_STEPS - 1 ? saved : 0;
  });
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestLessonStreak, setBestLessonStreak] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Step 0 warmup park decision
  const [sunOn, setSunOn] = useState(true);
  const [friendsOn, setFriendsOn] = useState(false);

  // Perceptron Sliders
  const [w1, setW1] = useState(0.6);
  const [w2, setW2] = useState(0.6);
  const [bias, setBias] = useState(-0.4);
  const [triedXorSliders, setTriedXorSliders] = useState(false);
  const [networkActivated, setNetworkActivated] = useState(false);

  // Quizzes
  const [quiz1Choice, setQuiz1Choice] = useState(null);
  const [quiz2Choice, setQuiz2Choice] = useState(null);

  const selectedGate = step === 1 ? 'AND' : step === 2 ? 'OR' : 'XOR';

  const evaluation = useMemo(() => {
    return AIService.evaluatePerceptron({ w1, w2, bias, activation: 'step' });
  }, [w1, w2, bias]);

  const currentAccuracy = useMemo(() => {
    if (selectedGate === 'AND') return evaluation.accuracyAnd;
    if (selectedGate === 'OR') return evaluation.accuracyOr;
    if (networkActivated) return 100;
    return evaluation.accuracyXor;
  }, [selectedGate, evaluation, networkActivated]);

  const boundaryLine = useMemo(() => computeLineSegment(w1, w2, bias), [w1, w2, bias]);

  const goToStep = (nextStep) => {
    const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, nextStep));
    setFeedback(null);
    setRetryCount(0);
    if (clamped === 1) {
      setW1(0.6);
      setW2(0.6);
      setBias(-0.4);
      setNetworkActivated(false);
    } else if (clamped === 2) {
      setW1(0.5);
      setW2(0.5);
      setBias(-0.8);
      setNetworkActivated(false);
    } else if (clamped === 4) {
      setW1(1.0);
      setW2(1.0);
      setBias(-0.5);
      setNetworkActivated(false);
    }
    setStep(clamped);
    StorageEngine.setLabStep('lab7', clamped);
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

  const handleSliderUpdate = (setter) => (nextVal) => {
    setFeedback(null);
    setter(clampVal(nextVal));
    if (step === 4) {
      setTriedXorSliders(true);
      setNetworkActivated(false);
    }
    AudioEngine.playStep();
  };

  const handleAutoTune = () => {
    setFeedback(null);
    if (selectedGate === 'AND') {
      setW1(0.8);
      setW2(0.8);
      setBias(-1.2);
    } else if (selectedGate === 'OR') {
      setW1(0.8);
      setW2(0.8);
      setBias(-0.4);
    } else {
      setTriedXorSliders(true);
      setNetworkActivated(true);
      AudioEngine.playUnlock();
      return;
    }
    AudioEngine.playSuccess();
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
      if (evaluation.accuracyAnd === 100) {
        StorageEngine.completeChallenge('lab7', 'lab7_challenge1', 1);
        recordPass(
          labData.challenges?.[0]?.successMessage ||
            'שער וגם (AND) אומן בהצלחה! הנוירון מפריד ב-100% דיוק.'
        );
      } else {
        recordRetry(
          `הדיוק כרגע הוא ${evaluation.accuracyAnd}%. אנחנו רוצים שרק (1,1) יידלק — הורידו את סף השכנוע (למשל ל--1.2) או השתמשו בכיוון העזר!`
        );
      }
      return;
    }

    if (step === 2) {
      if (evaluation.accuracyOr === 100) {
        StorageEngine.completeChallenge('lab7', 'lab7_challenge2', 1);
        recordPass(
          labData.challenges?.[1]?.successMessage ||
            'שער או (OR) אומן בהצלחה! כל אחת מהכניסות מספיקה להדליק את הנוירון.'
        );
      } else {
        recordRetry(
          `הדיוק כרגע הוא ${evaluation.accuracyOr}%. כאן מספיק שרמז אחד יהיה 1 — כוונו למשל משקלים 0.8 וסף שכנוע -0.4.`
        );
      }
      return;
    }

    if (step === 3) {
      const q = labMeta.miniQuiz[1];
      if (quiz1Choice === q.correctIndex) recordPass(q.explanation);
      else recordRetry('נסו שוב: מתי שער "וגם" (AND) מדליק את האור לעומת שער "או" (OR)?');
      return;
    }

    if (step === 4) {
      if (networkActivated || (triedXorSliders && evaluation.accuracyXor >= 75)) {
        StorageEngine.completeChallenge('lab7', 'lab7_challenge1', 1);
        StorageEngine.completeChallenge('lab7', 'lab7_challenge2', 1);
        StorageEngine.completeChallenge('lab7', 'lab7_challenge3', 1);
        fireChampagneConfetti();
        recordPass(
          labData.challenges?.[2]?.successMessage ||
            'פיצחתם את סוד ה-XOR! נוירון בודד יכול למתוח רק קו ישר אחד, וצוות נוירונים פותר 100%.'
        );
      } else {
        recordRetry(
          'הזיזו קודם את הידיות ב-XOR כדי לראות למה קו אחד נתקע ב-75%, ואז לחצו על "חברו צוות של 2 נוירונים"!'
        );
      }
      return;
    }

    if (step === 5) {
      const q = labMeta.miniQuiz[2];
      if (quiz2Choice === q.correctIndex) recordPass(q.explanation);
      else recordRetry('נסו שוב: איפה ממוקמות הנקודות הירוקות בשער XOR על הגרף?');
      return;
    }

    if (step === 6) {
      setIsLessonComplete(true);
    }
  };

  const isActionDisabled = useMemo(() => {
    if (feedback) return false;
    if (step === 3) return quiz1Choice === null;
    if (step === 4) return !networkActivated && !triedXorSliders;
    if (step === 5) return quiz2Choice === null;
    return false;
  }, [feedback, step, quiz1Choice, networkActivated, triedXorSliders, quiz2Choice]);

  const primaryButtonLabel = useMemo(() => {
    if (feedback?.status === 'pass') return step === TOTAL_STEPS - 1 ? 'סיום השיעור!' : 'המשך';
    if (feedback?.status === 'retry') return 'נסה שוב';
    if (step === 0 || step === 6) return step === 6 ? 'סיום השיעור!' : 'המשך';
    return 'בדיקה';
  }, [feedback, step]);

  const hintConfig = useMemo(() => {
    if (step === 1) return { text: labData.challenges?.[0]?.hint, audioSrc: '/audio/hints/lab7_ch1.mp3?v=1.0.0' };
    if (step === 2) return { text: labData.challenges?.[1]?.hint, audioSrc: '/audio/hints/lab7_ch2.mp3?v=1.0.0' };
    if (step === 4) return { text: labData.challenges?.[2]?.hint, audioSrc: '/audio/hints/lab7_ch3.mp3?v=1.0.0' };
    return { text: '', audioSrc: '' };
  }, [step, labData.challenges]);

  const warmupScore = (sunOn ? 0.6 : 0) + (friendsOn ? 0.8 : 0) - 1.0;
  const warmupDecision = warmupScore >= 0;
  const isLabStep = step === 1 || step === 2 || step === 4;

  return (
    <LessonShell
      labId="lab7"
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
      victoryTitle="בוני רשתות מוח! הבנתם איך נוירון מחליט"
      victorySubtitle="אימנתם נוירון מלאכותי וגיליתם מדוע צוות נוירונים (רשת עמוקה) חזק בהרבה מאחד בודד."
      victoryTakeaways={[
        'נוירון שוקל כמה רמזים יחד (Weight) ומשווה אותם לסף השכנוע (Bias).',
        'נוירון אחד מותח קו הפרדה ישר אחד — מעולה לשערי AND ו-OR.',
        'חידת ה-XOR מוכיחה שלבעיות מורכבות מחברים שכבות של נוירונים יחד לרשת!'
      ]}
    >
      {/* STEP 0: Soccer Decision Warmup */}
      {step === 0 && (
        <div className="max-w-xl mx-auto w-full space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C3C3C] text-center">
            איך נוירון במוח מלאכותי מחליט?
          </h1>

          <ZenMascot
            pose="teach"
            size="md"
            message="דמיינו שאתם מחליטים אם לצאת לשחק כדורגל: כל רמז מקבל משקל חשיבות, ואם עוברים את הסף — הנוירון נדלק ואומר כן!"
            audioSrc="/audio/narration/lab7.wav"
            spokenFallback={labData?.media?.narration?.transcript}
          />

          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-5 space-y-4">
            <div className="text-sm font-extrabold text-[#3C3C3C] text-center">
              נסו להפעיל ולכבות את הרמזים להחלטה:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSunOn((v) => !v);
                  AudioEngine.playToggle(!sunOn);
                }}
                className={`p-4 rounded-2xl border-2 text-right flex items-center justify-between cursor-pointer ${
                  sunOn
                    ? 'bg-[#FFF6D6] border-[#FFC800] text-[#3C3C3C]'
                    : 'bg-white border-[#E5E5E5] text-[#777777]'
                }`}
              >
                <span className="font-extrabold text-sm">☀️ יש שמש בחוץ?</span>
                <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded-lg bg-white border border-[#E5E5E5]">
                  {sunOn ? 'כן (+0.6)' : 'לא (0)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setFriendsOn((v) => !v);
                  AudioEngine.playToggle(!friendsOn);
                }}
                className={`p-4 rounded-2xl border-2 text-right flex items-center justify-between cursor-pointer ${
                  friendsOn
                    ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1899D6]'
                    : 'bg-white border-[#E5E5E5] text-[#777777]'
                }`}
              >
                <span className="font-extrabold text-sm">⚽ החברים באים?</span>
                <span className="font-mono font-extrabold text-xs px-2 py-0.5 rounded-lg bg-white border border-[#E5E5E5]">
                  {friendsOn ? 'כן (+0.8)' : 'לא (0)'}
                </span>
              </button>
            </div>

            <div
              className={`p-4 rounded-2xl border-2 text-center font-extrabold text-sm sm:text-base transition-colors ${
                warmupDecision
                  ? 'bg-[#D7FFB8] border-[#58CC02] text-[#467E00]'
                  : 'bg-white border-[#E5E5E5] text-[#777777]'
              }`}
            >
              {warmupDecision
                ? `הציון הכולל עבר את הסף (${warmupScore.toFixed(1)}) — הנוירון נדלק: יוצאים לשחק! ⚽`
                : `הציון עדיין נמוך מהסף (${warmupScore.toFixed(1)}) — נשארים בבית בינתיים.`}
            </div>
          </div>
        </div>
      )}

      {/* STEPS 1, 2, 4: Neuron Workbench */}
      {isLabStep && (
        <div className="w-full space-y-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#3C3C3C]">
              {step === 1
                ? 'משימה 1: אימון שער "וגם" (AND) ל-100%'
                : step === 2
                ? 'משימה 2: אימון שער "או" (OR) ל-100%'
                : 'משימה 3: חידת XOR — למה צריך צוות נוירונים?'}
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
                  ? '/audio/hints/lab7_ch1.mp3?v=1.0.0'
                  : step === 2
                  ? '/audio/hints/lab7_ch2.mp3?v=1.0.0'
                  : '/audio/hints/lab7_ch3.mp3?v=1.0.0'
              }
            />
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6">
            {/* 2D Logic Separation Plot (dir="ltr") */}
            <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-4 w-full max-w-[310px] shrink-0 space-y-3 text-center">
              <div className="flex items-center justify-between text-xs font-extrabold">
                <span className="text-[#3C3C3C]">שער {selectedGate}</span>
                <span
                  className={`px-2.5 py-1 rounded-xl ${
                    currentAccuracy === 100
                      ? 'bg-[#D7FFB8] text-[#467E00]'
                      : 'bg-[#FFF6D6] text-[#9A6700]'
                  }`}
                >
                  דיוק: {currentAccuracy}%
                </span>
              </div>

              <svg
                viewBox="0 0 120 120"
                dir="ltr"
                className="w-full aspect-square bg-white rounded-2xl border-2 border-[#E5E5E5]"
              >
                <defs>
                  <clipPath id="neuron-plot-clip">
                    <rect x="6" y="6" width="108" height="108" rx="6" />
                  </clipPath>
                </defs>

                {/* Axes */}
                <line x1="26" y1="14" x2="26" y2="94" stroke="#E5E5E5" strokeWidth="1.5" />
                <line x1="26" y1="94" x2="106" y2="94" stroke="#E5E5E5" strokeWidth="1.5" />

                {/* Boundary Line(s) */}
                <g clipPath="url(#neuron-plot-clip)">
                  {networkActivated && selectedGate === 'XOR' ? (
                    <>
                      <line x1="12" y1="54" x2="74" y2="112" stroke="#CE82FF" strokeWidth="2.8" />
                      <line x1="48" y1="8" x2="110" y2="68" stroke="#1CB0F6" strokeWidth="2.8" />
                    </>
                  ) : (
                    boundaryLine && (
                      <line
                        x1={boundaryLine.p1.cx}
                        y1={boundaryLine.p1.cy}
                        x2={boundaryLine.p2.cx}
                        y2={boundaryLine.p2.cy}
                        stroke="#1CB0F6"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                    )
                  )}
                </g>

                {/* 4 Truth-Table Corners */}
                {evaluation.results.map((pt, i) => {
                  const { cx, cy } = toPlotCoords(pt.x1, pt.x2);
                  const expected =
                    selectedGate === 'AND'
                      ? pt.targetAnd
                      : selectedGate === 'OR'
                      ? pt.targetOr
                      : pt.targetXor;
                  const actual = networkActivated && selectedGate === 'XOR' ? expected : pt.output;
                  const isCorrect = actual === expected;

                  return (
                    <g key={i}>
                      <circle
                        cx={cx}
                        cy={cy}
                        r="8"
                        fill={expected === 1 ? '#58CC02' : '#FFFFFF'}
                        stroke={isCorrect ? '#58A700' : '#FF4B4B'}
                        strokeWidth="2.5"
                      />
                      <text
                        x={cx}
                        y={cy}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="7.5"
                        fontWeight="800"
                        fill={expected === 1 ? '#FFFFFF' : '#4B4B4B'}
                      >
                        {expected}
                      </text>
                    </g>
                  );
                })}
              </svg>

              <div className="text-[11px] font-bold text-[#777777]">
                עיגול ירוק = צריכים להידלק (1) • עיגול לבן = צריכים להישאר כבויים (0)
              </div>
            </div>

            {/* Sliders & Team Unlock Controls */}
            <div className="flex-1 w-full max-w-sm space-y-3">
              {step === 4 && (
                <button
                  type="button"
                  onClick={() => {
                    setNetworkActivated((v) => !v);
                    setTriedXorSliders(true);
                    AudioEngine.playUnlock();
                  }}
                  className={`w-full py-3 px-4 text-sm ${
                    networkActivated ? 'btn-duo-green' : 'btn-duo-purple'
                  }`}
                >
                  <Network className="w-4 h-4 shrink-0" />
                  <span>
                    {networkActivated
                      ? 'רשת 2 נוירונים פעילה (100% הצלחה!)'
                      : 'חברו צוות של 2 נוירונים לפתרון XOR!'}
                  </span>
                </button>
              )}

              {[
                { label: 'משקל רמז 1 (w₁)', val: w1, setter: setW1 },
                { label: 'משקל רמז 2 (w₂)', val: w2, setter: setW2 },
                { label: 'סף השכנוע (Bias)', val: bias, setter: setBias }
              ].map((ctrl) => (
                <div
                  key={ctrl.label}
                  className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-3 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-[#3C3C3C]">{ctrl.label}</span>
                    <span className="font-mono text-[#1899D6] bg-[#DDF4FF] px-2 py-0.5 rounded-lg" dir="ltr">
                      {ctrl.val > 0 ? `+${ctrl.val.toFixed(1)}` : ctrl.val.toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2" dir="ltr">
                    <button
                      type="button"
                      onClick={() => handleSliderUpdate(ctrl.setter)(ctrl.val - 0.1)}
                      className="w-7 h-7 rounded-lg border-2 border-[#E5E5E5] bg-[#F7F7F5] flex items-center justify-center cursor-pointer"
                      aria-label={`הקטן ${ctrl.label}`}
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <input
                      type="range"
                      min="-3"
                      max="3"
                      step="0.1"
                      value={ctrl.val}
                      onChange={(e) => handleSliderUpdate(ctrl.setter)(parseFloat(e.target.value))}
                      className="w-full accent-[#1CB0F6] cursor-pointer"
                    />
                    <button
                      type="button"
                      onClick={() => handleSliderUpdate(ctrl.setter)(ctrl.val + 0.1)}
                      className="w-7 h-7 rounded-lg border-2 border-[#E5E5E5] bg-[#F7F7F5] flex items-center justify-center cursor-pointer"
                      aria-label={`הגדל ${ctrl.label}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex gap-2">
                {step !== 4 && (
                  <button
                    type="button"
                    onClick={handleAutoTune}
                    className="btn-duo-white flex-1 py-2.5 px-3 text-xs"
                  >
                    <Wand2 className="w-3.5 h-3.5 text-[#CE82FF]" />
                    <span>כיוון עזר אוטומטי</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setW1(0.4);
                    setW2(0.4);
                    setBias(-0.5);
                    setNetworkActivated(false);
                    AudioEngine.playStep();
                  }}
                  className="btn-duo-white py-2.5 px-3 text-xs"
                  title="איפוס ידיות"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Quiz 1 */}
      {step === 3 && (
        <QuizStepView
          quizItem={labMeta.miniQuiz[1]}
          selectedChoiceIdx={quiz1Choice}
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
          onSelectChoice={(idx) => {
            setFeedback(null);
            setQuiz2Choice(idx);
          }}
          badgeText="תגלית רשתות הנוירונים"
        />
      )}

      {/* STEP 6: Real-World Connections */}
      {step === 6 && (
        <RealWorldStepView
          title="איפה עובדים נוירונים ורשתות עמוקות בחיים?"
          mascotMessage="כשמחברים המון נוירונים יחד בשכבות, הם מזהים ספאם ב-Gmail, מתרגמים שפות ומפעילים מוח מלאכותי:"
          spokenFallback={labData?.conceptExplanation?.realWorldAnalogy}
          labMeta={labMeta}
        />
      )}
    </LessonShell>
  );
}
