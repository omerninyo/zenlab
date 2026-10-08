import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Network, 
  RotateCcw, 
  Plus, 
  Sliders, 
  Check, 
  Award, 
  BookOpen, 
  Info, 
  MousePointer,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { AIService } from '../services/ai.js';
import { fireConfetti } from '../core/canvas-particles.js';
import LabPhaseHeader from '../components/LabPhaseHeader.jsx';
import TheoryView from '../components/TheoryView.jsx';
import SvgClassifierAnimation from '../components/animations/SvgClassifierAnimation.jsx';

export default function Lab5_MachineLearningClassifier({ curriculum }) {
  const labData = curriculum.labs.lab5;

  // Phase state: 'theory' | 'interactive'
  const [phase, setPhase] = useState(() => StorageEngine.getLabPhase('lab5'));
  const [points, setPoints] = useState(() => [...labData.initialData]);
  const [selectedClass, setSelectedClass] = useState('A'); // 'A' | 'B'
  const [kValue, setKValue] = useState(3);
  const [testPoint, setTestPoint] = useState({ x: 50, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState(() => StorageEngine.getState().completedChallenges);

  const svgRef = useRef(null);

  useEffect(() => {
    const unsub = StorageEngine.subscribe(state => {
      setCompletedChallenges(state.completedChallenges);
    });
    return unsub;
  }, []);

  // Real-time classification calculation via AI Service
  const classification = useMemo(() => {
    return AIService.classifyPointKNN(points, testPoint, kValue);
  }, [points, testPoint, kValue]);

  // Check challenges
  useEffect(() => {
    // Challenge 1: Total points >= 10
    if (points.length >= 10 && !completedChallenges['lab5_challenge1']) {
      const res = StorageEngine.completeChallenge('lab5', 'lab5_challenge1', 1);
      if (res.isNew) {
        AudioEngine.playSuccess();
        fireConfetti();
      }
    }

    // Challenge 2: Test point classified
    if ((testPoint.x !== 50 || testPoint.y !== 50) && !completedChallenges['lab5_challenge2']) {
      const res = StorageEngine.completeChallenge('lab5', 'lab5_challenge2', 1);
      if (res.isNew) {
        AudioEngine.playSuccess();
        fireConfetti();
      }
    }

    // Challenge 3: Tested with k=5
    if (kValue === 5 && !completedChallenges['lab5_challenge3']) {
      const res = StorageEngine.completeChallenge('lab5', 'lab5_challenge3', 1);
      if (res.isNew) {
        AudioEngine.playSuccess();
        fireConfetti();
      }
    }
  }, [points, testPoint, kValue, completedChallenges]);

  const handleSvgClick = (e) => {
    if (isDragging) return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = 100 - ((e.clientY - rect.top) / rect.height) * 100; // Invert Y for standard coordinate system

    const boundedX = Math.max(5, Math.min(95, Math.round(clickX)));
    const boundedY = Math.max(5, Math.min(95, Math.round(clickY)));

    const newPoint = {
      id: Date.now(),
      x: boundedX,
      y: boundedY,
      label: selectedClass
    };

    setPoints([...points, newPoint]);
    AudioEngine.playToggle(true);
  };

  const handlePointerDownTestPoint = (e) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const moveX = ((e.clientX - rect.left) / rect.width) * 100;
    const moveY = 100 - ((e.clientY - rect.top) / rect.height) * 100;

    const boundedX = Math.max(5, Math.min(95, Math.round(moveX)));
    const boundedY = Math.max(5, Math.min(95, Math.round(moveY)));

    setTestPoint({ x: boundedX, y: boundedY });
  };

  const handlePointerUp = () => {
    if (isDragging) {
      setIsDragging(false);
      AudioEngine.playStep();
    }
  };

  const resetPoints = () => {
    setPoints([...labData.initialData]);
    setTestPoint({ x: 50, y: 50 });
    setKValue(3);
    AudioEngine.playStep();
  };

  const classAInfo = labData.classes.A;
  const classBInfo = labData.classes.B;
  const predictedInfo = classification.predictedLabel === 'A' ? classAInfo : classBInfo;
  const earnedStars = (completedChallenges['lab5_challenge1'] ? 1 : 0) +
                      (completedChallenges['lab5_challenge2'] ? 1 : 0) +
                      (completedChallenges['lab5_challenge3'] ? 1 : 0);

  return (
    <div className="space-y-6" onPointerUp={handlePointerUp} onPointerMove={handlePointerMove}>
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
          animationComponent={SvgClassifierAnimation}
          onProceedToInteractive={() => {
            setPhase('interactive');
            StorageEngine.setLabPhase('lab5', 'interactive');
            AudioEngine.playStep();
          }}
        />
      )}

      {/* Phase 2: Interactive Simulator */}
      {phase === 'interactive' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Scatter Plot 2D Canvas */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-6 flex flex-col items-center shadow-xs">
            <div className="w-full flex items-center justify-between mb-3">
              <div className="text-xs text-slate-300 font-semibold">
                לוח תכונות: גודל מול משקל
              </div>
              <div className="text-xs font-mono text-slate-400">
                דוגמאות: <span className="text-white font-bold">{points.length}</span>
              </div>
            </div>

            {/* SVG Coordinate Space */}
            <div className="relative bg-slate-950 p-2 rounded-2xl border border-slate-800 w-full aspect-square max-w-[320px] sm:max-w-[420px] select-none shadow-inner touch-none">
              <svg
                ref={svgRef}
                viewBox="0 0 100 100"
                onClick={handleSvgClick}
                className="w-full h-full cursor-crosshair overflow-visible touch-none"
              >
                {/* Coordinate Grid lines */}
                <line x1="0" y1="25" x2="100" y2="25" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1,2" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1,2" />
                <line x1="0" y1="75" x2="100" y2="75" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1,2" />
                <line x1="25" y1="0" x2="25" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1,2" />
                <line x1="50" y1="0" x2="50" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1,2" />
                <line x1="75" y1="0" x2="75" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1,2" />

                {/* Connecting lines to k-nearest neighbors */}
                {classification.nearestNeighbors.map((nn) => (
                  <line
                    key={`line-${nn.id}`}
                    x1={testPoint.x}
                    y1={100 - testPoint.y}
                    x2={nn.x}
                    y2={100 - nn.y}
                    stroke="#38bdf8"
                    strokeWidth="0.8"
                    strokeDasharray="1.5,1.5"
                    className="opacity-70 animate-pulse"
                  />
                ))}

                {/* Training Points */}
                {points.map((p) => {
                  const isNeighbor = classification.nearestNeighbors.some(nn => nn.id === p.id);
                  const isA = p.label === 'A';
                  return (
                    <g key={p.id}>
                      <circle
                        cx={p.x}
                        cy={100 - p.y}
                        r={isNeighbor ? 3.5 : 2.5}
                        fill={isA ? '#ef4444' : '#10b981'}
                        stroke={isNeighbor ? '#ffffff' : '#0f172a'}
                        strokeWidth={isNeighbor ? 1 : 0.6}
                      />
                    </g>
                  );
                })}

                {/* Test Query Object (Draggable) */}
                <g 
                  onPointerDown={handlePointerDownTestPoint}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <circle
                    cx={testPoint.x}
                    cy={100 - testPoint.y}
                    r={5}
                    fill={classification.predictedLabel === 'A' ? '#ef4444' : '#10b981'}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    className="drop-shadow"
                  />
                  <circle
                    cx={testPoint.x}
                    cy={100 - testPoint.y}
                    r={8}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="0.8"
                    className="animate-ping opacity-30"
                  />
                </g>
              </svg>

              {/* Axis labels */}
              <div className="absolute bottom-1 right-3 text-[10px] text-slate-500 font-mono">
                גודל (X) &rarr;
              </div>
              <div className="absolute top-2 left-2 text-[10px] text-slate-500 font-mono">
                &uarr; משקל (Y)
              </div>
            </div>

            {/* Instruction tooltip */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-4">
              <MousePointer className="w-3.5 h-3.5 text-blue-400" />
              <span>הקליקו על המשטח להוספת דגימה, או גררו את העצם העגול לבדיקה.</span>
            </div>

            {/* Data controls */}
            <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">בחר סוג פריט להוספה:</span>
                <button
                  type="button"
                  onClick={() => setSelectedClass('A')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                    selectedClass === 'A'
                      ? 'bg-red-950/80 border-red-600 text-red-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>{classAInfo.name}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedClass('B')}
                  className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-medium border transition-colors ${
                    selectedClass === 'B'
                      ? 'bg-emerald-950/80 border-emerald-600 text-emerald-200'
                      : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{classBInfo.name}</span>
                </button>
              </div>

              <button
                type="button"
                onClick={resetPoints}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>איפוס נתונים</span>
              </button>
            </div>
          </div>

          {/* Inference Output & Hyperparameters */}
          <div className="lg:col-span-5 space-y-6">
            {/* Real-Time Classification Result */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">החלטת המחשב בזמן אמת</h3>
                <span className="text-[11px] font-mono text-slate-400">
                  ({testPoint.x}, {testPoint.y})
                </span>
              </div>

              {/* Class result banner */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white ${
                    classification.predictedLabel === 'A' ? 'bg-red-600' : 'bg-emerald-600'
                  }`}>
                    {classification.predictedLabel}
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">זיהוי המחשב:</div>
                    <div className="text-sm font-bold text-white">{predictedInfo.name}</div>
                  </div>
                </div>

                <div className="text-left">
                  <div className="text-xs text-slate-400">מידת ביטחון:</div>
                  <div className="text-lg font-mono font-bold text-blue-400">
                    {classification.confidence}%
                  </div>
                </div>
              </div>

              {/* Hyperparameter k-NN selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 font-medium">
                    <Sliders className="w-3.5 h-3.5 text-blue-400" />
                    <span>מספר השכנים שמשפיעים (k):</span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-blue-400 bg-slate-800 px-2 py-0.5 rounded">
                    k = {kValue}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 3, 5].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => {
                        setKValue(val);
                        AudioEngine.playStep();
                      }}
                      className={`py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        kValue === val
                          ? 'bg-blue-600 border-blue-500 text-white font-semibold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      k = {val}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nearest Neighbors Breakdown */}
              <div className="pt-2">
                <div className="text-[11px] font-medium text-slate-400 mb-2">
                  קולות השכנים הקרובים:
                </div>
                <div className="space-y-1.5">
                  {classification.nearestNeighbors.map((nn, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between bg-slate-950 px-3 py-1 rounded text-xs border border-slate-800/80"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${nn.label === 'A' ? 'bg-red-500' : 'bg-emerald-500'}`} />
                        <span className="text-slate-300">
                          {nn.label === 'A' ? classAInfo.name : classBInfo.name}
                        </span>
                      </div>
                      <span className="font-mono text-slate-500 text-[10px]">
                        מרחק: {nn.distance.toFixed(1)} יחידות
                      </span>
                    </div>
                  ))}
                </div>
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
