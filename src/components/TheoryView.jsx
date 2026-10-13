import React, { useState } from 'react';
import { 
  BookOpen, 
  Lightbulb, 
  Info, 
  ArrowLeft, 
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
  Radio,
  Play,
  Star
} from 'lucide-react';
import AudioNarrationPlayer from './AudioNarrationPlayer.jsx';
import LiteYouTubeEmbed from './LiteYouTubeEmbed.jsx';
import HebrewExplainerTour from './HebrewExplainerTour.jsx';
import PodcastPlayer from './PodcastPlayer.jsx';
import { AudioEngine } from '../core/audio.js';

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

export default function TheoryView({ 
  labData = {}, 
  animationComponent: AnimationComponent,
  animations,
  onProceedToInteractive,
  conceptData,
  mediaData
}) {
  const data = labData || {};
  const structuredConcepts = data.structuredConcepts || [];
  const conceptExplanation = data.conceptExplanation || conceptData || {};
  const media = data.media || mediaData || {};

  // 'video' (default if local explainer available) | 'podcast' | 'tour' | 'audio'
  const [activeMediaTab, setActiveMediaTab] = useState(() => (media.video?.localSrc ? 'video' : 'tour'));
  const [activeAnimIdx, setActiveAnimIdx] = useState(0);

  // Sync activeMediaTab when switching labs if new lab has local video
  React.useEffect(() => {
    if (media.video?.localSrc) {
      setActiveMediaTab('video');
    } else {
      setActiveMediaTab('tour');
    }
  }, [data.id]);

  // Normalize animations list
  const animationList = animations && animations.length > 0
    ? animations
    : AnimationComponent
      ? [{ id: 'default', label: 'הדמיית עקרון', component: AnimationComponent }]
      : [];

  const currentAnim = animationList[activeAnimIdx] || animationList[0];
  const CurrentAnimComponent = currentAnim?.component;

  return (
    <div className="space-y-8 animate-fadeIn" dir="rtl">
      
      {/* 1. Primary Media Theater Stage: Built-in Hebrew Explainer Tour & Multimedia */}
      <section 
        className="rounded-3xl border-4 border-amber-400/35 shadow-xl p-4 sm:p-6 text-white relative overflow-hidden space-y-4"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, #1e1b4b 0%, #0f172a 70%, #020617 100%)'
        }}
      >
        {/* Subtle Star Dots */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-4 left-12 w-1.5 h-1.5 bg-amber-200 rounded-full animate-ping" />
          <div className="absolute top-10 right-1/3 w-1.5 h-1.5 bg-blue-300 rounded-full animate-pulse" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border-2 border-amber-400/50 text-amber-300 flex items-center justify-center shadow-inner shrink-0">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                אולם התדריכים של זֶן • הסבר מודרך בעברית
              </h2>
              <p className="text-xs text-slate-300 hidden sm:block">
                בחרו סרטון עומק, פודקאסט מעבדה או סיור מונפש לפני הכניסה למשחק המחקר
              </p>
            </div>
          </div>

          {/* Media Mode Tabs - Tactile Segmented Controls */}
          <div className="grid grid-cols-3 sm:flex items-center bg-slate-950/80 p-1.5 rounded-2xl border border-white/15 text-xs gap-1 shadow-inner">
            {media.video && (
              <button
                type="button"
                onClick={() => { setActiveMediaTab('video'); AudioEngine.playStep(); }}
                className={`py-1.5 px-2.5 sm:px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMediaTab === 'video'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Video className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">סרטון</span>
                <span className="hidden sm:inline">{media.video.localSrc ? `סרטון הסבר (${media.video.duration || '05:59'})` : 'סרטון העשרה'}</span>
              </button>
            )}

            {media.podcast && (
              <button
                type="button"
                onClick={() => { setActiveMediaTab('podcast'); AudioEngine.playStep(); }}
                className={`py-1.5 px-2.5 sm:px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeMediaTab === 'podcast'
                    ? 'bg-indigo-500 text-white font-black shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Radio className="w-3.5 h-3.5 shrink-0" />
                <span className="sm:hidden">פודקאסט</span>
                <span className="hidden sm:inline">{`פודקאסט מעבדה (${media.podcast.duration || '05:36'})`}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => { setActiveMediaTab('tour'); AudioEngine.playStep(); }}
              className={`py-1.5 px-2.5 sm:px-3.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeMediaTab === 'tour'
                  ? 'bg-blue-600 text-white font-black shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="sm:hidden">סיור</span>
              <span className="hidden sm:inline">סיור מונפש בעברית</span>
            </button>

            {media.narration && (
              <button
                type="button"
                onClick={() => { setActiveMediaTab('audio'); AudioEngine.playStep(); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeMediaTab === 'audio'
                    ? 'bg-blue-600 text-white font-black shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>קריינות קולית</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content Display inside Theater Frame */}
        <div className="relative z-10">
          {activeMediaTab === 'video' && media.video && (
            <div className="bg-slate-950/85 border-2 border-white/15 rounded-2xl p-3 sm:p-5 shadow-inner space-y-3">
              {!media.video.localSrc && (
                <div className="text-xs font-semibold text-amber-200 bg-amber-500/15 border border-amber-400/30 p-2.5 rounded-xl">
                  שימו לב: סרטון זה הוא סרטון העשרה מדעי באנגלית. מומלץ להתחיל בסיור המונפש בעברית למעלה!
                </div>
              )}
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
            <div className="bg-slate-950/85 border-2 border-white/15 rounded-2xl p-4 sm:p-6 shadow-inner text-slate-900 dark:text-white">
              <PodcastPlayer podcastData={media.podcast} />
            </div>
          )}

          {activeMediaTab === 'tour' && (
            <div className="text-slate-900 dark:text-white">
              <HebrewExplainerTour labData={data} />
            </div>
          )}

          {activeMediaTab === 'audio' && media.narration && (
            <div className="bg-slate-950/85 border-2 border-white/15 rounded-2xl p-6 shadow-inner text-slate-900 dark:text-white">
              <AudioNarrationPlayer narrationData={media.narration} />
            </div>
          )}
        </div>
      </section>

      {/* 2. Interactive SVG Principle Animation */}
      {CurrentAnimComponent && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_8px_#3b82f6]" />
                <span>הדמיה אינטראקטיבית של עקרון היסוד</span>
              </h2>
              {data.svgAnimation?.subtitle && (
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                  {data.svgAnimation.subtitle}
                </p>
              )}
            </div>

            {/* Animation Sub-tabs when multiple are available */}
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
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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

          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-md overflow-hidden">
            {React.isValidElement(CurrentAnimComponent) ? CurrentAnimComponent : <CurrentAnimComponent />}
          </div>
        </section>
      )}

      {/* 3. Structured Concept Cards (Tactile Zen 2.0 Ludic Cards) */}
      {structuredConcepts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
              <span>כרטיסי מושגי יסוד שכל חוקר/ת צריך להכיר</span>
            </h2>
            <span className="text-xs sm:text-sm text-amber-900 dark:text-amber-300 font-black bg-amber-100 dark:bg-amber-950/70 border border-amber-300/60 dark:border-amber-700/60 px-3 py-1 rounded-xl">
              {structuredConcepts.length} מושגי מפתח
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {structuredConcepts.map((concept, idx) => {
              const IconComponent = ICON_MAP[concept.icon] || Lightbulb;

              return (
                <div
                  key={concept.id || idx}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-amber-400/80 dark:hover:border-amber-400/60 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-slate-900 dark:bg-slate-800 border border-amber-400/40 text-amber-400 flex items-center justify-center font-bold shadow-sm shrink-0">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {concept.title}
                        </h3>
                      </div>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 shrink-0">
                        {concept.badge}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      {concept.description}
                    </p>
                  </div>

                  {concept.highlight && (
                    <div className="p-3.5 rounded-xl bg-amber-50/90 dark:bg-slate-950 border border-amber-300/70 dark:border-amber-500/30 text-xs sm:text-sm font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2.5 shadow-inner">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{concept.highlight}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Real-world Analogy & Key Points Summary */}
      {conceptExplanation.summary && (
        <section className="bg-gradient-to-r from-blue-50/70 via-white to-amber-50/60 dark:from-slate-900 dark:to-slate-900 border-2 border-blue-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              תמצית הרעיון ואנלוגיה מחיי היומיום
            </h3>
          </div>

          <p className="text-base sm:text-lg text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {conceptExplanation.summary}
          </p>

          {conceptExplanation.realWorldAnalogy && (
            <div className="p-5 rounded-xl bg-white dark:bg-slate-950 border-2 border-amber-200/80 dark:border-slate-800 space-y-2 shadow-inner">
              <div className="text-xs sm:text-sm font-extrabold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>דוגמה מעולמם של ילדים:</span>
              </div>
              <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                {conceptExplanation.realWorldAnalogy}
              </p>
            </div>
          )}

          {conceptExplanation.keyPoints && (
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 space-y-2">
              <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-300 mb-2">
                נקודות מפתח שחשוב לזכור:
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {conceptExplanation.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* 5. Scientific Glossary */}
      {data.glossary && data.glossary.length > 0 && (
        <section className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
              מילון מושגים קצר וברור
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {data.glossary.map((item, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400 block mb-1">
                  {item.term}
                </span>
                <span className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed block font-normal">
                  {item.definition}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Engaging Interactive Mission Launchpad Card */}
      <section 
        className="rounded-3xl border-4 border-amber-400/50 p-6 sm:p-8 shadow-2xl text-white relative overflow-hidden"
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, #1e1b4b 0%, #0f172a 65%, #020617 100%)'
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-400/20 text-amber-300 border border-amber-400/40">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>מוכנים לשחק ולחקור?</span>
              </span>
              {data.challenges && data.challenges.length > 0 && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-slate-900/90 text-amber-300 border border-white/15">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{data.challenges.length} כוכבי מחקר מחכים לכם</span>
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              סיימתם את התדריך? עוברים למשחק המחקר המעשי!
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              שחקו עם המערכת של זֶן בזמן אמת, גלו איך האלגוריתם עובד בעצמכם וצברו את 3 הכוכבים של התחנה!
            </p>

            {data.challenges && data.challenges.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {data.challenges.map((c, i) => (
                  <span key={c.id || i} className="text-xs px-3 py-1 rounded-xl bg-slate-900/85 border border-white/15 text-slate-200 font-bold">
                    ⭐ אתגר {i + 1}: {c.title}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="shrink-0 flex items-center">
            <button
              type="button"
              onClick={() => {
                AudioEngine.playStep();
                if (onProceedToInteractive) {
                  onProceedToInteractive();
                }
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-l from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 text-slate-950 text-base sm:text-lg font-black shadow-[0_0_25px_rgba(251,191,36,0.4)] border-2 border-white/80 hover:scale-[1.03] active:scale-[0.98] transition-all cursor-pointer group"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>המשך למעבדה המעשית</span>
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
