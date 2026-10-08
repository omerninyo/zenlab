import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Compass, 
  RotateCcw, 
  Play, 
  Pause, 
  Check, 
  Award, 
  Sparkles, 
  Layers, 
  Navigation, 
  Sliders, 
  Target, 
  ShieldAlert 
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { fireConfetti } from '../core/canvas-particles.js';
import { AIService } from '../services/ai.js';
import LabPhaseHeader from '../components/LabPhaseHeader.jsx';
import TheoryView from '../components/TheoryView.jsx';
import SvgPathfinderAnimation from '../components/animations/SvgPathfinderAnimation.jsx';

export default function Lab4_Pathfinder({ curriculum }) {
  const labData = curriculum.labs.lab4;

  const [phase, setPhase] = useState(() => StorageEngine.getLabPhase('lab4'));
  const [grid, setGrid] = useState(() => new Array(64).fill(0));
  const [start, setStart] = useState({ x: 0, y: 0 });
  const [goal, setGoal] = useState({ x: 7, y: 7 });
  const [algorithm, setAlgorithm] = useState('astar'); // 'astar' | 'bfs'
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const [lastBfsCount, setLastBfsCount] = useState(null);
  const [lastAstarCount, setLastAstarCount] = useState(null);

  const [completedChallenges, setCompletedChallenges] = useState(() => {
    return StorageEngine.getState().completedChallenges;
  });

  useEffect(() => {
    const unsub = StorageEngine.subscribe(state => {
      setCompletedChallenges(state.completedChallenges);
    });
    return unsub;
  }, []);

  const handlePhaseChange = (nextPhase) => {
    setPhase(nextPhase);
    StorageEngine.setLabPhase('lab4', nextPhase);
    AudioEngine.playStep();
  };

  // Run pathfinder calculation via AIService
  const solution = useMemo(() => {
    return AIService.solvePathfinder({
      grid,
      width: 8,
      height: 8,
      start,
      goal,
      algorithm
    });
  }, [grid, start, goal, algorithm]);

  // Keep track of explored steps count for efficiency comparison
  useEffect(() => {
    if (solution.found) {
      if (algorithm === 'astar') setLastAstarCount(solution.totalExplored);
      if (algorithm === 'bfs') setLastBfsCount(solution.totalExplored);
    }
  }, [solution, algorithm]);

  // Playback timer
  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => {
          if (prev < solution.visitedOrder.length) {
            AudioEngine.playStep();
            return prev + 1;
          } else {
            setIsPlaying(false);
            if (solution.found) {
              AudioEngine.playChallengeSuccess();
            }
            return prev;
          }
        });
      }, 70);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, solution]);

  // Challenge checks
  useEffect(() => {
    // Challenge 1: Run A* directly
    if (solution.found && algorithm === 'astar' && !completedChallenges['lab4-ch1']) {
      StorageEngine.recordChallengeCompletion('lab4', 'lab4-ch1');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }

    // Challenge 2: Avoid obstacles (at least 4 walls in grid)
    const wallCount = grid.filter(cell => cell === 1).length;
    if (solution.found && wallCount >= 4 && !completedChallenges['lab4-ch2']) {
      StorageEngine.recordChallengeCompletion('lab4', 'lab4-ch2');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }

    // Challenge 3: Efficiency proof (both tested, A* <= BFS)
    if (
      lastAstarCount !== null &&
      lastBfsCount !== null &&
      lastAstarCount < lastBfsCount &&
      !completedChallenges['lab4-ch3']
    ) {
      StorageEngine.recordChallengeCompletion('lab4', 'lab4-ch3');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }
  }, [solution, algorithm, grid, lastAstarCount, lastBfsCount, completedChallenges]);

  const toggleWall = (x, y) => {
    if ((x === start.x && y === start.y) || (x === goal.x && y === goal.y)) return;
    const idx = y * 8 + x;
    const next = [...grid];
    next[idx] = next[idx] === 1 ? 0 : 1;
    setGrid(next);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    AudioEngine.playToggle(next[idx] === 1);
  };

  const handlePlay = () => {
    if (currentStepIndex >= solution.visitedOrder.length) {
      setCurrentStepIndex(0);
    }
    setIsPlaying(true);
    AudioEngine.playStep();
  };

  const handlePause = () => {
    setIsPlaying(false);
    AudioEngine.playStep();
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setGrid(new Array(64).fill(0));
    AudioEngine.playStep();
  };

  const handleLoadPresetWall = () => {
    // U-shaped trap around goal
    const next = new Array(64).fill(0);
    // Vertical barrier at column 3
    for (let r = 1; r < 7; r++) {
      next[r * 8 + 3] = 1;
    }
    setGrid(next);
    setCurrentStepIndex(0);
    setIsPlaying(false);
    AudioEngine.playStep();
  };

  // Visited set up to currentStepIndex
  const visibleVisitedSet = useMemo(() => {
    const s = new Set();
    for (let i = 0; i < currentStepIndex && i < solution.visitedOrder.length; i++) {
      const p = solution.visitedOrder[i];
      s.add(`${p.x},${p.y}`);
    }
    return s;
  }, [currentStepIndex, solution.visitedOrder]);

  const isPathVisible = currentStepIndex >= solution.visitedOrder.length && solution.found;
  const pathSet = useMemo(() => {
    return new Set(solution.path.map(p => `${p.x},${p.y}`));
  }, [solution.path]);

  const completedCount = ['lab4-ch1', 'lab4-ch2', 'lab4-ch3'].filter(
    id => completedChallenges[id]
  ).length;

  return (
    <div className="space-y-6">
      <LabPhaseHeader
        labData={labData}
        currentPhase={phase}
        onPhaseChange={handlePhaseChange}
        earnedStars={completedCount}
        totalLabChallenges={labData.challenges.length}
      />

      {phase === 'theory' && (
        <TheoryView
          labData={labData}
          animationComponent={SvgPathfinderAnimation}
          onProceedToInteractive={() => handlePhaseChange('interactive')}
        />
      )}

      {phase === 'interactive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: 8x8 Interactive Grid */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-400" />
                  <h2 className="text-base font-bold text-white">מבוך החיפוש (רשת 8x8)</h2>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleLoadPresetWall}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition-colors"
                  >
                    טען מחסום קיר
                  </button>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                    title="נקה מבוך"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Controls bar: Algorithm selection + Playback */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">אלגוריתם:</span>
                  <button
                    type="button"
                    onClick={() => { setAlgorithm('astar'); setCurrentStepIndex(0); setIsPlaying(false); AudioEngine.playStep(); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      algorithm === 'astar'
                        ? 'bg-blue-600 border-blue-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>חיפוש חכם A*</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAlgorithm('bfs'); setCurrentStepIndex(0); setIsPlaying(false); AudioEngine.playStep(); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      algorithm === 'bfs'
                        ? 'bg-blue-600 border-blue-500 text-white font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>סריקת רוחב BFS</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {isPlaying ? (
                    <button
                      type="button"
                      onClick={handlePause}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5" />
                      <span>השהה</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handlePlay}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5" />
                      <span>הפעל חיפוש</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => { setCurrentStepIndex(solution.visitedOrder.length); AudioEngine.playStep(); }}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800"
                  >
                    לסוף
                  </button>
                </div>
              </div>

              {/* 8x8 Grid Canvas */}
              <div className="flex justify-center">
                <div className="grid grid-cols-8 gap-1.5 p-3 bg-slate-950 rounded-2xl border border-slate-800 max-w-[420px] w-full aspect-square">
                  {Array.from({ length: 64 }).map((_, idx) => {
                    const x = idx % 8;
                    const y = Math.floor(idx / 8);
                    const isStart = x === start.x && y === start.y;
                    const isGoal = x === goal.x && y === goal.y;
                    const isWall = grid[idx] === 1;
                    const key = `${x},${y}`;
                    const isVisited = visibleVisitedSet.has(key);
                    const isInFinalPath = isPathVisible && pathSet.has(key);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleWall(x, y)}
                        className={`aspect-square rounded-lg flex items-center justify-center font-bold text-xs transition-all ${
                          isWall
                            ? 'bg-slate-600 border border-slate-500 text-slate-300 shadow-inner'
                            : isInFinalPath
                            ? 'bg-emerald-500 text-white shadow-md animate-pulse'
                            : isVisited
                            ? 'bg-blue-900/80 border border-blue-700/60 text-blue-200'
                            : 'bg-slate-900 hover:bg-slate-800 border border-slate-800/80 text-slate-500'
                        }`}
                      >
                        {isStart && <span className="text-white text-xs font-black">S</span>}
                        {isGoal && <span className="text-white text-xs font-black">G</span>}
                        {isWall && <span className="text-slate-400 text-[10px]">✕</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Live Metric Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-0.5">משבצות שנבדקו</span>
                  <span className="text-base font-bold font-mono text-blue-400">
                    {Math.min(currentStepIndex, solution.totalExplored)}
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-0.5">אורך מסלול אופטימלי</span>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    {solution.found ? solution.path.length : 'אין מסלול'}
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-center">
                  <span className="text-[11px] text-slate-400 block mb-0.5">סטטוס הגעה</span>
                  <span className={`text-xs font-bold ${solution.found ? 'text-emerald-400' : 'text-red-400'}`}>
                    {solution.found ? 'מסלול פתוח' : 'חסום לחלוטין'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Challenges & Learning Notes */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-semibold text-white">אתגרי ניווט ויעילות</h3>
                </div>
                <span className="text-xs font-mono text-slate-400">
                  {completedCount}/{labData.challenges.length}
                </span>
              </div>

              <div className="space-y-3">
                {labData.challenges.map(ch => {
                  const isDone = Boolean(completedChallenges[ch.id]);
                  return (
                    <div
                      key={ch.id}
                      className={`p-3.5 rounded-lg border text-xs transition-all ${
                        isDone
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-white">{ch.title}</span>
                        {isDone ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                            <Check className="w-3.5 h-3.5" />
                            הושלם
                          </span>
                        ) : (
                          <span className="text-[11px] text-amber-400 font-mono">★</span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {ch.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Glossary Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-white border-b border-slate-800 pb-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>מושגי מפתח ללמידה</span>
              </div>
              <div className="space-y-2.5 text-xs">
                {labData.glossary.map((item, idx) => (
                  <div key={idx} className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <span className="font-bold text-slate-200 block mb-0.5">{item.term}</span>
                    <span className="text-slate-400 text-[11px] leading-relaxed">{item.definition}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
