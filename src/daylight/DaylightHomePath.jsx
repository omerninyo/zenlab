import React, { useState, useEffect, useRef } from 'react';
import {
  Star,
  BookOpen,
  Volume2,
  VolumeX,
  Settings,
  Check,
  Play,
  Video,
  Award,
  Gift,
  Lock,
  HelpCircle,
  Flame,
  X
} from 'lucide-react';
import { JOURNEY_CHAPTERS, LAB_METADATA, LAB_ICONS } from '../core/labMeta.js';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { fireChampagneConfetti } from '../core/confetti.js';
import ZenMascot from './ZenMascot.jsx';
import MediaDrawerModal from './MediaDrawerModal.jsx';
import DaylightTutorModal from './DaylightTutorModal.jsx';

const UNIT_PALETTES = {
  world1: { bg: '#58CC02', lip: '#58A700' },
  world2: { bg: '#1CB0F6', lip: '#1899D6' },
  world3: { bg: '#FF9600', lip: '#E08200' },
  world4: { bg: '#CE82FF', lip: '#A560E8' }
};

const UNIT_TROPHY_BADGES = {
  world1: {
    emoji: '🤖',
    title: 'תג מפענח הביטים והרובוטים',
    subtitle: 'סיימתם בהצלחה את עולם שפת המכונה והאלגוריתמים!',
    funFact:
      'עובדת בונוס: החללית וויאג׳ר של נאס״א טסה כבר מחוץ למערכת השמש עם זיכרון קטן פי אלף מתמונה אחת בטלפון שלכם!'
  },
  world2: {
    emoji: '🧭',
    title: 'תג נווט החידות החכם',
    subtitle: 'פיצחתם את עצי ההחלטות ואת סוד הניווט הקצר של מפות!',
    funFact:
      'עובדת בונוס: רכבי המחקר על מאדים משתמשים באלגוריתם ניווט דומה ל-A* כדי לתכנן מסלול עוקף סלעים לבד לגמרי!'
  },
  world3: {
    emoji: '🍎',
    title: 'תג מאמן המכונות והראייה',
    subtitle: 'לימדתם את המחשב ללמוד מדוגמאות ולראות קווים בפיקסלים!',
    funFact:
      'עובדת בונוס: בשמורות טבע בעולם פועלות מצלמות שמזהות בעלי חיים נדירים בלילה בעזרת פילטרים של ראייה ממוחשבת!'
  },
  world4: {
    emoji: '🧠',
    title: 'תג אדריכל המוח המלאכותי',
    subtitle: 'השלמתם את המסע כולו — מנוירון בודד ועד למודלי שפה חכמים!',
    funFact:
      'עובדת בונוס: במוח שלנו פועלים כ-86 מיליארד נוירונים שמשגרים אותות זה לזה בצריכת חשמל של נורה קטנה אחת בלבד!'
  }
};

function getExplorerRank(totalStars) {
  if (totalStars >= 24) {
    return { title: 'מאסטר בינה מלאכותית', nextStars: 24, tier: 5 };
  }
  if (totalStars >= 18) {
    return { title: 'מהנדס/ת למידת מכונה', nextStars: 24, tier: 4 };
  }
  if (totalStars >= 12) {
    return { title: 'נווט/ת אלגוריתמים', nextStars: 18, tier: 3 };
  }
  if (totalStars >= 6) {
    return { title: 'בלש/ית לוגיקה', nextStars: 12, tier: 2 };
  }
  return { title: 'חוקר/ת מתחיל/ה', nextStars: 6, tier: 1 };
}

