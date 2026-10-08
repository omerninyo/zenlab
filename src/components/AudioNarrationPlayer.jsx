import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Headphones, 
  ChevronDown, 
  ChevronUp, 
  Gauge, 
  Volume2
} from 'lucide-react';
import { NarrationEngine } from '../core/narration.js';
import { StorageEngine } from '../core/storage.js';

export default function AudioNarrationPlayer({ narrationData }) {
  const [engineState, setEngineState] = useState(() => NarrationEngine.getState());
  const [showTranscript, setShowTranscript] = useState(false);
  const [isNarrationEnabled, setIsNarrationEnabled] = useState(() => StorageEngine.getState().isNarrationEnabled);

  useEffect(() => {
    const unsubEngine = NarrationEngine.subscribe(state => {
      setEngineState(state);
    });

    const unsubStorage = StorageEngine.subscribe(state => {
      setIsNarrationEnabled(state.isNarrationEnabled);
    });

    return () => {
      unsubEngine();
      unsubStorage();
    };
  }, []);

  if (!narrationData) return null;

  const isCurrentPlaying = engineState.isPlaying && engineState.currentText === narrationData.transcript;

  const handleTogglePlay = () => {
    if (isCurrentPlaying) {
      NarrationEngine.toggle();
    } else {
      NarrationEngine.play(narrationData.transcript, narrationData.audioSrc, 80);
    }
  };

  const handleStop = () => {
    NarrationEngine.stop();
  };

  const handleSpeedCycle = () => {
    const rates = [1.0, 1.25, 1.5];
    const currentIndex = rates.indexOf(engineState.rate);
    const nextRate = rates[(currentIndex + 1) % rates.length];
    NarrationEngine.setRate(nextRate);
  };

  const handleSeek = (e) => {
    const val = parseFloat(e.target.value);
    NarrationEngine.seek(val);
  };

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
      {/* Player Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isCurrentPlaying && !engineState.isPaused
              ? 'bg-blue-600 text-white animate-pulse'
              : 'bg-slate-900 text-slate-400 border border-slate-800'
          }`}>
            <Headphones className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-white">{narrationData.title || 'הסבר קולי מלווה'}</h4>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span>{narrationData.duration || '1:30 דקות'}</span>
              <span>&bull;</span>
              <span>עברית תקנית</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Speed Toggle */}
          <button
            type="button"
            onClick={handleSpeedCycle}
            title="מהירות השמעה"
            className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-[10px] font-mono transition-colors"
          >
            {engineState.rate}x
          </button>

          {/* Stop Button */}
          {isCurrentPlaying && (
            <button
              type="button"
              onClick={handleStop}
              title="עצירה"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
            >
              <Square className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Main Play/Pause Button */}
          <button
            type="button"
            onClick={handleTogglePlay}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            {isCurrentPlaying && !engineState.isPaused ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-white" />
                <span>השהה</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-white ml-0.5" />
                <span>{isCurrentPlaying && engineState.isPaused ? 'המשך' : 'השמע הסבר'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Progress Track & Visualizer */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min="0"
            max="100"
            value={isCurrentPlaying ? engineState.progress : 0}
            onChange={handleSeek}
            disabled={!isCurrentPlaying}
            className="w-full accent-blue-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
          />
          <span className="text-[10px] font-mono text-slate-400 w-8 text-left">
            {isCurrentPlaying ? `${engineState.progress}%` : '0%'}
          </span>
        </div>

        {/* Audio Waveform Animation Indicator when playing */}
        {isCurrentPlaying && !engineState.isPaused && (
          <div className="flex items-center justify-center gap-1 py-1">
            <span className="w-1 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1 h-4 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.45s]" />
            <span className="w-1 h-5 bg-blue-300 rounded-full animate-bounce" />
            <span className="w-1 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.2s]" />
          </div>
        )}
      </div>

      {/* Transcript Accordion Drawer */}
      <div className="border-t border-slate-900 pt-2">
        <button
          type="button"
          onClick={() => setShowTranscript(!showTranscript)}
          className="w-full flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
        >
          <span>תמלול טקסט מלא של ההסבר הקולי</span>
          {showTranscript ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showTranscript && (
          <div className="mt-2.5 p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed max-h-36 overflow-y-auto">
            {narrationData.transcript}
          </div>
        )}
      </div>
    </div>
  );
}
