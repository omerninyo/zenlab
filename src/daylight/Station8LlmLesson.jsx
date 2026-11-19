import React, { useState, useMemo } from 'react';
import { Snowflake, Flame, RotateCcw, Volume2, Wand2 } from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { NarrationEngine } from '../core/narration.js';
import { StorageEngine } from '../core/storage.js';
import { AIService } from '../services/ai.js';
import { LAB_METADATA } from '../core/labMeta.js';
import { fireChampagneConfetti } from '../core/confetti.js';
import ZenMascot from './ZenMascot.jsx';
import LessonShell from './LessonShell.jsx';
import { AudioHintButton, QuizStepView, RealWorldStepView } from './LessonSharedViews.jsx';

const TOTAL_STEPS = 7;

export default function Station8LlmLesson({
  curriculum,
  onExit,
  onNextStation,
  onOpenCertificate
}) {
  const labData = curriculum?.labs?.lab8 || {};
  const labMeta = LAB_METADATA.lab8;
  const prompts = labData.prompts || [];

  const [step, setStep] = useState(() => {
    const saved = StorageEngine.getLabStep('lab8');
    return saved < TOTAL_STEPS - 1 ? saved : 0;
  });
  const [isLessonComplete, setIsLessonComplete] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [streak, setStreak] = useState(0);
  const [bestLessonStreak, setBestLessonStreak] = useState(0);
  const [retryCount, setRetryCount] = useState(0);

  // Step 0 autocomplete warmup
  const [warmupWord, setWarmupWord] = useState('');

  // Language model state
  const [selectedPromptId, setSelectedPromptId] = useState(prompts[0]?.id || 'robotics');
  const [temperature, setTemperature] = useState(0.5);
  const [generatedTokens, setGeneratedTokens] = useState([]);
  const [rollCount, setRollCount] = useState(0);
  const [didColdSample, setDidColdSample] = useState(false);
  const [didHotSample, setDidHotSample] = useState(false);

  // Quizzes
  const [quiz1Choice, setQuiz1Choice] = useState(null);
  const [quiz2Choice, setQuiz2Choice] = useState(null);

  const activePrompt = useMemo(() => {
    return prompts.find((p) => p.id === selectedPromptId) || prompts[0] || { initialText: '', vocabulary: [] };
  }, [prompts, selectedPromptId]);

  const activeVocabulary = useMemo(() => {
    if (Array.isArray(activePrompt.stepVocabularies) && activePrompt.stepVocabularies.length > 0) {
      if (step === 1 || step === 2) {
        return activePrompt.stepVocabularies[0];
      }
      const idx = Math.min(generatedTokens.length, activePrompt.stepVocabularies.length - 1);
      return activePrompt.stepVocabularies[idx];
    }
    return activePrompt.vocabulary || [];
  }, [activePrompt, generatedTokens.length, step]);

  const tokenDistribution = useMemo(() => {
    return AIService.computeTokenProbabilities(activeVocabulary, temperature);
  }, [activeVocabulary, temperature]);

  const goToStep = (nextStep) => {
    const clamped = Math.max(0, Math.min(TOTAL_STEPS - 1, nextStep));
    setFeedback(null);
    setRetryCount(0);
    setRollCount(0);
    if (clamped === 1) {
      setTemperature(0.5);
      setGeneratedTokens([]);
    } else if (clamped === 2) {
      setTemperature(0.4);
      setGeneratedTokens([]);
    } else if (clamped === 4) {
      setGeneratedTokens([]);
    }
    setStep(clamped);
    StorageEngine.setLabStep('lab8', clamped);
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

  const handleSampleNextWord = () => {
    if (step === 4 && generatedTokens.length >= 4) return;
    setFeedback(null);
    const chosen = AIService.sampleToken(tokenDistribution, temperature);
    if (!chosen) return;
    if (step === 1 || step === 2) {
      setGeneratedTokens([chosen]);
      setRollCount((c) => c + 1);
      if (step === 1 && temperature <= 0.05) setDidColdSample(true);
      if (step === 2 && temperature >= 0.8) setDidHotSample(true);
    } else {
      setGeneratedTokens((prev) => [...prev, chosen]);
    }
    AudioEngine.playToken();
  };

  const handlePickToken = (tok) => {
    if (step !== 4 || generatedTokens.length >= 4) return;
    setFeedback(null);
    setGeneratedTokens((prev) => [...prev, tok]);
    AudioEngine.playToken();
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

    if (step === 0) {
      goToStep(1);
      return;
    }

    if (step === 1) {
      if (didColdSample || (temperature <= 0.05 && generatedTokens.length >= 1)) {
        StorageEngine.completeChallenge('lab8', 'lab8_challenge1', 1);
        recordPass(
          labData.challenges?.[0]?.successMessage ||
            'ניחוש בטוח הושלם! בטמפרטורה 0 המחשב בוחר תמיד במילה המובילה ב-100% ביטחון.'
        );
      } else {
        recordRetry('הורידו את מד הדמיון שמאלה ל-0.0 ולחצו על "גלו את המילה הבאה!"!');
      }
      return;
    }

    if (step === 2) {
      if (didHotSample || (temperature >= 0.8 && generatedTokens.length >= 1)) {
        StorageEngine.completeChallenge('lab8', 'lab8_challenge2', 1);
        recordPass(
          labData.challenges?.[1]?.successMessage ||
            'פרץ יצירתיות! כשמד החום גבוה, גם מילים מפתיעות מקבלות סיכוי להיבחר.'
        );
      } else {
        recordRetry('העלו את מד הדמיון ימינה (מעל 0.8) ולחצו על "גלו את המילה הבאה!"!');
      }
      return;
    }

    if (step === 3) {
      const q = labMeta.miniQuiz[1];
      if (quiz1Choice === q.correctIndex) recordPass(q.explanation);
      else recordRetry('נסו שוב: איך מד החום מתנהג כשהוא מכוון ל-0.0 קפוא?');
      return;
    }

    if (step === 4) {
      if (generatedTokens.length >= 4) {
        StorageEngine.completeChallenge('lab8', 'lab8_challenge1', 1);
        StorageEngine.completeChallenge('lab8', 'lab8_challenge2', 1);
        StorageEngine.completeChallenge('lab8', 'lab8_challenge3', 1);
        fireChampagneConfetti();
        recordPass(
          labData.challenges?.[2]?.successMessage ||
            'סיפור שלם נכתב מילה אחר מילה! כך בדיוק ChatGPT ו-Gemini בונים משפטים שלמים.'
        );
      } else {
        recordRetry(
          `נבחרו עד עכשיו ${generatedTokens.length} מילים. המשיכו לבחור או להגריל עד 4 מילים להשלמת הסיפור!`
        );
      }
      return;
    }

    if (step === 5) {
      const q = labMeta.miniQuiz[2];
      if (quiz2Choice === q.correctIndex) recordPass(q.explanation);
      else recordRetry('נסו שוב: כשמשנים מילה אחת באמצע המשפט, מה קורה להמשך הרשימה?');
      return;
    }

    if (step === 6) {
      setIsLessonComplete(true);
    }
  };

  const isActionDisabled = useMemo(() => {
    if (feedback) return false;
    if (step === 0) return !warmupWord;
    if (step === 1) return !didColdSample && !(temperature <= 0.05 && generatedTokens.length >= 1);
    if (step === 2) return !didHotSample && !(temperature >= 0.8 && generatedTokens.length >= 1);
    if (step === 3) return quiz1Choice === null;
    if (step === 4) return generatedTokens.length < 4;
    if (step === 5) return quiz2Choice === null;
    return false;
  }, [feedback, step, warmupWord, didColdSample, didHotSample, temperature, generatedTokens.length, quiz1Choice, quiz2Choice]);

  const primaryButtonLabel = useMemo(() => {
    if (feedback?.status === 'pass') return step === TOTAL_STEPS - 1 ? 'סיום המסע!' : 'המשך';
    if (feedback?.status === 'retry') return 'נסה שוב';
    if (step === 0 || step === 6) return step === 6 ? 'סיום המסע!' : 'המשך';
    return 'בדיקה';
  }, [feedback, step]);

  const hintConfig = useMemo(() => {
    if (step === 1) return { text: labData.challenges?.[0]?.hint, audioSrc: '/audio/hints/lab8_ch1.mp3?v=3.1.1' };
    if (step === 2) return { text: labData.challenges?.[1]?.hint, audioSrc: '/audio/hints/lab8_ch2.mp3?v=3.1.1' };
    if (step === 4) return { text: labData.challenges?.[2]?.hint, audioSrc: '/audio/hints/lab8_ch3.mp3?v=3.1.1' };
    return { text: '', audioSrc: '' };
  }, [step, labData.challenges]);

  const fullStoryText = `${activePrompt.initialText} ${generatedTokens.join(' ')}`.trim();
  const isModelStep = step === 1 || step === 2 || step === 4;

  return (
    <LessonShell
      labId="lab8"
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
      victoryTitle="סיימתם את כל 8 התחנות ב-ZenLab!"
      victorySubtitle="אתם יודעים עכשיו איך מחשב רואה פיקסלים, מנווט, לומד מדוגמאות, ומנחש מילים ב-AI."
      victoryTakeaways={[
        'מודל שפה לא מתכנן ספר שלם מראש — הוא מחשב בכל צעד סיכוי למילה הבאה.',
        'מד החום (טמפרטורה) קובע אם התשובה תהיה צפויה ומדויקת (0) או יצירתית ומפתיעה.',
        'בינה מלאכותית מנחשת לפי דפוסים ועלולה להמציא עובדות ("הזיה") — תמיד בודקים!'
      ]}
    >
      {/* STEP 0: Phone Keyboard Autocomplete Warmup */}
      {step === 0 && (
        <div className="max-w-xl mx-auto w-full space-y-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#3C3C3C] text-center">
            איך ChatGPT ו-Gemini כותבים סיפורים?
          </h1>

          <ZenMascot
            pose="teach"
            size="md"
            message="מכירים את 3 המילים המוצעות מעל המקלדת בטלפון? מודלי שפה עובדים באותה שיטה בדיוק — ניחוש המילה הבאה מילה אחר מילה!"
            audioSrc="/audio/steps/lab8_intro.mp3?v=3.1.1"
            spokenFallback="מכירים את 3 המילים המוצעות מעל המקלדת בטלפון? מודלי שפה עובדים באותה שיטה בדיוק — ניחוש המילה הבאה מילה אחר מילה!"
          />

          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-5 space-y-4 text-center">
            <div className="bg-white border-2 border-[#E5E5E5] rounded-2xl p-4 text-base sm:text-lg font-extrabold text-[#3C3C3C]">
              היום בבוקר השמש{' '}
              <span className="text-[#1CB0F6] underline decoration-2 underline-offset-4">
                {warmupWord || '_____'}
              </span>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5">
              {[
                { word: 'זרחה', pct: '89%' },
                { word: 'חייכה', pct: '9%' },
                { word: 'התפוצצה', pct: '2%' }
              ].map((opt) => (
                <button
                  key={opt.word}
                  type="button"
                  onClick={() => {
                    setWarmupWord(opt.word);
                    AudioEngine.playToken();
                  }}
                  className={`px-4 py-2.5 rounded-2xl border-2 text-sm font-extrabold cursor-pointer ${
                    warmupWord === opt.word
                      ? 'bg-[#1CB0F6] border-[#1899D6] text-white'
                      : 'bg-white border-[#E5E5E5] text-[#3C3C3C] hover:bg-[#DDF4FF]'
                  }`}
                >
                  {opt.word} <span className="opacity-75 font-mono text-xs">({opt.pct})</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEPS 1, 2, 4: Interactive Language Model & Temperature Studio */}
      {isModelStep && (
        <div className="max-w-2xl mx-auto w-full space-y-4">
          <div className="flex items-center justify-center gap-3 text-center">
            <h1 className="text-lg sm:text-2xl font-extrabold text-[#3C3C3C]">
              {step === 1
                ? 'משימה 1: כוונו את מד החום ל-0.0 וגלו ניחוש בטוח'
                : step === 2
                ? 'משימה 2: העלו את מד החום מעל 0.8 להמשך מפתיע'
                : 'משימה 3: בנו סיפור AI שלם בן 4 מילים'}
            </h1>
            <AudioHintButton
              text={
                step === 1
                  ? labData.challenges?.[0]?.instructions
                  : step === 2
                  ? labData.challenges?.[1]?.instructions
                  : labData.challenges?.[2]?.instructions
              }
              audioSrc={
                step === 1
                  ? '/audio/steps/lab8_inst1.mp3?v=3.1.1'
                  : step === 2
                  ? '/audio/steps/lab8_inst2.mp3?v=3.1.1'
                  : '/audio/steps/lab8_inst3.mp3?v=3.1.1'
              }
            />
          </div>

          {/* Story Theme Selector on Step 4 */}
          {step === 4 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {prompts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedPromptId(p.id);
                    setGeneratedTokens([]);
                    setFeedback(null);
                    AudioEngine.playStep();
                  }}
                  className={`px-3 py-1.5 rounded-xl border-2 text-xs font-extrabold cursor-pointer ${
                    selectedPromptId === p.id
                      ? 'bg-[#DDF4FF] border-[#84D8FF] text-[#1899D6]'
                      : 'bg-white border-[#E5E5E5] text-[#4B4B4B]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Story Output Book Box */}
          <div className="card-duo p-4 sm:p-5 bg-[#FFFDF2] border-[#E5E5E5] space-y-3">
            <div className="flex items-center justify-between gap-2 text-xs font-extrabold text-[#777777]">
              <span>
                {step === 4
                  ? `המשפט שנבנה (${generatedTokens.length}/4 מילים נוספו)`
                  : rollCount > 0
                  ? `ניחוש המילה הבאה (הגרלה #${rollCount})`
                  : 'מוכנים לנחש את המילה הבאה'}
              </span>
              {generatedTokens.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => NarrationEngine.play(fullStoryText)}
                    className="text-[#1899D6] hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>הקראה</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratedTokens([]);
                      setRollCount(0);
                      setFeedback(null);
                      AudioEngine.playStep();
                    }}
                    className="text-[#777777] hover:text-[#3C3C3C] inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>נקה</span>
                  </button>
                </div>
              )}
            </div>

            <p className="text-base sm:text-lg font-extrabold text-[#3C3C3C] leading-relaxed">
              {activePrompt.initialText}{' '}
              {generatedTokens.map((tok, i) => (
                <span
                  key={`${tok}-${i}`}
                  className="inline-block mx-1 px-2.5 py-0.5 rounded-xl bg-[#DDF4FF] border border-[#84D8FF] text-[#1899D6]"
                >
                  {tok}
                </span>
              ))}
              {(step === 4 ? generatedTokens.length < 4 : generatedTokens.length === 0) && (
                <span className="inline-block mx-1 px-2.5 py-0.5 rounded-xl border-2 border-dashed border-[#1CB0F6] text-[#1CB0F6] text-sm">
                  ?
                </span>
              )}
            </p>
          </div>

          {/* Temperature Control + Probability Bars */}
          <div className="bg-[#F7F7F5] border-2 border-[#E5E5E5] rounded-3xl p-4 space-y-4">
            <div className="space-y-2">
              <div
                className="flex items-center justify-between gap-2 text-xs sm:text-sm font-extrabold"
                dir="ltr"
              >
                <span className="inline-flex items-center gap-1 text-[#1899D6]" dir="rtl">
                  <Snowflake className="w-4 h-4 shrink-0" />
                  <span>0.0 צפוי ובטוח</span>
                </span>
                <span
                  className="px-3 py-0.5 rounded-xl bg-white border-2 border-[#E5E5E5] font-mono text-[#3C3C3C]"
                  dir="rtl"
                >
                  טמפרטורה: {temperature.toFixed(1)}
                </span>
                <span className="inline-flex items-center gap-1 text-[#FF9600]" dir="rtl">
                  <Flame className="w-4 h-4 shrink-0" />
                  <span>1.5 יצירתי ומפתיע</span>
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1.5"
                step="0.1"
                value={temperature}
                dir="ltr"
                onChange={(e) => {
                  setTemperature(parseFloat(e.target.value));
                  AudioEngine.playStep();
                }}
                className="w-full accent-[#1CB0F6] cursor-pointer"
                aria-label="מד הטמפרטורה והיצירתיות"
              />
            </div>

            {/* Candidate Probabilities List */}
            <div className="space-y-2">
              {tokenDistribution.map((item, idx) => (
                <button
                  key={`${item.token}-${idx}`}
                  type="button"
                  disabled={step !== 4 || generatedTokens.length >= 4}
                  onClick={() => handlePickToken(item.token)}
                  className={`w-full bg-white border-2 border-[#E5E5E5] rounded-2xl p-2.5 text-right space-y-1 transition-colors ${
                    step === 4 && generatedTokens.length < 4
                      ? 'hover:border-[#1CB0F6] cursor-pointer'
                      : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs sm:text-sm font-extrabold">
                    <span className="text-[#3C3C3C]">
                      {item.token}{' '}
                      <span className="text-[11px] font-medium text-[#777777]">
                        • {item.explanation}
                      </span>
                    </span>
                    <span className="font-mono text-[#1899D6] shrink-0">{item.probability}%</span>
                  </div>
                  <progress
                    className="progress-duo w-full h-2.5"
                    style={{
                      '--progress-fill':
                        idx === 0 ? '#58CC02' : idx === 1 ? '#1CB0F6' : '#CE82FF'
                    }}
                    value={item.probability}
                    max={100}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              disabled={step === 4 && generatedTokens.length >= 4}
              onClick={handleSampleNextWord}
              className={`w-full py-3 px-4 text-sm sm:text-base ${
                step === 4 && generatedTokens.length >= 4 ? 'btn-duo-disabled' : 'btn-duo-blue'
              }`}
            >
              <Wand2 className="w-4 h-4 shrink-0" />
              <span>
                {step === 4 && generatedTokens.length >= 4
                  ? 'הסיפור בן 4 השלבים הושלם!'
                  : 'גלו את המילה הבאה!'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Quiz 1 */}
      {step === 3 && (
        <QuizStepView
          quizItem={labMeta.miniQuiz[1]}
          selectedChoiceIdx={quiz1Choice}
          audioSrc="/audio/steps/lab8_quiz1.mp3?v=3.1.1"
          onSelectChoice={(idx) => {
            setFeedback(null);
            setQuiz1Choice(idx);
          }}
        />
      )}

      {/* STEP 5: Quiz 2 */}
      {step === 5 && (
        <QuizStepView
          quizItem={labMeta.miniQuiz[2]}
          selectedChoiceIdx={quiz2Choice}
          audioSrc="/audio/steps/lab8_quiz2.mp3?v=3.1.1"
          onSelectChoice={(idx) => {
            setFeedback(null);
            setQuiz2Choice(idx);
          }}
          badgeText="חשיבה יצירתית והסתברות"
        />
      )}

      {/* STEP 6: Real-World Connections + Hallucination Warning */}
      {step === 6 && (
        <RealWorldStepView
          title="איך מודלי שפה עובדים בעולם — ומתי להיזהר מהזיות?"
          mascotMessage="עכשיו אתם מבינים איך פועלים צ׳אטבוטים ושיחות AI — וזוכרים שתמיד כדאי לאמת עובדות:"
          spokenFallback="עכשיו אתם מבינים איך פועלים צ׳אטבוטים ושיחות AI — וזוכרים שתמיד כדאי לאמת עובדות:"
          audioSrc="/audio/steps/lab8_realworld.mp3?v=3.1.1"
          labMeta={labMeta}
        />
      )}
    </LessonShell>
  );
}
