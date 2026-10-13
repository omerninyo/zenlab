import React, { useState } from 'react';
import {
  ScanLine,
  Eye,
  Sparkles,
  RotateCcw,
  Layers,
  Grid,
  Check,
  Search
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import LudicLabShell from './LudicLabShell.jsx';

export default function MatificLab6Vision({
  labData,
  selectedPreset,
  inputGrid,
  activeKernelKey,
  currentKernel,
  convolutionResult,
  inspectedCell,
  inspectedDetail,
  completedChallenges = {},
  onTogglePixel,
  onSelectPreset,
  onSelectKernel,
  onInspectCell,
  onClear
}) {
  const [showXRay, setShowXRay] = useState(true);

  const isCh1Done = Boolean(completedChallenges['lab6_challenge1']);
  const isCh2Done = Boolean(completedChallenges['lab6_challenge2']);
  const isCh3Done = Boolean(completedChallenges['lab6_challenge3']);

  const stars = [
    { id: 'lab6_challenge1', done: isCh1Done, label: 'זיהוי קו אנכי' },
    { id: 'lab6_challenge2', done: isCh2Done, label: 'זיהוי קו אופקי בריבוע' },
    { id: 'lab6_challenge3', done: isCh3Done, label: 'בדיקת משבצת בעדשה' }
  ];

  const allDone = isCh1Done && isCh2Done && isCh3Done;

  // Inner 6x6 valid convolution cells (x: 1..6, y: 1..6)
  const valid6x6Cells = [];
  for (let y = 1; y <= 6; y++) {
    for (let x = 1; x <= 6; x++) {
      const detail = convolutionResult.details.find(d => d.x === x && d.y === y) || {
        x,
        y,
        sum: 0,
        clamped: 0,
        products: new Array(9).fill(0)
      };
      valid6x6Cells.push(detail);
    }
  }

  // Play pleasant chime on inspecting a feature cell
  const handleInspectClick = (x, y, sumVal) => {
    onInspectCell({ x, y });
    const baseFreq = 330 + Math.min(400, Math.abs(sumVal) * 110);
    AudioEngine.playTone(baseFreq, 'sine', 0.16);
  };

  const presetButtons = [
    { key: 'verticalStripe', label: 'פס אנכי 📏' },
    { key: 'square', label: 'ריבוע ⬛' },
    { key: 'cross', label: 'צלב ➕' }
  ];

  const kernelButtons = [
    { key: 'verticalEdge', label: 'מגלה קווים אנכיים ║' },
    { key: 'horizontalEdge', label: 'מגלה קווים אופקיים ═' },
    { key: 'blur', label: 'טשטוש 🌫️' },
    { key: 'sharpen', label: 'חידוד ✨' }
  ];

  // Extract the 9 input pixels around inspectedCell if active
  const inspectedPatch = [];
  if (inspectedCell) {
    for (let ky = -1; ky <= 1; ky++) {
      for (let kx = -1; kx <= 1; kx++) {
        const px = inspectedCell.x + kx;
        const py = inspectedCell.y + ky;
        const val = px >= 0 && px < 8 && py >= 0 && py < 8 ? inputGrid[py * 8 + px] : 0;
        const weight = currentKernel.matrix[ky + 1][kx + 1];
        const weightRounded = Math.round(weight * 100) / 100;
        const prod = Math.round(val * weight * 100) / 100;
        inspectedPatch.push({ px, py, val, weight: weightRounded, prod });
      }
    }
  }

  return (
    <LudicLabShell
      stationBadge="מעבדת הראייה של זֶן"
      stationStatus={inspectedCell ? `סורק משבצת (${inspectedCell.x},${inspectedCell.y}) 🔍` : 'מוכן לסריקה אופטית 📡'}
      stationMessage={
        inspectedCell
          ? `זכוכית המגדלת מכפילה 9 נורות סביב (${inspectedCell.x},${inspectedCell.y}) בפילטר "${currentKernel?.name}"!`
          : 'בחרו תבנית ופילטר, או לחצו על משבצת במפת הקצוות (6×6) כדי להפעיל את סורק הלייזר!'
      }
      StationIcon={ScanLine}
      isBeamActive={Boolean(inspectedCell) || allDone}
      robotMood={allDone ? 'celebrating' : inspectedCell ? 'thinking' : 'happy'}
      stars={stars}
      theoryTitle="איך רובוט מזהה צורות וקצוות בתמונה?"
      theoryText="מחשב לא רואה תמונה שלמה בבת אחת כמו עין אנושית. במקום זאת, הוא מעביר 'זכוכית מגדלת' קטנה בגודל 3×3 (שנקראת פילטר או Kernel) על פני הנורות. בכל עצירה הוא מכפיל כל נורה במשקל שלה (+1 מעודד אור, -1 מחפש חושך, 0 מתעלם) ומחבר הכל. כך הרובוט מגלה איפה בדיוק עובר קו אנכי או אופקי!"
      chassisTitle="זכוכית המגדלת הרובוטית של זֶן • ראייה ממוחשבת ופילטרים"
      ChassisIcon={Eye}
      showXRay={showXRay}
      onToggleXRay={setShowXRay}
      xRayLabel="עדשת מכפלות [3×3]"
    >
      <div className="space-y-5">
        {/* Top Control Cartridges: Presets & Kernels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-slate-950/80 p-3.5 rounded-3xl border border-white/10 shadow-inner">
          {/* Preset Cartridges */}
          <div className="lg:col-span-5 flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-amber-300 ml-1 shrink-0">תבנית ציור:</span>
            {presetButtons.map(p => {
              const isSelected = selectedPreset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => onSelectPreset(p.key)}
                  className={`px-3 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 border-amber-200 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={onClear}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700 transition-all cursor-pointer active:scale-95"
              title="ניקוי לוח הנורות"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Kernel Filter Cartridges */}
          <div className="lg:col-span-7 flex flex-wrap items-center gap-2 lg:justify-end">
            <span className="text-xs font-black text-indigo-300 ml-1 shrink-0">עדשת פילטר:</span>
            {kernelButtons.map(k => {
              const isSelected = activeKernelKey === k.key;
              return (
                <button
                  key={k.key}
                  type="button"
                  onClick={() => {
                    onSelectKernel(k.key);
                    AudioEngine.playStep();
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-indigo-500 text-white border-indigo-300 shadow-[0_0_16px_rgba(99,102,241,0.5)]'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {k.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main 3-Board Interactive Stage */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Board 1: 8x8 Original Input Image */}
          <div className="lg:col-span-5 bg-slate-950/90 rounded-3xl border-2 border-slate-700/80 p-4 flex flex-col items-center justify-between shadow-xl">
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <span className="text-xs sm:text-sm font-black text-blue-300 flex items-center gap-1.5">
                <Grid className="w-4 h-4 text-blue-400" />
                <span>1. לוח התמונה המקורית (8×8 נורות)</span>
              </span>
              <span className="text-[11px] text-slate-400 font-bold">לחצו להדלקה/כיבוי</span>
            </div>

            <div className="relative p-2.5 bg-slate-900/90 rounded-2xl border border-slate-800">
              <div className="grid grid-cols-8 gap-1.5 w-[236px] h-[236px] sm:w-[252px] sm:h-[252px]">
                {inputGrid.map((val, idx) => {
                  const x = idx % 8;
                  const y = Math.floor(idx / 8);
                  const isLit = val === 1;
                  const isInsideScanner =
                    inspectedCell !== null &&
                    Math.abs(x - inspectedCell.x) <= 1 &&
                    Math.abs(y - inspectedCell.y) <= 1;
                  const isScannerCenter =
                    inspectedCell !== null &&
                    x === inspectedCell.x &&
                    y === inspectedCell.y;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onTogglePixel(idx)}
                      className={`relative rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer select-none ${
                        isLit
                          ? 'bg-gradient-to-br from-blue-400 to-blue-600 text-white border border-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.7)]'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-500 border border-slate-800'
                      } ${
                        isInsideScanner
                          ? 'ring-2 ring-amber-400 z-10 scale-105 shadow-[0_0_14px_rgba(251,191,36,0.75)]'
                          : ''
                      }`}
                      title={`נורה (${x}, ${y}): ערך ${val}`}
                    >
                      {isScannerCenter && (
                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-400 border border-slate-950" />
                      )}
                      {showXRay ? (
                        <span className={`font-mono font-black text-xs ${isLit ? 'text-white' : 'text-slate-600'}`}>
                          {val}
                        </span>
                      ) : (
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isLit ? 'bg-white shadow-[0_0_6px_#fff]' : 'bg-slate-800'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2.5 text-center">
              {inspectedCell
                ? `מסגרת הסורק הצהובה (3×3) מראה אילו 9 נורות נבדקות כעת סביב (${inspectedCell.x},${inspectedCell.y}).`
                : 'לחצו על הנורות כדי לצייר, או בחרו משבצת במפת הקצוות משמאל!'}
            </p>
          </div>

          {/* Board 2: 3x3 Active Filter Lens (Kernel) */}
          <div className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-950/90 rounded-3xl border-2 border-indigo-500/40 p-3 shadow-xl">
            <div className="text-center mb-2.5">
              <span className="text-xs font-black text-amber-300 block">2. עדשת הפילטר</span>
              <span className="text-[11px] font-bold text-indigo-300 block mt-0.5">
                {currentKernel?.name} (3×3)
              </span>
            </div>

            <div dir="ltr" className="grid grid-cols-3 gap-1.5 p-2 bg-slate-900 rounded-2xl border-2 border-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.15)]">
              {currentKernel.matrix.flat().map((weight, idx) => {
                const isNineFrac = Math.abs(weight - 1 / 9) < 0.01;
                const roundedW = Math.round(weight * 100) / 100;
                const displayW = isNineFrac ? '1/9' : roundedW > 0 ? `+${roundedW}` : `${roundedW}`;
                const isPos = weight > 0.01;
                const isNeg = weight < -0.01;

                return (
                  <div
                    key={idx}
                    className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center font-mono font-black text-[11px] transition-all ${
                      isPos
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-inner'
                        : isNeg
                        ? 'bg-rose-500/20 border-rose-400 text-rose-300 shadow-inner'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400'
                    }`}
                  >
                    <span>{displayW}</span>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 space-y-1 text-[10px] text-slate-300 text-center leading-tight">
              <div className="flex items-center justify-center gap-1.5">
                <span dir="ltr" className="px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-mono font-bold">+1</span>
                <span>מחפש אור</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span dir="ltr" className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono font-bold">0</span>
                <span>מתעלם</span>
              </div>
              <div className="flex items-center justify-center gap-1.5">
                <span dir="ltr" className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-mono font-bold">-1</span>
                <span>מחפש חושך</span>
              </div>
            </div>
          </div>

          {/* Board 3: 6x6 Output Feature Map */}
          <div className="lg:col-span-5 bg-slate-950/90 rounded-3xl border-2 border-emerald-500/40 p-4 flex flex-col items-center justify-between shadow-xl">
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <span className="text-xs sm:text-sm font-black text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>3. מפת הקצוות שזֶן רואה (6×6)</span>
              </span>
              <span className="text-[11px] text-amber-300 font-bold">לחצו על משבצת לבדיקה!</span>
            </div>

            <div className="relative p-3 bg-slate-900/90 rounded-2xl border border-slate-800">
              <div className="grid grid-cols-6 gap-2 w-[240px] h-[240px] sm:w-[264px] sm:h-[264px]">
                {valid6x6Cells.map((cell) => {
                  const isSelected =
                    inspectedCell !== null &&
                    inspectedCell.x === cell.x &&
                    inspectedCell.y === cell.y;
                  const intensity = Math.max(0, Math.min(1, cell.clamped));
                  const isStrongEdge = intensity >= 0.5;
                  const isMediumEdge = intensity > 0.15 && intensity < 0.5;
                  const roundedSum = Math.round(cell.sum * 10) / 10;

                  return (
                    <button
                      key={`${cell.x}-${cell.y}`}
                      type="button"
                      onClick={() => handleInspectClick(cell.x, cell.y, cell.sum)}
                      className={`relative rounded-xl flex flex-col items-center justify-center transition-all duration-150 cursor-pointer select-none border-2 ${
                        isSelected
                          ? 'bg-amber-400 text-slate-950 border-white scale-110 z-10 shadow-[0_0_20px_rgba(251,191,36,0.95)]'
                          : isStrongEdge
                          ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-slate-950 border-emerald-200 shadow-[0_0_14px_rgba(16,185,129,0.7)]'
                          : isMediumEdge
                          ? 'bg-emerald-900/70 text-emerald-200 border-emerald-600/60'
                          : 'bg-slate-950 hover:bg-slate-800 text-slate-500 border-slate-800'
                      }`}
                      title={`משבצת תוצאה (${cell.x}, ${cell.y}) • סכום מכפלות: ${roundedSum}`}
                    >
                      {showXRay ? (
                        <span
                          className={`font-mono font-black text-xs sm:text-sm ${
                            isSelected || isStrongEdge ? 'text-slate-950' : 'text-slate-400'
                          }`}
                        >
                          {roundedSum}
                        </span>
                      ) : (
                        <div
                          className={`w-3 h-3 rounded-full ${
                            isSelected
                              ? 'bg-slate-950'
                              : isStrongEdge
                              ? 'bg-white shadow-[0_0_8px_#fff]'
                              : isMediumEdge
                              ? 'bg-emerald-400/60'
                              : 'bg-slate-800'
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 mt-2.5 text-center">
              משבצות ירוקות זוהרות מסמנות שזֶן מצא התאמה חזקה לפילטר של "{currentKernel?.name}"!
            </p>
          </div>
        </div>

        {/* Live Convolution Ribbon at the bottom */}
        <div className="bg-slate-950/90 rounded-2xl border-2 border-amber-400/40 p-4 shadow-lg">
          {inspectedDetail && inspectedCell ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-300">
                  <Search className="w-4 h-4 text-amber-400" />
                  <span>
                    חישוב העדשה סביב משבצת ({inspectedCell.x}, {inspectedCell.y}) עם פילטר "{currentKernel?.name}":
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono bg-indigo-950 border border-indigo-500/40 px-2.5 py-1 rounded-lg text-indigo-200">
                    סכום מכפלות (Σ): <strong className="text-amber-300">{Math.round(inspectedDetail.sum * 100) / 100}</strong>
                  </span>
                  <span className="text-xs font-mono bg-emerald-950 border border-emerald-500/40 px-2.5 py-1 rounded-lg text-emerald-300 font-bold">
                    עוצמת נורה סופית: {inspectedDetail.clamped}
                  </span>
                </div>
              </div>

              {/* 9 Multiplication Pills */}
              <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
                {inspectedPatch.map((item, idx) => (
                  <React.Fragment key={idx}>
                    <div
                      className={`px-2 py-1 rounded-lg border text-[11px] font-mono flex items-center gap-1 ${
                        item.prod > 0
                          ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300 font-bold'
                          : item.prod < 0
                          ? 'bg-rose-950/70 border-rose-500/50 text-rose-300 font-bold'
                          : 'bg-slate-900 border-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="text-blue-300">{item.val}</span>
                      <span>×</span>
                      <span className="text-amber-300">({item.weight})</span>
                      <span>=</span>
                      <span>{item.prod}</span>
                    </div>
                    {idx < 8 && <span className="text-slate-500 font-bold text-xs">+</span>}
                  </React.Fragment>
                ))}
                <span className="text-amber-400 font-black text-sm mx-1">=</span>
                <span className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-mono font-black text-xs sm:text-sm shadow-md">
                  Σ {Math.round(inspectedDetail.sum * 100) / 100}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse shrink-0" />
                <span className="font-bold">
                  רוצים לראות איך זכוכית המגדלת מחשבת כל משבצת? לחצו על אחת מ-36 המשבצות ב"מפת הקצוות שזֶן רואה (6×6)"!
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleInspectClick(3, 3, 1)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition-all cursor-pointer shrink-0 active:scale-95"
              >
                בדקו את משבצת האמצע (3,3) 🔍
              </button>
            </div>
          )}
        </div>
      </div>
    </LudicLabShell>
  );
}
