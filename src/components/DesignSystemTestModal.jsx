import React, { useState, useEffect } from 'react';
import { 
  Palette, 
  Layers, 
  Sparkles, 
  Smartphone, 
  Monitor, 
  ShieldAlert, 
  Check, 
  X, 
  Sliders, 
  Eye, 
  RotateCcw, 
  Binary, 
  Bot, 
  Award, 
  ArrowLeft,
  ChevronRight,
  Sun,
  Moon,
  Info
} from 'lucide-react';
import { StorageEngine } from '../core/storage.js';
import { AudioEngine } from '../core/audio.js';

const PALETTES = [
  {
    id: 'matte-amber',
    name: 'Kavita Matte Amber',
    hebrewName: 'ענבר מט ארכיוני (Zen Default)',
    desc: 'ספרייה ארכיונית חמימה, קריאה רגועה וממשק קלאסי',
    accentColor: '#d48344',
    glowColor: 'rgba(212, 131, 68, 0.45)'
  },
  {
    id: 'nordic-ice',
    name: 'Nordic Ice & Midnight',
    hebrewName: 'קרח נורדי ומחשוב קוונטי',
    desc: 'טכנולוגי, קר ויוקרתי. בהירות מעולה לקונסולות תוכנה ומעבדות',
    accentColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.40)'
  },
  {
    id: 'emerald-sanctuary',
    name: 'Emerald Sanctuary',
    hebrewName: 'אזמרגד מדעי ואורגני',
    desc: 'אווירת מחקר, מסמכים וביולוגיה חישובית. ניגודיות נעימה לעין',
    accentColor: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.40)'
  },
  {
    id: 'champagne-gold',
    name: 'Champagne Gold & Luxury',
    hebrewName: 'זהב שמפניה ויוקרה',
    desc: 'גוון זהב פרימיום כהה ומאופק ללא צעקנות',
    accentColor: '#eab308',
    glowColor: 'rgba(234, 179, 8, 0.42)'
  }
];

