import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, ArrowRight, ArrowLeft, Bot, Key, Unlock, ShieldAlert } from 'lucide-react';
import { AudioEngine } from '../../core/audio.js';

export default function SvgRobotAnimation() {
  const steps = [
    { title: 'אתחול', command: 'START', pos: { x: 80, y: 150 }, hasKey: false, gateLocked: true, desc: 'הרובוט מוצב בנקודת ההתחלה, מוכן לקבלת ההוראות.' },
    { title: 'צעד 1: קדימה', command: 'STEP_FORWARD', pos: { x: 180, y: 150 }, hasKey: false, gateLocked: true, desc: 'הרובוט קורא את ההוראה הראשונה וצועד צעד אחד קדימה.' },
    { title: 'צעד 2: איסוף מפתח', command: 'PICK_KEY', pos: { x: 280, y: 150 }, hasKey: true, gateLocked: true, desc: 'בדיקה: יש מפתח במשבצת! הרובוט אוסף אותו ושומר בזיכרון (יש מפתח = כן).' },
    { title: 'צעד 3: קדימה לשער', command: 'STEP_FORWARD', pos: { x: 380, y: 150 }, hasKey: true, gateLocked: true, desc: 'הרובוט ממשיך קדימה ומגיע לשער הנעול.' },
    { title: 'צעד 4: בדיקת מפתח', command: 'UNLOCK_GATE', pos: { x: 480, y: 150 }, hasKey: true, gateLocked: false, desc: 'בדיקת תנאי: האם יש מפתח ביד? כן! השער נפתח למעבר.' },
    { title: 'סיום: הגעה ליעד', command: 'REACH_GOAL', pos: { x: 580, y: 150 }, hasKey: true, gateLocked: false, desc: 'הרובוט ביצע את כל ההוראות והגיע בהצלחה למטרה!' }
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let timer = null;
    if (isPlaying) {
      timer = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          AudioEngine.playStep();
          return prev + 1;
        });
      }, 1400);
    }
    return () => clearInterval(timer);
  }, [isPlaying, steps.length]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      AudioEngine.playStep();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      AudioEngine.playStep();
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    AudioEngine.playStep();
  };

  const state = steps[currentStep];

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 space-y-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-white">איך הרובוט מבצע פקודות לפי הסדר ובודק תנאים</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 transition-colors"
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold transition-colors"
          >
            {isPlaying ? <Pause className="w-3 h-3 fill-white" /> : <Play className="w-3 h-3 fill-white" />}
            <span>{isPlaying ? 'השהיה' : 'הפעלה'}</span>
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentStep === steps.length - 1}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 border border-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors"
            title="איפוס"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full aspect-[2.6/1] bg-slate-900/60 rounded-xl border border-slate-800/80 p-2 overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 700 260" className="w-full h-full select-none">
          {/* Track Path */}
          <line x1="60" y1="150" x2="640" y2="150" stroke="#1e293b" strokeWidth="18" strokeLinecap="round" />
          <line x1="60" y1="150" x2="640" y2="150" stroke="#334155" strokeWidth="2" strokeDasharray="8,8" />

          {/* Grid milestones */}
          {steps.map((st, i) => (
            <g key={i}>
              <circle
                cx={st.pos.x}
                cy={150}
                r={i <= currentStep ? 14 : 10}
                fill={i <= currentStep ? '#0284c7' : '#0f172a'}
                stroke={i <= currentStep ? '#38bdf8' : '#334155'}
                strokeWidth="2"
                className="transition-all duration-300"
              />
              <text x={st.pos.x} y={154} textAnchor="middle" fill="#ffffff" fontSize="10" fontWeight="bold">
                {i}
              </text>
            </g>
          ))}

          {/* Key Location at Step 2 (x=280) */}
          <g transform="translate(280, 110)">
            <circle cx="0" cy="0" r="14" fill={state.hasKey ? '#065f46' : '#854d0e'} stroke={state.hasKey ? '#10b981' : '#f59e0b'} strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11">🔑</text>
          </g>

          {/* Gate Barrier Location at Step 4 (x=480) */}
          <g transform="translate(480, 150)">
            <line
              x1="0"
              y1={state.gateLocked ? -30 : -5}
              x2="0"
              y2={state.gateLocked ? 30 : 5}
              stroke={state.gateLocked ? '#ef4444' : '#10b981'}
              strokeWidth="6"
              strokeLinecap="round"
              className="transition-all duration-300"
            />
            <text x="0" y="-38" textAnchor="middle" fill={state.gateLocked ? '#ef4444' : '#10b981'} fontSize="11" fontWeight="bold">
              {state.gateLocked ? 'נעול 🔒' : 'פתוח 🔓'}
            </text>
          </g>

          {/* Goal Star at Step 5 (x=580) */}
          <g transform="translate(580, 110)">
            <circle cx="0" cy="0" r="14" fill="#1e1b4b" stroke="#6366f1" strokeWidth="1.5" />
            <text x="0" y="4" textAnchor="middle" fill="#ffffff" fontSize="11">🏆</text>
          </g>

          {/* Animated Robot Avatar */}
          <g transform={`translate(${state.pos.x}, ${state.pos.y - 45})`} className="transition-all duration-500 ease-out">
            <rect x="-20" y="-15" width="40" height="30" rx="6" fill="#2563eb" stroke="#60a5fa" strokeWidth="2" />
            <circle cx="-8" cy="-2" r="3" fill="#ffffff" />
            <circle cx="8" cy="-2" r="3" fill="#ffffff" />
            <line x1="0" y1="-15" x2="0" y2="-23" stroke="#60a5fa" strokeWidth="2" />
            <circle cx="0" cy="-24" r="3" fill="#38bdf8" />
          </g>

          {/* Top Instruction Conveyor Queue */}
          <g transform="translate(60, 20)">
            <text x="0" y="16" fill="#94a3b8" fontSize="11" fontWeight="bold">רשימת ההוראות:</text>
            {steps.slice(1).map((st, i) => {
              const qx = 140 + i * 105;
              const isExecuting = i + 1 === currentStep;
              const isPast = i + 1 < currentStep;

              return (
                <g key={i}>
                  <rect
                    x={qx}
                    y="0"
                    width="95"
                    height="25"
                    rx="4"
                    fill={isExecuting ? '#1d4ed8' : isPast ? '#0f172a' : '#1e293b'}
                    stroke={isExecuting ? '#60a5fa' : '#334155'}
                    strokeWidth="1.5"
                    className="transition-colors duration-200"
                  />
                  <text
                    x={qx + 47}
                    y="16"
                    textAnchor="middle"
                    fill={isExecuting ? '#ffffff' : isPast ? '#475569' : '#cbd5e1'}
                    fontSize="9"
                    fontFamily="monospace"
                  >
                    {st.command}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Step Description & Status Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400">השלב עכשיו:</div>
          <div className="text-xs font-bold text-white mt-0.5">{state.title}</div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400">שמור בזיכרון (מפתח ביד?):</div>
          <div className={`font-mono text-xs font-bold mt-0.5 ${state.hasKey ? 'text-emerald-400' : 'text-amber-400'}`}>
            {state.hasKey ? 'כן (TRUE)' : 'לא (FALSE)'}
          </div>
        </div>

        <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
          <div className="text-[10px] text-slate-400">מצב השער:</div>
          <div className={`font-mono text-xs font-bold mt-0.5 ${state.gateLocked ? 'text-red-400' : 'text-emerald-400'}`}>
            {state.gateLocked ? 'חסום לתנועה' : 'פתוח למעבר'}
          </div>
        </div>
      </div>
      <p className="text-[11px] text-slate-400 leading-relaxed text-center">
        {state.desc}
      </p>
    </div>
  );
}
