import React, { useState } from 'react';
import {
  Compass,
  ChevronDown,
  Wrench,
  Radio,
  Star,
  BookOpen,
  Volume2,
  VolumeX,
  Monitor,
  Lightbulb,
  Eye,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Sliders,
  Zap,
  Bot,
  Square,
  Award,
  Layers
} from 'lucide-react';
import { useZenGameStore } from './useZenGameStore.js';
import { AudioEngine } from '../core/audio.js';
import { NarrationEngine } from '../core/narration.js';
import { LAB_METADATA, LAB_ICONS } from '../core/labMeta.js';
import { ZenWorkshopBar } from '../components/BespokeIllustrations.jsx';
import CertificateModal from '../components/CertificateModal.jsx';
import GlossaryModal from '../components/GlossaryModal.jsx';

const STAGE_PILLS = [
  { id: 'sandbox', label: '🎮 מכונת המחקר 3D', shortLabel: '🎮 מכונה 3D', tooltip: 'מכונת המחקר התלת-ממדית (מעבדת המשחק)' },
  { id: 'holo_media', label: '📽️ מקרן הולוגרמה', shortLabel: '📽️ הולוגרמה', tooltip: 'מקרן הולוגרמה: סרטון, פודקאסט, סיור מונפש והקראה' },
  { id: 'warmup_codex', label: '🔬 חימום וקודקס', shortLabel: '🔬 חימום וקודקס', tooltip: 'גאדג׳ט חימום אינטראקטיבי וכרטיסי קודקס הולוגרפיים' },
  { id: 'laser_quiz', label: '⚡ מנעול לייזר (חידון)', shortLabel: '⚡ חידון לייזר', tooltip: 'כור מנעולי הלייזר: חידון הבנה (3 מנעולי אנרגיה)' }
];

const WORLD_FILTERS = [
  { id: 'all', label: 'כל העולמות' },
  { id: 'world1', label: 'עולם 1' },
  { id: 'world2', label: 'עולם 2' },
  { id: 'world3', label: 'עולם 3' },
  { id: 'world4', label: 'עולם 4' }
];

const CMD_LABELS = {
  FORWARD: '⬆️ צעד',
  TURN_LEFT: '↩️ שמאלה',
  TURN_RIGHT: '↪️ ימינה',
  PICK_KEY: '🔑 מפתח',
  UNLOCK_GATE: '🔓 שער'
};

const ANIMAL_EMOJIS = {
  bat: '🦇',
  eagle: '🦅',
  cat: '🐱',
  turtle: '🐢',
  dog: '🐶',
  sparrow: '🐦',
  ostrich: '🦤',
  lizard: '🦎'
};

