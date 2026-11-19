import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Volume2,
  Square,
  HelpCircle,
  Lightbulb,
  BookOpen,
  Compass
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { NarrationEngine } from '../core/narration.js';
import {
  CURATED_TUTOR_KNOWLEDGE,
  getLabCategories,
  searchKnowledge,
  globalCircuitBreaker
} from '../core/tutorEngine.js';

function cleanTutorText(text) {
  if (!text) return '';
  return String(text).replace(/^[\s💡📖🔍✨]+/u, '').trim();
}

export default function DaylightTutorModal({ isOpen, onClose, currentLabId = 'home' }) {
  const effectiveLabId = currentLabId || 'home';
  const labKnowledge = CURATED_TUTOR_KNOWLEDGE[effectiveLabId] || CURATED_TUTOR_KNOWLEDGE.home;
  const categories = getLabCategories(effectiveLabId);

  const [activeCategory, setActiveCategory] = useState(
    effectiveLabId === 'home' ? 'faqs' : 'hints'
  );
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [narrationState, setNarrationState] = useState(() => NarrationEngine.getState());

  const dialogRef = useRef(null);
  const messagesEndRef = useRef(null);
  const pointerDownOutsideRef = useRef(false);

  useEffect(() => {
    return NarrationEngine.subscribe(setNarrationState);
  }, []);

  useEffect(() => {
    const welcomeText =
      CURATED_TUTOR_KNOWLEDGE[effectiveLabId]?.welcome || CURATED_TUTOR_KNOWLEDGE.home.welcome;
    setMessages([
      {
        id: `welcome-${effectiveLabId}`,
        sender: 'tutor',
        text: welcomeText,
        audioSrc: `/audio/tutor/${effectiveLabId}_welcome.mp3?v=3.1.1`,
        suggestedNext: (CURATED_TUTOR_KNOWLEDGE[effectiveLabId]?.prompts || []).slice(0, 3)
      }
    ]);
    setActiveCategory(effectiveLabId === 'home' ? 'faqs' : 'hints');
  }, [effectiveLabId]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;

    if (isOpen && !dlg.open) {
      dlg.showModal();
    } else if (!isOpen && dlg.open) {
      dlg.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dlg = dialogRef.current;
    if (!dlg) return;
    const handleNativeClose = () => {
      dlg.returnValue = '';
      if (isOpen) onClose?.();
    };
    dlg.addEventListener('close', handleNativeClose);
    return () => dlg.removeEventListener('close', handleNativeClose);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleClose = () => {
    NarrationEngine.stop?.();
    AudioEngine.playStep();
    if (dialogRef.current?.open) {
      dialogRef.current.close();
    } else {
      onClose?.();
    }
  };

  const isPointerOutside = (e, dlg) => {
    const r = dlg.getBoundingClientRect();
    return (
      e.clientX < r.left ||
      e.clientX > r.right ||
      e.clientY < r.top ||
      e.clientY > r.bottom
    );
  };

  const handleToggleAudio = (text, audioSrc) => {
    const isPlayingThis =
      Boolean(narrationState.isPlaying) && narrationState.currentText === text;
    if (isPlayingThis || narrationState.isPlaying) {
      NarrationEngine.stop();
      if (isPlayingThis) return;
    }
    NarrationEngine.play(text, audioSrc || '');
  };

  const handleSendPrompt = async (questionText, payloadOverride = null) => {
    const trimmed = questionText?.trim();
    if (!trimmed || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    AudioEngine.playStep();

    if (payloadOverride) {
      const clean = cleanTutorText(payloadOverride.text);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `tutor-${Date.now()}`,
            sender: 'tutor',
            text: clean,
            audioSrc: payloadOverride.audioSrc || null,
            suggestedNext: (CURATED_TUTOR_KNOWLEDGE[effectiveLabId]?.prompts || []).slice(0, 2)
          }
        ]);
        setIsLoading(false);
        AudioEngine.playSuccess();
      }, 220);
      return;
    }

    const curatedAnswer = labKnowledge?.answers?.[trimmed];
    if (curatedAnswer) {
      const promptIndex = labKnowledge.prompts.indexOf(trimmed);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `tutor-${Date.now()}`,
            sender: 'tutor',
            text: cleanTutorText(curatedAnswer),
            audioSrc:
              promptIndex !== -1 ? `/audio/tutor/${effectiveLabId}_q${promptIndex}.mp3?v=3.1.1` : null,
            suggestedNext: labKnowledge.prompts.filter((p) => p !== trimmed).slice(0, 2)
          }
        ]);
        setIsLoading(false);
        AudioEngine.playSuccess();
      }, 200);
      return;
    }

    const matchResult = searchKnowledge(trimmed, effectiveLabId);
    if (matchResult && matchResult.matched) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `tutor-${Date.now()}`,
            sender: 'tutor',
            text: cleanTutorText(matchResult.text),
            audioSrc: matchResult.audioSrc,
            suggestedNext: matchResult.suggestedNext || []
          }
        ]);
        setIsLoading(false);
        AudioEngine.playSuccess();
      }, 220);
      return;
    }

    if (globalCircuitBreaker.isAvailable()) {
      try {
        const res = await fetch('/api/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: trimmed,
            labId: effectiveLabId
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.text) {
            globalCircuitBreaker.recordSuccess();
            setMessages((prev) => [
              ...prev,
              {
                id: `tutor-${Date.now()}`,
                sender: 'tutor',
                text: cleanTutorText(data.text),
                suggestedNext: (CURATED_TUTOR_KNOWLEDGE[effectiveLabId]?.prompts || []).slice(0, 2)
              }
            ]);
            setIsLoading(false);
            AudioEngine.playSuccess();
            return;
          }
          if (data.fallback) globalCircuitBreaker.recordFailure();
        } else {
          globalCircuitBreaker.recordFailure();
        }
      } catch {
        globalCircuitBreaker.recordFailure();
      }
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: `tutor-${Date.now()}`,
          sender: 'tutor',
          text: cleanTutorText(
            matchResult?.text ||
              'שאלה מעניינת! נסו לבחור באחת משאלות ההדרכה המהירות למעלה כדי לקבל הסבר ממוקד.'
          ),
          audioSrc: matchResult?.audioSrc || null,
          suggestedNext: matchResult?.suggestedNext || (labKnowledge?.prompts || []).slice(0, 2)
        }
      ]);
      setIsLoading(false);
      AudioEngine.playSuccess();
    }, 220);
  };

  const categoryTabs = [
    { id: 'hints', label: 'רמזים', icon: Lightbulb },
    { id: 'faqs', label: 'שאלות נפוצות', icon: HelpCircle },
    { id: 'glossary', label: 'מילון', icon: BookOpen },
    { id: 'mechanics', label: 'עולם אמיתי', icon: Compass }
  ];

  const currentItems = categories[activeCategory] || categories.hints || [];

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="zen-tutor-dialog-title"
      onPointerDown={(e) => {
        if (dialogRef.current) {
          pointerDownOutsideRef.current = isPointerOutside(e, dialogRef.current);
        }
      }}
      onPointerUp={(e) => {
        if (
          pointerDownOutsideRef.current &&
          dialogRef.current &&
          isPointerOutside(e, dialogRef.current)
        ) {
          handleClose();
        }
        pointerDownOutsideRef.current = false;
      }}
      className="w-[min(94vw,620px)] max-h-[88vh] p-0 rounded-3xl border-2 border-[#E5E5E5] bg-white text-[#3C3C3C] shadow-none"
    >
      {isOpen && (
        <div className="flex flex-col max-h-[88vh]" dir="rtl">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 px-5 py-4 border-b-2 border-[#E5E5E5] shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 shrink-0 flex items-center justify-center">
                <img
                  src="/illustrations/zen_wave.png"
                  alt="זֶן החונך"
                  className="w-full h-full object-contain select-none"
                  draggable={false}
                />
              </div>
              <div>
                <h2 id="zen-tutor-dialog-title" className="text-lg font-extrabold text-[#3C3C3C]">
                  שאלו את זֶן החונך
                </h2>
                <p className="text-xs font-medium text-[#777777]">
                  בחרו שאלה מהירה או הקלידו שאלה משלכם בעברית
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="w-10 h-10 rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] flex items-center justify-center text-[#777777] hover:text-[#3C3C3C] cursor-pointer shrink-0"
              aria-label="סגירת חלון העזרה"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Category Pills + Suggested Chips */}
          <div className="bg-[#F7F7F5] border-b-2 border-[#E5E5E5] px-4 py-3 space-y-2.5 shrink-0">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {categoryTabs.map((tab) => {
                const TabIcon = tab.icon;
                const active = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveCategory(tab.id);
                      AudioEngine.playStep();
                    }}
                    className={`px-3 py-1.5 rounded-xl border-2 text-xs font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors ${
                      active
                        ? 'bg-[#DDF4FF] border-[#84D8FF] text-[#1899D6]'
                        : 'bg-white border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#F7F7F7]'
                    }`}
                  >
                    <TabIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {currentItems.slice(0, 4).map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSendPrompt(item.query || item.title, item.payload || null)}
                  className="px-3 py-1.5 rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#DDF4FF] hover:border-[#84D8FF] text-xs font-bold text-[#3C3C3C] cursor-pointer transition-colors"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3 min-h-[220px]">
            {messages.map((msg) => {
              const isTutor = msg.sender === 'tutor';
              const isPlayingThis =
                Boolean(narrationState.isPlaying) && narrationState.currentText === msg.text;

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'}`}
                >
                  <div
                    className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed flex items-start gap-3 ${
                      isTutor
                        ? 'bg-[#F7F7F5] border-2 border-[#E5E5E5] text-[#3C3C3C]'
                        : 'bg-[#1CB0F6] border-2 border-[#1899D6] text-white font-bold'
                    }`}
                  >
                    <p className="whitespace-pre-line flex-1">{msg.text}</p>
                    {isTutor && (
                      <button
                        type="button"
                        onClick={() => handleToggleAudio(msg.text, msg.audioSrc)}
                        className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-white border-2 cursor-pointer transition-transform active:translate-y-[2px] ${
                          isPlayingThis
                            ? 'bg-[#FF4B4B] border-[#FF4B4B]'
                            : 'bg-[#1CB0F6] hover:bg-[#38BDF8] border-[#1CB0F6]'
                        }`}
                        aria-label={isPlayingThis ? 'עצירת הקראה' : 'השמעת תשובה בקול'}
                      >
                        {isPlayingThis ? (
                          <Square className="w-3.5 h-3.5 fill-current" />
                        ) : (
                          <Volume2 className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>

                  {isTutor && Array.isArray(msg.suggestedNext) && msg.suggestedNext.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {msg.suggestedNext.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => handleSendPrompt(q)}
                          className="px-2.5 py-1 rounded-xl border border-[#84D8FF] bg-[#DDF4FF] text-[#1899D6] text-xs font-bold cursor-pointer hover:bg-[#cbeeff]"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {isLoading && (
              <div className="text-xs font-bold text-[#777777]">זֶן חושב על הסבר ברור...</div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Ask Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputValue);
            }}
            className="border-t-2 border-[#E5E5E5] bg-white px-4 py-3 flex items-center gap-2 shrink-0"
          >
            <label htmlFor="daylight-tutor-input" className="sr-only">
              כתבו שאלה לזֶן
            </label>
            <input
              id="daylight-tutor-input"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="כתבו שאלה לזֶן החונך..."
              className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-[#E5E5E5] bg-[#F7F7F5] text-sm font-bold text-[#3C3C3C] focus:bg-white focus:border-[#1CB0F6] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className={`px-4 py-2.5 text-sm ${
                !inputValue.trim() || isLoading ? 'btn-duo-disabled' : 'btn-duo-blue'
              }`}
              aria-label="שליחת שאלה"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">שליחה</span>
            </button>
          </form>
        </div>
      )}
    </dialog>
  );
}
