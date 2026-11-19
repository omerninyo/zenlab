import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Trash2,
  FastForward,
  Key,
  Lock,
  Unlock,
  ArrowUp,
  CornerUpLeft,
  CornerUpRight
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { LAB_METADATA } from '../core/labMeta.js';
import { fireChampagneConfetti } from '../core/confetti.js';
import ZenMascot from './ZenMascot.jsx';
import LessonShell from './LessonShell.jsx';
import { AudioHintButton, QuizStepView, RealWorldStepView } from './LessonSharedViews.jsx';

const TOTAL_STEPS = 7;
const DIRECTIONS = ['north', 'east', 'south', 'west'];
const DIR_ARROWS = {
  north: '↑',
  east: '→',
  south: '↓',
  west: '←'
};

const COMMAND_DEFS = [
  { id: 'FORWARD', label: 'קדימה', bg: '#1CB0F6', lip: '#1899D6', text: '#FFFFFF', Icon: ArrowUp },
  { id: 'TURN_LEFT', label: 'שמאלה', bg: '#CE82FF', lip: '#A560E8', text: '#FFFFFF', Icon: CornerUpLeft },
  { id: 'TURN_RIGHT', label: 'ימינה', bg: '#FF9600', lip: '#E08200', text: '#FFFFFF', Icon: CornerUpRight },
  { id: 'PICK_KEY', label: 'קח מפתח', bg: '#FFC800', lip: '#E5A800', text: '#3C3C3C', Icon: Key },
  { id: 'UNLOCK_GATE', label: 'פתח שער', bg: '#58CC02', lip: '#58A700', text: '#FFFFFF', Icon: Unlock }
];

function stepCommandState(state, cmd, board, gridSize) {
  const next = { ...state, collided: false, info: '' };

  if (cmd === 'FORWARD') {
    let nx = next.x;
    let ny = next.y;
    if (next.dir === 'north') ny -= 1;
    else if (next.dir === 'east') nx += 1;
    else if (next.dir === 'south') ny += 1;
    else if (next.dir === 'west') nx -= 1;

    const inBounds = nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize;
    const hitWall = inBounds && (board.walls || []).some((w) => w.x === nx && w.y === ny);
    const hitLockedGate =
      inBounds && board.gate && nx === board.gate.x && ny === board.gate.y && !next.isGateUnlocked;

    if (!inBounds) {
      next.collided = true;
      next.info = 'הרובוט הגיע לקצה הלוח ונעצר.';
    } else if (hitWall) {
      next.collided = true;
      next.info = 'התנגשות בחומת לבנים! פנו לפני הקיר.';
    } else if (hitLockedGate) {
      next.collided = true;
      next.info = 'השער עדיין נעול! אספו מפתח ועמדו ליד השער עם פקודת "פתח שער".';
    } else {
      next.x = nx;
      next.y = ny;
    }
    return next;
  }

  if (cmd === 'TURN_LEFT') {
    const idx = DIRECTIONS.indexOf(next.dir);
    next.dir = DIRECTIONS[(idx + 3) % 4];
    return next;
  }

  if (cmd === 'TURN_RIGHT') {
    const idx = DIRECTIONS.indexOf(next.dir);
    next.dir = DIRECTIONS[(idx + 1) % 4];
    return next;
  }

  if (cmd === 'PICK_KEY') {
    if (board.key && next.x === board.key.x && next.y === board.key.y) {
      next.hasKey = true;
    } else {
      next.info = 'המפתח נמצא במשבצת הצהובה (🔑) — צריך לעמוד בדיוק עליה.';
    }
    return next;
  }

  if (cmd === 'UNLOCK_GATE') {
    const nearGate =
      board.gate && Math.abs(next.x - board.gate.x) + Math.abs(next.y - board.gate.y) <= 1;
    if (next.hasKey && nearGate) {
      next.isGateUnlocked = true;
    } else if (!next.hasKey) {
      next.info = 'עדיין אין מפתח ביד! אספו קודם את המפתח הצהוב.';
    } else {
      next.info = 'צריך להתקרב למשבצת שליד השער הנעול כדי לפתוח אותו.';
    }
    return next;
  }

  return next;
}

