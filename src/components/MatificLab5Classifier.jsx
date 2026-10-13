import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Network,
  RotateCcw,
  Sparkles,
  Award,
  Check,
  Sliders,
  Rocket,
  MousePointer,
  Vote
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import LudicLabShell from './LudicLabShell.jsx';

export default function MatificLab5Classifier({
  points = [],
  selectedClass = 'A',
  onSelectClass,
  kValue = 3,
  onSelectK,
  testPoint = { x: 50, y: 50 },
  onMoveTestPoint,
  onAddPoint,
  onRandomizeTestPoint,
  onReset,
  classification = {},
  completedChallenges = {},
  labData
}) {
  const [showXRay, setShowXRay] = useState(true);
  const [isDraggingProbe, setIsDraggingProbe] = useState(false);
  const isDraggingRef = useRef(false);
  const lastSoundTimeRef = useRef(0);
  const svgRef = useRef(null);

  const neighbors = classification.nearestNeighbors || classification.neighbors || [];
  const predictedClass = classification.predictedLabel || classification.predictedClass || 'A';
  const confidence = classification.confidence ?? 100;

  const votesA = useMemo(() => neighbors.filter(n => n.label === 'A').length, [neighbors]);
  const votesB = useMemo(() => neighbors.filter(n => n.label === 'B').length, [neighbors]);

  // Radius of k-th neighbor for the dashed radar circle
  const kthRadius = useMemo(() => {
    if (neighbors.length === 0) return 0;
    return neighbors[neighbors.length - 1].distance || 0;
  }, [neighbors]);

  const isCh1Done = !!completedChallenges['lab5_challenge1'];
  const isCh2Done = !!completedChallenges['lab5_challenge2'];
  const isCh3Done = !!completedChallenges['lab5_challenge3'];

  const starsList = useMemo(() => [
    { id: 'lab5_challenge1', done: isCh1Done, label: 'איסוף 10 כוכבי אימון במגרש' },
    { id: 'lab5_challenge2', done: isCh2Done, label: 'שיגור גשושית המסתורין לסיווג' },
    { id: 'lab5_challenge3', done: isCh3Done, label: 'הצבעת רוב עם k=5 שכנים' }
  ], [isCh1Done, isCh2Done, isCh3Done]);

  const stationStatus = useMemo(() => {
    if (predictedClass === 'A') {
      return `הגשושית מסווגת: כוכב כחול 💎 (קבוצה א׳ • ${confidence}%)`;
    }
    return `הגשושית מסווגת: כוכב כתום ⭐ (קבוצה ב׳ • ${confidence}%)`;
  }, [predictedClass, confidence]);

  const stationMessage = useMemo(() => {
    if (!isCh1Done) {
      return `משימה 1: לחצו על מפת החלל כדי לשתול כוכבי אימון חדשים עד שיהיו לפחות 10 כוכבים במגרש (כרגע: ${points.length}/10)!`;
    }
    if (!isCh2Done) {
      return 'משימה 2: גררו את גשושית המסתורין 🛸 במגרש (או לחצו ״שגר גשושית למיקום חדש 🚀״) כדי לראות איך השכנים מצביעים!';
    }
    if (!isCh3Done) {
      return 'משימה 3: העבירו את בורר השכנים ל-k=5 כדי לשאול 5 שכנים קרובים במקום 3!';
    }
    return 'כל 3 כוכבי למידת המכונה הושגו! נסו להזיז את הגשושית לאזורי גבול ולראות כיצד שינוי k הופך את ההחלטה.';
  }, [isCh1Done, isCh2Done, isCh3Done, points.length]);

  // Handle dragging the Mystery Probe across the 2D SVG starfield
  useEffect(() => {
    if (!isDraggingProbe) return;

    const handlePointerMove = (e) => {
      if (!svgRef.current) return;
      const rect = svgRef.current.getBoundingClientRect();
      const rawX = ((e.clientX - rect.left) / rect.width) * 100;
      const rawY = 100 - ((e.clientY - rect.top) / rect.height) * 100;
      const boundedX = Math.max(5, Math.min(95, Math.round(rawX)));
      const boundedY = Math.max(5, Math.min(95, Math.round(rawY)));

      onMoveTestPoint({ x: boundedX, y: boundedY });

      const now = Date.now();
      if (now - lastSoundTimeRef.current > 90) {
        lastSoundTimeRef.current = now;
        AudioEngine.playTone(320 + boundedX * 3, 'sine', 0.03, 0.03);
      }
    };

    const handlePointerUp = () => {
      setIsDraggingProbe(false);
      setTimeout(() => {
        isDraggingRef.current = false;
      }, 60);
      AudioEngine.playStep();
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDraggingProbe, onMoveTestPoint]);

  const handleSvgClick = (e) => {
    if (isDraggingProbe || isDraggingRef.current) return;
    if (!svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = 100 - ((e.clientY - rect.top) / rect.height) * 100;

    const boundedX = Math.max(5, Math.min(95, Math.round(clickX)));
    const boundedY = Math.max(5, Math.min(95, Math.round(clickY)));

    onAddPoint(boundedX, boundedY, selectedClass);
  };

  const handleProbePointerDown = (e) => {
    e.stopPropagation();
    setIsDraggingProbe(true);
    isDraggingRef.current = true;
    AudioEngine.playStep();
  };

  return (
    <LudicLabShell
      stationBadge="טלסקופ סיווג השכנים (k-NN)"
      stationStatus={stationStatus}
      stationMessage={stationMessage}
      StationIcon={Network}
      isBeamActive={isDraggingProbe}
      robotMood={isDraggingProbe ? 'thinking' : (isCh1Done && isCh2Done && isCh3Done ? 'celebrating' : 'happy')}
      stars={starsList}
      theoryTitle="איך אלגוריתם השכנים הקרובים (k-NN) מקבל החלטה?"
      theoryText="במקום לתכנת חוקים מסובכים מראש, המחשב לומד מדוגמאות! כשמגיעה גשושית מסתורית 🛸 למיקום חדש, המחשב מודד בקו ישר (מרחק אוקלידי d) מי הם k הכוכבים הכי קרובים אליה. כל שכן מצביע עבור הקבוצה שלו – והקבוצה שמקבלת את רוב הקולות מנצחת!"
      chassisTitle="מגרש השכנים של זֶן • סיווג ולמידת מכונה (k-NN)"
      ChassisIcon={Network}
      showXRay={showXRay}
      onToggleXRay={setShowXRay}
      xRayLabel="עדשת מרחקים [k-NN]"
    >
      {/* Main Toy Area: 2D Cosmic Starfield SVG + Right Telemetry Panel */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-6">
        
        {/* 1. Interactive 2D Cosmic Starfield SVG */}
        <div className="relative p-3 sm:p-4 bg-slate-950/95 rounded-3xl border-3 border-indigo-500/40 shadow-[0_0_45px_rgba(30,27,75,0.9)] w-full max-w-[340px] sm:max-w-[410px]">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-950 via-indigo-950/50 to-slate-950 border border-indigo-500/30">
            <svg
              ref={svgRef}
              viewBox="0 0 100 100"
              onClick={handleSvgClick}
              style={{ touchAction: 'none' }}
              className="w-full h-full cursor-crosshair select-none overflow-visible"
            >
              {/* Subtle Coordinate Grid Lines */}
              {[20, 40, 60, 80].map((pos) => (
                <React.Fragment key={pos}>
                  <line x1="0" y1={pos} x2="100" y2={pos} stroke="#312e81" strokeWidth="0.35" strokeDasharray="1.5,1.5" />
                  <line x1={pos} y1="0" x2={pos} y2="100" stroke="#312e81" strokeWidth="0.35" strokeDasharray="1.5,1.5" />
                </React.Fragment>
              ))}

              {/* Dashed Radar Circle of radius = k-th nearest neighbor distance */}
              {kthRadius > 0 && (
                <circle
                  cx={testPoint.x}
                  cy={100 - testPoint.y}
                  r={kthRadius}
                  fill={predictedClass === 'A' ? 'rgba(56, 189, 248, 0.08)' : 'rgba(251, 191, 36, 0.08)'}
                  stroke={predictedClass === 'A' ? '#38bdf8' : '#fbbf24'}
                  strokeWidth="0.7"
                  strokeDasharray="2,1.5"
                  className="transition-all duration-150"
                />
              )}

              {/* Glowing Elastic Laser Beams from testPoint to each of the k Nearest Neighbors */}
              {neighbors.map((nn, idx) => {
                const x1 = testPoint.x;
                const y1 = 100 - testPoint.y;
                const x2 = nn.x;
                const y2 = 100 - nn.y;
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                const isClassA = nn.label === 'A';

                return (
                  <g key={`beam-${nn.id || idx}`}>
                    {/* Outer Glow Beam */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isClassA ? '#38bdf8' : '#fbbf24'}
                      strokeWidth="1.8"
                      strokeOpacity="0.3"
                    />
                    {/* Core Elastic Laser Beam */}
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isClassA ? '#7dd3fc' : '#fde047'}
                      strokeWidth="0.9"
                      strokeDasharray="1.8,1.2"
                    />
                    {/* X-Ray Euclidean Distance Label on Midpoint */}
                    {showXRay && (
                      <g transform={`translate(${midX}, ${midY})`}>
                        <rect
                          x="-7.5"
                          y="-2.6"
                          width="15"
                          height="5.2"
                          rx="1.5"
                          fill="#020617"
                          stroke={isClassA ? '#38bdf8' : '#fbbf24'}
                          strokeWidth="0.4"
                          opacity="0.92"
                        />
                        <text
                          x="0"
                          y="0.9"
                          textAnchor="middle"
                          fill={isClassA ? '#bae6fd' : '#fef08a'}
                          fontSize="2.7"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          d={nn.distance.toFixed(1)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Training Stars ('A' = Blue Diamond Star 💎, 'B' = Orange/Amber Star ⭐) */}
              {points.map((p) => {
                const neighborRank = neighbors.findIndex(nn => nn.id === p.id);
                const isNeighbor = neighborRank !== -1;
                const isA = p.label === 'A';
                const cy = 100 - p.y;

                return (
                  <g key={p.id} transform={`translate(${p.x}, ${cy})`}>
                    {/* Neighbor highlight ring */}
                    {isNeighbor && (
                      <circle
                        cx="0"
                        cy="0"
                        r="4.6"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="0.6"
                        strokeDasharray="1,1"
                      />
                    )}

                    {/* Star / Crystal body */}
                    <circle
                      cx="0"
                      cy="0"
                      r={isNeighbor ? 3.4 : 2.6}
                      fill={isA ? '#0ea5e9' : '#f59e0b'}
                      stroke={isNeighbor ? '#ffffff' : '#0f172a'}
                      strokeWidth={isNeighbor ? 0.9 : 0.5}
                    />

                    {/* X-Ray Coordinates next to points */}
                    {showXRay && (
                      <text
                        x="0"
                        y="-4.5"
                        textAnchor="middle"
                        fill={isA ? '#7dd3fc' : '#fde68a'}
                        fontSize="2.5"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        ({p.x},{p.y})
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Draggable Mystery Probe (testPoint) */}
              <g
                transform={`translate(${testPoint.x}, ${100 - testPoint.y})`}
                onPointerDown={handleProbePointerDown}
                onClick={(e) => e.stopPropagation()}
                className="cursor-grab active:cursor-grabbing"
              >
                {/* Pulsing Aura matching winning predicted class */}
                <circle
                  cx="0"
                  cy="0"
                  r="8.5"
                  fill={predictedClass === 'A' ? 'rgba(14, 165, 233, 0.22)' : 'rgba(245, 158, 11, 0.22)'}
                  stroke={predictedClass === 'A' ? '#38bdf8' : '#fbbf24'}
                  strokeWidth="0.7"
                />
                {/* Probe Core */}
                <circle
                  cx="0"
                  cy="0"
                  r="5.2"
                  fill={predictedClass === 'A' ? '#0284c7' : '#d97706'}
                  stroke="#ffffff"
                  strokeWidth="1.3"
                />
                {/* Probe Label */}
                <text
                  x="0"
                  y="1.6"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="4.6"
                  fontWeight="bold"
                >
                  ?
                </text>
                {showXRay && (
                  <text
                    x="0"
                    y="11.2"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="2.8"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    גשושית ({testPoint.x},{testPoint.y})
                  </text>
                )}
              </g>
            </svg>
          </div>

          {/* Caption below Starfield */}
          <div className="mt-2.5 flex items-center justify-between text-[11px] text-indigo-200 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-indigo-500/30">
            <span>👆 לחצו לשתילת כוכב • גררו את הגשושית <strong>(?)</strong> בחלל!</span>
            <span className="font-mono font-bold text-amber-300 shrink-0">
              סה״כ כוכבים: {points.length}
            </span>
          </div>
        </div>

        {/* 2. Right Panel: Mystery Probe Verdict + 3 Challenge Cards */}
        <div className="flex-1 w-full space-y-3.5">
          
          {/* Winning Prediction Aura Card */}
          <div className={`p-4 rounded-2xl border-2 transition-all shadow-lg flex items-center justify-between gap-3 ${
            predictedClass === 'A'
              ? 'bg-gradient-to-r from-sky-950/90 via-indigo-950/80 to-slate-950 border-sky-400/70'
              : 'bg-gradient-to-r from-amber-950/90 via-orange-950/80 to-slate-950 border-amber-400/70'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 border-white shadow-md ${
                predictedClass === 'A' ? 'bg-sky-500' : 'bg-amber-500'
              }`}>
                {predictedClass === 'A' ? '💎' : '⭐'}
              </div>
              <div>
                <div className="text-xs font-bold text-indigo-200">החלטת המחשב עבור הגשושית:</div>
                <div className="text-base sm:text-lg font-black text-white">
                  {predictedClass === 'A'
                    ? `קבוצה א׳: כוכב כחול 💎 (${labData?.classes?.A?.name || 'תפוח'})`
                    : `קבוצה ב׳: כוכב כתום ⭐ (${labData?.classes?.B?.name || 'אגס'})`}
                </div>
              </div>
            </div>
            <div className="text-left bg-black/40 px-3 py-2 rounded-xl border border-white/10 shrink-0">
              <div className="text-[10px] text-slate-300 font-bold">ביטחון ההצבעה</div>
              <div className="text-lg font-mono font-black text-amber-300">{confidence}%</div>
            </div>
          </div>

          {/* X-Ray Distance Formula Explainer when X-Ray is on */}
          {showXRay && (
            <div className="p-3 rounded-2xl bg-indigo-950/70 border border-amber-400/40 text-xs space-y-1">
              <div className="flex items-center justify-between font-black text-amber-300">
                <span>📐 עדשת מרחקים אוקלידיים [k={kValue}]:</span>
                <span className="font-mono text-[11px] bg-amber-400/20 px-2 py-0.5 rounded-md border border-amber-300/30">
                  רדיוס מעגל: {kthRadius.toFixed(1)}
                </span>
              </div>
              <p className="text-indigo-100 text-[11px] leading-relaxed">
                המעגל המקווקו נמתח בדיוק עד לשכן ה-<strong>{kValue}</strong> במרחקו! כל קרן לייזר מציגה את המרחק <strong>d</strong> מהגשושית לכוכב השכן.
              </p>
            </div>
          )}

          {/* 3 Interactive Challenges Checklist */}
          <div className="bg-slate-950/80 rounded-2xl border border-white/10 p-3.5 space-y-2">
            <div className="flex items-center justify-between text-xs font-black text-amber-300 pb-1.5 border-b border-white/10">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>משימות סיווג הכוכבים:</span>
              </span>
              <span className="font-mono text-amber-200">
                {[isCh1Done, isCh2Done, isCh3Done].filter(Boolean).length}/3 כוכבים ⭐
              </span>
            </div>
            <div className="space-y-1.5">
              {(labData?.challenges || []).map((ch) => {
                const isDone = !!completedChallenges[ch.id];
                return (
                  <div
                    key={ch.id}
                    className={`flex items-center justify-between gap-2 px-3 py-2 rounded-xl border text-xs transition-all ${
                      isDone
                        ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
                        : 'bg-slate-900/80 border-white/10 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-sm shrink-0">{isDone ? '⭐' : '🔒'}</span>
                      <div className="min-w-0">
                        <div className="font-black text-white truncate">{ch.title}</div>
                        <div className="text-[11px] text-slate-400 leading-snug">{ch.instructions}</div>
                      </div>
                    </div>
                    {isDone && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[10px] font-black shrink-0">
                        הושלם ✓
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* 3. Live Neighbor Voting Ribbon (קלפי ההצבעה של k השכנים הקרובים) */}
      <div className="w-full mt-5 p-4 bg-slate-950/90 rounded-2xl border-2 border-indigo-500/30 space-y-3 shadow-inner">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-black text-amber-300">
            <Vote className="w-4 h-4 text-amber-400" />
            <span>קלפי ההצבעה של k={kValue} השכנים הקרובים (מסודרים מהקרוב לרחוק):</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-black">
            <span className="px-2.5 py-1 rounded-lg bg-sky-500/20 border border-sky-400/40 text-sky-300">
              💎 קבוצה א': {votesA} קולות
            </span>
            <span className="text-slate-500">|</span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-400/40 text-amber-300">
              ⭐ קבוצה ב': {votesB} קולות
            </span>
          </div>
        </div>

        {/* Ordered Neighbor Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {neighbors.map((nn, idx) => {
            const isA = nn.label === 'A';
            return (
              <div
                key={nn.id || idx}
                className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs transition-all ${
                  isA
                    ? 'bg-sky-950/60 border-sky-400/50 text-sky-100'
                    : 'bg-amber-950/60 border-amber-400/50 text-amber-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-black">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 text-white">
                    #{idx + 1}
                  </span>
                  <span>{isA ? '💎 כחול (א׳)' : '⭐ כתום (ב׳)'}</span>
                </div>
                <span className="font-mono text-[11px] font-bold text-white/90">
                  d={nn.distance.toFixed(1)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Tactile Controls Toolbar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-3 mt-4 pt-4 border-t border-white/10">
        
        {/* Choose k (k=1, k=3, k=5) */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-2xl border border-white/15">
          <span className="text-xs font-black text-indigo-200 px-2">מספר שכנים:</span>
          {[1, 3, 5].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => onSelectK(val)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-black transition-all cursor-pointer active:scale-95 ${
                kValue === val
                  ? 'bg-amber-400 text-slate-950 shadow-md scale-105'
                  : 'bg-white/5 hover:bg-white/15 text-white/80'
              }`}
            >
              k={val}
            </button>
          ))}
        </div>

        {/* Choose Planting Tool ('A' vs 'B') */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => onSelectClass('A')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 border-2 ${
              selectedClass === 'A'
                ? 'bg-sky-500 text-slate-950 border-white shadow-[0_0_15px_rgba(14,165,233,0.5)] scale-105'
                : 'bg-sky-950/50 hover:bg-sky-900/60 text-sky-200 border-sky-500/40'
            }`}
          >
            <span>💎 שתול כוכב כחול (א')</span>
          </button>

          <button
            type="button"
            onClick={() => onSelectClass('B')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer active:scale-95 border-2 ${
              selectedClass === 'B'
                ? 'bg-amber-400 text-slate-950 border-white shadow-[0_0_15px_rgba(251,191,36,0.5)] scale-105'
                : 'bg-amber-950/50 hover:bg-amber-900/60 text-amber-200 border-amber-500/40'
            }`}
          >
            <span>⭐ שתול כוכב כתום (ב')</span>
          </button>
        </div>

        {/* Jump Probe & Reset Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onRandomizeTestPoint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-500/30 hover:bg-indigo-500/45 text-indigo-100 border border-indigo-400/50 text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md"
          >
            <span>שגר גשושית למיקום חדש 🚀</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border border-white/20 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-md"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>איפוס מגרש 🔄</span>
          </button>
        </div>

      </div>
    </LudicLabShell>
  );
}
