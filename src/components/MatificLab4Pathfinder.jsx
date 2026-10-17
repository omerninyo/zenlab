import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Compass,
  Zap,
  Sparkles,
  Navigation,
  ShieldAlert,
  Award,
  Layers
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import LudicLabShell from './LudicLabShell.jsx';
import {
  BespokeSpacecraft,
  BespokeRingedPlanet,
  BespokeAsteroid
} from './BespokeIllustrations.jsx';

/**
 * MatificLab4Pathfinder (Next-Gen 60fps Canvas & Vector Spatial Navigation Engine — v0.9.5)
 *
 * Tactile 2.5D + 60fps HTML5 Canvas Spatial Navigation Simulator for Lab 4 (Search & Pathfinding).
 * - Preserves full prop contract with `Lab4_Pathfinder.jsx` (`grid`, `start`, `goal`, `algorithm`, `solution`, etc.).
 * - Replaces all generic OS emojis with Bespoke Geometric Vector Illustrations (<BespokeSpacecraft />,
 *   <BespokeRingedPlanet />, <BespokeAsteroid />).
 * - Adds a synchronized 60fps HTML5 Canvas Overlay (`radarCanvasRef`) over the 8x8 radar matrix that renders:
 *   1. Glowing golden spline/vector conduit along the optimal path (`solution.path`).
 *   2. Smooth continuous interpolated spacecraft flight along `solution.path` with directional rotation & plasma trail.
 *   3. Live X-Ray Vector Force Lines ($g$ distance vector from Start in Cyan, $h$ Manhattan heuristic vector
 *      to Target Planet in Amber) when hovering any cell!
 * - Preserves strict Zero Layout Shift (CLS = 0) with locked telemetry & equation bars.
 */
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
  const [hoveredIdx, setHoveredIdx] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // 60fps HTML5 Canvas Overlay ref
  const radarCanvasRef = useRef(null);

  useEffect(() => {
    const handleUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchend', handleUp);
    };
  }, []);

  const stars = useMemo(
    () => [
      { id: 'lab4_c1', done: Boolean(completedChallenges['lab4_c1']), label: 'כוכב 1: גלי מכ״ם (BFS)' },
      { id: 'lab4_c2', done: Boolean(completedChallenges['lab4_c2']), label: 'כוכב 2: מצפן חכם (A*)' },
      { id: 'lab4_c3', done: Boolean(completedChallenges['lab4_c3']), label: 'כוכב 3: עקיפת חגורת האסטרואידים' }
    ],
    [completedChallenges]
  );

  const wallCount = useMemo(() => grid.filter((v) => v === 1).length, [grid]);

  // Precompute heuristic h(n) (Manhattan distance to goal) and g(n) (distance from start) for X-Ray lens
  const cellMetrics = useMemo(() => {
    return grid.map((_, idx) => {
      const x = idx % 8;
      const y = Math.floor(idx / 8);
      const h = Math.abs(goal.x - x) + Math.abs(goal.y - y);
      const g = Math.abs(x - start.x) + Math.abs(y - start.y);
      const f = g + h;
      const visitOrder = solution.visitedOrder.indexOf(idx);
      return { x, y, g, h, f, visitOrder };
    });
  }, [grid, start, goal, solution]);

  const robotMood = useMemo(() => {
    if (!solution.found) return 'confused';
    if (isPathVisible && solution.found) return 'excited';
    if (isPlaying) return 'thinking';
    return 'happy';
  }, [solution.found, isPathVisible, isPlaying]);

  const stationMessage = useMemo(() => {
    if (!solution.found) {
      return 'אוי! חגורת האסטרואידים חוסמת לגמרי את הנתיב לכוכב הלכת! לחצו על אסטרואיד כדי לפנות מעבר.';
    }
    if (!completedChallenges['lab4_c1']) {
      return 'משימה 1: בחרו ב-"גלי מכ״ם (BFS)" ולחצו על "שגר גלי ניווט" כדי לראות איך החללית סורקת לכל הכיוונים.';
    }
    if (!completedChallenges['lab4_c2']) {
      return 'משימה 2: החליפו ל-"מצפן חכם (A*)" ושגרו שוב! ראו כמה אנרגיה החללית חוסכת כשהיא נעזרת במצפן המרחק ליעד (h).';
    }
    if (!completedChallenges['lab4_c3']) {
      return 'משימה 3: הציבו לפחות 6 אסטרואידים על הלוח (או לחצו על "חגורת אסטרואידים") ושגרו את A* לעקיפת המכשול!';
    }
    return 'כל הכבוד קפטן! מצאתם את המסלול הקצר ביותר בחלל בעזרת נוסחת הניווט החכמה f = g + h!';
  }, [solution.found, completedChallenges]);

  const activeMetric = hoveredIdx !== null ? cellMetrics[hoveredIdx] : null;

  // 60fps HTML5 Canvas Overlay: Continuous Interpolated Spacecraft Flight + Live Vector Force Lines ($g$ & $h$)
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const startTime = performance.now();

    const renderRadarOverlay = (now) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        animId = requestAnimationFrame(renderRadarOverlay);
        return;
      }

      const targetW = Math.round(rect.width * dpr);
      const targetH = Math.round(rect.height * dpr);
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, rect.width, rect.height);

      const cellW = rect.width / 8;
      const cellH = rect.height / 8;
      // Note: The 8x8 radar matrix has `dir="ltr"`, so column 0 is on the left and column 7 is on the right.
      const centerOfIdx = (cellIdx) => {
        const cx = cellIdx % 8;
        const cy = Math.floor(cellIdx / 8);
        return {
          x: (cx + 0.5) * cellW,
          y: (cy + 0.5) * cellH
        };
      };

      // 1. Draw Optimal Path Energy Conduit & Smooth Continuous Flying Spacecraft
      if (isPathVisible && solution.found && Array.isArray(solution.path) && solution.path.length > 1) {
        const pts = solution.path.map((cellIdx) => centerOfIdx(cellIdx));

        // Glowing golden path conduit
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.78)';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.shadowColor = 'rgba(245, 158, 11, 0.85)';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Animated energy pulses flowing along path
        ctx.setLineDash([6, 10]);
        ctx.lineDashOffset = -((now - startTime) * 0.045);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // Smooth continuous spacecraft flight interpolation along the path
        const segCount = pts.length - 1;
        const cycleDurationMs = Math.max(2200, segCount * 280);
        const progress = ((now - startTime) % cycleDurationMs) / cycleDurationMs;
        const exactIdx = progress * segCount;
        const segIdx = Math.min(Math.floor(exactIdx), segCount - 1);
        const segT = exactIdx - segIdx;

        const p0 = pts[segIdx];
        const p1 = pts[segIdx + 1];
        const shipX = p0.x + (p1.x - p0.x) * segT;
        const shipY = p0.y + (p1.y - p0.y) * segT;
        const angle = Math.atan2(p1.y - p0.y, p1.x - p0.x);

        ctx.save();
        ctx.translate(shipX, shipY);
        ctx.rotate(angle);

        // Plasma exhaust trail behind the drone
        const grad = ctx.createLinearGradient(-20, 0, 4, 0);
        grad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        grad.addColorStop(0.55, 'rgba(56, 189, 248, 0.65)');
        grad.addColorStop(1, 'rgba(251, 191, 36, 0.95)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(-20, -4.5);
        ctx.lineTo(2, 0);
        ctx.lineTo(-20, 4.5);
        ctx.closePath();
        ctx.fill();

        // Sleek glowing scout ship drone body
        ctx.fillStyle = '#ffffff';
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-6, -6.5);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-6, 6.5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 2. Live X-Ray Vector Force Lines on Hovered Cell ($g$ from Start, $h$ Manhattan to Goal)
      if (hoveredIdx !== null && showXRay && grid[hoveredIdx] !== 1) {
        const startIdx = start.y * 8 + start.x;
        const goalIdx = goal.y * 8 + goal.x;
        const startPt = centerOfIdx(startIdx);
        const hoverPt = centerOfIdx(hoveredIdx);
        const goalPt = centerOfIdx(goalIdx);

        ctx.save();
        // Cyan vector: g (Distance from Start)
        ctx.beginPath();
        ctx.moveTo(startPt.x, startPt.y);
        ctx.lineTo(hoverPt.x, hoverPt.y);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.85)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();

        // Amber Manhattan L-shaped vector: h (Estimated distance to Planet Goal)
        ctx.beginPath();
        ctx.moveTo(hoverPt.x, hoverPt.y);
        ctx.lineTo(goalPt.x, hoverPt.y);
        ctx.lineTo(goalPt.x, goalPt.y);
        ctx.strokeStyle = 'rgba(251, 191, 36, 0.92)';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 3]);
        ctx.stroke();

        // Target reticle on hovered cell
        ctx.beginPath();
        ctx.arc(hoverPt.x, hoverPt.y, Math.min(cellW, cellH) * 0.38, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.95)';
        ctx.lineWidth = 1.75;
        ctx.setLineDash([]);
        ctx.stroke();
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(renderRadarOverlay);
    };

    animId = requestAnimationFrame(renderRadarOverlay);
    return () => cancelAnimationFrame(animId);
  }, [isPathVisible, solution, hoveredIdx, showXRay, grid, start, goal]);

  return (
    <LudicLabShell
      stationBadge="מכ״ם ניווט החלל של זֶן (60fps)"
      stationStatus={
        algorithm === 'astar'
          ? `מצפן A* פעיל • ${currentStepIndex}/${solution.totalExplored} משבצות נסרקו`
          : `גלי מכ״ם BFS • ${currentStepIndex}/${solution.totalExplored} משבצות נסרקו`
      }
      stationMessage={stationMessage}
      StationIcon={Compass}
      isBeamActive={isPlaying || isPathVisible}
      robotMood={robotMood}
      stars={stars}
      theoryTitle={labData?.title || 'חיפוש רוחב (BFS) מול מצפן חכם (A*)'}
      theoryText={
        labData?.theory?.paragraphs?.[0] ||
        'חיפוש רוחב (BFS) מתפשט לכל הכיוונים כמו אדוות במים. אלגוריתם A* מוסיף לכל משבצת ציון אומדן מרחק ליעד (h), וכך בודק קודם משבצות שמקרבות אותו לכוכב הלכת!'
      }
      chassisTitle="מכ״ם חלל 8×8: הציבו אסטרואידים והשוו בין מנועי הניווט"
      ChassisIcon={Navigation}
      showXRay={showXRay}
      onToggleXRay={setShowXRay}
      xRayLabel="רנטגן ציוני מרחק (f=g+h)"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Right Column (7 cols): Tactile Space Radar 8x8 Matrix + 60fps Canvas Overlay */}
        <div className="lg:col-span-7 flex flex-col items-center bg-slate-950/85 p-4 sm:p-5 rounded-3xl border-2 border-indigo-500/30 shadow-inner">
          {/* Top Legend & Algorithm Mode Pill */}
          <div className="w-full flex items-center justify-between gap-2 pb-3 mb-3 border-b border-white/10 flex-wrap text-xs">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 font-bold text-emerald-300">
                <BespokeSpacecraft size={18} /> חללית (0,0)
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold text-amber-300">
                <BespokeRingedPlanet size={18} /> כוכב היעד (7,7)
              </span>
              <span className="inline-flex items-center gap-1.5 font-bold text-slate-300">
                <BespokeAsteroid size={16} /> אסטרואיד ({wallCount})
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-950/90 text-indigo-200 border border-indigo-500/30">
              {algorithm === 'astar' ? 'f(n) = g(n) + h(n)' : 'BFS Queue (FIFO)'}
            </span>
          </div>

          {/* 8x8 Cosmic Matrix + Synchronized 60fps HTML5 Canvas Overlay */}
          <div className="w-full max-w-[440px] relative">
            <div
              className="w-full grid grid-cols-8 gap-1.5 sm:gap-2 p-2.5 bg-slate-900/95 rounded-2xl border-2 border-slate-700/80 shadow-2xl relative z-10"
              dir="ltr"
              onMouseLeave={() => setHoveredIdx(null)}
            >
              {grid.map((cellState, idx) => {
                const x = idx % 8;
                const y = Math.floor(idx / 8);
                const isStart = x === start.x && y === start.y;
                const isGoal = x === goal.x && y === goal.y;
                const isWall = cellState === 1;
                const isVisited = visibleVisitedSet.has(idx);
                const isOptimal = isPathVisible && pathSet.has(idx);
                const metrics = cellMetrics[idx];
                const isFrontierHead =
                  isPlaying && solution.visitedOrder[currentStepIndex - 1] === idx;

                return (
                  <button
                    key={idx}
                    type="button"
                    onMouseDown={() => {
                      if (isStart || isGoal) return;
                      setIsDragging(true);
                      onToggleWall(idx);
                    }}
                    onMouseEnter={() => {
                      setHoveredIdx(idx);
                      if (isDragging && !isStart && !isGoal) {
                        onToggleWall(idx);
                      }
                    }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-colors duration-150 cursor-pointer border select-none ${
                      isStart
                        ? 'bg-emerald-500/25 border-emerald-400 text-white shadow-[0_0_15px_rgba(16,185,129,0.45)]'
                        : isGoal
                        ? 'bg-amber-400/25 border-amber-300 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.55)]'
                        : isWall
                        ? 'bg-slate-800 border-slate-600 text-slate-300 shadow-inner'
                        : isOptimal
                        ? 'bg-amber-400/30 border-amber-300 text-amber-100 shadow-[0_0_12px_rgba(251,191,36,0.45)]'
                        : isFrontierHead
                        ? 'bg-cyan-400 border-white text-slate-950 shadow-[0_0_14px_rgba(34,211,238,0.8)]'
                        : isVisited
                        ? algorithm === 'astar'
                          ? 'bg-indigo-600/55 border-indigo-400/70 text-indigo-100'
                          : 'bg-sky-600/45 border-sky-400/60 text-sky-100'
                        : 'bg-slate-950/90 hover:bg-slate-800 border-slate-800 text-slate-500'
                    }`}
                    title={`משבצת (${x},${y}) • מרחק מהתחלה g=${metrics.g}, מרחק ליעד h=${metrics.h}`}
                  >
                    {isStart ? (
                      <BespokeSpacecraft size={26} className="drop-shadow" />
                    ) : isGoal ? (
                      <BespokeRingedPlanet size={28} className="drop-shadow" />
                    ) : isWall ? (
                      <BespokeAsteroid size={22} className="opacity-95" />
                    ) : (
                      <>
                        {showXRay ? (
                          <div className="flex flex-col items-center leading-none">
                            <span
                              className={`text-[10px] sm:text-xs font-mono font-black ${
                                isOptimal
                                  ? 'text-amber-200'
                                  : isVisited
                                  ? 'text-white'
                                  : 'text-slate-500'
                              }`}
                            >
                              {algorithm === 'astar' ? metrics.f : metrics.g}
                            </span>
                            {isVisited && metrics.visitOrder >= 0 && (
                              <span className="text-[8px] font-mono opacity-75 hidden sm:inline mt-0.5">
                                #{metrics.visitOrder + 1}
                              </span>
                            )}
                          </div>
                        ) : (
                          isOptimal && (
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_8px_#fde047]" />
                          )
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Synchronized 60fps HTML5 Canvas Overlay for Continuous Spacecraft Flight & Vector Forces */}
            <canvas
              ref={radarCanvasRef}
              className="pointer-events-none absolute inset-0 w-full h-full z-20 p-2.5"
            />
          </div>

          {/* Fixed-Height Telemetry Inspection Bar (Zero Layout Shift!) */}
          <div className="w-full max-w-[440px] mt-3 h-9 px-3 rounded-xl bg-slate-900/90 border border-white/10 flex items-center justify-between text-[11px] font-mono text-indigo-200 overflow-hidden">
            {activeMetric ? (
              <>
                <span className="font-sans font-bold text-amber-300 truncate">
                  משבצת ({activeMetric.x},{activeMetric.y}):
                </span>
                <span dir="ltr" className="truncate font-bold">
                  g={activeMetric.g} + h={activeMetric.h} ➔ f={activeMetric.f}
                  {activeMetric.visitOrder >= 0 ? ` (סריקה #${activeMetric.visitOrder + 1})` : ''}
                </span>
              </>
            ) : (
              <>
                <span className="font-sans text-slate-400 truncate">
                  רחפו מעל משבצת כדי לראות את קווי הכוח הווקטוריים של הנווט (g+h)
                </span>
                <span dir="ltr" className="text-amber-300 font-bold shrink-0">
                  path: {solution.found ? `${solution.path.length} steps` : 'blocked'}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Left Column (5 cols): Navigation Engine Selector, Controls & Efficiency Duel */}
        <div className="lg:col-span-5 space-y-4">
          {/* 1. Navigation Engine Selector */}
          <div className="bg-slate-950/80 rounded-3xl border border-white/15 p-4 space-y-3">
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>1. בחרו מנוע ניווט לחללית:</span>
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                type="button"
                onClick={() => onSelectAlgorithm('bfs')}
                className={`p-3.5 rounded-2xl border-2 text-right transition-colors cursor-pointer ${
                  algorithm === 'bfs'
                    ? 'bg-sky-500/20 border-sky-400 text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-indigo-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                    <Compass className="w-4 h-4 text-sky-300" />
                    <span>גלי מכ״ם מתפשטים (BFS)</span>
                  </span>
                  {algorithm === 'bfs' && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-400 text-slate-950">
                      פעיל
                    </span>
                  )}
                </div>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  בודק במעגלים שווים לכל הכיוונים בלי לדעת איפה כוכב היעד. מוצא מסלול קצר אך סורק משבצות מיותרות.
                </p>
              </button>

              <button
                type="button"
                onClick={() => onSelectAlgorithm('astar')}
                className={`p-3.5 rounded-2xl border-2 text-right transition-colors cursor-pointer ${
                  algorithm === 'astar'
                    ? 'bg-amber-400/20 border-amber-400 text-white shadow-md'
                    : 'bg-white/5 hover:bg-white/10 border-white/10 text-indigo-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs sm:text-sm font-black flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-300" />
                    <span>מצפן חכם ממוקד-יעד (A*)</span>
                  </span>
                  {algorithm === 'astar' && (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-400 text-slate-950">
                      פעיל
                    </span>
                  )}
                </div>
                <p className="text-xs text-indigo-200/80 leading-relaxed">
                  משלב את המרחק שכבר עברנו (<code className="font-mono">g</code>) עם הערכת המרחק ליעד (
                  <code className="font-mono">h</code>) כדי לטוס ישר למטרה!
                </p>
              </button>
            </div>
          </div>

          {/* 2. Launch & Obstacle Presets */}
          <div className="bg-slate-950/80 rounded-3xl border border-white/15 p-4 space-y-3">
            <h4 className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>2. פקדי שיגור וחגורת אסטרואידים:</span>
            </h4>

            <div className="flex flex-wrap gap-2">
              {!isPlaying ? (
                <button
                  type="button"
                  onClick={onPlay}
                  disabled={!solution.found}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 text-xs sm:text-sm font-black shadow-lg cursor-pointer transition-colors"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>שגר גלי ניווט!</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onPause}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-rose-500 hover:bg-rose-400 text-white text-xs sm:text-sm font-black shadow-lg cursor-pointer transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span>השהה סריקה</span>
                </button>
              )}

              <button
                type="button"
                onClick={onInstantReveal}
                disabled={!solution.found}
                className="px-3.5 py-3 rounded-2xl bg-indigo-500/30 hover:bg-indigo-500/40 border border-indigo-400/40 text-indigo-100 text-xs font-bold cursor-pointer transition-colors"
                title="הצג מיד את המסלול הסופי"
              >
                הצג מסלול מיד
              </button>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              <button
                type="button"
                onClick={onLoadPresetWall}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-bold text-amber-200 cursor-pointer transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>הצב חגורת אסטרואידים (מכשול)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClear();
                  AudioEngine.playStep();
                }}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-xs font-bold text-rose-200 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>נקה חלל</span>
              </button>
            </div>
          </div>

          {/* 3. Live Efficiency Scoreboard (BFS vs A*) */}
          <div className="bg-slate-950/90 rounded-3xl border border-indigo-500/30 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-indigo-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>מד חיסכון באנרגיית סריקה:</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-300 font-bold">
                {solution.found ? `אורך מסלול: ${solution.path.length} צעדים` : 'אין מעבר!'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-sky-950/50 border border-sky-500/30 text-center">
                <div className="text-[11px] text-sky-300 font-bold">גלי מכ״ם (BFS)</div>
                <div className="text-lg font-mono font-black text-white mt-0.5">
                  {lastBfsCount !== null
                    ? `${lastBfsCount} משבצות`
                    : algorithm === 'bfs'
                    ? `${solution.totalExplored} משבצות`
                    : 'טרם נבדק'}
                </div>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-950/50 border border-amber-500/40 text-center">
                <div className="text-[11px] text-amber-300 font-bold">מצפן חכם (A*)</div>
                <div className="text-lg font-mono font-black text-amber-300 mt-0.5">
                  {lastAstarCount !== null
                    ? `${lastAstarCount} משבצות`
                    : algorithm === 'astar'
                    ? `${solution.totalExplored} משבצות`
                    : 'טרם נבדק'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LudicLabShell>
  );
}
