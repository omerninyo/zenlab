import React from 'react';
import ThemeToggle from './ThemeToggle.jsx';

/**
 * Zen Design System - Header
 * Optical liquid glass sticky header with iOS safe area padding
 * and responsive safeguards preventing horizontal overflow on 375px viewports.
 * 
 * Props:
 * - logo: React.ReactNode (Brand icon + title)
 * - centerContent?: React.ReactNode (e.g. Stepper / SegmentedControl)
 * - actions?: React.ReactNode (Quick actions)
 * - isDark: boolean
 * - onToggleTheme: () => void
 * - className?: string
 */
export default function Header({
  logo,
  centerContent,
  actions,
  isDark,
  onToggleTheme,
  className = '',
}) {
  return (
    <header className={`header-glass ${className}`}>
      <div className="max-w-7xl mx-auto h-14 sm:h-16 flex items-center justify-between gap-2 sm:gap-4 px-2 sm:px-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 shrink-0">
          {logo}
        </div>

        {/* Center Section (Collapsible on mobile) */}
        {centerContent && (
          <div className="flex items-center justify-center shrink-1 min-w-0">
            {centerContent}
          </div>
        )}

        {/* Actions & Theme Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {actions}
          <ThemeToggle isDark={isDark} onToggle={onToggleTheme} />
        </div>
      </div>
    </header>
  );
}
