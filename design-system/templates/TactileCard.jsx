import React from 'react';

/**
 * Zen Design System - TactileCard
 * 100% Opaque tactile content card with 8px radius, micro-shadow and slate border.
 * NEVER uses nested backdrop-filter to prevent muddy blurring and scroll lag.
 * 
 * Props:
 * - variant: 'default' | 'highlight' | 'hero'
 * - children: React.ReactNode
 * - className?: string
 * - onClick?: () => void
 */
export default function TactileCard({
  variant = 'default',
  children,
  className = '',
  onClick,
  ...props
}) {
  let cardClass = 'card-tactile';
  if (variant === 'highlight') cardClass = 'card-tactile card-tactile-highlight';
  if (variant === 'hero') cardClass = 'card-command-hero p-5 sm:p-6';

  return (
    <div
      className={`${cardClass} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}
