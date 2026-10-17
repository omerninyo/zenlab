import React, { useState, useEffect } from 'react';
import {
  Radio,
  Info,
  Lightbulb,
  Cpu,
  Binary,
  Volume2,
  Square,
  X
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { NarrationEngine } from '../core/narration.js';
import ZenLivingAvatar from './ZenLivingAvatar.jsx';
import { BespokeStarBadge } from './BespokeIllustrations.jsx';
import curriculumData from '../data/curriculum.json';

/**
 * Infer labId ('lab1'..'lab8') from stars array or station titles so studio audio
 * files (/audio/hints/labX_chY.mp3 & /audio/narration/labX.wav) always resolve automatically.
 */
function inferLabIdFromProps(labIdProp, stars, stationBadge, chassisTitle) {
  if (labIdProp && /^lab[1-8]$/.test(labIdProp)) return labIdProp;
  if (Array.isArray(stars) && stars.length > 0) {
    const firstId = String(stars[0]?.id || '');
    const m = firstId.match(/^(lab[1-8])/i);
    if (m) return m[1].toLowerCase();
  }
  const combined = `${stationBadge || ''} ${chassisTitle || ''}`;
  if (combined.includes('פיקסל') || combined.includes('בינאר')) return 'lab1';
  if (combined.includes('רובוט') || combined.includes('אלגוריתם') || combined.includes('מבוך הפקודות')) return 'lab2';
  if (combined.includes('עץ') || combined.includes('בלש') || combined.includes('חיות')) return 'lab3';
  if (combined.includes('ניווט') || combined.includes('חללית') || combined.includes('A*')) return 'lab4';
  if (combined.includes('שכנים') || combined.includes('פירות') || combined.includes('k-NN')) return 'lab5';
  if (combined.includes('ראייה') || combined.includes('פילטר') || combined.includes('קצוות')) return 'lab6';
  if (combined.includes('נוירון') || combined.includes('שער')) return 'lab7';
  if (combined.includes('שפה') || combined.includes('מילים') || combined.includes('טמפרטורה')) return 'lab8';
  return 'lab1';
}

/**
 * LudicLabShell 3.0 — Flagship iPadOS & Desktop Chrome Studio Stage
 * Features:
 * 1. Zen Dynamic Island Command Bar: Houses the living 60fps eye-tracking Zen Avatar,
 *    current mission telemetry, studio Hebrew voiceover button (`🔊 השמע משימה`),
 *    X-Ray Code Lens toggle, "איך זה עובד?" popover, and 3 Bespoke Star Badges in a single sleek bar.
 * 2. Zero double yellow borders or vertical robot blockers — moves the interactive canvas
 *    ~220px higher (Above the Fold) on iPhone, iPad, and Desktop Chrome.
 */
export default function LudicLabShell({
  labId = '',
  stationBadge = 'תחנת המחקר של זֶן',
  stationStatus = 'מוכן לפעולה',
  stationMessage = '',
  StationIcon = Radio,
  isBeamActive = false,
  robotMood = 'happy',
  showAvatar = true,
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
  const [narrationState, setNarrationState] = useState(() => NarrationEngine.getState());

  useEffect(() => {
    return NarrationEngine.subscribe(setNarrationState);
  }, []);

  const resolvedLabId = inferLabIdFromProps(labId, stars, stationBadge, chassisTitle);
  const labData = curriculumData?.labs?.[resolvedLabId];

  // Determine active challenge (1, 2, or 3) based on first uncompleted star
  const firstPendingIdx = Array.isArray(stars) ? stars.findIndex(s => !s?.done) : 0;
  const activeChallengeNum = firstPendingIdx === -1 ? 3 : Math.min(3, Math.max(1, firstPendingIdx + 1));
  const activeChallengeData = labData?.challenges?.[activeChallengeNum - 1];

  const hintAudioSrc = `/audio/hints/${resolvedLabId}_ch${activeChallengeNum}.mp3?v=1.0.0`;
  const labNarrationSrc = labData?.media?.narration?.audioSrc || `/audio/narration/${resolvedLabId}.wav`;

  const handlePlayMissionVoice = () => {
    if (narrationState.isPlaying) {
      NarrationEngine.stop();
      return;
    }
    const spokenFallback = activeChallengeData
      ? `משימה ${activeChallengeNum}: ${activeChallengeData.title}. ${activeChallengeData.instructions || stationMessage}. רמז: ${activeChallengeData.hint || ''}`
      : stationMessage || theoryText;
    NarrationEngine.play(spokenFallback, hintAudioSrc, 18);
  };

  const handlePlayTheoryVoice = () => {
    if (narrationState.isPlaying) {
      NarrationEngine.stop();
      return;
    }
    const transcript = labData?.media?.narration?.transcript || `${theoryTitle}. ${theoryText}`;
    NarrationEngine.play(transcript, labNarrationSrc, 50);
  };

  return (
    <div
      className="w-full relative overflow-hidden rounded-3xl border border-indigo-500/35 shadow-[0_20px_50px_rgba(2,6,23,0.65)] p-3 sm:p-5 select-none text-white space-y-3.5"
      style={{
        background: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0f172a 65%, #020617 100%)'
      }}
      dir="rtl"
    >
      {/* Subtle Starfield Backdrop */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-3 left-12 w-1.5 h-1.5 bg-amber-200 rounded-full" />
        <div className="absolute top-12 right-24 w-1 h-1 bg-white rounded-full" />
        <div className="absolute top-20 left-1/3 w-1.5 h-1.5 bg-cyan-300/80 rounded-full" />
      </div>

      {/* 1. ZEN DYNAMIC ISLAND COMMAND BAR (Unified Avatar + Mission + Voice + X-Ray + Stars) */}
      <div className="relative z-20 flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-2.5 bg-slate-950/75 backdrop-blur-xl px-3 sm:px-4 py-2.5 rounded-2xl border border-white/15 shadow-lg">
        
        {/* Right Side (RTL): Living Zen Avatar (Compact) + Mission Telemetry + Voice Button */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {showAvatar ? (
            <div className="shrink-0 -my-1 hidden xs:block sm:block">
              <ZenLivingAvatar
                mood={robotMood}
                isBeamActive={isBeamActive || narrationState.isPlaying}
                size="sm"
                showBeamRay={false}
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-indigo-500/25 border border-indigo-400/50 flex items-center justify-center text-indigo-300 shrink-0">
              <StationIcon className={`w-5 h-5 ${isBeamActive ? 'text-amber-300' : 'text-indigo-200'}`} />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 whitespace-nowrap">
                {stationBadge}
              </span>
              <span className="text-[11px] text-amber-300 font-bold truncate">
                {stationStatus}
              </span>
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                • <ChassisIcon className="w-3 h-3 text-slate-400 inline" /> {chassisTitle}
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-white mt-0.5 leading-snug line-clamp-2">
              {stationMessage}
            </p>
          </div>

          {/* Studio Hebrew Mission Audio Button */}
          <button
            type="button"
            onClick={handlePlayMissionVoice}
            className={`shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer shadow-sm ${
              narrationState.isPlaying
                ? 'bg-rose-500 text-white border-rose-300 shadow-rose-500/30 animate-pulse'
                : 'bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border-amber-400/40'
            }`}
            title="השמעה קולית של המשימה והרמז בעברית"
          >
            {narrationState.isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current shrink-0" />
                <span className="hidden sm:inline">עצור הקראה</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 shrink-0" />
                <span className="hidden sm:inline">השמע משימה</span>
              </>
            )}
          </button>
        </div>

        {/* Left Side (RTL): X-Ray Code Lens + How It Works + 3 Star Badges */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 flex-wrap pt-1.5 xl:pt-0 border-t xl:border-t-0 border-white/10">
          {onToggleXRay && (
            <button
              type="button"
              onClick={() => {
                onToggleXRay(!showXRay);
                AudioEngine.playToggle(!showXRay);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-colors cursor-pointer ${
                showXRay
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-sm'
                  : 'bg-white/10 hover:bg-white/15 text-slate-200 border-white/15'
              }`}
              title="הדלקה או כיבוי של עדשת הקוד והחישובים"
            >
              <Binary className="w-3.5 h-3.5 shrink-0" />
              <span>{showXRay ? `${xRayLabel}: פעילה` : `${xRayLabel}: כבויה`}</span>
            </button>
          )}

          {theoryText && (
            <button
              type="button"
              onClick={() => {
                setShowTheoryCard(!showTheoryCard);
                AudioEngine.playStep();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                showTheoryCard
                  ? 'bg-indigo-500 text-white border-indigo-300 font-black'
                  : 'bg-white/10 hover:bg-white/15 border-white/15 text-indigo-200'
              }`}
              title="הסבר קצר איך המדע עובד כאן"
            >
              <Info className="w-3.5 h-3.5 shrink-0" />
              <span>איך זה עובד?</span>
            </button>
          )}

          {stars.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-white/15">
              <span className="text-[11px] font-bold text-amber-200 hidden sm:inline">כוכבים:</span>
              <div className="flex items-center gap-1">
                {stars.map((starObj, sIdx) => (
                  <div
                    key={starObj.id || sIdx}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors duration-200 ${
                      starObj.done
                        ? 'bg-amber-400/20 border border-amber-400/60'
                        : 'bg-white/5 text-white/30 border border-white/10'
                    }`}
                    title={starObj.label}
                  >
                    <BespokeStarBadge size={15} filled={Boolean(starObj.done)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Floating Overlay Popover Theory Card (Zero vertical layout shift!) */}
      {showTheoryCard && theoryText && (
        <div className="relative z-30 bg-indigo-950/95 border border-amber-400/70 rounded-2xl p-4 shadow-2xl backdrop-blur-md text-xs sm:text-sm animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
            <div className="space-y-1">
              <h4 className="font-black text-amber-300 flex items-center gap-2 text-sm">
                <Lightbulb className="w-4 h-4 text-amber-400 shrink-0" />
                <span>{theoryTitle}</span>
              </h4>
              <p className="text-indigo-100 leading-relaxed">
                {theoryText}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
              <button
                type="button"
                onClick={handlePlayTheoryVoice}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/30 hover:bg-indigo-500/50 text-amber-200 border border-amber-400/40 text-xs font-bold cursor-pointer transition-colors"
                title="הקראה קולית של ההסבר"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>{narrationState.isPlaying ? 'עצור' : 'השמעה קולית'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  NarrationEngine.stop();
                  setShowTheoryCard(false);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black cursor-pointer"
              >
                <span>סגור</span>
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. MAIN INTERACTIVE STUDIO WORKBENCH (Directly Above the Fold!) */}
      <div className="relative z-10 w-full p-3 sm:p-5 bg-slate-900/85 rounded-2xl border border-white/10 shadow-inner">
        {children}
      </div>
    </div>
  );
}
