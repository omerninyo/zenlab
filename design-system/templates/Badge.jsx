import React from 'react';

/**
 * Zen Design System - Badge
 * Restrained 4px rectangular badge with generous horizontal padding.
 * Designed to NEVER pinch Hebrew glyphs (ך, ף, ץ, ן, ם) or truncate text.
 * 
 * Props:
 * - variant: 'neutral' | 'accent' | 'emerald'
 * - icon: LucideIcon component (optional)
 * - children: React.ReactNode
 * - className?: string
 */
export default function Badge({
  variant = 'neutral',
  icon: Icon,
  children,
  className = '',
}) {
  let variantClass = 'badge-glass';
  if (variant === 'accent') variantClass = 'badge-glass badge-glass-accent';
  if (variant === 'emerald') variantClass = 'badge-glass badge-glass-emerald';

  return (
    <span className={`${variantClass} ${className}`}>
      {Icon && <Icon className="w-3 h-3 shrink-0" />}
      <span className="whitespace-nowrap">{children}</span>
    </span>
  );
}