export default function DiegeticHUD({
  onSwitchToClassic2D,
  onOpenCertificate,
  onOpenGlossary
}) {
  const store = useZenGameStore();
  const {
    sceneMode,
    activeLabId,
    activeSubView,
    showXRay,
    selectedWorld,
    totalStars,
    labStars,
    completedChallenges,
    isMuted,
    narrationState,
    podcastRadio,
    activeLabData,
    activeLabMeta,
    curriculum
  } = store;

  const [isStationMenuOpen, setIsStationMenuOpen] = useState(false);
  const [isWorkshopOpen, setIsWorkshopOpen] = useState(false);
  const [selectedChallengeIdx, setSelectedChallengeIdx] = useState(0);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [localCertOpen, setLocalCertOpen] = useState(false);
  const [localGlossaryOpen, setLocalGlossaryOpen] = useState(false);

  const allLabs = [
    LAB_METADATA.lab1,
    LAB_METADATA.lab2,
    LAB_METADATA.lab3,
    LAB_METADATA.lab4,
    LAB_METADATA.lab5,
    LAB_METADATA.lab6,
    LAB_METADATA.lab7,
    LAB_METADATA.lab8
  ];

  const challenges = activeLabData?.challenges || [];
  // Default to first uncompleted challenge or user-selected challenge
  const firstPendingIdx = challenges.findIndex(c => !completedChallenges[c.id]);
  const effectiveChallengeIdx =
    challenges[selectedChallengeIdx] !== undefined
      ? selectedChallengeIdx
      : firstPendingIdx >= 0
      ? firstPendingIdx
      : 0;
  const currentChallenge = challenges[effectiveChallengeIdx] || challenges[0] || {};
  const activeChallengeNum = effectiveChallengeIdx + 1;

  const handlePlayMissionVoice = () => {
    if (narrationState?.isPlaying) {
      NarrationEngine.stop();
      return;
    }
    const text = `${currentChallenge.title || ''}. ${currentChallenge.instructions || ''} ${
      currentChallenge.hint ? `רמז: ${currentChallenge.hint}` : ''
    }`;
    const audioPath = `/audio/hints/${activeLabId}_ch${activeChallengeNum}.mp3`;
    NarrationEngine.play(text, audioPath, 20);
  };

  const handlePlayWelcomeVoice = () => {
    if (narrationState?.isPlaying) {
      NarrationEngine.stop();
      return;
    }
    const nextLabId =
      ['lab1', 'lab2', 'lab3', 'lab4', 'lab5', 'lab6', 'lab7', 'lab8'].find(
        id => (labStars[id] || 0) < 3
      ) || 'lab8';
    const nextMeta = LAB_METADATA[nextLabId];
    const greetingText =
      totalStars === 24
        ? 'מדהים! השלמתם את כל 8 התחנות במפת הכוכבים וצברתם 24 כוכבים! תעודת המאסטר שלכם מוכנה!'
        : `שלום! אני זֶן. ברוכים הבאים לעולם התלת-ממדי! התחנה הבאה שלנו היא תחנה ${nextMeta?.number}: ${nextMeta?.title}. נווטו עם הרובוט או לחצו על שער התחנה לכניסה!`;
    NarrationEngine.play(greetingText, '/audio/tutor/home_welcome.mp3?v=1.0.0', 18);
  };

  const handleClassicSwitch = () => {
    AudioEngine.playStep();
    if (onSwitchToClassic2D) {
      onSwitchToClassic2D();
    } else {
      store.setAppMode('classic2d');
    }
  };

  const handleOpenCert = () => {
    AudioEngine.playStep();
    if (onOpenCertificate) {
      onOpenCertificate();
    } else {
      setLocalCertOpen(true);
    }
  };

  const handleOpenGloss = () => {
    AudioEngine.playStep();
    if (onOpenGlossary) {
      onOpenGlossary();
    } else {
      setLocalGlossaryOpen(true);
    }
  };

  const CurrentStationIcon = LAB_ICONS[activeLabId] || Compass;

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-30 pointer-events-none flex flex-col justify-between p-2 sm:p-3 select-none overflow-hidden"
    >
      {/* =====================================================================
          1. TOP DIEGETIC HUD BAR (h-12 sm:h-14)
         ===================================================================== */}
      <div className="relative z-40 pointer-events-auto">
        <header className="h-10 sm:h-11 w-full bg-slate-950/75 backdrop-blur-xl border border-white/15 rounded-2xl px-2 sm:px-3 shadow-[0_8px_32px_rgba(2,6,23,0.65)] flex items-center justify-between gap-1.5 overflow-hidden">
          {/* RIGHT GROUP: Brand, 3D Overworld Map Button, Station Selector, Workshop Toggle */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Brand */}
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-white/10">
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black text-[11px] shadow-[0_0_12px_rgba(251,191,36,0.4)]">
                3D
              </div>
              <span className="hidden xl:inline text-xs font-black tracking-tight text-white">
                ZenLab <span className="text-amber-400">3D</span>
              </span>
            </div>

            {/* Overworld Map Button */}
            <button
              type="button"
              onClick={() => {
                store.returnToOverworld();
                setIsStationMenuOpen(false);
              }}
              className={`h-8 px-2 sm:px-2.5 rounded-xl text-[11px] font-black flex items-center gap-1 border transition-all cursor-pointer whitespace-nowrap ${
                sceneMode === 'overworld'
                  ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_14px_rgba(251,191,36,0.35)]'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-white/15'
              }`}
              title="חזרה למפת המסע התלת-ממדית"
            >
              <Compass className="w-3.5 h-3.5 shrink-0" />
              <span>מפת המסע 3D</span>
            </button>

            {/* Station Quick-Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsStationMenuOpen(prev => !prev);
                  setIsWorkshopOpen(false);
                  AudioEngine.playStep();
                }}
                className="h-8 px-2 sm:px-2.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
                title="מעבר מהיר בין 8 תחנות המחקר"
              >
                <CurrentStationIcon
                  className="w-3.5 h-3.5 shrink-0"
                  style={{ color: activeLabMeta?.accentColor || '#fbbf24' }}
                />
                <span className="max-w-[85px] sm:max-w-[115px] truncate">
                  {activeLabMeta?.number}. {activeLabMeta?.shortLabel}
                </span>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-400/15 px-1 py-0.2 rounded">
                  {labStars[activeLabId] || 0}★
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {isStationMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-slate-950/95 backdrop-blur-2xl border border-white/20 rounded-2xl p-2 shadow-2xl z-50 space-y-1">
                  <div className="px-2.5 py-1 text-[10px] font-black text-slate-400 border-b border-white/10 flex items-center justify-between">
                    <span>בחרו תחנת מחקר תלת-ממדית</span>
                    <span className="text-amber-400 font-mono">{totalStars}/24 ★</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto space-y-1">
                    {allLabs.map(lab => {
                      const Icon = lab.icon || Compass;
                      const stars = labStars[lab.id] || 0;
                      const isCurrent = activeLabId === lab.id && sceneMode === 'station';
                      return (
                        <button
                          key={lab.id}
                          type="button"
                          onClick={() => {
                            store.enterStation(lab.id, 'sandbox');
                            setIsStationMenuOpen(false);
                          }}
                          className={`w-full px-2.5 py-2 rounded-xl text-right flex items-center justify-between gap-2 transition-all cursor-pointer border ${
                            isCurrent
                              ? 'bg-indigo-950/90 border-amber-400/60 text-white font-black'
                              : 'bg-slate-900/60 hover:bg-slate-800/90 border-transparent text-slate-200 font-bold'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 border border-white/10"
                              style={{ backgroundColor: lab.bgWash, color: lab.accentColor }}
                            >
                              <Icon className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs truncate">
                              {lab.number}. {lab.title}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono text-amber-400 shrink-0">
                            {'★'.repeat(stars)}
                            {'☆'.repeat(3 - stars)}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3D Workshop Popover Toggle */}
            <button
              type="button"
              onClick={() => {
                setIsWorkshopOpen(prev => !prev);
                setIsStationMenuOpen(false);
                AudioEngine.playStep();
              }}
              className={`h-8 px-2 sm:px-2.5 rounded-xl text-[11px] font-black flex items-center gap-1 border transition-all cursor-pointer whitespace-nowrap ${
                isWorkshopOpen
                  ? 'bg-amber-400 text-slate-950 border-amber-300'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-400/30'
              }`}
              title="סדנת שדרוגי זֶן (הלבשת גאדג׳טים על הרובוט)"
            >
              <Wrench className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">שדרוגי זֶן</span>
            </button>
          </div>

          {/* CENTER GROUP: 4 Diegetic Station Stage Pills (when in 'station' mode) */}
          {sceneMode === 'station' && (
            <nav
              aria-label="שלבי תחנת המחקר"
              className="hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 shrink-0"
            >
              {STAGE_PILLS.map(pill => {
                const isActive = activeSubView === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    title={pill.tooltip || pill.label}
                    onClick={() => store.setActiveSubView(pill.id)}
                    className={`px-2 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-l from-amber-400 to-amber-500 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.35)]'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {pill.shortLabel}
                  </button>
                );
              })}
            </nav>
          )}

          {/* LEFT GROUP: Zen Radio, Stars Badge, Glossary, Mute, Classic 2D Switch */}
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {/* Zen Radio Toggle */}
            <button
              type="button"
              onClick={() => store.togglePodcastRadio(activeLabId)}
              className={`h-8 px-2 rounded-xl text-[11px] font-black flex items-center gap-1 border transition-all cursor-pointer whitespace-nowrap ${
                podcastRadio.isOpen
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-[0_0_14px_rgba(99,102,241,0.45)]'
                  : 'bg-slate-900/90 hover:bg-slate-800 text-indigo-300 border-indigo-500/30'
              }`}
              title="פתיחת רדיו זֶן (פודקאסטים לימודיים תוך כדי תנועה)"
            >
              <Radio className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">רדיו זֶן</span>
            </button>

            {/* Stars Badge -> Certificate Modal */}
            <button
              type="button"
              onClick={handleOpenCert}
              className="h-8 px-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-400/40 text-amber-300 text-[11px] font-mono font-black flex items-center gap-1 cursor-pointer transition-colors whitespace-nowrap"
              title="כוכבי מחקר ותעודת הצטיינות"
            >
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
              <span>{totalStars}/24</span>
            </button>

            {/* Glossary Button */}
            <button
              type="button"
              onClick={handleOpenGloss}
              className="h-8 w-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              title="מילון המושגים המלא"
            >
              <BookOpen className="w-3.5 h-3.5" />
            </button>

            {/* Mute Toggle */}
            <button
              type="button"
              onClick={() => store.toggleMute()}
              className="h-8 w-8 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors shrink-0"
              title={isMuted ? 'הפעלת צלילים' : 'השתקת צלילים'}
            >
              {isMuted ? (
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
              )}
            </button>

            {/* Prominent Classic 2D / Teacher Mode Switch */}
            <button
              type="button"
              onClick={handleClassicSwitch}
              className="h-8 px-2.5 rounded-xl bg-slate-800/95 hover:bg-slate-700 border border-cyan-400/40 text-cyan-200 text-[11px] font-black flex items-center gap-1.5 cursor-pointer transition-all shadow-sm whitespace-nowrap shrink-0"
              title="מעבר לממשק דו-ממדי קלאסי / תצוגת מורה"
            >
              <Monitor className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>מצב קלאסי / מורה</span>
            </button>
          </div>
        </header>

        {/* Mobile/Tablet Stage Pills Bar when in 'station' mode (< lg screens) */}
        {sceneMode === 'station' && (
          <div className="flex lg:hidden items-center justify-center gap-1 mt-1.5 bg-slate-950/80 backdrop-blur-xl p-1 rounded-xl border border-white/15 overflow-x-auto">
            {STAGE_PILLS.map(pill => {
              const isActive = activeSubView === pill.id;
              return (
                <button
                  key={pill.id}
                  type="button"
                  onClick={() => store.setActiveSubView(pill.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-black transition-all cursor-pointer whitespace-nowrap ${
                    isActive
                      ? 'bg-amber-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {pill.shortLabel}
                </button>
              );
            })}
          </div>
        )}

        {/* 3D Workshop Popover Drawer */}
        {isWorkshopOpen && (
          <div className="mt-2 max-w-3xl mr-0 ml-auto animate-fadeIn">
            <ZenWorkshopBar totalStars={totalStars} />
          </div>
        )}
      </div>

      {/* =====================================================================
          2. BOTTOM COMPACT DOCK (Overworld Compass OR Station Sandbox Telemetry)
         ===================================================================== */}
      <div className="relative z-40 pointer-events-auto w-full max-w-5xl mx-auto">
        {sceneMode === 'overworld' && (
          <div className="bg-slate-950/75 backdrop-blur-xl border border-white/15 rounded-2xl px-3 py-1.5 shadow-[0_8px_32px_rgba(2,6,23,0.65)] flex flex-wrap items-center justify-between gap-2">
            {/* Navigation Compass Instruction */}
            <div className="flex items-center gap-2 text-xs text-slate-200 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <span>
                נווטו עם הרובוט זֶן (WASD / חצים / לחיצה על הרצפה) או לחצו על שער תחנה תלת-ממדי לכניסה
              </span>
            </div>

            {/* World Filter Pills + Welcome Voiceover */}
            <div className="flex flex-wrap items-center gap-1.5">
              <div className="flex items-center bg-slate-900/90 p-0.5 rounded-xl border border-white/10 gap-0.5">
                {WORLD_FILTERS.map(wf => (
                  <button
                    key={wf.id}
                    type="button"
                    onClick={() => store.setSelectedWorld(wf.id)}
                    className={`px-2 py-0.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                      selectedWorld === wf.id
                        ? 'bg-amber-400 text-slate-950'
                        : 'text-slate-300 hover:text-white'
                    }`}
                  >
                    {wf.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handlePlayWelcomeVoice}
                className={`px-2.5 py-0.5 rounded-xl text-[11px] font-black border flex items-center gap-1 transition-all cursor-pointer ${
                  narrationState?.isPlaying
                    ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                    : 'bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border-amber-400/40'
                }`}
              >
                {narrationState?.isPlaying ? (
                  <>
                    <Square className="w-3 h-3 fill-current" />
                    <span>עצור</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>🔊 שמעו את זֶן</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {sceneMode === 'station' && activeSubView === 'sandbox' && (
          <div className="bg-slate-950/80 backdrop-blur-xl border border-white/15 rounded-2xl px-3 py-1.5 shadow-[0_8px_32px_rgba(2,6,23,0.75)] space-y-1">
            {/* Row 1: 3 Star Missions + Active Mission Text + Audio Hint + Hint Popover + X-Ray Toggle */}
            <div className="flex flex-wrap items-center justify-between gap-1.5 border-b border-white/10 pb-1">
              {/* 3 Mission Tabs */}
              <div className="flex items-center gap-1 shrink-0">
                {challenges.map((ch, idx) => {
                  const isDone = Boolean(completedChallenges[ch.id]);
                  const isSelected = effectiveChallengeIdx === idx;
                  return (
                    <button
                      key={ch.id || idx}
                      type="button"
                      onClick={() => {
                        setSelectedChallengeIdx(idx);
                        setIsHintOpen(false);
                        AudioEngine.playStep();
                      }}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-black flex items-center gap-1 border transition-all cursor-pointer ${
                        isSelected
                          ? isDone
                            ? 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-sm'
                            : 'bg-amber-400 text-slate-950 border-amber-200 shadow-sm'
                          : isDone
                          ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                          : 'bg-slate-900/90 text-slate-300 border-white/10 hover:text-white'
                      }`}
                    >
                      <span>{isDone ? '★' : '☆'}</span>
                      <span>משימה {idx + 1}</span>
                    </button>
                  );
                })}
              </div>

              {/* Active Mission Instructions */}
              <div className="flex-1 min-w-[200px] text-xs font-bold text-slate-100 truncate px-1">
                <span className="text-amber-400 font-black ml-1.5">
                  {currentChallenge.title}:
                </span>
                <span className="text-slate-200">{currentChallenge.instructions}</span>
              </div>

              {/* Mission Actions: Voice Readout, Hint Popover, X-Ray Lens */}
              <div className="flex items-center gap-1.5 shrink-0 relative">
                <button
                  type="button"
                  onClick={handlePlayMissionVoice}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-black border flex items-center gap-1 transition-all cursor-pointer ${
                    narrationState?.isPlaying
                      ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                      : 'bg-slate-900 hover:bg-slate-800 text-amber-300 border-amber-400/35'
                  }`}
                  title="השמעה קולית של המשימה והרמז"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>🔊 השמע משימה</span>
                </button>

                {currentChallenge.hint && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsHintOpen(prev => !prev);
                      AudioEngine.playStep();
                    }}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-black border flex items-center gap-1 transition-all cursor-pointer ${
                      isHintOpen
                        ? 'bg-amber-400 text-slate-950 border-amber-300'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-white/15'
                    }`}
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>💡 רמז</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => store.toggleXRay()}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-mono font-black border flex items-center gap-1 transition-all cursor-pointer ${
                    showXRay
                      ? 'bg-cyan-500/25 text-cyan-200 border-cyan-400/60 shadow-[0_0_10px_rgba(34,211,238,0.25)]'
                      : 'bg-slate-900 text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title="הצגת או הסתרת נתוני מתמטיקה וקוד תלת-ממדיים"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>עדשת רנטגן [X-Ray]</span>
                </button>

                {/* Floating Hint Popover */}
                {isHintOpen && currentChallenge.hint && (
                  <div className="absolute bottom-10 left-0 w-72 sm:w-80 bg-slate-950/95 backdrop-blur-2xl border border-amber-400/50 rounded-2xl p-3 text-xs text-amber-100 shadow-2xl z-50">
                    <div className="flex items-center justify-between font-black text-amber-400 mb-1">
                      <span>💡 רמז למשימה {activeChallengeNum}</span>
                      <button
                        type="button"
                        onClick={() => setIsHintOpen(false)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                    <p className="leading-relaxed text-slate-200">{currentChallenge.hint}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Row 2: Compact Station-Specific Controls (Stations 1..8) */}
            <StationCompactControls activeLabId={activeLabId} store={store} />
          </div>
        )}
      </div>

      {/* Standalone Fallback Modals when not controlled externally */}
      <CertificateModal
        isOpen={localCertOpen}
        onClose={() => setLocalCertOpen(false)}
        totalStars={totalStars}
      />
      <GlossaryModal
        isOpen={localGlossaryOpen}
        onClose={() => setLocalGlossaryOpen(false)}
        curriculum={curriculum}
      />
    </div>
  );
}

