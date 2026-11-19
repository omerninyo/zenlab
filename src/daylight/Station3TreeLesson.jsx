import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { AIService } from '../services/ai.js';
import { LAB_METADATA } from '../core/labMeta.js';
import { fireChampagneConfetti } from '../core/confetti.js';
import ZenMascot from './ZenMascot.jsx';
import LessonShell from './LessonShell.jsx';
import { AudioHintButton, QuizStepView, RealWorldStepView } from './LessonSharedViews.jsx';

const TOTAL_STEPS = 7;

const ANIMAL_EMOJIS = {
  bat: '🦇',
  eagle: '🦅',
  cat: '🐱',
  turtle: '🐢',
  dog: '🐶',
  sparrow: '🐦',
  ostrich: '🦤',
  lizard: '🦎',
  custom: '🐾'
};

const CUSTOM_ANIMAL_EMOJIS = ['🐧', '🐬', '🦊', '🦉', '🐸', '🦁'];

function AnimalChip({ animal, isSelected, onClick }) {
  const emoji = animal.emoji || ANIMAL_EMOJIS[animal.id] || ANIMAL_EMOJIS.custom;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-2xl border-2 text-xs sm:text-sm font-extrabold inline-flex items-center gap-1.5 cursor-pointer transition-transform active:translate-y-[2px] ${
        isSelected
          ? 'bg-[#DDF4FF] border-[#84D8FF] text-[#1899D6]'
          : 'bg-white border-[#E5E5E5] text-[#3C3C3C] hover:bg-[#F7F7F7]'
      }`}
    >
      <span className="text-base leading-none">{emoji}</span>
      <span>{animal.name}</span>
    </button>
  );
}

export default function Station3TreeLesson({
  curriculum,
  onExit,
  onNextStation,
  onOpenCertificate
}) {
  const labData = curriculum?.labs?.lab3 || {};
  const labMeta = LAB_METADATA.lab3;
  const dataset = labData.dataset || [];
  const extendedDataset = labData.extendedDataset || [];
  const attributes = labData.attributes || [];

  const [step, setStep] = useState(() => {
    const saved = StorageEngine.getLabStep('lab3');
    return saved < TOTAL_STEPS - 1 ? saved : 0;
  });
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestLessonStreak, setBestLessonStreak] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Step 0 warmup filter explorer
  const [warmupAttr, setWarmupAttr] = useState('canFly');

  // Tree state (shared across Steps 1, 3, 4, 5)
  const [rootAttr, setRootAttr] = useState('');
  const [yesBranchAttr, setYesBranchAttr] = useState(''); // Maps to AIService `leftAttr`
  const [noBranchAttr, setNoBranchAttr] = useState(''); // Maps to AIService `rightAttr`
  const [activeAnimalId, setActiveAnimalId] = useState(null);

  // Quiz state (Step 2)
  const [quizChoice, setQuizChoice] = useState(null);

  // Step 5 Sandbox: Extended + Custom animal
  const [includeExtended, setIncludeExtended] = useState(true);
  const [customAnimals, setCustomAnimals] = useState(() => StorageEngine.getCustomAnimals());
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🐧');
  const [newCanFly, setNewCanFly] = useState(false);
  const [newHasFur, setNewHasFur] = useState(false);
  const [newHasShell, setNewHasShell] = useState(false);
  const [newLegs4, setNewLegs4] = useState(false);

  const treeEval = useMemo(() => {
    if (!rootAttr) {
      return {
        accuracy: 0,
        leafPurity: 0,
        nodes: {
          leftGroup: { count: 0, items: [] },
          rightGroup: { count: 0, items: [] },
          leafLL: { count: 0, items: [], isSingle: false },
          leafLR: { count: 0, items: [], isSingle: false },
          leafRL: { count: 0, items: [], isSingle: false },
          leafRR: { count: 0, items: [], isSingle: false }
        }
      };
    }
    return AIService.evaluateDecisionTree(dataset, {
      rootAttr,
      leftAttr: yesBranchAttr,
      rightAttr: noBranchAttr,
      isSingleItemMode: true
    });
  }, [dataset, rootAttr, yesBranchAttr, noBranchAttr]);

  const sandboxDataset = useMemo(() => {
    const base = includeExtended ? [...dataset, ...extendedDataset] : [...dataset];
    return [...base, ...customAnimals];
  }, [dataset, extendedDataset, includeExtended, customAnimals]);

  const sandboxEval = useMemo(() => {
    return AIService.evaluateDecisionTree(sandboxDataset, {
      rootAttr: rootAttr || 'canFly',
      leftAttr: yesBranchAttr || 'hasFur',
      rightAttr: noBranchAttr || 'hasShell',
      isSingleItemMode: true
    });
  }, [sandboxDataset, rootAttr, yesBranchAttr, noBranchAttr]);

  const goToStep = (nextStep) => {
    const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, nextStep));
    setFeedback(null);
    setRetryCount(0);
    setStep(clamped);
    StorageEngine.setLabStep('lab3', clamped);
    AudioEngine.playStep();
  };

  const recordPass = (message) => {
    const nextStreak = retryCount === 0 ? streak + 1 : 1;
    setStreak(nextStreak);
    if (nextStreak > bestLessonStreak) setBestLessonStreak(nextStreak);
    StorageEngine.recordStreak(nextStreak);
    if (nextStreak >= 2) AudioEngine.playCombo(nextStreak);
    else AudioEngine.playSuccess();
    setFeedback({ status: 'pass', text: message });
  };

  const recordRetry = (message) => {
    setStreak(0);
    setRetryCount((c) => c + 1);
    AudioEngine.playError();
    setFeedback({ status: 'retry', text: message });
  };

  const handleAddCustomAnimal = (e) => {
    e.preventDefault();
    const clean = newName.trim();
    if (!clean) return;
    const item = {
      id: `custom_${Date.now()}`,
      name: clean,
      emoji: newEmoji,
      canFly: newCanFly,
      hasFur: newHasFur,
      hasShell: newHasShell,
      legs: newLegs4 ? 4 : 2,
      species: newHasFur ? 'יונק' : newCanFly ? 'עוף' : 'אחר'
    };
    const next = StorageEngine.addCustomAnimal(item);
    setCustomAnimals(next);
    setNewName('');
    AudioEngine.playCollect();
  };

  const handleBottomAction = () => {
    if (feedback?.status === 'pass') {
      if (step < TOTAL_STEPS - 1) goToStep(step + 1);
      else setIsLessonComplete(true);
      return;
    }
    if (feedback?.status === 'retry') {
      setFeedback(null);
      return;
    }

    if (step === 0 || step === 5) {
      goToStep(step + 1);
      return;
    }

    if (step === 1) {
      if (rootAttr === 'canFly') {
        StorageEngine.completeChallenge('lab3', 'lab3_challenge1', 1);
        recordPass(
          labData.challenges?.[0]?.successMessage ||
            'שאלה מעולה! המעופפים פוצלו לקבוצת כן (2) והיבשתיים לקבוצת לא (2).'
        );
      } else {
        const trueCount = treeEval.nodes.leftGroup.count;
        const falseCount = treeEval.nodes.rightGroup.count;
        recordRetry(
          `שאלה זו מפצלת ל-${trueCount} מול ${falseCount}. נסו למצוא שאלה שמחלקת בדיוק חצי-חצי (2 מול 2)!`
        );
      }
      return;
    }

    if (step === 2) {
      const q = labMeta.miniQuiz[1];
      if (quizChoice === q.correctIndex) {
        recordPass(q.explanation);
      } else {
        recordRetry('נסו שוב: איזו זוג חיות יודעות לעוף באוויר?');
      }
      return;
    }

    if (step === 3) {
      if (treeEval.accuracy >= 50) {
        StorageEngine.completeChallenge('lab3', 'lab3_challenge2', 1);
        recordPass(
          labData.challenges?.[1]?.successMessage ||
            'יופי של שאלת המשך! שתי החיות בענף קיבלו עלים נפרדים משלהן.'
        );
      } else {
        recordRetry(
          'השאלה שבחרתם לא הפרידה בין שתי החיות באותו ענף — שתיהן קיבלו אותה תשובה! נסו שאלה כמו "בעל פרווה?" או "בעל שריון?".'
        );
      }
      return;
    }

    if (step === 4) {
      if (treeEval.accuracy === 100) {
        StorageEngine.completeChallenge('lab3', 'lab3_challenge1', 1);
        StorageEngine.completeChallenge('lab3', 'lab3_challenge2', 1);
        StorageEngine.completeChallenge('lab3', 'lab3_challenge3', 1);
        fireChampagneConfetti();
        recordPass(
          labData.challenges?.[2]?.successMessage ||
            'בלשות מושלמת! העץ מזהה כל אחת מ-4 החיות בדיוק של 100% בלי שום בלבול.'
        );
      } else {
        recordRetry(
          `הדיוק כרגע הוא ${treeEval.accuracy}%. ודאו שבענף "כן" שאלתם על פרווה, ובענף "לא" שאלתם על שריון (או פרווה/רגליים) כך שלכל חיה יהיה עלה לבד!`
        );
      }
      return;
    }

    if (step === 6) {
      setIsLessonComplete(true);
    }
  };

  const isActionDisabled = useMemo(() => {
    if (feedback) return false;
    if (step === 1) return !rootAttr;
    if (step === 2) return quizChoice === null;
    if (step === 3) return !yesBranchAttr && !noBranchAttr;
    if (step === 4) return !yesBranchAttr || !noBranchAttr;
    return false;
  }, [feedback, step, rootAttr, quizChoice, yesBranchAttr, noBranchAttr]);

  const primaryButtonLabel = useMemo(() => {
    if (feedback?.status === 'pass') return step === TOTAL_STEPS - 1 ? 'סיום השיעור!' : 'המשך';
    if (feedback?.status === 'retry') return 'נסה שוב';
    if (step === 0 || step === 5) return 'המשך';
    if (step === 6) return 'סיום השיעור!';
    return 'בדיקה';
  }, [feedback, step]);

  const hintConfig = useMemo(() => {
    if (step === 1) {
      return { text: labData.challenges?.[0]?.hint, audioSrc: '/audio/hints/lab3_ch1.mp3?v=3.1.1' };
    }
    if (step === 3) {
      return { text: labData.challenges?.[1]?.hint, audioSrc: '/audio/hints/lab3_ch2.mp3?v=3.1.1' };
    }
    if (step === 4) {
      return { text: labData.challenges?.[2]?.hint, audioSrc: '/audio/hints/lab3_ch3.mp3?v=3.1.1' };
    }
    return { text: '', audioSrc: '' };
  }, [step, labData.challenges]);

  const renderWarmupGroups = useMemo(() => {
    const yesList = dataset.filter((item) => AIService.testTreeAttribute(item, warmupAttr));
    const noList = dataset.filter((item) => !AIService.testTreeAttribute(item, warmupAttr));
    return { yesList, noList };
  }, [dataset, warmupAttr]);

  const isTreeStep = step === 1 || step === 3 || step === 4;
  const activeAnimal = dataset.find((a) => a.id === activeAnimalId) || null;
  const highlightedLeafKey = useMemo(() => {
    if (!activeAnimal || !rootAttr) return null;
    const rootRes = AIService.testTreeAttribute(activeAnimal, rootAttr);
    if (rootRes) {
      if (!yesBranchAttr) return 'leftGroup';
      return AIService.testTreeAttribute(activeAnimal, yesBranchAttr) ? 'leafLL' : 'leafLR';
    }
    if (!noBranchAttr) return 'rightGroup';
    return AIService.testTreeAttribute(activeAnimal, noBranchAttr) ? 'leafRL' : 'leafRR';
  }, [activeAnimal, rootAttr, yesBranchAttr, noBranchAttr]);

  return (
    <LessonShell
      labId="lab3"
      labData={labData}
      totalSteps={TOTAL_STEPS}
      step={step}
      onStepChange={goToStep}
      isLessonComplete={isLessonComplete}
      onExit={onExit}
      onNextStation={onNextStation}
      onOpenCertificate={onOpenCertificate}
      feedback={feedback}
      isActionDisabled={isActionDisabled}
      primaryButtonLabel={primaryButtonLabel}
      onPrimaryAction={handleBottomAction}
      hintText={hintConfig.text}
      hintAudioSrc={hintConfig.audioSrc}
      streak={streak}
      bestLessonStreak={bestLessonStreak}
      retryCount={retryCount}
      victoryTitle="בלשי לוגיקה! בניתם עץ החלטות מושלם"
      victorySubtitle="פיצחתם איך מחשב שואל שאלות חכמות של כן ולא כדי למיין מידע במהירות."
      victoryTakeaways={[
        'עץ החלטות מחלק אפשרויות בעזרת שאלות כן ולא פשוטות — ממש כמו משחק "מי אני?".',
        'השאלה הטובה ביותר בשורש היא זו שמחלקת את האפשרויות לחצי-חצי.',
        'כשחיה חדשה (כמו יען או פינגווין) נכנסת למערכת, צריך להוסיף לה שאלות מתאימות בעץ!'
      ]}
    >
      {/* STEP 0: Warm-Up Feature Split Inspector */}
      {step === 0 && (
        <div className="max-w-xl mx-auto w-full space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C3C3C] text-center">
            משחק הניחושים של המחשב: כן או לא
          </h1>

          <ZenMascot
            pose="teach"
            size="md"
            message="כדי לזהות חיה ב-2 שאלות בלבד, מתחילים בשאלה שמחלקת את החיות לשתי קבוצות שוות!"
            audioSrc="/audio/steps/lab3_intro.mp3?v=3.1.1"
            spokenFallback="כדי לזהות חיה ב-2 שאלות בלבד, מתחילים בשאלה שמחלקת את החיות לשתי קבוצות שוות!"
          />

          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-4 sm:p-5 space-y-4">
            <div className="text-xs sm:text-sm font-extrabold text-[#3C3C3C] text-center">
              בחרו שאלה וראו איך 4 החיות מתחלקות לקבוצות:
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {attributes.map((attr) => (
                <button
                  key={attr.id}
                  type="button"
                  onClick={() => {
                    setWarmupAttr(attr.id);
                    AudioEngine.playStep();
                  }}
                  className={`px-3.5 py-2 rounded-2xl border-2 text-xs sm:text-sm font-extrabold cursor-pointer transition-colors ${
                    warmupAttr === attr.id
                      ? 'bg-[#1CB0F6] border-[#1899D6] text-white'
                      : 'bg-white border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#F7F7F7]'
                  }`}
                >
                  {attr.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#D7FFB8] border-2 border-[#58CC02] rounded-2xl p-3.5 space-y-2 text-center">
                <div className="text-xs font-extrabold text-[#467E00]">
                  כן ✓ ({renderWarmupGroups.yesList.length})
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {renderWarmupGroups.yesList.map((a) => (
                    <AnimalChip key={a.id} animal={a} onClick={() => AudioEngine.playStep()} />
                  ))}
                  {renderWarmupGroups.yesList.length === 0 && (
                    <span className="text-xs text-[#777777]">אין חיות</span>
                  )}
                </div>
              </div>

              <div className="bg-[#FFDFE0] border-2 border-[#FF4B4B] rounded-2xl p-3.5 space-y-2 text-center">
                <div className="text-xs font-extrabold text-[#B91C1C]">
                  לא ✗ ({renderWarmupGroups.noList.length})
                </div>
                <div className="flex flex-wrap justify-center gap-1.5">
                  {renderWarmupGroups.noList.map((a) => (
                    <AnimalChip key={a.id} animal={a} onClick={() => AudioEngine.playStep()} />
                  ))}
                  {renderWarmupGroups.noList.length === 0 && (
                    <span className="text-xs text-[#777777]">אין חיות</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEPS 1, 3, 4: Interactive Daylight Decision Tree Builder */}
      {isTreeStep && (
        <div className="max-w-3xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#3C3C3C]">
              {step === 1
                ? 'משימה 1: בחרו את השאלה הראשית החכמה'
                : step === 3
                ? 'משימה 2: הוסיפו שאלת המשך בענפים'
                : 'משימה 3: הפרידו את כל 4 החיות ל-100% דיוק'}
            </h1>
            <AudioHintButton
              text={
                step === 1
                  ? labData.challenges?.[0]?.instructions
                  : step === 3
                  ? labData.challenges?.[1]?.instructions
                  : labData.challenges?.[2]?.instructions
              }
              audioSrc={
                step === 1
                  ? '/audio/steps/lab3_inst1.mp3?v=3.1.1'
                  : step === 3
                  ? '/audio/steps/lab3_inst2.mp3?v=3.1.1'
                  : '/audio/steps/lab3_inst3.mp3?v=3.1.1'
              }
            />
          </div>

          {/* Clickable Animal Tracer Strip */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs font-bold text-[#777777]">לחצו על חיה למעקב במסלול:</span>
            {dataset.map((animal) => (
              <AnimalChip
                key={animal.id}
                animal={animal}
                isSelected={activeAnimalId === animal.id}
                onClick={() => {
                  setActiveAnimalId((prev) => (prev === animal.id ? null : animal.id));
                  AudioEngine.playStep();
                }}
              />
            ))}
            {rootAttr && step === 1 && (
              <span
                className={`px-3 py-1 rounded-xl border text-xs font-extrabold ${
                  treeEval.nodes.leftGroup.count === 2 && treeEval.nodes.rightGroup.count === 2
                    ? 'bg-[#D7FFB8] border-[#58CC02] text-[#467E00]'
                    : 'bg-[#FFF6D6] border-[#FFC800] text-[#9A6700]'
                }`}
              >
                חלוקת השורש: {treeEval.nodes.leftGroup.count} ב&quot;כן&quot; מול {treeEval.nodes.rightGroup.count} ב&quot;לא&quot;
              </span>
            )}
            {rootAttr && step >= 3 && (
              <span className="px-3 py-1 rounded-xl bg-[#FFF6D6] border border-[#FFC800] text-xs font-extrabold text-[#9A6700]">
                דיוק העץ: {treeEval.accuracy}%
              </span>
            )}
          </div>

          {/* Visual 2-Level Decision Tree Diagram */}
          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-4 sm:p-5 space-y-5">
            {/* Level 1: Root Question Selector */}
            <div className="max-w-md mx-auto bg-white border-2 border-[#1CB0F6] rounded-2xl p-3.5 space-y-2 text-center">
              <div className="text-xs font-extrabold text-[#1899D6]">שאלה 1 (שורש העץ)</div>
              <div className="grid grid-cols-2 gap-2">
                {attributes.map((attr) => {
                  const active = rootAttr === attr.id;
                  return (
                    <button
                      key={attr.id}
                      type="button"
                      onClick={() => {
                        setFeedback(null);
                        setRootAttr(attr.id);
                        AudioEngine.playStep();
                      }}
                      className={`px-2.5 py-2 rounded-xl border-2 text-xs font-extrabold cursor-pointer transition-colors ${
                        active
                          ? 'bg-[#1CB0F6] border-[#1899D6] text-white'
                          : 'bg-[#F7F7F5] border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#DDF4FF]'
                      }`}
                    >
                      {attr.question}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level 2: Yes / No Branches */}
            {rootAttr && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* YES Branch */}
                <div className="bg-white border-2 border-[#58CC02] rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#D7FFB8] text-[#467E00] text-xs font-extrabold">
                      תשובה: כן ✓ ({treeEval.nodes.leftGroup.count})
                    </span>
                    <div className="flex gap-1">
                      {treeEval.nodes.leftGroup.items.map((a) => (
                        <span key={a.id} title={a.name} className="text-base">
                          {ANIMAL_EMOJIS[a.id]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {step >= 3 && (
                    <>
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-[#777777]">שאלת המשך לענף &quot;כן&quot;:</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {attributes
                            .filter((a) => a.id !== rootAttr)
                            .map((attr) => (
                              <button
                                key={attr.id}
                                type="button"
                                onClick={() => {
                                  setFeedback(null);
                                  setYesBranchAttr(attr.id);
                                  AudioEngine.playStep();
                                }}
                                className={`px-2 py-1.5 rounded-xl border-2 text-xs font-bold cursor-pointer ${
                                  yesBranchAttr === attr.id
                                    ? 'bg-[#58CC02] border-[#58A700] text-white'
                                    : 'bg-[#F7F7F5] border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#D7FFB8]'
                                }`}
                              >
                                {attr.question}
                              </button>
                            ))}
                        </div>
                      </div>

                      {yesBranchAttr && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {[
                            { key: 'leafLL', label: 'כן ✓', data: treeEval.nodes.leafLL },
                            { key: 'leafLR', label: 'לא ✗', data: treeEval.nodes.leafLR }
                          ].map((leaf) => {
                            const isHot = highlightedLeafKey === leaf.key;
                            return (
                              <div
                                key={leaf.key}
                                className={`rounded-xl border-2 p-2.5 text-center space-y-1 ${
                                  isHot
                                    ? 'bg-[#DDF4FF] border-[#1CB0F6]'
                                    : leaf.data.isSingle
                                    ? 'bg-[#D7FFB8] border-[#58CC02]'
                                    : 'bg-[#F7F7F5] border-[#E5E5E5]'
                                }`}
                              >
                                <div className="text-[11px] font-bold text-[#777777]">{leaf.label}</div>
                                <div className="flex flex-wrap justify-center gap-1 min-h-[24px]">
                                  {leaf.data.items.map((a) => (
                                    <span key={a.id} className="text-xs font-extrabold text-[#3C3C3C]">
                                      {ANIMAL_EMOJIS[a.id]} {a.name}
                                    </span>
                                  ))}
                                  {leaf.data.count === 0 && (
                                    <span className="text-[11px] text-[#AFAFAF]">ריק</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* NO Branch */}
                <div className="bg-white border-2 border-[#FF4B4B] rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-[#FFDFE0] text-[#B91C1C] text-xs font-extrabold">
                      תשובה: לא ✗ ({treeEval.nodes.rightGroup.count})
                    </span>
                    <div className="flex gap-1">
                      {treeEval.nodes.rightGroup.items.map((a) => (
                        <span key={a.id} title={a.name} className="text-base">
                          {ANIMAL_EMOJIS[a.id]}
                        </span>
                      ))}
                    </div>
                  </div>

                  {step >= 3 && (
                    <>
                      <div className="space-y-1.5">
                        <div className="text-xs font-bold text-[#777777]">שאלת המשך לענף &quot;לא&quot;:</div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {attributes
                            .filter((a) => a.id !== rootAttr)
                            .map((attr) => (
                              <button
                                key={attr.id}
                                type="button"
                                onClick={() => {
                                  setFeedback(null);
                                  setNoBranchAttr(attr.id);
                                  AudioEngine.playStep();
                                }}
                                className={`px-2 py-1.5 rounded-xl border-2 text-xs font-bold cursor-pointer ${
                                  noBranchAttr === attr.id
                                    ? 'bg-[#FF9600] border-[#E08200] text-white'
                                    : 'bg-[#F7F7F5] border-[#E5E5E5] text-[#4B4B4B] hover:bg-[#FFF0D6]'
                                }`}
                              >
                                {attr.question}
                              </button>
                            ))}
                        </div>
                      </div>

                      {noBranchAttr && (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          {[
                            { key: 'leafRL', label: 'כן ✓', data: treeEval.nodes.leafRL },
                            { key: 'leafRR', label: 'לא ✗', data: treeEval.nodes.leafRR }
                          ].map((leaf) => {
                            const isHot = highlightedLeafKey === leaf.key;
                            return (
                              <div
                                key={leaf.key}
                                className={`rounded-xl border-2 p-2.5 text-center space-y-1 ${
                                  isHot
                                    ? 'bg-[#DDF4FF] border-[#1CB0F6]'
                                    : leaf.data.isSingle
                                    ? 'bg-[#D7FFB8] border-[#58CC02]'
                                    : 'bg-[#F7F7F5] border-[#E5E5E5]'
                                }`}
                              >
                                <div className="text-[11px] font-bold text-[#777777]">{leaf.label}</div>
                                <div className="flex flex-wrap justify-center gap-1 min-h-[24px]">
                                  {leaf.data.items.map((a) => (
                                    <span key={a.id} className="text-xs font-extrabold text-[#3C3C3C]">
                                      {ANIMAL_EMOJIS[a.id]} {a.name}
                                    </span>
                                  ))}
                                  {leaf.data.count === 0 && (
                                    <span className="text-[11px] text-[#AFAFAF]">ריק</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STEP 2: Quiz */}
      {step === 2 && (
        <QuizStepView
          quizItem={labMeta.miniQuiz[1]}
          selectedChoiceIdx={quizChoice}
          audioSrc="/audio/steps/lab3_quiz1.mp3?v=3.1.1"
          onSelectChoice={(idx) => {
            setFeedback(null);
            setQuizChoice(idx);
          }}
        />
      )}

      {/* STEP 5: Extended Dataset + Custom Animal Surprise */}
      {step === 5 && (
        <div className="max-w-2xl mx-auto w-full space-y-5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#3C3C3C] text-center">
            מה קורה כשמוסיפים חיות חדשות לעץ?
          </h1>

          <ZenMascot
            pose="think"
            size="sm"
            message="עם 4 חיות הגענו ל-100%, אבל ברגע שמצטרפות חיות חדשות כמו יען או פינגווין, 2 שאלות כבר לא מספיקות!"
            audioSrc="/audio/steps/lab3_step5.mp3?v=3.1.1"
            spokenFallback="עם 4 חיות הגענו ל-100%, אבל ברגע שמצטרפות חיות חדשות כמו יען או פינגווין, 2 שאלות כבר לא מספיקות!"
          />

          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs sm:text-sm font-extrabold text-[#3C3C3C]">
                טוהר הסיווג עם {sandboxDataset.length} חיות:{' '}
                <strong className="text-[#FF9600]">{sandboxEval.leafPurity}%</strong>
              </span>
              <button
                type="button"
                onClick={() => {
                  setIncludeExtended((v) => !v);
                  AudioEngine.playStep();
                }}
                className="btn-duo-white px-3 py-1.5 text-xs"
              >
                {includeExtended ? 'הסתר חיות הרחבה' : 'הוסף כלב, דרור, יען ולטאה'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {['leafLL', 'leafLR', 'leafRL', 'leafRR'].map((k, idx) => {
                const leaf = sandboxEval.leafDetails?.[k];
                if (!leaf) return null;
                return (
                  <div
                    key={k}
                    className={`rounded-2xl border-2 p-2.5 text-center space-y-1 ${
                      leaf.isPure ? 'bg-[#D7FFB8] border-[#58CC02]' : 'bg-white border-[#FF9600]'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-[#777777]">עלה {idx + 1}</div>
                    <div className="flex flex-wrap justify-center gap-1 text-xs font-extrabold">
                      {leaf.items.map((item) => (
                        <span key={item.id}>
                          {item.emoji || ANIMAL_EMOJIS[item.id] || '🐾'} {item.name}
                        </span>
                      ))}
                      {leaf.items.length === 0 && <span className="text-[#AFAFAF]">ריק</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Custom Animal Adder */}
            <form
              onSubmit={handleAddCustomAnimal}
              className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-3 space-y-2.5"
            >
              <div className="text-xs font-extrabold text-[#3C3C3C]">
                הוסיפו חיה משלכם למבחן העץ:
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {CUSTOM_ANIMAL_EMOJIS.map((em) => (
                  <button
                    key={em}
                    type="button"
                    onClick={() => setNewEmoji(em)}
                    className={`w-8 h-8 rounded-xl border-2 text-base cursor-pointer ${
                      newEmoji === em
                        ? 'bg-[#DDF4FF] border-[#1CB0F6]'
                        : 'bg-[#F7F7F5] border-[#E5E5E5]'
                    }`}
                  >
                    {em}
                  </button>
                ))}
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="שם החיה (למשל פינגווין)"
                  className="flex-1 min-w-[140px] px-3 py-1.5 rounded-xl border-2 border-[#E5E5E5] text-xs font-bold"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                <div className="flex flex-wrap gap-2">
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newCanFly}
                      onChange={(e) => setNewCanFly(e.target.checked)}
                    />
                    <span>יכול לעוף</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newHasFur}
                      onChange={(e) => setNewHasFur(e.target.checked)}
                    />
                    <span>יש פרווה</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newHasShell}
                      onChange={(e) => setNewHasShell(e.target.checked)}
                    />
                    <span>יש שריון</span>
                  </label>
                  <label className="inline-flex items-center gap-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newLegs4}
                      onChange={(e) => setNewLegs4(e.target.checked)}
                    />
                    <span>4 רגליים</span>
                  </label>
                </div>

                <button type="submit" disabled={!newName.trim()} className="btn-duo-blue px-3 py-1.5 text-xs">
                  <Plus className="w-3.5 h-3.5" />
                  <span>הוסף למבחן</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STEP 6: Real-World Connections */}
      {step === 6 && (
        <RealWorldStepView
          title="איפה עובדים עצי החלטות בחיים האמיתיים?"
          mascotMessage="מעצי שאלות של כן ולא בונים היום מערכות אבחון, משחקי ניחוש וממליצי תוכן חכמים:"
          spokenFallback="מעצי שאלות של כן ולא בונים היום מערכות אבחון, משחקי ניחוש וממליצי תוכן חכמים:"
          audioSrc="/audio/steps/lab3_realworld.mp3?v=3.1.1"
          labMeta={labMeta}
        />
      )}
    </LessonShell>
  );
}
