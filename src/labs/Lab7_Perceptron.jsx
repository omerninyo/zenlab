import React, { useState, useEffect, useMemo } from 'react';
import { 
  Network, 
  RotateCcw, 
  Check, 
  Award, 
  Sparkles, 
  Sliders, 
  Layers, 
  Zap, 
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { fireConfetti } from '../core/canvas-particles.js';
import { AIService } from '../services/ai.js';
import LabPhaseHeader from '../components/LabPhaseHeader.jsx';
import TheoryView from '../components/TheoryView.jsx';
import SvgPerceptronAnimation from '../components/animations/SvgPerceptronAnimation.jsx';
import SvgLogicGatesAnimation from '../components/animations/SvgLogicGatesAnimation.jsx';

export default function Lab7_Perceptron({ curriculum }) {
  const labData = curriculum.labs.lab7;

  const [phase, setPhase] = useState(() => StorageEngine.getLabPhase('lab7'));
  const [selectedGate, setSelectedGate] = useState('AND'); // 'AND' | 'OR' | 'XOR'
  const [w1, setW1] = useState(1.0);
  const [w2, setW2] = useState(1.0);
  const [bias, setBias] = useState(-1.5);
  const [activation, setActivation] = useState('step'); // 'step' | 'sigmoid'

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
    StorageEngine.setLabPhase('lab7', nextPhase);
    AudioEngine.playStep();
  };

  // Evaluate Perceptron via AIService
  const evaluation = useMemo(() => {
    return AIService.evaluatePerceptron({
      w1,
      w2,
      bias,
      activation
    });
  }, [w1, w2, bias, activation]);

  // Current gate accuracy
  const currentAccuracy = useMemo(() => {
    if (selectedGate === 'AND') return evaluation.accuracyAnd;
    if (selectedGate === 'OR') return evaluation.accuracyOr;
    return evaluation.accuracyXor;
  }, [evaluation, selectedGate]);

  // Challenge checks
  useEffect(() => {
    // Challenge 1: AND gate 100%
    if (selectedGate === 'AND' && evaluation.accuracyAnd === 100 && !completedChallenges['lab7-ch1']) {
      StorageEngine.recordChallengeCompletion('lab7', 'lab7-ch1');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }

    // Challenge 2: OR gate 100%
    if (selectedGate === 'OR' && evaluation.accuracyOr === 100 && !completedChallenges['lab7-ch2']) {
      StorageEngine.recordChallengeCompletion('lab7', 'lab7-ch2');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }

    // Challenge 3: Try XOR gate (at least 75% accuracy tested)
    if (selectedGate === 'XOR' && evaluation.accuracyXor >= 75 && !completedChallenges['lab7-ch3']) {
      StorageEngine.recordChallengeCompletion('lab7', 'lab7-ch3');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }
  }, [selectedGate, evaluation, completedChallenges]);

  const handleReset = () => {
    setW1(1.0);
    setW2(1.0);
    setBias(-1.5);
    AudioEngine.playStep();
  };

  const handleSelectGate = (gate) => {
    setSelectedGate(gate);
    AudioEngine.playStep();
  };

  const completedCount = ['lab7-ch1', 'lab7-ch2', 'lab7-ch3'].filter(
    id => completedChallenges[id]
  ).length;

  // Calculate boundary line coordinates on 300x300 SVG canvas:
  // Mathematical plane: x in [-0.2, 1.2], y in [-0.2, 1.2]
  // Mapping formula: svgX = (x + 0.2) / 1.4 * 260 + 20
  // svgY = 280 - (y + 0.2) / 1.4 * 260
  const toSvgCoords = (px, py) => {
    const sx = ((px + 0.2) / 1.4) * 260 + 20;
    const sy = 280 - ((py + 0.2) / 1.4) * 260;
    return { x: sx, y: sy };
  };

  // Find two points on w1*x1 + w2*x2 + b = 0
  const linePoints = useMemo(() => {
    // If w2 != 0: x2 = -(w1*x1 + b) / w2
    if (Math.abs(w2) > 0.01) {
      const x1_a = -0.2;
      const x2_a = -(w1 * x1_a + bias) / w2;
      const x1_b = 1.2;
      const x2_b = -(w1 * x1_b + bias) / w2;
      return { p1: toSvgCoords(x1_a, x2_a), p2: toSvgCoords(x1_b, x2_b) };
    } else if (Math.abs(w1) > 0.01) {
      // Vertical line: x1 = -b / w1
      const x1_fixed = -bias / w1;
      return { p1: toSvgCoords(x1_fixed, -0.2), p2: toSvgCoords(x1_fixed, 1.2) };
    }
    return null;
  }, [w1, w2, bias]);

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
          animations={[
            { id: 'perceptron', label: 'נוירון בודד והפרדה לינארית', component: SvgPerceptronAnimation },
            { id: 'logicGates', label: 'שערי AND/OR/XOR בחומרה', component: SvgLogicGatesAnimation }
          ]}
          onProceedToInteractive={() => handlePhaseChange('interactive')}
        />
      )}

      {phase === 'interactive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Direct Manipulation Sliders & 2D Decision Plot */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-6 space-y-4 sm:space-y-6 shadow-xs">
              <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-purple-400" />
                  <h2 className="text-sm sm:text-base font-bold text-white">ארגז חול: מתג הנוירון</h2>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">התאמה:</span>
                    <span className={`text-xs sm:text-sm font-bold font-mono ${
                      currentAccuracy === 100 ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      {currentAccuracy}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                    title="איפוס ערכים"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Logic Gate Selector */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 bg-slate-950 p-1.5 sm:p-2 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400 font-medium px-1 sm:px-2 shrink-0">שער:</span>
                {[
                  { id: 'AND', label: 'שער "וגם" (AND)' },
                  { id: 'OR', label: 'שער "או" (OR)' },
                  { id: 'XOR', label: 'שער "או-אבל-לא-שניהם" (XOR)' }
                ].map(gate => (
                  <button
                    key={gate.id}
                    type="button"
                    onClick={() => handleSelectGate(gate.id)}
                    className={`flex-1 min-w-[120px] py-1.5 px-2 rounded-lg text-xs font-bold transition-all ${
                      selectedGate === gate.id
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    {gate.label}
                  </button>
                ))}
              </div>

              {/* Sliders & 2D Graph Area */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Sliders Column */}
                <div className="md:col-span-6 space-y-5 bg-slate-950 p-5 rounded-xl border border-slate-800">
                  {/* Slider Weight 1 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">מידת חשיבות רמז 1 (w₁)</span>
                      <span className="font-mono text-purple-400 font-bold">{w1.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="-3.0"
                      max="3.0"
                      step="0.1"
                      value={w1}
                      onChange={e => { setW1(parseFloat(e.target.value)); AudioEngine.playStep(); }}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Slider Weight 2 */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">מידת חשיבות רמז 2 (w₂)</span>
                      <span className="font-mono text-purple-400 font-bold">{w2.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="-3.0"
                      max="3.0"
                      step="0.1"
                      value={w2}
                      onChange={e => { setW2(parseFloat(e.target.value)); AudioEngine.playStep(); }}
                      className="w-full accent-purple-500 cursor-pointer"
                    />
                  </div>

                  {/* Slider Bias */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-300 font-semibold">סף ההחלטה (סף b)</span>
                      <span className="font-mono text-amber-400 font-bold">{bias.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="-3.0"
                      max="3.0"
                      step="0.1"
                      value={bias}
                      onChange={e => { setBias(parseFloat(e.target.value)); AudioEngine.playStep(); }}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  {/* Math Formula Callout */}
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
                    קו הפרדה: <span className="text-purple-300 font-bold">{w1.toFixed(1)}·x₁ + {w2.toFixed(1)}·x₂ + ({bias.toFixed(1)}) = 0</span>
                  </div>
                </div>

                {/* 2D Plane Visualization */}
                <div className="md:col-span-6 flex justify-center">
                  <div className="w-[280px] h-[280px] bg-slate-950 rounded-2xl border border-slate-800 p-2 relative overflow-hidden">
                    <svg viewBox="0 0 300 300" className="w-full h-full select-none">
                      {/* Grid Axis */}
                      <line x1="20" y1="280" x2="280" y2="280" stroke="#334155" strokeWidth="1.5" />
                      <line x1="20" y1="20" x2="20" y2="280" stroke="#334155" strokeWidth="1.5" />

                      {/* Ticks & Labels */}
                      <text x="20" y="295" fill="#64748b" fontSize="10" textAnchor="middle">0</text>
                      <text x="205" y="295" fill="#64748b" fontSize="10" textAnchor="middle">1 (x₁)</text>
                      <text x="8" y="95" fill="#64748b" fontSize="10" textAnchor="middle">1 (x₂)</text>

                      {/* Decision Boundary Line */}
                      {linePoints && (
                        <line
                          x1={linePoints.p1.x}
                          y1={linePoints.p1.y}
                          x2={linePoints.p2.x}
                          y2={linePoints.p2.y}
                          stroke="#a855f7"
                          strokeWidth="3"
                          strokeDasharray="4 2"
                        />
                      )}

                      {/* 4 Truth Table Points */}
                      {evaluation.results.map((pt, i) => {
                        const target = selectedGate === 'AND' ? pt.targetAnd : selectedGate === 'OR' ? pt.targetOr : pt.targetXor;
                        const isMatch = pt.output === target;
                        const coords = toSvgCoords(pt.x1, pt.x2);

                        return (
                          <g key={i}>
                            <circle
                              cx={coords.x}
                              cy={coords.y}
                              r="15"
                              fill={target === 1 ? '#059669' : '#1e293b'}
                              stroke={isMatch ? '#34d399' : '#ef4444'}
                              strokeWidth={isMatch ? '2.5' : '3'}
                            />
                            <text
                              x={coords.x}
                              y={coords.y + 4}
                              fill="#ffffff"
                              fontSize="11"
                              fontWeight="bold"
                              textAnchor="middle"
                            >
                              {pt.output}
                            </text>
                            <text
                              x={coords.x}
                              y={coords.y - 18}
                              fill="#94a3b8"
                              fontSize="9"
                              textAnchor="middle"
                            >
                              ({pt.x1},{pt.x2})
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                </div>
              </div>

              {/* XOR Intuition Callout */}
              {selectedGate === 'XOR' && (
                <div className="bg-amber-950/40 border border-amber-800/80 rounded-xl p-4 text-xs text-amber-200 flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-300 mb-1">מדוע שער "או-אבל-לא-שניהם" (XOR) בלתי פתיר ע״י קו בודד?</h4>
                    <p className="text-[11px] leading-relaxed text-amber-200/90">
                      שים לב לסידור הנקודות בלוח: שתי נקודות בצבע ירוק נמצאות באלכסון אחד, ושתי נקודות כהות באלכסון השני. לא קיים שום קו ישר יחיד בעולם שיכול להפריד ביניהן! התגלית הזו הובילה את המדענים להבין שצריך לחבר מספר נוירונים ביחד כרשת (רשת עצבית עמוקה) כדי לפצח חידות מורכבות.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Challenges & Pedagogical Notes */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-semibold text-white">אתגרי אימון נוירון</h3>
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