function simulateFullQueue(queue, board, gridSize) {
  let sim = {
    x: board.start.x,
    y: board.start.y,
    dir: board.start.dir,
    hasKey: false,
    isGateUnlocked: false,
    collided: false,
    info: ''
  };
  const trace = {};

  for (let i = 0; i < queue.length; i++) {
    sim = stepCommandState(sim, queue[i], board, gridSize);
    const k = `${sim.x},${sim.y}`;
    trace[k] = i + 1;
    if (sim.collided) {
      return { ...sim, failedAtStep: i + 1, trace };
    }
  }
  return { ...sim, failedAtStep: null, trace };
}

export default function Station2RobotLesson({
  curriculum,
  onExit,
  onNextStation,
  onOpenCertificate
}) {
  const labData = curriculum?.labs?.lab2 || {};
  const labMeta = LAB_METADATA.lab2;
  const board = labData.defaultBoard || {
    start: { x: 0, y: 0, dir: 'east' },
    key: { x: 1, y: 4 },
    gate: { x: 4, y: 3 },
    goal: { x: 5, y: 5 },
    walls: [
      { x: 2, y: 0 },
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 0, y: 3 },
      { x: 3, y: 4 },
      { x: 4, y: 2 }
    ]
  };
  const gridSize = labData.gridSize || 6;

  const [step, setStep] = useState(() => {
    const saved = StorageEngine.getLabStep('lab2');
    return saved < TOTAL_STEPS - 1 ? saved : 0;
  });
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestLessonStreak, setBestLessonStreak] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Step 0 mini-corridor state (4 cells east)
  const [warmupCommands, setWarmupCommands] = useState([]);
  const [warmupPos, setWarmupPos] = useState(0);

  // Cumulative 6x6 board & command queue (Steps 1, 3, 5)
  const [commands, setCommands] = useState([]);
  const [robotState, setRobotState] = useState(() => ({
    x: board.start.x,
    y: board.start.y,
    dir: board.start.dir,
    hasKey: false,
    isGateUnlocked: false,
    collided: false,
    info: ''
  }));
  const [executingIndex, setExecutingIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [debugCursor, setDebugCursor] = useState(0);

  // Quiz choices
  const [quiz1Choice, setQuiz1Choice] = useState(null);
  const [quiz2Choice, setQuiz2Choice] = useState(null);

  const timerRef = useRef(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const resetRobotToStart = () => {
    stopTimer();
    setExecutingIndex(-1);
    setDebugCursor(0);
    setRobotState({
      x: board.start.x,
      y: board.start.y,
      dir: board.start.dir,
      hasKey: false,
      isGateUnlocked: false,
      collided: false,
      info: ''
    });
  };

  const goToStep = (nextStep) => {
    stopTimer();
    const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, nextStep));
    setFeedback(null);
    setRetryCount(0);
    setStep(clamped);
    StorageEngine.setLabStep('lab2', clamped);
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

  const plannedPreview = useMemo(() => {
    return simulateFullQueue(commands, board, gridSize);
  }, [commands, board, gridSize]);

  const handleAddCommand = (cmdId) => {
    if (isRunning) return;
    setFeedback(null);
    setCommands((prev) => [...prev, cmdId]);
    AudioEngine.playStep();
  };

  const handleRemoveCommand = (index) => {
    if (isRunning) return;
    setFeedback(null);
    setCommands((prev) => prev.filter((_, i) => i !== index));
    AudioEngine.playTone(250, 'triangle', 0.05, 0.04);
  };

  const handleRunQueue = () => {
    if (isRunning || commands.length === 0) return;
    stopTimer();
    setFeedback(null);

    let sim = {
      x: board.start.x,
      y: board.start.y,
      dir: board.start.dir,
      hasKey: false,
      isGateUnlocked: false,
      collided: false,
      info: ''
    };
    setRobotState(sim);
    setExecutingIndex(0);
    setIsRunning(true);

    let idx = 0;
    timerRef.current = setInterval(() => {
      if (idx >= commands.length) {
        stopTimer();
        setExecutingIndex(-1);
        return;
      }

      const cmd = commands[idx];
      const next = stepCommandState(sim, cmd, board, gridSize);
      const justGotKey = !sim.hasKey && next.hasKey;
      const justUnlockedGate = !sim.isGateUnlocked && next.isGateUnlocked;
      sim = next;
      setRobotState(next);
      setExecutingIndex(idx);
      setDebugCursor(idx + 1);

      if (justGotKey) {
        StorageEngine.completeChallenge('lab2', 'lab2_challenge1', 1);
        AudioEngine.playCollect();
      } else if (justUnlockedGate) {
        StorageEngine.completeChallenge('lab2', 'lab2_challenge2', 1);
        AudioEngine.playUnlock();
      } else if (next.collided) {
        AudioEngine.playError();
        stopTimer();
        setFeedback({
          status: 'retry',
          text: `בצעד ${idx + 1}: ${next.info}`
        });
        return;
      } else {
        AudioEngine.playStep();
      }

      const reachedGoal = next.x === board.goal.x && next.y === board.goal.y;
      if (reachedGoal) {
        StorageEngine.completeChallenge('lab2', 'lab2_challenge1', 1);
        StorageEngine.completeChallenge('lab2', 'lab2_challenge2', 1);
        StorageEngine.completeChallenge('lab2', 'lab2_challenge3', 1);
        stopTimer();
        setExecutingIndex(-1);
        if (step === 5) {
          fireChampagneConfetti();
          recordPass(
            labData.challenges?.[2]?.successMessage ||
              'אלגוריתם מושלם! הרובוט אסף את המפתח, פתח את השער והגיע אל היעד.'
          );
        } else {
          AudioEngine.playZenChime();
        }
        return;
      }

      idx += 1;
      if (idx >= commands.length) {
        stopTimer();
        setExecutingIndex(-1);
        if (step === 1 && next.hasKey) {
          StorageEngine.completeChallenge('lab2', 'lab2_challenge1', 1);
          recordPass(
            labData.challenges?.[0]?.successMessage ||
              'המפתח אצלכם! עכשיו אפשר להתקדם אל השער הנעול.'
          );
        } else if (step === 3 && next.isGateUnlocked) {
          StorageEngine.completeChallenge('lab2', 'lab2_challenge1', 1);
          StorageEngine.completeChallenge('lab2', 'lab2_challenge2', 1);
          recordPass(
            labData.challenges?.[1]?.successMessage ||
              'השער נפתח בהצלחה! הדרך לגביע הניצחון פתוחה.'
          );
        }
      }
    }, 220);
  };

  const handleSingleStep = () => {
    if (isRunning || commands.length === 0) return;
    setFeedback(null);
    let currentCursor = debugCursor;
    let baseState = robotState;

    if (currentCursor >= commands.length || robotState.collided) {
      currentCursor = 0;
      baseState = {
        x: board.start.x,
        y: board.start.y,
        dir: board.start.dir,
        hasKey: false,
        isGateUnlocked: false,
        collided: false,
        info: ''
      };
    }

    const next = stepCommandState(baseState, commands[currentCursor], board, gridSize);
    setRobotState(next);
    setExecutingIndex(currentCursor);
    setDebugCursor(currentCursor + 1);

    if (next.collided) {
      AudioEngine.playError();
      setFeedback({ status: 'retry', text: `בצעד ${currentCursor + 1}: ${next.info}` });
    } else {
      if (!baseState.hasKey && next.hasKey) AudioEngine.playCollect();
      else if (!baseState.isGateUnlocked && next.isGateUnlocked) AudioEngine.playUnlock();
      else AudioEngine.playStep();
    }
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

    if (step === 0) {
      if (warmupPos >= 3) {
        recordPass('נהדר! הרובוט מבצע כל פקודה בדיוק לפי הסדר שכתבתם.');
      } else {
        recordRetry('הוסיפו 3 פקודות "קדימה" כדי להצעיד את זֶן עד לכוכב!');
      }
      return;
    }

    if (step === 1) {
      const sim = plannedPreview;
      setRobotState(sim);
      if (sim.hasKey) {
        StorageEngine.completeChallenge('lab2', 'lab2_challenge1', 1);
        recordPass(
          labData.challenges?.[0]?.successMessage ||
            'המפתח אצלכם! עכשיו אפשר להתקדם אל השער הנעול.'
        );
      } else if (sim.collided) {
        recordRetry(`בצעד ${sim.failedAtStep}: ${sim.info}`);
      } else {
        recordRetry(
          'הרובוט עדיין לא אסף את המפתח במשבצת הצהובה (🔑). זכרו להוסיף גם "קח מפתח" כשתגיעו אליו!'
        );
      }
      return;
    }

    if (step === 2) {
      const q = labMeta.miniQuiz[0];
      if (quiz1Choice === q.correctIndex) {
        recordPass(q.explanation);
      } else {
        recordRetry('נסו שוב: אלגוריתם הוא כמו מתכון הוראות ברור שלב-אחר-שלב.');
      }
      return;
    }

    if (step === 3) {
      const sim = plannedPreview;
      setRobotState(sim);
      if (sim.isGateUnlocked) {
        StorageEngine.completeChallenge('lab2', 'lab2_challenge1', 1);
        StorageEngine.completeChallenge('lab2', 'lab2_challenge2', 1);
        recordPass(
          labData.challenges?.[1]?.successMessage ||
            'השער נפתח בהצלחה! הדרך לכוכב הניצחון פתוחה.'
        );
      } else if (sim.collided) {
        recordRetry(`בצעד ${sim.failedAtStep}: ${sim.info}`);
      } else if (!sim.hasKey) {
        recordRetry('הרובוט חייב לאסוף קודם את המפתח (🔑) לפני שיוכל לפתוח את השער.');
      } else {
        recordRetry(
          'התקדמו מהמפתח אל משבצת שליד השער האדום (🔒) והפעילו עליו "פתח שער".'
        );
      }
      return;
    }

    if (step === 4) {
      const q = labMeta.miniQuiz[2];
      if (quiz2Choice === q.correctIndex) {
        recordPass(q.explanation);
      } else {
        recordRetry('דמיינו את הרובוט מביט ימינה ומסתובב ימינה — לאיזה כיוון החץ יפנה?');
      }
      return;
    }

    if (step === 5) {
      const sim = plannedPreview;
      setRobotState(sim);
      const reachedGoal = sim.x === board.goal.x && sim.y === board.goal.y && !sim.collided;
      if (reachedGoal) {
        StorageEngine.completeChallenge('lab2', 'lab2_challenge1', 1);
        StorageEngine.completeChallenge('lab2', 'lab2_challenge2', 1);
        StorageEngine.completeChallenge('lab2', 'lab2_challenge3', 1);
        fireChampagneConfetti();
        recordPass(
          labData.challenges?.[2]?.successMessage ||
            'אלגוריתם מושלם! הרובוט אסף את המפתח, פתח את השער והגיע אל היעד.'
        );
      } else if (sim.collided) {
        recordRetry(`בצעד ${sim.failedAtStep}: ${sim.info}`);
      } else {
        recordRetry('עברו דרך השער הפתוח והתקדמו עד משבצת הגביע (🏆) בפינה הימנית התחתונה!');
      }
      return;
    }

    if (step === 6) {
      setIsLessonComplete(true);
    }
  };

  const isActionDisabled = useMemo(() => {
    if (feedback) return false;
    if (step === 0) return warmupPos < 3;
    if (step === 1 || step === 3 || step === 5) return commands.length === 0 || isRunning;
    if (step === 2) return quiz1Choice === null;
    if (step === 4) return quiz2Choice === null;
    return false;
  }, [feedback, step, warmupPos, commands.length, isRunning, quiz1Choice, quiz2Choice]);

  const primaryButtonLabel = useMemo(() => {
    if (feedback?.status === 'pass') return step === TOTAL_STEPS - 1 ? 'סיום השיעור!' : 'המשך';
    if (feedback?.status === 'retry') return 'נסה שוב';
    if (step === 0 || step === 6) return step === 6 ? 'סיום השיעור!' : 'המשך';
    return 'בדיקה';
  }, [feedback, step]);

  const hintConfig = useMemo(() => {
    if (step === 1) {
      return {
        text: labData.challenges?.[0]?.hint,
        audioSrc: '/audio/hints/lab2_ch1.mp3?v=3.1.1'
      };
    }
    if (step === 3) {
      return {
        text: labData.challenges?.[1]?.hint,
        audioSrc: '/audio/hints/lab2_ch2.mp3?v=3.1.1'
      };
    }
    if (step === 5) {
      return {
        text: labData.challenges?.[2]?.hint,
        audioSrc: '/audio/hints/lab2_ch3.mp3?v=3.1.1'
      };
    }
    return { text: '', audioSrc: '' };
  }, [step, labData.challenges]);

  const isPuzzleStep = step === 1 || step === 3 || step === 5;
  const puzzleTitle =
    step === 1
      ? 'משימה 1: נווטו ואספו את המפתח (🔑)'
      : step === 3
      ? 'משימה 2: פתחו את השער הנעול (🔒)'
      : 'משימה 3: הגיעו אל הגביע המנצח (🏆)';
  const puzzleAudio =
    step === 1
      ? '/audio/steps/lab2_inst1.mp3?v=3.1.1'
      : step === 3
      ? '/audio/steps/lab2_inst2.mp3?v=3.1.1'
      : '/audio/steps/lab2_inst3.mp3?v=3.1.1';
  const puzzleInstruction =
    step === 1
      ? labData.challenges?.[0]?.instructions
      : step === 3
      ? labData.challenges?.[1]?.instructions
      : labData.challenges?.[2]?.instructions;

  return (
    <LessonShell
      labId="lab2"
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
      victoryTitle="אלופים! תכנתתם את הרובוט בהצלחה"
      victorySubtitle="בניתם אלגוריתם שלם צעד-אחר-צעד, תיקנתם טעויות ופתחתם את השער הנעול."
      victoryTakeaways={[
        'אלגוריתם הוא רשימת הוראות מדויקת שהרובוט מבצע בדיוק לפי הסדר.',
        'סדר הפקודות קובע: פנייה לפני צעד משנה את כל המסלול במבוך.',
        'כשהרובוט נתקע בקיר, זה לא אסון — עושים דיבאגינג (תיקון) צעד אחר צעד!'
      ]}
    >
      {/* STEP 0: Intro Warm-Up 1x4 Corridor */}
      {step === 0 && (
        <div className="max-w-xl mx-auto w-full space-y-7">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C3C3C] text-center">
            איך מתכנתים רובוט ללכת במבוך?
          </h1>

          <ZenMascot
            pose="teach"
            size="md"
            message="רובוט לא מנחש לבד — הוא מבצע בדיוק את רשימת הפקודות שאתם מכינים לו צעד אחר צעד!"
            audioSrc="/audio/steps/lab2_intro.mp3?v=3.1.1"
            spokenFallback="רובוט לא מנחש לבד — הוא מבצע בדיוק את רשימת הפקודות שאתם מכינים לו צעד אחר צעד!"
          />

          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-5 space-y-5 text-center">
            <p className="text-sm sm:text-base font-extrabold text-[#3C3C3C]">
              חימום זריז: לחצו 3 פעמים על פקודת &quot;צעד קדימה&quot; כדי להביא את זֶן אל הכוכב:
            </p>

            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto" dir="ltr">
              {[0, 1, 2, 3].map((cellIdx) => {
                const isRobot = warmupPos === cellIdx;
                const isStar = cellIdx === 3;
                return (
                  <div
                    key={cellIdx}
                    className={`h-16 rounded-2xl border-2 flex items-center justify-center font-extrabold text-xl ${
                      isRobot
                        ? 'bg-[#1CB0F6] border-[#1899D6] text-white'
                        : isStar
                        ? 'bg-[#FFFDF2] border-[#FFC800]'
                        : 'bg-white border-[#E5E5E5]'
                    }`}
                  >
                    {isRobot ? '→' : isStar ? '⭐' : ''}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                disabled={warmupPos >= 3}
                onClick={() => {
                  const next = Math.min(3, warmupPos + 1);
                  setWarmupCommands((c) => [...c, 'קדימה']);
                  setWarmupPos(next);
                  AudioEngine.playStep();
                  if (next === 3) AudioEngine.playSuccess();
                }}
                className={`px-5 py-2.5 text-sm ${
                  warmupPos >= 3 ? 'btn-duo-disabled' : 'btn-duo-blue'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
                <span>צעד קדימה ({warmupCommands.length}/3)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWarmupCommands([]);
                  setWarmupPos(0);
                  AudioEngine.playStep();
                }}
                className="btn-duo-white px-3.5 py-2.5 text-sm"
                aria-label="איפוס חימום"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* STEPS 1, 3, 5: 6x6 Daylight Interactive Robot Maze */}
      {isPuzzleStep && (
        <div className="w-full space-y-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#3C3C3C]">{puzzleTitle}</h1>
            <AudioHintButton text={puzzleInstruction} audioSrc={puzzleAudio} />
          </div>

          <p className="text-xs sm:text-sm font-medium text-[#777777] text-center max-w-xl mx-auto">
            {puzzleInstruction}
          </p>

          <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-6">
            {/* 6x6 Spatial Grid (strictly dir="ltr" so East/Right arrow aligns with x+1) */}
            <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-3 sm:p-4 shrink-0">
              <div className="grid grid-cols-6 gap-1.5" dir="ltr">
                {Array.from({ length: gridSize * gridSize }).map((_, idx) => {
                  const x = idx % gridSize;
                  const y = Math.floor(idx / gridSize);
                  const isWall = (board.walls || []).some((w) => w.x === x && w.y === y);
                  const isRobot = robotState.x === x && robotState.y === y;
                  const isKey = board.key.x === x && board.key.y === y && !robotState.hasKey;
                  const isGate = board.gate.x === x && board.gate.y === y;
                  const isGoal = board.goal.x === x && board.goal.y === y;
                  const traceStep = plannedPreview.trace?.[`${x},${y}`];

                  let tileBg = '#FFFFFF';
                  let tileBorder = '#E5E5E5';
                  let tileLip = '#E5E5E5';

                  if (isWall) {
                    tileBg = '#777777';
                    tileBorder = '#4B4B4B';
                    tileLip = '#4B4B4B';
                  } else if (isRobot) {
                    tileBg = robotState.collided ? '#FF4B4B' : '#1CB0F6';
                    tileBorder = robotState.collided ? '#EA2B2B' : '#1899D6';
                    tileLip = robotState.collided ? '#EA2B2B' : '#1899D6';
                  } else if (isGate) {
                    tileBg = robotState.isGateUnlocked ? '#D7FFB8' : '#FFDFE0';
                    tileBorder = robotState.isGateUnlocked ? '#58CC02' : '#FF4B4B';
                    tileLip = robotState.isGateUnlocked ? '#58A700' : '#EA2B2B';
                  } else if (isKey) {
                    tileBg = '#FFFDF0';
                    tileBorder = '#FFC800';
                    tileLip = '#E5A800';
                  } else if (isGoal) {
                    tileBg = '#D7FFB8';
                    tileBorder = '#58CC02';
                    tileLip = '#58A700';
                  } else if (traceStep) {
                    tileBg = '#EEF9FF';
                    tileBorder = '#84D8FF';
                  }

                  return (
                    <div
                      key={`${x}-${y}`}
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-2 flex items-center justify-center relative font-extrabold select-none transition-colors"
                      style={{
                        backgroundColor: tileBg,
                        borderColor: tileBorder,
                        boxShadow: `0 2px 0 ${tileLip}`
                      }}
                    >
                      {isRobot ? (
                        <span className="text-xl text-white leading-none">
                          {DIR_ARROWS[robotState.dir]}
                        </span>
                      ) : isWall ? (
                        <span className="text-xs text-[#E5E5E5]">🧱</span>
                      ) : isKey ? (
                        <span className="text-lg">🔑</span>
                      ) : isGate ? (
                        <span className="text-lg">{robotState.isGateUnlocked ? '🔓' : '🔒'}</span>
                      ) : isGoal ? (
                        <span className="text-lg">🏆</span>
                      ) : traceStep ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-[#84D8FF]" />
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {/* Status Inventory Chips below Maze */}
              <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-[#E5E5E5] text-xs font-extrabold">
                <span
                  className={`px-2.5 py-1 rounded-xl border ${
                    robotState.hasKey
                      ? 'bg-[#FFF6D6] border-[#FFC800] text-[#9A6700]'
                      : 'bg-white border-[#E5E5E5] text-[#AFAFAF]'
                  }`}
                >
                  🔑 {robotState.hasKey ? 'יש מפתח' : 'חסר מפתח'}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-xl border ${
                    robotState.isGateUnlocked
                      ? 'bg-[#D7FFB8] border-[#58CC02] text-[#467E00]'
                      : 'bg-white border-[#E5E5E5] text-[#AFAFAF]'
                  }`}
                >
                  {robotState.isGateUnlocked ? '🔓 השער פתוח' : '🔒 השער נעול'}
                </span>
              </div>
            </div>

            {/* Right / Bottom Controls: Command Blocks & Live Queue */}
            <div className="flex-1 w-full max-w-md space-y-3">
              {/* Command Buttons Palette */}
              <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-2xl p-3 space-y-2.5">
                <div className="text-xs font-extrabold text-[#777777]">
                  הוסיפו פקודות לתוכנית של הרובוט:
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {COMMAND_DEFS.map((cmd) => {
                    const CmdIcon = cmd.Icon;
                    return (
                      <button
                        key={cmd.id}
                        type="button"
                        disabled={isRunning}
                        onClick={() => handleAddCommand(cmd.id)}
                        className="py-2.5 px-2.5 rounded-2xl border-2 text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer transition-transform active:translate-y-[3px]"
                        style={{
                          backgroundColor: cmd.bg,
                          borderColor: cmd.lip,
                          color: cmd.text,
                          boxShadow: `0 3px 0 ${cmd.lip}`
                        }}
                      >
                        <CmdIcon className="w-3.5 h-3.5 shrink-0" />
                        <span>{cmd.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Controls: Run / Single-Step / Reset / Clear */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={isRunning || commands.length === 0}
                  onClick={handleRunQueue}
                  className={`flex-1 py-2.5 px-4 text-sm ${
                    isRunning || commands.length === 0 ? 'btn-duo-disabled' : 'btn-duo-green'
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>הפעל רובוט</span>
                </button>

                <button
                  type="button"
                  disabled={isRunning || commands.length === 0}
                  onClick={handleSingleStep}
                  className={`py-2.5 px-3 text-xs sm:text-sm ${
                    isRunning || commands.length === 0 ? 'btn-duo-disabled' : 'btn-duo-white'
                  }`}
                  title="הרצת פקודה אחת בכל לחיצה כדי למצוא טעויות"
                >
                  <FastForward className="w-4 h-4 text-[#FF9600]" />
                  <span>צעד בודד</span>
                </button>

                <button
                  type="button"
                  onClick={resetRobotToStart}
                  className="btn-duo-white py-2.5 px-3 text-xs"
                  title="החזרת הרובוט להתחלה"
                  aria-label="החזרת הרובוט להתחלה"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Command Queue Tape */}
              <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-3 space-y-2 min-h-[120px]">
                <div className="flex items-center justify-between text-xs font-extrabold text-[#777777]">
                  <span>רשימת הפקודות ({commands.length}) — לחצו למחיקה</span>
                  {commands.length > 0 && (
                    <button
                      type="button"
                      disabled={isRunning}
                      onClick={() => {
                        resetRobotToStart();
                        setCommands([]);
                      }}
                      className="text-[#FF4B4B] hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>נקה הכול</span>
                    </button>
                  )}
                </div>

                {commands.length === 0 ? (
                  <p className="text-xs font-medium text-[#AFAFAF] py-5 text-center">
                    הקישו על כפתורי הפקודות למעלה כדי לבנות את המסלול של הרובוט.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                    {commands.map((cmdId, idx) => {
                      const def = COMMAND_DEFS.find((d) => d.id === cmdId) || COMMAND_DEFS[0];
                      const isActive = idx === executingIndex;
                      return (
                        <button
                          key={`${cmdId}-${idx}`}
                          type="button"
                          disabled={isRunning}
                          onClick={() => handleRemoveCommand(idx)}
                          className={`px-2.5 py-1 rounded-xl border-2 text-xs font-extrabold flex items-center gap-1 cursor-pointer transition-transform ${
                            isActive ? 'ring-2 ring-[#3C3C3C] scale-105' : ''
                          }`}
                          style={{
                            backgroundColor: def.bg,
                            borderColor: def.lip,
                            color: def.text
                          }}
                          title="לחצו להסרת פקודה"
                        >
                          <span className="font-mono opacity-80">{idx + 1}.</span>
                          <span>{def.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 2: Quiz 1 */}
      {step === 2 && (
        <QuizStepView
          quizItem={labMeta.miniQuiz[0]}
          selectedChoiceIdx={quiz1Choice}
          audioSrc="/audio/steps/lab2_quiz1.mp3?v=3.1.1"
          onSelectChoice={(idx) => {
            setFeedback(null);
            setQuiz1Choice(idx);
          }}
        />
      )}

      {/* STEP 4: Quiz 2 */}
      {step === 4 && (
        <QuizStepView
          quizItem={labMeta.miniQuiz[2]}
          selectedChoiceIdx={quiz2Choice}
          audioSrc="/audio/steps/lab2_quiz2.mp3?v=3.1.1"
          onSelectChoice={(idx) => {
            setFeedback(null);
            setQuiz2Choice(idx);
          }}
          badgeText="אתגר כיוון במרחב"
        />
      )}

      {/* STEP 6: Real-World Connections */}
      {step === 6 && (
        <RealWorldStepView
          title="איפה פועלים אלגוריתמים בחיים האמיתיים?"
          mascotMessage="בדיוק כמו שהרובוט ביצע את ההוראות שלכם במבוך, מכונות ומשחקים סביבנו עוקבים אחרי אלגוריתמים כל יום:"
          spokenFallback="בדיוק כמו שהרובוט ביצע את ההוראות שלכם במבוך, מכונות ומשחקים סביבנו עוקבים אחרי אלגוריתמים כל יום:"
          audioSrc="/audio/steps/lab2_realworld.mp3?v=3.1.1"
          labMeta={labMeta}
        />
      )}
    </LessonShell>
  );
}
