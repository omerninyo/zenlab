import React, { useState } from 'react';
import { 
  Star, 
  Sparkles, 
  CheckCircle2, 
  ChevronLeft, 
  Award,
  BookOpen,
  Compass,
  Play,
  MessageCircle
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { LAB_METADATA, LAB_ICONS } from '../core/labMeta.js';
import ZenLivingAvatar from './ZenLivingAvatar.jsx';

export default function AdventureJourneyMap({
  curriculum,
  labStars = {},
  totalStars = 0,
  onSelectLab,
  onOpenCertificate,
  onOpenGlossary,
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
    if (onSelectLab) {
      onSelectLab(labId);
    }
  };

  const activeOrHoveredId = hoveredLabId || currentActiveLabId;
  const activeMeta = LAB_METADATA[activeOrHoveredId] || {};

  return (
    <div 
      className="w-full rounded-3xl border-4 border-amber-400/40 shadow-2xl p-4 sm:p-8 text-white relative overflow-hidden animate-in fade-in duration-300 space-y-6 sm:space-y-8"
      style={{
        background: 'radial-gradient(ellipse at 50% 10%, #1e1b4b 0%, #0f172a 60%, #020617 100%)'
      }}
      dir="rtl"
    >
      {/* Twinkling Cosmic Starfield Dots (Static glow - zero layout jitter) */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-6 left-10 w-2 h-2 bg-amber-200 rounded-full" />
        <div className="absolute top-16 right-20 w-1.5 h-1.5 bg-white rounded-full" />
        <div className="absolute top-36 left-1/4 w-2 h-2 bg-blue-300 rounded-full" />
        <div className="absolute top-10 right-1/3 w-1.5 h-1.5 bg-amber-100 rounded-full" />
        <div className="absolute top-1/2 left-12 w-1.5 h-1.5 bg-indigo-300 rounded-full" />
        <div className="absolute top-2/3 right-14 w-2 h-2 bg-amber-200 rounded-full" />
        <div className="absolute bottom-24 left-1/3 w-1.5 h-1.5 bg-white rounded-full" />
        <div className="absolute bottom-12 right-1/4 w-2 h-2 bg-emerald-300 rounded-full" />
      </div>

      {/* 1. Unified Command Bridge Header */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-md border-2 border-white/15 rounded-3xl p-4 sm:p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-5 sm:gap-6">
          
          {/* Left/Right in RTL: Zen Living Avatar + Live Greeting Bubble */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 w-full lg:w-auto text-center sm:text-right">
            <div className="shrink-0 pt-3">
              <ZenLivingAvatar 
                mood={isAllCompleted ? 'celebrating' : 'happy'} 
                isBeamActive={true} 
                size="md"
                badgeText="זֶן • קפטן המסע"
                onClick={() => {
                  AudioEngine.playClick();
                  window.dispatchEvent(new CustomEvent('open-zen-tutor', { detail: { labId: 'home' } }));
                }}
              />
            </div>

            <div className="space-y-2.5 max-w-xl w-full">
              {/* Stage Title & Rank Pill */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  <Compass className="w-3.5 h-3.5 text-amber-400" />
                  <span>מפת הכוכבים של זֶן</span>
                </span>

                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/25 text-indigo-200 border border-indigo-400/40">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>דרגת מפתח: <strong className="text-white font-black">{rank}</strong></span>
                </span>
              </div>

              {/* Speech Bubble (Fixed min-height so hovering station cards below never shifts the page!) */}
              <div className="bg-slate-950/85 border border-amber-400/30 rounded-2xl p-3.5 sm:p-4 shadow-inner min-h-[78px] flex items-center">
                <p className="text-sm sm:text-base font-bold text-white leading-relaxed line-clamp-2">
                  {isAllCompleted
                    ? 'מדהים! כבשתם את כל 8 התחנות במפת הכוכבים וצברתם 24 כוכבים! תעודת המאסטר הרשמית שלכם מוכנה!'
                    : hoveredLabId
                    ? `תחנה ${activeMeta.number}: "${activeMeta.title}" (${activeMeta.metaphor}) — לחצו על הכרטיס כדי לשחק ולגלות!`
                    : `שלום חוקר/ת! אני זֶן. התחנה הפעילה הבאה שלנו היא תחנה ${LAB_METADATA[currentActiveLabId]?.number}: "${LAB_METADATA[currentActiveLabId]?.title}". מוכנים להמריא?`}
                </p>
              </div>
            </div>
          </div>

          {/* Left side of Command Bridge: Stars Progress Bar & Quick Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch justify-between gap-3 w-full lg:w-72 shrink-0 bg-slate-950/75 p-4 rounded-2xl border border-white/10">
            
            {/* Total Stars Progress Bar */}
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>כוכבי מחקר שנצברו</span>
                </div>
                <div className="font-mono text-base font-black text-white">
                  {totalStars} <span className="text-xs font-normal text-slate-400">/ 24</span>
                </div>
              </div>

              <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden p-0.5 border border-slate-700">
                <div 
                  className="bg-gradient-to-l from-amber-300 via-amber-400 to-amber-500 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_#fbbf24]"
                  style={{ width: `${Math.max(progressPercentage, 5)}%` }}
                />
              </div>
            </div>

            {/* Quick Action Buttons: Certificate & Glossary */}
            <div className="flex items-center gap-2 pt-1">
              {onOpenCertificate && (
                <button
                  type="button"
                  onClick={() => {
                    AudioEngine.playClick();
                    onOpenCertificate();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-colors cursor-pointer whitespace-nowrap"
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>תעודת הצטיינות 🏆</span>
                </button>
              )}

              {onOpenGlossary && (
                <button
                  type="button"
                  onClick={() => {
                    AudioEngine.playClick();
                    onOpenGlossary();
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 font-bold text-xs transition-colors cursor-pointer whitespace-nowrap"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>מילון מושגים 📖</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* 2. Constellation Legend Bar */}
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-2 pb-2 border-b border-white/10 text-xs font-bold">
        <div className="flex items-center gap-2 text-amber-200">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>מסלול ההרפתקה: 8 תחנות חקר מביטים בודדים ועד בינה מלאכותית</span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          <span className="flex items-center gap-1.5 text-blue-300 bg-blue-950/60 px-2.5 py-1 rounded-full border border-blue-500/30">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            מסלול א': יסודות המחשב (1–4)
          </span>
          <span className="flex items-center gap-1.5 text-indigo-300 bg-indigo-950/60 px-2.5 py-1 rounded-full border border-indigo-500/30">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            מסלול ב': בינה מלאכותית (5–8)
          </span>
        </div>
      </div>

      {/* 3. Winding 8-Station Cosmic Constellation Path */}
      <div className="relative z-10 py-4 sm:py-6 max-w-4xl mx-auto">
        
        {/* Central Glowing Constellation Path Line */}
        <div className="absolute right-7 sm:right-1/2 top-8 bottom-8 w-1.5 bg-gradient-to-b from-blue-500/50 via-amber-400/60 to-indigo-500/50 -mr-0.5 rounded-full z-0 hidden sm:block shadow-[0_0_15px_rgba(251,191,36,0.3)]" />

        <div className="space-y-6 sm:space-y-10 relative z-10">
          {allLabIds.map((labId, idx) => {
            const lab = curriculum?.labs?.[labId] || {};
            const meta = LAB_METADATA[labId] || {};
            const Icon = LAB_ICONS[labId] || meta.icon || Sparkles;
            const stars = labStars[labId] || 0;
            const isCompleted = stars === 3;
            const isInProgress = stars > 0 && stars < 3;
            const isCurrent = labId === currentActiveLabId;
            const isAiTrack = meta.track === 'ai';

            // Alternate sides on desktop for winding constellation feel
            const isLeftOnDesktop = idx % 2 === 1;

            return (
              <div 
                key={labId}
                className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 ${
                  isLeftOnDesktop ? 'sm:flex-row-reverse' : ''
                }`}
                onMouseEnter={() => setHoveredLabId(labId)}
                onMouseLeave={() => setHoveredLabId(null)}
              >
                
                {/* Station Interactive Planetary Orb */}
                <div className="relative shrink-0 flex items-center justify-center sm:mx-0">
                  
                  {/* Floating Action Badge on Current Station Orb (Stable - no bounce) */}
                  {isCurrent && (
                    <div className="absolute -top-6 right-1/2 translate-x-1/2 flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-lg border-2 border-white z-20 whitespace-nowrap">
                      <Sparkles className="w-3 h-3 fill-slate-950" />
                      <span>אתם כאן!</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleLaunchStation(labId)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-3xl flex items-center justify-center transition-colors duration-200 cursor-pointer border-2 ${
                      isCompleted
                        ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 border-emerald-200 ring-4 ring-emerald-500/30 shadow-[0_0_25px_rgba(16,185,129,0.5)]'
                        : isCurrent
                        ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-white ring-4 ring-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.6)]'
                        : isInProgress
                        ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-blue-300 ring-4 ring-blue-500/30 shadow-lg'
                        : 'bg-slate-800/90 text-slate-300 border-slate-600 hover:border-amber-400/70 hover:text-white shadow-md'
                    }`}
                    title={`כניסה לתחנה ${meta.number}: ${meta.title}`}
                  >
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8" />

                    {/* Station Number Badge */}
                    <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-slate-950 text-amber-300 border-2 border-amber-400/60 text-xs font-mono font-black flex items-center justify-center shadow-md">
                      {meta.number}
                    </span>

                    {/* Completed Checkmark */}
                    {isCompleted && (
                      <span className="absolute -top-1.5 -left-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white border-2 border-slate-950 flex items-center justify-center shadow-md">
                        <CheckCircle2 className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                </div>

                {/* Rich Tactile Toy Station Card */}
                <div 
                  onClick={() => handleLaunchStation(labId)}
                  className={`flex-1 w-full p-4 sm:p-5 rounded-2xl bg-slate-900/85 backdrop-blur-md border-2 transition-colors duration-200 cursor-pointer group ${
                    isCurrent
                      ? 'border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.22)] ring-2 ring-amber-400/30'
                      : isCompleted
                      ? 'border-emerald-400/70 shadow-[0_0_20px_rgba(16,185,129,0.18)] hover:border-emerald-300'
                      : isInProgress
                      ? 'border-blue-400/70 shadow-lg hover:border-blue-300'
                      : 'border-slate-700/80 hover:border-amber-400/50 shadow-lg'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      {/* Top Badges: Track, Metaphor & Current Active Pill */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg border ${
                          isAiTrack 
                            ? 'bg-indigo-950/90 text-indigo-300 border-indigo-500/40'
                            : 'bg-blue-950/90 text-blue-300 border-blue-500/40'
                        }`}>
                          {meta.trackName}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                          {meta.metaphor}
                        </span>
                        {isCurrent && (
                          <span className="text-[11px] font-black px-2.5 py-0.5 rounded-lg bg-amber-400 text-slate-950 shadow-sm animate-pulse">
                            אתם כאן! שחקו עכשיו ←
                          </span>
                        )}
                      </div>

                      {/* Station Title */}
                      <h3 className="text-base sm:text-xl font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                        תחנה {meta.number}: {meta.title}
                      </h3>

                      {/* Station Subtitle */}
                      <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                        {lab.subtitle || 'חקר אלגוריתמי מעשי והתנסות חווייתית'}
                      </p>
                    </div>

                    {/* Right/Left Column: 3 Star Slots + Tactile Play Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2.5 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      {/* 3 Star Slots */}
                      <div className="flex items-center gap-1 bg-slate-950/90 px-3 py-1.5 rounded-xl border border-white/15 shadow-inner">
                        {[1, 2, 3].map((starNum) => (
                          <Star 
                            key={starNum}
                            className={`w-4 h-4 transition-transform ${
                              starNum <= stars
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)] scale-110'
                                : 'text-slate-700'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Action Pill */}
                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20 group-hover:bg-amber-300'
                          : isCompleted
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 group-hover:bg-emerald-500/30'
                          : 'bg-blue-600 text-white shadow-sm group-hover:bg-blue-500'
                      }`}>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>{isCurrent ? 'שחקו עכשיו' : isCompleted ? 'שחקו שוב' : 'כניסה לתחנה'}</span>
                        <ChevronLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
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
  );
}