export default function DesignSystemTestModal({ isOpen, onClose }) {
  const [activePalette, setActivePalette] = useState(() => StorageEngine.getDapimPalette());
  const [isDapimGlobal, setIsDapimGlobal] = useState(() => StorageEngine.getDapimMode());
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'templates' | 'buttons' | 'audit'
  const [viewDevice, setViewDevice] = useState('desktop'); // 'desktop' | 'mobile'
  const [testInput, setTestInput] = useState('זֶן הרובוט - מעבדת מחשבים');
  const [samplePixels, setSamplePixels] = useState([
    0, 1, 1, 0,
    1, 1, 1, 1,
    1, 1, 1, 1,
    0, 1, 1, 0
  ]);
  const [buttonClickCount, setButtonClickCount] = useState(0);

  useEffect(() => {
    const unsub = StorageEngine.subscribe(state => {
      if (state.dapimPalette) setActivePalette(state.dapimPalette);
      if (typeof state.dapimMode === 'boolean') setIsDapimGlobal(state.dapimMode);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  const handleSelectPalette = (paletteId) => {
    setActivePalette(paletteId);
    StorageEngine.setDapimPalette(paletteId);
    AudioEngine.playStep();
  };

  const handleToggleGlobalDapim = () => {
    const next = StorageEngine.toggleDapimMode();
    setIsDapimGlobal(next);
    AudioEngine.playStep();
  };

  const toggleSamplePixel = (idx) => {
    const next = [...samplePixels];
    next[idx] = next[idx] === 1 ? 0 : 1;
    setSamplePixels(next);
    AudioEngine.playStep();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      dir="rtl"
    >
      {/* Outer Shell: Adaptive Apple Center Modal / 90dvh Mobile Sheet */}
      <div 
        className={`relative flex flex-col bg-[#0c0d10] text-[#f1f5f9] border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 ${
          viewDevice === 'mobile'
            ? 'w-full max-w-md h-[90dvh] rounded-t-[20px] rounded-b-none mt-auto'
            : 'w-full max-w-4xl max-h-[92vh] rounded-[18px]'
        }`}
        data-theme={activePalette}
      >
        
        {/* Ambient Velvet Mist Layer (Master Formula from docs/design.md) */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-80"
          style={{
            backgroundImage: 'var(--content-bg-gradient)',
            backgroundAttachment: 'local'
          }}
        />

        {/* 1. Functional Liquid Glass Header */}
        <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[rgba(16,18,24,0.85)] backdrop-blur-[32px] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-[var(--accent-base)] shadow-xs">
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  מעבדת בדיקת שפת העיצוב: זֶן 2.0
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[var(--accent-rim)] text-[var(--accent-base)] bg-[var(--accent-wash)]">
                  Zen 2.0 Liquid Glass
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                איפוק מונוכרומטי • כפתורים חלולים • תאורת Velvet Ambient • שכבות מופרדות
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Device Mode Preview Switcher */}
            <div className="hidden sm:flex items-center bg-white/5 p-0.5 rounded-lg border border-white/10">
              <button
                type="button"
                onClick={() => { setViewDevice('desktop'); AudioEngine.playStep(); }}
                className={`p-1.5 rounded-md transition-colors ${
                  viewDevice === 'desktop' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="תצוגת מסך דסקטופ (מודאל ממורכז)"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => { setViewDevice('mobile'); AudioEngine.playStep(); }}
                className={`p-1.5 rounded-md transition-colors ${
                  viewDevice === 'mobile' ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="תצוגת מובייל (יריעה תחתונה 90dvh)"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Close Button (Hollow Base) */}
            <button
              type="button"
              onClick={onClose}
              className="btn-hollow !h-8 !px-2.5 !rounded-lg text-slate-300 hover:text-white"
              title="סגור חלון בדיקה"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* 2. Global State Bar & Palette Selector */}
        <div className="relative z-10 px-4 sm:px-6 py-2.5 bg-black/40 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Active Palette Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-slate-400 font-medium shrink-0 ml-1">ערכת נושא:</span>
            {PALETTES.map(p => {
              const isActive = activePalette === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPalette(p.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-all shrink-0 border ${
                    isActive
                      ? 'border-[var(--accent-rim)] bg-[var(--accent-wash)] text-white font-semibold'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: p.accentColor }} 
                  />
                  <span>{p.name.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Master Global Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleToggleGlobalDapim}
              className={`btn-hollow !h-7 !px-2.5 !text-xs font-semibold ${
                isDapimGlobal ? '!border-[var(--accent-rim)] !text-[var(--accent-base)] !bg-[var(--accent-wash)]' : ''
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isDapimGlobal ? 'bg-[var(--accent-base)]' : 'bg-slate-500'}`} />
              <span>{isDapimGlobal ? 'זֶן 2.0 פעיל בכל האתר' : 'החל עיצוב זֶן 2.0 על כל האתר'}</span>
            </button>
          </div>
        </div>

        {/* 3. Navigation Tabs */}
        <div className="relative z-10 px-4 sm:px-6 pt-3 border-b border-white/5 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'overview'
                ? 'border-[var(--accent-base)] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            סקירה ועקרונות יסוד
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'templates'
                ? 'border-[var(--accent-base)] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            7 התבניות התקניות (Live)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('buttons')}
            className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'buttons'
                ? 'border-[var(--accent-base)] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            מעבדת כפתורים חלולים
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`pb-2 text-xs font-bold transition-colors border-b-2 ${
              activeTab === 'audit'
                ? 'border-[var(--accent-base)] text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            דוח ביקורת ה-10th Man
          </button>
        </div>

        {/* 4. Scrollable Content Body */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              
              {/* Highlight Banner */}
              <div className="card-tactile border-l-4 border-l-[var(--accent-base)] p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10 text-[var(--accent-base)] shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">
                      חוק הברזל: הפרדת שתי השכבות (The Two Discrete Layers)
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      1. <strong>שכבת התוכן (Content Layer):</strong> 100% מוצקה ואטומה (<code className="text-slate-200 bg-white/5 px-1 py-0.5 rounded">#15161c</code>). ללא שום טשטוש רקע, כדי להבטיח קריאות וחדות מקסימלית (WCAG AAA).<br />
                      2. <strong>שכבת השליטה (Functional UI Layer):</strong> זכוכית נוזלית צפה (<code className="text-slate-200 bg-white/5 px-1 py-0.5 rounded">backdrop-filter: blur(32px)</code>) השמורה בלעדית לסרגלים, מודאלים ותפריטים צפים.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4 Theme Palettes Comparison Grid */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  4 ערכות הנושא הארכיטקטוניות (Theme Palettes Engine)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PALETTES.map(pal => {
                    const isCurrent = activePalette === pal.id;
                    return (
                      <div 
                        key={pal.id}
                        onClick={() => handleSelectPalette(pal.id)}
                        className={`card-tactile cursor-pointer p-3.5 transition-all ${
                          isCurrent ? 'ring-2 ring-[var(--accent-base)] border-[var(--accent-base)]' : 'hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span 
                              className="w-3.5 h-3.5 rounded-full shadow-xs" 
                              style={{ backgroundColor: pal.accentColor }} 
                            />
                            <span className="text-xs font-bold text-white">{pal.name}</span>
                          </div>
                          {isCurrent && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--accent-wash)] text-[var(--accent-base)] font-bold">
                              נבחר כעת
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mb-2">{pal.desc}</p>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
                          <span>Accent: {pal.accentColor}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Mini Sandbox Card */}
              <div className="card-tactile p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Binary className="w-4 h-4 text-[var(--accent-base)]" />
                    <span className="text-xs font-bold text-white">סימולציית כרטיס תוכן במפרט זֶן 2.0</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Content Layer: 100% Solid</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                  <div className="grid grid-cols-4 gap-1 p-2 bg-[#0c0d10] border border-white/10 rounded-lg shrink-0">
                    {samplePixels.map((val, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => toggleSamplePixel(idx)}
                        className={`w-7 h-7 rounded text-[10px] font-mono font-bold flex items-center justify-center transition-colors ${
                          val === 1 
                            ? 'bg-white text-slate-900 shadow-xs' 
                            : 'bg-white/5 text-slate-500 hover:bg-white/10'
                        }`}
                        title="לחצו להדלקה/כיבוי"
                      >
                        {val}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 text-right">
                    <p className="text-xs text-slate-300">
                      בדקו את התחושה הטקטילית: לחצו על הפיקסלים במטריצה לעיל. שימו לב שהרקע אטום לחלוטין ללא שקיפות מפריעה, בעוד שהכפתורים לפעולה סביבו הם חלולים מזכוכית.
                    </p>
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => { setSamplePixels(samplePixels.map(v => v === 1 ? 0 : 1)); AudioEngine.playStep(); }}
                        className="btn-hollow !h-8 !px-3 text-xs"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>היפוך פיקסלים</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => { setButtonClickCount(c => c + 1); AudioEngine.playSuccess(); }}
                        className="btn-hollow-primary !h-8 !px-3 text-xs"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>בדיקת פעולה ראשית חלולה ({buttonClickCount})</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: THE 7 CANONICAL TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="text-xs text-slate-400 mb-2">
                בדיקה חיה של כל 7 התבניות התקניות מתוך סעיף 4 במסמך <code className="text-slate-300 bg-white/5 px-1 py-0.5 rounded">docs/design.md</code>:
              </div>

              {/* Template 1 & 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Canvas & Velvet Ambient */}
                <div className="card-tactile space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">תבנית 1: קנבס ו-Velvet Ambient</span>
                    <span className="text-[10px] font-mono text-[var(--accent-base)]">fixed attachment</span>
                  </div>
                  <div className="h-20 rounded-lg border border-white/10 p-2 relative overflow-hidden flex items-center justify-center"
                    style={{ backgroundImage: 'var(--content-bg-gradient)' }}>
                    <div className="text-center">
                      <span className="text-xs font-bold text-white">תאורת אליפסה עליונה רכה</span>
                      <p className="text-[10px] text-slate-400">95% 65% at 50% -8% עם Cinema Slate</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    תאורת הערפל העדינה שומרת על עומק חזותי ללא עומס וללא גרדיאנטים ניאוניים זרחניים.
                  </p>
                </div>

                {/* 2. Sticky Optical Glass Header */}
                <div className="card-tactile space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">תבנית 2: סרגל עליון דביק (Optical Glass)</span>
                    <span className="text-[10px] font-mono text-[var(--accent-base)]">blur(32px) saturate(190%)</span>
                  </div>
                  <div className="liquid-glass-surface rounded-lg p-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center text-white">
                        <Bot className="w-3 h-3" />
                      </div>
                      <span className="text-xs font-bold text-white">סרגל זכוכית נוזלית</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">inset 0 1px 0 0 rgba(255,255,255,0.16)</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    4 שכבות אופטיות: צבע כהה חצי-שקוף, טשטוש רווי, מסגרת דקה וקו אור ספקולרי עליון.
                  </p>
                </div>

              </div>

              {/* Template 3 & 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 3. Tactile Card */}
                <div className="card-tactile space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">תבנית 3: כרטיס תוכן טקטילי אטום</span>
                    <span className="text-[10px] font-mono text-emerald-400">WCAG AAA Opaque</span>
                  </div>
                  <div className="bg-[#15161c] border border-white/10 rounded-lg p-3 hover:-translate-y-0.5 transition-transform">
                    <div className="text-xs font-semibold text-white mb-1">כרטיס מידע טקטילי ללא טשטוש</div>
                    <p className="text-[11px] text-slate-300">
                      שכבת התוכן אטומה לחלוטין. התוכן הוא מקור הצבע היחיד במערכת.
                    </p>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    מבטיח 100% קריאות וחדות לתלמידים, ללא עיוותי רקע או שקיפויות מסיחות דעת.
                  </p>
                </div>

                {/* 4. Modal & Mobile Sheet */}
                <div className="card-tactile space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">תבנית 4: מודאל דסקטופ ויריעת מובייל</span>
                    <span className="text-[10px] font-mono text-[var(--accent-base)]">90dvh sheet / 640px modal</span>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2.5 border border-white/10 text-center space-y-1">
                    <span className="text-xs font-bold text-white">Desktop: 640px Centered • Mobile: 90dvh Sheet</span>
                    <p className="text-[10px] text-slate-400">רדיוס 18px בדסקטופ, 20px עליון ביריעת מובייל</p>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    החליפו מעלה לכפתור הטלפון לצפייה בהתנהגות היריעה התחתונה בהתאם לתקן iOS.
                  </p>
                </div>

              </div>

              {/* Template 5, 6, 7 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 5. Hollow Buttons */}
                <div className="card-tactile space-y-2.5">
                  <span className="text-xs font-bold text-white block">תבנית 5: כפתורים חלולים</span>
                  <div className="flex flex-col gap-2">
                    <button type="button" className="btn-hollow w-full text-xs">
                      משני: .btn-hollow
                    </button>
                    <button type="button" className="btn-hollow-primary w-full text-xs">
                      ראשי: .btn-hollow-primary
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    אפס בלוקים אטומים. שקיפות זכוכיתית ושפת הדגשה.
                  </p>
                </div>

                {/* 6. Form Inputs */}
                <div className="card-tactile space-y-2.5">
                  <span className="text-xs font-bold text-white block">תבנית 6: שדות קלט ובקרים</span>
                  <input
                    type="text"
                    value={testInput}
                    onChange={(e) => setTestInput(e.target.value)}
                    className="input-glass w-full text-xs"
                    placeholder="הקלידו לבדיקת פוקוס..."
                  />
                  <p className="text-[10px] text-slate-400">
                    גובה 40px, פונט 16px במובייל למניעת זום באייפון.
                  </p>
                </div>

                {/* 7. Mobile Standards */}
                <div className="card-tactile space-y-2.5">
                  <span className="text-xs font-bold text-white block">תבנית 7: תקן מובייל ו-iOS</span>
                  <div className="h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[11px] font-mono text-[var(--accent-base)]">
                    min-height: 44px touch target
                  </div>
                  <p className="text-[10px] text-slate-400">
                    מרחב לחיצה 44px, אפס גלילה אופקית, הגנת בטיחות מסך.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 3: HOLLOW BUTTONS BENCH */}
          {activeTab === 'buttons' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="card-tactile p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white">
                    חוק בל יעבור: ארכיטקטורת הכפתורים החלולים (Hollow Glass Mandate)
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950/60 border border-red-800 text-red-300">
                    Zero Solid Fills
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  לפי סעיף 3 במסמך העיצוב, כפתורים לעולם אינם עשויים מבלוק צבע אטום או מגרדיאנט בוהק. כל הכפתורים שקופים למחצה (חצי-זכוכית) עם שפת אור ספקולרית (Specular Highlight) ושפת הדגשה עדינה בלבד.
                </p>
              </div>

              {/* Side-by-side A/B comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* ZEN 2.0 HOLLOW SPEC */}
                <div className="card-tactile space-y-3 border-[var(--accent-rim)]">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--accent-base)]">תקן זֶן 2.0: Hollow Glass</span>
                    <span className="text-[10px] font-mono text-emerald-400">תקין לפי מפרט זֶן 2.0</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0c0d10] border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        onClick={() => { setButtonClickCount(c => c + 1); AudioEngine.playStep(); }}
                        className="btn-hollow"
                      >
                        משני חלול
                      </button>
                      <button 
                        type="button" 
                        onClick={() => { setButtonClickCount(c => c + 1); AudioEngine.playSuccess(); }}
                        className="btn-hollow-primary"
                      >
                        ראשי חלול
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>• רקע שקוף למחצה (<code className="text-slate-300">rgba(255,255,255,0.05)</code>)</div>
                      <div>• שפת אור עליונה (<code className="text-slate-300">inset 0 1px 0 0 rgba(255,255,255,0.22)</code>)</div>
                      <div>• מסגרת הדגשה (<code className="text-slate-300">1px solid var(--accent-rim)</code>)</div>
                      <div>• בהובר: שטיפת צבע שקופה ללא הפיכה לאטום</div>
                    </div>
                  </div>
                </div>

                {/* LEGACY SOLID / CONVENTIONAL BUTTON */}
                <div className="card-tactile space-y-3 opacity-80">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">כפתור קונבנציונלי אטום (Solid)</span>
                    <span className="text-[10px] font-mono text-amber-400">נאסר ע"פ design.md</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#0c0d10] border border-white/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <button 
                        type="button" 
                        className="px-3.5 h-[38px] rounded-lg text-xs font-medium bg-slate-800 text-slate-200 border border-slate-700"
                      >
                        משני אטום
                      </button>
                      <button 
                        type="button" 
                        className="px-3.5 h-[38px] rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                      >
                        ראשי אטום (כחול)
                      </button>
                    </div>

                    <div className="text-[11px] text-slate-400 space-y-1">
                      <div>• בלוק צבע מלא אטום 100%</div>
                      <div>• שובר את השקט החזותי של הממשק</div>
                      <div>• אינו מייצר תחושת זכוכית נוזלית</div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Click Counter Feedback */}
              <div className="flex items-center justify-between text-xs text-slate-400 px-2">
                <span>סה"כ לחיצות מבחן: <strong className="text-white font-mono">{buttonClickCount}</strong></span>
                <span className="text-[var(--accent-base)] font-mono">Feedback: Web Audio API Active</span>
              </div>
            </div>
          )}

          {/* TAB 4: 10TH MAN RED TEAM AUDIT */}
          {activeTab === 'audit' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              
              <div className="card-tactile border-l-4 border-l-amber-500 p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-bold text-white">
                      דוח הצוות האדום (The 10th Man Directive: Stress-Testing Zen 2.0 for Grade 5)
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      הנחיית ה-10th Man דורשת מאיתנו לא להתלהב עיוורת מעיצוב חדש, אלא לבצע ניתוח הנדסי ופדגוגי ביקורתי ומחמיר של התאמת שפת זֶן 2.0 למשתמשי היעד של ZenLab (תלמידי כיתה ה׳, גילאי 10–11).
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Friction Points Table */}
              <div className="card-tactile p-4 space-y-3">
                <h4 className="text-xs font-bold text-white">
                  3 נקודות החיכוך המרכזיות ופתרונות הגישור המומלצים:
                </h4>

                <div className="space-y-3 text-xs">
                  
                  {/* Point 1 */}
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-400">
                      <span>1. ניגודיות מסכים ומכשירי כיתה (Classroom Chromebooks & Ambient Light)</span>
                      <span className="text-[10px] font-mono text-slate-400">חומרה ותאורה</span>
                    </div>
                    <p className="text-slate-300">
                      <strong>הסיכון:</strong> כיתות לימוד מוארות באור שמש חזק, ומחשבי כרומבוק זולים סובלים מזוויות צפייה צרות ופאנלי TN עם ניגודיות ירודה. רקע שחור עמוק (<code className="text-slate-200">#0c0d10</code>) עם כפתורים חצי-שקופים עלול להיות בלתי קריא באור יום.
                    </p>
                    <p className="text-emerald-400 font-medium">
                      <strong>פתרון זֶן 2.0:</strong> הקפדה אדוקה על חוק השכבות: כל כרטיסי המעבדה, הפיקסלים, ועצי ההחלטה נשארים 100% אטומים עם טקסט לבן בוהק. בנוסף, ערכות Nordic Ice ו-Emerald Sanctuary מספקות ניגודיות הדגשה גבוהה יותר מ-Matte Amber.
                    </p>
                  </div>

                  {/* Point 2 */}
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-400">
                      <span>2. יכולת לחיצה וזיהוי לילדים (Click Affordance for 10-Year-Olds)</span>
                      <span className="text-[10px] font-mono text-slate-400">פסיכולוגיה קוגניטיבית</span>
                    </div>
                    <p className="text-slate-300">
                      <strong>הסיכון:</strong> תלמידי יסודי רגילים לכפתורים בולטים ומלאים. כפתור חלול שקוף לחלוטין עלול שלא להיתפס כאלמנט לחיץ, ולהוביל לתסכול במהלך משימות.
                    </p>
                    <p className="text-emerald-400 font-medium">
                      <strong>פתרון זֶן 2.0:</strong> כפתור ראשי חלול (<code className="text-slate-200">.btn-hollow-primary</code>) מצויד בשפת אור מודגשת (<code className="text-slate-200">inset 0 1px 0 0 rgba(255,255,255,0.22)</code>), מסגרת הדגשה זוהרת קלות של הצבע הנבחר, ואפקט תנועה (<code className="text-slate-200">translateY(-1px)</code>) בליווי משוב קולי מיידי ב-Web Audio.
                    </p>
                  </div>

                  {/* Point 3 */}
                  <div className="p-3 rounded-lg bg-white/5 border border-white/5 space-y-1">
                    <div className="flex items-center justify-between font-bold text-amber-400">
                      <span>3. יציבות SPA ו-Cloudflare Pages (Zero Performance Overhead)</span>
                      <span className="text-[10px] font-mono text-slate-400">ביצועים ומשאבים</span>
                    </div>
                    <p className="text-slate-300">
                      <strong>הסיכון:</strong> ריבוי אלמנטים עם <code className="text-slate-200">backdrop-filter: blur(32px)</code> עלול להכביד על המעבד הגרפי (GPU) של טאבלטים ומחשבים חלשים.
                    </p>
                    <p className="text-emerald-400 font-medium">
                      <strong>פתרון זֶן 2.0:</strong> הטשטוש האופטי שמור <em>אך ורק לשכבת השליטה הצפה</em> (סרגל עליון ומודאל יחיד). גריד התוכן, מפות המבוך ונוירוני הלמידה מרונדרים ללא פילטרים גרפיים כבדים.
                    </p>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>

        {/* 5. Bottom Action Bar */}
        <footer className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3 border-t border-white/10 bg-[rgba(16,18,24,0.92)] backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>טוקן פעיל:</span>
            <span className="font-mono text-white font-bold">{activePalette}</span>
            <span>&bull;</span>
            <span>מצב גלובלי:</span>
            <span className={`font-semibold ${isDapimGlobal ? 'text-emerald-400' : 'text-slate-400'}`}>
              {isDapimGlobal ? 'פעיל' : 'כבוי'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleGlobalDapim}
              className="btn-hollow text-xs"
            >
              {isDapimGlobal ? 'כיבוי מצב גלובלי' : 'הפעלת מצב גלובלי'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-hollow-primary text-xs"
            >
              <span>סגירה והמשך בחקר</span>
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
}
