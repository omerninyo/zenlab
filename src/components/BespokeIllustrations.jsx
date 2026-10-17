import React, { useState, useEffect } from 'react';
import { AudioEngine } from '../core/audio.js';

/**
 * BespokeIllustrations.jsx
 * Cohesive Apple Arcade / Brilliant.org / Monument Valley vector art system.
 * Eliminates generic OS keyboard emojis in favor of unified geometric vector illustrations.
 */

export const ZEN_WORKSHOP_GADGETS = [
  {
    id: 'default',
    name: 'ליבת טיטניום קלאסית',
    minStars: 0,
    desc: 'מראה החוקר המקורי של זֶן',
    accent: '#fbbf24'
  },
  {
    id: 'visor_cyber',
    name: 'משקפי רנטגן בינאריים',
    minStars: 2,
    desc: 'מציגים תצוגת סייבר טורקיז על המסך של זֶן',
    accent: '#22d3ee'
  },
  {
    id: 'ears_plasma',
    name: 'כנפי סילון מגנטיות',
    minStars: 5,
    desc: 'מוסיפות לזֶן מנועי ריחוף אוויריים בצדדים',
    accent: '#818cf8'
  },
  {
    id: 'crown_radar',
    name: 'כתר נווט כוכבים',
    minStars: 9,
    desc: 'כתר קפטן מוזהב שקולט אותות מכל הגלקסיה',
    accent: '#f59e0b'
  },
  {
    id: 'halo_neural',
    name: 'הילת מוח מלאכותי',
    minStars: 15,
    desc: 'טבעת אנרגיה נוירונית מרחפת של מאסטרים',
    accent: '#34d399'
  }
];

const GADGET_STORAGE_KEY = 'zenlab_equipped_gadget_v1';

export function getEquippedZenGadget(totalStars = 0) {
  if (typeof window === 'undefined') return 'default';
  try {
    const saved = window.localStorage.getItem(GADGET_STORAGE_KEY);
    if (saved) {
      const found = ZEN_WORKSHOP_GADGETS.find(g => g.id === saved);
      if (found && totalStars >= found.minStars) return saved;
    }
    // Auto-select highest unlocked if none explicitly saved
    const unlocked = ZEN_WORKSHOP_GADGETS.filter(g => totalStars >= g.minStars);
    return unlocked[unlocked.length - 1]?.id || 'default';
  } catch {
    return 'default';
  }
}

export function setEquippedZenGadget(gadgetId) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(GADGET_STORAGE_KEY, gadgetId);
    window.dispatchEvent(new CustomEvent('zen-gadget-change', { detail: { gadgetId } }));
  } catch {}
}

export function BespokeSpacecraft({ angle = -45, isMoving = false, size = 28, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={`select-none overflow-visible ${className}`}
      style={{
        transform: `rotate(${angle}deg)`,
        transition: 'transform 180ms cubic-bezier(0.22, 1, 0.36, 1)'
      }}
      aria-label="חללית מחקר"
    >
      <defs>
        <linearGradient id="shipBodyGrad" x1="6" y1="6" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="55%" stopColor="#bae6fd" />
          <stop offset="100%" stopColor="#38bdf8" />
        </linearGradient>
        <linearGradient id="shipWingGrad" x1="8" y1="20" x2="32" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="shipFlameGrad" x1="20" y1="30" x2="20" y2="42" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Engine Plume */}
      <path
        d={isMoving ? 'M16 31 L20 43 L24 31 Z' : 'M17 31 L20 37 L23 31 Z'}
        fill="url(#shipFlameGrad)"
      />

      {/* Delta Wings */}
      <path
        d="M20 9 L34 29 L26 28 L20 31 L14 28 L6 29 L20 9Z"
        fill="url(#shipWingGrad)"
        stroke="#e0f2fe"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />

      {/* Fuselage */}
      <path
        d="M20 4 C24 11 26 20 25 30 L20 33 L15 30 C14 20 16 11 20 4Z"
        fill="url(#shipBodyGrad)"
        stroke="#0f172a"
        strokeWidth="1.2"
      />

      {/* Glowing Visor Cockpit */}
      <ellipse
        cx="20"
        cy="17"
        rx="3.2"
        ry="5.2"
        fill="#0f172a"
        stroke="#38bdf8"
        strokeWidth="1.2"
      />
      <ellipse cx="19" cy="15.5" rx="1.2" ry="2.2" fill="#7dd3fc" />
    </svg>
  );
}

