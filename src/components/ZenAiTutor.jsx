import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Volume2, 
  X, 
  HelpCircle, 
  Lightbulb, 
  BookOpen,
  Compass,
  Key, 
  ShieldCheck,
  Search,
  ChevronLeft
} from 'lucide-react';
import { NarrationEngine } from '../core/narration.js';
import { AudioEngine } from '../core/audio.js';
import { 
  getLabCategories, 
  searchKnowledge, 
  CURATED_TUTOR_KNOWLEDGE,
  globalCircuitBreaker
} from '../core/tutorEngine.js';

export default function ZenAiTutor({ currentLabId = 'lab1', isDapimActive = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userApiKey, setUserApiKey] = useState('');
  const [showKeyInput, setShowKeyInput] = useState(false);
  const [currentLab, setCurrentLab] = useState(currentLabId);
  const [activeCategory, setActiveCategory] = useState('hints');
  const messagesEndRef = useRef(null);

  const labKnowledge = CURATED_TUTOR_KNOWLEDGE[currentLabId] || CURATED_TUTOR_KNOWLEDGE.lab1;
  const categories = getLabCategories(currentLabId);

  // Initialize conversation when opening or changing lab
  useEffect(() => {
    setCurrentLab(currentLabId);
    const welcomeText = CURATED_TUTOR_KNOWLEDGE[currentLabId]?.welcome || CURATED_TUTOR_KNOWLEDGE.home.welcome;
    setMessages([
      {
        id: 'welcome',
        sender: 'tutor',
        text: welcomeText,
        category: 'פתיחת המעבדה',
        audioSrc: `/audio/tutor/${currentLabId}_welcome.mp3?v=0.6.3`,
        suggestedNext: (CURATED_TUTOR_KNOWLEDGE[currentLabId]?.prompts || []).slice(0, 3),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setActiveCategory(currentLabId === 'home' ? 'faqs' : 'hints');
  }, [currentLabId]);

  // Load API key from localStorage if saved by user
  useEffect(() => {
    try {
      const savedKey = localStorage.getItem('zenlab_gemini_api_key');
      if (savedKey) setUserApiKey(savedKey);
    } catch {
      // ignore localstorage errors
    }
  }, []);

  useEffect(() => {
    const handleOpenEvent = (e) => {
      setIsOpen(true);
      if (e?.detail?.labId) {
        setCurrentLab(e.detail.labId);
      }
    };
    if (typeof window !== 'undefined') {
      window.addEventListener('open-zen-tutor', handleOpenEvent);
      return () => window.removeEventListener('open-zen-tutor', handleOpenEvent);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSaveApiKey = (key) => {
    setUserApiKey(key);
    try {
      localStorage.setItem('zenlab_gemini_api_key', key);
    } catch {
      // ignore
    }
    setShowKeyInput(false);
    AudioEngine.playSuccess();
  };

  const handleSpeakText = (text, audioSrc) => {
    NarrationEngine.play(text, audioSrc);
  };

  const handleSendPrompt = async (questionText, payloadOverride = null) => {
    if (!questionText || !questionText.trim()) return;

    const userMsg = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: questionText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);
    AudioEngine.playStep();

    // 1. Direct payload override (from clicking structured hint or glossary card)
    if (payloadOverride) {
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'tutor-' + Date.now(),
            sender: 'tutor',
            text: payloadOverride.text,
            audioSrc: payloadOverride.audioSrc || null,
            category: payloadOverride.category || 'מענה חונך',
            suggestedNext: payloadOverride.suggestedNext || (CURATED_TUTOR_KNOWLEDGE[currentLab]?.prompts || []).slice(0, 2),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsLoading(false);
        AudioEngine.playSuccess();
      }, 350);
      return;
    }

    // 2. Direct exact Curated Q&A Match (instant audio response)
    const curatedAnswer = labKnowledge?.answers?.[questionText];
    if (curatedAnswer) {
      const promptIndex = labKnowledge.prompts.indexOf(questionText);
      setTimeout(() => {
        setMessages(prev => [
          ...prev,
          {
            id: 'tutor-' + Date.now(),
            sender: 'tutor',
            text: curatedAnswer,
            audioSrc: promptIndex !== -1 ? `/audio/tutor/${currentLab}_q${promptIndex}.mp3?v=0.6.3` : null,
            category: 'תשובת חונך מוקלטת',
            suggestedNext: labKnowledge.prompts.filter(p => p !== questionText).slice(0, 2),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
        setIsLoading(false);
        AudioEngine.playSuccess();
      }, 300);
      return;
    }

    // 3. Cloudflare Pages Function Proxy (/api/tutor) with Circuit Breaker
    // Uses the user's GEMINI_API_KEY securely hosted on Cloudflare edge
    if (globalCircuitBreaker.isAvailable()) {
      try {
        const res = await fetch('/api/tutor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: questionText, labId: currentLab })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.text) {
            globalCircuitBreaker.recordSuccess();
            setMessages(prev => [
              ...prev,
              {
                id: 'tutor-' + Date.now(),
                sender: 'tutor',
                text: data.text,
                isGemini: true,
                category: 'זֶן AI חכם',
                suggestedNext: (CURATED_TUTOR_KNOWLEDGE[currentLab]?.prompts || []).slice(0, 2),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            setIsLoading(false);
            AudioEngine.playSuccess();
            return;
          }
          if (data.fallback) {
            globalCircuitBreaker.recordFailure();
          }
        } else {
          globalCircuitBreaker.recordFailure();
        }
      } catch (err) {
        // Network/proxy error (e.g. running locally without wrangler or offline)
        globalCircuitBreaker.recordFailure();
      }
    }

    // 4. Optional: Direct client call if user entered a custom key in UI drawer
    if (userApiKey && userApiKey.trim().length > 10) {
      try {
        const promptSystem = `אתם חונך בינה מלאכותית ידידותי, מעודד וסבלני לילדים וילדות בכיתה ה (גילאי 10-11) בישראל, בשם "זֶן הרובוט".
הנושא הנלמד כעת במעבדה: ${currentLab}.
ענו בעברית פשוטה, בהירה, בגובה העיניים של תלמידי כיתה ה. השתמשו באנלוגיות יומיומיות (כמו משחקי לגו, מתגי חשמל, עוגה או ספורט).
כלל דקדוקי חובה וקריטי: פנו תמיד בלשון רבים מכלילה (אתם, שלכם, נסו, שימו לב, בואו נגלה) או בלשון נקבה, ולעולם אל תפנו בלשון זכר יחיד!
אל תתנו תשובות ארוכות ומסובכות: עד 2-3 משפטים קצרים ומעצימים. עודדו את התלמידים להמשיך לחקור במעבדה.`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${userApiKey.trim()}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{ text: `${promptSystem}\n\nשאלת התלמיד: "${questionText}"` }]
            }]
          })
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            setMessages(prev => [
              ...prev,
              {
                id: 'tutor-' + Date.now(),
                sender: 'tutor',
                text: reply.trim(),
                isGemini: true,
                category: 'Google Gemini 3',
                suggestedNext: (CURATED_TUTOR_KNOWLEDGE[currentLab]?.prompts || []).slice(0, 2),
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              }
            ]);
            setIsLoading(false);
            AudioEngine.playSuccess();
            return;
          }
        }
      } catch (e) {
        console.warn('Direct Gemini call error, falling back to local engine:', e);
      }
    }

    // 5. Option B: Fast, intelligent, local semantic intent matcher (Zero Latency, 100% Offline fallback)
    setTimeout(() => {
      const matchResult = searchKnowledge(questionText, currentLab);
      if (matchResult) {
        setMessages(prev => [
          ...prev,
          {
            id: 'tutor-' + Date.now(),
            sender: 'tutor',
            text: matchResult.text,
            audioSrc: matchResult.audioSrc,
            category: matchResult.category,
            suggestedNext: matchResult.suggestedNext || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ]);
      }
      setIsLoading(false);
      AudioEngine.playSuccess();
    }, 350);
  };

  const categoryTabs = [
    { id: 'hints', label: 'רמזים לאתגרים', icon: Lightbulb, count: categories.hints.length },
    { id: 'faqs', label: 'שאלות נפוצות', icon: HelpCircle, count: categories.faqs.length },
    { id: 'glossary', label: 'מילון מושגים', icon: BookOpen, count: categories.glossary.length },
    { id: 'mechanics', label: 'איך זה עובד?', icon: Compass, count: categories.mechanics.length }
  ];

  const currentCategoryItems = categories[activeCategory] || categories.hints;

  return (
    <>
      {/* Floating Trigger Button in Bottom Corner - Container-Anchored on Wide Screens */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => { setIsOpen(true); AudioEngine.playStep(); }}
          style={{
            left: 'max(1rem, calc((100vw - 72rem) / 2 + 1.5rem))'
          }}
          className={`fixed bottom-4 sm:bottom-6 z-50 flex items-center justify-center sm:justify-start gap-2.5 w-12 h-12 sm:w-auto sm:h-auto rounded-xl p-0 sm:px-3.5 sm:py-2.5 shadow-xl hover:shadow-2xl transition-all group scale-100 hover:scale-105 cursor-pointer ${
            isDapimActive
              ? 'bg-slate-900/95 dark:bg-slate-800/95 hover:bg-slate-900 text-white border border-[var(--slate-6)] hover:border-[var(--accent-rim)]'
              : 'bg-blue-600 hover:bg-blue-700 text-white border-2 border-white/90 dark:border-slate-800'
          }`}
          title="שאלו את זֶן הרובוט - חונך הבינה המלאכותית שלכם"
        >
          <div className={`relative flex items-center justify-center w-8 h-8 rounded-lg shrink-0 shadow-xs ${
            isDapimActive
              ? 'bg-[var(--slate-4)] border border-[var(--slate-6)] text-[var(--accent-base)]'
              : 'bg-white/20 text-white'
          }`}>
            <Bot className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full ring-2 ring-slate-900" />
          </div>
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-bold leading-tight">שאלו את זֶן הרובוט</span>
            <span className={`block text-[10px] leading-tight ${isDapimActive ? 'text-slate-300' : 'text-blue-200'}`}>
              חונך חכם ומילון מושגים
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal / Drawer - Container-Anchored on Wide Screens */}
      {isOpen && (
        <div 
          style={{
            left: 'max(0.75rem, calc((100vw - 72rem) / 2 + 1.5rem))'
          }}
          className={`fixed bottom-3 sm:bottom-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[440px] max-h-[85vh] h-[560px] sm:h-[620px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200 ${
            isDapimActive
              ? 'bg-[var(--slate-2)] border border-[var(--slate-6)]'
              : 'bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800'
          }`}
        >
          
          {/* Header */}
          <div className={
            isDapimActive
              ? "px-4 sm:px-5 py-3 sm:py-3.5 bg-[var(--slate-3)] border-b border-[var(--slate-6)] text-white flex items-center justify-between shadow-xs shrink-0"
              : "px-4 sm:px-5 py-3 sm:py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shadow-md shrink-0"
          }>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold shadow-xs shrink-0 ${
                isDapimActive
                  ? 'bg-[var(--slate-4)] border border-[var(--slate-6)] text-[var(--accent-base)]'
                  : 'bg-white/20 backdrop-blur-md text-white shadow-inner'
              }`}>
                <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="text-right">
                <h3 className="text-xs sm:text-sm font-extrabold flex items-center gap-1.5">
                  <span className={isDapimActive ? 'text-slate-100' : 'text-white'}>זֶן הרובוט</span>
                  <span className={
                    isDapimActive
                      ? "badge-glass badge-glass-accent text-[10px] !py-0 !px-1.5"
                      : "text-[10px] px-2 py-0.5 bg-white/20 rounded-full font-medium text-white"
                  }>
                    חונך המעבדה
                  </span>
                </h3>
                <p className={`text-[10px] sm:text-[11px] font-medium ${isDapimActive ? 'text-slate-400' : 'text-blue-100'}`}>
                  {currentLab === 'home' ? 'מפת המסע ומדריך כללי' : `עוזר אישי ומילון מושגים למעבדה`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowKeyInput(!showKeyInput)}
                title="הגדרות מפתח Gemini לחיבור חי נוסף"
                className={`p-1.5 rounded-lg transition-colors ${
                  showKeyInput 
                    ? isDapimActive ? 'bg-[var(--slate-5)] text-[var(--accent-base)]' : 'bg-white/30 text-white' 
                    : isDapimActive ? 'text-slate-400 hover:text-white hover:bg-[var(--slate-4)]' : 'text-blue-200 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Key className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => { setIsOpen(false); AudioEngine.playStep(); }}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDapimActive ? 'text-slate-400 hover:text-white hover:bg-[var(--slate-4)]' : 'text-blue-200 hover:bg-white/20 hover:text-white'
                }`}
                title="סגירת חונך"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Optional Gemini API Key Drawer */}
          {showKeyInput && (
            <div className="p-3 bg-blue-50 dark:bg-slate-950 border-b border-blue-200 dark:border-slate-800 text-xs space-y-2">
              <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>חיבור אופציונלי למנוע Google Gemini</span>
                </span>
                {userApiKey && (
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> מחובר
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                המנוע המקומי עובד תמיד ללא צורך במפתח! המפתח משמש רק לשאלות חופשיות מחוץ לתוכנית הלימודים.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  value={userApiKey}
                  onChange={(e) => setUserApiKey(e.target.value)}
                  placeholder="הדבקת מפתח Gemini API..."
                  className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => handleSaveApiKey(userApiKey)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  שמירה
                </button>
              </div>
            </div>
          )}

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50 dark:bg-slate-950/40">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700/80 rounded-bl-none'
                  }`}
                >
                  {/* Category Badge for Tutor responses */}
                  {msg.sender === 'tutor' && msg.category && (
                    <div className="mb-1.5 flex items-center gap-1.5">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50">
                        {msg.category}
                      </span>
                    </div>
                  )}

                  <p className="whitespace-pre-line">{msg.text}</p>

                  {/* Contextual Suggested Next Questions (Option A + B link) */}
                  {msg.sender === 'tutor' && Array.isArray(msg.suggestedNext) && msg.suggestedNext.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5">
                      <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        💡 כדאי להמשיך ולחקור:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestedNext.map((suggestion, sIdx) => (
                          <button
                            key={sIdx}
                            type="button"
                            onClick={() => handleSendPrompt(suggestion)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-700/60 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-300 transition-colors text-right flex items-center gap-1"
                          >
                            <span>{suggestion}</span>
                            <ChevronLeft className="w-3 h-3 text-slate-400 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Footer: Speech button & Timestamp */}
                  {msg.sender === 'tutor' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleSpeakText(msg.text, msg.audioSrc)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 text-blue-600 dark:text-blue-400 font-bold transition-colors"
                          title="השמעת הקול"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>השמעה</span>
                        </button>
                        {msg.isGemini && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-mono text-[9px]">
                            Gemini AI
                          </span>
                        )}
                      </div>
                      <span>{msg.timestamp}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-slate-500 text-xs p-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span>זֶן בודק את מאגר הידע של המעבדה...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Option A: Structured Pedagogical Categories & Quick Cards */}
          <div className="bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 p-2.5 space-y-2 shrink-0">
            {/* Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
              {categoryTabs.map(tab => {
                const IconComponent = tab.icon;
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCategory(tab.id)}
                    className={`shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <IconComponent className="w-3 h-3" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Category Quick Cards Carousel */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {currentCategoryItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendPrompt(item.query, item.payload)}
                  className="shrink-0 max-w-[260px] text-right px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-blue-300 transition-all text-xs font-semibold group flex items-start gap-1.5 shadow-2xs"
                >
                  <span className="text-blue-500 mt-0.5 shrink-0 group-hover:scale-110 transition-transform">
                    {item.badge?.includes('אתגר') ? '💡' : item.badge?.includes('מילון') ? '📖' : '❓'}
                  </span>
                  <div className="overflow-hidden">
                    <span className="block text-[11px] font-bold text-slate-800 dark:text-slate-100 truncate">
                      {item.title}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-normal">
                      {item.badge}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Option B: Smart Semantic Search & Free-Text Ask Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt(inputValue);
            }}
            className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="הקלידו שאלה או מושג (למשל: פיקסל, לולאה, רמז)..."
                className="w-full pr-9 pl-4 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              className="p-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white shadow-md transition-all shrink-0 cursor-pointer"
              title="שליחת שאלה לחונך"
            >
              <Send className="w-4 h-4 rtl:rotate-180" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
