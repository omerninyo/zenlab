import React, { useState, useRef, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Headphones, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Gauge,
  Radio
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export default function PodcastPlayer({ podcastData }) {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(336); // default ~5:36
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [podcastData?.audioSrc]);

  if (!podcastData) return null;

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(err => {
        console.warn('Playback error:', err);
      });
    }
    AudioEngine.playStep();
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio.play();
    setIsPlaying(true);
    AudioEngine.playStep();
  };

  const cyclePlaybackRate = () => {
    const rates = [1.0, 1.25, 1.5];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
    AudioEngine.playStep();
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 border-2 border-indigo-700/60 rounded-2xl p-5 sm:p-6 text-white shadow-lg space-y-4">
      {/* Hidden HTML5 Audio Element */}
      <audio 
        ref={audioRef} 
        src={podcastData.audioSrc} 
        preload="metadata" 
      />

      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner transition-transform ${
            isPlaying ? 'bg-indigo-500 scale-105 animate-pulse' : 'bg-indigo-950 border border-indigo-700/50'
          }`}>
            <Radio className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                {podcastData.channel || 'NotebookLM Audio Deep Dive'}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {podcastData.duration || formatTime(duration)}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight mt-0.5">
              {podcastData.title || 'פודקאסט לימודי מעמיק'}
            </h3>
          </div>
        </div>

        {/* Animated Waveform Visualizer */}
        <div className="flex items-end gap-1 h-6 self-end sm:self-center px-3 py-1 bg-slate-950/60 rounded-xl border border-slate-800">
          {[40, 75, 55, 90, 60, 80, 45, 95, 70, 50, 85, 65].map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-150 ${
                isPlaying ? 'bg-indigo-400' : 'bg-slate-700'
              }`}
              style={{
                height: isPlaying ? `${Math.max(15, (h * (0.6 + Math.sin((currentTime * 5) + i) * 0.4)))}%` : '20%'
              }}
            />
          ))}
        </div>
      </div>

      {podcastData.description && (
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
          {podcastData.description}
        </p>
      )}

      {/* Progress Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="relative w-full h-3 bg-slate-800 rounded-full overflow-hidden cursor-pointer group">
          <div 
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all"
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            min={0}
            max={duration || 100}
            step={0.5}
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            aria-label="ציר זמן פודקאסט"
          />
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-slate-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls Bar */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {/* Main Play/Pause Button */}
          <button
            type="button"
            onClick={togglePlay}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all scale-100 hover:scale-105"
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4" />
                <span>השהה פודקאסט</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>השמע פודקאסט</span>
              </>
            )}
          </button>

          {/* Restart Button */}
          <button
            type="button"
            onClick={handleRestart}
            title="חזור לתחילת הפודקאסט"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <button
            type="button"
            onClick={cyclePlaybackRate}
            title="שינוי מהירות השמעה"
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono font-bold flex items-center gap-1 transition-colors"
          >
            <Gauge className="w-3.5 h-3.5 text-indigo-400" />
            <span>{playbackRate}x</span>
          </button>

          {/* Mute Toggle */}
          <button
            type="button"
            onClick={toggleMute}
            title={isMuted ? 'בטל השתקה' : 'השתק'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
