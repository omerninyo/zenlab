import React, { useState, useEffect, useRef } from 'react';
import { Cpu, Play, Pause, RotateCcw, ArrowRight, Zap, RefreshCw, Layers } from 'lucide-react';
import { AudioEngine } from '../../core/audio.js';

const SAMPLE_PROGRAMS = [
  {
    id: 'add',
    title: 'חיבור מספרים (Addition)',
    instructions: [
      { addr: 0, opcode: 'LOAD', operand: 5, desc: 'טען את המספר 5 לאוגר הצובר (ACC)' },
      { addr: 1, opcode: 'ADD', operand: 7, desc: 'הוסף 7 לערך שבצובר (5 + 7 = 12)' },
      { addr: 2, opcode: 'STORE', operand: 12, desc: 'שמור את התוצאה 12 בתא זיכרון' },
      { addr: 3, opcode: 'HALT', operand: 0, desc: 'סיום ריצת התוכנית' }
    ]
  },
  {
    id: 'mult',
    title: 'ספירה והכפלה (Multiply by 2)',
    instructions: [
      { addr: 0, opcode: 'LOAD', operand: 4, desc: 'טען את הערך 4 לאוגר הצובר (ACC)' },
      { addr: 1, opcode: 'ADD', operand: 4, desc: 'הוסף 4 שוב (כפל ב-2: 4 + 4 = 8)' },
      { addr: 2, opcode: 'STORE', operand: 8, desc: 'שמור 8 בזיכרון הראשי' },
      { addr: 3, opcode: 'HALT', operand: 0, desc: 'סיום ריצת התוכנית' }
    ]
  }
];

const STAGES = ['FETCH', 'DECODE', 'EXECUTE'];
const STAGE_LABELS = {
  FETCH: { name: 'שליפה (Fetch)', desc: 'קריאת הפקודה מתא הזיכרון לפי ערך ה-PC והעברתה לאוגר הפקודות (IR)' },
  DECODE: { name: 'פענוח (Decode)', desc: 'יחידת הבקרה (CU) מפענחת את סוג הפקודה והערך שצריך לעבד' },
  EXECUTE: { name: 'ביצוע (Execute)', desc: 'היחידה האריתמטית-לוגית (ALU) מבצעת את החישוב ומעדכנת את הצובר (ACC)' }
};

