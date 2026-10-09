import React, { useState } from 'react';
import { Play, Video, ExternalLink } from 'lucide-react';

export default function LiteYouTubeEmbed({ videoId, title, channel, duration, localSrc }) {
  const [isActivated, setIsActivated] = useState(false);

  if (!videoId && !localSrc) return null;

  if (localSrc) {
    return (
      <div className="flex flex-col rounded-xl overflow-hidden bg-slate-950 border-2 border-slate-800 shadow-xl">
        {/* Top Video Header */}
        <div className="px-4 py-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Video className="w-4 h-4" />
            </span>
            <div className="text-right">
              <h4 className="text-xs sm:text-sm font-bold text-white leading-tight">{title}</h4>
              <p className="text-[10px] sm:text-xs text-blue-400 font-semibold">{channel || 'NotebookLM Video Explainer'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-lg bg-blue-950/80 border border-blue-800 text-[10px] text-blue-300 font-semibold hidden sm:inline">
              סרטון מקומי בעברית
            </span>
            {duration && (
              <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-[11px] font-mono font-bold text-slate-300">
                {duration}
              </span>
            )}
          </div>
        </div>

        {/* Video Player Frame */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center">
          <video 
            controls 
            playsInline 
            src={localSrc} 
            className="w-full h-full object-contain"
          >
            הדפדפן אינו תומך בניגון וידאו זה.
          </video>
        </div>
      </div>
    );
  }

  const handleActivate = () => {
    setIsActivated(true);
  };

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-md group">
      {!isActivated ? (
        <div 
          onClick={handleActivate}
          className="relative w-full h-full cursor-pointer flex flex-col justify-between p-4 bg-gradient-to-t from-slate-950 via-slate-950/70 to-slate-900 select-none"
        >
          {/* Top Video Information */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded bg-red-600/90 flex items-center justify-center text-white shrink-0">
                <Video className="w-3.5 h-3.5" />
              </span>
              <div className="text-right">
                <h4 className="text-xs font-semibold text-white leading-tight">{title}</h4>
                {channel && <p className="text-[10px] text-slate-400">{channel}</p>}
              </div>
            </div>

            {duration && (
              <span className="px-2 py-0.5 rounded bg-slate-900/90 border border-slate-700 text-[10px] font-mono text-slate-300">
                {duration}
              </span>
            )}
          </div>

          {/* Central Play Trigger Button */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-14 h-14 rounded-full bg-blue-600/90 group-hover:bg-blue-500 group-hover:scale-105 text-white flex items-center justify-center shadow-lg transition-all border border-blue-400/40">
              <Play className="w-6 h-6 fill-white ml-0.5" />
            </div>
          </div>

          {/* Bottom Security / Privacy Notice */}
          <div className="flex items-center justify-between text-[10px] text-slate-500 z-10 border-t border-slate-800/60 pt-2">
            <span>לחצו לצפייה בסרטון המדעי המוטמע</span>
            <span className="font-mono text-slate-600">Sandboxed YouTube</span>
          </div>
        </div>
      ) : (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={title || 'Educational Video'}
          sandbox="allow-scripts allow-same-origin allow-presentation"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full border-0"
        />
      )}
    </div>
  );
}
