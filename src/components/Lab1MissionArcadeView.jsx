import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Star, 
  CheckCircle2, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Zap, 
  Terminal, 
  Layers, 
  Award,
  ChevronLeft,
  Volume2
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';

export default function Lab1MissionArcadeView({
  labData,
  grid,
  onCellClick,
  onApplyPreset,
  onClear,
  onInvert,
  onDownloadImage,
  completedChallenges,
  activeCount,
  binaryString,
  hexBytes,
  earnedStars,
  isDapimActive = false
}) {
  const [copied, setCopied] = useState(false);
  const [selectedCartridge, setSelectedCartridge] = useState(null);

  const challenges = labData?.challenges || [];

  const handleCopyBinary = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(binaryString);
      setCopied(true);
      AudioEngine.playTone(880, 'sine', 0.08);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCartridgeClick = (presetKey) => {
    setSelectedCartridge(presetKey);
    onApplyPreset(presetKey);
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300" dir="rtl">
      
      {/* 1. Tactical Mission Briefing HUD (Zen Holographic Terminal) */}
      <div className={
        isDapimActive
          ? "card-command-hero p-4 sm:p-6 border-amber-500/40 relative overflow-hidden"
          : "bg-slate-900 border-2 border-amber-500/40 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden text-white"
      }>
        {/* Glowing Top Status Beacon */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  קונסולת משימה • טרמינל בינארי
                </span>
                <span className="text-[10px] font-mono text-emerald-400">ONLINE 60 FPS</span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white mt-0.5">
                תדריך מבצעי: חקר מתגים ופיקסלים
              </h2>
            </div>
          </div>

          {/* Star Rewards Live Score */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-800 self-stretch sm:self-auto justify-between">
            <span className="text-xs text-slate-400 font-medium">יעדי משימה שהושגו:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className={`w-4 h-4 transition-all duration-300 ${
                    starIdx <= earnedStars
                      ? 'text-amber-400 fill-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                      : 'text-slate-700'
                  }`}
                />
              ))}
              <span className="font-mono text-xs font-bold text-amber-400 mr-1">
                {earnedStars}/3
              </span>
            </div>
          </div>
        </div>

        {/* Mission Objectives Checklist */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-4">
          {challenges.map((challenge, idx) => {
            const isCompleted = !!completedChallenges[challenge.id];
            return (
              <div
                key={challenge.id}
                className={`p-3 rounded-xl border transition-all duration-200 flex items-start gap-2.5 ${
                  isCompleted
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200 shadow-xs'
                    : 'bg-slate-950/60 border-slate-800 text-slate-300'
                }`}
              >
                <div className={`mt-0.5 w-5 h-5 rounded-lg flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-slate-800 text-slate-400 font-mono text-xs'
                }`}>
                  {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold truncate">
                      {challenge.title}
                    </h4>
                    <span className="text-[10px] font-mono text-amber-400 font-bold shrink-0">
                      +1 ⭐
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight mt-0.5 line-clamp-2">
                    {challenge.instructions}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Main Game Arena: 8x8 Tactile Matrix + Cyber Register */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left / Center: Tactile 8x8 Console */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col items-center">
          
          {/* Top Arcade Bar: Data Cartridges (Presets) */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2.5 mb-5 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              <span className="text-xs text-amber-400 font-bold flex items-center gap-1 shrink-0">
                <Zap className="w-3.5 h-3.5" />
                <span>מחסניות:</span>
              </span>
              <button
                type="button"
                onClick={() => handleCartridgeClick('heart')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-200 border border-slate-700 transition-all shrink-0 cursor-pointer font-bold"
              >
                ❤️ לב
              </button>
              <button
                type="button"
                onClick={() => handleCartridgeClick('smiley')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-200 border border-slate-700 transition-all shrink-0 cursor-pointer font-bold"
              >
                😊 סמיילי
              </button>
              <button
                type="button"
                onClick={() => handleCartridgeClick('sword')}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-200 border border-slate-700 transition-all shrink-0 cursor-pointer font-bold"
              >
                🗡️ חרב
              </button>
            </div>

            {/* Quick Actions (Invert & Clear) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={onInvert}
                className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-300 border border-slate-700 transition-all cursor-pointer font-semibold"
                title="היפוך כל המתגים במטריצה"
              >
                היפוך
              </button>
              <button
                type="button"
                onClick={onClear}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 active:scale-95 px-2.5 py-1.5 rounded-lg border border-slate-700 transition-all cursor-pointer font-semibold"
                title="איפוס לוח"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>איפוס</span>
              </button>
            </div>
          </div>

          {/* 8x8 Physical Tactile Game Matrix */}
          <div className="p-3 sm:p-4 bg-slate-950 rounded-2xl border-2 border-slate-800 shadow-2xl relative">
            <div 
              className="grid grid-cols-8 gap-1.5 sm:gap-2 w-[270px] h-[270px] sm:w-[350px] sm:h-[350px] select-none"
              dir="ltr"
              style={{ touchAction: 'none' }}
            >
              {grid.map((cellValue, idx) => {
                const isLit = cellValue === 1;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onCellClick(idx)}
                    aria-label={`פיקסל ${idx}: ${isLit ? '1 דולק' : '0 כבוי'}`}
                    className={`rounded-lg transition-all duration-150 flex items-center justify-center font-mono font-black select-none cursor-pointer focus:outline-none ${
                      isLit
                        ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(251,191,36,0.6)] scale-[1.02] border-2 border-amber-200 text-xs sm:text-sm'
                        : 'bg-slate-900 text-slate-600 hover:bg-slate-800/80 active:scale-90 border border-slate-800 text-[10px] sm:text-xs'
                    }`}
                  >
                    {cellValue}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Matrix Telemetry Footer */}
          <div className="w-full flex items-center justify-between text-xs text-slate-400 mt-4 px-2 font-mono">
            <span>פיקסלים פעילים: <strong className="text-amber-400 font-bold">{activeCount}</strong> / 64</span>
            <span>זיכרון גרפי: <strong className="text-blue-400 font-bold">8 Bytes</strong></span>
          </div>

        </div>

        {/* Right Column: Live Cyber Memory Register & Mission Export */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Cyber Register Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold">אוגר הזיכרון החי (Live Register)</h3>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={onDownloadImage}
                  className="flex items-center gap-1 text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/40 transition-all active:scale-95 cursor-pointer font-bold"
                  title="הורדת יצירת האומנות כקובץ PNG"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>שמור PNG</span>
                </button>
                <button
                  type="button"
                  onClick={handleCopyBinary}
                  className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-700 transition-all active:scale-95 cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'הועתק!' : 'העתק ביטים'}</span>
                </button>
              </div>
            </div>

            {/* Binary Bitstream */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5">זרם 64 הביטים:</div>
              <div 
                className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 break-all leading-relaxed select-all"
                dir="ltr"
              >
                {binaryString.match(/.{1,8}/g)?.map((chunk, i) => (
                  <span key={i} className="inline-block mr-2 text-slate-300 font-bold">
                    {chunk}
                  </span>
                ))}
              </div>
            </div>

            {/* Hexadecimal Memory Blocks */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 mb-1.5">ייצוג הקסדצימלי קומפקטי:</div>
              <div className="grid grid-cols-4 gap-1.5" dir="ltr">
                {hexBytes.map((byte, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-slate-950 text-blue-400 font-mono text-xs border border-slate-800 text-center font-bold shadow-inner"
                  >
                    <span className="text-[9px] text-slate-500 block">B{i}</span>
                    0x{byte}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Victory Banner (When all 3 challenges completed) */}
          {earnedStars === 3 && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-blue-500/20 border-2 border-amber-400/80 shadow-lg text-white animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-md">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-amber-300">
                    מעבדה 1 הושלמה ב-100%!
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                    זכיתם בכל 3 הכוכבים של מעבדת הפיקסלים! אתם מוכנים לתחנה הבאה במסע.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
