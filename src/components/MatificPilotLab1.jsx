import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  RotateCcw, 
  HelpCircle, 
  Radio,
  Cpu,
  Binary,
  Sparkles,
  Layers
} from 'lucide-react';
import { AudioEngine } from '../core/audio.js';
import LudicLabShell from './LudicLabShell.jsx';
import { BespokeHeartGlyph, BespokeSmileyGlyph } from './BespokeIllustrations.jsx';

const COL_WEIGHTS = [128, 64, 32, 16, 8, 4, 2, 1];

export default function MatificPilotLab1({
  grid,
  onCellClick,
  onApplyPreset,
  onClear,
  completedChallenges = {},
  labData
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [showStencil, setShowStencil] = useState(false);
  const [manualStencilType, setManualStencilType] = useState(null); // 'heart' | 'smiley' | null
  const [showXRay, setShowXRay] = useState(true);
  const [hoveredBitIndex, setHoveredBitIndex] = useState(null);
  const [hoveredRowIndex, setHoveredRowIndex] = useState(null);
  const [selectedByteRow, setSelectedByteRow] = useState(1);
  const [robotMood, setRobotMood] = useState('happy');
  const [isBeamActive, setIsBeamActive] = useState(false);

  // Canvas refs for 60fps 3D Isometric Voxel Hologram Engine
  const holoCanvasRef = useRef(null);
  const voxelHeightsRef = useRef(new Float32Array(64));
  const gridRef = useRef(grid);
  const hoveredRowRef = useRef(null);
  const hoveredBitRef = useRef(null);

  useEffect(() => {
    gridRef.current = grid;
  }, [grid]);

  useEffect(() => {
    hoveredRowRef.current = hoveredRowIndex;
  }, [hoveredRowIndex]);

  useEffect(() => {
    hoveredBitRef.current = hoveredBitIndex;
  }, [hoveredBitIndex]);

  // Challenge checks
  const isHeartCompleted = !!completedChallenges['lab1_challenge1'];
  const isSmileyCompleted = !!completedChallenges['lab1_challenge2'];
  const isCustomCompleted = !!completedChallenges['lab1_challenge3'];

  const stencilType = manualStencilType || (!isHeartCompleted ? 'heart' : 'smiley');

  // Presets
  const heartPreset = labData?.presets?.heart?.grid || [];
  const smileyPreset = labData?.presets?.smiley?.grid || [];

  // Active lit bulbs count
  const litCount = useMemo(() => grid.filter(b => b === 1).length, [grid]);

  // Compute 8 bytes info (bits, hex, integer)
  const rowBytes = useMemo(() => {
    const rows = [];
    for (let r = 0; r < 8; r++) {
      const bits = grid.slice(r * 8, r * 8 + 8);
      const bitStr = bits.join('');
      const val = parseInt(bitStr, 2);
      const hex = '0x' + val.toString(16).toUpperCase().padStart(2, '0');
      rows.push({
        rowIndex: r,
        bits,
        bitStr,
        val,
        hex,
        litInRow: bits.filter(b => b === 1).length
      });
    }
    return rows;
  }, [grid]);

  // Trigger beam and celebration animation when a challenge completes
  useEffect(() => {
    if (isHeartCompleted || isSmileyCompleted) {
      setRobotMood('celebrating');
      setIsBeamActive(true);
      const timer = setTimeout(() => {
        setIsBeamActive(false);
        setRobotMood('happy');
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [isHeartCompleted, isSmileyCompleted]);

  // 60fps Hardware-Accelerated 2.5D Isometric Voxel Hologram Render Loop
  useEffect(() => {
    const canvas = holoCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = null;
    const startTime = performance.now();

    const renderHologram = (now) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = 200;
      const height = 190;
      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      const t = (now - startTime) * 0.001;
      const floatOffset = Math.sin(t * 2.2) * 2.5;

      // Subtle holographic projector base glow
      const baseGrad = ctx.createRadialGradient(width / 2, height - 24, 6, width / 2, height - 24, 84);
      baseGrad.addColorStop(0, 'rgba(56, 189, 248, 0.28)');
      baseGrad.addColorStop(0.6, 'rgba(99, 102, 241, 0.10)');
      baseGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
      ctx.fillStyle = baseGrad;
      ctx.beginPath();
      ctx.ellipse(width / 2, height - 24, 80, 22, 0, 0, Math.PI * 2);
      ctx.fill();

      // Isometric projection parameters
      const originX = width / 2;
      const originY = 44 + floatOffset;
      const tileW = 19;
      const tileH = 9.5;
      const maxExtrude = 13;

      const curGrid = gridRef.current;
      const heights = voxelHeightsRef.current;
      const hRow = hoveredRowRef.current;
      const hBit = hoveredBitRef.current;

      // Painter's algorithm: back-to-front (row 0..7, col 0..7)
      for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
          const idx = r * 8 + c;
          const targetH = curGrid[idx] === 1 ? 1 : 0;
          // Smooth spring-like lerp toward target height
          heights[idx] += (targetH - heights[idx]) * 0.22;
          const hVal = heights[idx];
          const z = hVal * maxExtrude;

          const isoX = originX + (c - r) * (tileW / 2);
          const isoY = originY + (c + r) * (tileH / 2);

          const isRowHighlighted = hRow === r;
          const isBitHighlighted = hBit === idx;

          // Draw extruded side walls when voxel is raised
          if (z > 0.4) {
            // Left face
            ctx.fillStyle = isBitHighlighted
              ? '#38bdf8'
              : isRowHighlighted
              ? '#f59e0b'
              : '#d97706';
            ctx.beginPath();
            ctx.moveTo(isoX - tileW / 2, isoY + tileH / 2 - z);
            ctx.lineTo(isoX, isoY + tileH - z);
            ctx.lineTo(isoX, isoY + tileH);
            ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2);
            ctx.closePath();
            ctx.fill();

            // Right face
            ctx.fillStyle = isBitHighlighted
              ? '#0284c7'
              : isRowHighlighted
              ? '#b45309'
              : '#92400e';
            ctx.beginPath();
            ctx.moveTo(isoX + tileW / 2, isoY + tileH / 2 - z);
            ctx.lineTo(isoX, isoY + tileH - z);
            ctx.lineTo(isoX, isoY + tileH);
            ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2);
            ctx.closePath();
            ctx.fill();
          }

          // Top diamond face
          ctx.beginPath();
          ctx.moveTo(isoX, isoY - z);
          ctx.lineTo(isoX + tileW / 2, isoY + tileH / 2 - z);
          ctx.lineTo(isoX, isoY + tileH - z);
          ctx.lineTo(isoX - tileW / 2, isoY + tileH / 2 - z);
          ctx.closePath();

          if (hVal > 0.15) {
            ctx.fillStyle = isBitHighlighted
              ? '#bae6fd'
              : isRowHighlighted
              ? '#fef08a'
              : '#fbbf24';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 0.9;
          } else {
            ctx.fillStyle = isRowHighlighted
              ? 'rgba(99, 102, 241, 0.45)'
              : 'rgba(30, 41, 59, 0.75)';
            ctx.strokeStyle = isRowHighlighted
              ? 'rgba(129, 140, 248, 0.8)'
              : 'rgba(71, 85, 105, 0.5)';
            ctx.lineWidth = 0.6;
          }
          ctx.fill();
          ctx.stroke();
        }
      }

      ctx.restore();
      animId = window.requestAnimationFrame(renderHologram);
    };

    animId = window.requestAnimationFrame(renderHologram);
    return () => {
      if (animId) window.cancelAnimationFrame(animId);
    };
  }, []);

  // Play pentatonic chime for a specific row
  const playRowChime = (rowIndex) => {
    const pentatonicNotes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const freq = pentatonicNotes[7 - rowIndex] || 440;
    AudioEngine.playTone(freq, 'sine', 0.14, 0.08);
  };

  // Touch and drag support for fluid finger-painting
  const handleBulbTouch = (idx, forceVal = null) => {
    const currentVal = grid[idx];
    const targetVal = forceVal !== null ? forceVal : (currentVal === 1 ? 0 : 1);
    
    if (currentVal !== targetVal) {
      onCellClick(idx);
      const row = Math.floor(idx / 8);
      setSelectedByteRow(row);
      if (targetVal === 1) {
        playRowChime(row);
      } else {
        AudioEngine.playTone(210, 'triangle', 0.05, 0.05);
      }
    }
  };

  const stars = [
    { id: 'heart', done: isHeartCompleted, label: 'לב' },
    { id: 'smiley', done: isSmileyCompleted, label: 'סמיילי' },
    { id: 'custom', done: isCustomCompleted, label: 'יצירה' }
  ];

  const stationStatus = isBeamActive ? 'משדר הולוגרמה חיה לחלל!' : 'ממתין לקוד הבינארי שלכם...';
  const stationMessage =
    litCount === 0
      ? 'מטריצת האור כבויה (כל 64 הביטים הם 0). לחצו וגררו על המשבצות כדי להרים קוביות אור תלת-ממדיות!'
      : isHeartCompleted
      ? `שידור הלב נקלט בהצלחה! ${litCount} ביטים דולקים (1) יצרו הולוגרמת לב בחלל!`
      : `כרגע דולקים ${litCount} פיקסלים (1) מתוך 64 ביטים בזיכרון ההולוגרמה של זֶן.`;

  const activeByteIdx = hoveredRowIndex !== null ? hoveredRowIndex : selectedByteRow;
  const activeByte = rowBytes[activeByteIdx] || rowBytes[0];

  return (
    <LudicLabShell
      stationBadge="לוויין כדור הארץ"
      stationStatus={stationStatus}
      stationMessage={stationMessage}
      StationIcon={Radio}
      isBeamActive={isBeamActive}
      robotMood={robotMood}
      stars={stars}
      theoryTitle="מדוע המחשב משתמש ב-0 וב-1?"
      theoryText="בתוך המעבד של המחשב אין מכחולים או צבעים – יש רק מיליוני מתגים חשמליים זעירים הנקראים טרנזיסטורים. כאשר מתג דלוק (עובר זרם), המחשב מסמן אותו כ-1. כאשר הוא כבוי, הוא מסומן כ-0. כל מתג כזה נקרא ביט (Bit), וקבוצה של 8 ביטים נקראת בייט (Byte)!"
      chassisTitle="מטריצת פריזמות בינארית 2.5D • 64 פיקסלים"
      ChassisIcon={Cpu}
      showXRay={showXRay}
      onToggleXRay={setShowXRay}
      xRayLabel="עדשת קוד [01]"
    >
      <div className="space-y-5">

        {/* Main Workspace: 2.5D Light-Prism Matrix + Byte Rulers + 60fps Isometric Hologram Projector */}
        <div className="flex flex-col xl:flex-row items-center justify-center gap-5 max-w-full">
          
          {/* 1. Tactile 2.5D Light-Prism 8x8 Matrix + 8-Byte Rulers */}
          <div className="flex items-center justify-center gap-3 sm:gap-4 max-w-full overflow-x-auto py-1">
            
            {/* 8x8 Tactile Prism Matrix */}
            <div className="relative p-3 sm:p-4 bg-slate-950/95 rounded-3xl border-2 border-indigo-500/40 shadow-[0_20px_50px_rgba(2,6,23,0.9)]">
              <div 
                className="grid grid-cols-8 gap-2 sm:gap-2.5 w-[264px] h-[264px] sm:w-[344px] sm:h-[344px] select-none"
                style={{ touchAction: 'none' }}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
              >
                {grid.map((cellVal, idx) => {
                  const isLit = cellVal === 1;
                  const row = Math.floor(idx / 8);
                  const col = idx % 8;
                  const isHeartGhost = showStencil && stencilType === 'heart' && heartPreset[idx] === 1;
                  const isSmileyGhost = showStencil && stencilType === 'smiley' && smileyPreset[idx] === 1;
                  const isGhost = isHeartGhost || isSmileyGhost;
                  const isHovered = hoveredBitIndex === idx || hoveredRowIndex === row;

                  // Check if orthogonal neighbor is lit for subtle ambient light bleed
                  const hasLitNeighbor = !isLit && (
                    (col > 0 && grid[idx - 1] === 1) ||
                    (col < 7 && grid[idx + 1] === 1) ||
                    (row > 0 && grid[idx - 8] === 1) ||
                    (row < 7 && grid[idx + 8] === 1)
                  );

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleBulbTouch(idx)}
                      onMouseEnter={() => {
                        setHoveredBitIndex(idx);
                        if (isDragging) handleBulbTouch(idx, 1);
                      }}
                      onMouseLeave={() => setHoveredBitIndex(null)}
                      style={{
                        boxShadow: isLit
                          ? isHovered
                            ? '0 4px 0 #d97706, 0 0 20px rgba(251, 191, 36, 0.9)'
                            : '0 4px 0 #b45309, 0 0 14px rgba(251, 191, 36, 0.65)'
                          : hasLitNeighbor
                          ? 'inset 0 2px 4px rgba(0,0,0,0.6), 0 0 8px rgba(251, 191, 36, 0.16)'
                          : 'inset 0 2px 5px rgba(0,0,0,0.75)'
                      }}
                      className={`relative rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer focus:outline-none ${
                        isLit
                          ? isHovered
                            ? 'bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 border-2 border-white -translate-y-0.5'
                            : 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 border-2 border-amber-100 -translate-y-0.5'
                          : isGhost
                          ? 'bg-slate-800/85 border-2 border-dashed border-amber-300/60'
                          : isHovered
                          ? 'bg-slate-800 border-2 border-cyan-400/80'
                          : hasLitNeighbor
                          ? 'bg-slate-900 border border-amber-400/30 hover:bg-slate-800'
                          : 'bg-slate-900/95 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {showXRay ? (
                        <span className={`font-black font-mono select-none ${
                          isLit 
                            ? 'text-slate-950 text-sm sm:text-base drop-shadow-xs' 
                            : isGhost
                            ? 'text-amber-300/70 text-xs sm:text-sm'
                            : 'text-slate-500 text-xs sm:text-sm'
                        }`}>
                          {isLit ? '1' : '0'}
                        </span>
                      ) : (
                        isLit ? (
                          <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                        ) : isGhost ? (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-300/45" />
                        ) : (
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
                        )
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 8-Byte Row Rulers */}
            <div className="flex flex-col justify-between h-[264px] sm:h-[344px] py-1 select-none">
              {rowBytes.map((rb) => {
                const isRowActive = activeByteIdx === rb.rowIndex;
                return (
                  <button
                    key={rb.rowIndex}
                    type="button"
                    onClick={() => {
                      playRowChime(rb.rowIndex);
                      setSelectedByteRow(rb.rowIndex);
                    }}
                    onMouseEnter={() => setHoveredRowIndex(rb.rowIndex)}
                    onMouseLeave={() => setHoveredRowIndex(null)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[10px] sm:text-xs font-mono transition-colors text-right cursor-pointer ${
                      isRowActive
                        ? 'bg-amber-400/20 border-amber-400 text-amber-200 shadow-sm'
                        : rb.litInRow > 0
                        ? 'bg-indigo-950/75 border-indigo-400/60 text-amber-200'
                        : 'bg-slate-900/70 border-slate-700/60 text-slate-400 hover:text-white'
                    }`}
                    title={`לחצו לבדיקת שורה ${rb.rowIndex + 1}: (${rb.bitStr} = ${rb.val} בעשרוני)`}
                  >
                    <span className="font-bold text-slate-300">בייט {rb.rowIndex + 1}:</span>
                    <span className="font-mono tracking-tighter text-amber-300 font-bold text-[10px] sm:text-xs" dir="ltr">
                      {rb.bitStr}
                    </span>
                    <span className="hidden md:inline font-mono text-cyan-300 text-[10px] font-bold" dir="ltr">
                      ={rb.val}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Live 60fps 3D Isometric Voxel Hologram Stage + Single-Byte Power Conduit */}
          <div className="flex flex-col sm:flex-row xl:flex-col items-center justify-between gap-4 w-full xl:w-64 shrink-0">
            
            {/* 3D Isometric Voxel Hologram Card */}
            <div className="w-full bg-slate-950/90 border-2 border-cyan-500/35 rounded-3xl p-3.5 flex flex-col items-center shadow-xl">
              <div className="w-full flex items-center justify-between text-[11px] font-black text-cyan-300 pb-1.5 border-b border-white/10">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  <span>מקרן הולוגרמה 3D חי</span>
                </span>
                <span className="font-mono text-[10px] text-amber-300">60fps</span>
              </div>

              <canvas
                ref={holoCanvasRef}
                className="w-[200px] h-[190px] block select-none pointer-events-none"
              />

              <p className="text-[11px] text-slate-400 text-center leading-snug">
                כל ביט שנדלק (<span className="font-mono text-amber-300">1</span>) מתרומם לקוביית אור תלת-ממדית במקרן!
              </p>
            </div>

            {/* Interactive Single-Byte Power Calculator (מפענח הבייט הנבחר) */}
            <div className="w-full bg-slate-950/90 border border-indigo-500/35 rounded-2xl p-3.5 space-y-2.5 shadow-inner">
              <div className="flex items-center justify-between text-xs">
                <span className="font-black text-amber-300 flex items-center gap-1.5">
                  <Binary className="w-3.5 h-3.5" />
                  <span>מפענח בייט {activeByte.rowIndex + 1}:</span>
                </span>
                <span className="font-mono font-black text-cyan-300" dir="ltr">
                  {activeByte.bitStr} = {activeByte.val}
                </span>
              </div>

              <div className="grid grid-cols-8 gap-1" dir="ltr">
                {activeByte.bits.map((bitVal, cIdx) => {
                  const weight = COL_WEIGHTS[cIdx];
                  const isBitLit = bitVal === 1;
                  const globalCellIdx = activeByte.rowIndex * 8 + cIdx;
                  return (
                    <button
                      key={cIdx}
                      type="button"
                      onClick={() => handleBulbTouch(globalCellIdx)}
                      className={`py-1.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                        isBitLit
                          ? 'bg-amber-400 text-slate-950 border-white font-black shadow-xs'
                          : 'bg-slate-900 text-slate-500 border-slate-800 hover:border-slate-600'
                      }`}
                      title={`עמודה בעלת שווי ${weight}`}
                    >
                      <span className="text-[9px] font-mono opacity-80">{weight}</span>
                      <span className="text-xs font-mono font-black">{bitVal}</span>
                    </button>
                  );
                })}
              </div>

              <div className="text-[11px] font-mono text-indigo-200 text-center bg-slate-900/90 py-1 px-2 rounded-lg border border-white/5" dir="ltr">
                {activeByte.litInRow > 0
                  ? `${activeByte.bits
                      .map((b, i) => (b === 1 ? COL_WEIGHTS[i] : null))
                      .filter(Boolean)
                      .join(' + ')} = ${activeByte.val}`
                  : '0 + 0 + 0 + 0 + 0 + 0 + 0 + 0 = 0'}
              </div>
            </div>

          </div>

        </div>

        {/* Live 64-Bit Memory Tape (סרט הזיכרון החי של זֶן) */}
        <div className="w-full p-3 bg-slate-950/85 rounded-2xl border border-indigo-500/30 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-1.5 font-bold text-indigo-300">
              <Binary className="w-4 h-4 text-amber-400" />
              <span>סרט הזיכרון החי של זֶן (64 ביטים = 8 בייטים ברצף):</span>
            </div>
            <span className="text-[11px] font-mono text-amber-300 font-bold">
              {litCount} ביטים דולקים (1) • {64 - litCount} כבויים (0)
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 p-1.5 bg-black/40 rounded-xl border border-white/5">
            {rowBytes.map((rb, rIdx) => (
              <div 
                key={rIdx}
                onClick={() => setSelectedByteRow(rIdx)}
                className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-lg border transition-colors cursor-pointer ${
                  activeByteIdx === rIdx
                    ? 'bg-indigo-900/80 border-amber-400/80'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
                title={`בייט ${rIdx + 1} (${rb.bitStr} = ${rb.val})`}
              >
                <span className="text-[9px] font-mono font-bold text-slate-400 ml-1">B{rIdx + 1}</span>
                {rb.bits.map((bitVal, bIdx) => {
                  const globalIdx = rIdx * 8 + bIdx;
                  const isLit = bitVal === 1;
                  const isHovered = hoveredBitIndex === globalIdx;

                  return (
                    <button
                      key={bIdx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBulbTouch(globalIdx);
                      }}
                      onMouseEnter={() => setHoveredBitIndex(globalIdx)}
                      onMouseLeave={() => setHoveredBitIndex(null)}
                      className={`w-3.5 h-5 sm:w-4 sm:h-5 text-[10px] font-mono font-bold rounded flex items-center justify-center transition-colors cursor-pointer ${
                        isLit 
                          ? 'bg-amber-400 text-slate-950 font-black shadow-xs' 
                          : isHovered
                          ? 'bg-indigo-500 text-white'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {isLit ? '1' : '0'}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Friendly Tactile Action Toolbar (Bespoke Vector Icons - Zero OS Emojis) */}
        <div className="w-full flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                onApplyPreset('heart');
                AudioEngine.playCollect();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/40 active:scale-95 transition-all text-xs font-black cursor-pointer shadow-md"
            >
              <BespokeHeartGlyph size={16} />
              <span>תבנית לב</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onApplyPreset('smiley');
                AudioEngine.playCollect();
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 active:scale-95 transition-all text-xs font-black cursor-pointer shadow-md"
            >
              <BespokeSmileyGlyph size={16} />
              <span>תבנית חייכן</span>
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => {
                setShowStencil(!showStencil);
                AudioEngine.playStep();
              }}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-md ${
                showStencil 
                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-indigo-500/30' 
                  : 'bg-white/10 hover:bg-white/15 text-white/85 border-white/20'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>
                {showStencil
                  ? `הסתר שבלונה (${stencilType === 'heart' ? 'לב' : 'חייכן'})`
                  : `שבלונת רמז (${stencilType === 'heart' ? 'לב' : 'חייכן'})`}
              </span>
            </button>

            {showStencil && (
              <button
                type="button"
                onClick={() => {
                  setManualStencilType(stencilType === 'heart' ? 'smiley' : 'heart');
                  AudioEngine.playStep();
                }}
                className="px-3 py-2 rounded-xl bg-indigo-950 hover:bg-indigo-900 text-amber-300 border border-indigo-400/50 text-xs font-bold transition-all cursor-pointer"
              >
                <span>החלף שבלונה ל{stencilType === 'heart' ? 'חייכן' : 'לב'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-xs text-white/80 hover:text-white border border-white/20 transition-all cursor-pointer shadow-md"
              title="כיבוי כל הנורות"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>איפוס לוח</span>
            </button>
          </div>

        </div>

      </div>
    </LudicLabShell>
  );
}
