import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Check, 
  Sun, 
  Moon, 
  X, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2,
  Compass,
  ArrowRight
} from 'lucide-react';
import { StorageEngine } from '../core/storage.js';
import { AudioEngine } from '../core/audio.js';

export const ZEN_THEMES = [
  {
    id: 'champagne-gold',
    name: 'זהב שמפניה',
    englishName: 'Champagne Gold',
    badge: 'ברירת מחדל • מומלץ',
    tagline: 'חם, יוקרתי וממוקד ללמידה ממושכת',
    description: 'הגוון המרכזי והאלגנטי של Zen 2.0. נבחר בשל הניגודיות הגבוהה לטקסט עברי והרוגע החזותי שהוא משרה.',
    accentLight: '#ca8a04',
    accentDark: '#eab308',
    glowColor: 'rgba(202, 138, 4, 0.35)',
    isDefault: true
  },
  {
    id: 'nordic-ice',
    name: 'קרח נורדי',
    englishName: 'Nordic Ice',
    badge: 'מעבדת סייבר',
    tagline: 'טכנולוגי, קר, קוונטי וחד',
    description: 'כחול סלייט מודרני בהשראת מסופי מחשב ומעבדות קוונטיות. אידיאלי לחובבי קוד ואלגוריתמיקה.',
    accentLight: '#0284c7',
    accentDark: '#38bdf8',
    glowColor: 'rgba(2, 132, 199, 0.35)',
    isDefault: false
  },
  {
    id: 'emerald-sanctuary',
    name: 'ברקת עמוקה',
    englishName: 'Emerald Sanctuary',
    badge: 'מעבדת טבע',
    tagline: 'אורגני, מרגיע ומאוזן לעיניים',
    description: 'ירוק אמרלד עמוק המפחית עומס חזותי ועייפות עיניים. מעולה לקריאה ממושכת ולמחקר ביולוגי-חישובי.',
    accentLight: '#059669',
    accentDark: '#10b981',
    glowColor: 'rgba(5, 150, 105, 0.35)',
    isDefault: false
  },
  {
    id: 'matte-amber',
    name: 'ענבר חם',
    englishName: 'Matte Amber',
    badge: 'ספרייה קלאסית',
    tagline: 'טרקוטה ארכיונית חמימה ואינטימית',
    description: 'חמימות נייר עתיק וספריית חקר קלאסית. מעניק חוויה שקטה ומאופקת ללא שום הסחות דעת.',
    accentLight: '#c26928',
    accentDark: '#d48344',
    glowColor: 'rgba(194, 105, 40, 0.38)',
    isDefault: false
  }
];

