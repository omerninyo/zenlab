import React, { useState } from 'react';
import {
  GitBranch,
  RotateCcw,
  Check,
  AlertTriangle,
  Sparkles,
  Plus,
  X,
  Code2,
  ArrowDownRight,
  ArrowDownLeft
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { testTreeAttribute } from '../services/ai.js';
import LudicLabShell from './LudicLabShell.jsx';

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

const getAnimalEmoji = (animal) => animal?.emoji || ANIMAL_EMOJIS[animal?.id] || '🐾';

const ATTR_SHORT_META = {
  canFly: { icon: '🪽', short: 'עף באוויר?', code: 'if (animal.canFly) // אם עפה באוויר?' },
  hasFur: { icon: '🧶', short: 'יש פרווה?', code: 'if (animal.hasFur) // אם יש פרווה?' },
  legs: { icon: '🐾', short: '4 רגליים?', code: 'if (animal.legs === 4) // אם 4 רגליים?' },
  hasShell: { icon: '🛡️', short: 'יש שריון?', code: 'if (animal.hasShell) // אם יש שריון?' }
};

export default function MatificLab3Trees({
  labData,
  datasetMode = 'four',
  setDatasetMode,
  activeDataset = [],
  rootAttr = 'legs',
  setRootAttr,
  leftAttr = 'canFly',
  setLeftAttr,
  rightAttr = 'canFly',
  setRightAttr,
  selectedTestAnimalId,
  setSelectedTestAnimalId,
  evaluation,
  onOpenAddAnimal,
  onDeleteCustomAnimal,
  onReset,
  completedChallenges = {}
}) {
  const [showXRay, setShowXRay] = useState(true);

  const attributes = labData?.attributes || [
    { id: 'canFly', label: 'האם החיה יכולה לעוף?' },
    { id: 'hasFur', label: 'האם לחיה יש פרווה?' },
    { id: 'legs', label: 'האם לחיה יש 4 רגליים?' },
    { id: 'hasShell', label: 'האם לחיה יש שריון קשיח?' }
  ];

  const testAnimal =
    activeDataset.find(a => a.id === selectedTestAnimalId) || activeDataset[0] || {};

  // Active test animal path calculation
  const isRootYes = testTreeAttribute(testAnimal, rootAttr);
  const activeBranchAttr = isRootYes ? leftAttr : rightAttr;
  const isBranchYes = testTreeAttribute(testAnimal, activeBranchAttr);
  const activeLeafKey = isRootYes
    ? isBranchYes
      ? 'leafLL'
      : 'leafLR'
    : isBranchYes
    ? 'leafRL'
    : 'leafRR';

  // Normalize 4 leaf baskets from evaluation
  const leafNodes = [
    {
      key: 'leafLL',
      title: 'סל איסוף 1',
      chuteLabel: 'כן ↘ כן',
      codePath: `if (animal.${rootAttr}) && if (animal.${leftAttr})`,
      data: evaluation?.nodes?.leafLL || { items: [], count: 0, predictedLabel: 'ריק' }
    },
    {
      key: 'leafLR',
      title: 'סל איסוף 2',
      chuteLabel: 'כן ↘ לא',
      codePath: `if (animal.${rootAttr}) && !if (animal.${leftAttr})`,
      data: evaluation?.nodes?.leafLR || { items: [], count: 0, predictedLabel: 'ריק' }
    },
    {
      key: 'leafRL',
      title: 'סל איסוף 3',
      chuteLabel: 'לא ↙ כן',
      codePath: `!if (animal.${rootAttr}) && if (animal.${rightAttr})`,
      data: evaluation?.nodes?.leafRL || { items: [], count: 0, predictedLabel: 'ריק' }
    },
    {
      key: 'leafRR',
      title: 'סל איסוף 4',
      chuteLabel: 'לא ↙ לא',
      codePath: `!if (animal.${rootAttr}) && !if (animal.${rightAttr})`,
      data: evaluation?.nodes?.leafRR || { items: [], count: 0, predictedLabel: 'ריק' }
    }
  ];

  const playAnimalChime = (idx) => {
    const notes = [329.63, 392.0, 440.0, 523.25, 587.33, 659.25, 783.99, 880.0];
    const freq = notes[idx % notes.length] || 440;
    AudioEngine.playTone(freq, 'sine', 0.14);
  };

  const accuracy = evaluation?.accuracy || 0;
  const robotMood =
    accuracy === 100 ? 'celebrating' : accuracy >= 75 ? 'happy' : 'thinking';

  const stationStatus =
    accuracy === 100
      ? 'מיון מושלם! 100% דיוק 🏆'
      : `דיוק מכונת המיון: ${accuracy}%`;

  const stationMessage =
    accuracy === 100
      ? 'כל החיות התמיינו לסלים הנכונים ללא שום בלבול!'
      : `כוונו את מתגי השאלות בעץ כדי להפריד את החיות לסלים טהורים (${getAnimalEmoji(
          testAnimal
        )} ${testAnimal.name} נמצאת כעת במסלול המואר).`;

  const stars = [
    {
      id: 'lab3_challenge1',
      done: !!completedChallenges['lab3_challenge1'],
      label: 'כוכב 1: בחירת שאלת שורש (תעופה)'
    },
    {
      id: 'lab3_challenge2',
      done: !!completedChallenges['lab3_challenge2'],
      label: 'כוכב 2: הגעה ל-75% דיוק לפחות'
    },
    {
      id: 'lab3_challenge3',
      done: !!completedChallenges['lab3_challenge3'],
      label: 'כוכב 3: מיון מושלם של 100%'
    }
  ];

  const getAttrLabel = (attrId) =>
    attributes.find(a => a.id === attrId)?.label || attrId;

  return (
    <LudicLabShell
      stationBadge="מעבדת הביולוגיה של זֶן"
      stationStatus={stationStatus}
      stationMessage={stationMessage}
      StationIcon={GitBranch}
      isBeamActive={accuracy === 100}
      robotMood={robotMood}
      stars={stars}
      theoryTitle="איך עץ החלטות ממיין מידע?"
      theoryText="עץ החלטות פועל כמו מכונת מגלשות חכמה! בכל צומת המחשב שואל שאלת כן/לא (תנאי IF/ELSE). אם התשובה היא 'כן' (True) החיה מחליקה למגלשה הימנית, ואם 'לא' (False) – לשמאלית, עד שהיא נוחתת בסל הזיהוי הסופי!"
      chassisTitle="מכונת המיון הביולוגית של זֶן • עץ החלטות חי"
      ChassisIcon={GitBranch}
      showXRay={showXRay}
      onToggleXRay={setShowXRay}
      xRayLabel="עדשת תנאים [IF/ELSE]"
    >
      <div className="space-y-5">
        {/* 1. Top Selector Bar: Dataset Mode + Add Custom Animal + Accuracy & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/85 p-3.5 rounded-2xl border border-white/10">
          {/* Dataset Mode Toggle */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-white/10">
            <button
              type="button"
              onClick={() => {
                setDatasetMode('four');
                AudioEngine.playStep();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                datasetMode === 'four'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🎴 4 חיות בסיס (זיהוי 1:1)
            </button>
            <button
              type="button"
              onClick={() => {
                setDatasetMode('eight');
                AudioEngine.playStep();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                datasetMode === 'eight'
                  ? 'bg-amber-400 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              🔬 8 חיות אתגר (מחלקות)
            </button>
          </div>

          {/* Right Controls: Add Animal + Accuracy Pill + Reset */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenAddAnimal && (
              <button
                type="button"
                onClick={() => {
                  onOpenAddAnimal();
                  AudioEngine.playStep();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 border border-amber-400/50 text-amber-300 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ הוספת חיה חדשה</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 bg-indigo-950/90 px-3 py-1.5 rounded-xl border border-indigo-400/40">
              <span className="text-xs text-indigo-200 font-bold">מדד דיוק:</span>
              <span
                className={`text-xs sm:text-sm font-mono font-black ${
                  accuracy === 100
                    ? 'text-emerald-400'
                    : accuracy >= 75
                    ? 'text-amber-300'
                    : 'text-rose-300'
                }`}
              >
                {accuracy}%
              </span>
            </div>

            {onReset && (
              <button
                type="button"
                onClick={onReset}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/15 transition-all cursor-pointer active:scale-95"
                title="איפוס מתגי השאלות"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2. Animal Test Selector Row */}
        <div className="bg-slate-950/75 p-3.5 rounded-2xl border border-indigo-500/30 space-y-2.5">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>בחרו חיה לבדיקה במגלשות המיון (מסלול החיה יואר בזהב!):</span>
            </span>
            <span className="text-[11px] text-indigo-200 font-bold">
              נבחרה כעת: {getAnimalEmoji(testAnimal)} {testAnimal.name} ({testAnimal.species})
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {activeDataset.map((animal, idx) => {
              const isSelected = animal.id === testAnimal.id;
              const isCustom = Boolean(animal.isCustom);

              return (
                <div key={animal.id} className="inline-flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTestAnimalId(animal.id);
                      playAnimalChime(idx);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-black transition-colors cursor-pointer ${
                      isCustom ? 'rounded-r-xl' : 'rounded-xl'
                    } ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-300 to-amber-400 text-slate-950 border-2 border-white shadow-[0_0_16px_rgba(251,191,36,0.8)]'
                        : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-2 border-slate-700'
                    }`}
                  >
                    <span className="text-base">{getAnimalEmoji(animal)}</span>
                    <span>{animal.name}</span>
                  </button>
                  {isCustom && onDeleteCustomAnimal && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCustomAnimal(animal.id);
                      }}
                      className="px-2 py-1.5 rounded-l-xl bg-rose-950/80 hover:bg-rose-700 text-rose-200 border-y border-l border-rose-500/40 text-xs cursor-pointer"
                      title="מחיקת חיה מותאמת אישית"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. The Sorting Machine (Tree Blueprint - Constant Geometry) */}
        <div className="relative bg-slate-950/90 p-4 sm:p-6 rounded-3xl border-2 border-indigo-500/30 shadow-inner space-y-6">
          {/* LEVEL 0: ROOT NODE SWITCH */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-xl bg-gradient-to-b from-indigo-900/90 to-slate-900 p-4 rounded-3xl border-3 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.3)] space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2 min-h-[26px]">
                <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950">
                  שער מיון ראשי (Root Node) • כל {activeDataset.length} החיות
                </span>
                <code
                  className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg border transition-opacity ${
                    showXRay
                      ? 'text-amber-300 bg-slate-950/90 border-amber-400/40 opacity-100'
                      : 'text-slate-400 bg-slate-950/50 border-white/10 opacity-75'
                  }`}
                >
                  {showXRay
                    ? ATTR_SHORT_META[rootAttr]?.code || `if (animal.${rootAttr})`
                    : `בדיקה: ${ATTR_SHORT_META[rootAttr]?.short || rootAttr}`}
                </code>
              </div>

              <div className="text-center text-sm sm:text-base font-black text-white">
                {getAttrLabel(rootAttr)}
              </div>

              {/* Tactile Switch Buttons for Root Attribute */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {attributes.map((attr) => {
                  const active = rootAttr === attr.id;
                  const meta = ATTR_SHORT_META[attr.id] || { icon: '❓', short: attr.label };
                  return (
                    <button
                      key={attr.id}
                      type="button"
                      onClick={() => {
                        setRootAttr(attr.id);
                        AudioEngine.playStep();
                      }}
                      className={`flex flex-col items-center justify-center py-2 px-2 rounded-xl border-2 text-xs font-black transition-colors cursor-pointer ${
                        active
                          ? 'bg-amber-400 text-slate-950 border-white shadow-md'
                          : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span className="text-base">{meta.icon}</span>
                      <span>{meta.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Downward Glowing Chutes from Root: כן (True) ↘ and לא (False) ↙ */}
            <div className="grid grid-cols-2 gap-6 sm:gap-16 w-full max-w-2xl mt-3 px-4">
              {/* Right side in RTL = Left Branch (YES / True) */}
              <div
                className={`h-11 flex items-center justify-center gap-2 px-3 rounded-2xl border-2 font-black text-xs sm:text-sm transition-colors ${
                  isRootYes
                    ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_20px_rgba(251,191,36,0.9)]'
                    : 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40'
                }`}
              >
                <span>כן (True) ↘</span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-black/20">
                  ({evaluation?.nodes?.leftGroup?.count || 0})
                </span>
                {isRootYes && (
                  <span className="text-base">{getAnimalEmoji(testAnimal)}</span>
                )}
              </div>

              {/* Left side in RTL = Right Branch (NO / False) */}
              <div
                className={`h-11 flex items-center justify-center gap-2 px-3 rounded-2xl border-2 font-black text-xs sm:text-sm transition-colors ${
                  !isRootYes
                    ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_20px_rgba(251,191,36,0.9)]'
                    : 'bg-rose-950/50 text-rose-300 border-rose-500/40'
                }`}
              >
                <span>לא (False) ↙</span>
                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-black/20">
                  ({evaluation?.nodes?.rightGroup?.count || 0})
                </span>
                {!isRootYes && (
                  <span className="text-base">{getAnimalEmoji(testAnimal)}</span>
                )}
              </div>
            </div>
          </div>

          {/* LEVEL 1: LEFT (TRUE) & RIGHT (FALSE) BRANCH SWITCHES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Branch 1: When Root is YES (True) */}
            <div
              className={`p-4 rounded-3xl border-2 transition-colors space-y-3 ${
                isRootYes
                  ? 'bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.25)]'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-1.5 min-h-[24px]">
                <span className="text-xs font-black text-emerald-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span>מתג ענף &quot;כן&quot; ({evaluation?.nodes?.leftGroup?.count || 0} חיות)</span>
                </span>
                <code className="text-[11px] font-mono font-bold text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-amber-400/30">
                  {showXRay
                    ? ATTR_SHORT_META[leftAttr]?.code || `if (animal.${leftAttr})`
                    : ATTR_SHORT_META[leftAttr]?.short || leftAttr}
                </code>
              </div>

              <div className="text-xs sm:text-sm font-black text-white text-center">
                {getAttrLabel(leftAttr)}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {attributes.map((attr) => {
                  const active = leftAttr === attr.id;
                  const meta = ATTR_SHORT_META[attr.id] || { icon: '❓', short: attr.label };
                  return (
                    <button
                      key={attr.id}
                      type="button"
                      onClick={() => {
                        setLeftAttr(attr.id);
                        AudioEngine.playStep();
                      }}
                      className={`flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl border-2 text-[11px] font-black transition-colors cursor-pointer ${
                        active
                          ? 'bg-emerald-400 text-slate-950 border-white shadow-md'
                          : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Branch 2: When Root is NO (False) */}
            <div
              className={`p-4 rounded-3xl border-2 transition-colors space-y-3 ${
                !isRootYes
                  ? 'bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.25)]'
                  : 'bg-slate-900/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between flex-wrap gap-1.5 min-h-[24px]">
                <span className="text-xs font-black text-rose-300 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                  <span>מתג ענף &quot;לא&quot; ({evaluation?.nodes?.rightGroup?.count || 0} חיות)</span>
                </span>
                <code className="text-[11px] font-mono font-bold text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-amber-400/30">
                  {showXRay
                    ? ATTR_SHORT_META[rightAttr]?.code || `if (animal.${rightAttr})`
                    : ATTR_SHORT_META[rightAttr]?.short || rightAttr}
                </code>
              </div>

              <div className="text-xs sm:text-sm font-black text-white text-center">
                {getAttrLabel(rightAttr)}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {attributes.map((attr) => {
                  const active = rightAttr === attr.id;
                  const meta = ATTR_SHORT_META[attr.id] || { icon: '❓', short: attr.label };
                  return (
                    <button
                      key={attr.id}
                      type="button"
                      onClick={() => {
                        setRightAttr(attr.id);
                        AudioEngine.playStep();
                      }}
                      className={`flex flex-col items-center justify-center py-1.5 px-1.5 rounded-xl border-2 text-[11px] font-black transition-colors cursor-pointer ${
                        active
                          ? 'bg-rose-400 text-slate-950 border-white shadow-md'
                          : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                      }`}
                    >
                      <span>{meta.icon}</span>
                      <span>{meta.short}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* LEVEL 2: 4 COLLECTION BASKETS AT THE BOTTOM (Constant Height) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
            {leafNodes.map((leaf) => {
              const leafData = leaf.data;
              const isClean =
                datasetMode === 'four'
                  ? leafData.isSingle
                  : leafData.isPure && leafData.count > 0;
              const isMixed = leafData.count > 0 && !isClean;
              const isActiveTarget = activeLeafKey === leaf.key;

              return (
                <div
                  key={leaf.key}
                  className={`relative p-3.5 rounded-2xl border-2 flex flex-col justify-between gap-2.5 transition-colors ${
                    isActiveTarget
                      ? 'bg-gradient-to-b from-amber-400/25 via-slate-900 to-slate-950 border-amber-300 shadow-[0_0_24px_rgba(251,191,36,0.45)] z-10'
                      : isClean
                      ? 'bg-emerald-950/35 border-emerald-500/60'
                      : isMixed
                      ? 'bg-rose-950/35 border-rose-500/60'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  {/* Basket Header */}
                  <div className="flex items-center justify-between gap-1 min-h-[24px]">
                    <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded-md bg-black/40 text-indigo-200 border border-white/10">
                      {leaf.chuteLabel}
                    </span>

                    {isClean && (
                      <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                        <span>{datasetMode === 'four' ? 'זיהוי 1:1' : 'סל טהור'}</span>
                      </span>
                    )}

                    {isMixed && (
                      <span className="flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                        <AlertTriangle className="w-3 h-3" />
                        <span>מעורב!</span>
                      </span>
                    )}
                  </div>

                  {/* X-Ray Code Path (Always mounted at fixed height so toggling X-Ray never shifts basket height!) */}
                  <code className="text-[10px] font-mono text-amber-300/90 bg-black/40 px-2 py-1 rounded border border-white/5 truncate block">
                    {showXRay ? leaf.codePath : `${leaf.title} (${leaf.chuteLabel})`}
                  </code>

                  {/* Predicted Class / Animal Label */}
                  <div className="text-center py-0.5">
                    <div className="text-xs font-black text-white">
                      {leafData.predictedLabel}
                    </div>
                  </div>

                  {/* Animals in Basket */}
                  <div className="min-h-[48px] p-2 rounded-xl bg-black/40 border border-white/5 flex flex-wrap items-center justify-center gap-1.5">
                    {leafData.items.length === 0 ? (
                      <span className="text-[11px] text-slate-500">סל ריק</span>
                    ) : (
                      leafData.items.map((item) => {
                        const isTestItem = item.id === testAnimal.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setSelectedTestAnimalId(item.id);
                              AudioEngine.playStep();
                            }}
                            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              isTestItem
                                ? 'bg-amber-400 text-slate-950 ring-2 ring-white font-black shadow-md'
                                : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                            }`}
                            title={`${item.name} (${item.species})`}
                          >
                            <span>{getAnimalEmoji(item)}</span>
                            <span>{item.name}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Bottom Live Telemetry & X-Ray Boolean Attribute Table (Constant Height) */}
        <div className="w-full p-4 bg-slate-950/90 rounded-2xl border-2 border-indigo-500/30 space-y-2.5 shadow-inner">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-300">
              <Code2 className="w-4 h-4 text-amber-400" />
              <span>
                כרטיס הנתונים של {getAnimalEmoji(testAnimal)} {testAnimal.name} (מחלקה: {testAnimal.species})
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-lg border border-emerald-500/40">
              מסלול פעיל: {isRootYes ? 'כן (True)' : 'לא (False)'} ←{' '}
              {isBranchYes ? 'כן (True)' : 'לא (False)'}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-black/50 border border-white/10 font-mono text-xs text-indigo-200 flex flex-wrap items-center justify-center gap-3 sm:gap-5">
            <span>
              רגליים: <strong className="text-amber-300">{testAnimal.legs ?? 4}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              עף: <strong className="text-amber-300">{showXRay ? String(Boolean(testAnimal.canFly)) : (testAnimal.canFly ? 'כן' : 'לא')}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              פרווה: <strong className="text-amber-300">{showXRay ? String(Boolean(testAnimal.hasFur)) : (testAnimal.hasFur ? 'כן' : 'לא')}</strong>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              שריון: <strong className="text-amber-300">{showXRay ? String(Boolean(testAnimal.hasShell)) : (testAnimal.hasShell ? 'כן' : 'לא')}</strong>
            </span>
          </div>
        </div>
      </div>
    </LudicLabShell>
  );
}
