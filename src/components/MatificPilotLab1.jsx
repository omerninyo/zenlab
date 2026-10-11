import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Sparkles, 
  Star, 
  RotateCcw, 
  Heart, 
  Smile, 
  HelpCircle, 
  Volume2, 
  Check, 
  Award,
  ArrowRight,
  Radio,
  Eye,
  Binary,
  Cpu,
  Layers,
  Lightbulb,
  Zap,
  Info
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { fireChampagneConfetti } from '../core/confetti.js';

export default function MatificPilotLab1({
  grid,
  onCellClick,
  onApplyPreset,
  onClear,
  completedChallenges = {},
  earnedStars = 0,
  labData
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showStencil, setShowStencil] = useState(false);
  const [stencilType, setStencilType] = useState('heart'); // 'heart' | 'smiley'
  const [showXRay, setShowXRay] = useState(true); // Default to showing bits 0 and 1!
  const [hoveredBitIndex, setHoveredBitIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [showTheoryCard, setShowTheoryCard] = useState(false);
  const [robotMood, setRobotMood] = useState('happy'); // 'happy' | 'thinking' | 'celebrating'
  const [isBeamActive, setIsBeamActive] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  const stageRef = useRef(null);

  // Challenge checks
  const isHeartCompleted = !!completedChallenges['lab1_challenge1'];
  const isSmileyCompleted = !!completedChallenges['lab1_challenge2'];
  const isCustomCompleted = !!completedChallenges['lab1_challenge3'];

  // Presets
  const heartPreset = labData?.presets?.heart?.grid || [];
  const smileyPreset = labData?.presets?.smiley?.grid || [];

  // Active lit bulbs count
  const litCount = useMemo(() => grid.filter(b => b === 1).length, [grid]);

  // Compute 8 bytes info (bits, hex, integer)
  const rowBytes = useMemo(() => {
    const rows = [];
    for (let r = 0; r < 8; r++) {
      const bits = grid.slice(r * 8, r * 8 + 8);
      const bitStr = bits.join('');
      const val = parseInt(bitStr, 2);
      const hex = '0x' + val.toString(16).toUpperCase().padStart(2, '0');
      rows.push({
        rowIndex: r,
        bits,
        bitStr,
        val,
        hex,
        litInRow: bits.filter(b => b === 1).length
      });
    }
    return rows;
  }, [grid]);

  // Track cursor for cute robot eye-tracking
  const handleMouseMove = (e) => {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const relY = (e.clientY - (rect.top + rect.height / 3)) / (rect.height / 3);
    setPupilOffset({
      x: Math.max(-5, Math.min(5, relX * 5)),
      y: Math.max(-4, Math.min(4, relY * 4))
    });
  };

  // Trigger beam and celebration animation when a challenge completes
  useEffect(() => {
    if (isHeartCompleted || isSmileyCompleted) {
      setRobotMood('celebrating');
      setIsBeamActive(true);
      const timer = setTimeout(() => {
        setIsBeamActive(false);
        setRobotMood('happy');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isHeartCompleted, isSmileyCompleted]);

  // Play pentatonic chime for a specific row
  const playRowChime = (rowIndex) => {
    const pentatonicNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const freq = pentatonicNotes[7 - rowIndex] || 440;
    AudioEngine.playTone(freq, 'sine', 0.16);
  };

  // Touch and drag support for fluid finger-painting
  const handleBulbTouch = (idx, forceVal = null) => {
    const currentVal = grid[idx];
    const targetVal = forceVal !== null ? forceVal : (currentVal === 1 ? 0 : 1);
    
    if (currentVal !== targetVal) {
      onCellClick(idx);
      
      const row = Math.floor(idx / 8);
      if (targetVal === 1) {
        playRowChime(row);
      } else {
        AudioEngine.playTone(180, 'triangle', 0.05);
      }
    }
  };

  return (
    <div 
      ref={stageRef}
      onMouseMove={handleMouseMove}
      className="w-full relative overflow-hidden rounded-3xl border-4 border-amber-400/40 shadow-2xl p-4 sm:p-7 select-none text-white transition-all space-y-6"
      style={{
        background: 'radial-gradient(ellipse at 50% 15%, #1e1b4b 0%, #0f172a 60%, #020617 100%)'
      }}
      dir="rtl"
    >
      {/* 1. Starry Animated Sky Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-4 left-10 w-2 h-2 bg-amber-200 rounded-full animate-ping" />
        <div className="absolute top-16 right-20 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        <div className="absolute top-28 left-1/3 w-2 h-2 bg-blue-300 rounded-full animate-pulse" />
        <div className="absolute top-8 right-1/3 w-1 h-1 bg-amber-100 rounded-full animate-ping" />
      </div>

      {/* 2. Top Game Stage Header: Satellite & Floating Mission */}
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-white/10">
        
        {/* Friendly Hovering Satellite with CS Telemetry */}
        <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-lg w-full sm:w-auto">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/30 border-2 border-indigo-400 flex items-center justify-center text-indigo-300 shadow-inner">
              <Radio className={`w-7 h-7 ${isBeamActive ? 'animate-bounce text-amber-300' : 'animate-pulse'}`} />
            </div>
            {isBeamActive && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500"></span>
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-indigo-500/40 text-indigo-200 border border-indigo-400/30">
                לוויין כדור הארץ
              </span>
              <span className="text-[11px] text-amber-300 font-bold">
                {isBeamActive ? 'קולט שידור חי! 📡' : 'ממתין לקוד הבינארי שלכם...'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5 truncate sm:whitespace-normal">
              {litCount === 0
                ? 'בטנו של זֶן כבויה לחלוטין (כל 64 הביטים הם 0). הדליקו נורות כדי להעביר חשמל!'
                : isHeartCompleted 
                ? `שידור הלב נקלט בהצלחה! ${litCount} ביטים דולקים (1) שלחו לב חם לחלל!` 
                : `כרגע דולקים ${litCount} פיקסלים (1) מתוך 64 ביטים בזיכרון של זֶן.`}
            </p>
          </div>
        </div>

        {/* Golden Star Jars & Pedagogical Info Button */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          
          {/* Quick CS Concept Modal Toggle */}
          <button
            type="button"
            onClick={() => {
              setShowTheoryCard(!showTheoryCard);
              AudioEngine.playStep();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
            title="איך המחשב מצייר תמונות?"
          >
            <Info className="w-3.5 h-3.5 text-indigo-300" />
            <span className="hidden md:inline">איך זה עובד?</span>
          </button>

          {/* 3 Golden Star Jars */}
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/15">
            <span className="text-xs font-bold text-amber-200">כוכבים:</span>
            <div className="flex items-center gap-1.5">
              {[
                { id: 'heart', done: isHeartCompleted, label: 'לב' },
                { id: 'smiley', done: isSmileyCompleted, label: 'סמיילי' },
                { id: 'custom', done: isCustomCompleted, label: 'יצירה' }
              ].map((starObj, sIdx) => (
                <div 
                  key={sIdx}
                  className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md ${
                    starObj.done
                      ? 'bg-amber-400 text-slate-950 scale-110 shadow-amber-400/50'
                      : 'bg-white/10 text-white/30 border border-white/10'
                  }`}
                  title={starObj.label}
                >
                  <Star className={`w-4 h-4 ${starObj.done ? 'fill-slate-950 text-slate-950' : ''}`} />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Popover Theory Card: Simple CS Explanation */}
      {showTheoryCard && (
        <div className="relative z-20 bg-indigo-950/90 border-2 border-indigo-400/50 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs sm:text-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h4 className="font-black text-amber-300 flex items-center gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                מדוע המחשב משתמש ב-0 וב-1?
              </h4>
              <p className="text-indigo-100 leading-relaxed">
                בתוך המעבד של המחשב אין מכחולים או צבעים – יש רק מיליוני מתגים חשמליים זעירים הנקראים <strong>טרנזיסטורים</strong>.
                כאשר מתג דלוק (עובר זרם), המחשב מסמן אותו כ-<strong>1</strong>. כאשר הוא כבוי, הוא מסומן כ-<strong>0</strong>.
                כל מתג כזה נקרא <strong>ביט (Bit)</strong>, וקבוצה של 8 ביטים נקראת <strong>בייט (Byte)</strong>!
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTheoryCard(false)}
              className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white text-xs font-bold cursor-pointer"
            >
              סגור
            </button>
          </div>
        </div>
      )}

      {/* 3. The Living Robot Character & Interactive Light Matrix */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* Animated Laser Beam when transmitting */}
        {isBeamActive && (
          <div className="absolute top-0 w-3 h-36 bg-gradient-to-t from-amber-400 via-amber-200 to-transparent rounded-full blur-xs animate-pulse" />
        )}

        {/* Robot Head with Expressive Eyes */}
        <div className={`relative w-44 h-24 bg-gradient-to-b from-slate-700 to-slate-800 rounded-3xl border-4 border-amber-400/70 shadow-2xl flex flex-col items-center justify-center p-3 transition-transform duration-300 ${
          robotMood === 'celebrating' ? 'scale-110 -translate-y-2' : ''
        }`}>
          {/* Antenna */}
          <div className="absolute -top-7 w-2 h-7 bg-amber-400 rounded-full flex flex-col items-center">
            <div className={`w-5 h-5 -mt-2 rounded-full border-2 border-white transition-all ${
              isBeamActive ? 'bg-amber-300 shadow-[0_0_20px_#fde047] scale-125' : 'bg-amber-500 shadow-md'
            }`} />
          </div>

          {/* Screen Visor with Eyes */}
          <div className="w-full h-14 bg-slate-950 rounded-2xl border-2 border-slate-700 flex items-center justify-around px-4 shadow-inner relative overflow-hidden">
            {robotMood === 'celebrating' ? (
              // Heart Eyes in celebration
              <>
                <Heart className="w-7 h-7 text-rose-400 fill-rose-500 animate-bounce" />
                <Heart className="w-7 h-7 text-rose-400 fill-rose-500 animate-bounce" />
              </>
            ) : (
              // Living Tracking Eyes
              <>
                <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-blue-400/60 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <div 
                    className="w-3.5 h-3.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] transition-transform duration-75"
                    style={{
                      transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`
                    }}
                  >
                    <div className="w-1 h-1 bg-white rounded-full mt-0.5 ml-0.5" />
                  </div>
                </div>

                <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-blue-400/60 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <div 
                    className="w-3.5 h-3.5 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] transition-transform duration-75"
                    style={{
                      transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`
                    }}
                  >
                    <div className="w-1 h-1 bg-white rounded-full mt-0.5 ml-0.5" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Robot Torso with 8x8 Physical Glass Bulbs + 8-Byte Row Rulers */}
        <div className="relative mt-2 p-4 sm:p-6 bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 rounded-4xl border-4 border-amber-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center max-w-full">
          
          {/* Torso Top Controls: Binary X-Ray Toggle & Row Legend */}
          <div className="w-full flex items-center justify-between pb-3 mb-3 border-b border-white/10 px-1 gap-2">
            <div className="flex items-center gap-1.5 text-xs text-amber-300 font-bold">
              <Cpu className="w-4 h-4 text-amber-400" />
              <span>בטן הרובוט • 64 פיקסלים</span>
            </div>

            {/* Tactile X-Ray Bit Lens Switch */}
            <button
              type="button"
              onClick={() => {
                setShowXRay(!showXRay);
                AudioEngine.playToggle(!showXRay);
              }}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black transition-all cursor-pointer shadow-md active:scale-95 ${
                showXRay
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/30'
                  : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/20'
              }`}
              title="הדלקה/כיבוי של עדשת הקוד (0 ו-1 בתוך הנורות)"
            >
              <Binary className="w-3.5 h-3.5" />
              <span>{showXRay ? 'עדשת קוד [01]: פעילה' : 'עדשת קוד [01]: כבויה'}</span>
            </button>
          </div>

          {/* Matrix & 8-Byte Rulers Flex Container */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-full overflow-x-auto pb-2">
            
            {/* The 8x8 Grid of Living Bulbs */}
            <div className="relative p-2.5 sm:p-4 bg-slate-950/90 rounded-3xl border-3 border-slate-700/80 shadow-2xl backdrop-blur-xs">
              <div 
                className="grid grid-cols-8 gap-2 sm:gap-2.5 w-[260px] h-[260px] sm:w-[340px] sm:h-[340px] select-none"
                style={{ touchAction: 'none' }}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                {grid.map((cellVal, idx) => {
                  const isLit = cellVal === 1;
                  const row = Math.floor(idx / 8);
                  const isHeartGhost = showStencil && stencilType === 'heart' && heartPreset[idx] === 1;
                  const isSmileyGhost = showStencil && stencilType === 'smiley' && smileyPreset[idx] === 1;
                  const isGhost = isHeartGhost || isSmileyGhost;
                  const isHovered = hoveredBitIndex === idx || hoveredRowIndex === row;

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleBulbTouch(idx)}
                      onMouseEnter={() => {
                        setHoveredBitIndex(idx);
                        if (isDragging) handleBulbTouch(idx, 1);
                      }}
                      onMouseLeave={() => setHoveredBitIndex(null)}
                      className={`relative rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer shadow-md focus:outline-none ${
                        isLit
                          ? isHovered
                            ? 'bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 scale-110 border-2 border-white shadow-[0_0_24px_rgba(255,255,255,1)] ring-2 ring-white'
                            : 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 scale-105 border-2 border-white shadow-[0_0_16px_rgba(251,191,36,0.9)]'
                          : isGhost
                          ? 'bg-slate-800/80 border-2 border-dashed border-amber-300/40 animate-pulse'
                          : isHovered
                          ? 'bg-slate-800 border-2 border-indigo-400 scale-95 ring-2 ring-indigo-400/50'
                          : 'bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-800 active:scale-90'
                      }`}
                    >
                      {/* Inside Bulb: Glowing Bit (1/0) or Physical Filament */}
                      {showXRay ? (
                        <span className={`font-black font-mono select-none ${
                          isLit 
                            ? 'text-slate-950 text-sm sm:text-base drop-shadow-sm' 
                            : isGhost
                            ? 'text-amber-300/60 text-xs sm:text-sm'
                            : 'text-slate-500 text-xs sm:text-sm'
                        }`}>
                          {isLit ? '1' : '0'}
                        </span>
                      ) : (
                        /* Filament / Sparkle when X-Ray is off */
                        isLit ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                        ) : isGhost ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-300/40" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 8-Byte Row Rulers: 'כל שורה היא בייט' */}
            <div className="flex flex-col justify-between h-[260px] sm:h-[340px] py-1 select-none">
              {rowBytes.map((rb) => {
                const isRowHovered = hoveredRowIndex === rb.rowIndex;
                return (
                  <button
                    key={rb.rowIndex}
                    type="button"
                    onClick={() => {
                      playRowChime(rb.rowIndex);
                      setHoveredRowIndex(rb.rowIndex);
                      setTimeout(() => setHoveredRowIndex(null), 1000);
                    }}
                    onMouseEnter={() => setHoveredRowIndex(rb.rowIndex)}
                    onMouseLeave={() => setHoveredRowIndex(null)}
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] sm:text-xs font-mono transition-all text-right cursor-pointer ${
                      isRowHovered || rb.litInRow > 0
                        ? 'bg-indigo-900/60 border-indigo-400 text-amber-200 shadow-sm'
                        : 'bg-slate-900/60 border-slate-700/60 text-slate-400 hover:text-white'
                    }`}
                    title={`שורה ${rb.rowIndex + 1}: 8 ביטים = 1 בייט (${rb.hex})`}
                  >
                    <span className="font-bold text-slate-300">בייט {rb.rowIndex + 1}:</span>
                    <span className="font-bold text-amber-300">{rb.hex}</span>
                    <span className="hidden md:inline font-mono tracking-tighter text-slate-400 text-[10px]">
                      ({rb.bitStr})
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          {/* 4. Live 64-Bit Memory Tape (סרט הנייר של זֶן) */}
          <div className="w-full mt-4 p-3 bg-slate-950/80 rounded-2xl border border-indigo-500/30 flex flex-col gap-2">
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-300">
                <Binary className="w-4 h-4 text-amber-400" />
                <span>סרט הזיכרון החי של זֶן (64 ביטים = 8 בייטים):</span>
              </div>
              <span className="text-[11px] font-mono text-amber-300 font-bold">
                {litCount} ביטים דולקים (1) • {64 - litCount} כבויים (0)
              </span>
            </div>

            {/* 8 Bytes Blocks of Bits */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1 bg-black/40 rounded-xl border border-white/5">
              {rowBytes.map((rb, rIdx) => (
                <div 
                  key={rIdx}
                  className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border transition-all ${
                    hoveredRowIndex === rIdx
                      ? 'bg-indigo-900/80 border-indigo-400 scale-105'
                      : 'bg-slate-900/80 border-slate-800'
                  }`}
                  title={`בייט ${rIdx + 1} (${rb.hex})`}
                >
                  <span className="text-[9px] font-mono font-bold text-slate-500 ml-1">B{rIdx + 1}</span>
                  {rb.bits.map((bitVal, bIdx) => {
                    const globalIdx = rIdx * 8 + bIdx;
                    const isLit = bitVal === 1;
                    const isHovered = hoveredBitIndex === globalIdx;

                    return (
                      <button
                        key={bIdx}
                        type="button"
                        onClick={() => handleBulbTouch(globalIdx)}
                        onMouseEnter={() => setHoveredBitIndex(globalIdx)}
                        onMouseLeave={() => setHoveredBitIndex(null)}
                        className={`w-3.5 h-5 sm:w-4 sm:h-5 text-[10px] font-mono font-bold rounded flex items-center justify-center transition-all cursor-pointer ${
                          isLit 
                            ? 'bg-amber-400 text-slate-950 font-black shadow-xs scale-105' 
                            : isHovered
                            ? 'bg-indigo-500 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {isLit ? '1' : '0'}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
              <span>💡 לחצו על כל ביט בסרט הנייר או בבטן הרובוט כדי להחליף בין 0 ל-1!</span>
              <span className="font-mono text-indigo-300">סה״כ גודל: 8 Bytes</span>
            </div>

          </div>

          {/* Friendly Tactile Action Toolbar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-4 pt-3 border-t border-white/10">
            
            {/* Quick Shape Toys (Magic Shapes) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  onApplyPreset('heart');
                  AudioEngine.playCollect();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 active:scale-95 transition-all text-xs font-black cursor-pointer shadow-md"
              >
                <Heart className="w-4 h-4 fill-rose-400 text-rose-400" />
                <span>צייר לב ❤️</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onApplyPreset('smiley');
                  AudioEngine.playCollect();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 active:scale-95 transition-all text-xs font-black cursor-pointer shadow-md"
              >
                <Smile className="w-4 h-4 text-amber-400" />
                <span>צייר סמיילי 😊</span>
              </button>
            </div>

            {/* Ghost Stencil & Reset Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowStencil(!showStencil);
                  AudioEngine.playStep();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md ${
                  showStencil 
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/30' 
                    : 'bg-white/10 hover:bg-white/15 text-white/80 border-white/20'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>{showStencil ? 'הסתר שבלונה' : 'שבלונת רמז 🪄'}</span>
              </button>

              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs text-white/70 hover:text-white border border-white/20 transition-all cursor-pointer shadow-md"
                title="כיבוי כל הנורות"
              >
                <RotateCcw className="w-4 h-4" />
                <span>איפוס לוח</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