export default function ThemeSelectorModal({ isOpen, onClose }) {
  const [activePalette, setActivePalette] = useState(() => StorageEngine.getDapimPalette());
  const [themeMode, setThemeMode] = useState(() => StorageEngine.getTheme());

  useEffect(() => {
    const unsub = StorageEngine.subscribe(state => {
      if (state.dapimPalette) setActivePalette(state.dapimPalette);
      if (state.theme) setThemeMode(state.theme);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDark = themeMode === 'dark';

  const handleSelectPalette = (paletteId) => {
    setActivePalette(paletteId);
    StorageEngine.setDapimPalette(paletteId);
    AudioEngine.playStep();
  };

  const handleToggleThemeMode = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    StorageEngine.setTheme(nextTheme);
    setThemeMode(nextTheme);
    AudioEngine.playStep();
  };

  const activeThemeObj = ZEN_THEMES.find(t => t.id === activePalette) || ZEN_THEMES[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-modal-title"
      onClick={onClose}
    >
      <div 
        className="relative bg-[var(--slate-2)] text-[var(--text-primary)] border border-[var(--slate-6)] rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[var(--slate-6)] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-wash)] border border-[var(--accent-rim)] flex items-center justify-center text-[var(--accent-base)] shadow-xs">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 id="theme-modal-title" className="text-base sm:text-lg font-bold flex items-center gap-2">
                <span>ערכות נושא וצבעי מעבדה</span>
                <span className="badge-glass badge-glass-accent text-[11px] font-mono !py-0.5 !px-2">Zen 2.0</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                התאימו אישית את גוון המעבדה שלכם לפי מצב הרוח והנוחות
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-[var(--slate-4)] transition-colors cursor-pointer"
            title="סגירה (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Lighting Register Bar (Day / Night switch) */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)]">
          <div className="flex items-center gap-2 text-xs font-semibold">
            {isDark ? <Moon className="w-4 h-4 text-blue-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
            <span>תאורת סביבת העבודה:</span>
            <span className="text-slate-500 dark:text-slate-400 font-normal">
              {isDark ? 'מצב כהה (לילה/סייבר)' : 'מצב בהיר (כיתה/יום - ברירת מחדל)'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleToggleThemeMode}
            className="btn-glass text-xs !py-1 !px-2.5 flex items-center gap-1.5 cursor-pointer font-medium"
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>מעבר למצב מואר</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-blue-400" />
                <span>מעבר למצב כהה</span>
              </>
            )}
          </button>
        </div>

        {/* Theme Cards Grid */}
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[var(--accent-base)]" />
            <span>4 פלטות מדעיות מלוטשות (רמת ניגודיות WCAG AA)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ZEN_THEMES.map((theme) => {
              const isSelected = activePalette === theme.id;
              const displayHex = isDark ? theme.accentDark : theme.accentLight;

              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => handleSelectPalette(theme.id)}
                  className={`text-right p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[var(--accent-wash)] border-[var(--accent-base)] shadow-sm ring-1 ring-[var(--accent-base)]'
                      : 'bg-[var(--slate-2)] hover:bg-[var(--slate-3)] border-[var(--slate-6)] hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1.5">
                    {/* Top Row: Swatch & Badge */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-4 h-4 rounded-full shadow-xs shrink-0 ring-2 ring-white/40 dark:ring-black/40"
                          style={{ backgroundColor: displayHex }}
                        />
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                          {theme.name}
                        </span>
                      </div>

                      {isSelected ? (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[var(--accent-base)] bg-[var(--slate-2)] px-2 py-0.5 rounded-full border border-[var(--accent-rim)]">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>פעיל</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400 bg-[var(--slate-4)] px-1.5 py-0.5 rounded-md">
                          {theme.badge}
                        </span>
                      )}
                    </div>

                    {/* Tagline & Description */}
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                      {theme.tagline}
                    </p>
                    <p className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400">
                      {theme.description}
                    </p>
                  </div>

                  {/* Visual Swatch Strip */}
                  <div className="mt-3 pt-2 border-t border-[var(--slate-6)] flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>{theme.englishName}</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: displayHex }} />
                      <span>{displayHex}</span>
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live Preview Sample */}
        <div className="p-3.5 rounded-xl bg-[var(--slate-3)] border border-[var(--slate-6)] space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-300">
            <span>דוגמה חיה לממשק הנוכחי:</span>
            <span className="badge-glass badge-glass-accent text-[10px] !py-0 !px-1.5">
              {activeThemeObj.name}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" className="btn-glass btn-glass-primary text-xs !py-1 !px-3">
              כפתור ראשי
            </button>
            <button type="button" className="btn-glass text-xs !py-1 !px-3">
              כפתור משני
            </button>
            <span className="badge-glass badge-glass-accent text-xs">
              תגית הדגשה
            </span>
            <span className="text-xs font-semibold text-[var(--accent-base)] mr-auto">
              20 / 24 כוכבים ⭐
            </span>
          </div>
        </div>

        {/* Footer info note */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 border-t border-[var(--slate-6)] pt-3">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>ההגדרה נשמרת אוטומטית בדפדפן ומלווה אתכם בכל המעבדות</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-glass btn-glass-primary text-xs !py-1 !px-3 cursor-pointer"
          >
            אישור וסגירה
          </button>
        </div>

      </div>
    </div>
  );
}