export default function DaylightHomePath({
  curriculum,
  labStars = {},
  totalStars = 0,
  onSelectLab,
  onOpenCertificate,
  onOpenGlossary,
  onOpenSettings
}) {
  const allLabIds = ['lab1', 'lab2', 'lab3', 'lab4', 'lab5', 'lab6', 'lab7', 'lab8'];
  const currentActiveLabId = allLabIds.find((id) => (labStars[id] || 0) < 3) || 'lab8';

  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [mediaLabId, setMediaLabId] = useState(null);
  const [isTutorOpen, setIsTutorOpen] = useState(false);
  const [activeChestWorldId, setActiveChestWorldId] = useState(null);

  const [storageMeta, setStorageMeta] = useState(() => {
    const s = StorageEngine.getState();
    return {
      isMuted: s.isMuted,
      labStepProgress: s.labStepProgress || {},
      bestStreak: Number(s.bestStreak) || 0,
      openedChests: s.openedChests || {}
    };
  });

  const chestDialogRef = useRef(null);
  const pointerOutsideChestRef = useRef(false);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'ZenLab | הרפתקת מדעי המחשב ובינה מלאכותית לילדים';
    }
    const unsub = StorageEngine.subscribe((s) => {
      setStorageMeta({
        isMuted: Boolean(s.isMuted),
        labStepProgress: s.labStepProgress || {},
        bestStreak: Number(s.bestStreak) || 0,
        openedChests: s.openedChests || {}
      });
    });
    return unsub;
  }, []);

  useEffect(() => {
    const dlg = chestDialogRef.current;
    if (!dlg) return;
    if (activeChestWorldId && !dlg.open) {
      dlg.showModal();
    } else if (!activeChestWorldId && dlg.open) {
      dlg.close();
    }
  }, [activeChestWorldId]);

  useEffect(() => {
    const dlg = chestDialogRef.current;
    if (!dlg) return;
    const onNativeClose = () => {
      dlg.returnValue = '';
      setActiveChestWorldId(null);
    };
    dlg.addEventListener('close', onNativeClose);
    return () => dlg.removeEventListener('close', onNativeClose);
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !storageMeta.isMuted;
    StorageEngine.setMuted(nextMuted);
    if (!nextMuted) AudioEngine.playStep();
  };

  const handleOpenUnitChest = (worldId) => {
    const wasOpened = Boolean(storageMeta.openedChests?.[worldId]);
    StorageEngine.openChest(worldId);
    if (!wasOpened) {
      AudioEngine.playUnlock();
      fireChampagneConfetti();
    } else {
      AudioEngine.playStep();
    }
    setActiveChestWorldId(worldId);
  };

  const activeMeta = LAB_METADATA[currentActiveLabId] || {};
  const activeSavedStep = storageMeta.labStepProgress?.[currentActiveLabId] || 0;
  const explorerRank = getExplorerRank(totalStars);

  const greetingText =
    totalStars === 24
      ? 'כל הכבוד! סיימתם את כל 8 התחנות ואספתם 24 כוכבים. תעודת ההצטיינות שלכם מוכנה!'
      : `שלום! אני זֶן. בואו נגלה איך מחשבים ובינה מלאכותית פועלים — התחנה הבאה שלנו היא "${activeMeta.title}".`;

  const mediaLabData = mediaLabId ? curriculum?.labs?.[mediaLabId] : null;
  const activeChestBadge = activeChestWorldId ? UNIT_TROPHY_BADGES[activeChestWorldId] : null;

  return (
    <div className="min-h-screen bg-white text-[#3C3C3C]" dir="rtl">
      {/* Sticky Minimal Top Navigation Bar */}
      <header className="sticky top-0 z-30 h-16 bg-white border-b-2 border-[#E5E5E5]">
        <div className="max-w-3xl mx-auto h-full px-3 sm:px-6 flex items-center justify-between gap-2">
          {/* Right (RTL): Wordmark */}
          <div className="flex items-baseline gap-2.5 shrink-0">
            <span className="font-['Rubik'] font-extrabold text-2xl text-[#58CC02] tracking-tight">
              ZenLab
            </span>
            <span className="text-xs font-bold text-[#777777] hidden sm:inline">
              מדעי המחשב ו-AI לילדים
            </span>
          </div>

          {/* Left (RTL): Stars, Glossary, Zen Help, Mute, Settings */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              id="zen-stars-header-badge"
              type="button"
              onClick={() => {
                AudioEngine.playStep();
                onOpenCertificate?.();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] font-extrabold text-sm text-[#3C3C3C] cursor-pointer transition-colors"
              title="תעודת הצטיינות"
            >
              <Star className="w-4 h-4 fill-[#FFC800] text-[#FFC800] shrink-0" />
              <span dir="ltr" className="font-mono">
                {totalStars} <span className="text-[#AFAFAF] text-xs">/ 24</span>
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                AudioEngine.playStep();
                onOpenGlossary?.();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] font-bold text-sm text-[#4B4B4B] cursor-pointer transition-colors"
              title="מילון מושגים"
            >
              <BookOpen className="w-4 h-4 text-[#1CB0F6] shrink-0" />
              <span className="hidden sm:inline">מילון</span>
            </button>

            <button
              type="button"
              onClick={() => {
                AudioEngine.playStep();
                setIsTutorOpen(true);
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] font-bold text-sm text-[#4B4B4B] cursor-pointer transition-colors"
              title="שאלו את זֶן החונך"
              aria-label="שאלו את זֶן החונך"
            >
              <HelpCircle className="w-4 h-4 text-[#FF9600] shrink-0" />
              <span className="hidden md:inline">שאל את זֶן</span>
            </button>

            <button
              type="button"
              onClick={handleToggleMute}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] flex items-center justify-center text-[#4B4B4B] cursor-pointer transition-colors"
              aria-label={storageMeta.isMuted ? 'הפעלת צלילים' : 'השתקת צלילים'}
              title={storageMeta.isMuted ? 'הפעלת צלילים' : 'השתקת צלילים'}
            >
              {storageMeta.isMuted ? (
                <VolumeX className="w-4 h-4 text-[#AFAFAF]" />
              ) : (
                <Volume2 className="w-4 h-4 text-[#1CB0F6]" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                AudioEngine.playStep();
                onOpenSettings?.();
              }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] flex items-center justify-center text-[#4B4B4B] cursor-pointer transition-colors"
              aria-label="הגדרות כיתה"
              title="הגדרות כיתה"
            >
              <Settings className="w-4 h-4 text-[#777777]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Learning Path */}
      <main className="max-w-lg mx-auto px-4 py-6 sm:py-8 space-y-8 pb-20">
        {/* Top Greeting with Zen Mascot */}
        <section>
          <ZenMascot
            pose={totalStars === 24 ? 'cheer' : 'wave'}
            size="md"
            message={greetingText}
            audioSrc="/audio/tutor/home_welcome.mp3?v=1.0.0"
            spokenFallback={greetingText}
          />
        </section>

        {/* Explorer Rank & Continue Quest Card */}
        <section className="card-duo p-4 sm:p-5 space-y-3.5 bg-[#F7F7F5]">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-[#FFFDF2] border-2 border-[#FFC800] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-[#E5A800]" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#777777]">הדרגה שלכם במסע:</div>
                <div className="text-sm sm:text-base font-extrabold text-[#3C3C3C]">
                  {explorerRank.title}
                </div>
              </div>
            </div>

            {storageMeta.bestStreak >= 2 && (
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#FFF0D6] border border-[#FF9600] text-[#E08200] text-xs font-extrabold">
                <Flame className="w-3.5 h-3.5 fill-[#FF9600] text-[#FF9600]" />
                <span>שיא רצף: {storageMeta.bestStreak}</span>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-[#777777]">
              <span>התקדמות כללית</span>
              <span>
                {totalStars === 24
                  ? 'הושלמו 24 מתוך 24 כוכבים!'
                  : `עוד ${explorerRank.nextStars - totalStars} כוכבים לדרגה הבאה`}
              </span>
            </div>
            <progress
              className="progress-duo w-full h-3"
              value={totalStars}
              max={24}
              aria-label="התקדמות הכוכבים הכוללת"
            />
          </div>

          <button
            type="button"
            onClick={() => {
              AudioEngine.playStep();
              if (totalStars === 24) {
                onOpenCertificate?.();
              } else {
                onSelectLab?.(currentActiveLabId);
              }
            }}
            className="btn-duo-green w-full py-3 px-4 text-sm sm:text-base"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>
              {totalStars === 24
                ? 'פתיחת תעודת ההצטיינות הרשמית'
                : activeSavedStep > 0
                ? `המשיכו תחנה ${activeMeta.number} (שלב ${activeSavedStep + 1})`
                : `המשיכו לתחנה ${activeMeta.number}: ${activeMeta.shortLabel || activeMeta.title}`}
            </span>
          </button>
        </section>

        {/* 4 Units + Stepping-Stone Path + Unit Milestone Trophy Chests */}
        {JOURNEY_CHAPTERS.map((chapter, unitIdx) => {
          const palette = UNIT_PALETTES[chapter.id] || UNIT_PALETTES.world1;
          const unitStars = chapter.labIds.reduce((sum, id) => sum + (labStars[id] || 0), 0);
          const isUnitComplete = unitStars === 6;
          const isChestOpened = Boolean(storageMeta.openedChests?.[chapter.id]);
          const badgeInfo = UNIT_TROPHY_BADGES[chapter.id];

          return (
            <section key={chapter.id} className="space-y-6">
              {/* Solid Unit Banner */}
              <div
                className="rounded-2xl p-4 sm:p-5 text-white"
                style={{
                  backgroundColor: palette.bg,
                  boxShadow: `0 4px 0 ${palette.lip}`
                }}
              >
                <div className="flex items-center justify-between gap-2 text-xs font-bold opacity-90 mb-0.5">
                  <span>יחידה {chapter.number}</span>
                  <span>{unitStars} / 6 כוכבים</span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold leading-snug">
                  {chapter.title}
                </h2>
                <p className="text-xs sm:text-sm font-medium opacity-95 mt-1 leading-relaxed">
                  {chapter.subtitle}
                </p>
              </div>

              {/* Unit Station Nodes (S-Curve Stepping Stones) */}
              <div className="flex flex-col items-center gap-8 py-2">
                {chapter.labIds.map((labId, nodeIdx) => {
                  const meta = LAB_METADATA[labId] || {};
                  const labData = curriculum?.labs?.[labId] || {};
                  const Icon = LAB_ICONS[labId] || meta.icon || Star;
                  const stars = labStars[labId] || 0;
                  const savedStep = storageMeta.labStepProgress?.[labId] || 0;
                  const isCompleted = stars === 3;
                  const isCurrent = labId === currentActiveLabId;
                  const isSelected = selectedNodeId === labId;

                  const offsetPx =
                    nodeIdx % 2 === 0
                      ? 0
                      : unitIdx % 2 === 0
                      ? -36
                      : 36;

                  const nodeFill = isCompleted ? '#58CC02' : palette.bg;
                  const nodeLip = isCompleted ? '#58A700' : palette.lip;

                  return (
                    <div
                      key={labId}
                      className="w-full flex flex-col items-center"
                    >
                      <div
                        className="flex flex-col items-center relative"
                        style={{ transform: `translateX(${offsetPx}px)` }}
                      >
                        {/* Start Callout Pill above Recommended Station */}
                        {isCurrent && (
                          <div className="mb-2 px-3 py-1 rounded-xl bg-white border-2 border-[#E5E5E5] text-[#58CC02] font-extrabold text-xs tracking-wide relative">
                            <span>{savedStep > 0 ? 'המשיכו כאן!' : 'התחילו!'}</span>
                            <span
                              aria-hidden="true"
                              className="absolute left-1/2 -translate-x-1/2 -bottom-[6px] w-2.5 h-2.5 bg-white border-b-2 border-r-2 border-[#E5E5E5] rotate-45"
                            />
                          </div>
                        )}

                        {/* Circular Tactile Stepping-Stone Button */}
                        <button
                          type="button"
                          onClick={() => {
                            AudioEngine.playStep();
                            setSelectedNodeId((prev) => (prev === labId ? null : labId));
                          }}
                          className={`w-20 h-20 rounded-full flex items-center justify-center relative cursor-pointer transition-transform active:translate-y-[5px] ${
                            isSelected ? 'ring-4 ring-[#84D8FF] ring-offset-4 ring-offset-white' : ''
                          }`}
                          style={{
                            backgroundColor: nodeFill,
                            boxShadow: `0 6px 0 ${nodeLip}`
                          }}
                          aria-expanded={isSelected}
                          aria-label={`תחנה ${meta.number}: ${meta.title}`}
                        >
                          <Icon className="w-8 h-8 text-white stroke-[2.25]" />
                          {isCompleted && (
                            <span className="absolute -top-1 -left-1 w-6 h-6 rounded-full bg-[#FFC800] border-2 border-white flex items-center justify-center text-[#3C3C3C]">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </span>
                          )}
                        </button>

                        {/* Clear Station Title Always Visible Underneath */}
                        <div className="mt-3 text-center">
                          <div className="text-sm sm:text-base font-extrabold text-[#3C3C3C]">
                            {meta.number}. {meta.title}
                          </div>

                          {/* 3 Crisp Stars */}
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {[1, 2, 3].map((n) => (
                              <Star
                                key={n}
                                className={`w-4 h-4 ${
                                  n <= stars
                                    ? 'fill-[#FFC800] text-[#FFC800]'
                                    : 'fill-[#E5E5E5] text-[#E5E5E5]'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Clean Expandable Duolingo Start Card */}
                      {isSelected && (
                        <div className="mt-4 w-full max-w-sm bg-white border-2 border-[#E5E5E5] rounded-2xl p-5 text-center space-y-3">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-center gap-2 flex-wrap">
                              <h3 className="text-base font-extrabold text-[#3C3C3C]">
                                תחנה {meta.number}: {meta.title}
                              </h3>
                              {savedStep > 0 && !isCompleted && (
                                <span className="px-2.5 py-0.5 rounded-xl bg-[#DDF4FF] border border-[#84D8FF] text-[#1899D6] text-xs font-extrabold">
                                  שלב {savedStep + 1} שמור
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-[#4B4B4B] leading-relaxed">
                              {labData.subtitle}
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row items-stretch gap-2.5 pt-1">
                            {labData.media?.video?.localSrc && (
                              <button
                                type="button"
                                onClick={() => {
                                  AudioEngine.playStep();
                                  setMediaLabId(labId);
                                }}
                                className="btn-duo-white px-4 py-3 text-sm shrink-0"
                              >
                                <Video className="w-4 h-4 text-[#1CB0F6]" />
                                <span>סרטון הכנה</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                AudioEngine.playStep();
                                onSelectLab?.(labId);
                              }}
                              className="btn-duo-green flex-1 px-5 py-3 text-base"
                            >
                              <Play className="w-4 h-4 fill-current" />
                              <span>
                                {isCompleted
                                  ? 'שחקו שוב'
                                  : savedStep > 0
                                  ? 'המשיכו מהשלב ששמרתם'
                                  : 'התחילו שיעור'}
                              </span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Unit Milestone Trophy Chest */}
                <div className="pt-1 flex justify-center">
                  {isUnitComplete ? (
                    <button
                      type="button"
                      onClick={() => handleOpenUnitChest(chapter.id)}
                      className="btn-duo-yellow px-5 py-2.5 text-sm"
                    >
                      <Gift className="w-4 h-4 shrink-0" />
                      <span>
                        {isChestOpened
                          ? `${badgeInfo?.title || `פרס יחידה ${chapter.number}`} (פתחו)`
                          : `פתחו את פרס יחידה ${chapter.number}!`}
                      </span>
                    </button>
                  ) : (
                    <div className="px-4 py-2 rounded-2xl bg-[#F7F7F5] border-2 border-[#E5E5E5] text-xs font-bold text-[#777777] inline-flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#AFAFAF] shrink-0" />
                      <span>
                        תיבת יחידה {chapter.number} נפתחת ב-6 כוכבים ({unitStars} / 6)
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </main>

      <MediaDrawerModal
        isOpen={Boolean(mediaLabId)}
        onClose={() => setMediaLabId(null)}
        labData={mediaLabData}
      />

      <DaylightTutorModal
        isOpen={isTutorOpen}
        onClose={() => setIsTutorOpen(false)}
        currentLabId="home"
      />

      {/* Collectible Unit Trophy Chest Modal */}
      <dialog
        ref={chestDialogRef}
        closedby="any"
        aria-labelledby="chest-dialog-title"
        onPointerDown={(e) => {
          if (chestDialogRef.current) {
            const r = chestDialogRef.current.getBoundingClientRect();
            pointerOutsideChestRef.current =
              e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
          }
        }}
        onPointerUp={(e) => {
          if (pointerOutsideChestRef.current && chestDialogRef.current) {
            const r = chestDialogRef.current.getBoundingClientRect();
            const out =
              e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
            if (out) setActiveChestWorldId(null);
          }
          pointerOutsideChestRef.current = false;
        }}
        className="w-[min(92vw,460px)] p-6 rounded-3xl border-2 border-[#FFC800] bg-white text-[#3C3C3C] shadow-none"
      >
        {activeChestBadge && (
          <div className="space-y-4 text-center" dir="rtl">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setActiveChestWorldId(null)}
                className="w-9 h-9 rounded-xl border-2 border-[#E5E5E5] bg-white hover:bg-[#F7F7F7] flex items-center justify-center text-[#777777] cursor-pointer"
                aria-label="סגירת פרס"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="w-20 h-20 mx-auto rounded-3xl bg-[#FFFDF2] border-2 border-[#FFC800] flex items-center justify-center text-4xl">
              {activeChestBadge.emoji}
            </div>
            <div className="space-y-1">
              <h2 id="chest-dialog-title" className="text-xl font-extrabold text-[#3C3C3C]">
                {activeChestBadge.title}
              </h2>
              <p className="text-sm font-bold text-[#58A700]">{activeChestBadge.subtitle}</p>
            </div>
            <div className="bg-[#FFF6D6] border-2 border-[#FFC800] rounded-2xl p-4 text-right text-xs sm:text-sm font-bold text-[#4B4B4B] leading-relaxed">
              {activeChestBadge.funFact}
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveChestWorldId(null);
                AudioEngine.playStep();
              }}
              className="btn-duo-green w-full py-3 text-base"
            >
              נהדר, בחזרה למסע!
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
