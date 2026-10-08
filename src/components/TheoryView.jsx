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
  HelpCircle
} from 'lucide-react';
import AudioNarrationPlayer from './AudioNarrationPlayer.jsx';
import LiteYouTubeEmbed from './LiteYouTubeEmbed.jsx';

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
  RefreshCw
};

export default function TheoryView({ 
  labData, 
  animationComponent: AnimationComponent,
  onProceedToInteractive 
}) {
  const [activeMediaTab, setActiveMediaTab] = useState('both'); // 'both' | 'audio' | 'video'

  const structuredConcepts = labData.structuredConcepts || [];
  const conceptExplanation = labData.conceptExplanation || {};
  const media = labData.media || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* 1. Interactive SVG Principle Animation */}
      {AnimationComponent && (
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>הדמיה אינטראקטיבית של עקרון היסוד</span>
              </h2>
              {labData.svgAnimation?.subtitle && (
                <p className="text-xs text-slate-400 mt-0.5">{labData.svgAnimation.subtitle}</p>
              )}
            </div>
          </div>

          <AnimationComponent />
        </section>
      )}

      {/* 2. Media Slot: Audio Narration & Sandboxed Video */}
      {(media.narration || media.video) && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>ערוצי מדיה והסבר קולי</span>
            </h2>

            <div className="flex items-center bg-slate-900 p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setActiveMediaTab('both')}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                  activeMediaTab === 'both' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                הכל
              </button>
              {media.narration && (
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('audio')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeMediaTab === 'audio' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  הקראה בלבד
                </button>
              )}
              {media.video && (
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('video')}
                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                    activeMediaTab === 'video' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  וידאו בלבד
                </button>
              )}
            </div>
          </div>

          <div className={`grid gap-5 ${
            activeMediaTab === 'both' && media.video && media.narration
              ? 'grid-cols-1 lg:grid-cols-12'
              : 'grid-cols-1'
          }`}>
            {/* Audio Narration Player */}
            {(activeMediaTab === 'both' || activeMediaTab === 'audio') && media.narration && (
              <div className={activeMediaTab === 'both' && media.video ? 'lg:col-span-6' : 'w-full'}>
                <AudioNarrationPlayer narrationData={media.narration} />
              </div>
            )}

            {/* Sandboxed YouTube Player */}
            {(activeMediaTab === 'both' || activeMediaTab === 'video') && media.video && (
              <div className={activeMediaTab === 'both' && media.narration ? 'lg:col-span-6' : 'w-full'}>
                <LiteYouTubeEmbed
                  videoId={media.video.videoId}
                  title={media.video.title}
                  channel={media.video.channel}
                  duration={media.video.duration}
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* 3. Structured Concept Cards */}
      {structuredConcepts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500" />
              <span>כרטיסי מושגי יסוד ומנגנון פעולה</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">{structuredConcepts.length} כרטיסים</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {structuredConcepts.map((concept) => {
              const IconComponent = ICON_MAP[concept.icon] || Lightbulb;

              return (
                <div
                  key={concept.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-3 hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400">
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-sm font-bold text-white">{concept.title}</h3>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-950 text-slate-400 border border-slate-800">
                        {concept.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {concept.description}
                    </p>
                  </div>

                  {concept.highlight && (
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-blue-300">
                      &bull; {concept.highlight}
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
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">תמצית הרעיון המדעי ואנלוגיה מעשית</h3>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {conceptExplanation.summary}
          </p>

          {conceptExplanation.keyPoints && (
            <ul className="space-y-2 pt-2 border-t border-slate-800">
              {conceptExplanation.keyPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}

          {conceptExplanation.realWorldAnalogy && (
            <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
              <div className="text-[11px] font-semibold text-slate-400">אנלוגיה מהעולם הממשי:</div>
              <p className="text-xs text-slate-300 leading-relaxed">{conceptExplanation.realWorldAnalogy}</p>
            </div>
          )}
        </section>
      )}

      {/* 5. Scientific Glossary */}
      {labData.glossary && labData.glossary.length > 0 && (
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white">מילון מונחים מקצועי</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {labData.glossary.map((item, idx) => (
              <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800/80">
                <span className="text-xs font-bold text-blue-400 block mb-1">{item.term}</span>
                <span className="text-xs text-slate-300 leading-relaxed block">{item.definition}</span>
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
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all group"
        >
          <span>הבנתי את הרקע התיאורטי &ndash; מעבר להתנסות במעבדה האינטראקטיבית</span>
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
