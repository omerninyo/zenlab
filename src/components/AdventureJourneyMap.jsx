import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  ChevronLeft,
  Award,
  BookOpen,
  Compass,
  Play,
  Volume2,
  Square,
  Sliders
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { NarrationEngine } from '../core/narration.js';
import { LAB_METADATA, LAB_ICONS } from '../core/labMeta.js';
import ZenLivingAvatar from './ZenLivingAvatar.jsx';
import { ZenWorkshopBar, BespokeRealWorldBadge, BespokeStarBadge } from './BespokeIllustrations.jsx';

const WORLD_FILTERS = [
  { id: 'all', label: 'כל העולמות (8)', labs: ['lab1', 'lab2', 'lab3', 'lab4', 'lab5', 'lab6', 'lab7', 'lab8'] },
  { id: 'world1', label: 'עולם 1: שפת המחשב (1–2)', labs: ['lab1', 'lab2'] },
  { id: 'world2', label: 'עולם 2: לוגיקה וניווט (3–4)', labs: ['lab3', 'lab4'] },
  { id: 'world3', label: 'עולם 3: למידה וראייה (5–6)', labs: ['lab5', 'lab6'] },
  { id: 'world4', label: 'עולם 4: מוח ושפה (7–8)', labs: ['lab7', 'lab8'] }
];

