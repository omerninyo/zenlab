import React, { useState, useEffect, useRef } from 'react';
import { Heart, Sparkles, AlertTriangle, Key } from 'lucide-react';

/**
 * ZenLivingAvatar - The living, expressive robot companion head with real-time eye tracking.
 * Used across the Home Overworld Map and all 8 Interactive Labs for unified Matific-grade feel.
 */
export default function ZenLivingAvatar({
  mood = 'happy', // 'happy' | 'thinking' | 'celebrating' | 'curious' | 'error'
  isBeamActive = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  showBeamRay = false,
  badgeText = null,
  hasKey = false,
  className = '',
  onClick = null
}) {
  const headRef = useRef(null);
  const pupil0Ref = useRef(null);
  const pupil1Ref = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const handlePointerMove = (e) => {
      if (rafRef.current) return;
      const clientX = e.clientX;
      const clientY = e.clientY;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        if (!headRef.current) return;
        const rect = headRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = (clientX - centerX) / Math.max(window.innerWidth / 2, 200);
        const dy = (clientY - centerY) / Math.max(window.innerHeight / 2, 200);
        const ox = Math.max(-4.5, Math.min(4.5, dx * 5.5)).toFixed(2);
        const oy = Math.max(-3.5, Math.min(3.5, dy * 4.5)).toFixed(2);
        const transformStr = `translate3d(${ox}px, ${oy}px, 0)`;
        if (pupil0Ref.current) pupil0Ref.current.style.transform = transformStr;
        if (pupil1Ref.current) pupil1Ref.current.style.transform = transformStr;
      });
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      if (rafRef.current) window.cancelAnimationFrame(rafRef.current);
    };
  }, []);

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
        <div className="absolute -top-10 w-2.5 h-20 bg-gradient-to-t from-amber-400/70 via-amber-200/30 to-transparent rounded-full blur-xs pointer-events-none" />
      )}

      {/* Robot Head Chassis (Fixed geometry - zero layout-shifting scale/translate) */}
      <div
        className={`relative bg-gradient-to-b from-slate-700 to-slate-800 shadow-2xl flex flex-col items-center justify-center transition-colors duration-200 ${sizeClasses.chassis} ${
          mood === 'celebrating'
            ? 'border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.45)]'
            : mood === 'error'
            ? 'border-rose-400/80'
            : 'border-amber-400/75'
        } ${onClick ? 'group-hover:border-amber-300' : ''}`}
      >
        {/* Antenna */}
        <div className={`absolute bg-amber-400 rounded-full flex flex-col items-center ${sizeClasses.antennaWrap}`}>
          <div
            className={`rounded-full border-2 border-white transition-colors duration-200 ${sizeClasses.antennaBulb} ${
              isBeamActive || mood === 'celebrating'
                ? 'bg-amber-300 shadow-[0_0_16px_#fde047]'
                : mood === 'thinking'
                ? 'bg-indigo-400 shadow-[0_0_12px_#818cf8]'
                : mood === 'error'
                ? 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'
                : 'bg-amber-500 shadow-md'
            }`}
          />
        </div>

        {/* Optional Key Held Indicator (e.g. Lab 2) */}
        {hasKey && (
          <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-amber-400 text-slate-950 border-2 border-white shadow-lg flex items-center justify-center z-20">
            <Key className="w-3.5 h-3.5" />
          </div>
        )}

        {/* Screen Visor with Expressive Eyes */}
        <div className={`w-full bg-slate-950 border-2 border-slate-700 flex items-center justify-around shadow-inner relative overflow-hidden ${sizeClasses.visor}`}>
          {mood === 'celebrating' ? (
            <>
              <Heart className={`${sizeClasses.icon} text-rose-400 fill-rose-500`} />
              <Heart className={`${sizeClasses.icon} text-rose-400 fill-rose-500`} />
            </>
          ) : mood === 'error' ? (
            <>
              <AlertTriangle className={`${sizeClasses.icon} text-rose-400`} />
              <AlertTriangle className={`${sizeClasses.icon} text-rose-400`} />
            </>
          ) : (
            <>
              {[pupil0Ref, pupil1Ref].map((pRef, eyeIdx) => (
                <div
                  key={eyeIdx}
                  className={`rounded-full bg-slate-800 border-blue-400/60 flex items-center justify-center relative overflow-hidden shadow-inner ${sizeClasses.eyeOuter} ${
                    mood === 'thinking' ? 'border-amber-400/70' : ''
                  }`}
                >
                  <div
                    ref={pRef}
                    className={`rounded-full will-change-transform ${sizeClasses.eyeInner} ${
                      mood === 'thinking'
                        ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                        : 'bg-blue-400 shadow-[0_0_8px_#60a5fa]'
                    }`}
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