export default function SvgCpuPipelineAnimation() {
  const [selectedProgIdx, setSelectedProgIdx] = useState(0);
  const [currentStageIdx, setCurrentStageIdx] = useState(0); // 0: FETCH, 1: DECODE, 2: EXECUTE
  const [pc, setPc] = useState(0); // Program Counter
  const [ir, setIr] = useState(null); // Instruction Register
  const [acc, setAcc] = useState(0); // Accumulator
  const [isRunning, setIsRunning] = useState(false);
  const [busActive, setBusActive] = useState(false);

  const activeProg = SAMPLE_PROGRAMS[selectedProgIdx];
  const currentInstruction = activeProg.instructions[pc] || activeProg.instructions[0];
  const isHalted = currentInstruction.opcode === 'HALT' && currentStageIdx === 2;

  // Auto-runner clock ticker
  useEffect(() => {
    let timer = null;
    if (isRunning && !isHalted) {
      timer = setTimeout(() => {
        handleStepClock();
      }, 1400);
    } else if (isHalted && isRunning) {
      setIsRunning(false);
    }
    return () => clearTimeout(timer);
  }, [isRunning, currentStageIdx, pc, isHalted]);

  const handleStepClock = () => {
    AudioEngine.playStep();
    setBusActive(true);
    setTimeout(() => setBusActive(false), 500);

    if (currentStageIdx === 0) {
      // Transition from FETCH -> DECODE
      setIr(currentInstruction);
      setCurrentStageIdx(1);
    } else if (currentStageIdx === 1) {
      // Transition from DECODE -> EXECUTE
      setCurrentStageIdx(2);
    } else {
      // EXECUTE phase: update state and move to next instruction FETCH
      if (currentInstruction.opcode === 'LOAD') {
        setAcc(currentInstruction.operand);
      } else if (currentInstruction.opcode === 'ADD') {
        setAcc(prev => prev + currentInstruction.operand);
      }

      if (currentInstruction.opcode !== 'HALT') {
        const nextPc = (pc + 1) % activeProg.instructions.length;
        setPc(nextPc);
        setCurrentStageIdx(0);
      } else {
        setIsRunning(false);
      }
    }
  };

  const handleReset = () => {
    setIsRunning(false);
    setPc(0);
    setCurrentStageIdx(0);
    setIr(null);
    setAcc(0);
    AudioEngine.playStep();
  };

  const handleSelectProgram = (idx) => {
    setSelectedProgIdx(idx);
    setIsRunning(false);
    setPc(0);
    setCurrentStageIdx(0);
    setIr(null);
    setAcc(0);
    AudioEngine.playStep();
  };

  const currentStage = STAGES[currentStageIdx];

  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5" dir="rtl">
      {/* Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-xs font-bold text-white">
              מחזור פעולת המעבד: שליפה &ndash; פענוח &ndash; ביצוע (Fetch-Decode-Execute)
            </h3>
            <p className="text-[11px] text-slate-400">
              כיצד המעבד קורא פקודות מהזיכרון ומחשב תוצאות פעימה אחר פעימה
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleStepClock}
            disabled={isHalted}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isHalted
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>פעימת שעון (Tick)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRunning(!isRunning)}
            disabled={isHalted}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1.5 ${
              isRunning
                ? 'bg-amber-600/30 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isRunning ? 'השהייה' : 'הפעלה רציפה'}</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title="איפוס ריצה"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Program Selector Tabs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-400 text-[11px]">בחר תוכנית לדוגמה:</span>
        {SAMPLE_PROGRAMS.map((prog, idx) => (
          <button
            key={prog.id}
            type="button"
            onClick={() => handleSelectProgram(idx)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors border ${
              selectedProgIdx === idx
                ? 'bg-slate-800 text-blue-300 border-blue-500/50'
                : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-slate-200'
            }`}
          >
            {prog.title}
          </button>
        ))}
      </div>

      {/* Active Stage Indicator */}
      <div className="grid grid-cols-3 gap-2">
        {STAGES.map((stg, idx) => {
          const isActive = currentStage === stg;
          return (
            <div
              key={stg}
              className={`p-2.5 rounded-xl border transition-all text-center ${
                isActive
                  ? 'bg-blue-950/60 border-blue-500 text-white shadow-sm ring-1 ring-blue-500/40'
                  : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
              }`}
            >
              <div className="text-[10px] font-mono uppercase tracking-wider mb-0.5">שלב {idx + 1}</div>
              <div className="text-xs font-bold">{STAGE_LABELS[stg].name}</div>
            </div>
          );
        })}
      </div>

      {/* Main SVG Hardware Architecture */}
      <div className="relative w-full aspect-[2.4/1] bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 820 340" className="w-full h-full select-none font-sans" dir="ltr">
          <defs>
            <linearGradient id="cpuGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="busGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#818cf8" />
            </linearGradient>
          </defs>

          {/* BACKGROUND BUS WIRES */}
          <path
            d="M 230 110 L 320 110 L 320 70 L 400 70"
            fill="none"
            stroke={busActive ? '#38bdf8' : '#334155'}
            strokeWidth={busActive ? '4' : '2'}
            strokeDasharray={busActive ? '6,4' : 'none'}
            className={busActive ? 'animate-pulse' : ''}
          />
          <path
            d="M 520 70 L 590 70 L 590 150 L 630 150"
            fill="none"
            stroke={currentStage === 'DECODE' ? '#818cf8' : '#334155'}
            strokeWidth={currentStage === 'DECODE' ? '3' : '2'}
          />
          <path
            d="M 700 210 L 700 260 L 480 260 L 480 230"
            fill="none"
            stroke={currentStage === 'EXECUTE' ? '#34d399' : '#334155'}
            strokeWidth={currentStage === 'EXECUTE' ? '4' : '2'}
            strokeDasharray={currentStage === 'EXECUTE' ? '6,4' : 'none'}
          />

          {/* ================= RAM MODULE (LEFT) ================= */}
          <g transform="translate(30, 20)">
            <rect
              width="200"
              height="290"
              rx="10"
              fill="#090d16"
              stroke="#334155"
              strokeWidth="1.5"
            />
            <rect width="200" height="34" rx="10" fill="#1e293b" />
            <text x="100" y="22" fill="#94a3b8" fontSize="12" fontWeight="bold" textAnchor="middle">
              זיכרון ראשי (RAM)
            </text>

            {/* Instruction Rows in RAM */}
            {activeProg.instructions.map((inst, i) => {
              const isPc = pc === inst.addr;
              return (
                <g key={inst.addr} transform={`translate(10, ${46 + i * 58})`}>
                  <rect
                    width="180"
                    height="50"
                    rx="8"
                    fill={isPc ? '#1e3a5f' : '#0f172a'}
                    stroke={isPc ? '#38bdf8' : '#1e293b'}
                    strokeWidth={isPc ? '2' : '1'}
                  />
                  {/* Address Badge */}
                  <rect x="8" y="8" width="22" height="18" rx="4" fill="#020617" />
                  <text x="19" y="21" fill="#64748b" fontSize="10" fontFamily="monospace" textAnchor="middle">
                    0{inst.addr}
                  </text>

                  {/* Instruction Code */}
                  <text x="38" y="22" fill={isPc ? '#ffffff' : '#cbd5e1'} fontSize="12" fontWeight="bold">
                    {inst.opcode} {inst.operand}
                  </text>
                  <text x="10" y="40" fill="#64748b" fontSize="9">
                    {inst.opcode === 'LOAD' && 'טען ערך ל-ACC'}
                    {inst.opcode === 'ADD' && `הוסף +${inst.operand}`}
                    {inst.opcode === 'STORE' && 'שמור תוצאה'}
                    {inst.opcode === 'HALT' && 'עצור מעבד'}
                  </text>

                  {/* Active Arrow */}
                  {isPc && (
                    <polygon points="170,25 160,20 160,30" fill="#38bdf8" />
                  )}
                </g>
              );
            })}
          </g>

          {/* ================= CPU CHIP (RIGHT) ================= */}
          <g transform="translate(270, 20)">
            {/* CPU Boundary */}
            <rect
              width="520"
              height="290"
              rx="12"
              fill="url(#cpuGrad)"
              stroke="#475569"
              strokeWidth="2"
            />
            <rect width="520" height="34" rx="12" fill="#334155" opacity="0.6" />
            <text x="260" y="22" fill="#e2e8f0" fontSize="13" fontWeight="bold" textAnchor="middle">
              מעבד מרכזי (Central Processing Unit &ndash; CPU)
            </text>

            {/* 1. Program Counter (PC) Register */}
            <g transform="translate(20, 50)">
              <rect
                width="140"
                height="65"
                rx="8"
                fill="#0f172a"
                stroke={currentStage === 'FETCH' ? '#38bdf8' : '#334155'}
                strokeWidth={currentStage === 'FETCH' ? '2' : '1'}
              />
              <text x="12" y="22" fill="#94a3b8" fontSize="10" fontWeight="bold">
                מונה פקודות (PC)
              </text>
              <text x="70" y="50" fill="#38bdf8" fontSize="20" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                0{pc}
              </text>
            </g>

            {/* 2. Instruction Register (IR) */}
            <g transform="translate(180, 50)">
              <rect
                width="170"
                height="65"
                rx="8"
                fill="#0f172a"
                stroke={currentStage === 'FETCH' || currentStage === 'DECODE' ? '#818cf8' : '#334155'}
                strokeWidth={currentStage === 'DECODE' ? '2' : '1'}
              />
              <text x="12" y="22" fill="#94a3b8" fontSize="10" fontWeight="bold">
                אוגר פקודה נוכחית (IR)
              </text>
              <text x="85" y="50" fill="#c7d2fe" fontSize="15" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {ir ? `${ir.opcode} ${ir.operand}` : '---'}
              </text>
            </g>

            {/* 3. Control Unit (CU) */}
            <g transform="translate(370, 50)">
              <rect
                width="130"
                height="65"
                rx="8"
                fill="#0f172a"
                stroke={currentStage === 'DECODE' ? '#a855f7' : '#334155'}
                strokeWidth={currentStage === 'DECODE' ? '2' : '1'}
              />
              <text x="12" y="22" fill="#94a3b8" fontSize="10" fontWeight="bold">
                יחידת בקרה (CU)
              </text>
              <text x="65" y="48" fill="#e9d5ff" fontSize="11" fontWeight="bold" textAnchor="middle">
                {currentStage === 'DECODE' ? 'פענוח פקודה...' : 'ממתינה לפקודה'}
              </text>
            </g>

            {/* 4. Arithmetic Logic Unit (ALU) */}
            <g transform="translate(320, 150)">
              {/* ALU V-Shape polygon */}
              <polygon
                points="0,0 180,0 150,70 100,70 90,55 80,70 30,70"
                fill="#0b1329"
                stroke={currentStage === 'EXECUTE' ? '#34d399' : '#334155'}
                strokeWidth={currentStage === 'EXECUTE' ? '2.5' : '1.5'}
              />
              <text x="90" y="32" fill="#6ee7b7" fontSize="13" fontWeight="bold" textAnchor="middle">
                יחידה חישובית (ALU)
              </text>
              <text x="90" y="48" fill="#94a3b8" fontSize="9" textAnchor="middle">
                {currentStage === 'EXECUTE' ? `מחשב: ${currentInstruction.opcode}` : 'המתנה לחישוב'}
              </text>
            </g>

            {/* 5. Accumulator Register (ACC) */}
            <g transform="translate(90, 180)">
              <rect
                width="160"
                height="80"
                rx="8"
                fill="#0f172a"
                stroke={currentStage === 'EXECUTE' ? '#34d399' : '#334155'}
                strokeWidth={currentStage === 'EXECUTE' ? '2' : '1'}
              />
              <text x="14" y="24" fill="#94a3b8" fontSize="10" fontWeight="bold">
                אוגר צובר תוצאות (ACC)
              </text>
              <text x="80" y="60" fill="#34d399" fontSize="26" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                {acc}
              </text>
            </g>
          </g>
        </svg>
      </div>

      {/* Live Plain-Hebrew Explanation of Current Clock Cycle */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400">
          <Layers className="w-3.5 h-3.5" />
          <span>מה קורה במחשב ברגע זה? ({STAGE_LABELS[currentStage].name})</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          {currentStage === 'FETCH' && (
            <>
              המעבד קורא מזיכרון ה-RAM בכתובת <strong>0{pc}</strong> את הפקודה <strong>{currentInstruction.opcode} {currentInstruction.operand}</strong>. 
              אוגר ה-PC מתכונן לפקודה הבאה, והפקודה זורמת באפיק הנתונים (Data Bus) לכיוון המעבד.
            </>
          )}
          {currentStage === 'DECODE' && (
            <>
              יחידת הבקרה (CU) מפענחת את הפקודה <strong>{currentInstruction.opcode}</strong>: 
              היא מבינה שמדובר בפעולה של &quot;{currentInstruction.desc}&quot; ושולחת אותות חשמליים ליחידת החישוב (ALU).
            </>
          )}
          {currentStage === 'EXECUTE' && (
            <>
              ה-ALU מבצעת את החישוב! 
              {currentInstruction.opcode === 'LOAD' && ` ערך המספר ${currentInstruction.operand} נטען ישירות אל הצובר (ACC).`}
              {currentInstruction.opcode === 'ADD' && ` המספר ${currentInstruction.operand} חושב ונוסף לערך הקודם, וכעת הצובר מציג ${acc}.`}
              {currentInstruction.opcode === 'STORE' && ` תוצאת החישוב (${acc}) נשמרת בבטחה בתא הזיכרון.`}
              {currentInstruction.opcode === 'HALT' && ' התוכנית הושלמה בהצלחה והמעבד מסיים את סבב הפקודות.'}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