export default function AdventureJourneyMap({
  curriculum,
  labStars = {},
  totalStars = 0,
  onSelectLab,
  onOpenCertificate,
  onOpenGlossary
}) {
  const allLabIds = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5', 'lab6', 'lab7', 'lab8'];

  // Find currently active station (first station with < 3 stars, or lab8 if all completed)
  const currentActiveLabId = allLabIds.find(id => (labStars[id] || 0) < 3) || 'lab8';
  const isAllCompleted = totalStars === 24;

  const [hoveredLabId, setHoveredLabId] = useState(null);
  const [selectedWorld, setSelectedWorld] = useState('all');
  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
  const [narrationState, setNarrationState] = useState(() => NarrationEngine.getState());

  useEffect(() => {
    return NarrationEngine.subscribe(setNarrationState);
  }, []);

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

  const greetingText = isAllCompleted
    ? 'מדהים! השלמתם את כל 8 התחנות במפת הכוכבים וצברתם 24 כוכבים! תעודת המאסטר שלכם מוכנה!'
    : hoveredLabId
    ? `תחנה ${activeMeta.number}: "${activeMeta.title}" (${activeMeta.metaphor}) — לחצו על התחנה כדי להיכנס!`
    : `שלום! אני זֶן. התחנה הבאה שלנו היא תחנה ${LAB_METADATA[currentActiveLabId]?.number}: "${LAB_METADATA[currentActiveLabId]?.title}". מוכנים לצאת לדרך?`;

  const handlePlayGreeting = () => {
    if (narrationState.isPlaying) {
      NarrationEngine.stop();
      return;
    }
    NarrationEngine.play(greetingText, '/audio/tutor/home_welcome.mp3?v=1.0.0', 18);
  };

  const visibleLabIds = WORLD_FILTERS.find(w => w.id === selectedWorld)?.labs || allLabIds;

  return (
    <div
      className="w-full rounded-3xl border border-indigo-500/35 shadow-2xl p-3.5 sm:p-6 text-white relative overflow-hidden animate-in fade-in duration-300 space-y-5"
      style={{
        background: 'radial-gradient(ellipse at 50% 10%, #1e1b4b 0%, #0f172a 60%, #020617 100%)'
      }}
      dir="rtl"
    >
      {/* Subtle Cosmic Starfield Dots */}
      <div className="absolute inset-0 pointer-events-none opacity-35">
        <div className="absolute top-6 left-10 w-1.5 h-1.5 bg-amber-200 rounded-full" />
        <div className="absolute top-16 right-20 w-1.5 h-1.5 bg-white rounded-full" />
        <div className="absolute top-36 left-1/4 w-1.5 h-1.5 bg-blue-300 rounded-full" />
        <div className="absolute top-10 right-1/3 w-1 h-1 bg-amber-100 rounded-full" />
      </div>

      {/* 1. COMPACT COMMAND BRIDGE HEADER (Above the fold on iPhone, iPad & Desktop Chrome) */}
      <div className="relative z-10 bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-2xl p-3.5 sm:p-5 shadow-xl">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Right (RTL): Living Zen Avatar + Greeting + Voice Button */}
          <div className="flex items-center gap-3.5 flex-1 min-w-0">
            <div className="shrink-0">
              <ZenLivingAvatar
                mood={isAllCompleted ? 'celebrating' : 'happy'}
                isBeamActive={true}
                size="sm"
                showBeamRay={false}
                onClick={() => {
                  AudioEngine.playClick();
                  window.dispatchEvent(new CustomEvent('open-zen-tutor', { detail: { labId: 'home' } }));
                }}
              />
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40">
                  <Compass className="w-3 h-3 text-amber-400" />
                  <span>מפת המסע של זֶן</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/25 text-indigo-200 border border-indigo-400/40">
                  <Award className="w-3 h-3 text-amber-400" />
                  <span>דרגה: <strong className="text-white font-black">{rank}</strong></span>
                </span>
                <button
                  type="button"
                  onClick={handlePlayGreeting}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black border transition-all cursor-pointer ${
                    narrationState.isPlaying
                      ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                      : 'bg-white/10 hover:bg-white/20 text-amber-300 border-white/20'
                  }`}
                  title="השמעת ברכת הפתיחה של זֶן"
                >
                  {narrationState.isPlaying ? (
                    <>
                      <Square className="w-3 h-3 fill-current" />
                      <span>עצור</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3 h-3" />
                      <span>שמעו את זֶן</span>
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-100 leading-snug line-clamp-2">
                {greetingText}
              </p>
            </div>
          </div>

          {/* Left (RTL): Stars Progress + Workshop Drawer Toggle + Certificate & Glossary */}
          <div className="flex flex-col sm:flex-row lg:items-center gap-2.5 shrink-0 bg-slate-950/80 p-3 rounded-xl border border-white/10">
            <div className="space-y-1.5 min-w-[150px]">
              <div className="flex items-center justify-between gap-2 text-xs">
                <span className="font-bold text-amber-300 flex items-center gap-1">
                  <BespokeStarBadge size={14} filled={true} />
                  <span>כוכבים:</span>
                </span>
                <span className="font-mono font-black text-white">
                  {totalStars} <span className="text-slate-400 font-normal">/ 24</span>
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="bg-gradient-to-l from-amber-300 via-amber-400 to-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(progressPercentage, 5)}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => {
                  setIsWorkshopOpen(!isWorkshopOpen);
                  AudioEngine.playStep();
                }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                  isWorkshopOpen
                    ? 'bg-indigo-500 text-white border-indigo-300'
                    : 'bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border-indigo-400/40'
                }`}
                title="פתיחת סדנת השדרוגים של הרובוט זֶן"
              >
                <Sliders className="w-3.5 h-3.5 shrink-0" />
                <span>שדרוגי זֶן</span>
              </button>

              {onOpenCertificate && (
                <button
                  type="button"
                  onClick={() => {
                    AudioEngine.playClick();
                    onOpenCertificate();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-sm transition-colors cursor-pointer"
                >
                  <Award className="w-3.5 h-3.5 shrink-0" />
                  <span>תעודה</span>
                </button>
              )}

              {onOpenGlossary && (
                <button
                  type="button"
                  onClick={() => {
                    AudioEngine.playClick();
                    onOpenGlossary();
                  }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 font-bold text-xs transition-colors cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <span>מילון</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Robot Upgrade Workshop Drawer */}
        {isWorkshopOpen && (
          <div className="mt-3.5 pt-3.5 border-t border-white/10 animate-fadeIn">
            <ZenWorkshopBar totalStars={totalStars} />
          </div>
        )}
      </div>

      {/* 2. WORLD CHAPTER FILTER PILLS (Instant Zero-Scroll Filtering on iPad / iPhone / Chrome) */}
      <div className="relative z-10 flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5">
          {WORLD_FILTERS.map((w) => {
            const isSelected = selectedWorld === w.id;
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => {
                  setSelectedWorld(w.id);
                  AudioEngine.playStep();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-white font-black shadow-sm'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10'
                }`}
              >
                {w.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. WINDING 8-STATION COSMIC CONSTELLATION PATH */}
      <div className="relative z-10 py-2 sm:py-4 max-w-4xl mx-auto">
        {/* Central Glowing Constellation Path Line */}
        <div className="absolute right-7 sm:right-1/2 top-6 bottom-6 w-1.5 bg-gradient-to-b from-blue-500/50 via-amber-400/60 to-indigo-500/50 -mr-0.5 rounded-full z-0 hidden sm:block" />

        <div className="space-y-4 sm:space-y-7 relative z-10">
          {visibleLabIds.map((labId, idx) => {
            const lab = curriculum?.labs?.[labId] || {};
            const meta = LAB_METADATA[labId] || {};
            const Icon = LAB_ICONS[labId] || meta.icon || Sparkles;
            const stars = labStars[labId] || 0;
            const isCompleted = stars === 3;
            const isInProgress = stars > 0 && stars < 3;
            const isCurrent = labId === currentActiveLabId;
            const isAiTrack = meta.track === 'ai';
            const isLeftOnDesktop = idx % 2 === 1;

            return (
              <div
                key={labId}
                className={`flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-5 ${
                  isLeftOnDesktop ? 'sm:flex-row-reverse' : ''
                }`}
                onMouseEnter={() => setHoveredLabId(labId)}
                onMouseLeave={() => setHoveredLabId(null)}
              >
                {/* Station Interactive Planetary Orb */}
                <div className="relative shrink-0 hidden sm:flex items-center justify-center">
                  {isCurrent && (
                    <div className="absolute -top-5 right-1/2 translate-x-1/2 flex items-center gap-1 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md border border-white z-20 whitespace-nowrap">
                      <Sparkles className="w-2.5 h-2.5 fill-slate-950" />
                      <span>אתם כאן!</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleLaunchStation(labId)}
                    className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-colors duration-200 cursor-pointer border-2 ${
                      isCompleted
                        ? 'bg-gradient-to-b from-emerald-400 to-emerald-600 text-slate-950 border-emerald-200 shadow-lg'
                        : isCurrent
                        ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-white shadow-lg'
                        : isInProgress
                        ? 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-blue-300 shadow-md'
                        : 'bg-slate-800/90 text-slate-300 border-slate-600 hover:border-amber-400/70 hover:text-white'
                    }`}
                    title={`כניסה לתחנה ${meta.number}: ${meta.title}`}
                  >
                    <Icon className="w-7 h-7" />
                    <span className="absolute -bottom-1.5 -right-1.5 w-5.5 h-5.5 rounded-full bg-slate-950 text-amber-300 border border-amber-400/60 text-[11px] font-mono font-black flex items-center justify-center">
                      {meta.number}
                    </span>
                    {isCompleted && (
                      <span className="absolute -top-1.5 -left-1.5 w-5.5 h-5.5 rounded-full bg-emerald-500 text-white border border-slate-950 flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </button>
                </div>

                {/* Tactile Station Card */}
                <div
                  onClick={() => handleLaunchStation(labId)}
                  className={`flex-1 w-full p-4 sm:p-5 rounded-2xl bg-slate-900/90 backdrop-blur-md border transition-colors duration-200 cursor-pointer group ${
                    isCurrent
                      ? 'border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.18)] ring-1 ring-amber-400/30'
                      : isCompleted
                      ? 'border-emerald-400/60 hover:border-emerald-300'
                      : isInProgress
                      ? 'border-blue-400/60 hover:border-blue-300'
                      : 'border-slate-700/80 hover:border-amber-400/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {meta.chapterBadge && (
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-amber-400/15 text-amber-300 border border-amber-400/40">
                            {meta.chapterBadge}
                          </span>
                        )}
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${
                          isAiTrack
                            ? 'bg-indigo-950/90 text-indigo-300 border-indigo-500/40'
                            : 'bg-blue-950/90 text-blue-300 border-blue-500/40'
                        }`}>
                          {meta.trackName}
                        </span>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700">
                          {meta.metaphor}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-lg font-black text-white leading-snug group-hover:text-amber-300 transition-colors">
                        תחנה {meta.number}: {meta.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                        {lab.subtitle || 'חקר אלגוריתמי מעשי והתנסות חווייתית'}
                      </p>

                      {meta.realWorldConnections?.[0] && (
                        <div className="pt-0.5 flex items-center gap-2 text-[11px] text-indigo-200/90 font-semibold">
                          <BespokeRealWorldBadge index={meta.number - 1} size={20} />
                          <span>בחיים האמיתיים: <strong className="text-amber-200">{meta.realWorldConnections[0].app}</strong></span>
                        </div>
                      )}
                    </div>

                    {/* 3 Star Badges + Play Button */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/10">
                      <div className="flex items-center gap-1 bg-slate-950/90 px-2.5 py-1 rounded-xl border border-white/15">
                        {[1, 2, 3].map((starNum) => (
                          <BespokeStarBadge
                            key={starNum}
                            size={15}
                            filled={starNum <= stars}
                          />
                        ))}
                      </div>

                      <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 shadow-sm group-hover:bg-amber-300'
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
