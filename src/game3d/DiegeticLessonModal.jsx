import React, { useState, useEffect, useMemo } from 'react';
import {
  Tv,
  Video,
  Radio,
  Sparkles,
  Volume2,
  Square,
  Info,
  Lightbulb,
  Globe,
  ShieldAlert,
  Award,
  Play,
  ArrowLeft,
  Lock,
  Unlock,
  Zap,
  Binary,
  Grid,
  Layers,
  Eye,
  Cpu,
  ListOrdered,
  Key,
  Bug,
  Network,
  Sliders,
  Scale,
  BarChart3,
  Flame,
  HelpCircle,
  CheckCircle2,
  Box
} from 'lucide-react';
import { useZenGameStore } from './useZenGameStore.js';
import { AudioEngine } from '../core/audio.js';
import { NarrationEngine } from '../core/narration.js';
import { fireChampagneConfetti } from '../core/confetti.js';
import LiteYouTubeEmbed from '../components/LiteYouTubeEmbed.jsx';
import PodcastPlayer from '../components/PodcastPlayer.jsx';
import HebrewExplainerTour from '../components/HebrewExplainerTour.jsx';
import AudioNarrationPlayer from '../components/AudioNarrationPlayer.jsx';
import InteractiveConceptSandbox from '../components/InteractiveConceptSandbox.jsx';
import { BespokeRealWorldBadge, BespokeStarBadge } from '../components/BespokeIllustrations.jsx';

// SVG Behind-the-Scenes Animations for all 8 Stations
import SvgBinaryAnimation from '../components/animations/SvgBinaryAnimation.jsx';
import SvgLogicGatesAnimation from '../components/animations/SvgLogicGatesAnimation.jsx';
import SvgRobotAnimation from '../components/animations/SvgRobotAnimation.jsx';
import SvgCpuPipelineAnimation from '../components/animations/SvgCpuPipelineAnimation.jsx';
import SvgDecisionTreeAnimation from '../components/animations/SvgDecisionTreeAnimation.jsx';
import SvgPathfinderAnimation from '../components/animations/SvgPathfinderAnimation.jsx';
import SvgClassifierAnimation from '../components/animations/SvgClassifierAnimation.jsx';
import SvgKernelAnimation from '../components/animations/SvgKernelAnimation.jsx';
import SvgPerceptronAnimation from '../components/animations/SvgPerceptronAnimation.jsx';
import SvgLlmAnimation from '../components/animations/SvgLlmAnimation.jsx';
import SvgSelfAttentionAnimation from '../components/animations/SvgSelfAttentionAnimation.jsx';

const ICON_MAP = {
  Binary,
  Grid,
  Layers,
  Eye,
  Cpu,
  ListOrdered,
  Key,
  Bug,
  Network,
  Sliders,
  Scale,
  Sparkles,
  BarChart3,
  Flame,
  HelpCircle,
  CheckCircle2
};

const LAB_ANIMATIONS_MAP = {
  lab1: [
    { id: 'binary', label: 'ביטים ופיקסלים (0 ו-1)', component: SvgBinaryAnimation },
    { id: 'logicGates', label: 'שערים לוגיים בשבב', component: SvgLogicGatesAnimation }
  ],
  lab2: [
    { id: 'robot', label: 'תור פקודות הרובוט', component: SvgRobotAnimation },
    { id: 'cpu', label: 'מחזור השעון במעבד (CPU)', component: SvgCpuPipelineAnimation }
  ],
  lab3: [
    { id: 'tree', label: 'עץ החלטות ושאלות כן/לא', component: SvgDecisionTreeAnimation }
  ],
  lab4: [
    { id: 'pathfinder', label: 'ניווט חכם (A* מול BFS)', component: SvgPathfinderAnimation }
  ],
  lab5: [
    { id: 'knn', label: 'סיווג לפי השכנים הקרובים (k-NN)', component: SvgClassifierAnimation }
  ],
  lab6: [
    { id: 'kernel', label: 'סריקת פילטר 3×3 בראייה ממוחשבת', component: SvgKernelAnimation }
  ],
  lab7: [
    { id: 'perceptron', label: 'איך תא נוירון מקבל החלטה', component: SvgPerceptronAnimation },
    { id: 'logicGates', label: 'שערים לוגיים בחומרה', component: SvgLogicGatesAnimation }
  ],
  lab8: [
    { id: 'llm', label: 'חיזוי המילה הבאה ומד טמפרטורה', component: SvgLlmAnimation },
    { id: 'attention', label: 'מנגנון תשומת לב (Self-Attention)', component: SvgSelfAttentionAnimation }
  ]
};

