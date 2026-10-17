import React, { useState, useMemo } from 'react';
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
  Trash2,
  Flag,
  Compass,
  FastForward,
  Check,
  AlertTriangle,
  Sparkles,
  Terminal
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import LudicLabShell from './LudicLabShell.jsx';

const DIRECTIONS = ['north', 'east', 'south', 'west'];

const DIR_ARROWS = {
  north: '↑',
  east: '→',
  south: '↓',
  west: '←'
};

const CMD_META = {
  FORWARD: {
    shortLabel: 'קדימה ⬆️',
    btnLabel: 'צעד קדימה ⬆️',
    code: 'moveForward()',
    color: 'from-blue-500 to-indigo-600 border-blue-300 text-white'
  },
  TURN_LEFT: {
    shortLabel: 'שמאלה ↩️',
    btnLabel: 'פנייה שמאלה ↩️',
    code: 'turnLeft()',
    color: 'from-violet-500 to-purple-600 border-violet-300 text-white'
  },
  LEFT: {
    shortLabel: 'שמאלה ↩️',
    btnLabel: 'פנייה שמאלה ↩️',
    code: 'turnLeft()',
    color: 'from-violet-500 to-purple-600 border-violet-300 text-white'
  },
  TURN_RIGHT: {
    shortLabel: 'ימינה ↪️',
    btnLabel: 'פנייה ימינה ↪️',
    code: 'turnRight()',
    color: 'from-fuchsia-500 to-pink-600 border-fuchsia-300 text-white'
  },
  RIGHT: {
    shortLabel: 'ימינה ↪️',
    btnLabel: 'פנייה ימינה ↪️',
    code: 'turnRight()',
    color: 'from-fuchsia-500 to-pink-600 border-fuchsia-300 text-white'
  },
  PICK_KEY: {
    shortLabel: 'איסוף מפתח 🔑',
    btnLabel: 'איסוף מפתח 🔑',
    code: 'pickKey()',
    color: 'from-amber-400 to-amber-500 border-amber-200 text-slate-950'
  },
  UNLOCK_GATE: {
    shortLabel: 'פתיחת שער 🔓',
    btnLabel: 'פתיחת שער 🔓',
    code: 'unlockGate()',
    color: 'from-emerald-500 to-teal-600 border-emerald-300 text-white'
  }
};

