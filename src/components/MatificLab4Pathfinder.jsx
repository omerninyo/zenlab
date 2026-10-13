import React, { useState, useMemo } from 'react';
import {
  Compass,
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Zap,
  Check,
  Award,
  Radio,
  Cpu,
  Blocks
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import LudicLabShell from './LudicLabShell.jsx';

export default function MatificLab4Pathfinder({
  grid,
  start,
  goal,
  algorithm,
  onSelectAlgorithm,
  isPlaying,
  currentStepIndex,
  solution,
  visibleVisitedSet,
  isPathVisible,
  pathSet,
  lastAstarCount,
  lastBfsCount,
  onToggleWall,
  onPlay,
  onPause,
  onInstantReveal,
  onClear,
  onLoadPresetWall,
  completedChallenges = {},
  labData
}) {
  const [showXRay, setShowXRay] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPaintValue, setDragPaintValue] = useState(1); // 1 = paint wall, 0 = erase wall
  const [hoveredCell, setHoveredCell] = useState(null);

  const isCh1Done = !!completedChallenges['lab4_challenge1'];
  const isCh2Done = !!completedChallenges['lab4_challenge2'];
  const isCh3Done = !!completedChallenges['lab4_challenge3'];

  const wallCount = useMemo(() => grid.filter(c => c === 1).length, [grid]);

  // Map each visited cell coordinate "x,y" to its 1-based discovery order (#1, #2, ...)
  const discoveryOrderMap = useMemo(() => {
    const map = new Map();
    if (solution?.visitedOrder) {
      solution.visitedOrder.forEach((pt, idx) => {
        if (idx < currentStepIndex) {
          map.set(`${pt.x},${pt.y}`, idx + 1);
        }
      });
    }
    return map;
  }, [solution, currentStepIndex]);

  // Map each path cell coordinate "x,y" to its index in the optimal path
  const pathIndexMap = useMemo(() => {
    const map = new Map();
    if (solution?.path) {
      solution.path.forEach((pt, idx) => {
        map.set(`${pt.x},${pt.y}`, idx);
      });
    }
    return map;
  }, [solution]);

  // Dynamic robot mood & telemetry status
  const robotMood = useMemo(() => {
    if (!solution.found) return 'error';
    if (isPathVisible && solution.found) return 'celebrating';
    if (isPlaying) return 'thinking';
    return 'happy';
  }, [solution.found, isPathVisible, isPlaying]);

  const stationStatus = useMemo(() => {
    if (!solution.found) return 'מסלול חסום באסטרואידים! ⚠️';
    if (isPathVisible) return 'היעד ננעל! נתיב לייזר זהוב פעיל 🚀🪐';
    if (isPlaying) return 'סורק גלי מכ״ם בחלל... 📡';
    return algorithm === 'astar' ? 'מצפן חכם A* מוכן לשיגור 🧭' : 'סורק גלים BFS מוכן לשיגור 🌊';
  }, [solution.found, isPathVisible, isPlaying, algorithm]);

  const stationMessage = useMemo(() => {
    if (!solution.found) {
      return 'אוי! קיר האסטרואידים חוסם לגמרי את המעבר לכוכב היעד. לחצו על אסטרואיד כדי לפנות מעבר!';
    }
    if (!isCh1Done) {
      return 'משימה 1: בחרו ב״מצפן חכם A*״ ולחצו על ״הפעל סריקת מכ״ם ▶️״ כדי לנווט מהחללית 🚀 לכוכב הלכת 🪐!';
    }
    if (!isCh2Done) {
      return `משימה 2: בנו מבוך מאתגר עם לפחות 4 אסטרואידים (כרגע: ${wallCount}) או לחצו ״בנה מבוך קסם 🧱״ והפעילו סריקה!`;
    }
    if (!isCh3Done) {
      return 'משימה 3: השוו בין ״מצפן חכם A*״ לבין ״סורק גלים BFS״ על אותו מבוך וגלו מי בודק פחות משבצות!';
    }
    return 'כל 3 כוכבי הניווט הושגו! נסו לצייר מבוכים חדשים ולראות בעדשת העלויות כיצד A* חוסך אנרגיה.';
  }, [solution.found, isCh1Done, isCh2Done, isCh3Done, wallCount]);

  const starsList = useMemo(() => [
    { id: 'lab4_challenge1', done: isCh1Done, label: 'ניווט ראשון עם מצפן חכם A*' },
    { id: 'lab4_challenge2', done: isCh2Done, label: 'עקיפת מכשולי אסטרואידים' },
    { id: 'lab4_challenge3', done: isCh3Done, label: 'הוכחת יעילות: A* מול BFS' }
  ], [isCh1Done, isCh2Done, isCh3Done]);

  const handleCellPointerDown = (x, y) => {
    if ((x === start.x && y === start.y) || (x === goal.x && y === goal.y)) return;
    const idx = y * 8 + x;
    const currentVal = grid[idx];
    const targetVal = currentVal === 1 ? 0 : 1;
    setIsDragging(true);
    setDragPaintValue(targetVal);
    onToggleWall(x, y, targetVal);
  };

  const handleCellPointerEnter = (x, y) => {
    setHoveredCell({ x, y });
    if (!isDragging) return;
    if ((x === start.x && y === start.y) || (x === goal.x && y === goal.y)) return;
    const idx = y * 8 + x;
    if (grid[idx] !== dragPaintValue) {
      onToggleWall(x, y, dragPaintValue);
    }
  };

  // Efficiency calculation
  const exploredSoFar = Math.min(currentStepIndex, solution.totalExplored);
  const astarSavedTiles = (lastAstarCount !== null && lastBfsCount !== null && lastBfsCount > lastAstarCount)
    ? (lastBfsCount - lastAstarCount)
    : null;
  const astarSavingsPct = (astarSavedTiles !== null && lastBfsCount > 0)
    ? Math.round((astarSavedTiles / lastBfsCount) * 100)
    : null;

  return (
    <div
      onPointerUp={() => setIsDragging(false)}
      onPointerLeave={() => setIsDragging(false)}
    >
      <LudicLabShell
        stationBadge="תחנת מכ״ם חלל עמוק"
        stationStatus={stationStatus}
        stationMessage={stationMessage}
        StationIcon={Compass}
        isBeamActive={isPlaying || isPathVisible}
        robotMood={robotMood}
        stars={starsList}
        theoryTitle="איך מצפן חכם A* מנצח את סורק הגלים BFS?"
        theoryText="אלגוריתם BFS מתפשט כמו גל במים לכל הכיוונים בעיוורון מוחלט – לכן הוא בודק המון משבצות מיותרות. לעומתו, אלגוריתם A* נעזר ב׳מצפן היוריסטי׳ (h): הוא מחשב בכל משבצת כמה צעדים נותרו בקו אווירי לכוכב היעד, ומעדיף תמיד משבצות שמקרבות אותו למטרה לפי הנוסחה f = g + h!"
        chassisTitle="מכ״ם הניווט החללי של זֶן • חיפוש מסלול A* מול BFS"
        ChassisIcon={Compass}
        showXRay={showXRay}
        onToggleXRay={setShowXRay}
        xRayLabel="עדשת עלויות [f=g+h]"
      >
        {/* Main Toy Area: 8x8 Cosmic Radar Matrix + Telemetry Legend */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
          
          {/* 1. The 8x8 Cosmic Radar Matrix */}
          <div className="relative p-3 sm:p-4 bg-slate-950/95 rounded-3xl border-3 border-indigo-500/40 shadow-[0_0_40px_rgba(30,27,75,0.9)]">
            {/* Subtle Radar Crosshair Overlay */}
            <div className="grid grid-cols-8 gap-1.5 sm:gap-2 w-[276px] h-[276px] sm:w-[360px] sm:h-[360px] select-none" style={{ touchAction: 'none' }}>
              {Array.from({ length: 64 }).map((_, idx) => {
                const x = idx % 8;
                const y = Math.floor(idx / 8);
                const key = `${x},${y}`;
                const isStart = x === start.x && y === start.y;
                const isGoal = x === goal.x && y === goal.y;
                const isWall = grid[idx] === 1;
                const isVisited = visibleVisitedSet.has(key);
                const isInFinalPath = isPathVisible && pathSet.has(key);
                const stepNum = discoveryOrderMap.get(key);
                const hCost = Math.abs(x - goal.x) + Math.abs(y - goal.y);
                const gCost = Math.abs(x - start.x) + Math.abs(y - start.y);
                const fCost = gCost + hCost;
                const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;

                return (
                  <button
                    key={idx}
                    type="button"
                    onPointerDown={() => handleCellPointerDown(x, y)}
                    onPointerEnter={() => handleCellPointerEnter(x, y)}
                    onPointerLeave={() => setHoveredCell(null)}
                    title={
                      isStart
                        ? `חללית שיגור (${x},${y})`
                        : isGoal
                        ? `כוכב היעד (${x},${y})`
                        : isWall
                        ? `אסטרואיד חוסם (${x},${y}) - לחצו להסרה`
                        : `משבצת (${x},${y}) | מרחק מהיעד h=${hCost}`
                    }
                    className={`relative rounded-xl flex flex-col items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none overflow-hidden ${
                      isStart
                        ? 'bg-gradient-to-br from-indigo-500 via-blue-600 to-cyan-500 border-2 border-white shadow-[0_0_18px_rgba(56,189,248,0.9)] scale-105 z-10'
                        : isGoal
                        ? 'bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 border-2 border-white shadow-[0_0_20px_rgba(251,191,36,0.95)] scale-105 z-10'
                        : isWall
                        ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 border-2 border-slate-500/80 shadow-inner scale-95'
                        : isInFinalPath
                        ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-500 border-2 border-white text-slate-950 shadow-[0_0_20px_rgba(251,191,36,0.9)] scale-105 z-10'
                        : isVisited
                        ? algorithm === 'astar'
                          ? 'bg-gradient-to-br from-cyan-600/85 to-indigo-800/90 border-2 border-cyan-300/80 text-white shadow-[0_0_12px_rgba(34,211,238,0.45)]'
                          : 'bg-gradient-to-br from-indigo-700/80 to-blue-900/90 border-2 border-indigo-400/70 text-indigo-100 shadow-[0_0_10px_rgba(99,102,241,0.35)]'
                        : isHovered
                        ? 'bg-slate-800 border-2 border-amber-400/60 scale-95'
                        : 'bg-slate-900/90 hover:bg-slate-800/80 border border-slate-800/90'
                    }`}
                  >
                    {/* Start Spacecraft */}
                    {isStart && (
                      <span className="text-base sm:text-xl drop-shadow animate-pulse select-none" role="img" aria-label="Spacecraft">
                        🚀
                      </span>
                    )}

                    {/* Goal Planet */}
                    {isGoal && (
                      <span className="text-base sm:text-xl drop-shadow animate-bounce select-none" role="img" aria-label="Target Planet">
                        🪐
                      </span>
                    )}

                    {/* Asteroid Wall */}
                    {isWall && !isStart && !isGoal && (
                      <span className="text-xs sm:text-sm select-none opacity-90" role="img" aria-label="Asteroid">
                        ☄️
                      </span>
                    )}

                    {/* Regular / Visited / Path Cell Content */}
                    {!isStart && !isGoal && !isWall && (
                      <>
                        {showXRay ? (
                          <div className="flex flex-col items-center justify-center leading-none select-none">
                            {isVisited && stepNum ? (
                              <>
                                <span className={`text-[9px] sm:text-[10px] font-mono font-black ${
                                  isInFinalPath ? 'text-slate-950' : 'text-amber-300'
                                }`}>
                                  #{stepNum}
                                </span>
                                <span className={`text-[8px] sm:text-[9px] font-mono font-bold mt-0.5 ${
                                  isInFinalPath ? 'text-slate-900' : 'text-cyan-100/90'
                                }`}>
                                  h={hCost}
                                </span>
                              </>
                            ) : (
                              <span className="text-[9px] sm:text-[10px] font-mono text-slate-600 font-semibold">
                                h={hCost}
                              </span>
                            )}
                          </div>
                        ) : (
                          /* Non-XRay visual energy markers */
                          isInFinalPath ? (
                            <span className="text-xs sm:text-sm font-black text-slate-950 select-none">★</span>
                          ) : isVisited ? (
                            <div className="w-2 h-2 rounded-full bg-cyan-300 shadow-[0_0_6px_#67e8f9] animate-pulse" />
                          ) : (
                            <div className="w-1 h-1 rounded-full bg-slate-800" />
                          )
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Hovered Cell X-Ray Telemetry Pill */}
            <div className="mt-2.5 flex items-center justify-between text-[11px] font-mono text-indigo-200 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-indigo-500/30">
              {hoveredCell ? (
                <>
                  <span>
                    משבצת ({hoveredCell.x},{hoveredCell.y})
                  </span>
                  <span className="text-amber-300 font-bold">
                    h = |{hoveredCell.x}-{goal.x}| + |{hoveredCell.y}-{goal.y}| = {Math.abs(hoveredCell.x - goal.x) + Math.abs(hoveredCell.y - goal.y)} צעדים ליעד
                  </span>
                </>
              ) : (
                <>
                  <span>💡 לחצו וגררו על המכ״ם כדי לבנות או להסיר קירות אסטרואידים ☄️</span>
                  <span className="text-amber-300 font-bold hidden sm:inline">אסטרואידים: {wallCount}</span>
                </>
              )}
            </div>
          </div>

          {/* 2. Right Panel: Live Radar Telemetry & 3 Mission Cards */}
          <div className="flex-1 w-full space-y-3.5">
            {/* Live Radar Readout Counters */}
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-slate-950/90 p-3 rounded-2xl border border-indigo-500/30 text-center shadow-inner">
                <span className="text-[11px] text-indigo-200 font-bold block mb-0.5">משבצות שנסרקו</span>
                <span className="text-lg sm:text-xl font-black font-mono text-cyan-300">
                  {exploredSoFar}
                </span>
              </div>
              <div className="bg-slate-950/90 p-3 rounded-2xl border border-indigo-500/30 text-center shadow-inner">
                <span className="text-[11px] text-indigo-200 font-bold block mb-0.5">אורך מסלול זהב</span>
                <span className="text-lg sm:text-xl font-black font-mono text-amber-400">
                  {solution.found ? `${solution.path.length} צעדים` : 'חסום!'}
                </span>
              </div>
              <div className="bg-slate-950/90 p-3 rounded-2xl border border-indigo-500/30 text-center shadow-inner">
                <span className="text-[11px] text-indigo-200 font-bold block mb-0.5">מצפן פעיל</span>
                <span className="text-xs sm:text-sm font-black text-emerald-300 block mt-1">
                  {algorithm === 'astar' ? '🧭 מצפן A*' : '🌊 גלים BFS'}
                </span>
              </div>
            </div>

            {/* X-Ray Formula Explainer Card when X-Ray is on */}
            {showXRay && (
              <div className="p-3 rounded-2xl bg-indigo-950/70 border border-amber-400/40 text-xs space-y-1">
                <div className="flex items-center justify-between font-black text-amber-300">
                  <span>🔍 מקרא עדשת עלויות [f = g + h]:</span>
                  <span className="font-mono text-[11px] bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-300/30">
                    h = מרחק מנהטן
                  </span>
                </div>
                <p className="text-indigo-100 text-[11px] leading-relaxed">
                  <strong>#1, #2...</strong> מציג את סדר הבדיקה של המשבצות. <strong>h</strong> הוא מרחק הקו האווירי לכוכב היעד 🪐. שימו לב איך <strong>A*</strong> בוחר משבצות עם <strong>h</strong> הולך וקטן, בעוד <strong>BFS</strong> מתפזר לכל הכיוונים!
                </p>
              </div>
            )}

            {/* 3 Interactive Challenges Checklist */}
            <div className="bg-slate-950/80 rounded-2xl border border-white/10 p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-black text-amber-300 pb-1.5 border-b border-white/10">
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>משימות המכ״ם של זֶן:</span>
                </span>
                <span className="font-mono text-amber-200">
                  {[isCh1Done, isCh2Done, isCh3Done].filter(Boolean).length}/3 כוכבים ⭐
                </span>
              </div>
              <div className="space-y-1.5">
                {(labData?.challenges || []).map((ch) => {
                  const isDone = !!completedChallenges[ch.id];
                  return (
                    <div
                      key={ch.id}
                      className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
                        isDone
                          ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                          : 'bg-slate-900/80 border-white/10 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm shrink-0">{isDone ? '⭐' : '🔒'}</span>
                        <div className="min-w-0">
                          <div className="font-black text-white truncate">{ch.title}</div>
                          <div className="text-[11px] text-slate-400 leading-snug">{ch.description}</div>
                        </div>
                      </div>
                      {isDone && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black shrink-0">
                          הושלם ✓
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

        {/* 3. Live Efficiency Comparison Ribbon (סרט השוואת יעילות האלגוריתמים) */}
        <div className="w-full mt-5 p-4 bg-slate-950/90 rounded-2xl border-2 border-indigo-500/30 space-y-3 shadow-inner">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-300">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>סרט השוואת יעילות האלגוריתמים (כמה משבצות נבדקו עד ליעד?):</span>
            </div>
            {astarSavedTiles !== null ? (
              <span className="text-xs font-black px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 animate-pulse">
                🏆 מצפן חכם A* חסך {astarSavedTiles} משבצות ({astarSavingsPct}% פחות אנרגיה!)
              </span>
            ) : (
              <span className="text-[11px] text-indigo-200 font-bold">
                💡 הריצו גם A* וגם BFS כדי להשוות ביניהם ראש בראש!
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Smart Compass A* Bar */}
            <div className={`p-3 rounded-xl border transition-all ${
              algorithm === 'astar'
                ? 'bg-cyan-950/50 border-cyan-400/60 shadow-md'
                : 'bg-slate-900/70 border-white/10'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-black text-cyan-300 flex items-center gap-1.5">
                  <span>🧭 מצפן חכם A*</span>
                  {algorithm === 'astar' && <span className="text-[10px] px-1.5 py-0.2 bg-cyan-500/30 rounded text-white">פעיל</span>}
                </span>
                <span className="font-mono font-black text-white">
                  {lastAstarCount !== null ? `${lastAstarCount} משבצות מתוך 64` : 'טרם נמדד'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${lastAstarCount !== null ? Math.max(8, Math.round((lastAstarCount / 64) * 100)) : 0}%` }}
                />
              </div>
            </div>

            {/* Wave Scanner BFS Bar */}
            <div className={`p-3 rounded-xl border transition-all ${
              algorithm === 'bfs'
                ? 'bg-indigo-950/60 border-indigo-400/60 shadow-md'
                : 'bg-slate-900/70 border-white/10'
            }`}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-black text-indigo-300 flex items-center gap-1.5">
                  <span>🌊 סורק גלים BFS</span>
                  {algorithm === 'bfs' && <span className="text-[10px] px-1.5 py-0.2 bg-indigo-500/30 rounded text-white">פעיל</span>}
                </span>
                <span className="font-mono font-black text-white">
                  {lastBfsCount !== null ? `${lastBfsCount} משבצות מתוך 64` : 'טרם נמדד'}
                </span>
              </div>
              <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${lastBfsCount !== null ? Math.max(8, Math.round((lastBfsCount / 64) * 100)) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Tactile Action Toolbar */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/10">
          
          {/* Algorithm Switcher Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onSelectAlgorithm('astar')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md border-2 ${
                algorithm === 'astar'
                  ? 'bg-amber-400 text-slate-950 border-white shadow-amber-400/30 scale-105'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
              }`}
            >
              <span>🧭 מצפן חכם A*</span>
            </button>

            <button
              type="button"
              onClick={() => onSelectAlgorithm('bfs')}
              className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md border-2 ${
                algorithm === 'bfs'
                  ? 'bg-indigo-500 text-white border-white shadow-indigo-500/30 scale-105'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/20'
              }`}
            >
              <span>🌊 סורק גלים BFS</span>
            </button>
          </div>

          {/* Radar Play / Magic Maze / Reset Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            {isPlaying ? (
              <button
                type="button"
                onClick={onPause}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 border-2 border-white font-black text-xs transition-all cursor-pointer active:scale-95 shadow-lg"
              >
                <Pause className="w-4 h-4 fill-slate-950" />
                <span>השהה סריקה ⏸️</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onPlay}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-emerald-400 hover:bg-emerald-300 text-slate-950 border-2 border-white font-black text-xs transition-all cursor-pointer active:scale-95 shadow-[0_0_20px_rgba(52,211,153,0.5)]"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>הפעל סריקת מכ״ם ▶️</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLoadPresetWall}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-400/50 font-black text-xs transition-all cursor-pointer active:scale-95 shadow-md"
            >
              <span>בנה מבוך קסם 🧱</span>
            </button>

            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 font-bold text-xs transition-all cursor-pointer active:scale-95 shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ניקוי מכ״ם 🔄</span>
            </button>
          </div>

        </div>
      </LudicLabShell>
    </div>
  );
}
