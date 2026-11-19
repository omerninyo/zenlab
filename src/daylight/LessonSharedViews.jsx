import React, { useState, useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { NarrationEngine } from '../core/narration.js';
import ZenMascot from './ZenMascot.jsx';

export function AudioHintButton({ text, audioSrc }) {
  const [narrationState, setNarrationState] = useState(() => NarrationEngine.getState());

  useEffect(() => {
    return NarrationEngine.subscribe(setNarrationState);
  }, []);

  const isPlaying =
    Boolean(narrationState.isPlaying) && narrationState.currentText === text;

  const handleToggle = () => {
    if (isPlaying || narrationState.isPlaying) {
      NarrationEngine.stop();
      if (isPlaying) return;
    }
    NarrationEngine.play(text, audioSrc || '');
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white border-2 cursor-pointer transition-transform active:translate-y-[3px] ${
        isPlaying
          ? 'bg-[#FF4B4B] border-[#FF4B4B]'
          : 'bg-[#1CB0F6] hover:bg-[#38BDF8] border-[#1CB0F6]'
      }`}
      style={{
        boxShadow: isPlaying ? '0 3px 0 #EA2B2B' : '0 3px 0 #1899D6'
      }}
      aria-label={isPlaying ? 'עצירת הקראה' : 'השמעת הסבר בקול'}
      title="שמעו הסבר בקול"
    >
      {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-5 h-5" />}
    </button>
  );
}

export function QuizStepView({
  quizItem,
  selectedChoiceIdx,
  onSelectChoice,
  badgeText = 'חידת הבנה מהירה'
}) {
  useEffect(() => {
    if (!quizItem?.options) return undefined;
    const handleKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const num = Number(e.key);
      if (num >= 1 && num <= quizItem.options.length) {
        onSelectChoice(num - 1);
        AudioEngine.playStep();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [quizItem, onSelectChoice]);

  if (!quizItem) return null;

  return (
    <div className="max-w-lg mx-auto w-full space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="inline-block text-xs font-extrabold text-[#1899D6] bg-[#DDF4FF] px-3 py-1 rounded-xl">
            {badgeText}
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3C3C3C] leading-snug pt-1">
            {quizItem.question}
          </h1>
        </div>
        <AudioHintButton text={quizItem.question} />
      </div>

      <div className="space-y-3">
        {quizItem.options.map((opt, idx) => {
          const isSelected = selectedChoiceIdx === idx;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => {
                onSelectChoice(idx);
                AudioEngine.playStep();
              }}
              className={`w-full p-4 text-right flex items-center gap-3.5 cursor-pointer active:translate-y-[3px] ${
                isSelected ? 'card-duo-selected' : 'card-duo hover:bg-[#F7F7F7]'
              }`}
            >
              <span
                className={`w-8 h-8 rounded-xl border-2 font-mono font-extrabold text-sm flex items-center justify-center shrink-0 ${
                  isSelected
                    ? 'bg-[#1CB0F6] border-[#1899D6] text-white'
                    : 'bg-white border-[#E5E5E5] text-[#777777]'
                }`}
              >
                {idx + 1}
              </span>
              <span className="text-sm sm:text-base font-bold leading-snug">
                {opt}
              </span>
            </button>
          );
        })}
      </div>

      <p className="text-xs font-medium text-[#777777] text-center">
        אפשר לבחור תשובה גם באמצעות המקשים 1 עד 4 במקלדת
      </p>
    </div>
  );
}

export function RealWorldStepView({
  title,
  mascotMessage,
  spokenFallback,
  labMeta
}) {
  return (
    <div className="max-w-xl mx-auto w-full space-y-6">
      <h1 className="text-xl sm:text-2xl font-extrabold text-[#3C3C3C] text-center">
        {title}
      </h1>

      <ZenMascot
        pose="wave"
        size="sm"
        message={mascotMessage}
        spokenFallback={spokenFallback}
      />

      <div className="space-y-3">
        {(labMeta?.realWorldConnections || []).map((item, idx) => (
          <div key={idx} className="card-duo p-4 flex items-start gap-3.5">
            <span className="text-2xl leading-none shrink-0 mt-0.5">{item.emoji}</span>
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-extrabold text-[#3C3C3C]">
                {item.app}
              </h2>
              <p className="text-xs sm:text-sm text-[#4B4B4B] leading-relaxed">
                {item.howItWorks}
              </p>
            </div>
          </div>
        ))}
      </div>

      {labMeta?.criticalThinking && (
        <div className="rounded-2xl bg-[#FFF6D6] border-2 border-[#FFC800] p-4 space-y-1.5">
          <h2 className="text-sm sm:text-base font-extrabold text-[#3C3C3C]">
            {labMeta.criticalThinking.title}
          </h2>
          <p className="text-xs sm:text-sm text-[#4B4B4B] leading-relaxed">
            {labMeta.criticalThinking.insight}
          </p>
          <p className="text-xs font-extrabold text-[#9A6700] pt-1">
            {labMeta.criticalThinking.ruleOfThumb}
          </p>
        </div>
      )}
    </div>
  );
}
