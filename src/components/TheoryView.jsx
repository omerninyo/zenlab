import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Lightbulb,
  Info,
  ArrowLeft,
  ArrowRight,
  Video,
  Layers,
  Binary,
  Cpu,
  Grid,
  Eye,
  ListOrdered,
  Key,
  Bug,
  Network,
  Sliders,
  Users,
  Scale,
  Sparkles,
  BarChart3,
  Flame,
  RefreshCw,
  HelpCircle,
  Tv,
  CheckCircle2,
  Volume2,
  Square,
  Radio,
  Play,
  Globe,
  ShieldAlert,
  Award,
  LayoutList
} from 'lucide-react';
import AudioNarrationPlayer from './AudioNarrationPlayer.jsx';
import LiteYouTubeEmbed from './LiteYouTubeEmbed.jsx';
import HebrewExplainerTour from './HebrewExplainerTour.jsx';
import PodcastPlayer from './PodcastPlayer.jsx';
import InteractiveConceptSandbox from './InteractiveConceptSandbox.jsx';
import { BespokeRealWorldBadge, BespokeStarBadge } from './BespokeIllustrations.jsx';
import { AudioEngine } from '../core/audio.js';
import { NarrationEngine } from '../core/narration.js';
import { getLabMeta } from '../core/labMeta.js';

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
  Users,
  Scale,
  Sparkles,
  BarChart3,
  Flame,
  RefreshCw,
  HelpCircle,
  CheckCircle2
};

const LESSON_STEPS = [
  { id: 0, shortLabel: '1. סרטון וסיפור', title: 'סרטון, פודקאסט וסיור מודרך', icon: Tv },
  { id: 1, shortLabel: '2. נסו בעצמכם', title: 'הדגמה חיה ומושגי יסוד', icon: Sparkles },
  { id: 2, shortLabel: '3. בעולם האמיתי', title: 'איפה פוגשים את זה בחיים?', icon: Globe },
  { id: 3, shortLabel: '4. חידון הבנה', title: '3 חידות חימום לפני המשחק', icon: Award }
];