export function BespokeRingedPlanet({ size = 30, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={`select-none overflow-visible ${className}`}
      aria-label="כוכב היעד"
    >
      <defs>
        <radialGradient id="planetCoreGrad" cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="45%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#b45309" />
        </radialGradient>
        <linearGradient id="planetRingGrad" x1="2" y1="24" x2="38" y2="16" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#fde68a" stopOpacity="0.95" />
          <stop offset="50%" stopColor="#38bdf8" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Back Ring Arc */}
      <ellipse
        cx="20"
        cy="20"
        rx="17"
        ry="5.5"
        transform="rotate(-22 20 20)"
        stroke="url(#planetRingGrad)"
        strokeWidth="2.6"
        strokeOpacity="0.55"
      />

      {/* Planet Sphere */}
      <circle
        cx="20"
        cy="20"
        r="10.5"
        fill="url(#planetCoreGrad)"
        stroke="#fef3c7"
        strokeWidth="1.2"
      />

      {/* Atmospheric Band */}
      <path
        d="M10.5 18.5 Q20 21.5 29.5 17.5"
        stroke="#fef3c7"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeOpacity="0.65"
      />
      <circle cx="16.5" cy="15.5" r="2" fill="#ffffff" fillOpacity="0.6" />

      {/* Front Ring Arc */}
      <path
        d="M4.2 26.4 A17 5.5 -22 0 0 35.8 13.6"
        stroke="url(#planetRingGrad)"
        strokeWidth="2.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function BespokeAsteroid({ seed = 0, size = 22, className = '' }) {
  const rot = (seed * 47) % 360;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      className={`select-none ${className}`}
      style={{ transform: `rotate(${rot}deg)` }}
      aria-label="אסטרואיד חוסם"
    >
      <defs>
        <linearGradient id={`astGrad_${seed % 4}`} x1="4" y1="4" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#94a3b8" />
          <stop offset="55%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
      </defs>
      <polygon
        points="18,4 29,9 33,20 26,31 12,32 5,23 7,10"
        fill={`url(#astGrad_${seed % 4})`}
        stroke="#cbd5e1"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      {/* Facet Highlight */}
      <polygon
        points="18,4 29,9 21,16 10,12"
        fill="#e2e8f0"
        fillOpacity="0.22"
      />
      {/* Craters */}
      <circle cx="14" cy="18" r="2.8" fill="#0f172a" fillOpacity="0.45" stroke="#94a3b8" strokeWidth="0.7" />
      <circle cx="23" cy="22" r="2" fill="#0f172a" fillOpacity="0.4" />
      <circle cx="21" cy="12" r="1.5" fill="#0f172a" fillOpacity="0.35" />
    </svg>
  );
}

export function BespokeHeartGlyph({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 20.5L4.8 13.5C2.8 11.5 2.8 8.2 4.8 6.2C6.8 4.2 10 4.2 12 6.4C14 4.2 17.2 4.2 19.2 6.2C21.2 8.2 21.2 11.5 19.2 13.5L12 20.5Z"
        fill="#fb7185"
        stroke="#ffe4e6"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="9" r="1.3" fill="#fff1f2" />
    </svg>
  );
}