export default function MatificLab2Robot({
  labData,
  board,
  gridSize = 6,
  robotPos,
  hasKey,
  isGateUnlocked,
  status,
  statusMessage,
  commands = [],
  executingIndex = -1,
  isRunning = false,
  addCommand,
  removeCommand,
  clearCommands,
  runAlgorithm,
  runSingleStep,
  resetSimulation,
  completedChallenges = {}
}) {
  const [showXRay, setShowXRay] = useState(true);
  const [hoveredTile, setHoveredTile] = useState(null);

  const isWall = (x, y) => {
    return board.walls.some(w => w.x === x && w.y === y);
  };

  // Pre-calculate planned path from commands for the X-Ray Code Lens overlay
  const plannedTrace = useMemo(() => {
    const map = {};
    if (!board?.start) return map;

    let simX = board.start.x;
    let simY = board.start.y;
    let simDir = board.start.dir;
    let simKey = false;
    let simGate = false;

    commands.forEach((cmd, idx) => {
      const stepNum = idx + 1;
      if (cmd === 'FORWARD') {
        let nx = simX;
        let ny = simY;
        if (simDir === 'north') ny -= 1;
        else if (simDir === 'south') ny += 1;
        else if (simDir === 'east') nx += 1;
        else if (simDir === 'west') nx -= 1;

        const inBounds = nx >= 0 && nx < gridSize && ny >= 0 && ny < gridSize;
        const hitWall = inBounds && board.walls.some(w => w.x === nx && w.y === ny);
        const hitLockedGate = inBounds && nx === board.gate.x && ny === board.gate.y && !simGate;

        if (inBounds && !hitWall && !hitLockedGate) {
          simX = nx;
          simY = ny;
        }
      } else if (cmd === 'TURN_LEFT' || cmd === 'LEFT') {
        const curIdx = DIRECTIONS.indexOf(simDir);
        simDir = DIRECTIONS[(curIdx + 3) % 4];
      } else if (cmd === 'TURN_RIGHT' || cmd === 'RIGHT') {
        const curIdx = DIRECTIONS.indexOf(simDir);
        simDir = DIRECTIONS[(curIdx + 1) % 4];
      } else if (cmd === 'PICK_KEY') {
        if (simX === board.key.x && simY === board.key.y) {
          simKey = true;
        }
      } else if (cmd === 'UNLOCK_GATE') {
        const nearGate = Math.abs(simX - board.gate.x) + Math.abs(simY - board.gate.y) <= 1;
        if (simKey && nearGate) {
          simGate = true;
        }
      }

      const cellKey = `${simX},${simY}`;
      if (!map[cellKey]) {
        map[cellKey] = [];
      }
      map[cellKey].push({
        step: stepNum,
        dir: simDir,
        cmd
      });
    });

    return map;
  }, [commands, board, gridSize]);

  // Determine robot mood & telemetry status for LudicLabShell
  const robotMood =
    status === 'success'
      ? 'celebrating'
      : status === 'collision' || status === 'error'
      ? 'error'
      : isRunning
      ? 'thinking'
      : 'happy';

  const stationStatus =
    status === 'running'
      ? 'מריץ אלגוריתם חי על הירח! 🚀'
      : status === 'success'
      ? 'היעד נכבש בהצלחה! 🏁'
      : status === 'collision' || status === 'error'
      ? 'זוהתה התנגשות / באג בתוכנית! ⚠️'
      : `מוכן לניווט (${commands.length} פקודות בזיכרון)`;

  const stars = [
    {
      id: 'lab2_challenge1',
      done: !!completedChallenges['lab2_challenge1'],
      label: 'כוכב 1: איסוף מפתח הקריסטל'
    },
    {
      id: 'lab2_challenge2',
      done: !!completedChallenges['lab2_challenge2'],
      label: 'כוכב 2: פתיחת שער הלייזר'
    },
    {
      id: 'lab2_challenge3',
      done: !!completedChallenges['lab2_challenge3'],
      label: 'כוכב 3: הגעה למשואת היעד'
    }
  ];

  // Directional rotation for the rover and headlight cone
  const getDirRotationClass = (dir) => {
    switch (dir) {
      case 'north':
        return 'rotate-0';
      case 'east':
        return 'rotate-90';
      case 'south':
        return 'rotate-180';
      case 'west':
        return '-rotate-90';
      default:
        return 'rotate-0';
    }
  };

  return (
    <LudicLabShell
      stationBadge="תחנת הניווט הירחית"
      stationStatus={stationStatus}
      stationMessage={statusMessage}
      StationIcon={Compass}
      isBeamActive={isRunning || status === 'success'}
      robotMood={robotMood}
      stars={stars}
      theoryTitle="איך רובוט מבצע אלגוריתם?"
      theoryText="רובוט לא יודע 'ללכת לדגל' בעצמו. הוא זקוק לאלגוריתם – סדרת הוראות מדויקת, צעד אחר צעד. כל פקודה משנה את המיקום (X,Y) או את כיוון הפנים של זֶן על פני הירח!"
      chassisTitle="משטח הירח של זֶן • תכנות צעדים אלגוריתמי"
      ChassisIcon={Bot}
      showXRay={showXRay}
      onToggleXRay={setShowXRay}
      xRayLabel="עדשת קואורדינטות [XY]"
    >
      <div className="space-y-5">
        {/* Top Telemetry Strip: Position, Direction, Key & Laser Gate Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-white/10">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-indigo-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              <span>מיקום הרובוט:</span>
              <code className="font-mono text-amber-300 bg-indigo-950/90 px-2 py-0.5 rounded-lg border border-indigo-400/30">
                X:{robotPos.x}, Y:{robotPos.y}
              </code>
            </span>
            <span className="text-xs font-bold text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/10">
              כיוון פנים: <strong className="text-amber-300">{DIR_ARROWS[robotPos.dir]}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-xl border transition-colors ${
                hasKey
                  ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                  : 'bg-slate-900/90 border-slate-700 text-slate-400'
              }`}
            >
              <span>🔑</span>
              <span>{hasKey ? 'מפתח בידי זֶן!' : 'מפתח טרם נאסף'}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-xl border transition-colors ${
                isGateUnlocked
                  ? 'bg-emerald-400 text-slate-950 border-white shadow-[0_0_15px_rgba(52,211,153,0.6)]'
                  : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}
            >
              <span>{isGateUnlocked ? '🔓' : '🔒'}</span>
              <span>{isGateUnlocked ? 'שער לייזר פתוח' : 'שער לייזר נעול'}</span>
            </div>
          </div>
        </div>

        {/* Main Workspace: 6x6 Lunar Board + Tactile Controller Pad */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* 6x6 Lunar Surface Board */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="relative p-3 sm:p-4 bg-slate-950/95 rounded-3xl border-3 border-indigo-500/40 shadow-[inset_0_0_30px_rgba(15,23,42,0.9)]">
              <div
                className="grid grid-cols-6 gap-2 sm:gap-2.5 w-[280px] h-[280px] sm:w-[360px] sm:h-[360px] select-none"
                style={{ touchAction: 'none' }}
                role="grid"
                aria-label="משטח הירח של זן 6 על 6"
              >
                {Array.from({ length: gridSize }).map((_, rIdx) =>
                  Array.from({ length: gridSize }).map((_, cIdx) => {
                    const isRobot = robotPos.x === cIdx && robotPos.y === rIdx;
                    const wall = isWall(cIdx, rIdx);
                    const isKeyCell = board.key.x === cIdx && board.key.y === rIdx && !hasKey;
                    const isGateCell = board.gate.x === cIdx && board.gate.y === rIdx;
                    const isGoalCell = board.goal.x === cIdx && board.goal.y === rIdx;
                    const cellKey = `${cIdx},${rIdx}`;
                    const plannedVisits = plannedTrace[cellKey] || [];
                    const latestVisit = plannedVisits[plannedVisits.length - 1];

                    let tileClasses =
                      'bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border-2 border-slate-700/80 hover:border-indigo-400/70';

                    if (wall) {
                      tileClasses =
                        'bg-gradient-to-br from-indigo-900/90 via-purple-950 to-slate-950 border-2 border-indigo-400/60 shadow-[inset_0_0_12px_rgba(129,140,248,0.45)]';
                    } else if (isRobot) {
                      tileClasses =
                        'bg-gradient-to-br from-amber-500/30 via-blue-900/70 to-indigo-950 border-2 border-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.5)]';
                    } else if (isGoalCell) {
                      tileClasses =
                        'bg-gradient-to-br from-emerald-950/80 via-slate-900 to-teal-950 border-2 border-emerald-400/70 shadow-[0_0_15px_rgba(52,211,153,0.3)]';
                    } else if (isKeyCell) {
                      tileClasses =
                        'bg-gradient-to-br from-amber-950/70 via-slate-900 to-amber-900/40 border-2 border-amber-400/70 shadow-[0_0_15px_rgba(251,191,36,0.3)]';
                    } else if (isGateCell) {
                      tileClasses = isGateUnlocked
                        ? 'bg-gradient-to-br from-emerald-950/60 to-slate-900 border-2 border-emerald-400/60'
                        : 'bg-gradient-to-br from-rose-950/80 via-slate-900 to-rose-900/40 border-2 border-rose-500/70 shadow-[0_0_14px_rgba(244,63,94,0.35)]';
                    } else if (showXRay && latestVisit) {
                      tileClasses =
                        'bg-gradient-to-br from-indigo-950/90 to-slate-900 border-2 border-amber-400/50';
                    }

                    return (
                      <div
                        key={cellKey}
                        onClick={() => AudioEngine.playTone(240 + (cIdx + rIdx) * 30, 'sine', 0.05)}
                        className={`relative rounded-2xl flex items-center justify-center transition-colors duration-150 overflow-hidden cursor-pointer ${tileClasses}`}
                      >
                        {/* Lunar Crater Texture Dots */}
                        {!wall && !isRobot && (
                          <div className="w-1.5 h-1.5 rounded-full bg-white/5 pointer-events-none" />
                        )}

                        {/* X-Ray Coordinate Badge (x,y) */}
                        {showXRay && (
                          <span className="absolute bottom-0.5 right-1 text-[9px] sm:text-[10px] font-mono font-bold text-indigo-300/80 select-none pointer-events-none z-10">
                            ({cIdx},{rIdx})
                          </span>
                        )}

                        {/* X-Ray Planned Step Badge (#1, #2 + Arrow) */}
                        {showXRay && latestVisit && !isRobot && (
                          <div className="absolute top-0.5 left-1 flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-400/90 text-slate-950 font-mono font-black text-[9px] sm:text-[10px] shadow-xs z-20 pointer-events-none">
                            <span>#{latestVisit.step}</span>
                            <span>{DIR_ARROWS[latestVisit.dir]}</span>
                          </div>
                        )}

                        {/* Glowing Crystalline Moon Rock (Wall) */}
                        {wall && (
                          <div className="flex flex-col items-center justify-center select-none pointer-events-none">
                            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-400 to-cyan-300 rotate-12 border border-white/60 shadow-[0_0_12px_rgba(165,180,252,0.7)] flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-sm bg-white/70 -rotate-12" />
                            </div>
                          </div>
                        )}

                        {/* Glowing Golden Key 🔑 */}
                        {isKeyCell && !isRobot && (
                          <div className="flex flex-col items-center justify-center select-none pointer-events-none">
                            <span className="text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(251,191,36,0.9)]">
                              🔑
                            </span>
                          </div>
                        )}

                        {/* Magnetic Laser Barrier 🔒 / 🔓 */}
                        {isGateCell && !isRobot && (
                          <div className="flex flex-col items-center justify-center select-none pointer-events-none">
                            {!isGateUnlocked && (
                              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 bg-rose-500/80 shadow-[0_0_10px_#f43f5e]" />
                            )}
                            <span className="relative z-10 text-xl sm:text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.6)]">
                              {isGateUnlocked ? '🔓' : '🔒'}
                            </span>
                          </div>
                        )}

                        {/* Space Beacon / Goal Flag 🏁 */}
                        {isGoalCell && !isRobot && (
                          <div className="flex flex-col items-center justify-center select-none pointer-events-none">
                            <span className="text-xl sm:text-2xl drop-shadow-[0_0_12px_rgba(52,211,153,0.95)]">
                              🏁
                            </span>
                          </div>
                        )}

                        {/* Living Rover Avatar with Directional Visor & Glowing Headlight Cone */}
                        {isRobot && (
                          <div className="relative w-full h-full flex items-center justify-center z-20">
                            {/* Rotating Assembly pointing in robotPos.dir */}
                            <div
                              className={`relative w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center transition-transform duration-200 ${getDirRotationClass(
                                robotPos.dir
                              )}`}
                            >
                              {/* Glowing Headlight Cone pointing North relative to rotated chassis */}
                              <div
                                className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-6 bg-gradient-to-t from-amber-300/80 via-amber-200/40 to-transparent pointer-events-none blur-[1px]"
                                style={{
                                  clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 0% 100%)'
                                }}
                              />

                              {/* Rover Metallic Chassis */}
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-b from-blue-400 via-indigo-600 to-slate-900 border-2 border-amber-300 shadow-[0_0_16px_rgba(59,130,246,0.9)] flex flex-col items-center justify-between p-1">
                                {/* Front Directional Visor Bar (North edge of rover) */}
                                <div className="w-6 h-2 rounded-full bg-cyan-300 shadow-[0_0_8px_#67e8f9] border border-white" />
                                <Bot className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow" />
                              </div>
                            </div>

                            {/* Floating Key Badge when hasKey is true */}
                            {hasKey && (
                              <span
                                className="absolute -top-1 -left-1 text-xs sm:text-sm bg-amber-400 text-slate-950 rounded-full w-5 h-5 flex items-center justify-center border border-white shadow-md z-30"
                                title="המפתח בידי זֶן!"
                              >
                                🔑
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Tactile Action Controls (Fixed geometry - zero border-b-4 click shift!) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4 bg-slate-950/75 p-4 sm:p-5 rounded-3xl border-2 border-white/10 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
              <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>לוח בקרה • הוספת פקודה לרובוט</span>
              </span>
              <span className="text-[11px] font-mono text-indigo-300">
                {commands.length} פקודות
              </span>
            </div>

            {/* Big Physical-Feeling Movement & Interaction Buttons */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => addCommand('FORWARD')}
                disabled={isRunning}
                className="col-span-2 h-12 flex items-center justify-center gap-2 px-4 rounded-2xl font-black text-sm bg-gradient-to-b from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white border-2 border-blue-300/60 transition-colors cursor-pointer shadow-lg disabled:opacity-50"
              >
                <span>צעד קדימה ⬆️</span>
                {showXRay && (
                  <code className="text-[10px] font-mono bg-black/30 px-1.5 py-0.5 rounded text-blue-100">
                    FORWARD
                  </code>
                )}
              </button>

              <button
                type="button"
                onClick={() => addCommand('TURN_RIGHT')}
                disabled={isRunning}
                className="h-11 flex items-center justify-center gap-1.5 px-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-b from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white border-2 border-fuchsia-300/60 transition-colors cursor-pointer shadow-lg disabled:opacity-50"
              >
                <span>פנייה ימינה ↪️</span>
              </button>

              <button
                type="button"
                onClick={() => addCommand('TURN_LEFT')}
                disabled={isRunning}
                className="h-11 flex items-center justify-center gap-1.5 px-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-b from-violet-500 to-purple-600 hover:from-violet-400 hover:to-purple-500 text-white border-2 border-violet-300/60 transition-colors cursor-pointer shadow-lg disabled:opacity-50"
              >
                <span>פנייה שמאלה ↩️</span>
              </button>

              <button
                type="button"
                onClick={() => addCommand('PICK_KEY')}
                disabled={isRunning}
                className="h-11 flex items-center justify-center gap-1.5 px-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-b from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 border-2 border-amber-200 transition-colors cursor-pointer shadow-lg disabled:opacity-50"
              >
                <span>איסוף מפתח 🔑</span>
              </button>

              <button
                type="button"
                onClick={() => addCommand('UNLOCK_GATE')}
                disabled={isRunning}
                className="h-11 flex items-center justify-center gap-1.5 px-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-b from-teal-400 to-emerald-600 hover:from-teal-300 hover:to-emerald-500 text-slate-950 border-2 border-emerald-200 transition-colors cursor-pointer shadow-lg disabled:opacity-50"
              >
                <span>פתיחת שער 🔓</span>
              </button>
            </div>

            {/* Execution Controls: Run, Single Step, Reset, Clear */}
            <div className="pt-3 border-t border-white/10 space-y-2.5">
              <button
                type="button"
                onClick={runAlgorithm}
                disabled={isRunning || commands.length === 0}
                className="w-full h-12 flex items-center justify-center gap-2 px-5 rounded-2xl font-black text-base bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 hover:from-emerald-300 hover:to-teal-400 text-slate-950 border-2 border-white/80 transition-colors cursor-pointer shadow-[0_0_20px_rgba(52,211,153,0.4)] disabled:opacity-40 disabled:pointer-events-none"
              >
                <span>הפעל רובוט ▶️</span>
                <span className="text-xs font-mono bg-slate-950/20 px-2 py-0.5 rounded-lg">
                  ({commands.length} צעדים)
                </span>
              </button>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {runSingleStep && (
                  <button
                    type="button"
                    onClick={runSingleStep}
                    disabled={isRunning || commands.length === 0}
                    className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-400/40 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                    title="הרצת פקודה אחת בכל לחיצה"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>צעד בודד</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={resetSimulation}
                  className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-bold transition-colors cursor-pointer"
                >
                  <span>איפוס מסלול 🔄</span>
                </button>

                <button
                  type="button"
                  onClick={clearCommands}
                  disabled={isRunning || commands.length === 0}
                  className="flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/35 text-rose-200 border border-rose-400/40 text-xs font-bold transition-colors cursor-pointer disabled:opacity-40"
                >
                  <span>ניקוי פקודות 🗑️</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Live Command Ribbon: סרט הפקודות החי של זֶן (Locked min-h so adding commands doesn't shift page) */}
        <div className="w-full p-4 bg-slate-950/90 rounded-2xl border-2 border-indigo-500/30 space-y-3 shadow-inner">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-indigo-200">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>סרט הפקודות החי של זֶן (Algorithmic Memory Tape):</span>
            </div>
            <span className="text-[11px] text-slate-400">
              💡 לחצו על כל מחסנית פקודה בסרט כדי להסיר אותה מהתוכנית
            </span>
          </div>

          <div className="min-h-[56px] flex items-center p-2.5 bg-black/50 rounded-xl border border-white/10">
            {commands.length === 0 ? (
              <div className="w-full text-center text-xs sm:text-sm text-slate-400">
                סרט הזיכרון ריק כרגע. לחצו על כפתורי הבקרה (⬆️ ↩️ ↪️ 🔑 🔓) כדי להרכיב את האלגוריתם של זֶן!
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {commands.map((cmd, idx) => {
                  const isExecuting = executingIndex === idx;
                  const meta = CMD_META[cmd] || {
                    shortLabel: cmd,
                    code: cmd,
                    color: 'from-slate-700 to-slate-800 border-slate-500 text-white'
                  };

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isRunning}
                      onClick={() => removeCommand(idx)}
                      title="לחצו להסרת פקודה זו"
                      className={`group relative h-9 flex items-center gap-1.5 px-3 rounded-xl border-2 text-xs font-black transition-colors cursor-pointer ${
                        isExecuting
                          ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_20px_rgba(251,191,36,0.95)] z-10'
                          : `bg-gradient-to-b ${meta.color} shadow-md`
                      }`}
                    >
                      <span
                        className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                          isExecuting ? 'bg-slate-950 text-amber-300' : 'bg-black/30 text-white/90'
                        }`}
                      >
                        {idx + 1}.
                      </span>
                      <span>{meta.shortLabel}</span>
                      {showXRay && (
                        <code
                          className={`text-[10px] font-mono ${
                            isExecuting ? 'text-slate-900' : 'opacity-80'
                          }`}
                        >
                          [{meta.code}]
                        </code>
                      )}
                      {!isRunning && (
                        <span className="text-[10px] bg-black/30 group-hover:bg-rose-600 text-white rounded px-1 transition-colors">
                          ✕
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </LudicLabShell>
  );
}
