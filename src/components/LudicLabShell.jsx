import React, { useState, useRef } from 'react';
import { 
  Star, 
  Radio, 
  Info, 
  Lightbulb, 
  Cpu, 
  Binary 
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import ZenLivingAvatar from './ZenLivingAvatar.jsx';

/**
 * LudicLabShell - The shared Matific-grade cosmic toy stage and robot chassis.
 * Provides:
 * 1. Animated starry night sky backdrop
 * 2. Top Satellite / Telemetry station + "איך זה עובד?" popover + 3 Golden Star Jars
 * 3. Living Zen Robot Head with eye tracking
 * 4. Robot Torso / Toy Workbench with X-Ray Code Lens toggle (`עדשת קוד`)
 */
export default function LudicLabShell({
  stationBadge = 'לוויין המחקר של זֶן',
  stationStatus = 'מוכן לפעולה 📡',
  stationMessage = '',
  StationIcon = Radio,
  isBeamActive = false,
  robotMood = 'happy',
  showAvatar = true,
  avatarSize = 'md',
  stars = [], // [{ id, done, label }]
  theoryTitle = 'איך המחשב חושב כאן?',
  theoryText = '',
  chassisTitle = 'שולחן המחקר של זֶן',
  ChassisIcon = Cpu,
  showXRay = true,
  onToggleXRay = null,
  xRayLabel = 'עדשת קוד',
  children
}) {
  const [showTheoryCard, setShowTheoryCard] = useState(false);

  return (
    <div
      className="w-full relative overflow-hidden rounded-3xl border-4 border-amber-400/40 shadow-2xl p-4 sm:p-7 select-none text-white space-y-5"
      style={{
        background: 'radial-gradient(ellipse at 50% 15%, #1e1b4b 0%, #0f172a 60%, #020617 100%)'
      }}
      dir="rtl"
    >
      {/* 1. Starry Static Sky Background (No jarring ping animations) */}
      <div className="absolute inset-0 pointer-events-none opacity-35">
        <div className="absolute top-4 left-10 w-1.5 h-1.5 bg-amber-200 rounded-full" />
        <div className="absolute top-16 right-20 w-1.5 h-1.5 bg-white rounded-full" />
        <div className="absolute top-28 left-1/3 w-2 h-2 bg-blue-300/80 rounded-full" />
        <div className="absolute top-8 right-1/3 w-1 h-1 bg-amber-100 rounded-full" />
      </div>

      {/* 2. Top Game Stage Header: Satellite Telemetry & Star Jars (Locked Height) */}
      <div className="relative z-20 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pb-4 border-b border-white/10">
        
        {/* Friendly Hovering Satellite with CS Telemetry (Fixed min-h so multi-line text never jumps the board) */}
        <div className="flex items-center gap-3.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20 shadow-lg flex-1 min-h-[72px]">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-indigo-500/30 border-2 border-indigo-400 flex items-center justify-center text-indigo-300 shadow-inner">
              <StationIcon className={`w-5 h-5 transition-colors ${isBeamActive ? 'text-amber-300' : 'text-indigo-200'}`} />
            </div>
            {isBeamActive && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-400 border border-slate-950" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-indigo-500/40 text-indigo-200 border border-indigo-400/30 whitespace-nowrap">
                {stationBadge}
              </span>
              <span className="text-[11px] text-amber-300 font-bold truncate">
                {stationStatus}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug line-clamp-2">
              {stationMessage}
            </p>
          </div>
        </div>

        {/* Golden Star Jars & Pedagogical Info Button */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          {theoryText && (
            <button
              type="button"
              onClick={() => {
                setShowTheoryCard(!showTheoryCard);
                AudioEngine.playStep();
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-colors cursor-pointer shadow-sm ${
                showTheoryCard
                  ? 'bg-amber-400 text-slate-950 border-white font-black'
                  : 'bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-400/40 text-indigo-200'
              }`}
              title="איך המדע שמאחורי הצעצוע עובד?"
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>איך זה עובד?</span>
            </button>
          )}

          {stars.length > 0 && (
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/15">
              <span className="text-xs font-bold text-amber-200">כוכבים:</span>
              <div className="flex items-center gap-1.5">
                {stars.map((starObj, sIdx) => (
                  <div
                    key={starObj.id || sIdx}
                    className={`w-7 h-7 rounded-xl flex items-center justify-center transition-colors duration-200 shadow-md ${
                      starObj.done
                        ? 'bg-amber-400 text-slate-950 shadow-amber-400/40'
                        : 'bg-white/10 text-white/30 border border-white/10'
                    }`}
                    title={starObj.label}
                  >
                    <Star className={`w-4 h-4 ${starObj.done ? 'fill-slate-950 text-slate-950' : ''}`} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Overlay Popover Theory Card (Zero vertical layout shift!) */}
      {showTheoryCard && theoryText && (
        <div className="absolute top-24 left-4 right-4 sm:left-8 sm:right-8 z-40 bg-indigo-950/95 border-2 border-amber-400/80 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-md text-xs sm:text-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <h4 className="font-black text-amber-300 flex items-center gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{theoryTitle}</span>
              </h4>
              <p className="text-indigo-100 leading-relaxed">
                {theoryText}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowTheoryCard(false)}
              className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer shrink-0"
            >
              סגור ✕
            </button>
          </div>
        </div>
      )}

      {/* 3. The Living Robot Character & Interactive Toy Chassis */}
      <div className="relative z-10 flex flex-col items-center">
        {showAvatar && (
          <ZenLivingAvatar
            mood={robotMood}
            isBeamActive={isBeamActive}
            size={avatarSize}
            showBeamRay={true}
          />
        )}

        {/* Robot Torso / Interactive Toy Chassis */}
        <div className="w-full relative mt-2 p-4 sm:p-6 bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 rounded-4xl border-4 border-amber-400/80 shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col items-center">
          
          {/* Chassis Top Bar: Title & Binary X-Ray Lens Switch */}
          <div className="w-full flex items-center justify-between pb-3 mb-4 border-b border-white/10 px-1 gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-amber-300 font-bold">
              <ChassisIcon className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{chassisTitle}</span>
            </div>

            {onToggleXRay && (
              <button
                type="button"
                onClick={() => {
                  onToggleXRay(!showXRay);
                  AudioEngine.playToggle(!showXRay);
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-black transition-colors cursor-pointer shadow-md ${
                  showXRay
                    ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-400/30'
                    : 'bg-white/10 hover:bg-white/20 text-white/80 border-white/20'
                }`}
                title="הדלקה/כיבוי של עדשת הקוד והחישובים בתוך הצעצוע"
              >
                <Binary className="w-3.5 h-3.5" />
                <span>{showXRay ? `${xRayLabel}: פעילה` : `${xRayLabel}: כבויה`}</span>
              </button>
            )}
          </div>

          {/* Main Interactive Toy Content + Live Ribbon + Action Toolbar */}
          <div className="w-full">
            {children}
          </div>

        </div>
      </div>
    </div>
  );
}
