import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Play, 
  RotateCcw, 
  Key, 
  Lock, 
  Unlock, 
  CornerUpLeft, 
  CornerUpRight, 
  ArrowUp, 
  Check, 
  AlertTriangle, 
  Award, 
  BookOpen, 
  Info, 
  Trash2,
  FastForward,
  Flag,
  ArrowRight
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { fireConfetti } from '../core/canvas-particles.js';
import LabPhaseHeader from '../components/LabPhaseHeader.jsx';
import TheoryView from '../components/TheoryView.jsx';
import LabMissionGuide from '../components/LabMissionGuide.jsx';
import SvgRobotAnimation from '../components/animations/SvgRobotAnimation.jsx';
import SvgCpuPipelineAnimation from '../components/animations/SvgCpuPipelineAnimation.jsx';

const DIRECTIONS = ['north', 'east', 'south', 'west'];

export default function Lab2_AlgorithmicRobot({ curriculum }) {
  const labData = curriculum.labs.lab2;
  const board = labData.defaultBoard;
  const gridSize = labData.gridSize || 6;

  // Phase state: 'theory' | 'interactive'
  const [phase, setPhase] = useState(() => StorageEngine.getLabPhase('lab2'));
  const [commands, setCommands] = useState([]);
  const [executingIndex, setExecutingIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);

  // Robot State
  const [robotPos, setRobotPos] = useState({ ...board.start });
  const [hasKey, setHasKey] = useState(false);
  const [isGateUnlocked, setIsGateUnlocked] = useState(false);
  const [status, setStatus] = useState('idle'); // 'idle' | 'running' | 'success' | 'collision' | 'error'
  const [statusMessage, setStatusMessage] = useState('בחרו פקודות ולחצו על "הפעלת הרובוט"');
  const [completedChallenges, setCompletedChallenges] = useState(() => StorageEngine.getState().completedChallenges);

  const abortExecutionRef = useRef(false);

  useEffect(() => {
    const unsub = StorageEngine.subscribe(state => {
      setCompletedChallenges(state.completedChallenges);
    });
    return unsub;
  }, []);

  const resetSimulation = () => {
    abortExecutionRef.current = true;
    setIsRunning(false);
    setExecutingIndex(-1);
    setRobotPos({ ...board.start });
    setHasKey(false);
    setIsGateUnlocked(false);
    setStatus('idle');
    setStatusMessage('הרובוט חזר להתחלה. מוכן להרצה!');
  };

  const addCommand = (cmdType) => {
    if (isRunning) return;
    setCommands([...commands, cmdType]);
    AudioEngine.playStep();
  };

  const removeCommand = (index) => {
    if (isRunning) return;
    setCommands(commands.filter((_, i) => i !== index));
    AudioEngine.playStep();
  };

  const clearCommands = () => {
    if (isRunning) return;
    setCommands([]);
    resetSimulation();
  };

  const isWall = (x, y) => {
    return board.walls.some(w => w.x === x && w.y === y);
  };

  const runAlgorithm = async () => {
    if (commands.length === 0 || isRunning) return;

    resetSimulation();
    abortExecutionRef.current = false;
    setIsRunning(true);
    setStatus('running');
    setStatusMessage('הרובוט מבצע את הפקודות צעד אחר צעד...');

    let currentPos = { ...board.start };
    let currentKey = false;
    let currentGateUnlocked = false;

    for (let i = 0; i < commands.length; i++) {
      if (abortExecutionRef.current) break;

      setExecutingIndex(i);
      const cmd = commands[i];

      // Delay for step animation
      await new Promise(res => setTimeout(res, 450));
      if (abortExecutionRef.current) break;

      if (cmd === 'FORWARD') {
        let nextX = currentPos.x;
        let nextY = currentPos.y;

        if (currentPos.dir === 'north') nextY -= 1;
        else if (currentPos.dir === 'south') nextY += 1;
        else if (currentPos.dir === 'east') nextX += 1;
        else if (currentPos.dir === 'west') nextX -= 1;

        // Check boundaries
        if (nextX < 0 || nextX >= gridSize || nextY < 0 || nextY >= gridSize) {
          setStatus('collision');
          setStatusMessage(`זהירות! הרובוט ניסה לצאת מגבולות הלוח בפקודה #${i + 1}`);
          AudioEngine.playError();
          setIsRunning(false);
          return;
        }

        // Check walls
        if (isWall(nextX, nextY)) {
          setStatus('collision');
          setStatusMessage(`אופס! הרובוט נתקע בקיר בפקודה #${i + 1}`);
          AudioEngine.playError();
          setIsRunning(false);
          return;
        }

        // Check locked gate
        if (nextX === board.gate.x && nextY === board.gate.y && !currentGateUnlocked) {
          setStatus('error');
          setStatusMessage('השער נעול! צריך קודם לאסוף מפתח ולפתוח אותו');
          AudioEngine.playError();
          setIsRunning(false);
          return;
        }

        currentPos = { ...currentPos, x: nextX, y: nextY };
        setRobotPos(currentPos);
        AudioEngine.playStep();

      } else if (cmd === 'TURN_LEFT') {
        const curDirIndex = DIRECTIONS.indexOf(currentPos.dir);
        const nextDir = DIRECTIONS[(curDirIndex + 3) % 4];
        currentPos = { ...currentPos, dir: nextDir };
        setRobotPos(currentPos);
        AudioEngine.playTone(360, 'sine', 0.05);

      } else if (cmd === 'TURN_RIGHT') {
        const curDirIndex = DIRECTIONS.indexOf(currentPos.dir);
        const nextDir = DIRECTIONS[(curDirIndex + 1) % 4];
        currentPos = { ...currentPos, dir: nextDir };
        setRobotPos(currentPos);
        AudioEngine.playTone(420, 'sine', 0.05);

      } else if (cmd === 'PICK_KEY') {
        if (currentPos.x === board.key.x && currentPos.y === board.key.y) {
          currentKey = true;
          setHasKey(true);
          AudioEngine.playCollect();
          setStatusMessage('יש! אספתם את המפתח');

          // Check Challenge 1
          if (!completedChallenges['lab2_challenge1']) {
            StorageEngine.completeChallenge('lab2', 'lab2_challenge1', 1);
          }
        } else {
          setStatusMessage('אין כאן מפתח לאסוף.');
          AudioEngine.playTone(200, 'sawtooth', 0.1);
        }

      } else if (cmd === 'UNLOCK_GATE') {
        // Must have key and be adjacent to or on the gate tile
        const isNearGate = Math.abs(currentPos.x - board.gate.x) + Math.abs(currentPos.y - board.gate.y) <= 1;
        if (!currentKey) {
          setStatus('error');
          setStatusMessage('לא ניתן לפתוח את השער בלי שאספתם קודם מפתח!');
          AudioEngine.playError();
          setIsRunning(false);
          return;
        }

        if (isNearGate) {
          currentGateUnlocked = true;
          setIsGateUnlocked(true);
          AudioEngine.playUnlock();
          setStatusMessage('כל הכבוד! השער נפתח בהצלחה');

          // Check Challenge 2
          if (!completedChallenges['lab2_challenge2']) {
            StorageEngine.completeChallenge('lab2', 'lab2_challenge2', 1);
          }
        } else {
          setStatusMessage('הרובוט צריך לעמוד ממש ליד השער כדי לפתוח אותו.');
          AudioEngine.playTone(200, 'sawtooth', 0.1);
        }
      }
    }

    setExecutingIndex(-1);
    setIsRunning(false);

    // Check if reached goal
    if (currentPos.x === board.goal.x && currentPos.y === board.goal.y) {
      setStatus('success');
      setStatusMessage('אלופים! הרובוט הגיע לדגל היעד בהצלחה!');
      AudioEngine.playSuccess();
      fireConfetti();

      // Check Challenge 3
      if (!completedChallenges['lab2_challenge3']) {
        StorageEngine.completeChallenge('lab2', 'lab2_challenge3', 1);
      }
    } else if (status !== 'collision' && status !== 'error') {
      setStatus('idle');
      setStatusMessage('הפקודות הסתיימו, אך הרובוט עדיין לא הגיע לדגל היעד.');
    }
  };

  const runSingleStep = () => {
    if (commands.length === 0 || isRunning) return;

    let nextIndex = executingIndex + 1;
    if (nextIndex >= commands.length) {
      resetSimulation();
      return;
    }

    setExecutingIndex(nextIndex);
    const cmd = commands[nextIndex];
    let currentPos = { ...robotPos };
    let currentKey = hasKey;
    let currentGateUnlocked = isGateUnlocked;

    if (cmd === 'FORWARD') {
      let nextX = currentPos.x;
      let nextY = currentPos.y;

      if (currentPos.dir === 'north') nextY -= 1;
      else if (currentPos.dir === 'south') nextY += 1;
      else if (currentPos.dir === 'east') nextX += 1;
      else if (currentPos.dir === 'west') nextX -= 1;

      if (nextX < 0 || nextX >= gridSize || nextY < 0 || nextY >= gridSize) {
        setStatus('collision');
        setStatusMessage(`זהירות! הרובוט ניסה לצאת מגבולות הלוח בפקודה #${nextIndex + 1}`);
        AudioEngine.playError();
        return;
      }

      if (isWall(nextX, nextY)) {
        setStatus('collision');
        setStatusMessage(`אופס! הרובוט נתקע בקיר בפקודה #${nextIndex + 1}`);
        AudioEngine.playError();
        return;
      }

      if (nextX === board.gate.x && nextY === board.gate.y && !currentGateUnlocked) {
        setStatus('error');
        setStatusMessage('השער נעול! צריך קודם לאסוף מפתח ולפתוח אותו');
        AudioEngine.playError();
        return;
      }

      currentPos = { ...currentPos, x: nextX, y: nextY };
      setRobotPos(currentPos);
      AudioEngine.playStep();
      setStatus('idle');
      setStatusMessage(`צעד #${nextIndex + 1}: התקדמות קדימה אל (${currentPos.x},${currentPos.y})`);

    } else if (cmd === 'TURN_LEFT') {
      const curDirIndex = DIRECTIONS.indexOf(currentPos.dir);
      const nextDir = DIRECTIONS[(curDirIndex + 3) % 4];
      currentPos = { ...currentPos, dir: nextDir };
      setRobotPos(currentPos);
      AudioEngine.playTone(360, 'sine', 0.05);
      setStatus('idle');
      setStatusMessage(`צעד #${nextIndex + 1}: פנייה שמאלה`);

    } else if (cmd === 'TURN_RIGHT') {
      const curDirIndex = DIRECTIONS.indexOf(currentPos.dir);
      const nextDir = DIRECTIONS[(curDirIndex + 1) % 4];
      currentPos = { ...currentPos, dir: nextDir };
      setRobotPos(currentPos);
      AudioEngine.playTone(420, 'sine', 0.05);
      setStatus('idle');
      setStatusMessage(`צעד #${nextIndex + 1}: פנייה ימינה`);

    } else if (cmd === 'PICK_KEY') {
      if (currentPos.x === board.key.x && currentPos.y === board.key.y) {
        currentKey = true;
        setHasKey(true);
        AudioEngine.playCollect();
        setStatusMessage('יש! אספתם את המפתח');
        if (!completedChallenges['lab2_challenge1']) {
          StorageEngine.completeChallenge('lab2', 'lab2_challenge1', 1);
        }
      } else {
        setStatusMessage('אין כאן מפתח לאסוף.');
        AudioEngine.playTone(200, 'sawtooth', 0.1);
      }

    } else if (cmd === 'UNLOCK_GATE') {
      const isNearGate = Math.abs(currentPos.x - board.gate.x) + Math.abs(currentPos.y - board.gate.y) <= 1;
      if (!currentKey) {
        setStatus('error');
        setStatusMessage('לא ניתן לפתוח את השער בלי שאספתם קודם מפתח!');
        AudioEngine.playError();
        return;
      }

      if (isNearGate) {
        currentGateUnlocked = true;
        setIsGateUnlocked(true);
        AudioEngine.playUnlock();
        setStatusMessage('כל הכבוד! השער נפתח בהצלחה');
        if (!completedChallenges['lab2_challenge2']) {
          StorageEngine.completeChallenge('lab2', 'lab2_challenge2', 1);
        }
      } else {
        setStatusMessage('הרובוט צריך לעמוד ממש ליד השער כדי לפתוח אותו.');
        AudioEngine.playTone(200, 'sawtooth', 0.1);
      }
    }

    if (currentPos.x === board.goal.x && currentPos.y === board.goal.y) {
      setStatus('success');
      setStatusMessage('אלופים! הרובוט הגיע לדגל היעד בהצלחה!');
      AudioEngine.playSuccess();
      fireConfetti();
      if (!completedChallenges['lab2_challenge3']) {
        StorageEngine.completeChallenge('lab2', 'lab2_challenge3', 1);
      }
    }
  };

  const getRobotRotation = (dir) => {
    switch (dir) {
      case 'north': return '-rotate-90';
      case 'south': return 'rotate-90';
      case 'west': return 'rotate-180';
      default: return 'rotate-0';
    }
  };

  const earnedStars = (completedChallenges['lab2_challenge1'] ? 1 : 0) +
                      (completedChallenges['lab2_challenge2'] ? 1 : 0) +
                      (completedChallenges['lab2_challenge3'] ? 1 : 0);

  return (
    <div className="space-y-6">
      {/* 2-Phase Header */}
      <LabPhaseHeader
        labData={labData}
        currentPhase={phase}
        onPhaseChange={setPhase}
        earnedStars={earnedStars}
        totalLabChallenges={labData.challenges.length}
      />

      {/* Phase 1: Theory View */}
      {phase === 'theory' && (
        <TheoryView
          labData={labData}
          animations={[
            { id: 'robot', label: 'רובוט אלגוריתמי ולולאות', component: SvgRobotAnimation },
            { id: 'pipeline', label: 'איך המעבד עובד (קריאה וביצוע)', component: SvgCpuPipelineAnimation }
          ]}
          onProceedToInteractive={() => {
            setPhase('interactive');
            StorageEngine.setLabPhase('lab2', 'interactive');
            AudioEngine.playStep();
          }}
        />
      )}

      {/* Phase 2: Interactive Simulator */}
      {phase === 'interactive' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Active Mission Guidance Banner */}
          <LabMissionGuide
            challenges={labData.challenges}
            completedChallenges={completedChallenges}
            labNumber={2}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Maze Grid Column */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center">
            {/* Status bar */}
            <div className="w-full flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-400">מה הרובוט עושה:</span>
                <span className={`font-medium ${
                  status === 'success' ? 'text-emerald-400' :
                  status === 'collision' || status === 'error' ? 'text-red-400' :
                  status === 'running' ? 'text-blue-400' : 'text-slate-300'
                }`}>
                  {statusMessage}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${
                  hasKey ? 'bg-amber-950/60 border-amber-800/80 text-amber-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  <Key className="w-3.5 h-3.5" />
                  <span>{hasKey ? 'יש מפתח' : 'אין מפתח'}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded border ${
                  isGateUnlocked ? 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300' : 'bg-slate-950 border-slate-800 text-slate-500'
                }`}>
                  {isGateUnlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  <span>{isGateUnlocked ? 'שער פתוח' : 'שער נעול'}</span>
                </div>
              </div>
            </div>

            {/* 6x6 Grid Render */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner">
              <div 
                className="grid grid-cols-6 gap-2 w-72 h-72 sm:w-88 sm:h-88 md:w-96 md:h-96"
                role="grid"
                aria-label="מבוך רובוט 6x6"
              >
                {Array.from({ length: gridSize }).map((_, rIdx) => (
                  Array.from({ length: gridSize }).map((_, cIdx) => {
                    const isRobot = robotPos.x === cIdx && robotPos.y === rIdx;
                    const wall = isWall(cIdx, rIdx);
                    const isKeyCell = board.key.x === cIdx && board.key.y === rIdx && !hasKey;
                    const isGateCell = board.gate.x === cIdx && board.gate.y === rIdx;
                    const isGoalCell = board.goal.x === cIdx && board.goal.y === rIdx;

                    let bgStyle = 'bg-slate-900 border-slate-800/80';
                    if (wall) bgStyle = 'bg-slate-800 border-slate-700';

                    return (
                      <div
                        key={`${rIdx}-${cIdx}`}
                        className={`relative rounded-lg border flex items-center justify-center transition-all ${bgStyle}`}
                      >
                        {/* Grid Coordinates watermark */}
                        <span className="absolute bottom-1 right-1 text-[9px] font-mono text-slate-700 select-none">
                          {cIdx},{rIdx}
                        </span>

                        {/* Wall obstacle icon */}
                        {wall && (
                          <div className="w-3 h-3 bg-slate-600 rounded-sm" />
                        )}

                        {/* Key Tile */}
                        {isKeyCell && !isRobot && (
                          <Key className="w-5 h-5 text-amber-400 animate-pulse" />
                        )}

                        {/* Gate Tile */}
                        {isGateCell && !isRobot && (
                          isGateUnlocked ? (
                            <Unlock className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Lock className="w-5 h-5 text-red-400" />
                          )
                        )}

                        {/* Goal Tile */}
                        {isGoalCell && !isRobot && (
                          <Flag className="w-5 h-5 text-blue-400" />
                        )}

                        {/* Robot Avatar */}
                        {isRobot && (
                          <div className={`p-1.5 rounded-lg bg-blue-600 text-white shadow-md transition-transform duration-300 ${getRobotRotation(robotPos.dir)}`}>
                            <Bot className="w-6 h-6" />
                          </div>
                        )}
                      </div>
                    );
                  })
                ))}
              </div>
            </div>

            {/* Playback action bar */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={runAlgorithm}
                disabled={isRunning || commands.length === 0}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors shadow-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>הפעלת הרובוט ({commands.length})</span>
              </button>

              <button
                type="button"
                onClick={runSingleStep}
                disabled={isRunning || commands.length === 0}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white transition-colors shadow-sm"
                title="הרצת פקודה אחת בכל לחיצה כדי לראות בדיוק מה הרובוט עושה"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>צעד בודד</span>
              </button>

              <button
                type="button"
                onClick={resetSimulation}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>חזרה להתחלה</span>
              </button>
            </div>
          </div>

          {/* Command Queue & Challenges Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Command Palette */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">רשימת הפקודות לרובוט</h3>
                <button
                  type="button"
                  onClick={clearCommands}
                  disabled={isRunning || commands.length === 0}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-red-400 transition-colors disabled:opacity-40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>מחיקת הכל</span>
                </button>
              </div>

              {/* Action Buttons to Add to Queue */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => addCommand('FORWARD')}
                  disabled={isRunning}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                  <span>צעד קדימה</span>
                </button>
                <button
                  type="button"
                  onClick={() => addCommand('TURN_LEFT')}
                  disabled={isRunning}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <CornerUpLeft className="w-3.5 h-3.5" />
                  <span>פנייה שמאלה</span>
                </button>
                <button
                  type="button"
                  onClick={() => addCommand('TURN_RIGHT')}
                  disabled={isRunning}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <CornerUpRight className="w-3.5 h-3.5" />
                  <span>פנייה ימינה</span>
                </button>
                <button
                  type="button"
                  onClick={() => addCommand('PICK_KEY')}
                  disabled={isRunning}
                  className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>איסוף מפתח</span>
                </button>
                <button
                  type="button"
                  onClick={() => addCommand('UNLOCK_GATE')}
                  disabled={isRunning}
                  className="col-span-2 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>פתיחת שער נעול</span>
                </button>
              </div>

              {/* Command Queue Visual List */}
              <div className="bg-slate-950 rounded-lg p-3 border border-slate-800 min-h-[140px] max-h-[190px] overflow-y-auto space-y-1.5">
                {commands.length === 0 ? (
                  <div className="text-xs text-slate-500 text-center py-8">
                    רשימת הפקודות ריקה. לחצו על הכפתורים למעלה כדי לתת הוראות לרובוט.
                  </div>
                ) : (
                  commands.map((cmd, i) => {
                    const isExecuting = executingIndex === i;
                    let label = 'צעד קדימה';
                    if (cmd === 'TURN_LEFT') label = 'פנייה שמאלה';
                    if (cmd === 'TURN_RIGHT') label = 'פנייה ימינה';
                    if (cmd === 'PICK_KEY') label = 'איסוף מפתח';
                    if (cmd === 'UNLOCK_GATE') label = 'פתיחת שער';

                    return (
                      <div
                        key={i}
                        className={`flex items-center justify-between px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          isExecuting 
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-300 border border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-slate-500">#{i + 1}</span>
                          <span>{label}</span>
                        </div>
                        {!isRunning && (
                          <button
                            type="button"
                            onClick={() => removeCommand(i)}
                            className="text-slate-500 hover:text-red-400 transition-colors text-[10px]"
                          >
                            מחיקה
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Challenges List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">אתגרי למידה</h3>
              </div>

              <div className="space-y-3">
                {labData.challenges.map((challenge) => {
                  const isDone = !!completedChallenges[challenge.id];
                  return (
                    <div
                      key={challenge.id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        isDone
                          ? 'bg-slate-950 border-emerald-900/60 text-slate-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            isDone ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {isDone ? <Check className="w-3 h-3" /> : '•'}
                          </div>
                          <div>
                            <h4 className={`text-xs font-semibold ${isDone ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {challenge.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {challenge.instructions}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800 shrink-0">
                          +{challenge.rewardStars} כוכב
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    )}
  </div>
);
}
