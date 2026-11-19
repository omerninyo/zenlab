import React, { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { NarrationEngine } from '../core/narration.js';

const SIZE_MAP = {
  sm: 'w-20 h-20',
  md: 'w-28 h-28',
  lg: 'w-36 h-36'
};

export default function ZenMascot({
  pose = 'wave',
  message = null,
  audioSrc = null,
  spokenFallback = '',
  size = 'md',
  priority = false,
  className = ''
}) {
  const [narrationState, setNarrationState] = useState(() => NarrationEngine.getState());

  useEffect(() => {
    return NarrationEngine.subscribe(setNarrationState);
  }, []);

  const validPose = ['wave', 'teach', 'think', 'cheer'].includes(pose) ? pose : 'wave';
  const sizeClass = SIZE_MAP[size] || SIZE_MAP.md;

  const textToSpeak = spokenFallback || message || '';
  const hasAudio = Boolean(audioSrc || textToSpeak);
  const isThisPlaying =
    Boolean(narrationState.isPlaying) &&
    Boolean(textToSpeak) &&
    narrationState.currentText === textToSpeak;

  const handleToggleAudio = () => {
    if (isThisPlaying || narrationState.isPlaying) {
      NarrationEngine.stop();
      if (isThisPlaying) return;
    }
    NarrationEngine.play(textToSpeak, audioSrc || '');
  };

  return (
    <div
      className={`flex items-center gap-3 sm:gap-4 ${className}`}
      dir="rtl"
    >
      {/* Flat 2D Storybook Character Illustration */}
      <div className={`${sizeClass} shrink-0 flex items-center justify-center`}>
        <img
          src={`/illustrations/zen_${validPose}.png`}
          alt="זֶן"
          width={512}
          height={512}
          {...(priority ? { fetchpriority: 'high' } : {})}
          className="w-full h-full object-contain select-none"
          draggable={false}
        />
      </div>

      {/* Crisp Duolingo Speech Bubble */}
      {message && (
        <div className="relative flex-1 bg-white border-2 border-[#E5E5E5] rounded-2xl px-4 py-3 text-sm sm:text-base font-bold text-[#3C3C3C] leading-relaxed flex items-center justify-between gap-3">
          {/* Speech Bubble Tail pointing toward Zen on the right (RTL) */}
          <span
            aria-hidden="true"
            className="absolute -right-[9px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-t-2 border-r-2 border-[#E5E5E5] rotate-45"
          />
          <span className="relative z-10">{message}</span>

          {hasAudio && (
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`relative z-10 w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white border-2 cursor-pointer transition-transform active:translate-y-[3px] ${
                isThisPlaying
                  ? 'bg-[#FF4B4B] border-[#FF4B4B]'
                  : 'bg-[#1CB0F6] hover:bg-[#38BDF8] border-[#1CB0F6]'
              }`}
              style={{
                boxShadow: isThisPlaying ? '0 3px 0 #EA2B2B' : '0 3px 0 #1899D6'
              }}
              aria-label={isThisPlaying ? 'עצור הקראה' : 'השמעת הסבר בקול'}
              title={isThisPlaying ? 'עצירה' : 'שמעו את ההסבר'}
            >
              {isThisPlaying ? (
                <Square className="w-4 h-4 fill-current" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
