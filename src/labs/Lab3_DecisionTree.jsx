import React, { useState, useEffect, useMemo } from 'react';
import { 
  GitBranch, 
  RotateCcw, 
  Check, 
  Award, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  ChevronDown,
  Info,
  SlidersHorizontal
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { fireConfetti } from '../core/canvas-particles.js';
import { AIService, testTreeAttribute } from '../services/ai.js';
import LabPhaseHeader from '../components/LabPhaseHeader.jsx';
import TheoryView from '../components/TheoryView.jsx';
import SvgDecisionTreeAnimation from '../components/animations/SvgDecisionTreeAnimation.jsx';

const ANIMAL_EMOJIS = {
  cat: '🐱',
  dog: '🐶',
  bat: '🦇',
  eagle: '🦅',
  sparrow: '🐦',
  turtle: '🐢',
  lizard: '🦎',
  ostrich: '🦤'
};

export default function Lab3_DecisionTree({ curriculum }) {
  const labData = curriculum.labs.lab3;

  const [phase, setPhase] = useState(() => StorageEngine.getLabPhase('lab3'));
  // Mode: 'four' (exact 1:1 animal guessing for 4 animals) or 'eight' (classification of 8 animals into 3 classes)
  const [datasetMode, setDatasetMode] = useState('four');
  
  // Unearned initial state so challenges are earned through deliberate actions
  const [rootAttr, setRootAttr] = useState('legs');
  const [leftAttr, setLeftAttr] = useState('canFly');
  const [rightAttr, setRightAttr] = useState('canFly');
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

  // Active dataset depending on mode
  const activeDataset = useMemo(() => {
    if (datasetMode === 'eight' && labData.extendedDataset) {
      return [...labData.dataset, ...labData.extendedDataset];
    }
    return labData.dataset;
  }, [datasetMode, labData.dataset, labData.extendedDataset]);

  // Evaluate the tree using AIService
  const evaluation = useMemo(() => {
    return AIService.evaluateDecisionTree(activeDataset, {
      rootAttr,
      leftAttr,
      rightAttr
    });
  }, [activeDataset, rootAttr, leftAttr, rightAttr]);

  // Challenge evaluation
  useEffect(() => {
    // Challenge 1: Root is canFly
    if (rootAttr === 'canFly' && !completedChallenges['lab3-ch1']) {
      StorageEngine.recordChallengeCompletion('lab3', 'lab3-ch1');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }

    // Challenge 2: Accuracy / Purity >= 75%
    if (evaluation.accuracy >= 75 && !completedChallenges['lab3-ch2']) {
      StorageEngine.recordChallengeCompletion('lab3', 'lab3-ch2');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }

    // Challenge 3: Accuracy / Purity === 100%
    if (evaluation.accuracy === 100 && !completedChallenges['lab3-ch3']) {
      StorageEngine.recordChallengeCompletion('lab3', 'lab3-ch3');
      AudioEngine.playChallengeSuccess();
      fireConfetti();
    }
  }, [rootAttr, evaluation.accuracy, completedChallenges]);

  const handleReset = () => {
    setRootAttr('legs');
    setLeftAttr('canFly');
    setRightAttr('canFly');
    AudioEngine.playStep();
  };

  const completedCount = ['lab3-ch1', 'lab3-ch2', 'lab3-ch3'].filter(
    id => completedChallenges[id]
  ).length;

  // Active testing animal for the simulator
  const testAnimal = activeDataset.find(a => a.id === selectedTestAnimalId) || activeDataset[0];

  // Fixed step-by-step simulator logic using testTreeAttribute (eliminates JS truthy bug on legs)
  const isRootYes = testTreeAttribute(testAnimal, rootAttr);
  const branchAttr = isRootYes ? leftAttr : rightAttr;
  const isBranchYes = testTreeAttribute(testAnimal, branchAttr);
  const leafKey = isRootYes ? (isBranchYes ? 'leafLL' : 'leafLR') : (isBranchYes ? 'leafRL' : 'leafRR');
  const targetLeaf = evaluation.nodes[leafKey];

  const rootLabel = labData.attributes.find(a => a.id === rootAttr)?.label || rootAttr;
  const branchLabel = labData.attributes.find(a => a.id === branchAttr)?.label || branchAttr;

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
          animationComponent={SvgDecisionTreeAnimation}
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
                  <h2 className="text-base font-bold text-white">בניית עץ החלטות בלשי</h2>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Accuracy Badge */}
                  <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                    <span className="text-xs text-slate-400">
                      {datasetMode === 'four' ? 'דיוק זיהוי חיה:' : 'טוהר סיווג למחלקות:'}
                    </span>
                    <span className={`text-sm font-bold font-mono ${
                      evaluation.accuracy === 100 
                        ? 'text-emerald-400' 
                        : evaluation.accuracy >= 75 
                        ? 'text-blue-400' 
                        : 'text-amber-400'
                    }`}>
                      {evaluation.accuracy}%
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
                    title="איפוס שאלות העץ"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Dataset Mode Switcher: 4 Animals vs 8 Animals */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-950/80 rounded-xl border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <SlidersHorizontal className="w-4 h-4 text-blue-400" />
                  <span className="font-semibold">מצב חקירה:</span>
                </div>
                
                <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setDatasetMode('four'); AudioEngine.playStep(); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      datasetMode === 'four'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🎴 משחק "מי אני?" (4 חיות – זיהוי 1:1)
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDatasetMode('eight'); AudioEngine.playStep(); }}
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                      datasetMode === 'eight'
                        ? 'bg-blue-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    🔬 סיווג AI למחלקות (8 חיות – יונקים/עופות/זוחלים)
                  </button>
                </div>
              </div>

              {/* Pedagogical Explanation Pill */}
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-blue-950/20 border border-blue-900/40 text-xs text-blue-200">
                <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  {datasetMode === 'four' ? (
                    <>
                      <strong>מצב "מי אני?":</strong> עץ בעל 2 רמות מייצר 4 עלים. בחרו שאלות מתאימות כדי שכל חיה תקבל <strong>עלה בלעדי משלה</strong> (100% דיוק בזיהוי החיה).
                    </>
                  ) : (
                    <>
                      <strong>מצב למידת מכונה (Machine Learning):</strong> עצי החלטה ממיינים דוגמאות ל<strong>מחלקות יעד</strong> (יונקים, עופות, זוחלים). מדד הטוהר מראה אם בכל עלה יש רק חיות מאותה מחלקה ללא ערבוב.
                    </>
                  )}
                </p>
              </div>

              {/* Tree Visual Architecture */}
              <div className="space-y-6">
                {/* Level 0: Root Question */}
                <div className="flex flex-col items-center">
                  <span className="text-[11px] font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">
                    שאלה ראשונה (לכל {activeDataset.length} החיות)
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-4 border-t border-slate-800/80">
                  {/* Left Branch (Yes) */}
                  <div className="flex flex-col items-center p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>אם התשובה כן ({evaluation.nodes.leftGroup.count} חיות)</span>
                    </div>
                    
                    <span className="text-[11px] text-slate-400 font-medium">שאלת המשך לענף זה:</span>
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
                      {/* Leaf LL: כן / כן */}
                      <div className={`p-3 rounded-lg border text-center space-y-1.5 transition-all ${
                        evaluation.nodes.leafLL.isPure || evaluation.nodes.leafLL.isSingle
                          ? 'bg-emerald-950/30 border-emerald-800/60'
                          : evaluation.nodes.leafLL.count === 0
                          ? 'bg-slate-900/40 border-slate-800'
                          : 'bg-amber-950/30 border-amber-800/60'
                      }`}>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-mono">כן / כן</span>
                          {evaluation.nodes.leafLL.isSingle ? (
                            <span className="text-emerald-400 font-bold">1:1</span>
                          ) : evaluation.nodes.leafLL.isPure ? (
                            <span className="text-emerald-400 font-bold">100% טהור</span>
                          ) : evaluation.nodes.leafLL.count > 0 ? (
                            <span className="text-amber-400 font-bold">מעורב</span>
                          ) : null}
                        </div>
                        
                        <div className="text-xs font-bold text-white">
                          {evaluation.nodes.leafLL.predictedLabel}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
                          {evaluation.nodes.leafLL.items.map(item => (
                            <span key={item.id} className="text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-slate-200" title={`${item.name} (${item.species})`}>
                              {ANIMAL_EMOJIS[item.id] || '🐾'} {item.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Leaf LR: כן / לא */}
                      <div className={`p-3 rounded-lg border text-center space-y-1.5 transition-all ${
                        evaluation.nodes.leafLR.isPure || evaluation.nodes.leafLR.isSingle
                          ? 'bg-emerald-950/30 border-emerald-800/60'
                          : evaluation.nodes.leafLR.count === 0
                          ? 'bg-slate-900/40 border-slate-800'
                          : 'bg-amber-950/30 border-amber-800/60'
                      }`}>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-mono">כן / לא</span>
                          {evaluation.nodes.leafLR.isSingle ? (
                            <span className="text-emerald-400 font-bold">1:1</span>
                          ) : evaluation.nodes.leafLR.isPure ? (
                            <span className="text-emerald-400 font-bold">100% טהור</span>
                          ) : evaluation.nodes.leafLR.count > 0 ? (
                            <span className="text-amber-400 font-bold">מעורב</span>
                          ) : null}
                        </div>
                        
                        <div className="text-xs font-bold text-white">
                          {evaluation.nodes.leafLR.predictedLabel}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
                          {evaluation.nodes.leafLR.items.map(item => (
                            <span key={item.id} className="text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-slate-200" title={`${item.name} (${item.species})`}>
                              {ANIMAL_EMOJIS[item.id] || '🐾'} {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Branch (No) */}
                  <div className="flex flex-col items-center p-4 bg-slate-950/60 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span>אם התשובה לא ({evaluation.nodes.rightGroup.count} חיות)</span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-medium">שאלת המשך לענף זה:</span>
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
                      {/* Leaf RL: לא / כן */}
                      <div className={`p-3 rounded-lg border text-center space-y-1.5 transition-all ${
                        evaluation.nodes.leafRL.isPure || evaluation.nodes.leafRL.isSingle
                          ? 'bg-emerald-950/30 border-emerald-800/60'
                          : evaluation.nodes.leafRL.count === 0
                          ? 'bg-slate-900/40 border-slate-800'
                          : 'bg-amber-950/30 border-amber-800/60'
                      }`}>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-mono">לא / כן</span>
                          {evaluation.nodes.leafRL.isSingle ? (
                            <span className="text-emerald-400 font-bold">1:1</span>
                          ) : evaluation.nodes.leafRL.isPure ? (
                            <span className="text-emerald-400 font-bold">100% טהור</span>
                          ) : evaluation.nodes.leafRL.count > 0 ? (
                            <span className="text-amber-400 font-bold">מעורב</span>
                          ) : null}
                        </div>

                        <div className="text-xs font-bold text-white">
                          {evaluation.nodes.leafRL.predictedLabel}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
                          {evaluation.nodes.leafRL.items.map(item => (
                            <span key={item.id} className="text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-slate-200" title={`${item.name} (${item.species})`}>
                              {ANIMAL_EMOJIS[item.id] || '🐾'} {item.name}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Leaf RR: לא / לא */}
                      <div className={`p-3 rounded-lg border text-center space-y-1.5 transition-all ${
                        evaluation.nodes.leafRR.isPure || evaluation.nodes.leafRR.isSingle
                          ? 'bg-emerald-950/30 border-emerald-800/60'
                          : evaluation.nodes.leafRR.count === 0
                          ? 'bg-slate-900/40 border-slate-800'
                          : 'bg-amber-950/30 border-amber-800/60'
                      }`}>
                        <div className="flex items-center justify-between text-[10px] text-slate-400">
                          <span className="font-mono">לא / לא</span>
                          {evaluation.nodes.leafRR.isSingle ? (
                            <span className="text-emerald-400 font-bold">1:1</span>
                          ) : evaluation.nodes.leafRR.isPure ? (
                            <span className="text-emerald-400 font-bold">100% טהור</span>
                          ) : evaluation.nodes.leafRR.count > 0 ? (
                            <span className="text-amber-400 font-bold">מעורב</span>
                          ) : null}
                        </div>

                        <div className="text-xs font-bold text-white">
                          {evaluation.nodes.leafRR.predictedLabel}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
                          {evaluation.nodes.leafRR.items.map(item => (
                            <span key={item.id} className="text-xs bg-slate-900 px-2 py-0.5 rounded border border-slate-700 text-slate-200" title={`${item.name} (${item.species})`}>
                              {ANIMAL_EMOJIS[item.id] || '🐾'} {item.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Single Animal Step-Through Simulator */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-white">
                      בדקו חיה ספציפית בעץ (משחק "מי אני?"):
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-1.5">
                    {activeDataset.map(animal => (
                      <button
                        key={animal.id}
                        type="button"
                        onClick={() => { setSelectedTestAnimalId(animal.id); AudioEngine.playStep(); }}
                        className={`px-2.5 py-1 rounded-lg text-xs transition-colors flex items-center gap-1 ${
                          selectedTestAnimalId === animal.id
                            ? 'bg-blue-600 text-white font-bold shadow'
                            : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                        }`}
                      >
                        <span>{ANIMAL_EMOJIS[animal.id] || '🐾'}</span>
                        <span>{animal.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Path Display */}
                <div className="text-xs text-slate-300 bg-slate-900/80 p-3 rounded-lg border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span>
                      החיה שנבחרה: <strong>{ANIMAL_EMOJIS[testAnimal.id]} {testAnimal.name}</strong> ({testAnimal.species})
                    </span>
                    <span className="text-[11px] font-mono text-emerald-400">
                      עלה יעד: {targetLeaf?.path || ''}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
                    <span className="text-slate-400">מסלול ההחלטה:</span>
                    
                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-200">
                      1. {rootLabel} ← <strong className={isRootYes ? 'text-emerald-400' : 'text-amber-400'}>{isRootYes ? 'כן' : 'לא'}</strong>
                    </span>

                    <span className="text-slate-500">←</span>

                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800 text-slate-200">
                      2. {branchLabel} ← <strong className={isBranchYes ? 'text-emerald-400' : 'text-amber-400'}>{isBranchYes ? 'כן' : 'לא'}</strong>
                    </span>

                    <span className="text-slate-500">←</span>

                    <span className="bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800 text-emerald-300 font-bold">
                      {targetLeaf?.predictedLabel || 'זיהוי'}
                    </span>
                  </div>
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
                  <h3 className="text-xs font-semibold text-white">אתגרי זיהוי ומיון</h3>
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
