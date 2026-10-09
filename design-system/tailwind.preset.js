/**
 * ZEN 2.0 TAILWIND PRESET
 * Drop-in Tailwind configuration preset for the Zen Design System.
 * Usage:
 *   // tailwind.config.js
 *   module.exports = {
 *     presets: [require('./design-system/tailwind.preset.js')],
 *     content: ['./src/**\/*.{js,jsx,ts,tsx,html}'],
 *     ...
 *   }
 */

module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        slate: {
          1: 'var(--slate-1)',
          2: 'var(--slate-2)',
          3: 'var(--slate-3)',
          4: 'var(--slate-4)',
          5: 'var(--slate-5)',
          6: 'var(--slate-6)',
          7: 'var(--slate-7)',
          8: 'var(--slate-8)',
          9: 'var(--slate-9)',
          10: 'var(--slate-10)',
          11: 'var(--slate-11)',
          12: 'var(--slate-12)',
        },
        accent: {
          base: 'var(--accent-base)',
          hover: 'var(--accent-hover)',
          rim: 'var(--accent-rim)',
          wash: 'var(--accent-wash)',
        }
      },
      borderRadius: {
        'badge': 'var(--radius-badge, 4px)',
        'item': 'var(--radius-item, 4px)',
        'btn': 'var(--radius-btn, 6px)',
        'card': 'var(--radius-card, 8px)',
        'hero': 'var(--radius-hero, 12px)',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Heebo"',
          '"Rubik"',
          '"Assistant"',
          'system-ui',
          'sans-serif',
        ],
      },
      backdropBlur: {
        'xs': '2px',
        'glass': '28px',
      },
      boxShadow: {
        'glass': 'var(--glass-shadow)',
        'specular': 'var(--glass-specular-top)',
        'tactile': '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
      },
    },
  },
  plugins: [],
};
