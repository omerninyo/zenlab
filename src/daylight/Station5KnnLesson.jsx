import React, { useState, useEffect, useMemo, useRef } from 'react';
import { RotateCcw, MousePointer } from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { AIService } from '../services/ai.js';
import { LAB_METADATA } from '../core/labMeta.js';
import { fireChampagneConfetti } from '../core/confetti.js';
import ZenMascot from './ZenMascot.jsx';
import LessonShell from './LessonShell.jsx';
import { AudioHintButton, QuizStepView, RealWorldStepView } from './LessonSharedViews.jsx';

const TOTAL_STEPS = 7;
const OUTLIER_MELON = { id: 'outlier-melon', x: 29, y: 36, label: 'B', isOutlier: true };

export default function Station5KnnLesson({
  curriculum,
  onExit,
  onNextStation,
  onOpenCertificate
}) {
  const labData = curriculum?.labs?.lab5 || {};
  const labMeta = LAB_METADATA.lab5;
  const initialData = labData.initialData || [];

  const [step, setStep] = useState(() => {
    const saved = StorageEngine.getLabStep('lab5');
    return saved < TOTAL_STEPS - 1 ? saved : 0;
  });
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestLessonStreak, setBestLessonStreak] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Interactive k-NN Plot state (seed clear outlier demo if resuming directly on Step 4)
  const [points, setPoints] = useState(() =>
    step === 4 ? [...initialData, OUTLIER_MELON] : [...initialData]
  );
  const [toolMode, setToolMode] = useState(() => (step === 2 || step === 4 ? 'MOVE' : 'A'));
  const [kValue, setKValue] = useState(() => (step === 4 ? 1 : 3));
  const [testPoint, setTestPoint] = useState(() =>
    step === 4 ? { x: 30, y: 35 } : { x: 50, y: 50 }
  );
  const [isDraggingTest, setIsDraggingTest] = useState(false);

  // Quiz answers
  const [quiz1Choice, setQuiz1Choice] = useState(null);
  const [quiz2Choice, setQuiz2Choice] = useState(null);

  const svgRef = useRef(null);
  const isDraggingRef = useRef(false);

  // Switch helpful default tool & outlier state when stepping through tasks
  const syncModeForStep = (targetStep, currentStep) => {
    if (targetStep === 1) setToolMode((m) => (m === 'MOVE' ? 'A' : m));
    if (targetStep === 2) {
      setToolMode('MOVE');
      setKValue(3);
    }
    if (targetStep === 4) {
      setToolMode('MOVE');
      setKValue(1);
      setTestPoint({ x: 30, y: 35 });
      setPoints((prev) =>
        prev.some((p) => p.isOutlier) ? prev : [...prev, OUTLIER_MELON]
      );
    } else {
      setPoints((prev) => prev.filter((p) => !p.isOutlier));
      if (currentStep === 4) {
        setTestPoint({ x: 50, y: 50 });
      }
    }
  };

  const classification = useMemo(() => {
    return AIService.classifyPointKNN(points, testPoint, kValue);
  }, [points, testPoint, kValue]);

  const appleVotes = classification.votes?.A || 0;
  const melonVotes = classification.votes?.B || 0;
  const furthestRadius =
    classification.nearestNeighbors?.[classification.nearestNeighbors.length - 1]?.distance || 0;

  useEffect(() => {
    if (!isDraggingTest) return undefined;

    const getCoords = (e) => {
      if (!svgRef.current) return null;
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 100;
      const rawY = 100 - ((e.clientY - rect.top) / rect.height) * 100;
      return {
        x: Math.max(6, Math.min(94, Math.round(rawX))),
        y: Math.max(6, Math.min(94, Math.round(rawY)))
      };
    };

    const onMove = (e) => {
      const next = getCoords(e);
      if (next) setTestPoint(next);
    };

    const onUp = () => {
      setIsDraggingTest(false);
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 40);
      AudioEngine.playStep();
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [isDraggingTest]);

  const goToStep = (nextStep) => {
    const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, nextStep));
    setFeedback(null);
    setRetryCount(0);
    syncModeForStep(clamped, step);
    setStep(clamped);
    StorageEngine.setLabStep('lab5', clamped);
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

  const handleSvgClick = (e) => {
    if (isDraggingTest || isDraggingRef.current) return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clickX = Math.max(6, Math.min(94, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
    const clickY = Math.max(
      6,
      Math.min(94, Math.round(100 - ((e.clientY - rect.top) / rect.height) * 100))
    );

    setFeedback(null);

    if (toolMode === 'MOVE') {
      setTestPoint({ x: clickX, y: clickY });
      AudioEngine.playStep();
    } else {
      setPoints((prev) => [
        ...prev,
        { id: Date.now() + Math.random(), x: clickX, y: clickY, label: toolMode }
      ]);
      AudioEngine.playToggle(true);
    }
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
      if (points.length >= 10) {
        StorageEngine.completeChallenge('lab5', 'lab5_challenge1', 1);
        recordPass(
          labData.challenges?.[0]?.successMessage ||
            `הלימוד הצליח! המחשב שמר כעת ${points.length} דוגמאות אימון של תפוחים ואבטיחים.`
        );
      } else {
        recordRetry(
          `כרגע יש ${points.length} פירות על הלוח. הוסיפו עוד ${10 - points.length} פירות (תפוח 🍎 או אבטיח 🍉)!`
        );
      }
      return;
    }

    if (step === 2) {
      const moved = testPoint.x !== 50 || testPoint.y !== 50;
      if (moved && classification.confidence >= 80) {
        StorageEngine.completeChallenge('lab5', 'lab5_challenge2', 1);
        recordPass(
          labData.challenges?.[1]?.successMessage ||
            'הזיהוי הצליח! השכנים הקרובים הכריעו מהו פרי המסתורין בביטחון גבוה.'
        );
      } else if (!moved) {
        recordRetry('גררו את פרי המסתורין (?) או לחצו על הלוח ליד התפוחים או האבטיחים!');
      } else {
        recordRetry(
          `הביטחון כרגע הוא ${classification.confidence}%. קרבו את פרי המסתורין (?) לקבוצת התפוחים או האבטיחים כדי להגיע ל-80% לפחות!`
        );
      }
      return;
    }

    if (step === 3) {
      const q = labMeta.miniQuiz[0];
      if (quiz1Choice === q.correctIndex) recordPass(q.explanation);
      else recordRetry('נסו שוב: את מי אלגוריתם השכנים הקרובים שואל כדי להחליט?');
      return;
    }

    if (step === 4) {
      if (kValue === 5) {
        StorageEngine.completeChallenge('lab5', 'lab5_challenge1', 1);
        StorageEngine.completeChallenge('lab5', 'lab5_challenge2', 1);
        StorageEngine.completeChallenge('lab5', 'lab5_challenge3', 1);
        fireChampagneConfetti();
        recordPass(
          labData.challenges?.[2]?.successMessage ||
            'מעולה! כששואלים 5 שכנים יחד (k=5), הרוב קובע והמודל יציב הרבה יותר.'
        );
      } else {
        recordRetry('לחצו על הכפתור k=5 וראו איך ההחלטה של 5 שכנים יציבה יותר משכן בודד!');
      }
      return;
    }

    if (step === 5) {
      const q = labMeta.miniQuiz[2];
      if (quiz2Choice === q.correctIndex) recordPass(q.explanation);
      else recordRetry('נסו שוב: למה כדאי לשאול קבוצה של שכנים ולא לסמוך על פרי בודד?');
      return;
    }

    if (step === 6) {
      setIsLessonComplete(true);
    }
  };

  const isActionDisabled = useMemo(() => {
    if (feedback) return false;
    if (step === 1) return points.length < 7;
    if (step === 3) return quiz1Choice === null;
    if (step === 4) return kValue !== 5;
    if (step === 5) return quiz2Choice === null;
    return false;
  }, [feedback, step, points.length, quiz1Choice, kValue, quiz2Choice]);

  const primaryButtonLabel = useMemo(() => {
    if (feedback?.status === 'pass') return step === TOTAL_STEPS - 1 ? 'סיום השיעור!' : 'המשך';
    if (feedback?.status === 'retry') return 'נסה שוב';
    if (step === 0 || step === 6) return step === 6 ? 'סיום השיעור!' : 'המשך';
    return 'בדיקה';
  }, [feedback, step]);

  const hintConfig = useMemo(() => {
    if (step === 1) return { text: labData.challenges?.[0]?.hint, audioSrc: '/audio/hints/lab5_ch1.mp3?v=3.1.1' };
    if (step === 2) return { text: labData.challenges?.[1]?.hint, audioSrc: '/audio/hints/lab5_ch2.mp3?v=3.1.1' };
    if (step === 4) return { text: labData.challenges?.[2]?.hint, audioSrc: '/audio/hints/lab5_ch3.mp3?v=3.1.1' };
    return { text: '', audioSrc: '' };
  }, [step, labData.challenges]);

  const isPlotStep = step === 1 || step === 2 || step === 4;

  return (
    <LessonShell
      labId="lab5"
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
      victoryTitle="מאמני בינה מלאכותית! הבנתם למידת מכונה"
      victorySubtitle="לימדתם את המחשב לזהות פירות חדשים בעזרת דוגמאות והצבעת שכנים קרובים."
      victoryTakeaways={[
        'בלמידת מכונה המחשב לומד מתוך דוגמאות (Data) שאנו מניחים על הלוח.',
        'באלגוריתם השכנים הקרובים (k-NN), השכנים הכי קרובים מצביעים ומכריעים.',
        'הצבעת רוב של 3 או 5 שכנים יציבה בהרבה משכן בודד אחד שעלול להיות טעות!'
      ]}
    >
      {/* STEP 0: Intro Rules vs Examples */}
      {step === 0 && (
        <div className="max-w-xl mx-auto w-full space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C3C3C] text-center">
            איך מחשב לומד מדוגמאות בלי חוקים?
          </h1>

          <ZenMascot
            pose="teach"
            size="md"
            message="במקום לכתוב למחשב חוקים קבועים, מניחים לו דוגמאות לפי תכונות — מתיקות וגודל. פירות דומים יושבים קרוב זה לזה!"
            audioSrc="/audio/steps/lab5_intro.mp3?v=3.1.1"
            spokenFallback="במקום לכתוב למחשב חוקים קבועים, מניחים לו דוגמאות לפי תכונות — מתיקות וגודל. פירות דומים יושבים קרוב זה לזה!"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="card-duo p-4 space-y-2 bg-[#FFF5F5] border-[#FFAFB2]">
              <div className="text-2xl">🍎</div>
              <h2 className="text-base font-extrabold text-[#EA2B2B]">קבוצת התפוחים</h2>
              <p className="text-xs sm:text-sm text-[#4B4B4B] leading-relaxed">
                קטנים יחסית ופחות מתוקים — מתרכזים בפינה השמאלית-תחתונה של המפה.
              </p>
            </div>
            <div className="card-duo p-4 space-y-2 bg-[#D7FFB8] border-[#58CC02]">
              <div className="text-2xl">🍉</div>
              <h2 className="text-base font-extrabold text-[#467E00]">קבוצת האבטיחים</h2>
              <p className="text-xs sm:text-sm text-[#4B4B4B] leading-relaxed">
                גדולים ומתוקים — מתרכזים באזור הימני-עליון של המפה.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* STEPS 1, 2, 4: Interactive 2D Fruit Feature Board */}
      {isPlotStep && (
        <div className="w-full space-y-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#3C3C3C]">
              {step === 1
                ? 'משימה 1: הוסיפו פירות דוגמה ללוח האימון'
                : step === 2
                ? 'משימה 2: הזיזו את פרי המסתורין (?) לצד הדוגמאות'
                : 'משימה 3: שנו את מספר השכנים ל-k=5 להחלטה יציבה'}
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
                  ? '/audio/steps/lab5_inst1.mp3?v=3.1.1'
                  : step === 2
                  ? '/audio/steps/lab5_inst2.mp3?v=3.1.1'
                  : '/audio/steps/lab5_inst3.mp3?v=3.1.1'
              }
            />
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6">
            {/* Clean 2D Daylight Scatter Chart (dir="ltr") */}
            <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-3 sm:p-4 w-full max-w-[340px] shrink-0 space-y-2">
              <div className="flex items-center justify-start text-[11px] font-bold text-[#777777]" dir="ltr">
                <span>↑ גודל הפרי</span>
              </div>

              <svg
                ref={svgRef}
                viewBox="0 0 100 100"
                dir="ltr"
                onClick={handleSvgClick}
                className="w-full aspect-square bg-white rounded-2xl border-2 border-[#E5E5E5] cursor-crosshair select-none"
                style={{ touchAction: 'none' }}
              >
                {/* Clean grid lines */}
                {[25, 50, 75].map((pos) => (
                  <g key={pos}>
                    <line x1={pos} y1="0" x2={pos} y2="100" stroke="#F0F0EE" strokeWidth="0.6" />
                    <line x1="0" y1={pos} x2="100" y2={pos} stroke="#F0F0EE" strokeWidth="0.6" />
                  </g>
                ))}

                {/* Neighbor neighborhood circle (only when Mystery Fruit is active in steps 2 & 4) */}
                {step >= 2 && furthestRadius > 0 && (
                  <circle
                    cx={testPoint.x}
                    cy={100 - testPoint.y}
                    r={furthestRadius}
                    fill="#1CB0F6"
                    fillOpacity="0.08"
                    stroke="#84D8FF"
                    strokeWidth="0.8"
                    strokeDasharray="2 1.5"
                  />
                )}

                {/* Dashed neighbor lines to top k neighbors */}
                {step >= 2 &&
                  classification.nearestNeighbors.map((nb) => (
                    <line
                      key={`line-${nb.id}`}
                      x1={testPoint.x}
                      y1={100 - testPoint.y}
                      x2={nb.x}
                      y2={100 - nb.y}
                      stroke="#1CB0F6"
                      strokeWidth="0.9"
                      strokeDasharray="1.8 1.4"
                    />
                  ))}

                {/* Training Fruit Points */}
                {points.map((pt) => {
                  const isApple = pt.label === 'A';
                  return (
                    <g key={pt.id} transform={`translate(${pt.x}, ${100 - pt.y})`}>
                      {pt.isOutlier && (
                        <circle
                          r="6.4"
                          fill="none"
                          stroke="#FF9600"
                          strokeWidth="0.9"
                          strokeDasharray="1.6 1.2"
                        />
                      )}
                      <circle
                        r="4.5"
                        fill={isApple ? '#FFF5F5' : '#D7FFB8'}
                        stroke={isApple ? '#FF4B4B' : '#58CC02'}
                        strokeWidth="1.2"
                      />
                      <text
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="5.2"
                        style={{ pointerEvents: 'none' }}
                      >
                        {isApple ? '🍎' : '🍉'}
                      </text>
                    </g>
                  );
                })}

                {/* Mystery Test Point (?) */}
                {step >= 2 && (
                  <g
                    transform={`translate(${testPoint.x}, ${100 - testPoint.y})`}
                    onPointerDown={(e) => {
                      e.stopPropagation();
                      isDraggingRef.current = true;
                      setIsDraggingTest(true);
                    }}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <circle r="5.8" fill="#FFFFFF" stroke="#1CB0F6" strokeWidth="1.6" />
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="5.8"
                      fontWeight="800"
                      fill="#1899D6"
                      style={{ pointerEvents: 'none' }}
                    >
                      ?
                    </text>
                  </g>
                )}
              </svg>

              <div className="flex items-center justify-end text-[11px] font-bold text-[#777777]" dir="ltr">
                <span>מתיקות →</span>
              </div>
            </div>

            {/* Right Controls & Vote Tally */}
            <div className="flex-1 w-full max-w-sm space-y-3.5">
              {/* Tool Palette */}
              <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-2xl p-3.5 space-y-2.5">
                <div className="text-xs font-extrabold text-[#777777]">
                  {step === 1
                    ? `דוגמאות על הלוח: ${points.length} / 10 פירות`
                    : 'בחרו מצב פעולה על הלוח:'}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setToolMode('A');
                      AudioEngine.playStep();
                    }}
                    className={`py-2.5 px-3 rounded-xl border-2 text-xs font-extrabold cursor-pointer ${
                      toolMode === 'A'
                        ? 'bg-[#FFDFE0] border-[#FF4B4B] text-[#B91C1C]'
                        : 'bg-white border-[#E5E5E5] text-[#4B4B4B]'
                    }`}
                  >
                    🍎 הוסף תפוח
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setToolMode('B');
                      AudioEngine.playStep();
                    }}
                    className={`py-2.5 px-3 rounded-xl border-2 text-xs font-extrabold cursor-pointer ${
                      toolMode === 'B'
                        ? 'bg-[#D7FFB8] border-[#58CC02] text-[#467E00]'
                        : 'bg-white border-[#E5E5E5] text-[#4B4B4B]'
                    }`}
                  >
                    🍉 הוסף אבטיח
                  </button>
                </div>

                {step >= 2 && (
                  <button
                    type="button"
                    onClick={() => {
                      setToolMode('MOVE');
                      AudioEngine.playStep();
                    }}
                    className={`w-full py-2.5 px-3 rounded-xl border-2 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer ${
                      toolMode === 'MOVE'
                        ? 'bg-[#DDF4FF] border-[#1CB0F6] text-[#1899D6]'
                        : 'bg-white border-[#E5E5E5] text-[#4B4B4B]'
                    }`}
                  >
                    <MousePointer className="w-3.5 h-3.5" />
                    <span>הזז את פרי המסתורין (?)</span>
                  </button>
                )}
              </div>

              {/* Neighbor Voting Result Card */}
              {step >= 2 && (
                <div className="card-duo p-4 space-y-3">
                  {step === 4 && (
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold text-[#9A6700] bg-[#FFF6D6] border border-[#FFC800] rounded-xl px-2.5 py-1.5">
                        שימו לב לפרי החריג המסומן בכתום! ב-k=1 המחשב טועה, והמעבר ל-k=5 מתקן לפי הצבעת הרוב.
                      </p>
                      <div className="text-xs font-extrabold text-[#3C3C3C]">
                        כמה שכנים קרובים שואלים? (k)
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 3, 5].map((k) => (
                          <button
                            key={k}
                            type="button"
                            onClick={() => {
                              setFeedback(null);
                              setKValue(k);
                              AudioEngine.playStep();
                            }}
                            className={`py-2 rounded-xl border-2 font-mono font-extrabold text-sm cursor-pointer ${
                              kValue === k
                                ? 'bg-[#1CB0F6] border-[#1899D6] text-white'
                                : 'bg-[#F7F7F5] border-[#E5E5E5] text-[#4B4B4B]'
                            }`}
                          >
                            k={k}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm font-extrabold">
                    <span>ניחוש המחשב:</span>
                    <span
                      className={`px-3 py-1 rounded-xl ${
                        classification.predictedLabel === 'A'
                          ? 'bg-[#FFDFE0] text-[#B91C1C]'
                          : 'bg-[#D7FFB8] text-[#467E00]'
                      }`}
                    >
                      {classification.predictedLabel === 'A' ? '🍎 תפוח אדום' : '🍉 אבטיח ירוק'} (
                      {classification.confidence}%)
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-bold text-[#777777] pt-1 border-t border-[#E5E5E5]">
                    <span>הצבעת {Math.min(kValue, points.length)} השכנים הקרובים:</span>
                    <span>
                      🍎 {appleVotes} מול 🍉 {melonVotes}
                    </span>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (step === 4) {
                    setPoints([...initialData, OUTLIER_MELON]);
                    setTestPoint({ x: 30, y: 35 });
                    setKValue(1);
                  } else {
                    setPoints([...initialData]);
                    setTestPoint({ x: 50, y: 50 });
                  }
                  setFeedback(null);
                  AudioEngine.playStep();
                }}
                className="btn-duo-white w-full py-2 text-xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>איפוס הפירות בלוח</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Quiz 1 */}
      {step === 3 && (
        <QuizStepView
          quizItem={labMeta.miniQuiz[0]}
          selectedChoiceIdx={quiz1Choice}
          audioSrc="/audio/steps/lab5_quiz1.mp3?v=3.1.1"
          onSelectChoice={(idx) => {
            setFeedback(null);
            setQuiz1Choice(idx);
          }}
        />
      )}

      {/* STEP 5: Quiz 2 (Outliers & Bias) */}
      {step === 5 && (
        <QuizStepView
          quizItem={labMeta.miniQuiz[2]}
          selectedChoiceIdx={quiz2Choice}
          audioSrc="/audio/steps/lab5_quiz2.mp3?v=3.1.1"
          onSelectChoice={(idx) => {
            setFeedback(null);
            setQuiz2Choice(idx);
          }}
          badgeText="חשיבה של מדעני נתונים"
        />
      )}

      {/* STEP 6: Real-World Connections */}
      {step === 6 && (
        <RealWorldStepView
          title="איפה למידת מכונה עובדת סביבנו כל יום?"
          mascotMessage="אלגוריתם השכנים הקרובים (k-NN) עוזר למחשבים להמליץ על מוזיקה, למיין יבול חקלאי ולעזור לרופאים:"
          spokenFallback="אלגוריתם השכנים הקרובים (k-NN) עוזר למחשבים להמליץ על מוזיקה, למיין יבול חקלאי ולעזור לרופאים:"
          audioSrc="/audio/steps/lab5_realworld.mp3?v=3.1.1"
          labMeta={labMeta}
        />
      )}
    </LessonShell>
  );
}
