import React, { useState } from 'react';
import { Sparkles, Zap, Compass, Binary, Repeat, GitBranch, Users, Eye, Cpu, Flame } from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { BespokeSpacecraft, BespokeRingedPlanet } from './BespokeIllustrations.jsx';

/**
 * InteractiveConceptSandbox.jsx
 * Brilliant.org-inspired interactive micro-lessons embedded directly inside TheoryView.
 * Lets 10–11 year old students discover the core mathematical/algorithmic principle by playing
 * with a focused 15-second interactive toy instead of reading static text walls.
 */
export default function InteractiveConceptSandbox({ labId = 'lab1' }) {
  // Lab 1 state: 4-bit interactive byte builder [8, 4, 2, 1]
  const [bits4, setBits4] = useState([1, 0, 1, 0]); // Default: 8 + 2 = 10

  // Lab 2 state: Loop vs Manual mode
  const [useLoopMode, setUseLoopMode] = useState(true);
  const [loopCount, setLoopCount] = useState(4);

  // Lab 3 state: 2 questions filter
  const [qFly, setQFly] = useState(true);
  const [qFur, setQFur] = useState(true);

  // Lab 4 state: A* vs BFS interactive comparison step
  const [navMode, setNavMode] = useState('astar'); // 'astar' | 'bfs'

  // Lab 5 state: k-NN outlier resilience
  const [kVal, setKVal] = useState(5);

  // Lab 6 state: 3x3 edge scanner position (0..4)
  const [scanPos, setScanPos] = useState(2);

  // Lab 7 state: Neuron inputs & bias
  const [nIn1, setNIn1] = useState(1);
  const [nIn2, setNIn2] = useState(1);
  const [nThreshold, setNThreshold] = useState(1.2);

  // Lab 8 state: Temperature slider
  const [tempVal, setTempVal] = useState(0.2);

  const weights4 = [8, 4, 2, 1];
  const decimalVal = bits4.reduce((acc, b, i) => acc + b * weights4[i], 0);

  const sandboxHeaders = {
    lab1: { badge: 'נסו בעצמכם: הדגמה חיה', title: 'מחשבון הביטים: איך 4 מתגים יוצרים מספרים?' },
    lab2: { badge: 'נסו בעצמכם: הדגמה חיה', title: 'כוחה של לולאה: פקודה אחת במקום רשימה ארוכה' },
    lab3: { badge: 'נסו בעצמכם: הדגמה חיה', title: '2 שאלות של כן ולא: גלו איזו חיה מסתתרת' },
    lab4: { badge: 'נסו בעצמכם: הדגמה חיה', title: 'מצפן חכם (A*) מול סריקת מכ״ם רגילה (BFS)' },
    lab5: { badge: 'נסו בעצמכם: הדגמה חיה', title: 'הצבעת השכנים (k-NN): למה כדאי לשאול 5 שכנים ולא רק 1?' },
    lab6: { badge: 'נסו בעצמכם: הדגמה חיה', title: 'גלאי הקצוות: הזיזו את הסורק וגלו איפה הצבע משתנה' },
    lab7: { badge: 'נסו בעצמכם: הדגמה חיה', title: 'מתג הנוירון: מתי סכום הרמזים מפעיל את האור הירוק?' },
    lab8: { badge: 'נסו בעצמכם: הדגמה חיה', title: 'מד הדמיון (טמפרטורה): איך משתנים סיכויי המילים?' },
  };
  const headerInfo = sandboxHeaders[labId] || sandboxHeaders.lab1;

  return (
    <section
      className="rounded-3xl border-2 border-indigo-500/35 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/90 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden"
      dir="rtl"
    >
      {/* Top Interactive Discovery Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/50 text-amber-300 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-300 block">
              {headerInfo.badge}
            </span>
            <h3 className="text-base sm:text-lg font-black text-white">
              {headerInfo.title}
            </h3>
          </div>
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/10 border border-white/15 text-indigo-200 self-start sm:self-center">
          לחצו או הזיזו כדי לבדוק בזמן אמת
        </span>
      </div>

      {/* LAB 1 MICRO-WIDGET: 4-Bit Tactile Binary Decoder */}
      {labId === 'lab1' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <div className="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
              איך מחשב סופר ומצייר בעזרת <strong className="text-amber-300">0 ו-1 בלבד</strong>? לכל מתג יש כוח קבוע שגדל פי 2 (<span className="font-mono text-cyan-300">1, 2, 4, 8</span>). לחצו על המתגים כדי להדליק ולכבות אותם:
            </div>

            <div className="grid grid-cols-4 gap-2.5 sm:gap-3 pt-1" dir="ltr">
              {bits4.map((bit, idx) => {
                const w = weights4[idx];
                const isLit = bit === 1;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const next = [...bits4];
                      next[idx] = isLit ? 0 : 1;
                      setBits4(next);
                      AudioEngine.playToggle(!isLit);
                    }}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                      isLit
                        ? 'bg-gradient-to-b from-amber-300 to-amber-500 text-slate-950 border-white shadow-[0_6px_0_#b45309,0_0_20px_rgba(251,191,36,0.45)] -translate-y-1'
                        : 'bg-slate-800/90 text-slate-400 border-slate-600 shadow-[0_4px_0_#0f172a] hover:border-slate-400'
                    }`}
                  >
                    <span className="text-[10px] font-mono font-bold opacity-80">שווי: {w}</span>
                    <span className="text-2xl sm:text-3xl font-mono font-black">{bit}</span>
                    <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-black/20">
                      {isLit ? `+${w}` : 'כבוי'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-950/90 border border-white/15 rounded-2xl p-4 sm:p-5 flex flex-col items-center justify-center text-center space-y-2">
            <span className="text-xs font-bold text-indigo-300">המספר שהמחשב רואה בזיכרון:</span>
            <div className="font-mono text-2xl sm:text-3xl font-black text-amber-300" dir="ltr">
              {bits4.map((b, i) => (b ? weights4[i] : 0)).join(' + ')} = {decimalVal}
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-white/10 mt-1">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-300"
                style={{ width: `${Math.round((decimalVal / 15) * 100)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-400 pt-1">
              בייט שלם (8 מתגים) מגיע עד 255 — וכך המחשב מייצג כל פיקסל, אות וצבע!
            </p>
          </div>
        </div>
      )}

      {/* LAB 2 MICRO-WIDGET: Loop vs Manual Step Compressor */}
      {labId === 'lab2' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              למה מתכנתים משתמשים ב<strong className="text-amber-300">לולאה (Loop)</strong>? בחרו בכמות הצעדים וראו איך לולאה מכווצת שורות קוד ארוכות לפקודה חכמה אחת:
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {[3, 5, 8].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => { setLoopCount(n); AudioEngine.playStep(); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                    loopCount === n
                      ? 'bg-amber-400 text-slate-950 border-white shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
                  }`}
                >
                  מסלול של {n} משבצות
                </button>
              ))}
              <button
                type="button"
                onClick={() => { setUseLoopMode(!useLoopMode); AudioEngine.playToggle(!useLoopMode); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                  useLoopMode
                    ? 'bg-emerald-400 text-slate-950 border-white'
                    : 'bg-indigo-600 text-white border-indigo-400'
                }`}
              >
                {useLoopMode ? 'מצב: לולאה חכמה פעילה ✓' : 'מצב: כתיבה ידנית ארוכה'}
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-950/90 border border-white/15 rounded-2xl p-4 font-mono text-xs space-y-2" dir="ltr">
            <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-white/10 pb-1.5" dir="rtl">
              <span>קוד התוכנית במחשב:</span>
              <span className="text-emerald-300 font-bold">
                {useLoopMode ? 'שורה אחת בלבד!' : `${loopCount} שורות נפרדות`}
              </span>
            </div>
            {useLoopMode ? (
              <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-400/50 text-emerald-200 font-bold">
                repeat ({loopCount}) &#123; moveForward(); &#125;
              </div>
            ) : (
              <div className="space-y-1 max-h-28 overflow-y-auto text-indigo-200">
                {Array.from({ length: loopCount }).map((_, i) => (
                  <div key={i} className="px-2 py-0.5 bg-slate-900 rounded">
                    {i + 1}. moveForward();
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* LAB 3 MICRO-WIDGET: 2-Question Animal Detective */}
      {labId === 'lab3' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              איך 2 שאלות של <strong className="text-amber-300">כן / לא</strong> מזהות בדיוק חיה אחת מתוך 4? שנו את התשובות וראו איך העץ מתמקד מיד בתשובה:
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => { setQFly(!qFly); AudioEngine.playToggle(!qFly); }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-indigo-400/60 text-xs font-black flex items-center gap-2 cursor-pointer"
              >
                <span>שאלה 1: האם החיה עפה?</span>
                <span className={`px-2 py-0.5 rounded-md ${qFly ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'}`}>
                  {qFly ? 'כן (עטלף / נשר)' : 'לא (חתול / צב)'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => { setQFur(!qFur); AudioEngine.playToggle(!qFur); }}
                className="px-4 py-2.5 rounded-xl bg-slate-800 border-2 border-amber-400/60 text-xs font-black flex items-center gap-2 cursor-pointer"
              >
                <span>שאלה 2: האם יש לה פרווה?</span>
                <span className={`px-2 py-0.5 rounded-md ${qFur ? 'bg-emerald-400 text-slate-950' : 'bg-rose-500 text-white'}`}>
                  {qFur ? 'כן' : 'לא'}
                </span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-950/90 border border-amber-400/40 rounded-2xl p-4 text-center space-y-1.5">
            <span className="text-xs text-indigo-300 font-bold block">העלה הסופי בעץ ההחלטות:</span>
            <div className="text-xl font-black text-amber-300">
              {qFly && qFur && 'עטלף (עף + בעל פרווה)'}
              {qFly && !qFur && 'נשר (עף + נוצות ללא פרווה)'}
              {!qFly && qFur && 'חתול (הולך ביבשה + פרווה)'}
              {!qFly && !qFur && 'צב (הולך ביבשה + שריון)'}
            </div>
            <span className="text-[11px] font-mono text-emerald-300 block">
              זיהוי ב-100% דיוק תוך 2 צעדים בלבד!
            </span>
          </div>
        </div>
      )}

      {/* LAB 4 MICRO-WIDGET: Smart Compass A* vs Blind BFS Radar */}
      {labId === 'lab4' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              החליפו בין <strong className="text-amber-300">מצפן חכם A*</strong> לבין <strong className="text-indigo-300">גישוש עיוור BFS</strong> וראו כמה דלק ומשבצות המחשב חוסך כשיש לו חוש כיוון (<span className="font-mono text-cyan-300">f = g + h</span>):
            </p>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => { setNavMode('astar'); AudioEngine.playToggle(true); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                  navMode === 'astar'
                    ? 'bg-amber-400 text-slate-950 border-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                מצפן חכם A* (בודק רק לכיוון היעד)
              </button>
              <button
                type="button"
                onClick={() => { setNavMode('bfs'); AudioEngine.playToggle(false); }}
                className={`px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all cursor-pointer ${
                  navMode === 'bfs'
                    ? 'bg-indigo-500 text-white border-white shadow-lg'
                    : 'bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                גישוש עיוור BFS (מתפזר לכל הכיוונים)
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-950/90 border border-white/15 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <BespokeSpacecraft angle={90} isMoving={true} size={26} />
              <div className="flex-1 mx-3 flex items-center justify-between gap-1">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div
                    key={step}
                    className={`h-2.5 flex-1 rounded-full transition-all ${
                      navMode === 'astar'
                        ? 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'
                        : 'bg-indigo-500/70'
                    }`}
                  />
                ))}
              </div>
              <BespokeRingedPlanet size={28} />
            </div>
            <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
              <span className="text-slate-300">משבצות שנסרקו במחשב:</span>
              <span className={`font-mono font-black ${navMode === 'astar' ? 'text-emerald-300' : 'text-rose-300'}`}>
                {navMode === 'astar' ? '8 משבצות בלבד (חיסכון של 72% בדלק!)' : '29 משבצות (בזבוז אנרגיה סביבתי)'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* LAB 5 MICRO-WIDGET: k-NN Neighbor Voting */}
      {labId === 'lab5' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              מה קורה כשפרי מסתורי נוחת ליד תפוח אחד שהתבלבל במקום, אבל סביבו יש 4 אבטיחים? החליפו בין <strong className="text-amber-300">k=1</strong> ל-<strong className="text-emerald-300">k=5</strong>:
            </p>
            <div className="flex items-center gap-2.5">
              {[1, 3, 5].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => { setKVal(k); AudioEngine.playStep(); }}
                  className={`px-4 py-2 rounded-xl text-xs font-black border-2 cursor-pointer transition-all ${
                    kVal === k
                      ? 'bg-amber-400 text-slate-950 border-white shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  שאל k={k} שכנים קרובים
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 bg-slate-950/90 border border-white/15 rounded-2xl p-4 text-center space-y-1.5">
            <span className="text-xs text-indigo-300 font-bold">תוצאת ההצבעה של {kVal} השכנים:</span>
            <div className={`text-base sm:text-lg font-black ${kVal === 1 ? 'text-rose-300' : 'text-emerald-300'}`}>
              {kVal === 1
                ? 'טעות! השכן היחיד הכי קרוב היה חריג (תפוח בודד)'
                : `זיהוי מדויק ויציב! הרוב (${kVal - 1} מול 1) קבע: אבטיח ירוק!`}
            </div>
          </div>
        </div>
      )}

      {/* LAB 6 MICRO-WIDGET: 3x3 Edge Detection Slider */}
      {labId === 'lab6' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              הזיזו את זכוכית המגדלת על פני פיקסלים כהים (<span className="font-mono">0</span>) ובהירים (<span className="font-mono">1</span>). שימו לב מתי הפילטר מדליק <strong className="text-emerald-300">אור חזק של גבול</strong>:
            </p>
            <div className="flex items-center gap-2">
              {[0, 1, 2, 3].map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => { setScanPos(pos); AudioEngine.playStep(); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                    scanPos === pos
                      ? 'bg-amber-400 text-slate-950 border-white'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  עמדת סריקה {pos + 1} {pos === 1 || pos === 2 ? '(על הקו!)' : '(אזור אחיד)'}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 bg-slate-950/90 border border-white/15 rounded-2xl p-4 text-center space-y-1.5">
            <span className="text-xs text-indigo-300 font-bold">עוצמת זיהוי הקצה במחשב:</span>
            <div className={`text-lg font-black ${scanPos === 1 || scanPos === 2 ? 'text-emerald-300' : 'text-slate-400'}`}>
              {scanPos === 1 || scanPos === 2
                ? 'גבול זוהה! (הפרש חד בין שחור ללבן = 100%)'
                : 'אין קו כאן (כל השכנים באותו צבע = 0%)'}
            </div>
          </div>
        </div>
      )}

      {/* LAB 7 MICRO-WIDGET: Neuron Firing Threshold */}
      {labId === 'lab7' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              הדליקו את הרמזים ושנו את <strong className="text-amber-300">סף השכנוע</strong> של הנוירון כדי לראות מתי הוא מחליט לירות &quot;כן!&quot;:
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => { setNIn1(nIn1 ? 0 : 1); AudioEngine.playToggle(!nIn1); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black border cursor-pointer ${
                  nIn1 ? 'bg-amber-400 text-slate-950 border-white' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                רמז 1: יש שמש בחוץ ({nIn1 ? '+1.0' : '0'})
              </button>
              <button
                type="button"
                onClick={() => { setNIn2(nIn2 ? 0 : 1); AudioEngine.playToggle(!nIn2); }}
                className={`px-3.5 py-2 rounded-xl text-xs font-black border cursor-pointer ${
                  nIn2 ? 'bg-cyan-400 text-slate-950 border-white' : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                רמז 2: החברים באים ({nIn2 ? '+1.0' : '0'})
              </button>
              <button
                type="button"
                onClick={() => { setNThreshold(nThreshold > 1 ? 0.5 : 1.5); AudioEngine.playStep(); }}
                className="px-3.5 py-2 rounded-xl text-xs font-black bg-indigo-600 text-white border border-indigo-400 cursor-pointer"
              >
                סף שכנוע: {nThreshold > 1 ? 'קפדן (דורש 2 רמזים = AND)' : 'זורם (מספיק רמז 1 = OR)'}
              </button>
            </div>
          </div>
          <div className="lg:col-span-5 bg-slate-950/90 border border-white/15 rounded-2xl p-4 text-center space-y-1.5">
            <span className="text-xs text-indigo-300 font-bold">החלטת הנוירון החכם:</span>
            <div className={`text-lg font-black ${(nIn1 + nIn2) >= nThreshold ? 'text-emerald-300' : 'text-rose-300'}`}>
              {(nIn1 + nIn2) >= nThreshold
                ? `הנוירון נדלק! (סכום ${nIn1 + nIn2} עבר את הסף ${nThreshold})`
                : `הנוירון כבוי (סכום ${nIn1 + nIn2} נמוך מהסף ${nThreshold})`}
            </div>
          </div>
        </div>
      )}

      {/* LAB 8 MICRO-WIDGET: Temperature Creativity Dial */}
      {labId === 'lab8' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              כוונו את <strong className="text-amber-300">מד החום והדמיון (Temperature)</strong> עבור המשפט: <em>&quot;הרובוט פתח את הדלת וגילה...&quot;</em>
            </p>
            <div className="flex items-center gap-2.5">
              {[
                { val: 0, label: 'טמפרטורה 0.0 (הגיוני וצפוי)' },
                { val: 0.5, label: 'טמפרטורה 0.5 (מאוזן)' },
                { val: 1.0, label: 'טמפרטורה 1.0 (מפתיע ומצחיק!)' }
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => { setTempVal(opt.val); AudioEngine.playStep(); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black border cursor-pointer transition-all ${
                    tempVal === opt.val
                      ? 'bg-amber-400 text-slate-950 border-white shadow-md'
                      : 'bg-slate-800 text-slate-300 border-slate-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 bg-slate-950/90 border border-white/15 rounded-2xl p-4 space-y-1.5 text-center">
            <span className="text-xs text-indigo-300 font-bold">המילה שהמחשב יבחר להמשך הסיפור:</span>
            <div className="text-base sm:text-lg font-black text-amber-300">
              {tempVal === 0 && '"מעבדה חדשה" (96% סיכוי — צפוי ובטוח)'}
              {tempVal === 0.5 && '"אוצר מסתורי" (55% סיכוי — הרפתקני)'}
              {tempVal === 1.0 && '"פיצה מעופפת שרה אופרה!" (דמיון פרוע)'}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