function StationCompactControls({ activeLabId, store }) {
  // ===========================================================================
  // STATION 1: Binary Pixels & Voxels (Wireframe Blueprint Guide ONLY - no auto-fill!)
  // ===========================================================================
  if (activeLabId === 'lab1') {
    const { lab1 } = store;
    const activeRowInfo = lab1.rowBytes[lab1.selectedRow] || lab1.rowBytes[0];
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-black text-slate-400">שקף הולוגרמה להדרכה:</span>
          {[
            { id: 'heart', label: '❤️ שקף לב' },
            { id: 'smiley', label: '😊 שקף סמיילי' },
            { id: 'none', label: 'ללא שקף' }
          ].map(bp => (
            <button
              key={bp.id}
              type="button"
              onClick={() => lab1.setBlueprintMode(bp.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black border transition-all cursor-pointer ${
                lab1.blueprintMode === bp.id
                  ? 'bg-amber-400/25 text-amber-300 border-amber-400'
                  : 'bg-slate-900 text-slate-300 border-white/10 hover:text-white'
              }`}
            >
              {bp.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-900/90 px-2.5 py-1 rounded-lg border border-white/10 text-cyan-300">
          <span>נורות דולקות: {lab1.litCount}/64</span>
          <span className="text-slate-600">|</span>
          <span>
            שורה #{lab1.selectedRow + 1}: {activeRowInfo?.bitStr} = {activeRowInfo?.val} (
            {activeRowInfo?.hex})
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => lab1.invertGrid()}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/15 text-[11px] font-bold cursor-pointer"
          >
            הפוך ביטים (NOT)
          </button>
          <button
            type="button"
            onClick={() => lab1.clearGrid()}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-200 border border-white/15 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>נקה לוח</span>
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STATION 2: Algorithmic Robot Maze
  // ===========================================================================
  if (activeLabId === 'lab2') {
    const { lab2 } = store;
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Command Add Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {[
            { cmd: 'FORWARD', label: '+ צעד קדימה ⬆️' },
            { cmd: 'TURN_LEFT', label: '+ שמאלה ↩️' },
            { cmd: 'TURN_RIGHT', label: '+ ימינה ↪️' },
            { cmd: 'PICK_KEY', label: '+ אסוף מפתח 🔑' },
            { cmd: 'UNLOCK_GATE', label: '+ פתח שער 🔓' }
          ].map(btn => (
            <button
              key={btn.cmd}
              type="button"
              disabled={lab2.isRunning}
              onClick={() => lab2.addCommand(btn.cmd)}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-indigo-950 text-slate-100 border border-indigo-400/35 text-[11px] font-black cursor-pointer disabled:opacity-40"
            >
              {btn.label}
            </button>
          ))}
        </div>

        {/* Compact Queue Chips */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-xs sm:max-w-md bg-slate-900/90 px-2 py-1 rounded-lg border border-white/10">
          {lab2.commands.length === 0 ? (
            <span className="text-[11px] text-slate-400">תור פקודות ריק (לחצו להוספה)</span>
          ) : (
            lab2.commands.map((c, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => lab2.removeCommand(idx)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold shrink-0 cursor-pointer border ${
                  lab2.executingIndex === idx
                    ? 'bg-amber-400 text-slate-950 border-white font-black'
                    : 'bg-slate-800 text-slate-200 border-white/10 hover:bg-rose-950'
                }`}
                title="לחצו להסרת פקודה"
              >
                {idx + 1}.{CMD_LABELS[c] || c}
              </button>
            ))
          )}
        </div>

        {/* Execution Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={lab2.isRunning || lab2.commands.length === 0}
            onClick={() => lab2.runAlgorithm()}
            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black flex items-center gap-1 cursor-pointer disabled:opacity-40"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>הפעל רובוט</span>
          </button>
          <button
            type="button"
            disabled={lab2.isRunning || lab2.commands.length === 0}
            onClick={() => lab2.stepAlgorithm()}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/35 text-[11px] font-bold cursor-pointer disabled:opacity-40"
          >
            צעד בודד
          </button>
          <button
            type="button"
            onClick={() => lab2.resetSimulation()}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/15 text-[11px] font-bold cursor-pointer"
            title="החזר רובוט להתחלה"
          >
            ↺ איפוס
          </button>
          <button
            type="button"
            onClick={() => lab2.clearCommands()}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-rose-300 border border-rose-500/30 text-[11px] font-bold cursor-pointer"
          >
            נקה תור
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STATION 3: Decision Tree Detective
  // ===========================================================================
  if (activeLabId === 'lab3') {
    const { lab3 } = store;
    const attrs = lab3.attributes || [];
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Node Split Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: 'שורש העץ:', val: lab3.rootAttr, setter: lab3.setRootAttr },
            { label: 'ענף כן (ימין):', val: lab3.leftAttr, setter: lab3.setLeftAttr },
            { label: 'ענף לא (שמאל):', val: lab3.rightAttr, setter: lab3.setRightAttr }
          ].map((node, i) => (
            <label key={i} className="flex items-center gap-1 text-[11px] font-bold text-slate-300">
              <span>{node.label}</span>
              <select
                value={node.val}
                onChange={e => node.setter(e.target.value)}
                className="bg-slate-900 text-amber-300 border border-white/15 rounded-lg px-2 py-0.5 text-[11px] font-black cursor-pointer"
              >
                {attrs.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.question}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>

        {/* Animal Capsule Launcher */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-slate-400">שגר קפסולה:</span>
          {lab3.activeDataset.slice(0, 4).map(animal => (
            <button
              key={animal.id}
              type="button"
              onClick={() => lab3.launchAnimalCapsule(animal.id)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-black border cursor-pointer transition-all ${
                lab3.selectedTestAnimalId === animal.id
                  ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                  : 'bg-slate-900 text-slate-200 border-white/10 hover:bg-slate-800'
              }`}
            >
              {ANIMAL_EMOJIS[animal.id] || '🐾'} {animal.name}
            </button>
          ))}
        </div>

        {/* Purity Readout & Dataset Mode */}
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[11px] font-black">
            דיוק העץ: {lab3.evaluation.accuracy}%
          </span>
          <button
            type="button"
            onClick={() => lab3.setDatasetMode(lab3.datasetMode === 'four' ? 'eight' : 'four')}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/15 text-[11px] font-bold cursor-pointer"
          >
            {lab3.datasetMode === 'four' ? 'מצב: 4 חיות' : 'מצב: 8 חיות'}
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STATION 4: Space Pathfinder (A* vs BFS)
  // ===========================================================================
  if (activeLabId === 'lab4') {
    const { lab4 } = store;
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => lab4.setAlgorithm('astar')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black border cursor-pointer transition-all ${
              lab4.algorithm === 'astar'
                ? 'bg-amber-400 text-slate-950 border-amber-200'
                : 'bg-slate-900 text-slate-300 border-white/15 hover:text-white'
            }`}
          >
            🧭 מצפן חכם (A*)
          </button>
          <button
            type="button"
            onClick={() => lab4.setAlgorithm('bfs')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black border cursor-pointer transition-all ${
              lab4.algorithm === 'bfs'
                ? 'bg-cyan-400 text-slate-950 border-cyan-200'
                : 'bg-slate-900 text-slate-300 border-white/15 hover:text-white'
            }`}
          >
            📡 גלי מכ״ם (BFS)
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] bg-slate-900/90 px-2.5 py-1 rounded-lg border border-white/10 text-slate-200">
          <span>אסטרואידים: {lab4.wallCount}</span>
          <span className="text-slate-600">|</span>
          <span className="text-amber-300">
            A*: {lab4.lastAstarCount ?? lab4.solution.totalExplored} משבצות
          </span>
          {lab4.lastBfsCount !== null && (
            <>
              <span className="text-slate-600">|</span>
              <span className="text-cyan-300">BFS: {lab4.lastBfsCount} משבצות</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => (lab4.isPlaying ? lab4.pauseSearch() : lab4.runSearch())}
            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black flex items-center gap-1 cursor-pointer"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{lab4.isPlaying ? 'השהה סריקה' : 'שגר גלי ניווט!'}</span>
          </button>
          <button
            type="button"
            onClick={() => lab4.loadPresetMaze()}
            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-amber-400/35 text-[11px] font-bold cursor-pointer"
          >
            ☄️ הצב חגורת אסטרואידים
          </button>
          <button
            type="button"
            onClick={() => lab4.resetGrid()}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/15 text-[11px] font-bold cursor-pointer"
          >
            ↺ נקה
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STATION 5: k-NN Fruit Classifier
  // ===========================================================================
  if (activeLabId === 'lab5') {
    const { lab5 } = store;
    const isApple = lab5.classification.predictedLabel === 'A';
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              lab5.setSelectedClass('A');
              lab5.addPoint(20 + Math.random() * 25, 22 + Math.random() * 25, 'A');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black border cursor-pointer ${
              lab5.selectedClass === 'A'
                ? 'bg-rose-500 text-white border-rose-300'
                : 'bg-slate-900 text-rose-300 border-rose-500/30'
            }`}
          >
            + הוסף תפוח 🍎
          </button>
          <button
            type="button"
            onClick={() => {
              lab5.setSelectedClass('B');
              lab5.addPoint(60 + Math.random() * 25, 60 + Math.random() * 25, 'B');
            }}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-black border cursor-pointer ${
              lab5.selectedClass === 'B'
                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                : 'bg-slate-900 text-emerald-300 border-emerald-500/30'
            }`}
          >
            + הוסף אבטיח 🍉
          </button>
          <button
            type="button"
            onClick={() => lab5.randomizeTestPoint()}
            className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 text-[11px] font-black cursor-pointer"
          >
            🎯 הזז פרי מסתורין (?)
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-slate-400">מספר שכנים:</span>
          {[1, 3, 5].map(k => (
            <button
              key={k}
              type="button"
              onClick={() => lab5.setKValue(k)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-black border cursor-pointer ${
                lab5.kValue === k
                  ? 'bg-amber-400 text-slate-950 border-white'
                  : 'bg-slate-900 text-slate-300 border-white/15'
              }`}
            >
              k={k}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-slate-900 border border-white/15 text-[11px] font-black text-white">
            דוגמאות: {lab5.points.length} | זיהוי:{' '}
            <strong className={isApple ? 'text-rose-400' : 'text-emerald-400'}>
              {isApple ? 'תפוח 🍎' : 'אבטיח 🍉'} ({lab5.classification.confidence}%)
            </strong>
          </span>
          <button
            type="button"
            onClick={() => lab5.resetPoints()}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/15 text-[11px] font-bold cursor-pointer"
          >
            ↺ איפוס
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STATION 6: Computer Vision 3x3 Convolution Kernels
  // ===========================================================================
  if (activeLabId === 'lab6') {
    const { lab6 } = store;
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Preset Selector */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-slate-400">תבנית:</span>
          {[
            { id: 'verticalStripe', label: 'פס אנכי 📏' },
            { id: 'square', label: 'ריבוע ⬛' },
            { id: 'cross', label: 'צלב ➕' },
            { id: 'smiley', label: 'סמיילי 😊' }
          ].map(p => (
            <button
              key={p.id}
              type="button"
              onClick={() => lab6.selectPreset(p.id)}
              className={`px-2 py-1 rounded-lg text-[11px] font-black border cursor-pointer ${
                lab6.selectedPreset === p.id
                  ? 'bg-amber-400 text-slate-950 border-amber-200'
                  : 'bg-slate-900 text-slate-300 border-white/10 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Kernel Selector */}
        <div className="flex items-center gap-1">
          <span className="text-[11px] font-bold text-slate-400">פילטר 3×3:</span>
          {[
            { id: 'verticalEdge', label: 'קצוות אנכיים ║' },
            { id: 'horizontalEdge', label: 'קצוות אופקיים ═' },
            { id: 'blur', label: 'טשטוש 🌫️' },
            { id: 'sharpen', label: 'חידוד ✨' }
          ].map(k => (
            <button
              key={k.id}
              type="button"
              onClick={() => lab6.selectKernel(k.id)}
              className={`px-2 py-1 rounded-lg text-[11px] font-black border cursor-pointer ${
                lab6.activeKernelKey === k.id
                  ? 'bg-cyan-400 text-slate-950 border-cyan-200'
                  : 'bg-slate-900 text-slate-300 border-white/10 hover:text-white'
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>

        {/* Inspect Cell Trigger */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              lab6.inspectCell({
                x: ((lab6.inspectedCell?.x || 2) % 6) + 1,
                y: ((lab6.inspectedCell?.y || 2) % 6) + 1
              })
            }
            className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-[11px] font-black cursor-pointer"
          >
            🔍 בדוק משבצת בעדשה ({lab6.inspectedCell?.x},{lab6.inspectedCell?.y})
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STATION 7: Artificial Neuron (Perceptron)
  // ===========================================================================
  if (activeLabId === 'lab7') {
    const { lab7 } = store;
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Logic Gate Selector */}
        <div className="flex items-center gap-1">
          {[
            { id: 'AND', label: 'שער וגם (AND)' },
            { id: 'OR', label: 'שער או (OR)' },
            { id: 'XOR', label: 'חידת XOR 🧩' }
          ].map(g => (
            <button
              key={g.id}
              type="button"
              onClick={() => lab7.setSelectedGate(g.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-black border cursor-pointer ${
                lab7.selectedGate === g.id
                  ? 'bg-amber-400 text-slate-950 border-amber-200'
                  : 'bg-slate-900 text-slate-300 border-white/15 hover:text-white'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>

        {/* Compact Weight & Bias Sliders */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 px-3 py-1 rounded-xl border border-white/10">
          <label className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300">
            <span>w₁:{lab7.w1.toFixed(1)}</span>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={lab7.w1}
              onChange={e => lab7.setW1( parseFloat(e.target.value) )}
              className="w-16 accent-cyan-400 cursor-pointer"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[11px] font-mono text-indigo-300">
            <span>w₂:{lab7.w2.toFixed(1)}</span>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={lab7.w2}
              onChange={e => lab7.setW2( parseFloat(e.target.value) )}
              className="w-16 accent-indigo-400 cursor-pointer"
            />
          </label>
          <label className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300">
            <span>סף b:{lab7.bias.toFixed(1)}</span>
            <input
              type="range"
              min="-2"
              max="2"
              step="0.1"
              value={lab7.bias}
              onChange={e => lab7.setBias( parseFloat(e.target.value) )}
              className="w-16 accent-amber-400 cursor-pointer"
            />
          </label>
        </div>

        {/* Accuracy Readout & Reset */}
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2.5 py-1 rounded-lg font-mono text-[11px] font-black border ${
              lab7.currentAccuracy === 100
                ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                : 'bg-slate-900 text-amber-300 border-amber-400/40'
            }`}
          >
            דיוק נוירון: {lab7.currentAccuracy}%
          </span>
          <button
            type="button"
            onClick={() => lab7.resetPerceptron()}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/15 text-[11px] font-bold cursor-pointer"
          >
            ↺ איפוס
          </button>
        </div>
      </div>
    );
  }

  // ===========================================================================
  // STATION 8: Language Model Next-Token Predictor
  // ===========================================================================
  if (activeLabId === 'lab8') {
    const { lab8, curriculum } = store;
    const prompts = curriculum.labs.lab8.prompts || [];
    return (
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Prompt Selector */}
        <div className="flex items-center gap-1">
          {prompts.map(p => {
            const isSelected =
              lab8.activePrompt?.id === p.id ||
              (lab8.selectedPromptId === 'robot_story' && p.id === 'robotics');
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => lab8.selectPrompt(p.id)}
                className={`px-2 py-1 rounded-lg text-[11px] font-black border cursor-pointer ${
                  isSelected
                    ? 'bg-amber-400 text-slate-950 border-amber-200'
                    : 'bg-slate-900 text-slate-300 border-white/10 hover:text-white'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Temperature Control */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-2.5 py-1 rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => lab8.setTemperature(0.0)}
            className="text-[10px] font-black px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 cursor-pointer"
          >
            ❄️ 0.0
          </button>
          <label className="flex items-center gap-1.5 text-[11px] font-mono text-amber-300">
            <span>טמפ׳:{lab8.temperature.toFixed(1)}</span>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.1"
              value={lab8.temperature}
              onChange={e => lab8.setTemperature(parseFloat(e.target.value))}
              className="w-16 accent-amber-400 cursor-pointer"
            />
          </label>
          <button
            type="button"
            onClick={() => lab8.setTemperature(1.1)}
            className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 cursor-pointer"
          >
            🔥 1.1
          </button>
        </div>

        {/* Sample Token & Reset */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => lab8.sampleNextToken()}
            className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-[11px] font-black flex items-center gap-1 cursor-pointer shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>גלו את המילה הבאה! ({lab8.generatedTokens.length}/4)</span>
          </button>
          <button
            type="button"
            onClick={() => lab8.resetTokens()}
            className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-white/15 text-[11px] font-bold cursor-pointer"
          >
            ↺ איפוס
          </button>
        </div>
      </div>
    );
  }

  return null;
}
