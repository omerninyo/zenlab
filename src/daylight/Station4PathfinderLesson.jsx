import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Play, RotateCcw, Compass, ShieldAlert, Eye } from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { AIService } from '../services/ai.js';
import { LAB_METADATA } from '../core/labMeta.js';
import { fireChampagneConfetti } from '../core/confetti.js';
import ZenMascot from './ZenMascot.jsx';
import LessonShell from './LessonShell.jsx';
import { AudioHintButton, QuizStepView, RealWorldStepView } from './LessonSharedViews.jsx';

const TOTAL_STEPS = 7;
const GRID_SIZE = 8;
const START_PT = { x: 0, y: 0 };
const GOAL_PT = { x: 7, y: 7 };

export default function Station4PathfinderLesson({
  curriculum,
  onExit,
  onNextStation,
  onOpenCertificate
}) {
  const labData = curriculum?.labs?.lab4 || {};
  const labMeta = LAB_METADATA.lab4;

  const [step, setStep] = useState(() => {
    const saved = StorageEngine.getLabStep('lab4');
    return saved < TOTAL_STEPS - 1 ? saved : 0;
  });
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestLessonStreak, setBestLessonStreak] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Interactive 8x8 state
  const [grid, setGrid] = useState(() => new Array(64).fill(0));
  const [algorithm, setAlgorithm] = useState('astar'); // 'astar' | 'bfs'
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showHeuristics, setShowHeuristics] = useState(false);
  const [hasRunAstar, setHasRunAstar] = useState(false);
  const [hasRunDetour, setHasRunDetour] = useState(false);
  const [lastAstarCount, setLastAstarCount] = useState(null);
  const [lastBfsCount, setLastBfsCount] = useState(null);

  // Step 0 tile probe
  const [inspectedTile, setInspectedTile] = useState({ x: 3, y: 2 });

  // Quizzes
  const [quiz1Choice, setQuiz1Choice] = useState(null);
  const [quiz2Choice, setQuiz2Choice] = useState(null);

  const wallPaintRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    const clearPaint = () => {
      wallPaintRef.current = null;
    };
    window.addEventListener('pointerup', clearPaint);
    window.addEventListener('pointercancel', clearPaint);
    return () => {
      window.removeEventListener('pointerup', clearPaint);
      window.removeEventListener('pointercancel', clearPaint);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const solution = useMemo(() => {
    return AIService.solvePathfinder({
      grid,
      width: GRID_SIZE,
      height: GRID_SIZE,
      start: START_PT,
      goal: GOAL_PT,
      algorithm
    });
  }, [grid, algorithm]);

  const wallCount = useMemo(() => grid.filter((c) => c === 1).length, [grid]);

  // Step-wave animation timer
  useEffect(() => {
    if (!isPlaying) return undefined;
    timerRef.current = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < solution.visitedOrder.length) {
          if (prev % 3 === 0) AudioEngine.playStep();
          return prev + 1;
        }
        setIsPlaying(false);
        clearInterval(timerRef.current);
        if (solution.found) {
          AudioEngine.playSuccess();
        } else {
          AudioEngine.playError();
        }
        return prev;
      });
    }, 45);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, solution.visitedOrder.length, solution.found]);

  const visibleVisitedSet = useMemo(() => {
    const set = new Set();
    for (let i = 0; i < currentStepIndex && i < solution.visitedOrder.length; i++) {
      const p = solution.visitedOrder[i];
      set.add(`${p.x},${p.y}`);
    }
    return set;
  }, [currentStepIndex, solution.visitedOrder]);

  const isPathVisible = currentStepIndex >= solution.visitedOrder.length && solution.found;
  const pathSet = useMemo(() => new Set(solution.path.map((p) => `${p.x},${p.y}`)), [solution.path]);

  const goToStep = (nextStep) => {
    setIsPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, nextStep));
    setFeedback(null);
    setRetryCount(0);
    setCurrentStepIndex(0);
    if (clamped === 4) setAlgorithm('bfs');
    else if (clamped === 1 || clamped === 2) setAlgorithm('astar');
    setStep(clamped);
    StorageEngine.setLabStep('lab4', clamped);
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

  const triggerScanAnimation = (algoOverride = null) => {
    const activeAlgo = algoOverride || algorithm;
    if (algoOverride && algoOverride !== algorithm) {
      setAlgorithm(algoOverride);
    }
    const evalSol = AIService.solvePathfinder({
      grid,
      width: GRID_SIZE,
      height: GRID_SIZE,
      start: START_PT,
      goal: GOAL_PT,
      algorithm: activeAlgo
    });
    if (evalSol.found) {
      if (activeAlgo === 'astar') {
        setLastAstarCount(evalSol.totalExplored);
        setHasRunAstar(true);
        if (wallCount >= 4) setHasRunDetour(true);
      } else {
        setLastBfsCount(evalSol.totalExplored);
      }
    }
    setFeedback(null);
    setCurrentStepIndex(0);
    setIsPlaying(true);
    AudioEngine.playStep();
  };

  const handleSetWall = (x, y, forceVal = null) => {
    if ((x === START_PT.x && y === START_PT.y) || (x === GOAL_PT.x && y === GOAL_PT.y)) return;
    const idx = y * GRID_SIZE + x;
    setGrid((prev) => {
      const targetVal = forceVal !== null ? forceVal : prev[idx] === 1 ? 0 : 1;
      if (prev[idx] === targetVal) return prev;
      const next = [...prev];
      next[idx] = targetVal;
      AudioEngine.playToggle(targetVal === 1);
      return next;
    });
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setFeedback(null);
  };

  const handleLoadBarrierPreset = () => {
    const next = new Array(64).fill(0);
    for (let r = 1; r < 6; r++) {
      next[r * GRID_SIZE + 3] = 1;
    }
    setGrid(next);
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setFeedback(null);
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
      if (hasRunAstar && solution.found) {
        StorageEngine.completeChallenge('lab4', 'lab4_challenge1', 1);
        recordPass(
          labData.challenges?.[0]?.successMessage ||
            `המצפן החכם (A*) מצא את המסלול הקצר ביותר ובדק רק ${lastAstarCount || solution.totalExplored} משבצות.`
        );
      } else {
        recordRetry('לחצו על הכפתור הכחול "שגר גלי ניווט!" כדי לראות איך המצפן החכם טס אל הכוכב.');
      }
      return;
    }

    if (step === 2) {
      if (wallCount < 4) {
        recordRetry('הניחו לפחות 4 אסטרואידים על המפה (או לחצו על "הצב חומת אסטרואידים").');
      } else if (!solution.found) {
        recordRetry('חסמתם לגמרי את כל הדרך לכוכב! מחקו אסטרואיד אחד כדי ליצור פתח.');
      } else if (!hasRunDetour) {
        triggerScanAnimation('astar');
      } else {
        StorageEngine.completeChallenge('lab4', 'lab4_challenge2', 1);
        recordPass(
          labData.challenges?.[1]?.successMessage ||
            'עקיפה חכמה! החללית מצאה את המסלול הקצר ביותר מסביב לאסטרואידים.'
        );
      }
      return;
    }

    if (step === 3) {
      const q = labMeta.miniQuiz[0];
      if (quiz1Choice === q.correctIndex) recordPass(q.explanation);
      else recordRetry('נסו שוב: איזו שיטה נעזרת במצפן שיודע איפה היעד?');
      return;
    }

    if (step === 4) {
      const astarEval = AIService.solvePathfinder({
        grid,
        width: GRID_SIZE,
        height: GRID_SIZE,
        start: START_PT,
        goal: GOAL_PT,
        algorithm: 'astar'
      });
      const effectiveAstar = lastAstarCount ?? astarEval.totalExplored;
      if (lastBfsCount !== null && effectiveAstar < lastBfsCount) {
        StorageEngine.completeChallenge('lab4', 'lab4_challenge1', 1);
        StorageEngine.completeChallenge('lab4', 'lab4_challenge3', 1);
        fireChampagneConfetti();
        recordPass(
          labData.challenges?.[2]?.successMessage ||
            `השוואה מנצחת! המצפן החכם (A*) בדק ${effectiveAstar} משבצות מול ${lastBfsCount} משבצות בסריקה עיוורת.`
        );
      } else {
        recordRetry('לחצו על "הפעל השוואה (BFS)" כדי לראות כמה משבצות סורק חיפוש גלים רגיל.');
      }
      return;
    }

    if (step === 5) {
      const q = labMeta.miniQuiz[2];
      if (quiz2Choice === q.correctIndex) recordPass(q.explanation);
      else recordRetry('נסו שוב: מה עושה אלגוריתם חיפוש אמין כשכל הדרכים חסומות?');
      return;
    }

    if (step === 6) {
      setIsLessonComplete(true);
    }
  };

  const isActionDisabled = useMemo(() => {
    if (feedback) return false;
    if (step === 1) return !hasRunAstar;
    if (step === 2) return wallCount < 4;
    if (step === 3) return quiz1Choice === null;
    if (step === 4) return lastBfsCount === null;
    if (step === 5) return quiz2Choice === null;
    return false;
  }, [feedback, step, hasRunAstar, wallCount, quiz1Choice, lastBfsCount, quiz2Choice]);

  const primaryButtonLabel = useMemo(() => {
    if (feedback?.status === 'pass') return step === TOTAL_STEPS - 1 ? 'סיום השיעור!' : 'המשך';
    if (feedback?.status === 'retry') return 'נסה שוב';
    if (step === 0 || step === 6) return step === 6 ? 'סיום השיעור!' : 'המשך';
    return 'בדיקה';
  }, [feedback, step]);

  const hintConfig = useMemo(() => {
    if (step === 1) {
      return { text: labData.challenges?.[0]?.hint, audioSrc: '/audio/hints/lab4_ch1.mp3?v=1.0.0' };
    }
    if (step === 2) {
      return { text: labData.challenges?.[1]?.hint, audioSrc: '/audio/hints/lab4_ch2.mp3?v=1.0.0' };
    }
    if (step === 4) {
      return { text: labData.challenges?.[2]?.hint, audioSrc: '/audio/hints/lab4_ch3.mp3?v=1.0.0' };
    }
    return { text: '', audioSrc: '' };
  }, [step, labData.challenges]);

  const astarPreviewCount = useMemo(() => {
    return (
      lastAstarCount ??
      AIService.solvePathfinder({
        grid,
        width: GRID_SIZE,
        height: GRID_SIZE,
        start: START_PT,
        goal: GOAL_PT,
        algorithm: 'astar'
      }).totalExplored
    );
  }, [lastAstarCount, grid]);

  return (
    <LessonShell
      labId="lab4"
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
      victoryTitle="נווטים חכמים! פיצחתם את אלגוריתם A*"
      victorySubtitle="ראיתם איך מצפן מתמטי עוקף מכשולים ומוצא את הדרך הקצרה בלי סריקה עיוורת."
      victoryTakeaways={[
        'כל משבצת נמדדת לפי צעדים שכבר עברנו (g) ועוד המרחק שנותר ליעד (h).',
        'המצפן החכם (A*) בודק קודם משבצות שמקרבות אותנו ליעד וחוסך זמן עצום.',
        'חיפוש עיוור (BFS) מתפשט לכל הכיוונים שווה בשווה ולכן בודק הרבה יותר משבצות!'
      ]}
    >
      {/* STEP 0: Warm-Up Compass Distance Inspector (g + h) */}
      {step === 0 && (
        <div className="max-w-xl mx-auto w-full space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C3C3C] text-center">
            איך ווייז (Waze) מוצא דרך בלי להתברבר?
          </h1>

          <ZenMascot
            pose="teach"
            size="md"
            message="במקום לחפש באקראי, המצפן החכם מחשב בכל משבצת שני מספרים: כמה צעדים כבר צעדנו (g) וכמה צעדים נשארו ליעד (h)."
            audioSrc="/audio/narration/lab4.wav"
            spokenFallback={labData?.media?.narration?.transcript}
          />

          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-4 sm:p-5 space-y-4">
            <p className="text-xs sm:text-sm font-extrabold text-[#3C3C3C] text-center">
              לחצו על כל משבצת במפה כדי לראות את ציון המרחק שלה (f = g + h):
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <div className="grid grid-cols-5 gap-1.5" dir="ltr">
                {Array.from({ length: 25 }).map((_, idx) => {
                  const x = idx % 5;
                  const y = Math.floor(idx / 5);
                  const isStart = x === 0 && y === 0;
                  const isGoal = x === 4 && y === 4;
                  const isSelected = inspectedTile.x === x && inspectedTile.y === y;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setInspectedTile({ x, y });
                        AudioEngine.playStep();
                      }}
                      className={`w-11 h-11 rounded-xl border-2 font-extrabold text-sm cursor-pointer transition-transform active:translate-y-[2px] ${
                        isStart
                          ? 'bg-[#1CB0F6] border-[#1899D6] text-white'
                          : isGoal
                          ? 'bg-[#58CC02] border-[#58A700] text-white'
                          : isSelected
                          ? 'bg-[#FFC800] border-[#E5A800] text-[#3C3C3C]'
                          : 'bg-white border-[#E5E5E5] text-[#777777] hover:bg-[#DDF4FF]'
                      }`}
                    >
                      {isStart ? '🚀' : isGoal ? '⭐' : x + y + (8 - x - y)}
                    </button>
                  );
                })}
              </div>

              <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-4 space-y-2 text-sm min-w-[200px]">
                <div className="font-extrabold text-[#3C3C3C]">
                  משבצת ({inspectedTile.x}, {inspectedTile.y})
                </div>
                <div className="text-xs font-bold text-[#1899D6]">
                  צעדים מההתחלה (g): {inspectedTile.x + inspectedTile.y}
                </div>
                <div className="text-xs font-bold text-[#58A700]">
                  מרחק שנותר ליעד (h): {Math.abs(4 - inspectedTile.x) + Math.abs(4 - inspectedTile.y)}
                </div>
                <div className="pt-1 border-t border-[#E5E5E5] font-extrabold text-[#3C3C3C]">
                  ציון כולל: f = {inspectedTile.x + inspectedTile.y + Math.abs(4 - inspectedTile.x) + Math.abs(4 - inspectedTile.y)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEPS 1, 2, 4: Interactive 8x8 Pathfinder Canvas */}
      {(step === 1 || step === 2 || step === 4) && (
        <div className="w-full space-y-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#3C3C3C]">
              {step === 1
                ? 'משימה 1: שגרו את המצפן החכם (A*)'
                : step === 2
                ? 'משימה 2: הניחו 4+ אסטרואידים וראו עקיפה חכמה'
                : 'משימה 3: תחרות חכם (A*) מול גלי מכ״ם (BFS)'}
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
                  ? '/audio/hints/lab4_ch1.mp3?v=1.0.0'
                  : step === 2
                  ? '/audio/hints/lab4_ch2.mp3?v=1.0.0'
                  : '/audio/hints/lab4_ch3.mp3?v=1.0.0'
              }
            />
          </div>

          <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6">
            {/* 8x8 Map (dir="ltr") */}
            <div
              className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-3 sm:p-4 select-none shrink-0"
              style={{ touchAction: step === 2 ? 'none' : 'auto' }}
            >
              <div className="grid grid-cols-8 gap-1 sm:gap-1.5" dir="ltr">
                {Array.from({ length: 64 }).map((_, idx) => {
                  const x = idx % GRID_SIZE;
                  const y = Math.floor(idx / GRID_SIZE);
                  const k = `${x},${y}`;
                  const isStart = x === START_PT.x && y === START_PT.y;
                  const isGoal = x === GOAL_PT.x && y === GOAL_PT.y;
                  const isWall = grid[idx] === 1;
                  const isVisited = visibleVisitedSet.has(k);
                  const isPath = isPathVisible && pathSet.has(k);
                  const hVal = Math.abs(GOAL_PT.x - x) + Math.abs(GOAL_PT.y - y);

                  let bg = '#FFFFFF';
                  let border = '#E5E5E5';
                  if (isStart) {
                    bg = '#1CB0F6';
                    border = '#1899D6';
                  } else if (isGoal) {
                    bg = '#58CC02';
                    border = '#58A700';
                  } else if (isWall) {
                    bg = '#4B4B4B';
                    border = '#3C3C3C';
                  } else if (isPath) {
                    bg = '#FFC800';
                    border = '#E5A800';
                  } else if (isVisited) {
                    bg = '#DDF4FF';
                    border = '#84D8FF';
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onPointerDown={() => {
                        if (step !== 2) return;
                        const nextVal = isWall ? 0 : 1;
                        wallPaintRef.current = nextVal;
                        handleSetWall(x, y, nextVal);
                      }}
                      onPointerEnter={() => {
                        if (step === 2 && wallPaintRef.current !== null) {
                          handleSetWall(x, y, wallPaintRef.current);
                        }
                      }}
                      aria-label={`משבצת (${x},${y})`}
                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg border-2 flex items-center justify-center text-[11px] font-mono font-extrabold transition-colors ${
                        step === 2 ? 'cursor-pointer' : 'cursor-default'
                      }`}
                      style={{ backgroundColor: bg, borderColor: border }}
                    >
                      {isStart ? (
                        '🚀'
                      ) : isGoal ? (
                        '⭐'
                      ) : isWall ? (
                        '🪨'
                      ) : showHeuristics ? (
                        <span className="text-[#4B4B4B]">{hVal}</span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Controls & Stats */}
            <div className="flex-1 w-full max-w-sm space-y-3.5">
              {step === 2 && (
                <div className="card-duo p-3.5 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span>מכשולי אסטרואידים במפה:</span>
                    <span
                      className={`px-2.5 py-0.5 rounded-lg ${
                        wallCount >= 4
                          ? 'bg-[#D7FFB8] text-[#467E00]'
                          : 'bg-[#FFF6D6] text-[#9A6700]'
                      }`}
                    >
                      {wallCount} / 4 אסטרואידים
                    </span>
                  </div>
                  <p className="text-xs text-[#777777]">
                    לחצו או החליקו על משבצות ריקות כדי לבנות חומה ולראות איך החללית עוקפת אותה.
                  </p>
                  <button
                    type="button"
                    onClick={handleLoadBarrierPreset}
                    className="btn-duo-white w-full py-2 text-xs"
                  >
                    <ShieldAlert className="w-3.5 h-3.5 text-[#FF9600]" />
                    <span>הצב חומת אסטרואידים אוטומטית</span>
                  </button>
                </div>
              )}

              {step === 4 && (
                <div className="card-duo p-4 space-y-3">
                  <div className="text-xs font-extrabold text-[#3C3C3C]">
                    כמה משבצות נבדקו במפה? (פחות = חכם יותר)
                  </div>

                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#467E00]">מצפן חכם (A*)</span>
                        <span className="font-mono font-extrabold text-[#467E00]">
                          {astarPreviewCount} משבצות
                        </span>
                      </div>
                      <progress
                        className="progress-duo w-full h-3"
                        value={astarPreviewCount}
                        max={64}
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-bold">
                        <span className="text-[#1899D6]">סורק גלים עיוור (BFS)</span>
                        <span className="font-mono font-extrabold text-[#1899D6]">
                          {lastBfsCount !== null ? `${lastBfsCount} משבצות` : 'לחצו לבדיקה'}
                        </span>
                      </div>
                      <progress
                        className="progress-duo w-full h-3"
                        style={{ '--progress-fill': '#1CB0F6' }}
                        value={lastBfsCount || 0}
                        max={64}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => triggerScanAnimation(step === 4 ? 'bfs' : 'astar')}
                  className="btn-duo-blue w-full py-3 px-4 text-sm sm:text-base"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>
                    {step === 4 ? 'הפעל השוואה: גלי מכ״ם (BFS)' : 'שגר גלי ניווט!'}
                  </span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowHeuristics((v) => !v);
                      AudioEngine.playStep();
                    }}
                    className={`flex-1 py-2 px-3 rounded-xl border-2 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer ${
                      showHeuristics
                        ? 'bg-[#DDF4FF] border-[#84D8FF] text-[#1899D6]'
                        : 'bg-white border-[#E5E5E5] text-[#4B4B4B]'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>מספרי מרחק (h)</span>
                  </button>

                  {step === 2 && (
                    <button
                      type="button"
                      onClick={() => {
                        setGrid(new Array(64).fill(0));
                        setCurrentStepIndex(0);
                        setHasRunDetour(false);
                        AudioEngine.playStep();
                      }}
                      className="btn-duo-white py-2 px-3 text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>נקה</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-2xl p-3 flex items-center justify-between text-xs font-bold text-[#4B4B4B]">
                <span className="inline-flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-[#1CB0F6]" />
                  <span>
                    מצב: {algorithm === 'astar' ? 'מצפן חכם (A*)' : 'גלי מכ״ם (BFS)'}
                  </span>
                </span>
                <span>
                  נסרקו: <strong>{currentStepIndex || solution.totalExplored}</strong> משבצות
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 3: Quiz 1 */}
      {step === 3 && (
        <QuizStepView
          quizItem={labMeta.miniQuiz[0]}
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
          badgeText="חשיבה מדעית"
        />
      )}

      {/* STEP 6: Real-World Connections */}
      {step === 6 && (
        <RealWorldStepView
          title="איפה עובד אלגוריתם הניווט בחיים האמיתיים?"
          mascotMessage="מהנסיעה המשפחתית עם Waze ועד רכבי מחקר בכוכב מאדים — אלגוריתמי ניווט מוצאים דרכים מהירות בכל רגע:"
          spokenFallback={labData?.conceptExplanation?.realWorldAnalogy}
          labMeta={labMeta}
        />
      )}
    </LessonShell>
  );
}
