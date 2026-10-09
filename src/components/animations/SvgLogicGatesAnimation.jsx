import React, { useState } from 'react';
import { Zap, Binary, Sliders, CheckCircle2, RefreshCw, Cpu, Layers } from 'lucide-react';
import { AudioEngine } from '../../core/audio.js';

const GATES = [
  { id: 'AND', name: 'שער וגם (AND)', desc: 'נדלק (1) רק אם שני המפסקים דולקים יחד', formula: 'וגם (A וגם B)' },
  { id: 'OR', name: 'שער או (OR)', desc: 'נדלק (1) אם לפחות אחד המפסקים דולק', formula: 'או (A או B)' },
  { id: 'NOT', name: 'שער היפוך (NOT)', desc: 'הופך את הסימן: 0 הופך ל-1, ו-1 הופך ל-0', formula: 'היפוך (לא A)' },
  { id: 'XOR', name: 'שער או-מיוחד (XOR)', desc: 'נדלק (1) רק כאשר המפסקים שונים זה מזה', formula: 'בדיוק אחד מהם' },
  { id: 'NAND', name: 'שער לא-וגם (NAND)', desc: 'ההפך משער וגם: כבה רק כששני המפסקים דולקים יחד', formula: 'ההפך מ-AND' }
];

export default function SvgLogicGatesAnimation() {
  const [activeMode, setActiveMode] = useState('gates'); // 'gates' | 'halfAdder'
  const [selectedGate, setSelectedGate] = useState('AND');
  const [inputA, setInputA] = useState(0);
  const [inputB, setInputB] = useState(1);

  // Compute logic gate output
  const computeGateOutput = (gate, a, b) => {
    switch (gate) {
      case 'AND': return (a === 1 && b === 1) ? 1 : 0;
      case 'OR': return (a === 1 || b === 1) ? 1 : 0;
      case 'NOT': return a === 1 ? 0 : 1;
      case 'XOR': return (a !== b) ? 1 : 0;
      case 'NAND': return !(a === 1 && b === 1) ? 1 : 0;
      default: return 0;
    }
  };

  const gateOutput = computeGateOutput(selectedGate, inputA, inputB);

  // Half-Adder outputs: Sum = A ^ B, Carry = A & B
  const sumBit = (inputA !== inputB) ? 1 : 0;
  const carryBit = (inputA === 1 && inputB === 1) ? 1 : 0;

  const handleToggleA = () => {
    const next = inputA === 0 ? 1 : 0;
    setInputA(next);
    AudioEngine.playToggle(next === 1);
  };

  const handleToggleB = () => {
    const next = inputB === 0 ? 1 : 0;
    setInputB(next);
    AudioEngine.playToggle(next === 1);
  };

  const handleSelectGate = (gateId) => {
    setSelectedGate(gateId);
    AudioEngine.playStep();
  };

  const handleSelectMode = (mode) => {
    setActiveMode(mode);
    AudioEngine.playStep();
  };

  // Truth table generator
  const truthTableRows = selectedGate === 'NOT'
    ? [
        { a: 0, b: '-', out: computeGateOutput('NOT', 0, 0), active: inputA === 0 },
        { a: 1, b: '-', out: computeGateOutput('NOT', 1, 0), active: inputA === 1 }
      ]
    : [
        { a: 0, b: 0, out: computeGateOutput(selectedGate, 0, 0), active: inputA === 0 && inputB === 0 },
        { a: 0, b: 1, out: computeGateOutput(selectedGate, 0, 1), active: inputA === 0 && inputB === 1 },
        { a: 1, b: 0, out: computeGateOutput(selectedGate, 1, 0), active: inputA === 1 && inputB === 0 },
        { a: 1, b: 1, out: computeGateOutput(selectedGate, 1, 1), active: inputA === 1 && inputB === 1 }
      ];

  const currentGateMeta = GATES.find(g => g.id === selectedGate) || GATES[0];

  return (
    <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-5" dir="rtl">
      {/* Top Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-400" />
          <div>
            <h3 className="text-xs font-bold text-white">
              שערים לוגיים: איך המחשב מקבל החלטות בחומרה
            </h3>
            <p className="text-[11px] text-slate-400">
              אבני הבניין הזעירות שמרכיבות כל מעבד וכל תוכנת מחשב
            </p>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => handleSelectMode('gates')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeMode === 'gates' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            חקר שערים בסיסיים
          </button>
          <button
            type="button"
            onClick={() => handleSelectMode('halfAdder')}
            className={`px-3 py-1 rounded font-medium transition-colors ${
              activeMode === 'halfAdder' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            איך מחשב מחבר מספרים (חיבור בינארי)
          </button>
        </div>
      </div>

      {activeMode === 'gates' ? (
        /* ================= MODE 1: INDIVIDUAL LOGIC GATES ================= */
        <div className="space-y-4">
          {/* Gate Selection Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400 text-xs font-medium">בחרו שער:</span>
            {GATES.map(g => (
              <button
                key={g.id}
                type="button"
                onClick={() => handleSelectGate(g.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                  selectedGate === g.id
                    ? 'bg-blue-600 text-white border-blue-400 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {g.id}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* SVG Visual Gate Schematic */}
            <div className="lg:col-span-8 bg-slate-900/60 rounded-xl border border-slate-800/80 p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                  <span>מעגל אלקטרוני חי</span>
                </span>
                <span className="text-slate-400 text-xs">כלל: {currentGateMeta.formula}</span>
              </div>

              {/* Schematic SVG */}
              <div className="relative w-full aspect-[2.4/1] bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-center p-2">
                <svg viewBox="0 0 600 240" className="w-full h-full select-none" dir="ltr">
                  {/* INPUT WIRE A */}
                  <line
                    x1="60"
                    y1={selectedGate === 'NOT' ? '120' : '75'}
                    x2="230"
                    y2={selectedGate === 'NOT' ? '120' : '75'}
                    stroke={inputA === 1 ? '#10b981' : '#334155'}
                    strokeWidth={inputA === 1 ? '4' : '2.5'}
                    strokeDasharray={inputA === 1 ? '6,3' : 'none'}
                    className={inputA === 1 ? 'animate-pulse' : ''}
                  />

                  {/* INPUT WIRE B (Only if not NOT) */}
                  {selectedGate !== 'NOT' && (
                    <line
                      x1="60"
                      y1="165"
                      x2="230"
                      y2="165"
                      stroke={inputB === 1 ? '#10b981' : '#334155'}
                      strokeWidth={inputB === 1 ? '4' : '2.5'}
                      strokeDasharray={inputB === 1 ? '6,3' : 'none'}
                      className={inputB === 1 ? 'animate-pulse' : ''}
                    />
                  )}

                  {/* OUTPUT WIRE */}
                  <line
                    x1="390"
                    y1="120"
                    x2="520"
                    y2="120"
                    stroke={gateOutput === 1 ? '#38bdf8' : '#334155'}
                    strokeWidth={gateOutput === 1 ? '4' : '2.5'}
                    strokeDasharray={gateOutput === 1 ? '6,3' : 'none'}
                    className={gateOutput === 1 ? 'animate-pulse' : ''}
                  />

                  {/* GATE SYMBOL BODY */}
                  {/* 1. AND / NAND */}
                  {(selectedGate === 'AND' || selectedGate === 'NAND') && (
                    <path
                      d="M 230 50 L 290 50 A 70 70 0 0 1 290 190 L 230 190 Z"
                      fill="#0f172a"
                      stroke="#64748b"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* 2. OR */}
                  {selectedGate === 'OR' && (
                    <path
                      d="M 220 50 Q 260 120 220 190 Q 310 190 370 120 Q 310 50 220 50 Z"
                      fill="#0f172a"
                      stroke="#64748b"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* 3. XOR */}
                  {selectedGate === 'XOR' && (
                    <g>
                      <path
                        d="M 210 50 Q 250 120 210 190"
                        fill="none"
                        stroke="#64748b"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M 225 50 Q 265 120 225 190 Q 315 190 370 120 Q 315 50 225 50 Z"
                        fill="#0f172a"
                        stroke="#64748b"
                        strokeWidth="2.5"
                      />
                    </g>
                  )}

                  {/* 4. NOT */}
                  {selectedGate === 'NOT' && (
                    <polygon
                      points="230,60 350,120 230,180"
                      fill="#0f172a"
                      stroke="#64748b"
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Inverter Bubble for NOT and NAND */}
                  {(selectedGate === 'NOT' || selectedGate === 'NAND') && (
                    <circle
                      cx={selectedGate === 'NOT' ? '362' : '372'}
                      cy="120"
                      r="8"
                      fill="#0f172a"
                      stroke="#64748b"
                      strokeWidth="2"
                    />
                  )}

                  {/* Label on Gate */}
                  <text
                    x={selectedGate === 'NOT' ? '280' : '290'}
                    y="126"
                    fill="#94a3b8"
                    fontSize="16"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {selectedGate}
                  </text>

                  {/* Input Nodes Labels */}
                  <g transform="translate(60, 75)">
                    <circle cx="0" cy="0" r="14" fill={inputA === 1 ? '#10b981' : '#1e293b'} stroke="#475569" strokeWidth="1.5" />
                    <text x="0" y="5" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">{inputA}</text>
                    <text x="-25" y="4" fill="#94a3b8" fontSize="11" textAnchor="middle">A</text>
                  </g>

                  {selectedGate !== 'NOT' && (
                    <g transform="translate(60, 165)">
                      <circle cx="0" cy="0" r="14" fill={inputB === 1 ? '#10b981' : '#1e293b'} stroke="#475569" strokeWidth="1.5" />
                      <text x="0" y="5" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">{inputB}</text>
                      <text x="-25" y="4" fill="#94a3b8" fontSize="11" textAnchor="middle">B</text>
                    </g>
                  )}

                  {/* Output Node Badge */}
                  <g transform="translate(520, 120)">
                    <circle cx="0" cy="0" r="18" fill={gateOutput === 1 ? '#0284c7' : '#1e293b'} stroke={gateOutput === 1 ? '#38bdf8' : '#475569'} strokeWidth="2" />
                    <text x="0" y="6" fill="#ffffff" fontSize="15" fontWeight="bold" textAnchor="middle">{gateOutput}</text>
                    <text x="35" y="5" fill="#94a3b8" fontSize="11" textAnchor="middle">פלט</text>
                  </g>
                </svg>
              </div>

              {/* Interactive Input Switches */}
              <div className="flex items-center justify-around pt-1">
                <button
                  type="button"
                  onClick={handleToggleA}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                    inputA === 1
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>קלט א': {inputA === 1 ? '1 (דולק)' : '0 (כבוי)'}</span>
                </button>

                {selectedGate !== 'NOT' && (
                  <button
                    type="button"
                    onClick={handleToggleB}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                      inputB === 1
                        ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span>קלט ב': {inputB === 1 ? '1 (דולק)' : '0 (כבוי)'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Live Dynamic Truth Table */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">טבלת אפשרויות (טבלת אמת)</span>
                <span className="text-[10px] text-slate-400 font-mono">{selectedGate}</span>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-800 text-xs">
                <table className="w-full text-center">
                  <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-1.5 px-2">A</th>
                      {selectedGate !== 'NOT' && <th className="py-1.5 px-2">B</th>}
                      <th className="py-1.5 px-2 text-blue-400">פלט (Q)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    {truthTableRows.map((row, idx) => (
                      <tr
                        key={idx}
                        className={`transition-colors ${
                          row.active ? 'bg-blue-950/70 text-blue-200 font-bold' : 'text-slate-400 bg-slate-900/40'
                        }`}
                      >
                        <td className="py-1.5">{row.a}</td>
                        {selectedGate !== 'NOT' && <td className="py-1.5">{row.b}</td>}
                        <td className={`py-1.5 ${row.out === 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {row.out}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                {currentGateMeta.desc}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* ================= MODE 2: HALF-ADDER CIRCUIT ================= */
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Binary className="w-4 h-4 text-emerald-400" />
              <span>כיצד מחשב מחבר 1 ועוד 1 בבינארית? (1 + 1 = 10)</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              כשהמחשב מחבר שני מספרים, שער אחד (XOR) מחשב את ספרת האחדות (הסכום), 
              ושער שני (AND) בודק אם צריך להעביר &quot;נשא&quot; לספרה הבאה. 
              שנו את מתגי הקלט למטה וראו כיצד נוצרת התוצאה הבינארית!
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Half-Adder SVG Circuit */}
            <div className="lg:col-span-8 bg-slate-950 rounded-xl border border-slate-800 p-4">
              <div className="relative w-full aspect-[2.4/1] flex items-center justify-center">
                <svg viewBox="0 0 650 260" className="w-full h-full select-none" dir="ltr">
                  {/* WIRES A & B SPLITTING TO XOR AND AND */}
                  {/* Wire A to XOR */}
                  <path
                    d="M 60 70 L 220 70"
                    fill="none"
                    stroke={inputA === 1 ? '#10b981' : '#334155'}
                    strokeWidth={inputA === 1 ? '3.5' : '2'}
                  />
                  {/* Wire A split to AND */}
                  <path
                    d="M 120 70 L 120 170 L 220 170"
                    fill="none"
                    stroke={inputA === 1 ? '#10b981' : '#334155'}
                    strokeWidth={inputA === 1 ? '3.5' : '2'}
                  />

                  {/* Wire B to XOR */}
                  <path
                    d="M 60 100 L 150 100 L 150 90 L 220 90"
                    fill="none"
                    stroke={inputB === 1 ? '#38bdf8' : '#334155'}
                    strokeWidth={inputB === 1 ? '3.5' : '2'}
                  />
                  {/* Wire B split to AND */}
                  <path
                    d="M 150 100 L 150 190 L 220 190"
                    fill="none"
                    stroke={inputB === 1 ? '#38bdf8' : '#334155'}
                    strokeWidth={inputB === 1 ? '3.5' : '2'}
                  />

                  {/* XOR Gate Box */}
                  <rect x="220" y="55" width="120" height="50" rx="8" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
                  <text x="280" y="86" fill="#cbd5e1" fontSize="13" fontWeight="bold" textAnchor="middle">XOR (A ⊕ B)</text>

                  {/* AND Gate Box */}
                  <rect x="220" y="155" width="120" height="50" rx="8" fill="#0f172a" stroke="#64748b" strokeWidth="1.5" />
                  <text x="280" y="186" fill="#cbd5e1" fontSize="13" fontWeight="bold" textAnchor="middle">AND (A ∧ B)</text>

                  {/* Output Wire: Sum (from XOR) */}
                  <line
                    x1="340"
                    y1="80"
                    x2="480"
                    y2="80"
                    stroke={sumBit === 1 ? '#a855f7' : '#334155'}
                    strokeWidth={sumBit === 1 ? '4' : '2'}
                  />

                  {/* Output Wire: Carry (from AND) */}
                  <line
                    x1="340"
                    y1="180"
                    x2="480"
                    y2="180"
                    stroke={carryBit === 1 ? '#f59e0b' : '#334155'}
                    strokeWidth={carryBit === 1 ? '4' : '2'}
                  />

                  {/* Input Nodes */}
                  <g transform="translate(60, 70)">
                    <circle cx="0" cy="0" r="14" fill={inputA === 1 ? '#10b981' : '#1e293b'} stroke="#475569" strokeWidth="1.5" />
                    <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">{inputA}</text>
                    <text x="-25" y="4" fill="#94a3b8" fontSize="11" textAnchor="middle">A</text>
                  </g>

                  <g transform="translate(60, 100)">
                    <circle cx="0" cy="0" r="14" fill={inputB === 1 ? '#38bdf8' : '#1e293b'} stroke="#475569" strokeWidth="1.5" />
                    <text x="0" y="4" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">{inputB}</text>
                    <text x="-25" y="4" fill="#94a3b8" fontSize="11" textAnchor="middle">B</text>
                  </g>

                  {/* Output Badges */}
                  <g transform="translate(480, 80)">
                    <rect x="0" y="-18" width="120" height="36" rx="8" fill={sumBit === 1 ? '#581c87' : '#1e293b'} stroke={sumBit === 1 ? '#a855f7' : '#334155'} strokeWidth="1.5" />
                    <text x="60" y="4" fill={sumBit === 1 ? '#f3e8ff' : '#94a3b8'} fontSize="11" fontWeight="bold" textAnchor="middle">
                      סכום (Sum): {sumBit}
                    </text>
                  </g>

                  <g transform="translate(480, 180)">
                    <rect x="0" y="-18" width="120" height="36" rx="8" fill={carryBit === 1 ? '#78350f' : '#1e293b'} stroke={carryBit === 1 ? '#f59e0b' : '#334155'} strokeWidth="1.5" />
                    <text x="60" y="4" fill={carryBit === 1 ? '#fef3c7' : '#94a3b8'} fontSize="11" fontWeight="bold" textAnchor="middle">
                      נשא (Carry): {carryBit}
                    </text>
                  </g>
                </svg>
              </div>

              {/* Switches */}
              <div className="flex items-center justify-around pt-3 border-t border-slate-900">
                <button
                  type="button"
                  onClick={handleToggleA}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                    inputA === 1
                      ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>קלט A: {inputA}</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleB}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 ${
                    inputB === 1
                      ? 'bg-blue-600/30 border-blue-500 text-blue-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  <span>קלט B: {inputB}</span>
                </button>
              </div>
            </div>

            {/* Arithmetic Result Card */}
            <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="text-xs font-bold text-white">תוצאת החיבור המתמטי</div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-center">
                <div className="text-slate-400 text-xs font-mono">
                  {inputA} + {inputB} = ?
                </div>
                <div className="text-2xl font-bold font-mono text-emerald-400">
                  {carryBit}{sumBit} <span className="text-xs text-slate-400 font-sans">בבסיס 2</span>
                </div>
                <div className="text-xs text-slate-300">
                  שווה לערך עשרוני: <strong>{inputA + inputB}</strong>
                </div>
              </div>

              <div className="space-y-1.5 text-[11px] text-slate-400 leading-relaxed">
                <div>&bull; <strong>נשא (Carry = {carryBit})</strong>: מייצג את ספרת העשרות בבינארית (ערך 2).</div>
                <div>&bull; <strong>סכום (Sum = {sumBit})</strong>: מייצג את ספרת האחדות בבינארית (ערך 1).</div>
                {inputA === 1 && inputB === 1 && (
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-800/60 text-amber-200 mt-2 font-medium">
                    שימו לב! 1 + 1 יוצר תוצאה 0 בספרת האחדות ונשא 1 לספרה הבאה: בדיוק 10 בבינארית (שווה ל-2)!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
