import React, { useState, useEffect, useRef } from 'react';
import { X, Video, Headphones, Play, Pause } from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { NarrationEngine } from '../core/narration.js';

const SPEED_OPTIONS = [1.0, 1.15, 1.3];

export default function MediaDrawerModal({ isOpen, onClose, labData }) {
  const [activeTab, setActiveTab] = useState('video'); // 'video' | 'podcast'
  const [playbackRate, setPlaybackRate] = useState(1.15);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const videoRef = useRef(null);
  const audioRef = useRef(null);

  const media = labData?.media || {};
  const videoSrc = media.video?.localSrc || '';
  const podcastSrc = media.podcast?.audioSrc || '';

  useEffect(() => {
    if (isOpen) {
      NarrationEngine.stop?.();
      setActiveTab(videoSrc ? 'video' : 'podcast');
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        setIsAudioPlaying(false);
      }
    }
  }, [isOpen, videoSrc]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
      if ('preservesPitch' in audioRef.current) {
        audioRef.current.preservesPitch = true;
      }
    }
  }, [playbackRate]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (videoRef.current) videoRef.current.pause();
    if (audioRef.current) audioRef.current.pause();
    setIsAudioPlaying(false);
    AudioEngine.playStep();
    onClose?.();
  };

  const handleSwitchTab = (tab) => {
    if (tab === activeTab) return;
    if (videoRef.current) videoRef.current.pause();
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
    setActiveTab(tab);
    AudioEngine.playStep();
  };

  const togglePodcastPlay = () => {
    if (!audioRef.current) return;
    if (isAudioPlaying) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    } else {
      audioRef.current.playbackRate = playbackRate;
      audioRef.current.play().catch(() => {});
      setIsAudioPlaying(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45"
      role="dialog"
      aria-modal="true"
      aria-labelledby="media-drawer-title"
      onClick={handleClose}
    >
      <div
        className="bg-white border-2 border-[#E5E5E5] rounded-3xl max-w-2xl w-full p-5 sm:p-6 space-y-5 text-[#3C3C3C] max-h-[90vh] overflow-y-auto"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b-2 border-[#E5E5E5] pb-4">
          <div>
            <h2 id="media-drawer-title" className="text-lg font-extrabold text-[#3C3C3C]">
              סרטון ופודקאסט: {labData?.title || 'ציור בפיקסלים וביטים'}
            </h2>
            <p className="text-sm text-[#777777] font-medium">
              הסבר מצולם ושיחת אודיו בעברית להבנת הנושא
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="w-10 h-10 rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] flex items-center justify-center text-[#777777] hover:text-[#3C3C3C] cursor-pointer shrink-0"
            aria-label="סגירה"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clean 2-tab switcher */}
        <div className="grid grid-cols-2 gap-3">
          {videoSrc && (
            <button
              type="button"
              onClick={() => handleSwitchTab('video')}
              className={`py-3 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-sm cursor-pointer transition-colors ${
                activeTab === 'video'
                  ? 'bg-[#DDF4FF] border-[#84D8FF] text-[#1899D6]'
                  : 'bg-white border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#F7F7F7]'
              }`}
            >
              <Video className="w-4 h-4 shrink-0" />
              <span>סרטון הסבר ({media.video?.duration || 'וידאו'})</span>
            </button>
          )}
          {podcastSrc && (
            <button
              type="button"
              onClick={() => handleSwitchTab('podcast')}
              className={`py-3 px-4 rounded-2xl border-2 flex items-center justify-center gap-2 font-bold text-sm cursor-pointer transition-colors ${
                activeTab === 'podcast'
                  ? 'bg-[#DDF4FF] border-[#84D8FF] text-[#1899D6]'
                  : 'bg-white border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#F7F7F7]'
              }`}
            >
              <Headphones className="w-4 h-4 shrink-0" />
              <span>פודקאסט ({media.podcast?.duration || 'אודיו'})</span>
            </button>
          )}
        </div>

        {/* Active Media Body */}
        {activeTab === 'video' && videoSrc && (
          <div className="space-y-3">
            <div className="rounded-2xl overflow-hidden border-2 border-[#E5E5E5] bg-black">
              <video
                ref={videoRef}
                src={videoSrc}
                controls
                preload="metadata"
                className="w-full aspect-video"
              />
            </div>
            {media.video?.title && (
              <p className="text-sm font-bold text-[#4B4B4B]">{media.video.title}</p>
            )}
          </div>
        )}

        {activeTab === 'podcast' && podcastSrc && (
          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-2xl p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-[#3C3C3C]">
                {media.podcast?.title || 'פודקאסט המעבדה'}
              </h3>
              {media.podcast?.description && (
                <p className="text-sm text-[#777777] leading-relaxed">
                  {media.podcast.description}
                </p>
              )}
            </div>

            <audio
              ref={audioRef}
              src={podcastSrc}
              controls
              preload="metadata"
              onPlay={() => setIsAudioPlaying(true)}
              onPause={() => setIsAudioPlaying(false)}
              onEnded={() => setIsAudioPlaying(false)}
              className="w-full"
            />

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={togglePodcastPlay}
                className="btn-duo-blue px-5 py-2.5 text-sm"
              >
                {isAudioPlaying ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>עצירה</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>האזנה עכשיו</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#777777] ml-1">מהירות:</span>
                {SPEED_OPTIONS.map((rate) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => {
                      setPlaybackRate(rate);
                      AudioEngine.playStep();
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 cursor-pointer transition-colors ${
                      playbackRate === rate
                        ? 'bg-[#DDF4FF] border-[#84D8FF] text-[#1899D6]'
                        : 'bg-white border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#F7F7F7]'
                    }`}
                  >
                    {rate}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