export function BespokeSmileyGlyph({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <circle cx="12" cy="12" r="9.5" fill="#fbbf24" stroke="#fef3c7" strokeWidth="1.6" />
      <circle cx="9" cy="10" r="1.4" fill="#0f172a" />
      <circle cx="15" cy="10" r="1.4" fill="#0f172a" />
      <path d="M8.2 14.2C9.2 16.3 14.8 16.3 15.8 14.2" stroke="#0f172a" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function BespokeStarBadge({ filled = false, size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        d="M12 2.5L14.9 8.4L21.4 9.3L16.7 13.9L17.8 20.4L12 17.3L6.2 20.4L7.3 13.9L2.6 9.3L9.1 8.4L12 2.5Z"
        fill={filled ? '#fbbf24' : 'rgba(148,163,184,0.2)'}
        stroke={filled ? '#fef08a' : '#64748b'}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BespokeRealWorldBadge({ index = 0, size = 34 }) {
  const palettes = [
    { bg: '#eff6ff', darkBg: '#1e293b', stroke: '#3b82f6', core: '#60a5fa' },
    { bg: '#fef3c7', darkBg: '#1e293b', stroke: '#f59e0b', core: '#fbbf24' },
    { bg: '#ecfdf5', darkBg: '#1e293b', stroke: '#10b981', core: '#34d399' }
  ];
  const pal = palettes[index % palettes.length];

  return (
    <svg width={size} height={size} viewBox="0 0 36 36" fill="none" className="shrink-0 select-none">
      <rect x="2" y="2" width="32" height="32" rx="10" fill={pal.darkBg} stroke={pal.stroke} strokeWidth="1.5" />
      {index % 3 === 0 && (
        <>
          <rect x="9" y="10" width="18" height="12" rx="2.5" stroke={pal.core} strokeWidth="1.8" />
          <path d="M14 26H22" stroke={pal.core} strokeWidth="1.8" strokeLinecap="round" />
          <circle cx="15" cy="16" r="1.5" fill="#fbbf24" />
          <circle cx="21" cy="16" r="1.5" fill={pal.core} />
        </>
      )}
      {index % 3 === 1 && (
        <>
          <circle cx="18" cy="18" r="8" stroke={pal.core} strokeWidth="1.8" />
          <polygon points="18,12 22,20 18,18 14,20" fill={pal.core} />
        </>
      )}
      {index % 3 === 2 && (
        <>
          <path d="M11 22L16 15L20 19L25 13" stroke={pal.core} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="11" cy="22" r="2" fill={pal.core} />
          <circle cx="25" cy="13" r="2" fill="#fbbf24" />
        </>
      )}
    </svg>
  );
}

/**
 * ZenWorkshopBar - Interactive metagame upgrade bar allowing children to equip
 * unlocked visual gadgets onto Zen's robot head using their earned stars!
 */
export function ZenWorkshopBar({ totalStars = 0 }) {
  const [equipped, setEquipped] = useState(() => getEquippedZenGadget(totalStars));
  const [previewMsg, setPreviewMsg] = useState(null);

  useEffect(() => {
    setEquipped(getEquippedZenGadget(totalStars));
    const onGadgetChange = (e) => {
      if (e.detail?.gadgetId) setEquipped(e.detail.gadgetId);
    };
    window.addEventListener('zen-gadget-change', onGadgetChange);
    return () => window.removeEventListener('zen-gadget-change', onGadgetChange);
  }, [totalStars]);

  const handleSelectGadget = (gadget) => {
    const isUnlocked = totalStars >= gadget.minStars;
    if (isUnlocked) {
      AudioEngine.playCollect();
      setEquippedZenGadget(gadget.id);
      setEquipped(gadget.id);
      setPreviewMsg(`הציוד "${gadget.name}" הותקן על זֶן בכל המעבדות!`);
    } else {
      // Allow 4-second live preview on Zen so the child gets excited to earn stars!
      AudioEngine.playStep();
      window.dispatchEvent(new CustomEvent('zen-gadget-change', { detail: { gadgetId: gadget.id } }));
      setEquipped(gadget.id);
      setPreviewMsg(`תצוגה מקדימה של "${gadget.name}" (נפתח לצמיתות ב-${gadget.minStars} כוכבים — חסרים לכם עוד ${gadget.minStars - totalStars} כוכבים!)`);
      setTimeout(() => {
        const real = getEquippedZenGadget(totalStars);
        window.dispatchEvent(new CustomEvent('zen-gadget-change', { detail: { gadgetId: real } }));
        setEquipped(real);
      }, 4000);
    }
  };

  return (
    <div className="bg-slate-950/85 border border-white/15 rounded-2xl p-3.5 sm:p-4 shadow-inner space-y-2.5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
          <span className="text-xs sm:text-sm font-black text-white">
            סדנת השדרוגים של זֶן • צברו כוכבים במעבדות כדי לשדרג את הרובוט!
          </span>
        </div>
        <span className="text-[11px] font-mono font-bold text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-lg border border-amber-400/30">
          {ZEN_WORKSHOP_GADGETS.filter(g => totalStars >= g.minStars).length} / {ZEN_WORKSHOP_GADGETS.length} שדרוגים פתוחים
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {ZEN_WORKSHOP_GADGETS.map((g) => {
          const isUnlocked = totalStars >= g.minStars;
          const isActive = equipped === g.id;

          return (
            <button
              key={g.id}
              type="button"
              onClick={() => handleSelectGadget(g)}
              className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                isActive
                  ? 'bg-gradient-to-b from-amber-400/25 to-indigo-900/60 border-amber-400 shadow-[0_0_15px_rgba(251,191,36,0.25)]'
                  : isUnlocked
                  ? 'bg-slate-900/90 hover:bg-slate-800 border-white/15'
                  : 'bg-slate-900/45 hover:bg-slate-900/75 border-white/10 opacity-80'
              }`}
              title={g.desc}
            >
              <div className="flex items-center justify-between gap-1 w-full">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: g.accent, boxShadow: isActive ? `0 0 8px ${g.accent}` : 'none' }}
                />
                <span className={`text-[10px] font-mono font-black px-1.5 py-0.2 rounded ${
                  isUnlocked
                    ? isActive
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-emerald-500/20 text-emerald-300'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {isUnlocked ? (isActive ? 'מצויד ✓' : 'פתוח') : `${g.minStars} ★`}
                </span>
              </div>
              <div className="text-xs font-black text-white leading-tight">
                {g.name}
              </div>
              <div className="text-[10px] text-slate-400 leading-tight line-clamp-1">
                {isUnlocked ? g.desc : `לחצו להצצה (${g.minStars} כוכבים)`}
              </div>
            </button>
          );
        })}
      </div>

      {previewMsg && (
        <div className="text-[11px] font-bold text-amber-300 bg-indigo-950/80 border border-amber-400/30 px-3 py-1.5 rounded-xl flex items-center justify-between">
          <span>{previewMsg}</span>
          <button
            type="button"
            onClick={() => setPreviewMsg(null)}
            className="text-slate-400 hover:text-white text-[10px] font-black cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