export default function TheoryView({
  labData = {},
  animationComponent: AnimationComponent,
  animations,
  onProceedToInteractive,
  conceptData,
  mediaData
}) {
  const data = labData || {};
  const labMeta = getLabMeta(data.id);
  const structuredConcepts = data.structuredConcepts || [];
  const conceptExplanation = data.conceptExplanation || conceptData || {};
  const media = data.media || mediaData || {};

  // 'deck' (4-step interactive card deck - default) | 'full' (all sections on one page)
  const [layoutMode, setLayoutMode] = useState('deck');
  const [activeStep, setActiveStep] = useState(0);

  // 'video' (default if local explainer available) | 'podcast' | 'tour' | 'audio'
  const [activeMediaTab, setActiveMediaTab] = useState(() => (media.video?.localSrc ? 'video' : 'tour'));
  const [activeAnimIdx, setActiveAnimIdx] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [narrationState, setNarrationState] = useState(() => NarrationEngine.getState());

  useEffect(() => {
    return NarrationEngine.subscribe(setNarrationState);
  }, []);

  // Reset step & quiz when switching labs
  useEffect(() => {
    setActiveStep(0);
    setQuizAnswers({});
    if (media.video?.localSrc) {
      setActiveMediaTab('video');
    } else {
      setActiveMediaTab('tour');
    }
  }, [data.id]);

  // Desktop Chrome keyboard arrow support (RTL: ArrowLeft -> Next Step, ArrowRight -> Prev Step)
  useEffect(() => {
    if (layoutMode !== 'deck') return;
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'video') return;
      if (e.key === 'ArrowLeft') {
        setActiveStep(prev => Math.min(LESSON_STEPS.length - 1, prev + 1));
      } else if (e.key === 'ArrowRight') {
        setActiveStep(prev => Math.max(0, prev - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [layoutMode]);

  // Normalize animations list
  const animationList = animations && animations.length > 0
    ? animations
    : AnimationComponent
      ? [{ id: 'default', label: 'הדמיית עקרון', component: AnimationComponent }]
      : [];

  const currentAnim = animationList[activeAnimIdx] || animationList[0];
  const CurrentAnimComponent = currentAnim?.component;

  const showStep = (stepIndex) => layoutMode === 'full' || activeStep === stepIndex;

  const handleToggleLessonAudio = () => {
    if (narrationState.isPlaying) {
      NarrationEngine.stop();
      return;
    }
    const transcript = media.narration?.transcript || conceptExplanation.summary || data.subtitle || data.title;
    const audioSrc = media.narration?.audioSrc || `/audio/narration/${data.id || 'lab1'}.wav`;
    NarrationEngine.play(transcript, audioSrc, 55);
  };

  return (
    <div className="space-y-4 animate-fadeIn" dir="rtl">
      
      {/* TOP INTERACTIVE STEP DECK BAR (iPadOS & Desktop Chrome Navigation + Studio Voice) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
        
        {/* 4 Bite-Sized Lesson Steps */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 flex-1">
          {LESSON_STEPS.map((step) => {
            const StepIcon = step.icon;
            const isCurrent = layoutMode === 'deck' && activeStep === step.id;
            const isPast = layoutMode === 'deck' && activeStep > step.id;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => {
                  setLayoutMode('deck');
                  setActiveStep(step.id);
                  AudioEngine.playStep();
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer text-right border ${
                  isCurrent
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm font-black'
                    : isPast
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-300/60 dark:border-emerald-800/60'
                    : 'bg-slate-50 dark:bg-slate-950/80 text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <StepIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{step.shortLabel}</span>
              </button>
            );
          })}
        </div>

        {/* Studio Narration Button + Deck/Full View Toggle + Direct Game Jump */}
        <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-slate-100 dark:border-slate-800">
          {media.narration && (
            <button
              type="button"
              onClick={handleToggleLessonAudio}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                narrationState.isPlaying
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 border-amber-300/80 dark:border-amber-700/60 hover:bg-amber-100'
              }`}
              title="השמעה קולית של הסבר המעבדה בעברית"
            >
              {narrationState.isPlaying ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current shrink-0" />
                  <span>עצור הקראה</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5 shrink-0" />
                  <span>הקראת השיעור</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setLayoutMode(prev => (prev === 'deck' ? 'full' : 'deck'));
              AudioEngine.playStep();
            }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
            title="מעבר בין תצוגת שלבים ממוקדת לתצוגת עמוד מלא"
          >
            <LayoutList className="w-3.5 h-3.5 shrink-0" />
            <span>{layoutMode === 'deck' ? 'תצוגה מלאה' : 'תצוגת שלבים'}</span>
          </button>
        </div>
      </div>

      {/* =====================================================================
          STEP 1: MULTIMEDIA THEATER & STORY SUMMARY
         ===================================================================== */}
      {showStep(0) && (
        <div className="space-y-4 animate-fadeIn">
          <section
            className="rounded-3xl border border-indigo-500/35 shadow-xl p-4 sm:p-6 text-white relative overflow-hidden space-y-4"
            style={{
              background: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0f172a 70%, #020617 100%)'
            }}
          >
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/50 text-amber-300 flex items-center justify-center shrink-0">
                  <Tv className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white tracking-tight">
                    סרטון, פודקאסט וסיור מונפש בעברית
                  </h2>
                  <p className="text-xs text-slate-300 hidden sm:block">
                    בחרו איך נוח לכם ללמוד את הרעיון לפני שמתחילים לשחק
                  </p>
                </div>
              </div>

              {/* Media Mode Tabs */}
              <div className="grid grid-cols-3 sm:flex items-center bg-slate-950/80 p-1 rounded-xl border border-white/15 text-xs gap-1">
                {media.video && (
                  <button
                    type="button"
                    onClick={() => { setActiveMediaTab('video'); AudioEngine.playStep(); }}
                    className={`py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeMediaTab === 'video'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 shrink-0" />
                    <span className="sm:hidden">סרטון</span>
                    <span className="hidden sm:inline">{`סרטון (${media.video.duration || '05:59'})`}</span>
                  </button>
                )}

                {media.podcast && (
                  <button
                    type="button"
                    onClick={() => { setActiveMediaTab('podcast'); AudioEngine.playStep(); }}
                    className={`py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeMediaTab === 'podcast'
                        ? 'bg-indigo-500 text-white font-black shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5 shrink-0" />
                    <span className="sm:hidden">פודקאסט</span>
                    <span className="hidden sm:inline">{`פודקאסט (${media.podcast.duration || '05:36'})`}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => { setActiveMediaTab('tour'); AudioEngine.playStep(); }}
                  className={`py-1.5 px-2.5 sm:px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    activeMediaTab === 'tour'
                      ? 'bg-blue-600 text-white font-black shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 shrink-0" />
                  <span className="sm:hidden">סיור</span>
                  <span className="hidden sm:inline">סיור מונפש</span>
                </button>

                {media.narration && (
                  <button
                    type="button"
                    onClick={() => { setActiveMediaTab('audio'); AudioEngine.playStep(); }}
                    className={`hidden sm:flex px-3 py-1.5 rounded-lg text-xs font-bold transition-all items-center gap-1.5 cursor-pointer ${
                      activeMediaTab === 'audio'
                        ? 'bg-blue-600 text-white font-black shadow-sm'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>קריינות</span>
                  </button>
                )}
              </div>
            </div>

            <div className="relative z-10">
              {activeMediaTab === 'video' && media.video && (
                <div className="bg-slate-950/85 border border-white/15 rounded-2xl p-2.5 sm:p-4 shadow-inner">
                  <LiteYouTubeEmbed
                    videoId={media.video.videoId}
                    localSrc={media.video.localSrc}
                    title={media.video.title}
                    channel={media.video.channel}
                    duration={media.video.duration}
                  />
                </div>
              )}

              {activeMediaTab === 'podcast' && media.podcast && (
                <div className="bg-slate-950/85 border border-white/15 rounded-2xl p-4 sm:p-5 shadow-inner text-slate-900 dark:text-white">
                  <PodcastPlayer podcastData={media.podcast} />
                </div>
              )}

              {activeMediaTab === 'tour' && (
                <div className="text-slate-900 dark:text-white">
                  <HebrewExplainerTour labData={data} />
                </div>
              )}

              {activeMediaTab === 'audio' && media.narration && (
                <div className="bg-slate-950/85 border border-white/15 rounded-2xl p-4 sm:p-5 shadow-inner text-slate-900 dark:text-white">
                  <AudioNarrationPlayer narrationData={media.narration} />
                </div>
              )}
            </div>
          </section>

          {/* Story Summary & Everyday Analogy Card */}
          {conceptExplanation.summary && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                    הרעיון המרכזי בקצרה
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const textToRead = `${conceptExplanation.summary} ${conceptExplanation.realWorldAnalogy || ''}`;
                    NarrationEngine.play(textToRead);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 text-xs font-bold text-blue-700 dark:text-blue-300 cursor-pointer transition-colors"
                  title="הקראה קולית של התקציר"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>הקרא תקציר</span>
                </button>
              </div>

              <p className="text-sm sm:text-base text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                {conceptExplanation.summary}
              </p>

              {conceptExplanation.realWorldAnalogy && (
                <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-slate-950 border border-amber-200/80 dark:border-slate-800 space-y-1.5">
                  <div className="text-xs font-extrabold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>דוגמה מחיי היומיום:</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {conceptExplanation.realWorldAnalogy}
                  </p>
                </div>
              )}
            </section>
          )}
        </div>
      )}

      {/* =====================================================================
          STEP 2: INTERACTIVE DISCOVERY SANDBOX, SVG ANIMATION & CORE CONCEPTS
         ===================================================================== */}
      {showStep(1) && (
        <div className="space-y-5 animate-fadeIn">
          {/* Interactive Micro-Lesson */}
          <InteractiveConceptSandbox labId={data.id || 'lab1'} />

          {/* Interactive SVG Principle Animation */}
          {CurrentAnimComponent && (
            <section className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span>איך זה עובד מאחורי הקלעים?</span>
                  </h2>
                  {data.svgAnimation?.subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {data.svgAnimation.subtitle}
                    </p>
                  )}
                </div>

                {animationList.length > 1 && (
                  <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    {animationList.map((anim, idx) => (
                      <button
                        key={anim.id || idx}
                        type="button"
                        onClick={() => {
                          setActiveAnimIdx(idx);
                          AudioEngine.playStep();
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          activeAnimIdx === idx
                            ? 'bg-blue-600 text-white shadow-sm'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                        }`}
                      >
                        {anim.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs overflow-hidden">
                {React.isValidElement(CurrentAnimComponent) ? CurrentAnimComponent : <CurrentAnimComponent />}
              </div>
            </section>
          )}

          {/* 4 Structured Concept Cards */}
          {structuredConcepts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span>מושגי המפתח של התחנה</span>
                </h2>
                <span className="text-xs text-amber-900 dark:text-amber-300 font-bold bg-amber-100 dark:bg-amber-950/70 border border-amber-300/60 dark:border-amber-700/60 px-2.5 py-0.5 rounded-lg">
                  {structuredConcepts.length} מושגים
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {structuredConcepts.map((concept, idx) => {
                  const IconComponent = ICON_MAP[concept.icon] || Lightbulb;
                  return (
                    <div
                      key={concept.id || idx}
                      className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shadow-xs hover:border-amber-400/70 transition-all"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-slate-800 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0">
                              <IconComponent className="w-4.5 h-4.5" />
                            </div>
                            <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                              {concept.title}
                            </h3>
                          </div>
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                            {concept.badge}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                          {concept.description}
                        </p>
                      </div>

                      {concept.highlight && (
                        <div className="p-2.5 rounded-xl bg-amber-50/90 dark:bg-slate-950 border border-amber-300/70 dark:border-amber-500/30 text-xs font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span>{concept.highlight}</span>
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

      {/* =====================================================================
          STEP 3: REAL-WORLD CONNECTIONS, CRITICAL THINKING & GLOSSARY
         ===================================================================== */}
      {showStep(2) && (
        <div className="space-y-5 animate-fadeIn">
          {(labMeta.realWorldConnections || labMeta.criticalThinking) && (
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {labMeta.realWorldConnections && (
                <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-500/30 rounded-2xl p-5 space-y-3.5 shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-400/40 flex items-center justify-center text-indigo-600 dark:text-indigo-300">
                        <Globe className="w-4.5 h-4.5" />
                      </div>
                      <div>
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                          איפה פוגשים את זה בחיים האמיתיים?
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          באפליקציות, במשחקים ובטכנולוגיה סביבנו בכל יום
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {labMeta.realWorldConnections.map((rw, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-start gap-3"
                      >
                        <BespokeRealWorldBadge index={idx} size={34} />
                        <div>
                          <div className="text-xs sm:text-sm font-black text-slate-900 dark:text-amber-300">
                            {rw.app}
                          </div>
                          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                            {rw.howItWorks}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {labMeta.criticalThinking && (
                <div className="lg:col-span-5 bg-gradient-to-br from-amber-50 via-white to-orange-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20 border border-amber-300/80 dark:border-amber-500/40 rounded-2xl p-5 flex flex-col justify-between space-y-3.5 shadow-xs">
                  <div className="space-y-2.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400/20 text-amber-900 dark:text-amber-300 border border-amber-400/40 text-xs font-black">
                      <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      <span>חשיבה ביקורתית</span>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                      {labMeta.criticalThinking.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {labMeta.criticalThinking.insight}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-amber-100/80 dark:bg-slate-950 border border-amber-300 dark:border-amber-500/40 text-xs font-bold text-amber-950 dark:text-amber-200 flex items-start gap-2">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span>{labMeta.criticalThinking.ruleOfThumb}</span>
                  </div>
                </div>
              )}
            </section>
          )}

          {/* Glossary & Key Points */}
          {data.glossary && data.glossary.length > 0 && (
            <section className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 space-y-3.5 shadow-xs">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4.5 h-4.5 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  מילון המושגים של המעבדה
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {data.glossary.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-400 block mb-0.5">
                      {item.term}
                    </span>
                    <span className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed block">
                      {item.definition}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* =====================================================================
          STEP 4: 3-STAGE GRADED MINI-QUIZ & GAME LAUNCHPAD
         ===================================================================== */}
      {showStep(3) && (
        <div className="space-y-5 animate-fadeIn">
          {labMeta.miniQuiz && labMeta.miniQuiz.length > 0 && (
            <section className="bg-white dark:bg-slate-900 border border-blue-300/80 dark:border-blue-500/40 rounded-3xl p-5 sm:p-6 space-y-5 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      חידון הבנה • 3 שאלות חימום לפני המשחק
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      בדקו שאתם שולטים בעקרון של התחנה — אפשר גם להקשיב לכל שאלה בקול!
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-black text-blue-700 dark:text-amber-300 self-start sm:self-center">
                  <span>תשובות נכונות:</span>
                  <span>
                    {labMeta.miniQuiz.filter((q, i) => quizAnswers[i] === q.correctIndex).length} / {labMeta.miniQuiz.length}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {labMeta.miniQuiz.map((q, qIdx) => {
                  const selectedOpt = quizAnswers[qIdx];
                  const isAnswered = selectedOpt !== undefined;
                  const isCorrect = selectedOpt === q.correctIndex;

                  return (
                    <div
                      key={qIdx}
                      className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3.5 transition-all ${
                        isAnswered
                          ? isCorrect
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500/70'
                            : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-500/70'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-black px-2 py-0.5 rounded-md bg-blue-600/15 text-blue-700 dark:text-blue-300 border border-blue-500/30">
                            שאלה {qIdx + 1}: {q.level}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              NarrationEngine.play(`שאלה ${qIdx + 1}: ${q.question}. האפשרויות הן: ${q.options.join('. ')}`);
                            }}
                            className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-blue-600 cursor-pointer"
                            title="הקרא שאלה בקול"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-relaxed">
                          {q.question}
                        </h4>

                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const isThisSelected = selectedOpt === optIdx;
                            const isThisCorrect = optIdx === q.correctIndex;

                            let btnStyle = 'bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-800';
                            if (isThisSelected) {
                              btnStyle = isThisCorrect
                                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm'
                                : 'bg-rose-500/20 text-rose-700 dark:text-rose-200 border-rose-500/60 font-bold';
                            } else if (isAnswered && isCorrect && isThisCorrect) {
                              btnStyle = 'bg-emerald-500 text-slate-950 border-emerald-400 font-black';
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => {
                                  setQuizAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
                                  if (optIdx === q.correctIndex) {
                                    AudioEngine.playSuccess();
                                  } else {
                                    AudioEngine.playStep();
                                  }
                                }}
                                className={`w-full text-right p-2.5 rounded-xl border text-xs leading-snug transition-all cursor-pointer flex items-center justify-between gap-2 ${btnStyle}`}
                              >
                                <span>{opt}</span>
                                {isThisSelected && (
                                  <span className="shrink-0 text-xs font-black">
                                    {isThisCorrect ? '✓' : '✗'}
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
                              ? 'bg-emerald-100/80 dark:bg-emerald-950/70 border-emerald-400/50 text-emerald-950 dark:text-emerald-200'
                              : 'bg-amber-100/80 dark:bg-amber-950/70 border-amber-400/50 text-amber-950 dark:text-amber-200'
                          }`}
                        >
                          {isCorrect ? (
                            <span><strong>כל הכבוד! </strong>{q.explanation}</span>
                          ) : (
                            <span><strong>כמעט! </strong>נסו לבחור תשובה אחרת.</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Game Launchpad Card */}
          <section
            className="rounded-3xl border border-indigo-500/40 p-5 sm:p-7 shadow-xl text-white relative overflow-hidden"
            style={{
              background: 'radial-gradient(ellipse at 50% 20%, #1e1b4b 0%, #0f172a 65%, #020617 100%)'
            }}
          >
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
              <div className="space-y-2 max-w-2xl">
                <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  מוכנים למעבדת המשחק?
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  השלימו את 3 המשימות האינטראקטיביות כדי לצבור את כל הכוכבים של התחנה:
                </p>
                {data.challenges && data.challenges.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {data.challenges.map((c, i) => (
                      <span key={c.id || i} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-xl bg-slate-900/85 border border-white/15 text-slate-200 font-bold">
                        <BespokeStarBadge filled={true} size={13} />
                        <span>{i + 1}. {c.title}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => {
                  AudioEngine.playStep();
                  if (onProceedToInteractive) onProceedToInteractive();
                }}
                className="w-full md:w-auto flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-l from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 text-sm sm:text-base font-black shadow-lg border border-white/70 transition-all cursor-pointer shrink-0"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                <span>מעבר למעבדת המשחק</span>
                <ArrowLeft className="w-4 h-4" />
              </button>
            </div>
          </section>
        </div>
      )}

      {/* =====================================================================
          BOTTOM DECK NAVIGATION BAR (Step-by-Step + Instant Game Jump)
         ===================================================================== */}
      {layoutMode === 'deck' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:px-5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
          <button
            type="button"
            disabled={activeStep === 0}
            onClick={() => {
              setActiveStep(prev => Math.max(0, prev - 1));
              AudioEngine.playStep();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 disabled:opacity-35 disabled:pointer-events-none hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors"
          >
            <ArrowRight className="w-4 h-4" />
            <span>השלב הקודם</span>
          </button>

          <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400">
            <span>שלב {activeStep + 1} מתוך {LESSON_STEPS.length}</span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">•</span>
            <button
              type="button"
              onClick={() => {
                AudioEngine.playStep();
                if (onProceedToInteractive) onProceedToInteractive();
              }}
              className="hidden sm:inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 hover:underline font-black cursor-pointer"
            >
              <span>דלג ישירות למשחק ←</span>
            </button>
          </div>

          {activeStep < LESSON_STEPS.length - 1 ? (
            <button
              type="button"
              onClick={() => {
                setActiveStep(prev => Math.min(LESSON_STEPS.length - 1, prev + 1));
                AudioEngine.playStep();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-black shadow-sm cursor-pointer transition-all"
            >
              <span>השלב הבא: {LESSON_STEPS[activeStep + 1].shortLabel}</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                AudioEngine.playStep();
                if (onProceedToInteractive) onProceedToInteractive();
              }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs sm:text-sm font-black shadow-sm cursor-pointer transition-all"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>מעבר למעבדת המשחק!</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
