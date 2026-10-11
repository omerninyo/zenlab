import React, { useState } from 'react';
import { 
  Star, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  ChevronLeft, 
  Bot, 
  Award,
  Zap,
  Play,
  Compass,
  Layers,
  ArrowRight
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { LAB_METADATA, LAB_ICONS } from '../core/labMeta.js';

export default function AdventureJourneyMap({
  curriculum,
  labStars = {},
  totalStars = 0,
  onSelectLab,
  isDapimActive = false
}) {
  const allLabIds = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5', 'lab6', 'lab7', 'lab8'];
  
  // Find currently active station (first station with < 3 stars, or lab8 if all completed)
  const currentActiveLabId = allLabIds.find(id => (labStars[id] || 0) < 3) || 'lab8';
  const isAllCompleted = totalStars === 24;

  const [hoveredLabId, setHoveredLabId] = useState(null);

  // Student Rank calculation
  const rank = totalStars === 24 
    ? 'מאסטר בינה מלאכותית'
    : totalStars >= 18 
    ? 'מהנדס/ת רשתות'
    : totalStars >= 12
    ? 'נווט/ת אלגוריתמים'
    : totalStars >= 6
    ? 'בלש/ית קוד'
    : 'חוקר/ת מתחיל/ה';

  const progressPercentage = Math.round((totalStars / 24) * 100);

  const handleLaunchStation = (labId) => {
    AudioEngine.playStep();
    onSelectLab(labId);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300" dir="rtl">
      
      {/* 1. Game HUD Header: Companion Status & Rank */}
      <div className={
        isDapimActive
          ? "card-command-hero p-4 sm:p-6 relative overflow-hidden"
          : "bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden"
      }>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Zen Robot Companion Dialogue */}
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="relative">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/10 border-2 border-amber-500/40 flex items-center justify-center text-amber-500 shadow-inner">
                <Bot className="w-7 h-7 animate-bounce-slight" />
              </div>
              <span className="absolute -bottom-1 -left-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300/60 dark:border-amber-800">
                  זֶן • מלווה המסע
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  דרגה: <strong className="text-slate-900 dark:text-white font-bold">{rank}</strong>
                </span>
              </div>
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                {isAllCompleted
                  ? 'מדהים! כבשתם את כל 8 התחנות במסע! תעודת המאסטר שלכם פתוחה לצפייה.'
                  : `שלום חוקר/ת! התחנה הפעילה הבאה שלנו היא מעבדה ${LAB_METADATA[currentActiveLabId]?.number}: "${LAB_METADATA[currentActiveLabId]?.title}". מוכנים?`}
              </p>
            </div>
          </div>

          {/* Quick HUD Progress Pill */}
          <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end bg-slate-50 dark:bg-slate-950/80 px-4 py-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                <span>התקדמות מסע</span>
              </div>
              <div className="font-mono text-base font-black text-slate-900 dark:text-white">
                {totalStars} <span className="text-xs font-normal text-slate-400">/ 24 כוכבים</span>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="w-24 sm:w-32 bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500 shadow-sm"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

        </div>
      </div>

      {/* 2. Interactive Overworld Quest Map */}
      <div className={
        isDapimActive
          ? "bg-[var(--slate-2)] border border-[var(--slate-6)] rounded-2xl p-4 sm:p-8 relative overflow-hidden"
          : "bg-gradient-to-b from-white via-slate-50 to-blue-50/20 dark:from-slate-900 dark:via-slate-900/95 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-8 shadow-xs relative overflow-hidden"
      }>
        
        {/* World Map Legend & Biome Banners */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-6 border-b border-slate-200/80 dark:border-slate-800 text-xs font-bold">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
            <Compass className="w-4 h-4 text-amber-500" />
            <span>מפת הרפתקה לימודית: 8 תחנות מחקר מחוברות</span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              מסלול א': יסודות המחשב
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
              מסלול ב': בינה מלאכותית
            </span>
          </div>
        </div>

        {/* Winding Quest Path Stations */}
        <div className="py-6 sm:py-8 max-w-3xl mx-auto relative">
          
          {/* Central Vertical Timeline Guideline for Mobile & Desktop */}
          <div className="absolute right-6 sm:right-1/2 top-10 bottom-10 w-1 bg-slate-200 dark:bg-slate-800 -mr-0.5 rounded-full z-0 hidden xs:block" />

          <div className="space-y-8 sm:space-y-12 relative z-10">
            {allLabIds.map((labId, idx) => {
              const lab = curriculum?.labs?.[labId] || {};
              const meta = LAB_METADATA[labId] || {};
              const Icon = LAB_ICONS[labId] || meta.icon || Sparkles;
              const stars = labStars[labId] || 0;
              const isCompleted = stars === 3;
              const isInProgress = stars > 0 && stars < 3;
              const isCurrent = labId === currentActiveLabId;
              const isAiTrack = meta.track === 'ai';

              // Alternate sides on larger screens for winding path feel
              const isLeftOnDesktop = idx % 2 === 1;

              return (
                <div 
                  key={labId}
                  className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
                    isLeftOnDesktop ? 'sm:flex-row-reverse' : ''
                  }`}
                  onMouseEnter={() => setHoveredLabId(labId)}
                  onMouseLeave={() => setHoveredLabId(null)}
                >
                  
                  {/* Station Interactive Node / Badge */}
                  <div className="relative shrink-0 mx-auto sm:mx-0">
                    
                    {/* Floating Zen Avatar on Current Station */}
                    {isCurrent && (
                      <div className="absolute -top-7 right-1/2 translate-x-1/2 flex items-center gap-1 bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg border border-amber-300 animate-bounce z-20 whitespace-nowrap">
                        <Bot className="w-3 h-3" />
                        <span>אתם כאן!</span>
                      </div>
                    )}

                    {/* Outer Glowing Ring for Active */}
                    <button
                      type="button"
                      onClick={() => handleLaunchStation(labId)}
                      className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20 shadow-emerald-500/30'
                          : isCurrent
                          ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-500/30 shadow-amber-500/40 animate-pulse'
                          : isInProgress
                          ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                          : isDapimActive
                          ? 'bg-[var(--slate-3)] text-slate-400 border border-[var(--slate-6)] hover:border-slate-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 hover:border-slate-400'
                      }`}
                      title={`כניסה לתחנה ${meta.number}: ${meta.title}`}
                    >
                      <Icon className="w-6 h-6 sm:w-7 sm:h-7" />

                      {/* Station Number Badge */}
                      <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-[10px] font-mono font-bold flex items-center justify-center shadow-xs">
                        {meta.number}
                      </span>

                      {/* Completed Checkmark */}
                      {isCompleted && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Station Content Card */}
                  <div 
                    onClick={() => handleLaunchStation(labId)}
                    className={`flex-1 w-full p-4 rounded-xl border transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md active:scale-[0.99] ${
                      isCurrent
                        ? isDapimActive
                          ? 'bg-[var(--slate-3)] border-amber-500/60 ring-1 ring-amber-500/30'
                          : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-400/80 dark:border-amber-600/60 ring-1 ring-amber-400/20'
                        : isCompleted
                        ? isDapimActive
                          ? 'bg-[var(--slate-3)] border-emerald-500/30'
                          : 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/60'
                        : isDapimActive
                        ? 'bg-[var(--slate-3)] border-[var(--slate-6)] hover:border-slate-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        {/* Tags: Metaphor & Track */}
                        <div className="flex items-center gap-1.5 flex-wrap mb-1">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isAiTrack 
                              ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                          }`}>
                            {meta.trackName}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {meta.metaphor}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-slate-950 font-black animate-pulse">
                              משימה מומלצת
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
                          תחנה {meta.number}: {meta.title}
                        </h3>

                        {/* Subtitle */}
                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed mt-1">
                          {lab.subtitle || 'חקר אלגוריתמי מעשי והתנסות חווייתית'}
                        </p>
                      </div>

                      {/* Stars Status Pill */}
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200/60 dark:border-slate-700">
                          {[1, 2, 3].map((starNum) => (
                            <Star 
                              key={starNum}
                              className={`w-3.5 h-3.5 ${
                                starNum <= stars
                                  ? 'text-amber-500 fill-amber-400'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>

                        {/* Quick Play Arrow */}
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform">
                          <span>שחקו במשימה</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>

        </div>

      </div>

    </div>
  );
}
