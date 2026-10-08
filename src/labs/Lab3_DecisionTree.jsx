import React, { useState, useEffect, useMemo } from 'react';
import { 
  GitBranch, 
  RotateCcw, 
  Check, 
  Award, 
  Sparkles, 
  Sliders, 
  Layers, 
  CheckCircle2, 
  HelpCircle,
  HelpCircle as QuestionIcon,
  ChevronDown
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { fireConfetti } from '../core/canvas-particles.js';
import { AIService } from '../services/ai.js';
import LabPhaseHeader from '../components/LabPhaseHeader.jsx';
import TheoryView from '../components/TheoryView.jsx';
import SvgDecisionTreeAnimation from '../components/animations/SvgDecisionTreeAnimation.jsx';

export default function Lab3_DecisionTree({ curriculum }) {
  const labData = curriculum.labs.lab3;

  const [phase, setPhase] = useState(() => StorageEngine.getLabPhase('lab3'));
  const [rootAttr, setRootAttr] = useState('canFly');
  const [leftAttr, setLeftAttr] = useState('hasFur');
  const [rightAttr, setRightAttr] = useState('legs');
  const [selectedTestAnimalId, setSelectedTestAnimalId] = useState('bat');

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
    StorageEngine.setLabPhase('lab3', nextPhase);
    AudioEngine.playStep();
  };

  // Evaluate the tree using AIService
  const evaluation = useMemo(() => {
    return AIService.evaluateDecisionTree(labData.dataset, {
      rootAttr,
      leftAttr,
      rightAttr
    });
  }, [labData.dataset, rootAttr, leftAttr, rightAttr]);

  // Challenge checks
  useEffect(() => {
    // Challenge 1: Root is canFly
    if (rootAttr === 'canFly' && !completedChallenges['lab3-ch1']) {
      StorageEngine.recordChallengeCompletion('lab3', 'lab3-ch1');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }

    // Challenge 2: Purity >= 75%
    if (evaluation.leafPurity >= 75 && !completedChallenges['lab3-ch2']) {
      StorageEngine.recordChallengeCompletion('lab3', 'lab3-ch2');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }

    // Challenge 3: Purity === 100%
    if (evaluation.leafPurity === 100 && !completedChallenges['lab3-ch3']) {
      StorageEngine.recordChallengeCompletion('lab3', 'lab3-ch3');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }
  }, [rootAttr, evaluation.leafPurity, completedChallenges]);

  const handleReset = () => {
    setRootAttr('canFly');
    setLeftAttr('hasFur');
    setRightAttr('legs');
    AudioEngine.playStep();
  };

  const completedCount = ['lab3-ch1', 'lab3-ch2', 'lab3-ch3'].filter(
    id => completedChallenges[id]
  ).length;

  // Active testing animal
  const testAnimal = labData.dataset.find(a => a.id === selectedTestAnimalId) || labData.dataset[0];

  return (
    <div className="space-y-6">
      <LabPhaseHeader
        phase={phase}
        setPhase={handlePhaseChange}
        title={labData.title}
        subtitle={labData.subtitle}
        badge={labData.badge}
        completedCount={completedCount}
        totalCount={labData.challenges.length}
        labId="lab3"
      />

      {phase === 'theory' && (
        <TheoryView
          conceptData={labData.conceptExplanation}
          mediaData={labData.media}
          animationComponent={<SvgDecisionTreeAnimation />}
          onProceedToInteractive={() => handlePhaseChange('interactive')}
        />
      )}

      {phase === 'interactive' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Interactive Tree Visualizer */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">ארגז חול: בניית עץ ההחלטות</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">טוהר מודל:</span>
                    <span className="text-sm font-bold font-mono text-emerald-400">
                      {evaluation.leafPurity}%
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                    title="איפוס עץ"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tree Visual Architecture */}
              <div className="space-y-6">
                {/* Level 0: Root Question */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    שאלת שורש מרכזית
                  </span>
                  <div className="relative inline-block">
                    <select
                      value={rootAttr}
                      onChange={e => { setRootAttr(e.target.value); AudioEngine.playStep(); }}
                      className="appearance-none bg-slate-950 border-2 border-blue-500 hover:border-blue-400 text-white font-bold text-sm px-5 py-2.5 pr-10 rounded-xl cursor-pointer shadow-sm focus:outline-none"
                    >
                      {labData.attributes.map(attr => (
                        <option key={attr.id} value={attr.id} className="bg-slate-900 text-white">
                          {attr.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-blue-400 absolute left-3 top-3.5 pointer-events-none" />
                  </div>
                </div>

                {/* Level 1: Split Branches */}
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-slate-800/80">
                  {/* Left Branch (Yes) */}
                  <div className="flex flex-col items-center p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>אם התשובה היא כן ({evaluation.nodes.leftGroup.count} פריטים)</span>
                    </div>
                    <span className="text-[11px] text-slate-400">שאלת פיצול משנית:</span>
                    <select
                      value={leftAttr}
                      onChange={e => { setLeftAttr(e.target.value); AudioEngine.playStep(); }}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg cursor-pointer"
                    >
                      {labData.attributes.map(attr => (
                        <option key={attr.id} value={attr.id} className="bg-slate-900 text-white">
                          {attr.label}
                        </option>
                      ))}
                    </select>

                    {/* Sub-Leaves Left */}
                    <div className="grid grid-cols-2 gap-2 w-full pt-2">
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block mb-1">כן / כן</span>
                        <div className="text-xs font-bold text-white">
                          {evaluation.nodes.leafLL.items.map(i => i.name).join(', ') || 'ריק'}
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block mb-1">כן / לא</span>
                        <div className="text-xs font-bold text-white">
                          {evaluation.nodes.leafLR.items.map(i => i.name).join(', ') || 'ריק'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Branch (No) */}
                  <div className="flex flex-col items-center p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>אם התשובה היא לא ({evaluation.nodes.rightGroup.count} פריטים)</span>
                    </div>
                    <span className="text-[11px] text-slate-400">שאלת פיצול משנית:</span>
                    <select
                      value={rightAttr}
                      onChange={e => { setRightAttr(e.target.value); AudioEngine.playStep(); }}
                      className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg cursor-pointer"
                    >
                      {labData.attributes.map(attr => (
                        <option key={attr.id} value={attr.id} className="bg-slate-900 text-white">
                          {attr.label}
                        </option>
                      ))}
                    </select>

                    {/* Sub-Leaves Right */}
                    <div className="grid grid-cols-2 gap-2 w-full pt-2">
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block mb-1">לא / כן</span>
                        <div className="text-xs font-bold text-white">
                          {evaluation.nodes.leafRL.items.map(i => i.name).join(', ') || 'ריק'}
                        </div>
                      </div>
                      <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800 text-center">
                        <span className="text-[10px] text-slate-400 block mb-1">לא / לא</span>
                        <div className="text-xs font-bold text-white">
                          {evaluation.nodes.leafRR.items.map(i => i.name).join(', ') || 'ריק'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Single Animal Step-Through Simulator */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-white">בדיקת פריט יחיד בעץ:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {labData.dataset.map(animal => (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => { setSelectedTestAnimalId(animal.id); AudioEngine.playStep(); }}
                        className={`px-2 py-1 rounded text-xs transition-colors ${
                          selectedTestAnimalId === animal.id
                            ? 'bg-blue-600 text-white font-bold'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {animal.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-slate-400 bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                  <span>מסלול עבור <strong>{testAnimal.name}</strong> ({testAnimal.species}):</span>{' '}
                  <span className="text-blue-300 font-mono">
                    שורש [{rootAttr}] $\to$ {testAnimal[rootAttr] ? 'כן' : 'לא'} $\to$ ענף [
                    {testAnimal[rootAttr] ? leftAttr : rightAttr}] $\to$ סיווג סופי.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Challenges & Pedagogical Metrics */}
          <div className="lg:col-span-4 space-y-6">
            {/* Challenges List Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-semibold text-white">אתגרי פיצול וסיווג</h3>
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
