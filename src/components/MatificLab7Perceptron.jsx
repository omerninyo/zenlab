import React, { useState } from 'react';
import {
  Zap,
  RotateCcw,
  Sliders,
  ShieldAlert,
  Check,
  X,
  Plus,
  Minus,
  Sparkles,
  Lightbulb
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import LudicLabShell from './LudicLabShell.jsx';

export default function MatificLab7Perceptron({
  selectedGate,
  w1,
  w2,
  bias,
  activation,
  evaluation,
  currentAccuracy,
  linePoints,
  toSvgCoords,
  completedChallenges = {},
  onSelectGate,
  onChangeW1,
  onChangeW2,
  onChangeBias,
  onChangeActivation,
  onReset
}) {
  const [showXRay, setShowXRay] = useState(true);

  const isCh1Done = Boolean(completedChallenges['lab7_challenge1']);
  const isCh2Done = Boolean(completedChallenges['lab7_challenge2']);
  const isCh3Done = Boolean(completedChallenges['lab7_challenge3']);

  const stars = [
    { id: 'lab7_challenge1', done: isCh1Done, label: 'פתרון שער וגם (AND)' },
    { id: 'lab7_challenge2', done: isCh2Done, label: 'פתרון שער או (OR)' },
    { id: 'lab7_challenge3', done: isCh3Done, label: 'חקירת חידת ה-XOR' }
  ];

  const isSolved = currentAccuracy === 100 || (selectedGate === 'XOR' && currentAccuracy >= 75 && isCh3Done);

  const clampWeight = (val) => {
    const rounded = Math.round(val * 10) / 10;
    return Math.max(-3.0, Math.min(3.0, rounded));
  };

  const handleNudge = (setter, currentVal, delta) => {
    const next = clampWeight(currentVal + delta);
    setter(next);
    AudioEngine.playStep();
  };

  const gateCartridges = [
    { id: 'AND', label: 'שער וגם (AND) 🤝', subtitle: 'נדלק רק כששני המתגים דולקים (1,1)' },
    { id: 'OR', label: 'שער או (OR) 💡', subtitle: 'נדלק אם לפחות מתג אחד דולק' },
    { id: 'XOR', label: 'שער XOR (האתגר הבלתי אפשרי!) 🧩', subtitle: 'נדלק רק כשאחד דלוק והשני כבוי' }
  ];

  return (
    <LudicLabShell
      stationBadge="מעבדת הנוירון של זֶן"
      stationStatus={
        currentAccuracy === 100
          ? 'הפרדה מושלמת! 100% דיוק ⚡'
          : `דיוק נוכחי: ${currentAccuracy}% 📡`
      }
      stationMessage={
        currentAccuracy === 100
          ? `כל הכבוד! קרן הלייזר של הנוירון מפרידה בצורה מושלמת בין הכוכבים הדולקים לכבויים בשער ${selectedGate}!`
          : selectedGate === 'XOR'
          ? 'נסו לסובב את קרן הלייזר כדי להגיע ל-75% דיוק ולגלות מדוע נוירון בודד לא יכול לפתור XOR לבדו!'
          : `כוונו את המשקולות (w₁, w₂) ואת סף ההחלטה (b) עד שקרן הלייזר תפריד בין הנקודות של שער ${selectedGate}!`
      }
      StationIcon={Zap}
      isBeamActive={isSolved}
      robotMood={currentAccuracy === 100 ? 'celebrating' : selectedGate === 'XOR' ? 'thinking' : 'happy'}
      stars={stars}
      theoryTitle="איך תא נוירון מלאכותי מקבל החלטה?"
      theoryText="נוירון מלאכותי (Perceptron) מקבל שני אותות כניסה (x₁ ו-x₂), מכפיל כל אחד במשקל חשיבות משלו (w₁ ו-w₂), ומוסיף את סף ההחלטה (b). אם הסכום הכולל (Σ) עובר את ה-0, הנוירון יורה זרם חשמלי (1)! מבחינה גיאומטרית, הנוירון מותח קו לייזר ישר שמפריד בין תשובות 'כן' ל-'לא'."
      chassisTitle="תא הנוירון החשמלי של זֶן • משקולות וקו הפרדה"
      ChassisIcon={Zap}
      showXRay={showXRay}
      onToggleXRay={setShowXRay}
      xRayLabel="עדשת משוואת נוירון [Σ]"
    >
      <div className="space-y-5">
        {/* Top Gate Cartridges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-950/80 p-3 rounded-3xl border border-white/10 shadow-inner">
          {gateCartridges.map((gate) => {
            const isSelected = selectedGate === gate.id;
            return (
              <button
                key={gate.id}
                type="button"
                onClick={() => onSelectGate(gate.id)}
                className={`p-3 rounded-2xl border-2 text-right transition-all cursor-pointer active:scale-95 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-gradient-to-br from-purple-600 to-indigo-700 text-white border-amber-300 shadow-[0_0_20px_rgba(168,85,247,0.45)]'
                    : 'bg-slate-900/90 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs sm:text-sm font-black">{gate.label}</span>
                  {isSelected && (
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-300 shrink-0" />
                  )}
                </div>
                <span className={`text-[11px] mt-1 ${isSelected ? 'text-purple-100' : 'text-slate-400'}`}>
                  {gate.subtitle}
                </span>
              </button>
            );
          })}
        </div>

        {/* Left/Right Dual Chamber */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Chamber 1: בקרת זרם הנוירון (Tactile Sliders + Nudge Buttons + Activation Switch) */}
          <div className="lg:col-span-6 bg-slate-950/90 rounded-3xl border-2 border-purple-500/40 p-4 sm:p-5 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-purple-400" />
                <h3 className="text-xs sm:text-sm font-black text-purple-200">
                  1. בקרת זרם הנוירון (משקולות וסף)
                </h3>
              </div>
              <button
                type="button"
                onClick={onReset}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold cursor-pointer active:scale-95"
                title="איפוס משקולות"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>איפוס</span>
              </button>
            </div>

            {/* Weight 1 Control */}
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  ⚡ עוצמת רמז 1 (<span className="font-mono text-purple-300">w₁</span> • כמה הוא חשוב?)
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-purple-950 border border-purple-500/40 font-mono font-black text-purple-300 text-sm">
                  {w1 > 0 ? `+${w1.toFixed(1)}` : w1.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleNudge(onChangeW1, w1, -0.1)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center font-black cursor-pointer active:scale-90 shrink-0"
                  title="הקטן משקל w1"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="-3.0"
                  max="3.0"
                  step="0.1"
                  value={w1}
                  onChange={(e) => {
                    onChangeW1(parseFloat(e.target.value));
                    AudioEngine.playStep();
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleNudge(onChangeW1, w1, 0.1)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center font-black cursor-pointer active:scale-90 shrink-0"
                  title="הגדל משקל w1"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Weight 2 Control */}
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  ☀️ עוצמת רמז 2 (<span className="font-mono text-purple-300">w₂</span> • כמה הוא חשוב?)
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-purple-950 border border-purple-500/40 font-mono font-black text-purple-300 text-sm">
                  {w2 > 0 ? `+${w2.toFixed(1)}` : w2.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleNudge(onChangeW2, w2, -0.1)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center font-black cursor-pointer active:scale-90 shrink-0"
                  title="הקטן משקל w2"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="-3.0"
                  max="3.0"
                  step="0.1"
                  value={w2}
                  onChange={(e) => {
                    onChangeW2(parseFloat(e.target.value));
                    AudioEngine.playStep();
                  }}
                  className="w-full accent-purple-500 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleNudge(onChangeW2, w2, 0.1)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center font-black cursor-pointer active:scale-90 shrink-0"
                  title="הגדל משקל w2"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Bias Control */}
            <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-200">
                  🎯 סף השכנוע (<span className="font-mono text-amber-300">b</span> • כמה קל לנוירון לומר "כן"?)
                </span>
                <span className="px-2.5 py-0.5 rounded-lg bg-amber-950 border border-amber-500/40 font-mono font-black text-amber-300 text-sm">
                  {bias > 0 ? `+${bias.toFixed(1)}` : bias.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleNudge(onChangeBias, bias, -0.1)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center font-black cursor-pointer active:scale-90 shrink-0"
                  title="הקטן סף החלטה b"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <input
                  type="range"
                  min="-3.0"
                  max="3.0"
                  step="0.1"
                  value={bias}
                  onChange={(e) => {
                    onChangeBias(parseFloat(e.target.value));
                    AudioEngine.playStep();
                  }}
                  className="w-full accent-amber-400 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => handleNudge(onChangeBias, bias, 0.1)}
                  className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 flex items-center justify-center font-black cursor-pointer active:scale-90 shrink-0"
                  title="הגדל סף החלטה b"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Activation Function Switch */}
            <div className="flex items-center justify-between gap-2 bg-slate-900/90 p-3 rounded-2xl border border-slate-800">
              <span className="text-xs font-bold text-slate-300">פונקציית הפעלה:</span>
              <div className="inline-flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    onChangeActivation('step');
                    AudioEngine.playStep();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activation === 'step'
                      ? 'bg-amber-400 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  מדרגה חדה Step
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onChangeActivation('sigmoid');
                    AudioEngine.playStep();
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    activation === 'sigmoid'
                      ? 'bg-purple-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  עקומה רכה Sigmoid
                </button>
              </div>
            </div>

            {/* Live X-Ray Formula Bar — always mounted at constant height */}
            <div className="p-3 rounded-2xl bg-indigo-950/70 border border-indigo-400/40 text-center space-y-1 min-h-[56px] flex flex-col items-center justify-center">
              {showXRay ? (
                <>
                  <div className="font-mono text-xs sm:text-sm text-indigo-200" dir="ltr">
                    <span className="text-amber-300 font-black">Σ</span> = ({w1.toFixed(1)})·x₁ + ({w2.toFixed(1)})·x₂ + ({bias.toFixed(1)})
                  </div>
                  <div className="text-[10px] text-amber-200/90 font-bold">
                    אם הסכום Σ עובר את ה-0 ⬅ הנוירון נדלק (1 = כן ✅)!
                  </div>
                </>
              ) : (
                <span className="text-slate-400 text-xs" dir="rtl">
                  הפעילו את "עדשת משוואת נוירון [Σ]" כדי לחשוף את משוואת הקו החיה
                </span>
              )}
            </div>
          </div>

          {/* Chamber 2: זירת הלייזר של הנוירון (SVG 300×300) */}
          <div className="lg:col-span-6 bg-slate-950/90 rounded-3xl border-2 border-amber-400/50 p-4 sm:p-5 flex flex-col items-center justify-between shadow-xl">
            <div className="w-full flex items-center justify-between border-b border-white/10 pb-3 mb-2">
              <span className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>2. זירת הלייזר של הנוירון (קו הפרדה חי)</span>
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  currentAccuracy === 100
                    ? 'bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.6)]'
                    : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                }`}
              >
                {currentAccuracy === 100 ? '100% דיוק! 🎯' : `${currentAccuracy}% דיוק`}
              </span>
            </div>

            <div className="w-[280px] h-[280px] sm:w-[300px] sm:h-[300px] bg-slate-900/95 rounded-3xl border-2 border-slate-800 p-2 relative overflow-hidden shadow-inner">
              <svg viewBox="0 0 300 300" className="w-full h-full select-none">
                <defs>
                  <filter id="laserGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>

                {/* Subtle Grid Lines */}
                <line x1="20" y1="280" x2="280" y2="280" stroke="#334155" strokeWidth="2" />
                <line x1="20" y1="20" x2="20" y2="280" stroke="#334155" strokeWidth="2" />
                <line x1="20" y1="94" x2="280" y2="94" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
                <line x1="206" y1="20" x2="206" y2="280" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />

                {/* Axis Labels */}
                <text x="20" y="296" fill="#94a3b8" fontSize="11" fontWeight="bold" textAnchor="middle">0</text>
                <text x="206" y="296" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="middle">x₁ = 1</text>
                <text x="22" y="14" fill="#cbd5e1" fontSize="11" fontWeight="bold" textAnchor="start">x₂ = 1</text>

                {/* Live Glowing Laser Decision Boundary Line */}
                {linePoints && (
                  <g filter="url(#laserGlow)">
                    <line
                      x1={linePoints.p1.x}
                      y1={linePoints.p1.y}
                      x2={linePoints.p2.x}
                      y2={linePoints.p2.y}
                      stroke="#f59e0b"
                      strokeWidth="6"
                      strokeOpacity="0.35"
                    />
                    <line
                      x1={linePoints.p1.x}
                      y1={linePoints.p1.y}
                      x2={linePoints.p2.x}
                      y2={linePoints.p2.y}
                      stroke="#fde047"
                      strokeWidth="3"
                      strokeDasharray="6 3"
                    />
                  </g>
                )}

                {/* 4 Logic Input Stars / Nodes */}
                {evaluation.results.map((pt, i) => {
                  const target =
                    selectedGate === 'AND'
                      ? pt.targetAnd
                      : selectedGate === 'OR'
                      ? pt.targetOr
                      : pt.targetXor;
                  const predictedClass = activation === 'step' ? pt.output : pt.output >= 0.5 ? 1 : 0;
                  const isMatch = predictedClass === target;
                  const coords = toSvgCoords(pt.x1, pt.x2);

                  return (
                    <g key={i}>
                      {/* Outer Status Halo */}
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="24"
                        fill={isMatch ? 'rgba(16, 185, 129, 0.14)' : 'rgba(244, 63, 94, 0.18)'}
                        stroke={isMatch ? '#34d399' : '#fb7185'}
                        strokeWidth="2"
                        strokeDasharray={isMatch ? 'none' : '3 2'}
                      />

                      {/* Core Node Circle colored by Target Truth Value */}
                      <circle
                        cx={coords.x}
                        cy={coords.y}
                        r="17"
                        fill={target === 1 ? '#10b981' : '#1e293b'}
                        stroke={target === 1 ? '#a7f3d0' : '#64748b'}
                        strokeWidth="2.5"
                      />

                      {/* Inside Node: Prediction Value */}
                      <text
                        x={coords.x}
                        y={coords.y + 4}
                        fill={target === 1 ? '#022c22' : '#f8fafc'}
                        fontSize="12"
                        fontWeight="900"
                        textAnchor="middle"
                      >
                        {pt.output}
                      </text>

                      {/* Coordinate Label Above Node */}
                      <text
                        x={coords.x}
                        y={coords.y - 29}
                        fill="#e2e8f0"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ({pt.x1},{pt.x2}) {target === 1 ? '⭐' : '🌑'}
                      </text>

                      {/* X-Ray Sigma Value Pill Under Node */}
                      {showXRay && (
                        <text
                          x={coords.x}
                          y={coords.y + 36}
                          fill="#fde047"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Σ={pt.z}
                        </text>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-300 mt-2">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> מטרה: 1 (דלוק ⭐)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-slate-700 border border-slate-400 inline-block" /> מטרה: 0 (כבוי 🌑)
              </span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                --- קרן הלייזר של הנוירון
              </span>
            </div>
          </div>
        </div>

        {/* Gate Pedagogical Discovery Banner — always mounted at constant height so switching gates never jumps layout */}
        <div
          className={`rounded-2xl p-3.5 text-xs flex items-start gap-3 shadow-lg border-2 min-h-[76px] ${
            selectedGate === 'XOR'
              ? 'bg-amber-950/60 border-amber-400/60 text-amber-100'
              : 'bg-indigo-950/50 border-indigo-500/40 text-indigo-100'
          }`}
        >
          <ShieldAlert className={`w-5 h-5 shrink-0 mt-0.5 ${selectedGate === 'XOR' ? 'text-amber-400' : 'text-indigo-400'}`} />
          <div>
            <h4 className={`font-black text-xs sm:text-sm ${selectedGate === 'XOR' ? 'text-amber-300' : 'text-indigo-200'}`}>
              {selectedGate === 'XOR'
                ? 'חידת ה-XOR: מדוע קו לייזר ישר אחד מגיע רק ל-75% דיוק?'
                : selectedGate === 'AND'
                ? 'שער וגם (AND): הפרדה ליניארית של הפינה הימנית-עליונה (1,1)'
                : 'שער או (OR): הפרדת שלוש הנקודות הדולקות מנקודת ה-(0,0)'}
            </h4>
            <p className="mt-1 leading-relaxed">
              {selectedGate === 'XOR' ? (
                <>
                  הסתכלו על הכוכבים הדולקים ⭐ בנקודות (0,1) ו-(1,0): הם נמצאים באלכסון! אי אפשר למתוח קו ישר אחד שיפריד אותם משתי הנקודות הכבויות 🌑 ב-(0,0) ו-(1,1). כדי לפתור XOR צריך לחבר <strong>כמה נוירונים יחד לרשת עצבית רב-שכבתית</strong>!
                </>
              ) : selectedGate === 'AND' ? (
                <>
                  בשער <strong>AND</strong> רק הנקודה <strong>(1,1)</strong> צריכה להידלק ⭐. תנו משקולות חיוביות ל-w₁ ול-w₂ וסף החלטה (b) שלילי כך שרק כששניהם דלוקים הסכום יעבור את ה-0!
                </>
              ) : (
                <>
                  בשער <strong>OR</strong> מספיק שאחד המתגים ידלק ⭐ כדי שהנוירון יירה! מקמו את קרן הלייזר כך שרק הנקודה <strong>(0,0)</strong> תישאר בצד הכבוי 🌑.
                </>
              )}
            </p>
          </div>
        </div>

        {/* Live Truth-Table Ribbon (4 Glowing Test Bulbs) */}
        <div className="bg-slate-950/90 rounded-3xl border-2 border-indigo-500/30 p-4 space-y-3 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-indigo-200">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>טבלת האמת החיה של הנוירון (4 מצבי הבדיקה לשער {selectedGate}):</span>
            </div>
            <span
              className={`px-3 py-1 rounded-xl font-mono text-xs font-black ${
                currentAccuracy === 100
                  ? 'bg-emerald-400 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-amber-300 border border-amber-400/30'
              }`}
            >
              דיוק כולל: {currentAccuracy}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {evaluation.results.map((pt, idx) => {
              const target =
                selectedGate === 'AND'
                  ? pt.targetAnd
                  : selectedGate === 'OR'
                  ? pt.targetOr
                  : pt.targetXor;
              const predictedClass = activation === 'step' ? pt.output : pt.output >= 0.5 ? 1 : 0;
              const isMatch = predictedClass === target;

              return (
                <div
                  key={idx}
                  className={`p-3 rounded-2xl border-2 flex flex-col justify-between gap-2 transition-colors ${
                    isMatch
                      ? 'bg-emerald-950/40 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-rose-950/40 border-rose-500/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-black text-xs text-white bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-700">
                      ({pt.x1}, {pt.x2})
                    </span>
                    {isMatch ? (
                      <span className="flex items-center gap-1 text-[11px] font-black text-emerald-400">
                        <Check className="w-3.5 h-3.5" /> תקין
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-black text-rose-400">
                        <X className="w-3.5 h-3.5" /> שגוי
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                    <span className="text-slate-300">
                      מטרה: <strong className="text-amber-300 font-mono">{target}</strong>
                    </span>
                    <span className="text-slate-300">
                      נוירון: <strong className="text-white font-mono">{pt.output}</strong>
                    </span>
                  </div>

                  <div className="text-[10px] font-mono text-indigo-300 bg-black/40 px-2 py-1 rounded-lg text-center h-6 flex items-center justify-center" dir="ltr">
                    {showXRay ? `Σ = ${pt.z}` : `פלט: ${pt.output}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </LudicLabShell>
  );
}
