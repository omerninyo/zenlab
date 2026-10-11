import React, { useState, useEffect, useRef } from 'react';
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
  Radio
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
  const [robotMood, setRobotMood] = useState('happy'); // 'happy' | 'thinking' | 'celebrating'
  const [isBeamActive, setIsBeamActive] = useState(false);
  const [pupilOffset, setPupilOffset] = useState({ x: 0, y: 0 });

  const stageRef = useRef(null);

  // Challenge checks
  const isHeartCompleted = !!completedChallenges['lab1_challenge1'];
  const isSmileyCompleted = !!completedChallenges['lab1_challenge2'];
  const isCustomCompleted = !!completedChallenges['lab1_challenge3'];

  // Heart preset pattern for stencil guide
  const heartPreset = labData?.presets?.heart?.grid || [];
  const smileyPreset = labData?.presets?.smiley?.grid || [];

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

  // Touch and drag support for fluid "finger-painting"
  const handleBulbTouch = (idx, forceVal = null) => {
    const currentVal = grid[idx];
    const targetVal = forceVal !== null ? forceVal : (currentVal === 1 ? 0 : 1);
    
    if (currentVal !== targetVal) {
      onCellClick(idx);
      
      // Xylophone chime based on row (pentatonic C4 to C6)
      const row = Math.floor(idx / 8);
      const pentatonicNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
      const freq = pentatonicNotes[7 - row] || 440;
      
      if (targetVal === 1) {
        AudioEngine.playTone(freq, 'sine', 0.12);
      } else {
        AudioEngine.playTone(180, 'triangle', 0.05);
      }
    }
  };

  return (
    <div 
      ref={stageRef}
      onMouseMove={handleMouseMove}
      className="w-full relative overflow-hidden rounded-3xl border-4 border-amber-400/40 shadow-2xl p-4 sm:p-8 select-none text-white transition-all"
      style={{
        background: 'radial-gradient(ellipse at 50% 20%, #1e1b4b 0%, #0f172a 60%, #020617 100%)'
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
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 pb-6 border-b border-white/10">
        
        {/* Friendly Hovering Satellite */}
        <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-lg">
          <div className="relative">
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

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-indigo-500/40 text-indigo-200 border border-indigo-400/30">
                לוויין כדור הארץ
              </span>
              <span className="text-[11px] text-amber-300 font-bold">
                {isBeamActive ? 'קולט שידור חי! 📡' : 'ממתין לאות שלכם...'}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5">
              {isHeartCompleted 
                ? 'האות נקלט בהצלחה! שלחתם לב חם לחלל!' 
                : 'האירו את הנורות בצורת לב ❤️ כדי לשלוח אות ללוויין!'}
            </p>
          </div>
        </div>

        {/* 3 Golden Star Jars (Game Rewards) */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/15">
          <span className="text-xs font-bold text-amber-200">כוכבי מסע:</span>
          <div className="flex items-center gap-1.5">
            {[
              { id: 'heart', done: isHeartCompleted, label: 'לב' },
              { id: 'smiley', done: isSmileyCompleted, label: 'סמיילי' },
              { id: 'custom', done: isCustomCompleted, label: 'יצירה' }
            ].map((starObj, sIdx) => (
              <div 
                key={sIdx}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shadow-md ${
                  starObj.done
                    ? 'bg-amber-400 text-slate-950 scale-110 shadow-amber-400/50'
                    : 'bg-white/10 text-white/30 border border-white/10'
                }`}
                title={starObj.label}
              >
                <Star className={`w-5 h-5 ${starObj.done ? 'fill-slate-950 text-slate-950' : ''}`} />
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. The Living Robot Character & Interactive Light Matrix */}
      <div className="relative z-10 py-6 flex flex-col items-center">
        
        {/* Animated Laser Beam when transmitting */}
        {isBeamActive && (
          <div className="absolute top-0 w-3 h-36 bg-gradient-to-t from-amber-400 via-amber-200 to-transparent rounded-full blur-xs animate-pulse" />
        )}

        {/* Robot Head with Expressive Eyes */}
        <div className={`relative w-44 h-28 bg-gradient-to-b from-slate-700 to-slate-800 rounded-3xl border-4 border-amber-400/70 shadow-2xl flex flex-col items-center justify-center p-3 transition-transform duration-300 ${
          robotMood === 'celebrating' ? 'scale-110 -translate-y-2' : ''
        }`}>
          {/* Antenna */}
          <div className="absolute -top-7 w-2 h-7 bg-amber-400 rounded-full flex flex-col items-center">
            <div className={`w-5 h-5 -mt-2 rounded-full border-2 border-white transition-all ${
              isBeamActive ? 'bg-amber-300 shadow-[0_0_20px_#fde047] scale-125' : 'bg-amber-500 shadow-md'
            }`} />
          </div>

          {/* Screen Visor with Eyes */}
          <div className="w-full h-16 bg-slate-950 rounded-2xl border-2 border-slate-700 flex items-center justify-around px-4 shadow-inner relative overflow-hidden">
            {robotMood === 'celebrating' ? (
              // Heart Eyes in celebration
              <>
                <Heart className="w-8 h-8 text-rose-400 fill-rose-500 animate-bounce" />
                <Heart className="w-8 h-8 text-rose-400 fill-rose-500 animate-bounce" />
              </>
            ) : (
              // Living Tracking Eyes
              <>
                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-blue-400/60 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <div 
                    className="w-4 h-4 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] transition-transform duration-75"
                    style={{
                      transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-0.5 ml-0.5" />
                  </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-blue-400/60 flex items-center justify-center relative overflow-hidden shadow-inner">
                  <div 
                    className="w-4 h-4 rounded-full bg-blue-400 shadow-[0_0_8px_#60a5fa] transition-transform duration-75"
                    style={{
                      transform: `translate(${pupilOffset.x}px, ${pupilOffset.y}px)`
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-white rounded-full mt-0.5 ml-0.5" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Robot Torso with 8x8 Physical Glass Bulbs */}
        <div className="relative mt-2 p-4 sm:p-6 bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 rounded-4xl border-4 border-amber-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center">
          
          {/* Glass Cover Container */}
          <div className="relative p-3 sm:p-4 bg-slate-950/90 rounded-3xl border-3 border-slate-700/80 shadow-2xl backdrop-blur-xs">
            
            {/* The 8x8 Grid of Living Bulbs */}
            <div 
              className="grid grid-cols-8 gap-2 sm:gap-2.5 w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] select-none"
              style={{ touchAction: 'none' }}
              onMouseDown={() => setIsDragging(true)}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              {grid.map((cellVal, idx) => {
                const isLit = cellVal === 1;
                const isHeartGhost = showStencil && stencilType === 'heart' && heartPreset[idx] === 1;
                const isSmileyGhost = showStencil && stencilType === 'smiley' && smileyPreset[idx] === 1;
                const isGhost = isHeartGhost || isSmileyGhost;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleBulbTouch(idx)}
                    onMouseEnter={() => {
                      if (isDragging) handleBulbTouch(idx, 1);
                    }}
                    className={`relative rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer shadow-md focus:outline-none ${
                      isLit
                        ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 scale-105 border-2 border-white shadow-[0_0_16px_rgba(251,191,36,0.9)]'
                        : isGhost
                        ? 'bg-slate-800/80 border-2 border-dashed border-amber-300/40 animate-pulse'
                        : 'bg-slate-900/90 hover:bg-slate-800 border-2 border-slate-800 active:scale-90'
                    }`}
                  >
                    {/* Glowing Filament or Sparkle inside bulb */}
                    {isLit ? (
                      <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                    ) : isGhost ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-300/40" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Friendly Tactile Action Toolbar */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-5 pt-3 border-t border-white/10">
            
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
                <span>{showStencil ? 'הסתר רמז' : 'רמז קסום 🪄'}</span>
              </button>

              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs text-white/70 hover:text-white border border-white/20 transition-all cursor-pointer shadow-md"
                title="כיבוי כל הנורות"
              >
                <RotateCcw className="w-4 h-4" />
                <span>ניקוי לוח</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
