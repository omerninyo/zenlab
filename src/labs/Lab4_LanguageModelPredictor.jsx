import React, { useState, useMemo, useEffect } from 'react';
import { 
  Sparkles, 
  MessageSquare, 
  Sliders, 
  RotateCcw, 
  Play, 
  Check, 
  Award, 
  BookOpen, 
  Info, 
  Eye, 
  ArrowLeft,
  Flame,
  Snowflake
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import { StorageEngine } from '../core/storage.js';
import { AIService } from '../services/ai.js';
import { fireConfetti } from '../core/canvas-particles.js';

export default function Lab4_LanguageModelPredictor({ curriculum }) {
  const labData = curriculum.labs.lab4;
  const [activeTab, setActiveTab] = useState('lab');
  const [selectedPromptId, setSelectedPromptId] = useState(labData.prompts[0].id);
  const [temperature, setTemperature] = useState(0.7);
  const [generatedTokens, setGeneratedTokens] = useState([]);
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [completedChallenges, setCompletedChallenges] = useState(() => StorageEngine.getState().completedChallenges);

  useEffect(() => {
    const unsub = StorageEngine.subscribe(state => {
      setCompletedChallenges(state.completedChallenges);
    });
    return unsub;
  }, []);

  const activePrompt = useMemo(() => {
    return labData.prompts.find(p => p.id === selectedPromptId) || labData.prompts[0];
  }, [selectedPromptId, labData]);

  // Compute dynamic next-token probability distribution
  const tokenDistribution = useMemo(() => {
    return AIService.computeTokenProbabilities(activePrompt.vocabulary, temperature);
  }, [activePrompt, temperature]);

  // Check challenges
  useEffect(() => {
    // Challenge 1: Deterministic temp <= 0.05 with at least 1 token
    if (temperature <= 0.05 && generatedTokens.length >= 1 && !completedChallenges['lab4_challenge1']) {
      const res = StorageEngine.completeChallenge('lab4', 'lab4_challenge1', 1);
      if (res.isNew) {
        AudioEngine.playSuccess();
        fireConfetti();
      }
    }

    // Challenge 2: Creative temp >= 0.9 with at least 1 token
    if (temperature >= 0.9 && generatedTokens.length >= 1 && !completedChallenges['lab4_challenge2']) {
      const res = StorageEngine.completeChallenge('lab4', 'lab4_challenge2', 1);
      if (res.isNew) {
        AudioEngine.playSuccess();
        fireConfetti();
      }
    }

    // Challenge 3: Min 4 generated tokens
    if (generatedTokens.length >= 4 && !completedChallenges['lab4_challenge3']) {
      const res = StorageEngine.completeChallenge('lab4', 'lab4_challenge3', 1);
      if (res.isNew) {
        AudioEngine.playSuccess();
        fireConfetti();
      }
    }
  }, [temperature, generatedTokens, completedChallenges]);

  const appendToken = (token) => {
    setGeneratedTokens(prev => [...prev, token]);
    AudioEngine.playToken();
  };

  const handlePredictNext = () => {
    const sampled = AIService.sampleToken(tokenDistribution, temperature);
    if (sampled) {
      appendToken(sampled);
    }
  };

  const handleReset = () => {
    setGeneratedTokens([]);
    setIsAutoGenerating(false);
    AudioEngine.playStep();
  };

  const handleSelectPrompt = (promptId) => {
    setSelectedPromptId(promptId);
    setGeneratedTokens([]);
    AudioEngine.playStep();
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                {labData.badge}
              </span>
              <span className="text-xs text-slate-400">מעבדה {labData.number} מתוך 4</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{labData.title}</h1>
            <p className="text-sm text-slate-400 mt-1">{labData.subtitle}</p>
          </div>

          <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 self-start md:self-auto">
            <button
              onClick={() => setActiveTab('lab')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'lab' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>מרחב הניסוי</span>
            </button>
            <button
              onClick={() => setActiveTab('theory')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'theory' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>הסבר מדעי</span>
            </button>
            <button
              onClick={() => setActiveTab('glossary')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                activeTab === 'glossary' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>מילון מונחים</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'lab' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Sentence Builder & Stream Column */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            {/* Prompt Selector */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">
                בחר הקשר התחלתי (Prompt Context):
              </label>
              <div className="flex flex-wrap gap-2">
                {labData.prompts.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPrompt(p.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      selectedPromptId === p.id
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Token Sequence Stream */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 min-h-[140px] flex flex-col justify-between shadow-inner">
              <div>
                <div className="text-[11px] font-medium text-slate-500 mb-2">
                  רצף האסימונים הנבנה (Context + Generated Tokens):
                </div>
                <div className="text-base leading-relaxed text-slate-200">
                  <span className="text-slate-400 font-normal">{activePrompt.initialText}</span>
                  {' '}
                  {generatedTokens.map((token, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center mx-1 px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800/80 text-blue-300 font-medium text-sm animate-fadeIn"
                    >
                      {token}
                    </span>
                  ))}
                  <span className="inline-block w-2 h-4 bg-blue-400 animate-pulse align-middle ml-1" />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
                <span className="text-xs font-mono text-slate-500">
                  אסימונים שנוצרו: {generatedTokens.length}
                </span>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={generatedTokens.length === 0}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 disabled:opacity-40 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>איפוס רצף</span>
                </button>
              </div>
            </div>

            {/* Generation Controls */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handlePredictNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>חזה את האסימון הבא</span>
              </button>
            </div>

            {/* Hyperparameter: Temperature Slider */}
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-slate-200">מד טמפרטורה (Temperature):</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-blue-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                  {temperature <= 0.05 ? (
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Snowflake className="w-3 h-3" /> 0.0 (חמדני/דטרמיניסטי)
                    </span>
                  ) : temperature >= 0.9 ? (
                    <span className="flex items-center gap-1 text-amber-400">
                      <Flame className="w-3 h-3" /> {temperature.toFixed(2)} (יצירתי/מגוון)
                    </span>
                  ) : (
                    <span>{temperature.toFixed(2)}</span>
                  )}
                </div>
              </div>

              <input
                type="range"
                min="0"
                max="1.5"
                step="0.05"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />

              <div className="flex justify-between text-[10px] text-slate-500">
                <span>0.0 (דיוק מקסימלי, אותה בחירה תמיד)</span>
                <span>0.7 (מאוזן)</span>
                <span>1.5 (אקראיות ויצירתיות מוגברת)</span>
              </div>
            </div>
          </div>

          {/* Probability Distribution & Challenges Column */}
          <div className="lg:col-span-5 space-y-6">
            {/* Probability Distribution Chart */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">התפלגות הסתברויות לאסימון הבא</h3>
                <span className="text-[11px] text-slate-500">הקלק על מילה לבחירה ישירה</span>
              </div>

              <div className="space-y-2.5">
                {tokenDistribution.map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => appendToken(item.token)}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 hover:border-blue-700/80 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-semibold text-slate-200 group-hover:text-blue-400 transition-colors">
                        "{item.token}"
                      </span>
                      <span className="text-xs font-mono font-bold text-blue-400">
                        {item.probability}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.max(2, item.probability)}%` }}
                      />
                    </div>

                    <div className="text-[10px] text-slate-500 mt-1.5 leading-tight">
                      {item.explanation}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Challenges List */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">אתגרי למידה</h3>
              </div>

              <div className="space-y-3">
                {labData.challenges.map((challenge) => {
                  const isDone = !!completedChallenges[challenge.id];
                  return (
                    <div
                      key={challenge.id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        isDone
                          ? 'bg-slate-950 border-emerald-900/60 text-slate-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                            isDone ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-500'
                          }`}>
                            {isDone ? <Check className="w-3 h-3" /> : '•'}
                          </div>
                          <div>
                            <h4 className={`text-xs font-semibold ${isDone ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {challenge.title}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                              {challenge.instructions}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-amber-400 border border-slate-800 shrink-0">
                          +{challenge.rewardStars} כוכב
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'theory' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-white mb-2">תמצית הרעיון המדעי</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              {labData.conceptExplanation.summary}
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-200 mb-3">עקרונות מפתח:</h4>
            <ul className="space-y-2">
              {labData.conceptExplanation.keyPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <h4 className="text-xs font-semibold text-slate-300 mb-1">אנלוגיה מהעולם הממשי:</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {labData.conceptExplanation.realWorldAnalogy}
            </p>
          </div>
        </div>
      )}

      {activeTab === 'glossary' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-4">מילון מונחי מודלי שפה</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {labData.glossary.map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                <div className="text-xs font-bold text-blue-400 mb-1">{item.term}</div>
                <div className="text-xs text-slate-300 leading-relaxed">{item.definition}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
