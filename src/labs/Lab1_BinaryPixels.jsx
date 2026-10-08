import React, { useState, useEffect, useMemo } from 'react';
import { 
  Binary, 
  RotateCcw, 
  Copy, 
  Check, 
  Award, 
  Info, 
  BookOpen, 
  Sliders, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { fireConfetti } from '../core/canvas-particles.js';
import LabPhaseHeader from '../components/LabPhaseHeader.jsx';
import TheoryView from '../components/TheoryView.jsx';
import SvgBinaryAnimation from '../components/animations/SvgBinaryAnimation.jsx';
import SvgLogicGatesAnimation from '../components/animations/SvgLogicGatesAnimation.jsx';

export default function Lab1_BinaryPixels({ curriculum }) {
  const labData = curriculum.labs.lab1;

  // Phase state: 'theory' | 'interactive'
  const [phase, setPhase] = useState(() => StorageEngine.getLabPhase('lab1'));
  const [grid, setGrid] = useState(() => new Array(64).fill(0));
  const [copied, setCopied] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState(() => {
    return StorageEngine.getState().completedChallenges;
  });

  useEffect(() => {
    const unsub = StorageEngine.subscribe(state => {
      setCompletedChallenges(state.completedChallenges);
    });
    return unsub;
  }, []);

  // Compute 64-bit binary string
  const binaryString = useMemo(() => grid.join(''), [grid]);

  // Compute 8 bytes in Hexadecimal
  const hexBytes = useMemo(() => {
    const bytes = [];
    for (let row = 0; row < 8; row++) {
      const rowBits = grid.slice(row * 8, row * 8 + 8).join('');
      const byteVal = parseInt(rowBits, 2);
      bytes.push(byteVal.toString(16).toUpperCase().padStart(2, '0'));
    }
    return bytes;
  }, [grid]);

  const activeCount = useMemo(() => grid.filter(b => b === 1).length, [grid]);

  // Check challenges whenever grid changes
  useEffect(() => {
    // Challenge 1: Match Heart
    const heartPreset = labData.presets.heart.grid;
    const isHeart = heartPreset.every((val, i) => val === grid[i]);
    if (isHeart && !completedChallenges['lab1_challenge1']) {
      const res = StorageEngine.completeChallenge('lab1', 'lab1_challenge1', 1);
      if (res.isNew) {
        AudioEngine.playSuccess();
        fireConfetti();
      }
    }

    // Challenge 2: Match Smiley
    const smileyPreset = labData.presets.smiley.grid;
    const isSmiley = smileyPreset.every((val, i) => val === grid[i]);
    if (isSmiley && !completedChallenges['lab1_challenge2']) {
      const res = StorageEngine.completeChallenge('lab1', 'lab1_challenge2', 1);
      if (res.isNew) {
        AudioEngine.playSuccess();
        fireConfetti();
      }
    }

    // Challenge 3: Min 14 pixels (custom initial or symbol)
    if (activeCount >= 14 && activeCount < 58 && !completedChallenges['lab1_challenge3']) {
      const res = StorageEngine.completeChallenge('lab1', 'lab1_challenge3', 1);
      if (res.isNew) {
        AudioEngine.playSuccess();
        fireConfetti();
      }
    }
  }, [grid, activeCount, completedChallenges, labData]);

  const handleCellClick = (index) => {
    const nextGrid = [...grid];
    const nextVal = nextGrid[index] === 1 ? 0 : 1;
    nextGrid[index] = nextVal;
    setGrid(nextGrid);
    AudioEngine.playToggle(nextVal === 1);
  };

  const handleApplyPreset = (presetKey) => {
    const preset = labData.presets[presetKey];
    if (preset && preset.grid) {
      setGrid([...preset.grid]);
      AudioEngine.playCollect();
    }
  };

  const handleClear = () => {
    setGrid(new Array(64).fill(0));
    AudioEngine.playStep();
  };

  const handleInvert = () => {
    setGrid(grid.map(b => b === 1 ? 0 : 1));
    AudioEngine.playStep();
  };

  const handleCopyBinary = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(binaryString);
      setCopied(true);
      AudioEngine.playTone(880, 'sine', 0.08);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const earnedStars = (completedChallenges['lab1_challenge1'] ? 1 : 0) +
                      (completedChallenges['lab1_challenge2'] ? 1 : 0) +
                      (completedChallenges['lab1_challenge3'] ? 1 : 0);

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
            { id: 'binary', label: 'ביטים ופיקסלים', component: SvgBinaryAnimation },
            { id: 'gates', label: 'שערים לוגיים ומחבר בינארי', component: SvgLogicGatesAnimation }
          ]}
          onProceedToInteractive={() => {
            setPhase('interactive');
            StorageEngine.setLabPhase('lab1', 'interactive');
            AudioEngine.playStep();
          }}
        />
      )}

      {/* Phase 2: Interactive Simulator */}
      {phase === 'interactive' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 8x8 Grid Workspace */}
            <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 sm:p-6 flex flex-col items-center shadow-xs">
              {/* Presets and Controls Bar */}
              <div className="w-full flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
                  <span className="text-xs text-slate-400 font-medium shrink-0">תבניות:</span>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('heart')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors shrink-0"
                  >
                    לב
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('smiley')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors shrink-0"
                  >
                    סמיילי
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset('sword')}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 border border-slate-700 transition-colors shrink-0"
                  >
                    חרב
                  </button>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleInvert}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 border border-slate-700 transition-colors"
                  >
                    היפוך
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                    title="נקה מטריצה"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>איפוס</span>
                  </button>
                </div>
              </div>

              {/* 8x8 Pixel Matrix Canvas */}
              <div className="p-2 sm:p-3 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
                <div 
                  className="grid grid-cols-8 gap-1 sm:gap-1.5 w-[250px] h-[250px] sm:w-[340px] sm:h-[340px] select-none"
                  dir="ltr"
                >
                  {grid.map((cellValue, idx) => {
                    const isLit = cellValue === 1;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleCellClick(idx)}
                        aria-label={`פיקסל ${idx}: ${isLit ? 'דולק' : 'כבוי'}`}
                        className={`rounded-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:ring-offset-slate-950 ${
                          isLit
                            ? 'bg-slate-100 text-slate-900 border border-white shadow-sm'
                            : 'bg-slate-900 text-slate-600 hover:bg-slate-800/80 border border-slate-800'
                        }`}
                      >
                        <span className="text-[10px] font-mono font-semibold select-none">
                          {cellValue}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Counter / Metrics Bar */}
              <div className="w-full flex items-center justify-between text-xs text-slate-400 mt-4 px-2">
                <span>פיקסלים דולקים: <strong className="text-white font-mono">{activeCount}</strong> מתוך 64</span>
                <span>גודל זיכרון תמונה: <strong className="text-blue-400 font-mono">8 Bytes</strong></span>
              </div>
            </div>

            {/* Binary & Hex Codec Stream Column */}
            <div className="lg:col-span-5 space-y-6">
              {/* Live Binary Encoding Output */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Binary className="w-4 h-4 text-blue-400" />
                    <h3 className="text-sm font-semibold text-white">מחרוזת בינארית מלאה (64-Bit)</h3>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyBinary}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors bg-slate-800 px-2 py-1 rounded border border-slate-700"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'הועתק!' : 'העתק'}</span>
                  </button>
                </div>

                <div 
                  className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 break-all leading-relaxed tracking-wider select-all"
                  dir="ltr"
                >
                  {binaryString.match(/.{1,8}/g)?.map((chunk, i) => (
                    <span key={i} className="inline-block mr-2 text-slate-300">
                      {chunk}
                    </span>
                  ))}
                </div>

                {/* Hexadecimal Encoding View */}
                <div>
                  <div className="text-xs font-medium text-slate-400 mb-2">ייצוג הקסדצימלי (8 בייטים):</div>
                  <div className="flex flex-wrap gap-2" dir="ltr">
                    {hexBytes.map((byte, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded bg-slate-950 text-blue-400 font-mono text-xs border border-slate-800"
                      >
                        0x{byte}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Challenges Card */}
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
                              {challenge.hint && (
                                <p className="text-[10px] text-slate-500 mt-1 italic">
                                  רמז: {challenge.hint}
                                </p>
                              )}
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