export default function DiegeticLessonModal() {
  const store = useZenGameStore();
  const {
    sceneMode,
    activeLabId,
    activeSubView,
    activeLabData,
    activeLabMeta,
    narrationState
  } = store;

  const [activeMediaTab, setActiveMediaTab] = useState('video');
  const [activeAnimIdx, setActiveAnimIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [activeCodexIdx, setActiveCodexIdx] = useState(null);

  useEffect(() => {
    setActiveAnimIdx(0);
    setQuizAnswers({});
    setActiveCodexIdx(null);
    if (activeLabData?.media?.video?.localSrc) {
      setActiveMediaTab('video');
    } else {
      setActiveMediaTab('tour');
    }
  }, [activeLabId, activeLabData]);

  // Consolidate structuredConcepts and glossary into unified 3D Holo-Codex Cards (zero duplicate sections!)
  const consolidatedCodexCards = useMemo(() => {
    const concepts = activeLabData?.structuredConcepts || [];
    const glossary = activeLabData?.glossary || [];
    const maxLen = Math.max(concepts.length, glossary.length);
    const merged = [];

    for (let i = 0; i < maxLen; i++) {
      const c = concepts[i];
      const g = glossary[i];
      if (c && g) {
        merged.push({
          id: c.id || `codex_${i}`,
          title: c.title,
          badge: c.badge || 'מושג מפתח',
          description: c.description,
          highlight: c.highlight,
          icon: c.icon || 'Sparkles',
          glossaryTerm: g.term !== c.title ? g.term : null,
          glossaryDef: g.definition !== c.description ? g.definition : null
        });
      } else if (c) {
        merged.push({
          id: c.id || `codex_${i}`,
          title: c.title,
          badge: c.badge || 'מושג מפתח',
          description: c.description,
          highlight: c.highlight,
          icon: c.icon || 'Sparkles',
          glossaryTerm: null,
          glossaryDef: null
        });
      } else if (g) {
        merged.push({
          id: `codex_gloss_${i}`,
          title: g.term,
          badge: 'מונח בקודקס',
          description: g.definition,
          highlight: null,
          icon: 'Layers',
          glossaryTerm: null,
          glossaryDef: null
        });
      }
    }
    return merged;
  }, [activeLabData]);

  if (sceneMode !== 'station' || activeSubView === 'sandbox') {
    return null;
  }

  const media = activeLabData?.media || {};
  const conceptExplanation = activeLabData?.conceptExplanation || {};
  const animList = LAB_ANIMATIONS_MAP[activeLabId] || LAB_ANIMATIONS_MAP.lab1;
  const currentAnim = animList[activeAnimIdx] || animList[0];
  const CurrentAnimComp = currentAnim?.component;
  const miniQuiz = activeLabMeta?.miniQuiz || [];
  const solvedLocksCount = miniQuiz.filter((q, idx) => quizAnswers[idx] === q.correctIndex).length;

  const handleReturnToSandbox = () => {
    store.setActiveSubView('sandbox');
  };

  return (
    <div
      dir="rtl"
      className="fixed inset-0 z-20 pointer-events-auto flex items-center justify-center px-3 sm:px-6 pt-16 pb-6 overflow-y-auto bg-slate-950/55 backdrop-blur-md animate-fadeIn"
    >
      {/* Translucent Sci-Fi Holographic Projection Window */}
      <div
        className="w-full max-w-5xl max-h-[82vh] overflow-y-auto rounded-3xl border border-cyan-400/35 bg-slate-950/88 backdrop-blur-2xl shadow-[0_0_60px_rgba(6,182,212,0.18)] p-4 sm:p-6 text-white space-y-5 relative"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 0%, rgba(30, 27, 75, 0.85) 0%, rgba(15, 23, 42, 0.92) 60%, rgba(2, 6, 23, 0.96) 100%)'
        }}
      >
        {/* Top Holo-Header Bar with Prominent "חזרה למכונת המחקר 3D" Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/15 sticky top-0 z-30 bg-slate-950/90 backdrop-blur-xl -mx-4 sm:-mx-6 px-4 sm:px-6 -mt-4 sm:-mt-6 pt-4 sm:pt-5 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center border border-white/20 shadow-inner shrink-0"
              style={{
                backgroundColor: activeLabMeta?.bgWash || 'rgba(251,191,36,0.15)',
                color: activeLabMeta?.accentColor || '#fbbf24'
              }}
            >
              {activeSubView === 'holo_media' && <Tv className="w-5 h-5" />}
              {activeSubView === 'warmup_codex' && <Sparkles className="w-5 h-5" />}
              {activeSubView === 'laser_quiz' && <Zap className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-black px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  תחנה {activeLabMeta?.number}: {activeLabMeta?.title}
                </span>
                <span className="text-[11px] text-amber-300 font-bold hidden sm:inline">
                  • הקרנה הולוגרפית תלת-ממדית
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                {activeSubView === 'holo_media' && '📽️ מקרן הולוגרמה: וידאו, פודקאסט, סיור וקריינות'}
                {activeSubView === 'warmup_codex' && '🔬 גאדג׳ט חימום, חיבור לעולם האמיתי וקודקס הולוגרפי'}
                {activeSubView === 'laser_quiz' && '⚡ כור מנעולי הלייזר: חידון הבנה (3 מנעולי אנרגיה)'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleReturnToSandbox}
            className="px-4 py-2 rounded-2xl bg-gradient-to-l from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 text-xs sm:text-sm font-black shadow-[0_0_20px_rgba(251,191,36,0.35)] border border-white/60 flex items-center justify-center gap-2 cursor-pointer transition-all shrink-0"
          >
            <Box className="w-4 h-4" />
            <span>חזרה למכונת המחקר 3D</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>

        {/* ===================================================================
            SUBVIEW 1: 'holo_media' (Video, Podcast, Animated Tour, Narration, Story Summary)
           =================================================================== */}
        {activeSubView === 'holo_media' && (
          <div className="space-y-5">
            {/* Media Mode Switcher */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 p-2 rounded-2xl border border-white/10">
              <div className="flex flex-wrap items-center gap-1.5">
                {media.video && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMediaTab('video');
                      AudioEngine.playStep();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeMediaTab === 'video'
                        ? 'bg-amber-400 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>סרטון הסבר ({media.video.duration || '05:59'})</span>
                  </button>
                )}

                {media.podcast && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMediaTab('podcast');
                      AudioEngine.playStep();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeMediaTab === 'podcast'
                        ? 'bg-indigo-500 text-white shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>פודקאסט ({media.podcast.duration || '05:36'})</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setActiveMediaTab('tour');
                    AudioEngine.playStep();
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                    activeMediaTab === 'tour'
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>סיור מונפש בעברית</span>
                </button>

                {media.narration && (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveMediaTab('audio');
                      AudioEngine.playStep();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer transition-all ${
                      activeMediaTab === 'audio'
                        ? 'bg-emerald-500 text-slate-950 shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>קריינות אולפן</span>
                  </button>
                )}
              </div>

              {media.narration && (
                <button
                  type="button"
                  onClick={() => {
                    if (narrationState?.isPlaying) {
                      NarrationEngine.stop();
                    } else {
                      NarrationEngine.play(
                        media.narration.transcript || conceptExplanation.summary,
                        media.narration.audioSrc || `/audio/narration/${activeLabId}.wav`,
                        55
                      );
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border flex items-center gap-1.5 cursor-pointer ${
                    narrationState?.isPlaying
                      ? 'bg-rose-500 text-white border-rose-300 animate-pulse'
                      : 'bg-amber-400/15 text-amber-300 border-amber-400/40 hover:bg-amber-400/25'
                  }`}
                >
                  {narrationState?.isPlaying ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>עצור הקראה</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>🔊 השמע קריינות מעבדה</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Holographic Screen Content */}
            <div className="bg-slate-950/90 border border-cyan-400/30 rounded-2xl p-3 sm:p-5 shadow-inner">
              {activeMediaTab === 'video' && media.video && (
                <LiteYouTubeEmbed
                  videoId={media.video.videoId}
                  localSrc={media.video.localSrc}
                  title={media.video.title}
                  channel={media.video.channel}
                  duration={media.video.duration}
                />
              )}

              {activeMediaTab === 'podcast' && media.podcast && (
                <PodcastPlayer podcastData={media.podcast} />
              )}

              {activeMediaTab === 'tour' && (
                <HebrewExplainerTour labData={activeLabData} />
              )}

              {activeMediaTab === 'audio' && media.narration && (
                <AudioNarrationPlayer narrationData={media.narration} />
              )}
            </div>

            {/* Story Summary & Real-World Analogy Card with TTS Readout */}
            {conceptExplanation.summary && (
              <div className="bg-slate-900/90 border border-white/15 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-cyan-400 shrink-0" />
                    <h3 className="text-sm sm:text-base font-black text-white">
                      הרעיון המרכזי והמשל מחיי היומיום
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const textToRead = `${conceptExplanation.summary} ${
                        conceptExplanation.realWorldAnalogy || ''
                      }`;
                      NarrationEngine.play(textToRead);
                    }}
                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 border border-cyan-400/30 text-xs font-black text-cyan-300 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>🔊 הקרא תקציר ומשל</span>
                  </button>
                </div>

                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  {conceptExplanation.summary}
                </p>

                {conceptExplanation.realWorldAnalogy && (
                  <div className="p-3.5 rounded-xl bg-amber-400/10 border border-amber-400/35 space-y-1">
                    <div className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>דוגמה מחיי היומיום:</span>
                    </div>
                    <p className="text-xs sm:text-sm text-amber-100 leading-relaxed">
                      {conceptExplanation.realWorldAnalogy}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================
            SUBVIEW 2: 'warmup_codex' (Warm-up Gadget, SVG Animations, Real World & Consolidated 3D Holo-Codex Cards)
           =================================================================== */}
        {activeSubView === 'warmup_codex' && (
          <div className="space-y-6">
            {/* 1. Interactive Concept Warm-up Gadget */}
            <InteractiveConceptSandbox labId={activeLabId} />

            {/* 2. Behind-the-Scenes SVG Principle Animations */}
            {CurrentAnimComp && (
              <section className="bg-slate-900/85 border border-white/15 rounded-2xl p-4 sm:p-5 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                      <span>איך זה עובד מאחורי הקלעים? (הדמיה חיה)</span>
                    </h3>
                    {activeLabData?.svgAnimation?.subtitle && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {activeLabData.svgAnimation.subtitle}
                      </p>
                    )}
                  </div>

                  {animList.length > 1 && (
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-white/10">
                      {animList.map((anim, idx) => (
                        <button
                          key={anim.id}
                          type="button"
                          onClick={() => {
                            setActiveAnimIdx(idx);
                            AudioEngine.playStep();
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-black cursor-pointer transition-all ${
                            activeAnimIdx === idx
                              ? 'bg-cyan-400 text-slate-950'
                              : 'text-slate-300 hover:text-white'
                          }`}
                        >
                          {anim.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-slate-950 rounded-xl p-3 border border-white/10 overflow-hidden">
                  <CurrentAnimComp />
                </div>
              </section>
            )}

            {/* 3. Real-World Connections & Critical Thinking */}
            {(activeLabMeta?.realWorldConnections || activeLabMeta?.criticalThinking) && (
              <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {activeLabMeta?.realWorldConnections && (
                  <div className="lg:col-span-7 bg-slate-900/90 border border-indigo-500/35 rounded-2xl p-4 sm:p-5 space-y-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-white">
                          איפה פוגשים את זה בעולם האמיתי?
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          אפליקציות, משחקים ומערכות חכמות סביבנו
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {activeLabMeta.realWorldConnections.map((rw, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-slate-950/90 border border-white/10 flex items-start gap-3"
                        >
                          <BespokeRealWorldBadge index={idx} size={34} />
                          <div>
                            <div className="text-xs sm:text-sm font-black text-amber-300">
                              {rw.emoji} {rw.app}
                            </div>
                            <p className="text-xs text-slate-300 leading-relaxed mt-0.5">
                              {rw.howItWorks}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeLabMeta?.criticalThinking && (
                  <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 border border-amber-400/40 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3">
                    <div className="space-y-2.5">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                        <span>חשיבה ביקורתית של מדענים</span>
                      </div>
                      <h3 className="text-sm sm:text-base font-black text-white leading-snug">
                        {activeLabMeta.criticalThinking.title}
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {activeLabMeta.criticalThinking.insight}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-950/90 border border-amber-400/40 text-xs font-bold text-amber-200 flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span>{activeLabMeta.criticalThinking.ruleOfThumb}</span>
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* 4. Consolidated 3D Hologram Codex Cards (Merging structuredConcepts + glossary with zero duplicate sections!) */}
            {consolidatedCodexCards.length > 0 && (
              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                    <h3 className="text-sm sm:text-base font-black text-white">
                      קודקס ההולוגרמה התלת-ממדי • מושגי יסוד ומילון מאוחד
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-500/15 border border-cyan-400/30 px-2.5 py-0.5 rounded-lg">
                    {consolidatedCodexCards.length} כרטיסי הולוגרמה
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  {consolidatedCodexCards.map((card, idx) => {
                    const IconComp = ICON_MAP[card.icon] || Sparkles;
                    const isExpanded = activeCodexIdx === idx;
                    return (
                      <div
                        key={card.id || idx}
                        onClick={() => {
                          setActiveCodexIdx(isExpanded ? null : idx);
                          AudioEngine.playStep();
                        }}
                        style={{
                          transform: isExpanded
                            ? 'perspective(800px) rotateX(2deg) translateY(-2px)'
                            : 'perspective(800px) rotateX(0deg)'
                        }}
                        className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 ${
                          isExpanded
                            ? 'bg-gradient-to-br from-indigo-950/95 via-slate-900 to-slate-950 border-cyan-400 shadow-[0_0_25px_rgba(34,211,238,0.22)]'
                            : 'bg-slate-900/90 hover:bg-slate-900 border-white/15 hover:border-cyan-400/50'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-9 h-9 rounded-xl bg-slate-950 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0">
                                <IconComp className="w-4.5 h-4.5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-white">{card.title}</h4>
                                <span className="text-[10px] font-bold text-amber-300">
                                  {card.badge}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                NarrationEngine.play(
                                  `${card.title}. ${card.description} ${card.highlight || ''} ${
                                    card.glossaryDef || ''
                                  }`
                                );
                              }}
                              className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-white/15 text-cyan-300 cursor-pointer"
                              title="השמע כרטיס קודקס"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <p className="text-xs text-slate-200 leading-relaxed">
                            {card.description}
                          </p>

                          {card.glossaryDef && (
                            <div className="p-2.5 rounded-xl bg-slate-950/85 border border-white/10 text-[11px] text-slate-300 leading-relaxed">
                              <strong className="text-cyan-300">
                                {card.glossaryTerm ? `${card.glossaryTerm}: ` : 'הגדרה מדויקת: '}
                              </strong>
                              {card.glossaryDef}
                            </div>
                          )}
                        </div>

                        {card.highlight && (
                          <div className="p-2 rounded-xl bg-amber-400/10 border border-amber-400/35 text-[11px] font-bold text-amber-200 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>{card.highlight}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ===================================================================
            SUBVIEW 3: 'laser_quiz' (3D Laser Energy Lock Reactor Quiz)
           =================================================================== */}
        {activeSubView === 'laser_quiz' && (
          <div className="space-y-5">
            {/* Visual 3-Lock Laser Reactor Core Header */}
            <div className="bg-slate-900/95 border border-cyan-400/40 rounded-2xl p-4 sm:p-5 space-y-4">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center md:text-right">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 text-xs font-black">
                    <Zap className="w-3.5 h-3.5" />
                    <span>כור הלייזר של תחנה {activeLabMeta?.number}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    ענו נכון על 3 השאלות כדי לשגר קרן לייזר ולפרוץ את מנעולי האנרגיה!
                  </h3>
                </div>

                {/* 3D Laser Energy Lock Reactor Visualizer */}
                <div className="flex items-center gap-3 bg-slate-950 px-4 py-3 rounded-2xl border border-white/15">
                  {[0, 1, 2].map(lockIdx => {
                    const isUnlocked =
                      miniQuiz[lockIdx] &&
                      quizAnswers[lockIdx] === miniQuiz[lockIdx].correctIndex;
                    return (
                      <div key={lockIdx} className="flex items-center gap-2">
                        <div
                          className={`w-11 h-11 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-300 ${
                            isUnlocked
                              ? 'bg-emerald-500/25 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                        >
                          {isUnlocked ? (
                            <Unlock className="w-4 h-4 text-emerald-300" />
                          ) : (
                            <Lock className="w-4 h-4 text-amber-400" />
                          )}
                          <span className="text-[9px] font-mono font-black mt-0.5">
                            #{lockIdx + 1}
                          </span>
                        </div>
                        {lockIdx < 2 && (
                          <div
                            className={`w-6 h-1 rounded-full transition-all duration-500 ${
                              isUnlocked
                                ? 'bg-gradient-to-l from-emerald-400 to-cyan-400 shadow-[0_0_8px_#34d399]'
                                : 'bg-slate-800'
                            }`}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {solvedLocksCount === 3 && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-400 text-emerald-200 text-xs sm:text-sm font-black flex flex-wrap items-center justify-between gap-2 animate-fadeIn">
                  <span>
                    🎉 כל 3 מנעולי האנרגיה נפרצו בהצלחה! אתם שולטים בעקרון של התחנה ומוכנים למכונת המחקר 3D!
                  </span>
                  <button
                    type="button"
                    onClick={handleReturnToSandbox}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-400 text-slate-950 font-black cursor-pointer"
                  >
                    למכונת המחקר 3D ←
                  </button>
                </div>
              )}
            </div>

            {/* 3 Graded Quiz Questions Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {miniQuiz.map((q, qIdx) => {
                const selectedOpt = quizAnswers[qIdx];
                const isAnswered = selectedOpt !== undefined;
                const isCorrect = selectedOpt === q.correctIndex;

                return (
                  <div
                    key={qIdx}
                    className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3.5 transition-all relative overflow-hidden ${
                      isAnswered
                        ? isCorrect
                          ? 'bg-emerald-950/40 border-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.2)]'
                          : 'bg-amber-950/35 border-amber-400/70'
                        : 'bg-slate-900/90 border-white/15'
                    }`}
                  >
                    {/* Animated Laser Beam Top Bar when Correct */}
                    {isCorrect && (
                      <div className="h-1 w-full bg-gradient-to-l from-emerald-400 via-cyan-300 to-emerald-400 rounded-full shadow-[0_0_12px_#34d399]" />
                    )}

                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                          מנעול {qIdx + 1}: {q.level}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            NarrationEngine.play(
                              `שאלה ${qIdx + 1}: ${q.question}. האפשרויות הן: ${q.options.join('. ')}`
                            );
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-950 hover:bg-slate-800 border border-white/15 text-[11px] font-bold text-amber-300 flex items-center gap-1 cursor-pointer"
                          title="הקרא שאלה בקול"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>🔊 הקרא שאלה</span>
                        </button>
                      </div>

                      <h4 className="text-xs sm:text-sm font-black text-white leading-relaxed">
                        {q.question}
                      </h4>

                      <div className="space-y-2 pt-1">
                        {q.options.map((opt, optIdx) => {
                          const isThisSelected = selectedOpt === optIdx;
                          const isThisCorrect = optIdx === q.correctIndex;

                          let btnStyle =
                            'bg-slate-950/90 hover:bg-slate-800 text-slate-200 border-white/10';
                          if (isThisSelected) {
                            btnStyle = isThisCorrect
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300 font-black shadow-[0_0_12px_rgba(16,185,129,0.4)]'
                              : 'bg-rose-500/25 text-rose-200 border-rose-400 font-bold';
                          } else if (isAnswered && isCorrect && isThisCorrect) {
                            btnStyle = 'bg-emerald-500 text-slate-950 border-emerald-300 font-black';
                          }

                          return (
                            <button
                              key={optIdx}
                              type="button"
                              onClick={() => {
                                const nextAnswers = { ...quizAnswers, [qIdx]: optIdx };
                                setQuizAnswers(nextAnswers);
                                if (optIdx === q.correctIndex) {
                                  AudioEngine.playSuccess();
                                  const newTotalCorrect = miniQuiz.filter(
                                    (item, i) => nextAnswers[i] === item.correctIndex
                                  ).length;
                                  if (newTotalCorrect === miniQuiz.length) {
                                    fireChampagneConfetti();
                                  }
                                } else {
                                  AudioEngine.playStep();
                                }
                              }}
                              className={`w-full text-right p-2.5 rounded-xl border text-xs leading-snug transition-all cursor-pointer flex items-center justify-between gap-2 ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isThisSelected && (
                                <span className="shrink-0 text-xs font-black">
                                  {isThisCorrect ? '⚡✓' : '✗'}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {isAnswered && (
                      <div
                        className={`p-2.5 rounded-xl text-xs leading-relaxed border ${
                          isCorrect
                            ? 'bg-emerald-950/80 border-emerald-400/50 text-emerald-200'
                            : 'bg-amber-950/80 border-amber-400/50 text-amber-200'
                        }`}
                      >
                        {isCorrect ? (
                          <span>
                            <strong>מנעול #{qIdx + 1} נפרץ! </strong>
                            {q.explanation}
                          </span>
                        ) : (
                          <span>
                            <strong>כמעט! </strong>נסו לבחור תשובה אחרת כדי לשגר את הלייזר.
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
