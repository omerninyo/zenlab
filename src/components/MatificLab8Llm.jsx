import React, { useState } from 'react';
import {
  Sparkles,
  MessageSquare,
  RotateCcw,
  Flame,
  Snowflake,
  Sun,
  Dices,
  BookOpen
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import LudicLabShell from './LudicLabShell.jsx';

export default function MatificLab8Llm({
  labData,
  selectedPromptId,
  activePrompt,
  temperature,
  generatedTokens,
  tokenDistribution,
  completedChallenges = {},
  onSelectPrompt,
  onChangeTemperature,
  onAppendToken,
  onPredictNext,
  onReset
}) {
  const [showXRay, setShowXRay] = useState(true);
  const [lastSampledToken, setLastSampledToken] = useState(null);

  const isCh1Done = Boolean(completedChallenges['lab8_challenge1']);
  const isCh2Done = Boolean(completedChallenges['lab8_challenge2']);
  const isCh3Done = Boolean(completedChallenges['lab8_challenge3']);

  const stars = [
    { id: 'lab8_challenge1', done: isCh1Done, label: 'חיזוי קפוא ומדויק (0.0)' },
    { id: 'lab8_challenge2', done: isCh2Done, label: 'ניצוץ יצירתי וחם (0.9+)' },
    { id: 'lab8_challenge3', done: isCh3Done, label: 'בניית סיפור של 4 מילים' }
  ];

  const allDone = isCh1Done && isCh2Done && isCh3Done;

  // Thermal state: 'icy' | 'balanced' | 'fiery'
  const thermalMode =
    temperature <= 0.15 ? 'icy' : temperature >= 0.9 ? 'fiery' : 'balanced';

  const handleCapsuleClick = (token) => {
    setLastSampledToken(token);
    onAppendToken(token);
  };

  const handleRollNext = () => {
    onPredictNext();
  };

  const tempPresets = [
    { value: 0.0, label: '❄️ קפוא ומדויק (0.0)', mode: 'icy' },
    { value: 0.7, label: '🌤️ מאוזן (0.7)', mode: 'balanced' },
    { value: 1.2, label: '🔥 יצירתי ופרוע (1.2)', mode: 'fiery' }
  ];

  return (
    <LudicLabShell
      stationBadge="מכונת השפה של זֶן"
      stationStatus={
        thermalMode === 'icy'
          ? 'מצב קפוא ומדויק ❄️ (T=0.0)'
          : thermalMode === 'fiery'
          ? `מצב יצירתי ופרוע 🔥 (T=${temperature.toFixed(2)})`
          : `מצב מאוזן 🌤️ (T=${temperature.toFixed(2)})`
      }
      stationMessage={
        generatedTokens.length === 0
          ? 'בחרו טמפרטורה בידית התרמית ולחצו על "הגרל את המילה הבאה 🎲" או על אחת מקפסולות המילים!'
          : `הסיפור של זֶן כולל כעת ${generatedTokens.length} מילים חדשות! המשיכו להגריל מילים או שנו את מד החום.`
      }
      StationIcon={MessageSquare}
      isBeamActive={generatedTokens.length >= 4 || allDone}
      robotMood={allDone ? 'celebrating' : thermalMode === 'fiery' ? 'thinking' : 'happy'}
      stars={stars}
      theoryTitle="איך מודל שפה (LLM) ממציא סיפורים מילה אחרי מילה?"
      theoryText="מודלי שפה ענקיים (כמו Gemini או ChatGPT) לא יודעים מראש את כל המשפט שהם יכתבו! בכל צעד הם מחשבים אחוז סיכוי (הסתברות Softmax P%) לכל מילה אפשרית במילון. ידית ה'טמפרטורה' קובעת איך לבחור מתוך הגלגל: בטמפרטורה 0.0 (קפוא) המחשב בוחר תמיד במילה עם הסיכוי הכי גבוה (100%). בטמפרטורה גבוהה (חם אש!) הסיכויים מתאזנים ונותנים הזדמנות גם למילים מפתיעות ויצירתיות!"
      chassisTitle="מכונת הסיפורים התרמית של זֶן • חיזוי המילה הבאה וטמפרטורה"
      ChassisIcon={Sparkles}
      showXRay={showXRay}
      onToggleXRay={setShowXRay}
      xRayLabel="עדשת הסתברויות [P%]"
    >
      <div className="space-y-5">
        {/* Main Dual Chamber: Thermal Dial + Token Probability Capsules */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Left/Right Chamber 1: ידית הטמפרטורה התרמית (Thermal Dial) */}
          <div
            className={`lg:col-span-5 rounded-3xl border-2 p-4 sm:p-5 flex flex-col justify-between space-y-4 transition-all duration-300 shadow-xl ${
              thermalMode === 'icy'
                ? 'bg-cyan-950/35 border-cyan-400/60 shadow-[0_0_25px_rgba(34,211,238,0.2)]'
                : thermalMode === 'fiery'
                ? 'bg-amber-950/35 border-amber-400/70 shadow-[0_0_25px_rgba(251,191,36,0.25)]'
                : 'bg-slate-950/90 border-indigo-400/50'
            }`}
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  {thermalMode === 'icy' ? (
                    <Snowflake className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
                  ) : thermalMode === 'fiery' ? (
                    <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
                  ) : (
                    <Sun className="w-4 h-4 text-indigo-300" />
                  )}
                  <span>1. ידית הטמפרטורה התרמית</span>
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-black border ${
                    thermalMode === 'icy'
                      ? 'bg-cyan-400 text-slate-950 border-cyan-200'
                      : thermalMode === 'fiery'
                      ? 'bg-amber-400 text-slate-950 border-amber-200'
                      : 'bg-indigo-500 text-white border-indigo-300'
                  }`}
                >
                  T = {temperature.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {thermalMode === 'icy'
                  ? '❄️ קפוא ומדויק: כל ההסתברות (100%) מתרכזת במילה הצפויה ביותר. אפס הפתעות!'
                  : thermalMode === 'fiery'
                  ? '🔥 יצירתי ופרוע: המסת הסיכויים! גם מילים נדירות ומצחיקות מקבלות סיכוי להיבחר.'
                  : '🌤️ מאוזן וטבעי: שילוב הרמוני בין היגיון לדמיון.'}
              </p>
            </div>

            {/* Preset Cartridges */}
            <div className="grid grid-cols-1 gap-2">
              {tempPresets.map((preset) => {
                const isActive = Math.abs(temperature - preset.value) < 0.04;
                return (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => {
                      onChangeTemperature(preset.value);
                      AudioEngine.playStep();
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-2xl border-2 text-xs font-black transition-all cursor-pointer active:scale-95 flex items-center justify-between ${
                      isActive
                        ? preset.mode === 'icy'
                          ? 'bg-cyan-400 text-slate-950 border-white shadow-[0_0_15px_rgba(34,211,238,0.6)]'
                          : preset.mode === 'fiery'
                          ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_15px_rgba(251,191,36,0.6)]'
                          : 'bg-indigo-500 text-white border-white shadow-[0_0_15px_rgba(99,102,241,0.6)]'
                        : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {isActive && <span className="text-[10px] font-mono">פעיל ✓</span>}
                  </button>
                );
              })}
            </div>

            {/* Interactive Thermal Slider */}
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                <span className="text-cyan-300">0.0 ❄️</span>
                <span>כוונון עדין של מד החום</span>
                <span className="text-amber-300">1.5 🔥</span>
              </div>
              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={temperature}
                onChange={(e) => {
                  onChangeTemperature(parseFloat(e.target.value));
                }}
                className={`w-full cursor-pointer ${
                  thermalMode === 'icy'
                    ? 'accent-cyan-400'
                    : thermalMode === 'fiery'
                    ? 'accent-amber-400'
                    : 'accent-indigo-400'
                }`}
              />
            </div>

            {/* Big Dice Roll Button */}
            <button
              type="button"
              onClick={handleRollNext}
              className={`w-full py-3.5 px-4 rounded-2xl border-2 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 shadow-xl ${
                thermalMode === 'icy'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 border-cyan-200 shadow-cyan-500/30'
                  : thermalMode === 'fiery'
                  ? 'bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-slate-950 border-amber-200 shadow-amber-500/30'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-indigo-300 shadow-indigo-500/30'
              }`}
            >
              <Dices className="w-5 h-5" />
              <span>הגרל את המילה הבאה 🎲</span>
            </button>
          </div>

          {/* Chamber 2: גלגל קפסולות המילים (Token Probability Capsules) */}
          <div className="lg:col-span-7 bg-slate-950/90 rounded-3xl border-2 border-slate-700/80 p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>2. גלגל קפסולות המילים (מועמדות למילה הבאה)</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  לחצו על כל קפסולת מילה כדי להוסיף אותה ישירות לסיפור!
                </p>
              </div>
              <span className="text-[11px] font-mono text-indigo-300 bg-indigo-950/70 px-2.5 py-1 rounded-xl border border-indigo-500/40 shrink-0">
                {showXRay ? 'Softmax P% פעיל' : 'תצוגת עוצמה'}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 flex flex-col justify-center">
              {tokenDistribution.map((item, idx) => {
                const prob = item.rawProb !== undefined ? item.rawProb : item.probability / 100;
                const exactPercent = (prob * 100).toFixed(1);
                const isTopCandidate = idx === 0 || prob >= 0.45;
                const isRecentlyPicked = lastSampledToken === item.token;

                return (
                  <button
                    key={item.token || idx}
                    type="button"
                    onClick={() => handleCapsuleClick(item.token)}
                    className={`w-full p-3 rounded-2xl border-2 text-right transition-all cursor-pointer active:scale-98 group relative overflow-hidden ${
                      isRecentlyPicked
                        ? 'bg-slate-900 border-amber-300 shadow-[0_0_16px_rgba(251,191,36,0.4)]'
                        : isTopCandidate
                        ? 'bg-slate-900/95 hover:bg-slate-800 border-indigo-400/60'
                        : 'bg-slate-900/70 hover:bg-slate-800 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5 relative z-10">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-xl bg-white/10 group-hover:bg-amber-400 group-hover:text-slate-950 font-black text-xs sm:text-sm text-white transition-colors">
                          "{item.token}"
                        </span>
                        <span className="text-[11px] text-slate-400 hidden sm:inline">
                          {item.explanation}
                        </span>
                      </div>

                      {showXRay ? (
                        <span
                          className={`font-mono font-black text-xs sm:text-sm px-2 py-0.5 rounded-lg border ${
                            thermalMode === 'icy' && prob > 0.5
                              ? 'bg-cyan-400 text-slate-950 border-cyan-200'
                              : thermalMode === 'fiery'
                              ? 'bg-amber-400/20 text-amber-300 border-amber-400/40'
                              : 'bg-indigo-950 text-indigo-200 border-indigo-500/40'
                          }`}
                        >
                          {exactPercent}%
                        </span>
                      ) : (
                        <span className="text-[11px] font-bold text-amber-300">
                          {prob > 0.5 ? 'סיכוי גבוה ⭐' : prob > 0.15 ? 'סיכוי בינוני' : 'הפתעה נדירה ✨'}
                        </span>
                      )}
                    </div>

                    {/* Capsule Probability Fill Bar */}
                    <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-white/10 p-0.5">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          thermalMode === 'icy'
                            ? 'bg-gradient-to-r from-cyan-400 to-blue-500'
                            : thermalMode === 'fiery'
                            ? 'bg-gradient-to-r from-amber-400 to-rose-500'
                            : 'bg-gradient-to-r from-indigo-400 to-purple-500'
                        }`}
                        style={{ width: `${Math.max(3, prob * 100)}%` }}
                      />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Live Story Teleprompter Ribbon at the Bottom */}
        <div className="bg-slate-950/95 rounded-3xl border-2 border-amber-400/50 p-4 sm:p-5 space-y-4 shadow-2xl">
          {/* Top Bar: Prompt Switcher Cartridges & Reset Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5 ml-1">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>פתיח הסיפור:</span>
              </span>
              {labData.prompts.map((p) => {
                const isSelected = selectedPromptId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => onSelectPrompt(p.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-md'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold text-indigo-300 bg-indigo-950/80 px-2.5 py-1 rounded-xl border border-indigo-500/30">
                מילים שנוספו: {generatedTokens.length} / 4
              </span>
              <button
                type="button"
                onClick={onReset}
                disabled={generatedTokens.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-xs font-black text-slate-200 border border-slate-700 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>איפוס סיפור 🔄</span>
              </button>
            </div>
          </div>

          {/* Teleprompter Magnetic Word Tiles Stream */}
          <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 min-h-[76px] flex flex-wrap items-center gap-2 leading-relaxed">
            <span className="text-sm sm:text-base font-bold text-slate-200 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-slate-700">
              {activePrompt.initialText}
            </span>

            {generatedTokens.map((token, idx) => (
              <span
                key={`${token}-${idx}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black text-sm sm:text-base border-2 border-white shadow-[0_0_15px_rgba(251,191,36,0.6)] animate-fadeIn"
              >
                <span>{token}</span>
                <span className="text-[10px] font-mono bg-slate-950/20 px-1 rounded text-slate-900">
                  #{idx + 1}
                </span>
              </span>
            ))}

            {/* Glowing Cursor Pill */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-500/20 border border-dashed border-indigo-400/60 text-indigo-300 text-xs font-bold animate-pulse">
              <span>{generatedTokens.length === 0 ? 'ממתין למילה הראשונה...' : 'המילה הבאה...'}</span>
            </span>
          </div>
        </div>
      </div>
    </LudicLabShell>
  );
}
