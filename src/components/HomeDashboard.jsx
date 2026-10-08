import React from 'react';
import { 
  Binary, 
  Bot, 
  GitBranch, 
  Compass, 
  Network, 
  Eye, 
  Zap, 
  Sparkles, 
  Star, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  ArrowLeft, 
  Play, 
  Cpu,
  ChevronLeft
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';

const LAB_ICONS = {
  lab1: Binary,
  lab2: Bot,
  lab3: GitBranch,
  lab4: Compass,
  lab5: Network,
  lab6: Eye,
  lab7: Zap,
  lab8: Sparkles
};

export default function HomeDashboard({
  curriculum,
  labStars = {},
  totalStars = 0,
  onSelectLab,
  onOpenCertificate,
  onOpenGlossary
}) {
  const homeData = curriculum?.homeRoadmap || {};
  const heroData = homeData.hero || {};
  const guideSteps = homeData.howItWorks?.steps || [];
  const tracks = homeData.tracks || [];

  // Calculate completed labs count
  const allLabIds = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5', 'lab6', 'lab7', 'lab8'];
  const completedLabsCount = allLabIds.filter(id => (labStars[id] || 0) === 3).length;

  // Determine the next recommended station
  const nextLabId = allLabIds.find(id => (labStars[id] || 0) < 3) || 'lab8';
  const isAllCompleted = totalStars === 24;
  const nextLabData = curriculum?.labs?.[nextLabId] || {};
  const NextLabIcon = LAB_ICONS[nextLabId] || Sparkles;
  const nextLabStars = labStars[nextLabId] || 0;
  const isNextAi = nextLabData.track === 'ai' || ['lab5', 'lab6', 'lab7', 'lab8'].includes(nextLabId);

  // Student Rank calculation
  const rank = totalStars === 24 
    ? 'מאסטר בינה מלאכותית'
    : totalStars >= 16 
    ? 'חוקר/ת בינה מלאכותית מתקדם/ת'
    : totalStars >= 8
    ? 'מפתח/ת אלגוריתמים צעיר/ה'
    : 'חוקר/ת מתחיל/ה';

  const progressPercentage = Math.round((totalStars / 24) * 100);

  const handleLaunchLab = (labId) => {
    AudioEngine.playStep();
    onSelectLab(labId);
  };

  return (
    <div className="w-full space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12" dir="rtl">
      
      {/* 1. Hero Orientation & Welcome Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-slate-50 to-blue-50/40 dark:from-slate-900 dark:via-slate-900/90 dark:to-blue-950/20 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-8 shadow-xs">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800 text-xs font-bold mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{heroData.badge || 'חשיבה מחשובית ובינה מלאכותית • כיתה ה׳'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-snug sm:leading-tight mb-3">
            {heroData.title || 'מפת המסע: מביטים בודדים עד בינה מלאכותית'}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-6 max-w-2xl">
            {heroData.subtitle || 'ברוכים הבאים למעבדת המחקר שלכם! כאן תגלו בעצמכם איך מחשבים פועלים: ממתגים קטנים של 0 ו-1 ועד לרובוטים, ראייה ממוחשבת ומודלי שפה חכמים.'}
          </p>

          {/* Quick Progress Overview Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
            <div className="bg-white/80 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
              <div className="flex items-center gap-1.5 text-amber-500 mb-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">כוכבים שנצברו</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">{totalStars}</span>
                <span className="text-xs text-slate-500 font-medium">/ 24</span>
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs">
              <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">מעבדות שהושלמו</span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">{completedLabsCount}</span>
                <span className="text-xs text-slate-500 font-medium">/ 8</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenCertificate}
              className="col-span-2 sm:col-span-1 bg-white/80 hover:bg-white dark:bg-slate-800/60 dark:hover:bg-slate-800 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xs text-right transition-colors group cursor-pointer"
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                  <Award className="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-300">דרגת מפתח</span>
                </div>
                <ChevronLeft className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-transform group-hover:-translate-x-0.5" />
              </div>
              <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate block">
                {rank}
              </span>
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4 pt-1">
            <div className="flex justify-between items-center text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              <span>התקדמות כללית במסלול</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">{progressPercentage}% הושלם</span>
            </div>
            <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progressPercentage, 4)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. "התחנה הבאה שלך" / Quick Launch Recommended Station */}
      <section className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md ${
              isAllCompleted 
                ? 'bg-amber-500 shadow-amber-500/20' 
                : isNextAi 
                ? 'bg-indigo-600 shadow-indigo-600/20' 
                : 'bg-blue-600 shadow-blue-600/20'
            }`}>
              {isAllCompleted ? <Award className="w-7 h-7" /> : <NextLabIcon className="w-7 h-7" />}
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {isAllCompleted ? 'המסלול הושלם!' : 'התחנה המומלצת הבאה שלך'}
                </span>
                {!isAllCompleted && (
                  <span className="text-xs font-mono font-bold text-amber-500 flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                    <span>{nextLabStars}/3 כוכבים</span>
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                {isAllCompleted 
                  ? 'כל הכבוד! השלמתם את כל 8 המעבדות!' 
                  : nextLabData.title || `מעבדה ${nextLabData.number}`}
              </h2>

              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium line-clamp-1 max-w-xl">
                {isAllCompleted
                  ? 'זכיתם בכל 24 הכוכבים ובתואר מאסטר בינה מלאכותית. לחצו לצפייה בתעודת ההצטיינות שלכם!'
                  : nextLabData.subtitle || 'המשיכו במעבדה וצברו כוכבים נוספים'}
              </p>
            </div>
          </div>

          <div className="w-full sm:w-auto shrink-0">
            {isAllCompleted ? (
              <button
                type="button"
                onClick={onOpenCertificate}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>צפייה בתעודת ההצטיינות</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleLaunchLab(nextLabId)}
                className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${
                  isNextAi 
                    ? 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20' 
                    : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                }`}
              >
                <Play className="w-4 h-4 fill-white" />
                <span>{nextLabStars === 0 ? 'התחילו את המעבדה' : 'המשיכו במעבדה'}</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 3. Visual 3-Step Guide: How to Learn Independently */}
      <section className="space-y-3">
        <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 px-1">
          {homeData.howItWorks?.title || 'איך לומדים וחוקרים כאן? 3 צעדים פשוטים'}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {guideSteps.map((step, idx) => {
            const icons = [BookOpen, Zap, Award];
            const StepIcon = icons[idx] || Sparkles;
            const stepColors = [
              'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300',
              'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
              'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
            ];

            return (
              <div 
                key={step.step}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3.5 shadow-xs"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${stepColors[idx]}`}>
                  <StepIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mb-1">
                    {step.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Scaffolded Journey Map: 2 Core Tracks */}
      <section className="space-y-6">
        {tracks.map((track) => {
          const isAiTrack = track.id === 'ai';
          const trackBorder = isAiTrack 
            ? 'border-indigo-200/80 dark:border-indigo-900/60' 
            : 'border-blue-200/80 dark:border-blue-900/60';
          const trackAccentBg = isAiTrack
            ? 'bg-indigo-50/60 dark:bg-indigo-950/20'
            : 'bg-blue-50/60 dark:bg-blue-950/20';

          return (
            <div 
              key={track.id}
              className={`rounded-3xl border ${trackBorder} ${trackAccentBg} p-4 sm:p-6 space-y-4`}
            >
              {/* Track Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isAiTrack 
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' 
                        : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                    }`}>
                      מסלול {track.letter}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                      {track.title}
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {track.subtitle}
                  </p>
                </div>

                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 self-start sm:self-auto mt-1 sm:mt-0">
                  4 מעבדות מחקר
                </div>
              </div>

              {/* 4 Lab Cards in Track */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {track.labIds.map((labId) => {
                  const lab = curriculum?.labs?.[labId];
                  if (!lab) return null;
                  const Icon = LAB_ICONS[labId] || Cpu;
                  const stars = labStars[labId] || 0;
                  const isCompleted = stars === 3;
                  const isInProgress = stars > 0 && stars < 3;

                  return (
                    <div
                      key={labId}
                      className={`relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 p-4 sm:p-4.5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md ${
                        isCompleted
                          ? 'border-emerald-300 dark:border-emerald-800/80 ring-1 ring-emerald-400/20'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div>
                        {/* Card Header: Icon, Number & Stars */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs ${
                              isAiTrack ? 'bg-indigo-600' : 'bg-blue-600'
                            }`}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 block leading-tight">
                                מעבדה {lab.number}
                              </span>
                              <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                                {lab.title}
                              </h4>
                            </div>
                          </div>

                          {/* Star Visual Indicator */}
                          <div className="flex items-center gap-0.5 bg-amber-50 dark:bg-slate-800/80 px-2 py-1 rounded-xl border border-amber-200/60 dark:border-slate-700 shrink-0">
                            {[1, 2, 3].map((starIdx) => (
                              <Star
                                key={starIdx}
                                className={`w-3.5 h-3.5 ${
                                  starIdx <= stars
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-slate-300 dark:text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Child-Friendly Subtitle / Plain Explanation */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed line-clamp-2">
                          {lab.subtitle}
                        </p>
                      </div>

                      {/* Card Footer: Status Badge & CTA Button */}
                      <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80">
                        <div>
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>הושלם בהצטיינות</span>
                            </span>
                          ) : isInProgress ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800/60">
                              <span>בתהליך ({stars}/3)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                              <span>מוכן להתחלה</span>
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleLaunchLab(labId)}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-xs ${
                            isCompleted
                              ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                              : isAiTrack
                              ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                              : 'bg-blue-600 hover:bg-blue-500 text-white'
                          }`}
                        >
                          <span>{isCompleted ? 'כניסה חוזרת' : stars > 0 ? 'המשיכו' : 'כניסה'}</span>
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </section>

      {/* 5. Quick Tools Footer Links */}
      <section className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t border-slate-200/80 dark:border-slate-800 text-xs font-bold">
        <button
          type="button"
          onClick={onOpenGlossary}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shadow-xs"
        >
          <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>מילון מושגים לחוקרי AI</span>
        </button>

        <button
          type="button"
          onClick={onOpenCertificate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900/60 border border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-300 transition-colors cursor-pointer shadow-xs"
        >
          <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>תעודת סיום והצטיינות</span>
        </button>
      </section>

    </div>
  );
}
