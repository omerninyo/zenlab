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
  Volume2
} from 'lucide-react';
import AudioNarrationPlayer from './AudioNarrationPlayer.jsx';
import LiteYouTubeEmbed from './LiteYouTubeEmbed.jsx';
import HebrewExplainerTour from './HebrewExplainerTour.jsx';
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
  // 'tour' (default primary) | 'audio' | 'video'
  const [activeMediaTab, setActiveMediaTab] = useState('tour');
  const [activeAnimIdx, setActiveAnimIdx] = useState(0);

  // Normalize animations list
  const animationList = animations && animations.length > 0
    ? animations
    : AnimationComponent
      ? [{ id: 'default', label: 'הדמיית עקרון', component: AnimationComponent }]
      : [];

  const currentAnim = animationList[activeAnimIdx] || animationList[0];
  const CurrentAnimComponent = currentAnim?.component;

  const data = labData || {};
  const structuredConcepts = data.structuredConcepts || [];
  const conceptExplanation = data.conceptExplanation || conceptData || {};
  const media = data.media || mediaData || {};

  return (
    <div className="space-y-8 animate-fadeIn" dir="rtl">
      {/* 1. Primary Media Slot: Built-in Hebrew Explainer Tour */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
              <Tv className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                הסבר מודרך בעברית לילדים
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                למדו את הרעיון המרכזי באמצעות סיור מונפש בעברית עם קריינות ידידותית
              </p>
            </div>
          </div>

          {/* Media Mode Tabs */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => { setActiveMediaTab('tour'); AudioEngine.playStep(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMediaTab === 'tour'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>סיור מונפש בעברית</span>
            </button>

            {media.narration && (
              <button
                type="button"
                onClick={() => { setActiveMediaTab('audio'); AudioEngine.playStep(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMediaTab === 'audio'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>קריינות קולית</span>
              </button>
            )}

            {media.video && (
              <button
                type="button"
                onClick={() => { setActiveMediaTab('video'); AudioEngine.playStep(); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeMediaTab === 'video'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>סרטון העשרה</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content Display */}
        {activeMediaTab === 'tour' && (
          <HebrewExplainerTour labData={data} />
        )}

        {activeMediaTab === 'audio' && media.narration && (
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
            <AudioNarrationPlayer narrationData={media.narration} />
          </div>
        )}

        {activeMediaTab === 'video' && media.video && (
          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3">
            {!media.video.localSrc && (
              <div className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                שים לב: סרטון זה הוא סרטון העשרה מדעי באנגלית. מומלץ להתחיל בסיור המונפש בעברית למעלה!
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
      </section>

      {/* 2. Interactive SVG Principle Animation */}
      {CurrentAnimComponent && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
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
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
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

          <div className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-2xl p-4 sm:p-6 shadow-sm overflow-hidden">
            {React.isValidElement(CurrentAnimComponent) ? CurrentAnimComponent : <CurrentAnimComponent />}
          </div>
        </section>
      )}

      {/* 3. Structured Concept Cards (Large, Inviting, Child-Friendly) */}
      {structuredConcepts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-indigo-500" />
              <span>כרטיסי מושגי יסוד שכל ילד צריך להכיר</span>
            </h2>
            <span className="text-xs sm:text-sm text-slate-500 font-bold bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
              {structuredConcepts.length} מושגי מפתח
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {structuredConcepts.map((concept) => {
              const IconComponent = ICON_MAP[concept.icon] || Lightbulb;

              return (
                <div
                  key={concept.id}
                  className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 flex flex-col justify-between space-y-4 shadow-sm hover:border-blue-400/80 hover:shadow-md transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-400 flex items-center justify-center font-bold shadow-sm">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                          {concept.title}
                        </h3>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
                        {concept.badge}
                      </span>
                    </div>

                    <p className="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                      {concept.description}
                    </p>
                  </div>

                  {concept.highlight && (
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-slate-950 border border-amber-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-amber-900 dark:text-blue-300 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-600 shrink-0" />
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
            <Info className="w-5 h-5 text-blue-600" />
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
            <BookOpen className="w-5 h-5 text-blue-600" />
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

      {/* 6. Call to Action: Proceed to Interactive View */}
      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={onProceedToInteractive}
          className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-extrabold shadow-md hover:shadow-lg transition-all group"
        >
          <span>הבנתי את הרעיון &ndash; קדימה, למעבדה האינטראקטיבית!</span>
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
