import React, { useState, useEffect, useMemo } from 'react';
import { 
  Binary, 
  RotateCcw, 
  Copy, 
  Check, 
  Award, 
  Info, 
  BookOpen, 
  Eye, 
  Sparkles,
  Layers
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { fireConfetti } from '../core/canvas-particles.js';

export default function Lab1_BinaryPixels({ curriculum }) {
  const labData = curriculum.labs.lab1;
  const [grid, setGrid] = useState(() => new Array(64).fill(0));
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('lab'); // 'lab' | 'theory' | 'glossary'
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
  }, [grid, completedChallenges, labData, activeCount]);

  const togglePixel = (index) => {
    const nextGrid = [...grid];
    const nextVal = nextGrid[index] === 1 ? 0 : 1;
    nextGrid[index] = nextVal;
    setGrid(nextGrid);
    AudioEngine.playToggle(nextVal === 1);
  };

  const loadPreset = (presetKey) => {
    const preset = labData.presets[presetKey];
    if (preset) {
      setGrid([...preset.grid]);
      AudioEngine.playCollect();
    }
  };

  const clearGrid = () => {
    setGrid(new Array(64).fill(0));
    AudioEngine.playStep();
  };

  const invertGrid = () => {
    setGrid(grid.map(b => (b === 1 ? 0 : 1)));
    AudioEngine.playStep();
  };

  const copyBinary = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(binaryString).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {labData.badge}
              </span>
              <span className="text-xs text-slate-400">מעבדה {labData.number} מתוך 4</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{labData.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{labData.subtitle}</p>
          </div>

          {/* Sub Navigation Tabs */}
          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('lab')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'lab' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>מרחב הניסוי</span>
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'theory' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>הסבר מדעי</span>
            </button>
            <button
              onClick={() => setActiveTab('glossary')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'glossary' 
                  ? 'bg-slate-800 text-white shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>מילון מונחים</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Layout */}
      {activeTab === 'lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Interactive Matrix Column */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center">
            <div className="w-full flex items-center justify-between mb-4">
              <div className="text-xs font-medium text-slate-400">
                מטריצת 8x8 (סה״כ 64 פיקסלים)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">דולקים:</span>
                <span className="text-xs font-mono font-semibold text-white bg-slate-800 px-2 py-0.5 rounded">
                  {activeCount} / 64
                </span>
              </div>
            </div>

            {/* 8x8 Grid Canvas */}
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner">
              <div 
                className="grid grid-cols-8 gap-1.5 w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96"
                role="grid"
                aria-label="מטריצת פיקסלים בינארית 8x8"
              >
                {grid.map((bit, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => togglePixel(idx)}
                    aria-label={`פיקסל ${idx + 1}, מצב: ${bit === 1 ? 'דולק' : 'כבוי'}`}
                    className={`rounded transition-all duration-100 flex items-center justify-center font-mono text-[10px] ${
                      bit === 1
                        ? 'bg-blue-500 text-white font-bold border border-blue-400'
                        : 'bg-slate-900 text-slate-600 hover:bg-slate-800 border border-slate-800/80'
                    }`}
                  >
                    {bit}
                  </button>
                ))}
              </div>
            </div>

            {/* Preset Controls */}
            <div className="w-full flex flex-wrap items-center justify-center gap-2 mt-6">
              <button
                type="button"
                onClick={() => loadPreset('heart')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                תבנית לב
              </button>
              <button
                type="button"
                onClick={() => loadPreset('smiley')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                תבנית סמיילי
              </button>
              <button
                type="button"
                onClick={() => loadPreset('sword')}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                תבנית חרב
              </button>
              <button
                type="button"
                onClick={invertGrid}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
              >
                היפוך צבעים
              </button>
              <button
                type="button"
                onClick={clearGrid}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>איפוס</span>
              </button>
            </div>
          </div>

          {/* Encodings & Challenges Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Binary & Hex Representation */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Binary className="w-4 h-4 text-blue-400" />
                  <h3 className="text-sm font-semibold text-white">ייצוג בזיכרון המחשב</h3>
                </div>
                <button
                  type="button"
                  onClick={copyBinary}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'הועתק!' : 'העתק רצף'}</span>
                </button>
              </div>

              {/* 64-bit Binary stream */}
              <div>
                <div className="text-[11px] font-medium text-slate-400 mb-1.5">
                  רצף 64 ביט (8 בייטים רציפים):
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 break-all leading-relaxed tracking-wider select-all">
                  {binaryString.match(/.{1,8}/g)?.map((byte, i) => (
                    <span key={i} className="inline-block mr-2 text-slate-300">
                      <span className="text-slate-500 text-[10px] ml-1">B{i + 1}:</span>
                      {byte}
                    </span>
                  ))}
                </div>
              </div>

              {/* Hexadecimal representation */}
              <div>
                <div className="text-[11px] font-medium text-slate-400 mb-1.5">
                  קידוד הקסדצימלי (Hex):
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 flex flex-wrap gap-2 select-all">
                  {hexBytes.map((hex, i) => (
                    <span key={i} className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      0x{hex}
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
      )}

      {/* Theory Tab */}
      {activeTab === 'theory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white mb-2">תמצית הרעיון המדעי</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {labData.conceptExplanation.summary}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">נקודות מפתח להבנה:</h4>
            <ul className="space-y-2">
              {labData.conceptExplanation.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-1">אנלוגיה מהעולם הממשי:</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {labData.conceptExplanation.realWorldAnalogy}
            </p>
          </div>
        </div>
      )}

      {/* Glossary Tab */}
      {activeTab === 'glossary' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">מילון מונחי מחשוב וביטים</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labData.glossary.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-xs font-bold text-blue-400 mb-1">{item.term}</div>
                <div className="text-xs text-slate-300 leading-relaxed">{item.definition}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
