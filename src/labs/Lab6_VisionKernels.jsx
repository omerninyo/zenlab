import React, { useState, useEffect, useMemo } from 'react';
import { 
  Eye, 
  RotateCcw, 
  Check, 
  Award, 
  Sparkles, 
  Layers, 
  Sliders, 
  ScanLine, 
  Info,
  ChevronRight
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { fireConfetti } from '../core/canvas-particles.js';
import { AIService } from '../services/ai.js';
import LabPhaseHeader from '../components/LabPhaseHeader.jsx';
import TheoryView from '../components/TheoryView.jsx';
import SvgKernelAnimation from '../components/animations/SvgKernelAnimation.jsx';

export default function Lab6_VisionKernels({ curriculum }) {
  const labData = curriculum.labs.lab6;

  const [phase, setPhase] = useState(() => StorageEngine.getLabPhase('lab6'));
  const [selectedPreset, setSelectedPreset] = useState('verticalStripe');
  const [inputGrid, setInputGrid] = useState(() => labData.presets.verticalStripe.grid);
  const [activeKernelKey, setActiveKernelKey] = useState('verticalEdge');
  const [inspectedCell, setInspectedCell] = useState({ x: 2, y: 3 });

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
    StorageEngine.setLabPhase('lab6', nextPhase);
    AudioEngine.playStep();
  };

  const currentKernel = labData.kernels[activeKernelKey];

  // Compute 2D convolution
  const convolutionResult = useMemo(() => {
    return AIService.computeConvolution({
      inputGrid,
      width: 8,
      height: 8,
      kernel: currentKernel.matrix
    });
  }, [inputGrid, currentKernel]);

  // Challenge checks
  useEffect(() => {
    // Challenge 1: Vertical edge on verticalStripe
    if (selectedPreset === 'verticalStripe' && activeKernelKey === 'verticalEdge' && !completedChallenges['lab6-ch1']) {
      StorageEngine.recordChallengeCompletion('lab6', 'lab6-ch1');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }

    // Challenge 2: Horizontal edge on square
    if (selectedPreset === 'square' && activeKernelKey === 'horizontalEdge' && !completedChallenges['lab6-ch2']) {
      StorageEngine.recordChallengeCompletion('lab6', 'lab6-ch2');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }

    // Challenge 3: Inspected pixel
    if (inspectedCell && !completedChallenges['lab6-ch3']) {
      StorageEngine.recordChallengeCompletion('lab6', 'lab6-ch3');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }
  }, [selectedPreset, activeKernelKey, inspectedCell, completedChallenges]);

  const toggleInputPixel = (idx) => {
    const next = [...inputGrid];
    next[idx] = next[idx] === 1 ? 0 : 1;
    setInputGrid(next);
    setSelectedPreset('custom');
    AudioEngine.playToggle(next[idx] === 1);
  };

  const handleSelectPreset = (key) => {
    setSelectedPreset(key);
    setInputGrid([...labData.presets[key].grid]);
    AudioEngine.playStep();
  };

  const handleClear = () => {
    setInputGrid(new Array(64).fill(0));
    setSelectedPreset('custom');
    AudioEngine.playStep();
  };

  const completedCount = ['lab6-ch1', 'lab6-ch2', 'lab6-ch3'].filter(
    id => completedChallenges[id]
  ).length;

  // Find inspected cell details
  const inspectedDetail = useMemo(() => {
    return convolutionResult.details.find(
      d => d.x === inspectedCell.x && d.y === inspectedCell.y
    );
  }, [convolutionResult, inspectedCell]);

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
          animationComponent={SvgKernelAnimation}
          onProceedToInteractive={() => handlePhaseChange('interactive')}
        />
      )}

      {phase === 'interactive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Visual Convolution Workspace */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-5 h-5 text-amber-400" />
                  <h2 className="text-base font-bold text-white">מעבדת ראייה ממוחשבת</h2>
                </div>

                {/* Presets */}
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  <span className="text-xs text-slate-400 ml-1">תבניות:</span>
                  {Object.entries(labData.presets).map(([k, p]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => handleSelectPreset(k)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        selectedPreset === k
                          ? 'bg-amber-950/80 border-amber-600 text-amber-300 font-bold'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={handleClear}
                    className="p-1 rounded bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800 ml-1"
                    title="נקה משטח"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Kernel Selector */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">בחר גרעין קונבולוציה (פילטר 3x3):</span>
                  <span className="text-xs text-slate-400 font-mono">{currentKernel.description}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(labData.kernels).map(([k, item]) => (
                    <button
                      key={k}
                      type="button"
                      onClick={() => { setActiveKernelKey(k); AudioEngine.playStep(); }}
                      className={`p-2.5 rounded-lg border text-xs text-right transition-colors ${
                        activeKernelKey === k
                          ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-sm'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="font-bold mb-0.5">{item.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual Matrices: Input Image vs Feature Map */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Input Grid */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold">תמונת קלט מקורית (8x8)</span>
                    <span className="text-[11px] text-slate-500">לחצו לציור חופשי</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-center">
                    <div className="grid grid-cols-8 gap-1 aspect-square w-full max-w-[240px]">
                      {inputGrid.map((val, idx) => {
                        const x = idx % 8;
                        const y = Math.floor(idx / 8);
                        const isInspected = Math.abs(x - inspectedCell.x) <= 1 && Math.abs(y - inspectedCell.y) <= 1;

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => toggleInputPixel(idx)}
                            className={`aspect-square rounded transition-all ${
                              val === 1
                                ? 'bg-blue-500 shadow-sm'
                                : 'bg-slate-900 hover:bg-slate-800'
                            } ${
                              isInspected
                                ? 'ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-950'
                                : ''
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Output Feature Map */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="font-semibold">מפת מאפיינים מחושבת (Feature Map)</span>
                    <span className="text-[11px] text-slate-500">לחצו לבדיקת פיקסל</span>
                  </div>
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-center">
                    <div className="grid grid-cols-8 gap-1 aspect-square w-full max-w-[240px]">
                      {convolutionResult.outputGrid.map((val, idx) => {
                        const x = idx % 8;
                        const y = Math.floor(idx / 8);
                        const isCurrentInspected = x === inspectedCell.x && y === inspectedCell.y;

                        // Visual brightness representation
                        const opacity = Math.max(0.15, Math.min(1, val));

                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => { setInspectedCell({ x, y }); AudioEngine.playStep(); }}
                            className={`aspect-square rounded flex items-center justify-center font-mono text-[9px] transition-all ${
                              isCurrentInspected
                                ? 'ring-2 ring-emerald-400 bg-emerald-600 text-white font-bold'
                                : val > 0.2
                                ? 'bg-emerald-500 text-white font-semibold'
                                : 'bg-slate-900 text-slate-600'
                            }`}
                            style={{ opacity: isCurrentInspected ? 1 : opacity }}
                          >
                            {Math.round(val * 10) / 10}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Convolution Inspector Breakdown */}
              {inspectedDetail && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Sparkles className="w-4 h-4" />
                      <span>פירוט חישוב פיקסל ({inspectedCell.x}, {inspectedCell.y}):</span>
                    </div>
                    <span className="font-mono text-emerald-400 font-bold">
                      תוצאה סופית: {inspectedDetail.clamped}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    המחשב הכפיל את 9 פיקסלי השכנים סביב ({inspectedCell.x}, {inspectedCell.y}) במשקולות פילטר {currentKernel.name}, וסכם את המכפלות לסכום כולל של <strong className="text-white font-mono">{inspectedDetail.sum}</strong>.
                  </p>
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
                  <h3 className="text-xs font-semibold text-white">אתגרי ראייה ממוחשבת</h3>
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
