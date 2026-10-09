import React from 'react';
import { Sun, Moon } from 'lucide-react';

/**
 * Zen Design System - ThemeToggle
 * One-tap theme toggle with Sun/Moon icons.
 * 
 * Props:
 * - isDark: boolean
 * - onToggle: () => void
 * - className?: string
 */
export default function ThemeToggle({ isDark, onToggle, className = '' }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? 'מעבר למצב מואר (Light Mode)' : 'מעבר למצב כהה (Dark Mode)'}
      title={isDark ? 'מעבר למצב מואר' : 'מעבר למצב כהה'}
      className={`p-2 rounded-[var(--radius-btn,6px)] border transition-colors cursor-pointer ${
        isDark
          ? 'bg-[var(--slate-3)] hover:bg-[var(--slate-4)] border-[var(--slate-6)] text-amber-400'
          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-700 shadow-xs'
      } ${className}`}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400" />
      ) : (
        <Moon className="w-4 h-4 text-slate-700 dark:text-slate-300" />
      )}
    </button>
  );
}
