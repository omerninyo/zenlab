import React, { useState, useEffect, useRef } from 'react';
import { Heart, AlertTriangle, Key } from 'lucide-react';
import { StorageEngine } from '../core/storage.js';
import { getEquippedZenGadget } from './BespokeIllustrations.jsx';

/**
 * ZenLivingAvatar - The living, expressive robot companion head with real-time 60fps eye tracking
 * and customizable metagame Workshop Gadgets.
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
  const [equippedGadget, setEquippedGadget] = useState(() =>
    getEquippedZenGadget(StorageEngine.getState()?.totalStars || 0)
  );

  useEffect(() => {
    const onGadgetChange = (e) => {
      if (e.detail?.gadgetId) setEquippedGadget(e.detail.gadgetId);
    };
    const unsubStorage = StorageEngine.subscribe((state) => {
      setEquippedGadget(getEquippedZenGadget(state.totalStars || 0));
    });
    window.addEventListener('zen-gadget-change', onGadgetChange);
    return () => {
      window.removeEventListener('zen-gadget-change', onGadgetChange);
      unsubStorage();
    };
  }, []);

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

      {/* Gadget: Floating Neural Halo (15+ Stars) */}
      {equippedGadget === 'halo_neural' && (
        <svg
          width="140"
          height="26"
          viewBox="0 0 140 26"
          fill="none"
          className="absolute -top-9 pointer-events-none z-20"
        >
          <ellipse
            cx="70"
            cy="13"
            rx="54"
            ry="7"
            stroke="#34d399"
            strokeWidth="2.5"
            strokeDasharray="6 3"
          />
          <circle cx="16" cy="13" r="3.5" fill="#6ee7b7" />
          <circle cx="124" cy="13" r="3.5" fill="#6ee7b7" />
          <circle cx="70" cy="6" r="3.5" fill="#fbbf24" />
        </svg>
      )}

      {/* Gadget: Golden Constellation Crown (9+ Stars) */}
      {equippedGadget === 'crown_radar' && (
        <svg
          width="68"
          height="24"
          viewBox="0 0 68 24"
          fill="none"
          className="absolute -top-6 pointer-events-none z-20"
        >
          <path
            d="M8 22L14 7L27 15L34 3L41 15L54 7L60 22H8Z"
            fill="#f59e0b"
            stroke="#fef3c7"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <circle cx="34" cy="3" r="2.5" fill="#fef08a" />
          <circle cx="14" cy="7" r="2" fill="#38bdf8" />
          <circle cx="54" cy="7" r="2" fill="#38bdf8" />
        </svg>
      )}

      {/* Robot Head Chassis */}
      <div
        className={`relative bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-2xl flex flex-col items-center justify-center transition-colors duration-200 ${sizeClasses.chassis} ${
          mood === 'celebrating'
            ? 'border-amber-300 shadow-[0_0_25px_rgba(251,191,36,0.45)]'
            : mood === 'error'
            ? 'border-rose-400/80'
            : equippedGadget === 'visor_cyber'
            ? 'border-cyan-400/85 shadow-[0_0_22px_rgba(34,211,238,0.28)]'
            : equippedGadget === 'halo_neural'
            ? 'border-emerald-400/85 shadow-[0_0_22px_rgba(52,211,153,0.28)]'
            : 'border-amber-400/75'
        } ${onClick ? 'group-hover:border-amber-300' : ''}`}
      >
        {/* Gadget: Twin Plasma Wing Thrusters (5+ Stars) */}
        {(equippedGadget === 'ears_plasma' || equippedGadget === 'halo_neural') && (
          <>
            <svg width="16" height="36" viewBox="0 0 16 36" fill="none" className="absolute -left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <path d="M15 6L3 12V24L15 30V6Z" fill="#6366f1" stroke="#c7d2fe" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="0" y="14" width="4" height="8" rx="2" fill="#38bdf8" />
            </svg>
            <svg width="16" height="36" viewBox="0 0 16 36" fill="none" className="absolute -right-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <path d="M1 6L13 12V24L1 30V6Z" fill="#6366f1" stroke="#c7d2fe" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="12" y="14" width="4" height="8" rx="2" fill="#38bdf8" />
            </svg>
          </>
        )}

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
                : equippedGadget === 'visor_cyber'
                ? 'bg-cyan-400 shadow-[0_0_12px_#22d3ee]'
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
        <div
          className={`w-full bg-slate-950 border-2 flex items-center justify-around shadow-inner relative overflow-hidden ${sizeClasses.visor} ${
            equippedGadget === 'visor_cyber'
              ? 'border-cyan-400/70 bg-gradient-to-b from-cyan-950/90 to-slate-950'
              : 'border-slate-700'
          }`}
        >
          {/* Subtle HUD grid lines when Cyber Visor is equipped */}
          {equippedGadget === 'visor_cyber' && (
            <div
              className="absolute inset-0 pointer-events-none opacity-25"
              style={{
                backgroundImage: 'linear-gradient(to right, #22d3ee 1px, transparent 1px), linear-gradient(to bottom, #22d3ee 1px, transparent 1px)',
                backgroundSize: '8px 8px'
              }}
            />
          )}

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
                    mood === 'thinking'
                      ? 'border-amber-400/70'
                      : equippedGadget === 'visor_cyber'
                      ? 'border-cyan-300/80'
                      : ''
                  }`}
                >
                  <div
                    ref={pRef}
                    className={`rounded-full will-change-transform ${sizeClasses.eyeInner} ${
                      mood === 'thinking'
                        ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                        : equippedGadget === 'halo_neural'
                        ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]'
                        : equippedGadget === 'visor_cyber'
                        ? 'bg-cyan-300 shadow-[0_0_10px_#22d3ee]'
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

