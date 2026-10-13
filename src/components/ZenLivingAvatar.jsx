import React, { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, AlertTriangle, Key } from 'lucide-react';

/**
 * ZenLivingAvatar - The living, expressive robot companion head with real-time eye tracking.
 * Used across the Home Overworld Map and all 8 Interactive Labs for unified Matific-grade feel.
 */
export default function ZenLivingAvatar({
  mood = 'happy', // 'happy' | 'thinking' | 'celebrating' | 'curious' | 'error'
  isBeamActive = false,
  pupilOffset: externalPupilOffset = null,
  size = 'md', // 'sm' | 'md' | 'lg'
  showBeamRay = false,
  badgeText = null,
  hasKey = false,
  className = '',
  onClick = null
}) {
  const headRef = useRef(null);
  const [internalOffset, setInternalOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (externalPupilOffset !== null) return;

    const handlePointerMove = (e) => {
      if (!headRef.current) return;
      const rect = headRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (e.clientX - centerX) / (window.innerWidth / 2);
      const dy = (e.clientY - centerY) / (window.innerHeight / 2);
      setInternalOffset({
        x: Math.max(-5, Math.min(5, dx * 6)),
        y: Math.max(-4, Math.min(4, dy * 5))
      });
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [externalPupilOffset]);

  const offset = externalPupilOffset || internalOffset;

  const sizeClasses = {
    sm: {
      chassis: 'w-20 h-14 rounded-2xl border-2 p-1.5',
      antennaWrap: '-top-4 w-1.5 h-4',
      antennaBulb: 'w-3.5 h-3.5 -mt-1.5',
      visor: 'h-9 rounded-xl px-2',
      eyeOuter: 'w-5 h-5 border',
      eyeInner: 'w-2.5 h-2.5',
      spark: 'w-1 h-1',
      icon: 'w-4 h-4'
    },
    md: {
      chassis: 'w-40 h-22 sm:w-44 sm:h-24 rounded-3xl border-4 p-2.5 sm:p-3',
      antennaWrap: '-top-6 sm:-top-7 w-2 h-6 sm:h-7',
      antennaBulb: 'w-4.5 h-4.5 sm:w-5 sm:h-5 -mt-2',
      visor: 'h-12 sm:h-14 rounded-2xl px-3.5 sm:px-4',
      eyeOuter: 'w-7 h-7 border-2',
      eyeInner: 'w-3.5 h-3.5',
      spark: 'w-1 h-1',
      icon: 'w-7 h-7'
    },
    lg: {
      chassis: 'w-48 h-28 rounded-3xl border-4 p-3.5',
      antennaWrap: '-top-7 w-2.5 h-7',
      antennaBulb: 'w-5.5 h-5.5 -mt-2',
      visor: 'h-16 rounded-2xl px-5',
      eyeOuter: 'w-8 h-8 border-2',
      eyeInner: 'w-4 h-4',
      spark: 'w-1.5 h-1.5',
      icon: 'w-8 h-8'
    }
  }[size] || {
    chassis: 'w-44 h-24 rounded-3xl border-4 p-3',
    antennaWrap: '-top-7 w-2 h-7',
    antennaBulb: 'w-5 h-5 -mt-2',
    visor: 'h-14 rounded-2xl px-4',
    eyeOuter: 'w-7 h-7 border-2',
    eyeInner: 'w-3.5 h-3.5',
    spark: 'w-1 h-1',
    icon: 'w-7 h-7'
  };

  return (
    <div 
      ref={headRef}
      onClick={onClick}
      className={`relative inline-flex flex-col items-center select-none ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Optional Laser Beam Ray */}
      {showBeamRay && isBeamActive && (
        <div className="absolute -top-12 w-3 h-28 bg-gradient-to-t from-amber-400 via-amber-200 to-transparent rounded-full blur-xs animate-pulse pointer-events-none" />
      )}

      {/* Robot Head Chassis */}
      <div
        className={`relative bg-gradient-to-b from-slate-700 to-slate-800 border-amber-400/75 shadow-2xl flex flex-col items-center justify-center transition-transform duration-300 ${sizeClasses.chassis} ${
          mood === 'celebrating' ? 'scale-110 -translate-y-1.5 border-amber-300' : ''
        } ${mood === 'error' ? 'border-rose-400/80' : ''} ${onClick ? 'group-hover:scale-105' : ''}`}
      >
        {/* Antenna */}
        <div className={`absolute bg-amber-400 rounded-full flex flex-col items-center ${sizeClasses.antennaWrap}`}>
          <div
            className={`rounded-full border-2 border-white transition-all ${sizeClasses.antennaBulb} ${
              isBeamActive || mood === 'celebrating'
                ? 'bg-amber-300 shadow-[0_0_20px_#fde047] scale-125'
                : mood === 'thinking'
                ? 'bg-indigo-400 shadow-[0_0_14px_#818cf8] animate-pulse'
                : mood === 'error'
                ? 'bg-rose-500 shadow-[0_0_14px_#f43f5e]'
                : 'bg-amber-500 shadow-md'
            }`}
          />
        </div>

        {/* Optional Key Held Indicator (e.g. Lab 2) */}
        {hasKey && (
          <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-amber-400 text-slate-950 border-2 border-white shadow-lg flex items-center justify-center animate-bounce z-20">
            <Key className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Screen Visor with Expressive Eyes */}
        <div className={`w-full bg-slate-950 border-2 border-slate-700 flex items-center justify-around shadow-inner relative overflow-hidden ${sizeClasses.visor}`}>
          {mood === 'celebrating' ? (
            <>
              <Heart className={`${sizeClasses.icon} text-rose-400 fill-rose-500 animate-bounce`} />
              <Heart className={`${sizeClasses.icon} text-rose-400 fill-rose-500 animate-bounce`} />
            </>
          ) : mood === 'error' ? (
            <>
              <AlertTriangle className={`${sizeClasses.icon} text-rose-400 animate-pulse`} />
              <AlertTriangle className={`${sizeClasses.icon} text-rose-400 animate-pulse`} />
            </>
          ) : (
            <>
              {[0, 1].map((eyeIdx) => (
                <div
                  key={eyeIdx}
                  className={`rounded-full bg-slate-800 border-blue-400/60 flex items-center justify-center relative overflow-hidden shadow-inner ${sizeClasses.eyeOuter} ${
                    mood === 'thinking' ? 'border-amber-400/70' : ''
                  }`}
                >
                  <div
                    className={`rounded-full transition-transform duration-75 ${sizeClasses.eyeInner} ${
                      mood === 'thinking'
                        ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                        : 'bg-blue-400 shadow-[0_0_8px_#60a5fa]'
                    }`}
                    style={{
                      transform: `translate(${offset.x}px, ${offset.y}px)`
                    }}
                  >
                    <div className={`bg-white rounded-full mt-0.5 ml-0.5 ${sizeClasses.spark}`} />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Optional Floating Subtitle Pill under Head */}
      {badgeText && (
        <span className="mt-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 shadow-md border border-amber-200 whitespace-nowrap">
          {badgeText}
        </span>
      )}
    </div>
  );
}
