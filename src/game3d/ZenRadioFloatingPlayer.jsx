import React, { useState, useRef, useEffect } from 'react';
import {
  Radio,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  X,
  ChevronRight,
  ChevronLeft,
  Gauge
} from 'lucide-react';
import { useZenGameStore } from './useZenGameStore.js';
import { LAB_METADATA } from '../core/labMeta.js';
import { AudioEngine } from '../core/audio.js';

function formatTime(seconds) {
  if (Number.isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

const ALL_LAB_IDS = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5', 'lab6', 'lab7', 'lab8'];

export default function ZenRadioFloatingPlayer() {
  const store = useZenGameStore();
  const { podcastRadio, curriculum, isMuted } = store;
  const audioRef = useRef(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(336);
  const [playbackRate, setPlaybackRate] = useState(1.15);

  const selectedLabId = podcastRadio?.labId || 'lab1';
  const labData = curriculum?.labs?.[selectedLabId] || curriculum?.labs?.lab1;
  const labMeta = LAB_METADATA[selectedLabId] || LAB_METADATA.lab1;
  const podcastData = labData?.media?.podcast || {
    audioSrc: `/audio/explainers/${selectedLabId}_podcast.m4a`,
    title: `פודקאסט תחנה ${labMeta.number}: ${labMeta.title}`,
    duration: '05:36 דקות'
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = Boolean(isMuted);
  }, [isMuted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if ('preservesPitch' in audio) {
      audio.preservesPitch = true;
    } else if ('webkitPreservesPitch' in audio) {
      audio.webkitPreservesPitch = true;
    }
    audio.playbackRate = playbackRate;

    const onLoadedMetadata = () => {
      if (audio.duration && !Number.isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
      audio.playbackRate = playbackRate;
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const onEnded = () => {
      setCurrentTime(0);
      store.setPodcastRadio({ isPlaying: false });
    };

    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, [podcastData.audioSrc, playbackRate]);

  const handleTogglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (podcastRadio.isPlaying) {
      audio.pause();
      store.setPodcastRadio({ isPlaying: false });
    } else {
      audio
        .play()
        .then(() => {
          store.setPodcastRadio({ isPlaying: true });
        })
        .catch(() => {
          store.setPodcastRadio({ isPlaying: false });
        });
    }
    AudioEngine.playStep();
  };

  const handleSelectStationPodcast = (labId) => {
    const wasPlaying = podcastRadio.isPlaying;
    store.setPodcastRadio({ labId, isPlaying: false });
    setCurrentTime(0);
    AudioEngine.playStep();

    if (wasPlaying) {
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current
            .play()
            .then(() => {
              store.setPodcastRadio({ isPlaying: true });
            })
            .catch(() => {});
        }
      }, 80);
    }
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio) return;
    const nextTime = parseFloat(e.target.value);
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handleRestart = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    setCurrentTime(0);
    audio
      .play()
      .then(() => {
        store.setPodcastRadio({ isPlaying: true });
      })
      .catch(() => {});
    AudioEngine.playStep();
  };

  const cycleRate = () => {
    const rates = [1.0, 1.15, 1.3];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
    AudioEngine.playStep();
  };

  const progressPercent = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <>
      {/* Persistent HTML5 Audio element so playback continues smoothly across 3D Overworld & Stations */}
      <audio ref={audioRef} src={podcastData.audioSrc} preload="metadata" />

      {podcastRadio.isOpen && (
        <aside
          dir="rtl"
          aria-label="רדיו זֶן - נגן פודקאסטים"
          className="fixed top-16 left-3 z-40 w-80 sm:w-96 bg-slate-950/90 backdrop-blur-2xl border border-indigo-400/40 rounded-2xl p-3.5 shadow-[0_12px_40px_rgba(2,6,23,0.85)] text-white space-y-3 pointer-events-auto animate-fadeIn select-none"
        >
          {/* Top Header */}
          <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center border ${
                  podcastRadio.isPlaying
                    ? 'bg-indigo-600 border-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.6)]'
                    : 'bg-slate-900 border-white/15'
                }`}
              >
                <Radio className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black text-white">📻 רדיו זֶן 3D</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/25 text-indigo-200 border border-indigo-400/30">
                    פודקאסטים בדרכים
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  האזינו לשיחות עומק בזמן ניווט בעולם התלת-ממדי
                </p>
              </div>
            </div>

            {/* Equalizer + Close Button */}
            <div className="flex items-center gap-2">
              <div className="flex items-end gap-0.5 h-4 px-1.5 py-0.5 bg-slate-900 rounded-md border border-white/10">
                {[45, 85, 60, 95, 50, 75].map((h, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-150 ${
                      podcastRadio.isPlaying ? 'bg-amber-400' : 'bg-slate-700'
                    }`}
                    style={{
                      height: podcastRadio.isPlaying
                        ? `${Math.max(20, h * (0.6 + Math.sin(currentTime * 6 + i) * 0.4))}%`
                        : '25%'
                    }}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => store.setPodcastRadio({ isOpen: false })}
                className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-slate-800 border border-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer text-xs"
                title="מזער נגן (השמע ימשיך להתנגן ברקע)"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 8 Station Episode Selector Grid */}
          <div className="grid grid-cols-4 gap-1">
            {ALL_LAB_IDS.map(id => {
              const meta = LAB_METADATA[id];
              const isSelected = selectedLabId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectStationPodcast(id)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-black border truncate transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white border-amber-300 shadow-xs'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-white/10'
                  }`}
                  title={`תחנה ${meta.number}: ${meta.title}`}
                >
                  {meta.number}. {meta.shortLabel}
                </button>
              );
            })}
          </div>

          {/* Active Episode Title */}
          <div className="bg-slate-900/90 border border-white/10 rounded-xl p-2.5 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-indigo-300 font-bold">
              <span>תחנה {labMeta.number} • {labMeta.chapterBadge}</span>
              <span className="font-mono text-amber-300">{podcastData.duration || formatTime(duration)}</span>
            </div>
            <div className="text-xs font-black text-white leading-snug line-clamp-2">
              {podcastData.title}
            </div>
          </div>

          {/* Seek Bar */}
          <div className="space-y-1">
            <div className="relative w-full h-2.5 bg-slate-800 rounded-full overflow-hidden cursor-pointer">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-400 to-indigo-500 rounded-full"
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
                aria-label="ציר זמן רדיו זן"
              />
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleTogglePlay}
              className={`flex-1 py-2 px-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                podcastRadio.isPlaying
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {podcastRadio.isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5 fill-current" />
                  <span>השהה שידור</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>נגן פודקאסט</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={cycleRate}
              className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-[11px] font-mono font-black text-amber-300 flex items-center gap-1 cursor-pointer"
              title="מהירות השמעה"
            >
              <Gauge className="w-3.5 h-3.5" />
              <span>{playbackRate}x</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/15 text-slate-300 hover:text-white cursor-pointer"
              title="התחל פרק מחדש"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      )}
    </>
  );
}
